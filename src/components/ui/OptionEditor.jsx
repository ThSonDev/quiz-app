import { useTheme } from '../../contexts/useTheme';
import { optionLabel } from '../../utils/utils';

const OptionEditor = ({
  option,
  index,
  type,
  questionIndex,
  onChange,
  onRemove,
  onSelectSingle,
  canRemove,
}) => {
  const { isDarkMode, classes } = useTheme();

  const inputBg = isDarkMode
    ? 'bg-transparent border-gray-600 text-white placeholder-gray-500'
    : 'bg-transparent border-gray-300 text-gray-800 placeholder-gray-400';

  // Single choice uses a radio (one selection per question), multi uses a
  // checkbox. The shared name attribute groups radios per question.
  const inputType = type === 'single' ? 'radio' : 'checkbox';

  const handleCorrectToggle = () => {
    if (type === 'single') onSelectSingle();
    else onChange({ ...option, isCorrect: !option.isCorrect });
  };

  const containerActive = isDarkMode
    ? 'bg-green-900/30 border-green-600'
    : 'bg-green-50 border-green-400';
  const containerInactive = isDarkMode
    ? 'bg-gray-800 border-gray-600'
    : 'bg-white border-gray-300';

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
      option.isCorrect ? containerActive : containerInactive
    }`}>
      <input
        type={inputType}
        name={`question-${questionIndex}-correct`}
        checked={option.isCorrect}
        onChange={handleCorrectToggle}
        className="w-5 h-5 accent-indigo-600 cursor-pointer flex-shrink-0"
        aria-label={option.isCorrect ? 'Marked as correct' : 'Mark as correct'}
      />

      <span className={`font-bold ${classes.mutedText} flex-shrink-0 w-6`}>
        {optionLabel(index)}.
      </span>

      <input
        type="text"
        value={option.text}
        onChange={(e) => onChange({ ...option, text: e.target.value })}
        placeholder={`Option ${optionLabel(index)}`}
        className={`flex-1 min-w-0 px-3 py-2 border ${inputBg} rounded-md focus:outline-none focus:border-indigo-500`}
      />

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        title={canRemove ? 'Remove option' : 'At least 2 options are required'}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex-shrink-0 ${
          canRemove
            ? isDarkMode
              ? 'text-red-300 hover:bg-red-900/40'
              : 'text-red-600 hover:bg-red-50'
            : isDarkMode
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-gray-400 cursor-not-allowed'
        }`}
      >
        Remove
      </button>
    </div>
  );
};

export default OptionEditor;
