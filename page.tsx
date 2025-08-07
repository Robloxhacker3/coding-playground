'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { FileExplorer } from '@/components/file-explorer'
import { CodeEditor } from '@/components/code-editor'
import { Terminal, TerminalRef } from '@/components/terminal'
import { Preview } from '@/components/preview'
import { AIAssistant } from '@/components/ai-assistant'
import { Settings } from '@/components/settings'
import { ExtensionStore } from '@/components/extension-store'
import { Toolbar } from '@/components/toolbar'
import { StatusBar } from '@/components/status-bar'
import { Collaborators } from '@/components/collaborators'
import { ConsoleOutput } from '@/components/console-output'
import { LoginDialog } from '@/components/login-dialog'
import { ProjectHistoryDialog } from '@/components/project-history-dialog'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ThemeProvider } from '@/components/theme-provider'
import { v4 as uuidv4 } from 'uuid';

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

interface EnabledExtension {
  id: string
  name: string
  enabled: boolean
  config?: any
}

interface ConsoleLog {
  type: 'log' | 'error' | 'warn'
  content: string
  timestamp: Date
}

export default function CodePlayground() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [activeFile, setActiveFile] = useState<FileItem | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showExtensions, setShowExtensions] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [theme, setTheme] = useState('dark') // Managed by ThemeProvider now
  const [enabledExtensions, setEnabledExtensions] = useState<EnabledExtension[]>([])
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([])
  const [sharedProjectId, setSharedProjectId] = useState<string | null>(null)
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)
  const [projectHistory, setProjectHistory] = useState<AutoSaveData[]>([])
  const { toast } = useToast()

  const terminalRef = useRef<TerminalRef>(null);

  // Helper to find a file in the tree
  const findFileInTree = useCallback((items: FileItem[], fileId: string): FileItem | null => {
    for (const item of items) {
      if (item.id === fileId) return item;
      if (item.children) {
        const found = findFileInTree(item.children, fileId);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Save to localStorage functionality
  const saveToLocalStorage = useCallback((filesToSave: FileItem[], activeId: string | null, currentTheme: string, currentExtensions: EnabledExtension[], projectId: string | null = null, isVersionSave: boolean = false) => {
    try {
      const saveData: AutoSaveData = {
        files: filesToSave,
        activeFileId: activeId,
        timestamp: Date.now(),
        theme: currentTheme,
      }
      
      let storageKey = 'codeplayground_autosave';
      if (loggedInUser) {
        storageKey = `codeplayground_user_${loggedInUser}_autosave`;
      }
      if (projectId) {
        storageKey = projectId;
      }

      localStorage.setItem(storageKey, JSON.stringify(saveData))
      localStorage.setItem('codeplayground_extensions', JSON.stringify(currentExtensions))

      if (loggedInUser && !projectId && isVersionSave) {
        const userHistoryKey = `codeplayground_user_${loggedInUser}_history`;
        const currentHistory = JSON.parse(localStorage.getItem(userHistoryKey) || '[]') as AutoSaveData[];
        localStorage.setItem(userHistoryKey, JSON.stringify([saveData, ...currentHistory]));
        setProjectHistory([saveData, ...currentHistory]);
      }

      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }, [loggedInUser])

  // Load default project helper
  const loadDefaultProject = useCallback(() => {
    const defaultFiles: FileItem[] = [
      {
        id: '1',
        name: 'index.html',
        type: 'file',
        path: '/index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
      <h1 id="title">Welcome to CodePlayground</h1>
      <p>Start building something amazing!</p>
      <button id="clickBtn" onclick="handleClick()">Click me!</button>
      <div id="output"></div>
  </div>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        id: '2',
        name: 'style.css',
        type: 'file',
        path: '/style.css',
        language: 'css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

button {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 1rem 0;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

#output {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  min-height: 50px;
}`
      },
      {
        id: '3',
        name: 'script.js',
        type: 'file',
        path: '/script.js',
        language: 'javascript',
        content: `// JavaScript for the project
let clickCount = 0;

function handleClick() {
  clickCount++;
  const output = document.getElementById('output');
  const title = document.getElementById('title');

  output.innerHTML = \`
      <h3>Button clicked \${clickCount} time\${clickCount !== 1 ? 's' : ''}!</h3>
      <p>Keep clicking to see the magic ✨</p>
  \`;

  // Add some visual effects
  title.style.transform = 'scale(1.1)';
  setTimeout(() => {
      title.style.transform = 'scale(1)';
  }, 200);

  // Change colors based on click count
  if (clickCount % 5 === 0) {
      document.body.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)';
      setTimeout(() => {
          document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }, 1000);
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Project loaded successfully!');

  // Add some interactive effects
  const button = document.getElementById('clickBtn');
  if (button) {
      button.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-2px) scale(1.05)';
      });

      button.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0) scale(1)';
      });
  }
});`
      }
    ]
    setFiles(defaultFiles);
    setActiveFile(defaultFiles[0]);
    saveToLocalStorage(defaultFiles, defaultFiles[0].id, 'dark', []);
  }, [saveToLocalStorage]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const initialSharedId = urlParams.get('sharedId');
      let loadedFromShared = false;

      if (initialSharedId) {
        const sharedProject = localStorage.getItem(initialSharedId);
        if (sharedProject) {
          const saveData: AutoSaveData = JSON.parse(sharedProject);
          setFiles(saveData.files);
          setTheme(saveData.theme || 'dark'); // Set theme from loaded data
          if (saveData.activeFileId) {
            const activeFile = findFileInTree(saveData.files, saveData.activeFileId);
            if (activeFile) setActiveFile(activeFile);
          }
          setLastSaved(new Date(saveData.timestamp));
          setSharedProjectId(initialSharedId);
          toast({
            title: "Shared project loaded",
            description: "This project was loaded from a shared link.",
          });
          loadedFromShared = true;
        } else {
          toast({
            title: "Shared project not found",
            description: "No shared project data found for this link. Loading default project.",
            variant: "destructive"
          });
        }
      }

      if (!loadedFromShared) {
        const savedUser = localStorage.getItem('codeplayground_last_user');
        if (savedUser) {
          setLoggedInUser(savedUser);
          const userAutosaveKey = `codeplayground_user_${savedUser}_autosave`;
          const saved = localStorage.getItem(userAutosaveKey);
          if (saved) {
            const saveData: AutoSaveData = JSON.parse(saved);
            setFiles(saveData.files);
            setTheme(saveData.theme || 'dark'); // Set theme from loaded data
            if (saveData.activeFileId) {
              const activeFile = findFileInTree(saveData.files, saveData.activeFileId);
              if (activeFile) setActiveFile(activeFile);
            }
            setLastSaved(new Date(saveData.timestamp));
            toast({
              title: "Project restored",
              description: `Welcome back, ${savedUser}! Your previous work has been restored.`,
            });
          } else {
            loadDefaultProject();
            toast({
              title: "Welcome",
              description: `Welcome, ${savedUser}! Starting a new project.`,
            });
          }
        } else {
          const saved = localStorage.getItem('codeplayground_autosave');
          if (saved) {
            const saveData: AutoSaveData = JSON.parse(saved);
            setFiles(saveData.files);
            setTheme(saveData.theme || 'dark'); // Set theme from loaded data
            if (saveData.activeFileId) {
              const activeFile = findFileInTree(saveData.files, saveData.activeFileId);
              if (activeFile) setActiveFile(activeFile);
            }
            setLastSaved(new Date(saveData.timestamp));
            toast({
              title: "Project restored",
              description: "Your previous work has been restored from auto-save.",
            });
          } else {
            loadDefaultProject();
          }
        }
      }

      const savedExtensions = localStorage.getItem('codeplayground_extensions')
      if (savedExtensions) {
        setEnabledExtensions(JSON.parse(savedExtensions))
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  }, [saveToLocalStorage, findFileInTree, toast, loadDefaultProject])

  // Load project history when user logs in or on initial load if already logged in
  useEffect(() => {
    if (loggedInUser) {
      const userHistoryKey = `codeplayground_user_${loggedInUser}_history`;
      const savedHistory = JSON.parse(localStorage.getItem(userHistoryKey) || '[]') as AutoSaveData[];
      setProjectHistory(savedHistory);
    } else {
      setProjectHistory([]);
    }
  }, [loggedInUser]);


  // Auto-save every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (files.length > 0) {
        saveToLocalStorage(files, activeFile?.id || null, theme, enabledExtensions, sharedProjectId)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [files, activeFile, theme, enabledExtensions, sharedProjectId, saveToLocalStorage])

  // Save immediately when files change
  useEffect(() => {
    if (files.length > 0) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage(files, activeFile?.id || null, theme, enabledExtensions, sharedProjectId)
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [files, activeFile, theme, enabledExtensions, sharedProjectId, saveToLocalStorage])

  const updateFile = useCallback((updatedFile: FileItem) => {
    setFiles(prev => {
      const updateInTree = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === updatedFile.id) {
            return updatedFile
          }
          if (item.children) {
            return { ...item, children: updateInTree(item.children) }
          }
          return item
        })
      }

      const newFiles = updateInTree(prev)
      setPreviewKey(prevKey => prevKey + 1)
      return newFiles
    })

    setActiveFile(updatedFile)
  }, [])

  const createNewFile = useCallback((name: string, type: 'file' | 'folder', parentPath: string = '/') => {
    const newItem: FileItem = {
      id: Date.now().toString(),
      name,
      type,
      path: `${parentPath}${name}`,
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined,
      language: type === 'file' ? getLanguageFromExtension(name) : undefined
    }

    setFiles(prev => [...prev, newItem])

    if (type === 'file') {
      setActiveFile(newItem)
    }

    toast({
      title: `${type === 'file' ? 'File' : 'Folder'} created`,
      description: `${name} has been created successfully`,
    })

    return newItem
  }, [toast])

  const deleteFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const filterTree = (items: FileItem[]): FileItem[] => {
        return items.filter(item => {
          if (item.id === fileId) return false
          if (item.children) {
            item.children = filterTree(item.children)
          }
          return true
        })
      }
      return filterTree(prev)
    })

    if (activeFile?.id === fileId) {
      setActiveFile(null)
    }
    toast({
      title: "File deleted",
      description: "The file has been removed from your project",
    })
  }, [activeFile, toast])

  const runCode = async () => {
    if (!activeFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to run.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true)

    if (['html', 'css', 'javascript'].includes(activeFile.language || '')) {
      setPreviewKey(prev => prev + 1)
      toast({
        title: "Web project previewed",
        description: "Live preview updated with latest changes.",
      });
    } else {
      if (terminalRef.current) {
        terminalRef.current.runFileContent(activeFile);
        toast({
          title: "Code execution simulated",
          description: `Running ${activeFile.name} in terminal.`,
        });
      } else {
        toast({
          title: "Execution failed",
          description: "Terminal not ready for execution.",
          variant: "destructive"
        });
      }
    }

    setTimeout(() => {
      setIsRunning(false)
    }, 1000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles) return

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        createNewFile(file.name, 'file')

        setTimeout(() => {
          setFiles(prev => prev.map(f =>
            f.name === file.name ? { ...f, content } : f
          ))
        }, 100)
      }
      reader.readAsText(file)
    })

    toast({
      title: "Files uploaded",
      description: `${uploadedFiles.length} file(s) uploaded successfully`,
    })
  }

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

  const exportProject = () => {
    const projectData = {
      files,
      theme,
      enabledExtensions,
      metadata: {
        name: 'CodePlayground Project',
        created: new Date().toISOString(),
        version: '1.0.0'
      }
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'codeplayground-project.json'
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Project exported",
      description: "Your project has been downloaded as a JSON file",
    })
  }

  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string)
        if (projectData.files) {
          setFiles(projectData.files)
          setActiveFile(projectData.files[0] || null)
          setTheme(projectData.theme || 'dark')
          setEnabledExtensions(projectData.enabledExtensions || [])
          setSharedProjectId(null);
          toast({
            title: "Project imported",
            description: "Your project has been loaded successfully",
          })
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid project file format",
          variant: "destructive"
        })
      }
    }
    reader.readAsText(file)
  }

  const handleConsoleLog = useCallback((log: ConsoleLog) => {
    setConsoleLogs(prev => [...prev, log]);
  }, []);

  const handleClearConsoleLogs = useCallback(() => {
    setConsoleLogs([]);
  }, []);

  const handleShareProject = useCallback(() => {
    const newSharedId = uuidv4();
    setSharedProjectId(newSharedId);
    saveToLocalStorage(files, activeFile?.id || null, theme, enabledExtensions, newSharedId);
    
    const shareUrl = `${window.location.origin}?sharedId=${newSharedId}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Share link copied!",
      description: `Share this URL: ${shareUrl} (Note: This is a client-side simulation. Real-time sync requires a backend.)`,
    });
  }, [files, activeFile, theme, enabledExtensions, saveToLocalStorage, toast]);

  const handleSaveSharedChanges = useCallback(() => {
    if (sharedProjectId) {
      saveToLocalStorage(files, activeFile?.id || null, theme, enabledExtensions, sharedProjectId);
      toast({
        title: "Changes saved to shared project",
        description: "Your changes have been saved to the shared project. Other collaborators can now pull them.",
      });
    } else {
      toast({
        title: "Not in shared mode",
        description: "You are not in a shared project to save changes.",
        variant: "destructive"
      });
    }
  }, [files, activeFile, theme, enabledExtensions, sharedProjectId, saveToLocalStorage, toast]);

  const handlePullSharedChanges = useCallback(() => {
    if (sharedProjectId) {
      const sharedProject = localStorage.getItem(sharedProjectId);
      if (sharedProject) {
        const saveData: AutoSaveData = JSON.parse(sharedProject);
        setFiles(saveData.files);
        setTheme(saveData.theme || 'dark');
        if (saveData.activeFileId) {
          const activeFile = findFileInTree(saveData.files, saveData.activeFileId);
          if (activeFile) setActiveFile(activeFile);
        }
        setLastSaved(new Date(saveData.timestamp));
        toast({
          title: "Latest changes pulled",
          description: "The project has been updated with the latest changes from the shared link.",
        });
      } else {
        toast({
          title: "Shared project data not found",
          description: "Could not find shared project data in your browser's storage.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Not in shared mode",
        description: "You are not in a shared project to pull changes.",
        variant: "destructive"
      });
    }
  }, [sharedProjectId, findFileInTree, toast]);

  const handleLogin = useCallback((username: string) => {
    setLoggedInUser(username);
    localStorage.setItem('codeplayground_last_user', username);
    const userAutosaveKey = `codeplayground_user_${username}_autosave`;
    const saved = localStorage.getItem(userAutosaveKey);
    if (saved) {
      const saveData: AutoSaveData = JSON.parse(saved);
      setFiles(saveData.files);
      setTheme(saveData.theme || 'dark');
      if (saveData.activeFileId) {
        const activeFile = findFileInTree(saveData.files, saveData.activeFileId);
        if (activeFile) setActiveFile(activeFile);
      }
      setLastSaved(new Date(saveData.timestamp));
    } else {
      saveToLocalStorage(files, activeFile?.id || null, theme, enabledExtensions, null);
    }
    const userHistoryKey = `codeplayground_user_${username}_history`;
    const savedHistory = JSON.parse(localStorage.getItem(userHistoryKey) || '[]') as AutoSaveData[];
    setProjectHistory(savedHistory);
  }, [activeFile, enabledExtensions, files, findFileInTree, saveToLocalStorage, theme]);

  const handleLogout = useCallback(() => {
    setLoggedInUser(null);
    localStorage.removeItem('codeplayground_last_user');
    setProjectHistory([]);
    const saved = localStorage.getItem('codeplayground_autosave');
    if (saved) {
      const saveData: AutoSaveData = JSON.parse(saved);
      setFiles(saveData.files);
      setTheme(saveData.theme || 'dark');
      if (saveData.activeFileId) {
        const activeFile = findFileInTree(saveData.files, saveData.activeFileId);
        if (activeFile) setActiveFile(activeFile);
      }
      setLastSaved(new Date(saveData.timestamp));
    } else {
      loadDefaultProject();
    }
  }, [findFileInTree, loadDefaultProject]);

  const handleSaveVersion = useCallback(() => {
    if (!loggedInUser) {
      toast({
        title: "Login required",
        description: "Please log in to save project versions.",
        variant: "destructive"
      });
      return;
    }
    saveToLocalStorage(files, activeFile?.id || null, theme, enabledExtensions, null, true);
    toast({
      title: "Project version saved",
      description: "A snapshot of your current project has been saved to history.",
    });
  }, [loggedInUser, files, activeFile, theme, enabledExtensions, saveToLocalStorage, toast]);

  const handleLoadVersion = useCallback((version: AutoSaveData) => {
    setFiles(version.files);
    setTheme(version.theme || 'dark');
    if (version.activeFileId) {
      const activeFile = findFileInTree(version.files, version.activeFileId);
      if (activeFile) setActiveFile(activeFile);
    }
    setLastSaved(new Date(version.timestamp));
    setPreviewKey(prev => prev + 1);
  }, [findFileInTree]);

  return (
    <ThemeProvider theme={theme} setTheme={setTheme}>
      <div className="h-screen flex flex-col bg-[--background] text-[--foreground]">
        <Toolbar
          onRun={runCode}
          isRunning={isRunning}
          onShowSettings={() => setShowSettings(true)}
          onShowAI={() => setShowAI(true)}
          onShowExtensions={() => setShowExtensions(true)}
          onShowCollaborators={() => setShowCollaborators(true)}
          onFileUpload={handleFileUpload}
          onExport={exportProject}
          onImport={importProject}
          onShareProject={handleShareProject}
          onSaveSharedChanges={handleSaveSharedChanges}
          onSaveVersion={handleSaveVersion}
          onShowHistory={() => setShowHistory(true)}
          onShowLogin={() => setShowLogin(true)}
          sharedProjectId={sharedProjectId}
          loggedInUser={loggedInUser}
          lastSaved={lastSaved}
        />

        <div className="flex-1 flex">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={15}>
              <FileExplorer
                files={files}
                activeFile={activeFile}
                onFileSelect={setActiveFile}
                onFilesChange={setFiles}
                onCreateFile={createNewFile}
                onDeleteFile={deleteFile}
              />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={50}>
              <CodeEditor
                file={activeFile}
                onFileChange={updateFile}
                files={files}
              />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={30}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70}>
                  <Preview
                    files={files}
                    key={previewKey}
                    onRefresh={() => setPreviewKey(prev => prev + 1)}
                    onConsoleLog={handleConsoleLog}
                  />
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={30}>
                  <Tabs defaultValue="terminal" className="h-full">
                    <TabsList className="bg-[--muted] border-b border-[--border]">
                      <TabsTrigger value="terminal">Terminal</TabsTrigger>
                      <TabsTrigger value="console">Console</TabsTrigger>
                    </TabsList>
                    <TabsContent value="terminal" className="h-full mt-0">
                      <Terminal ref={terminalRef} files={files} onFilesChange={setFiles} />
                    </TabsContent>
                    <TabsContent value="console" className="h-full mt-0">
                      <ConsoleOutput logs={consoleLogs} onClearLogs={handleClearConsoleLogs} />
                    </TabsContent>
                  </Tabs>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            {showAI && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={25} minSize={20}>
                  <AIAssistant
                    onClose={() => setShowAI(false)}
                    currentFile={activeFile}
                    onCodeInsert={(code) => {
                      if (activeFile) {
                        updateFile({
                          ...activeFile,
                          content: (activeFile.content || '') + code
                        })
                      }
                    }}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>

        <StatusBar
          activeFile={activeFile}
          isRunning={isRunning}
          lastSaved={lastSaved}
          fileCount={files.length}
        />

        {showSettings && (
          <Settings onClose={() => setShowSettings(false)} onThemeChange={setTheme} currentTheme={theme} />
        )}

        {showExtensions && (
          <ExtensionStore onClose={() => setShowExtensions(false)} onExtensionsChange={setEnabledExtensions} />
        )}

        {showCollaborators && (
          <Collaborators
            onClose={() => setShowCollaborators(false)}
            onShareProject={handleShareProject}
            onPullSharedChanges={handlePullSharedChanges}
            sharedProjectId={sharedProjectId}
          />
        )}

        {showLogin && (
          <LoginDialog
            onClose={() => setShowLogin(false)}
            onLogin={handleLogin}
            onLogout={handleLogout}
            loggedInUser={loggedInUser}
          />
        )}

        {showHistory && (
          <ProjectHistoryDialog
            onClose={() => setShowHistory(false)}
            history={projectHistory}
            onLoadVersion={handleLoadVersion}
          />
        )}
      </div>
    </ThemeProvider>
  )
}
