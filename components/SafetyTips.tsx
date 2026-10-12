"use client";

import React from "react";
import { SupportedLanguage } from "@/lib/schema";
import { TRANSLATIONS } from "@/lib/languages";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  PhoneCall,
  AlertTriangle,
  Building,
  Landmark,
  Zap,
  FileText,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface SafetyTipsProps {
  language: SupportedLanguage;
}

export const SafetyTips: React.FC<SafetyTipsProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  const safetyRules = [
    {
      icon: <Lock className="w-5 h-5 text-red-600" />,
      title: language === "te" ? "OTP లేదా PIN ఎవరితోనూ పంచుకోవద్దు" : language === "hi" ? "OTP या PIN किसी से साझा न करें" : "Never Share OTP, PIN or CVV",
      desc: language === "te" 
        ? "బ్యాంకు అధికారులు లేదా ప్రభుత్వ ఉద్యోగులు ఎన్నడూ మీ ఫోన్‌కు వచ్చే రహస్య సంఖ్యలను అడగరు."
        : language === "hi"
        ? "बैंक या सरकारी अधिकारी कभी भी आपके फोन पर आए गोपनीय पासवर्ड या कोड नहीं मांगते।"
        : "Legitimate bank managers or government officials will NEVER ask for your OTP, ATM PIN, or card CVV.",
      borderColor: "border-red-200",
      bgBadge: "bg-red-100 text-red-800",
      badge: language === "te" ? "ముఖ్య నియమం" : language === "hi" ? "अति महत्वपूर्ण" : "Golden Rule #1",
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      title: language === "te" ? "వ్యక్తిగత UPI IDలకు చెల్లించవద్దు" : language === "hi" ? "निजी UPI ID पर पैसे न भेजें" : "No Personal UPI Transfers",
      desc: language === "te"
        ? "విద్యుత్ లేదా ప్రభుత్వ బకాయిలను కేవలం అధికారిక ప్రభుత్వ పోర్టల్ లేదా మీ-సేవ ద్వారానే చెల్లించండి."
        : language === "hi"
        ? "बिजली या टैक्स का भुगतान केवल अधिकृत सरकारी पोर्टल या सुविधा केंद्र पर ही करें।"
        : "Official departments never request payments to personal UPI handles (e.g. xyz@paytm, phone@upi).",
      borderColor: "border-amber-200",
      bgBadge: "bg-amber-100 text-amber-800",
      badge: language === "te" ? "చెల్లింపు భద్రత" : language === "hi" ? "भुगतान सुरक्षा" : "Payment Guard",
    },
    {
      icon: <PhoneCall className="w-5 h-5 text-blue-600" />,
      title: language === "te" ? "జాతీయ సైబర్ హెల్ప్‌లైన్: 1930" : language === "hi" ? "राष्ट्रीय साइबर हेल्पलाइन: 1930" : "National Cyber Helpline: 1930",
      desc: language === "te"
        ? "ఆర్థిక లేదా సైబర్ మోసం జరిగితే వెంటనే 1930 కి కాల్ చేయండి లేదా cybercrime.gov.in లో ఫిర్యాదు చేయండి."
        : language === "hi"
        ? "धोखाधड़ी होने पर तुरंत 1930 पर कॉल करें या cybercrime.gov.in पोर्टल पर तुरंत शिकायत दर्ज करें।"
        : "If you suspect financial fraud, call 1930 immediately within the golden hour to freeze fraudulent transactions.",
      borderColor: "border-blue-200",
      bgBadge: "bg-blue-100 text-blue-800",
      badge: language === "te" ? "24x7 సహాయం" : language === "hi" ? "24x7 सहायता" : "Helpline 1930",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      title: language === "te" ? "అధికారిక వెబ్‌సైట్లలో మాత్రమే ధృవీకరించుకోండి" : language === "hi" ? "केवल आधिकारिक स्रोतों से जांचें" : "Verify from .gov.in Portals",
      desc: language === "te"
        ? "నోటీసులోని ఫోన్ నంబర్‌కు కాకుండా, మీ పాత అధికారిక బిల్లులోని నంబర్‌కు మాత్రమే కాల్ చేయండి."
        : language === "hi"
        ? "नोटिस में दिए गए अनजान नंबर की जगह अपने पुराने असली बिल पर दिए नंबर से ही पुष्टि करें।"
        : "Do not call unverified numbers printed on suspicious letters. Cross-check using numbers from past physical bills.",
      borderColor: "border-emerald-200",
      bgBadge: "bg-emerald-100 text-emerald-800",
      badge: language === "te" ? "స్వతంత్ర ధృవీకరణ" : language === "hi" ? "पुष्टि करें" : "Independent Check",
    },
  ];

  return (
    <section id="safety" className="w-full space-y-6 pt-4 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              {language === "te" ? "సమాజ్ రక్షణ కవచం" : language === "hi" ? "समाज सुरक्षा कवच" : "Samaj Safety Shield"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.safetySectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
            {t.safetySectionSub}
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>Cyber Crime: <strong>1930</strong></span>
        </div>
      </div>

      {/* 4 Core Safety Rule Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {safetyRules.map((rule, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white border ${rule.borderColor} shadow-2xs space-y-3 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                {rule.icon}
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${rule.bgBadge}`}>
                {rule.badge}
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                {rule.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {rule.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Common Official Document Safeguards Table */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          <span>
            {language === "te" 
              ? "నిజమైన vs నకిలీ నోటీసుల వ్యత్యాసం" 
              : language === "hi" 
              ? "असली बनाम फर्जी नोटिस की पहचान" 
              : "Spotting Real vs Impostor Notices"}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          {/* Electricity */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>{language === "te" ? "విద్యుత్ నోటీసులు" : language === "hi" ? "बिजली नोटिस" : "Electricity Notices"}</span>
            </div>
            <p className="text-slate-700 font-medium leading-relaxed">
              {language === "te"
                ? "విద్యుత్ శాఖ ఎన్నడూ వ్యక్తిగత వాట్సాప్ లేదా ఎస్ఎంఎస్ ద్వారా 'ఈ రోజే రాత్రి 9కి కరెంట్ కట్' అని బెదిరించదు. కనీసం 15 రోజుల లిఖితపూర్వక గడువు ఇస్తుంది."
                : language === "hi"
                ? "बिजली बोर्ड कभी भी व्हाट्सएप पर 'आज रात 9 बजे बिजली काट दी जाएगी' जैसी धमकी नहीं देता। हमेशा 15 दिन का आधिकारिक समय मिलता है।"
                : "Power distribution utilities never send WhatsApp messages threatening power cuts 'tonight at 9:30 PM'. They give a minimum 15-day statutory notice."}
            </p>
          </div>

          {/* Bank KYC */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-blue-950 text-sm">
              <Landmark className="w-4 h-4 text-blue-600" />
              <span>{language === "te" ? "బ్యాంక్ KYC పత్రాలు" : language === "hi" ? "बैंक केवाईसी" : "Bank KYC Requests"}</span>
            </div>
            <p className="text-slate-700 font-medium leading-relaxed">
              {language === "te"
                ? "బ్యాంకు ఖాతా 24 గంటల్లో నిలిపివేయబడుతుందని భయపెడితే మోసమే. ఆధార్, పాన్ లేదా ఓటీపీ వాట్సాప్‌లో పంపవద్దు. మీ హోమ్ బ్రాంచ్‌కు వెళ్లండి."
                : language === "hi"
                ? "24 घंटे में खाता ब्लॉक होने की धमकी फर्जी होती है। कभी भी व्हाट्सएप पर दस्तावेज या ओटीपी न भेजें। अपनी शाखा में जाएं।"
                : "Accounts are never instantly blocked without prior written registered notice. Never upload documents via WhatsApp. Visit your home branch."}
            </p>
          </div>

          {/* Court Summons */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-purple-950 text-sm">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>{language === "te" ? "కోర్టు సమన్లు" : language === "hi" ? "अदालती सम्मन" : "Court Summons"}</span>
            </div>
            <p className="text-slate-700 font-medium leading-relaxed">
              {language === "te"
                ? "కోర్టు సమన్లు అధికారిక రిజిస్టర్డ్ పోస్ట్ ద్వారా లేదా కోర్టు బేలిఫ్ ద్వారా వస్తాయి. e-Courts అధికారిక యాప్‌లో కేస్ నంబర్ తనిఖీ చేసుకోండి."
                : language === "hi"
                ? "कोर्ट सम्मन रजिस्टर्ड डाक या अदालत के अर्दली द्वारा दिया जाता है। ई-कोर्ट आधिकारिक पोर्टल (ecourts.gov.in) पर केस नंबर सत्यापित करें।"
                : "Genuine court summons include a court seal and case suit number. Verify via the national e-Courts portal (services.ecourts.gov.in)."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
