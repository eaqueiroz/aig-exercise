import type { S3Event } from 'aws-lambda';
import { getJobById, markDone, markFailed, markProcessing } from '../services/job-service';
import { getObjectText } from '../services/s3-service';
import { processText } from '../services/text-processor';
import { logError, logInfo } from '../shared/logger';

export async function handler(event: S3Event): Promise<void> {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    const parts = key.split('/');
    const jobId = parts.length >= 2 ? parts[1] : undefined;

    try {
      if (!jobId) {
        throw new Error('invalid file name');
      }

      const job = await getJobById(jobId);

      if (!job) {
        throw new Error('Job not found for uploaded file');
      }

      if (job.status === 'DONE') {
        logInfo('Skipping already completed job', { jobId, key });
        continue;
      }

      await markProcessing(jobId);
      logInfo('Processing started', {
        jobId,
        correlationId: job.correlationId,
        bucket,
        key
      });

      // this code is for testing the DLQ and Indepotency
      // randomly fail 50% of the time
      if (Math.random() < 1) {
        throw new Error('Dead Letter Queue failure test');
      }

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

      if (jobId) {
        await markFailed(jobId, message);

        logError('Processing failed', {
          jobId,
          error: message
        });

        // make sure to throw the error so it goes to the DLQ
        throw new Error(message);
      }
    }
  }
}