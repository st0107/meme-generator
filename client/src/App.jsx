import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GeneratorPage from './pages/GeneratorPage';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { MemeProvider } from './context/MemeContext';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MemeProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/generator" element={<GeneratorPage />} />
          </Routes>
        </MemeProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
