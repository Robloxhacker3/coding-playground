'use client'

import { createContext, useContext, useEffect } from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'

// Define the color palettes for each theme using HSL values
// These will be set as CSS variables on the :root element
const themeColorPalettes = {
  dark: {
    '--background': '220 10% 8%', // hsl(220, 10%, 8%)
    '--foreground': '0 0% 100%', // hsl(0, 0%, 100%)
    '--muted': '220 10% 12%',
    '--muted-foreground': '215 14% 70%',
    '--border': '215 14% 20%',
    '--primary': '240 50% 60%', // A purple-blue primary
    '--primary-foreground': '0 0% 100%',
    '--secondary': '240 5% 25%',
    '--secondary-foreground': '0 0% 100%',
    '--accent': '270 50% 60%', // A more purple accent
    '--accent-foreground': '0 0% 100%',
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '0 0% 100%',
    '--ring': '240 50% 60%',
    '--radius': '0.5rem',
    '--card': '220 10% 10%',
    '--card-foreground': '0 0% 100%',
    '--popover': '220 10% 10%',
    '--popover-foreground': '0 0% 100%',
    '--input': '215 14% 20%',
  },
  light: {
    '--background': '0 0% 100%',
    '--foreground': '220 10% 8%',
    '--muted': '210 40% 96%',
    '--muted-foreground': '215 14% 45%',
    '--border': '215 14% 85%',
    '--primary': '240 50% 49%', // A blue primary
    '--primary-foreground': '0 0% 100%',
    '--secondary': '210 40% 90%',
    '--secondary-foreground': '220 10% 8%',
    '--accent': '270 50% 49%', // A purple accent
    '--accent-foreground': '220 10% 8%',
    '--destructive': '0 84% 60%',
    '--destructive-foreground': '0 0% 100%',
    '--ring': '240 50% 49%',
    '--radius': '0.5rem',
    '--card': '0 0% 100%',
    '--card-foreground': '220 10% 8%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '220 10% 8%',
    '--input': '215 14% 85%',
  },
};

// Map theme names to their Monaco Editor themes
const monacoThemesMap = {
  dark: 'vs-dark',
  light: 'vs-light',
  dracula: 'vs-dark',
  monokai: 'vs-dark',
  solarizedDark: 'vs-dark',
  solarizedLight: 'vs-light',
  githubDark: 'vs-dark',
  githubLight: 'vs-light',
  nord: 'vs-dark',
  cyberpunk: 'vs-dark',
  synthwave: 'vs-dark',
  oceanBlue: 'vs-dark',
  forest: 'vs-dark',
  sunset: 'vs-light',
  midnight: 'vs-dark',
  system: 'vs-dark', // Default for system, will be overridden by actual system preference
} as const;

type ThemeName = keyof typeof monacoThemesMap; // Use monacoThemesMap keys as valid theme names

interface CustomThemeContext {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: { name: string; monacoTheme: 'vs-dark' | 'vs-light'; }[]; // Simplified themes list for settings
  resolvedTheme?: string; // From next-themes
  monacoTheme: 'vs-dark' | 'vs-light'; // Directly expose monacoTheme
}

const ThemeContext = createContext<CustomThemeContext>({
  theme: 'dark',
  setTheme: () => {},
  themes: [],
  monacoTheme: 'vs-dark',
});

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    const currentPalette = themeColorPalettes[resolvedTheme as keyof typeof themeColorPalettes] || themeColorPalettes.dark; // Default to dark if resolvedTheme is not found

    Object.entries(currentPalette).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [resolvedTheme]);

  const getMonacoTheme = (currentTheme: string | undefined) => {
    return monacoThemesMap[currentTheme as keyof typeof monacoThemesMap] || 'vs-dark';
  };

  const availableThemes = Object.keys(monacoThemesMap).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize for display
    monacoTheme: monacoThemesMap[key as keyof typeof monacoThemesMap],
  }));

  return (
    <NextThemesProvider {...props}>
      <ThemeContext.Provider
        value={{
          theme: (theme || 'system') as ThemeName,
          setTheme: setTheme as (theme: ThemeName) => void,
          themes: availableThemes,
          resolvedTheme,
          monacoTheme: getMonacoTheme(resolvedTheme),
        }}
      >
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}

export const useTheme = () => useContext(ThemeContext);
