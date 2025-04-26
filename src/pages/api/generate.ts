import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

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
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const sport = Array.isArray(fields.sport) ? fields.sport[0] : fields.sport || 'unknown';
      const thumbnail = Array.isArray(fields.thumbnail) ? fields.thumbnail[0] : fields.thumbnail || 'unknown';

      if (!name) return res.status(400).json({ error: 'Missing player name' });

      const { script } = await generateScript(name);

      const fileArray = Array.isArray(files.images) ? files.images : files.images ? [files.images] : [];
      let imagePaths: string[] = [];

      if (fileArray.length > 0) {
        imagePaths = fileArray.map((file: any) => file.filepath);
      } else {
        imagePaths = await fetchImages(name, 5);
      }

      const audioPath = await textToSpeech(script);
			if (!audioPath || !fs.existsSync(audioPath)) {
				throw new Error('Audio file does not exist or failed to generate');
			}

      const formData = new FormData();
      formData.append('name', name);
      formData.append('sport', sport);
      formData.append('thumbnail', thumbnail);
      formData.append('audio', fs.createReadStream(audioPath), {
				filename: 'voiceover.mp3',
				contentType: 'audio/mpeg'
			});

      for (const path of imagePaths) {
        if (path.startsWith('/')) {
          formData.append('images', fs.createReadStream(path));
        } else {
          const response = await fetch(path);
          const buffer = await response.buffer();
          const tmpPath = `/tmp/img-${Date.now()}-${Math.random()}.jpg`;
          fs.writeFileSync(tmpPath, buffer);
          formData.append('images', fs.createReadStream(tmpPath));
        }
      }
			console.log('[UPLOAD DEBUG]', {
				name,
				sport,
				thumbnail,
				audioPath,
				imagePaths
			});

      const backendRes = await fetch(
        'https://essentially-sports-reels-ffmpeg-backend.onrender.com/ffmpeg/generate-video',
        {
          method: 'POST',
          body: formData as any,
          headers: formData.getHeaders(),
        }
      );

			const backendJson = await backendRes.json() as any;
			if (!backendRes.ok) {
				throw new Error(backendJson?.details || 'Backend generation failed');
			}

			return res.status(200).json({
				message: 'Reel generated successfully!',
				s3Key: backendJson.s3Key,
				celebrity: name,
			});
    } catch (err: any) {
      console.error('[REEL_GENERATION_ERROR]', err);
      res.status(500).json({ error: 'Failed to generate reel', details: err.message });
    }
  });
}
