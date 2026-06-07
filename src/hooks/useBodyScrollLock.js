import { useEffect } from 'react';

// Locks `document.body` scroll while mounted, reference-counted so stacked
// lockers (e.g. the history pane opened on top of the library pane) compose
// correctly: the original overflow is only restored once the last locker
// unmounts, regardless of unmount order. A plain save/restore-previous effect
// breaks here — whichever overlay cleans up last can restore the *other*
// overlay's "hidden" and leave the page unscrollable.
let lockCount = 0;
let savedOverflow = '';

export function useBodyScrollLock() {
  useEffect(() => {
    if (lockCount === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = savedOverflow;
      }
    };
  }, []);
}
