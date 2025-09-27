import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertChatMessageSchema, 
  insertGeneratedImageSchema, 
  insertTranslationSchema, 
  insertGeneratedTextSchema,
  insertGeneratedCodeSchema,
  insertDocumentAnalysisSchema
} from "@shared/schema";
import { chatCompletion, generateImage, translateText, generateText, generateCode, textToSpeech, analyzeDocument, deepAnalysis } from "./services/openai";
import { geminiChatCompletion, geminiAnalyzeText, geminiGenerateCode, geminiTranslate } from "./services/gemini";
import { searchWeb, analyzeUrl } from "./services/webSearch";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Chat routes
  app.get("/api/chat/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/send", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, language = 'English', useContext = true, aiModel = 'gpt-4o' } = req.body;
      
      const userMessage = insertChatMessageSchema.parse({
        userId,
        content,
        role: "user",
        language,
        useContext
      });

      // Save user message
      const savedUserMessage = await storage.createChatMessage(userMessage);

      // Get chat history for context (only if useContext is true)
      let messages: Array<{role: string, content: string}> = [];
      
      if (useContext) {
        const chatHistory = await storage.getChatMessages(userId);
        // Only include context-enabled messages in the history
        const contextMessages = chatHistory.filter(msg => msg.useContext !== false);
        messages = contextMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      } else {
        // For non-context messages, only include the current message
        messages = [{
          role: "user",
          content: content
        }];
      }

      // Get AI response based on selected model
      let aiResponse: string;
      if (aiModel === 'gemini') {
        aiResponse = await geminiChatCompletion(messages, language);
      } else {
        aiResponse = await chatCompletion(messages, language);
      }

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        userId,
        content: aiResponse,
        role: "assistant",
        language,
        useContext
      });

      res.json({ userMessage: savedUserMessage, aiMessage });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Text-to-speech route
  app.post('/api/text-to-speech', isAuthenticated, async (req: any, res) => {
    try {
      const { text, language } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: 'Text is required' });
      }

      // Generate speech audio with language context
      const audioBuffer = await textToSpeech(text, language);

      // Set appropriate headers for audio response
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600'
      });

      res.send(audioBuffer);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      res.status(500).json({ message: 'Failed to generate speech' });
    }
  });

  // Image generation routes
  app.get("/api/images", isAuthenticated, async (req, res) => {
    try {
      const images = await storage.getGeneratedImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generated images" });
    }
  });

  app.post("/api/images/generate", isAuthenticated, async (req, res) => {
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
  app.get("/api/translations", isAuthenticated, async (req, res) => {
    try {
      const translations = await storage.getTranslations();
      res.json(translations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  app.post("/api/translate", isAuthenticated, async (req, res) => {
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
  app.get("/api/texts", isAuthenticated, async (req, res) => {
    try {
      const texts = await storage.getGeneratedTexts();
      res.json(texts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generated texts" });
    }
  });

  app.post("/api/texts/generate", isAuthenticated, async (req, res) => {
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
  app.get("/api/code", isAuthenticated, async (req, res) => {
    try {
      const codes = await storage.getGeneratedCodes();
      res.json(codes);
    } catch (error) {
      console.error("Code fetch error:", error);
      res.status(500).json({ error: "Failed to fetch generated code" });
    }
  });

  app.post("/api/code/generate", isAuthenticated, async (req, res) => {
    try {
      const { prompt, language, framework, complexity } = req.body;
      
      // Generate code with OpenAI
      const result = await generateCode(prompt, language, framework, complexity);
      
      // Save to storage
      const codeData = insertGeneratedCodeSchema.parse({
        prompt,
        generatedCode: result.code,
        language,
        framework,
        complexity
      });

      const savedCode = await storage.createGeneratedCode(codeData);
      
      // Return both the saved code data and the explanation
      res.json({
        ...savedCode,
        explanation: result.explanation
      });
    } catch (error) {
      console.error("Code generation error:", error);
      res.status(500).json({ error: "Failed to generate code" });
    }
  });

  // Document analysis routes
  app.post("/api/documents/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { document, question } = req.body;

      if (!document || !question) {
        return res.status(400).json({ error: "Document and question are required" });
      }

      // Analyze document with AI
      const analysis = await analyzeDocument(document, question);

      // Save analysis
      const analysisData = insertDocumentAnalysisSchema.parse({
        userId,
        documentContent: document,
        question,
        analysis,
      });

      await storage.createDocumentAnalysis(analysisData);

      res.json({ analysis });
    } catch (error) {
      console.error("Document analysis error:", error);
      res.status(500).json({ error: "Failed to analyze document" });
    }
  });

  app.get("/api/documents/analyses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analyses = await storage.getDocumentAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document analyses" });
    }
  });

  // Advanced AI Analysis Routes
  app.post("/api/analysis/deep", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query, type } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const result = await deepAnalysis(query, type || "deep");

      // Save to document analyses for history
      const analysisData = insertDocumentAnalysisSchema.parse({
        userId,
        documentContent: `Analysis Type: ${type || "deep"}`,
        question: query,
        analysis: result,
      });

      await storage.createDocumentAnalysis(analysisData);

      res.json({
        query,
        analysisType: type || "deep",
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Deep analysis error:", error);
      res.status(500).json({ error: "Failed to complete analysis" });
    }
  });

  app.post("/api/search/web", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      // Use free web search implementation
      const searchResults = await searchWeb(query);

      // Save to document analyses for history
      const analysisData = insertDocumentAnalysisSchema.parse({
        userId,
        documentContent: `Web Search Query: ${query}`,
        question: query,
        analysis: searchResults.results,
      });

      await storage.createDocumentAnalysis(analysisData);

      res.json({
        query,
        analysisType: "web-search",
        result: searchResults.results,
        timestamp: new Date().toISOString(),
        sources: searchResults.sources
      });
    } catch (error) {
      console.error("Web search error:", error);
      res.status(500).json({ error: "Failed to search web" });
    }
  });

  app.post("/api/analysis/url", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Use free URL analysis implementation
      const urlResults = await analyzeUrl(url);

      // Save to document analyses for history
      const analysisData = insertDocumentAnalysisSchema.parse({
        userId,
        documentContent: `URL Analysis: ${url}`,
        question: `Analyze and summarize: ${url}`,
        analysis: urlResults.results,
      });

      await storage.createDocumentAnalysis(analysisData);

      res.json({
        query: `Analyze: ${url}`,
        analysisType: "url-analysis",
        result: urlResults.results,
        timestamp: new Date().toISOString(),
        sources: urlResults.sources
      });
    } catch (error) {
      console.error("URL analysis error:", error);
      res.status(500).json({ error: "Failed to analyze URL" });
    }
  });

  app.get("/api/analysis/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analyses = await storage.getDocumentAnalyses(userId);
      
      // Transform to match frontend interface
      const formattedAnalyses = analyses.map(analysis => ({
        id: analysis.id,
        query: analysis.question,
        analysisType: analysis.documentContent.includes("Analysis Type:") ? 
          analysis.documentContent.replace("Analysis Type: ", "") :
          analysis.documentContent.includes("Web Search") ? "web-search" :
          analysis.documentContent.includes("URL Analysis") ? "url-analysis" : "deep",
        result: analysis.analysis,
        timestamp: analysis.timestamp,
        sources: analysis.documentContent.includes("URL Analysis:") ? 
          [analysis.documentContent.replace("URL Analysis: ", "")] : []
      }));

      res.json(formattedAnalyses);
    } catch (error) {
      console.error("Analysis history error:", error);
      res.status(500).json({ error: "Failed to fetch analysis history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
