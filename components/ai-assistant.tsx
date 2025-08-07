@@ .. @@
       const { text } = await generateText({
         model: openai("gpt-4o"), // Using gpt-4o as per instructions
-        prompt: prompt,
+        prompt,
       })