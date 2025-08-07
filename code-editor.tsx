'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Copy, Download, Save, Lightbulb, MoreVertical } from 'lucide-react'
import { Editor } from '@monaco-editor/react'
import { useTheme } from './theme-provider'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileItem[]
  path: string
}

interface CodeEditorProps {
  file: FileItem | null
  onFileChange: (file: FileItem) => void
  files: FileItem[]
}

export function CodeEditor({ file, onFileChange, files }: CodeEditorProps) {
  const { monacoTheme } = useTheme()
  const editorRef = useRef(null)

  useEffect(() => {
    // No need to set content state here, Monaco Editor handles its own internal state
    // The `value` prop will control the editor's content.
  }, [file])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    // You can add custom commands or configurations here if needed
  }

  const handleEditorChange = (value: string | undefined) => {
    if (file && value !== undefined) {
      onFileChange({ ...file, content: value })
    }
  }

  const insertTemplate = () => {
    if (!file || !editorRef.current) return

    const templates: { [key: string]: string } = {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Document</title>
   <link rel="stylesheet" href="style.css">
</head>
<body>
   <h1>Hello World!</h1>
   <script src="script.js"></script>
</body>
</html>`,
      css: `/* Reset and base styles */
* {
   margin: 0;
   padding: 0;
   box-sizing: border-box;
}

body {
   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
   line-height: 1.6;
   color: #333;
}

/* Your styles here */`,
      javascript: `// JavaScript code
document.addEventListener('DOMContentLoaded', function() {
   console.log('Page loaded!');
   
   // Your code here
});`,
      typescript: `// TypeScript code
import React from 'react';

interface MyComponentProps {
  name: string;
  age?: number;
}

const MyComponent: React.FC<MyComponentProps> = ({ name, age }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age && <p>You are {age} years old.</p>}
    </div>
  );
};

export default MyComponent;`,
      python: `# Python code
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))
`
    }

    const template = templates[file.language || '']
    if (template) {
      const editor = editorRef.current as any
      editor.setValue(template)
      onFileChange({ ...file, content: template })
    }
  }

  const copyToClipboard = () => {
    if (editorRef.current) {
      const editor = editorRef.current as any
      navigator.clipboard.writeText(editor.getValue())
    }
  }

  const downloadFile = () => {
    if (!file || !editorRef.current) return

    const editor = editorRef.current as any
    const content = editor.getValue()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const saveFile = () => {
    if (file && editorRef.current) {
      const editor = editorRef.current as any
      onFileChange({ ...file, content: editor.getValue() })
    }
  }

  if (!file) {
    return (
      <div className="h-full bg-[--background] flex items-center justify-center">
        <div className="text-center text-[--muted-foreground]">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">Select a file from the explorer or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[--background] flex flex-col relative">
      {/* Editor Header */}
      <div className="h-10 bg-[--muted] border-b border-[--border] flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-[--foreground]">{file.name}</span>
          {file.language && (
            <Badge variant="secondary" className="text-xs bg-[--secondary] text-[--secondary-foreground]">
              {file.language}
            </Badge>
          )}
          <span className="text-xs text-[--muted-foreground]">{file.path}</span>
        </div>

        <div className="flex items-center space-x-1">
          {/* Essential Buttons */}
          <Button
            size="sm"
            variant="ghost"
            onClick={saveFile}
            className="h-7 px-2 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--muted]"
            title="Save file (Ctrl+S)"
          >
            <Save className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={copyToClipboard}
            className="h-7 px-2 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--muted]"
            title="Copy to clipboard"
          >
            <Copy className="w-3 h-3" />
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--muted]" title="More actions">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={insertTemplate}>
                <Lightbulb className="w-4 h-4 mr-2" /> Insert Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadFile}>
                <Download className="w-4 h-4 mr-2" /> Download File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={file.language}
          theme={monacoTheme}
          value={file.content}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: true },
            lineNumbers: 'on',
            wordWrap: 'on',
            tabSize: 2,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            cursorBlinking: 'smooth',
            cursorStyle: 'line',
            renderLineHighlight: 'all',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            padding: {
              top: 10,
              bottom: 10
            },
            lineHeight: 20,
            contextmenu: true,
          }}
        />
      </div>
    </div>
  )
}
