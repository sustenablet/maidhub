"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  Briefcase,
  Receipt,
  Check,
  BellOff,
  Loader2,
  Clock,
  X,
} from "lucide-react";
type NotifCategory = "all" | "jobs" | "invoices";

interface ActivityItem {
  id: string;
  category: "jobs" | "invoices";
  title: string;
  message: string;
  timestamp: string;
  relativeTime: string;
  unread: boolean;
  count?: number;
  groupKey?: string;
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getIcon(category: string) {
  switch (category) {
    case "jobs":
      return { Icon: Briefcase, bg: "bg-[#0071E3]/[0.12]", color: "text-[#0071E3]" };
    case "invoices":
      return { Icon: Receipt, bg: "bg-[#0071E3]/[0.12]", color: "text-[#0071E3]" };
    default:
      return { Icon: Bell, bg: "bg-[var(--mh-surface-raised)]", color: "text-[var(--mh-text-muted)]" };
  }
}

const tabs: { label: string; value: NotifCategory }[] = [
  { label: "All", value: "all" },
  { label: "Jobs", value: "jobs" },
  { label: "Invoices", value: "invoices" },
];

export default function NotificationsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<NotifCategory>("all");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("maidhub_dismissed_notifs");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("maidhub_read_notifs");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (readIds.size > 0) {
      localStorage.setItem("maidhub_read_notifs", JSON.stringify([...readIds]));
    }
  }, [readIds]);

  useEffect(() => {
    if (dismissedIds.size > 0) {
      localStorage.setItem("maidhub_dismissed_notifs", JSON.stringify([...dismissedIds]));
    } else {
      localStorage.removeItem("maidhub_dismissed_notifs");
    }
  }, [dismissedIds]);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    const items: ActivityItem[] = [];

    // Fetch recent jobs
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, scheduled_date, start_time, service_type, status, price, created_at, updated_at, clients(first_name, last_name)")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (jobs) {
      for (const job of jobs) {
        const clientRaw = job.clients as unknown as { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
        const client = Array.isArray(clientRaw) ? clientRaw[0] ?? null : clientRaw;
        const clientName = client ? `${client.first_name} ${client.last_name}` : "Unknown Client";
        let title = "";
        let message = "";

        switch (job.status) {
          case "scheduled":
            title = "Job Scheduled";
            message = `${job.service_type || "Cleaning"} for ${clientName} on ${new Date(job.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}${job.start_time ? ` at ${job.start_time.slice(0, 5)}` : ""}`;
            break;
          case "in_progress":
            title = "Job In Progress";
            message = `${job.service_type || "Cleaning"} for ${clientName} is currently in progress`;
            break;
          case "completed":
            title = "Job Completed";
            message = `${job.service_type || "Cleaning"} for ${clientName} has been completed${job.price ? ` — $${Number(job.price).toFixed(0)}` : ""}`;
            break;
          case "invoiced":
            title = "Job Invoiced";
            message = `Invoice created for ${clientName}'s ${job.service_type || "cleaning"}${job.price ? ` — $${Number(job.price).toFixed(0)}` : ""}`;
            break;
          case "cancelled":
            title = "Job Cancelled";
            message = `${job.service_type || "Cleaning"} for ${clientName} was cancelled`;
            break;
        }

        items.push({
          id: `job-${job.id}`,
          category: "jobs",
          title,
          message,
          timestamp: job.updated_at || job.created_at,
          relativeTime: getRelativeTime(job.updated_at || job.created_at),
          unread: !readIds.has(`job-${job.id}`),
          groupKey: `${job.status}-${clientName}-${job.service_type || ""}`,
        });
      }
    }

    // Fetch recent invoices
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, total, status, due_date, payment_date, created_at, updated_at, clients(first_name, last_name)")
      .order("updated_at", { ascending: false })
      .limit(15);

    if (invoices) {
      for (const inv of invoices) {
        const clientRaw = inv.clients as unknown as { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
        const client = Array.isArray(clientRaw) ? clientRaw[0] ?? null : clientRaw;
        const clientName = client ? `${client.first_name} ${client.last_name}` : "Unknown Client";
        const amount = inv.total ? `$${Number(inv.total).toFixed(0)}` : "";
        let title = "";
        let message = "";

        switch (inv.status) {
          case "unpaid":
            const dueDate = inv.due_date ? new Date(inv.due_date) : null;
            const isOverdue = dueDate && dueDate < new Date();
            title = isOverdue ? "Invoice Overdue" : "Invoice Created";
            message = isOverdue
              ? `Invoice for ${amount} from ${clientName} is overdue${dueDate ? ` (due ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})` : ""}`
              : `New invoice for ${amount} sent to ${clientName}`;
            break;
          case "paid":
            title = "Payment Received";
            message = `${clientName} paid ${amount}${inv.payment_date ? ` on ${new Date(inv.payment_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}`;
            break;
          case "void":
            title = "Invoice Voided";
            message = `Invoice for ${amount} to ${clientName} has been voided`;
            break;
        }

        items.push({
          id: `inv-${inv.id}`,
          category: "invoices",
          title,
          message,
          timestamp: inv.updated_at || inv.created_at,
          relativeTime: getRelativeTime(inv.updated_at || inv.created_at),
          unread: !readIds.has(`inv-${inv.id}`),
        });
      }
    }

    // Sort all by timestamp descending
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Deduplicate: group same groupKey within 10 minutes, keeping latest timestamp
    const deduped: ActivityItem[] = [];
    for (const item of items) {
      if (item.groupKey) {
        const existing = deduped.find(
          (d) => d.groupKey === item.groupKey &&
          Math.abs(new Date(d.timestamp).getTime() - new Date(item.timestamp).getTime()) < 10 * 60 * 1000
        );
        if (existing) {
          existing.count = (existing.count ?? 1) + 1;
          continue;
        }
      }
      deduped.push({ ...item, count: 1 });
    }

    setActivities(deduped.filter((item) => !dismissedIds.has(item.id)));
    setLoading(false);
  }, [supabase, readIds, dismissedIds]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const filtered =
    activeTab === "all"
      ? activities
      : activities.filter((a) => a.category === activeTab);

  const unreadCount = activities.filter((a) => a.unread).length;

  function markAllRead() {
    const allIds = new Set(activities.map((a) => a.id));
    setReadIds(allIds);
    setActivities((prev) => prev.map((a) => ({ ...a, unread: false })));
  }

  function markRead(id: string) {
    setReadIds((prev) => new Set([...prev, id]));
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unread: false } : a))
    );
  }

  function dismissNotification(id: string) {
    setDismissedIds((prev) => new Set([...prev, id]));
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }

  const jobsUnread = activities.filter((a) => a.category === "jobs" && a.unread).length;
  const invoicesUnread = activities.filter((a) => a.category === "invoices" && a.unread).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] md:text-[21px] font-bold md:font-semibold text-[var(--mh-text)] tracking-[-0.03em] md:tracking-[-0.02em]">
            Notifications
          </h1>
          <p className="text-[12px] text-[var(--mh-text-muted)] mt-0.5">
            {loading ? "Loading…" : unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="shrink-0 flex items-center gap-1.5 h-9 px-3 text-[12px] font-semibold text-[var(--mh-text-muted)] bg-[var(--mh-surface)] border border-[var(--mh-border)] rounded-[10px] hover:bg-[var(--mh-surface-raised)] transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
            Mark all
          </button>
        )}
      </div>

      <div className="md:hidden grid grid-cols-2 gap-2.5">
        <div className="bg-[var(--mh-surface)] border border-[var(--mh-border)] rounded-[12px] p-3">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--mh-text-faint)] font-bold">Jobs</p>
          <p className="text-[20px] font-bold text-[var(--mh-text)] mt-1 tabular-nums">{jobsUnread}</p>
        </div>
        <div className="bg-[var(--mh-surface)] border border-[var(--mh-border)] rounded-[12px] p-3">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--mh-text-faint)] font-bold">Invoices</p>
          <p className="text-[20px] font-bold text-[var(--mh-text)] mt-1 tabular-nums">{invoicesUnread}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => {
          const count = tab.value === "all"
            ? unreadCount
            : activities.filter((a) => a.category === tab.value && a.unread).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
                activeTab === tab.value
                  ? "bg-[#0071E3] border-[#0071E3] text-white"
                  : "bg-[var(--mh-surface)] border-[var(--mh-border)] text-[var(--mh-text-muted)]"
              }`}
            >
              {tab.label}
              {count > 0 && <span className="ml-1.5 text-[10px] font-bold">{count}</span>}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-[var(--mh-text-faint)] animate-spin" />
          <p className="text-sm text-[var(--mh-text-muted)] mt-3">Loading notifications…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[var(--mh-surface)] border border-[var(--mh-border)] rounded-[14px]">
          <div className="h-14 w-14 rounded-[12px] bg-[var(--mh-surface-raised)] flex items-center justify-center mb-4">
            <BellOff className="h-7 w-7 text-[var(--mh-text-faint)]" />
          </div>
          <p className="text-sm font-semibold text-[var(--mh-text)]">No notifications yet</p>
          <p className="text-xs text-[var(--mh-text-muted)] mt-1 max-w-xs">
            {activeTab === "all"
              ? "Create jobs and invoices to see updates here"
              : `No ${activeTab} updates yet`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const { Icon, bg, color } = getIcon(item.category);
            return (
              <button
                key={item.id}
                onClick={() => markRead(item.id)}
                className={`w-full text-left bg-[var(--mh-surface)] border rounded-[12px] p-3.5 transition-colors ${
                  item.unread
                    ? "border-[#0071E3]/35"
                    : "border-[var(--mh-border)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-[10px] ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4.5 w-4.5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[13px] font-semibold truncate ${item.unread ? "text-[var(--mh-text)]" : "text-[var(--mh-text-muted)]"}`}>
                        {item.count && item.count > 1 ? `${item.count}× ${item.title}` : item.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-[11px] text-[var(--mh-text-faint)]">
                          <Clock className="h-3 w-3" />
                          {item.relativeTime}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(item.id);
                          }}
                          className="h-6 w-6 flex items-center justify-center rounded-[6px] text-[var(--mh-text-faint)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label="Delete notification"
                          title="Delete notification"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[12px] text-[var(--mh-text-muted)] mt-1 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                  {item.unread && <span className="mt-1 h-2 w-2 rounded-full bg-[#0071E3] shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
