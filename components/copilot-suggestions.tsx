@@ .. @@
 interface CopilotSuggestionsProps {
   onClose: () => void
   currentFileContent: string | undefined
   onCodeInsert: (code: string) => void
 }

-const mockSuggestions = [
+const mockSuggestions: Array<{
+  id: string
+  title: string
+  code: string
+  language: string
+}> = [
   {
@@ .. @@
 export function CopilotSuggestions({ onClose, currentFileContent, onCodeInsert }: CopilotSuggestionsProps) {
-  const [suggestions, setSuggestions] = useState<typeof mockSuggestions>([]);
+  const [suggestions, setSuggestions] = useState(mockSuggestions);

   useEffect(() => {
@@ .. @@
 };

export default MyComponent;`,
-    language: 'typescriptreact',
+    language: 'typescript',
   },
 ];