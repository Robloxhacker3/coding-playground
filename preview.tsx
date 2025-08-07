'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, ExternalLink } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileItem[]
  path: string
}

interface PreviewProps {
  files: FileItem[]
  onRefresh: () => void
  onConsoleLog: (log: { type: 'log' | 'error' | 'warn'; content: string; timestamp: Date }) => void
}

export function Preview({ files, onRefresh, onConsoleLog }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const generatePreviewContent = useCallback(() => {
    const htmlFile = files.find(f => f.name === 'index.html' && f.type === 'file')
    const cssFile = files.find(f => f.name === 'style.css' && f.type === 'file')
    const jsFile = files.find(f => f.name === 'script.js' && f.type === 'file')

    let htmlContent = htmlFile?.content || `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
</head>
<body>
  <h1>No index.html found.</h1>
  <p>Create an 'index.html' file to see your web project preview.</p>
</body>
</html>`

    const cssContent = cssFile?.content || ''
    const jsContent = jsFile?.content || ''

    // Inject CSS and JS into HTML if not already linked/scripted
    if (cssContent && !htmlContent.includes('<link rel="stylesheet" href="style.css">')) {
      htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style>\n</head>`)
    }
    if (jsContent && !htmlContent.includes('<script src="script.js">')) {
      htmlContent = htmlContent.replace('</body>', `<script>${jsContent}</script>\n</body>`)
    }

    // Create a Blob URL for the content
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)

    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [files])

  useEffect(() => {
    const cleanup = generatePreviewContent()
    return cleanup
  }, [files, generatePreviewContent])

  const handleIframeLoad = useCallback(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const iframeWindow = iframeRef.current.contentWindow

      // Intercept console logs from the iframe
      const originalConsoleLog = iframeWindow.console.log
      const originalConsoleError = iframeWindow.console.error
      const originalConsoleWarn = iframeWindow.console.warn

      iframeWindow.console.log = (...args: any[]) => {
        onConsoleLog({ type: 'log', content: args.map(String).join(' '), timestamp: new Date() })
        originalConsoleLog.apply(iframeWindow.console, args)
      }
      iframeWindow.console.error = (...args: any[]) => {
        onConsoleLog({ type: 'error', content: args.map(String).join(' '), timestamp: new Date() })
        originalConsoleError.apply(iframeWindow.console, args)
      }
      iframeWindow.console.warn = (...args: any[]) => {
        onConsoleLog({ type: 'warn', content: args.map(String).join(' '), timestamp: new Date() })
        originalConsoleWarn.apply(iframeWindow.console, args)
      }
    }
  }, [onConsoleLog])

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  return (
    <div className="h-full flex flex-col bg-[--background] text-[--foreground]">
      <div className="h-10 bg-[--muted] border-b border-[--border] flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-[--foreground]">Preview</h2>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onRefresh}
            className="h-7 px-2 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--muted]"
            title="Refresh Preview"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={openInNewTab}
            className="h-7 px-2 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--muted]"
            title="Open in New Tab"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-white overflow-hidden">
        {previewUrl ? (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            title="Code Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onLoad={handleIframeLoad}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[--muted-foreground]">
            Loading preview...
          </div>
        )}
      </div>
    </div>
  )
}
