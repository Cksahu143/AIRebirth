import { apiRequest } from "./queryClient";

export const api = {
  // Chat API
  getChatMessages: () => fetch("/api/chat/messages").then(res => res.json()),
  sendChatMessage: (content: string) => 
    apiRequest("POST", "/api/chat/send", { content }),

  // Image generation API
  getGeneratedImages: () => fetch("/api/images").then(res => res.json()),
  generateImage: (prompt: string, size: string, style: string) =>
    apiRequest("POST", "/api/images/generate", { prompt, size, style }),

  // Translation API
  getTranslations: () => fetch("/api/translations").then(res => res.json()),
  translateText: (sourceText: string, sourceLang: string, targetLang: string) =>
    apiRequest("POST", "/api/translate", { sourceText, sourceLang, targetLang }),

  // Text generation API
  getGeneratedTexts: () => fetch("/api/texts").then(res => res.json()),
  generateText: (prompt: string, contentType: string, tone: string, length: string) =>
    apiRequest("POST", "/api/texts/generate", { prompt, contentType, tone, length }),

  // Code generation API
  getGeneratedCode: () => fetch("/api/code").then(res => res.json()),
  generateCode: (prompt: string, language: string, framework: string, complexity: string) =>
    apiRequest("POST", "/api/code/generate", { prompt, language, framework, complexity }),
};
