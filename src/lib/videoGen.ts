// lib/videoGen.ts
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

ffmpeg.setFfmpegPath(ffmpegPath!);

export async function generateVideo({
  imageUrls,
  audioPath,
  scriptText
}: {
  imageUrls: string[];
  audioPath: string;
  scriptText: string;
}): Promise<string> {
  const tmpDir = '/tmp/' + uuidv4();
  fs.mkdirSync(tmpDir);

  const imagePaths: string[] = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const res = await fetch(imageUrls[i]);
    const buffer = await res.buffer();
    const filePath = path.join(tmpDir, `img${i}.jpg`);
    fs.writeFileSync(filePath, buffer);
    imagePaths.push(filePath);
  }

  const inputFileList = path.join(tmpDir, 'images.txt');
  const durationPerImage = 5; // seconds
  const totalDuration = durationPerImage * imagePaths.length;

  // Write images.txt for ffmpeg slideshow
  fs.writeFileSync(
    inputFileList,
    imagePaths.map(p => `file '${p}'\nduration ${durationPerImage}`).join('\n') + `\nfile '${imagePaths[imagePaths.length - 1]}'\n`
  );

  const outputPath = path.join(tmpDir, 'final.mp4');

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputFileList)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .input(audioPath)
      .outputOptions([
        '-vf', 'scale=720:1280,format=yuv420p',
        '-shortest',
        '-preset', 'fast',
        '-r', '30'
      ])
      .audioCodec('aac')
      .videoCodec('libx264')
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        console.error('ffmpeg error:', err);
        reject(err);
      });
  });
}
