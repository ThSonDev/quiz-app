import test from 'node:test';
import assert from 'node:assert/strict';
import { rejectUnsafeUrl, isPrivateHost, isAllowedOrigin } from '../../src/utils/urlSafety.js';

test('rejectUnsafeUrl accepts public http(s) URLs', () => {
  assert.equal(rejectUnsafeUrl('https://gist.githubusercontent.com/u/abc/raw/quiz.json'), null);
  assert.equal(rejectUnsafeUrl('http://example.com/quiz.json'), null);
});

test('rejectUnsafeUrl refuses missing or malformed input', () => {
  assert.equal(rejectUnsafeUrl(''), 'Missing url');
  assert.equal(rejectUnsafeUrl(null), 'Missing url');
  assert.equal(rejectUnsafeUrl(42), 'Missing url');
  assert.equal(rejectUnsafeUrl('not a url'), 'Invalid url');
});

test('rejectUnsafeUrl refuses non-http(s) schemes', () => {
  assert.equal(rejectUnsafeUrl('ftp://example.com/x'), 'Only http(s) URLs are allowed');
  assert.equal(rejectUnsafeUrl('file:///etc/passwd'), 'Only http(s) URLs are allowed');
  assert.equal(rejectUnsafeUrl('javascript:alert(1)'), 'Only http(s) URLs are allowed');
});

test('rejectUnsafeUrl blocks private, loopback, and metadata hosts (SSRF guard)', () => {
  const blocked = [
    'http://localhost/x',
    'http://app.localhost/x',
    'http://127.0.0.1/x',
    'http://0.0.0.0/x',
    'http://10.0.0.5/x',
    'http://172.16.0.1/x',
    'http://172.31.255.255/x',
    'http://192.168.1.1/x',
    'http://169.254.169.254/latest/meta-data', // cloud metadata
    'http://100.64.0.1/x', // CGNAT
    'http://[::1]/x',
    'http://[fd00::1]/x',
    'http://[fe80::1]/x',
  ];
  for (const u of blocked) {
    assert.equal(rejectUnsafeUrl(u), 'Refusing to fetch a private or local address', u);
  }
});

test('rejectUnsafeUrl allows public IPs just outside private ranges', () => {
  assert.equal(rejectUnsafeUrl('http://172.32.0.1/x'), null);
  assert.equal(rejectUnsafeUrl('http://11.0.0.1/x'), null);
  assert.equal(rejectUnsafeUrl('http://8.8.8.8/x'), null);
});

test('isPrivateHost treats an empty/unknown host as private', () => {
  assert.equal(isPrivateHost(''), true);
  assert.equal(isPrivateHost('example.com'), false);
});

test('isAllowedOrigin permits same-origin (no Origin header)', () => {
  assert.equal(isAllowedOrigin(null), true);
  assert.equal(isAllowedOrigin(undefined), true);
});

test('isAllowedOrigin permits localhost, vercel.app, and the configured prod origin', () => {
  assert.equal(isAllowedOrigin('http://localhost:5173'), true);
  assert.equal(isAllowedOrigin('https://quiz-app.vercel.app'), true);
  assert.equal(isAllowedOrigin('https://quiz-app-git-feature.vercel.app'), true);
  assert.equal(isAllowedOrigin('https://quiz.example.com', 'https://quiz.example.com'), true);
});

test('isAllowedOrigin rejects foreign origins and garbage', () => {
  assert.equal(isAllowedOrigin('https://evil.example.com'), false);
  assert.equal(isAllowedOrigin('https://notvercel.app.evil.com'), false);
  assert.equal(isAllowedOrigin('garbage'), false);
});
