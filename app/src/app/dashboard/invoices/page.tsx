"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal, MoreHorizontal, Receipt } from "lucide-react";

type InvoiceStatus = "paid" | "unpaid" | "overdue";

interface Invoice {
  id: string;
  client: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

const mockInvoices: Invoice[] = [
  { id: "INV-0041", client: "Sarah Johnson", amount: 280, issueDate: "Mar 1, 2026", dueDate: "Mar 15, 2026", status: "paid" },
  { id: "INV-0042", client: "Tom Wilson", amount: 150, issueDate: "Mar 5, 2026", dueDate: "Mar 19, 2026", status: "unpaid" },
  { id: "INV-0043", client: "Lisa Park", amount: 420, issueDate: "Mar 8, 2026", dueDate: "Mar 22, 2026", status: "unpaid" },
  { id: "INV-0040", client: "David Brown", amount: 320, issueDate: "Feb 20, 2026", dueDate: "Mar 6, 2026", status: "overdue" },
  { id: "INV-0039", client: "Emma Davis", amount: 180, issueDate: "Feb 15, 2026", dueDate: "Mar 1, 2026", status: "paid" },
];

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200" },
  unpaid: { label: "Unpaid", className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200" },
  overdue: { label: "Overdue", className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200" },
};

export default function InvoicesPage() {
  const [search, setSearch] = useState("");

  const filtered = mockInvoices.filter(
    (inv) =>
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalInvoiced = mockInvoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = mockInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = mockInvoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amount, 0);

  const isEmpty = mockInvoices.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]" style={{ fontFamily: "'Fraunces', serif" }}>
            Invoices
          </h1>
          <p className="text-sm text-gray-400 mt-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
            Track payments and outstanding balances
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Invoiced", amount: totalInvoiced, color: "text-[#1A2332]", bg: "bg-gray-50", border: "" },
          { label: "Paid", amount: totalPaid, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
          { label: "Outstanding", amount: totalOutstanding, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
        ].map((card) => (
          <div key={card.label} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80`}>
            <p className="text-xs font-semibold text-gray-400 mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              {card.label}
            </p>
            <p className={`text-xl font-bold ${card.color} tabular-nums`} style={{ fontFamily: "'Fraunces', serif" }}>
              ${card.amount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-350" />
            <input
              type="text"
              placeholder="Search invoices..."
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
            <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="text-base font-semibold text-[#1A2332] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
              No invoices yet
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed" style={{ fontFamily: "'Syne', sans-serif" }}>
              Create your first invoice to start tracking payments from clients.
            </p>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  {["Invoice #", "Client", "Amount", "Issue Date", "Due Date", "Status", ""].map((h, i) => (
                    <th
                      key={i}
                      className={`text-left px-5 py-3 text-[11px] font-semibold text-gray-400 whitespace-nowrap ${i >= 3 ? "hidden md:table-cell" : ""} ${i >= 4 ? "hidden lg:table-cell" : ""}`}
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((inv) => {
                  const status = statusConfig[inv.status];
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 text-xs font-mono text-[#1A2332]/50">{inv.id}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#1A2332]" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {inv.client}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#1A2332] tabular-nums" style={{ fontFamily: "'Fraunces', serif" }}>
                        ${inv.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#1A2332]/55 hidden md:table-cell whitespace-nowrap" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {inv.issueDate}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#1A2332]/55 hidden lg:table-cell whitespace-nowrap" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {inv.dueDate}
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
