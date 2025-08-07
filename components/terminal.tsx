@@ .. @@
         console.error = (...args: any[]) => {
           capturedOutput += `ERROR: ${args.map(String).join(' ')}\n`
-          originalConsoleError.apply(console, args)
+          originalConsoleError(...args)
         }
         console.warn = (...args: any[]) => {
           capturedOutput += `WARN: ${args.map(String).join(' ')}\n`
-          originalConsoleWarn.apply(console, args)
+          originalConsoleWarn(...args)
         }

@@ .. @@
         writeToTerminal(capturedOutput || 'Execution completed. No console output.')
       } catch (e: any) {
         writeToTerminal(`Error during execution: ${e.message}`)
       } finally {
         // Restore original console methods
-        console.log = console.log
-        console.error = console.error
-        console.warn = console.warn
+        console.log = originalConsoleLog
+        console.error = originalConsoleError
+        console.warn = originalConsoleWarn
       }