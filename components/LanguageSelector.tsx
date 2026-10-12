"use client";

import React from "react";
import { SupportedLanguage } from "@/lib/schema";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "@/lib/languages";

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  disabled = false,
}) => {
  const t = TRANSLATIONS[currentLanguage];

  return (
    <section aria-labelledby="lang-selector-heading" className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <h2
          id="lang-selector-heading"
          className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2"
        >
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          {t.selectLanguage}
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
          {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label={t.selectLanguage}
        className="grid grid-cols-3 gap-2.5"
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onLanguageChange(lang.code)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-150 text-center select-none active:scale-95 min-h-[72px] focus:outline-none focus:ring-4 focus:ring-emerald-500/30 ${
                isSelected
                  ? "bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm font-bold ring-1 ring-emerald-600"
                  : "bg-white border-neutral-200 hover:border-neutral-400 text-neutral-800 shadow-xs"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className="text-base sm:text-lg leading-tight tracking-tight">
                {lang.nativeName}
              </span>
              <span
                className={`text-xs mt-1 font-medium ${
                  isSelected ? "text-emerald-700" : "text-neutral-500"
                }`}
              >
                {lang.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
