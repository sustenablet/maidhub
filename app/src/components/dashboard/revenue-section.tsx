"use client";

import { useMemo, useState } from "react";
import { TrendingUp, ChevronRight } from "lucide-react";
import { RevenueChart, type RevenueDataPoint } from "./revenue-chart";

type Period = "week" | "1m" | "3m" | "6m";

const PERIOD_ORDER: Period[] = ["week", "1m", "3m", "6m"];
const PERIOD_LABELS: Record<Period, string> = {
  week: "last week",
  "1m": "last month",
  "3m": "last 3 months",
  "6m": "last 6 months",
};

export interface RawInvoice {
  payment_date: string | null;
  total: number | null;
}

function groupByDay(invoices: RawInvoice[], days: number): RevenueDataPoint[] {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const result: RevenueDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const label =
      days <= 7
        ? d.toLocaleDateString("en-US", { weekday: "short" })
        : `${d.getMonth() + 1}/${d.getDate()}`;
    const amount = invoices
      .filter((inv) => inv.payment_date === dateStr)
      .reduce((s, inv) => s + (inv.total || 0), 0);
    result.push({ month: label, amount: Math.round(amount * 100) / 100 });
  }
  return result;
}

function groupByMonth(invoices: RawInvoice[], months: number): RevenueDataPoint[] {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    const amount = invoices
      .filter((inv) => inv.payment_date?.startsWith(monthStr))
      .reduce((s, inv) => s + (inv.total || 0), 0);
    return { month: label, amount: Math.round(amount * 100) / 100 };
  });
}

function buildChartData(invoices: RawInvoice[], period: Period): RevenueDataPoint[] {
  switch (period) {
    case "week":
      return groupByDay(invoices, 7);
    case "1m":
      return groupByDay(invoices, 30);
    case "3m":
      return groupByMonth(invoices, 3);
    case "6m":
      return groupByMonth(invoices, 6);
  }
}

function cutoffFor(period: Period): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  switch (period) {
    case "week": d.setDate(d.getDate() - 6); break;
    case "1m":   d.setDate(d.getDate() - 29); break;
    case "3m":   d.setMonth(d.getMonth() - 3); break;
    case "6m":   d.setMonth(d.getMonth() - 6); break;
  }
  return d;
}

interface RevenueSectionProps {
  rawInvoices: RawInvoice[];
  revGrowth: number | null;
}

export function RevenueSection({ rawInvoices, revGrowth }: RevenueSectionProps) {
  const [period, setPeriod] = useState<Period>("week");

  function nextPeriod() {
    const idx = PERIOD_ORDER.indexOf(period);
    setPeriod(PERIOD_ORDER[(idx + 1) % PERIOD_ORDER.length]);
  }

  const chartData = useMemo(() => buildChartData(rawInvoices, period), [rawInvoices, period]);

  const total = useMemo(() => {
    const cutoff = cutoffFor(period);
    return rawInvoices
      .filter((inv) => inv.payment_date && new Date(inv.payment_date + "T00:00:00") >= cutoff)
      .reduce((s, inv) => s + (inv.total || 0), 0);
  }, [rawInvoices, period]);

  return (
    <div className="lg:col-span-2 bg-[var(--mh-surface)] rounded-[6px] border border-[var(--mh-border)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--mh-divider)]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <TrendingUp className="h-4 w-4 text-[#0071E3]" strokeWidth={2} />
              <h2 className="text-[14px] font-bold text-[var(--mh-text)] tracking-[-0.02em]">Revenue</h2>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[28px] font-bold text-[var(--mh-text)] tracking-[-0.04em] tabular-nums leading-none">
                ${total.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <button
                onClick={nextPeriod}
                className="flex items-center gap-0.5 text-[12px] font-semibold text-[#0071E3] hover:text-[#0077ED] transition-colors group"
                title="Click to change period"
              >
                {PERIOD_LABELS[period]}
                <ChevronRight className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          {revGrowth !== null && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold ${revGrowth >= 0 ? "bg-[#34C759]/10 text-[#34C759]" : "bg-red-500/10 text-red-400"}`}>
              <TrendingUp className="h-3 w-3" strokeWidth={2} />
              {revGrowth >= 0 ? "+" : ""}{revGrowth}% vs last month
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        <RevenueChart data={chartData} />
      </div>
    </div>
  );
}
