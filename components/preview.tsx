@@ .. @@
       iframeWindow.console.log = (...args: any[]) => {
         onConsoleLog({ type: 'log', content: args.map(String).join(' '), timestamp: new Date() })
-        originalConsoleLog.apply(iframeWindow.console, args)
+        originalConsoleLog(...args)
       }
       iframeWindow.console.error = (...args: any[]) => {
         onConsoleLog({ type: 'error', content: args.map(String).join(' '), timestamp: new Date() })
-        originalConsoleError.apply(iframeWindow.console, args)
+        originalConsoleError(...args)
       }
       iframeWindow.console.warn = (...args: any[]) => {
         onConsoleLog({ type: 'warn', content: args.map(String).join(' '), timestamp: new Date() })
-        originalConsoleWarn.apply(iframeWindow.console, args)
+        originalConsoleWarn(...args)
       }