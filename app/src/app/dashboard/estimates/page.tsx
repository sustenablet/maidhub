"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal, MoreHorizontal, FileText } from "lucide-react";

type EstimateStatus = "draft" | "sent" | "accepted" | "declined";

interface Estimate {
  id: string;
  client: string;
  service: string;
  amount: number;
  date: string;
  status: EstimateStatus;
}

const mockEstimates: Estimate[] = [
  { id: "EST-0018", client: "Sarah Johnson", service: "Deep Clean (3 bed)", amount: 280, date: "Mar 10, 2026", status: "accepted" },
  { id: "EST-0019", client: "Mike Chen", service: "Move-Out Clean", amount: 450, date: "Mar 12, 2026", status: "sent" },
  { id: "EST-0020", client: "Anna Garcia", service: "Regular Bi-Weekly", amount: 160, date: "Mar 14, 2026", status: "draft" },
  { id: "EST-0021", client: "Robert Lee", service: "Post-Construction", amount: 620, date: "Mar 16, 2026", status: "sent" },
  { id: "EST-0017", client: "Jen Adams", service: "Deep Clean (4 bed)", amount: 360, date: "Mar 5, 2026", status: "declined" },
];

const statusConfig: Record<EstimateStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200" },
  sent: { label: "Sent", className: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200" },
  accepted: { label: "Accepted", className: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200" },
  declined: { label: "Declined", className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200" },
};

export default function EstimatesPage() {
  const [search, setSearch] = useState("");

  const filtered = mockEstimates.filter(
    (e) =>
      e.client.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.service.toLowerCase().includes(search.toLowerCase())
  );

  const isEmpty = mockEstimates.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]" style={{ fontFamily: "'Fraunces', serif" }}>
            Estimates
          </h1>
          <p className="text-sm text-gray-400 mt-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
            Create and send service estimates to clients
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <Plus className="h-4 w-4" />
          New Estimate
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-350" />
            <input
              type="text"
              placeholder="Search estimates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 w-48 transition-all"
              style={{ fontFamily: "'Syne', sans-serif" }}
            />
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1A2332]/55 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-16 w-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-base font-semibold text-[#1A2332] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
              No estimates yet
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>
              Send estimates to potential clients to convert them into paid jobs.
            </p>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <Plus className="h-4 w-4" />
              New Estimate
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {["Estimate #", "Client", "Service", "Amount", "Date", "Status", ""].map((h, i) => (
                    <th
                      key={i}
                      className={`text-left px-5 py-3 text-[11px] font-semibold text-gray-400 whitespace-nowrap ${i === 2 ? "hidden md:table-cell" : ""} ${i >= 4 ? "hidden lg:table-cell" : ""}`}
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((est) => {
                  const status = statusConfig[est.status];
                  return (
                    <tr key={est.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 text-xs font-mono text-[#1A2332]/50">{est.id}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#1A2332]" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {est.client}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#1A2332]/60 hidden md:table-cell" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {est.service}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#1A2332] tabular-nums" style={{ fontFamily: "'Fraunces', serif" }}>
                        ${est.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#1A2332]/55 hidden lg:table-cell whitespace-nowrap" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {est.date}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${status.className}`}
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button className="text-gray-300 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
