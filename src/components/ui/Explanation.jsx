import { useTheme } from '../../contexts/useTheme';
import RichText from './RichText';

// Shared blue explanation panel used after answering (QuizPage) and during
// review (ReviewPage). Caller passes the explanation text as children.
const Explanation = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`${isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
      <p className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-1`}>Explanation:</p>
      <p className={isDarkMode ? 'text-blue-200' : 'text-blue-800'}><RichText>{children}</RichText></p>
    </div>
  );
};

export default Explanation;
