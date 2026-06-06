import { useTheme } from '../../contexts/useTheme';

// Shared red error/notice banner. Renders nothing when there is no message, so
// callers can drop it in unconditionally: <ErrorBanner>{error}</ErrorBanner>.
const ErrorBanner = ({ children }) => {
  const { isDarkMode } = useTheme();
  if (!children) return null;

  return (
    <div className={`${
      isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
    } border px-4 py-3 rounded-lg`}>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
};

export default ErrorBanner;
