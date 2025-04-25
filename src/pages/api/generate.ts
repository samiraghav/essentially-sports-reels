import type { NextApiRequest, NextApiResponse } from 'next';
import { generateScript } from '@/lib/gemini';
import { fetchImages } from '@/lib/pexels';
import { textToSpeech } from '@/lib/polly';
import { generateVideo } from '@/lib/videoGen';
import { uploadToS3 } from '@/lib/s3';
import { generateVideoFromRunway } from '@/lib/runway';




export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });

  try {
    // 1. Generate script using Gemini
    const scriptData = await generateScript(name);
    console.log("Script", scriptData)

    // 2. Fetch relevant images from Pexels
    const images = await fetchImages(name, 5);
    console.log("images", images)

    // 3. Convert script to voiceover using Amazon Polly
    const audioPath = await textToSpeech(scriptData.script);
    console.log("audio", audioPath)

    // 4. Generate video using images + voiceover
    const videoPath = await generateVideo({
      imageUrls: images,
      audioPath,
      scriptText: scriptData.script
    });
    
    // tried runway ml gave you dont have enough credits error
    // const imagePath = images[0];
    // const videoPath = await generateVideoFromRunway(imagePath, scriptData.script);

    console.log("videopath", videoPath)

    // 5. Upload final video to S3 with metadata
    const s3Key = await uploadToS3(videoPath, {
      celebrity: name,
      duration: '30',
      generated_on: new Date().toISOString()
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
}
