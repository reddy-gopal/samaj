"use client";

import React from "react";
import { SupportedLanguage } from "@/lib/schema";
import { TRANSLATIONS } from "@/lib/languages";
import { HelpCircle, Users, PhoneCall, RefreshCw } from "lucide-react";

interface FallbackCardProps {
  language: SupportedLanguage;
  onRetake?: () => void;
}

export const FallbackCard: React.FC<FallbackCardProps> = ({
  language,
  onRetake,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <section
      role="status"
      aria-labelledby="fallback-card-title"
      className="w-full rounded-2xl border-2 border-amber-500 bg-amber-50/95 p-5 sm:p-6 text-amber-950 shadow-md"
    >
      <div className="flex items-start gap-3.5 mb-4">
        <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1 bg-amber-200 text-amber-900 border border-amber-300">
            Uncertain / స్పష్టత లేదు
          </span>
          <h2
            id="fallback-card-title"
            className="text-lg sm:text-xl font-black tracking-tight leading-snug"
          >
            {t.fallbackNotice}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-amber-800 mt-1">
            {t.fallbackSubtext}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/90 border border-amber-200">
          <Users className="w-5 h-5 text-amber-700 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-neutral-900">
            Show notice to family or trusted friend
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/90 border border-amber-200">
          <PhoneCall className="w-5 h-5 text-amber-700 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-neutral-900">
            Check official contact on past bill
          </span>
        </div>
      </div>

      {onRetake && (
        <button
          type="button"
          onClick={onRetake}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all active:scale-98 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t.retakeButton}</span>
        </button>
      )}
    </section>
  );
};
