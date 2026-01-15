import React, { useState, useEffect, useRef } from 'react';
import { CHARACTERS, ORGANIZATION_INFO, WATCH_DATA_POOLS, ARCHIVES } from './constants';
import { Character, AppView, ChatMessage, ArchiveContent } from './types';
import SAIFChart from './components/SAIFChart';
import { createChatSession, sendMessageStream } from './services/geminiService';
import { Chat } from '@google/genai';

// --- Icons ---
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const WatchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/></svg>
);
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>
);
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
);
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);
const DigitalArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2H22V22H2V2Z" stroke="#A855F7" strokeWidth="1" strokeOpacity="0.3"/>
    <path d="M10 16L14 12L10 8" stroke="#A855F7" strokeWidth="2" strokeLinecap="square"/>
    <path d="M17 2V6" stroke="#A855F7" strokeWidth="1"/>
    <path d="M17 22V18" stroke="#A855F7" strokeWidth="1"/>
  </svg>
);

// --- Matrix Rain Effect Component ---
const MatrixRain = ({ opacity = 0.4 }: { opacity?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const columns = Math.floor(width / 20);
    const drops: number[] = new Array(columns).fill(1);
    
    // Hex characters + Numbers
    const chars = "0123456789ABCDEF"; 

    const draw = () => {
      // Black with opacity to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#6b21a8'; // Purple 700/800 range
      ctx.font = '14px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        // Randomly make some characters brighter/white for "glitch" feel
        if (Math.random() > 0.95) {
             ctx.fillStyle = '#d8b4fe'; // Light purple
        } else {
             ctx.fillStyle = '#7e22ce'; // Base purple
        }
        
        ctx.fillText(text, i * 20, drops[i] * 20);

        // Reset drop to top randomly
        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" style={{ opacity }} />;
};


// --- Standalone Music Player Component ---
const CharacterMusicPlayer = ({ audioSrc, title, characterName }: { audioSrc?: string, title?: string, characterName: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsError(false);
    setIsPlaying(false);
    setIsLoading(false);
  }, [audioSrc]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        setIsError(false);
        setIsLoading(true);
        if (audio.readyState === 0) {
            audio.load();
        }
        await audio.play();
        setIsLoading(false);
      }
    } catch (error: any) {
      setIsLoading(false);
      if (error.name === 'AbortError') return;
      console.error("Playback failed message:", error.message);
      setIsError(true);
      setIsPlaying(false);
    }
  };

  const handleAudioError = () => {
      if (audioRef.current && audioRef.current.error) {
        console.error("Audio Error:", audioRef.current.error.code, audioRef.current.error.message);
      }
      if (audioSrc) {
        setIsError(true);
        setIsPlaying(false);
        setIsLoading(false);
      }
  };

  return (
    <div className="w-full mb-4">
      <div className="w-full bg-slate-900 border border-slate-800 p-4 flex items-center justify-between shadow-lg relative overflow-hidden group">
         <div className={`absolute inset-0 bg-purple-900/10 transition-opacity duration-1000 ${isPlaying ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
         
         {audioSrc && (
           <audio 
             ref={audioRef} 
             src={audioSrc} 
             onEnded={() => setIsPlaying(false)}
             onPause={() => setIsPlaying(false)}
             onPlay={() => setIsPlaying(true)}
             onWaiting={() => setIsLoading(true)}
             onPlaying={() => setIsLoading(false)}
             onError={handleAudioError}
             loop
             playsInline
             webkit-playsinline="true"
             preload="none" 
           />
         )}
         
         <div className="flex items-center gap-4 z-10 w-full">
            <button 
              onClick={togglePlay}
              disabled={!audioSrc || isLoading}
              className={`w-10 h-10 flex-shrink-0 flex items-center justify-center border rounded-full transition-all ${
                  audioSrc 
                  ? (isError 
                      ? 'bg-red-900/20 text-red-500 border-red-900/50 hover:bg-red-900/40 hover:text-red-400'
                      : 'bg-purple-900/50 text-white border-purple-500 hover:bg-purple-600 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]')
                  : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                audioSrc ? (isError ? <AlertIcon /> : (isPlaying ? <PauseIcon /> : <PlayIcon />)) : <AlertIcon />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-bold tracking-widest uppercase mb-0.5 ${isError ? 'text-red-500' : 'text-purple-400'}`}>
                  {audioSrc ? (isError ? 'Playback Failed' : (isLoading ? 'Buffering...' : (isPlaying ? 'Now Playing' : 'Original Soundtrack'))) : 'No Audio Source'}
              </p>
              <div className="overflow-hidden">
                 <p className={`text-sm text-white font-display truncate ${isPlaying ? 'animate-pulse' : ''}`}>
                   {title ? `${title} - 패도 OST (${characterName})` : 'Unknown Track'}
                 </p>
              </div>
            </div>

            {!isError && audioSrc && !isLoading && (
               <div className="flex items-end gap-1 h-6">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-t-sm transition-all duration-75 ${isPlaying ? 'bg-purple-500' : 'bg-slate-700'}`}
                      style={{ 
                         height: isPlaying ? `${Math.random() * 100}%` : '4px',
                         animation: isPlaying ? `bounce ${0.3 + i * 0.1}s infinite alternate` : 'none',
                      }}
                    />
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

interface WatchData {
  hr: number;
  rr: number;
  temp: string;
  location: string;
  calls: any[];
  messages: any[];
  searches: any[];
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<ArchiveContent | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [watchData, setWatchData] = useState<WatchData | null>(null);

  // Login State
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Ambu Alert State
  const [ambuAlert, setAmbuAlert] = useState(false);
  
  // Keypad active state
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
     window.scrollTo(0, 0);
  }, [currentView, selectedChar]);

  const handleKeypadPress = (num: string) => {
    setActiveKey(num);
    setTimeout(() => setActiveKey(null), 200);

    if (passcode.length < 4) {
      const newPass = passcode + num;
      setPasscode(newPass);
      
      if (newPass.length === 4) {
        setTimeout(() => {
          if (newPass === '0829') {
             setCurrentView(AppView.DASHBOARD);
             setPasscode('');
             setLoginError(false);
          } else {
             setLoginError(true);
             setTimeout(() => {
               setPasscode('');
               setLoginError(false);
             }, 1000);
          }
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    setPasscode(prev => prev.slice(0, -1));
    setLoginError(false);
  };

  const handleSelectCharacter = (char: Character) => {
    setSelectedChar(char);
    setCurrentView(AppView.CHARACTER_DETAIL);
    setWatchData(null); 
  };

  const handleArchiveSelect = (archiveId: string) => {
     const archive = ARCHIVES.find(a => a.id === archiveId);
     if (archive) {
       setSelectedArchive(archive);
       setCurrentView(AppView.ARCHIVE);
     }
  };
  
  const handleAmbuClick = () => {
    setAmbuAlert(true);
    // Vibrate device if supported for mobile feel
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
    
    setTimeout(() => {
        setAmbuAlert(false);
    }, 2500);
  };

  const generateWatchData = (charId: string) => {
    const pool = WATCH_DATA_POOLS[charId as keyof typeof WATCH_DATA_POOLS] || WATCH_DATA_POOLS['pil-do-seop'];
    const hr = Math.floor(Math.random() * (110 - 65 + 1)) + 65;
    const rr = Math.floor(Math.random() * (22 - 14 + 1)) + 14;
    const temp = (Math.random() * (37.2 - 36.1) + 36.1).toFixed(1);
    
    const location = pool.locations[Math.floor(Math.random() * pool.locations.length)];
    const shuffledCalls = [...pool.calls].sort(() => 0.5 - Math.random()).slice(0, 2);
    const shuffledMessages = [...pool.messages].sort(() => 0.5 - Math.random()).slice(0, 2);
    const shuffledSearches = [...pool.searches].sort(() => 0.5 - Math.random()).slice(0, 4);

    return { hr, rr, temp, location, calls: shuffledCalls, messages: shuffledMessages, searches: shuffledSearches };
  };

  const startChat = () => {
    if (!selectedChar) return;
    try {
      const session = createChatSession(selectedChar.id);
      setChatSession(session);
      setWatchData(generateWatchData(selectedChar.id)); 
      setMessages([{
        id: 'init',
        role: 'model',
        text: `(눈을 마주치며) ...무슨 용건이지?`,
        timestamp: new Date()
      }]);
      setCurrentView(AppView.CHAT);
    } catch (e) {
      alert("API Key configuration required.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chatSession) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      let fullResponse = "";
      const tempId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: tempId,
        role: 'model',
        text: "",
        timestamp: new Date()
      }]);

      const stream = sendMessageStream(chatSession, userMsg.text);
      
      for await (const chunk of stream) {
        if (chunk) {
          fullResponse += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === tempId ? { ...msg, text: fullResponse } : msg
          ));
        }
      }
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsTyping(false);
    }
  };

  const renderLockScreen = () => {
    const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    const weekday = currentTime.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dateString = `${year} . ${month} . ${day} ${weekday}`;

    return (
      <div className={`min-h-screen bg-black text-white flex flex-col relative font-sans overflow-hidden transition-transform duration-100 ${loginError ? 'animate-shake-screen' : ''}`}>
        {/* Background - Matrix Rain & Noise */}
        <MatrixRain />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-purple-900/10 to-black z-0"></div>

        {/* Status Bar */}
        <div className="relative z-10 w-full flex flex-col items-center mt-12">
           <div className="text-sm md:text-xl font-light tracking-widest text-slate-300 mb-1 font-mono">{dateString}</div>
           <div className="text-7xl font-thin tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{timeString}</div>
        </div>

        {/* Marquee Banner */}
        <div className="relative w-full bg-purple-900/20 border-y border-purple-500/30 overflow-hidden py-3 mt-4 z-10 backdrop-blur-sm">
           <div className="whitespace-nowrap animate-marquee flex items-center">
             {[...Array(6)].map((_, i) => (
                <span key={i} className="text-purple-400 font-mono text-xs tracking-[0.2em] mx-4 flex items-center gap-4">
                  <span>RESTRICTED AREA • CLASS C ONLY</span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                </span>
             ))}
           </div>
        </div>

        {/* Lock Info */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
           {/* Hint Text */}
           <div className="mt-10 mb-8 text-center px-4">
              <p className="text-sm font-serif text-slate-400 animate-pulse tracking-wide bg-black/50 px-4 py-1 rounded-full border border-white/10">
                ※ 비밀번호는 그에게 물어보면 됩니다.
              </p>
           </div>

           {/* Passcode Dots */}
           <div className="flex gap-6 mb-12 h-4 items-center">
             {[0, 1, 2, 3].map((i) => (
               <div 
                 key={i} 
                 className={`w-3 h-3 rounded-full border border-white/30 transition-all duration-200 ${
                   passcode.length > i ? 'bg-white shadow-[0_0_10px_white]' : 'bg-transparent'
                 }`}
               />
             ))}
           </div>

           {/* Keypad */}
           <div className="grid grid-cols-3 gap-x-6 gap-y-6 max-w-[280px] mx-auto mb-8">
             {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
               <button
                 key={num}
                 onClick={() => handleKeypadPress(num.toString())}
                 className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center text-2xl md:text-3xl font-light transition-all duration-100 group relative overflow-hidden
                    ${num === 0 ? 'col-start-2' : ''}
                    ${activeKey === num.toString() ? 'bg-purple-600 border-purple-500 scale-95 shadow-[0_0_20px_rgba(147,51,234,0.6)]' : 'bg-white/5 hover:bg-white/10 active:bg-white/20'}
                 `}
               >
                 <span className={`transition-opacity duration-100 ${activeKey === num.toString() ? 'opacity-0' : 'opacity-100'}`}>{num}</span>
                 <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-100 ${activeKey === num.toString() ? 'opacity-100' : 'opacity-0'}`}>
                    <img src="https://i.postimg.cc/SQPSKVwP/daieol.png" alt="Keypad" className="w-full h-full object-cover rounded-full" />
                 </div>
               </button>
             ))}
             
             {/* Delete Button */}
             <button
                onClick={handleBackspace}
                className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-white/50 active:text-white active:scale-95 transition-all col-start-3 row-start-4"
             >
               <span className="text-xs uppercase font-bold tracking-widest">Delete</span>
             </button>
           </div>
        </div>

        {/* Error Modal Overlay */}
        {loginError && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
             <div className="bg-red-900/90 border border-red-500 p-6 text-center shadow-[0_0_50px_rgba(220,38,38,0.5)] backdrop-blur-sm animate-pulse">
                <AlertIcon />
                <h2 className="text-2xl font-bold text-white tracking-widest mt-2 mb-1">ACCESS DENIED</h2>
                <p className="text-red-300 font-mono text-xs">접근 승인 거부</p>
             </div>
          </div>
        )}

        <div className="p-8 text-center relative z-10">
           <p className="text-[10px] text-slate-600 font-mono tracking-widest">PWICE GLOBAL SECURITY SYSTEM V3.1</p>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="min-h-screen bg-black text-slate-300 flex flex-col items-center relative font-sans animate-fade-in">
       {/* Background */}
       <MatrixRain opacity={0.1} />
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
       
       {/* Sticky Warning Banner */}
       <div className="sticky top-0 z-50 w-full pointer-events-none">
         <div className="w-full bg-purple-900/30 border-b border-purple-500/50 backdrop-blur-xl text-center py-3 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <div className="animate-pulse flex flex-col items-center justify-center gap-1">
               <span className="text-[10px] md:text-xs font-mono text-purple-200 uppercase tracking-widest font-bold">
                 RESTRICTED ACCESS: CLASS C PERSONNEL ONLY
               </span>
               <span className="text-[10px] md:text-xs font-sans font-bold text-purple-300 tracking-wider">
                 본 데이터는 C급 보안 인가 인원 접근용 입니다.
               </span>
            </div>
         </div>
       </div>

       {/* Header */}
       <header className="w-full p-6 flex justify-center items-center mt-4 border-b border-white/5 pb-6 max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col items-center">
             <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter text-center">
               <span className="text-purple-600">PWICE</span> GLOBAL
             </h1>
             <span className="text-[10px] text-slate-500 tracking-[0.3em] mt-2 font-mono uppercase">Internal Network</span>
          </div>
       </header>

       <main className="w-full max-w-5xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pb-20 relative z-10">
          
          {/* Card Style Definition */}
          {/* 1.5x bigger images (h-24 md:h-32) + Tech Corners + Overlay */}
          
          {/* Card 1: Personnel */}
          <div 
             onClick={() => setCurrentView(AppView.CHARACTER_LIST)}
             className="relative p-8 cursor-pointer group flex flex-col justify-between h-56 md:h-64 overflow-hidden transition-all duration-300 bg-[length:100%_100%] bg-center border border-slate-800 hover:border-purple-500/50"
             style={{ backgroundImage: "url('https://i.postimg.cc/vBr67k5M/box.png')" }}
          >
             {/* Tech Corners */}
             <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-500/70" />
             <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-500/70" />
             <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-500/70" />
             <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-500/70" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

             <div className="relative z-10 flex items-center justify-center h-full transform group-hover:scale-105 transition-transform duration-500">
                <img src="https://i.postimg.cc/2SWv813m/1.png" alt="등장인물" className="h-24 md:h-32 object-contain filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
             </div>
             <div className="absolute bottom-4 right-4 opacity-100 group-hover:translate-x-1 transition-transform z-20">
                <DigitalArrowIcon />
             </div>
          </div>

          {/* Card 2: About */}
          <div 
             onClick={() => handleArchiveSelect('about')}
             className="relative p-8 cursor-pointer group flex flex-col justify-between h-56 md:h-64 overflow-hidden transition-all duration-300 bg-[length:100%_100%] bg-center border border-slate-800 hover:border-purple-500/50"
             style={{ backgroundImage: "url('https://i.postimg.cc/vBr67k5M/box.png')" }}
          >
             <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-500/70" />
             <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-500/70" />
             <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-500/70" />
             <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-500/70" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

             <div className="relative z-10 flex items-center justify-center h-full transform group-hover:scale-105 transition-transform duration-500">
                <img src="https://i.postimg.cc/nrM98zN2/2.png" alt="About 패도" className="h-24 md:h-32 object-contain filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
             </div>
             <div className="absolute bottom-4 right-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all z-20">
                <DigitalArrowIcon />
             </div>
          </div>

          {/* Card 3: Organization */}
          <div 
             onClick={() => handleArchiveSelect('org')}
             className="relative p-8 cursor-pointer group flex flex-col justify-between h-56 md:h-64 overflow-hidden transition-all duration-300 bg-[length:100%_100%] bg-center border border-slate-800 hover:border-purple-500/50"
             style={{ backgroundImage: "url('https://i.postimg.cc/vBr67k5M/box.png')" }}
          >
             <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-500/70" />
             <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-500/70" />
             <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-500/70" />
             <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-500/70" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

             <div className="relative z-10 flex items-center justify-center h-full transform group-hover:scale-105 transition-transform duration-500">
                 <img src="https://i.postimg.cc/8PJft7Rw/3.png" alt="조직도" className="h-24 md:h-32 object-contain filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
             </div>
             <div className="absolute bottom-4 right-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all z-20">
                <DigitalArrowIcon />
             </div>
          </div>

          {/* Card 4: SAIF System */}
          <div 
             onClick={() => handleArchiveSelect('saif')}
             className="relative p-8 cursor-pointer group flex flex-col justify-between h-56 md:h-64 overflow-hidden transition-all duration-300 bg-[length:100%_100%] bg-center border border-slate-800 hover:border-purple-500/50"
             style={{ backgroundImage: "url('https://i.postimg.cc/vBr67k5M/box.png')" }}
          >
             <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-500/70" />
             <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-500/70" />
             <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-500/70" />
             <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-500/70" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

             <div className="relative z-10 flex items-center justify-center h-full transform group-hover:scale-105 transition-transform duration-500">
                 <img src="https://i.postimg.cc/sxBx6Lhx/4.png" alt="SAIF System" className="h-24 md:h-32 object-contain filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
             </div>
             <div className="absolute bottom-4 right-4 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all z-20">
                <DigitalArrowIcon />
             </div>
          </div>
       </main>

       {/* Footer */}
       <footer className="w-full text-center py-6 text-[10px] text-slate-600 font-mono uppercase tracking-widest border-t border-white/5 mt-auto relative z-10 bg-black/50">
          © PWICE GLOBAL. Access restricted. SAIF System Active.
       </footer>
    </div>
  );

  const renderArchive = () => {
    if (!selectedArchive) return null;

    const renderOrgInfographic = () => (
        <div className={`flex flex-col items-center w-full max-w-4xl mx-auto py-10 space-y-12 transition-transform duration-100`}>
            {/* Title/Header for the graphic */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-display text-white mb-2">조직도</h2>
                <p className="text-purple-500 font-mono text-xs tracking-[0.3em]">PAEDO ORGANIZATIONAL STRUCTURE</p>
            </div>
    
            {/* Level 1: BOSS */}
            <div className="relative flex flex-col items-center">
                <div className="z-10 bg-black border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] p-6 rounded-sm w-64 text-center">
                    <span className="text-purple-400 text-[10px] font-mono tracking-widest block mb-1">ABSOLUTE POWER</span>
                    <h3 className="text-2xl text-white font-display font-bold">BOSS</h3>
                    <p className="text-slate-400 text-xs mt-1">조준재</p>
                </div>
                {/* Connecting Line */}
                <div className="h-12 w-px bg-gradient-to-b from-purple-500 to-slate-700"></div>
            </div>
    
            {/* Level 2: EXECUTIVE */}
            <div className="relative flex flex-col items-center">
                 <div className="z-10 bg-slate-900 border border-slate-600 p-5 rounded-sm w-56 text-center">
                    <span className="text-slate-500 text-[10px] font-mono tracking-widest block mb-1">NO.2 ADMINISTRATOR</span>
                    <h3 className="text-xl text-white font-display">EXECUTIVE</h3>
                    <p className="text-slate-400 text-xs mt-1">총괄 정사운</p>
                </div>
                {/* Connecting Line splitting to children */}
                <div className="h-12 w-px bg-slate-700"></div>
                {/* Horizontal bar for branches */}
                <div className="w-[80%] md:w-full h-px bg-slate-700 relative">
                    <div className="absolute left-0 top-0 w-px h-6 bg-slate-700"></div> {/* Leftmost drop */}
                    <div className="absolute right-0 top-0 w-px h-6 bg-slate-700"></div> {/* Rightmost drop */}
                    <div className="absolute left-1/4 top-0 w-px h-6 bg-slate-700"></div>
                    <div className="absolute right-1/4 top-0 w-px h-6 bg-slate-700"></div>
                </div>
            </div>
    
            {/* Level 3: HEADQUARTERS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                 {/* Finance */}
                 <div className="bg-slate-900/50 border border-slate-800 p-4 text-center hover:border-purple-500/50 transition-colors">
                    <h4 className="text-white font-bold text-xl">금융본부</h4>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">FINANCE</span>
                    <p className="text-slate-400 text-xs mt-2">자금세탁/로비</p>
                 </div>
                 {/* Trade */}
                 <div className="bg-slate-900/50 border border-slate-800 p-4 text-center hover:border-purple-500/50 transition-colors">
                    <h4 className="text-white font-bold text-xl">거래본부</h4>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">TRADE</span>
                    <p className="text-slate-400 text-xs mt-2">밀수/협상</p>
                 </div>
                 {/* Combat */}
                 <div className="bg-slate-900/50 border border-slate-800 p-4 text-center hover:border-purple-500/50 transition-colors">
                    <h4 className="text-white font-bold text-xl">전투본부</h4>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">COMBAT</span>
                    <p className="text-slate-400 text-xs mt-2">암살/경호</p>
                 </div>
                 {/* Data */}
                 <div className="bg-slate-900/50 border border-slate-800 p-4 text-center hover:border-purple-500/50 transition-colors">
                    <h4 className="text-white font-bold text-xl">데이터본부</h4>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">DATA</span>
                    <p className="text-slate-400 text-xs mt-2">해킹/조작</p>
                 </div>
            </div>

             {/* Additional Support Departments - Now ABOVE Ambu */}
             <div className="grid grid-cols-3 gap-4 w-full mt-4 pt-4 relative">
                {/* Connecting Line for bottom section */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-slate-800 border-l border-dashed border-slate-700"></div>
                <div className="absolute top-4 left-[16%] right-[16%] h-px bg-slate-800 border-t border-dashed border-slate-700"></div>

                {/* Medical */}
                <div className="bg-slate-950 border border-slate-800 p-3 text-center rounded-sm mt-4 hover:border-purple-500/30 transition-colors">
                   <h5 className="text-slate-300 font-bold text-sm">의무실</h5>
                </div>
                {/* Disposal */}
                <div className="bg-slate-950 border border-slate-800 p-3 text-center rounded-sm mt-4 hover:border-purple-500/30 transition-colors">
                   <h5 className="text-slate-300 font-bold text-sm">처리실</h5>
                </div>
                 {/* Training */}
                <div className="bg-slate-950 border border-slate-800 p-3 text-center rounded-sm mt-4 hover:border-purple-500/30 transition-colors">
                   <h5 className="text-slate-300 font-bold text-sm">교육실</h5>
                </div>
             </div>
    
            {/* Special: AMBU - Now at the very bottom */}
             <div className="mt-8 pt-8 border-t border-dashed border-slate-800 w-full flex justify-center relative">
                <button 
                    onClick={handleAmbuClick}
                    className="flex items-center gap-4 bg-black/50 border border-red-500 px-6 py-3 rounded-full hover:bg-red-900/20 transition-colors cursor-pointer group relative z-10 animate-red-glow"
                >
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse group-hover:bg-red-400"></span>
                    <div>
                         <span className="text-slate-300 font-bold text-sm mr-2 group-hover:text-red-300">암부</span>
                         <span className="text-[10px] text-slate-600 font-mono">DIRECT CONTROL</span>
                    </div>
                </button>
             </div>
        </div>
    );

    const renderSaifVisual = () => (
      <div className="w-full max-w-4xl mx-auto py-8 space-y-12">
        <div className="text-center">
           <h2 className="text-4xl font-display text-white mb-2 tracking-tighter">SAIF SYSTEM</h2>
           <p className="text-purple-500 font-mono text-xs tracking-[0.3em] uppercase">Absolute Evaluation Criteria</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Strength', sub: '무력', icon: '⚔️', desc: '전투 능력 / 살상력' },
             { label: 'Authority', sub: '권력', icon: '♛', desc: '조직 장악력 / 통솔력' },
             { label: 'Intelligence', sub: '지력', icon: '🧠', desc: '전략 수립 / 판단력' },
             { label: 'Finance', sub: '자본력', icon: '💰', desc: '자금 동원 / 기여도' }
           ].map((item, i) => (
             <div key={i} className="bg-slate-900/50 border border-purple-500/20 p-6 flex flex-col items-center text-center hover:bg-purple-900/10 transition-colors">
                <div className="text-3xl mb-4 grayscale text-purple-200">{item.icon}</div>
                <h3 className="text-xl font-bold text-white tracking-widest">{item.label[0]}</h3>
                <span className="text-[10px] text-purple-400 font-mono uppercase mb-2">{item.label}</span>
                <p className="text-xs text-slate-400">{item.desc}</p>
             </div>
           ))}
        </div>

        <div className="bg-slate-900/30 border border-slate-800 p-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
           <h3 className="text-lg text-white font-display mb-6 border-b border-slate-800 pb-2">EVALUATION TIERS</h3>
           
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 text-right text-2xl font-bold text-slate-600 font-mono">1-4</div>
                 <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[40%] h-full bg-slate-600"></div>
                 </div>
                 <div className="w-24 text-xs text-slate-400 uppercase tracking-widest text-right">Low Tier</div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-16 text-right text-2xl font-bold text-purple-400 font-mono">5-7</div>
                 <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[70%] h-full bg-purple-500"></div>
                 </div>
                 <div className="w-24 text-xs text-purple-300 uppercase tracking-widest text-right">Mid Tier</div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-16 text-right text-2xl font-bold text-white font-mono drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">8-10</div>
                 <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-white"></div>
                 </div>
                 <div className="w-24 text-xs text-white font-bold uppercase tracking-widest text-right">High Tier</div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
           <div className="border border-slate-800 p-6 bg-black relative">
              <div className="absolute -top-3 left-4 bg-black px-2 text-purple-500 font-mono text-xs">DEVICE</div>
              <h3 className="text-2xl text-white font-display mb-2">SAIF WATCH</h3>
              <p className="text-sm text-slate-400 mb-4">패도 조직원 전용 특수 단말기</p>
              <ul className="text-xs space-y-2 text-slate-300 font-mono">
                 <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 양자암호 인증 시스템</li>
                 <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 실시간 위치/생체신호 추적</li>
                 <li className="flex items-center gap-2"><span className="text-green-500">✓</span> 도청 불가능한 독자 통신망</li>
              </ul>
           </div>
           <div className="border border-slate-800 p-6 bg-black relative flex items-center justify-center">
               <div className="text-center">
                  <div className="text-4xl text-purple-600 mb-2 animate-pulse">● REC</div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">24/7 Monitoring Active</div>
               </div>
           </div>
        </div>
      </div>
    );

    return (
      <div className={`min-h-screen bg-[#1a1a1a] text-slate-300 font-sans flex flex-col relative transition-transform duration-100 animate-fade-in ${ambuAlert ? 'animate-shake-screen' : ''}`}>
        <header className="sticky top-0 z-50 bg-[#1a1a1a]/95 border-b border-white/10 p-4 flex justify-between items-center backdrop-blur-sm">
           <button 
             onClick={() => setCurrentView(AppView.DASHBOARD)}
             className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
           >
             <BackIcon /> Dashboard
           </button>
           <div className="text-[10px] font-mono text-purple-500 border border-purple-900 px-2 py-0.5">
             READ-ONLY
           </div>
        </header>
        
        <main className="flex-1 max-w-5xl mx-auto w-full p-8 md:p-12">
            {selectedArchive.id === 'org' ? renderOrgInfographic() : (
              selectedArchive.id === 'saif' ? renderSaifVisual() : (
                <>
                   <div className="mb-12 border-b-2 border-slate-700 pb-6">
                      <h1 className="text-4xl md:text-5xl font-display text-white mb-2">{selectedArchive.title}</h1>
                      <p className="text-purple-400 font-mono text-sm tracking-widest uppercase">{selectedArchive.subtitle}</p>
                   </div>
                   
                   <div className="prose prose-invert prose-p:text-slate-300 prose-headings:font-display prose-headings:text-white prose-a:text-purple-400 prose-strong:text-purple-200 max-w-none font-serif leading-loose">
                      {selectedArchive.content.split('\n').map((line, i) => {
                         // Simple Markdown-like parsing for this specific content structure
                         if (line.startsWith('# ')) return <h1 key={i} className="text-3xl border-b border-slate-800 pb-2 mt-8 mb-4">{line.replace('# ', '')}</h1>;
                         if (line.startsWith('## ')) return <h2 key={i} className="text-xl text-purple-300 mt-8 mb-4 border-l-2 border-purple-500 pl-3">{line.replace('## ', '')}</h2>;
                         if (line.startsWith('### ')) return <h3 key={i} className="text-lg text-slate-200 mt-6 mb-2 font-bold">{line.replace('### ', '')}</h3>;
                         if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-purple-500 mb-1">{line.replace('- ', '')}</li>;
                         if (line.startsWith('* ')) return <li key={i} className="ml-4 list-disc marker:text-purple-500 mb-1 font-bold">{line.replace('* ', '')}</li>;
                         if (line.trim() === '') return <br key={i}/>;
                         return <p key={i} className="mb-2">{line}</p>;
                      })}
                   </div>
               </>
             )
            )}

            {selectedArchive.id !== 'org' && selectedArchive.id !== 'saif' && (
               <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-600 uppercase">
                  <span>Doc ID: {selectedArchive.id.toUpperCase()}_00{Math.floor(Math.random()*90)+10}</span>
                  <span>Classification: Secret</span>
               </div>
            )}
            
             {/* Ambu Alert Modal - Global for Archive View */}
             {ambuAlert && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
                 <div className="bg-red-900/90 border border-red-500 p-6 text-center shadow-[0_0_50px_rgba(220,38,38,0.5)] backdrop-blur-sm animate-pulse">
                    <AlertIcon />
                    <h2 className="text-2xl font-bold text-white tracking-widest mt-2 mb-1">ACCESS DENIED</h2>
                    <p className="text-red-300 font-mono text-xs">접근 승인 거부</p>
                 </div>
              </div>
             )}
        </main>
      </div>
    );
  };

  const renderPersonnelList = () => (
    <div className="min-h-screen bg-neutral-950 text-slate-300 flex flex-col items-center relative animate-fade-in">
      <div className="w-full bg-purple-950/20 border-b border-purple-900/50 py-2 text-center fixed top-0 z-50 backdrop-blur-sm flex justify-between px-4 items-center h-14">
          <button 
             onClick={() => setCurrentView(AppView.DASHBOARD)}
             className="text-slate-400 hover:text-white"
          >
             <BackIcon />
          </button>
         <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase">
              PERSONNEL DATABASE
            </span>
         </div>
         <div className="w-6"></div> {/* Spacer */}
      </div>

      <header className="w-full max-w-4xl pt-24 pb-8 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tighter">
          MEMBERS
        </h1>
        <p className="text-sm text-slate-500 font-mono uppercase tracking-widest">
           Select a file to view details
        </p>
      </header>

      <main className="w-full max-w-6xl px-4 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CHARACTERS.map(char => (
          <div 
            key={char.id}
            onClick={() => handleSelectCharacter(char)}
            className="group relative bg-slate-900 border border-slate-800 hover:border-purple-600 transition-all duration-300 cursor-pointer overflow-hidden rounded-sm h-[450px]"
          >
            <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-20 transition-opacity duration-500" style={{ backgroundImage: `url("${char.imagePlaceholder}")` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            
            <div className="absolute bottom-0 w-full p-6 flex flex-col items-start z-10">
              <span className="text-purple-500 text-xs tracking-widest uppercase font-bold mb-1">{char.position}</span>
              <h2 className="text-3xl font-display text-white mb-2">{char.name}</h2>
              <div className="flex gap-2 text-xs text-slate-400 font-mono mb-4">
                 <span>{char.mbti}</span>
                 <span className="text-slate-600">|</span>
                 <span>S:{char.stats.S} A:{char.stats.A} I:{char.stats.I} F:{char.stats.F}</span>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                "{char.meaning}" <br/>
                {char.role}
              </p>
            </div>
            
            <div className="absolute top-4 right-4 w-2 h-2 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_10px_#9333ea]" />
          </div>
        ))}
      </main>
    </div>
  );

  const renderDetail = () => {
    if (!selectedChar) return null;
    return (
      <div className="min-h-screen bg-black text-slate-200 flex flex-col animate-fade-in">
        <div className="w-full bg-purple-950/20 border-b border-purple-900/50 py-1 text-center backdrop-blur-sm">
             <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase animate-pulse">
              Class C security clearance authorized
            </span>
        </div>

        <div className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12">
          <button 
            onClick={() => setCurrentView(AppView.CHARACTER_LIST)}
            className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <BackIcon /> Return to List
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="flex flex-col gap-8">
              
              {/* Standalone Music Player */}
              <CharacterMusicPlayer 
                 key={selectedChar.id} 
                 audioSrc={selectedChar.themeSongUrl} 
                 title={selectedChar.themeSongTitle} 
                 characterName={selectedChar.name}
              />

              <div className="relative aspect-square w-full bg-slate-900 overflow-hidden border border-slate-800 group">
                <img src={selectedChar.imagePlaceholder} alt={selectedChar.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="bg-slate-900/50 p-6 border border-slate-800">
                <h3 className="text-sm text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">SAIF System Analysis</h3>
                <SAIFChart stats={selectedChar.stats} color="#a855f7" />
                <div className="flex justify-between mt-4 text-xs font-mono text-slate-500">
                  <span>Power Class: {selectedChar.stats.S + selectedChar.stats.A + selectedChar.stats.I + selectedChar.stats.F > 35 ? 'S-Rank' : 'A-Rank'}</span>
                  <span>ID: {selectedChar.id.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-start space-y-8 pt-0 h-full">
               <div className="border-b border-slate-800 pb-8">
                  <h2 className="text-5xl font-display text-white mb-2">{selectedChar.kanji}</h2>
                   <h3 className="text-purple-500 font-serif italic text-lg mt-1 mb-4">{selectedChar.position}</h3>
                  <p className="text-slate-400 italic text-lg">"{selectedChar.meaning}"</p>
               </div>

               <div className="space-y-6 text-sm leading-relaxed text-slate-300">
                 <div>
                    <strong className="block text-purple-500 mb-1 text-xs uppercase tracking-widest">Role</strong>
                    {selectedChar.role}
                 </div>
                 
                 <div>
                    <strong className="block text-purple-500 mb-2 text-xs uppercase tracking-widest">Profile</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      <li>{selectedChar.age}세</li>
                      <li>{selectedChar.mbti}</li>
                      {selectedChar.appearance.split(',').map((item, index) => (
                        <li key={index}>{item.trim()}</li>
                      ))}
                    </ul>
                 </div>

                 <div>
                    <strong className="block text-purple-500 mb-2 text-xs uppercase tracking-widest">Personality</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      {selectedChar.personality.split(',').map((item, index) => (
                        <li key={index}>{item.trim()}</li>
                      ))}
                    </ul>
                 </div>

                 <div>
                    <strong className="block text-purple-500 mb-2 text-xs uppercase tracking-widest">Intelligence Report</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                      {selectedChar.features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                 </div>

                 {(selectedChar.sigColor || selectedChar.symbol) && (
                    <div className="border-t border-slate-800 pt-6 mt-2">
                      <strong className="block text-purple-500 mb-3 text-xs uppercase tracking-widest">Signature</strong>
                      <div className="flex flex-col gap-3 text-slate-400 font-mono text-xs">
                        {selectedChar.symbol && (
                           <div className="flex items-center gap-4">
                              <span className="w-16 text-slate-600 uppercase tracking-wider">Symbol</span>
                              <span className="text-white">{selectedChar.symbol}</span>
                           </div>
                        )}
                        {selectedChar.sigColor && (
                           <div className="flex items-center gap-4">
                              <span className="w-16 text-slate-600 uppercase tracking-wider">Color</span>
                              <div className="flex items-center gap-2">
                                 <div className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: selectedChar.sigColor }}></div>
                                 <span className="text-white">{selectedChar.sigColor}</span>
                              </div>
                           </div>
                        )}
                      </div>
                    </div>
                 )}
               </div>

               <div className="pt-8 mt-auto">
                 <div className="relative group">
                    {/* Background intense glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    
                    <button 
                      onClick={startChat}
                      className="relative w-full bg-black text-purple-100 border border-purple-400/50 py-4 px-8 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 font-bold font-mono overflow-hidden hover:bg-purple-900/20"
                    >
                      {/* Moving shine overlay */}
                      <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-shine-sweep"></div>
                      
                      {/* Button Content */}
                      <span className="relative z-10 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                        <WatchIcon /> ACCESS SAIF WATCH
                      </span>
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChat = () => {
    if (!selectedChar) return null;

    const renderWatchHeader = () => (
      <div className="bg-black border-b border-purple-900/30 p-4 font-mono text-xs text-green-500/80 leading-relaxed shadow-lg mb-4">
         <div className="flex justify-between items-center mb-4 border-b border-purple-900/30 pb-2">
            <span className="text-purple-400 font-bold text-sm tracking-widest">PWICE SAIF WATCH_OS</span>
            <span className="animate-pulse">● REC</span>
         </div>
         
         <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
           <div className="col-span-2 text-white">⋯𝙰𝙲𝙲𝙴𝚂𝚂⋯</div>
           <div>⌬𝙸𝙳 {selectedChar.name}║{selectedChar.position}</div>
           <div>⌬𝚂𝙰𝙸𝙵 ({selectedChar.stats.S}/{selectedChar.stats.A}/{selectedChar.stats.I}/{selectedChar.stats.F})</div>
           <div className="col-span-2">⌬𝙻𝙾𝙲 {watchData?.location}║37.5665° N, 126.9780° E</div>
           <div className="grid grid-cols-3 col-span-2 mt-2 gap-2 text-purple-300">
             <div>⌬𝙷𝚁 {watchData?.hr} 𝙱𝙿𝙼</div>
             <div>⌬𝚁𝚁 {watchData?.rr} /𝚖𝚒𝚗</div>
             <div>⌬𝚃𝙴𝙼𝙿 {watchData?.temp}°C</div>
           </div>
         </div>

         <div className="space-y-4 text-[11px]">
            <div>
              <div className="text-white mb-1">⋯𝙲𝙰𝙻𝙻⋯</div>
              {watchData?.calls.map((call, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-green-400">
                    {call.type === 'incoming' ? '☏↙' : '☏↗'}
                  </span>
                  <span className="text-slate-400">║</span>
                  <span className="w-12 truncate">{call.name}</span>
                  <span className="text-slate-400">║</span>
                  <span className="text-slate-300">{call.content}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="text-white mb-1">⋯𝙼𝙴𝚂𝚂𝙰𝙶𝙴⋯</div>
              {watchData?.messages.map((msg, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-green-400">
                    {msg.type === 'incoming' ? '✉↙' : '✉↗'}
                  </span>
                  <span className="text-slate-400">║</span>
                  <span className="w-12 truncate">{msg.name}</span>
                  <span className="text-slate-400">║</span>
                  <span className="text-slate-300">{msg.content}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="text-white mb-1">⋯𝚂𝙴𝙰𝚁𝙲𝙷⋯</div>
              {watchData?.searches.map((s, i) => (
                 <div key={i} className="flex gap-2">
                    <span className="text-yellow-500">⌕</span>
                    <span className="text-slate-300">{s}</span>
                    <span className="text-slate-600">║ {new Date().getHours()}:{Math.floor(Math.random()*60).toString().padStart(2,'0')}</span>
                 </div>
              ))}
            </div>
         </div>
      </div>
    );

    return (
      <div className="fixed inset-0 bg-neutral-950 flex flex-col font-sans animate-fade-in">
        <header className="h-16 border-b border-slate-900 bg-slate-950 flex items-center px-4 justify-between shrink-0 z-10">
           <div className="flex items-center gap-3">
             <button onClick={() => setCurrentView(AppView.CHARACTER_DETAIL)} className="text-slate-500 hover:text-white">
                <BackIcon />
             </button>
             <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700">
               <img src={selectedChar.imagePlaceholder} className="w-full h-full object-cover" alt="avatar" />
             </div>
             <div>
                <h3 className="text-white font-display text-sm leading-none">{selectedChar.name}</h3>
                <span className="text-xs text-purple-500 font-mono">ENCRYPTED CHANNEL</span>
             </div>
           </div>
           <div className="text-xs text-slate-700 font-mono hidden md:block">
             SAIF WATCH: CONNECTED
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
          <div className="max-w-3xl mx-auto w-full">
             {renderWatchHeader()}
             
             <div className="p-4 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-sm border ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 border-slate-700 text-slate-200' 
                      : 'bg-black border-purple-900/30 text-slate-300 shadow-[0_0_15px_rgba(147,51,234,0.1)]'
                  }`}>
                    {msg.role === 'model' && (
                      <div className="text-[10px] text-purple-600 uppercase mb-1 tracking-widest font-bold flex items-center gap-2">
                        {selectedChar.name}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed text-sm font-serif">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="text-xs text-slate-500 animate-pulse ml-2 font-mono">
                    Target is typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </main>

        <footer className="p-4 bg-slate-950 border-t border-slate-900 shrink-0">
          <div className="max-w-4xl mx-auto flex gap-2">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 p-3 text-sm focus:outline-none focus:border-purple-600 transition-colors placeholder-slate-600 font-serif"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isTyping || !inputMessage.trim()}
              className="bg-purple-900 hover:bg-purple-800 text-white p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon />
            </button>
          </div>
        </footer>
      </div>
    );
  };

  return (
    <div className="antialiased selection:bg-purple-900 selection:text-white">
      {currentView === AppView.LOGIN && renderLockScreen()}
      {currentView === AppView.DASHBOARD && renderDashboard()}
      {currentView === AppView.ARCHIVE && renderArchive()}
      {currentView === AppView.CHARACTER_LIST && renderPersonnelList()}
      {currentView === AppView.CHARACTER_DETAIL && renderDetail()}
      {currentView === AppView.CHAT && renderChat()}
      <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
          @keyframes shake-screen {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .animate-shake-screen {
            animation: shake-screen 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          @keyframes red-glow {
            0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.5), inset 0 0 5px rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); }
            50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8), inset 0 0 10px rgba(239, 68, 68, 0.4); border-color: rgba(239, 68, 68, 1); }
          }
          .animate-red-glow {
            animation: red-glow 2s infinite;
          }
          @keyframes shine-sweep {
            0% { left: -100%; }
            20% { left: 100%; }
            100% { left: 100%; }
          }
          .animate-shine-sweep {
            animation: shine-sweep 3s ease-in-out infinite;
          }
      `}</style>
    </div>
  );
}