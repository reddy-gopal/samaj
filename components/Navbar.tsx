"use client";

import React, { useState } from "react";
import { SupportedLanguage } from "@/lib/schema";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { ChevronDown, Globe, Shield, User, Bell } from "lucide-react";

interface NavbarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onScanClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  onScanClick,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo matching LetterWise */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-sm">
            {/* Document icon with AI badge */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-purple-600 text-white px-1 py-0.2 rounded shadow-2xs">
              AI
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Letter<span className="text-blue-600">Wise</span>
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <a
            href="#home"
            className="text-blue-600 font-bold transition-colors hover:text-blue-700"
          >
            Home
          </a>
          <button
            type="button"
            onClick={onScanClick}
            className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Scan
          </button>
          <a
            href="#recent"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            My Letters
          </a>
          <a
            href="#how-it-works"
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            How It Works
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
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{selectedLangObj?.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
                    <span className="text-xs text-slate-400 font-normal">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
            <User className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </div>
    </header>
  );
};
