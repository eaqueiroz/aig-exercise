import {
    GetCommand,
    PutCommand,
    ScanCommand,
    UpdateCommand
  } from '@aws-sdk/lib-dynamodb';
  import { ddb } from '../shared/dynamo.js';
  import { nowIso } from '../shared/utils.js';
  import type { JobRecord, ProcessingResult } from '../shared/types.js';
  
  const tableName = process.env.JOBS_TABLE_NAME;
  if (!tableName) {
    throw new Error('JOBS_TABLE_NAME is not configured');
  }
  
  export async function createJob(job: JobRecord): Promise<void> {
    await ddb.send(
      new PutCommand({
        TableName: tableName,
        Item: job,
        ConditionExpression: 'attribute_not_exists(jobId)'
      })
    );
  }
  
  export async function getJobById(jobId: string): Promise<JobRecord | undefined> {
    const response = await ddb.send(
      new GetCommand({
        TableName: tableName,
        Key: { jobId }
      })
    );
  
    return response.Item as JobRecord | undefined;
  }

  export async function getJobByFileName(fileName: string): Promise<JobRecord | undefined> {
    // we don't have a index on fileName, so we make a scan query to get the job by fileName
    const response = await ddb.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: 'fileName = :fileName',
        ExpressionAttributeValues: { ':fileName': fileName }
      })
    );
    return response.Items?.[0] as JobRecord | undefined;
  }

  export async function markProcessing(jobId: string): Promise<boolean> {
    try {
      await ddb.send(
        new UpdateCommand({
          TableName: tableName,
          Key: { jobId },
          UpdateExpression: 'SET #status = :processing, updatedAt = :updatedAt',
          ConditionExpression: '#status = :pending',
          ExpressionAttributeNames: {
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':pending': 'PENDING',
            ':processing': 'PROCESSING',
            ':updatedAt': nowIso()
          }
        })
      );
  
      return true;
    } catch {
      return false;
    }
  }
  
  export async function markDone(jobId: string, result: ProcessingResult): Promise<void> {
    await ddb.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { jobId },
        UpdateExpression: 'SET #status = :done, #result = :result, updatedAt = :updatedAt REMOVE #error',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#result': 'result',
          '#error': 'error'
        },
        ExpressionAttributeValues: {
          ':done': 'DONE',
          ':result': result,
          ':updatedAt': nowIso()
        }
      })
    );
  }
  
  export async function markFailed(jobId: string, error: string): Promise<void> {
    await ddb.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { jobId },
        UpdateExpression: 'SET #status = :failed, #error = :error, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#error': 'error'
        },
        ExpressionAttributeValues: {
          ':failed': 'FAILED',
          ':error': error,
          ':updatedAt': nowIso()
        }
      })
    );
  }