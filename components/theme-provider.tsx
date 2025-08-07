@@ .. @@
 'use client'

-import { createContext, useContext, useEffect } from 'react'
+import { createContext, useContext, useEffect, ReactNode } from 'react'
 import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'
-import { type ThemeProviderProps } from 'next-themes'
+import { type ThemeProviderProps } from 'next-themes/dist/types'

@@ .. @@
   monacoTheme: 'vs-dark',
 });

-export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
+interface CustomThemeProviderProps extends Omit<ThemeProviderProps, 'children'> {
+  children: ReactNode
+}
+
+export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
   const { theme, setTheme, resolvedTheme } = useNextTheme();