"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Receipt,
  X,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  SlidePanel,
  FormSection,
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
  FormActions,
  PrimaryButton,
  SecondaryButton,
} from "@/components/dashboard/slide-panel";
import type { Client, Invoice, Job, LineItem } from "@/lib/types";
import { toast } from "sonner";

const supabase = createClient();

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function invoiceNumber(id: string): string {
  return `INV-${id.substring(0, 4).toUpperCase()}`;
}

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

const emptyLineItem = (): LineItem => ({
  description: "",
  quantity: 1,
  unit_price: 0,
});

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  // Form state
  const [formClientId, setFormClientId] = useState("");
  const [formJobId, setFormJobId] = useState("");
  const [formLineItems, setFormLineItems] = useState<LineItem[]>([
    emptyLineItem(),
  ]);
  const [formTaxPercent, setFormTaxPercent] = useState(0);
  const [formDueDate, setFormDueDate] = useState(defaultDueDate());
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Client jobs for the optional job link
  const [clientJobs, setClientJobs] = useState<Job[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [invRes, clientRes] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, clients(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("clients")
        .select("*")
        .eq("status", "active")
        .order("first_name"),
    ]);
    if (invRes.data) setInvoices(invRes.data as Invoice[]);
    if (clientRes.data) setClients(clientRes.data as Client[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch completed jobs when client changes
  useEffect(() => {
    if (!formClientId) {
      setClientJobs([]);
      setFormJobId("");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("client_id", formClientId)
        .eq("status", "completed")
        .order("scheduled_date", { ascending: false });
      setClientJobs((data as Job[]) || []);
    })();
  }, [formClientId]);

  // When a job is selected, auto-add a line item
  useEffect(() => {
    if (!formJobId) return;
    const job = clientJobs.find((j) => j.id === formJobId);
    if (!job) return;
    setFormLineItems([
      {
        description: job.service_type || "Cleaning Service",
        quantity: 1,
        unit_price: job.price || 0,
      },
    ]);
  }, [formJobId, clientJobs]);

  // Summary calculations
  const summaryTotalInvoiced = useMemo(
    () => invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    [invoices]
  );
  const summaryCollected = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + (inv.total || 0), 0),
    [invoices]
  );
  const summaryOutstanding = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status === "unpaid")
        .reduce((sum, inv) => sum + (inv.total || 0), 0),
    [invoices]
  );

  // Line item helpers
  const subtotal = formLineItems.reduce(
    (sum, li) => sum + li.quantity * li.unit_price,
    0
  );
  const taxAmount = subtotal * (formTaxPercent / 100);
  const total = subtotal + taxAmount;

  function updateLineItem(
    index: number,
    field: keyof LineItem,
    value: string | number
  ) {
    setFormLineItems((prev) =>
      prev.map((li, i) => (i === index ? { ...li, [field]: value } : li))
    );
  }

  function removeLineItem(index: number) {
    setFormLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addLineItem() {
    setFormLineItems((prev) => [...prev, emptyLineItem()]);
  }

  // Filter invoices
  const filtered = invoices.filter((inv) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const clientName = inv.clients
      ? `${inv.clients.first_name} ${inv.clients.last_name}`.toLowerCase()
      : "";
    return (
      clientName.includes(q) ||
      invoiceNumber(inv.id).toLowerCase().includes(q)
    );
  });

  // Open create panel
  function openCreate() {
    setFormClientId("");
    setFormJobId("");
    setFormLineItems([emptyLineItem()]);
    setFormTaxPercent(0);
    setFormDueDate(defaultDueDate());
    setFormNotes("");
    setClientJobs([]);
    setPanelOpen(true);
  }

  // Save invoice
  async function handleSave() {
    if (!formClientId) {
      toast.error("Please select a client.");
      return;
    }
    if (
      formLineItems.length === 0 ||
      formLineItems.every((li) => !li.description)
    ) {
      toast.error("Add at least one line item.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("invoices").insert({
      client_id: formClientId,
      job_id: formJobId || null,
      line_items: formLineItems,
      total: Math.round(total * 100) / 100,
      status: "unpaid",
      due_date: formDueDate || null,
      notes: formNotes || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to create invoice.");
      return;
    }
    toast.success("Invoice created.");
    setPanelOpen(false);
    fetchData();
  }

  // Mark as Paid
  async function markPaid(inv: Invoice) {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paid", payment_date: todayStr() })
      .eq("id", inv.id);
    if (error) {
      toast.error("Failed to update invoice.");
      return;
    }
    // If linked to a job, mark job as invoiced
    if (inv.job_id) {
      await supabase
        .from("jobs")
        .update({ status: "invoiced" })
        .eq("id", inv.job_id);
    }
    toast.success("Invoice marked as paid.");
    fetchData();
  }

  // Void invoice
  async function voidInvoice(inv: Invoice) {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "void" })
      .eq("id", inv.id);
    if (error) {
      toast.error("Failed to void invoice.");
      return;
    }
    toast.success("Invoice voided.");
    fetchData();
  }

  const statusBadge = (status: Invoice["status"]) => {
    const styles: Record<string, string> = {
      unpaid: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      paid: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
      void: "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200",
    };
    return styles[status] || "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#1A2332]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Invoices
          </h1>
          <p
            className="text-sm text-gray-400 mt-0.5"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Track billing and payments
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5">
          <p
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Total Invoiced
          </p>
          <p
            className="text-2xl font-bold text-[#1A2332] mt-1"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {formatCurrency(summaryTotalInvoiced)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5">
          <p
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Collected
          </p>
          <p
            className="text-2xl font-bold text-green-600 mt-1"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {formatCurrency(summaryCollected)}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-5">
          <p
            className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Outstanding
          </p>
          <p
            className="text-2xl font-bold text-amber-600 mt-1"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {formatCurrency(summaryOutstanding)}
          </p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-350" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 w-52 transition-all"
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

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-teal-400" />
            </div>
            <h3
              className="text-base font-semibold text-[#1A2332] mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              No invoices yet
            </h3>
            <p
              className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Create your first invoice to start tracking payments and keeping
              your finances organized.
            </p>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <Plus className="h-4 w-4" />
              New Invoice
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p
              className="text-sm font-semibold text-[#1A2332]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              No results for &ldquo;{search}&rdquo;
            </p>
            <p
              className="text-xs text-gray-400 mt-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Invoice #
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Client
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Amount
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden md:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Issue Date
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden lg:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Due Date
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Status
                  </th>
                  <th className="px-5 py-3 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-[#1A2332] font-mono">
                        {invoiceNumber(inv.id)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm text-[#1A2332]/70"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {inv.clients
                          ? `${inv.clients.first_name} ${inv.clients.last_name}`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm font-bold text-[#1A2332]"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {formatCurrency(inv.total || 0)}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 text-xs text-[#1A2332]/55 whitespace-nowrap hidden md:table-cell"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {formatDate(inv.created_at?.split("T")[0] || null)}
                    </td>
                    <td
                      className="px-5 py-4 text-xs text-[#1A2332]/55 whitespace-nowrap hidden lg:table-cell"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {formatDate(inv.due_date)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusBadge(inv.status)}`}
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {inv.status === "unpaid" && (
                          <>
                            <button
                              onClick={() => markPaid(inv)}
                              className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                              style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => voidInvoice(inv)}
                              className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                              style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                              Void
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Invoice Panel */}
      <SlidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="New Invoice"
        subtitle="Create and send a new invoice"
        width="w-full max-w-xl"
      >
        <div className="px-6 py-6 space-y-6">
          <FormSection label="Client & Job">
            <FormField label="Client" required>
              <FormSelect
                value={formClientId}
                onChange={(e) => {
                  setFormClientId(e.target.value);
                  setFormJobId("");
                }}
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </FormSelect>
            </FormField>
            {formClientId && (
              <FormField label="Link to Job (optional)">
                <FormSelect
                  value={formJobId}
                  onChange={(e) => setFormJobId(e.target.value)}
                >
                  <option value="">No linked job</option>
                  {clientJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.service_type || "Job"} &mdash;{" "}
                      {formatDate(j.scheduled_date)} &mdash;{" "}
                      {formatCurrency(j.price || 0)}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
            )}
          </FormSection>

          <FormSection label="Line Items">
            <div className="space-y-3">
              {formLineItems.map((li, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Description"
                      value={li.description}
                      onChange={(e) =>
                        updateLineItem(idx, "description", e.target.value)
                      }
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all placeholder:text-gray-300"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    />
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={li.quantity}
                      onChange={(e) =>
                        updateLineItem(
                          idx,
                          "quantity",
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-full px-2 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all text-center"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="Price"
                      value={li.unit_price || ""}
                      onChange={(e) =>
                        updateLineItem(
                          idx,
                          "unit_price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-2 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all text-right"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    />
                  </div>
                  <div className="w-20 flex items-center justify-end py-2.5">
                    <span
                      className="text-sm font-semibold text-[#1A2332]/70"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {formatCurrency(li.quantity * li.unit_price)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLineItem(idx)}
                    className="p-2.5 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors mt-1"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Line Item
            </button>
          </FormSection>

          <FormSection label="Details">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tax %">
                <FormInput
                  type="number"
                  min={0}
                  step={0.01}
                  value={formTaxPercent || ""}
                  onChange={(e) =>
                    setFormTaxPercent(parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                />
              </FormField>
              <FormField label="Due Date">
                <FormInput
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </FormField>
            </div>
            <FormField label="Notes">
              <FormTextarea
                rows={3}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Payment terms, thank-you note, etc."
              />
            </FormField>
          </FormSection>

          {/* Totals */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span
                className="text-gray-400"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Subtotal
              </span>
              <span
                className="text-[#1A2332]/70"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {formatCurrency(subtotal)}
              </span>
            </div>
            {formTaxPercent > 0 && (
              <div className="flex justify-between text-sm">
                <span
                  className="text-gray-400"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Tax ({formTaxPercent}%)
                </span>
                <span
                  className="text-[#1A2332]/70"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {formatCurrency(taxAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg pt-1 border-t border-gray-100">
              <span
                className="font-semibold text-[#1A2332]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Total
              </span>
              <span
                className="font-bold text-[#1A2332]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        <FormActions>
          <SecondaryButton onClick={() => setPanelOpen(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton loading={saving} onClick={handleSave}>
            Create Invoice
          </PrimaryButton>
        </FormActions>
      </SlidePanel>
    </div>
  );
}
