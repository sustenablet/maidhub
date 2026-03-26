"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Receipt,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  Wallet,
  MoreHorizontal,
  ChevronRight,
  Plus,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  display_name: string | null;
  business_name: string | null;
  subscription_status: string;
  trial_start_date: string;
}

const homeNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarDays },
];

const financeNav = [
  { href: "/dashboard/finances", label: "Overview", icon: Wallet },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
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
  onNavClick,
}: {
  profile: Profile | null;
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
            <NavItem key={item.href} {...item} onClick={onNavClick} />
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

// ── FAB quick-action sheet ──────────────────────────────────────
function MobileFAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed z-50 md:hidden flex items-center justify-center rounded-full bg-[#0071E3] shadow-[0_4px_20px_rgba(0,113,227,0.5)] active:scale-95 transition-transform"
      style={{
        bottom: "calc(env(safe-area-inset-bottom) + 70px)",
        right: "20px",
        width: "52px",
        height: "52px",
      }}
      aria-label="Quick actions"
    >
      <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
    </button>
  );
}

function MobileFABSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const actions = [
    { href: "/dashboard/schedule", label: "New Job", desc: "Schedule a cleaning", icon: CalendarDays, color: "#0071E3" },
    { href: "/dashboard/clients", label: "New Client", desc: "Add a client", icon: Users, color: "#34C759" },
    { href: "/dashboard/invoices", label: "New Invoice", desc: "Create & send invoice", icon: Receipt, color: "#FF9F0A" },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-[55] md:hidden transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-[58] md:hidden bg-[var(--mh-surface)] rounded-t-[20px] border-t border-[var(--mh-border)] transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 80px)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-[4px] rounded-full bg-[var(--mh-border-strong)]" />
        </div>
        <div className="px-5 pt-2 pb-1">
          <p className="text-[11px] font-semibold text-[var(--mh-text-faint)] uppercase tracking-[0.1em] mb-3">Quick Actions</p>
          <div className="space-y-2">
            {actions.map(({ href, label, desc, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="flex items-center gap-4 p-3.5 rounded-[12px] bg-[var(--mh-surface-raised)] active:opacity-70 transition-opacity"
              >
                <div
                  className="h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--mh-text)]">{label}</p>
                  <p className="text-[11px] text-[var(--mh-text-faint)]">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Mobile bottom tab items ─────────────────────────────────────
const mobileTabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
];

function MobileBottomNav({
  onMoreClick,
  moreOpen,
}: {
  onMoreClick: () => void;
  moreOpen: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
      <div
        className="bg-[var(--mh-sidebar)]/95 backdrop-blur-xl border-t border-[var(--mh-border-subtle)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-[56px]">
          {mobileTabs.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-[3px] relative select-none"
              >
                {isActive && (
                  <span className="absolute top-[10px] w-5 h-[3px] rounded-full bg-[#0071E3]" />
                )}
                <Icon
                  className={`h-[22px] w-[22px] mt-[6px] transition-colors ${
                    isActive ? "text-[#0071E3]" : "text-[var(--mh-text-faint)]"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.5}
                />
                <span
                  className={`text-[9.5px] font-semibold tracking-[0.02em] transition-colors ${
                    isActive ? "text-[#0071E3]" : "text-[var(--mh-text-faint)]"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}

          {/* More tab */}
          <button
            onClick={onMoreClick}
            className="flex-1 flex flex-col items-center justify-center gap-[3px] relative select-none"
          >
            {moreOpen && (
              <span className="absolute top-[10px] w-5 h-[3px] rounded-full bg-[#0071E3]" />
            )}
            <MoreHorizontal
              className={`h-[22px] w-[22px] mt-[6px] transition-colors ${
                moreOpen ? "text-[#0071E3]" : "text-[var(--mh-text-faint)]"
              }`}
              strokeWidth={moreOpen ? 2.2 : 1.5}
            />
            <span
              className={`text-[9.5px] font-semibold tracking-[0.02em] transition-colors ${
                moreOpen ? "text-[#0071E3]" : "text-[var(--mh-text-faint)]"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── More bottom sheet ────────────────────────────────────────────
function MobileMoreSheet({
  open,
  onClose,
  displayName,
  email,
  initials,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  displayName: string;
  email: string;
  initials: string;
  onSignOut: () => void;
}) {
  const moreItems = [
    { href: "/dashboard/finances", label: "Finances Overview", icon: Wallet, desc: "Revenue & reports" },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell, desc: "Recent activity" },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, desc: "Account & preferences" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[70] md:hidden bg-[var(--mh-surface)] rounded-t-[20px] border-t border-[var(--mh-border)] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 72px)" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-[4px] rounded-full bg-[var(--mh-border-strong)]" />
        </div>

        {/* User identity */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--mh-divider)]">
          <div className="h-10 w-10 rounded-full bg-[#0071E3]/20 border border-[#0071E3]/30 flex items-center justify-center shrink-0">
            <span className="text-[#0071E3] text-[13px] font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-[var(--mh-text)] truncate">{displayName}</p>
            <p className="text-[11px] text-[var(--mh-text-faint)] truncate">{email}</p>
          </div>
        </div>

        {/* Nav items */}
        <div className="px-3 pt-2 pb-1 space-y-0.5">
          {moreItems.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3.5 px-3 py-3 rounded-[10px] hover:bg-[var(--mh-hover-overlay)] active:bg-[var(--mh-hover-overlay)] transition-colors"
            >
              <div className="h-9 w-9 rounded-[8px] bg-[var(--mh-surface-raised)] flex items-center justify-center shrink-0">
                <Icon className="h-4.5 w-4.5 text-[var(--mh-text-muted)]" strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[var(--mh-text)]">{label}</p>
                <p className="text-[11px] text-[var(--mh-text-faint)]">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--mh-text-faint)]" strokeWidth={1.8} />
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <div className="px-3 pt-1">
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-3.5 px-3 py-3 rounded-[10px] hover:bg-red-500/[0.06] active:bg-red-500/[0.08] transition-colors"
          >
            <div className="h-9 w-9 rounded-[8px] bg-red-500/10 flex items-center justify-center shrink-0">
              <LogOut className="h-4 w-4 text-red-400" strokeWidth={1.7} />
            </div>
            <p className="text-[14px] font-semibold text-red-400">Sign Out</p>
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main shell ───────────────────────────────────────────────────
export function DashboardShell({
  user,
  profile,
  children,
}: {
  user: User;
  profile: Profile | null;
  children: React.ReactNode;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMoreOpen(false);
    setDropdownOpen(false);
    setFabOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-[100dvh] bg-[var(--mh-bg)]">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-[220px] shrink-0 flex-col bg-[var(--mh-sidebar)] border-r border-[var(--mh-border-subtle)] sticky top-0 h-screen overflow-hidden">
        <SidebarContent profile={profile} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Desktop topbar only */}
        <header className="hidden md:flex sticky top-0 z-30 bg-[var(--mh-sidebar)]/90 backdrop-blur-md border-b border-[var(--mh-border-subtle)] items-center justify-between px-6 h-[50px]">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[var(--mh-text-faint)]">Home</span>
            <span className="text-[var(--mh-text-faint)]">/</span>
            <span className="text-[var(--mh-text)] font-semibold">{breadcrumb}</span>
          </div>

          {/* Right — user avatar */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-md hover:bg-[var(--mh-hover-overlay)] transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-[#0071E3]/20 border border-[#0071E3]/30 flex items-center justify-center shrink-0">
                <span className="text-[#0071E3] text-[10px] font-bold tracking-wide">{initials}</span>
              </div>
              <span className="hidden sm:block text-[13px] font-medium text-[var(--mh-text)]">{displayName}</span>
              <ChevronDown className={`hidden sm:block h-3 w-3 text-[var(--mh-text-faint)] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
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
        </header>

        {/* Mobile safe-area top spacer */}
        <div className="md:hidden" style={{ height: "env(safe-area-inset-top)" }} />

        {/* Page content — extra bottom padding on mobile for tab bar */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-6">
          {children}
        </main>
      </div>

      {/* ── Mobile FAB ── */}
      <MobileFAB onClick={() => { setFabOpen((o) => !o); setMoreOpen(false); }} />

      {/* ── Mobile FAB action sheet ── */}
      <MobileFABSheet open={fabOpen} onClose={() => setFabOpen(false)} />

      {/* ── Mobile bottom tab bar ── */}
      <MobileBottomNav
        onMoreClick={() => { setMoreOpen((o) => !o); setFabOpen(false); }}
        moreOpen={moreOpen}
      />

      {/* ── Mobile "More" sheet ── */}
      <MobileMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        displayName={displayName}
        email={user.email || ""}
        initials={initials}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
