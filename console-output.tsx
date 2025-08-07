'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Terminal, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

interface ConsoleLog {
  type: 'log' | 'error' | 'warn'
  content: string
  timestamp: Date
}

interface ConsoleOutputProps {
  logs: ConsoleLog[]
  onClearLogs: () => void
}

export function ConsoleOutput({ logs, onClearLogs }: ConsoleOutputProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [logs, scrollToBottom])

  return (
    <div className="h-full flex flex-col bg-[--background] text-[--foreground]">
      <div className="h-10 bg-[--muted] border-b border-[--border] flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold flex items-center">
          <Terminal className="w-4 h-4 mr-2" /> Console Output
        </h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearLogs}
          className="h-7 px-2 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--muted]"
          title="Clear Console"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-2" viewportRef={scrollAreaRef}>
        <div className="space-y-1 text-sm">
          {logs.length === 0 ? (
            <p className="text-[--muted-foreground]">No console output yet.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-[--muted-foreground] min-w-[60px] text-right">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span
                  className={`${
                    log.type === 'error' ? 'text-red-500' :
                    log.type === 'warn' ? 'text-yellow-500' :
                    'text-[--foreground]'
                  }`}
                >
                  {log.content}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
