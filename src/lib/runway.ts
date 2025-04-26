import RunwayML from '@runwayml/sdk';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_KEY,
});

export async function generateVideoFromRunway(base64Image: string, prompt: string): Promise<string> {
	const task = await client.imageToVideo.create({
		model: 'gen4_turbo',
		promptImage: base64Image,
		promptText: prompt,
		ratio: '720:1280',
		duration: 10,
	});


  const taskId = task.id;

  let statusCheck;
  do {
    await new Promise(resolve => setTimeout(resolve, 10000));
    statusCheck = await client.tasks.retrieve(taskId);
  } while (!['SUCCEEDED', 'FAILED'].includes(statusCheck.status));

  const videoUrl = statusCheck.output?.[0];
	if (statusCheck.status !== 'SUCCEEDED' || !videoUrl) {
		throw new Error('RunwayML generation failed or no video URL returned');
	}

	const videoRes = await fetch(videoUrl);
	const buffer = Buffer.from(await videoRes.arrayBuffer());

	const fileName = `${uuidv4()}.mp4`;
	const outputPath = path.join('/tmp', fileName);
	fs.writeFileSync(outputPath, buffer);

	return outputPath;
}
