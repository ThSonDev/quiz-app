// Pure URL-safety helpers for the share proxy (api/proxy.js) and the client-side
// Share dialog. No Node/browser/env dependencies, so they unit-test directly and
// the same rules apply on both sides of the wire.

// True if a hostname points at a private, loopback, link-local, or
// cloud-metadata address — the things an SSRF guard must refuse to fetch.
export function isPrivateHost(host) {
    if (!host) return true;
    // Strip IPv6 brackets and any zone id, lowercase for comparison.
    const h = host.replace(/^\[/, '').replace(/\]$/, '').replace(/%.*$/, '').toLowerCase();

    if (h === 'localhost' || h.endsWith('.localhost')) return true;
    if (h === '0.0.0.0' || h === '::1' || h === '::') return true;

    // IPv4 literal ranges.
    const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (m) {
        const a = Number(m[1]);
        const b = Number(m[2]);
        if ([a, b, Number(m[3]), Number(m[4])].some((n) => n > 255)) return true; // malformed → refuse
        if (a === 0 || a === 10 || a === 127) return true;          // this-host / private / loopback
        if (a === 169 && b === 254) return true;                    // link-local + cloud metadata (169.254.169.254)
        if (a === 172 && b >= 16 && b <= 31) return true;           // private
        if (a === 192 && b === 168) return true;                    // private
        if (a === 100 && b >= 64 && b <= 127) return true;          // CGNAT
        return false;
    }

    // IPv6 unique-local (fc00::/7) and link-local (fe80::/10).
    if (/^f[cd][0-9a-f]*:/.test(h)) return true;
    if (/^fe[89ab][0-9a-f]*:/.test(h)) return true;

    return false;
}

// Returns an error string if `raw` is not a safe URL to fetch, else null.
export function rejectUnsafeUrl(raw) {
    if (!raw || typeof raw !== 'string') return 'Missing url';
    let u;
    try {
        u = new URL(raw);
    } catch {
        return 'Invalid url';
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return 'Only http(s) URLs are allowed';
    }
    if (isPrivateHost(u.hostname)) {
        return 'Refusing to fetch a private or local address';
    }
    return null;
}

// Allowlist for the proxy's Origin check. A same-origin browser GET often omits
// Origin entirely (null) — that's our own app, so allow it. Otherwise only the
// configured production origin, localhost, and *.vercel.app preview deploys pass.
export function isAllowedOrigin(origin, prodOrigin) {
    if (!origin) return true;
    if (prodOrigin && origin === prodOrigin) return true;
    let u;
    try {
        u = new URL(origin);
    } catch {
        return false;
    }
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (host === 'vercel.app' || host.endsWith('.vercel.app')) return true;
    return false;
}
