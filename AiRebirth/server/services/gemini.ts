import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client with API key
const gemini = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export async function geminiChatCompletion(
  messages: Array<{role: string, content: string}>, 
  language: string = 'English'
): Promise<string> {
  try {
    // Convert messages to Gemini format
    const conversationHistory = messages.map(msg => {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      return {
        role,
        parts: [{ text: msg.content }]
      };
    });

    // Add language instruction if not English
    const languagePrompt = language !== 'English' 
      ? `Please respond in ${language} language. ` 
      : '';

    // Get the latest user message and add language instruction
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage && languagePrompt) {
      lastMessage.parts[0].text = languagePrompt + lastMessage.parts[0].text;
    }

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationHistory,
    });

    return response.text || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to get response from Gemini AI");
  }
}

export async function geminiAnalyzeText(
  text: string,
  analysisType: string,
  language: string = 'English'
): Promise<string> {
  try {
    const languageInstruction = language !== 'English' 
      ? `Please respond in ${language} language. ` 
      : '';

    let prompt = '';
    switch (analysisType) {
      case 'deep-think':
        prompt = `${languageInstruction}Analyze this text deeply and provide thoughtful insights: ${text}`;
        break;
      case 'research':
        prompt = `${languageInstruction}Research and provide comprehensive information about: ${text}`;
        break;
      case 'critical':
        prompt = `${languageInstruction}Provide a critical analysis of: ${text}`;
        break;
      default:
        prompt = `${languageInstruction}Analyze this text: ${text}`;
    }

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    return response.text || "Analysis could not be completed.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw new Error("Failed to analyze text with Gemini AI");
  }
}

export async function geminiGenerateCode(
  prompt: string,
  language: string,
  codeLanguage: string
): Promise<string> {
  try {
    const languageInstruction = language !== 'English' 
      ? `Please provide explanations in ${language} language, but keep code comments in English. ` 
      : '';

    const codePrompt = `${languageInstruction}Generate ${codeLanguage} code for: ${prompt}

Please provide clean, well-commented code with explanations.`;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-pro",
      contents: codePrompt,
    });

    return response.text || "Code generation failed.";
  } catch (error) {
    console.error("Gemini code generation error:", error);
    throw new Error("Failed to generate code with Gemini AI");
  }
}

export async function geminiTranslate(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'auto-detect'
): Promise<string> {
  try {
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
Only provide the translation, no additional explanation:

${text}`;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Translation failed.";
  } catch (error) {
    console.error("Gemini translation error:", error);
    throw new Error("Failed to translate with Gemini AI");
  }
}