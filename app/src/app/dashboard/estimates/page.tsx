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
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create estimate panel
  const [createOpen, setCreateOpen] = useState(false);
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [estRes, clientRes] = await Promise.all([
      supabase
        .from("estimates")
        .select("*, clients(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("clients")
        .select("*")
        .eq("status", "active")
        .order("first_name"),
    ]);
    if (estRes.data) setEstimates(estRes.data as Estimate[]);
    if (clientRes.data) setClients(clientRes.data as Client[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    setFormClientId("");
    setFormLineItems([emptyLineItem()]);
    setFormNotes("");
    setCreateOpen(true);
  }

  // Save estimate
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
    const total = Math.round(subtotal * 100) / 100;
    const { error } = await supabase.from("estimates").insert({
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
      .order("created_at", { ascending: false });
    setClientAddresses((data as Address[]) || []);
    setConvertOpen(true);
  }

  async function handleConvertSave() {
    if (!convertEstimate) return;
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

  const statusBadge = (status: Estimate["status"]) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200",
      sent: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
      accepted: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
      declined: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
      expired: "bg-gray-100 text-gray-500",
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
            Estimates
          </h1>
          <p
            className="text-sm text-gray-400 mt-0.5"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Create quotes and convert to jobs
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <Plus className="h-4 w-4" />
          New Estimate
        </button>
      </div>

      {/* Estimate Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-350" />
            <input
              type="text"
              placeholder="Search estimates..."
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

        {estimates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-teal-400" />
            </div>
            <h3
              className="text-base font-semibold text-[#1A2332] mb-2"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              No estimates yet
            </h3>
            <p
              className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Create estimates for potential clients and convert accepted ones
              into jobs.
            </p>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <Plus className="h-4 w-4" />
              New Estimate
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
                    Estimate #
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Client
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden md:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Service
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Amount
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 hidden lg:table-cell"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Date
                  </th>
                  <th
                    className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Status
                  </th>
                  <th className="px-5 py-3 w-40" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((est) => (
                  <tr
                    key={est.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-[#1A2332] font-mono">
                        {estimateNumber(est.id)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm text-[#1A2332]/70"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {est.clients
                          ? `${est.clients.first_name} ${est.clients.last_name}`
                          : "-"}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 text-xs text-[#1A2332]/55 hidden md:table-cell"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {est.line_items?.[0]?.description || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm font-bold text-[#1A2332]"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {formatCurrency(est.total || 0)}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 text-xs text-[#1A2332]/55 whitespace-nowrap hidden lg:table-cell"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {formatDate(est.created_at?.split("T")[0] || null)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${statusBadge(est.status)}`}
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {est.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {est.status === "draft" && (
                          <button
                            onClick={() => updateStatus(est, "sent")}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                          >
                            Send
                          </button>
                        )}
                        {est.status === "sent" && (
                          <>
                            <button
                              onClick={() => updateStatus(est, "accepted")}
                              className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
                              style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateStatus(est, "declined")}
                              className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                              style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {est.status === "accepted" && (
                          <button
                            onClick={() => openConvert(est)}
                            className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                          >
                            Convert to Job
                            <ArrowRight className="h-3 w-3" />
                          </button>
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

      {/* Create Estimate Panel */}
      <SlidePanel
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Estimate"
        subtitle="Create a quote for a client"
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
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between text-lg">
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
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>
        </div>

        <FormActions>
          <SecondaryButton onClick={() => setCreateOpen(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton loading={saving} onClick={handleSave}>
            Create Estimate
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
                <p
                  className="text-xs text-amber-600 mt-1"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
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
    </div>
  );
}
