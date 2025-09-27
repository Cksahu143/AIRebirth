import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function chatCompletion(
  messages: Array<{role: string, content: string}>, 
  language?: string
): Promise<string> {
  // Enhanced system prompt for better link generation and responses
  const systemMessage = language && language !== 'English' 
    ? `You are a helpful AI assistant. Always respond in ${language}. 

LINKS AND URLS:
- Always use proper markdown formatting: [descriptive text](https://example.com)
- Use real, working URLs when referencing actual websites
- When mentioning companies/services, provide their actual URLs
- Make all links functional and clickable

FORMATTING:
- Use proper markdown for structure
- Use code blocks with language specification: \`\`\`javascript
- Bold important terms with **text**

Be natural and conversational in your responses.`
    : `You are a helpful AI assistant. Respond naturally and conversationally.

LINKS AND URLS:
- Always use proper markdown formatting: [descriptive text](https://example.com)  
- Use real, working URLs when referencing actual websites
- When mentioning companies/services, provide their actual URLs
- Make all links functional and clickable

FORMATTING:
- Use proper markdown for structure
- Use code blocks with language specification: \`\`\`javascript
- Bold important terms with **text**

Be helpful, accurate, and well-formatted.`;

  const messagesWithSystem = [
    { role: "system", content: systemMessage },
    ...messages
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messagesWithSystem as any,
    temperature: 0.7,
  });

  return response.choices[0].message.content || "";
}

export async function textToSpeech(text: string, language?: string): Promise<Buffer> {
  // For languages that TTS doesn't handle well, translate to English first
  const problematicLanguages = ['Odia', 'Sanskrit', 'Assamese', 'Manipuri'];
  let textToSpeak = text;
  
  if (language && problematicLanguages.includes(language)) {
    // Translate to English for better TTS quality
    const translationPrompt = `Translate this ${language} text to English, keeping the meaning intact: ${text}`;
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: translationPrompt }],
    });
    textToSpeak = translationResponse.choices[0].message.content || text;
  }

  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: textToSpeak,
  });

  return Buffer.from(await response.arrayBuffer());
}

export async function generateImage(prompt: string, size: string = "1024x1024"): Promise<{ url: string }> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: size as any,
    quality: "standard",
  });

  return { url: response.data[0]?.url || "" };
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
): Promise<{ code: string; explanation: string }> {
  const frameworkText = framework && framework !== 'none' ? ` using ${framework}` : '';
  
  let systemPrompt = '';
  
  if (language === 'HTML') {
    systemPrompt = `You are an expert web developer. Generate ${complexity} semantic HTML${frameworkText}.
    
    Requirements:
    - Write clean, semantic HTML5 markup
    - Include proper accessibility attributes (alt text, ARIA labels, etc.)
    - Use modern HTML5 elements (header, nav, main, section, article, footer)
    - Include meta tags for SEO when creating full pages
    - Follow HTML5 best practices and validation standards
    - Add helpful comments explaining the structure
    
    Response format: Return a JSON object with "code" and "explanation" fields. The code field should contain only the HTML code. The explanation field should contain a detailed explanation of the code structure, accessibility features, and best practices used.`;
  } else if (language === 'CSS') {
    systemPrompt = `You are an expert CSS developer. Generate ${complexity} CSS styles${frameworkText}.
    
    Requirements:
    - Write clean, modern CSS with proper organization
    - Use CSS Grid and Flexbox for layouts when appropriate
    - Include responsive design principles (mobile-first approach)
    - Follow CSS best practices (BEM methodology when helpful)
    - Include CSS custom properties (variables) when beneficial
    - Add browser compatibility considerations
    - Include helpful comments explaining complex styles
    
    Response format: Return a JSON object with "code" and "explanation" fields. The code field should contain only the CSS code. The explanation field should contain a detailed explanation of the styling approach, responsive design decisions, and techniques used.`;
  } else {
    systemPrompt = `You are an expert programmer. Generate ${complexity} ${language} code${frameworkText}. 
    
    Requirements:
    - Write clean, well-commented, production-ready code
    - Include proper error handling where appropriate
    - Follow best practices for the chosen language and framework
    - Provide complete, functional code that can be used directly
    - Include brief comments explaining key parts
    
    Response format: Return a JSON object with "code" and "explanation" fields. The code field should contain only the ${language} code. The explanation field should contain a detailed explanation of how the code works, the algorithms used, and best practices applied.`;
  }
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
  });

  try {
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      code: result.code || "",
      explanation: result.explanation || ""
    };
  } catch (error) {
    // Fallback if JSON parsing fails
    const content = response.choices[0].message.content || "";
    return {
      code: content,
      explanation: "Code generated successfully."
    };
  }
}

export async function analyzeDocument(document: string, question: string): Promise<string> {
  const systemPrompt = `You are an AI document analyst. Analyze the provided document and answer the user's question based on the content. 
  
  Provide a comprehensive and accurate response based solely on the information in the document. If the document doesn't contain information to fully answer the question, mention this limitation while providing what information is available.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Document:\n${document}\n\nQuestion: ${question}` }
    ],
  });

  return response.choices[0].message.content || "Unable to analyze the document.";
}

export async function deepAnalysis(query: string, analysisType: string): Promise<string> {
  let systemPrompt = "";
  
  switch (analysisType) {
    case "deep":
      systemPrompt = `You are an AI specialized in deep analytical thinking. Take your time to thoroughly analyze the query from multiple perspectives. Consider:
      - Multiple angles and viewpoints
      - Underlying assumptions and implications
      - Cause and effect relationships
      - Historical context where relevant
      - Future implications and possibilities
      - Connections to broader themes
      
      Provide a comprehensive, nuanced analysis that demonstrates deep thinking. Use proper markdown formatting for structure.`;
      break;
      
    case "research":
      systemPrompt = `You are an AI research specialist. Conduct thorough research on the given topic by:
      - Drawing from multiple knowledge domains
      - Providing historical background and context
      - Identifying key concepts, theories, and methodologies
      - Comparing different perspectives and schools of thought
      - Highlighting recent developments and trends
      - Suggesting areas for further investigation
      
      Structure your research with clear sections and use markdown formatting. Cite relevant concepts and frameworks.`;
      break;
      
    case "critical":
      systemPrompt = `You are an AI critical thinking specialist. Critically evaluate the given statement, argument, or claim by:
      - Identifying key assumptions and premises
      - Evaluating the strength of evidence
      - Looking for logical fallacies or weaknesses
      - Considering counterarguments and alternative perspectives
      - Assessing bias and reliability of sources
      - Determining validity and soundness of reasoning
      
      Provide a balanced critical analysis using markdown formatting. Be objective and thorough.`;
      break;
      
    default:
      systemPrompt = `You are an AI analyst. Provide a comprehensive analysis of the given query with deep insights and thorough reasoning.`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content || "Unable to complete the analysis.";
}
