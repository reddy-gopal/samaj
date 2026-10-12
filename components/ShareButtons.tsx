"use client";

import React, { useState, useEffect } from "react";
import { NoticeTriageResult, SupportedLanguage } from "@/lib/schema";
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from "@/lib/languages";
import { Volume2, VolumeX, MessageCircle, RefreshCw, ArrowLeft } from "lucide-react";

interface ShareButtonsProps {
  triage: NoticeTriageResult;
  language: SupportedLanguage;
  onReset: () => void;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({
  triage,
  language,
  onReset,
}) => {
  const t = TRANSLATIONS[language];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechSupported(false);
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Construct text to read aloud
    const parts: string[] = [];
    if (triage.core_meaning) {
      parts.push(triage.core_meaning);
    }
    if (triage.action_instructions) {
      parts.push(triage.action_instructions);
    }
    if (triage.deadline) {
      parts.push(`${t.deadlineLabel}: ${triage.deadline}`);
    }
    if (triage.amount_due) {
      parts.push(`${t.amountLabel}: ${triage.amount_due}`);
    }
    if (triage.scam_risk !== "none_detected") {
      parts.push(`${t.scamAlertTitle}. ${t.scamShieldPoints.noOtp}`);
    }

    const fullText = parts.join(". ");
    if (!fullText) return;

    const utterance = new SpeechSynthesisUtterance(fullText);

    // Find best voice match for language
    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === language);
    if (langConfig) {
      utterance.lang = langConfig.speechLocale;
    }

    utterance.rate = 0.95; // Slightly slower for elderly / accessible comprehension
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleWhatsAppShare = () => {
    const lines: string[] = [
      `📋 *Samaj Summary* (${SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name})`,
      `━━━━━━━━━━━━━━━━━━`,
    ];

    if (triage.core_meaning) {
      lines.push(`📌 *${t.resultHeadingNotice}:*`);
      lines.push(triage.core_meaning);
      lines.push("");
    }

    if (triage.action_instructions) {
      lines.push(`⚡ *${t.resultHeadingAction}:*`);
      lines.push(triage.action_instructions);
      lines.push("");
    }

    if (triage.deadline) {
      lines.push(`⏳ *${t.deadlineLabel}:* ${triage.deadline}`);
    }

    if (triage.amount_due) {
      lines.push(`💰 *${t.amountLabel}:* ${triage.amount_due}`);
    }

    if (triage.issuer_name) {
      lines.push(`🏢 *${t.issuerLabel}:* ${triage.issuer_name}`);
    }

    if (triage.reference_id) {
      lines.push(`🔢 *${t.referenceLabel}:* ${triage.reference_id}`);
    }

    if (triage.scam_risk !== "none_detected") {
      lines.push("");
      lines.push(`🚨 *${t.scamAlertTitle.toUpperCase()}*`);
      lines.push(`⚠️ ${t.scamShieldPoints.noOtp}`);
      lines.push(`⚠️ ${t.scamShieldPoints.noPersonalUpi}`);
      if (triage.red_flags.length > 0) {
        lines.push(`Flags: ${triage.red_flags.join("; ")}`);
      }
    }

    lines.push("");
    lines.push(`ℹ️ _${triage.disclaimer}_`);

    const messageText = lines.join("\n");
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full space-y-3 pt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Listen Button */}
        {speechSupported && (
          <button
            type="button"
            onClick={handleSpeak}
            aria-label={isSpeaking ? t.stopListeningButton : t.listenButton}
            className={`flex items-center justify-center gap-3 py-4 px-5 rounded-2xl font-bold text-base transition-all duration-150 active:scale-98 shadow-sm border-2 cursor-pointer ${
              isSpeaking
                ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white animate-pulse"
                : "bg-emerald-600 hover:bg-emerald-700 border-emerald-500 text-white"
            }`}
          >
            {isSpeaking ? (
              <VolumeX className="w-6 h-6 shrink-0" />
            ) : (
              <Volume2 className="w-6 h-6 shrink-0" />
            )}
            <span>{isSpeaking ? t.stopListeningButton : t.listenButton}</span>
          </button>
        )}

        {/* WhatsApp Share Button */}
        <button
          type="button"
          onClick={handleWhatsAppShare}
          aria-label={t.shareWhatsAppButton}
          className="flex items-center justify-center gap-3 py-4 px-5 rounded-2xl font-bold text-base bg-[#25D366] hover:bg-[#1fb855] text-white shadow-sm border-2 border-[#1fad50] transition-all duration-150 active:scale-98 cursor-pointer"
        >
          <MessageCircle className="w-6 h-6 shrink-0 fill-current" />
          <span>{t.shareWhatsAppButton}</span>
        </button>
      </div>

      {/* Try Another Notice Button */}
      <button
        type="button"
        onClick={onReset}
        aria-label={t.anotherNoticeButton}
        className="w-full flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl font-bold text-base bg-neutral-900 hover:bg-black text-white shadow-sm border-2 border-neutral-900 transition-all duration-150 active:scale-98 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 shrink-0" />
        <span>{t.anotherNoticeButton}</span>
      </button>
    </div>
  );
};
