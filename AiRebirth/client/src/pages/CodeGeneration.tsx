import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Code, Copy, Download, Play } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { GeneratedCode } from "@/types";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { value: "JavaScript", label: "JavaScript" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "Python", label: "Python" },
  { value: "Java", label: "Java" },
  { value: "C++", label: "C++" },
  { value: "C#", label: "C#" },
  { value: "Go", label: "Go" },
  { value: "Rust", label: "Rust" },
  { value: "PHP", label: "PHP" },
  { value: "Ruby", label: "Ruby" },
  { value: "Swift", label: "Swift" },
  { value: "Kotlin", label: "Kotlin" },
];

const frameworks = [
  { value: "", label: "None" },
  { value: "React", label: "React" },
  { value: "Vue.js", label: "Vue.js" },
  { value: "Angular", label: "Angular" },
  { value: "Express.js", label: "Express.js" },
  { value: "Django", label: "Django" },
  { value: "Flask", label: "Flask" },
  { value: "Spring Boot", label: "Spring Boot" },
  { value: "Laravel", label: "Laravel" },
  { value: "Rails", label: "Rails" },
  { value: "Next.js", label: "Next.js" },
  { value: "Svelte", label: "Svelte" },
];

const complexityLevels = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export default function CodeGeneration() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [framework, setFramework] = useState("");
  const [complexity, setComplexity] = useState("Intermediate");
  const [generatedCode, setGeneratedCode] = useState("");
  const { toast } = useToast();

  const { data: codeHistory = [] } = useQuery<GeneratedCode[]>({
    queryKey: ["/api/code"],
    queryFn: api.getGeneratedCode,
  });

  const generateCodeMutation = useMutation({
    mutationFn: () => api.generateCode(prompt, language, framework, complexity),
    onSuccess: (response) => {
      const data = response.json();
      data.then((result) => {
        setGeneratedCode(result.generatedCode);
        queryClient.invalidateQueries({ queryKey: ["/api/code"] });
        toast({
          title: "Success",
          description: "Code generated successfully!",
        });
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe what code you want to generate.",
        variant: "destructive",
      });
      return;
    }
    generateCodeMutation.mutate();
  };

  const handleCopy = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast({
        title: "Copied",
        description: "Code copied to clipboard",
      });
    }
  };

  const handleDownload = () => {
    if (generatedCode) {
      const fileExtensions: Record<string, string> = {
        "JavaScript": "js",
        "TypeScript": "ts",
        "Python": "py",
        "Java": "java",
        "C++": "cpp",
        "C#": "cs",
        "Go": "go",
        "Rust": "rs",
        "PHP": "php",
        "Ruby": "rb",
        "Swift": "swift",
        "Kotlin": "kt",
      };
      
      const extension = fileExtensions[language] || "txt";
      const blob = new Blob([generatedCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-code-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Layout title="Code Generation">
      <div className="h-full p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Generation Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">AI Code Generation</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="prompt" className="text-sm font-medium">Code Description</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the function, algorithm, or code you want to generate..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="language" className="text-sm font-medium">Programming Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="framework" className="text-sm font-medium">Framework (Optional)</Label>
                    <Select value={framework} onValueChange={setFramework}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frameworks.map((fw) => (
                          <SelectItem key={fw.value} value={fw.value}>
                            {fw.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="complexity" className="text-sm font-medium">Complexity Level</Label>
                    <Select value={complexity} onValueChange={setComplexity}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {complexityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={generateCodeMutation.isPending || !prompt.trim()}
                  className="w-full"
                >
                  {generateCodeMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Generating Code...
                    </>
                  ) : (
                    <>
                      <Code className="w-4 h-4 mr-2" />
                      Generate Code
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Code Display */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Generated Code</h3>
                {generatedCode && (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-950 dark:bg-gray-900 rounded-lg border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-800 border-b border-gray-700">
                  <span className="text-sm text-gray-300 font-mono">{language}</span>
                  {framework && (
                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                      {framework}
                    </span>
                  )}
                </div>
                <div className="p-4 min-h-40 max-h-96 overflow-y-auto">
                  {generateCodeMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                      <span className="text-gray-400">Generating code...</span>
                    </div>
                  ) : generatedCode ? (
                    <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap overflow-x-auto">
                      <code>{generatedCode}</code>
                    </pre>
                  ) : (
                    <p className="text-gray-500 italic">Generated code will appear here...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code History */}
          {codeHistory.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Code Generations</h3>
                <div className="space-y-4">
                  {codeHistory.slice(0, 3).map((code) => (
                    <div key={code.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{code.language}</span>
                          {code.framework && (
                            <span className="text-xs bg-muted px-2 py-1 rounded">{code.framework}</span>
                          )}
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{code.complexity}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(code.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Task: {code.prompt}</p>
                      <div className="bg-muted/50 rounded p-2 text-xs font-mono overflow-x-auto">
                        <code className="line-clamp-3">{code.generatedCode}</code>
                      </div>
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