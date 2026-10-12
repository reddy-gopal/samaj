"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { SupportedLanguage, NoticeTriageResult } from "@/lib/schema";
import { TRANSLATIONS } from "@/lib/languages";
import { SAMPLE_NOTICES, SampleNoticeItem } from "@/lib/samples";
import { Navbar } from "@/components/Navbar";
import { TriageCard } from "@/components/TriageCard";
import { SampleNoticesCarousel } from "@/components/SampleNoticesCarousel";
import { SafetyTips } from "@/components/SafetyTips";
import {
  Camera,
  Upload,
  Globe,
  Home as HomeIcon,
  Scan,
  FileText,
  Shield,
  ShieldCheck,
  Zap,
  Building,
  Landmark,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  X,
  CheckCircle2,
  Trash2,
  Inbox,
  FileSearch,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export interface RealAnalysisRecord {
  id: string;
  timestamp: number;
  dateFormatted: string;
  title: string;
  issuer: string;
  documentType: string;
  badge: {
    text: string;
    type: "genuine" | "action_needed" | "scam" | "unclear";
  };
  result: NoticeTriageResult;
  imageThumbnail?: string;
  sampleId?: string;
}

// Client-side image compression for Gemma 4
async function compressImageClientSide(
  file: File
): Promise<{ base64: string; mimeType: "image/jpeg" }> {
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

function getBadgeForResult(
  result: NoticeTriageResult,
  language: SupportedLanguage
): {
  text: string;
  type: "genuine" | "action_needed" | "scam" | "unclear";
} {
  const t = TRANSLATIONS[language];
  if (result.scam_risk === "high_risk" || result.scam_risk === "warning") {
    return { text: t.scamAlertTitle, type: "scam" };
  }
  if (!result.is_legible || result.immediate_action === "unclear" || result.confidence === "low") {
    return { text: t.fallbackNotice.slice(0, 20) + "...", type: "unclear" };
  }
  if (result.immediate_action !== "ignore") {
    return { text: t.actionLabels[result.immediate_action] || "Action Needed", type: "action_needed" };
  }
  return { text: t.safeBadge, type: "genuine" };
}

export default function SamajApp() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<NoticeTriageResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Real scan history persisted in localStorage
  const [realHistory, setRealHistory] = useState<RealAnalysisRecord[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  // Load history from localStorage on initial render (with fallback to old keys)
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("samaj_analyses") ||
        localStorage.getItem("letterwise_real_analyses");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRealHistory(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load stored history:", e);
    }
  }, []);

  // Sync active sample result if language changes
  useEffect(() => {
    if (activeSampleId && triageResult) {
      const sampleItem = SAMPLE_NOTICES.find((s) => s.id === activeSampleId);
      if (sampleItem && sampleItem.sampleResults[language]) {
        setTriageResult(sampleItem.sampleResults[language]);
      }
    }
  }, [language, activeSampleId]);

  const saveRealAnalysis = (
    result: NoticeTriageResult,
    thumbnail?: string,
    sampleId?: string
  ) => {
    const badge = getBadgeForResult(result, language);
    const newRecord: RealAnalysisRecord = {
      id: "scan_" + Date.now(),
      timestamp: Date.now(),
      dateFormatted: new Intl.DateTimeFormat(
        language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-GB",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      ).format(new Date()),
      title: result.document_type
        ? `${t.documentTypes[result.document_type] || result.document_type}`
        : "Official Notice",
      issuer: result.issuer_name || "Official Authority",
      documentType: result.document_type,
      badge,
      result,
      imageThumbnail: thumbnail,
      sampleId,
    };

    setRealHistory((prev) => {
      const updated = [newRecord, ...prev.filter((r) => r.id !== newRecord.id)].slice(0, 15);
      try {
        localStorage.setItem("samaj_analyses", JSON.stringify(updated));
      } catch (err) {
        console.warn("Storage quota exceeded:", err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setRealHistory([]);
    try {
      localStorage.removeItem("samaj_analyses");
      localStorage.removeItem("letterwise_real_analyses");
    } catch {}
  };

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setActiveSampleId(null);

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

      const analyzedResult = data as NoticeTriageResult;
      setTriageResult(analyzedResult);
      saveRealAnalysis(analyzedResult, base64);
      setMobileDetailOpen(true);

      document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" });
    } catch (err: unknown) {
      console.error("Triage error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to analyze notice");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (
    sample: SampleNoticeItem,
    result: NoticeTriageResult,
    thumbnail: string
  ) => {
    setErrorMessage(null);
    setActiveSampleId(sample.id);
    setCurrentImage(thumbnail);
    setTriageResult(result);
    saveRealAnalysis(result, thumbnail, sample.id);
    setMobileDetailOpen(true);

    document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectHistoryItem = (record: RealAnalysisRecord) => {
    setErrorMessage(null);
    setActiveSampleId(record.sampleId || null);
    setTriageResult(record.result);
    setCurrentImage(record.imageThumbnail || null);
    setMobileDetailOpen(true);
    document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const renderBadgeComponent = (badge: RealAnalysisRecord["badge"]) => {
    if (badge.type === "genuine") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCFCE7] text-[#15803D] font-extrabold text-[11px] shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 fill-[#16A34A] text-white" />
          <span className="truncate max-w-[110px]">{badge.text}</span>
        </div>
      );
    }
    if (badge.type === "action_needed") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-extrabold text-[11px] shrink-0">
          <Zap className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
          <span className="truncate max-w-[110px]">{badge.text}</span>
        </div>
      );
    }
    if (badge.type === "scam") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#DC2626] font-extrabold text-[11px] shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 fill-[#DC2626] text-white" />
          <span className="truncate max-w-[110px]">{badge.text}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[11px] shrink-0">
        <span className="truncate max-w-[110px]">{badge.text}</span>
      </div>
    );
  };

  const renderCategoryIcon = (docType: string) => {
    if (docType === "electricity") {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] flex items-center justify-center shrink-0 text-[#F59E0B]">
          <Zap className="w-6 h-6 fill-current" />
        </div>
      );
    }
    if (docType === "bank") {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#EBF5FF] flex items-center justify-center shrink-0 text-[#2563EB]">
          <Landmark className="w-6 h-6" />
        </div>
      );
    }
    if (docType === "court" || docType === "government" || docType === "tax") {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] flex items-center justify-center shrink-0 text-[#0284C7]">
          <Building className="w-6 h-6" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] flex items-center justify-center shrink-0 text-[#EF4444]">
        <Shield className="w-6 h-6 fill-current" />
      </div>
    );
  };

  return (
    <div id="home" className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-200">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
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
              {t.analyzingTitle}
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {t.analyzingSubtitle}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. MOBILE-ONLY VIEW (Visible on mobile viewports < md)        */}
      {/* ============================================================== */}
      <div className="block md:hidden min-h-screen bg-[#F8FAFC] pb-28">
        {/* Mobile Header Bar */}
        <header className="sticky top-0 z-30 px-5 py-3 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-slate-100">
          <a href="#home" className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#2563EB] text-white shadow-xs">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
              <span className="absolute -bottom-1 -right-1 text-[8px] font-black bg-[#1E40AF] text-white px-1 py-0.2 rounded border border-white shadow-2xs">
                AI
              </span>
            </div>

            <span className="text-[22px] font-black tracking-tight">
              <span className="text-[#0F172A]">Sa</span>
              <span className="text-[#2563EB]">maj</span>
            </span>
          </a>

          {/* Right Mobile Header Controls: Language Selector Pill */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              aria-label="Select language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {language === "te" ? "తెలుగు" : language === "hi" ? "हिन्दी" : "English"}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Mobile Body Content */}
        <div className="px-5 space-y-6 pt-3">
          {/* Gradient Banner Card */}
          <section className="w-full rounded-[28px] p-6 bg-gradient-to-br from-[#1E6FFF] via-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-4 right-28 opacity-70">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="absolute bottom-5 right-4 opacity-50">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>

            <div className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-7 space-y-2 z-10">
                <h1 className="text-[22px] font-black leading-[1.15] tracking-tight">
                  {t.heroTitle}
                </h1>

                <p className="text-[12px] font-medium text-white/90 leading-tight">
                  {t.heroSubtitle}
                </p>
              </div>

              <div className="col-span-5 relative h-28 flex items-center justify-center">
                <div className="w-24 h-24 relative">
                  <Image
                    src="/banner-document.svg"
                    alt="Samaj official notice illustration"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Dual Action Buttons */}
          <div id="scan" className="grid grid-cols-2 gap-3.5 pt-0.5 scroll-mt-20">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-4 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-[14px] shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5 text-slate-800 stroke-[2.2]" />
              <span className="truncate">{t.cameraButton}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-4 px-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-[14px] shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5 stroke-[2.5]" />
              <span className="truncate">{t.uploadButton}</span>
            </button>
          </div>

          {/* Sample Notices Carousel on Mobile */}
          <SampleNoticesCarousel
            currentLanguage={language}
            onSelectSample={handleSelectSample}
            isLoading={isLoading}
          />

          {/* Section: Recent Analysis on Mobile */}
          <div id="recent" className="space-y-3 pt-2 scroll-mt-20">
            <div className="flex items-center justify-between">
              <h2 className="text-[19px] font-black text-slate-900 tracking-tight">
                {t.recentAnalysisTitle}
              </h2>
              {realHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[12px] font-semibold text-slate-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.clearHistory}</span>
                </button>
              )}
            </div>

            {realHistory.length === 0 ? (
              <div className="w-full p-7 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {t.emptyHistoryTitle}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {t.emptyHistorySub}
                </p>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.analyzeFirstLetter}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {realHistory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectHistoryItem(item)}
                    className="w-full p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-blue-300 transition-all text-left flex items-center justify-between cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {renderCategoryIcon(item.documentType)}
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-[15px] text-slate-900 leading-snug truncate">
                          {item.title}
                        </h3>
                        <p className="text-[13px] text-slate-500 font-medium truncate">
                          {item.issuer}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                          {item.dateFormatted}
                        </span>
                      </div>
                    </div>
                    {renderBadgeComponent(item.badge)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Safety Tips on Mobile */}
          <SafetyTips language={language} />
        </div>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 pt-2.5 pb-4 flex flex-col justify-center shadow-xl z-40">
          <div className="flex items-center justify-around">
            <a
              href="#home"
              className="flex flex-col items-center gap-1 text-[#2563EB] cursor-pointer"
            >
              <HomeIcon className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[11px] font-extrabold tracking-tight">{t.navHome}</span>
            </a>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-slate-500 hover:text-[#2563EB] cursor-pointer"
            >
              <Scan className="w-5 h-5 stroke-[2]" />
              <span className="text-[11px] font-bold tracking-tight">{t.navScan}</span>
            </button>

            <a
              href="#recent"
              className="flex flex-col items-center gap-1 text-slate-500 hover:text-[#2563EB] cursor-pointer"
            >
              <FileText className="w-5 h-5 stroke-[2]" />
              <span className="text-[11px] font-bold tracking-tight">{t.navMyLetters}</span>
            </a>

            <a
              href="#safety"
              className="flex flex-col items-center gap-1 text-slate-500 hover:text-[#2563EB] cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 stroke-[2] text-emerald-600" />
              <span className="text-[11px] font-bold tracking-tight">{t.navSafety}</span>
            </a>
          </div>
          <div className="w-28 h-1 bg-slate-800 rounded-full mx-auto mt-2.5"></div>
        </nav>

        {/* Mobile Full-Screen Inspection Drawer */}
        {mobileDetailOpen && triageResult && (
          <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="p-1.5 -ml-1 rounded-full hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="font-black text-base text-slate-900">
                  {t.detailsHeading}
                </span>
              </div>

              {/* Language Switcher in Mobile Drawer */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2.5 py-1 rounded-full cursor-pointer ${
                    language === "en"
                      ? "bg-white text-blue-600 shadow-2xs font-extrabold"
                      : "text-slate-600"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("te")}
                  className={`px-2.5 py-1 rounded-full cursor-pointer ${
                    language === "te"
                      ? "bg-white text-blue-600 shadow-2xs font-extrabold"
                      : "text-slate-600"
                  }`}
                >
                  తెలుగు
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  className={`px-2.5 py-1 rounded-full cursor-pointer ${
                    language === "hi"
                      ? "bg-white text-blue-600 shadow-2xs font-extrabold"
                      : "text-slate-600"
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            <div className="p-4 pb-28">
              <TriageCard
                triage={triageResult}
                language={language}
                onReset={() => {
                  setTriageResult(null);
                  setCurrentImage(null);
                  setActiveSampleId(null);
                  setMobileDetailOpen(false);
                }}
                imageUrl={currentImage || undefined}
                onLanguageChange={(newLang) => setLanguage(newLang)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. DESKTOP VIEW (Visible on tablet/desktop viewports >= md)     */}
      {/* ============================================================== */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Navbar
          currentLanguage={language}
          onLanguageChange={(newLang) => setLanguage(newLang)}
          onScanClick={() => {
            cameraInputRef.current?.click();
            document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        <main className="max-w-7xl mx-auto px-6 lg:px-8 w-full space-y-16 mt-8 mb-20">
          {/* Desktop Hero Section */}
          <section className="grid grid-cols-12 gap-12 items-center">
            <div className="col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Samaj • Accessible Notice Triage</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                {t.heroTitle} <br />
                <span className="gradient-hero-text">{t.heroSubtitle}</span>
              </h1>

              <p className="text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
                {t.heroDescription}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all cursor-pointer min-w-[180px]"
                >
                  <Upload className="w-5 h-5" strokeWidth={2.5} />
                  <span>{t.uploadButton}</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-base shadow-sm active:scale-98 transition-all cursor-pointer min-w-[180px]"
                >
                  <Camera className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
                  <span>{t.cameraButton}</span>
                </button>
              </div>

              <p className="text-sm font-semibold text-slate-400 pt-1">
                Supports: Bank • Government • Electricity • Insurance • Court • Tax
              </p>
            </div>

            {/* Desktop Hero Character Graphic */}
            <div className="col-span-5 flex justify-center items-center relative">
              <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                <div className="w-full h-full relative">
                  <Image
                    src="/hero-character.svg"
                    alt="Citizen understanding official notice with Samaj"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>

                <div className="absolute top-6 left-6 p-3 rounded-2xl bg-white border border-slate-100 shadow-md text-blue-600">
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="absolute top-10 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-500/30">
                  <Shield className="w-3.5 h-3.5 fill-current" />
                  <span>Potential Scam</span>
                </div>
                <div className="absolute top-36 -right-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Safe</span>
                </div>
                <div className="absolute bottom-18 right-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Action Needed</span>
                </div>
                <div className="absolute bottom-4 right-14 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-md text-amber-500">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
              </div>
            </div>
          </section>

          {/* 4 Feature Cards */}
          <section className="grid grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {t.features.letterType}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {t.features.letterTypeDesc}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {t.features.checkSafety}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {t.features.checkSafetyDesc}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {t.features.simpleSummary}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {t.features.simpleSummaryDesc}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {t.features.nextSteps}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {t.features.nextStepsDesc}
                </p>
              </div>
            </div>
          </section>

          {/* Real Inspection Section on Desktop */}
          <div id="analysis-section" className="space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {t.detailsHeading}
              </h2>
              <span className="text-xs font-bold text-slate-400">
                Gemma 4 Multimodal Engine
              </span>
            </div>

            {triageResult ? (
              <TriageCard
                triage={triageResult}
                language={language}
                onReset={() => {
                  setTriageResult(null);
                  setCurrentImage(null);
                  setActiveSampleId(null);
                }}
                imageUrl={currentImage || undefined}
                onLanguageChange={(newLang) => setLanguage(newLang)}
              />
            ) : (
              <div className="w-full p-12 rounded-3xl bg-white border-2 border-dashed border-slate-200 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {t.heroTitle}
                </h3>
                <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
                  {t.heroDescription}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                  >
                    {t.uploadButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all cursor-pointer"
                  >
                    {t.cameraButton}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sample Notices Carousel on Desktop */}
          <SampleNoticesCarousel
            currentLanguage={language}
            onSelectSample={handleSelectSample}
            isLoading={isLoading}
          />

          {/* Desktop Real History Section */}
          <section id="recent" className="space-y-4 pt-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {t.recentAnalysisTitle}
              </h2>
              {realHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-xs font-bold text-slate-400 hover:text-red-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.clearHistory}</span>
                </button>
              )}
            </div>

            {realHistory.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-sm font-medium">
                {t.emptyHistorySub}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {realHistory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectHistoryItem(item)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start justify-between cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {renderCategoryIcon(item.documentType)}
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {item.issuer}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {item.dateFormatted}
                        </span>
                      </div>
                    </div>
                    {renderBadgeComponent(item.badge)}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Safety Tips on Desktop */}
          <SafetyTips language={language} />
        </main>
      </div>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">
                {t.selectLanguage}
              </h3>
              <button
                type="button"
                onClick={() => setShowLanguageModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { code: "en", name: "English", sub: "Plain & Clear Words" },
                { code: "te", name: "తెలుగు (Telugu)", sub: "సులభమైన వివరణ" },
                { code: "hi", name: "हिन्दी (Hindi)", sub: "सरल भाषा में" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code as SupportedLanguage);
                    setShowLanguageModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    language === item.code
                      ? "bg-blue-50 border-blue-600 text-blue-700 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-800 font-semibold hover:border-slate-300"
                  }`}
                >
                  <div>
                    <span className="block text-sm font-bold">{item.name}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{item.sub}</span>
                  </div>
                  {language === item.code && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
