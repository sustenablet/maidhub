"use client";

import { useState, useRef, useEffect } from "react";
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
  Sparkles,
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

const managementNav = [
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/estimates", label: "Estimates", icon: FileText },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
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
  return last.charAt(0).toUpperCase() + last.slice(1);
}

function NavItem({
  href,
  label,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-teal-50 text-teal-700 border-l-[3px] border-teal-500 rounded-l-none pl-[10px]"
          : "text-[#1A2332]/55 hover:bg-[#1A2332]/5 hover:text-[#1A2332] border-l-[3px] border-transparent rounded-l-none pl-[10px]"
      }`}
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

function SidebarContent({
  profile,
  onNavClick,
}: {
  profile: Profile | null;
  onNavClick?: () => void;
}) {
  const daysLeft = profile?.trial_start_date
    ? getTrialDaysLeft(profile.trial_start_date)
    : 14;
  const isTrial =
    !profile?.subscription_status ||
    profile?.subscription_status === "trialing";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A2332] shadow-sm">
          <span
            className="text-[#A3E635] font-bold text-lg leading-none"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            M
          </span>
        </div>
        <span
          className="text-[#1A2332] font-bold text-lg tracking-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          MaidHub
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
        <div>
          <p
            className="px-3 mb-2 text-[10px] font-bold tracking-[0.12em] text-[#1A2332]/35 uppercase"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Home
          </p>
          <div className="space-y-0.5">
            {homeNav.map((item) => (
              <NavItem key={item.href} {...item} onClick={onNavClick} />
            ))}
          </div>
        </div>
        <div>
          <p
            className="px-3 mb-2 text-[10px] font-bold tracking-[0.12em] text-[#1A2332]/35 uppercase"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Management
          </p>
          <div className="space-y-0.5">
            {managementNav.map((item) => (
              <NavItem key={item.href} {...item} onClick={onNavClick} />
            ))}
          </div>
        </div>
      </div>

      {/* Trial banner */}
      {isTrial && (
        <div className="mx-3 mb-4 rounded-2xl bg-[#1A2332] p-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3 w-3 text-[#A3E635]" />
            <span
              className="text-[10px] font-bold text-[#A3E635] uppercase tracking-[0.1em]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Free Trial
            </span>
          </div>
          <p
            className="text-xs text-white/60 mb-3 leading-relaxed"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <span className="text-white font-semibold">{daysLeft} days</span>{" "}
            left in your trial
          </p>
          <Link
            href="/dashboard/upgrade"
            className="block text-center text-xs font-semibold bg-[#A3E635] text-[#1A2332] rounded-xl py-2 hover:bg-[#b5f040] transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Upgrade Now
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const pathname = usePathname();

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const businessName = profile?.business_name || "My Business";
  const initials = getInitials(profile?.display_name, user.email || "U");
  const breadcrumb = getBreadcrumb(pathname);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#F5F4EF]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-[#F6F3EC] border-r border-[#1A2332]/[0.07] sticky top-0 h-screen overflow-hidden">
        <SidebarContent profile={profile} />
      </aside>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#1A2332]/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#F6F3EC] border-r border-[#1A2332]/[0.07] transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#1A2332]/5 text-[#1A2332]/40 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent
          profile={profile}
          onNavClick={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-[#1A2332]/50 transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
            {/* Breadcrumb */}
            <div
              className="flex items-center gap-2 text-sm"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <span className="text-gray-300 hidden sm:block">Home</span>
              <span className="text-gray-200 hidden sm:block">/</span>
              <span className="text-[#1A2332] font-semibold">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Business name */}
            <span
              className="hidden sm:block text-sm text-[#1A2332]/40 mr-3 font-medium"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {businessName}
            </span>

            {/* Bell */}
            <Link
              href="/dashboard/notifications"
              className="p-2 rounded-xl hover:bg-gray-100 text-[#1A2332]/40 hover:text-[#1A2332] transition-colors"
            >
              <Bell className="h-4 w-4" />
            </Link>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors ml-1"
              >
                <div className="h-7 w-7 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                  <span
                    className="text-teal-700 text-xs font-bold"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {initials}
                  </span>
                </div>
                <span
                  className="hidden sm:block text-sm font-semibold text-[#1A2332]"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {displayName}
                </span>
                <ChevronDown
                  className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-gray-50">
                    <p
                      className="text-xs font-semibold text-[#1A2332]"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {displayName}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#1A2332]/70 hover:bg-gray-50 hover:text-[#1A2332] transition-colors"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-gray-50 py-1">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      <LogOut className="h-4 w-4" />
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
