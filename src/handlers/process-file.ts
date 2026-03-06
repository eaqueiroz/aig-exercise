import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createJob } from '../services/job-service';
import { createPresignedUploadUrl } from '../services/s3-service';
import { logError, logInfo } from '../shared/logger';
import { generateCorrelationId, generateJobId, jsonResponse, nowIso } from '../shared/utils';
import { validateCreateUploadRequest } from '../shared/validation';
import type { JobRecord } from '../shared/types';

const bucketName: string = process.env.UPLOAD_BUCKET_NAME || '';
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

    const job: JobRecord = {
      jobId,
      status: 'PENDING',
      fileName: request.fileName,
      contentType: request.contentType,
      s3Bucket: bucketName,
      s3Key,
      createdAt: now,
      updatedAt: now,
      correlationId
    };

    await createJob(job);

    const uploadUrl = await createPresignedUploadUrl({
      bucket: bucketName,
      key: s3Key,
      contentType: request.contentType
    });

    logInfo('Created upload job', { jobId, correlationId, s3Key });

    return jsonResponse(201, {
      jobId,
      status: 'PENDING',
      uploadUrl,
      s3Key,
      correlationId
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