'use client'

import React, { useState, useEffect } from 'react' // Added React import
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog' // Reverted import path
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SettingsIcon, Palette, Code, Globe, Shield, Zap, Save } from 'lucide-react'
import { useTheme } from './theme-provider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface SettingsProps {
  onClose: () => void
  onThemeChange: (theme: string) => void
  currentTheme: string
}

export function Settings({ onClose, onThemeChange, currentTheme }: SettingsProps) {
  const { themes, setTheme: setAppTheme } = useTheme() // Use setAppTheme from context
  const [settings, setSettings] = useState({
    // Editor Settings
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
    theme: currentTheme,
    tabSize: 2,
    wordWrap: true,
    lineNumbers: true,
    minimap: true,
    autoSave: true,

    // Language Settings
    defaultLanguage: 'javascript',
    autoDetectLanguage: true,
    formatOnSave: true,
    linting: true,

    // Terminal Settings
    terminalFontSize: 12,
    terminalTheme: 'dark',
    shellPath: '/bin/bash',

    // AI Settings
    aiProvider: 'gpt-4',
    aiAutoComplete: true,
    aiSuggestions: true,

    // Performance Settings
    maxFileSize: 10,
    previewRefreshRate: 500,
    enableHotReload: true,

    // Security Settings
    sandboxMode: true,
    allowFileUpload: true,
    maxUploadSize: 50
  })

  useEffect(() => {
    setSettings(prev => ({ ...prev, theme: currentTheme }))
  }, [currentTheme])

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = () => {
    localStorage.setItem('codePlaygroundSettings', JSON.stringify(settings))
    setAppTheme(settings.theme) // Use setAppTheme from context
    onClose()
  }

  const resetSettings = () => {
    const defaultSettings = {
      fontSize: 14,
      fontFamily: 'JetBrains Mono',
      theme: 'dark',
      tabSize: 2,
      wordWrap: true,
      lineNumbers: true,
      minimap: true,
      autoSave: true,
      defaultLanguage: 'javascript',
      autoDetectLanguage: true,
      formatOnSave: true,
      linting: true,
      terminalFontSize: 12,
      terminalTheme: 'dark',
      shellPath: '/bin/bash',
      aiProvider: 'gpt-4',
      aiAutoComplete: true,
      aiSuggestions: true,
      maxFileSize: 10,
      previewRefreshRate: 500,
      enableHotReload: true,
      sandboxMode: true,
      allowFileUpload: true,
      maxUploadSize: 50
    }
    setSettings(defaultSettings)
    setAppTheme(defaultSettings.theme) // Use setAppTheme from context
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-[--background] text-[--foreground] border-[--border]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" /> Settings
          </DialogTitle>
          <DialogDescription>
            Configure your code playground preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="theme" className="text-right">
              Theme
            </Label>
            <RadioGroup
              id="theme"
              value={settings.theme}
              onValueChange={(value) => updateSetting('theme', value)}
              className="col-span-3 flex space-x-4"
            >
              {themes.map((t) => (
                <div key={t.name} className="flex items-center space-x-2">
                  <RadioGroupItem value={t.name.toLowerCase()} id={t.name.toLowerCase()} />
                  <Label htmlFor={t.name.toLowerCase()}>{t.name}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <Tabs defaultValue="editor" className="h-full">
            <TabsList className="grid w-full grid-cols-6 bg-[--muted]">
              <TabsTrigger value="editor" className="flex items-center space-x-1 text-[--foreground] data-[state=active]:bg-[--background] data-[state=active]:text-[--primary]">
                <Code className="w-4 h-4" />
                <span>Editor</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center space-x-1 text-[--foreground] data-[state=active]:bg-[--background] data-[state=active]:text-[--primary]">
                <Palette className="w-4 h-4" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="languages" className="flex items-center space-x-1 text-[--foreground] data-[state=active]:bg-[--background] data-[state=active]:text-[--primary]">
                <Globe className="w-4 h-4" />
                <span>Languages</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center space-x-1 text-[--foreground] data-[state=active]:bg-[--background] data-[state=active]:text-[--primary]">
                <Zap className="w-4 h-4" />
                <span>AI</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center space-x-1 text-[--foreground] data-[state=active]:bg-[--background] data-[state=active]:text-[--primary]">
                <Zap className="w-4 h-4" />
                <span>Performance</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-1 text-[--foreground] data-[state=active]:bg-[--background] data-[state=active]:text-[--primary]">
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 h-full overflow-y-auto pr-2">
              <TabsContent value="editor" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fontSize" className="text-[--foreground]">Font Size</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Slider
                          value={[settings.fontSize]}
                          onValueChange={(value) => updateSetting('fontSize', value[0])}
                          max={24}
                          min={10}
                          step={1}
                          className="flex-1 [&>span:first-child]:bg-[--primary] [&>span:first-child>span]:bg-[--primary]"
                        />
                        <span className="w-12 text-sm text-[--foreground]">{settings.fontSize}px</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="fontFamily" className="text-[--foreground]">Font Family</Label>
                      <Select value={settings.fontFamily} onValueChange={(value) => updateSetting('fontFamily', value)}>
                        <SelectTrigger className="mt-2 bg-[--muted] border-[--border] text-[--foreground] [&>span]:text-[--foreground]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[--background] text-[--foreground] border-[--border]">
                          <SelectItem value="JetBrains Mono" className="hover:bg-[--muted]">JetBrains Mono</SelectItem>
                          <SelectItem value="Fira Code" className="hover:bg-[--muted]">Fira Code</SelectItem>
                          <SelectItem value="Source Code Pro" className="hover:bg-[--muted]">Source Code Pro</SelectItem>
                          <SelectItem value="Monaco" className="hover:bg-[--muted]">Monaco</SelectItem>
                          <SelectItem value="Consolas" className="hover:bg-[--muted]">Consolas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tabSize" className="text-[--foreground]">Tab Size</Label>
                      <Select value={settings.tabSize.toString()} onValueChange={(value) => updateSetting('tabSize', parseInt(value))}>
                        <SelectTrigger className="mt-2 bg-[--muted] border-[--border] text-[--foreground] [&>span]:text-[--foreground]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[--background] text-[--foreground] border-[--border]">
                          <SelectItem value="2" className="hover:bg-[--muted]">2 spaces</SelectItem>
                          <SelectItem value="4" className="hover:bg-[--muted]">4 spaces</SelectItem>
                          <SelectItem value="8" className="hover:bg-[--muted]">8 spaces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="wordWrap" className="text-[--foreground]">Word Wrap</Label>
                      <Switch
                        checked={settings.wordWrap}
                        onCheckedChange={(checked) => updateSetting('wordWrap', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="lineNumbers" className="text-[--foreground]">Line Numbers</Label>
                      <Switch
                        checked={settings.lineNumbers}
                        onCheckedChange={(checked) => updateSetting('lineNumbers', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="minimap" className="text-[--foreground]">Minimap</Label>
                      <Switch
                        checked={settings.minimap}
                        onCheckedChange={(checked) => updateSetting('minimap', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoSave" className="text-[--foreground]">Auto Save</Label>
                      <Switch
                        checked={settings.autoSave}
                        onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="editorTheme" className="text-[--foreground]">Editor Theme</Label>
                      <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                        <SelectTrigger className="mt-2 bg-[--muted] border-[--border] text-[--foreground] [&>span]:text-[--foreground]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[--background] text-[--foreground] border-[--border]">
                          {themes.map((t) => (
                            <SelectItem key={t.name} value={t.name.toLowerCase()} className="hover:bg-[--muted]">
                              <div className="flex items-center space-x-2">
                                {/* Removed color swatch as themeColorPalettes is not directly exposed here */}
                                <span>{t.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="terminalTheme" className="text-[--foreground]">Terminal Theme</Label>
                      <Select value={settings.terminalTheme} onValueChange={(value) => updateSetting('terminalTheme', value)}>
                        <SelectTrigger className="mt-2 bg-[--muted] border-[--border] text-[--foreground] [&>span]:text-[--foreground]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[--background] text-[--foreground] border-[--border]">
                          <SelectItem value="dark" className="hover:bg-[--muted]">Dark</SelectItem>
                          <SelectItem value="light" className="hover:bg-[--muted]">Light</SelectItem>
                          <SelectItem value="matrix" className="hover:bg-[--muted]">Matrix</SelectItem>
                          <SelectItem value="retro" className="hover:bg-[--muted]">Retro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="terminalFontSize" className="text-[--foreground]">Terminal Font Size</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Slider
                          value={[settings.terminalFontSize]}
                          onValueChange={(value) => updateSetting('terminalFontSize', value[0])}
                          max={20}
                          min={8}
                          step={1}
                          className="flex-1 [&>span:first-child]:bg-[--primary] [&>span:first-child>span]:bg-[--primary]"
                        />
                        <span className="w-12 text-sm text-[--foreground]">{settings.terminalFontSize}px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="languages" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="defaultLanguage" className="text-[--foreground]">Default Language</Label>
                      <Select value={settings.defaultLanguage} onValueChange={(value) => updateSetting('defaultLanguage', value)}>
                        <SelectTrigger className="mt-2 bg-[--muted] border-[--border] text-[--foreground] [&>span]:text-[--foreground]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[--background] text-[--foreground] border-[--border]">
                          <SelectItem value="javascript" className="hover:bg-[--muted]">JavaScript</SelectItem>
                          <SelectItem value="typescript" className="hover:bg-[--muted]">TypeScript</SelectItem>
                          <SelectItem value="python" className="hover:bg-[--muted]">Python</SelectItem>
                          <SelectItem value="html" className="hover:bg-[--muted]">HTML</SelectItem>
                          <SelectItem value="css" className="hover:bg-[--muted]">CSS</SelectItem>
                          <SelectItem value="java" className="hover:bg-[--muted]">Java</SelectItem>
                          <SelectItem value="swift" className="hover:bg-[--muted]">Swift</SelectItem>
                          <SelectItem value="go" className="hover:bg-[--muted]">Go</SelectItem>
                          <SelectItem value="rust" className="hover:bg-[--muted]">Rust</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoDetectLanguage" className="text-[--foreground]">Auto Detect Language</Label>
                      <Switch
                        checked={settings.autoDetectLanguage}
                        onCheckedChange={(checked) => updateSetting('autoDetectLanguage', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="formatOnSave" className="text-[--foreground]">Format on Save</Label>
                      <Switch
                        checked={settings.formatOnSave}
                        onCheckedChange={(checked) => updateSetting('formatOnSave', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="linting" className="text-[--foreground]">Enable Linting</Label>
                      <Switch
                        checked={settings.linting}
                        onCheckedChange={(checked) => updateSetting('linting', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="aiProvider" className="text-[--foreground]">AI Provider</Label>
                      <Select value={settings.aiProvider} onValueChange={(value) => updateSetting('aiProvider', value)}>
                        <SelectTrigger className="mt-2 bg-[--muted] border-[--border] text-[--foreground] [&>span]:text-[--foreground]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[--background] text-[--foreground] border-[--border]">
                          <SelectItem value="gpt-4" className="hover:bg-[--muted]">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5" className="hover:bg-[--muted]">GPT-3.5</SelectItem>
                          <SelectItem value="claude" className="hover:bg-[--muted]">Claude</SelectItem>
                          <SelectItem value="codex" className="hover:bg-[--muted]">Codex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="aiAutoComplete" className="text-[--foreground]">AI Auto Complete</Label>
                      <Switch
                        checked={settings.aiAutoComplete}
                        onCheckedChange={(checked) => updateSetting('aiAutoComplete', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="aiSuggestions" className="text-[--foreground]">AI Code Suggestions</Label>
                      <Switch
                        checked={settings.aiSuggestions}
                        onCheckedChange={(checked) => updateSetting('aiSuggestions', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="maxFileSize" className="text-[--foreground]">Max File Size (MB)</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Slider
                          value={[settings.maxFileSize]}
                          onValueChange={(value) => updateSetting('maxFileSize', value[0])}
                          max={100}
                          min={1}
                          step={1}
                          className="flex-1 [&>span:first-child]:bg-[--primary] [&>span:first-child>span]:bg-[--primary]"
                        />
                        <span className="w-12 text-sm text-[--foreground]">{settings.maxFileSize}MB</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="previewRefreshRate" className="text-[--foreground]">Preview Refresh Rate (ms)</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Slider
                          value={[settings.previewRefreshRate]}
                          onValueChange={(value) => updateSetting('previewRefreshRate', value[0])}
                          max={2000}
                          min={100}
                          step={100}
                          className="flex-1 [&>span:first-child]:bg-[--primary] [&>span:first-child>span]:bg-[--primary]"
                        />
                        <span className="w-16 text-sm text-[--foreground]">{settings.previewRefreshRate}ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableHotReload" className="text-[--foreground]">Enable Hot Reload</Label>
                      <Switch
                        checked={settings.enableHotReload}
                        onCheckedChange={(checked) => updateSetting('enableHotReload', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sandboxMode" className="text-[--foreground]">Sandbox Mode</Label>
                      <Switch
                        checked={settings.sandboxMode}
                        onCheckedChange={(checked) => updateSetting('sandboxMode', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowFileUpload" className="text-[--foreground]">Allow File Upload</Label>
                      <Switch
                        checked={settings.allowFileUpload}
                        onCheckedChange={(checked) => updateSetting('allowFileUpload', checked)}
                        className="data-[state=checked]:bg-[--primary] data-[state=unchecked]:bg-[--muted-foreground]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="maxUploadSize" className="text-[--foreground]">Max Upload Size (MB)</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Slider
                          value={[settings.maxUploadSize]}
                          onValueChange={(value) => updateSetting('maxUploadSize', value[0])}
                          max={100}
                          min={1}
                          step={1}
                          className="flex-1 [&>span:first-child]:bg-[--primary] [&>span:first-child>span]:bg-[--primary]"
                          disabled={!settings.allowFileUpload}
                        />
                        <span className="w-12 text-sm text-[--foreground]">{settings.maxUploadSize}MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={resetSettings} variant="outline" className="border-[--border] text-[--foreground] hover:bg-[--muted]">
            Reset to Defaults
          </Button>
          <Button onClick={onClose} variant="outline" className="border-[--border] text-[--foreground] hover:bg-[--muted]">
            Cancel
          </Button>
          <Button onClick={saveSettings} className="bg-[--primary] text-[--primary-foreground] hover:bg-[--secondary]">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
