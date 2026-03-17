"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { Client, Address, Job } from "@/lib/types";
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
    bg: "bg-teal-100",
    border: "border-teal-300",
    text: "text-teal-800",
  },
  in_progress: {
    bg: "bg-amber-100",
    border: "border-amber-300",
    text: "text-amber-800",
  },
  completed: {
    bg: "bg-green-100",
    border: "border-green-300",
    text: "text-green-800",
  },
  invoiced: {
    bg: "bg-blue-100",
    border: "border-blue-300",
    text: "text-blue-800",
  },
  cancelled: {
    bg: "bg-gray-100",
    border: "border-gray-300",
    text: "text-gray-500",
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

  /* New job form state */
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
  }

  function openNewJobForm() {
    resetForm();
    setFormOpen(true);
  }

  async function handleCreateJob() {
    if (!formClientId || !formDate) {
      toast.error("Please select a client and date");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("jobs").insert({
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
        className={`absolute left-0.5 right-0.5 ${colors.bg} ${colors.border} ${colors.text} border-l-[3px] rounded-lg px-1.5 py-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow text-left`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          fontFamily: "'Syne', sans-serif",
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
            "bg-amber-500 hover:bg-amber-600 text-white",
        });
        break;
      case "in_progress":
        buttons.push({
          label: "Complete",
          status: "completed",
          color:
            "bg-green-500 hover:bg-green-600 text-white",
        });
        break;
      case "completed":
        buttons.push({
          label: "Create Invoice",
          status: "invoiced",
          color:
            "bg-blue-500 hover:bg-blue-600 text-white",
        });
        break;
    }

    if (job.status !== "cancelled" && job.status !== "invoiced") {
      buttons.push({
        label: "Cancel",
        status: "cancelled",
        color:
          "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200",
      });
    }

    if (buttons.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {buttons.map((btn) => (
          <button
            key={btn.status}
            onClick={() => handleStatusChange(job, btn.status)}
            disabled={updatingStatus}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${btn.color}`}
            style={{ fontFamily: "'Syne', sans-serif" }}
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
            className="text-2xl font-bold text-[#1A2332]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Schedule
          </h1>
          <p
            className="text-sm text-gray-400 mt-1"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Manage your cleaning appointments
          </p>
        </div>
        <button
          onClick={openNewJobForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <Plus className="h-4 w-4" />
          New Job
        </button>
      </div>

      {/* Week navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span
            className="text-sm font-semibold text-[#1A2332] ml-1"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {formatWeekLabel(weekStart)}
          </span>
        </div>
        <button
          onClick={() => setWeekOffset(0)}
          className="px-3 py-1.5 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Today
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        {loading ? (
          <div
            className="flex items-center justify-center py-32 text-gray-400 text-sm"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div style={{ minWidth: "640px" }}>
              {/* Day headers */}
              <div
                className="grid border-b border-gray-100"
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
                      className="flex flex-col items-center justify-center h-14 border-l border-gray-100"
                    >
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isToday ? "text-teal-600" : "text-gray-400"
                        }`}
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {DAY_NAMES[i]}
                      </span>
                      <span
                        className={`text-sm font-bold mt-0.5 leading-none ${
                          isToday
                            ? "bg-teal-500 text-white w-7 h-7 rounded-full flex items-center justify-center"
                            : "text-[#1A2332]"
                        }`}
                        style={{ fontFamily: "'Syne', sans-serif" }}
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
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px]"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-[#1A2332]">
                      No jobs this week
                    </p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                      Schedule a job to see it appear here
                    </p>
                    <button
                      onClick={openNewJobForm}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors"
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
                        className="absolute right-2 text-[10px] text-gray-400 font-medium leading-none"
                        style={{
                          top: `${i * HOUR_HEIGHT - 5}px`,
                          fontFamily: "'Syne', sans-serif",
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
                      className="relative border-l border-gray-100"
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
                          className="absolute left-0 right-0 hover:bg-gray-50/50 transition-colors"
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
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  STATUS_COLORS[selectedJob.status].bg
                } ${STATUS_COLORS[selectedJob.status].text}`}
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {selectedJob.status.replace("_", " ").replace(/\b\w/g, (c) =>
                  c.toUpperCase()
                )}
              </span>
            </div>

            {/* Info rows */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p
                    className="text-xs text-gray-400 font-medium"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Client
                  </p>
                  <p
                    className="text-sm font-semibold text-[#1A2332]"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {selectedJob.clients
                      ? `${selectedJob.clients.first_name} ${selectedJob.clients.last_name}`
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p
                    className="text-xs text-gray-400 font-medium"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Date & Time
                  </p>
                  <p
                    className="text-sm font-semibold text-[#1A2332]"
                    style={{ fontFamily: "'Syne', sans-serif" }}
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
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "'Syne', sans-serif" }}
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
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p
                      className="text-xs text-gray-400 font-medium"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      Address
                    </p>
                    <p
                      className="text-sm text-[#1A2332]"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {formatAddress(selectedJob.addresses)}
                    </p>
                  </div>
                </div>
              )}

              {selectedJob.price != null && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p
                      className="text-xs text-gray-400 font-medium"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      Price
                    </p>
                    <p
                      className="text-sm font-bold text-[#1A2332]"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      ${Number(selectedJob.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {selectedJob.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p
                      className="text-xs text-gray-400 font-medium"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      Notes
                    </p>
                    <p
                      className="text-sm text-gray-600 whitespace-pre-wrap"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {selectedJob.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Status actions */}
            {renderStatusActions(selectedJob)}
          </div>
        )}
      </SlidePanel>

      {/* ── New Job Panel ──────────────────────────────────────── */}
      <SlidePanel
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="New Job"
        subtitle="Schedule a cleaning appointment"
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

        <FormActions>
          <SecondaryButton onClick={() => setFormOpen(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton loading={saving} onClick={handleCreateJob}>
            Schedule Job
          </PrimaryButton>
        </FormActions>
      </SlidePanel>
    </div>
  );
}
