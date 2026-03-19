"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Users,
  CalendarDays,
  Receipt,
  FileText,
  RefreshCw,
  Smartphone,
  Shield,
  ArrowLeft,
  Zap,
  Star,
} from "lucide-react";

const soloFeatures = [
  "Unlimited clients & addresses",
  "Full job scheduling & calendar",
  "Recurring job rules (weekly, biweekly, monthly)",
  "Estimates with contract text",
  "Invoicing & payment tracking",
  "Revenue & finances overview",
  "Mobile-optimized interface",
  "Secure cloud backup (Supabase)",
  "Priority email support",
];

const whyUpgrade = [
  { icon: Users, title: "All your clients, organized", desc: "No limits. Add every client, every address, every note." },
  { icon: CalendarDays, title: "Never miss a job", desc: "Weekly calendar, recurring rules, and at-a-glance scheduling." },
  { icon: Receipt, title: "Get paid faster", desc: "Professional invoices sent in seconds. Track what's paid, what's due." },
  { icon: RefreshCw, title: "Recurring jobs on autopilot", desc: "Set it once. MaidHub generates the next jobs automatically." },
  { icon: FileText, title: "Win more bids", desc: "Send polished estimates and convert them to invoices in one click." },
  { icon: Shield, title: "Your data, secure", desc: "Row-level encryption and cloud backup — your business is protected." },
];

export default function UpgradePage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  function handleSubscribe() {
    // Phase 8: Square checkout
    console.log(`Subscribe solo/${billing}`);
  }

  const monthlyPrice = 29;
  const yearlyPrice = Math.round(monthlyPrice * 0.8);
  const displayPrice = billing === "yearly" ? yearlyPrice : monthlyPrice;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#555555] hover:text-[#D4D4D4] transition-colors mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        Back to Dashboard
      </Link>

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-[#0071E3]/10 border border-[#0071E3]/20 rounded-full px-3.5 py-1.5 mb-5">
          <Zap className="h-3.5 w-3.5 text-[#0071E3]" strokeWidth={2} />
          <span className="text-[12px] font-semibold text-[#0071E3]">Your free trial is active</span>
        </div>
        <h1 className="text-[32px] font-bold text-[#D4D4D4] tracking-[-0.04em] leading-tight mb-3">
          Keep your business running<br />after the trial ends
        </h1>
        <p className="text-[15px] text-[#888888] leading-relaxed max-w-md mx-auto">
          Everything you need to manage clients, schedule jobs, and get paid — in one place, built for solo cleaners.
        </p>
      </div>

      {/* Pricing card */}
      <div className="bg-[#1E1E1E] border border-[#0071E3]/30 rounded-[8px] overflow-hidden mb-6 shadow-[0_0_0_1px_rgba(0,113,227,0.08),0_8px_32px_rgba(0,0,0,0.4)]">

        {/* Billing toggle */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-[#0071E3]" strokeWidth={2} fill="currentColor" />
            <span className="text-[13px] font-bold text-[#D4D4D4]">MaidHub Solo</span>
          </div>
          <div className="flex items-center bg-[#141414] rounded-[4px] p-0.5 border border-[#2C2C2C]">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-3.5 py-1.5 rounded-[3px] text-[12px] font-semibold transition-all ${
                billing === "monthly" ? "bg-[#0071E3] text-white" : "text-[#888888] hover:text-[#D4D4D4]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-3.5 py-1.5 rounded-[3px] text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
                billing === "yearly" ? "bg-[#0071E3] text-white" : "text-[#888888] hover:text-[#D4D4D4]"
              }`}
            >
              Yearly
              <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${billing === "yearly" ? "bg-white/20 text-white" : "bg-[#34C759]/15 text-[#34C759]"}`}>
                −20%
              </span>
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="px-6 py-6 border-b border-[#252525]">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[48px] font-bold text-[#D4D4D4] tracking-[-0.05em] leading-none tabular-nums">
              ${displayPrice}
            </span>
            <div>
              <p className="text-[13px] text-[#888888]">/month</p>
              {billing === "yearly" && (
                <p className="text-[11px] text-[#555555]">billed ${displayPrice * 12}/yr</p>
              )}
            </div>
          </div>
          {billing === "yearly" && (
            <p className="text-[12px] text-[#34C759] font-semibold mt-1">
              You save ${(monthlyPrice - yearlyPrice) * 12}/year
            </p>
          )}
        </div>

        {/* Features */}
        <div className="px-6 py-5 border-b border-[#252525]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
            {soloFeatures.map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <div className="h-4 w-4 rounded-full bg-[#0071E3]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-2.5 w-2.5 text-[#0071E3]" strokeWidth={3} />
                </div>
                <span className="text-[13px] text-[#D4D4D4] leading-snug">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 py-5">
          <button
            onClick={handleSubscribe}
            className="w-full py-3 bg-[#0071E3] hover:bg-[#0077ED] text-white text-[14px] font-bold rounded-[6px] transition-colors tracking-[-0.01em]"
          >
            Upgrade to Solo — ${displayPrice}/mo
          </button>
          <p className="text-center text-[11px] text-[#555555] mt-3">
            Cancel anytime · No hidden fees · Powered by Square
          </p>
        </div>
      </div>

      {/* Team plan — coming soon */}
      <div className="bg-[#1A1A1A] border border-[#252525] rounded-[8px] px-6 py-5 mb-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-bold text-[#888888]">MaidHub Team</span>
            <span className="text-[10px] font-semibold text-[#555555] bg-[#252525] px-2 py-0.5 rounded-full uppercase tracking-wider">Coming soon</span>
          </div>
          <p className="text-[12px] text-[#555555]">Team members, route optimization, client portal & advanced reports</p>
        </div>
        <span className="text-[20px] font-bold text-[#333333] tabular-nums tracking-[-0.03em] shrink-0 ml-4">$49/mo</span>
      </div>

      {/* Why upgrade */}
      <div className="mb-8">
        <h2 className="text-[16px] font-bold text-[#D4D4D4] tracking-[-0.03em] mb-5">Why cleaners love MaidHub</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {whyUpgrade.map((item) => (
            <div key={item.title} className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[6px] p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-[4px] bg-[#0071E3]/10 flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-[#0071E3]" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#D4D4D4] leading-tight">{item.title}</p>
                <p className="text-[12px] text-[#888888] leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust footer */}
      <div className="flex items-center justify-center gap-6 pb-4">
        {[
          { icon: Shield, label: "Bank-grade security" },
          { icon: RefreshCw, label: "Cancel anytime" },
          { icon: Smartphone, label: "Mobile-optimized" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <item.icon className="h-3.5 w-3.5 text-[#444444]" strokeWidth={1.8} />
            <span className="text-[11px] text-[#555555] font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
