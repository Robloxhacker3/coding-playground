'use client'

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Terminal as XTerminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
  language?: string
  children?: FileItem[]
  path: string
}

interface TerminalProps {
  files: FileItem[]
  onFilesChange: (files: FileItem[]) => void
}

export interface TerminalRef {
  runFileContent: (file: FileItem) => void
}

export const Terminal = forwardRef<TerminalRef, TerminalProps>(({ files, onFilesChange }, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermInstance = useRef<XTerminal | null>(null)
  const fitAddon = useRef<FitAddon | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const currentCommandInput = useRef<string>(''); // To track current input line

  const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const writeToTerminal = useCallback((text: string) => {
    if (xtermInstance.current) {
      xtermInstance.current.write(text + '\r\n')
    }
  }, [])

  const runFileContent = useCallback((file: FileItem) => {
    if (!xtermInstance.current) return

    writeToTerminal(`> Running ${file.name} (${file.language})...`)
    writeToTerminal('--- Output ---')

    if (file.language === 'javascript' || file.language === 'typescript') {
      try {
        const scriptContent = file.content || ''
        let capturedOutput = ''

        // Temporarily override console methods to capture output
        const originalConsoleLog = console.log
        const originalConsoleError = console.error
        const originalConsoleWarn = console.warn

        console.log = (...args: any[]) => {
          capturedOutput += args.map(String).join(' ') + '\n'
          originalConsoleLog.apply(console, args)
        }
        console.error = (...args: any[]) => {
          capturedOutput += `ERROR: ${args.map(String).join(' ')}\n`
          originalConsoleError.apply(console, args)
        }
        console.warn = (...args: any[]) => {
          capturedOutput += `WARN: ${args.map(String).join(' ')}\n`
          originalConsoleWarn.apply(console, args)
        }

        // Execute the script content in a new Function context
        // This provides a basic level of isolation but is NOT a secure sandbox.
        new Function(scriptContent)()

        writeToTerminal(capturedOutput || 'Execution completed. No console output.')
      } catch (e: any) {
        writeToTerminal(`Error during execution: ${e.message}`)
      } finally {
        // Restore original console methods
        console.log = console.log
        console.error = console.error
        console.warn = console.warn
      }
    } else if (file.language === 'python') {
      writeToTerminal('Python execution simulated. (Actual execution not supported)')
      writeToTerminal(`Content: \n${file.content || 'Empty file'}`)
    } else if (file.language === 'html' || file.language === 'css') {
      writeToTerminal('HTML/CSS files are rendered in the Preview panel.')
    } else {
      writeToTerminal(`Cannot execute files of type: ${file.language || 'unknown'}.`)
      writeToTerminal(`Content: \n${file.content || 'Empty file'}`)
    }
    writeToTerminal('--- End Output ---')
    writeToTerminal('\n$ ') // Simulate prompt
  }, [writeToTerminal])

  useImperativeHandle(ref, () => ({
    runFileContent,
  }))

  const processCommand = useCallback((command: string) => {
    const parts = command.split(' ')
    const cmd = parts[0]
    const args = parts.slice(1)

    switch (cmd) {
      case 'help':
        writeToTerminal('Available commands:')
        writeToTerminal('  `ls` - List files')
        writeToTerminal('  `cat <filename>` - Display file content')
        writeToTerminal('  `clear` - Clear terminal')
        writeToTerminal('  `run <filename>` - Simulate running a file (JS/TS only)')
        break
      case 'ls':
        if (files.length === 0) {
          writeToTerminal('No files in project.')
        } else {
          files.forEach(file => writeToTerminal(`- ${file.name} (${file.type})`))
        }
        break
      case 'cat':
        if (args.length === 0) {
          writeToTerminal('Usage: `cat <filename>`')
          return
        }
        const fileToCat = files.find(f => f.name === args[0])
        if (fileToCat) {
          writeToTerminal(`--- Content of ${fileToCat.name} ---`)
          writeToTerminal(fileToCat.content || 'File is empty.')
          writeToTerminal('--------------------')
        } else {
          writeToTerminal(`File not found: ${args[0]}`)
        }
        break
      case 'clear':
        xtermInstance.current?.clear()
        break
      case 'run':
        if (args.length === 0) {
          writeToTerminal('Usage: `run <filename>`')
          return
        }
        const fileToRun = files.find(f => f.name === args[0])
        if (fileToRun) {
          runFileContent(fileToRun)
        } else {
          writeToTerminal(`File not found: ${args[0]}`)
        }
        break
      default:
        writeToTerminal(`Unknown command: ${command}`)
        break
    }
  }, [files, runFileContent, writeToTerminal])

  useEffect(() => {
    if (terminalRef.current && !isInitialized) {
      const term = new XTerminal({
        fontFamily: 'monospace',
        fontSize: 14,
        cursorBlink: true,
        theme: {
          background: `hsl(${getCssVar('--background')})`,
          foreground: `hsl(${getCssVar('--foreground')})`,
          cursor: `hsl(${getCssVar('--primary')})`,
          selectionBackground: `hsl(${getCssVar('--accent')})`,
          black: `hsl(${getCssVar('--muted-foreground')})`,
          red: '#ef4444',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#3b82f6',
          magenta: '#d946ef',
          cyan: '#06b6d4',
          white: `hsl(${getCssVar('--foreground')})`,
        },
      })

      const fitAddonInstance = new FitAddon()
      term.loadAddon(fitAddonInstance)

      term.open(terminalRef.current)
      fitAddonInstance.fit()

      term.write('Welcome to CodePlayground Terminal!\r\n')
      term.write('Type `help` for commands.\r\n\n')
      term.write('$ ')

      term.onData((data) => {
        if (data === '\r') { // Enter key
          writeToTerminal('') // New line after command
          processCommand(currentCommandInput.current)
          currentCommandInput.current = ''; // Clear current command
          term.write('$ ')
        } else if (data === '\x7F') { // Backspace
          if (currentCommandInput.current.length > 0) {
            currentCommandInput.current = currentCommandInput.current.slice(0, -1);
            term.write('\b \b'); // Erase character from terminal
          }
        } else {
          currentCommandInput.current += data;
          term.write(data);
        }
      })

      xtermInstance.current = term;
      fitAddon.current = fitAddonInstance;
      setIsInitialized(true)

      const handleResize = () => {
        fitAddon.current?.fit()
      }
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        xtermInstance.current?.dispose()
      }
    }
  }, [isInitialized, processCommand, writeToTerminal])

  return <div ref={terminalRef} className="w-full h-full" />
})

Terminal.displayName = 'Terminal';
