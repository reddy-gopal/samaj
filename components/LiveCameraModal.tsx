"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, X, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start camera stream
  const startCamera = useCallback(async (mode: "environment" | "user") => {
    stopStream();
    setCameraError(null);
    setIsInitializing(true);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported by your current browser.");
      setIsInitializing(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsInitializing(false);
    } catch (err: unknown) {
      console.warn("Primary camera constraint failed, attempting fallback:", err);
      // Fallback with basic constraints if ideal resolution failed
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
        setIsInitializing(false);
      } catch (fallbackErr: unknown) {
        console.error("Camera access denied or failed:", fallbackErr);
        const msg =
          fallbackErr instanceof Error
            ? fallbackErr.message
            : "Could not access camera. Please allow camera permissions in your browser.";
        setCameraError(msg);
        setIsInitializing(false);
      }
    }
  }, [stopStream]);

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  // Handle capture shutter
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `notice_snap_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        stopStream();
        onCapture(file);
      },
      "image/jpeg",
      0.9
    );
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="w-full max-w-lg flex items-center justify-between z-10 text-white pt-2">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold tracking-wide">Position Notice in Frame</span>
        </div>

        <button
          type="button"
          onClick={() => {
            stopStream();
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close camera"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Viewfinder Box */}
      <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-[4/3] rounded-3xl overflow-hidden bg-black flex items-center justify-center shadow-2xl border border-white/10">
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-3 z-10">
            <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-xs font-bold">Starting Camera...</p>
          </div>
        )}

        {cameraError ? (
          <div className="p-6 text-center text-white space-y-4 max-w-xs z-10">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h4 className="text-base font-black">Camera Permission Required</h4>
            <p className="text-xs text-white/70 leading-relaxed">{cameraError}</p>
            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Live Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Document Guide Overlay Corners */}
            <div className="absolute inset-8 sm:inset-12 pointer-events-none border-2 border-white/30 rounded-2xl flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                <div className="w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                <div className="w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls Bar with Shutter Button */}
      <div className="w-full max-w-lg flex items-center justify-around py-4 z-10">
        {/* Flip Camera Button */}
        <button
          type="button"
          onClick={toggleCameraFacing}
          disabled={Boolean(cameraError) || isInitializing}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer"
          aria-label="Flip camera"
        >
          <RefreshCw className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Large Circular Shutter Snap Button */}
        <button
          type="button"
          onClick={handleSnap}
          disabled={Boolean(cameraError) || isInitializing}
          className="w-20 h-20 rounded-full bg-white p-1.5 shadow-2xl transition-transform active:scale-95 disabled:opacity-40 cursor-pointer flex items-center justify-center group"
          aria-label="Capture photo"
        >
          <div className="w-full h-full rounded-full border-4 border-slate-900 bg-white flex items-center justify-center group-active:bg-slate-200">
            <Camera className="w-7 h-7 text-slate-900 fill-slate-900/10" />
          </div>
        </button>

        {/* Placeholder spacer for symmetry */}
        <div className="w-12 h-12" />
      </div>
    </div>
  );
};
