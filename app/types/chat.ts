export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
  userId: string;
}

export interface ChatHistory {
  id: string;
  chatId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  createdAt: string;
} 