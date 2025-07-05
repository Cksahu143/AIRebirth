import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles, Download } from "lucide-react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { GeneratedImage } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function ImageGeneration() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [style, setStyle] = useState("Realistic");
  const { toast } = useToast();

  const { data: images = [], isLoading } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/images"],
    queryFn: api.getGeneratedImages,
  });

  const generateImageMutation = useMutation({
    mutationFn: () => api.generateImage(prompt, size, style),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      setPrompt("");
      toast({
        title: "Success",
        description: "Image generated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for image generation.",
        variant: "destructive",
      });
      return;
    }
    generateImageMutation.mutate();
  };

  const handleDownload = (imageUrl: string, prompt: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ai-generated-${prompt.slice(0, 20)}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout title="Image Generation">
      <div className="h-full p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Generation Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">AI Image Generation</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="prompt" className="text-sm font-medium">Image Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="size" className="text-sm font-medium">Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">1024x1024</SelectItem>
                        <SelectItem value="512x512">512x512</SelectItem>
                        <SelectItem value="256x256">256x256</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="style" className="text-sm font-medium">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Realistic">Realistic</SelectItem>
                        <SelectItem value="Artistic">Artistic</SelectItem>
                        <SelectItem value="Cartoon">Cartoon</SelectItem>
                        <SelectItem value="Abstract">Abstract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quality" className="text-sm font-medium">Quality</Label>
                    <Select defaultValue="High">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={generateImageMutation.isPending || !prompt.trim()}
                  className="w-full"
                >
                  {generateImageMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Images */}
          {images.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Generated Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="bg-muted rounded-lg p-4 border-2 border-dashed border-border">
                      <img 
                        src={image.imageUrl} 
                        alt={`Generated from: ${image.prompt}`}
                        className="w-full aspect-square object-cover rounded-lg mb-3"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {new Date(image.timestamp).toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(image.imageUrl, image.prompt)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 truncate">
                        {image.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {images.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No images generated yet. Create your first AI image above!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
