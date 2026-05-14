import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/** @typedef {'light' | 'dark'} ThemeMode */

const STORAGE_KEY = 'gymflow-theme';

const ThemeContext = createContext(
  /** @type {{ theme: ThemeMode; setTheme: (t: ThemeMode) => void; toggleTheme: () => void }} */ (
    null
  )
);

/** Reads persisted theme (defaults to dark to match legacy Gym Flow look). */
function readStoredTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* private mode / quota */
  }
  return 'dark';
}

/** Applies `dark` class on `<html>` and updates PWA theme-color when present. */
function applyThemeToDocument(theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#000000' : '#EFEEEA');
  }
}

/**
 * Provides day (light) / night (dark) preference with localStorage persistence.
 * @param {{ children: import('react').ReactNode }} props
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof document === 'undefined') return 'dark';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    applyThemeToDocument(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      applyThemeToDocument(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyThemeToDocument(stored);
  }, []);

  useEffect(() => {
    function onStorage(e) {
      if (e.key !== STORAGE_KEY) return;
      if (e.newValue !== 'light' && e.newValue !== 'dark') return;
      setThemeState(e.newValue);
      applyThemeToDocument(e.newValue);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** @returns {{ theme: ThemeMode; setTheme: (t: ThemeMode) => void; toggleTheme: () => void }} */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
