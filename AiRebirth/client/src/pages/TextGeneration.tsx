import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, FileText, Megaphone, PenTool, Copy, Download } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { GeneratedText } from "@/types";
import { useToast } from "@/hooks/use-toast";

const templates = [
  { id: "email", name: "Email", icon: Mail, description: "Generate professional emails" },
  { id: "blog", name: "Blog Post", icon: FileText, description: "Create engaging blog content" },
  { id: "marketing", name: "Marketing", icon: Megaphone, description: "Marketing copy and ads" },
];

const tones = ["Professional", "Casual", "Friendly", "Formal", "Creative"];

export default function TextGeneration() {
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState("Paragraph");
  const [length, setLength] = useState("Short (100-200 words)");
  const [tone, setTone] = useState("Professional");
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  const { data: texts = [] } = useQuery<GeneratedText[]>({
    queryKey: ["/api/texts"],
    queryFn: api.getGeneratedTexts,
  });

  const generateTextMutation = useMutation({
    mutationFn: () => api.generateText(prompt, contentType, tone, length),
    onSuccess: (response) => {
      const data = response.json();
      data.then((result) => {
        setGeneratedContent(result.generatedText);
        queryClient.invalidateQueries({ queryKey: ["/api/texts"] });
        toast({
          title: "Success",
          description: "Text generated successfully!",
        });
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate text. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic or keywords.",
        variant: "destructive",
      });
      return;
    }
    generateTextMutation.mutate();
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      toast({
        title: "Copied",
        description: "Content copied to clipboard",
      });
    }
  };

  const handleDownload = () => {
    if (generatedContent) {
      const blob = new Blob([generatedContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-text-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setContentType(templateId === "email" ? "Email" : templateId === "blog" ? "Article" : "Marketing Copy");
  };

  return (
    <Layout title="Text Generation">
      <div className="h-full p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Templates */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Text Generation Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <template.icon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generation Form */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Generate Content</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt" className="text-sm font-medium">Topic/Keywords</Label>
                  <Input
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter keywords or topic..."
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contentType" className="text-sm font-medium">Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paragraph">Paragraph</SelectItem>
                        <SelectItem value="Article">Article</SelectItem>
                        <SelectItem value="Summary">Summary</SelectItem>
                        <SelectItem value="List">List</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Marketing Copy">Marketing Copy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="length" className="text-sm font-medium">Length</Label>
                    <Select value={length} onValueChange={setLength}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Short (100-200 words)">Short (100-200 words)</SelectItem>
                        <SelectItem value="Medium (200-500 words)">Medium (200-500 words)</SelectItem>
                        <SelectItem value="Long (500+ words)">Long (500+ words)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tone</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tones.map((toneOption) => (
                      <Button
                        key={toneOption}
                        variant={tone === toneOption ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTone(toneOption)}
                      >
                        {toneOption}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={generateTextMutation.isPending || !prompt.trim()}
                  className="w-full"
                >
                  {generateTextMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <PenTool className="w-4 h-4 mr-2" />
                      Generate Text
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Content */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Generated Content</h3>
                {generatedContent && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <div className="p-4 bg-muted/50 rounded-lg border min-h-40">
                  {generateTextMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      <span className="text-muted-foreground">Generating content...</span>
                    </div>
                  ) : generatedContent ? (
                    <p className="text-foreground whitespace-pre-wrap">{generatedContent}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Generated content will appear here...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Generations */}
          {texts.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Generations</h3>
                <div className="space-y-4">
                  {texts.slice(0, 3).map((text) => (
                    <div key={text.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{text.contentType}</span>
                          <span className="text-xs bg-muted px-2 py-1 rounded">{text.tone}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(text.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Prompt: {text.prompt}</p>
                      <p className="text-sm line-clamp-3">{text.generatedText}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
