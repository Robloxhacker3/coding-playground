'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Lightbulb, X } from 'lucide-react'

interface CopilotSuggestionsProps {
  onClose: () => void
  currentFileContent: string | undefined
  onCodeInsert: (code: string) => void
}

const mockSuggestions = [
  {
    id: '1',
    title: 'Add a simple HTML structure',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Page</title>
</head>
<body>
  <h1>Hello from Copilot!</h1>
</body>
</html>`,
    language: 'html',
  },
  {
    id: '2',
    title: 'Basic CSS reset',
    code: `/* Basic CSS Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  line-height: 1.5;
  color: #333;
}`,
    language: 'css',
  },
  {
    id: '3',
    title: 'JavaScript DOMContentLoaded listener',
    code: `document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  // Your code here
});`,
    language: 'javascript',
  },
  {
    id: '4',
    title: 'React functional component template',
    code: `import React from 'react';

interface MyComponentProps {
  message: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ message }) => {
  return (
    <div>
      <h2>{message}</h2>
      <p>This is a functional component.</p>
    </div>
  );
};

export default MyComponent;`,
    language: 'typescriptreact',
  },
];

export function CopilotSuggestions({ onClose, currentFileContent, onCodeInsert }: CopilotSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<typeof mockSuggestions>([]);

  useEffect(() => {
    // Simulate fetching suggestions based on current file content or context
    // For now, just use mock suggestions
    setSuggestions(mockSuggestions);
  }, [currentFileContent]);

  return (
    <Card className="h-full flex flex-col bg-[--background] text-[--foreground] border-l border-[--border] rounded-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Lightbulb className="w-5 h-5 mr-2" /> Copilot Suggestions
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="w-7 h-7">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        <ScrollArea className="h-full pr-4">
          {suggestions.length === 0 ? (
            <p className="text-center text-[--muted-foreground] py-4">No suggestions available.</p>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border border-[--border] rounded-md p-3 bg-[--card]">
                  <h3 className="font-medium text-[--foreground] mb-2">{suggestion.title}</h3>
                  <pre className="bg-[--muted] text-[--muted-foreground] p-2 rounded-sm text-xs overflow-x-auto mb-2">
                    <code>{suggestion.code.substring(0, 100)}...</code>
                  </pre>
                  <Button
                    size="sm"
                    onClick={() => onCodeInsert(suggestion.code)}
                    className="w-full bg-[--primary] hover:bg-[--secondary] text-[--primary-foreground]"
                  >
                    Insert Code
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
