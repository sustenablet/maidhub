"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  StickyNote,
  Briefcase,
  Receipt,
  Edit2,
  Archive,
  Plus,
  Trash2,
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
import type { Client, Address, Job, Invoice } from "@/lib/types";
import { SERVICE_TYPES } from "@/lib/types";
import { toast } from "sonner";

const JOB_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-[#0071E3]/10 text-[#0071E3] ring-1 ring-inset ring-[#0071E3]/20" },
  in_progress: { label: "In Progress", className: "bg-[#FF9F0A]/10 text-[#FF9F0A] ring-1 ring-inset ring-[#FF9F0A]/20" },
  completed: { label: "Completed", className: "bg-[#34C759]/10 text-[#34C759] ring-1 ring-inset ring-[#34C759]/20" },
  invoiced: { label: "Invoiced", className: "bg-[#0071E3]/10 text-[#0071E3] ring-1 ring-inset ring-[#0071E3]/20" },
  cancelled: { label: "Cancelled", className: "bg-[#252525] text-[#888888] ring-1 ring-inset ring-[#2C2C2C]" },
};

const INVOICE_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  unpaid: { label: "Unpaid", className: "bg-[#FF9F0A]/10 text-[#FF9F0A] ring-1 ring-inset ring-[#FF9F0A]/20" },
  paid: { label: "Paid", className: "bg-[#34C759]/10 text-[#34C759] ring-1 ring-inset ring-[#34C759]/20" },
  void: { label: "Void", className: "bg-[#252525] text-[#888888] ring-1 ring-inset ring-[#2C2C2C]" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatAddress(address: Address | undefined) {
  if (!address) return "No address on file";
  const parts = [address.street, address.city, address.state, address.zip].filter(Boolean);
  return parts.join(", ");
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit panel state
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editZip, setEditZip] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPreferredService, setEditPreferredService] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch client
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .eq("user_id", user.id)
        .single();

      if (clientError) throw clientError;
      setClient(clientData as Client);

      // Fetch addresses
      const { data: addressData } = await supabase
        .from("addresses")
        .select("*")
        .eq("client_id", clientId)
        .eq("user_id", user.id);

      setAddresses((addressData as Address[]) || []);

      // Fetch jobs with address info
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*, addresses(*)")
        .eq("client_id", clientId)
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: false });

      setJobs((jobsData as Job[]) || []);

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", clientId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setInvoices((invoicesData as Invoice[]) || []);
    } catch (err) {
      console.error("Error fetching client:", err);
      toast.error("Failed to load client details");
    } finally {
      setLoading(false);
    }
  }, [supabase, clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEditPanel = () => {
    if (!client) return;
    setEditFirstName(client.first_name);
    setEditLastName(client.last_name);
    setEditEmail(client.email || "");
    setEditPhone(client.phone || "");
    setEditPreferredService(client.preferred_service || "");
    const addr = addresses[0];
    setEditStreet(addr?.street || "");
    setEditCity(addr?.city || "");
    setEditState(addr?.state || "");
    setEditZip(addr?.zip || "");
    setEditNotes(client.notes || "");
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setSaving(true);
    try {
      const { error: clientError } = await supabase
        .from("clients")
        .update({
          first_name: editFirstName.trim(),
          last_name: editLastName.trim(),
          email: editEmail.trim() || null,
          phone: editPhone.trim() || null,
          preferred_service: editPreferredService || null,
          notes: editNotes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId);

      if (clientError) throw clientError;

      // Update or insert address
      if (addresses.length > 0) {
        const { error: addrError } = await supabase
          .from("addresses")
          .update({
            street: editStreet.trim(),
            city: editCity.trim() || null,
            state: editState.trim() || null,
            zip: editZip.trim() || null,
          })
          .eq("id", addresses[0].id);

        if (addrError) throw addrError;
      } else if (editStreet.trim()) {
        const { data: { user } } = await supabase.auth.getUser();
        const { error: addrError } = await supabase
          .from("addresses")
          .insert({
            client_id: clientId,
            user_id: user!.id,
            street: editStreet.trim(),
            city: editCity.trim() || null,
            state: editState.trim() || null,
            zip: editZip.trim() || null,
          });

        if (addrError) throw addrError;
      }

      toast.success("Client updated successfully");
      setEditOpen(false);
      await fetchData();
    } catch (err) {
      console.error("Error updating client:", err);
      toast.error("Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!client) return;
    const action = client.status === "active" ? "archive" : "reactivate";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${client.first_name} ${client.last_name}?`
    );
    if (!confirmed) return;

    try {
      const newStatus = client.status === "active" ? "archived" : "active";
      const { error } = await supabase
        .from("clients")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", clientId);

      if (error) throw error;
      toast.success(
        `Client ${newStatus === "archived" ? "archived" : "reactivated"} successfully`
      );
      await fetchData();
    } catch (err) {
      console.error("Error archiving client:", err);
      toast.error(`Failed to ${action} client`);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [creatingInvoiceJobId, setCreatingInvoiceJobId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      // Reset after 3 seconds if not confirmed
      setTimeout(() => setDeleteConfirm(false), 3000);
      return;
    }
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientId);
      if (error) throw error;
      toast.success("Client deleted");
      router.push("/dashboard/clients");
    } catch (err) {
      console.error("Error deleting client:", err);
      toast.error("Failed to delete client");
      setDeleteConfirm(false);
    }
  };

  const handleCreateInvoiceFromJob = async (job: Job) => {
    setCreatingInvoiceJobId(job.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const { error: invoiceError } = await supabase.from("invoices").insert({
        client_id: clientId,
        user_id: user.id,
        job_id: job.id,
        line_items: [
          {
            description: job.service_type || "Cleaning Service",
            quantity: 1,
            unit_price: job.price || 0,
          },
        ],
        total: job.price || 0,
        status: "unpaid",
        due_date: dueDate.toISOString().split("T")[0],
        notes: null,
      });

      if (invoiceError) throw invoiceError;

      const { error: jobError } = await supabase
        .from("jobs")
        .update({ status: "invoiced" })
        .eq("id", job.id);

      if (jobError) throw jobError;

      toast.success("Invoice created successfully");
      await fetchData();
    } catch (err) {
      console.error("Error creating invoice:", err);
      toast.error("Failed to create invoice");
    } finally {
      setCreatingInvoiceJobId(null);
    }
  };

  // Computed stats
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(
    (j) => j.status === "completed" || j.status === "invoiced"
  ).length;
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const outstanding = invoices
    .filter((inv) => inv.status === "unpaid")
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[#888888] animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-sm font-semibold text-[#D4D4D4] mb-2">
          Client not found
        </p>
        <button
          onClick={() => router.push("/dashboard/clients")}
          className="text-sm text-[#888888] hover:text-[#D4D4D4] font-medium"
        >
          Back to clients
        </button>
      </div>
    );
  }

  const initials = `${client.first_name.charAt(0)}${client.last_name.charAt(0)}`.toUpperCase();
  const primaryAddress = addresses[0];
  const statusBadge =
    client.status === "active"
      ? "bg-[#34C759]/10 text-[#34C759] ring-1 ring-inset ring-[#34C759]/20"
      : "bg-[#252525] text-[#888888] ring-1 ring-inset ring-[#2C2C2C]";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/dashboard/clients")}
        className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#D4D4D4] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Clients
      </button>

      {/* Client header card */}
      <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-full bg-white/[0.06] text-[#D4D4D4] flex items-center justify-center text-xl font-bold shrink-0">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <h1 className="text-[21px] font-semibold text-[#D4D4D4] tracking-[-0.02em]">
                {client.first_name} {client.last_name}
              </h1>
              <span className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusBadge}`}>
                {client.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#888888]">
              {client.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#444444]" />
                  {client.email}
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#444444]" />
                  {client.phone}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#444444]" />
                Client since {formatDate(client.created_at)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={openEditPanel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#888888] bg-[#1E1E1E] border border-[#2C2C2C] rounded-[6px] hover:bg-[#252525] transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={handleArchive}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#888888] bg-[#1E1E1E] border border-[#2C2C2C] rounded-[6px] hover:bg-[#252525] transition-colors"
            >
              <Archive className="h-3.5 w-3.5" />
              {client.status === "active" ? "Archive" : "Reactivate"}
            </button>
            <button
              onClick={handleDelete}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-[6px] transition-colors ${
                deleteConfirm
                  ? "bg-red-500/100 text-white hover:bg-red-600"
                  : "text-red-400 bg-[#1E1E1E] border border-[#2C2C2C] hover:bg-red-500/[0.06]0/100/[0.06] hover:text-red-400"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleteConfirm ? "Confirm Delete?" : "Delete"}
            </button>
            <button
              onClick={() => router.push(`/dashboard/invoices?clientId=${clientId}`)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#888888] bg-[#1E1E1E] border border-[#2C2C2C] rounded-[6px] hover:bg-[#252525] transition-colors"
            >
              <Receipt className="h-3.5 w-3.5" />
              Create Invoice
            </button>
            <button
              onClick={() => router.push(`/dashboard/schedule?clientId=${clientId}`)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0071E3] hover:bg-[#0071E3]/90 rounded-[6px] shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Book a Job
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Service Address */}
          <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C] p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-[#444444]" />
              <h3 className="text-xs font-bold tracking-[0.08em] text-[#555555] uppercase">
                Service Address
              </h3>
            </div>
            <p className="text-sm text-[#888888] leading-relaxed">
              {formatAddress(primaryAddress)}
            </p>
          </div>

          {/* Preferred Service */}
          {client.preferred_service && (
            <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-[#444444]" />
                <h3 className="text-xs font-bold tracking-[0.08em] text-[#555555] uppercase">
                  Preferred Service
                </h3>
              </div>
              <p className="text-sm text-[#888888] leading-relaxed">
                {client.preferred_service}
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C] p-5">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="h-4 w-4 text-[#444444]" />
              <h3 className="text-xs font-bold tracking-[0.08em] text-[#555555] uppercase">
                Notes
              </h3>
            </div>
            <p className="text-sm text-[#888888] leading-relaxed whitespace-pre-wrap">
              {client.notes || "No notes yet"}
            </p>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Jobs", value: totalJobs.toString(), color: "text-[#D4D4D4]" },
              { label: "Completed", value: completedJobs.toString(), color: "text-[#34C759]" },
              {
                label: "Total Invoiced",
                value: `$${totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 0 })}`,
                color: "text-[#D4D4D4]",
              },
              {
                label: "Outstanding",
                value: `$${outstanding.toLocaleString("en-US", { minimumFractionDigits: 0 })}`,
                color: outstanding > 0 ? "text-[#FF9F0A]" : "text-[#D4D4D4]",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C] p-4"
              >
                <p className="text-[10px] font-bold tracking-[0.1em] text-[#555555] uppercase mb-1.5">
                  {stat.label}
                </p>
                <p className={`text-xl font-bold tabular-nums ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Job History */}
          <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C]">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[#252525]">
              <Briefcase className="h-4 w-4 text-[#444444]" />
              <h3 className="text-xs font-bold tracking-[0.08em] text-[#555555] uppercase">
                Job History
              </h3>
              <span className="ml-auto text-[10px] font-semibold text-[#555555]">
                {jobs.length} job{jobs.length !== 1 ? "s" : ""}
              </span>
            </div>

            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <Briefcase className="h-8 w-8 text-[#444444] mb-3" />
                <p className="text-sm font-semibold text-[#888888] mb-1">
                  No jobs yet
                </p>
                <p className="text-xs text-[#555555]">
                  Book a job to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#252525]/50 border-b border-[#252525]">
                      {["Date", "Service Type", "Status", "Price", "Duration", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888] whitespace-nowrap"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252525]">
                    {jobs.map((job) => {
                      const status = JOB_STATUS_CONFIG[job.status] || {
                        label: job.status,
                        className: "bg-[#252525] text-[#888888] ring-1 ring-inset ring-[#2C2C2C]",
                      };
                      return (
                        <tr
                          key={job.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-4 text-xs text-[#888888] whitespace-nowrap">
                            {formatDate(job.scheduled_date)}
                            {job.start_time && (
                              <span className="text-[#555555] ml-1.5">
                                {formatTime(job.start_time)}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs font-medium text-[#888888]">
                            {job.service_type || "\u2014"}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-[#D4D4D4] tabular-nums">
                            {job.price != null
                              ? `$${Number(job.price).toLocaleString("en-US", { minimumFractionDigits: 0 })}`
                              : "\u2014"}
                          </td>
                          <td className="px-5 py-4 text-xs text-[#888888] whitespace-nowrap">
                            {job.duration_minutes
                              ? `${Math.floor(job.duration_minutes / 60)}h ${job.duration_minutes % 60}m`
                              : "\u2014"}
                          </td>
                          <td className="px-5 py-4">
                            {job.status === "completed" ? (
                              <button
                                onClick={() => handleCreateInvoiceFromJob(job)}
                                disabled={creatingInvoiceJobId === job.id}
                                className="flex items-center gap-1 text-xs font-semibold text-[#888888] hover:text-[#D4D4D4] transition-colors disabled:opacity-50"
                              >
                                {creatingInvoiceJobId === job.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Receipt className="h-3 w-3" />
                                )}
                                {creatingInvoiceJobId === job.id ? "Creating..." : "Create Invoice"}
                              </button>
                            ) : job.status === "invoiced" ? (
                              <span className="text-xs text-[#34C759] font-medium">
                                Invoiced
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Invoice History */}
          <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C]">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[#252525]">
              <Receipt className="h-4 w-4 text-[#444444]" />
              <h3 className="text-xs font-bold tracking-[0.08em] text-[#555555] uppercase">
                Invoice History
              </h3>
              <span className="ml-auto text-[10px] font-semibold text-[#555555]">
                {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
              </span>
            </div>

            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <Receipt className="h-8 w-8 text-[#444444] mb-3" />
                <p className="text-sm font-semibold text-[#888888] mb-1">
                  No invoices yet
                </p>
                <p className="text-xs text-[#555555]">
                  Invoices will appear here after jobs are completed
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#252525]/50 border-b border-[#252525]">
                      {["Invoice #", "Date", "Amount", "Status", "Due Date"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-5 py-3 text-[11px] font-semibold text-[#888888] whitespace-nowrap"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#252525]">
                    {invoices.map((invoice) => {
                      const status = INVOICE_STATUS_CONFIG[invoice.status] || {
                        label: invoice.status,
                        className: "bg-[#252525] text-[#888888] ring-1 ring-inset ring-[#2C2C2C]",
                      };
                      // Generate a readable invoice number from the id
                      const invoiceNum = `INV-${invoice.id.slice(0, 6).toUpperCase()}`;
                      return (
                        <tr
                          key={invoice.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-4 text-xs font-mono text-[#888888]">
                            {invoiceNum}
                          </td>
                          <td className="px-5 py-4 text-xs text-[#888888] whitespace-nowrap">
                            {formatDate(invoice.created_at)}
                          </td>
                          <td className="px-5 py-4 text-sm font-bold text-[#D4D4D4] tabular-nums">
                            {invoice.total != null
                              ? `$${Number(invoice.total).toLocaleString("en-US", { minimumFractionDigits: 0 })}`
                              : "\u2014"}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-[#888888] whitespace-nowrap">
                            {formatDate(invoice.due_date)}
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
      </div>

      {/* Edit Client Slide Panel */}
      <SlidePanel
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Client"
        subtitle={`${client.first_name} ${client.last_name}`}
      >
        <div className="px-6 py-6 space-y-6">
          <FormSection label="Contact Info">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name" required>
                <FormInput
                  placeholder="Jane"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                />
              </FormField>
              <FormField label="Last Name" required>
                <FormInput
                  placeholder="Doe"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                />
              </FormField>
            </div>
            <FormField label="Email">
              <FormInput
                type="email"
                placeholder="jane@example.com"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </FormField>
            <FormField label="Phone">
              <FormInput
                type="tel"
                placeholder="(555) 123-4567"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </FormField>
          </FormSection>

          <FormSection label="Service Preference">
            <FormField label="Preferred Service">
              <FormSelect
                value={editPreferredService}
                onChange={(e) => setEditPreferredService(e.target.value)}
              >
                <option value="">Select a service type...</option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          </FormSection>

          <FormSection label="Service Address">
            <FormField label="Street">
              <FormInput
                placeholder="123 Main St, Apt 4B"
                value={editStreet}
                onChange={(e) => setEditStreet(e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="City">
                <FormInput
                  placeholder="Brooklyn"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                />
              </FormField>
              <FormField label="State">
                <FormInput
                  placeholder="NY"
                  value={editState}
                  onChange={(e) => setEditState(e.target.value)}
                />
              </FormField>
              <FormField label="ZIP">
                <FormInput
                  placeholder="11201"
                  value={editZip}
                  onChange={(e) => setEditZip(e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection label="Notes">
            <FormField label="Notes">
              <FormTextarea
                rows={4}
                placeholder="Pet info, entry instructions, special requests..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </FormField>
          </FormSection>
        </div>

        <FormActions>
          <SecondaryButton onClick={() => setEditOpen(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton loading={saving} onClick={handleUpdate}>
            Save Changes
          </PrimaryButton>
        </FormActions>
      </SlidePanel>
    </div>
  );
}
