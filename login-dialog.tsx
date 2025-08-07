'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, LogOut, User } from 'lucide-react'

interface LoginDialogProps {
  onClose: () => void
  onLogin: (username: string) => void
  onLogout: () => void
  loggedInUser: string | null
}

export function LoginDialog({ onClose, onLogin, onLogout, loggedInUser }: LoginDialogProps) {
  const [username, setUsername] = useState('')

  const handleLoginClick = () => {
    if (username.trim()) {
      onLogin(username.trim())
      onClose()
    }
  }

  const handleLogoutClick = () => {
    onLogout()
    setUsername('')
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[--background] text-[--foreground] border-[--border]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" /> Account
          </DialogTitle>
          <DialogDescription>
            {loggedInUser ? `Logged in as ${loggedInUser}.` : 'Log in to save your projects to your account.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {loggedInUser ? (
            <div className="text-center text-lg font-semibold">
              Welcome, {loggedInUser}!
            </div>
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3 bg-[--input] border-[--border] focus-visible:ring-offset-0 focus-visible:ring-0"
                placeholder="e.g., dev_master"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLoginClick();
                  }
                }}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          {loggedInUser ? (
            <Button onClick={handleLogoutClick} variant="destructive">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          ) : (
            <Button onClick={handleLoginClick} disabled={!username.trim()}>
              <LogIn className="w-4 h-4 mr-2" /> Login
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
