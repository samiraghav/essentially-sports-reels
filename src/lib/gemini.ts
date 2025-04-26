import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateScript(celebrityName: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    You are a documentary narrator scriptwriter.

    Write a clean, plain-text monologue about the life and legacy of ${celebrityName}.

    - The script should be around **200 words** in total.
    - Use emotionally engaging **sentences** and **brief paragraphs** that flow naturally like a voiceover.
    - Do NOT include any sound cues like "(music swells)" or "(soft piano begins)".
    - Do NOT use parentheses, bullets, numbers, or stage directions.
    - Keep it plain, natural, and vivid — as if someone is simply telling the story aloud for a short documentary.

    Return only plain paragraph text.
    `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return {
    celebrity: celebrityName,
    script: text,
    generatedOn: new Date().toISOString()
  };
}
