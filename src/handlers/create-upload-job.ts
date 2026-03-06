import type { S3Event } from 'aws-lambda';
import { getJob, markDone, markFailed, markProcessing } from '../services/job-service.js';
import { getObjectText } from '../services/s3-service.js';
import { processText } from '../services/text-processor.js';
import { logError, logInfo } from '../shared/logger.js';

export async function handler(event: S3Event): Promise<void> {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    const parts = key.split('/');
    const jobId = parts.length >= 2 ? parts[1] : undefined;

    if (!jobId) {
      logError('Could not derive jobId from S3 key', { key });
      continue;
    }

    const job = await getJob(jobId);

    if (!job) {
      logError('Job not found for uploaded file', { jobId, key });
      continue;
    }

    if (job.status === 'DONE') {
      logInfo('Skipping already completed job', { jobId, key });
      continue;
    }

    const acquired = await markProcessing(jobId);
    if (!acquired) {
      logInfo('Skipping duplicate or already processing event', { jobId, key, currentStatus: job.status });
      continue;
    }

    try {
      logInfo('Processing started', {
        jobId,
        correlationId: job.correlationId,
        bucket,
        key
      });

      const content = await getObjectText({ bucket, key });
      const result = processText(content);

      await markDone(jobId, result);

      logInfo('Processing completed', {
        jobId,
        correlationId: job.correlationId,
        result
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown processing error';

      await markFailed(jobId, message);

      logError('Processing failed', {
        jobId,
        correlationId: job.correlationId,
        error: message
      });
    }
  }
}