import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(first_name, last_name, email, phone, addresses(street, city, state, zip))")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!invoice) notFound();

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, business_name, phone")
    .eq("id", user!.id)
    .single();

  const client = invoice.clients as {
    first_name: string; last_name: string; email: string | null; phone: string | null;
    addresses: Array<{ street: string; city: string; state: string; zip: string }>;
  } | null;

  const lineItems: Array<{ description: string; quantity: number; unit_price: number }> =
    Array.isArray(invoice.line_items) ? invoice.line_items : [];

  const subtotal = lineItems.reduce((s, li) => s + (li.quantity || 1) * (li.unit_price || 0), 0);
  const taxAmount = Math.max(0, (invoice.total || 0) - subtotal);

  function fmt(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  }
  function fmtDate(d: string | null) {
    if (!d) return "—";
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  const invNum = `INV-${id.substring(0, 6).toUpperCase()}`;
  const address = client?.addresses?.[0];

  const statusColors: Record<string, string> = {
    paid: "bg-[#34C759]/10 text-[#34C759]",
    unpaid: "bg-[#FF9F0A]/10 text-[#FF9F0A]",
    void: "bg-[#555555]/20 text-[var(--mh-text-muted)]",
    overdue: "bg-red-500/10 text-red-400",
  };

  return (
    <div className="min-h-screen bg-[var(--mh-bg)]">
      {/* Toolbar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-[var(--mh-sidebar)]/90 backdrop-blur-md border-b border-[var(--mh-border-subtle)] px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard/invoices" className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--mh-text-muted)] hover:text-[var(--mh-text)] transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to Invoices
        </Link>
        <button
          onClick={() => {
            if (typeof window !== "undefined") window.print();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold rounded-[4px] transition-colors"
        >
          <Printer className="h-3.5 w-3.5" strokeWidth={2} />
          Print / Save PDF
        </button>
      </div>

      {/* Invoice document */}
      <div className="max-w-2xl mx-auto px-6 py-10 print:py-0 print:px-0 print:max-w-none">
        <div className="bg-[var(--mh-surface)] rounded-[8px] print:rounded-none shadow-[var(--mh-shadow-panel)] print:shadow-none overflow-hidden border border-[var(--mh-border)]">

          {/* Header */}
          <div className="bg-[var(--mh-surface-sunken)] print:bg-[#F8F8F8] px-8 py-8 border-b border-[var(--mh-border)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-[4px] bg-[#0071E3] flex items-center justify-center">
                    <span className="text-white font-bold text-[14px]">M</span>
                  </div>
                  <span className="text-[var(--mh-text)] print:text-[#1A1A1A] font-bold text-[16px] tracking-[-0.02em]">
                    {profile?.business_name || "MaidHub"}
                  </span>
                </div>
                {profile?.display_name && (
                  <p className="text-[13px] text-[var(--mh-text-muted)] print:text-[#666666]">{profile.display_name}</p>
                )}
                {profile?.phone && (
                  <p className="text-[13px] text-[var(--mh-text-muted)] print:text-[#666666]">{profile.phone}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[28px] font-bold text-[var(--mh-text)] print:text-[#1A1A1A] tracking-[-0.04em] leading-none">{invNum}</p>
                <span className={`inline-flex mt-2 items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusColors[invoice.status] || statusColors.unpaid}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Bill to + dates */}
          <div className="px-8 py-6 border-b border-[var(--mh-border)] print:border-[#E5E5E5] bg-[var(--mh-surface)] print:bg-white">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mh-text-subtle)] print:text-[#999999] mb-2">Bill To</p>
                {client ? (
                  <>
                    <p className="text-[14px] font-semibold text-[var(--mh-text)] print:text-[#1A1A1A]">
                      {client.first_name} {client.last_name}
                    </p>
                    {client.email && <p className="text-[12px] text-[var(--mh-text-muted)] print:text-[#666666]">{client.email}</p>}
                    {client.phone && <p className="text-[12px] text-[var(--mh-text-muted)] print:text-[#666666]">{client.phone}</p>}
                    {address && (
                      <p className="text-[12px] text-[var(--mh-text-muted)] print:text-[#666666] mt-0.5">
                        {address.street}<br />{address.city}, {address.state} {address.zip}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[13px] text-[var(--mh-text-muted)]">—</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mh-text-subtle)] print:text-[#999999] mb-2">Issue Date</p>
                <p className="text-[13px] font-medium text-[var(--mh-text)] print:text-[#1A1A1A]">{fmtDate(invoice.created_at)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mh-text-subtle)] print:text-[#999999] mb-2">Due Date</p>
                <p className="text-[13px] font-medium text-[var(--mh-text)] print:text-[#1A1A1A]">{fmtDate(invoice.due_date)}</p>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="px-8 py-6 bg-[var(--mh-surface)] print:bg-white">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--mh-border)] print:border-[#E5E5E5]">
                  <th className="text-left pb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--mh-text-subtle)] print:text-[#999999]">Description</th>
                  <th className="text-center pb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--mh-text-subtle)] print:text-[#999999] w-16">Qty</th>
                  <th className="text-right pb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--mh-text-subtle)] print:text-[#999999] w-28">Unit Price</th>
                  <th className="text-right pb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--mh-text-subtle)] print:text-[#999999] w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length > 0 ? lineItems.map((li, i) => (
                  <tr key={i} className="border-b border-[var(--mh-divider)] print:border-[#F0F0F0]">
                    <td className="py-3 text-[var(--mh-text)] print:text-[#1A1A1A]">{li.description}</td>
                    <td className="py-3 text-center text-[var(--mh-text-muted)] print:text-[#666666] tabular-nums">{li.quantity || 1}</td>
                    <td className="py-3 text-right text-[var(--mh-text-muted)] print:text-[#666666] tabular-nums">{fmt(li.unit_price || 0)}</td>
                    <td className="py-3 text-right font-medium text-[var(--mh-text)] print:text-[#1A1A1A] tabular-nums">{fmt((li.quantity || 1) * (li.unit_price || 0))}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-[var(--mh-text-subtle)] print:text-[#999999]">
                      Cleaning service
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-52 space-y-2">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--mh-text-muted)] print:text-[#666666]">Subtotal</span>
                  <span className="text-[var(--mh-text)] print:text-[#1A1A1A] tabular-nums">{fmt(subtotal)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[var(--mh-text-muted)] print:text-[#666666]">Tax</span>
                    <span className="text-[var(--mh-text)] print:text-[#1A1A1A] tabular-nums">{fmt(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[var(--mh-border)] print:border-[#E5E5E5]">
                  <span className="text-[15px] font-bold text-[var(--mh-text)] print:text-[#1A1A1A]">Total</span>
                  <span className="text-[15px] font-bold text-[var(--mh-text)] print:text-[#1A1A1A] tabular-nums">{fmt(invoice.total || subtotal + taxAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="px-8 py-5 border-t border-[var(--mh-border)] print:border-[#E5E5E5] bg-[var(--mh-surface-sunken)] print:bg-[#F8F8F8]">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--mh-text-subtle)] print:text-[#999999] mb-2">Notes</p>
              <p className="text-[13px] text-[var(--mh-text-muted)] print:text-[#666666] leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-8 py-4 border-t border-[var(--mh-border)] print:border-[#E5E5E5] bg-[var(--mh-surface-sunken)] print:bg-[#F8F8F8] text-center">
            <p className="text-[11px] text-[var(--mh-text-subtle)] print:text-[#999999]">
              Thank you for your business — {profile?.business_name || "MaidHub"}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0.5in; size: letter; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
