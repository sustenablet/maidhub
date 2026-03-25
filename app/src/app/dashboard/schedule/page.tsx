"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  User,
  Trash2,
  Repeat,
  Loader2,
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
import type { Client, Address, Job, RecurringRule } from "@/lib/types";
import { SERVICE_TYPES } from "@/lib/types";
import { toast } from "sonner";

/* ── Constants ──────────────────────────────────────────────────── */

const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 7;
const END_HOUR = 19; // 7pm
const TOTAL_HOURS = END_HOUR - START_HOUR; // 12 slots
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DURATION_OPTIONS = [
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
  { label: "2.5 hours", value: 150 },
  { label: "3 hours", value: 180 },
  { label: "3.5 hours", value: 210 },
  { label: "4 hours", value: 240 },
];

const STATUS_COLORS: Record<
  Job["status"],
  { bg: string; border: string; text: string }
> = {
  scheduled: {
    bg: "bg-[#0071E3]/15",
    border: "border-[#0071E3]/60",
    text: "text-[#60AAFF]",
  },
  in_progress: {
    bg: "bg-[#FF9F0A]/15",
    border: "border-[#FF9F0A]/60",
    text: "text-[#FF9F0A]",
  },
  completed: {
    bg: "bg-[#34C759]/15",
    border: "border-[#34C759]/60",
    text: "text-[#34C759]",
  },
  invoiced: {
    bg: "bg-[#30B0C7]/15",
    border: "border-[#30B0C7]/60",
    text: "text-[#30B0C7]",
  },
  cancelled: {
    bg: "bg-[#2A2A2A]",
    border: "border-[#3A3A3A]",
    text: "text-[#555555]",
  },
};

type ClientWithAddresses = Client & { addresses: Address[] };

/* ── Helpers ────────────────────────────────────────────────────── */

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function formatWeekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const mMonth = monday.toLocaleString("en-US", { month: "short" });
  const sMonth = sunday.toLocaleString("en-US", { month: "short" });
  const mDay = monday.getDate();
  const sDay = sunday.getDate();
  const year = sunday.getFullYear();
  if (mMonth === sMonth) {
    return `${mMonth} ${mDay}\u2013${sDay}, ${year}`;
  }
  return `${mMonth} ${mDay} \u2013 ${sMonth} ${sDay}, ${year}`;
}

function parseTime(time: string | null): { hour: number; minute: number } {
  if (!time) return { hour: 9, minute: 0 };
  const [h, m] = time.split(":").map(Number);
  return { hour: h, minute: m };
}

