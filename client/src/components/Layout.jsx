import { Link } from 'react-router-dom';
import { Home, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Layout({ children }) {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
            <div className="rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 p-2 text-white">
              <Sparkles size={18} />
            </div>
            AI Meme Studio
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
              <Home size={16} /> Home
            </Link>
            <Link to="/generator" className="rounded-full bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900">
              Generate
            </Link>
            <button onClick={toggleTheme} className="rounded-full border border-slate-300 p-2 dark:border-slate-700">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
