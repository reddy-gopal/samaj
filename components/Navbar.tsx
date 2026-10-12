"use client";

import React, { useState } from "react";
import { SupportedLanguage } from "@/lib/schema";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "@/lib/languages";
import { ChevronDown, Globe, Shield, User, Bell, Menu, X, Camera, ShieldCheck } from "lucide-react";

interface NavbarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onScanClick: () => void;
  onHomeClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  onScanClick,
  onHomeClick,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS[currentLanguage];
  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo - Samaj */}
        <a
          href="/"
          onClick={(e) => {
            if (onHomeClick) {
              e.preventDefault();
              onHomeClick();
            }
          }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
            {/* Document icon with AI badge */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-purple-600 text-white px-1 py-0.2 rounded shadow-2xs">
              AI
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
              <span>Sa<span className="text-blue-600">maj</span></span>
              <span className="text-xs font-semibold text-slate-400">
                {currentLanguage === "te" ? "సమాజ్" : currentLanguage === "hi" ? "समाज" : "Notice Triage"}
              </span>
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <a
            href="/"
            onClick={(e) => {
              if (onHomeClick) {
                e.preventDefault();
                onHomeClick();
              }
            }}
            className="text-slate-700 font-bold transition-colors hover:text-blue-600 cursor-pointer"
          >
            {t.navHome}
          </a>
          <button
            type="button"
            onClick={onScanClick}
            className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer font-semibold"
          >
            Scan
          </button>
          <a
            href="#recent"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            {t.navMyLetters}
          </a>
          <a
            href="#how-it-works"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#safety"
            className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Safety Tips</span>
          </a>
        </nav>

        {/* Right Action Controls: Language dropdown & User avatar */}
        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer"
              aria-label="Select language"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>{selectedLangObj?.name}</span>
              <span className="text-xs text-slate-400 font-normal hidden sm:inline">({selectedLangObj?.nativeName})</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  {t.selectLanguage}
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                      currentLanguage === lang.code
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <span>{lang.name}</span>
                    <span className="text-xs text-slate-500 font-semibold">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick scan action button on desktop */}
          <button
            type="button"
            onClick={onScanClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t.navScan}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
