import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Brain, User, Send, Volume2, VolumeX, History, Bot } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ChatMessage } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { MessageRenderer } from "@/components/MessageRenderer";
import { useCursor } from "@/hooks/useCursor";

// Supported languages with their display names
const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "हिन्दी (Hindi)" },
  { value: "Odia", label: "ଓଡ଼ିଆ (Odia)" },
  { value: "Spanish", label: "Español (Spanish)" },
  { value: "French", label: "Français (French)" },
  { value: "German", label: "Deutsch (German)" },
  { value: "Italian", label: "Italiano (Italian)" },
  { value: "Portuguese", label: "Português (Portuguese)" },
  { value: "Russian", label: "Русский (Russian)" },
  { value: "Japanese", label: "日本語 (Japanese)" },
  { value: "Korean", label: "한국어 (Korean)" },
  { value: "Chinese", label: "中文 (Chinese)" },
  { value: "Arabic", label: "العربية (Arabic)" },
  { value: "Bengali", label: "বাংলা (Bengali)" },
  { value: "Tamil", label: "தமிழ் (Tamil)" },
  { value: "Telugu", label: "తెలుగు (Telugu)" },
  { value: "Marathi", label: "मराठी (Marathi)" },
  { value: "Gujarati", label: "ગુજરાતી (Gujarati)" },
  { value: "Kannada", label: "ಕನ್ನಡ (Kannada)" },
  { value: "Malayalam", label: "മലയാളം (Malayalam)" },
  { value: "Punjabi", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { value: "Urdu", label: "اردو (Urdu)" },
  { value: "Nepali", label: "नेपाली (Nepali)" },
  { value: "Sinhala", label: "සිංහල (Sinhala)" },
  { value: "Thai", label: "ไทย (Thai)" },
  { value: "Vietnamese", label: "Tiếng Việt (Vietnamese)" },
  { value: "Indonesian", label: "Bahasa Indonesia (Indonesian)" },
  { value: "Malay", label: "Bahasa Melayu (Malay)" },
  { value: "Turkish", label: "Türkçe (Turkish)" },
  { value: "Greek", label: "Ελληνικά (Greek)" },
  { value: "Hebrew", label: "עברית (Hebrew)" },
  { value: "Persian", label: "فارسی (Persian)" },
  { value: "Swahili", label: "Kiswahili (Swahili)" },
  { value: "Dutch", label: "Nederlands (Dutch)" },
  { value: "Swedish", label: "Svenska (Swedish)" },
  { value: "Norwegian", label: "Norsk (Norwegian)" },
  { value: "Danish", label: "Dansk (Danish)" },
  { value: "Finnish", label: "Suomi (Finnish)" },
  { value: "Polish", label: "Polski (Polish)" },
  { value: "Czech", label: "Čeština (Czech)" },
  { value: "Hungarian", label: "Magyar (Hungarian)" },
  { value: "Romanian", label: "Română (Romanian)" },
  { value: "Ukrainian", label: "Українська (Ukrainian)" },
];

// AI Models
const AI_MODELS = [
  { value: "gpt-4o", label: "GPT-4o (OpenAI)", description: "Advanced reasoning and creativity" },
  { value: "gemini", label: "Gemini (Google)", description: "Multimodal AI with free tier" },
];

