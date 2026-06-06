import { useTheme } from '../../contexts/useTheme';
import { IconSun, IconMoon } from './icons';

const ThemeToggle = () => {
  const { isDarkMode, setIsDarkMode } = useTheme();

  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={`p-3 rounded-full shadow-lg transition-all ${
        isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-800'
      }`}
      aria-label="Toggle theme"
      title={isDarkMode ? 'Turn to light mode' : 'Turn to dark mode'}
    >
      {isDarkMode ? <IconSun className="w-6 h-6" /> : <IconMoon className="w-6 h-6" />}
    </button>
  );
};

export default ThemeToggle;
