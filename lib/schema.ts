import { z } from "zod";

export const SupportedLanguageSchema = z.enum(["te", "hi", "en"]);
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const DocumentTypeSchema = z.enum([
  "electricity",
  "bank",
  "court",
  "tax",
  "insurance",
  "government",
  "unknown",
]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

export const ImmediateActionSchema = z.enum([
  "pay_online",
  "visit_branch",
  "contact_issuer",
  "submit_document",
  "ignore",
  "ask_trusted_person",
  "unclear",
]);
export type ImmediateAction = z.infer<typeof ImmediateActionSchema>;

export const ScamRiskSchema = z.enum([
  "none_detected",
  "warning",
  "high_risk",
]);
export type ScamRisk = z.infer<typeof ScamRiskSchema>;

export const ConfidenceSchema = z.enum(["low", "medium", "high"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const NoticeTriageSchema = z.object({
  language: SupportedLanguageSchema,
  is_document: z.boolean().optional(),
  is_legible: z.boolean(),
  document_type: DocumentTypeSchema,
  core_meaning: z.string().nullable(),
  immediate_action: ImmediateActionSchema,
  action_instructions: z.string().nullable(),
  deadline: z.string().nullable(),
  amount_due: z.string().nullable(),
  issuer_name: z.string().nullable(),
  reference_id: z.string().nullable(),
  scam_risk: ScamRiskSchema,
  red_flags: z.array(z.string()),
  confidence: ConfidenceSchema,
  disclaimer: z.string(),
});

export type NoticeTriageResult = z.infer<typeof NoticeTriageSchema>;

export const TriageRequestSchema = z.object({
  image: z.string().min(1, "Image data is required"), // base64 string or data url
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  language: SupportedLanguageSchema.default("en"),
});

export type TriageRequest = z.infer<typeof TriageRequestSchema>;
