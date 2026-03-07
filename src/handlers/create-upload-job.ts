import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createJob } from '../services/job-service.js';
import { createPresignedUploadUrl } from '../services/s3-service.js';
import { logError } from '../shared/logger.js';
import { generateCorrelationId, generateJobId, jsonResponse, nowIso } from '../shared/utils.js';
import { validateCreateUploadRequest } from '../shared/validation.js';
import type { JobRecord } from '../shared/types.js';
import { JOB_STATUS, MAX_FILE_SIZE_BYTES } from '../shared/constants.js';

const bucketName: string = process.env.UPLOAD_BUCKET_NAME ?? '';
if (!bucketName) {
  throw new Error('UPLOAD_BUCKET_NAME is not configured');
}

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const body = event.body ? JSON.parse(event.body) : undefined;
    const request = validateCreateUploadRequest(body);

    const jobId = generateJobId();
    const correlationId = generateCorrelationId();
    const s3Key = `uploads/${jobId}/${request.fileName}`;
    const now = nowIso();

    const newJob: JobRecord = {
      jobId,
      status: JOB_STATUS.PENDING,
      fileName: request.fileName,
      contentType: request.contentType,
      s3Bucket: bucketName,
      s3Key,
      createdAt: now,
      updatedAt: now,
      correlationId
    };
    await createJob(newJob);

    const uploadUrl = await createPresignedUploadUrl({
      bucket: bucketName,
      key: s3Key,
      contentType: request.contentType
    });

    return jsonResponse(200, {
      jobId,
      status: JOB_STATUS.PENDING,
      s3Key,
      correlationId,
      uploadUrl,
      maxFileSize: MAX_FILE_SIZE_BYTES
    });
  } catch (error) {
    logError('Failed to create upload job', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return jsonResponse(400, {
      message: error instanceof Error ? error.message : 'Bad request'
    });
  }
}