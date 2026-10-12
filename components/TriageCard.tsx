"use client";

import React, { useState, useEffect } from "react";
import { NoticeTriageResult, SupportedLanguage } from "@/lib/schema";
import { TRANSLATIONS } from "@/lib/languages";
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
  Volume2,
  VolumeX,
  MessageCircle,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Clock,
  Banknote,
  Hash,
  Camera,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface DocumentMeta {
  fileName?: string;
  fileType?: "image" | "pdf";
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (newPage: number) => void;
}

interface TriageCardProps {
  triage: NoticeTriageResult;
  language: SupportedLanguage;
  onReset: () => void;
  imageUrl?: string;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onTakePhoto?: () => void;
  onUpload?: () => void;
  documentMeta?: DocumentMeta;
}

export const TriageCard: React.FC<TriageCardProps> = ({
  triage,
  language,
  onReset,
  imageUrl,
  onLanguageChange,
  onTakePhoto,
  onUpload,
  documentMeta,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<"summary" | "detailed" | "telugu" | "hindi">("summary");
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Strict check if image is NOT a document at all
  const isNotDocument =
    triage.is_document === false ||
    (!triage.is_legible &&
      triage.document_type === "unknown" &&
      !triage.issuer_name &&
      !triage.amount_due &&
      !triage.deadline);

  const isScam = triage.scam_risk !== "none_detected";
  const isFallback =
    !triage.is_legible || triage.immediate_action === "unclear" || triage.confidence === "low";

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak =
      triage.core_meaning || triage.action_instructions || t.notDocumentMessage || "Notice summary";
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (language === "te") utterance.lang = "te-IN";
    else if (language === "hi") utterance.lang = "hi-IN";
    else utterance.lang = "en-IN";

    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleWhatsAppShare = () => {
    const lines = [
      `📋 *LetterWise / Notice Summary*`,
      `━━━━━━━━━━━━━━━━━━`,
      `📄 *Type:* ${triage.document_type.toUpperCase()}`,
      triage.issuer_name ? `🏢 *From:* ${triage.issuer_name}` : "",
      triage.core_meaning ? `📌 *Summary:* ${triage.core_meaning}` : "",
      triage.action_instructions ? `⚡ *Action:* ${triage.action_instructions}` : "",
      triage.deadline ? `⏳ *Deadline:* ${triage.deadline}` : "",
      triage.amount_due ? `💰 *Amount Due:* ${triage.amount_due}` : "",
      isScam ? `🚨 *WARNING:* Suspicious red flags detected! Never share OTP or pay to personal UPI.` : "",
      `ℹ️ _${triage.disclaimer}_`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
  };

  // ==============================================================
  // 1. DEDICATED VIEW WHEN IMAGE IS NOT RELEVANT / NOT A DOCUMENT
  // ==============================================================
  if (isNotDocument) {
    return (
      <section className="w-full bg-white rounded-3xl border border-amber-200 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Prominent Direct Alert Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-amber-950">
                {t.notDocumentTitle}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-amber-900 mt-0.5 leading-relaxed">
                {triage.core_meaning || t.notDocumentMessage}
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-200 text-amber-950 border border-amber-300 shrink-0 hidden sm:inline-block">
            Not a Notice
          </span>
        </div>

        {/* 2-Column Layout: Analyzed Photo + Helpful Guidance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Scanned Image Preview */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="w-full max-w-[240px] aspect-[3/4] rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-2 shadow-2xs overflow-hidden flex flex-col items-center justify-center relative">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Scanned photo preview"
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-center p-4 text-amber-700">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                  <span className="text-xs font-bold">Unrecognized Photo</span>
                </div>
              )}
              <span className="absolute bottom-3 text-[10px] font-bold bg-amber-950/80 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
                Analyzed Image
              </span>
            </div>
          </div>

          {/* Right: Helpful Guidance Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t.tipsTitle}</span>
              </h4>

              <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-semibold">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{t.tipsFlat}</span>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t.tipsLight}</span>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <ExternalLink className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>{t.tipsEdges}</span>
                </div>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {onTakePhoto && (
                <button
                  type="button"
                  onClick={onTakePhoto}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer active:scale-98"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.cameraButton}</span>
                </button>
              )}

              {onUpload && (
                <button
                  type="button"
                  onClick={onUpload}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all cursor-pointer active:scale-98"
                >
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>{t.uploadButton}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t.anotherNoticeButton}</span>
              </button>

              <button
                type="button"
                onClick={handleSpeak}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                  isSpeaking
                    ? "bg-amber-500 text-white animate-pulse"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
                <span>{isSpeaking ? "Stop" : "Listen"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Disclaimer Footer */}
        <p className="text-[11px] text-center text-slate-400">
          ⚖️ {triage.disclaimer}
        </p>
      </section>
    );
  }

  // ==============================================================
  // 2. AUTHENTIC DOCUMENT TRIAGE CARD (WHEN IMAGE IS A NOTICE)
  // ==============================================================
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
                alt={documentMeta?.fileName || "Scanned letter preview"}
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-white rounded-xl p-3 flex flex-col gap-2 text-slate-400 font-mono text-[9px] border border-dashed border-slate-200 select-none">
                <div className="h-4 w-16 bg-blue-100 rounded mb-2"></div>
                <div className="h-2 w-full bg-slate-100 rounded"></div>
                <div className="h-2 w-4/5 bg-slate-100 rounded"></div>
                <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                <div className="h-2 w-full bg-slate-100 rounded"></div>
                <div className="h-8 w-full bg-slate-50 border border-slate-100 rounded mt-auto flex items-center justify-center">
                  Official Document
                </div>
              </div>
            )}
            <span className="absolute bottom-3 text-[10px] font-bold bg-slate-900/80 text-white px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-sm">
              {documentMeta?.fileType === "pdf" ? (
                <>
                  <FileText className="w-3 h-3 text-red-400" />
                  <span>
                    PDF • Page {documentMeta.currentPage || 1} of {documentMeta.totalPages || 1}
                  </span>
                </>
              ) : (
                <span>Analyzed Image</span>
              )}
            </span>
          </div>

          {/* PDF Page Navigation & File Information */}
          {documentMeta?.fileType === "pdf" && (
            <div className="w-full max-w-[240px] mt-2 flex flex-col items-center gap-1">
              {documentMeta.fileName && (
                <span className="text-[11px] font-semibold text-slate-500 truncate max-w-full px-1">
                  {documentMeta.fileName}
                </span>
              )}
              {documentMeta.totalPages && documentMeta.totalPages > 1 && documentMeta.onPageChange && (
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    disabled={(documentMeta.currentPage || 1) <= 1}
                    onClick={() =>
                      documentMeta.onPageChange?.(Math.max(1, (documentMeta.currentPage || 1) - 1))
                    }
                    className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-600">
                    {documentMeta.currentPage || 1} / {documentMeta.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={(documentMeta.currentPage || 1) >= documentMeta.totalPages}
                    onClick={() =>
                      documentMeta.onPageChange?.(
                        Math.min(documentMeta.totalPages || 1, (documentMeta.currentPage || 1) + 1)
                      )
                    }
                    className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Column: Status Banner & Specs Table */}
        <div className="lg:col-span-5 space-y-4">
          {/* Status Header Banner */}
          {!isScam && !isFallback ? (
            <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm sm:text-base text-emerald-950">
                  This looks genuine
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Confidence: {triage.confidence === "high" ? "92%" : "78%"}
              </span>
            </div>
          ) : isScam ? (
            <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-red-50 border border-red-200 text-red-900">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm sm:text-base text-red-950">
                  Potential Scam Detected
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-600 text-white">
                High Risk
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm sm:text-base text-amber-950">
                  Notice is Unclear / Blurry
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-200 text-amber-900">
                Low Confidence
              </span>
            </div>
          )}

          {/* Structured Specs Table — AUTHENTIC DATA ONLY */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white text-xs sm:text-sm divide-y divide-slate-100">
            {/* Letter Type */}
            <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50">
              <div className="col-span-5 flex items-center gap-2 text-slate-500 font-semibold">
                <Landmark className="w-4 h-4 text-blue-600" />
                <span>Letter Type</span>
              </div>
              <div className="col-span-7 font-bold text-slate-900 capitalize">
                {t.documentTypes[triage.document_type] || triage.document_type}
              </div>
            </div>

            {/* From / Issuer */}
            <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50">
              <div className="col-span-5 flex items-center gap-2 text-slate-500 font-semibold">
                <Building className="w-4 h-4 text-blue-600" />
                <span>From</span>
              </div>
              <div className="col-span-7 font-bold text-slate-900">
                {triage.issuer_name ? (
                  triage.issuer_name
                ) : (
                  <span className="text-slate-400 italic font-medium">{t.notSpecified}</span>
                )}
              </div>
            </div>

            {/* Purpose */}
            <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50">
              <div className="col-span-5 flex items-center gap-2 text-slate-500 font-semibold">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Purpose</span>
              </div>
              <div className="col-span-7 font-medium text-slate-800 line-clamp-2">
                {triage.core_meaning ? (
                  triage.core_meaning
                ) : (
                  <span className="text-slate-400 italic font-medium">{t.purposeUnclear}</span>
                )}
              </div>
            </div>

            {/* Language */}
            <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50">
              <div className="col-span-5 flex items-center gap-2 text-slate-500 font-semibold">
                <Languages className="w-4 h-4 text-blue-600" />
                <span>Language</span>
              </div>
              <div className="col-span-7 font-semibold text-slate-700">
                {language === "te" ? "తెలుగు (Telugu)" : language === "hi" ? "हिन्दी (Hindi)" : "English"}
              </div>
            </div>

            {/* Reference ID row if visibly present */}
            {triage.reference_id && (
              <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-50/50">
                <div className="col-span-5 flex items-center gap-2 text-slate-500 font-semibold">
                  <Hash className="w-4 h-4 text-blue-600" />
                  <span>Ref / ID</span>
                </div>
                <div className="col-span-7 font-mono font-bold text-slate-900">
                  {triage.reference_id}
                </div>
              </div>
            )}

            {/* Deadline row if visibly present */}
            {triage.deadline && (
              <div className="grid grid-cols-12 p-3 items-center bg-red-50/40">
                <div className="col-span-5 flex items-center gap-2 text-red-600 font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>Deadline</span>
                </div>
                <div className="col-span-7 font-black text-red-600">
                  {triage.deadline}
                </div>
              </div>
            )}

            {/* Amount due row if visibly present */}
            {triage.amount_due && (
              <div className="grid grid-cols-12 p-3 items-center bg-emerald-50/40">
                <div className="col-span-5 flex items-center gap-2 text-emerald-700 font-semibold">
                  <Banknote className="w-4 h-4" />
                  <span>Amount Due</span>
                </div>
                <div className="col-span-7 font-black text-emerald-800">
                  {triage.amount_due}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Relative "What to do next?" */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3.5">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center justify-between">
            <span>What to do next?</span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full border border-blue-200">
              Notice-Specific
            </span>
          </h3>

          <div className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-700">
            {/* Primary tailored action instruction from image */}
            {triage.action_instructions ? (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-blue-200/90 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-slate-900 leading-snug">
                  {triage.action_instructions}
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.actionLabels[triage.immediate_action] || t.resultHeadingAction}</span>
              </div>
            )}

            {/* Relative deadline action if present */}
            {triage.deadline && (
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-red-200">
                <Clock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="text-red-950 font-medium">
                  Ensure resolution before deadline: <strong className="font-bold">{triage.deadline}</strong>
                </span>
              </div>
            )}

            {/* Relative amount due guidance if present */}
            {triage.amount_due && (
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-emerald-200">
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-emerald-950 font-medium">
                  Verify stated amount <strong className="font-bold">{triage.amount_due}</strong> on official portal only.
                </span>
              </div>
            )}

            {/* Security Shield Rule */}
            {isScam ? (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200">
                <Lock className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="text-red-950 font-bold leading-snug">
                  Do not pay to personal UPI IDs or share OTP, PIN, password, or CVV.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/80">
                <ExternalLink className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium">
                  Verify details directly on the issuer&apos;s verified portal before payment.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Row matching the mockup */}
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
            Simple Summary
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
            Detailed Explanation
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
                Translate (Telugu)
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
                Translate (Hindi)
              </button>
            </>
          )}
        </div>

        {/* Action Controls: Audio narration, WhatsApp, Scan Another */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSpeak}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isSpeaking
                ? "bg-amber-500 text-white animate-pulse"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
            <span>{isSpeaking ? "Stop" : "Listen"}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xs transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold bg-slate-900 hover:bg-black text-white transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Scan Another</span>
          </button>
        </div>
      </div>

      {/* Summary Box with AI Sparkle Icon matching the mockup */}
      <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
        <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm sm:text-base">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span>
            {activeTab === "detailed"
              ? "Detailed Official Breakdown"
              : activeTab === "telugu"
              ? "సరళమైన వివరణ (Simple Summary)"
              : activeTab === "hindi"
              ? "सरल हिंदी सारांश (Simple Summary)"
              : "Simple Summary"}
          </span>
        </div>

        <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
          {activeTab === "detailed"
            ? `${triage.core_meaning || t.fallbackNotice} ${
                triage.action_instructions ? ` Action: ${triage.action_instructions}` : ""
              } ${triage.reference_id ? ` Ref ID: ${triage.reference_id}.` : ""}`
            : triage.core_meaning || t.fallbackNotice}
        </p>

        {triage.action_instructions && activeTab === "summary" && (
          <p className="text-xs sm:text-sm font-bold text-blue-900 pt-1">
            👉 Immediate Action: {triage.action_instructions}
          </p>
        )}

        {isScam && triage.red_flags.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-red-100/70 border border-red-200 text-red-950 text-xs sm:text-sm font-bold">
            ⚠️ Red Flags: {triage.red_flags.join("; ")}
          </div>
        )}
      </div>

      {/* Subtle Disclaimer Footer */}
      <p className="text-[11px] text-center text-slate-400">
        ⚖️ {triage.disclaimer}
      </p>
    </section>
  );
};
