import React from "react";

export const SbiLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <div className="flex flex-col items-center justify-center">
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#0083CA" />
      <circle cx="50" cy="40" r="14" fill="#FFFFFF" />
      <rect x="46" y="40" width="8" height="42" fill="#FFFFFF" rx="2" />
    </svg>
    <span className="text-[10px] font-black text-[#0083CA] leading-none mt-0.5 tracking-tight">
      SBI
    </span>
  </div>
);
