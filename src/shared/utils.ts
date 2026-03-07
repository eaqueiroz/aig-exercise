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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Content-Type': 'application/json'
};

export function jsonResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  };
}