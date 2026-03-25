import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--mh-bg)] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="text-[80px] font-bold text-[#252525] leading-none tracking-[-0.05em] tabular-nums select-none mb-6">
          404
        </div>
        <h1 className="text-[20px] font-bold text-[var(--mh-text)] tracking-[-0.03em] mb-2">
          Page not found
        </h1>
        <p className="text-[14px] text-[var(--mh-text-muted)] leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold rounded-[4px] transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 bg-transparent border border-[var(--mh-border)] text-[var(--mh-text-muted)] hover:text-[var(--mh-text)] hover:border-[var(--mh-border-strong)] text-[13px] font-semibold rounded-[4px] transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
