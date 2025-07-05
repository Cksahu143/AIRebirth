import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, 
  insertGeneratedImageSchema, 
  insertTranslationSchema, 
  insertGeneratedTextSchema,
  insertGeneratedCodeSchema
} from "@shared/schema";
import { chatCompletion, generateImage, translateText, generateText, generateCode } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat routes
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const userMessage = insertChatMessageSchema.parse({
        content: req.body.content,
        role: "user"
      });

      // Save user message
      const savedUserMessage = await storage.createChatMessage(userMessage);

      // Get chat history for context
      const chatHistory = await storage.getChatMessages();
      const messages = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get AI response
      const aiResponse = await chatCompletion(messages);

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        content: aiResponse,
        role: "assistant"
      });

      res.json({ userMessage: savedUserMessage, aiMessage });
    } catch (error) {
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Image generation routes
  app.get("/api/images", async (req, res) => {
    try {
      const images = await storage.getGeneratedImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generated images" });
    }
  });

  app.post("/api/images/generate", async (req, res) => {
    try {
      const { prompt, size, style } = req.body;
      
      // Generate image with OpenAI
      const result = await generateImage(prompt, size);
      
      // Save to storage
      const imageData = insertGeneratedImageSchema.parse({
        prompt,
        imageUrl: result.url,
        size,
        style
      });

      const savedImage = await storage.createGeneratedImage(imageData);
      res.json(savedImage);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  // Translation routes
  app.get("/api/translations", async (req, res) => {
    try {
      const translations = await storage.getTranslations();
      res.json(translations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  app.post("/api/translate", async (req, res) => {
    try {
      const { sourceText, sourceLang, targetLang } = req.body;
      
      // Translate with OpenAI
      const translatedText = await translateText(sourceText, targetLang);
      
      // Save to storage
      const translationData = insertTranslationSchema.parse({
        sourceText,
        translatedText,
        sourceLang,
        targetLang
      });

      const savedTranslation = await storage.createTranslation(translationData);
      res.json(savedTranslation);
    } catch (error) {
      res.status(500).json({ error: "Failed to translate text" });
    }
  });

  // Text generation routes
  app.get("/api/texts", async (req, res) => {
    try {
      const texts = await storage.getGeneratedTexts();
      res.json(texts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generated texts" });
    }
  });

  app.post("/api/texts/generate", async (req, res) => {
    try {
      const { prompt, contentType, tone, length } = req.body;
      
      // Generate text with OpenAI
      const generatedContent = await generateText(prompt, contentType, tone, length);
      
      // Save to storage
      const textData = insertGeneratedTextSchema.parse({
        prompt,
        generatedText: generatedContent,
        contentType,
        tone,
        length
      });

      const savedText = await storage.createGeneratedText(textData);
      res.json(savedText);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate text" });
    }
  });

  // Code generation routes
  app.get("/api/code", async (req, res) => {
    try {
      const code = await storage.getGeneratedCode();
      res.json(code);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generated code" });
    }
  });

  app.post("/api/code/generate", async (req, res) => {
    try {
      const { prompt, language, framework, complexity } = req.body;
      
      // Generate code with OpenAI
      const generatedContent = await generateCode(prompt, language, framework, complexity);
      
      // Save to storage
      const codeData = insertGeneratedCodeSchema.parse({
        prompt,
        generatedCode: generatedContent,
        language,
        framework,
        complexity
      });

      const savedCode = await storage.createGeneratedCode(codeData);
      res.json(savedCode);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
