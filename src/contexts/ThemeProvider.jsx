import { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext';

const STORAGE_KEY = 'quizAppTheme';

// Centralizes the dark/light flag and the Tailwind class strings derived from
// it. Consumers read via the useTheme hook.
export function ThemeProvider({ children }) {
  // Read synchronously in the initializer so the first paint already matches the
  // saved theme — a post-mount read would flash the light theme for dark users.
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem(STORAGE_KEY) === 'dark');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const classes = {
    pageGradient: isDarkMode
      ? 'bg-gray-900 text-gray-100'
      : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    innerBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-50',
    inputBgPlain: isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300',
    inputBg: isDarkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
      : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500',
    textColor: isDarkMode ? 'text-gray-200' : 'text-gray-800',
    mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    secondaryBtn: isDarkMode
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
      : 'bg-gray-300 text-gray-700 hover:bg-gray-400',
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, classes }}>
      {children}
    </ThemeContext.Provider>
  );
}
