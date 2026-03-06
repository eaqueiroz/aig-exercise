export type JobStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';

export interface TopToken {
  token: string;
  count: number;
}

export interface ProcessingResult {
  wordCount: number;
  uniqueWordCount: number;
  topTokens: TopToken[];
}

export interface JobRecord {
  jobId: string;
  status: JobStatus;
  fileName: string;
  contentType: string;
  s3Bucket: string;
  s3Key: string;
  createdAt: string;
  updatedAt: string;
  correlationId: string;
  result?: ProcessingResult;
  error?: string;
}