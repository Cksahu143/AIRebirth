export interface ChatMessage {
  id: number;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  language?: string;
  useContext?: boolean;
  timestamp: Date | string;
}

export interface GeneratedImage {
  id: number;
  prompt: string;
  imageUrl: string;
  size: string;
  style?: string;
  timestamp: Date | string;
}

export interface Translation {
  id: number;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date | string;
}

export interface GeneratedText {
  id: number;
  prompt: string;
  generatedText: string;
  contentType: string;
  tone?: string;
  length?: string;
  timestamp: Date | string;
}

export interface GeneratedCode {
  id: number;
  prompt: string;
  generatedCode: string;
  language: string;
  framework?: string;
  complexity?: string;
  timestamp: Date | string;
}
