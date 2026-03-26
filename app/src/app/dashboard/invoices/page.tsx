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
  UserPlus,
  MoreHorizontal,
  Pencil,
  CheckCircle2,
  Ban,
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
} from "@/components/dashboard/slide-panel";
import type { Client, Invoice, Job, LineItem } from "@/lib/types";
import { SERVICE_TYPES, DEFAULT_SERVICE_PRICES } from "@/lib/types";
import { toast } from "sonner";

const supabase = createClient();
const INVOICE_DRAFT_KEY = "maidhub_invoice_draft";

const ADDON_PRESETS_DEFAULT = [
  "Window Cleaning",
  "Floor Waxing",
  "Oven Cleaning",
  "Refrigerator Cleaning",
  "Laundry",
  "Carpet Cleaning",
  "Organization",
  "Pet Hair Removal",
  "Restocking Supplies",
  "Garage Cleaning",
];

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

function invoiceNumber(n: number): string {
  return `INV-${String(n).padStart(3, "0")}`;
}

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}


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
  const [closePromptOpen, setClosePromptOpen] = useState(false);

  // Form state
  const [formClientId, setFormClientId] = useState("");
  const [formServiceType, setFormServiceType] = useState("");
  const [formBasePrice, setFormBasePrice] = useState(0);
  const [formAddOns, setFormAddOns] = useState<{id: string; name: string; price: number}[]>([]);
  const [addOnName, setAddOnName] = useState("");
  const [addOnPrice, setAddOnPrice] = useState("");
  const [addOnPresets, setAddOnPresets] = useState<string[]>(ADDON_PRESETS_DEFAULT);
  const [addOnPresetPrices, setAddOnPresetPrices] = useState<Record<string, number>>({});
  const [serviceTypes, setServiceTypes] = useState<string[]>([...SERVICE_TYPES]);
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({});
  const [formDueDate, setFormDueDate] = useState(defaultDueDate());
  const [dueDatePreset, setDueDatePreset] = useState<"7" | "14" | "30" | "custom">("14");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  // Quick-add client state
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [qaFirstName, setQaFirstName] = useState("");
  const [qaLastName, setQaLastName] = useState("");
  const [qaPhone, setQaPhone] = useState("");
  const [qaEmail, setQaEmail] = useState("");
  const [qaStreet, setQaStreet] = useState("");
  const [qaCity, setQaCity] = useState("");
  const [qaSaving, setQaSaving] = useState(false);

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

  // Auto-open form when navigated with clientId or action=new param
  useEffect(() => {
    const clientIdParam = searchParams.get("clientId");
    const actionParam = searchParams.get("action");
    if (actionParam === "new" || clientIdParam) {
      if (clientIdParam) setFormClientId(clientIdParam);
      setPanelOpen(true);
      window.history.replaceState({}, "", "/dashboard/invoices");
    }
  }, [searchParams, clients]);

  // Load service types and prices from user settings
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase.from("users").select("settings").eq("id", userId).single();
      const biz = (((data?.settings || {}) as Record<string, unknown>).business || {}) as Record<string, unknown>;
      const types = (biz.service_types as string[]) || [];
      const additionalCosts = (biz.additional_cost_types as string[]) || [];
      const additionalCostPrices = (biz.additional_cost_prices as Record<string, number>) || {};
      const prices = (biz.service_type_prices as Record<string, number>) || {};
      if (types.length > 0) setServiceTypes(types);
      if (additionalCosts.length > 0) setAddOnPresets(additionalCosts);
      setAddOnPresetPrices(additionalCostPrices);
      setServicePrices(prices);
    })();
  }, [userId]);

  async function handleQuickAddClient() {
    if (!qaFirstName.trim() || !qaLastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    setQaSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          user_id: user.id,
          first_name: qaFirstName.trim(),
          last_name: qaLastName.trim(),
          email: qaEmail.trim() || null,
          phone: qaPhone.trim() || null,
          status: "active",
        })
        .select()
        .single();
      if (clientError) throw clientError;
      if (qaStreet.trim()) {
        await supabase.from("addresses").insert({
          client_id: newClient.id,
          user_id: user.id,
          street: qaStreet.trim(),
          city: qaCity.trim() || null,
        });
      }
      // Refresh clients list and auto-select new client
      const { data: updatedClients } = await supabase
        .from("clients").select("*").eq("user_id", user.id).eq("status", "active").order("first_name");
      if (updatedClients) setClients(updatedClients as Client[]);
      setFormClientId(newClient.id);
      setQuickAddOpen(false);
      setQaFirstName(""); setQaLastName(""); setQaPhone(""); setQaEmail(""); setQaStreet(""); setQaCity("");
      toast.success(`${qaFirstName} ${qaLastName} added`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create client");
    } finally {
      setQaSaving(false);
    }
  }

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

  const invoiceTotal = formBasePrice + formAddOns.reduce((s, a) => s + a.price, 0);

  // Sequential invoice numbers (INV-001, INV-002...) based on creation order
  const invoiceSeqMap = useMemo(() => {
    const sorted = [...invoices].sort((a, b) =>
      new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );
    return Object.fromEntries(sorted.map((inv, i) => [inv.id, i + 1]));
  }, [invoices]);

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
      invoiceNumber(invoiceSeqMap[inv.id] ?? 0).toLowerCase().includes(q)
    );
  });

  function dueDateFromPreset(preset: "7" | "14" | "30") {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(preset));
    return d.toISOString().split("T")[0];
  }

  function resetInvoiceForm() {
    setFormClientId("");
    setFormServiceType("");
    setFormBasePrice(0);
    setFormAddOns([]);
    setAddOnName("");
    setAddOnPrice("");
    setDueDatePreset("14");
    setFormDueDate(defaultDueDate());
    setFormNotes("");
  }

  // Open create panel
  function openCreate() {
    setEditMode(false);
    setEditInvoiceId(null);
    resetInvoiceForm();
    try {
      const raw = localStorage.getItem(INVOICE_DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as {
          formClientId?: string;
          formServiceType?: string;
          formBasePrice?: number;
          formAddOns?: {id: string; name: string; price: number}[];
          addOnName?: string;
          addOnPrice?: string;
          formDueDate?: string;
          formNotes?: string;
        };
        if (draft.formClientId) setFormClientId(draft.formClientId);
        if (draft.formServiceType) setFormServiceType(draft.formServiceType);
        if (typeof draft.formBasePrice === "number") setFormBasePrice(draft.formBasePrice);
        if (Array.isArray(draft.formAddOns)) setFormAddOns(draft.formAddOns);
        if (typeof draft.addOnName === "string") setAddOnName(draft.addOnName);
        if (typeof draft.addOnPrice === "string") setAddOnPrice(draft.addOnPrice);
        if (draft.formDueDate) {
          setFormDueDate(draft.formDueDate);
          const diffDays = Math.round(
            (new Date(draft.formDueDate + "T00:00:00").getTime() -
              new Date(new Date().toISOString().split("T")[0] + "T00:00:00").getTime()) /
              86400000
          );
          if (diffDays === 7) setDueDatePreset("7");
          else if (diffDays === 14) setDueDatePreset("14");
          else if (diffDays === 30) setDueDatePreset("30");
          else setDueDatePreset("custom");
        }
        if (typeof draft.formNotes === "string") setFormNotes(draft.formNotes);
        toast.info("Loaded saved invoice draft");
      }
    } catch {
      // Ignore invalid draft data
    }
    setPanelOpen(true);
  }

  // Open edit panel
  function openEdit(inv: Invoice) {
    setEditMode(true);
    setEditInvoiceId(inv.id);
    setFormClientId(inv.client_id);
    const items = inv.line_items || [];
    const firstItem = items[0];
    setFormServiceType(firstItem?.description || "");
    setFormBasePrice(firstItem ? firstItem.unit_price * firstItem.quantity : 0);
    setFormAddOns(items.slice(1).map((li, i) => ({
      id: String(Date.now() + i),
      name: li.description,
      price: li.unit_price * li.quantity,
    })));
    setAddOnName("");
    setAddOnPrice("");
    setDueDatePreset("custom");
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
    setSaving(true);
    const saveLineItems: LineItem[] = [
      { description: formServiceType || "Cleaning Service", quantity: 1, unit_price: formBasePrice },
      ...formAddOns.map(a => ({ description: a.name, quantity: 1, unit_price: a.price })),
    ];
    const { error } = await supabase.from("invoices").insert({
      user_id: userId,
      client_id: formClientId,
      job_id: null,
      line_items: saveLineItems,
      total: Math.round(invoiceTotal * 100) / 100,
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
    localStorage.removeItem(INVOICE_DRAFT_KEY);
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
    setSaving(true);
    const updateLineItems: LineItem[] = [
      { description: formServiceType || "Cleaning Service", quantity: 1, unit_price: formBasePrice },
      ...formAddOns.map(a => ({ description: a.name, quantity: 1, unit_price: a.price })),
    ];
    const { error } = await supabase
      .from("invoices")
      .update({
        client_id: formClientId,
        line_items: updateLineItems,
        total: Math.round(invoiceTotal * 100) / 100,
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
    localStorage.removeItem(INVOICE_DRAFT_KEY);
    setPanelOpen(false);
    setEditMode(false);
    setEditInvoiceId(null);
    fetchData();
  }

  const isInvoiceDirty = useMemo(() => {
    return Boolean(
      formClientId ||
      formServiceType ||
      formBasePrice > 0 ||
      formAddOns.length > 0 ||
      addOnName.trim() ||
      addOnPrice.trim() ||
      formNotes.trim() ||
      dueDatePreset !== "14" ||
      formDueDate !== defaultDueDate() ||
      qaFirstName.trim() ||
      qaLastName.trim() ||
      qaPhone.trim() ||
      qaEmail.trim() ||
      qaStreet.trim() ||
      qaCity.trim()
    );
  }, [
    formClientId,
    formServiceType,
    formBasePrice,
    formAddOns.length,
    addOnName,
    addOnPrice,
    formNotes,
    dueDatePreset,
    formDueDate,
    qaFirstName,
    qaLastName,
    qaPhone,
    qaEmail,
    qaStreet,
    qaCity,
  ]);

  function closeInvoicePanel() {
    setPanelOpen(false);
    setClosePromptOpen(false);
    setEditMode(false);
    setEditInvoiceId(null);
    setQuickAddOpen(false);
    setQaFirstName("");
    setQaLastName("");
    setQaPhone("");
    setQaEmail("");
    setQaStreet("");
    setQaCity("");
  }

  function requestCloseInvoicePanel() {
    if (!isInvoiceDirty) {
      closeInvoicePanel();
      return;
    }
    setClosePromptOpen(true);
  }

  function saveDraftAndClose() {
    const draft = {
      formClientId,
      formServiceType,
      formBasePrice,
      formAddOns,
      addOnName,
      addOnPrice,
      formDueDate,
      formNotes,
    };
    localStorage.setItem(INVOICE_DRAFT_KEY, JSON.stringify(draft));
    toast.success("Draft saved");
    closeInvoicePanel();
  }

  function discardAndClose() {
    localStorage.removeItem(INVOICE_DRAFT_KEY);
    resetInvoiceForm();
    closeInvoicePanel();
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
      void: "bg-[var(--mh-surface-raised)] text-[var(--mh-text-muted)] ring-1 ring-inset ring-[var(--mh-border)]",
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
          <h1 className="text-[26px] md:text-[21px] font-bold md:font-semibold text-[var(--mh-text)] tracking-[-0.03em] md:tracking-[-0.02em]">Invoices</h1>
          <p className="hidden md:block text-sm text-[var(--mh-text-muted)] mt-0.5">Track billing and payments</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 h-9 px-3.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold rounded-[8px] transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Invoice</span>
        </button>
      </div>

      {/* ── MOBILE VIEW ─────────────────────────────────────── */}
      <div className="md:hidden space-y-4">

        {/* Summary strip */}
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {[
            { label: "Invoiced", value: formatCurrency(summaryTotalInvoiced), color: "text-[var(--mh-text)]" },
            { label: "Collected", value: formatCurrency(summaryCollected), color: "text-[#34C759]" },
            { label: "Outstanding", value: formatCurrency(summaryOutstanding), color: "text-[#FF9F0A]" },
          ].map((stat) => (
            <div key={stat.label} className="shrink-0 bg-[var(--mh-surface)] border border-[var(--mh-border)] rounded-[12px] px-4 py-3 min-w-[140px]">
              <p className="text-[10px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.08em] mb-1">{stat.label}</p>
              <p className={`text-[18px] font-bold tracking-[-0.03em] tabular-nums ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {(["all", "unpaid", "paid", "void"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`shrink-0 px-3.5 py-1.5 text-[12px] font-semibold rounded-full border transition-colors ${
                statusFilter === opt
                  ? "bg-[#0071E3] border-[#0071E3] text-white"
                  : "bg-[var(--mh-surface)] border-[var(--mh-border)] text-[var(--mh-text-muted)]"
              }`}
            >
              {opt === "all" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--mh-text-faint)]" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-[13px] bg-[var(--mh-surface)] border border-[var(--mh-border)] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40 focus:border-[#0071E3]/50 placeholder:text-[var(--mh-text-faint)] text-[var(--mh-text)]"
          />
        </div>

        {/* Invoice list */}
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-[var(--mh-surface)] rounded-[14px] border border-[var(--mh-border)]">
            <div className="h-14 w-14 rounded-[12px] bg-[#0071E3]/10 flex items-center justify-center mb-3">
              <Receipt className="h-7 w-7 text-[#0071E3]" />
            </div>
            <h3 className="text-[15px] font-bold text-[var(--mh-text)] mb-1">No invoices yet</h3>
            <p className="text-[12px] text-[var(--mh-text-muted)] mb-5 max-w-[240px] leading-relaxed">Create your first invoice to start tracking payments.</p>
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#0071E3] text-white text-[13px] font-semibold rounded-[10px] transition-colors">
              <Plus className="h-4 w-4" />
              New Invoice
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[13px] font-semibold text-[var(--mh-text)]">No results for &ldquo;{search}&rdquo;</p>
            <p className="text-[12px] text-[var(--mh-text-muted)] mt-1">Try a different search</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((inv) => {
              const seq = invoiceSeqMap[inv.id] ?? 0;
              const clientName = inv.clients ? `${inv.clients.first_name} ${inv.clients.last_name}` : "Client";
              const isOverdue = inv.status === "unpaid" && inv.due_date && new Date(inv.due_date + "T00:00:00") < new Date();
              const statusColors: Record<string, string> = {
                unpaid: isOverdue ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-[#FF9F0A]/10 text-[#FF9F0A] border-[#FF9F0A]/20",
                paid: "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20",
                void: "bg-[var(--mh-surface-raised)] text-[var(--mh-text-muted)] border-[var(--mh-border)]",
              };
              return (
                <div key={inv.id} className="bg-[var(--mh-surface)] border border-[var(--mh-border)] rounded-[14px] overflow-hidden">
                  <div className="flex items-start gap-3 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold text-[var(--mh-text-faint)] tabular-nums font-mono">{invoiceNumber(seq)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[inv.status] || statusColors.void}`}>
                          {isOverdue ? "Overdue" : inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-[15px] font-bold text-[var(--mh-text)] tracking-[-0.02em] truncate">{clientName}</p>
                      <p className="text-[12px] text-[var(--mh-text-muted)] mt-0.5">
                        Due {inv.due_date ? formatDate(inv.due_date) : "—"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[20px] font-bold text-[var(--mh-text)] tracking-[-0.03em] tabular-nums">
                        {formatCurrency(inv.total || 0)}
                      </p>
                      {inv.status === "paid" && inv.payment_date && (
                        <p className="text-[11px] text-[#34C759] mt-0.5">Paid {formatDate(inv.payment_date)}</p>
                      )}
                    </div>
                  </div>
                  {inv.status === "unpaid" && (
                    <div className="flex border-t border-[var(--mh-divider)]">
                      <button
                        onClick={() => markPaid(inv)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-[#34C759] active:bg-[#34C759]/10 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                        Mark Paid
                      </button>
                      <div className="w-px bg-[var(--mh-divider)]" />
                      <button
                        onClick={() => openEdit(inv)}
                        className="flex items-center justify-center gap-1.5 px-5 py-3 text-[13px] font-semibold text-[var(--mh-text-muted)] active:bg-[var(--mh-hover-overlay)] transition-colors"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={2} />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DESKTOP VIEW ────────────────────────────────────── */}
      <div className="hidden md:block space-y-5">

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[var(--mh-surface)] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[var(--mh-border)] p-5">
            <p className="text-xs font-semibold text-[var(--mh-text-muted)] uppercase tracking-wider">
              Total Invoiced
            </p>
            <p className="text-2xl font-bold text-[var(--mh-text)] mt-1">
              {formatCurrency(summaryTotalInvoiced)}
            </p>
          </div>
          <div className="bg-[var(--mh-surface)] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[var(--mh-border)] p-5">
            <p className="text-xs font-semibold text-[var(--mh-text-muted)] uppercase tracking-wider">
              Collected
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(summaryCollected)}
            </p>
          </div>
          <div className="bg-[var(--mh-surface)] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[var(--mh-border)] p-5">
            <p className="text-xs font-semibold text-[var(--mh-text-muted)] uppercase tracking-wider">
              Outstanding
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {formatCurrency(summaryOutstanding)}
            </p>
          </div>
        </div>

      {/* Invoice Table */}
      <div className="bg-[var(--mh-surface)] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[var(--mh-border)]">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-[var(--mh-divider)]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-350" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 w-full md:w-52 transition-all"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[6px] transition-colors ${
                statusFilter !== "all"
                  ? "text-[var(--mh-text)] bg-[var(--mh-accent-tint)] border border-[#0071E3]/30"
                  : "text-[var(--mh-text-muted)] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] hover:bg-[var(--mh-hover-overlay)]"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {statusFilter !== "all" && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#0071E3]" />
              )}
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-[var(--mh-surface)] rounded-[6px] shadow-lg border border-[var(--mh-divider)] py-1 z-50">
                  {(["all", "unpaid", "paid", "void"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setStatusFilter(opt); setFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium capitalize transition-colors ${
                        statusFilter === opt ? "text-[var(--mh-text)] bg-[var(--mh-surface-raised)]" : "text-[var(--mh-text-muted)] hover:bg-[var(--mh-hover-overlay)]"
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
              className="text-base font-semibold text-[var(--mh-text)] mb-2"
            >
              No invoices yet
            </h3>
            <p
              className="text-sm text-[var(--mh-text-muted)] mb-6 max-w-xs leading-relaxed"
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
              className="text-sm font-semibold text-[var(--mh-text)]"
            >
              No results for &ldquo;{search}&rdquo;
            </p>
            <p
              className="text-xs text-[var(--mh-text-muted)] mt-1"
            >
              Try a different search term
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--mh-surface-sunken)] border-b border-[var(--mh-divider)]">
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--mh-text-muted)]"
                  >
                    Invoice #
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--mh-text-muted)]"
                  >
                    Client
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--mh-text-muted)]"
                  >
                    Amount
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--mh-text-muted)] hidden md:table-cell"
                  >
                    Issue Date
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--mh-text-muted)] hidden lg:table-cell"
                  >
                    Due Date
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--mh-text-muted)]"
                  >
                    Status
                  </th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--mh-divider)]">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-[var(--mh-hover-overlay)] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-[var(--mh-text)] font-mono">
                        {invoiceNumber(invoiceSeqMap[inv.id] ?? 0)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm text-[var(--mh-text)]"
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
                        className="text-sm font-bold text-[var(--mh-text)]"
                      >
                        {formatCurrency(inv.total || 0)}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 text-xs text-[var(--mh-text-muted)] whitespace-nowrap hidden md:table-cell"
                    >
                      {formatDate(inv.created_at?.split("T")[0] || null)}
                    </td>
                    <td
                      className="px-5 py-4 text-xs text-[var(--mh-text-muted)] whitespace-nowrap hidden lg:table-cell"
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
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status === "unpaid" && (
                          <button
                            onClick={() => markPaid(inv)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20 border border-[#34C759]/20 transition-colors whitespace-nowrap"
                          >
                            <CheckCircle2 className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            if (actionMenuId === inv.id) {
                              setActionMenuId(null);
                              setMenuPos(null);
                            } else {
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
                              setActionMenuId(inv.id);
                            }
                          }}
                          className="p-1.5 rounded-[5px] hover:bg-[var(--mh-surface-raised)] text-[var(--mh-text-muted)] hover:text-[var(--mh-text)] transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>

      </div>  {/* end desktop view */}

      {/* Action dropdown — rendered at root level with fixed position to avoid table overflow clipping */}
      {actionMenuId && menuPos && (() => {
        const inv = invoices.find((i) => i.id === actionMenuId);
        if (!inv) return null;
        return (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => { setActionMenuId(null); setMenuPos(null); }} />
            <div
              className="fixed z-[101] w-44 bg-[var(--mh-surface)] rounded-[8px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[var(--mh-border)] py-1.5 overflow-hidden"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              {inv.status === "unpaid" && (
                <>
                  <button
                    onClick={() => { openEdit(inv); setActionMenuId(null); setMenuPos(null); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-[var(--mh-text-muted)] hover:bg-[var(--mh-hover-overlay)] hover:text-[var(--mh-text)] transition-colors text-left"
                  >
                    <Pencil className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                    Edit
                  </button>
                  <button
                    onClick={() => { voidInvoice(inv); setActionMenuId(null); setMenuPos(null); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-[var(--mh-text-muted)] hover:bg-[var(--mh-hover-overlay)] hover:text-[var(--mh-text)] transition-colors text-left"
                  >
                    <Ban className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                    Void
                  </button>
                  <div className="my-1 mx-2 border-t border-[var(--mh-divider)]" />
                </>
              )}
              <button
                onClick={() => { deleteInvoice(inv); if (deleteConfirmId !== inv.id) { setActionMenuId(null); setMenuPos(null); } }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium transition-colors text-left ${
                  deleteConfirmId === inv.id
                    ? "text-red-500 bg-red-500/10"
                    : "text-red-400 hover:bg-red-500/8 hover:text-red-500"
                }`}
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                {deleteConfirmId === inv.id ? "Confirm?" : "Delete"}
              </button>
            </div>
          </>
        );
      })()}

      {/* Create Invoice Panel */}
      <SlidePanel
        open={panelOpen}
        onClose={requestCloseInvoicePanel}
        title={editMode ? "Edit Invoice" : "New Invoice"}
        subtitle={editMode ? "Update invoice details" : "Create and send a new invoice"}
        width="w-full max-w-xl"
        footer={
          <FormActions>
            <PrimaryButton loading={saving} onClick={editMode ? handleUpdate : handleSave}>
              {editMode ? "Update Invoice" : "Create Invoice"}
            </PrimaryButton>
          </FormActions>
        }
      >
        <div className="px-4 md:px-6 py-5 md:py-6 space-y-6">
          <FormSection label="Client">
            <FormField label="Client" required>
              <div className="space-y-2">
                <FormSelect
                  value={formClientId}
                  onChange={(e) => {
                    setFormClientId(e.target.value);
                    setQuickAddOpen(false);
                  }}
                >
                  <option value="">Select a client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </option>
                  ))}
                </FormSelect>
                <button
                  type="button"
                  onClick={() => setQuickAddOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#0071E3] hover:text-[#0077ED] transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" strokeWidth={2} />
                  {quickAddOpen ? "Cancel" : "New client"}
                </button>
                {quickAddOpen && (
                  <div className="p-4 bg-[var(--mh-surface-sunken)] border border-[var(--mh-border)] rounded-[6px] space-y-3">
                    <p className="text-[12px] font-semibold text-[var(--mh-text)]">Quick Add Client</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <FormInput
                        placeholder="First name *"
                        value={qaFirstName}
                        onChange={(e) => setQaFirstName(e.target.value)}
                      />
                      <FormInput
                        placeholder="Last name *"
                        value={qaLastName}
                        onChange={(e) => setQaLastName(e.target.value)}
                      />
                    </div>
                    <FormInput
                      placeholder="Phone"
                      value={qaPhone}
                      onChange={(e) => setQaPhone(e.target.value)}
                    />
                    <FormInput
                      placeholder="Email"
                      type="email"
                      value={qaEmail}
                      onChange={(e) => setQaEmail(e.target.value)}
                    />
                    <FormInput
                      placeholder="Street address"
                      value={qaStreet}
                      onChange={(e) => setQaStreet(e.target.value)}
                    />
                    <FormInput
                      placeholder="City"
                      value={qaCity}
                      onChange={(e) => setQaCity(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={qaSaving || !qaFirstName.trim() || !qaLastName.trim()}
                      onClick={handleQuickAddClient}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white rounded-[6px] transition-colors disabled:opacity-50"
                    >
                      {qaSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                      Add Client
                    </button>
                  </div>
                )}
              </div>
            </FormField>
          </FormSection>

          <FormSection label="Service">
            <FormField label="Service Type">
              <FormSelect
                value={formServiceType}
                onChange={(e) => {
                  setFormServiceType(e.target.value);
                  const price = servicePrices[e.target.value];
                  if (price != null && price > 0) {
                    setFormBasePrice(price);
                  } else {
                    const defaultPrice = DEFAULT_SERVICE_PRICES[e.target.value];
                    if (defaultPrice) setFormBasePrice(defaultPrice);
                  }
                }}
              >
                <option value="">Select a service type...</option>
                {serviceTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label="Price">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mh-text-muted)] text-[13px] pointer-events-none">$</span>
                <FormInput
                  type="number"
                  min={0}
                  step={0.01}
                  value={formBasePrice || ""}
                  onChange={(e) => setFormBasePrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </FormField>
          </FormSection>

          <FormSection label="Additional Costs">
            {/* Preset chips */}
            <div className="flex flex-wrap gap-1.5">
              {addOnPresets.map((preset) => {
                const isActive = formAddOns.some((a) => a.name === preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      if (isActive) {
                        setFormAddOns((prev) => prev.filter((a) => a.name !== preset));
                      } else {
                        setFormAddOns((prev) => [
                          ...prev,
                          {
                            id: String(Date.now() + Math.random()),
                            name: preset,
                            price: addOnPresetPrices[preset] || 0,
                          },
                        ]);
                      }
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
                      isActive
                        ? "bg-[#0071E3] border-[#0071E3] text-white"
                        : "bg-[var(--mh-surface-raised)] border-[var(--mh-border)] text-[var(--mh-text-muted)] hover:text-[var(--mh-text)]"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            {/* Added add-ons with price fields */}
            {formAddOns.length > 0 && (
              <div className="space-y-2 pt-1">
                {formAddOns.map((addon) => (
                  <div key={addon.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <FormInput
                        value={addon.name}
                        onChange={(e) =>
                          setFormAddOns((prev) =>
                            prev.map((a) => a.id === addon.id ? { ...a, name: e.target.value } : a)
                          )
                        }
                        placeholder="Cost name"
                      />
                    </div>
                    <div className="w-28 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mh-text-muted)] text-[13px] pointer-events-none">$</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={addon.price || ""}
                        onChange={(e) =>
                          setFormAddOns((prev) =>
                            prev.map((a) => a.id === addon.id ? { ...a, price: parseFloat(e.target.value) || 0 } : a)
                          )
                        }
                        placeholder="0.00"
                        className="w-full pl-6 pr-2 py-2 text-[13px] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] rounded-[4px] text-[var(--mh-text)] focus:outline-none focus:ring-1 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormAddOns((prev) => prev.filter((a) => a.id !== addon.id))}
                      className="p-1.5 text-[var(--mh-text-subtle)] hover:text-red-400 transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Custom add-on entry */}
            <div className="flex items-center gap-2 pt-1 border-t border-[var(--mh-divider)]">
              <div className="flex-1">
                <FormInput
                  value={addOnName}
                  onChange={(e) => setAddOnName(e.target.value)}
                  placeholder="Custom cost name..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && addOnName.trim()) {
                      e.preventDefault();
                      setFormAddOns((prev) => [...prev, { id: String(Date.now()), name: addOnName.trim(), price: parseFloat(addOnPrice) || 0 }]);
                      setAddOnName(""); setAddOnPrice("");
                    }
                  }}
                />
              </div>
              <div className="w-28 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mh-text-muted)] text-[13px] pointer-events-none">$</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={addOnPrice}
                  onChange={(e) => setAddOnPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-6 pr-2 py-2 text-[13px] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] rounded-[4px] text-[var(--mh-text)] focus:outline-none focus:ring-1 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/60 transition-all"
                />
              </div>
              <button
                type="button"
                disabled={!addOnName.trim()}
                onClick={() => {
                  if (!addOnName.trim()) return;
                  setFormAddOns((prev) => [...prev, { id: String(Date.now()), name: addOnName.trim(), price: parseFloat(addOnPrice) || 0 }]);
                  setAddOnName(""); setAddOnPrice("");
                }}
                className="px-3 py-2 text-[12px] font-semibold bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] rounded-[4px] text-[var(--mh-text-muted)] hover:text-[var(--mh-text)] disabled:opacity-40 transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          </FormSection>

          <FormSection label="Details">
            <FormField label="Due Date">
              <div className="space-y-2">
                <div className="flex gap-2">
                  {(["7", "14", "30"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setDueDatePreset(p);
                        setFormDueDate(dueDateFromPreset(p));
                      }}
                      className={`px-3 py-1.5 text-[12px] font-semibold rounded-[4px] border transition-colors ${
                        dueDatePreset === p
                          ? "bg-[#0071E3] border-[#0071E3] text-white"
                          : "bg-[var(--mh-surface-raised)] border-[var(--mh-border)] text-[var(--mh-text-muted)] hover:text-[var(--mh-text)] hover:border-[var(--mh-border-strong)]"
                      }`}
                    >
                      {p} days
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDueDatePreset("custom")}
                    className={`px-3 py-1.5 text-[12px] font-semibold rounded-[4px] border transition-colors ${
                      dueDatePreset === "custom"
                        ? "bg-[#0071E3] border-[#0071E3] text-white"
                        : "bg-[var(--mh-surface-raised)] border-[var(--mh-border)] text-[var(--mh-text-muted)] hover:text-[var(--mh-text)] hover:border-[var(--mh-border-strong)]"
                    }`}
                  >
                    Custom date
                  </button>
                </div>
                {dueDatePreset === "custom" && (
                  <FormInput
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                  />
                )}
                {dueDatePreset !== "custom" && (
                  <p className="text-[11px] text-[var(--mh-text-subtle)]">
                    Due {formatDate(formDueDate)}
                  </p>
                )}
              </div>
            </FormField>
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
          <div className="border-t border-[var(--mh-divider)] pt-4 space-y-1.5">
            {formBasePrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--mh-text-muted)]">{formServiceType || "Service"}</span>
                <span className="text-[var(--mh-text)]">{formatCurrency(formBasePrice)}</span>
              </div>
            )}
            {formAddOns.map((addon) => (
              <div key={addon.id} className="flex justify-between text-sm">
                <span className="text-[var(--mh-text-muted)]">{addon.name}</span>
                <span className="text-[var(--mh-text)]">{formatCurrency(addon.price)}</span>
              </div>
            ))}
            <div className="flex justify-between text-lg pt-2 border-t border-[var(--mh-divider)]">
              <span className="font-semibold text-[var(--mh-text)]">Total</span>
              <span className="font-bold text-[var(--mh-text)]">{formatCurrency(invoiceTotal)}</span>
            </div>
          </div>
        </div>
      </SlidePanel>

      {closePromptOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-sm rounded-[10px] border border-[var(--mh-border)] bg-[var(--mh-surface)] shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
            <div className="px-4 py-3.5 border-b border-[var(--mh-divider)]">
              <p className="text-[14px] font-bold text-[var(--mh-text)]">Save invoice draft?</p>
              <p className="text-[12px] text-[var(--mh-text-muted)] mt-1">
                You have unsaved changes. Save this as a draft before closing?
              </p>
            </div>
            <div className="px-4 py-3 grid grid-cols-1 gap-2">
              <button
                onClick={saveDraftAndClose}
                className="w-full h-9 rounded-[8px] bg-[#0071E3] text-white text-[13px] font-semibold"
              >
                Save Draft
              </button>
              <button
                onClick={discardAndClose}
                className="w-full h-9 rounded-[8px] border border-[var(--mh-border)] text-[13px] font-semibold text-[var(--mh-text-muted)]"
              >
                Discard
              </button>
              <button
                onClick={() => setClosePromptOpen(false)}
                className="w-full h-9 rounded-[8px] text-[13px] font-semibold text-[var(--mh-text-subtle)]"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
