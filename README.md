# AIG Exercise

## Overview
Serverless async file processing system using:
- API Gateway
- AWS Lambda
- S3
- SQS
- DynamoDB

Flow:
1. Client calls POST /uploads
2. API creates PENDING job and returns presigned S3 URL
3. Client uploads file to S3
4. S3 adds a job to SQS queue
5. Lambda consumes the queue, processes file and updates DynamoDB
6. Client retrieves status with GET /jobs/{jobId}

The implemented **file processing rule** is:

**Text file processing:** word count and top N most frequent tokens.

---

# Architecture

The system uses a serverless architecture built on:

- API Gateway – exposes REST endpoints
- AWS Lambda – handles API requests and file processing
- Amazon S3 – stores uploaded files
- Amazon DynamoDB – stores job metadata and results
- Amazon SQS – job processing and dead-letter queue for failed processing events

# API Endpoints

### POST `/uploads`

Creates a new processing job and returns a **pre-signed S3 upload URL**.

Example response:

{
  "jobId": "01HXYZ123",
  "uploadUrl": "...",
  "status": "PENDING"
}

Notes:

- The **jobId is generated during job creation**, not after upload.
- The client uploads directly to S3 using the signed URL.

Returning the jobId after upload would require a push mechanism such as:
- WebSockets / SignalR
- SNS notifications
- EventBridge events

For this exercise, returning the jobId upfront simplifies the architecture.

---

### GET `/jobs/{jobId}`

Returns job status and processing results.

Example response:

{
  "jobId": "01HXYZ123",
  "status": "DONE",
  "result": {
    "wordCount": 120,
    "uniqueWordCount": 45,
    "topTokens": [
      {"token": "aws", "count": 8}
    ]
  }
}

---

# Design Decisions

## Direct Upload via Pre-Signed S3 URL

Instead of uploading files through the API, the system returns a **pre-signed S3 URL**.

Benefits:

- avoids sending file payloads through Lambda
- reduces API Gateway and Lambda execution costs
- improves scalability
- follows common cloud-native upload patterns

---

## File Size Validation

When using **S3 pre-signed PUT URLs**, it is not possible to strictly enforce maximum file size during upload.

Therefore the validation is implemented during the **processing stage**:

- the processor Lambda reads object metadata
- files exceeding the configured limit are rejected

The maximum allowed upload size is defined during job creation so it can be centralized and reused across applications if needed.

---

## Idempotent Processing

The system is designed to be **idempotent at the processing layer**.

Each job is associated with a unique `jobId`, and uploaded files are stored using a key prefix:

uploads/{jobId}/filename

If processing is retried due to Lambda retries or failures:

- the job record prevents duplicate result creation
- processing remains safe to repeat

This ensures retries do not produce inconsistent data.

---

## Observability and Logging

Logging is implemented using **structured JSON logs**.

Each job includes a **correlationId** that propagates across services.

This allows logs from different components to be linked during debugging.

### Logs currently use:

console.log / console.error

### In production this could integrate with:

- Sentry
- Datadog
- OpenTelemetry
- AWS X-Ray

---

## DLQ / Redrive

The initial design used a direct S3 trigger to invoke the processing Lambda, with a DLQ configured for failed invocations. However, this approach made retries more operationally complex.

The design was revised to introduce SQS between S3 and the processing Lambda. When an upload completes, S3 publishes an event to an SQS queue that the processor Lambda consumes. If processing repeatedly fails, the message is automatically moved to a DLQ. This allows failed messages to be easily redriven back to the source queue for controlled retries.

---



# How to Run

npm install

Build project

npm run build

Deploy infrastructure

sam deploy --guided

This command will create:

- S3 upload bucket
- DynamoDB job table
- Lambda functions
- API Gateway endpoints
- SQS dead-letter queue

---

