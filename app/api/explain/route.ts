import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  NoticeTriageSchema,
  TriageRequestSchema,
  NoticeTriageResult,
  SupportedLanguage,
} from "@/lib/schema";
import { getTriageSystemPrompt } from "@/lib/prompt";

export const maxDuration = 60; // 60s max execution time

// Clean JSON helper that strips code fences, markdown, and stray commentary from model outputs
function extractAndParseJson(text: string): unknown {
  const cleaned = text.trim();

  // 1. Try finding markdown code block ```json ... ``` or ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(codeBlockRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch {
      // Continue to brace searching
    }
  }

  // 2. Try finding outermost braces { ... }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonSubstring = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonSubstring);
    } catch {
      // Clean trailing commas before } or ] and replace smart quotes
      const sanitized = jsonSubstring
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'");
      try {
        return JSON.parse(sanitized);
      } catch {
        // Fall through
      }
    }
  }

  return JSON.parse(cleaned);
}

// Lenient normalizer to prevent minor model formatting quirks (e.g. number for amount_due) from failing Zod validation
function normalizeTriageJson(raw: any, language: SupportedLanguage): unknown {
  if (!raw || typeof raw !== "object") return raw;

  const validDocTypes = ["electricity", "bank", "court", "tax", "insurance", "government", "unknown"];
  const validActions = ["pay_online", "visit_branch", "contact_issuer", "submit_document", "ignore", "ask_trusted_person", "unclear"];
  const validScamRisks = ["none_detected", "warning", "high_risk"];
  const validConfidences = ["low", "medium", "high"];

  const docTypeStr = String(raw.document_type || "unknown").toLowerCase().trim();
  const docType = validDocTypes.includes(docTypeStr) ? docTypeStr : "unknown";

  const actionStr = String(raw.immediate_action || "unclear").toLowerCase().trim();
  const action = validActions.includes(actionStr) ? actionStr : "unclear";

  const scamStr = String(raw.scam_risk || "none_detected").toLowerCase().trim();
  const scamRisk = validScamRisks.includes(scamStr) ? scamStr : "none_detected";

  const confStr = String(raw.confidence || "medium").toLowerCase().trim();
  const confidence = validConfidences.includes(confStr) ? confStr : "medium";

  let isLegible = true;
  if (raw.is_legible === false || raw.is_legible === "false") {
    isLegible = false;
  }

  let redFlags: string[] = [];
  if (Array.isArray(raw.red_flags)) {
    redFlags = raw.red_flags.map((f: any) => String(f)).filter(Boolean);
  }

  return {
    language: raw.language || language,
    is_legible: isLegible,
    document_type: docType,
    core_meaning: raw.core_meaning != null ? String(raw.core_meaning) : null,
    immediate_action: action,
    action_instructions: raw.action_instructions != null ? String(raw.action_instructions) : null,
    deadline: raw.deadline != null ? String(raw.deadline) : null,
    amount_due: raw.amount_due != null ? String(raw.amount_due) : null,
    issuer_name: raw.issuer_name != null ? String(raw.issuer_name) : null,
    reference_id: raw.reference_id != null ? String(raw.reference_id) : null,
    scam_risk: scamRisk,
    red_flags: redFlags,
    confidence: confidence,
    disclaimer: raw.disclaimer || "This is not legal advice. Verify with the official issuer before acting.",
  };
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

    // Validate size limit (15 MB max for PDFs / images)
    const approximateSizeBytes = (base64Data.length * 3) / 4;
    const maxSizeBytes = 15 * 1024 * 1024;
    if (approximateSizeBytes > maxSizeBytes) {
      return NextResponse.json(
        { error: "Document exceeds 15 MB size limit. Please upload a smaller file." },
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

    const isPdf = mimeType === "application/pdf";

    // MODEL SELECTION:
    // - For images: prioritizes open-weight Gemma 4 models (gemma-4-26b-a4b-it, gemma-4-31b-it)
    //   with automatic fallback to gemini-3.8-flash if open-weight Gemma servers are congested/down.
    // - For raw PDF documents: uses native PDF processing models (gemini-3.8-flash, gemini-2.5-flash)
    const candidateModels = isPdf
      ? (process.env.GEMINI_PDF_MODEL
          ? [process.env.GEMINI_PDF_MODEL, "gemini-3.8-flash", "gemini-2.5-flash", "gemini-flash-latest"]
          : ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-flash-latest"])
      : (process.env.GEMINI_MODEL
          ? [process.env.GEMINI_MODEL, "gemma-4-26b-a4b-it", "gemma-4-31b-it", "gemini-3.8-flash", "gemini-2.5-flash"]
          : ["gemma-4-26b-a4b-it", "gemma-4-31b-it", "gemini-3.8-flash", "gemini-2.5-flash"]);

    let lastError: unknown = null;
    let validatedResult: NoticeTriageResult | null = null;

    const promptText = isPdf
      ? "Please analyze this official notice / letter PDF document according to the system instructions and return the structured triage JSON."
      : "Please analyze this physical notice image according to the system instructions and return the structured triage JSON.";

    const contentParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
      { text: promptText },
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ];

    if (parsedBody.data.extractedText && parsedBody.data.extractedText.trim().length > 0) {
      contentParts.push({
        text: `Extracted text from document:\n${parsedBody.data.extractedText.slice(0, 12000)}`,
      });
    }

    for (const modelName of candidateModels) {
      try {
        console.log(`[Notice Explainer] Invoking model: ${modelName} (${isPdf ? "PDF" : "Image"})...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: contentParts,
            },
          ],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.1, // Deterministic extraction
          },
        });

        const rawText = response.text || "";
        if (!rawText) {
          console.warn(`[Notice Explainer] Model ${modelName} returned empty text.`);
          continue;
        }

        try {
          const parsedJson = extractAndParseJson(rawText);
          const normalized = normalizeTriageJson(parsedJson, language);
          const validation = NoticeTriageSchema.safeParse(normalized);
          if (validation.success) {
            console.log(`[Notice Explainer] Successfully extracted and validated triage with ${modelName}!`);
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
        console.warn(`[Notice Explainer] Model ${modelName} failed or unavailable:`, (callErr as Error)?.message || callErr);
      }
    }

    if (validatedResult) {
      return NextResponse.json(validatedResult);
    }

    // Graceful Amber Fallback: Return low-confidence fallback card instead of hard error
    console.warn("All model attempts exhausted. Providing graceful uncertainty fallback triage. Last error:", lastError);
    const fallbackNotice: NoticeTriageResult = {
      language,
      is_legible: false,
      document_type: "unknown",
      core_meaning:
        language === "te"
          ? "ఫోటో అస్పష్టంగా ఉంది లేదా చదవలేకపోయాము. దయచేసి మంచి వెలుతురులో స్పష్టమైన ఫోటో తీయండి."
          : language === "hi"
          ? "फोटो धुंधली है या पढ़ी नहीं जा सकी। कृपया अच्छी रोशनी में स्पष्ट फोटो खींचें।"
          : "The notice could not be clearly read. Please take a clearer, well-lit photo of the letter or upload the original PDF.",
      immediate_action: "ask_trusted_person",
      action_instructions:
        language === "te"
          ? "స్పష్టమైన ఫోటోను మళ్లీ అప్‌లోడ్ చేయండి లేదా మీ కుటుంబ సభ్యుల సహాయం తీసుకోండి."
          : language === "hi"
          ? "कृपया स्पष्ट फोटो फिर से अपलोड करें या परिवार के किसी सदस्य से मदद लें।"
          : "Please upload a sharper photograph or consult a family member or the official issuing office.",
      deadline: null,
      amount_due: null,
      issuer_name: null,
      reference_id: null,
      scam_risk: "warning",
      red_flags: [
        language === "te"
          ? "పత్రం అస్పష్టంగా ఉంది"
          : language === "hi"
          ? "दस्तावेज़ अस्पष्ट या धुंधला है"
          : "Image was blurry, angled, or text was illegible",
      ],
      confidence: "low",
      disclaimer: "This is not legal advice. Verify with the official issuer before acting.",
    };

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
