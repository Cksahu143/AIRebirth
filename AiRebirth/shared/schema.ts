import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from 'drizzle-orm';

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  language: text("language").default("English"),
  useContext: boolean("use_context").default(true),
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

// Document analysis table
export const documentAnalyses = pgTable("document_analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  documentContent: text("document_content").notNull(),
  question: text("question").notNull(),
  analysis: text("analysis").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  content: true,
  role: true,
  language: true,
  useContext: true,
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

export const insertDocumentAnalysisSchema = createInsertSchema(documentAnalyses).pick({
  userId: true,
  documentContent: true,
  question: true,
  analysis: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type Translation = typeof translations.$inferSelect;
export type GeneratedText = typeof generatedTexts.$inferSelect;
export type GeneratedCode = typeof generatedCode.$inferSelect;
export type DocumentAnalysis = typeof documentAnalyses.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type InsertGeneratedText = z.infer<typeof insertGeneratedTextSchema>;
export type InsertGeneratedCode = z.infer<typeof insertGeneratedCodeSchema>;
export type InsertDocumentAnalysis = z.infer<typeof insertDocumentAnalysisSchema>;
