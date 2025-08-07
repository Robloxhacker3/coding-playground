'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Send, X, Code, Loader2 } from 'lucide-react'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

interface FileItem { // Defined FileItem interface for correct typing
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileItem[]
  path: string
}

interface AIAssistantProps {
  onClose: () => void
  currentFile: FileItem | null // Corrected type
  onCodeInsert: (code: string) => void
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isCode?: boolean
}

export function AIAssistant({ onClose, currentFile, onCodeInsert }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === '') return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      let prompt = input
      if (currentFile && currentFile.content) {
        prompt = `Given the current file "${currentFile.name}" (language: ${currentFile.language || 'unknown'}) with content:\n\`\`\`${currentFile.language || ''}\n${currentFile.content}\n\`\`\`\n\nUser query: ${input}`
      }

      const { text } = await generateText({
        model: openai("gpt-4o"), // Using gpt-4o as per instructions
        prompt: prompt,
      })

      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: text }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error generating text:', error)
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I could not process your request. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsertCode = (code: string) => {
    onCodeInsert(code)
    onClose() // Close AI assistant after inserting code
  }

  return (
    <Card className="h-full flex flex-col bg-[--background] text-[--foreground] border-l border-[--border] rounded-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Bot className="w-5 h-5 mr-2" /> AI Assistant
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="w-7 h-7">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-[--primary] text-[--primary-foreground]'
                      : 'bg-[--muted] text-[--muted-foreground]'
                  }`}
                >
                  {msg.isCode ? (
                    <pre className="bg-[--background] p-2 rounded-md overflow-x-auto text-sm">
                      <code>{msg.content}</code>
                    </pre>
                  ) : (
                    msg.content
                  )}
                  {msg.role === 'assistant' && msg.content.includes('\`\`\`') && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2 w-full"
                      onClick={() => {
                        const codeMatch = msg.content.match(/\`\`\`(?:\w+)?\n([\s\S]*?)\n\`\`\`/)
                        if (codeMatch && codeMatch[1]) {
                          handleInsertCode(codeMatch[1])
                        }
                      }}
                    >
                      <Code className="w-4 h-4 mr-2" /> Insert Code
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-[--muted] text-[--muted-foreground] flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Ask the AI assistant..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[--input] border-[--border] focus-visible:ring-offset-0 focus-visible:ring-0"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
