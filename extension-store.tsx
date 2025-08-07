'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Package, Search } from 'lucide-react'

interface Extension {
  id: string
  name: string
  description: string
  enabled: boolean
  config?: any
}

interface ExtensionStoreProps {
  onClose: () => void
  onExtensionsChange: (extensions: Extension[]) => void
}

const mockExtensions: Extension[] = [
  {
    id: 'prettier',
    name: 'Code Formatter (Prettier)',
    description: 'Automatically formats your code for consistency.',
    enabled: false,
  },
  {
    id: 'linting',
    name: 'Linting (ESLint)',
    description: 'Highlights potential errors and stylistic issues.',
    enabled: false,
  },
  {
    id: 'autocomplete',
    name: 'Intelligent Autocomplete',
    description: 'Provides smart code suggestions as you type.',
    enabled: true, // Default enabled
  },
  {
    id: 'git-integration',
    name: 'Git Integration',
    description: 'Basic Git commands and status indicators.',
    enabled: false,
  },
  {
    id: 'live-share',
    name: 'Live Share',
    description: 'Collaborate in real-time with others.',
    enabled: false,
  },
]

export function ExtensionStore({ onClose, onExtensionsChange }: ExtensionStoreProps) {
  const [extensions, setExtensions] = useState<Extension[]>(mockExtensions)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Load saved extension states from localStorage on mount
    const savedExtensions = localStorage.getItem('codeplayground_extensions')
    if (savedExtensions) {
      const parsed = JSON.parse(savedExtensions)
      setExtensions(prev => prev.map(ext => {
        const saved = parsed.find((s: Extension) => s.id === ext.id)
        return saved ? { ...ext, enabled: saved.enabled } : ext
      }))
    }
  }, [])

  useEffect(() => {
    // Save extension states to localStorage whenever they change
    localStorage.setItem('codeplayground_extensions', JSON.stringify(extensions))
    onExtensionsChange(extensions)
  }, [extensions, onExtensionsChange])

  const handleToggleExtension = (id: string) => {
    setExtensions(prev =>
      prev.map(ext =>
        ext.id === id ? { ...ext, enabled: !ext.enabled } : ext
      )
    )
  }

  const filteredExtensions = extensions.filter(ext =>
    ext.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ext.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[--background] text-[--foreground] border-[--border]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" /> Extension Store
          </DialogTitle>
          <DialogDescription>
            Browse and manage extensions for your code playground.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[--muted-foreground]" />
            <Input
              placeholder="Search extensions..."
              className="pl-8 bg-[--input] border-[--border] focus-visible:ring-offset-0 focus-visible:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {filteredExtensions.length === 0 && (
              <p className="text-center text-[--muted-foreground]">No extensions found.</p>
            )}
            {filteredExtensions.map(ext => (
              <div key={ext.id} className="flex items-center justify-between p-3 border border-[--border] rounded-md bg-[--card]">
                <div>
                  <h3 className="font-semibold text-[--foreground]">{ext.name}</h3>
                  <p className="text-sm text-[--muted-foreground]">{ext.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`toggle-${ext.id}`} className="sr-only">
                    {ext.enabled ? 'Disable' : 'Enable'} {ext.name}
                  </Label>
                  <Switch
                    id={`toggle-${ext.id}`}
                    checked={ext.enabled}
                    onCheckedChange={() => handleToggleExtension(ext.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
