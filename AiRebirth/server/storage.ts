import {
  users,
  chatMessages,
  generatedImages,
  translations,
  generatedTexts,
  generatedCode,
  type User,
  type InsertUser,
  type ChatMessage,
  type InsertChatMessage,
  type GeneratedImage,
  type InsertGeneratedImage,
  type Translation,
  type InsertTranslation,
  type GeneratedText,
  type InsertGeneratedText,
  type GeneratedCode,
  type InsertGeneratedCode,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  getGeneratedImages(): Promise<GeneratedImage[]>;
  createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage>;
  
  getTranslations(): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  
  getGeneratedTexts(): Promise<GeneratedText[]>;
  createGeneratedText(text: InsertGeneratedText): Promise<GeneratedText>;
  
  getGeneratedCode(): Promise<GeneratedCode[]>;
  createGeneratedCode(code: InsertGeneratedCode): Promise<GeneratedCode>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .orderBy(chatMessages.timestamp);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getGeneratedImages(): Promise<GeneratedImage[]> {
    return await db
      .select()
      .from(generatedImages)
      .orderBy(desc(generatedImages.timestamp));
  }

  async createGeneratedImage(insertImage: InsertGeneratedImage): Promise<GeneratedImage> {
    const [image] = await db
      .insert(generatedImages)
      .values(insertImage)
      .returning();
    return image;
  }

  async getTranslations(): Promise<Translation[]> {
    return await db
      .select()
      .from(translations)
      .orderBy(desc(translations.timestamp));
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const [translation] = await db
      .insert(translations)
      .values(insertTranslation)
      .returning();
    return translation;
  }

  async getGeneratedTexts(): Promise<GeneratedText[]> {
    return await db
      .select()
      .from(generatedTexts)
      .orderBy(desc(generatedTexts.timestamp));
  }

  async createGeneratedText(insertText: InsertGeneratedText): Promise<GeneratedText> {
    const [text] = await db
      .insert(generatedTexts)
      .values(insertText)
      .returning();
    return text;
  }

  async getGeneratedCode(): Promise<GeneratedCode[]> {
    return await db
      .select()
      .from(generatedCode)
      .orderBy(desc(generatedCode.timestamp));
  }

  async createGeneratedCode(insertCode: InsertGeneratedCode): Promise<GeneratedCode> {
    const [code] = await db
      .insert(generatedCode)
      .values(insertCode)
      .returning();
    return code;
  }
}

export const storage = new DatabaseStorage();