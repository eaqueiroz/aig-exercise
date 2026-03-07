import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCreateUploadRequest } from '../src/shared/validation.js';

test('validateCreateUploadRequest accepts valid body', () => {
  const result = validateCreateUploadRequest({
    fileName: 'doc.txt',
    contentType: 'text/plain'
  });

  assert.equal(result.fileName, 'doc.txt');
  assert.equal(result.contentType, 'text/plain');
});

test('validateCreateUploadRequest trims fileName', () => {
  const result = validateCreateUploadRequest({
    fileName: '  doc.txt  ',
    contentType: 'text/plain'
  });

  assert.equal(result.fileName, 'doc.txt');
});

test('validateCreateUploadRequest throws when body is missing', () => {
  assert.throws(
    () => validateCreateUploadRequest(undefined),
    { message: 'Request body is required' }
  );
});

test('validateCreateUploadRequest throws when body is null', () => {
  assert.throws(
    () => validateCreateUploadRequest(null),
    { message: 'Request body is required' }
  );
});

test('validateCreateUploadRequest throws when body is not an object', () => {
  assert.throws(
    () => validateCreateUploadRequest('string'),
    { message: 'Request body is required' }
  );
});

test('validateCreateUploadRequest throws when fileName is missing', () => {
  assert.throws(
    () => validateCreateUploadRequest({ contentType: 'text/plain' }),
    { message: 'fileName is required' }
  );
});

test('validateCreateUploadRequest throws when fileName is empty string', () => {
  assert.throws(
    () => validateCreateUploadRequest({ fileName: '', contentType: 'text/plain' }),
    { message: 'fileName is required' }
  );
});

test('validateCreateUploadRequest throws when fileName is whitespace only', () => {
  assert.throws(
    () => validateCreateUploadRequest({ fileName: '   ', contentType: 'text/plain' }),
    { message: 'fileName is required' }
  );
});

test('validateCreateUploadRequest throws when contentType is unsupported', () => {
  assert.throws(
    () => validateCreateUploadRequest({ fileName: 'x.txt', contentType: 'application/pdf' }),
    { message: 'Unsupported contentType' }
  );
});

test('validateCreateUploadRequest throws when contentType is missing', () => {
  assert.throws(
    () => validateCreateUploadRequest({ fileName: 'x.txt' }),
    { message: 'Unsupported contentType' }
  );
});
