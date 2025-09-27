import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Image, Languages, FileText, Code, LogOut } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`;
    }
    if (firstName) return firstName[0];
    if ((user as any)?.email) return (user as any).email[0];
    return "U";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-emerald-500 rounded-full flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={(user as any)?.profileImageUrl || ""} alt="Profile" />
                <AvatarFallback>{getInitials((user as any)?.firstName, (user as any)?.lastName)}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">
                  {(user as any)?.firstName && (user as any)?.lastName 
                    ? `${(user as any).firstName} ${(user as any).lastName}`
                    : (user as any)?.email || "Welcome!"
                  }
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Your AI Assistant
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our powerful AI tools to boost your productivity and creativity.
          </p>
        </div>

        {/* AI Tools Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link href="/chat">
            <Card className="cursor-pointer border-border hover:shadow-lg transition-all hover:scale-105 group">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle>AI Chat</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Have intelligent conversations with our advanced AI assistant
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/image-generation">
            <Card className="cursor-pointer border-border hover:shadow-lg transition-all hover:scale-105 group">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Image className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Image Generation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Create stunning images from text descriptions
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/translation">
            <Card className="cursor-pointer border-border hover:shadow-lg transition-all hover:scale-105 group">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Languages className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Translation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Translate text between multiple languages instantly
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/text-generation">
            <Card className="cursor-pointer border-border hover:shadow-lg transition-all hover:scale-105 group">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Text Generation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Generate high-quality content for any purpose
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/code-generation">
            <Card className="cursor-pointer border-border hover:shadow-lg transition-all hover:scale-105 group">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Code Generation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Generate code in multiple programming languages
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Placeholder for sixth tool or feature */}
          <Card className="border-dashed border-2 border-muted-foreground/20 flex items-center justify-center min-h-[200px]">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">+</span>
              </div>
              <p className="text-sm text-muted-foreground">More tools coming soon!</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}