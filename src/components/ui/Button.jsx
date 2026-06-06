import { useTheme } from '../../contexts/useTheme';

// Solid color variants. `secondary` and `neutral` are theme-dependent and
// resolved inside the component.
const SOLID = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  purple: 'bg-purple-600 text-white hover:bg-purple-700',
  emerald: 'bg-emerald-600 text-white hover:bg-emerald-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-green-600 text-white hover:bg-green-700',
  blue: 'bg-blue-600 text-white hover:bg-blue-700',
};

// Shared action button. Defaults to the px-6 py-3 size used across pages;
// extra layout (full width, flex+icon, etc.) comes through `className`. Forwards
// onClick/disabled/title/type via ...props.
const Button = ({ variant = 'primary', className = '', children, ...props }) => {
  const { isDarkMode, classes } = useTheme();

  let variantClass;
  if (variant === 'secondary') variantClass = classes.secondaryBtn;
  else if (variant === 'neutral') {
    variantClass = isDarkMode
      ? 'bg-gray-700 hover:bg-gray-600 text-white'
      : 'bg-gray-600 hover:bg-gray-700 text-white';
  } else variantClass = SOLID[variant] ?? SOLID.primary;

  return (
    <button
      className={`px-6 py-3 rounded-lg font-medium transition-all ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
