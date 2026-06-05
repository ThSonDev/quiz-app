import { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/useTheme';

const formatTime = (ts) =>
  new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

// Slide-over panel listing the user's saved quizzes. Presentational: the parent
// owns the entries and persistence, this only fires callbacks. Entries arrive
// pre-sorted (bookmarked first, newest first).
const QuizLibraryPane = ({ entries, onSelect, onToggleBookmark, onRemove, onClose }) => {
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

  // Lock background scroll while the pane is open; restore on close/unmount.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className={`text-sm ${classes.mutedText} mb-5`}>
          Select a quiz to load it, then configure and start from the upload page.
        </p>

        {entries.length === 0 ? (
          <p className={classes.mutedText}>No saved quizzes yet.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => (
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
                      <svg
                        className="w-5 h-5"
                        fill={e.bookmarked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.48 3.5a.56.56 0 011.04 0l2.13 5.11a.56.56 0 00.47.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 00-.18.56l1.28 5.38a.56.56 0 01-.84.61l-4.72-2.88a.56.56 0 00-.59 0l-4.72 2.88a.56.56 0 01-.84-.61l1.28-5.38a.56.56 0 00-.18-.56l-4.2-3.6a.56.56 0 01.32-.99l5.52-.44a.56.56 0 00.47-.35L11.48 3.5z"
                        />
                      </svg>
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.87 12.14A2 2 0 0116.14 21H7.86a2 2 0 01-1.99-1.86L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

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
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QuizLibraryPane;
