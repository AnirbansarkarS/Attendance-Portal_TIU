import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Netlify serverless function timeout: keep route under the platform limit.
export const maxDuration = 45;

// Valid Gemini model IDs for the Generative Language API.
// Avoid 3.x IDs and other unsupported model names; those cause request failures
// and eventually the Netlify function to time out.
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

// Keep each model attempt short enough that the whole OCR request can finish
// inside Netlify's serverless limits before the frontend gets a 504 HTML page.
const MODEL_TIMEOUT_MS = 12_000;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Failed to parse request body. Please try again." },
      { status: 400 }
    );
  }

  const imageFile = formData.get("image") as File | null;

  if (!imageFile) {
    return NextResponse.json(
      { error: "No image file provided." },
      { status: 400 }
    );
  }

  // Convert the uploaded file to base64 for the Gemini API
  const arrayBuffer = await imageFile.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");
  const mimeType = imageFile.type || "image/jpeg";

  const genAI = new GoogleGenerativeAI(apiKey);
  const fallbackKey = process.env.GEMINI_API_KEY_FALLBACK;
  const clients: GoogleGenerativeAI[] = [genAI];
  if (fallbackKey && fallbackKey !== apiKey) {
    clients.push(new GoogleGenerativeAI(fallbackKey));
  }

  const prompt = `You are an OCR assistant for an academic attendance system.
Your task is to extract ALL 4-digit numeric codes written on this attendance sheet image.

Rules:
- Look for handwritten or printed 4-digit numbers (e.g., 1234, 5678, 0023).
- These codes represent the last 4 digits of student enrollment IDs.
- Common OCR confusions to correct: O→0, o→0, I→1, l→1, Z→2, S→5, G→6, B→8.
- Ignore any 4-digit number that looks like a year (1900–2100).
- Ignore single isolated letters, names, or non-numeric content.

Return ONLY a JSON object with a single key "codes" containing an array of 4-digit string codes.
Example response format: {"codes": ["1234", "5678", "0042"]}

If no codes are found, return: {"codes": []}

Do not include any explanation, markdown, or extra text — only valid JSON.`;

  let responseText = "";
  let usedModel = "";
  let lastError: unknown = null;

  outer: for (const client of clients) {
    for (const modelName of MODELS) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

        try {
          const result = await Promise.race([
            model.generateContent([
              prompt,
              { inlineData: { mimeType, data: base64Image } },
            ]),
            new Promise<never>((_, reject) => {
              controller.signal.addEventListener("abort", () => {
                reject(new Error(`Model ${modelName} timed out after ${MODEL_TIMEOUT_MS / 1000}s`));
              });
            }),
          ]);

          responseText = (result as Awaited<ReturnType<typeof model.generateContent>>)
            .response.text()
            .trim();
          usedModel = modelName;
          lastError = null;
          break outer;
        } finally {
          clearTimeout(timeout);
        }
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`Gemini OCR [${modelName}] failed:`, msg);
      }
    }
  }

  if (!responseText) {
    const message =
      lastError instanceof Error ? lastError.message : "All Gemini models failed.";
    console.error("Gemini OCR — all models exhausted:", message);
    return NextResponse.json(
      { error: `OCR failed: ${message}`, codes: [] },
      { status: 502 }
    );
  }

  const jsonText = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed: { codes: string[] };
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    console.error("Gemini response was not valid JSON:", responseText);
    return NextResponse.json(
      {
        error: "Gemini returned an unexpected format.",
        raw: responseText,
        codes: [],
        model: usedModel,
      },
      { status: 200 }
    );
  }

  const codes: string[] = (parsed.codes ?? [])
    .map((c: string) => String(c).trim())
    .filter((c: string) => /^\d{4}$/.test(c));

  return NextResponse.json({ codes, raw: responseText, model: usedModel });
}
