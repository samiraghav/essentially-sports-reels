import {
  S3Client,
  PutObjectCommand
} from '@aws-sdk/client-s3';

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const BUCKET = process.env.AWS_S3_BUCKET!;

export async function uploadToS3(filePath: string, metadata: Record<string, string>) {
  const fileContent = fs.readFileSync(filePath);
  const fileKey = `reels/${uuidv4()}.mp4`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
    Body: fileContent,
    ContentType: 'video/mp4',
    Metadata: metadata
  });

  await s3.send(command);
  return fileKey;
}
