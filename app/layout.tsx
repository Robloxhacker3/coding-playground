@@ .. @@
 import type { Metadata } from 'next'
 import { GeistSans } from 'geist/font/sans'
 import { GeistMono } from 'geist/font/mono'
+import { Toaster } from '@/components/ui/toaster'
 import './globals.css'

@@ .. @@
       </head>
-      <body>{children}</body>
+      <body>
+        {children}
+        <Toaster />
+      </body>
     </html>
   )
 }