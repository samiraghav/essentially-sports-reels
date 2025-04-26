import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import type { NextApiRequest, NextApiResponse } from 'next';

const s3 = new S3Client({ region: process.env.AWS_REGION! });
const BUCKET = process.env.AWS_S3_BUCKET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: 'reels/'
    });

    const data = await s3.send(command);

    const items = await Promise.all(
      (data.Contents || [])
        .filter((item) => item.Key && item.Key.endsWith('.mp4'))
        .map(async (item) => {
          const id = item.Key!.split('/')[1]?.replace('.mp4', '');

          if (!id || id.trim() === '') return null;

          const meta = await s3.send(
            new HeadObjectCommand({
              Bucket: BUCKET,
              Key: item.Key!
            })
          );

          return {
            id,
            key: item.Key,
            celebrity: meta.Metadata?.celebrity || 'NA',
            generated_on: meta.Metadata?.generated_on || '',
            duration: meta.Metadata?.duration || '60',
            sport: meta.Metadata?.sport || 'NA',
            thumbnail: meta.Metadata?.thumbnail || ''
          };
        })
    );

    const filtered = items.filter(Boolean);

    res.status(200).json({ reels: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reels' });
  }
}
