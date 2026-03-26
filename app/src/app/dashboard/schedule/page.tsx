"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Pencil,
  CheckCircle2,
  XCircle,
  PlayCircle,
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
import { SERVICE_TYPES, DEFAULT_SERVICE_PRICES } from "@/lib/types";
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
    bg: "bg-[var(--mh-surface-raised)]",
    border: "border-[var(--mh-border-strong)]",
    text: "text-[var(--mh-text-subtle)]",
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
  const [viewMode, setViewMode] = useState<"week" | "day" | "list" | "month">("week");
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [jobStatusFilter, setJobStatusFilter] = useState<Job["status"] | "all">("all");
  const [monthOffset, setMonthOffset] = useState(0);
  const [monthJobs, setMonthJobs] = useState<Job[]>([]);

  /* Service pricing defaults (loaded from user settings) */
  const servicePricesRef = useRef<Record<string, number>>({});
  const defaultRateRef = useRef<number>(0);

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
  /* Recurring option in job form */
  const [formIsRecurring, setFormIsRecurring] = useState(false);
  const [formRecFrequency, setFormRecFrequency] = useState<"weekly" | "biweekly" | "monthly" | "twice_weekly" | "custom">("weekly");
  const [formRecCustomDays, setFormRecCustomDays] = useState("14");
  const [formRecEndDate, setFormRecEndDate] = useState("");

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

  /* Auto-fill price when service type is selected (create mode only) */
  useEffect(() => {
    if (formMode !== "create" || !formServiceType) return;
    const typePrice = servicePricesRef.current[formServiceType];
    if (typePrice != null && typePrice > 0) {
      setFormPrice(String(typePrice));
    } else if (defaultRateRef.current > 0) {
      setFormPrice(String(defaultRateRef.current));
    } else {
      const defaultPrice = DEFAULT_SERVICE_PRICES[formServiceType];
      if (defaultPrice) setFormPrice(String(defaultPrice));
    }
  }, [formServiceType, formMode]);

  /* Auto-fill price for recurring rule when service type is selected */
  useEffect(() => {
    if (!recServiceType) return;
    const typePrice = servicePricesRef.current[recServiceType];
    if (typePrice != null && typePrice > 0) {
      setRecPrice(String(typePrice));
    } else if (defaultRateRef.current > 0) {
      setRecPrice(String(defaultRateRef.current));
    } else {
      const defaultPrice = DEFAULT_SERVICE_PRICES[recServiceType];
      if (defaultPrice) setRecPrice(String(defaultPrice));
    }
  }, [recServiceType]);

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

  // Load service pricing defaults from user settings
  useEffect(() => {
    async function loadPricing() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("users").select("settings").eq("id", user.id).single();
      const biz = (((data?.settings || {}) as Record<string, unknown>).business || {}) as Record<string, unknown>;
      defaultRateRef.current = Number(biz.default_rate) || 0;
      servicePricesRef.current = (biz.service_type_prices || {}) as Record<string, number>;
    }
    loadPricing();
  }, [supabase]);

  // Auto-open form when navigated with clientId or action=new param
  useEffect(() => {
    const clientIdParam = searchParams.get("clientId");
    const actionParam = searchParams.get("action");
    if (actionParam === "new" || (clientIdParam && clients.length > 0)) {
      if (clientIdParam) setFormClientId(clientIdParam);
      setFormOpen(true);
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

  const filteredJobsByDay = useMemo(() => {
    const filtered = jobStatusFilter === "all" ? jobs : jobs.filter(j => j.status === jobStatusFilter);
    const map: Record<number, Job[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];
    for (const job of filtered) {
      const [y, m, d] = job.scheduled_date.split("-").map(Number);
      const jobDate = new Date(y, m - 1, d);
      const idx = weekDays.findIndex((wd) => isSameDay(wd, jobDate));
      if (idx >= 0) map[idx].push(job);
    }
    return map;
  }, [jobs, jobStatusFilter, weekDays]);

  const selectedDayJobs = useMemo(() => {
    const filtered = jobStatusFilter === "all" ? jobs : jobs.filter(j => j.status === jobStatusFilter);
    return filtered
      .filter(j => {
        const [y, m, d] = j.scheduled_date.split("-").map(Number);
        return isSameDay(new Date(y, m - 1, d), selectedDay);
      })
      .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
  }, [jobs, jobStatusFilter, selectedDay]);

  const listViewJobs = useMemo(() => {
    const filtered = jobStatusFilter === "all" ? jobs : jobs.filter(j => j.status === jobStatusFilter);
    return [...filtered].sort((a, b) => {
      if (a.scheduled_date !== b.scheduled_date) return a.scheduled_date.localeCompare(b.scheduled_date);
      return (a.start_time || "").localeCompare(b.start_time || "");
    });
  }, [jobs, jobStatusFilter]);

  // Month view
  const monthStart = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [today, monthOffset]);

  const monthGrid = useMemo(() => {
    const firstCell = getMonday(monthStart);
    const grid: Date[][] = [];
    let cur = new Date(firstCell);
    for (let w = 0; w < 6; w++) {
      const row: Date[] = [];
      for (let d = 0; d < 7; d++) {
        row.push(new Date(cur));
        cur = addDays(cur, 1);
      }
      grid.push(row);
    }
    return grid;
  }, [monthStart]);

  const filteredMonthJobs = useMemo(() => {
    if (jobStatusFilter === "all") return monthJobs;
    return monthJobs.filter(j => j.status === jobStatusFilter);
  }, [monthJobs, jobStatusFilter]);

  const monthJobsByDate = useMemo(() => {
    const map: Record<string, Job[]> = {};
    for (const job of filteredMonthJobs) {
      if (!map[job.scheduled_date]) map[job.scheduled_date] = [];
      map[job.scheduled_date].push(job);
    }
    return map;
  }, [filteredMonthJobs]);

  const fetchMonthJobs = useCallback(async () => {
    const gridStart = monthGrid[0]?.[0];
    const gridEnd = monthGrid[5]?.[6];
    if (!gridStart || !gridEnd) return;
    const { data } = await supabase
      .from("jobs")
      .select("*, clients(*)")
      .gte("scheduled_date", formatDate(gridStart))
      .lte("scheduled_date", formatDate(gridEnd))
      .order("start_time", { ascending: true });
    setMonthJobs((data as Job[]) ?? []);
  }, [supabase, monthGrid]);

  useEffect(() => {
    if (viewMode === "month") fetchMonthJobs();
  }, [viewMode, fetchMonthJobs]);

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
    setFormIsRecurring(false);
    setFormRecFrequency("weekly");
    setFormRecCustomDays("14");
    setFormRecEndDate("");
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
    // Require address if client has addresses on file
    if (!formAddressId && selectedClientAddresses.length > 0) {
      toast.error("Please select a service address");
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); toast.error("Not authenticated"); return; }

    if (formIsRecurring) {
      // Create recurring rule
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rulePayload: Record<string, any> = {
        user_id: user.id,
        client_id: formClientId,
        frequency: formRecFrequency === "twice_weekly" ? "custom" : formRecFrequency,
        custom_interval_days: formRecFrequency === "twice_weekly" ? 3 : formRecFrequency === "custom" ? parseInt(formRecCustomDays) || 14 : null,
        start_date: formDate,
        end_date: formRecEndDate || null,
        service_type: formServiceType || null,
        duration_minutes: parseInt(formDuration) || 60,
        price: formPrice ? parseFloat(formPrice) : null,
      };
      if (formAddressId) rulePayload.address_id = formAddressId;
      if (formStartTime) rulePayload.start_time = formStartTime;

      const { data: newRule, error: ruleError } = await supabase
        .from("recurring_rules")
        .insert(rulePayload)
        .select()
        .single();

      if (ruleError) {
        setSaving(false);
        toast.error("Failed to create recurring schedule");
        return;
      }

      // Create the first job linked to the rule
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstJobPayload: Record<string, any> = {
        user_id: user.id,
        client_id: formClientId,
        recurring_rule_id: newRule.id,
        scheduled_date: formDate,
        duration_minutes: parseInt(formDuration) || 60,
        service_type: formServiceType || null,
        price: formPrice ? parseFloat(formPrice) : null,
        notes: formNotes || null,
        status: "scheduled",
      };
      if (formAddressId) firstJobPayload.address_id = formAddressId;
      if (formStartTime) firstJobPayload.start_time = formStartTime;

      await supabase.from("jobs").insert(firstJobPayload);

      // Generate the next few occurrences so they appear on future weeks
      const nextDates = getNextOccurrences(newRule, 8).slice(1); // skip first (already created)
      if (nextDates.length > 0) {
        const moreJobs = nextDates.map((d) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const j: Record<string, any> = {
            user_id: user.id,
            client_id: formClientId,
            recurring_rule_id: newRule.id,
            scheduled_date: d,
            duration_minutes: parseInt(formDuration) || 60,
            service_type: formServiceType || null,
            price: formPrice ? parseFloat(formPrice) : null,
            status: "scheduled" as const,
          };
          if (formAddressId) j.address_id = formAddressId;
          if (formStartTime) j.start_time = formStartTime;
          return j;
        });
        await supabase.from("jobs").insert(moreJobs);
      }

      setSaving(false);
      toast.success("Recurring schedule created");
    } else {
      // Single job
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jobPayload: Record<string, any> = {
        user_id: user.id,
        client_id: formClientId,
        scheduled_date: formDate,
        start_time: formStartTime || null,
        duration_minutes: parseInt(formDuration) || 60,
        service_type: formServiceType || null,
        price: formPrice ? parseFloat(formPrice) : null,
        notes: formNotes || null,
        status: "scheduled",
      };
      if (formAddressId) jobPayload.address_id = formAddressId;

      const { error } = await supabase.from("jobs").insert(jobPayload);
      setSaving(false);

      if (error) {
        console.error("Failed to create job:", error);
        if (error.message?.includes("address_id") || error.message?.includes("violates not-null")) {
          toast.error("Please select a service address for this job");
        } else {
          toast.error("Failed to create job");
        }
        return;
      }
      toast.success("Job scheduled");
    }

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = {
      client_id: formClientId,
      scheduled_date: formDate,
      start_time: formStartTime || null,
      duration_minutes: parseInt(formDuration) || 60,
      service_type: formServiceType || null,
      price: formPrice ? parseFloat(formPrice) : null,
      notes: formNotes || null,
    };
    if (formAddressId) updatePayload.address_id = formAddressId;
    const { error } = await supabase
      .from("jobs")
      .update(updatePayload)
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rulePayload: Record<string, any> = {
      user_id: ruleUser.id,
      client_id: recClientId,
      frequency: recFrequency,
      custom_interval_days: recFrequency === "custom" ? parseInt(recCustomDays) || 7 : null,
      start_date: recStartDate,
      end_date: recEndDate || null,
      service_type: recServiceType || null,
      duration_minutes: parseInt(recDuration) || 120,
      price: recPrice ? parseFloat(recPrice) : null,
      is_active: true,
    };
    // Only include address_id if selected (column may require non-null in older schema)
    if (recAddressId) rulePayload.address_id = recAddressId;
    // start_time column added in migration — include only if column exists (silently ignored if not)
    if (recStartTime) rulePayload.start_time = recStartTime;

    const { data: newRule, error } = await supabase
      .from("recurring_rules").insert(rulePayload).select().single();
    setRecSaving(false);
    if (error) {
      console.error("Failed to create recurring rule:", error);
      if (error.message?.includes("address_id") || error.message?.includes("violates not-null")) {
        toast.error("Please select a service address for this recurring rule");
      } else {
        toast.error("Failed to create recurring rule");
      }
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

    const jobsToInsert = newDates.map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const job: Record<string, any> = {
        user_id: rule.user_id,
        client_id: rule.client_id,
        recurring_rule_id: rule.id,
        scheduled_date: d,
        duration_minutes: rule.duration_minutes || 120,
        service_type: rule.service_type || null,
        price: rule.price,
        status: "scheduled" as const,
      };
      if (rule.address_id) job.address_id = rule.address_id;
      if (rule.start_time) job.start_time = rule.start_time;
      return job;
    });

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
          "bg-[var(--mh-surface-raised)] hover:bg-[var(--mh-hover-overlay)] text-[var(--mh-text-muted)] border border-[var(--mh-border)]",
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] md:text-[21px] font-bold md:font-semibold text-[var(--mh-text)] tracking-[-0.03em] md:tracking-[-0.02em]">Schedule</h1>
          <p className="hidden md:block text-sm text-[var(--mh-text-muted)] mt-1">Manage your cleaning appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setRecurringOpen(true); fetchRecurringRules(); }}
            className="flex items-center gap-1.5 h-9 px-3 md:px-3.5 bg-[var(--mh-surface-raised)] hover:bg-[var(--mh-hover-overlay)] border border-[var(--mh-border)] text-[var(--mh-text)] text-[13px] font-semibold rounded-[10px] md:rounded-[8px] transition-colors"
          >
            <Repeat className="h-4 w-4" />
            <span className="hidden sm:inline">Recurring</span>
            <span className="sm:hidden">Rules</span>
          </button>
          <button
            onClick={openNewJobForm}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold rounded-[8px] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Job
          </button>
        </div>
      </div>

      {/* ── MOBILE SCHEDULE VIEW ──────────────────────────────── */}
      <div className="md:hidden space-y-3">

        {/* Status filter — horizontal scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {([
            { key: "all" as const, label: "All" },
            { key: "scheduled" as const, label: "Scheduled" },
            { key: "in_progress" as const, label: "In Progress" },
            { key: "completed" as const, label: "Completed" },
            { key: "cancelled" as const, label: "Cancelled" },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setJobStatusFilter(f.key)}
              className={`shrink-0 px-3 py-1.5 text-[12px] font-semibold rounded-full border transition-colors ${
                jobStatusFilter === f.key
                  ? "bg-[#0071E3] border-[#0071E3] text-white"
                  : "bg-[var(--mh-surface)] border-[var(--mh-border)] text-[var(--mh-text-muted)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Week day strip */}
        <div className="bg-[var(--mh-surface)] rounded-[12px] border border-[var(--mh-border)] overflow-hidden">
          {/* Week navigation row */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--mh-divider)]">
            <button
              onClick={() => setWeekOffset((o) => o - 1)}
              className="p-1.5 rounded-[6px] hover:bg-[var(--mh-surface-raised)] text-[var(--mh-text-muted)] active:opacity-70 transition-opacity"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[13px] font-bold text-[var(--mh-text)] tracking-[-0.02em]">
              {formatWeekLabel(weekStart)}
            </span>
            <button
              onClick={() => setWeekOffset((o) => o + 1)}
              className="p-1.5 rounded-[6px] hover:bg-[var(--mh-surface-raised)] text-[var(--mh-text-muted)] active:opacity-70 transition-opacity"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {/* Day strip */}
          <div className="grid grid-cols-7 px-2 py-2 gap-1">
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDay);
              const dayJobCount = (jobsByDay[i] ?? []).filter(
                (j) => jobStatusFilter === "all" || j.status === jobStatusFilter
              ).length;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day)}
                  className="flex flex-col items-center py-1.5 rounded-[10px] transition-colors active:opacity-70"
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                    isSelected ? "text-[#0071E3]" : "text-[var(--mh-text-faint)]"
                  }`}>
                    {DAY_NAMES[i]}
                  </span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold leading-none ${
                    isSelected
                      ? "bg-[#0071E3] text-white"
                      : isToday
                      ? "text-[#0071E3] ring-1.5 ring-[#0071E3]/50"
                      : "text-[var(--mh-text)]"
                  }`}>
                    {day.getDate()}
                  </span>
                  <div className="h-1.5 mt-1.5 flex items-center justify-center">
                    {dayJobCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day label */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[14px] font-bold text-[var(--mh-text)] tracking-[-0.02em]">
            {isSameDay(selectedDay, today)
              ? "Today"
              : selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
          {selectedDayJobs.length > 0 && (
            <span className="text-[12px] text-[var(--mh-text-muted)]">
              {selectedDayJobs.length} job{selectedDayJobs.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Day jobs list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 text-[var(--mh-text-muted)] animate-spin" />
          </div>
        ) : selectedDayJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[var(--mh-surface)] rounded-[12px] border border-[var(--mh-border)]">
            <div className="h-12 w-12 rounded-full bg-[var(--mh-surface-raised)] flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-[var(--mh-text-faint)]" />
            </div>
            <p className="text-[14px] font-semibold text-[var(--mh-text)] mb-1">No jobs today</p>
            <p className="text-[12px] text-[var(--mh-text-muted)] mb-4">Tap + New Job to schedule one</p>
            <button
              onClick={openNewJobForm}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0071E3] text-white text-[13px] font-semibold rounded-[10px] transition-colors active:opacity-80"
            >
              <Plus className="h-4 w-4" />
              New Job
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayJobs.map((job) => {
              const colors = STATUS_COLORS[job.status];
              const clientName = job.clients
                ? `${job.clients.first_name} ${job.clients.last_name}`
                : "Unknown Client";
              const timeRange = formatTimeRange(job.start_time, job.duration_minutes);
              return (
                <button
                  key={job.id}
                  onClick={() => { setSelectedJob(job); setDetailOpen(true); }}
                  className="w-full flex items-center gap-3.5 p-4 bg-[var(--mh-surface)] rounded-[12px] border border-[var(--mh-border)] text-left active:opacity-80 transition-opacity"
                >
                  <div className={`w-1 self-stretch rounded-full ${colors.border} border-l-[3px]`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-[var(--mh-text)] tracking-[-0.02em] truncate">{clientName}</p>
                    <p className="text-[12px] text-[var(--mh-text-muted)] mt-0.5 truncate">
                      {job.service_type || "Service"}
                      {timeRange ? ` · ${timeRange}` : ""}
                    </p>
                    <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                      {job.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    {job.price != null && (
                      <p className="text-[16px] font-bold text-[var(--mh-text)] tracking-[-0.02em]">
                        ${Number(job.price).toLocaleString()}
                      </p>
                    )}
                    <ChevronRight className="h-4 w-4 text-[var(--mh-text-faint)] ml-auto mt-1" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DESKTOP SCHEDULE VIEW ─────────────────────────────── */}
      <div className="hidden md:block space-y-6">

      {/* Navigation bar */}
      <div className="bg-[var(--mh-surface)] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[var(--mh-border)] px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (viewMode === "day") setSelectedDay((d) => addDays(d, -1));
                else if (viewMode === "month") setMonthOffset((o) => o - 1);
                else setWeekOffset((o) => o - 1);
              }}
              className="p-1.5 rounded-[6px] hover:bg-[var(--mh-surface-raised)] text-[var(--mh-text-muted)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (viewMode === "day") setSelectedDay((d) => addDays(d, 1));
                else if (viewMode === "month") setMonthOffset((o) => o + 1);
                else setWeekOffset((o) => o + 1);
              }}
              className="p-1.5 rounded-[6px] hover:bg-[var(--mh-surface-raised)] text-[var(--mh-text-muted)] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-[var(--mh-text)] ml-1">
              {viewMode === "day"
                ? selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                : viewMode === "month"
                ? monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : formatWeekLabel(weekStart)}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (viewMode === "day") setSelectedDay(today);
                else if (viewMode === "month") setMonthOffset(0);
                else setWeekOffset(0);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-[var(--mh-text)] bg-[var(--mh-surface-raised)] hover:bg-[var(--mh-hover-overlay)] border border-[var(--mh-border)] rounded-[6px] transition-colors"
            >
              Today
            </button>
            <div className="flex items-center gap-0.5 bg-[var(--mh-surface-raised)] rounded-[6px] p-0.5 border border-[var(--mh-border)]">
              {(["week", "day", "list", "month"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-[12px] font-semibold rounded-[4px] transition-colors capitalize ${
                    viewMode === mode
                      ? "bg-[var(--mh-surface)] text-[var(--mh-text)] shadow-sm"
                      : "text-[var(--mh-text-muted)] hover:text-[var(--mh-text)]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {([
            { key: "all" as const, label: "All" },
            { key: "scheduled" as const, label: "Scheduled" },
            { key: "in_progress" as const, label: "In Progress" },
            { key: "completed" as const, label: "Completed" },
            { key: "cancelled" as const, label: "Cancelled" },
          ]).map((f) => (
            <button
              key={f.key}
              onClick={() => setJobStatusFilter(f.key)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
                jobStatusFilter === f.key
                  ? "bg-[#0071E3] border-[#0071E3] text-white"
                  : "bg-[var(--mh-surface-raised)] border-[var(--mh-border)] text-[var(--mh-text-muted)] hover:text-[var(--mh-text)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar / List view */}
      <div className="bg-[var(--mh-surface)] rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-[var(--mh-border)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-[var(--mh-text-muted)] text-sm">
            Loading...
          </div>
        ) : viewMode === "month" ? (
          /* ── Month View ── */
          <div>
            {/* Day-of-week header */}
            <div className="grid grid-cols-7 border-b border-[var(--mh-divider)]">
              {DAY_NAMES.map((name) => (
                <div key={name} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--mh-text-muted)]">
                  {name}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-rows-6">
              {monthGrid.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 border-b border-[var(--mh-divider)] last:border-b-0">
                  {week.map((day, di) => {
                    const dateStr = formatDate(day);
                    const dayJobs = monthJobsByDate[dateStr] || [];
                    const isToday = isSameDay(day, today);
                    const isCurrentMonth = day.getMonth() === monthStart.getMonth();
                    const isSelected = isSameDay(day, selectedDay);
                    return (
                      <button
                        key={di}
                        onClick={() => { setSelectedDay(day); setViewMode("day"); }}
                        className={`min-h-[90px] p-2 text-left border-r border-[var(--mh-divider)] last:border-r-0 hover:bg-[var(--mh-hover-overlay)] transition-colors flex flex-col gap-1 ${
                          !isCurrentMonth ? "opacity-40" : ""
                        }`}
                      >
                        <span className={`text-[12px] font-bold leading-none w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? "bg-[#0071E3] text-white"
                            : isSelected
                            ? "bg-[var(--mh-surface-raised)] text-[var(--mh-text)]"
                            : "text-[var(--mh-text-muted)]"
                        }`}>
                          {day.getDate()}
                        </span>
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          {dayJobs.slice(0, 3).map((job) => {
                            const colors = STATUS_COLORS[job.status];
                            const clientName = job.clients
                              ? `${job.clients.first_name} ${job.clients.last_name}`
                              : "Job";
                            return (
                              <div
                                key={job.id}
                                onClick={(e) => { e.stopPropagation(); setSelectedJob(job); setDetailOpen(true); }}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate ${colors.bg} ${colors.text} border-l-2 ${colors.border} cursor-pointer`}
                              >
                                {clientName}
                              </div>
                            );
                          })}
                          {dayJobs.length > 3 && (
                            <span className="text-[10px] text-[var(--mh-text-subtle)] pl-1">
                              +{dayJobs.length - 3} more
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === "list" ? (
          /* ── List View ── */
          <div className="divide-y divide-[var(--mh-divider)]">
            {listViewJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <Calendar className="h-8 w-8 text-[var(--mh-text-faint)] mb-3" />
                <p className="text-sm font-semibold text-[var(--mh-text)]">No jobs this week</p>
                <p className="text-xs text-[var(--mh-text-muted)] mt-1 mb-4">Schedule a job to see it appear here</p>
                <button onClick={openNewJobForm} className="flex items-center gap-2 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED]/90 text-white text-sm font-semibold rounded-[6px] transition-colors">
                  <Plus className="h-4 w-4" />
                  New Job
                </button>
              </div>
            ) : Object.entries(
                listViewJobs.reduce<Record<string, Job[]>>((acc, job) => {
                  if (!acc[job.scheduled_date]) acc[job.scheduled_date] = [];
                  acc[job.scheduled_date].push(job);
                  return acc;
                }, {})
              ).map(([date, dayJobs]) => {
                const d = new Date(date + "T00:00:00");
                const isToday = isSameDay(d, today);
                return (
                  <div key={date}>
                    <div className={`px-5 py-2 text-[11px] font-bold tracking-[0.06em] uppercase bg-[var(--mh-surface-raised)]/50 ${isToday ? "text-[#0071E3]" : "text-[var(--mh-text-subtle)]"}`}>
                      {isToday ? "Today — " : ""}{d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    </div>
                    {dayJobs.map((job) => {
                      const colors = STATUS_COLORS[job.status];
                      const clientName = job.clients ? `${job.clients.first_name} ${job.clients.last_name}` : "Unknown";
                      return (
                        <button
                          key={job.id}
                          onClick={() => { setSelectedJob(job); setDetailOpen(true); }}
                          className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--mh-hover-overlay)] transition-colors text-left"
                        >
                          <div className={`w-1 self-stretch rounded-full ${colors.bg} ${colors.border} border-l-[3px]`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[var(--mh-text)] truncate">{clientName}</p>
                            <p className="text-[11px] text-[var(--mh-text-muted)] mt-0.5">
                              {job.service_type || "Service"}
                              {job.start_time ? ` · ${formatTimeDisplay(job.start_time)}` : ""}
                              {job.duration_minutes ? ` · ${job.duration_minutes >= 60 ? `${Math.floor(job.duration_minutes / 60)}h${job.duration_minutes % 60 ? ` ${job.duration_minutes % 60}m` : ""}` : `${job.duration_minutes}m`}` : ""}
                            </p>
                          </div>
                          <div className="text-right shrink-0 space-y-0.5">
                            {job.price != null && (
                              <p className="text-[13px] font-bold text-[var(--mh-text)]">${Number(job.price).toLocaleString()}</p>
                            )}
                            <span className={`text-[10px] font-semibold ${colors.text}`}>
                              {job.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        ) : (
          /* ── Week / Day View ── */
          <div className="overflow-x-auto">
            <div style={{ minWidth: viewMode === "day" ? "320px" : "640px" }}>
              {/* Day headers — week view only (clickable to switch to day view) */}
              {viewMode === "week" && (
                <div className="grid border-b border-[var(--mh-divider)]" style={{ gridTemplateColumns: "52px repeat(7, 1fr)" }}>
                  <div className="h-14" />
                  {weekDays.map((day, i) => {
                    const isToday = isSameDay(day, today);
                    return (
                      <button
                        key={i}
                        onClick={() => { setSelectedDay(day); setViewMode("day"); }}
                        className="flex flex-col items-center justify-center h-14 border-l border-[var(--mh-divider)] hover:bg-[var(--mh-hover-overlay)] transition-colors"
                        title={`View ${DAY_NAMES[i]} ${day.getDate()}`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-[#0071E3]" : "text-[var(--mh-text-muted)]"}`}>
                          {DAY_NAMES[i]}
                        </span>
                        <span className={`text-sm font-bold mt-0.5 leading-none ${isToday ? "bg-[#0071E3] text-white w-7 h-7 rounded-full flex items-center justify-center" : "text-[var(--mh-text)]"}`}>
                          {day.getDate()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Day header — day view */}
              {viewMode === "day" && (
                <div className="flex items-center justify-center h-14 border-b border-[var(--mh-divider)]">
                  <span className={`text-sm font-semibold ${isSameDay(selectedDay, today) ? "text-[#0071E3]" : "text-[var(--mh-text)]"}`}>
                    {selectedDay.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </span>
                </div>
              )}

              {/* Time grid body */}
              <div className="relative">
                {/* Empty state overlay */}
                {(viewMode === "week" ? jobs : selectedDayJobs).length === 0 && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--mh-sidebar)]/80 backdrop-blur-[1px]">
                    <div className="w-12 h-12 rounded-[6px] bg-[var(--mh-surface-raised)] flex items-center justify-center mb-3">
                      <Calendar className="h-6 w-6 text-[var(--mh-text-muted)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--mh-text)]">
                      {viewMode === "day" ? "No jobs this day" : "No jobs this week"}
                    </p>
                    <p className="text-xs text-[var(--mh-text-muted)] mt-1 mb-4">Schedule a job to see it appear here</p>
                    <button onClick={openNewJobForm} className="flex items-center gap-2 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED]/90 text-white text-sm font-semibold rounded-[6px] transition-colors">
                      <Plus className="h-4 w-4" />
                      New Job
                    </button>
                  </div>
                )}

                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: viewMode === "day" ? "52px 1fr" : "52px repeat(7, 1fr)",
                    height: `${TOTAL_HOURS * HOUR_HEIGHT}px`,
                  }}
                >
                  {/* Time labels column */}
                  <div className="relative">
                    {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                      <div
                        key={i}
                        className="absolute right-2 text-[10px] text-[var(--mh-text-muted)] font-medium leading-none"
                        style={{ top: `${i * HOUR_HEIGHT - 5}px` }}
                      >
                        {((START_HOUR + i) % 12 || 12) + (START_HOUR + i >= 12 ? "p" : "a")}
                      </div>
                    ))}
                  </div>

                  {viewMode === "week" ? (
                    weekDays.map((_, dayIndex) => (
                      <div key={dayIndex} className="relative border-l border-[var(--mh-divider)]">
                        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                          <div key={i} className="absolute left-0 right-0 border-t border-[var(--mh-divider)]" style={{ top: `${i * HOUR_HEIGHT}px` }} />
                        ))}
                        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                          <div key={`hover-${i}`} className="absolute left-0 right-0 hover:bg-[var(--mh-hover-overlay)] transition-colors" style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }} />
                        ))}
                        {(filteredJobsByDay[dayIndex] ?? []).map((job) => renderJobCard(job, dayIndex))}
                      </div>
                    ))
                  ) : (
                    <div className="relative border-l border-[var(--mh-divider)]">
                      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                        <div key={i} className="absolute left-0 right-0 border-t border-[var(--mh-divider)]" style={{ top: `${i * HOUR_HEIGHT}px` }} />
                      ))}
                      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                        <div key={`hover-${i}`} className="absolute left-0 right-0 hover:bg-[var(--mh-hover-overlay)] transition-colors" style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }} />
                      ))}
                      {selectedDayJobs.map((job) => renderJobCard(job, 0))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      </div>
      {/* ── end DESKTOP SCHEDULE VIEW ── */}

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
          <div className="flex flex-col min-h-0">
            {/* ── Header strip: status + badges ── */}
            <div className="px-6 pt-5 pb-4 border-b border-[var(--mh-divider)]">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    STATUS_COLORS[selectedJob.status].bg
                  } ${STATUS_COLORS[selectedJob.status].text}`}
                >
                  {selectedJob.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
                {selectedJob.recurring_rule_id && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] text-[var(--mh-text-muted)]">
                    <Repeat className="h-2.5 w-2.5" strokeWidth={2} />
                    Recurring
                  </span>
                )}
              </div>
              {selectedJob.service_type && (
                <p className="text-[15px] font-bold text-[var(--mh-text)] mt-2 leading-tight">
                  {selectedJob.service_type}
                </p>
              )}
              {selectedJob.price != null && (
                <p className="text-[22px] font-bold text-[var(--mh-text)] mt-1 tracking-tight">
                  ${Number(selectedJob.price).toFixed(2)}
                </p>
              )}
            </div>

            {/* ── Details rows ── */}
            <div className="px-6 py-4 flex-1 overflow-y-auto">
              <div className="divide-y divide-[var(--mh-divider)]">
                {/* Client */}
                <div className="flex items-center gap-3 py-3">
                  <div className="h-7 w-7 rounded-[5px] bg-[var(--mh-surface-raised)] flex items-center justify-center shrink-0">
                    <User className="h-3.5 w-3.5 text-[var(--mh-text-muted)]" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[var(--mh-text-subtle)] font-medium uppercase tracking-wide">Client</p>
                    <p className="text-[13px] font-semibold text-[var(--mh-text)] mt-0.5">
                      {selectedJob.clients
                        ? `${selectedJob.clients.first_name} ${selectedJob.clients.last_name}`
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3 py-3">
                  <div className="h-7 w-7 rounded-[5px] bg-[var(--mh-surface-raised)] flex items-center justify-center shrink-0">
                    <Calendar className="h-3.5 w-3.5 text-[var(--mh-text-muted)]" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[var(--mh-text-subtle)] font-medium uppercase tracking-wide">Date</p>
                    <p className="text-[13px] font-semibold text-[var(--mh-text)] mt-0.5">
                      {new Date(selectedJob.scheduled_date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Time */}
                {selectedJob.start_time && (
                  <div className="flex items-center gap-3 py-3">
                    <div className="h-7 w-7 rounded-[5px] bg-[var(--mh-surface-raised)] flex items-center justify-center shrink-0">
                      <Clock className="h-3.5 w-3.5 text-[var(--mh-text-muted)]" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[var(--mh-text-subtle)] font-medium uppercase tracking-wide">Time</p>
                      <p className="text-[13px] font-semibold text-[var(--mh-text)] mt-0.5">
                        {formatTimeRange(selectedJob.start_time, selectedJob.duration_minutes)}
                      </p>
                      {selectedJob.duration_minutes && (
                        <p className="text-[11px] text-[var(--mh-text-muted)] mt-0.5">
                          {selectedJob.duration_minutes >= 60
                            ? `${Math.floor(selectedJob.duration_minutes / 60)}h${selectedJob.duration_minutes % 60 ? ` ${selectedJob.duration_minutes % 60}m` : ""}`
                            : `${selectedJob.duration_minutes}m`} duration
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Address */}
                {selectedJob.addresses && (
                  <div className="flex items-center gap-3 py-3">
                    <div className="h-7 w-7 rounded-[5px] bg-[var(--mh-surface-raised)] flex items-center justify-center shrink-0">
                      <MapPin className="h-3.5 w-3.5 text-[var(--mh-text-muted)]" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[var(--mh-text-subtle)] font-medium uppercase tracking-wide">Address</p>
                      <p className="text-[13px] text-[var(--mh-text)] mt-0.5">{formatAddress(selectedJob.addresses)}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedJob.notes && (
                  <div className="flex items-start gap-3 py-3">
                    <div className="h-7 w-7 rounded-[5px] bg-[var(--mh-surface-raised)] flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="h-3.5 w-3.5 text-[var(--mh-text-muted)]" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[var(--mh-text-subtle)] font-medium uppercase tracking-wide">Notes</p>
                      <p className="text-[13px] text-[var(--mh-text-muted)] mt-0.5 leading-relaxed whitespace-pre-wrap">
                        {selectedJob.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Invoiced notice */}
              {selectedJob.status === "invoiced" && (
                <div className="flex items-center gap-2.5 mt-4 px-3.5 py-3 bg-[#0071E3]/8 border border-[#0071E3]/20 rounded-[6px]">
                  <Receipt className="h-4 w-4 text-[#0071E3] shrink-0" strokeWidth={1.8} />
                  <span className="text-[12px] text-[#0071E3] font-medium">Invoice has been created for this job</span>
                </div>
              )}
            </div>

            {/* ── Actions footer ── */}
            <div className="px-6 py-4 border-t border-[var(--mh-divider)] space-y-3">
              {/* Primary status action */}
              {(() => {
                const job = selectedJob;
                if (job.status === "scheduled") {
                  return (
                    <button
                      onClick={() => handleStatusChange(job, "in_progress")}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF9F0A] hover:bg-amber-500 text-white text-[13px] font-semibold rounded-[6px] transition-colors disabled:opacity-50"
                    >
                      <PlayCircle className="h-4 w-4" strokeWidth={2} />
                      Start Job
                    </button>
                  );
                }
                if (job.status === "in_progress") {
                  return (
                    <button
                      onClick={() => handleStatusChange(job, "completed")}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#34C759] hover:bg-green-500 text-white text-[13px] font-semibold rounded-[6px] transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                      Mark Complete
                    </button>
                  );
                }
                if (job.status === "completed") {
                  return (
                    <button
                      onClick={() => handleCreateInvoiceFromJob(job)}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold rounded-[6px] transition-colors disabled:opacity-50"
                    >
                      <Receipt className="h-4 w-4" strokeWidth={2} />
                      Create Invoice
                    </button>
                  );
                }
                return null;
              })()}

              {/* Secondary actions row */}
              <div className="flex items-center gap-2">
                {selectedJob.status !== "invoiced" && selectedJob.status !== "cancelled" && (
                  <button
                    onClick={() => openEditForm(selectedJob)}
                    className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-[6px] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] text-[var(--mh-text)] hover:bg-[var(--mh-hover-overlay)] transition-colors flex-1 justify-center"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Edit Job
                  </button>
                )}
                {selectedJob.status !== "cancelled" && selectedJob.status !== "invoiced" && (
                  <button
                    onClick={() => handleStatusChange(selectedJob, "cancelled")}
                    disabled={updatingStatus}
                    className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-[6px] bg-[var(--mh-surface-raised)] border border-[var(--mh-border)] text-[var(--mh-text-muted)] hover:bg-[var(--mh-hover-overlay)] transition-colors flex-1 justify-center disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => handleDeleteJob(selectedJob)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-[6px] transition-colors ${
                    deleteConfirm
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "text-red-400 border border-[var(--mh-border)] hover:bg-red-500/10 hover:border-red-500/30"
                  }`}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {deleteConfirm ? "Confirm?" : "Delete"}
                </button>
              </div>
            </div>
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
        <div className="px-4 md:px-6 py-4 md:py-5 space-y-5 md:space-y-6">
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

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
              <FormField label="Date" required>
                <FormInput
                  type="date"
                  className="h-9 px-2 text-[11px]"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </FormField>
              <FormField label="Start Time">
                <FormInput
                  type="time"
                  className="h-9 px-2 text-[11px]"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
              <FormField label="Duration">
                <FormSelect
                  className="h-9 px-2 text-[11px]"
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
                  className="h-9 px-2 text-[11px]"
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

          {formMode === "create" && (
            <FormSection label="Recurring">
              {/* Toggle */}
              <button
                type="button"
                onClick={() => setFormIsRecurring((v) => !v)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-[6px] border transition-colors text-left ${
                  formIsRecurring
                    ? "bg-[#0071E3]/10 border-[#0071E3]/40 text-[#0071E3]"
                    : "bg-transparent border-[var(--mh-border)] text-[var(--mh-text-muted)] hover:bg-[var(--mh-hover-overlay)]"
                }`}
              >
                <Repeat className="h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold">
                    {formIsRecurring ? "Recurring — on" : "Make this recurring"}
                  </p>
                  {!formIsRecurring && (
                    <p className="text-[11px] text-[var(--mh-text-faint)] mt-0.5">
                      Repeat this job on a schedule
                    </p>
                  )}
                </div>
                {/* pill indicator */}
                <div
                  className={`w-8 h-4 rounded-full transition-colors shrink-0 ${
                    formIsRecurring ? "bg-[#0071E3]" : "bg-[var(--mh-border)]"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-white m-0.5 transition-transform ${
                      formIsRecurring ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>

              {formIsRecurring && (
                <div className="space-y-3 mt-1">
                  {/* Frequency chips */}
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.08em] mb-2">
                      Frequency
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { value: "weekly", label: "Every week" },
                          { value: "biweekly", label: "Every 2 weeks" },
                          { value: "monthly", label: "Monthly" },
                          { value: "twice_weekly", label: "Twice a week" },
                          { value: "custom", label: "Custom" },
                        ] as const
                      ).map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFormRecFrequency(value)}
                          className={`px-3 py-1.5 text-[12px] font-semibold rounded-full border transition-colors ${
                            formRecFrequency === value
                              ? "bg-[#0071E3] border-[#0071E3] text-white"
                              : "bg-transparent border-[var(--mh-border)] text-[var(--mh-text-muted)] hover:border-[#0071E3]/50 hover:text-[var(--mh-text)]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom interval input */}
                  {formRecFrequency === "custom" && (
                    <FormField label="Repeat every (days)">
                      <FormInput
                        type="number"
                        min="1"
                        placeholder="14"
                        value={formRecCustomDays}
                        onChange={(e) => setFormRecCustomDays(e.target.value)}
                      />
                    </FormField>
                  )}

                  {/* End date */}
                  <FormField label="End date (optional)">
                    <FormInput
                      type="date"
                      value={formRecEndDate}
                      onChange={(e) => setFormRecEndDate(e.target.value)}
                    />
                  </FormField>
                </div>
              )}
            </FormSection>
          )}
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
        <div className="px-4 md:px-6 py-4 md:py-5 space-y-4 md:space-y-5">
          <button
            onClick={() => { setRecurringFormOpen(true); resetRecurringForm(); }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-transparent hover:bg-[var(--mh-surface-raised)] text-[var(--mh-text)] text-[13px] md:text-sm font-semibold rounded-[10px] md:rounded-[6px] transition-colors border border-dashed border-[var(--mh-border)]"
          >
            <Plus className="h-4 w-4" />
            New Recurring Rule
          </button>

          {recurringRules.length === 0 ? (
            <div className="py-12 text-center">
              <Repeat className="h-8 w-8 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--mh-text-muted)]">
                No recurring rules
              </p>
              <p className="text-xs text-[var(--mh-text-muted)] mt-1">
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
                    className={`p-3.5 md:p-4 rounded-[12px] md:rounded-[6px] border transition-colors ${
                      rule.is_active
                        ? "bg-[var(--mh-surface)] border-[var(--mh-border)]"
                        : "bg-[var(--mh-surface-sunken)] border-[var(--mh-divider)] opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="min-w-0">
                        <p className="text-[14px] md:text-[13px] font-semibold text-[var(--mh-text)] truncate">
                          {clientName}
                        </p>
                        <p className="text-[12px] md:text-[11px] text-[var(--mh-text-muted)] mt-0.5 leading-relaxed">
                          {freqLabel} &middot; {rule.service_type || "Cleaning"} &middot; {rule.price != null ? `$${rule.price}` : "No price"}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleRuleActive(rule)}
                        className={`px-2.5 py-1 text-[11px] md:text-[10px] font-semibold rounded-full transition-colors shrink-0 ${
                          rule.is_active
                            ? "bg-[#34C759]/10 text-green-600"
                            : "bg-[var(--mh-surface-raised)] text-[var(--mh-text-muted)]"
                        }`}
                      >
                        {rule.is_active ? "Active" : "Paused"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => generateJobs(rule)}
                        disabled={!rule.is_active || recGenerating === rule.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 md:py-1.5 text-[12px] md:text-[11px] font-semibold bg-[var(--mh-surface-raised)] border border-[var(--mh-border-strong)] text-[var(--mh-text)] rounded-[8px] md:rounded-[6px] hover:bg-[var(--mh-hover-overlay)] disabled:opacity-40 transition-colors"
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
                        className="h-9 w-9 md:h-auto md:w-auto md:p-1.5 flex items-center justify-center rounded-[8px] md:rounded-none bg-[var(--mh-surface-raised)] md:bg-transparent border border-[var(--mh-border)] md:border-0 text-[var(--mh-text-subtle)] hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
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
          <div className="shrink-0 bg-[var(--mh-surface)] border-t border-[var(--mh-border)] px-4 md:px-6 py-3 md:py-4 flex items-center gap-2.5">
            <SecondaryButton className="flex-1 md:flex-none" onClick={() => setRecurringFormOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton className="flex-1 md:flex-none" loading={recSaving} onClick={handleCreateRule}>
              Create Rule
            </PrimaryButton>
          </div>
        }
      >
        <div className="px-4 md:px-6 py-4 md:py-5 space-y-5 md:space-y-6">
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
            <div className="space-y-3 p-3.5 rounded-[10px] border border-[var(--mh-border)] bg-[var(--mh-surface-sunken)]">
              <p className="text-[11px] font-semibold text-[var(--mh-text-subtle)] uppercase tracking-[0.08em]">
                Repeat
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { value: "weekly", label: "Weekly" },
                    { value: "biweekly", label: "Every 2 Weeks" },
                    { value: "monthly", label: "Monthly" },
                    { value: "custom", label: "Custom" },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRecFrequency(value)}
                    className={`px-3 py-1.5 text-[12px] font-semibold rounded-full border transition-colors ${
                      recFrequency === value
                        ? "bg-[#0071E3] border-[#0071E3] text-white"
                        : "bg-transparent border-[var(--mh-border)] text-[var(--mh-text-muted)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {recFrequency === "custom" && (
              <FormField label="Interval (days)">
                <FormInput
                  type="number"
                  min="1"
                  className="h-9 px-2.5 text-[12px]"
                  value={recCustomDays}
                  onChange={(e) => setRecCustomDays(e.target.value)}
                  placeholder="7"
                />
              </FormField>
            )}
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
              <FormField label="Start Date" required>
                <FormInput
                  type="date"
                  className="h-9 px-2 text-[11px]"
                  value={recStartDate}
                  onChange={(e) => setRecStartDate(e.target.value)}
                />
              </FormField>
              <FormField label="End Date">
                <FormInput
                  type="date"
                  className="h-9 px-2 text-[11px]"
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
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
              <FormField label="Start Time">
                <FormInput
                  type="time"
                  className="h-9 px-2 text-[11px]"
                  value={recStartTime}
                  onChange={(e) => setRecStartTime(e.target.value)}
                />
              </FormField>
              <FormField label="Duration">
                <FormSelect
                  className="h-9 px-2 text-[11px]"
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
