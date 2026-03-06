import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getJob } from '../services/job-service.js';
import { jsonResponse } from '../shared/utils.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const jobId = event.pathParameters?.jobId;

  if (!jobId) {
    return jsonResponse(400, { message: 'jobId is required' });
  }

  const job = await getJob(jobId);

  if (!job) {
    return jsonResponse(404, { message: 'Job not found' });
  }

  return jsonResponse(200, job);
}