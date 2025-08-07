'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Folder, FileText, Plus, Trash2, FolderPlus, FilePlus, ChevronRight, ChevronDown, Edit } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileItem[]
  path: string
}

interface FileExplorerProps {
  files: FileItem[]
  activeFile: FileItem | null
  onFileSelect: (file: FileItem) => void
  onFilesChange: (files: FileItem[]) => void
  onCreateFile: (name: string, type: 'file' | 'folder', parentPath?: string) => FileItem
  onDeleteFile: (fileId: string) => void
}

export function FileExplorer({
  files,
  activeFile,
  onFileSelect,
  onFilesChange,
  onCreateFile,
  onDeleteFile,
}: FileExplorerProps) {
  const [newFileName, setNewFileName] = useState('')
  const [newFileType, setNewFileType] = useState<'file' | 'folder'>('file')
  const [creatingInFolder, setCreatingInFolder] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [editingFileName, setEditingFileName] = useState<string>('')

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'javascript', 'ts': 'typescript', 'jsx': 'javascript', 'tsx': 'typescript',
      'py': 'python', 'html': 'html', 'css': 'css', 'scss': 'scss', 'sass': 'sass',
      'json': 'json', 'md': 'markdown', 'swift': 'swift', 'java': 'java',
      'cpp': 'cpp', 'c': 'c', 'go': 'go', 'rs': 'rust', 'php': 'php', 'rb': 'ruby',
      'sh': 'bash', 'yml': 'yaml', 'yaml': 'yaml', 'xml': 'xml', 'sql': 'sql'
    }
    return languageMap[ext || ''] || 'text'
  }

  const addFileOrFolder = useCallback((type: 'file' | 'folder', parentPath: string) => {
    if (newFileName.trim() === '') return

    const newPath = `${parentPath}${newFileName.trim()}${type === 'folder' ? '/' : ''}`
    const newItem: FileItem = {
      id: Date.now().toString(),
      name: newFileName.trim(),
      type,
      path: newPath,
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined,
      language: type === 'file' ? getLanguageFromExtension(newFileName.trim()) : undefined,
    }

    const addToFileTree = (items: FileItem[], targetPath: string): FileItem[] => {
      if (targetPath === '/') {
        return [...items, newItem]
      }
      return items.map(item => {
        if (item.type === 'folder' && item.path === targetPath) {
          return { ...item, children: [...(item.children || []), newItem] }
        }
        if (item.children) {
          return { ...item, children: addToFileTree(item.children, targetPath) }
        }
        return item
      })
    }

    onFilesChange(addToFileTree(files, parentPath))
    setNewFileName('')
    setCreatingInFolder(null)
    if (type === 'file') {
      onFileSelect(newItem)
    }
    if (type === 'folder') {
      setExpandedFolders(prev => new Set(prev).add(newItem.id))
    }
  }, [newFileName, files, onFilesChange, onFileSelect])

  const handleDelete = useCallback((fileId: string) => {
    onDeleteFile(fileId)
  }, [onDeleteFile])

  const handleRename = useCallback((fileId: string, newName: string) => {
    if (newName.trim() === '') return

    const renameInTree = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.id === fileId) {
          const oldPath = item.path
          const newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + newName.trim() + (item.type === 'folder' ? '/' : '')
          return { ...item, name: newName.trim(), path: newPath }
        }
        if (item.children) {
          return { ...item, children: renameInTree(item.children) }
        }
        return item
      })
    }
    onFilesChange(renameInTree(files))
    setEditingFileId(null)
    setEditingFileName('')
  }, [files, onFilesChange])

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }, [])

  const renderFileTree = useCallback((items: FileItem[], parentPath: string) => {
    const directChildren = items.filter(item => {
      const itemParentPath = item.path.substring(0, item.path.lastIndexOf('/') + 1);
      return itemParentPath === parentPath && item.path !== parentPath;
    });

    return directChildren
      .sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1
        if (a.type === 'file' && b.type === 'folder') return 1
        return a.name.localeCompare(b.name)
      })
      .map(item => (
        <div key={item.id} className="ml-4">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className={`flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-[--accent] ${
                  activeFile?.id === item.id ? 'bg-[--accent] text-[--accent-foreground]' : ''
                }`}
                onClick={() => item.type === 'file' ? onFileSelect(item) : toggleFolder(item.id)}
              >
                {item.type === 'folder' ? (
                  expandedFolders.has(item.id) ? (
                    <ChevronDown className="w-4 h-4 mr-1 text-[--muted-foreground]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-1 text-[--muted-foreground]" />
                  )
                ) : (
                  <FileText className="w-4 h-4 mr-1 text-[--muted-foreground]" />
                )}
                {item.type === 'folder' && <Folder className="w-4 h-4 mr-1 text-[--muted-foreground]" />}
                {editingFileId === item.id ? (
                  <Input
                    value={editingFileName}
                    onChange={(e) => setEditingFileName(e.target.value)}
                    onBlur={() => handleRename(item.id, editingFileName)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRename(item.id, editingFileName)
                      }
                      if (e.key === 'Escape') {
                        setEditingFileId(null)
                        setEditingFileName('')
                      }
                    }}
                    className="h-7 text-sm bg-[--background] border-[--border] focus-visible:ring-offset-0 focus-visible:ring-0"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm">{item.name}</span>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {item.type === 'folder' && (
                <>
                  <ContextMenuItem onClick={() => {
                    setCreatingInFolder(item.path)
                    setNewFileType('file')
                  }}>
                    <FilePlus className="w-4 h-4 mr-2" /> New File
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => {
                    setCreatingInFolder(item.path)
                    setNewFileType('folder')
                  }}>
                    <FolderPlus className="w-4 h-4 mr-2" /> New Folder
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </>
              )}
              <ContextMenuItem onClick={() => {
                setEditingFileId(item.id)
                setEditingFileName(item.name)
              }}>
                <Edit className="w-4 h-4 mr-2" /> Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleDelete(item.id)} className="text-red-500">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {creatingInFolder === item.path && (
            <div className="ml-4 flex items-center py-1">
              {newFileType === 'file' ? (
                <FileText className="w-4 h-4 mr-1 text-[--muted-foreground]" />
              ) : (
                <Folder className="w-4 h-4 mr-1 text-[--muted-foreground]" />
              )}
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={() => addFileOrFolder(newFileType, item.path)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addFileOrFolder(newFileType, item.path)
                  }
                  if (e.key === 'Escape') {
                    setNewFileName('')
                    setCreatingInFolder(null)
                  }
                }}
                placeholder={`New ${newFileType} name`}
                className="h-7 text-sm bg-[--background] border-[--border] focus-visible:ring-offset-0 focus-visible:ring-0"
                autoFocus
              />
            </div>
          )}

          {item.type === 'folder' && expandedFolders.has(item.id) && renderFileTree(items, item.path)}
        </div>
      ))
  }, [activeFile?.id, addFileOrFolder, creatingInFolder, editingFileId, editingFileName, expandedFolders, files, handleDelete, handleRename, newFileName, newFileType, onFileSelect, onFilesChange, toggleFolder])

  return (
    <div className="h-full flex flex-col bg-[--background] border-r border-[--border]">
      <div className="h-10 bg-[--muted] border-b border-[--border] flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-[--foreground]">Files</h2>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCreatingInFolder('/')
              setNewFileType('file')
            }}
            className="h-7 px-2 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--muted]"
            title="New File"
          >
            <FilePlus className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCreatingInFolder('/')
              setNewFileType('folder')
            }}
            className="h-7 px-2 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--muted]"
            title="New Folder"
          >
            <FolderPlus className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-2">
        {renderFileTree(files, '/')}
        {creatingInFolder === '/' && (
          <div className="flex items-center py-1">
            {newFileType === 'file' ? (
              <FileText className="w-4 h-4 mr-1 text-[--muted-foreground]" />
            ) : (
              <Folder className="w-4 h-4 mr-1 text-[--muted-foreground]" />
            )}
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={() => addFileOrFolder(newFileType, '/')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addFileOrFolder(newFileType, '/')
                }
                if (e.key === 'Escape') {
                  setNewFileName('')
                  setCreatingInFolder(null)
                }
              }}
              placeholder={`New ${newFileType} name`}
              className="h-7 text-sm bg-[--background] border-[--border] focus-visible:ring-offset-0 focus-visible:ring-0"
              autoFocus
            />
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
