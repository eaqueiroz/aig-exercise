import test from 'node:test';
import assert from 'node:assert/strict';
import { processText } from '../src/services/text-processor.js';
import { MAX_TOP_TOKENS } from '../src/shared/constants.js';

test('processText returns word count and unique word count', () => {
  const result = processText('AWS Lambda AWS DynamoDB lambda');

  assert.equal(result.wordCount, 5);
  assert.equal(result.uniqueWordCount, 3);
});

test('processText returns topTokens sorted by count descending', () => {
  const result = processText('AWS Lambda AWS DynamoDB lambda');

  assert.equal(result.topTokens.length, 3);
  assert.deepEqual(result.topTokens[0], { token: 'aws', count: 2 });
  assert.deepEqual(result.topTokens[1], { token: 'lambda', count: 2 });
  assert.deepEqual(result.topTokens[2], { token: 'dynamodb', count: 1 });
});

test('processText normalizes to lowercase', () => {
  const result = processText('Hello HELLO hello');

  assert.equal(result.wordCount, 3);
  assert.equal(result.uniqueWordCount, 1);
  assert.deepEqual(result.topTokens, [{ token: 'hello', count: 3 }]);
});

test('processText caps topTokens at MAX_TOP_TOKENS', () => {
  const words = Array.from({ length: 20 }, (_, i) => `word${i}`).join(' ');
  const result = processText(words);

  assert.equal(result.wordCount, 20);
  assert.equal(result.uniqueWordCount, 20);
  assert.equal(result.topTokens.length, MAX_TOP_TOKENS);
});

test('processText handles empty string', () => {
  const result = processText('');

  assert.equal(result.wordCount, 0);
  assert.equal(result.uniqueWordCount, 0);
  assert.deepEqual(result.topTokens, []);
});

test('processText ignores punctuation and counts words only', () => {
  const result = processText('one, two. three! four?');

  assert.equal(result.wordCount, 4);
  assert.equal(result.uniqueWordCount, 4);
  assert.equal(result.topTokens.length, 4);
});

test('processText handles contractions (apostrophes in token regex)', () => {
  const result = processText("don't stop");

  assert.equal(result.wordCount, 2);
  assert.equal(result.uniqueWordCount, 2);
});