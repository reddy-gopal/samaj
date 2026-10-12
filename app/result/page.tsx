"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function ResultPage() {
  const router = useRouter();

  useEffect(() => {
    // If user accesses /result without an active capture session, redirect to home
    const timeout = setTimeout(() => {
      router.push("/");
    }, 1500);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 border-2 border-neutral-200 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-black text-neutral-900">Notice Explainer Result</h1>
        <p className="text-sm font-medium text-neutral-600">
          Redirecting to notice capture & scanner...
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-neutral-900 text-white font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Home</span>
        </Link>
      </div>
    </div>
  );
}
