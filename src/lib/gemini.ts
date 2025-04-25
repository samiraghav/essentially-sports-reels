import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateScript(celebrityName: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
    You are a documentary narrator scriptwriter.

    Write a clean, plain-text **80-second monologue** about the life and legacy of ${celebrityName}.

    - Do NOT include any sound cues like "(music swells)" or "(soft piano begins)".
    - Do NOT use parentheses, bullets, numbers, or stage directions.
    - Write in short, emotionally engaging **paragraphs** that flow like a single voiceover.
    - Highlight major career milestones and one personal insight that defined them.
    - Use only natural, plain narration — as if reading it aloud for a documentary.

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
