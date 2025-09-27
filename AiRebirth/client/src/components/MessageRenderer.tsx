import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

interface MessageRendererProps {
  content: string;
  isAssistant?: boolean;
}

export function MessageRenderer({ content, isAssistant = false }: MessageRendererProps) {
  const { toast } = useToast();
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());

  const copyToClipboard = async (text: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlocks(prev => new Set(prev).add(blockIndex));
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockIndex);
          return newSet;
        });
      }, 2000);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  const parseMessage = (text: string) => {
    const parts: Array<{ type: 'text' | 'code' | 'multifile'; content: string; data?: any }> = [];
    
    // First, handle multi-file code blocks (```files ... ```)
    const multiFileRegex = /```files\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = multiFileRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Parse the multi-file content
      const filesContent = match[1];
      const files = parseMultiFileContent(filesContent);
      
      parts.push({
        type: 'multifile',
        content: match[0],
        data: files
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      
      // Handle regular code blocks in the remaining text
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let textLastIndex = 0;
      let textMatch;

      while ((textMatch = codeBlockRegex.exec(remainingText)) !== null) {
        // Add text before the match
        if (textMatch.index > textLastIndex) {
          parts.push({
            type: 'text',
            content: remainingText.slice(textLastIndex, textMatch.index)
          });
        }

        parts.push({
          type: 'code',
          content: textMatch[0],
          data: {
            language: textMatch[1] || 'text',
            code: textMatch[2]
          }
        });

        textLastIndex = textMatch.index + textMatch[0].length;
      }

      // Add any remaining text
      if (textLastIndex < remainingText.length) {
        parts.push({
          type: 'text',
          content: remainingText.slice(textLastIndex)
        });
      }
    }

    // If no code blocks were found, treat the entire content as text
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }

    return parts;
  };

  const parseMultiFileContent = (content: string): CodeBlock[] => {
    const files: CodeBlock[] = [];
    const fileRegex = /(?:^|\n)(?:\/\/ |<!-- |# )?(.+?\.(html|css|js|jsx|ts|tsx|py|java|cpp|c|php|rb|go|rs))\s*(?:-->|$)?\n([\s\S]*?)(?=\n(?:\/\/ |<!-- |# ).+?\.|$)/g;
    
    let match;
    while ((match = fileRegex.exec(content)) !== null) {
      const filename = match[1].trim();
      const extension = match[2];
      const code = match[3].trim();
      
      // Map file extensions to language identifiers
      const languageMap: { [key: string]: string } = {
        'html': 'html',
        'css': 'css', 
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'php': 'php',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust'
      };

      files.push({
        filename,
        language: languageMap[extension] || extension,
        code
      });
    }

    return files;
  };

  const renderText = (text: string) => {
    // First handle markdown-style links [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    let processedText = text.replace(markdownLinkRegex, (match, linkText, url) => {
      return `__MARKDOWN_LINK__${linkText}__URL__${url}__END_LINK__`;
    });

    // Then handle plain URLs
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const parts = processedText.split(/(__MARKDOWN_LINK__.*?__END_LINK__|https?:\/\/[^\s]+)/g);
    
    return parts.map((part, index) => {
      // Handle markdown-style links
      if (part.includes('__MARKDOWN_LINK__')) {
        const linkMatch = part.match(/__MARKDOWN_LINK__(.*?)__URL__(.*?)__END_LINK__/);
        if (linkMatch) {
          const [, linkText, url] = linkMatch;
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1"
            >
              {linkText}
              <ExternalLink className="w-3 h-3" />
            </a>
          );
        }
      }
      // Handle plain URLs
      else if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1"
          >
            {part}
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderCodeBlock = (language: string, code: string, blockIndex: number) => (
    <Card className="my-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono text-muted-foreground">
            {language}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(code, blockIndex)}
            className="h-8 px-2"
          >
            {copiedBlocks.has(blockIndex) ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <pre className="bg-muted/30 rounded-md p-4 overflow-x-auto text-sm">
          <code className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </CardContent>
    </Card>
  );

  const renderMultiFileBlock = (files: CodeBlock[], blockIndex: number) => {
    if (files.length === 0) return null;
    
    const defaultTab = files[0]?.filename || '0';

    return (
      <Card className="my-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Code Files
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-auto" style={{ gridTemplateColumns: `repeat(${files.length}, 1fr)` }}>
              {files.map((file) => (
                <TabsTrigger 
                  key={file.filename} 
                  value={file.filename || ''}
                  className="text-xs font-mono"
                >
                  {file.filename}
                </TabsTrigger>
              ))}
            </TabsList>
            {files.map((file, index) => (
              <TabsContent key={file.filename} value={file.filename || ''} className="mt-4">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(file.code, blockIndex * 100 + index)}
                    className="absolute top-2 right-2 h-8 px-2 z-10"
                  >
                    {copiedBlocks.has(blockIndex * 100 + index) ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <pre className="bg-muted/30 rounded-md p-4 pt-12 overflow-x-auto text-sm">
                    <code className={`language-${file.language}`}>
                      {file.code}
                    </code>
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  const parts = parseMessage(content);

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        switch (part.type) {
          case 'text':
            return (
              <div key={index} className="whitespace-pre-wrap leading-relaxed">
                {renderText(part.content)}
              </div>
            );
          case 'code':
            return renderCodeBlock(part.data.language, part.data.code, index);
          case 'multifile':
            return renderMultiFileBlock(part.data, index);
          default:
            return null;
        }
      })}
    </div>
  );
}