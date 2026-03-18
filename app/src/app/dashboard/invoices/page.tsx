"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Receipt,
  X,
  Loader2,
  Trash2,
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
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "paid" | "void">("all");
  const [filterOpen, setFilterOpen] = useState(false);
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
  const [editMode, setEditMode] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Client jobs for the optional job link
  const [clientJobs, setClientJobs] = useState<Job[]>([]);

  // Fetch authenticated user on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    })();
  }, []);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [invRes, clientRes] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, clients(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("clients")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("first_name"),
    ]);
    if (invRes.data) setInvoices(invRes.data as Invoice[]);
    if (clientRes.data) setClients(clientRes.data as Client[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-open form when navigated with clientId param
  useEffect(() => {
    const clientIdParam = searchParams.get("clientId");
    if (clientIdParam && clients.length > 0) {
      setFormClientId(clientIdParam);
      setPanelOpen(true);
      window.history.replaceState({}, "", "/dashboard/invoices");
    }
  }, [searchParams, clients]);

  // Fetch completed jobs when client changes
  useEffect(() => {
    if (!formClientId || !userId) {
      setClientJobs([]);
      setFormJobId("");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", userId)
        .eq("client_id", formClientId)
        .eq("status", "completed")
        .order("scheduled_date", { ascending: false });
      setClientJobs((data as Job[]) || []);
    })();
  }, [formClientId, userId]);

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
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
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
    setEditMode(false);
    setEditInvoiceId(null);
    setFormClientId("");
    setFormJobId("");
    setFormLineItems([emptyLineItem()]);
    setFormTaxPercent(0);
    setFormDueDate(defaultDueDate());
    setFormNotes("");
    setClientJobs([]);
    setPanelOpen(true);
  }

  // Open edit panel
  function openEdit(inv: Invoice) {
    setEditMode(true);
    setEditInvoiceId(inv.id);
    setFormClientId(inv.client_id);
    setFormJobId(inv.job_id || "");
    setFormLineItems(inv.line_items?.length ? [...inv.line_items] : [emptyLineItem()]);
    // Reverse-calculate tax percent from total and line items
    const lineSubtotal = (inv.line_items || []).reduce(
      (sum, li) => sum + li.quantity * li.unit_price, 0
    );
    const taxPct = lineSubtotal > 0 && inv.total
      ? Math.round(((inv.total - lineSubtotal) / lineSubtotal) * 10000) / 100
      : 0;
    setFormTaxPercent(Math.max(0, taxPct));
    setFormDueDate(inv.due_date || defaultDueDate());
    setFormNotes(inv.notes || "");
    setPanelOpen(true);
  }

  // Save invoice
  async function handleSave() {
    if (!userId) {
      toast.error("Not authenticated");
      return;
    }
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
      user_id: userId,
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

  // Update invoice
  async function handleUpdate() {
    if (!userId) {
      toast.error("Not authenticated");
      return;
    }
    if (!editInvoiceId || !formClientId) {
      toast.error("Please select a client.");
      return;
    }
    if (formLineItems.length === 0 || formLineItems.every((li) => !li.description)) {
      toast.error("Add at least one line item.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("invoices")
      .update({
        client_id: formClientId,
        job_id: formJobId || null,
        line_items: formLineItems,
        total: Math.round(total * 100) / 100,
        due_date: formDueDate || null,
        notes: formNotes || null,
      })
      .eq("id", editInvoiceId)
      .eq("user_id", userId);
    setSaving(false);
    if (error) {
      toast.error("Failed to update invoice.");
      return;
    }
    toast.success("Invoice updated.");
    setPanelOpen(false);
    setEditMode(false);
    setEditInvoiceId(null);
    fetchData();
  }

  // Mark as Paid
  async function markPaid(inv: Invoice) {
    if (!userId) return;
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paid", payment_date: todayStr() })
      .eq("id", inv.id)
      .eq("user_id", userId);
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
    if (!userId) return;
    const { error } = await supabase
      .from("invoices")
      .update({ status: "void" })
      .eq("id", inv.id)
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to void invoice.");
      return;
    }
    toast.success("Invoice voided.");
    fetchData();
  }

  async function deleteInvoice(inv: Invoice) {
    if (!userId) return;
    if (deleteConfirmId !== inv.id) {
      setDeleteConfirmId(inv.id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
      return;
    }
    const { error } = await supabase.from("invoices").delete().eq("id", inv.id).eq("user_id", userId);
    if (error) {
      toast.error("Failed to delete invoice.");
      return;
    }
    toast.success("Invoice deleted.");
    setDeleteConfirmId(null);
    fetchData();
  }

  const statusBadge = (status: Invoice["status"]) => {
    const styles: Record<string, string> = {
      unpaid: "bg-[#FF9F0A]/10 text-[#FF9F0A] ring-1 ring-inset ring-[#FF9F0A]/20",
      paid: "bg-[#34C759]/10 text-[#34C759] ring-1 ring-inset ring-[#34C759]/20",
      void: "bg-[#2A2A2A] text-[#888888] ring-1 ring-inset ring-gray-200",
    };
    return styles[status] || "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-[#0071E3]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-[21px] font-semibold text-[#D4D4D4] tracking-[-0.02em]"
          >
            Invoices
          </h1>
          <p
            className="text-sm text-[#888888] mt-0.5"
          >
            Track billing and payments
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold rounded-[6px] shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C] p-5">
          <p
            className="text-xs font-semibold text-[#888888] uppercase tracking-wider"
          >
            Total Invoiced
          </p>
          <p
            className="text-2xl font-bold text-[#D4D4D4] mt-1"
          >
            {formatCurrency(summaryTotalInvoiced)}
          </p>
        </div>
        <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C] p-5">
          <p
            className="text-xs font-semibold text-[#888888] uppercase tracking-wider"
          >
            Collected
          </p>
          <p
            className="text-2xl font-bold text-green-600 mt-1"
          >
            {formatCurrency(summaryCollected)}
          </p>
        </div>
        <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C] p-5">
          <p
            className="text-xs font-semibold text-[#888888] uppercase tracking-wider"
          >
            Outstanding
          </p>
          <p
            className="text-2xl font-bold text-amber-600 mt-1"
          >
            {formatCurrency(summaryOutstanding)}
          </p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C]">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-[#252525]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-350" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-[#252525] border border-[#2C2C2C] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 w-52 transition-all"
             
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[6px] transition-colors ${
                statusFilter !== "all"
                  ? "text-[#D4D4D4] bg-white/[0.08] border border-[#18181B]/20"
                  : "text-[#888888] bg-[#252525] border border-[#2C2C2C] hover:bg-[#2A2A2A]"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {statusFilter !== "all" && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#18181B]" />
              )}
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-[#1E1E1E] rounded-[6px] shadow-lg border border-[#252525] py-1 z-50">
                  {(["all", "unpaid", "paid", "void"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setStatusFilter(opt); setFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium capitalize transition-colors ${
                        statusFilter === opt ? "text-[#D4D4D4] bg-white/[0.04]" : "text-[#888888] hover:bg-white/[0.03]"
                      }`}
                    >
                      {opt === "all" ? "All Invoices" : opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-16 w-16 rounded-[6px] bg-[#0071E3]/10 flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-[#0071E3]" />
            </div>
            <h3
              className="text-base font-semibold text-[#D4D4D4] mb-2"
            >
              No invoices yet
            </h3>
            <p
              className="text-sm text-[#888888] mb-6 max-w-xs leading-relaxed"
            >
              Create your first invoice to start tracking payments and keeping
              your finances organized.
            </p>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0071E3] hover:bg-[#0077ED]/90 text-white text-sm font-semibold rounded-[6px] transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Invoice
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p
              className="text-sm font-semibold text-[#D4D4D4]"
            >
              No results for &ldquo;{search}&rdquo;
            </p>
            <p
              className="text-xs text-[#888888] mt-1"
            >
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02] border-b border-[#252525]">
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888]"
                  >
                    Invoice #
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888]"
                  >
                    Client
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888]"
                  >
                    Amount
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888] hidden md:table-cell"
                  >
                    Issue Date
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888] hidden lg:table-cell"
                  >
                    Due Date
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888]"
                  >
                    Status
                  </th>
                  <th className="px-5 py-3 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252525]">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-[#D4D4D4] font-mono">
                        {invoiceNumber(inv.id)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm text-[#D4D4D4]"
                      >
                        {inv.clients
                          ? `${inv.clients.first_name} ${inv.clients.last_name}`
                          : "-"}
                        {inv.job_id && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#0071E3]/10 text-teal-600 ring-1 ring-inset ring-[#0071E3]/20">
                            From Job
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm font-bold text-[#D4D4D4]"
                      >
                        {formatCurrency(inv.total || 0)}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 text-xs text-[#888888] whitespace-nowrap hidden md:table-cell"
                    >
                      {formatDate(inv.created_at?.split("T")[0] || null)}
                    </td>
                    <td
                      className="px-5 py-4 text-xs text-[#888888] whitespace-nowrap hidden lg:table-cell"
                    >
                      {formatDate(inv.due_date)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusBadge(inv.status)}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {inv.status === "unpaid" && (
                          <>
                            <button
                              onClick={() => openEdit(inv)}
                              className="text-xs font-semibold text-[#888888] hover:text-[#D4D4D4] transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => markPaid(inv)}
                              className="text-xs font-semibold text-[#888888] hover:text-[#D4D4D4] transition-colors"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => voidInvoice(inv)}
                              className="text-xs font-semibold text-[#888888] hover:text-[#888888] transition-colors"
                            >
                              Void
                            </button>
                            <button
                              onClick={() => deleteInvoice(inv)}
                              className={`text-xs font-semibold transition-colors ${
                                deleteConfirmId === inv.id
                                  ? "text-red-500"
                                  : "text-[#555555] hover:text-red-400"
                              }`}
                            >
                              {deleteConfirmId === inv.id ? "Confirm?" : "Delete"}
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
        onClose={() => { setPanelOpen(false); setEditMode(false); setEditInvoiceId(null); }}
        title={editMode ? "Edit Invoice" : "New Invoice"}
        subtitle={editMode ? "Update invoice details" : "Create and send a new invoice"}
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
                      className="w-full px-3 py-2.5 text-sm bg-[#252525] border border-[#2C2C2C] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 transition-all placeholder:text-[#555555]"
                     
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
                      className="w-full px-2 py-2.5 text-sm bg-[#252525] border border-[#2C2C2C] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 transition-all text-center"
                     
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
                      className="w-full px-2 py-2.5 text-sm bg-[#252525] border border-[#2C2C2C] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 transition-all text-right"
                     
                    />
                  </div>
                  <div className="w-20 flex items-center justify-end py-2.5">
                    <span
                      className="text-sm font-semibold text-[#D4D4D4]"
                    >
                      {formatCurrency(li.quantity * li.unit_price)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLineItem(idx)}
                    className="p-2.5 text-[#555555] hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#888888] hover:text-[#D4D4D4] transition-colors mt-1"
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
          <div className="border-t border-[#252525] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span
                className="text-[#888888]"
              >
                Subtotal
              </span>
              <span
                className="text-[#D4D4D4]"
              >
                {formatCurrency(subtotal)}
              </span>
            </div>
            {formTaxPercent > 0 && (
              <div className="flex justify-between text-sm">
                <span
                  className="text-[#888888]"
                >
                  Tax ({formTaxPercent}%)
                </span>
                <span
                  className="text-[#D4D4D4]"
                >
                  {formatCurrency(taxAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg pt-1 border-t border-[#252525]">
              <span
                className="font-semibold text-[#D4D4D4]"
              >
                Total
              </span>
              <span
                className="font-bold text-[#D4D4D4]"
              >
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        <FormActions>
          <SecondaryButton onClick={() => { setPanelOpen(false); setEditMode(false); setEditInvoiceId(null); }}>
            Cancel
          </SecondaryButton>
          <PrimaryButton loading={saving} onClick={editMode ? handleUpdate : handleSave}>
            {editMode ? "Update Invoice" : "Create Invoice"}
          </PrimaryButton>
        </FormActions>
      </SlidePanel>
    </div>
  );
}
