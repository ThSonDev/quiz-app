import test from 'node:test';
import assert from 'node:assert/strict';
import { downloadQuizFile } from '../../src/utils/utils.js';

test('downloads quiz data with sanitized filename and matching JSON MIME type', () => {
  const calls = [];
  const link = {
    href: '',
    download: '',
    click: () => calls.push(['click']),
  };
  const originalDocument = globalThis.document;
  const originalUrl = globalThis.URL;

  globalThis.document = {
    createElement: (tag) => {
      assert.equal(tag, 'a');
      calls.push(['createElement', tag]);
      return link;
    },
    body: {
      appendChild: (node) => calls.push(['appendChild', node]),
      removeChild: (node) => calls.push(['removeChild', node]),
    },
  };
  globalThis.URL = {
    createObjectURL: (blob) => {
      calls.push(['createObjectURL', blob.type]);
      return 'blob:quiz';
    },
    revokeObjectURL: (url) => calls.push(['revokeObjectURL', url]),
  };

  try {
    downloadQuizFile({ questions: [] }, 'bad/name:*?', 'json');

    assert.equal(link.href, 'blob:quiz');
    assert.equal(link.download, 'bad_name___.json');
    assert.deepEqual(calls.map((call) => call[0]), [
      'createObjectURL',
      'createElement',
      'appendChild',
      'click',
      'removeChild',
      'revokeObjectURL',
    ]);
    assert.deepEqual(calls[0], ['createObjectURL', 'application/json']);
  } finally {
    globalThis.document = originalDocument;
    globalThis.URL = originalUrl;
  }
});

test('falls back to quiz.txt and text MIME type when no filename is provided', () => {
  const link = { click: () => {} };
  const originalDocument = globalThis.document;
  const originalUrl = globalThis.URL;
  let mimeType = '';

  globalThis.document = {
    createElement: () => link,
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
  };
  globalThis.URL = {
    createObjectURL: (blob) => {
      mimeType = blob.type;
      return 'blob:quiz';
    },
    revokeObjectURL: () => {},
  };

  try {
    downloadQuizFile({ questions: [] }, '   ', 'txt');

    assert.equal(link.download, 'quiz.txt');
    assert.equal(mimeType, 'text/plain');
  } finally {
    globalThis.document = originalDocument;
    globalThis.URL = originalUrl;
  }
});
