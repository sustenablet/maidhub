"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  FileText,
  X,
  Loader2,
  ArrowRight,
  Trash2,
  Receipt,
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
import type { Client, Estimate, Address, LineItem } from "@/lib/types";
import { SERVICE_TYPES } from "@/lib/types";
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

function estimateNumber(id: string): string {
  return `EST-${id.substring(0, 4).toUpperCase()}`;
}

const emptyLineItem = (): LineItem => ({
  description: "",
  quantity: 1,
  unit_price: 0,
});

export default function EstimatesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "sent" | "accepted" | "declined">("all");
  const [filterOpen, setFilterOpen] = useState(false);

  // Create/edit estimate panel
  const [createOpen, setCreateOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editEstimateId, setEditEstimateId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formClientId, setFormClientId] = useState("");
  const [formLineItems, setFormLineItems] = useState<LineItem[]>([
    emptyLineItem(),
  ]);
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Convert to job panel
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertEstimate, setConvertEstimate] = useState<Estimate | null>(null);
  const [jobServiceType, setJobServiceType] = useState("");
  const [jobPrice, setJobPrice] = useState(0);
  const [jobDate, setJobDate] = useState("");
  const [jobStartTime, setJobStartTime] = useState("");
  const [jobDuration, setJobDuration] = useState(120);
  const [jobAddressId, setJobAddressId] = useState("");
  const [jobNotes, setJobNotes] = useState("");
  const [clientAddresses, setClientAddresses] = useState<Address[]>([]);
  const [savingJob, setSavingJob] = useState(false);

  // Convert to invoice panel
  const [convertInvoiceOpen, setConvertInvoiceOpen] = useState(false);
  const [convertInvoiceEstimate, setConvertInvoiceEstimate] = useState<Estimate | null>(null);
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceTaxPercent, setInvoiceTaxPercent] = useState(0);
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [savingInvoice, setSavingInvoice] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    })();
  }, []);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [estRes, clientRes] = await Promise.all([
      supabase
        .from("estimates")
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
    if (estRes.data) setEstimates(estRes.data as Estimate[]);
    if (clientRes.data) setClients(clientRes.data as Client[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchData();
  }, [fetchData, userId]);

  // Line item helpers (create form)
  const subtotal = formLineItems.reduce(
    (sum, li) => sum + li.quantity * li.unit_price,
    0
  );

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

  // Filter
  const filtered = estimates.filter((est) => {
    if (statusFilter !== "all" && est.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const clientName = est.clients
      ? `${est.clients.first_name} ${est.clients.last_name}`.toLowerCase()
      : "";
    const firstItem = est.line_items?.[0]?.description?.toLowerCase() || "";
    return (
      clientName.includes(q) ||
      estimateNumber(est.id).toLowerCase().includes(q) ||
      firstItem.includes(q)
    );
  });

  // Open create panel
  function openCreate() {
    setEditMode(false);
    setEditEstimateId(null);
    setFormClientId("");
    setFormLineItems([emptyLineItem()]);
    setFormNotes("");
    setCreateOpen(true);
  }

  // Open edit panel
  function openEdit(est: Estimate) {
    setEditMode(true);
    setEditEstimateId(est.id);
    setFormClientId(est.client_id);
    setFormLineItems(est.line_items?.length ? [...est.line_items] : [emptyLineItem()]);
    setFormNotes(est.notes || "");
    setCreateOpen(true);
  }

  // Save estimate
  async function handleSave() {
    if (!userId) return;
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
    const total = Math.round(subtotal * 100) / 100;
    const { error } = await supabase.from("estimates").insert({
      user_id: userId,
      client_id: formClientId,
      line_items: formLineItems,
      total,
      notes: formNotes || null,
      status: "draft",
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to create estimate.");
      return;
    }
    toast.success("Estimate created as draft.");
    setCreateOpen(false);
    fetchData();
  }

  // Update estimate
  async function handleUpdate() {
    if (!editEstimateId || !formClientId) {
      toast.error("Please select a client.");
      return;
    }
    if (formLineItems.length === 0 || formLineItems.every((li) => !li.description)) {
      toast.error("Add at least one line item.");
      return;
    }
    setSaving(true);
    const total = Math.round(subtotal * 100) / 100;
    const { error } = await supabase
      .from("estimates")
      .update({
        client_id: formClientId,
        line_items: formLineItems,
        total,
        notes: formNotes || null,
      })
      .eq("id", editEstimateId);
    setSaving(false);
    if (error) {
      toast.error("Failed to update estimate.");
      return;
    }
    toast.success("Estimate updated.");
    setCreateOpen(false);
    setEditMode(false);
    setEditEstimateId(null);
    fetchData();
  }

  // Delete estimate
  async function deleteEstimate(est: Estimate) {
    if (deleteConfirmId !== est.id) {
      setDeleteConfirmId(est.id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
      return;
    }
    const { error } = await supabase.from("estimates").delete().eq("id", est.id);
    if (error) {
      toast.error("Failed to delete estimate.");
      return;
    }
    toast.success("Estimate deleted.");
    setDeleteConfirmId(null);
    fetchData();
  }

  // Status actions
  async function updateStatus(est: Estimate, newStatus: Estimate["status"]) {
    const { error } = await supabase
      .from("estimates")
      .update({ status: newStatus })
      .eq("id", est.id);
    if (error) {
      toast.error("Failed to update estimate.");
      return;
    }
    const labels: Record<string, string> = {
      sent: "Estimate sent.",
      accepted: "Estimate accepted.",
      declined: "Estimate declined.",
    };
    toast.success(labels[newStatus] || "Status updated.");
    fetchData();
  }

  // Convert to job
  async function openConvert(est: Estimate) {
    if (!userId) return;
    setConvertEstimate(est);
    const firstItem = est.line_items?.[0];
    setJobServiceType(firstItem?.description || "");
    setJobPrice(est.total || 0);
    setJobDate("");
    setJobStartTime("");
    setJobDuration(120);
    setJobAddressId("");
    setJobNotes("");
    setClientAddresses([]);

    // Fetch client addresses
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("client_id", est.client_id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setClientAddresses((data as Address[]) || []);
    setConvertOpen(true);
  }

  async function handleConvertSave() {
    if (!convertEstimate || !userId) return;
    if (!jobDate) {
      toast.error("Please select a date.");
      return;
    }
    if (!jobAddressId) {
      toast.error("Please select an address.");
      return;
    }
    setSavingJob(true);
    const { error } = await supabase.from("jobs").insert({
      user_id: userId,
      client_id: convertEstimate.client_id,
      address_id: jobAddressId,
      scheduled_date: jobDate,
      start_time: jobStartTime || null,
      duration_minutes: jobDuration || null,
      service_type: jobServiceType || null,
      price: jobPrice,
      status: "scheduled",
      notes: jobNotes || null,
    });
    if (error) {
      setSavingJob(false);
      toast.error("Failed to create job.");
      return;
    }
    // Mark estimate as accepted if not already
    if (convertEstimate.status !== "accepted") {
      await supabase
        .from("estimates")
        .update({ status: "accepted" })
        .eq("id", convertEstimate.id);
    }
    setSavingJob(false);
    toast.success("Job created from estimate.");
    setConvertOpen(false);
    fetchData();
  }

  // Convert to invoice
  function openConvertToInvoice(est: Estimate) {
    setConvertInvoiceEstimate(est);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    setInvoiceDueDate(dueDate.toISOString().split("T")[0]);
    setInvoiceTaxPercent(0);
    setInvoiceNotes(est.notes || "");
    setConvertInvoiceOpen(true);
  }

  async function handleConvertToInvoice() {
    if (!convertInvoiceEstimate || !userId) return;
    setSavingInvoice(true);
    const estimateSubtotal = convertInvoiceEstimate.total || 0;
    const totalWithTax = Math.round((estimateSubtotal + (estimateSubtotal * invoiceTaxPercent / 100)) * 100) / 100;
    const { error } = await supabase.from("invoices").insert({
      user_id: userId,
      client_id: convertInvoiceEstimate.client_id,
      line_items: convertInvoiceEstimate.line_items,
      total: totalWithTax,
      status: "unpaid",
      due_date: invoiceDueDate || null,
      notes: invoiceNotes || null,
    });
    if (error) {
      setSavingInvoice(false);
      toast.error("Failed to create invoice.");
      return;
    }
    // Mark estimate as accepted if not already
    if (convertInvoiceEstimate.status !== "accepted") {
      await supabase
        .from("estimates")
        .update({ status: "accepted" })
        .eq("id", convertInvoiceEstimate.id);
    }
    setSavingInvoice(false);
    toast.success("Invoice created from estimate.");
    setConvertInvoiceOpen(false);
    fetchData();
  }

  const statusBadge = (status: Estimate["status"]) => {
    const styles: Record<string, string> = {
      draft: "bg-[#2A2A2A] text-[#888888] ring-1 ring-inset ring-[#2C2C2C]",
      sent: "bg-[#0071E3]/10 text-[#0071E3] ring-1 ring-inset ring-[#0071E3]/20",
      accepted: "bg-[#34C759]/10 text-[#34C759] ring-1 ring-inset ring-[#34C759]/20",
      declined: "bg-red-500/100/10 text-red-400 ring-1 ring-inset ring-red-500/20",
      expired: "bg-[#252525] text-[#888888]",
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
          <h1 className="text-[21px] font-semibold text-[#D4D4D4] tracking-[-0.02em]">
            Estimates
          </h1>
          <p className="text-sm text-[#888888] mt-0.5">
            Create quotes and convert to jobs
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#0071E3] hover:bg-[#0071E3]/90 text-white text-[13px] font-semibold rounded-[6px] shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Estimate
        </button>
      </div>

      {/* Estimate Table */}
      <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C]">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-[#252525]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#444444]" />
            <input
              type="text"
              placeholder="Search estimates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-[#252525] border border-[#2C2C2C] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 w-52 transition-all text-[#D4D4D4] placeholder:text-[#444444]"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[6px] transition-colors ${
                statusFilter !== "all"
                  ? "text-[#D4D4D4] bg-white/[0.08] border border-white/20"
                  : "text-[#888888] bg-[#252525] border border-[#2C2C2C] hover:bg-[#2A2A2A]"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {statusFilter !== "all" && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4D4D4]" />
              )}
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-[#1E1E1E] rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[#2C2C2C] py-1 z-50">
                  {(["all", "draft", "sent", "accepted", "declined"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setStatusFilter(opt); setFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium capitalize transition-colors ${
                        statusFilter === opt ? "text-[#D4D4D4] bg-white/[0.05]" : "text-[#888888] hover:bg-white/[0.02]"
                      }`}
                    >
                      {opt === "all" ? "All Estimates" : opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {estimates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-16 w-16 rounded-[6px] bg-[#0071E3]/[0.12] flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-[#0071E3]" />
            </div>
            <h3 className="text-base font-semibold text-[#D4D4D4] mb-2">
              No estimates yet
            </h3>
            <p className="text-sm text-[#888888] mb-6 max-w-xs leading-relaxed">
              Create estimates for potential clients and convert accepted ones
              into jobs.
            </p>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0071E3] hover:bg-[#0071E3]/90 text-white text-sm font-semibold rounded-[6px] transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Estimate
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-[#D4D4D4]">
              No results for &ldquo;{search}&rdquo;
            </p>
            <p className="text-xs text-[#888888] mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#252525]/50 border-b border-[#252525]">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888]">
                    Estimate #
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888]">
                    Client
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888] hidden md:table-cell">
                    Service
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888]">
                    Amount
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888] hidden lg:table-cell">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888]">
                    Status
                  </th>
                  <th className="px-5 py-3 w-40" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252525]">
                {filtered.map((est) => (
                  <tr
                    key={est.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-[#D4D4D4] font-mono">
                        {estimateNumber(est.id)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-[#888888]">
                        {est.clients
                          ? `${est.clients.first_name} ${est.clients.last_name}`
                          : "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#888888] hidden md:table-cell">
                      {est.line_items?.[0]?.description || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-[#D4D4D4]">
                        {formatCurrency(est.total || 0)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#888888] whitespace-nowrap hidden lg:table-cell">
                      {formatDate(est.created_at?.split("T")[0] || null)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusBadge(est.status)}`}>
                        {est.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {(est.status === "draft" || est.status === "sent") && (
                          <button
                            onClick={() => openEdit(est)}
                            className="text-xs font-semibold text-[#888888] hover:text-[#D4D4D4] transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {est.status === "draft" && (
                          <button
                            onClick={() => updateStatus(est, "sent")}
                            className="text-xs font-semibold text-[#0071E3] hover:text-[#0071E3]/80 transition-colors"
                          >
                            Send
                          </button>
                        )}
                        {est.status === "sent" && (
                          <>
                            <button
                              onClick={() => updateStatus(est, "accepted")}
                              className="text-xs font-semibold text-[#34C759] hover:text-[#34C759]/80 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateStatus(est, "declined")}
                              className="text-xs font-semibold text-[#888888] hover:text-[#D4D4D4] transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {est.status === "accepted" && (
                          <>
                            <button
                              onClick={() => openConvert(est)}
                              className="flex items-center gap-1 text-xs font-semibold text-[#888888] hover:text-[#D4D4D4] transition-colors"
                            >
                              Convert to Job
                              <ArrowRight className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => openConvertToInvoice(est)}
                              className="flex items-center gap-1 text-xs font-semibold text-[#888888] hover:text-[#D4D4D4] transition-colors"
                            >
                              Invoice
                              <Receipt className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteEstimate(est)}
                          className={`text-xs font-semibold transition-colors ${
                            deleteConfirmId === est.id
                              ? "text-red-400"
                              : "text-[#444444] hover:text-red-400"
                          }`}
                        >
                          {deleteConfirmId === est.id ? "Confirm?" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Estimate Panel */}
      <SlidePanel
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditMode(false); setEditEstimateId(null); }}
        title={editMode ? "Edit Estimate" : "New Estimate"}
        subtitle={editMode ? "Update estimate details" : "Create a quote for a client"}
        width="w-full max-w-xl"
      >
        <div className="px-6 py-6 space-y-6">
          <FormSection label="Client">
            <FormField label="Client" required>
              <FormSelect
                value={formClientId}
                onChange={(e) => setFormClientId(e.target.value)}
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </FormSelect>
            </FormField>
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
                      className="w-full px-3 py-2.5 text-sm bg-[#252525] border border-[#2C2C2C] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 transition-all placeholder:text-[#444444] text-[#D4D4D4]"
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
                      className="w-full px-2 py-2.5 text-sm bg-[#252525] border border-[#2C2C2C] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 transition-all text-center text-[#D4D4D4]"
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
                      className="w-full px-2 py-2.5 text-sm bg-[#252525] border border-[#2C2C2C] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 transition-all text-right text-[#D4D4D4]"
                    />
                  </div>
                  <div className="w-20 flex items-center justify-end py-2.5">
                    <span className="text-sm font-semibold text-[#888888]">
                      {formatCurrency(li.quantity * li.unit_price)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLineItem(idx)}
                    className="p-2.5 text-[#444444] hover:text-red-400 transition-colors"
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
            <FormField label="Notes">
              <FormTextarea
                rows={3}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Scope of work, special conditions, etc."
              />
            </FormField>
          </FormSection>

          {/* Total */}
          <div className="border-t border-[#252525] pt-4">
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-[#D4D4D4]">
                Total
              </span>
              <span className="font-bold text-[#D4D4D4]">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>
        </div>

        <FormActions>
          <SecondaryButton onClick={() => { setCreateOpen(false); setEditMode(false); setEditEstimateId(null); }}>
            Cancel
          </SecondaryButton>
          <PrimaryButton loading={saving} onClick={editMode ? handleUpdate : handleSave}>
            {editMode ? "Update Estimate" : "Create Estimate"}
          </PrimaryButton>
        </FormActions>
      </SlidePanel>

      {/* Convert to Job Panel */}
      <SlidePanel
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        title="Convert to Job"
        subtitle={
          convertEstimate?.clients
            ? `${convertEstimate.clients.first_name} ${convertEstimate.clients.last_name} — ${formatCurrency(convertEstimate.total || 0)}`
            : "Schedule a job from this estimate"
        }
        width="w-full max-w-lg"
      >
        <div className="px-6 py-6 space-y-6">
          <FormSection label="Job Details">
            <FormField label="Service Type">
              <FormSelect
                value={jobServiceType}
                onChange={(e) => setJobServiceType(e.target.value)}
              >
                <option value="">Select service type</option>
                {SERVICE_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label="Price">
              <FormInput
                type="number"
                min={0}
                step={0.01}
                value={jobPrice || ""}
                onChange={(e) =>
                  setJobPrice(parseFloat(e.target.value) || 0)
                }
              />
            </FormField>
          </FormSection>

          <FormSection label="Scheduling">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date" required>
                <FormInput
                  type="date"
                  value={jobDate}
                  onChange={(e) => setJobDate(e.target.value)}
                />
              </FormField>
              <FormField label="Start Time">
                <FormInput
                  type="time"
                  value={jobStartTime}
                  onChange={(e) => setJobStartTime(e.target.value)}
                />
              </FormField>
            </div>
            <FormField label="Duration (minutes)">
              <FormInput
                type="number"
                min={15}
                step={15}
                value={jobDuration || ""}
                onChange={(e) =>
                  setJobDuration(parseInt(e.target.value) || 0)
                }
              />
            </FormField>
          </FormSection>

          <FormSection label="Location">
            <FormField label="Address" required>
              <FormSelect
                value={jobAddressId}
                onChange={(e) => setJobAddressId(e.target.value)}
              >
                <option value="">Select an address</option>
                {clientAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.street}
                    {addr.city ? `, ${addr.city}` : ""}
                    {addr.state ? `, ${addr.state}` : ""}
                    {addr.zip ? ` ${addr.zip}` : ""}
                  </option>
                ))}
              </FormSelect>
              {clientAddresses.length === 0 && (
                <p className="text-xs text-[#FF9F0A] mt-1">
                  No addresses found for this client. Add one first.
                </p>
              )}
            </FormField>
          </FormSection>

          <FormSection label="Notes">
            <FormField label="Job Notes">
              <FormTextarea
                rows={3}
                value={jobNotes}
                onChange={(e) => setJobNotes(e.target.value)}
                placeholder="Special instructions, access codes, etc."
              />
            </FormField>
          </FormSection>
        </div>

        <FormActions>
          <SecondaryButton onClick={() => setConvertOpen(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton loading={savingJob} onClick={handleConvertSave}>
            Create Job
          </PrimaryButton>
        </FormActions>
      </SlidePanel>

      {/* Convert to Invoice Panel */}
      <SlidePanel
        open={convertInvoiceOpen}
        onClose={() => setConvertInvoiceOpen(false)}
        title="Convert to Invoice"
        subtitle={
          convertInvoiceEstimate?.clients
            ? `${convertInvoiceEstimate.clients.first_name} ${convertInvoiceEstimate.clients.last_name} — ${formatCurrency(convertInvoiceEstimate.total || 0)}`
            : "Create an invoice from this estimate"
        }
        width="w-full max-w-lg"
      >
        <div className="px-6 py-6 space-y-6">
          <FormSection label="Line Items">
            <div className="space-y-2">
              {convertInvoiceEstimate?.line_items?.map((li, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 px-3 bg-[#252525] rounded-[6px]"
                >
                  <div className="flex-1">
                    <span className="text-sm text-[#888888]">
                      {li.description || "Untitled item"}
                    </span>
                    <span className="text-xs text-[#555555] ml-2">
                      x{li.quantity}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#888888]">
                    {formatCurrency(li.quantity * li.unit_price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-3 border-t border-[#252525]">
              <span className="text-sm font-semibold text-[#D4D4D4]">
                Subtotal
              </span>
              <span className="text-sm font-bold text-[#D4D4D4]">
                {formatCurrency(convertInvoiceEstimate?.total || 0)}
              </span>
            </div>
          </FormSection>

          <FormSection label="Tax">
            <FormField label="Tax Percentage (%)">
              <FormInput
                type="number"
                min={0}
                step={0.01}
                value={invoiceTaxPercent || ""}
                onChange={(e) =>
                  setInvoiceTaxPercent(parseFloat(e.target.value) || 0)
                }
              />
            </FormField>
            <div className="flex justify-between pt-2">
              <span className="text-lg font-semibold text-[#D4D4D4]">
                Total
              </span>
              <span className="text-lg font-bold text-[#D4D4D4]">
                {formatCurrency(
                  ((convertInvoiceEstimate?.total || 0) *
                    (1 + invoiceTaxPercent / 100))
                )}
              </span>
            </div>
          </FormSection>

          <FormSection label="Details">
            <FormField label="Due Date">
              <FormInput
                type="date"
                value={invoiceDueDate}
                onChange={(e) => setInvoiceDueDate(e.target.value)}
              />
            </FormField>
            <FormField label="Notes">
              <FormTextarea
                rows={3}
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="Payment terms, additional info, etc."
              />
            </FormField>
          </FormSection>
        </div>

        <FormActions>
          <SecondaryButton onClick={() => setConvertInvoiceOpen(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton loading={savingInvoice} onClick={handleConvertToInvoice}>
            Create Invoice
          </PrimaryButton>
        </FormActions>
      </SlidePanel>
    </div>
  );
}
