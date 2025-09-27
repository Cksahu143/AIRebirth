import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageRenderer } from "@/components/MessageRenderer";
import { Brain, Search, Globe, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  id?: number;
  query: string;
  analysisType: string;
  result: string;
  timestamp?: string;
  sources?: string[];
}

export default function DeepAnalyzer() {
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [analysisType, setAnalysisType] = useState("deep");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analyses = [] } = useQuery<AnalysisResult[]>({
    queryKey: ["/api/analysis/history"],
  });

  const deepAnalysisMutation = useMutation({
    mutationFn: async (data: { query: string; type: string }) => {
      return await apiRequest("POST", "/api/analysis/deep", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analysis/history"] });
      setQuery("");
      toast({ title: "Analysis completed successfully!" });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const webSearchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      return await apiRequest("POST", "/api/search/web", { query: searchQuery });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analysis/history"] });
      setQuery("");
      toast({ title: "Web search completed!" });
    },
    onError: (error) => {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const urlAnalysisMutation = useMutation({
    mutationFn: async (targetUrl: string) => {
      return await apiRequest("POST", "/api/analysis/url", { url: targetUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analysis/history"] });
      setUrl("");
      toast({ title: "URL analysis completed!" });
    },
    onError: (error) => {
      toast({
        title: "URL analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeepAnalysis = () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a query",
        variant: "destructive",
      });
      return;
    }
    deepAnalysisMutation.mutate({ query: query.trim(), type: analysisType });
  };

  const handleWebSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }
    webSearchMutation.mutate(query.trim());
  };

  const handleUrlAnalysis = () => {
    if (!url.trim()) {
      toast({
        title: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }
    urlAnalysisMutation.mutate(url.trim());
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "deep":
      case "research":
        return <Brain className="h-4 w-4" />;
      case "web-search":
        return <Search className="h-4 w-4" />;
      case "url-analysis":
        return <Globe className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getAnalysisColor = (type: string) => {
    switch (type) {
      case "deep":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "research":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "web-search":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "url-analysis":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const isLoading = deepAnalysisMutation.isPending || webSearchMutation.isPending || urlAnalysisMutation.isPending;

  return (
    <Layout title="Deep AI Analyzer">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Deep AI Analyzer</h1>
              <p className="text-muted-foreground">Advanced AI tools for deep thinking, research, and web analysis</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Analysis Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Analysis Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={analysisType} onValueChange={setAnalysisType}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="deep" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    Deep Think
                  </TabsTrigger>
                  <TabsTrigger value="research" className="text-xs">
                    <Search className="h-3 w-3 mr-1" />
                    Research
                  </TabsTrigger>
                  <TabsTrigger value="critical" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Critical
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="deep" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deep-query">Deep Analysis Query</Label>
                    <Textarea
                      id="deep-query"
                      placeholder="Enter a complex question or topic for deep analysis..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      AI will spend extended time analyzing your query from multiple angles
                    </p>
                  </div>
                  <Button 
                    onClick={handleDeepAnalysis} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {deepAnalysisMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Thinking deeply...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Start Deep Analysis
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="research" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="research-query">Research Query</Label>
                    <Textarea
                      id="research-query"
                      placeholder="Enter a topic for comprehensive research..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      AI will conduct thorough research using multiple knowledge sources
                    </p>
                  </div>
                  <Button 
                    onClick={handleDeepAnalysis} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {deepAnalysisMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Start Research
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="critical" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="critical-query">Critical Analysis Query</Label>
                    <Textarea
                      id="critical-query"
                      placeholder="Enter a statement, argument, or claim for critical evaluation..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      AI will critically evaluate arguments, identify biases, and assess validity
                    </p>
                  </div>
                  <Button 
                    onClick={handleDeepAnalysis} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {deepAnalysisMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing critically...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Start Critical Analysis
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Web Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Web Research Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Web Search */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="web-search">Web Search & Real-time Info</Label>
                  <Textarea
                    id="web-search"
                    placeholder="Search the web for current information..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <Button 
                  onClick={handleWebSearch} 
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {webSearchMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching web...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Web
                    </>
                  )}
                </Button>
              </div>

              {/* URL Analysis */}
              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url-input">URL Analysis & Summarization</Label>
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Analyze and summarize any webpage content
                  </p>
                </div>
                <Button 
                  onClick={handleUrlAnalysis} 
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {urlAnalysisMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing URL...
                    </>
                  ) : (
                    <>
                      <Globe className="mr-2 h-4 w-4" />
                      Analyze URL
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Analysis History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No analyses yet. Start your first deep analysis above!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {analyses.slice(0, 10).map((analysis, index) => (
                  <div key={analysis.id || index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Badge variant="secondary" className={getAnalysisColor(analysis.analysisType)}>
                          <div className="flex items-center space-x-1">
                            {getAnalysisIcon(analysis.analysisType)}
                            <span className="capitalize">{analysis.analysisType.replace('-', ' ')}</span>
                          </div>
                        </Badge>
                        <p className="font-medium text-sm">{analysis.query}</p>
                        {analysis.timestamp && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(analysis.timestamp).toLocaleDateString()} at{' '}
                            {new Date(analysis.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    </div>
                    
                    <div className="border-t pt-3">
                      <MessageRenderer content={analysis.result} />
                    </div>

                    {analysis.sources && analysis.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Sources:</p>
                        <div className="space-y-1">
                          {analysis.sources.map((source, i) => (
                            <a
                              key={i}
                              href={source}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline block truncate"
                            >
                              {source}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}