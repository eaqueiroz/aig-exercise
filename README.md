# AIG Technical Exercise – Asynchronous File Processing System

## Overview
Serverless async file processing system using:
- API Gateway
- AWS Lambda
- S3
- DynamoDB

Flow:
1. Client calls POST /uploads
2. API creates PENDING job and returns presigned S3 URL
3. Client uploads file to S3
4. S3 triggers processing Lambda
5. Lambda processes file and updates DynamoDB
6. Client retrieves status with GET /jobs/{jobId}

## Architecture
Client -> API Gateway -> Lambda -> DynamoDB
Client -> S3 Upload (presigned URL)
S3 -> Lambda Processor -> DynamoDB

## Status Model
PENDING -> PROCESSING -> DONE / FAILED

## Idempotency
Processing Lambda uses DynamoDB conditional updates to ensure jobs are only processed once.

## Run
npm install
npm run build
sam build
sam deploy --guided