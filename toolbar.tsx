'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Play, Square, Settings, Bot, Package, Upload, Download, Save, FileText, Users, Share2, LogIn, History, Cloud, MoreVertical } from 'lucide-react'
import { useRef } from 'react'

interface ToolbarProps {
  onRun: () => void
  isRunning: boolean
  onShowSettings: () => void
  onShowAI: () => void
  onShowExtensions: () => void
  onShowCollaborators: () => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onExport: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
  onShareProject: () => void
  onSaveSharedChanges: () => void
  onSaveVersion: () => void
  onShowHistory: () => void
  onShowLogin: () => void
  sharedProjectId: string | null
  loggedInUser: string | null
  lastSaved: Date | null
}

export function Toolbar({ 
  onRun, 
  isRunning, 
  onShowSettings, 
  onShowAI, 
  onShowExtensions,
  onShowCollaborators,
  onFileUpload,
  onExport,
  onImport,
  onShareProject,
  onSaveSharedChanges,
  onSaveVersion,
  onShowHistory,
  onShowLogin,
  sharedProjectId,
  loggedInUser,
  lastSaved
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="h-12 bg-[--background] border-b border-[--border] flex items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 font-semibold text-[--primary]">CodePlayground</div>
        {lastSaved && (
          <Badge variant="outline" className="text-xs border-[--border] text-[--muted-foreground]">
            Saved {lastSaved.toLocaleTimeString()}
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Run Controls - Always visible */}
        <Button
          size="sm"
          onClick={onRun}
          className="bg-[--primary] hover:bg-[--secondary] text-[--primary-foreground] h-8 px-3"
          disabled={isRunning}
        >
          {isRunning ? <Square className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {isRunning ? 'Running...' : 'Run'}
        </Button>

        {/* Login / Account - Always visible */}
        <Button size="sm" variant="outline" onClick={onShowLogin} className="border-[--border] text-[--foreground] hover:bg-[--muted] h-8 px-3">
          <LogIn className="w-4 h-4 mr-1" />
          {loggedInUser ? loggedInUser : 'Login'}
        </Button>

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="border-[--border] text-[--foreground] hover:bg-[--muted] h-8 px-3">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* File Operations */}
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload File(s)
            </DropdownMenuItem>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={onFileUpload}
              multiple
              accept=".js,.ts,.html,.css,.json,.md,.txt,.jsx,.tsx,.py,.java,.cpp,.c,.go,.rs,.php,.rb,.sh,.yml,.yaml,.xml,.sql,image/*,audio/*,video/*"
            />
            <DropdownMenuItem onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => importInputRef.current?.click()}>
              <FileText className="w-4 h-4 mr-2" />
              Import Project
            </DropdownMenuItem>
            <input
              ref={importInputRef}
              type="file"
              className="hidden"
              onChange={onImport}
              accept=".json"
            />

            <DropdownMenuSeparator />

            {/* Collaboration & AI */}
            <DropdownMenuItem onClick={onShowCollaborators}>
              <Users className="w-4 h-4 mr-2" />
              Collaborate
            </DropdownMenuItem>
            {sharedProjectId ? (
              <DropdownMenuItem onClick={onSaveSharedChanges}>
                <Save className="w-4 h-4 mr-2" />
                Save Shared Changes
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={onShareProject}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Project
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onShowAI}>
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Project History & Cloud Save */}
            <DropdownMenuItem onClick={onSaveVersion}>
              <History className="w-4 h-4 mr-2" />
              Save Version
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShowHistory}>
              <History className="w-4 h-4 mr-2" />
              View History
            </DropdownMenuItem>
            {loggedInUser && (
              <DropdownMenuItem onClick={() => { /* Simulate cloud save */ }}>
                <Cloud className="w-4 h-4 mr-2" />
                Cloud Save
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Settings & Extensions */}
            <DropdownMenuItem onClick={onShowExtensions}>
              <Package className="w-4 h-4 mr-2" />
              Extensions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShowSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
