import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseShareParams,
  buildShareUrl,
  normalizeSize,
  quizNameFromUrl,
} from '../../src/utils/share.js';

const ORIGIN = 'https://quiz.example.com';

test('parseShareParams returns null when there is no quiz param', () => {
  assert.equal(parseShareParams(''), null);
  assert.equal(parseShareParams('?sq=1&size=50'), null);
});

test('parseShareParams reads url, qid, and decodes the source URL', () => {
  const src = 'https://gist.githubusercontent.com/u/abc/raw/quiz.json';
  const parsed = parseShareParams(`?quiz=${encodeURIComponent(src)}&qid=abc123`);
  assert.equal(parsed.url, src);
  assert.equal(parsed.qid, 'abc123');
});

test('parseShareParams defaults qid to null and shuffles to false', () => {
  const parsed = parseShareParams('?quiz=https://x.com/q.json');
  assert.equal(parsed.qid, null);
  assert.deepEqual(parsed.settings, {
    shuffleQuestions: false,
    shuffleOptions: false,
    quizSizeMode: 'percentage',
    quizSize: 100,
  });
});

test('parseShareParams reads shuffle flags and percentage size', () => {
  const parsed = parseShareParams('?quiz=https://x.com/q.json&sq=1&so=1&size=50&mode=pct');
  assert.equal(parsed.settings.shuffleQuestions, true);
  assert.equal(parsed.settings.shuffleOptions, true);
  assert.equal(parsed.settings.quizSizeMode, 'percentage');
  assert.equal(parsed.settings.quizSize, 50);
});

test('parseShareParams reads count mode', () => {
  const parsed = parseShareParams('?quiz=https://x.com/q.json&size=7&mode=count');
  assert.equal(parsed.settings.quizSizeMode, 'count');
  assert.equal(parsed.settings.quizSize, 7);
});

test('normalizeSize clamps and falls back to a full quiz on bad input', () => {
  assert.deepEqual(normalizeSize('50', 'percentage'), { quizSizeMode: 'percentage', quizSize: 50 });
  assert.deepEqual(normalizeSize('5', 'percentage'), { quizSizeMode: 'percentage', quizSize: 10 }); // min 10
  assert.deepEqual(normalizeSize('250', 'percentage'), { quizSizeMode: 'percentage', quizSize: 100 }); // max 100
  assert.deepEqual(normalizeSize('abc', 'percentage'), { quizSizeMode: 'percentage', quizSize: 100 });
  assert.deepEqual(normalizeSize('7', 'count'), { quizSizeMode: 'count', quizSize: 7 });
  assert.deepEqual(normalizeSize('1', 'count'), { quizSizeMode: 'percentage', quizSize: 100 }); // count < 2 → full
  assert.deepEqual(normalizeSize(null, 'count'), { quizSizeMode: 'percentage', quizSize: 100 });
});

test('buildShareUrl encodes only non-default settings', () => {
  const link = buildShareUrl(ORIGIN, {
    url: 'https://x.com/q.json',
    qid: 'h1',
    settings: { shuffleQuestions: false, shuffleOptions: false, quizSizeMode: 'percentage', quizSize: 100 },
  });
  const params = new URL(link).searchParams;
  assert.equal(params.get('quiz'), 'https://x.com/q.json');
  assert.equal(params.get('qid'), 'h1');
  assert.equal(params.has('sq'), false);
  assert.equal(params.has('so'), false);
  assert.equal(params.has('size'), false);
});

test('buildShareUrl includes size for count mode and percentage < 100', () => {
  const pct = new URL(
    buildShareUrl(ORIGIN, {
      url: 'https://x.com/q.json',
      qid: 'h1',
      settings: { shuffleQuestions: true, shuffleOptions: false, quizSizeMode: 'percentage', quizSize: 50 },
    }),
  ).searchParams;
  assert.equal(pct.get('sq'), '1');
  assert.equal(pct.has('so'), false);
  assert.equal(pct.get('size'), '50');
  assert.equal(pct.get('mode'), 'pct');

  const count = new URL(
    buildShareUrl(ORIGIN, {
      url: 'https://x.com/q.json',
      qid: 'h1',
      settings: { shuffleQuestions: false, shuffleOptions: false, quizSizeMode: 'count', quizSize: 5 },
    }),
  ).searchParams;
  assert.equal(count.get('size'), '5');
  assert.equal(count.get('mode'), 'count');
});

test('build → parse round-trips url, qid, and settings', () => {
  const settings = { shuffleQuestions: true, shuffleOptions: true, quizSizeMode: 'count', quizSize: 8 };
  const url = 'https://gist.githubusercontent.com/u/abc/raw/my quiz.json';
  const link = buildShareUrl(ORIGIN, { url, qid: 'deadbeef', settings });
  const parsed = parseShareParams(new URL(link).search);
  assert.equal(parsed.url, url);
  assert.equal(parsed.qid, 'deadbeef');
  assert.deepEqual(parsed.settings, settings);
});

test('quizNameFromUrl derives a name from the last path segment, without extension', () => {
  assert.equal(quizNameFromUrl('https://x.com/path/to/history-quiz.json'), 'history-quiz');
  assert.equal(quizNameFromUrl('https://x.com/my%20quiz.txt'), 'my quiz');
  assert.equal(quizNameFromUrl('https://x.com/no-extension'), 'no-extension');
  assert.equal(quizNameFromUrl('https://x.com/'), 'Shared quiz');
  assert.equal(quizNameFromUrl('not a url'), 'Shared quiz');
});
