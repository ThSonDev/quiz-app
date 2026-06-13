import { useTheme } from '../../contexts/useTheme';

// Tone color sets for the small round icon button. Each is a dark/light pair of
// hover-background + text classes.
const TONES = {
  emerald: {
    dark: 'hover:bg-emerald-800 text-emerald-300 hover:text-emerald-200',
    light: 'hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700',
  },
  indigo: {
    dark: 'hover:bg-indigo-800 text-indigo-300 hover:text-indigo-200',
    light: 'hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700',
  },
  red: {
    dark: 'hover:bg-red-800 text-red-400 hover:text-red-300',
    light: 'hover:bg-red-100 text-red-600 hover:text-red-700',
  },
};

// The small round icon button used on the loaded-quiz card and library rows
// (share / edit / remove). `tone` picks the color set; pass the icon as
// children. onClick/title/aria-label/disabled forward via ...props.
const IconButton = ({ tone = 'indigo', className = '', children, ...props }) => {
  const { isDarkMode } = useTheme();
  const t = TONES[tone] ?? TONES.indigo;
  return (
    <button
      type="button"
      className={`p-1.5 rounded-full transition-all ${isDarkMode ? t.dark : t.light} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
