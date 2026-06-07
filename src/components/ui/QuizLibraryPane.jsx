import { useState } from 'react';
import { useTheme } from '../../contexts/useTheme';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { getAttempts } from '../../utils/history';
import { IconClose, IconStar, IconTrash, IconHistory } from './icons';

const formatTime = (ts) =>
  new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

// Slide-over panel listing the user's saved quizzes. Presentational: the parent
// owns the entries and persistence, this only fires callbacks. Entries arrive
// pre-sorted (bookmarked first, newest first). `historyMap` lets each entry
// surface a "Results history" link when that quiz has past attempts; selecting
// it calls onOpenHistory without closing this pane (the history pane stacks on top).
const QuizLibraryPane = ({ entries, historyMap = {}, onSelect, onToggleBookmark, onRemove, onOpenHistory, onClose }) => {
  const { isDarkMode, classes } = useTheme();
  // Two-step delete so a stray tap can't wipe a saved quiz.
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  // Play the exit animation, then run the real action (select/close) which
  // unmounts the pane. Duration matches the slideOutRight/fadeOut timings.
  const [closing, setClosing] = useState(false);
  const close = (action) => {
    if (closing) return;
    setClosing(true);
    setTimeout(action, 250);
  };

  // Lock background scroll while the pane is open (reference-counted so it
  // composes with a history pane stacked on top).
  useBodyScrollLock();

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className={`flex-1 bg-black/40 ${closing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
        onClick={() => close(onClose)}
        aria-hidden="true"
      />
      <div className={`${classes.cardBg} w-full max-w-md h-full overflow-y-auto shadow-2xl p-6 ${closing ? 'animate-slideOutRight' : 'animate-slideInRight'}`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-2xl font-bold ${classes.textColor}`}>Your Saved Quizzes</h2>
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
        <p className={`text-sm ${classes.mutedText} mb-5`}>
          Select a quiz to load it, then configure and start from the upload page.
        </p>

        {entries.length === 0 ? (
          <p className={classes.mutedText}>No saved quizzes yet.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => {
              const attemptCount = getAttempts(historyMap, e.id).length;
              return (
              <li key={e.id} className={`${classes.innerBg} rounded-xl p-4`}>
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => close(() => onSelect(e))}
                    className="flex-1 text-left min-w-0"
                    title="Load this quiz"
                  >
                    <p className={`font-semibold ${classes.textColor} break-words`}>{e.name}</p>
                    <p className={`text-sm ${classes.mutedText}`}>{e.questionCount} questions</p>
                    <p className={`text-xs ${classes.mutedText} mt-1`}>{formatTime(e.uploadedAt)}</p>
                  </button>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleBookmark(e.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        e.bookmarked
                          ? 'text-yellow-400'
                          : `${classes.mutedText} hover:text-yellow-400`
                      }`}
                      aria-label={e.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                      title={e.bookmarked ? 'Remove bookmark' : 'Bookmark to top'}
                    >
                      <IconStar className="w-5 h-5" fill={e.bookmarked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemoveId(e.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        isDarkMode
                          ? 'text-red-400 hover:bg-red-900/40'
                          : 'text-red-600 hover:bg-red-100'
                      }`}
                      aria-label="Remove"
                      title="Remove from library"
                    >
                      <IconTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {attemptCount > 0 && onOpenHistory && (
                  <button
                    type="button"
                    onClick={() => onOpenHistory(e)}
                    className={`mt-2 inline-flex items-center gap-1.5 text-sm font-medium ${
                      isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                    } hover:underline`}
                    title="See past attempts of this quiz"
                  >
                    <IconHistory className="w-4 h-4" />
                    Results history
                    <span className={classes.mutedText}>({attemptCount})</span>
                  </button>
                )}

                {confirmRemoveId === e.id && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-sm ${classes.mutedText}`}>Remove this quiz?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onRemove(e.id);
                        setConfirmRemoveId(null);
                      }}
                      className="px-3 py-1 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemoveId(null)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${classes.secondaryBtn} transition-colors`}
                    >
                      Cancel
                    </button>
                  </div>
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

export default QuizLibraryPane;
