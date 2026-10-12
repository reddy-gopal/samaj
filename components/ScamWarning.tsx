"use client";

import React from "react";
import { SupportedLanguage, ScamRisk } from "@/lib/schema";
import { TRANSLATIONS } from "@/lib/languages";
import { ShieldAlert, AlertTriangle, Lock, CreditCard, PhoneCall, HelpCircle } from "lucide-react";

interface ScamWarningProps {
  scamRisk: ScamRisk;
  redFlags: string[];
  language: SupportedLanguage;
}

export const ScamWarning: React.FC<ScamWarningProps> = ({
  scamRisk,
  redFlags,
  language,
}) => {
  if (scamRisk === "none_detected") {
    return null;
  }

  const t = TRANSLATIONS[language];
  const isHighRisk = scamRisk === "high_risk";

  return (
    <section
      role="alert"
      aria-labelledby="scam-warning-title"
      className={`w-full rounded-2xl border-2 p-5 sm:p-6 shadow-md transition-all duration-200 ${
        isHighRisk
          ? "bg-red-50/95 border-red-600 text-red-950"
          : "bg-amber-50/95 border-amber-600 text-amber-950"
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3.5 mb-4">
        <div
          className={`p-2.5 rounded-xl text-white shrink-0 shadow-sm ${
            isHighRisk ? "bg-red-600" : "bg-amber-600"
          }`}
        >
          {isHighRisk ? (
            <ShieldAlert className="w-8 h-8" />
          ) : (
            <AlertTriangle className="w-8 h-8" />
          )}
        </div>
        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1 text-white shadow-xs ${
              isHighRisk ? "bg-red-700" : "bg-amber-700"
            }`}
          >
            {isHighRisk ? t.highRiskBadge : t.warningRiskBadge}
          </span>
          <h2
            id="scam-warning-title"
            className="text-xl sm:text-2xl font-black tracking-tight leading-tight"
          >
            {t.scamAlertTitle}
          </h2>
          <p className="text-sm font-semibold mt-1 opacity-90">
            {t.scamWarningSubtitle}
          </p>
        </div>
      </div>

      {/* Identified red flags from AI */}
      {redFlags && redFlags.length > 0 && (
        <div className="mb-5 p-3.5 rounded-xl bg-white/90 border border-red-300 shadow-2xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-red-800 mb-2">
            Identified Red Flags / గుర్తించిన అనుమానాలు:
          </h3>
          <ul className="space-y-1.5 list-disc list-inside text-sm font-bold text-red-900">
            {redFlags.map((flag, idx) => (
              <li key={idx} className="leading-snug">
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Crucial Action Shield Rules */}
      <div className="space-y-2.5 pt-2 border-t border-red-200">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-red-200">
          <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm sm:text-base font-bold leading-snug">
            {t.scamShieldPoints.noOtp}
          </p>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-red-200">
          <CreditCard className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm sm:text-base font-bold leading-snug">
            {t.scamShieldPoints.noPersonalUpi}
          </p>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-red-200">
          <PhoneCall className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm sm:text-base font-bold leading-snug">
            {t.scamShieldPoints.verifyOfficial}
          </p>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-red-200">
          <HelpCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-semibold text-neutral-800 leading-snug">
            {t.scamShieldPoints.cannotConfirmGenuine}
          </p>
        </div>
      </div>
    </section>
  );
};
