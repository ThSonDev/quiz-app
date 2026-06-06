import { useEffect, useRef } from 'react';

// While the calling component is mounted, intercepts the browser/mobile Back
// action and runs `onBack` instead of leaving the page (e.g. to show an exit
// confirmation). It keeps a single dummy history entry "armed" to absorb the
// next Back, and re-arms after each one so Back never navigates away.
//
// Intentionally does not unwind history on unmount: removing the entry would
// require an async history.back() that races with React StrictMode's
// double-invoked effects and can fire `onBack` spuriously. Skipping push when an
// entry is already armed keeps the dummy entries from accumulating instead.
export function useBackGuard(onBack) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!window.history.state?.backGuard) {
      window.history.pushState({ backGuard: true }, '');
    }

    const handlePopState = () => {
      window.history.pushState({ backGuard: true }, '');
      onBackRef.current();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
}
