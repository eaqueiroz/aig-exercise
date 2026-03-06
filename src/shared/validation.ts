import { ALLOWED_CONTENT_TYPES } from './constants.js';

export interface CreateUploadRequest {
  fileName: string;
  contentType: string;
}

export function validateCreateUploadRequest(body: unknown): CreateUploadRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body is required');
  }

  const candidate = body as Record<string, unknown>;
  const fileName = candidate.fileName;
  const contentType = candidate.contentType;

  if (typeof fileName !== 'string' || fileName.trim().length === 0) {
    throw new Error('fileName is required');
  }

  if (typeof contentType !== 'string' || !ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new Error('Unsupported contentType');
  }

  return {
    fileName: fileName.trim(),
    contentType
  };
}