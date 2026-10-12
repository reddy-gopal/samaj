"use client";

import React, { useState } from "react";
import {
  Camera,
  Upload,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  FileText,
  Globe,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  HelpCircle,
  QrCode,
  PhoneCall,
  Calendar,
} from "lucide-react";

interface HowItWorksProps {
  onScanClick?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onScanClick }) => {
  const [activeTab, setActiveTab] = useState<"genuine" | "scam">("scam");

  const steps = [
    {
      step: "01",
      title: "Snap or Upload Your Notice",
      tagline: "Any physical paper or digital document",
      description:
        "Take a clear photo with your smartphone or upload a multi-page PDF/image. LetterWise processes electricity bills, bank KYC demands, court summons, tax notices, and insurance letters.",
      icon: Camera,
      color: "bg-blue-600 text-white",
      bgLight: "bg-blue-50/80 border-blue-100",
      accentText: "text-blue-600",
      points: [
        "Take photo directly with mobile camera",
        "Upload multi-page PDF documents",
        "Client-side image enhancement for illegible letters",
      ],
    },
    {
      step: "02",
      title: "AI Safety & Scam Triage",
      tagline: "Powered by Gemma 4 open intelligence",
      description:
        "The AI verifies the issuing authority, examines seals and logos, and identifies suspicious indicators such as fake UPI QR codes, private WhatsApp numbers, and high-pressure threats.",
      icon: ShieldCheck,
      color: "bg-emerald-600 text-white",
      bgLight: "bg-emerald-50/80 border-emerald-100",
      accentText: "text-emerald-600",
      points: [
        "Instant authenticity check (Genuine vs Scam)",
        "Scans for unauthorized payment links & QR codes",
        "Flags impersonation of banks, courts, or police",
      ],
    },
    {
      step: "03",
      title: "Plain Meaning & Next Actions",
      tagline: "Simple language in English, Telugu & Hindi",
      description:
        "Understand exactly what the letter requires in plain terms without confusing legal jargon. See immediate payment amounts, deadline dates, and recommended steps to follow.",
      icon: Sparkles,
      color: "bg-purple-600 text-white",
      bgLight: "bg-purple-50/80 border-purple-100",
      accentText: "text-purple-600",
      points: [
        "Clear translations in English, తెలుగు (Telugu) & हिन्दी (Hindi)",
        "Highlighted deadlines & critical dates",
        "Step-by-step checklist of what to do next",
      ],
    },
  ];

  return (
    <section id="how-it-works" className="w-full scroll-mt-24 space-y-10 py-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>How LetterWise Works</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          From Confusing Paper to <span className="gradient-hero-text">Total Clarity</span>
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
          Official letters are full of complicated legal terms and high-pressure deadlines.
          LetterWise breaks them down in three simple, transparent steps.
        </p>
      </div>

      {/* 3 Step Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="relative p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              {/* Step indicator header */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-black tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors uppercase">
                    Step {s.step}
                  </span>
                  <div
                    className={`w-11 h-11 rounded-2xl ${s.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">
                  {s.title}
                </h3>
                <p className={`text-xs font-bold ${s.accentText} mb-3`}>
                  {s.tagline}
                </p>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                  {s.description}
                </p>
              </div>

              {/* Bullet Highlights */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                {s.points.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${s.accentText}`} />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Safety & Scam Verification Showcase */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-bold backdrop-blur-xs mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Notice Safety Protection</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                How We Protect You From Impersonators & Scams
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl mt-1">
                Scammers frequently disguise notices as official electricity disconnections or bank account freezes. Here is how LetterWise spots the difference:
              </p>
            </div>

            {/* Toggle tabs */}
            <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-white/10 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("scam")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === "scam"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>What We Flag (Scams)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("genuine")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === "genuine"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Genuine Signs</span>
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          {activeTab === "scam" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white/5 border border-red-500/30 backdrop-blur-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Personal Mobile / WhatsApp Numbers</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Official departments never ask you to call personal 10-digit mobile numbers or send details over WhatsApp.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-red-500/30 backdrop-blur-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Suspicious UPI QR Codes</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Scam letters include direct personal UPI QR codes (GPay, PhonePe, Paytm) urging immediate transfer.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-red-500/30 backdrop-blur-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Artificial Urgency & Threatening Tone</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Fake notices threaten disconnection in &quot;within 1 hour&quot; or arrest without statutory notice periods.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-white/5 border border-emerald-500/30 backdrop-blur-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Official Letterhead & Reference ID</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Legitimate notices contain verifiable case numbers, consumer account IDs, and official departmental seals.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-emerald-500/30 backdrop-blur-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Statutory Timelines</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Genuine government/bank actions provide standard 7 to 30 day grace periods with formal dispute channels.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-emerald-500/30 backdrop-blur-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Official Payment Portals Only</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Real notices direct you to official government domains (.gov.in) or registered branch offices.
                </p>
              </div>
            </div>
          )}

          {/* Quick CTA inside How It Works */}
          {onScanClick && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
              <p className="text-xs text-slate-400 font-medium">
                Ready to verify a letter right now? It only takes a few seconds.
              </p>
              <button
                type="button"
                onClick={onScanClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <span>Upload a Letter to Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
