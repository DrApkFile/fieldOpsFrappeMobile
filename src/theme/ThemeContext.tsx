import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Theme, ThemeMode, buildTheme } from './theme';

let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  const memoryStore = new Map<string, string>();
  AsyncStorage = {
    getItem: async (key: string) => memoryStore.get(key) || null,
    setItem: async (key: string, val: string) => { memoryStore.set(key, val); },
  };
}

const STORAGE_KEY = '@fieldops:themeMode';

interface ThemeContextValue extends Theme {
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    // Light is the app default; dark only applies once the user has explicitly switched to it.
    AsyncStorage.getItem(STORAGE_KEY).then((saved: string | null) => {
      if (saved === 'light' || saved === 'dark') {
        setModeState(saved);
      }
    }).catch(() => {});
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const toggleMode = () => setMode(mode === 'dark' ? 'light' : 'dark');

  const value = useMemo<ThemeContextValue>(() => ({
    ...buildTheme(mode),
    setMode,
    toggleMode,
  }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};
