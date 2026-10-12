"use client";

import React, { useState } from "react";
import { SupportedLanguage, NoticeTriageResult } from "@/lib/schema";
import { TRANSLATIONS } from "@/lib/languages";
import { SAMPLE_NOTICES, SampleNoticeItem } from "@/lib/samples";
import {
  Sparkles,
  Zap,
  Landmark,
  Building,
  AlertTriangle,
  FileText,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

interface SampleNoticesCarouselProps {
  currentLanguage: SupportedLanguage;
  onSelectSample: (
    sample: SampleNoticeItem,
    result: NoticeTriageResult,
    thumbnailDataUrl: string
  ) => void;
  isLoading?: boolean;
}

export const SampleNoticesCarousel: React.FC<SampleNoticesCarouselProps> = ({
  currentLanguage,
  onSelectSample,
  isLoading = false,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: currentLanguage === "te" ? "అన్నీ" : currentLanguage === "hi" ? "सभी" : "All" },
    { id: "electricity", label: t.documentTypes.electricity },
    { id: "bank", label: t.documentTypes.bank },
    { id: "court", label: t.documentTypes.court },
    { id: "tax", label: t.documentTypes.tax },
  ];

  const filteredSamples =
    selectedCategory === "all"
      ? SAMPLE_NOTICES
      : SAMPLE_NOTICES.filter((s) => s.category === selectedCategory);

  const handleSampleClick = (sample: SampleNoticeItem) => {
    // Generate quick canvas visual thumbnail for the sample
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = sample.badgeType === "scam" ? "#fff5f5" : "#ffffff";
    ctx.fillRect(0, 0, 600, 800);

    ctx.fillStyle = sample.badgeType === "scam" ? "#991b1b" : "#1e40af";
    ctx.fillRect(30, 30, 540, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("SAMAJ OFFICIAL NOTICE", 50, 78);

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(sample.title, 50, 160);

    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(`Category: ${sample.category.toUpperCase()}`, 50, 200);

    const result = sample.sampleResults[currentLanguage] || sample.sampleResults.en;
    if (result.issuer_name) {
      ctx.fillStyle = "#334155";
      ctx.fillText(`Issuer: ${result.issuer_name}`, 50, 240);
    }
    if (result.amount_due) {
      ctx.fillStyle = "#059669";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`Amount: ${result.amount_due}`, 50, 290);
    }
    if (result.deadline) {
      ctx.fillStyle = "#dc2626";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`Deadline: ${result.deadline}`, 50, 330);
    }

    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px monospace";
    ctx.fillText("Ref: " + (result.reference_id || "SAMAJ-DOC-2026"), 50, 380);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onSelectSample(sample, result, dataUrl);
  };

  const getBadgeIcon = (type: string) => {
    if (type === "scam") return <ShieldAlert className="w-3.5 h-3.5 text-red-600" />;
    if (type === "fallback") return <HelpCircle className="w-3.5 h-3.5 text-amber-600" />;
    if (type === "legal") return <Building className="w-3.5 h-3.5 text-blue-600" />;
    return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
  };

  return (
    <section id="samples" className="w-full space-y-4 pt-4 scroll-mt-24">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              {currentLanguage === "te" ? "తక్షణ పరీక్ష" : currentLanguage === "hi" ? "त्वरित परीक्षण" : "Instant Evaluation"}
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.sampleNoticesTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t.sampleNoticesSubtitle}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-white text-blue-700 shadow-2xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Samples */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredSamples.map((sample) => {
          const isScam = sample.badgeType === "scam";
          const isFallback = sample.badgeType === "fallback";

          return (
            <button
              key={sample.id}
              type="button"
              disabled={isLoading}
              onClick={() => handleSampleClick(sample)}
              className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between hover:shadow-md cursor-pointer active:scale-[0.98] ${
                isScam
                  ? "bg-red-50/40 border-red-200 hover:border-red-400"
                  : isFallback
                  ? "bg-amber-50/40 border-amber-200 hover:border-amber-400"
                  : "bg-white border-slate-200/90 hover:border-blue-400"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {getBadgeIcon(sample.badgeType)}
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {sample.category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      isScam
                        ? "bg-red-600 text-white"
                        : isFallback
                        ? "bg-amber-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {sample.badge}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {sample.title}
                </h3>

                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                <span>
                  {currentLanguage === "te" ? "విశ్లేషించండి" : currentLanguage === "hi" ? "जांचें" : "Test Notice"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
