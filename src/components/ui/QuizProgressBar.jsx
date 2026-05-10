import { useTheme } from '../../contexts/useTheme';

const QuizProgressBar = ({ answered, total, currentQuestion }) => {
  const { isDarkMode, classes } = useTheme();
  const percent = total === 0 ? 0 : (answered / total) * 100;

  return (
    <div className={`${classes.cardBg} rounded-xl shadow-lg p-6 mb-6`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${classes.mutedText}`}>
          Progress: {answered} / {total}
        </span>
        <span className={`text-sm font-medium ${classes.mutedText}`}>
          Question {currentQuestion + 1}
        </span>
      </div>
      <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default QuizProgressBar;
