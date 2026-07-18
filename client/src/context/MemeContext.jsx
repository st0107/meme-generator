import { createContext, useContext, useMemo, useState } from 'react';

const MemeContext = createContext();

export function MemeProvider({ children }) {
  const [history, setHistory] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('meme-history') || '[]');
    } catch {
      return [];
    }
  });

  const addToHistory = (entry) => {
    const updated = [entry, ...history].slice(0, 8);
    setHistory(updated);
    localStorage.setItem('meme-history', JSON.stringify(updated));
  };

  const value = useMemo(() => ({ history, addToHistory }), [history]);

  return <MemeContext.Provider value={value}>{children}</MemeContext.Provider>;
}

export function useMemeHistory() {
  return useContext(MemeContext);
}
