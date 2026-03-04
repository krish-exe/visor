// Chat Instance Types

export type ChatState = 'window' | 'bubble';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatInstance {
  id: string;
  state: ChatState;
  position: { x: number; y: number };
  size: { width: number; height: number };
  messages: ChatMessage[];
  imageBase64?: string;
  isStreaming: boolean;
  error?: string;
}

export interface ChatManagerState {
  activeChats: ChatInstance[];
}

// Chat window size constraints
export const CHAT_CONSTRAINTS = {
  minWidth: 400,
  minHeight: 300,
  maxWidth: 800,  // Maximum allowed width
  maxHeight: 600, // Maximum allowed height
  defaultWidth: 540,  // ~67% of max (smaller default)
  defaultHeight: 400, // ~67% of max (smaller default)
};

// Bubble constraints
export const BUBBLE_SIZE = 26; // Minimal notification dot
