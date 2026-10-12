"use client";

import React, { useState } from "react";
import { NoticeTriageResult, SupportedLanguage } from "@/lib/schema";
import { TRANSLATIONS } from "@/lib/languages";
import { VoiceNarrator } from "@/components/VoiceNarrator";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Building,
  Landmark,
  FileText,
  Languages,
  CheckCircle2,
  ExternalLink,
  Lock,
  MessageCircle,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Clock,
  Banknote,
  Volume2,
} from "lucide-react";

interface TriageCardProps {
  triage: NoticeTriageResult;
  language: SupportedLanguage;
  onReset: () => void;
  imageUrl?: string;
  onLanguageChange?: (lang: SupportedLanguage) => void;
}

export const TriageCard: React.FC<TriageCardProps> = ({
  triage,
  language,
  onReset,
  imageUrl,
  onLanguageChange,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<"summary" | "detailed" | "telugu" | "hindi">("summary");

  const isScam = triage.scam_risk !== "none_detected";
  const isFallback =
    !triage.is_legible || triage.immediate_action === "unclear" || triage.confidence === "low";

  // Text compiled for voice narration in current language
  const narrationText = [
    triage.core_meaning,
    triage.action_instructions ? `${t.resultHeadingAction}: ${triage.action_instructions}` : null,
    triage.deadline ? `${t.deadlineLabel}: ${triage.deadline}` : null,
    triage.amount_due ? `${t.amountLabel}: ${triage.amount_due}` : null,
    isScam ? `${t.scamAlertTitle}. ${t.scamShieldPoints.noOtp}` : null,
  ]
    .filter(Boolean)
    .join(". ");

  const handleWhatsAppShare = () => {
    const lines = [
      `📋 *Samaj Notice Summary*`,
      `━━━━━━━━━━━━━━━━━━`,
      `📄 *Type:* ${t.documentTypes[triage.document_type] || triage.document_type.toUpperCase()}`,
      triage.issuer_name ? `🏢 *From:* ${triage.issuer_name}` : "",
      triage.core_meaning ? `📌 *Summary:* ${triage.core_meaning}` : "",
      triage.action_instructions ? `⚡ *Action:* ${triage.action_instructions}` : "",
      triage.deadline ? `⏳ *${t.deadlineLabel}:* ${triage.deadline}` : "",
      triage.amount_due ? `💰 *${t.amountLabel}:* ${triage.amount_due}` : "",
      isScam ? `🚨 *${t.scamAlertTitle}:* ${t.scamShieldPoints.noOtp}` : "",
      `ℹ️ _${triage.disclaimer}_`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
  };

  return (
    <section className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 3-Column Inspection Grid (Thumbnail, Details Table, Next Steps) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Letter Thumbnail / Scanned Preview */}
        <div className="lg:col-span-3 flex flex-col items-center">
          <div className="w-full max-w-[240px] aspect-[3/4] rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-2xs overflow-hidden flex flex-col items-center justify-center relative group">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Scanned letter preview"
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-white rounded-xl p-3 flex flex-col gap-2 text-slate-400 font-mono text-[9px] border border-dashed border-slate-200 select-none">
                <div className="h-4 w-16 bg-blue-100 rounded mb-2"></div>
                <div className="h-2 w-full bg-slate-100 rounded"></div>
                <div className="h-2 w-4/5 bg-slate-100 rounded"></div>
                <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                <div className="h-2 w-full bg-slate-100 rounded"></div>
                <div className="h-8 w-full bg-slate-50 border border-slate-100 rounded mt-auto flex items-center justify-center font-sans font-bold">
                  Official Document
                </div>
              </div>
            )}
            <span className="absolute bottom-3 text-[10px] font-bold bg-slate-900/80 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
              Analyzed Image
            </span>
          </div>
        </div>

        {/* Center Column: Status Banner & Specs Table */}
        <div className="lg:col-span-5 space-y-4">
          {/* Status Header Banner */}
          {!isScam && !isFallback ? (
            <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm sm:text-base text-emerald-950">
                  {t.safeBadge}
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Confidence: {triage.confidence === "high" ? "95%" : "80%"}
              </span>
            </div>
          ) : isScam ? (
            <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm sm:text-base text-red-950">
                  {t.scamAlertTitle}
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-600 text-white">
                {t.highRiskBadge}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm sm:text-base text-amber-950">
                  {t.fallbackNotice}
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-200 text-amber-900">
                Low Confidence
              </span>
            </div>
          )}

          {/* Structured Specs Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white text-xs sm:text-sm divide-y divide-slate-100">
            <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50">
              <div className="col-span-5 flex items-center gap-2 text-slate-500 font-semibold">
                <Landmark className="w-4 h-4 text-blue-600" />
                <span>{t.features.letterType}</span>
              </div>
              <div className="col-span-7 font-bold text-slate-900 capitalize">
                {t.documentTypes[triage.document_type] || triage.document_type}
              </div>
            </div>

            <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50">
              <div className="col-span-5 flex items-center gap-2 text-slate-500 font-semibold">
                <Building className="w-4 h-4 text-blue-600" />
                <span>{t.issuerLabel}</span>
              </div>
              <div className="col-span-7 font-bold text-slate-900">
                {triage.issuer_name || "Official Issuing Authority"}
              </div>
            </div>

            <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50">
              <div className="col-span-5 flex items-center gap-2 text-slate-500 font-semibold">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{t.resultHeadingNotice}</span>
              </div>
              <div className="col-span-7 font-medium text-slate-800 line-clamp-2">
                {triage.core_meaning || "Official compliance notice"}
              </div>
            </div>

            <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50">
              <div className="col-span-5 flex items-center gap-2 text-slate-500 font-semibold">
                <Languages className="w-4 h-4 text-blue-600" />
                <span>{t.selectLanguage}</span>
              </div>
              <div className="col-span-7 font-semibold text-slate-700">
                {language === "te" ? "తెలుగు (Telugu)" : language === "hi" ? "हिन्दी (Hindi)" : "English"}
              </div>
            </div>

            {/* Deadline row if present */}
            {triage.deadline && (
              <div className="grid grid-cols-12 p-3 items-center bg-red-50/50">
                <div className="col-span-5 flex items-center gap-2 text-red-600 font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>{t.deadlineLabel}</span>
                </div>
                <div className="col-span-7 font-black text-red-600">
                  {triage.deadline}
                </div>
              </div>
            )}

            {/* Amount due row if present */}
            {triage.amount_due && (
              <div className="grid grid-cols-12 p-3 items-center bg-emerald-50/50">
                <div className="col-span-5 flex items-center gap-2 text-emerald-700 font-semibold">
                  <Banknote className="w-4 h-4" />
                  <span>{t.amountLabel}</span>
                </div>
                <div className="col-span-7 font-black text-emerald-800">
                  {triage.amount_due}
                </div>
              </div>
            )}

            {/* Reference ID row if present */}
            {triage.reference_id && (
              <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50">
                <div className="col-span-5 flex items-center gap-2 text-slate-500 font-semibold">
                  <span>{t.referenceLabel}</span>
                </div>
                <div className="col-span-7 font-mono text-xs text-slate-700">
                  {triage.reference_id}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: "What to do next?" */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3.5">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
            {t.resultHeadingAction}
          </h3>

          <div className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700">
            {/* Step 1 */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{t.features.simpleSummaryDesc}</span>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
              <ExternalLink className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                {triage.action_instructions || "Check details directly with the verified official authority."}
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
              <Building className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>If required, visit the official branch or municipal office directly.</span>
            </div>

            {/* Step 4: Security Shield Rule */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-red-200">
              <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="text-red-950 font-bold">
                {t.scamShieldPoints.noOtp}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CENTRALIZED, HIGH-VISIBILITY VOICE NARRATION PLAYER (TTS)      */}
      {/* ============================================================== */}
      <div className="w-full">
        <VoiceNarrator
          textToSpeak={narrationText}
          language={language}
          title={t.ttsHeading}
          subtext={t.ttsSubtext}
        />
      </div>

      {/* Tabs Row for Summary & Translations */}
      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "summary"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.features.simpleSummary}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("detailed")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "detailed"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.viewDetails}
          </button>

          {onLanguageChange && (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("telugu");
                  onLanguageChange("te");
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  language === "te"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                }`}
              >
                తెలుగు (Telugu)
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("hindi");
                  onLanguageChange("hi");
                }}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  language === "hi"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </>
          )}
        </div>

        {/* Action Controls: WhatsApp Share & Scan Another */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xs transition-all cursor-pointer active:scale-98"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-slate-900 hover:bg-black text-white transition-all cursor-pointer active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.anotherNoticeButton}</span>
          </button>
        </div>
      </div>

      {/* Summary Box with AI Sparkle Icon */}
      <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
        <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm sm:text-base">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span>
            {activeTab === "detailed"
              ? t.detailsHeading
              : activeTab === "telugu"
              ? "సరళమైన వివరణ (Telugu Summary)"
              : activeTab === "hindi"
              ? "सरल हिंदी सारांश (Hindi Summary)"
              : t.features.simpleSummary}
          </span>
        </div>

        <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
          {activeTab === "detailed"
            ? `${triage.core_meaning || "Official document."} ${triage.action_instructions || ""} ${
                triage.reference_id ? `Reference ID: ${triage.reference_id}.` : ""
              }`
            : triage.core_meaning ||
              "This is an official notice. Please review the extracted information and verify through the verified official portal."}
        </p>

        {triage.action_instructions && activeTab === "summary" && (
          <p className="text-xs sm:text-sm font-bold text-blue-900 pt-1">
            👉 {t.resultHeadingAction}: {triage.action_instructions}
          </p>
        )}

        {isScam && triage.red_flags.length > 0 && (
          <div className="mt-3 p-3.5 rounded-xl bg-red-100/70 border border-red-200 text-red-950 text-xs sm:text-sm font-bold">
            ⚠️ Red Flags: {triage.red_flags.join("; ")}
          </div>
        )}
      </div>

      {/* Subtle Disclaimer Footer */}
      <p className="text-[11px] text-center text-slate-400">
        ⚖️ {triage.disclaimer || t.disclaimerPrefix}
      </p>
    </section>
  );
};
