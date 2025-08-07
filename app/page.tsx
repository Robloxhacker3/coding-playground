@@ .. @@
 import { Collaborators } from '@/components/collaborators'
 import { ConsoleOutput } from '@/components/console-output'
 import { LoginDialog } from '@/components/login-dialog'
 import { ProjectHistoryDialog } from '@/components/project-history-dialog'
 import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
-import { useToast } from '@/hooks/use-toast'
+import { useToast } from '@/hooks/use-toast'
 import { ThemeProvider } from '@/components/theme-provider'
 import { v4 as uuidv4 } from 'uuid';