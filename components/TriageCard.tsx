"use client";

import React, { useState } from "react";
import { NoticeTriageResult, SupportedLanguage } from "@/lib/schema";
import { TRANSLATIONS } from "@/lib/languages";
import { ScamWarning } from "./ScamWarning";
import { FallbackCard } from "./FallbackCard";
import { ShareButtons } from "./ShareButtons";
import {
  Calendar,
  IndianRupee,
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

interface TriageCardProps {
  triage: NoticeTriageResult;
  language: SupportedLanguage;
  onReset: () => void;
  imageUrl?: string;
}

export const TriageCard: React.FC<TriageCardProps> = ({
  triage,
  language,
  onReset,
  imageUrl,
}) => {
  const t = TRANSLATIONS[language];
  const [showFullDetails, setShowFullDetails] = useState(false);

  // Trigger fallback card condition
  const shouldShowFallback =
    !triage.is_legible ||
    triage.immediate_action === "unclear" ||
    triage.confidence === "low";

  const hasScamWarning = triage.scam_risk !== "none_detected";

  return (
    <article className="w-full space-y-5 animate-in fade-in duration-300">
      {/* Top badges: Document Type & Scam Status */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-neutral-900 text-white font-bold text-xs sm:text-sm tracking-wide shadow-2xs">
            {t.documentTypes[triage.document_type] || triage.document_type}
          </span>
          {triage.confidence && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                triage.confidence === "high"
                  ? "bg-emerald-100 text-emerald-800"
                  : triage.confidence === "medium"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-neutral-100 text-neutral-700"
              }`}
            >
              Confidence: {triage.confidence}
            </span>
          )}
        </div>

        {/* Safety indicator pill */}
        {!hasScamWarning ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t.safeBadge}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold text-xs border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            {triage.scam_risk === "high_risk" ? t.highRiskBadge : t.warningRiskBadge}
          </span>
        )}
      </div>

      {/* Prominent Red Scam Warning Card (if applicable) */}
      {hasScamWarning && (
        <ScamWarning
          scamRisk={triage.scam_risk}
          redFlags={triage.red_flags}
          language={language}
        />
      )}

      {/* Amber Uncertainty / Fallback Card (if applicable) */}
      {shouldShowFallback && (
        <FallbackCard language={language} onRetake={onReset} />
      )}

      {/* Card 1: What is this notice? */}
      {triage.core_meaning && (
        <section
          aria-labelledby="heading-notice-meaning"
          className="rounded-2xl border-2 border-neutral-200 bg-white p-5 sm:p-6 shadow-sm space-y-2.5"
        >
          <div className="flex items-center gap-2 text-emerald-700">
            <Info className="w-5 h-5 shrink-0" />
            <h2
              id="heading-notice-meaning"
              className="text-sm font-black uppercase tracking-wider text-neutral-500"
            >
              {t.resultHeadingNotice}
            </h2>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-neutral-950 leading-snug tracking-tight">
            {triage.core_meaning}
          </p>
        </section>
      )}

      {/* Card 2: What should I do? */}
      {triage.action_instructions && (
        <section
          aria-labelledby="heading-action-instructions"
          className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 p-5 sm:p-6 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2
              id="heading-action-instructions"
              className="text-sm font-black uppercase tracking-wider text-emerald-900"
            >
              {t.resultHeadingAction}
            </h2>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-2xs">
              {t.actionLabels[triage.immediate_action]}
            </span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-neutral-900 leading-relaxed">
            {triage.action_instructions}
          </p>
        </section>
      )}

      {/* Visible Critical Fields: Deadline & Amount Due (shown only when NOT null) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Deadline Card */}
        {triage.deadline !== null && (
          <section
            aria-labelledby="heading-deadline"
            className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-white border-2 border-neutral-300 shadow-2xs"
          >
            <div className="p-3 rounded-xl bg-red-100 text-red-700 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3
                id="heading-deadline"
                className="text-xs font-black uppercase tracking-wider text-neutral-500"
              >
                {t.deadlineLabel}
              </h3>
              <p className="text-lg sm:text-xl font-black text-red-600 mt-0.5">
                {triage.deadline}
              </p>
            </div>
          </section>
        )}

        {/* Amount Due Card */}
        {triage.amount_due !== null && (
          <section
            aria-labelledby="heading-amount"
            className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-white border-2 border-neutral-300 shadow-2xs"
          >
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <h3
                id="heading-amount"
                className="text-xs font-black uppercase tracking-wider text-neutral-500"
              >
                {t.amountLabel}
              </h3>
              <p className="text-lg sm:text-xl font-black text-emerald-800 mt-0.5">
                {triage.amount_due}
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Issuer and Reference ID (shown only when present) */}
      {(triage.issuer_name !== null || triage.reference_id !== null) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {triage.issuer_name !== null && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <Building2 className="w-5 h-5 text-neutral-600 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-neutral-500 block">
                  {t.issuerLabel}
                </span>
                <span className="text-sm font-bold text-neutral-900 block">
                  {triage.issuer_name}
                </span>
              </div>
            </div>
          )}

          {triage.reference_id !== null && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <FileText className="w-5 h-5 text-neutral-600 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-neutral-500 block">
                  {t.referenceLabel}
                </span>
                <span className="text-sm font-bold font-mono text-neutral-900 block">
                  {triage.reference_id}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle Full Extracted Details / Image preview */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setShowFullDetails(!showFullDetails)}
          className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <span>{showFullDetails ? t.hideDetails : t.viewDetails}</span>
          {showFullDetails ? (
            <ChevronUp className="w-5 h-5 text-neutral-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-500" />
          )}
        </button>

        {showFullDetails && (
          <div className="p-4 pt-1 border-t border-neutral-100 bg-neutral-50/50 space-y-3 text-xs sm:text-sm">
            {imageUrl && (
              <div className="mb-3">
                <span className="text-xs font-bold text-neutral-500 block mb-1">
                  Notice Photo Analyzed:
                </span>
                <div className="max-h-56 overflow-hidden rounded-xl border border-neutral-300 bg-black/5 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Uploaded notice thumbnail"
                    className="max-h-56 object-contain w-auto rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-neutral-700">
              <div>
                <span className="font-semibold text-neutral-500">Document Type:</span>
                <p className="font-bold">{triage.document_type}</p>
              </div>
              <div>
                <span className="font-semibold text-neutral-500">Immediate Action:</span>
                <p className="font-bold">{triage.immediate_action}</p>
              </div>
              <div>
                <span className="font-semibold text-neutral-500">Legible:</span>
                <p className="font-bold">{triage.is_legible ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="font-semibold text-neutral-500">Scam Risk:</span>
                <p className="font-bold">{triage.scam_risk}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share, Listen & Retake Action Buttons */}
      <ShareButtons
        triage={triage}
        language={language}
        onReset={onReset}
      />

      {/* Legal & Medical Disclaimer at Bottom */}
      <footer className="pt-2">
        <p className="text-xs text-center text-neutral-500 leading-relaxed max-w-md mx-auto">
          ⚖️ {triage.disclaimer || t.disclaimerPrefix}
        </p>
      </footer>
    </article>
  );
};
