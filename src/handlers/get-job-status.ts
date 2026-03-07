import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getJobById } from '../services/job-service.js';
import { logError } from '../shared/logger.js';
import { jsonResponse } from '../shared/utils.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const jobId = event.pathParameters?.jobId;

  if (!jobId) {
    return jsonResponse(400, { message: 'jobId is required' });
  }

  try {
    const job = await getJobById(jobId);

    if (!job) {
      return jsonResponse(404, { message: 'Job not found' });
    }

    return jsonResponse(200, job);
  } catch (error) {
    logError('Failed to get job status', {
      jobId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return jsonResponse(500, { message: 'Internal server error' });
  }
}