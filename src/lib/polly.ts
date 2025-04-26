import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const polly = new PollyClient({ region: process.env.AWS_REGION! });

export async function textToSpeech(text: string): Promise<string> {
  const command = new SynthesizeSpeechCommand({
    OutputFormat: 'mp3',
    Text: text,
    VoiceId: 'Matthew',
    Engine: 'neural'
  });

  const response = await polly.send(command);

  if (!response.AudioStream) {
    throw new Error('AudioStream is undefined');
  }

  const fileName = `${uuidv4()}.mp3`;
  const filePath = path.join('/tmp', fileName);
  const writeStream = fs.createWriteStream(filePath);

  await new Promise<void>((resolve, reject) => {
    (response.AudioStream as NodeJS.ReadableStream).pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return filePath;
}
