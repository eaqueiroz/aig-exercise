import { ulid } from 'ulid';

export function nowIso() {
  return new Date().toISOString();
}

export function generateJobId() {
  return ulid();
}

export function generateCorrelationId() {
  return ulid();
}

export function jsonResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}