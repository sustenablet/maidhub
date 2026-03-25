"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-[20px] font-bold text-[#D4D4D4] tracking-[-0.03em] mb-2">
          Something went wrong
        </h1>
        <p className="text-[14px] text-[#888888] leading-relaxed mb-8">
          An unexpected error occurred. Your data is safe — try refreshing or go back to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold rounded-[4px] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-transparent border border-[#2C2C2C] text-[#888888] hover:text-[#D4D4D4] hover:border-[#3A3A3A] text-[13px] font-semibold rounded-[4px] transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
