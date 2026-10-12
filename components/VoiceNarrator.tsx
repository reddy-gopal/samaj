"use client";

import React, { useState, useEffect, useRef } from "react";
import { SupportedLanguage } from "@/lib/schema";
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from "@/lib/languages";
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  Gauge,
  Radio,
  CheckCircle2,
} from "lucide-react";

interface VoiceNarratorProps {
  textToSpeak: string;
  language: SupportedLanguage;
  title?: string;
  subtext?: string;
  className?: string;
}

export const VoiceNarrator: React.FC<VoiceNarratorProps> = ({
  textToSpeak,
  language,
  title,
  subtext,
  className = "",
}) => {
  const t = TRANSLATIONS[language];
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.92); // Comfortable pace
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cancel speech whenever language or text changes
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [language, textToSpeak]);

  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    if (!textToSpeak.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === language);
    if (langConfig) {
      utterance.lang = langConfig.speechLocale;
    }

    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Try finding a matching native voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const targetLocale = langConfig?.speechLocale || "en-IN";
      const matchedVoice = voices.find(
        (v) => v.lang === targetLocale || v.lang.startsWith(language)
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null;
  }

  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  return (
    <div
      role="region"
      aria-label="Central Voice Narration"
      className={`w-full rounded-2xl border-2 transition-all p-4 sm:p-5 shadow-sm ${
        isSpeaking
          ? "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-400 shadow-md ring-2 ring-blue-400/20"
          : "bg-slate-50/90 border-slate-200/90 hover:border-slate-300"
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Prominent Status & Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
              isSpeaking
                ? "bg-blue-600 text-white scale-105 shadow-md shadow-blue-500/30"
                : "bg-white border border-slate-200 text-blue-600 shadow-2xs"
            }`}
          >
            {isSpeaking ? (
              <Volume2 className="w-6 h-6 animate-pulse" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight truncate">
                {title || t.ttsHeading}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                  isSpeaking
                    ? "bg-blue-600 text-white animate-pulse"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {selectedLangObj?.nativeName || selectedLangObj?.name}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-medium truncate">
              {isSpeaking ? t.ttsNowSpeaking : subtext || t.ttsSubtext}
            </p>
          </div>
        </div>

        {/* Right: Sound Wave Visualizer + Play/Stop + Speed Rate Control */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 w-full sm:w-auto justify-between sm:justify-end">
          {/* Animated sound wave bars when speaking */}
          {isSpeaking && (
            <div className="flex items-center gap-1 px-3 py-2 bg-blue-100/70 rounded-full">
              <span className="w-1 h-3.5 bg-blue-600 rounded-full animate-bounce"></span>
              <span className="w-1 h-5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-1 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0.3s]"></span>
              <span className="w-1 h-4.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            </div>
          )}

          {/* Speed Rate Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextRate = speechRate === 0.92 ? 0.8 : 0.92;
              setSpeechRate(nextRate);
            }}
            title="Adjust voice narration speed"
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
          >
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            <span>{speechRate === 0.8 ? t.ttsSpeedSlow : t.ttsSpeedNormal}</span>
          </button>

          {/* Large Central Action Button */}
          <button
            type="button"
            onClick={toggleSpeech}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-150 active:scale-95 shadow-md cursor-pointer ${
              isSpeaking
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/25 ring-2 ring-red-400"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 ring-2 ring-blue-500/20"
            }`}
          >
            {isSpeaking ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>{t.ttsStop}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{t.ttsPlay}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
