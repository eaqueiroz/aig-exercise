import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { getJobById } from '../services/job-service.js';
import { jsonResponse } from '../shared/utils.js';

export async function handler(event: APIGatewayProxyEventV2) {
  const jobId = event.pathParameters?.jobId;

  if (!jobId) {
    return jsonResponse(400, { message: 'jobId is required' });
  }

  const job = await getJobById(jobId);

  if (!job) {
    return jsonResponse(404, { message: 'Job not found' });
  }

  return jsonResponse(200, job);
}