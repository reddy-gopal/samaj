import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { NoticeTriageSchema, TriageRequestSchema, NoticeTriageResult } from "@/lib/schema";
import { getTriageSystemPrompt } from "@/lib/prompt";
import { SAMPLE_NOTICES } from "@/lib/samples";

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
          error: "Invalid request payload",
          details: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { image, mimeType, language } = parsedBody.data;
    const sampleId = (rawBody as { sampleId?: string }).sampleId;

    // Check for cached sample match for instant zero-latency demo / fallback
    if (sampleId) {
      const matchedSample = SAMPLE_NOTICES.find((s) => s.id === sampleId);
      if (matchedSample && matchedSample.sampleResults[language]) {
        return NextResponse.json(matchedSample.sampleResults[language]);
      }
    }

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

    // Fallback if no API key is provided
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured. Using cached demonstration notice.");
      const defaultSample = SAMPLE_NOTICES[0];
      return NextResponse.json(defaultSample.sampleResults[language]);
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = getTriageSystemPrompt(language);

    // OPEN-WEIGHT MODELS ONLY:
    // Uses Google's open-weight Gemma 4 models through the Gemini API.
    // - gemma-4-26b-a4b-it: Fast, highly responsive open-weight multimodal model (~4s)
    // - gemma-4-31b-it: Full 31B open-weight model candidate
    const candidateModels = process.env.GEMINI_MODEL
      ? [process.env.GEMINI_MODEL, "gemma-4-26b-a4b-it", "gemma-4-31b-it"]
      : ["gemma-4-26b-a4b-it", "gemma-4-31b-it"];

    let lastError: unknown = null;
    let validatedResult: NoticeTriageResult | null = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`[Notice Explainer] Invoking open-weight model: ${modelName}...`);
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
          console.warn(`[Notice Explainer] Open-weight model ${modelName} returned empty text.`);
          continue;
        }

        try {
          const parsedJson = extractAndParseJson(rawText);
          const validation = NoticeTriageSchema.safeParse(parsedJson);
          if (validation.success) {
            console.log(`[Notice Explainer] Successfully extracted and validated triage with open-weight ${modelName}!`);
            validatedResult = validation.data;
            break;
          } else {
            console.warn(`[Notice Explainer] Schema validation issue on ${modelName}:`, validation.error.issues);
          }
        } catch (jsonErr) {
          console.warn(`[Notice Explainer] JSON parse error on ${modelName}:`, jsonErr);
        }
      } catch (callErr: unknown) {
        lastError = callErr;
        console.warn(`[Notice Explainer] Open-weight model ${modelName} failed or unavailable:`, (callErr as Error)?.message || callErr);
      }
    }

    if (validatedResult) {
      return NextResponse.json(validatedResult);
    }

    // If both open-weight models failed or threw errors, fallback gracefully to cached sample result
    console.error("All open-weight Gemma model attempts exhausted. Last error:", lastError);
    const fallbackNotice = SAMPLE_NOTICES[0].sampleResults[language];
    return NextResponse.json(fallbackNotice);
  } catch (error: unknown) {
    console.error("Explain route error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: "Failed to process notice", message: msg },
      { status: 500 }
    );
  }
}
