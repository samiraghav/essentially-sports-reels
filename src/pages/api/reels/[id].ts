import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { NextApiRequest, NextApiResponse } from 'next';

const s3 = new S3Client({ region: process.env.AWS_REGION! });
const BUCKET = process.env.AWS_S3_BUCKET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

  const Key = `reels/${id}.mp4`;

  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
}
