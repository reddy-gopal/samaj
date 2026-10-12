import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { NoticeTriageSchema, TriageRequestSchema, NoticeTriageResult } from "@/lib/schema";
import { getTriageSystemPrompt } from "@/lib/prompt";

export const maxDuration = 60; // 60s max execution time

// Clean JSON helper that strips code fences, markdown, and stray commentary from open-weight model outputs
function extractAndParseJson(text: string): unknown {
  let cleaned = text.trim();
  // Strip ```json or ``` fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
  } else {
    // If JSON is embedded within commentary
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parsedBody = TriageRequestSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload. Image and language are required.",
          details: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { image, mimeType, language } = parsedBody.data;

    // Clean base64 string
    const base64Data = image.includes("base64,")
      ? image.split("base64,")[1]
      : image;

    // Validate size limit (8 MB max)
    const approximateSizeBytes = (base64Data.length * 3) / 4;
    const maxSizeBytes = 8 * 1024 * 1024;
    if (approximateSizeBytes > maxSizeBytes) {
      return NextResponse.json(
        { error: "Image exceeds 8 MB size limit. Please upload a smaller photo." },
        { status: 413 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from environment. Please add GEMINI_API_KEY to your .env file." },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = getTriageSystemPrompt(language);

    // OPEN-WEIGHT MODEL:
    // Uses Google's open-weight Gemma 4 models through the Gemini API.
    const candidateModels = process.env.GEMINI_MODEL
      ? [process.env.GEMINI_MODEL, "gemma-4-26b-a4b-it", "gemma-4-31b-it"]
      : ["gemma-4-26b-a4b-it", "gemma-4-31b-it"];

    let lastError: unknown = null;
    let validatedResult: NoticeTriageResult | null = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`[Samaj] Sending real image to open-weight model: ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "Please analyze this physical notice image according to the system instructions and return the structured triage JSON.",
                },
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.1, // Deterministic extraction
          },
        });

        const rawText = response.text || "";
        if (!rawText) {
          console.warn(`[Samaj] Open-weight model ${modelName} returned empty text.`);
          continue;
        }

        try {
          const parsedJson = extractAndParseJson(rawText);
          const validation = NoticeTriageSchema.safeParse(parsedJson);
          if (validation.success) {
            console.log(`[Samaj] Successfully extracted and validated real triage with ${modelName}!`);
            validatedResult = validation.data;
            break;
          } else {
            console.warn(`[Samaj] Schema validation issue on ${modelName}:`, validation.error.issues);
          }
        } catch (jsonErr) {
          console.warn(`[Samaj] JSON parse error on ${modelName}:`, jsonErr);
        }
      } catch (callErr: unknown) {
        lastError = callErr;
        console.warn(`[Samaj] Open-weight model ${modelName} failed:`, (callErr as Error)?.message || callErr);
      }
    }

    if (validatedResult) {
      return NextResponse.json(validatedResult);
    }

    // Return real error if model failed
    const errorMsg = lastError instanceof Error ? lastError.message : "Unable to analyze notice image.";
    return NextResponse.json(
      {
        error: "Gemma 4 was unable to parse this image. Please upload a clearer, well-lit photograph of the notice.",
        details: errorMsg,
      },
      { status: 502 }
    );
  } catch (error: unknown) {
    console.error("Explain route error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: "Failed to process notice", message: msg },
      { status: 500 }
    );
  }
}
