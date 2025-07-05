import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Chat from "@/pages/Chat";
import ImageGeneration from "@/pages/ImageGeneration";
import Translation from "@/pages/Translation";
import TextGeneration from "@/pages/TextGeneration";
import CodeGeneration from "@/pages/CodeGeneration";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Chat} />
      <Route path="/image-generation" component={ImageGeneration} />
      <Route path="/translation" component={Translation} />
      <Route path="/text-generation" component={TextGeneration} />
      <Route path="/code-generation" component={CodeGeneration} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
