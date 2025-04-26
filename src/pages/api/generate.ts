import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { generateScript } from '@/lib/gemini';
import { fetchImages } from '@/lib/pexels';
import { textToSpeech } from '@/lib/polly';
import { generateVideo } from '@/lib/videoGen';
import { uploadToS3 } from '@/lib/s3';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new IncomingForm({ multiples: true, uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('[FORM_PARSE_ERROR]', err);
      return res.status(500).json({ error: 'Form parsing failed.' });
    }

    try {
      const rawName = fields.name;
      const name = Array.isArray(rawName) ? rawName[0] : rawName;
      if (!name) return res.status(400).json({ error: 'Missing name' });

      // 1. Generate script
      const scriptData = await generateScript(name);
      console.log('Script:', scriptData);

      // 2. Resolve images: uploaded or fetch from Pexels
      let imagePaths: string[] = [];
      const fileArray = Array.isArray(files.images) ? files.images : files.images ? [files.images] : [];

      if (fileArray.length > 0) {
        imagePaths = fileArray.map((file: any) => file.filepath);
        console.log('Using uploaded images:', imagePaths);
      } else {
        imagePaths = await fetchImages(name, 5);
        console.log('Fetched images from Pexels:', imagePaths);
      }

      // 3. Convert script to voice
      const audioPath = await textToSpeech(scriptData.script);
      console.log('Audio:', audioPath);

      // 4. Generate video
      const videoPath = await generateVideo({
        imageUrls: imagePaths,
        audioPath,
        scriptText: scriptData.script
      });
      console.log('Video path:', videoPath);

      // tried runway ml - gave you dont have enough credits error
			// const imagePath = images[0];
			// const videoPath = await generateVideoFromRunway(imagePath, scriptData.script);

			const rawSport = fields.sport;
			const sport = Array.isArray(rawSport) ? rawSport[0] : rawSport || 'unknown';

			const rawThumbnail = fields.thumb;
			const thumbnail = Array.isArray(rawThumbnail) ? rawThumbnail[0] : rawThumbnail || 'unknown';

      // 5. Upload to S3
      const s3Key = await uploadToS3(videoPath, {
        celebrity: name,
        duration: '30',
        generated_on: new Date().toISOString(),
				sport,
				thumbnail
      });

      res.status(200).json({
        message: 'Reel generated successfully!',
        s3Key,
        celebrity: name
      });
    } catch (err: any) {
      console.error('[REEL_GENERATION_ERROR]', err);
      res.status(500).json({ error: 'Failed to generate reel', details: err.message });
    }
  });
}
