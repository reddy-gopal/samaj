"use client";

import React, { useRef, useState, useId } from "react";
import { SupportedLanguage } from "@/lib/schema";
import { TRANSLATIONS } from "@/lib/languages";
import { SAMPLE_NOTICES, SampleNoticeItem } from "@/lib/samples";
import { Camera, Image as ImageIcon, Sparkles, AlertCircle, RefreshCw, Layers } from "lucide-react";

interface CameraCaptureProps {
  currentLanguage: SupportedLanguage;
  onImageSelected: (
    base64Image: string,
    mimeType: "image/jpeg" | "image/png" | "image/webp",
    sampleId?: string
  ) => void;
  isLoading: boolean;
}

// Client-side image compressor: Resizes photos to max 1600px dimension and encodes to JPEG (~400KB)
// Ensures compatibility with Vercel's 4.5MB serverless body limit
async function compressImageClientSide(file: File): Promise<{ base64: string; mimeType: "image/jpeg" }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        const maxDimension = 1280;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        resolve({
          base64: compressedDataUrl,
          mimeType: "image/jpeg",
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  currentLanguage,
  onImageSelected,
  isLoading,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAllSamples, setShowAllSamples] = useState(false);
  const cameraInputId = useId();
  const fileInputId = useId();

  const handleFile = async (file: File) => {
    setErrorMessage(null);

    // Validate MIME type
    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type)) {
      setErrorMessage("Please select a valid image (JPEG, PNG, or WebP).");
      return;
    }

    try {
      // Compress in-browser before upload to respect Vercel's payload limits
      const { base64, mimeType } = await compressImageClientSide(file);
      onImageSelected(base64, mimeType);
    } catch (err) {
      console.error("Compression error:", err);
      // Fallback to direct read if canvas fails
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelected(reader.result as string, file.type as "image/jpeg" | "image/png" | "image/webp");
      };
      reader.readAsDataURL(file);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleNoticeItem) => {
    setErrorMessage(null);

    // Generate canvas visual card for the sample
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = sample.badgeType === "scam" ? "#fff5f5" : "#ffffff";
    ctx.fillRect(0, 0, 800, 1000);

    // Header banner
    ctx.fillStyle = sample.badgeType === "scam" ? "#991b1b" : "#1e3a8a";
    ctx.fillRect(40, 40, 720, 100);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(sample.title.toUpperCase(), 60, 100);

    ctx.fillStyle = "#111827";
    ctx.font = "20px sans-serif";
    ctx.fillText(`Category: ${sample.category.toUpperCase()}`, 60, 190);
    ctx.fillText(`Description: ${sample.description}`, 60, 230);

    const result = sample.sampleResults[currentLanguage];
    if (result.issuer_name) {
      ctx.fillText(`Issuer: ${result.issuer_name}`, 60, 290);
    }
    if (result.reference_id) {
      ctx.fillText(`Reference: ${result.reference_id}`, 60, 330);
    }
    if (result.amount_due) {
      ctx.fillStyle = "#047857";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`Amount: ${result.amount_due}`, 60, 380);
    }
    if (result.deadline) {
      ctx.fillStyle = "#b91c1c";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`Deadline: ${result.deadline}`, 60, 420);
    }

    if (sample.badgeType === "fallback") {
      ctx.filter = "blur(16px)";
      ctx.fillStyle = "#6b7280";
      ctx.fillText("BLURRY ILLEGIBLE NOTICE TEXT SAMPLE", 80, 500);
      ctx.filter = "none";
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    onImageSelected(dataUrl, "image/jpeg", sample.id);
  };

  const displayedSamples = showAllSamples ? SAMPLE_NOTICES : SAMPLE_NOTICES.slice(0, 4);

  return (
    <div className="w-full space-y-4">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900"
        >
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Hidden native inputs */}
      <input
        ref={cameraInputRef}
        id={cameraInputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={onFileChange}
        disabled={isLoading}
      />
      <input
        ref={fileInputRef}
        id={fileInputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
        disabled={isLoading}
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Large Primary Camera Button */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isLoading}
          aria-label={t.cameraButton}
          className="w-full flex items-center justify-center gap-3.5 py-5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-lg sm:text-xl shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-emerald-500 cursor-pointer min-h-[76px]"
        >
          <Camera className="w-8 h-8 shrink-0" strokeWidth={2.5} />
          <span>{t.cameraButton}</span>
        </button>

        {/* Gallery / Choose Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label={t.uploadButton}
          className="w-full flex items-center justify-center gap-3.5 py-5 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white font-bold text-lg sm:text-xl shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-neutral-800 cursor-pointer min-h-[76px]"
        >
          <ImageIcon className="w-8 h-8 shrink-0 text-emerald-400" strokeWidth={2.5} />
          <span>{t.uploadButton}</span>
        </button>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click();
          }
        }}
        className={`w-full py-6 px-4 rounded-2xl border-2 border-dashed transition-all duration-150 text-center cursor-pointer select-none flex flex-col items-center justify-center gap-2 ${
          dragOver
            ? "border-emerald-600 bg-emerald-50/60 scale-[1.01]"
            : "border-neutral-300 hover:border-neutral-400 bg-neutral-50/70"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Sparkles className="w-6 h-6 text-emerald-600" />
        <p className="text-sm font-semibold text-neutral-700">
          {t.dragDropText}
        </p>
        <span className="text-xs text-neutral-500 font-medium">
          Auto-compressed on device (Supports JPG, PNG, WebP)
        </span>
      </div>

      {/* 8-Sample Notices for Judges & Evaluation */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {t.sampleNoticesTitle} ({SAMPLE_NOTICES.length})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              Pre-Loaded
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAllSamples(!showAllSamples)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showAllSamples ? "Show Fewer" : "View All 8"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {displayedSamples.map((sample) => {
            const isScam = sample.badgeType === "scam";
            const isFallback = sample.badgeType === "fallback";
            const isLegal = sample.badgeType === "legal";

            return (
              <button
                key={sample.id}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectSample(sample)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all active:scale-98 text-xs font-bold shadow-2xs cursor-pointer ${
                  isScam
                    ? "bg-red-50/70 border-red-200 hover:border-red-500 text-red-950"
                    : isFallback
                    ? "bg-amber-50/70 border-amber-200 hover:border-amber-500 text-amber-950"
                    : isLegal
                    ? "bg-blue-50/70 border-blue-200 hover:border-blue-500 text-blue-950"
                    : "bg-white border-neutral-200 hover:border-emerald-500 text-neutral-900"
                }`}
              >
                <div className="truncate mr-2">
                  <span className="block truncate">{sample.title}</span>
                  <span className="text-[10px] text-neutral-500 font-normal truncate block">
                    {sample.category}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0 ${
                    isScam
                      ? "bg-red-600 text-white"
                      : isFallback
                      ? "bg-amber-600 text-white"
                      : isLegal
                      ? "bg-blue-700 text-white"
                      : "bg-emerald-600 text-white"
                  }`}
                >
                  {sample.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900">
        <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
        <p className="text-xs sm:text-sm font-medium leading-relaxed">
          {t.privacyNote}
        </p>
      </div>

      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white border-2 border-emerald-200 shadow-lg text-center space-y-3"
        >
          <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin" />
          <h3 className="text-lg font-bold text-neutral-900">
            {t.analyzingTitle}
          </h3>
          <p className="text-sm text-neutral-600 font-medium max-w-xs">
            {t.analyzingSubtitle}
          </p>
        </div>
      )}
    </div>
  );
};
