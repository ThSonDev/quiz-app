import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRichText } from '../../src/utils/utils.js';

test('parseRichText returns a single plain line for plain text', () => {
  assert.deepEqual(parseRichText('hello world'), [
    [{ text: 'hello world', bold: false, underline: false }],
  ]);
});

test('parseRichText splits on newlines into separate lines', () => {
  assert.deepEqual(parseRichText('line one\nline two'), [
    [{ text: 'line one', bold: false, underline: false }],
    [{ text: 'line two', bold: false, underline: false }],
  ]);
});

test('parseRichText represents a blank line as an empty segment array', () => {
  assert.deepEqual(parseRichText('a\n\nb'), [
    [{ text: 'a', bold: false, underline: false }],
    [],
    [{ text: 'b', bold: false, underline: false }],
  ]);
});

test('parseRichText marks __text__ as an underlined segment', () => {
  assert.deepEqual(parseRichText('see __this__ word'), [
    [
      { text: 'see ', bold: false, underline: false },
      { text: 'this', bold: false, underline: true },
      { text: ' word', bold: false, underline: false },
    ],
  ]);
});

test('parseRichText marks **text** as a bold segment', () => {
  assert.deepEqual(parseRichText('see **this** word'), [
    [
      { text: 'see ', bold: false, underline: false },
      { text: 'this', bold: true, underline: false },
      { text: ' word', bold: false, underline: false },
    ],
  ]);
});

test('parseRichText handles bold and underline in the same line', () => {
  assert.deepEqual(parseRichText('**bold** and __under__'), [
    [
      { text: 'bold', bold: true, underline: false },
      { text: ' and ', bold: false, underline: false },
      { text: 'under', bold: false, underline: true },
    ],
  ]);
});

test('parseRichText handles multiple underlines and underline at the edges', () => {
  assert.deepEqual(parseRichText('__a__ and __b__'), [
    [
      { text: 'a', bold: false, underline: true },
      { text: ' and ', bold: false, underline: false },
      { text: 'b', bold: false, underline: true },
    ],
  ]);
});

test('parseRichText parses markup within each line independently', () => {
  assert.deepEqual(parseRichText('**top**\nbottom'), [
    [{ text: 'top', bold: true, underline: false }],
    [{ text: 'bottom', bold: false, underline: false }],
  ]);
});

test('parseRichText leaves a lone/unclosed marker as literal text', () => {
  assert.deepEqual(parseRichText('a __ b'), [[{ text: 'a __ b', bold: false, underline: false }]]);
  assert.deepEqual(parseRichText('__unclosed'), [[{ text: '__unclosed', bold: false, underline: false }]]);
  assert.deepEqual(parseRichText('**unclosed'), [[{ text: '**unclosed', bold: false, underline: false }]]);
});

test('parseRichText does not bold/underline empty markers', () => {
  // /__(.+?)__/ and /\*\*(.+?)\*\*/ both require at least one char between markers.
  assert.deepEqual(parseRichText('x ____ y'), [[{ text: 'x ____ y', bold: false, underline: false }]]);
  assert.deepEqual(parseRichText('x **** y'), [[{ text: 'x **** y', bold: false, underline: false }]]);
});

test('parseRichText coerces non-string input to a single empty line', () => {
  assert.deepEqual(parseRichText(null), [[]]);
  assert.deepEqual(parseRichText(undefined), [[]]);
  assert.deepEqual(parseRichText(''), [[]]);
});
