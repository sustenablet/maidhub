"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Receipt,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  Wallet,
  Briefcase,
  Check,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  display_name: string | null;
  business_name: string | null;
  subscription_status: string;
  trial_start_date: string;
}

interface NotifItem {
  id: string;
  label: string;
  detail: string;
  time: string;
  color: string;
  iconType: "job" | "invoice";
}

const homeNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarDays },
];

const financeNav = [
  { href: "/dashboard/finances", label: "Overview", icon: Wallet },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/estimates", label: "Estimates", icon: FileText },
];

const activityNav = [
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function getInitials(name: string | null | undefined, email: string) {
  if (name) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }
  return email[0].toUpperCase();
}

function getTrialDaysLeft(trialStart: string): number {
  const end = new Date(trialStart);
  end.setDate(end.getDate() + 30);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function getBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1) return "Dashboard";
  const last = segments[segments.length - 1];
  if (last.match(/^[0-9a-f-]{36}$/)) {
    const parent = segments[segments.length - 2];
    return parent.charAt(0).toUpperCase() + parent.slice(1, -1) + " Detail";
  }
  return last.charAt(0).toUpperCase() + last.slice(1);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-[7px] rounded-[4px] text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? "bg-[#0071E3]/[0.14] text-[#0071E3]"
          : "text-[var(--mh-text-muted)] hover:bg-[var(--mh-hover-overlay)] hover:text-[var(--mh-text)]"
      }`}
    >
      <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={isActive ? 2 : 1.6} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#0071E3] px-1 text-[9px] font-bold text-white tabular-nums">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.1em] text-[var(--mh-text-faint)] uppercase">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarContent({
  profile,
  notifCount,
  onNavClick,
}: {
  profile: Profile | null;
  notifCount: number;
  onNavClick?: () => void;
}) {
  const daysLeft = profile?.trial_start_date ? getTrialDaysLeft(profile.trial_start_date) : 14;
  const isTrial = !profile?.subscription_status || profile?.subscription_status === "trialing";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-[18px]">
        <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[4px] bg-[#0071E3]">
          <span className="text-white font-bold text-[13px] leading-none tracking-tight">M</span>
        </div>
        <span className="text-[var(--mh-text)] font-bold text-[15px] tracking-[-0.03em]">MaidHub</span>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-1 space-y-5 overflow-y-auto">
        <NavSection label="Home">
          {homeNav.map((item) => (
            <NavItem key={item.href} {...item} onClick={onNavClick} />
          ))}
        </NavSection>
        <NavSection label="Finances">
          {financeNav.map((item) => (
            <NavItem key={item.href} {...item} onClick={onNavClick} />
          ))}
        </NavSection>
        <NavSection label="Account">
          {activityNav.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              badge={item.label === "Notifications" ? notifCount : undefined}
              onClick={onNavClick}
            />
          ))}
        </NavSection>
      </div>

      {/* Trial banner */}
      {isTrial && (
        <div className="mx-3 mb-4 rounded-[4px] bg-[var(--mh-surface)] border border-[var(--mh-border)] p-3.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-[var(--mh-text-faint)] uppercase tracking-[0.08em]">Free Trial</p>
            <span className="text-[11px] font-medium text-[var(--mh-text-muted)] tabular-nums">{daysLeft}d left</span>
          </div>
          <div className="w-full h-[3px] rounded-full bg-[var(--mh-border)] mb-3">
            <div
              className="h-[3px] rounded-full bg-[#0071E3] transition-all"
              style={{ width: `${Math.min(100, ((30 - daysLeft) / 30) * 100)}%` }}
            />
          </div>
          <Link
            href="/dashboard/upgrade"
            className="flex items-center justify-center gap-1.5 text-[11px] font-semibold bg-[#0071E3] text-white rounded-[4px] py-[7px] hover:bg-[#0077ED] transition-colors"
          >
            Upgrade Plan
            <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
          </Link>
        </div>
      )}
    </div>
  );
}

export function DashboardShell({
  user,
  profile,
  children,
}: {
  user: User;
  profile: Profile | null;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const pathname = usePathname();

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const initials = getInitials(profile?.display_name, user.email || "U");
  const breadcrumb = getBreadcrumb(pathname);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  const fetchNotifications = useCallback(async () => {
    const since = new Date();
    since.setHours(since.getHours() - 24);

    const [jobsRes, invRes] = await Promise.allSettled([
      supabase
        .from("jobs")
        .select("id, status, service_type, updated_at, clients(first_name, last_name)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(6),
      supabase
        .from("invoices")
        .select("id, status, total, updated_at, clients(first_name, last_name)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(6),
    ]);

    const items: NotifItem[] = [];

    if (jobsRes.status === "fulfilled" && jobsRes.value.data) {
      for (const job of jobsRes.value.data) {
        const clientData = job.clients as unknown as { first_name: string; last_name: string } | null;
        const name = clientData ? `${clientData.first_name} ${clientData.last_name}` : "Client";
        const statusLabel: Record<string, string> = {
          scheduled: "Job scheduled",
          in_progress: "Job in progress",
          completed: "Job completed",
          invoiced: "Job invoiced",
          cancelled: "Job cancelled",
        };
        items.push({
          id: `job-${job.id}`,
          label: statusLabel[job.status] || "Job updated",
          detail: `${name} · ${job.service_type || "Service"}`,
          time: job.updated_at,
          color: job.status === "completed" ? "text-[#34C759]" : job.status === "cancelled" ? "text-red-400" : "text-[#0071E3]",
          iconType: "job",
        });
      }
    }

    if (invRes.status === "fulfilled" && invRes.value.data) {
      for (const inv of invRes.value.data) {
        const clientData = inv.clients as unknown as { first_name: string; last_name: string } | null;
        const name = clientData ? `${clientData.first_name} ${clientData.last_name}` : "Client";
        items.push({
          id: `inv-${inv.id}`,
          label: inv.status === "paid" ? "Payment received" : "Invoice created",
          detail: `${name} · $${(inv.total || 0).toFixed(2)}`,
          time: inv.updated_at,
          color: inv.status === "paid" ? "text-[#34C759]" : "text-[#FF9F0A]",
          iconType: "invoice",
        });
      }
    }

    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const recent = items.filter((i) => new Date(i.time) >= since);
    setNotifCount(recent.length);
    setNotifications(items.slice(0, 4));
  }, [supabase, user.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[var(--mh-bg)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[220px] shrink-0 flex-col bg-[var(--mh-sidebar)] border-r border-[var(--mh-border-subtle)] sticky top-0 h-screen overflow-hidden">
        <SidebarContent profile={profile} notifCount={notifCount} />
      </aside>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[220px] bg-[var(--mh-sidebar)] border-r border-[var(--mh-border-subtle)] transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-[var(--mh-hover-overlay)] text-[var(--mh-text-faint)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent profile={profile} notifCount={notifCount} onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-[50px] bg-[var(--mh-sidebar)]/90 backdrop-blur-md border-b border-[var(--mh-border-subtle)] flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-md hover:bg-[var(--mh-hover-overlay)] text-[var(--mh-text-muted)] transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-[var(--mh-text-faint)] hidden sm:block">Home</span>
              <span className="text-[var(--mh-text-faint)] hidden sm:block">/</span>
              <span className="text-[var(--mh-text)] font-semibold">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-md hover:bg-[var(--mh-hover-overlay)] text-[var(--mh-text-muted)] hover:text-[var(--mh-text)] transition-colors"
              >
                <Bell className="h-4 w-4" strokeWidth={1.8} />
                {notifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#0071E3] px-0.5 text-[8px] font-bold text-white">
                    {notifCount > 99 ? "99+" : notifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-80 bg-[var(--mh-surface)] rounded-[8px] border border-[var(--mh-border)] shadow-[var(--mh-shadow-dropdown)] z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--mh-divider)]">
                    <span className="text-[13px] font-semibold text-[var(--mh-text)]">Notifications</span>
                    {notifCount > 0 && (
                      <span className="text-[10px] font-semibold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full">
                        {notifCount} new
                      </span>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <Bell className="h-6 w-6 text-[var(--mh-text-faint)] mx-auto mb-2" strokeWidth={1.5} />
                      <p className="text-[12px] text-[var(--mh-text-muted)]">No recent activity</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--mh-divider)]">
                      {notifications.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--mh-hover-overlay)] transition-colors">
                          <div className="mt-0.5 h-7 w-7 rounded-[4px] bg-[var(--mh-surface-raised)] flex items-center justify-center shrink-0">
                            {item.iconType === "invoice"
                              ? <Receipt className={`h-3.5 w-3.5 ${item.color}`} strokeWidth={1.8} />
                              : <Briefcase className={`h-3.5 w-3.5 ${item.color}`} strokeWidth={1.8} />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-[var(--mh-text)] leading-tight">{item.label}</p>
                            <p className="text-[11px] text-[var(--mh-text-muted)] truncate mt-0.5">{item.detail}</p>
                          </div>
                          <span className="text-[10px] text-[var(--mh-text-faint)] shrink-0 mt-0.5 tabular-nums">{timeAgo(item.time)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-[var(--mh-divider)] p-2">
                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="flex items-center justify-center gap-1.5 w-full py-2 text-[12px] font-semibold text-[#0071E3] hover:bg-[#0071E3]/[0.08] rounded-[4px] transition-colors"
                    >
                      View all notifications
                      <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-md hover:bg-[var(--mh-hover-overlay)] transition-colors ml-0.5"
              >
                <div className="h-6 w-6 rounded-full bg-[#0071E3]/20 border border-[#0071E3]/30 flex items-center justify-center shrink-0">
                  <span className="text-[#0071E3] text-[9px] font-bold tracking-wide">{initials}</span>
                </div>
                <span className="hidden sm:block text-[13px] font-medium text-[var(--mh-text)]">{displayName}</span>
                <ChevronDown className={`h-3 w-3 text-[var(--mh-text-faint)] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-[var(--mh-surface)] rounded-[6px] shadow-[var(--mh-shadow-dropdown)] border border-[var(--mh-border)] py-1 z-50 overflow-hidden">
                  <div className="px-3.5 py-2.5 border-b border-[var(--mh-border)]">
                    <p className="text-[13px] font-semibold text-[var(--mh-text)]">{displayName}</p>
                    <p className="text-[11px] text-[var(--mh-text-faint)] truncate">{user.email}</p>
                  </div>
                  <div className="py-0.5">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[var(--mh-text-muted)] hover:bg-[var(--mh-hover-overlay)] hover:text-[var(--mh-text)] transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-[14px] w-[14px]" strokeWidth={1.8} />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-[var(--mh-border)] py-0.5">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-400/80 hover:bg-red-500/[0.06] hover:text-red-400 transition-colors"
                    >
                      <LogOut className="h-[14px] w-[14px]" strokeWidth={1.8} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
