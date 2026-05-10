import { useTheme } from '../../contexts/useTheme';

// Generic centered modal. Caller supplies the action buttons via `children`,
// which are stacked vertically with consistent spacing.
const Modal = ({ title, description, children }) => {
  const { classes } = useTheme();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${classes.cardBg} rounded-xl shadow-2xl p-6 max-w-md w-full animate-fadeInUp`}>
        <h3 className={`text-xl font-bold ${classes.textColor} mb-4`}>{title}</h3>
        {description && <p className={`${classes.mutedText} mb-6`}>{description}</p>}
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
