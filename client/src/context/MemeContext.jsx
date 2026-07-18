import { createContext, useContext, useMemo, useState } from 'react';

const MemeContext = createContext();
const HISTORY_KEY = 'meme-history';

function saveHistory(entries) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    const compactEntries = entries.map((entry) => ({
      ...entry,
      template: entry.template?.custom ? { ...entry.template, image: '' } : entry.template,
    }));

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(compactEntries));
    } catch {
      localStorage.removeItem(HISTORY_KEY);
    }
  }
}

export function MemeProvider({ children }) {
  const [history, setHistory] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const addToHistory = (entry) => {
    const updated = [entry, ...history].slice(0, 8);
    setHistory(updated);
    saveHistory(updated);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const value = useMemo(() => ({ history, addToHistory, clearHistory }), [history]);

  return <MemeContext.Provider value={value}>{children}</MemeContext.Provider>;
}

export function useMemeHistory() {
  return useContext(MemeContext);
}
