export const ALLOWED_CONTENT_TYPES = new Set(['text/plain']);
export const MAX_TOP_TOKENS = 10;

/** Max allowed file size in bytes. Configurable via MAX_FILE_SIZE env. Default 5 MiB. */
export const MAX_FILE_SIZE_BYTES = Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;
export const JOB_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
  FAILED: 'FAILED'
} as const;