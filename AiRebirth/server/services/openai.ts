import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function chatCompletion(messages: Array<{role: string, content: string}>): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages as any,
  });

  return response.choices[0].message.content || "";
}

export async function generateImage(prompt: string, size: string = "1024x1024"): Promise<{ url: string }> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: size as any,
    quality: "standard",
  });

  return { url: response.data[0].url || "" };
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  const prompt = `Translate the following text to ${targetLanguage}. Only return the translation, no additional text:\n\n${text}`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content || "";
}

export async function generateText(
  prompt: string, 
  contentType: string, 
  tone: string, 
  length: string
): Promise<string> {
  const systemPrompt = `You are a helpful writing assistant. Generate ${contentType} content with a ${tone} tone. The length should be ${length}. Follow the user's requirements precisely.`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
  });

  return response.choices[0].message.content || "";
}

export async function generateCode(
  prompt: string,
  language: string,
  framework: string,
  complexity: string
): Promise<string> {
  const systemPrompt = `You are an expert programmer. Generate ${complexity} ${language} code${framework ? ` using ${framework}` : ''}. 
  
  Requirements:
  - Write clean, well-commented, production-ready code
  - Include proper error handling where appropriate
  - Follow best practices for the chosen language and framework
  - Provide complete, functional code that can be used directly
  - Include brief comments explaining key parts`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
  });

  return response.choices[0].message.content || "";
}
