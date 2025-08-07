@@ .. @@
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog' // Reverted import path
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
 import { SettingsIcon, Palette, Code, Globe, Shield, Zap, Save } from 'lucide-react'
-import { useTheme } from './theme-provider'
+import { useTheme } from '@/components/theme-provider'
 import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'