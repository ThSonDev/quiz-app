import { useTheme } from '../../contexts/useTheme';

// Previous / "Page X of Y" / Next control. Renders nothing for a single page.
// `page` is zero-based; `onChange` receives the requested zero-based page.
const Pagination = ({ page, totalPages, onChange, className = '' }) => {
  const { classes } = useTheme();
  if (totalPages <= 1) return null;

  const btn = `px-4 py-2 rounded-lg font-medium transition-all ${classes.secondaryBtn} disabled:opacity-40 disabled:cursor-not-allowed`;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 0} className={btn}>
        Previous
      </button>
      <span className={`text-sm font-medium ${classes.mutedText}`}>
        Page {page + 1} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages - 1}
        className={btn}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
