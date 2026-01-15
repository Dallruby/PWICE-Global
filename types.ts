export interface SAIFStats {
  S: number; // Strength (무력)
  A: number; // Authority (권력)
  I: number; // Intelligence (지력)
  F: number; // Finance (자본력)
}

export interface Character {
  id: string;
  name: string;
  kanji: string;
  meaning: string;
  age: number;
  position: string;
  role: string;
  stats: SAIFStats;
  appearance: string;
  personality: string;
  features: string[];
  mbti: string;
  imagePlaceholder: string; // URL for placeholder
  systemInstruction: string; // For AI context
  themeSongTitle?: string; // Theme song title
  themeSongBase64?: string; // Direct Base64 Audio Data
  sigColor?: string; // Signature Hex Color
  symbol?: string; // Signature Symbol
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppView {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  CHARACTER_DETAIL = 'CHARACTER_DETAIL',
  CHAT = 'CHAT',
}