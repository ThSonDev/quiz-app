import { useState } from 'react';
import { useTheme } from '../../contexts/useTheme';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { formatTimestamp } from '../../utils/utils';
import ConfigChips from './ConfigChips';
import { IconClose, IconHistory } from './icons';

// Slide-over panel listing a single quiz's past attempts. Same style/behaviour
// as QuizLibraryPane: presentational, parent owns the data and navigation.
// `attempts` arrive oldest-first; they are shown newest-first. Reviewable
// attempts are clickable (open that attempt's result page); score-only attempts
// — left behind after the quiz was edited — show the final score but are not
// openable.
const HistoryPane = ({ quizName, attempts, currentAttemptId, onSelect, onClose }) => {
  const { isDarkMode, classes } = useTheme();
  const [closing, setClosing] = useState(false);
  const close = (action) => {
    if (closing) return;
    setClosing(true);
    setTimeout(action, 250);
  };

  useBodyScrollLock();

  // Newest first for display, but keep the chronological index so the per-attempt
  // delta (vs the previous attempt) stays meaningful.
  const ordered = attempts.map((a, i) => ({ attempt: a, index: i })).reverse();

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className={`flex-1 bg-black/40 ${closing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
        onClick={() => close(onClose)}
        aria-hidden="true"
      />
      <div className={`${classes.cardBg} w-full max-w-md h-full overflow-y-auto shadow-2xl p-6 ${closing ? 'animate-slideOutRight' : 'animate-slideInRight'}`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-2xl font-bold ${classes.textColor} flex items-center gap-2`}>
            <IconHistory className="w-6 h-6" />
            Results History
          </h2>
          <button
            type="button"
            onClick={() => close(onClose)}
            className={`p-1.5 rounded-full transition-all ${classes.secondaryBtn}`}
            aria-label="Close"
            title="Close"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>
        <p className={`text-sm ${classes.mutedText} mb-5 break-words`}>{quizName}</p>

        {attempts.length === 0 ? (
          <p className={classes.mutedText}>No attempts yet.</p>
        ) : (
          <ul className="space-y-3">
            {ordered.map(({ attempt: a, index }) => {
              const score = a.score.toFixed(2);
              const label = `Attempt ${index + 1}`;
              // The attempt the user is currently viewing the results of (opened
              // the history from its review). Opening it again would just show
              // the same results, so it's badged and not selectable.
              const isCurrent = a.attemptId === currentAttemptId;
              const openable = a.reviewable && !isCurrent;
              const body = (
                <>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className={`font-semibold ${classes.textColor} flex items-center gap-2`}>
                      {label}
                      {isCurrent && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          This attempt
                        </span>
                      )}
                    </p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {score}{' '}
                      <span className={`text-sm font-normal ${classes.mutedText}`}>/10</span>
                    </p>
                  </div>
                  <p className={`text-xs ${classes.mutedText} mt-1`}>{formatTimestamp(a.takenAt)}</p>
                  {a.reviewable ? (
                    <ConfigChips settings={a.settings} wrap className="mt-2" />
                  ) : (
                    <p className={`text-xs italic ${classes.mutedText} mt-2`}>
                      Score only — saved before this quiz was edited.
                    </p>
                  )}
                  {isCurrent && (
                    <p className={`text-xs italic ${classes.mutedText} mt-2`}>
                      You're viewing this attempt now.
                    </p>
                  )}
                </>
              );

              return (
                <li key={a.attemptId} className={`${classes.innerBg} rounded-xl`}>
                  {openable ? (
                    <button
                      type="button"
                      onClick={() => close(() => onSelect(a, index))}
                      className="w-full text-left p-4 rounded-xl hover:ring-2 hover:ring-indigo-500/40 transition-all"
                      title="Open this attempt"
                    >
                      {body}
                    </button>
                  ) : (
                    <div className="p-4 opacity-75">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryPane;
