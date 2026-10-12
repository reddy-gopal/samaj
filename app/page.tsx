"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { SupportedLanguage, NoticeTriageResult } from "@/lib/schema";
import { SAMPLE_NOTICES, SampleNoticeItem } from "@/lib/samples";
import { Navbar } from "@/components/Navbar";
import { TriageCard } from "@/components/TriageCard";
import {
  Upload,
  Camera,
  Shield,
  FileText,
  CheckCircle2,
  ListChecks,
  AlertTriangle,
  Building,
  Zap,
  Landmark,
  ArrowRight,
  Home as HomeIcon,
  QrCode,
  BookOpen,
  RefreshCw,
} from "lucide-react";

// Client-side image compression for Gemma 4
async function compressImageClientSide(file: File): Promise<{ base64: string; mimeType: "image/jpeg" }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        const maxDimension = 1280;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        resolve({
          base64: compressedDataUrl,
          mimeType: "image/jpeg",
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function HomePage() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<NoticeTriageResult>(
    SAMPLE_NOTICES[0].sampleResults["en"] // Default initial demo inspection card matching mockup (SBI notice)
  );
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { base64, mimeType } = await compressImageClientSide(file);
      setCurrentImage(base64);

      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze notice");
      }

      setTriageResult(data as NoticeTriageResult);

      // Scroll to inspection card
      document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" });
    } catch (err: unknown) {
      console.error("Triage error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to analyze notice");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: SampleNoticeItem) => {
    setErrorMessage(null);
    setTriageResult(sample.sampleResults[language]);
    setCurrentImage(null);
    document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    // If current result matches one of our sample items, update translated string
    const matchingSample = SAMPLE_NOTICES.find(
      (s) => s.sampleResults["en"].issuer_name === triageResult.issuer_name
    );
    if (matchingSample && matchingSample.sampleResults[newLang]) {
      setTriageResult(matchingSample.sampleResults[newLang]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans pb-20 md:pb-12">
      {/* Top Navbar matching mockup */}
      <Navbar
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        onScanClick={() => cameraInputRef.current?.click()}
      />

      {/* Hidden file & camera inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-semibold">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold text-red-700 underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 space-y-4">
            <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <h3 className="text-lg font-black text-slate-900">
              Gemma 4 is analyzing your letter...
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Reading official text, checking safety badges, and extracting immediate actions.
            </p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-12 mt-6 sm:mt-10">
        {/* HERO SECTION matching LetterWise mockup */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Understand <br />
              Your Letters <br />
              <span className="gradient-hero-text">In Simple Words</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
              Upload or take a photo of any official letter. Know what it is, whether it’s safe, and what to do next in simple English, Telugu or Hindi.
            </p>

            {/* Dual Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all cursor-pointer min-w-[170px]"
              >
                <Upload className="w-5 h-5" strokeWidth={2.5} />
                <span>Upload Letter</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-base shadow-sm active:scale-98 transition-all cursor-pointer min-w-[170px]"
              >
                <Camera className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
                <span>Take Photo</span>
              </button>
            </div>

            {/* Tagline */}
            <p className="text-xs sm:text-sm font-semibold text-slate-400 pt-1">
              Supports: Bank • Government • Electricity • Insurance • More
            </p>
          </div>

          {/* Right Hero Column: Character Graphic with Floating Badges */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
              {/* Character Illustration SVG */}
              <div className="w-full h-full relative">
                <Image
                  src="/hero-character.svg"
                  alt="Friendly character reading official letter"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              {/* Floating Badge 1: 🏛️ Bank Icon (Top Left) */}
              <div className="absolute top-6 left-6 p-3 rounded-2xl bg-white border border-slate-100 shadow-md text-blue-600 animate-bounce duration-1000">
                <Landmark className="w-5 h-5" />
              </div>

              {/* Floating Badge 2: 🔴 Potential Scam (Top Right) */}
              <div className="absolute top-10 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-500/30">
                <Shield className="w-3.5 h-3.5 fill-current" />
                <span>Potential Scam</span>
              </div>

              {/* Floating Badge 3: 🟢 Safe (Center Right) */}
              <div className="absolute top-36 -right-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Safe</span>
              </div>

              {/* Floating Badge 4: 🟠 Action Needed (Lower Right) */}
              <div className="absolute bottom-18 right-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Action Needed</span>
              </div>

              {/* Floating Badge 5: ⚡ Electricity Lightning (Far Lower Right) */}
              <div className="absolute bottom-4 right-14 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-md text-amber-500">
                <Zap className="w-5 h-5 fill-current" />
              </div>
            </div>
          </div>
        </section>

        {/* 4 VALUE PROPOSITION CARDS matching mockup */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Identify Letter Type */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Identify Letter Type
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Bank, government, insurance, etc.
              </p>
            </div>
          </div>

          {/* Card 2: Check Safety */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Check Safety
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Know if it looks genuine or suspicious.
              </p>
            </div>
          </div>

          {/* Card 3: Get Simple Summary */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Get Simple Summary
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                In English, Telugu or Hindi.
              </p>
            </div>
          </div>

          {/* Card 4: See What to Do Next */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ListChecks className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                See What to Do Next
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Clear, step-by-step guidance.
              </p>
            </div>
          </div>
        </section>

        {/* INTERACTIVE INSPECTION & RESULT SECTION matching mockup */}
        <div id="analysis-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Letter Inspection & Analysis
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Gemma 4 Open-Weight Engine
            </span>
          </div>

          <TriageCard
            triage={triageResult}
            language={language}
            onReset={() => {
              setTriageResult(SAMPLE_NOTICES[0].sampleResults[language]);
              setCurrentImage(null);
            }}
            imageUrl={currentImage || undefined}
            onLanguageChange={handleLanguageChange}
          />
        </div>

        {/* RECENT ANALYSIS / SAMPLE NOTICES LIST matching the mockup mobile view */}
        <section id="recent" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Recent Analysis
            </h2>
            <button
              type="button"
              onClick={() => handleSelectSample(SAMPLE_NOTICES[0])}
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Interactive Sample Cards from the Mockup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Bank Notice (State Bank of India) -> Genuine */}
            <button
              type="button"
              onClick={() => handleSelectSample(SAMPLE_NOTICES[0])}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start justify-between cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                  SBI
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    Bank Notice
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">State Bank of India</p>
                  <span className="text-[10px] text-slate-400 block mt-1">12 Oct 2026</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Genuine
              </span>
            </button>

            {/* 2. Electricity Bill (TSSPDCL) -> Action Needed */}
            <button
              type="button"
              onClick={() => handleSelectSample(SAMPLE_NOTICES[1])}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all text-left flex items-start justify-between cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                    Electricity Bill
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">TSSPDCL Power Board</p>
                  <span className="text-[10px] text-slate-400 block mt-1">Due in 5 days</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Action Needed
              </span>
            </button>

            {/* 3. Government Letter (Income Tax Department) -> Genuine */}
            <button
              type="button"
              onClick={() => handleSelectSample(SAMPLE_NOTICES[4])}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start justify-between cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    Government Letter
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">Municipal Tax Dept</p>
                  <span className="text-[10px] text-slate-400 block mt-1">5 Oct 2026</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Genuine
              </span>
            </button>

            {/* 4. Insurance Letter (Unknown Sender) -> Potential Scam */}
            <button
              type="button"
              onClick={() => handleSelectSample(SAMPLE_NOTICES[7])}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-red-400 hover:shadow-md transition-all text-left flex items-start justify-between cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                    Insurance Letter
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">Unknown Sender</p>
                  <span className="text-[10px] text-slate-400 block mt-1">3 Oct 2026</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                Potential Scam
              </span>
            </button>
          </div>
        </section>
      </main>

      {/* MOBILE STICKY BOTTOM NAVIGATION BAR matching mockup */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-6 py-2.5 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex flex-col items-center gap-1 text-blue-600 text-[10px] font-bold cursor-pointer"
        >
          <HomeIcon className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 text-[10px] font-semibold cursor-pointer"
        >
          <Camera className="w-5 h-5" />
          <span>Scan</span>
        </button>

        <button
          type="button"
          onClick={() => document.getElementById("recent")?.scrollIntoView({ behavior: "smooth" })}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 text-[10px] font-semibold cursor-pointer"
        >
          <FileText className="w-5 h-5" />
          <span>My Letters</span>
        </button>

        <button
          type="button"
          onClick={() => document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" })}
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 text-[10px] font-semibold cursor-pointer"
        >
          <BookOpen className="w-5 h-5" />
          <span>Learn</span>
        </button>
      </nav>
    </div>
  );
}
