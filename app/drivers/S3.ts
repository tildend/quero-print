import { S3Client } from '@aws-sdk/client-s3';

const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
export const S3_BUCKET = process.env.S3_BUCKET;

export const getS3 = () => {
  if (!S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_BUCKET) {
    console.log('S3 credentials not found');
    return undefined;
  }

  const S3 = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_ENDPOINT || '',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
    }
  });

  return S3;
};

export const S3 = getS3();