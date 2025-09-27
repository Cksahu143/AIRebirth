import {
  users,
  chatMessages,
  generatedImages,
  translations,
  generatedTexts,
  generatedCode,
  documentAnalyses,
  type User,
  type UpsertUser,
  type ChatMessage,
  type GeneratedImage,
  type Translation,
  type GeneratedText,
  type GeneratedCode,
  type DocumentAnalysis,
  type InsertChatMessage,
  type InsertGeneratedImage,
  type InsertTranslation,
  type InsertGeneratedText,
  type InsertGeneratedCode,
  type InsertDocumentAnalysis,
} from "@shared/schema";
// Temporarily commenting out database import due to Neon endpoint issues
// import { db } from "./db";
// import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  getGeneratedImages(): Promise<GeneratedImage[]>;
  createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage>;
  
  getTranslations(): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  
  getGeneratedTexts(): Promise<GeneratedText[]>;
  createGeneratedText(text: InsertGeneratedText): Promise<GeneratedText>;
  
  getGeneratedCodes(): Promise<GeneratedCode[]>;
  createGeneratedCode(code: InsertGeneratedCode): Promise<GeneratedCode>;
  
  getDocumentAnalyses(userId: string): Promise<DocumentAnalysis[]>;
  createDocumentAnalysis(analysis: InsertDocumentAnalysis): Promise<DocumentAnalysis>;
}

// Temporary in-memory storage while database endpoint is disabled
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private chatMessages: Map<string, ChatMessage[]> = new Map();
  private generatedImages: GeneratedImage[] = [];
  private translations: Translation[] = [];
  private generatedTexts: GeneratedText[] = [];
  private generatedCodes: GeneratedCode[] = [];
  private documentAnalyses: Map<string, DocumentAnalysis[]> = new Map();

  private nextId = 1;

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id || "");
    if (existing) {
      const updated = { ...existing, ...userData, updatedAt: new Date() };
      this.users.set(updated.id!, updated);
      return updated;
    } else {
      const newUser: User = {
        id: userData.id || `user_${this.nextId++}`,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(newUser.id, newUser);
      return newUser;
    }
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return this.chatMessages.get(userId) || [];
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.nextId++,
      userId: insertMessage.userId,
      content: insertMessage.content,
      role: insertMessage.role,
      language: insertMessage.language || "English",
      useContext: insertMessage.useContext ?? true,
      timestamp: new Date(),
    };

    const userMessages = this.chatMessages.get(insertMessage.userId) || [];
    userMessages.push(message);
    this.chatMessages.set(insertMessage.userId, userMessages);
    
    return message;
  }

  async getGeneratedImages(): Promise<GeneratedImage[]> {
    return [...this.generatedImages].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createGeneratedImage(insertImage: InsertGeneratedImage): Promise<GeneratedImage> {
    const image: GeneratedImage = {
      id: this.nextId++,
      prompt: insertImage.prompt,
      imageUrl: insertImage.imageUrl,
      size: insertImage.size,
      style: insertImage.style || null,
      timestamp: new Date(),
    };
    this.generatedImages.push(image);
    return image;
  }

  async getTranslations(): Promise<Translation[]> {
    return [...this.translations].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const translation: Translation = {
      id: this.nextId++,
      sourceText: insertTranslation.sourceText,
      translatedText: insertTranslation.translatedText,
      sourceLang: insertTranslation.sourceLang,
      targetLang: insertTranslation.targetLang,
      timestamp: new Date(),
    };
    this.translations.push(translation);
    return translation;
  }

  async getGeneratedTexts(): Promise<GeneratedText[]> {
    return [...this.generatedTexts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createGeneratedText(insertText: InsertGeneratedText): Promise<GeneratedText> {
    const text: GeneratedText = {
      id: this.nextId++,
      prompt: insertText.prompt,
      generatedText: insertText.generatedText,
      contentType: insertText.contentType,
      tone: insertText.tone || null,
      length: insertText.length || null,
      timestamp: new Date(),
    };
    this.generatedTexts.push(text);
    return text;
  }

  async getGeneratedCodes(): Promise<GeneratedCode[]> {
    return [...this.generatedCodes].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createGeneratedCode(insertCode: InsertGeneratedCode): Promise<GeneratedCode> {
    const code: GeneratedCode = {
      id: this.nextId++,
      prompt: insertCode.prompt,
      generatedCode: insertCode.generatedCode,
      language: insertCode.language,
      framework: insertCode.framework || null,
      complexity: insertCode.complexity || null,
      timestamp: new Date(),
    };
    this.generatedCodes.push(code);
    return code;
  }

  async getDocumentAnalyses(userId: string): Promise<DocumentAnalysis[]> {
    const userAnalyses = this.documentAnalyses.get(userId) || [];
    return [...userAnalyses].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50);
  }

  async createDocumentAnalysis(insertAnalysis: InsertDocumentAnalysis): Promise<DocumentAnalysis> {
    const analysis: DocumentAnalysis = {
      id: this.nextId++,
      userId: insertAnalysis.userId,
      documentContent: insertAnalysis.documentContent,
      question: insertAnalysis.question,
      analysis: insertAnalysis.analysis,
      timestamp: new Date(),
    };

    const userAnalyses = this.documentAnalyses.get(insertAnalysis.userId) || [];
    userAnalyses.push(analysis);
    this.documentAnalyses.set(insertAnalysis.userId, userAnalyses);

    return analysis;
  }
}

export const storage = new MemStorage();