function formatTimeDisplay(time: string | null): string {
  if (!time) return "";
  const { hour, minute } = parseTime(time);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

function formatTimeRange(
  startTime: string | null,
  durationMinutes: number | null
): string {
  if (!startTime) return "";
  const start = formatTimeDisplay(startTime);
  if (!durationMinutes) return start;
  const { hour, minute } = parseTime(startTime);
  const endTotal = hour * 60 + minute + durationMinutes;
  const endH = Math.floor(endTotal / 60) % 24;
  const endM = endTotal % 60;
  const ampm = endH >= 12 ? "PM" : "AM";
  const h = endH % 12 || 12;
  return `${start} \u2013 ${h}:${endM.toString().padStart(2, "0")} ${ampm}`;
}

function formatAddress(address: Address | undefined | null): string {
  if (!address) return "";
  const parts = [address.street];
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zip) parts.push(address.zip);
  return parts.join(", ");
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ── Component ──────────────────────────────────────────────────── */

export default function SchedulePage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  /* State */
  const [weekOffset, setWeekOffset] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<ClientWithAddresses[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  /* Recurring rules */
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [recurringFormOpen, setRecurringFormOpen] = useState(false);
  const [recSaving, setRecSaving] = useState(false);
  const [recGenerating, setRecGenerating] = useState<string | null>(null);
  const [recClientId, setRecClientId] = useState("");
  const [recAddressId, setRecAddressId] = useState("");
  const [recFrequency, setRecFrequency] = useState<RecurringRule["frequency"]>("weekly");
  const [recCustomDays, setRecCustomDays] = useState("7");
  const [recStartDate, setRecStartDate] = useState("");
  const [recEndDate, setRecEndDate] = useState("");
  const [recServiceType, setRecServiceType] = useState("");
  const [recDuration, setRecDuration] = useState("120");
  const [recPrice, setRecPrice] = useState("");
  const [recStartTime, setRecStartTime] = useState("");

  /* Job form state */
  const [formClientId, setFormClientId] = useState("");
  const [formAddressId, setFormAddressId] = useState("");
  const [formServiceType, setFormServiceType] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formDuration, setFormDuration] = useState("60");
  const [formPrice, setFormPrice] = useState("");
  const [formNotes, setFormNotes] = useState("");

  /* Derived dates */
  const weekStart = useMemo(() => {
    const mon = getMonday(today);
    return addDays(mon, weekOffset * 7);
  }, [today, weekOffset]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  /* Addresses for selected client in the form */
  const selectedClientAddresses = useMemo(() => {
    const client = clients.find((c) => c.id === formClientId);
    return client?.addresses ?? [];
  }, [clients, formClientId]);

  /* Pre-fill service type from client's preferred_service */
  useEffect(() => {
    if (!formClientId) return;
    const selectedClient = clients.find((c) => c.id === formClientId);
    if (selectedClient?.preferred_service && !formServiceType) {
      setFormServiceType(selectedClient.preferred_service);
    }
  }, [formClientId, clients, formServiceType]);

  /* ── Data fetching ──────────────────────────────────────────── */

  const fetchJobs = useCallback(async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*, clients(*), addresses(*)")
      .gte("scheduled_date", formatDate(weekStart))
      .lte("scheduled_date", formatDate(weekEnd))
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to load schedule");
      return;
    }
    setJobs((data as Job[]) ?? []);
  }, [supabase, weekStart, weekEnd]);

  const fetchClients = useCallback(async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*, addresses:addresses(*)")
      .eq("status", "active")
      .order("first_name");

    if (error) {
      console.error("Failed to fetch clients:", error);
      return;
    }
    setClients((data as ClientWithAddresses[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchJobs(), fetchClients()]).finally(() => setLoading(false));
  }, [fetchJobs, fetchClients]);

  // Auto-open form when navigated with clientId param
  useEffect(() => {
    const clientIdParam = searchParams.get("clientId");
    if (clientIdParam && clients.length > 0) {
      setFormClientId(clientIdParam);
      setFormOpen(true);
      // Clear the param from URL without navigation
      window.history.replaceState({}, "", "/dashboard/schedule");
    }
  }, [searchParams, clients]);

  /* ── Group jobs by day ──────────────────────────────────────── */

  const jobsByDay = useMemo(() => {
    const map: Record<number, Job[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];

    for (const job of jobs) {
      // scheduled_date is YYYY-MM-DD
      const [y, m, d] = job.scheduled_date.split("-").map(Number);
      const jobDate = new Date(y, m - 1, d);
      const dayIndex = weekDays.findIndex((wd) => isSameDay(wd, jobDate));
      if (dayIndex >= 0) {
        map[dayIndex].push(job);
      }
    }
    return map;
  }, [jobs, weekDays]);

  /* ── Actions ────────────────────────────────────────────────── */

  function resetForm() {
    setFormClientId("");
    setFormAddressId("");
    setFormServiceType("");
    setFormDate("");
    setFormStartTime("");
    setFormDuration("60");
    setFormPrice("");
    setFormNotes("");
    setFormMode("create");
    setEditJobId(null);
  }

  function openNewJobForm() {
    resetForm();
    setFormOpen(true);
  }

  function openEditForm(job: Job) {
    setFormMode("edit");
    setEditJobId(job.id);
    setFormClientId(job.client_id);
    setFormAddressId(job.address_id || "");
    setFormServiceType(job.service_type || "");
    setFormDate(job.scheduled_date);
    setFormStartTime(job.start_time || "");
    setFormDuration(String(job.duration_minutes || 60));
    setFormPrice(job.price != null ? String(job.price) : "");
    setFormNotes(job.notes || "");
    setDetailOpen(false);
    setSelectedJob(null);
    setFormOpen(true);
  }

  async function handleCreateJob() {
    if (!formClientId || !formDate) {
      toast.error("Please select a client and date");
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); toast.error("Not authenticated"); return; }
    const { error } = await supabase.from("jobs").insert({
      user_id: user.id,
      client_id: formClientId,
      address_id: formAddressId || null,
      scheduled_date: formDate,
      start_time: formStartTime || null,
      duration_minutes: parseInt(formDuration) || 60,
      service_type: formServiceType || null,
      price: formPrice ? parseFloat(formPrice) : null,
      notes: formNotes || null,
      status: "scheduled",
    });
    setSaving(false);

    if (error) {
      console.error("Failed to create job:", error);
      toast.error("Failed to create job");
      return;
    }

    toast.success("Job scheduled");
    setFormOpen(false);
    resetForm();
    fetchJobs();
  }

  async function handleUpdateJob() {
    if (!editJobId || !formClientId || !formDate) {
      toast.error("Please select a client and date");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("jobs")
      .update({
        client_id: formClientId,
        address_id: formAddressId || null,
        scheduled_date: formDate,
        start_time: formStartTime || null,
        duration_minutes: parseInt(formDuration) || 60,
        service_type: formServiceType || null,
        price: formPrice ? parseFloat(formPrice) : null,
        notes: formNotes || null,
      })
      .eq("id", editJobId);
    setSaving(false);

    if (error) {
      console.error("Failed to update job:", error);
      toast.error("Failed to update job");
      return;
    }

    toast.success("Job updated");
    setFormOpen(false);
    resetForm();
    fetchJobs();
  }

  async function handleDeleteJob(job: Job) {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000);
      return;
    }
    const { error } = await supabase.from("jobs").delete().eq("id", job.id);
    if (error) {
      toast.error("Failed to delete job");
      setDeleteConfirm(false);
      return;
    }
    toast.success("Job deleted");
    setDetailOpen(false);
    setSelectedJob(null);
    setDeleteConfirm(false);
    fetchJobs();
  }

  /* ── Recurring rules ──────────────────────────────────── */

  const fetchRecurringRules = useCallback(async () => {
    const { data } = await supabase
      .from("recurring_rules")
      .select("*, clients(*), addresses(*)")
      .order("created_at", { ascending: false });
    setRecurringRules((data as RecurringRule[]) ?? []);
  }, [supabase]);

  function resetRecurringForm() {
    setRecClientId("");
    setRecAddressId("");
    setRecFrequency("weekly");
    setRecCustomDays("7");
    setRecStartDate("");
    setRecEndDate("");
    setRecServiceType("");
    setRecDuration("120");
    setRecPrice("");
    setRecStartTime("");
  }

  async function handleCreateRule() {
    if (!recClientId || !recStartDate) {
      toast.error("Client and start date are required");
      return;
    }
    setRecSaving(true);
    const { data: { user: ruleUser } } = await supabase.auth.getUser();
    if (!ruleUser) { setRecSaving(false); toast.error("Not authenticated"); return; }
    const { data: newRule, error } = await supabase.from("recurring_rules").insert({
      user_id: ruleUser.id,
      client_id: recClientId,
      address_id: recAddressId || null,
      frequency: recFrequency,
      custom_interval_days: recFrequency === "custom" ? parseInt(recCustomDays) || 7 : null,
      start_date: recStartDate,
      end_date: recEndDate || null,
      service_type: recServiceType || null,
      duration_minutes: parseInt(recDuration) || 120,
      price: recPrice ? parseFloat(recPrice) : null,
      start_time: recStartTime || null,
      is_active: true,
    }).select().single();
    setRecSaving(false);
    if (error) {
      toast.error("Failed to create recurring rule");
      return;
    }
    toast.success("Recurring rule created");
    setRecurringFormOpen(false);
    resetRecurringForm();
    fetchRecurringRules();
    // Auto-generate the next 4 upcoming jobs immediately
    if (newRule) generateJobs(newRule as RecurringRule);
  }

  async function toggleRuleActive(rule: RecurringRule) {
    const activating = !rule.is_active;
    const { error } = await supabase
      .from("recurring_rules")
      .update({ is_active: activating })
      .eq("id", rule.id);
    if (error) {
      toast.error("Failed to update rule");
      return;
    }
    fetchRecurringRules();
    // Auto-generate jobs when re-activating a rule
    if (activating) generateJobs({ ...rule, is_active: true });
  }

  async function deleteRule(ruleId: string) {
    const { error } = await supabase.from("recurring_rules").delete().eq("id", ruleId);
    if (error) {
      toast.error("Failed to delete rule");
      return;
    }
    toast.success("Rule deleted");
    fetchRecurringRules();
  }

  function getNextOccurrences(rule: RecurringRule, count: number): string[] {
    const dates: string[] = [];
    const start = new Date(rule.start_date + "T00:00:00");
    const end = rule.end_date ? new Date(rule.end_date + "T00:00:00") : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let current = new Date(start);
    // Move to next occurrence if start is in the past
    while (current < today) {
      advanceDate(current, rule);
    }

    for (let i = 0; i < count; i++) {
      if (end && current > end) break;
      dates.push(current.toISOString().split("T")[0]);
      advanceDate(current, rule);
    }
    return dates;
  }

  function advanceDate(date: Date, rule: RecurringRule) {
    switch (rule.frequency) {
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "biweekly":
        date.setDate(date.getDate() + 14);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "custom":
        date.setDate(date.getDate() + (rule.custom_interval_days || 7));
        break;
    }
  }

  async function generateJobs(rule: RecurringRule) {
    setRecGenerating(rule.id);
    const dates = getNextOccurrences(rule, 4);
    if (dates.length === 0) {
      toast.error("No upcoming dates to generate");
      setRecGenerating(null);
      return;
    }

    // Check which dates already have jobs for this rule
    const { data: existingJobs } = await supabase
      .from("jobs")
      .select("scheduled_date")
      .eq("recurring_rule_id", rule.id)
      .in("scheduled_date", dates);

    const existingDates = new Set((existingJobs ?? []).map((j) => j.scheduled_date));
    const newDates = dates.filter((d) => !existingDates.has(d));

    if (newDates.length === 0) {
      toast.success("All upcoming jobs already exist");
      setRecGenerating(null);
      return;
    }

    const jobsToInsert = newDates.map((d) => ({
      user_id: rule.user_id,
      client_id: rule.client_id,
      address_id: rule.address_id,
      recurring_rule_id: rule.id,
      scheduled_date: d,
      start_time: rule.start_time || null,
      duration_minutes: rule.duration_minutes || 120,
      service_type: rule.service_type || null,
      price: rule.price,
      status: "scheduled" as const,
    }));

    const { error } = await supabase.from("jobs").insert(jobsToInsert);
    setRecGenerating(null);
    if (error) {
      toast.error("Failed to generate jobs");
      return;
    }
    toast.success(`Generated ${newDates.length} job${newDates.length > 1 ? "s" : ""}`);
    fetchJobs();
  }

  async function handleStatusChange(job: Job, newStatus: Job["status"]) {
    setUpdatingStatus(true);
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", job.id);
    setUpdatingStatus(false);

    if (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update job status");
      return;
    }

    const statusLabels: Record<string, string> = {
      in_progress: "Job started",
      completed: "Job completed",
      invoiced: "Invoice created",
      cancelled: "Job cancelled",
    };
    toast.success(statusLabels[newStatus] ?? "Status updated");
    setSelectedJob({ ...job, status: newStatus });
    fetchJobs();
  }

  async function handleCreateInvoiceFromJob(job: Job) {
    setUpdatingStatus(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setUpdatingStatus(false);
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const { error: invError } = await supabase.from("invoices").insert({
      user_id: user.id,
      client_id: job.client_id,
      job_id: job.id,
      line_items: [{
        description: job.service_type || "Cleaning Service",
        quantity: 1,
        unit_price: job.price || 0,
      }],
      total: job.price || 0,
      status: "unpaid",
      due_date: dueDate.toISOString().split("T")[0],
    });

    if (invError) {
      console.error("Failed to create invoice:", invError);
      toast.error("Failed to create invoice");
      setUpdatingStatus(false);
      return;
    }

    await supabase.from("jobs").update({
      status: "invoiced",
      updated_at: new Date().toISOString(),
    }).eq("id", job.id);

    setUpdatingStatus(false);
    toast.success("Invoice created");
    setDetailOpen(false);
    setSelectedJob(null);
    fetchJobs();
  }

  /* ── Render helpers ─────────────────────────────────────────── */

  function renderJobCard(job: Job, dayIndex: number) {
    const { hour, minute } = parseTime(job.start_time);
    const duration = job.duration_minutes ?? 60;
    const top = (hour - START_HOUR) * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT;
    const height = Math.max((duration / 60) * HOUR_HEIGHT, 24);
    const colors = STATUS_COLORS[job.status];
    const clientName = job.clients
      ? `${job.clients.first_name} ${job.clients.last_name}`
      : "Unknown";

    return (
      <button
        key={job.id}
        onClick={() => {
          setSelectedJob(job);
          setDetailOpen(true);
        }}
        className={`absolute left-0.5 right-0.5 ${colors.bg} ${colors.border} ${colors.text} border-l-[3px] rounded-[6px] px-1.5 py-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow text-left`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          zIndex: 10,
        }}
        title={`${clientName} - ${job.service_type ?? "Service"}`}
      >
        <p
          className={`text-[11px] font-bold leading-tight truncate ${
            job.status === "cancelled" ? "line-through" : ""
          }`}
        >
          {clientName}
        </p>
        {height >= 40 && (
          <p
            className={`text-[10px] leading-tight truncate opacity-80 ${
              job.status === "cancelled" ? "line-through" : ""
            }`}
          >
            {job.service_type}
          </p>
        )}
        {height >= 56 && (
          <p className="text-[9px] leading-tight truncate opacity-60 mt-0.5">
            {formatTimeRange(job.start_time, job.duration_minutes)}
          </p>
        )}
      </button>
    );
  }

  function renderStatusActions(job: Job) {
    const buttons: { label: string; status: Job["status"]; color: string }[] =
      [];

    switch (job.status) {
      case "scheduled":
        buttons.push({
          label: "Start Job",
          status: "in_progress",
          color:
            "bg-[#FF9F0A]/100 hover:bg-amber-600 text-white",
        });
        break;
      case "in_progress":
        buttons.push({
          label: "Complete",
          status: "completed",
          color:
            "bg-[#34C759]/100 hover:bg-green-600 text-white",
        });
        break;
      case "completed":
        buttons.push({
          label: "Create Invoice",
          status: "invoiced",
          color:
            "bg-[#0071E3]/100 hover:bg-blue-600 text-white",
        });
        break;
    }

    if (job.status !== "cancelled" && job.status !== "invoiced") {
      buttons.push({
        label: "Cancel",
        status: "cancelled",
        color:
          "bg-white hover:bg-white/[0.03] text-[#888888] border border-[#2C2C2C]",
      });
    }

    if (buttons.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {buttons.map((btn) => (
          <button
            key={btn.status}
            onClick={() =>
              btn.status === "invoiced"
                ? handleCreateInvoiceFromJob(job)
                : handleStatusChange(job, btn.status)
            }
            disabled={updatingStatus}
            className={`px-4 py-2 text-sm font-semibold rounded-[6px] transition-colors disabled:opacity-50 ${btn.color}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    );
  }

  /* ── Main render ────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-[21px] font-semibold text-[#D4D4D4] tracking-[-0.02em]"
          >
            Schedule
          </h1>
          <p
            className="text-sm text-[#888888] mt-1"
          >
            Manage your cleaning appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setRecurringOpen(true); fetchRecurringRules(); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-[#D4D4D4] text-sm font-semibold rounded-[6px] transition-colors"
          >
            <Repeat className="h-4 w-4" />
            Recurring
          </button>
          <button
            onClick={openNewJobForm}
            className="flex items-center gap-2 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold rounded-[6px] shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Job
          </button>
        </div>
      </div>

      {/* Week navigation */}
      <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-1.5 rounded-[6px] hover:bg-[#2A2A2A] text-[#888888] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-1.5 rounded-[6px] hover:bg-[#2A2A2A] text-[#888888] transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span
            className="text-sm font-semibold text-[#D4D4D4] ml-1"
          >
            {formatWeekLabel(weekStart)}
          </span>
        </div>
        <button
          onClick={() => setWeekOffset(0)}
          className="px-3 py-1.5 text-xs font-semibold text-[#D4D4D4] bg-white/[0.05] hover:bg-white/[0.08] rounded-[6px] transition-colors"
        >
          Today
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-[#1E1E1E] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[#2C2C2C] overflow-hidden">
        {loading ? (
          <div
            className="flex items-center justify-center py-32 text-[#888888] text-sm"
          >
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div style={{ minWidth: "640px" }}>
              {/* Day headers */}
              <div
                className="grid border-b border-[#252525]"
                style={{
                  gridTemplateColumns: "52px repeat(7, 1fr)",
                }}
              >
                <div className="h-14" />
                {weekDays.map((day, i) => {
                  const isToday = isSameDay(day, today);
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-center h-14 border-l border-[#252525]"
                    >
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isToday ? "text-teal-600" : "text-[#888888]"
                        }`}
                      >
                        {DAY_NAMES[i]}
                      </span>
                      <span
                        className={`text-sm font-bold mt-0.5 leading-none ${
                          isToday
                            ? "bg-[#0071E3] text-white w-7 h-7 rounded-full flex items-center justify-center"
                            : "text-[#D4D4D4]"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Time grid body */}
              <div className="relative">
                {/* Empty state overlay */}
                {jobs.length === 0 && (
                  <div
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#141414]/80 backdrop-blur-[1px]"
                  >
                    <div className="w-12 h-12 rounded-[6px] bg-[#2A2A2A] flex items-center justify-center mb-3">
                      <Calendar className="h-6 w-6 text-[#888888]" />
                    </div>
                    <p className="text-sm font-semibold text-[#D4D4D4]">
                      No jobs this week
                    </p>
                    <p className="text-xs text-[#888888] mt-1 mb-4">
                      Schedule a job to see it appear here
                    </p>
                    <button
                      onClick={openNewJobForm}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED]/90 text-white text-sm font-semibold rounded-[6px] transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      New Job
                    </button>
                  </div>
                )}

                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: "52px repeat(7, 1fr)",
                    height: `${TOTAL_HOURS * HOUR_HEIGHT}px`,
                  }}
                >
                  {/* Time labels column */}
                  <div className="relative">
                    {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                      <div
                        key={i}
                        className="absolute right-2 text-[10px] text-[#888888] font-medium leading-none"
                        style={{
                          top: `${i * HOUR_HEIGHT - 5}px`,
                        }}
                      >
                        {((START_HOUR + i) % 12 || 12) +
                          (START_HOUR + i >= 12 ? "p" : "a")}
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {weekDays.map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="relative border-l border-[#252525]"
                    >
                      {/* Horizontal hour lines */}
                      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                        <div
                          key={i}
                          className="absolute left-0 right-0 border-t border-gray-50"
                          style={{ top: `${i * HOUR_HEIGHT}px` }}
                        />
                      ))}

                      {/* Hover cell zones */}
                      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                        <div
                          key={`hover-${i}`}
                          className="absolute left-0 right-0 hover:bg-white/[0.02] transition-colors"
                          style={{
                            top: `${i * HOUR_HEIGHT}px`,
                            height: `${HOUR_HEIGHT}px`,
                          }}
                        />
                      ))}

                      {/* Job cards */}
                      {(jobsByDay[dayIndex] ?? []).map((job) =>
                        renderJobCard(job, dayIndex)
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Job Detail Panel ───────────────────────────────────── */}
      <SlidePanel
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedJob(null);
        }}
        title={
          selectedJob?.clients
            ? `${selectedJob.clients.first_name} ${selectedJob.clients.last_name}`
            : "Job Details"
        }
        subtitle={selectedJob?.service_type ?? undefined}
      >
        {selectedJob && (
          <div className="px-6 py-5 space-y-5">
            {/* Status badge */}
            <div>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-xs font-semibold ${
                  STATUS_COLORS[selectedJob.status].bg
                } ${STATUS_COLORS[selectedJob.status].text}`}
              >
                {selectedJob.status.replace("_", " ").replace(/\b\w/g, (c) =>
                  c.toUpperCase()
                )}
              </span>
            </div>

            {selectedJob.status === "invoiced" && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0071E3]/10 rounded-[6px] mt-2">
                <Receipt className="h-3.5 w-3.5 text-blue-500" strokeWidth={1.8} />
                <span className="text-xs text-blue-600 font-medium">
                  Invoice has been created for this job
                </span>
              </div>
            )}

            {/* Info rows */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-[#888888] mt-0.5 shrink-0" />
                <div>
                  <p
                    className="text-xs text-[#888888] font-medium"
                  >
                    Client
                  </p>
                  <p
                    className="text-sm font-semibold text-[#D4D4D4]"
                  >
                    {selectedJob.clients
                      ? `${selectedJob.clients.first_name} ${selectedJob.clients.last_name}`
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-[#888888] mt-0.5 shrink-0" />
                <div>
                  <p
                    className="text-xs text-[#888888] font-medium"
                  >
                    Date & Time
                  </p>
                  <p
                    className="text-sm font-semibold text-[#D4D4D4]"
                  >
                    {new Date(
                      selectedJob.scheduled_date + "T00:00:00"
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {selectedJob.start_time && (
                    <p
                      className="text-sm text-[#888888]"
                    >
                      {formatTimeRange(
                        selectedJob.start_time,
                        selectedJob.duration_minutes
                      )}
                      {selectedJob.duration_minutes
                        ? ` (${selectedJob.duration_minutes} min)`
                        : ""}
                    </p>
                  )}
                </div>
              </div>

              {selectedJob.addresses && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#888888] mt-0.5 shrink-0" />
                  <div>
                    <p
                      className="text-xs text-[#888888] font-medium"
                    >
                      Address
                    </p>
                    <p
                      className="text-sm text-[#D4D4D4]"
                    >
                      {formatAddress(selectedJob.addresses)}
                    </p>
                  </div>
                </div>
              )}

              {selectedJob.price != null && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 text-[#888888] mt-0.5 shrink-0" />
                  <div>
                    <p
                      className="text-xs text-[#888888] font-medium"
                    >
                      Price
                    </p>
                    <p
                      className="text-sm font-bold text-[#D4D4D4]"
                    >
                      ${Number(selectedJob.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {selectedJob.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-[#888888] mt-0.5 shrink-0" />
                  <div>
                    <p
                      className="text-xs text-[#888888] font-medium"
                    >
                      Notes
                    </p>
                    <p
                      className="text-sm text-[#888888] whitespace-pre-wrap"
                    >
                      {selectedJob.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#252525]" />

            {/* Edit + Delete + Status actions */}
            <div className="flex flex-wrap gap-2">
              {selectedJob.status !== "invoiced" && selectedJob.status !== "cancelled" && (
                <button
                  onClick={() => openEditForm(selectedJob)}
                  className="px-4 py-2 text-sm font-semibold rounded-[6px] transition-colors bg-white/[0.06] text-[#D4D4D4] hover:bg-white/[0.1]"
                >
                  Edit Job
                </button>
              )}
              <button
                onClick={() => handleDeleteJob(selectedJob)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-[6px] transition-colors ${
                  deleteConfirm
                    ? "bg-red-500/100 text-white hover:bg-red-600"
                    : "text-red-400 hover:bg-red-500/10 hover:text-red-500"
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleteConfirm ? "Confirm?" : "Delete"}
              </button>
            </div>
            {renderStatusActions(selectedJob)}
          </div>
        )}
      </SlidePanel>

      {/* ── New Job Panel ──────────────────────────────────────── */}
      <SlidePanel
        open={formOpen}
        onClose={() => { setFormOpen(false); resetForm(); }}
        title={formMode === "edit" ? "Edit Job" : "New Job"}
        subtitle={formMode === "edit" ? "Update job details" : "Schedule a cleaning appointment"}
        footer={
          <FormActions>
            <SecondaryButton onClick={() => { setFormOpen(false); resetForm(); }}>
              Cancel
            </SecondaryButton>
            <PrimaryButton loading={saving} onClick={formMode === "edit" ? handleUpdateJob : handleCreateJob}>
              {formMode === "edit" ? "Update Job" : "Schedule Job"}
            </PrimaryButton>
          </FormActions>
        }
      >
        <div className="px-6 py-5 space-y-6">
          <FormSection label="Client & Location">
            <FormField label="Client" required>
              <FormSelect
                value={formClientId}
                onChange={(e) => {
                  setFormClientId(e.target.value);
                  setFormAddressId("");
                }}
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            <FormField label="Address">
              <FormSelect
                value={formAddressId}
                onChange={(e) => setFormAddressId(e.target.value)}
                disabled={!formClientId}
              >
                <option value="">
                  {formClientId
                    ? selectedClientAddresses.length === 0
                      ? "No addresses on file"
                      : "Select an address..."
                    : "Select a client first"}
                </option>
                {selectedClientAddresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {formatAddress(a)}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          </FormSection>

          <FormSection label="Service Details">
            <FormField label="Service Type">
              <FormSelect
                value={formServiceType}
                onChange={(e) => setFormServiceType(e.target.value)}
              >
                <option value="">Select a service...</option>
                {SERVICE_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </FormSelect>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date" required>
                <FormInput
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </FormField>
              <FormField label="Start Time">
                <FormInput
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Duration">
                <FormSelect
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              <FormField label="Price">
                <FormInput
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection label="Additional Info">
            <FormField label="Notes">
              <FormTextarea
                rows={3}
                placeholder="Any special instructions..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </FormField>
          </FormSection>
        </div>
      </SlidePanel>

      {/* ── Recurring Rules Panel ──────────────────────────────── */}
      <SlidePanel
        open={recurringOpen}
        onClose={() => setRecurringOpen(false)}
        title="Recurring Jobs"
        subtitle="Manage recurring cleaning schedules"
        width="w-full max-w-lg"
      >
        <div className="px-6 py-5 space-y-4">
          <button
            onClick={() => { setRecurringFormOpen(true); resetRecurringForm(); }}
            className="flex items-center gap-2 w-full px-4 py-3 bg-white/[0.04] hover:bg-white/[0.07] text-[#D4D4D4] text-sm font-semibold rounded-[6px] transition-colors border border-dashed border-[#18181B]/15"
          >
            <Plus className="h-4 w-4" />
            New Recurring Rule
          </button>

          {recurringRules.length === 0 ? (
            <div className="py-12 text-center">
              <Repeat className="h-8 w-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#888888]">
                No recurring rules
              </p>
              <p className="text-xs text-[#888888] mt-1">
                Create a rule to auto-generate jobs
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recurringRules.map((rule) => {
                const clientName = rule.clients
                  ? `${rule.clients.first_name} ${rule.clients.last_name}`
                  : "Unknown";
                const freqLabel = rule.frequency === "custom"
                  ? `Every ${rule.custom_interval_days} days`
                  : rule.frequency.charAt(0).toUpperCase() + rule.frequency.slice(1);

                return (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-[6px] border transition-colors ${
                      rule.is_active
                        ? "bg-white border-[#2C2C2C]"
                        : "bg-gray-50 border-[#252525] opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[13px] font-semibold text-[#D4D4D4]">
                          {clientName}
                        </p>
                        <p className="text-[11px] text-[#888888] mt-0.5">
                          {freqLabel} &middot; {rule.service_type || "Cleaning"} &middot; {rule.price != null ? `$${rule.price}` : "No price"}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleRuleActive(rule)}
                        className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                          rule.is_active
                            ? "bg-[#34C759]/10 text-green-600"
                            : "bg-[#2A2A2A] text-[#888888]"
                        }`}
                      >
                        {rule.is_active ? "Active" : "Paused"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => generateJobs(rule)}
                        disabled={!rule.is_active || recGenerating === rule.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-[#252525] border border-[#3A3A3A] text-[#D4D4D4] rounded-[6px] hover:bg-[#2E2E2E] disabled:opacity-40 transition-colors"
                      >
                        {recGenerating === rule.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Calendar className="h-3 w-3" />
                        )}
                        Generate Jobs
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-1.5 text-[#555555] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SlidePanel>

      {/* ── New Recurring Rule Panel ───────────────────────────── */}
      <SlidePanel
        open={recurringFormOpen}
        onClose={() => setRecurringFormOpen(false)}
        title="New Recurring Rule"
        subtitle="Set up a repeating cleaning schedule"
        footer={
          <FormActions>
            <SecondaryButton onClick={() => setRecurringFormOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton loading={recSaving} onClick={handleCreateRule}>
              Create Rule
            </PrimaryButton>
          </FormActions>
        }
      >
        <div className="px-6 py-5 space-y-6">
          <FormSection label="Client & Location">
            <FormField label="Client" required>
              <FormSelect
                value={recClientId}
                onChange={(e) => { setRecClientId(e.target.value); setRecAddressId(""); }}
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </FormSelect>
            </FormField>
            <FormField label="Address">
              <FormSelect
                value={recAddressId}
                onChange={(e) => setRecAddressId(e.target.value)}
                disabled={!recClientId}
              >
                <option value="">
                  {recClientId
                    ? (clients.find(c => c.id === recClientId)?.addresses ?? []).length === 0
                      ? "No addresses on file"
                      : "Select an address..."
                    : "Select a client first"}
                </option>
                {(clients.find(c => c.id === recClientId)?.addresses ?? []).map((a) => (
                  <option key={a.id} value={a.id}>{formatAddress(a)}</option>
                ))}
              </FormSelect>
            </FormField>
          </FormSection>

          <FormSection label="Frequency">
            <FormField label="Repeat" required>
              <FormSelect
                value={recFrequency}
                onChange={(e) => setRecFrequency(e.target.value as RecurringRule["frequency"])}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Every 2 Weeks</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Interval</option>
              </FormSelect>
            </FormField>
            {recFrequency === "custom" && (
              <FormField label="Interval (days)">
                <FormInput
                  type="number"
                  min="1"
                  value={recCustomDays}
                  onChange={(e) => setRecCustomDays(e.target.value)}
                  placeholder="7"
                />
              </FormField>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date" required>
                <FormInput
                  type="date"
                  value={recStartDate}
                  onChange={(e) => setRecStartDate(e.target.value)}
                />
              </FormField>
              <FormField label="End Date">
                <FormInput
                  type="date"
                  value={recEndDate}
                  onChange={(e) => setRecEndDate(e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection label="Job Details">
            <FormField label="Service Type">
              <FormSelect
                value={recServiceType}
                onChange={(e) => setRecServiceType(e.target.value)}
              >
                <option value="">Select a service...</option>
                {SERVICE_TYPES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </FormSelect>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Time">
                <FormInput
                  type="time"
                  value={recStartTime}
                  onChange={(e) => setRecStartTime(e.target.value)}
                />
              </FormField>
              <FormField label="Duration">
                <FormSelect
                  value={recDuration}
                  onChange={(e) => setRecDuration(e.target.value)}
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </FormSelect>
              </FormField>
            </div>
            <FormField label="Price per Job">
              <FormInput
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={recPrice}
                onChange={(e) => setRecPrice(e.target.value)}
              />
            </FormField>
          </FormSection>
        </div>
      </SlidePanel>
    </div>
  );
}
