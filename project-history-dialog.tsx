'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, Download } from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileItem[]
  path: string
}

interface AutoSaveData {
  files: FileItem[]
  activeFileId: string | null
  timestamp: number
  theme: string
}

interface ProjectHistoryDialogProps {
  onClose: () => void
  history: AutoSaveData[]
  onLoadVersion: (version: AutoSaveData) => void
}

export function ProjectHistoryDialog({ onClose, history, onLoadVersion }: ProjectHistoryDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-[--background] text-[--foreground] border-[--border]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <History className="w-5 h-5 mr-2" /> Project History
          </DialogTitle>
          <DialogDescription>
            View and load previous versions of your project. (Saved locally per user)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {history.length === 0 ? (
            <p className="text-center text-[--muted-foreground]">No project history found for this user. Save a version to see it here!</p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {history.map((version, index) => (
                  <div key={index} className="border border-[--border] rounded-md p-4 bg-[--card] flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h3 className="font-semibold text-[--foreground]">Version {history.length - index}</h3>
                      <p className="text-sm text-[--muted-foreground]">
                        Saved on: {new Date(version.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-[--muted-foreground]">
                        Files: {version.files.length}
                        {version.activeFileId && ` | Active: ${version.files.find(f => f.id === version.activeFileId)?.name || 'N/A'}`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onLoadVersion(version)
                        onClose()
                      }}
                      className="mt-3 md:mt-0 bg-[--primary] hover:bg-[--secondary] text-[--primary-foreground]"
                    >
                      <Download className="w-4 h-4 mr-2" /> Load Version
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
