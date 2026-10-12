"use client";

import React, { useState } from "react";
import { SupportedLanguage, NoticeTriageResult } from "@/lib/schema";
import { TRANSLATIONS } from "@/lib/languages";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CameraCapture } from "@/components/CameraCapture";
import { TriageCard } from "@/components/TriageCard";
import { Shield, Sparkles, AlertCircle, FileSearch } from "lucide-react";

export default function Home() {
  const [language, setLanguage] = useState<SupportedLanguage>("te"); // Default to Telugu as specified for regional empowerment
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<NoticeTriageResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  const handleImageSelected = async (
    base64Image: string,
    mimeType: "image/jpeg" | "image/png" | "image/webp",
    sampleId?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentImage(base64Image);

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          mimeType,
          language,
          sampleId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errorGeneric);
      }

      setTriageResult(data as NoticeTriageResult);
    } catch (err: unknown) {
      console.error("Error analyzing notice:", err);
      const msg = err instanceof Error ? err.message : t.errorGeneric;
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTriageResult(null);
    setCurrentImage(null);
    setErrorMessage(null);
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    // If a triage result is already displayed, re-request triage in the newly selected language if image exists
    if (triageResult && currentImage && !isLoading) {
      handleImageSelected(currentImage, "image/jpeg");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-start p-3 sm:p-5 pb-12">
      {/* Constrained Mobile-First Container */}
      <main className="w-full max-w-lg mx-auto flex flex-col gap-4">
        {/* App Header */}
        <header className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-neutral-200/80 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Shield className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-none">
                  Notice Explainer
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">
                  {t.appSubtitle}
                </p>
              </div>
            </div>

            {/* Hackathon Badge */}
            <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              MLH 2026
            </span>
          </div>

          {/* Accessible Language Selector */}
          <div className="pt-2 border-t border-neutral-100">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
              disabled={isLoading}
            />
          </div>
        </header>

        {/* Global Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="rounded-2xl border-2 border-red-400 bg-red-50 p-4 text-red-950 flex items-start gap-3 shadow-xs"
          >
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold">Analysis Notice</h3>
              <p className="text-sm font-medium mt-0.5">{errorMessage}</p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-2.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Content View: Capture vs Result */}
        {!triageResult ? (
          <section className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-neutral-200/80 shadow-xs space-y-5">
            {/* Friendly Hero Intro */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Safety Triage</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 leading-tight">
                {t.heroTagline}
              </h2>
            </div>

            {/* Camera & File Capture Component */}
            <CameraCapture
              currentLanguage={language}
              onImageSelected={handleImageSelected}
              isLoading={isLoading}
            />

            {/* Accessibility & Safety Guidelines Footer */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
              <span className="flex items-center gap-1.5">
                <FileSearch className="w-4 h-4 text-neutral-400" />
                No registration required
              </span>
              <span>100% Client Privacy</span>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-neutral-200/80 shadow-xs">
            <TriageCard
              triage={triageResult}
              language={language}
              onReset={handleReset}
              imageUrl={currentImage || undefined}
            />
          </section>
        )}
      </main>
    </div>
  );
}
