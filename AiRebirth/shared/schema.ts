import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  size: text("size").notNull(),
  style: text("style"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  sourceText: text("source_text").notNull(),
  translatedText: text("translated_text").notNull(),
  sourceLang: text("source_lang").notNull(),
  targetLang: text("target_lang").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const generatedTexts = pgTable("generated_texts", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  generatedText: text("generated_text").notNull(),
  contentType: text("content_type").notNull(),
  tone: text("tone"),
  length: text("length"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const generatedCode = pgTable("generated_code", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  generatedCode: text("generated_code").notNull(),
  language: text("language").notNull(),
  framework: text("framework"),
  complexity: text("complexity"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  content: true,
  role: true,
});

export const insertGeneratedImageSchema = createInsertSchema(generatedImages).pick({
  prompt: true,
  imageUrl: true,
  size: true,
  style: true,
});

export const insertTranslationSchema = createInsertSchema(translations).pick({
  sourceText: true,
  translatedText: true,
  sourceLang: true,
  targetLang: true,
});

export const insertGeneratedTextSchema = createInsertSchema(generatedTexts).pick({
  prompt: true,
  generatedText: true,
  contentType: true,
  tone: true,
  length: true,
});

export const insertGeneratedCodeSchema = createInsertSchema(generatedCode).pick({
  prompt: true,
  generatedCode: true,
  language: true,
  framework: true,
  complexity: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;
export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type GeneratedText = typeof generatedTexts.$inferSelect;
export type InsertGeneratedText = z.infer<typeof insertGeneratedTextSchema>;
export type GeneratedCode = typeof generatedCode.$inferSelect;
export type InsertGeneratedCode = z.infer<typeof insertGeneratedCodeSchema>;
