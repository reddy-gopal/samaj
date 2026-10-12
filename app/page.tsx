"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { SupportedLanguage, NoticeTriageResult } from "@/lib/schema";
import { Navbar } from "@/components/Navbar";
import { TriageCard } from "@/components/TriageCard";
import {
  Camera,
  Upload,
  Bell,
  Home as HomeIcon,
  Scan,
  FileText,
  Shield,
  ShieldCheck,
  Zap,
  Building,
  Landmark,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  X,
  CheckCircle2,
  Trash2,
  Inbox,
  FileSearch,
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
}

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

function getBadgeForResult(result: NoticeTriageResult): {
  text: string;
  type: "genuine" | "action_needed" | "scam" | "unclear";
} {
  if (result.scam_risk === "high_risk" || result.scam_risk === "warning") {
    return { text: "Potential Scam", type: "scam" };
  }
  if (!result.is_legible || result.immediate_action === "unclear" || result.confidence === "low") {
    return { text: "Unclear Notice", type: "unclear" };
  }
  if (result.immediate_action !== "ignore") {
    return { text: "Action Needed", type: "action_needed" };
  }
  return { text: "Genuine", type: "genuine" };
}

export default function LetterWiseApp() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<NoticeTriageResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Real scan history persisted in localStorage
  const [realHistory, setRealHistory] = useState<RealAnalysisRecord[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load real history from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem("letterwise_real_analyses");
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

  const saveRealAnalysis = (result: NoticeTriageResult, thumbnail?: string) => {
    const badge = getBadgeForResult(result);
    const newRecord: RealAnalysisRecord = {
      id: "scan_" + Date.now(),
      timestamp: Date.now(),
      dateFormatted: new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date()),
      title: result.document_type
        ? `${result.document_type.charAt(0).toUpperCase() + result.document_type.slice(1)} Notice`
        : "Official Notice",
      issuer: result.issuer_name || "Official Authority",
      documentType: result.document_type,
      badge,
      result,
      imageThumbnail: thumbnail,
    };

    setRealHistory((prev) => {
      const updated = [newRecord, ...prev.filter((r) => r.id !== newRecord.id)].slice(0, 15);
      try {
        localStorage.setItem("letterwise_real_analyses", JSON.stringify(updated));
      } catch (err) {
        console.warn("Storage quota exceeded:", err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setRealHistory([]);
    try {
      localStorage.removeItem("letterwise_real_analyses");
    } catch {}
  };

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

  const handleSelectHistoryItem = (record: RealAnalysisRecord) => {
    setErrorMessage(null);
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
          <span>{badge.text}</span>
        </div>
      );
    }
    if (badge.type === "action_needed") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-extrabold text-[11px] shrink-0">
          <Zap className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
          <span>{badge.text}</span>
        </div>
      );
    }
    if (badge.type === "scam") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#DC2626] font-extrabold text-[11px] shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 fill-[#DC2626] text-white" />
          <span>{badge.text}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[11px] shrink-0">
        <span>{badge.text}</span>
      </div>
    );
  };

  const renderCategoryIcon = (docType: string) => {
    if (docType === "electricity") {
      return (
        <div className="w-13 h-13 rounded-2xl bg-[#FEF3C7] flex items-center justify-center shrink-0 text-[#F59E0B]">
          <Zap className="w-6 h-6 fill-current" />
        </div>
      );
    }
    if (docType === "bank") {
      return (
        <div className="w-13 h-13 rounded-2xl bg-[#EBF5FF] flex items-center justify-center shrink-0 text-[#2563EB]">
          <Landmark className="w-6 h-6" />
        </div>
      );
    }
    if (docType === "court" || docType === "government" || docType === "tax") {
      return (
        <div className="w-13 h-13 rounded-2xl bg-[#E0F2FE] flex items-center justify-center shrink-0 text-[#0284C7]">
          <Building className="w-6 h-6" />
        </div>
      );
    }
    return (
      <div className="w-13 h-13 rounded-2xl bg-[#FEE2E2] flex items-center justify-center shrink-0 text-[#EF4444]">
        <Shield className="w-6 h-6 fill-current" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-200">
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
              Gemma 4 is analyzing your letter...
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Reading official text, verifying authenticity, and extracting immediate actions.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. MOBILE-ONLY VIEW (Visible on mobile viewports < md)        */}
      {/* ============================================================== */}
      <div className="block md:hidden min-h-screen bg-[#F8FAFC] pb-24">
        {/* Mobile Header Bar */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#2563EB] text-white shadow-xs">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
              <span className="absolute -bottom-1 -right-1 text-[8px] font-black bg-[#1E40AF] text-white px-1 py-0.2 rounded border border-white shadow-2xs">
                AI
              </span>
            </div>

            <span className="text-[22px] font-black tracking-tight">
              <span className="text-[#0F172A]">Letter</span>
              <span className="text-[#2563EB]">Wise</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowLanguageModal(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Language & Settings"
            >
              <Bell className="w-6 h-6 stroke-[1.8]" />
            </button>

            <div
              onClick={() => setShowLanguageModal(true)}
              className="w-10 h-10 rounded-full bg-[#D1FAE5] border-2 border-white shadow-2xs flex items-center justify-center overflow-hidden cursor-pointer"
            >
              <svg className="w-8 h-8" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="18" fill="#A7F3D0" />
                <ellipse cx="18" cy="16" rx="7" ry="8" fill="#FBBF24" />
                <ellipse cx="18" cy="16" rx="6.5" ry="7.5" fill="#FDE68A" />
                <circle cx="16" cy="15" r="1" fill="#1F2937" />
                <circle cx="20" cy="15" r="1" fill="#1F2937" />
                <path d="M16 18 Q18 20 20 18" stroke="#1F2937" strokeWidth="1" strokeLinecap="round" fill="none" />
                <path d="M12 12 C12 8, 15 7, 18 7 C21 7, 24 8, 24 12 C23 10, 21 11, 19 10 C16 11, 14 10, 12 12 Z" fill="#111827" />
                <path d="M9 32 C9 26, 13 23, 18 23 C23 23, 27 26, 27 32 Z" fill="#059669" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile Body Content */}
        <div className="px-5 space-y-4 pt-1">
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
                <h1 className="text-[23px] font-black leading-[1.15] tracking-tight">
                  Understand <br />
                  Any Official Letter
                </h1>

                <p className="text-[12px] font-medium text-white/90 leading-tight">
                  Simple. Safe. In Your Language.
                </p>
              </div>

              <div className="col-span-5 relative h-28 flex items-center justify-center">
                <div className="w-28 h-28 relative">
                  <Image
                    src="/banner-document.svg"
                    alt="Official letter 3D document illustration"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-2 gap-3.5 pt-0.5">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2.5 py-4 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-extrabold text-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5 text-slate-800 stroke-[2.2]" />
              <span>Take Photo</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2.5 py-4 px-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-[15px] shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5 stroke-[2.5]" />
              <span>Upload</span>
            </button>
          </div>

          {/* Section: Recent Analysis */}
          <div className="flex items-center justify-between pt-2 pb-0.5">
            <h2 className="text-[19px] font-black text-slate-900 tracking-tight">
              Recent Analysis
            </h2>
            {realHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-[12px] font-semibold text-slate-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {/* REAL HISTORY CARDS LIST */}
          {realHistory.length === 0 ? (
            /* Empty State when no real letters have been analyzed yet */
            <div className="w-full p-8 rounded-3xl bg-white border border-dashed border-slate-200 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                No Real Letters Analyzed Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Photograph or upload your physical notice above. Gemma 4 will analyze it and your real scan history will appear here.
              </p>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Analyze Your First Letter</span>
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
                  <div className="flex items-center gap-3.5">
                    {renderCategoryIcon(item.documentType)}
                    <div>
                      <h3 className="font-extrabold text-[15px] text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[13px] text-slate-500 font-medium">
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

        {/* Mobile Fixed Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 pt-2 pb-4 flex flex-col justify-center shadow-lg z-30">
          <div className="flex items-center justify-around">
            <button
              type="button"
              onClick={() => setMobileDetailOpen(false)}
              className="flex flex-col items-center gap-1 text-[#2563EB] cursor-pointer"
            >
              <HomeIcon className="w-6 h-6 stroke-[2.2]" />
              <span className="text-[11px] font-extrabold tracking-tight">Home</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#2563EB] cursor-pointer"
            >
              <Scan className="w-6 h-6 stroke-[2]" />
              <span className="text-[11px] font-bold tracking-tight">Scan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (realHistory.length > 0) {
                  handleSelectHistoryItem(realHistory[0]);
                } else {
                  cameraInputRef.current?.click();
                }
              }}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#2563EB] cursor-pointer"
            >
              <FileText className="w-6 h-6 stroke-[2]" />
              <span className="text-[11px] font-bold tracking-tight">My Letters</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLanguageModal(true)}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#2563EB] cursor-pointer"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="text-[11px] font-bold tracking-tight">Learn</span>
            </button>
          </div>
          <div className="w-32 h-1 bg-slate-900 rounded-full mx-auto mt-2"></div>
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
                <span className="font-black text-base text-slate-900">Notice Details</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-0.5 rounded-full ${language === "en" ? "bg-white text-blue-600 shadow-2xs font-extrabold" : "text-slate-600"}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("te")}
                  className={`px-2 py-0.5 rounded-full ${language === "te" ? "bg-white text-blue-600 shadow-2xs font-extrabold" : "text-slate-600"}`}
                >
                  తెలుగు
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  className={`px-2 py-0.5 rounded-full ${language === "hi" ? "bg-white text-blue-600 shadow-2xs font-extrabold" : "text-slate-600"}`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            <div className="p-4 pb-24">
              <TriageCard
                triage={triageResult}
                language={language}
                onReset={() => {
                  setTriageResult(null);
                  setCurrentImage(null);
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
          onScanClick={() => cameraInputRef.current?.click()}
        />

        <main className="max-w-7xl mx-auto px-6 lg:px-8 w-full space-y-12 mt-8 mb-16">
          {/* Desktop Hero Section */}
          <section className="grid grid-cols-12 gap-12 items-center">
            <div className="col-span-7 space-y-6">
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Understand <br />
                Your Letters <br />
                <span className="gradient-hero-text">In Simple Words</span>
              </h1>

              <p className="text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
                Upload or take a photo of any official letter. Know what it is, whether it’s safe, and what to do next in simple English, Telugu or Hindi.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all cursor-pointer min-w-[180px]"
                >
                  <Upload className="w-5 h-5" strokeWidth={2.5} />
                  <span>Upload Letter</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-base shadow-sm active:scale-98 transition-all cursor-pointer min-w-[180px]"
                >
                  <Camera className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
                  <span>Take Photo</span>
                </button>
              </div>

              <p className="text-sm font-semibold text-slate-400 pt-1">
                Supports: Bank • Government • Electricity • Insurance • More
              </p>
            </div>

            {/* Desktop Hero Character Graphic */}
            <div className="col-span-5 flex justify-center items-center relative">
              <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                <div className="w-full h-full relative">
                  <Image
                    src="/hero-character.svg"
                    alt="Character reading official letter"
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
                <h3 className="font-extrabold text-base text-slate-900">Identify Letter Type</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Bank, government, insurance, etc.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Check Safety</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Know if it looks genuine or suspicious.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Get Simple Summary</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">In English, Telugu or Hindi.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">See What to Do Next</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Clear, step-by-step guidance.</p>
              </div>
            </div>
          </section>

          {/* Real Inspection Section on Desktop */}
          <div id="analysis-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Letter Inspection & Analysis
              </h2>
              <span className="text-xs font-bold text-slate-400">
                Gemma 4 Open-Weight Engine
              </span>
            </div>

            {triageResult ? (
              <TriageCard
                triage={triageResult}
                language={language}
                onReset={() => {
                  setTriageResult(null);
                  setCurrentImage(null);
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
                  Ready to Inspect Your Letter
                </h3>
                <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
                  Upload an official letter or take a photo with your camera. Gemma 4 will extract the key meaning, verify scam indicators, and provide step-by-step guidance.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
                  >
                    Upload Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all cursor-pointer"
                  >
                    Take Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Real History Section */}
          <section id="recent" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Analysis</h2>
              {realHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-xs font-bold text-slate-400 hover:text-red-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {realHistory.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 text-sm font-medium">
                No analyzed letters yet. Upload a letter above to build your real analysis history.
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
                    <div className="flex items-start gap-3">
                      {renderCategoryIcon(item.documentType)}
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">{item.issuer}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">{item.dateFormatted}</span>
                      </div>
                    </div>
                    {renderBadgeComponent(item.badge)}
                  </button>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Select Language</h3>
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
                { code: "en", name: "English", sub: "Simple Words" },
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
                      : "bg-slate-50 border-slate-200 text-slate-800 font-semibold"
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
