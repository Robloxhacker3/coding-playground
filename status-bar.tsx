'use client'

import { Badge } from '@/components/ui/badge'
import { FileText, Clock } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileItem[]
  path: string
}

interface StatusBarProps {
  activeFile: FileItem | null
  isRunning: boolean
  lastSaved: Date | null
  fileCount: number
}

export function StatusBar({ activeFile, isRunning, lastSaved, fileCount }: StatusBarProps) {
  return (
    <div className="h-8 bg-[--muted] border-t border-[--border] flex items-center justify-between px-4 text-xs text-[--muted-foreground]">
      <div className="flex items-center space-x-4">
        {activeFile ? (
          <span className="flex items-center">
            <FileText className="w-3 h-3 mr-1" />
            {activeFile.name} ({activeFile.language || 'text'})
          </span>
        ) : (
          <span>No file open</span>
        )}
        <span>Files: {fileCount}</span>
      </div>
      <div className="flex items-center space-x-4">
        {isRunning && (
          <Badge variant="secondary" className="bg-green-500 text-white">
            Running
          </Badge>
        )}
        {lastSaved && (
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
        <span>Ready</span>
      </div>
    </div>
  )
}
