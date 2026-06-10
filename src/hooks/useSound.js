import { useCallback, useEffect } from 'react';

let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

const bufferCache = new Map();

function loadBuffer(src) {
  if (!bufferCache.has(src)) {
    bufferCache.set(
      src,
      fetch(src)
        .then((r) => r.arrayBuffer())
        .then((data) => getCtx().decodeAudioData(data))
        .catch(() => null)
    );
  }
  return bufferCache.get(src);
}

export function useSound(src) {
  // Kick off the fetch early so the buffer is ready before play() is called.
  useEffect(() => {
    loadBuffer(src);
  }, [src]);

  const play = useCallback(() => {
    loadBuffer(src).then(async (buf) => {
      if (!buf) return;
      const context = getCtx();
      if (context.state === 'suspended') await context.resume();
      const source = context.createBufferSource();
      source.buffer = buf;
      source.connect(context.destination);
      source.start(0);
    });
  }, [src]);

  return play;
}
