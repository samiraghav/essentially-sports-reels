import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateScript(athlete: string) {
  const prompt = `Give me a short, engaging 10-second documentary script about the sports journey of ${athlete}. Make it cinematic, emotional, and factual.`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content || "";
}