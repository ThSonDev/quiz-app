// Shared inline-SVG icon set. Each icon is a small component taking `className`
// (default w-5 h-5), plus optional `strokeWidth`/`fill` overrides. Centralizes
// the path data that was previously duplicated across pages and widgets.

const makeIcon = (paths, { strokeWidth: defaultStroke = 2, fill: defaultFill = 'none' } = {}) => {
  const list = Array.isArray(paths) ? paths : [paths];
  const Icon = ({ className = 'w-5 h-5', strokeWidth = defaultStroke, fill = defaultFill }) => (
    <svg className={className} fill={fill} stroke="currentColor" viewBox="0 0 24 24">
      {list.map((d, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d={d} />
      ))}
    </svg>
  );
  return Icon;
};

export const IconUpload = makeIcon(
  'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
);
export const IconArrowRight = makeIcon('M13 7l5 5m0 0l-5 5m5-5H6');
export const IconChevronRight = makeIcon('M9 5l7 7-7 7');
export const IconChevronLeft = makeIcon('M15 19l-7-7 7-7');
export const IconClose = makeIcon('M6 18L18 6M6 6l12 12');
export const IconPencil = makeIcon(
  'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
);
export const IconTrash = makeIcon(
  'M19 7l-.87 12.14A2 2 0 0116.14 21H7.86a2 2 0 01-1.99-1.86L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16'
);
export const IconStar = makeIcon(
  'M11.48 3.5a.56.56 0 011.04 0l2.13 5.11a.56.56 0 00.47.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 00-.18.56l1.28 5.38a.56.56 0 01-.84.61l-4.72-2.88a.56.56 0 00-.59 0l-4.72 2.88a.56.56 0 01-.84-.61l1.28-5.38a.56.56 0 00-.18-.56l-4.2-3.6a.56.56 0 01.32-.99l5.52-.44a.56.56 0 00.47-.35L11.48 3.5z'
);
export const IconDocument = makeIcon(
  'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
);
export const IconCheck = makeIcon('M5 13l4 4L19 7', { strokeWidth: 3 });
export const IconReturnUpload = makeIcon(
  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
);
export const IconEye = makeIcon([
  'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
]);
export const IconRetry = makeIcon(
  'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
);
export const IconSun = makeIcon(
  'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
);
export const IconMoon = makeIcon(
  'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
);
