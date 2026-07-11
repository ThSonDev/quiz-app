import { useEffect, useId, useRef } from 'react';
import { useTheme } from '../../contexts/useTheme';

// Generic centered modal. Caller supplies the action buttons via `children`,
// which are stacked vertically with consistent spacing. Pass `onClose` to make
// Escape (and any dismiss) close it; the visible Cancel/dismiss button should
// call the same handler.
const Modal = ({ title, description, children, onClose }) => {
  const { classes } = useTheme();
  const panelRef = useRef(null);
  const titleId = useId();

  // Move focus into the dialog on open, restore it on close, trap Tab inside,
  // and close on Escape. Children are static per open, so capturing the
  // focusable list once at mount is enough.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const focusable = panelRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${classes.cardBg} rounded-xl shadow-2xl p-6 max-w-md w-full animate-fadeInUp`}
      >
        <h3 id={titleId} className={`text-xl font-bold ${classes.textColor} mb-4`}>{title}</h3>
        {description && <p className={`${classes.mutedText} mb-6`}>{description}</p>}
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
