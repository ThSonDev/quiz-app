// Quiz sharing by link. A share link carries the source file URL, an optional
// content-hash (`qid`) that lets a returning friend skip the re-fetch, and the
// quiz settings to apply. The file itself is fetched through our stateless proxy
// (api/proxy.js) and validated client-side. Pure helpers (parseShareParams /
// buildShareUrl / normalizeSize) are unit-tested; fetchSharedQuiz does the I/O.

import { parseQuizText, stripQuizExtension } from './utils.js';

export const SHARE_PARAM = 'quiz';
const PROXY_ENDPOINT = '/api/proxy';

// Map a raw `size`/`mode` pair to a clamped { quizSizeMode, quizSize }. Anything
// missing or out of range falls back to a full (100%) quiz rather than erroring,
// so a malformed link still produces a runnable quiz.
export function normalizeSize(rawSize, rawMode) {
    const n = parseInt(rawSize, 10);
    if (rawMode === 'count') {
        if (Number.isFinite(n) && n >= 2) return { quizSizeMode: 'count', quizSize: n };
        return { quizSizeMode: 'percentage', quizSize: 100 };
    }
    if (Number.isFinite(n)) {
        return { quizSizeMode: 'percentage', quizSize: Math.min(100, Math.max(10, n)) };
    }
    return { quizSizeMode: 'percentage', quizSize: 100 };
}

// Parse a location.search string into a share request, or null when this isn't a
// share link (no `quiz` param). Settings are clamped here, never trusted raw.
export function parseShareParams(search) {
    const p = new URLSearchParams(search);
    const url = p.get(SHARE_PARAM);
    if (!url) return null;
    return {
        url,
        qid: p.get('qid') || null,
        settings: {
            shuffleQuestions: p.get('sq') === '1',
            shuffleOptions: p.get('so') === '1',
            ...normalizeSize(p.get('size'), p.get('mode') === 'count' ? 'count' : 'percentage'),
        },
    };
}

// Build a shareable link from a source URL, content hash, and settings. Only
// non-default settings are encoded, keeping links short (a fully-default run is
// just `?quiz=<url>&qid=<hash>`). `origin` is the app's origin (no trailing /).
export function buildShareUrl(origin, { url, qid, settings }) {
    const p = new URLSearchParams();
    p.set(SHARE_PARAM, url);
    if (qid) p.set('qid', qid);
    if (settings.shuffleQuestions) p.set('sq', '1');
    if (settings.shuffleOptions) p.set('so', '1');
    const includeSize =
        settings.quizSizeMode === 'count' ||
        (settings.quizSizeMode === 'percentage' && settings.quizSize < 100);
    if (includeSize) {
        p.set('size', String(settings.quizSize));
        p.set('mode', settings.quizSizeMode === 'count' ? 'count' : 'pct');
    }
    return `${origin}/?${p.toString()}`;
}

// Derive a friendly quiz name from the source URL's last path segment, without
// its file extension (so a later download doesn't compound extensions).
export function quizNameFromUrl(url) {
    try {
        const last = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() || '');
        return stripQuizExtension(last) || 'Shared quiz';
    } catch {
        return 'Shared quiz';
    }
}

// Fetch a shared quiz through the proxy and validate it. Returns { data } or
// { error } (same shape as readQuizFile). The proxy returns the raw file text;
// all parsing/validation happens here so the trust boundary stays client-side.
export async function fetchSharedQuiz(url) {
    let res;
    try {
        res = await fetch(`${PROXY_ENDPOINT}?url=${encodeURIComponent(url)}`);
    } catch {
        return { error: 'Could not reach the quiz source. Check the link and your connection.' };
    }
    const text = await res.text();
    if (!res.ok) {
        let message = 'Could not load the shared quiz.';
        try {
            message = JSON.parse(text).error || message;
        } catch {
            /* non-JSON error body: keep the default message */
        }
        return { error: message };
    }
    return parseQuizText(text);
}
