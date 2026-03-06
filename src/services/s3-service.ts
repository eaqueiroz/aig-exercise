import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({});

export async function createPresignedUploadUrl(params: {
  bucket: string;
  key: string;
  contentType: string;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
    ContentType: params.contentType
  });

  return getSignedUrl(s3, command, { expiresIn: 900 }); // 15 minutes
}

export async function getObjectText(params: {
  bucket: string;
  key: string;
}): Promise<string> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: params.bucket,
      Key: params.key
    })
  );

  const body = response.Body;
  if (!body) {
    throw new Error('S3 object body was empty');
  }

  return await body.transformToString();
}