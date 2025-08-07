'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Share2, Copy, RefreshCw } from 'lucide-react'
import Image from 'next/image'

interface CollaboratorsProps {
  onClose: () => void
  onShareProject: () => void
  onPullSharedChanges: () => void
  sharedProjectId: string | null
}

const mockAvatars = [
  '/alice-avatar.png',
  '/bob-avatar.png',
  '/charlie-avatar.png',
  '/diana-avatar.png',
  '/eve-online-avatar.png',
]

export function Collaborators({ onClose, onShareProject, onPullSharedChanges, sharedProjectId }: CollaboratorsProps) {
  const [collaborators, setCollaborators] = useState([
    { id: '1', name: 'Alice', avatar: mockAvatars[0], status: 'online' },
    { id: '2', name: 'Bob', avatar: mockAvatars[1], status: 'offline' },
    { id: '3', name: 'Charlie', avatar: mockAvatars[2], status: 'online' },
  ])

  const shareLink = sharedProjectId ? `${window.location.origin}?sharedId=${sharedProjectId}` : 'Generate a link to share'

  const copyShareLink = () => {
    if (sharedProjectId) {
      navigator.clipboard.writeText(shareLink)
      // You might want to add a toast notification here
      alert('Share link copied to clipboard!')
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[--background] text-[--foreground] border-[--border]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" /> Collaborate
          </DialogTitle>
          <DialogDescription>
            Manage collaborators and share your project. (Client-side simulation)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="share-link">Share Project Link</Label>
            <div className="flex space-x-2">
              <Input
                id="share-link"
                readOnly
                value={shareLink}
                className="flex-1 bg-[--input] border-[--border]"
              />
              <Button onClick={onShareProject} disabled={!!sharedProjectId}>
                <Share2 className="w-4 h-4 mr-2" /> Generate Link
              </Button>
              <Button onClick={copyShareLink} disabled={!sharedProjectId}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {sharedProjectId && (
              <p className="text-sm text-[--muted-foreground]">
                Share this link with others to collaborate. Changes are saved to your browser's local storage.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Collaborators in this session</Label>
            <div className="flex items-center space-x-4">
              {collaborators.map(collab => (
                <div key={collab.id} className="flex flex-col items-center">
                  <div className="relative">
                    <Image
                      src={collab.avatar || "/placeholder.svg"}
                      alt={collab.name}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-[--border]"
                    />
                    <span
                      className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-[--background] ${
                        collab.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-[--muted-foreground] mt-1">{collab.name}</span>
                </div>
              ))}
              <Image
                src="/diverse-user-avatars.png"
                alt="More users"
                width={40}
                height={40}
                className="rounded-full border-2 border-[--border] opacity-70"
              />
            </div>
            <p className="text-sm text-[--muted-foreground]">
              (Simulated: Real-time presence requires a backend.)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Sync Shared Project</Label>
            <div className="flex space-x-2">
              <Button onClick={onPullSharedChanges} disabled={!sharedProjectId}>
                <RefreshCw className="w-4 h-4 mr-2" /> Pull Latest Changes
              </Button>
              <p className="text-sm text-[--muted-foreground] flex items-center">
                (Pulls changes from the shared link's last save in your browser's storage.)
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