export default function Chat() {
  const [input, setInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedAiModel, setSelectedAiModel] = useState("gpt-4o");
  const [useContext, setUseContext] = useState(true);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { setCursor, resetCursor } = useCursor();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, language, useContext, aiModel }: { content: string; language: string; useContext: boolean; aiModel: string }) => {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, language, useContext, aiModel })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setInput("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const playTextToSpeech = async (text: string, messageId: number, language?: string) => {
    try {
      setIsPlaying(messageId);
      
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsPlaying(null);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: "Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive",
        });
      };
      
      await audio.play();
    } catch (error) {
      console.error("Text-to-speech error:", error);
      setIsPlaying(null);
      toast({
        title: "Error",
        description: "Failed to generate speech. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessageMutation.mutate({ content: input, language: selectedLanguage, useContext, aiModel: selectedAiModel });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Layout title="AI Chat">
      <div className="h-full flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && !isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div className="bg-card rounded-lg p-4 max-w-3xl border border-border">
                  <p className="text-sm text-foreground">
                    Hello! I'm your AI assistant. I can help you with conversations, answer questions, and provide assistance across various topics. How can I help you today?
                  </p>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user"
                    ? "bg-muted"
                    : "bg-gradient-to-br from-primary to-emerald-500"
                }`}>
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Brain className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`rounded-lg p-4 max-w-3xl ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm flex-1">
                      <MessageRenderer 
                        content={message.content} 
                        isAssistant={message.role === "assistant"} 
                      />
                    </div>
                    {message.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 flex-shrink-0"
                        onClick={() => playTextToSpeech(message.content, message.id, message.language)}
                        disabled={isPlaying === message.id}
                      >
                        {isPlaying === message.id ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {message.language && message.language !== "English" && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">
                        Language: {message.language}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {sendMessageMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div className="bg-card rounded-lg p-4 max-w-3xl border border-border">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-3 mb-3 items-center flex-wrap gap-2">
              <div className="w-56">
                <Select value={selectedAiModel} onValueChange={setSelectedAiModel}>
                  <SelectTrigger 
                    className="h-10 cursor-pointer transition-colors hover:bg-accent/50"
                    onMouseEnter={() => setCursor('pointer')}
                    onMouseLeave={() => resetCursor()}
                    data-testid="ai-model-select"
                  >
                    <SelectValue placeholder="Select AI Model">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4" />
                        <span>{AI_MODELS.find(m => m.value === selectedAiModel)?.label}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {AI_MODELS.map((model) => (
                      <SelectItem 
                        key={model.value} 
                        value={model.value}
                        className="cursor-pointer"
                        data-testid={`ai-model-${model.value}`}
                      >
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium">{model.label}</span>
                          <span className="text-xs text-muted-foreground">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-52">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger 
                    className="h-10 cursor-pointer transition-colors hover:bg-accent/50"
                    onMouseEnter={() => setCursor('pointer')}
                    onMouseLeave={() => resetCursor()}
                    data-testid="language-select"
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {LANGUAGES.map((lang) => (
                      <SelectItem 
                        key={lang.value} 
                        value={lang.value}
                        className="cursor-pointer"
                        data-testid={`language-${lang.value.toLowerCase()}`}
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="context-memory"
                  checked={useContext}
                  onCheckedChange={setUseContext}
                  className="cursor-pointer"
                  onMouseEnter={() => setCursor('pointer')}
                  onMouseLeave={() => resetCursor()}
                  data-testid="context-memory-toggle"
                />
                <Label 
                  htmlFor="context-memory" 
                  className="text-xs flex items-center space-x-1 cursor-pointer select-none"
                  onMouseEnter={() => setCursor('pointer')}
                  onMouseLeave={() => resetCursor()}
                >
                  <History className="w-3 h-3" />
                  <span>Remember conversation</span>
                </Label>
              </div>
              <div className="text-xs text-muted-foreground flex items-center">
                {selectedAiModel === 'gemini' ? 'Gemini' : 'GPT-4o'} will respond in {selectedLanguage}
              </div>
            </div>
            <div className="flex space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Type your message in ${selectedLanguage}...`}
                    className="pr-12 cursor-text"
                    disabled={sendMessageMutation.isPending}
                    onMouseEnter={() => setCursor('text')}
                    onMouseLeave={() => resetCursor()}
                    data-testid="chat-input"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 cursor-pointer transition-colors hover:bg-accent/50"
                    onClick={handleSend}
                    disabled={!input.trim() || sendMessageMutation.isPending}
                    onMouseEnter={() => setCursor('pointer')}
                    onMouseLeave={() => resetCursor()}
                    data-testid="send-button"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>Click the speaker icon on AI messages to hear them spoken aloud</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
