import test from 'node:test';
import assert from 'node:assert/strict';
import { jsonResponse } from '../src/shared/utils.js';

test('jsonResponse returns statusCode and stringified body', () => {
  const res = jsonResponse(200, { jobId: '01HXYZ', status: 'PENDING' });

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers?.['Content-Type'], 'application/json');
  assert.equal(typeof res.body, 'string');
  assert.deepEqual(JSON.parse(res.body), { jobId: '01HXYZ', status: 'PENDING' });
});

test('jsonResponse handles 400 and error payload', () => {
  const res = jsonResponse(400, { message: 'Bad request' });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(JSON.parse(res.body), { message: 'Bad request' });
});

test('jsonResponse handles 404', () => {
  const res = jsonResponse(404, { message: 'Job not found' });

  assert.equal(res.statusCode, 404);
  assert.deepEqual(JSON.parse(res.body), { message: 'Job not found' });
});
