export const ALLOWED_CONTENT_TYPES = new Set(['text/plain']);
export const MAX_TOP_TOKENS = 10;
export const JOB_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
  FAILED: 'FAILED'
} as const;