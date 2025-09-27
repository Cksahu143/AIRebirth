import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Brain, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DocumentAnalyzer() {
  const [document, setDocument] = useState("");
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const analyzeDocumentMutation = useMutation({
    mutationFn: async ({ text, query }: { text: string; query: string }) => {
      const response = await fetch("/api/documents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: text, question: query })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setAnalysis(result.analysis);
      toast({
        title: "Analysis Complete",
        description: "Document analyzed successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain") {
      toast({
        title: "Unsupported File Type",
        description: "Please upload a .txt file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setDocument(content);
      setIsUploading(false);
      toast({
        title: "File Uploaded",
        description: "Document loaded successfully!",
      });
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Upload Error",
        description: "Failed to read the file",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (!document.trim()) {
      toast({
        title: "No Document",
        description: "Please paste text or upload a document first.",
        variant: "destructive",
      });
      return;
    }

    if (!question.trim()) {
      toast({
        title: "No Question",
        description: "Please enter a question about the document.",
        variant: "destructive",
      });
      return;
    }

    analyzeDocumentMutation.mutate({ text: document, query: question });
  };

  const handleCopy = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      toast({
        title: "Copied",
        description: "Analysis copied to clipboard",
      });
    }
  };

  return (
    <Layout title="Document Analyzer">
      <div className="h-full p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Document Analyzer</h1>
            <p className="text-muted-foreground">Upload or paste documents and ask AI questions about their content</p>
          </div>

          {/* Document Input */}
          <Card>
            <CardHeader>
              <CardTitle>Document Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Upload Text File</Label>
                <div className="mt-2 flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className={`w-8 h-8 mb-4 ${isUploading ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
                      <p className="mb-2 text-sm text-muted-foreground">
                        {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-muted-foreground">TXT files only</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".txt"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              <div className="text-center text-muted-foreground">OR</div>

              <div>
                <Label className="text-sm font-medium">Paste Document Text</Label>
                <Textarea
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  placeholder="Paste your document content here..."
                  className="mt-2 min-h-40"
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Question Input */}
          <Card>
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">What would you like to know about this document?</Label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What are the main points? Summarize this document. What is the author's conclusion?"
                  className="mt-2"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleAnalyze}
                disabled={analyzeDocumentMutation.isPending || !document.trim() || !question.trim()}
                className="w-full"
              >
                {analyzeDocumentMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Analyzing Document...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Document
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {(analysis || analyzeDocumentMutation.isPending) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Analysis Results</CardTitle>
                  {analysis && (
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg border p-4 min-h-32">
                  {analyzeDocumentMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                      <span className="text-muted-foreground">Analyzing document...</span>
                    </div>
                  ) : analysis ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {analysis}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">Analysis results will appear here...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}