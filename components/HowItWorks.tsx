"use client";

import React from "react";
import {
  Camera,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  CheckSquare,
  ArrowRight,
} from "lucide-react";

interface HowItWorksProps {
  onScanClick?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onScanClick }) => {
  const steps = [
    {
      step: "01",
      title: "Upload or Snap Document",
      tagline: "Camera, Image or Multi-Page PDF",
      description:
        "Photograph your physical letter with your phone camera or upload a digital PDF/image. Samaj supports electricity disconnection notices, bank KYC demands, court summons, tax demands, and insurance lapses.",
      icon: Camera,
      badgeColor: "bg-blue-600 text-white",
      borderAccent: "border-blue-200 hover:border-blue-400",
      accentText: "text-blue-600",
      points: [
        "Live mobile camera capture or gallery file picker",
        "Multi-page PDF support (up to 10 pages auto-rendered)",
        "Automatic relevance filter protects against unrelated images",
      ],
      previewSnippet: "Accepts Electricity Bills, Bank Notices, Court Summons & PDFs",
    },
    {
      step: "02",
      title: "AI Safety & Scam Check",
      tagline: "Multimodal Gemma 4 Verification",
      description:
        "Samaj scans the notice for official letterheads, seals, and dispatch numbers. It immediately screens for extortion tactics, phishing QR codes, and fake department threats.",
      icon: ShieldCheck,
      badgeColor: "bg-emerald-600 text-white",
      borderAccent: "border-emerald-200 hover:border-emerald-400",
      accentText: "text-emerald-600",
      points: [
        "Detects unauthorized personal UPI QR codes (GPay, PhonePe)",
        "Flags personal 10-digit mobile and WhatsApp contact numbers",
        "Identifies artificial urgency (e.g. 'pay in 1 hr or face arrest')",
      ],
      previewSnippet: "Instant Scam Risk: Genuine, Needs Action, or Scam Warning",
    },
    {
      step: "03",
      title: "Plain Meaning in Your Language",
      tagline: "English, Telugu (తెలుగు) & Hindi (हिन्दी)",
      description:
        "No more panic from dense legal jargon. Samaj explains the letter in simple, everyday language so you instantly know who sent it, why, and what amount is genuine.",
      icon: Sparkles,
      badgeColor: "bg-purple-600 text-white",
      borderAccent: "border-purple-200 hover:border-purple-400",
      accentText: "text-purple-600",
      points: [
        "Plain-language core summary without confusing legalese",
        "Extracted statutory deadline date and exact amount due",
        "1-Tap native voice readout in Telugu, Hindi, or English",
      ],
      previewSnippet: "Who Sent It • Why • Exact Due Date • Amount Due",
    },
    {
      step: "04",
      title: "Action Steps & Family Share",
      tagline: "Clear Checklist & WhatsApp Guidance",
      description:
        "Get an explicit, prioritized action plan detailing exactly what to do next. Share the plain-language summary with trusted family members or children before paying anything.",
      icon: CheckSquare,
      badgeColor: "bg-amber-600 text-white",
      borderAccent: "border-amber-200 hover:border-amber-400",
      accentText: "text-amber-600",
      points: [
        "Prioritized checklist: What to pay, dispute, or safely ignore",
        "Official verified office addresses and departmental helplines",
        "1-Tap WhatsApp share to verify with children or family",
      ],
      previewSnippet: "Step-by-Step Checklist • Verified Portals • WhatsApp Share",
    },
  ];

  return (
    <section id="how-it-works" className="w-full scroll-mt-24 space-y-8 py-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>How Samaj Works</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          From Confusing Paperwork to <span className="gradient-hero-text">Total Clarity</span>
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
          Official letters are filled with threatening legalese, tight countdowns, and confusing clauses.
          Samaj guides you from document upload to safe resolution in 4 simple steps.
        </p>
      </div>

      {/* Visual Stepper Bar on Desktop */}
      <div className="hidden lg:grid grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-900 font-bold text-xs">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
          <span>1. Upload Notice / PDF</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-xs">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
          <span>2. AI Safety & Scam Check</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-900 font-bold text-xs">
          <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
          <span>3. Plain Meaning & Voice</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-900 font-bold text-xs">
          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-black">4</span>
          <span>4. Action Plan & Share</span>
        </div>
      </div>

      {/* 4 Step Process Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className={`relative p-6 rounded-3xl bg-white border ${s.borderAccent} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group`}
            >
              <div>
                {/* Step indicator header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors uppercase">
                    Step {s.step}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-2xl ${s.badgeColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
                  {s.title}
                </h3>
                <p className={`text-xs font-bold ${s.accentText} mb-3`}>
                  {s.tagline}
                </p>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5 font-medium">
                  {s.description}
                </p>
              </div>

              {/* Bullet Highlights */}
              <div>
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {s.points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${s.accentText}`} />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {/* Micro preview snippet */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl text-center">
                  {s.previewSnippet}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick CTA banner at bottom of How It Works */}
      {onScanClick && (
        <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <h4 className="font-extrabold text-base text-white">Have an official notice or letter right now?</h4>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Snap a photo or upload a PDF to test Samaj instant triage and safety verification.
            </p>
          </div>
          <button
            type="button"
            onClick={onScanClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer shrink-0"
          >
            <span>Scan Document</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};
