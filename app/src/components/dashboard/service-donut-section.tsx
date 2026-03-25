"use client";

import { useState } from "react";
import { X, TrendingUp, Briefcase, DollarSign, BarChart3 } from "lucide-react";
import { ServiceDonut, type ServiceDataPoint } from "./service-donut";

interface ServiceDonutSectionProps {
  services: ServiceDataPoint[];
  total: number;
  totalJobs: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export function ServiceDonutSection({ services, total, totalJobs }: ServiceDonutSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const sorted = [...services].sort((a, b) => b.amount - a.amount);
  const topService = sorted[0];

  return (
    <>
      <div className="bg-[var(--mh-surface)] rounded-[6px] border border-[var(--mh-border)] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-[var(--mh-divider)]">
          <h2 className="text-[14px] font-bold text-[var(--mh-text)] tracking-[-0.02em]">Services</h2>
          <p className="text-[11px] text-[var(--mh-text-subtle)] mt-0.5">Earned revenue by type</p>
        </div>
        <div className="p-5 flex-1 flex items-center justify-center">
          <ServiceDonut services={services} total={total} />
        </div>
        {services.length > 0 && (
          <div className="px-5 pb-4">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-[12px] font-semibold text-[var(--mh-text-muted)] hover:text-[var(--mh-text)] bg-[var(--mh-surface-raised)] hover:bg-[var(--mh-hover-overlay)] border border-[var(--mh-border)] rounded-[6px] transition-all"
            >
              <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.8} />
              View Full Breakdown
            </button>
          </div>
        )}
      </div>

      {/* ── Finance Breakdown Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-2xl bg-[var(--mh-surface)] rounded-[10px] border border-[var(--mh-border)] shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--mh-divider)]">
              <div>
                <h2 className="text-[16px] font-bold text-[var(--mh-text)] tracking-[-0.02em]">Revenue Breakdown</h2>
                <p className="text-[12px] text-[var(--mh-text-muted)] mt-0.5">All-time revenue by service type</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-[6px] text-[var(--mh-text-muted)] hover:text-[var(--mh-text)] hover:bg-[var(--mh-hover-overlay)] transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-px bg-[var(--mh-surface-raised)] border-b border-[var(--mh-divider)]">
              {[
                {
                  icon: DollarSign,
                  label: "Total Revenue",
                  value: formatCurrency(total),
                  color: "text-[#34C759]",
                },
                {
                  icon: Briefcase,
                  label: "Total Jobs",
                  value: String(totalJobs),
                  color: "text-[#0071E3]",
                },
                {
                  icon: TrendingUp,
                  label: "Avg per Job",
                  value: totalJobs > 0 ? formatCurrency(total / totalJobs) : "—",
                  color: "text-[#FF9F0A]",
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-[var(--mh-surface)] px-5 py-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} strokeWidth={1.8} />
                    <p className="text-[10px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.08em]">{stat.label}</p>
                  </div>
                  <p className={`text-[20px] font-bold tracking-[-0.03em] ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Top earner banner */}
            {topService && (
              <div className="mx-5 mt-5 flex items-center gap-3 px-4 py-3 rounded-[6px] border border-[var(--mh-border)] bg-[var(--mh-surface-raised)]">
                <div
                  className="h-8 w-8 rounded-[5px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: topService.color + "22", border: `1px solid ${topService.color}44` }}
                >
                  <TrendingUp className="h-4 w-4" style={{ color: topService.color }} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[var(--mh-text-subtle)] font-semibold uppercase tracking-wide">Top Earner</p>
                  <p className="text-[13px] font-bold text-[var(--mh-text)]">{topService.label}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-bold text-[var(--mh-text)]">{formatCurrency(topService.amount)}</p>
                  <p className="text-[11px] text-[var(--mh-text-muted)]">{topService.value}% of jobs</p>
                </div>
              </div>
            )}

            {/* Service table */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--mh-divider)]">
                    <th className="text-left pb-2 text-[10px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.08em]">Service</th>
                    <th className="text-right pb-2 text-[10px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.08em]">Jobs</th>
                    <th className="text-right pb-2 text-[10px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.08em]">Revenue</th>
                    <th className="text-right pb-2 text-[10px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.08em]">Avg / Job</th>
                    <th className="text-right pb-2 text-[10px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.08em]">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--mh-divider)]">
                  {sorted.map((s, i) => {
                    const jobCount = s.count ?? Math.round((s.value / 100) * totalJobs);
                    const avg = jobCount > 0 ? s.amount / jobCount : 0;
                    const share = total > 0 ? Math.round((s.amount / total) * 100) : 0;
                    return (
                      <tr key={s.label} className="hover:bg-[var(--mh-hover-overlay)] transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: s.color }}
                            />
                            <span className="text-[13px] font-semibold text-[var(--mh-text)]">{s.label}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right text-[13px] text-[var(--mh-text-muted)] tabular-nums">{jobCount}</td>
                        <td className="py-3 text-right text-[13px] font-semibold text-[var(--mh-text)] tabular-nums">{formatCurrency(s.amount)}</td>
                        <td className="py-3 text-right text-[12px] text-[var(--mh-text-muted)] tabular-nums">{avg > 0 ? formatCurrency(avg) : "—"}</td>
                        <td className="py-3 pl-4">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-[var(--mh-surface-raised)] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${share}%`, backgroundColor: s.color }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-[var(--mh-text-muted)] tabular-nums w-8 text-right">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--mh-divider)] flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-[13px] font-semibold text-[var(--mh-text)] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] rounded-[6px] hover:bg-[var(--mh-hover-overlay)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
