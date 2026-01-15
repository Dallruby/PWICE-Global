import React, { useState, useEffect, useRef } from 'react';
import { CHARACTERS, ORGANIZATION_INFO, WATCH_DATA_POOLS } from './constants';
import { Character, AppView, ChatMessage } from './types';
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
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
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

// --- Standalone Music Player Component ---
const CharacterMusicPlayer = ({ audioSrc, title, characterName }: { audioSrc?: string, title?: string, characterName: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Reset state when source changes
    // Since parent uses key={char.id}, this component remounts cleanly on character change.
    // We do NOT call .load() here to avoid interrupting the browser's native initial fetch triggered by <audio src="...">
    setIsError(false);
    setIsPlaying(false);
  }, [audioSrc]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        setIsError(false);
        // Force load only if the audio element is completely uninitialized
        if (audio.readyState === 0) {
            audio.load();
        }
        await audio.play();
      }
    } catch (error: any) {
      // AbortError is common when toggling play/pause quickly or if load is interrupted
      if (error.name === 'AbortError') return;
      
      console.error("Playback failed message:", error.message);
      setIsError(true);
      setIsPlaying(false);
    }
  };

  const handleAudioError = () => {
      // FIX: Do not log the event object directly. It causes "Converting circular structure to JSON" errors.
      if (audioRef.current && audioRef.current.error) {
        console.error("Audio Error:", audioRef.current.error.code, audioRef.current.error.message);
      } else {
        console.error("Unknown Audio Error occurred");
      }
      
      if (audioSrc) {
        setIsError(true);
        setIsPlaying(false);
      }
  };

  return (
    <div className="w-full mb-4">
      <div className="w-full bg-slate-900 border border-slate-800 p-4 flex items-center justify-between shadow-lg relative overflow-hidden group">
         {/* Background Pulsing Effect when playing */}
         <div className={`absolute inset-0 bg-purple-900/10 transition-opacity duration-1000 ${isPlaying ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
         
         {audioSrc && (
           <audio 
             ref={audioRef} 
             src={audioSrc} 
             onEnded={() => setIsPlaying(false)}
             onPause={() => setIsPlaying(false)}
             onPlay={() => setIsPlaying(true)}
             onError={handleAudioError}
             loop
             preload="auto"
           />
         )}
         
         <div className="flex items-center gap-4 z-10 w-full">
            <button 
              onClick={togglePlay}
              disabled={!audioSrc}
              className={`w-10 h-10 flex-shrink-0 flex items-center justify-center border rounded-full transition-all ${
                  audioSrc 
                  ? (isError 
                      ? 'bg-red-900/20 text-red-500 border-red-900/50 hover:bg-red-900/40 hover:text-red-400'
                      : 'bg-purple-900/50 text-white border-purple-500 hover:bg-purple-600 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]')
                  : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
              }`}
            >
              {audioSrc ? (isError ? <AlertIcon /> : (isPlaying ? <PauseIcon /> : <PlayIcon />)) : <AlertIcon />}
            </button>
            
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-bold tracking-widest uppercase mb-0.5 ${isError ? 'text-red-500' : 'text-purple-400'}`}>
                  {audioSrc ? (isError ? 'Playback Failed' : (isPlaying ? 'Now Playing' : 'Original Soundtrack')) : 'No Audio Source'}
              </p>
              <div className="overflow-hidden">
                 <p className={`text-sm text-white font-display truncate ${isPlaying ? 'animate-pulse' : ''}`}>
                   {title ? `${title} - 패도 OST (${characterName})` : 'Unknown Track'}
                 </p>
              </div>
            </div>

            {/* Mini Visualizer */}
            {!isError && audioSrc && (
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
      
      {/* Explicit Error Message */}
      {isError && (
        <div className="text-[10px] text-red-400 bg-red-950/20 p-2 border border-red-900/30 mt-1 flex items-start gap-2">
           <span className="font-bold">⚠ ERROR:</span>
           <span>오디오 파일을 재생할 수 없습니다. 잠시 후 다시 시도해주세요.</span>
        </div>
      )}
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
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [watchData, setWatchData] = useState<WatchData | null>(null);

  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Force scroll to top whenever the view or character changes
  useEffect(() => {
    // Use setTimeout to ensure this runs after the layout shift/paint
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentView, selectedChar]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === '0829') {
      setLoginError('');
      setCurrentView(AppView.HOME);
    } else {
      setLoginError('ACCESS DENIED: Invalid Security Clearance.');
      setLoginPassword('');
    }
  };

  const handleSelectCharacter = (char: Character) => {
    setSelectedChar(char);
    setCurrentView(AppView.CHARACTER_DETAIL);
    setWatchData(null); 
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

  const renderLogin = () => (
    <div className="min-h-screen bg-black text-slate-300 flex flex-col items-center justify-center relative font-mono overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/30 via-black to-black" />
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
       
       <div className="z-10 w-full max-w-sm p-8 border border-slate-800 bg-slate-900/40 backdrop-blur-md relative shadow-2xl">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-600"/>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-600"/>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-600"/>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-600"/>

          <div className="text-center mb-10">
             <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-900/20 rounded-full text-purple-500 mb-4 border border-purple-900/50">
               <LockIcon />
             </div>
             <h1 className="text-xl font-bold tracking-[0.3em] text-white mb-2">PWICE GLOBAL</h1>
             <p className="text-[10px] text-purple-400 uppercase tracking-widest">Restricted Area • Class C Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
               <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Identify</label>
               <input 
                 type="text" 
                 value={loginId}
                 onChange={(e) => setLoginId(e.target.value)}
                 className="w-full bg-black/50 border border-slate-700 p-3 text-sm focus:border-purple-600 focus:outline-none focus:bg-purple-900/10 transition-colors text-white placeholder-slate-700 font-mono tracking-wider"
                 placeholder="CODENAME / ID"
                 autoFocus
                 autoComplete="off"
               />
            </div>
            <div>
               <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">Security Code</label>
               <input 
                 type="password" 
                 value={loginPassword}
                 onChange={(e) => setLoginPassword(e.target.value)}
                 className="w-full bg-black/50 border border-slate-700 p-3 text-sm focus:border-purple-600 focus:outline-none focus:bg-purple-900/10 transition-colors text-white placeholder-slate-700 font-mono tracking-wider"
                 placeholder="••••"
                 autoComplete="off"
               />
            </div>

            {loginError && (
              <div className="text-red-500 text-xs text-center font-bold tracking-wide animate-pulse bg-red-950/20 py-2 border border-red-900/30">
                 {loginError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-600 text-white py-3 px-4 text-xs font-bold tracking-[0.2em] uppercase transition-all hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-500 mt-4"
            >
              Authenticate
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-800/50">
             <p className="text-[11px] text-slate-500 font-serif italic font-bold animate-pulse">
               ※ 비밀번호는 그에게 물어보면 됩니다.
             </p>
          </div>
       </div>
    </div>
  );

  const renderHome = () => (
    <div className="min-h-screen bg-neutral-950 text-slate-300 flex flex-col items-center relative">
      <div className="w-full bg-purple-950/20 border-b border-purple-900/50 py-2 text-center fixed top-0 z-50 backdrop-blur-sm">
         <div className="animate-pulse flex flex-col items-center justify-center">
            <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase">
              This data is restricted to personnel with class C security clearance.
            </span>
            <span className="text-xs text-purple-300 font-serif font-bold mt-0.5">
              본 데이터는 C급 보안 인가 인원 접근용 입니다.
            </span>
         </div>
      </div>

      <header className="w-full max-w-4xl pt-28 pb-12 px-6 text-center mt-4">
        <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-4 tracking-tighter">
          <span className="text-purple-600">PA</span>EDO
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 font-serif italic mb-8 border-b border-slate-800 pb-8 inline-block">
          {ORGANIZATION_INFO.slogan}
        </p>
        <p className="max-w-xl mx-auto text-slate-500 leading-relaxed mb-12">
          {ORGANIZATION_INFO.philosophy} <br/>
          한국형 권력·이념 중심 조직의 정점. <br/>
          서열을 증명하고, 강자의 자리에 올라서라.
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

      <footer className="w-full py-8 border-t border-slate-900 text-center text-slate-600 text-xs font-mono">
        © PWICE GLOBAL. Access restricted. SAIF System Active.
      </footer>
    </div>
  );

  const renderDetail = () => {
    if (!selectedChar) return null;
    return (
      <div className="min-h-screen bg-black text-slate-200 flex flex-col">
        <div className="w-full bg-purple-950/20 border-b border-purple-900/50 py-1 text-center backdrop-blur-sm">
             <span className="text-[10px] text-purple-400 font-mono tracking-widest uppercase animate-pulse">
              Class C security clearance authorized
            </span>
        </div>

        <div className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12">
          <button 
            onClick={() => setCurrentView(AppView.HOME)}
            className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <BackIcon /> Return to Lobby
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
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    <button 
                      onClick={startChat}
                      className="relative w-full bg-black text-purple-400 border border-purple-500/50 py-4 px-8 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 font-bold font-mono hover:text-white"
                    >
                      <WatchIcon /> ACCESS SAIF WATCH
                    </button>
                 </div>

                 <p className="mt-4 text-xs text-center text-slate-600 font-mono">
                   * Caution: Conversations are monitored by the SAIF Watch network.
                 </p>
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
      <div className="fixed inset-0 bg-neutral-950 flex flex-col font-sans">
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
      {currentView === AppView.LOGIN && renderLogin()}
      {currentView === AppView.HOME && renderHome()}
      {currentView === AppView.CHARACTER_DETAIL && renderDetail()}
      {currentView === AppView.CHAT && renderChat()}
    </div>
  );
}