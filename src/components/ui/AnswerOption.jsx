import { useTheme } from '../../contexts/useTheme';
import { optionLabel } from '../../utils/utils';
import RichText from './RichText';
import { IconCheck, IconClose } from './icons';

// One answer button in the quiz runner. Styling depends on three flags:
// isAnswered (locks the button + shows result colors), isSelected (user picked
// this), isCorrectOption (this option is part of the correct answer).
const AnswerOption = ({ option, index, isSelected, isCorrectOption, isAnswered, onClick }) => {
  const { isDarkMode } = useTheme();

  let className = 'w-full text-left p-4 rounded-lg border-2 transition-all font-medium relative overflow-hidden ';

  if (isAnswered) {
    if (isSelected && isCorrectOption) {
      className += isDarkMode
        ? 'bg-green-900/50 border-green-500 text-green-100'
        : 'bg-green-100 border-green-500 text-green-900';
    } else if (isSelected && !isCorrectOption) {
      className += isDarkMode
        ? 'bg-red-900/50 border-red-500 text-red-100'
        : 'bg-red-100 border-red-500 text-red-900';
    } else if (!isSelected && isCorrectOption) {
      // Correct answer the user did not pick — shown with a dashed border so
      // it's clearly "this was right" without competing with the user's choice.
      className += isDarkMode
        ? 'bg-green-900/30 border-green-500 border-dashed text-green-200'
        : 'bg-green-50 border-green-500 border-dashed text-green-800';
    } else {
      className += isDarkMode
        ? 'bg-gray-800 border-gray-700 text-gray-400'
        : 'bg-gray-50 border-gray-200 text-gray-500';
    }
  } else if (isSelected) {
    className += isDarkMode
      ? 'border-blue-400 bg-blue-900/40 text-blue-100 ring-2 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
      : 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-400/50 shadow-md';
  } else {
    className += isDarkMode
      ? 'border-gray-600 hover:border-gray-400 hover:bg-gray-700 text-gray-200'
      : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50 text-gray-800';
    className += ' cursor-pointer';
  }

  return (
    <button onClick={onClick} disabled={isAnswered} className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-bold mr-3 opacity-70">{optionLabel(index)}.</span>
          <RichText>{option}</RichText>
        </div>

        {isAnswered && (
          <div className="flex items-center text-sm font-bold ml-4 shrink-0">
            {isSelected && isCorrectOption && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <span className="mr-1">Correct</span>
                <IconCheck className="w-6 h-6" />
              </div>
            )}
            {isSelected && !isCorrectOption && (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <span className="mr-1">Your answer</span>
                <IconClose className="w-6 h-6" strokeWidth={3} />
              </div>
            )}
            {!isSelected && isCorrectOption && (
              <div className="flex items-center text-red-500 dark:text-red-400">
                <span className="mr-1">Unchosen</span>
                <IconClose className="w-6 h-6" strokeWidth={3} />
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
};

export default AnswerOption;
