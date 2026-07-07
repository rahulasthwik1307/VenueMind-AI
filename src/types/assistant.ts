export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AssistantSession {
  id: string;
  persona: string;
  messages: Message[];
  createdAt: string;
}
