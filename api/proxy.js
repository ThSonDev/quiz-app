// Stateless CORS/fetch proxy for the quiz-sharing feature. It exists only to get
// around browser CORS when fetching a quiz file from a public host (e.g. a GitHub
// gist raw URL). It is deliberately dumb: fetch the URL, size-cap it, and return
// the raw text. All JSON parsing and validation happen client-side. It persists
// nothing and logs nothing (privacy-first).
//
// Runs on Vercel's Edge runtime — no Node APIs, just web globals (fetch, Response,
// URL, AbortController). Lives in /api so Vercel deploys it at /api/proxy.

import { rejectUnsafeUrl, isAllowedOrigin } from '../src/utils/urlSafety.js';

export const config = { runtime: 'edge' };

const MAX_BYTES = 1_000_000; // quiz JSON is KBs; 1 MB is a generous ceiling
const FETCH_TIMEOUT_MS = 5000; // fail well before Vercel's 10s hard limit

const json = (body, status, headers) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { ...headers, 'Content-Type': 'application/json' },
    });

export default async function handler(req) {
    // Lock the proxy to our own app. CORS is browser-only, so this also restricts
    // which page can invoke it; ALLOWED_ORIGIN can pin a custom production domain.
    const prodOrigin = (globalThis.process?.env?.ALLOWED_ORIGIN) || null;
    const origin = req.headers.get('origin');
    const cors = {
        'Access-Control-Allow-Origin': origin || prodOrigin || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Vary': 'Origin',
    };

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405, cors);
    if (!isAllowedOrigin(origin, prodOrigin)) return json({ error: 'Forbidden origin' }, 403, cors);

    const target = new URL(req.url).searchParams.get('url');
    const unsafe = rejectUnsafeUrl(target);
    if (unsafe) return json({ error: unsafe }, 400, cors);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const upstream = await fetch(target, { signal: controller.signal, redirect: 'follow' });
        if (!upstream.ok) return json({ error: `Source returned ${upstream.status}` }, 502, cors);

        // Read with a hard byte cap without trusting the Content-Length header.
        const buf = await upstream.arrayBuffer();
        if (buf.byteLength > MAX_BYTES) return json({ error: 'Quiz file is too large' }, 413, cors);

        return new Response(buf, {
            status: 200,
            headers: { ...cors, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
        });
    } catch (err) {
        const message = err && err.name === 'AbortError' ? 'Source timed out' : 'Could not fetch the source';
        return json({ error: message }, 502, cors);
    } finally {
        clearTimeout(timer);
    }
}
