import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, Copy } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Translation as TranslationType } from "@/types";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: "auto", name: "Auto-detect" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "ru", name: "Russian" },
];

export default function Translation() {
  const [sourceText, setSourceText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");
  const [translatedText, setTranslatedText] = useState("");
  const { toast } = useToast();

  const { data: translations = [] } = useQuery<TranslationType[]>({
    queryKey: ["/api/translations"],
    queryFn: api.getTranslations,
  });

  const translateMutation = useMutation({
    mutationFn: () => api.translateText(sourceText, sourceLang, targetLang),
    onSuccess: (response) => {
      const data = response.json();
      data.then((result) => {
        setTranslatedText(result.translatedText);
        queryClient.invalidateQueries({ queryKey: ["/api/translations"] });
        toast({
          title: "Success",
          description: "Text translated successfully!",
        });
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to translate text. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTranslate = () => {
    if (!sourceText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate.",
        variant: "destructive",
      });
      return;
    }
    translateMutation.mutate();
  };

  const handleSwapLanguages = () => {
    if (sourceLang !== "auto") {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const handleCopyTranslation = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      toast({
        title: "Copied",
        description: "Translation copied to clipboard",
      });
    }
  };

  return (
    <Layout title="Translation">
      <div className="h-full p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">AI Translation</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Source Text */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">From</Label>
                    <Select value={sourceLang} onValueChange={setSourceLang}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="min-h-64"
                  />
                </div>

                {/* Translated Text */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">To</Label>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.filter(lang => lang.code !== "auto").map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-h-64 p-4 rounded-lg border bg-muted/50 overflow-y-auto">
                    {translateMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                        <span className="text-muted-foreground">Translating...</span>
                      </div>
                    ) : translatedText ? (
                      <p className="text-foreground whitespace-pre-wrap">{translatedText}</p>
                    ) : (
                      <p className="text-muted-foreground italic">Translation will appear here...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwapLanguages}
                    disabled={sourceLang === "auto"}
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Swap Languages
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyTranslation}
                    disabled={!translatedText}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Translation
                  </Button>
                </div>
                <Button 
                  onClick={handleTranslate}
                  disabled={translateMutation.isPending || !sourceText.trim()}
                >
                  {translateMutation.isPending ? "Translating..." : "Translate"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Translations */}
          {translations.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Translations</h3>
                <div className="space-y-4">
                  {translations.slice(0, 5).map((translation) => (
                    <div key={translation.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {languages.find(l => l.code === translation.sourceLang)?.name} → {languages.find(l => l.code === translation.targetLang)?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(translation.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Original:</p>
                          <p className="text-sm">{translation.sourceText}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Translation:</p>
                          <p className="text-sm">{translation.translatedText}</p>
                        </div>
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
