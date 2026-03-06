import test from 'node:test';
import assert from 'node:assert/strict';
import { processText } from '../src/services/text-processor.js';

test('processText works', () => {
  const result = processText('AWS Lambda AWS DynamoDB lambda');

  assert.equal(result.wordCount, 5);
  assert.equal(result.uniqueWordCount, 3);
});