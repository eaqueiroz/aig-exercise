import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createJob, getJobByFileName } from '../services/job-service.js';
import { createPresignedUploadUrl } from '../services/s3-service.js';
import { logError, logInfo } from '../shared/logger.js';
import { generateCorrelationId, generateJobId, jsonResponse, nowIso } from '../shared/utils.js';
import { validateCreateUploadRequest } from '../shared/validation.js';
import type { JobRecord } from '../shared/types.js';

const bucketName:string = process.env.UPLOAD_BUCKET_NAME || '';
if (!bucketName) {
  throw new Error('UPLOAD_BUCKET_NAME is not configured');
}

export async function handler(event: APIGatewayProxyEventV2) {
  try {
    const body = event.body ? JSON.parse(event.body) : undefined;
    const request = validateCreateUploadRequest(body);

    // check if the file name is already in the database
    const job = await getJobByFileName(request.fileName);
    if (job) {
      //return a confilict error
      return jsonResponse(409, {
        message: 'File name already exists'
      });
    }

    const jobId = generateJobId();
    const correlationId = generateCorrelationId();
    const s3Key = `uploads/${jobId}/${request.fileName}`;
    const now = nowIso();

    const newJob: JobRecord = {
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
    await createJob(newJob);

    const uploadUrl = await createPresignedUploadUrl({
      bucket: bucketName,
      key: s3Key,
      contentType: request.contentType
    });

    return jsonResponse(200, {
      jobId,
      status: 'PENDING',
      s3Key,
      correlationId,
      uploadUrl
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