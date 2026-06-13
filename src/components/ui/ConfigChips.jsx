import { useTheme } from '../../contexts/useTheme';
import { IconShuffle } from './icons';

// Compact configuration chips for a quiz run, in order: size (N % / N #), then
// shuffle Questions, then Options. A fully-default run (no shuffles, 100%)
// renders nothing. Shared by the upload card (live settings preview) and
// HistoryPane (per past attempt). `wrap` allows multi-row (history list);
// the card passes it false to keep a single row.
const ConfigChips = ({ settings, wrap = false, className = '' }) => {
  const { classes } = useTheme();
  if (!settings) return null;
  const { shuffleQuestions, shuffleOptions, quizSize, quizSizeMode } = settings;
  const showSize = quizSizeMode === 'count' || (quizSizeMode === 'percentage' && quizSize < 100);
  if (!shuffleQuestions && !shuffleOptions && !showSize) return null;

  const chip = `inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${classes.inputBgPlain} ${classes.mutedText}`;
  return (
    <div className={`flex items-center gap-1.5 ${wrap ? 'flex-wrap' : ''} ${className}`}>
      {showSize && (
        <span className={chip}>{quizSizeMode === 'percentage' ? `${quizSize} %` : `${quizSize} #`}</span>
      )}
      {shuffleQuestions && (
        <span className={chip}>
          <IconShuffle className="w-3.5 h-3.5" /> Questions
        </span>
      )}
      {shuffleOptions && (
        <span className={chip}>
          <IconShuffle className="w-3.5 h-3.5" /> Options
        </span>
      )}
    </div>
  );
};

export default ConfigChips;
