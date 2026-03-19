import { createClient } from "@/lib/supabase/server";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Receipt,
  FileText,
  Users,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
  UserPlus,
  CalendarPlus,
} from "lucide-react";
import Link from "next/link";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import type { RevenueDataPoint } from "@/components/dashboard/revenue-chart";
import { ServiceDonut } from "@/components/dashboard/service-donut";
import type { ServiceDataPoint } from "@/components/dashboard/service-donut";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user!.id)
    .single();

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const firstName = profile?.display_name?.split(" ")[0] || user!.email?.split("@")[0] || "there";

  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const mondayStr = monday.toISOString().split("T")[0];
  const sundayStr = sunday.toISOString().split("T")[0];
  const todayStr = now.toISOString().split("T")[0];

  // Last month for revenue comparison
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  const [
    clientsRes, upcomingJobsRes, openEstimatesRes, unpaidInvRes,
    todayJobsRes, recentJobsRes, recentInvoicesRes,
    paidInvoicesRes, allJobsServiceRes, weekJobsRes,
    thisMonthRevRes, lastMonthRevRes,
  ] = await Promise.allSettled([
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "scheduled"),
    supabase.from("estimates").select("*", { count: "exact", head: true }).eq("user_id", user!.id).in("status", ["draft", "sent"]),
    supabase.from("invoices").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "unpaid"),
    supabase.from("jobs").select("*, clients(first_name, last_name)").eq("user_id", user!.id).eq("scheduled_date", todayStr).order("start_time", { ascending: true }).limit(6),
    supabase.from("jobs").select("*, clients(first_name, last_name)").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(5),
    supabase.from("invoices").select("*, clients(first_name, last_name)").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
    supabase.from("invoices").select("total, payment_date").eq("user_id", user!.id).eq("status", "paid").gte("payment_date", new Date(Date.now() - 180 * 86400000).toISOString().split("T")[0]),
    supabase.from("jobs").select("service_type, price").eq("user_id", user!.id),
    supabase.from("jobs").select("id, scheduled_date, start_time, service_type, price, status, duration_minutes, clients(first_name, last_name)").eq("user_id", user!.id).gte("scheduled_date", mondayStr).lte("scheduled_date", sundayStr).order("scheduled_date").order("start_time"),
    supabase.from("invoices").select("total").eq("user_id", user!.id).eq("status", "paid").gte("payment_date", thisMonthStart),
    supabase.from("invoices").select("total").eq("user_id", user!.id).eq("status", "paid").gte("payment_date", lastMonthStart).lte("payment_date", lastMonthEnd),
  ]);

  const clientCount = clientsRes.status === "fulfilled" ? (clientsRes.value.count ?? 0) : 0;
  const jobCount = upcomingJobsRes.status === "fulfilled" ? (upcomingJobsRes.value.count ?? 0) : 0;
  const estimateCount = openEstimatesRes.status === "fulfilled" ? (openEstimatesRes.value.count ?? 0) : 0;
  const invoiceCount = unpaidInvRes.status === "fulfilled" ? (unpaidInvRes.value.count ?? 0) : 0;
  const todayJobs = todayJobsRes.status === "fulfilled" ? (todayJobsRes.value.data ?? []) : [];
  const recentJobs = recentJobsRes.status === "fulfilled" ? (recentJobsRes.value.data ?? []) : [];
  const recentInvoices = recentInvoicesRes.status === "fulfilled" ? (recentInvoicesRes.value.data ?? []) : [];

  const weekJobs = weekJobsRes.status === "fulfilled" ? (weekJobsRes.value.data ?? []) : [];
  const weekTotal = weekJobs.length;
  const weekCompleted = weekJobs.filter((j: { status: string }) => j.status === "completed" || j.status === "invoiced").length;
  const weekRevenue = weekJobs
    .filter((j: { status: string }) => j.status === "completed" || j.status === "invoiced")
    .reduce((sum: number, j: { price: number | null }) => sum + (j.price || 0), 0);
  const weekScheduled = weekJobs.filter((j: { status: string }) => j.status === "scheduled").length;

  // Revenue data
  const paidInvoices = paidInvoicesRes.status === "fulfilled" ? (paidInvoicesRes.value.data ?? []) : [];
  const monthlyRevenue: Record<string, number> = {};
  for (const inv of paidInvoices) {
    if (!inv.payment_date) continue;
    const date = new Date(inv.payment_date + "T00:00:00");
    const key = date.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (inv.total || 0);
  }
  const revenueChartData: RevenueDataPoint[] = Object.entries(monthlyRevenue)
    .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }));
  const totalRevenue = revenueChartData.reduce((sum, d) => sum + d.amount, 0);

  const thisMonthRev = thisMonthRevRes.status === "fulfilled"
    ? (thisMonthRevRes.value.data ?? []).reduce((s: number, i: { total: number }) => s + (i.total || 0), 0) : 0;
  const lastMonthRev = lastMonthRevRes.status === "fulfilled"
    ? (lastMonthRevRes.value.data ?? []).reduce((s: number, i: { total: number }) => s + (i.total || 0), 0) : 0;
  const revGrowth = lastMonthRev > 0 ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100) : null;

  // Service donut
  const allJobsService = allJobsServiceRes.status === "fulfilled" ? (allJobsServiceRes.value.data ?? []) : [];
  const serviceMap: Record<string, { count: number; revenue: number }> = {};
  for (const job of allJobsService) {
    const sType = job.service_type || "Other";
    if (!serviceMap[sType]) serviceMap[sType] = { count: 0, revenue: 0 };
    serviceMap[sType].count++;
    serviceMap[sType].revenue += job.price || 0;
  }
  const totalJobCount = allJobsService.length || 1;
  const serviceColors = ["#0071E3", "#30B0C7", "#34C759", "#FF9F0A", "#BF5AF2", "#FF375F", "#00C7BE"];
  const serviceDonutData: ServiceDataPoint[] = Object.entries(serviceMap)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([label, data], i) => ({
      label,
      value: Math.round((data.count / totalJobCount) * 100),
      color: serviceColors[i % serviceColors.length],
      amount: Math.round(data.revenue * 100) / 100,
    }));
  const serviceTotal = serviceDonutData.reduce((sum, d) => sum + d.amount, 0);

  // Activity feed
  type ActivityItem = { type: string; label: string; detail: string; time: string; icon: string; color: string };
  const activity: ActivityItem[] = [];
  for (const job of recentJobs) {
    const clientData = job.clients as { first_name: string; last_name: string } | null;
    const name = clientData ? `${clientData.first_name} ${clientData.last_name}` : "Client";
    const statusLabel: Record<string, string> = {
      scheduled: "Job scheduled", in_progress: "Job in progress",
      completed: "Job completed", invoiced: "Job invoiced", cancelled: "Job cancelled",
    };
    activity.push({
      type: "job",
      label: statusLabel[job.status] || "Job updated",
      detail: `${name} · ${job.service_type || "Service"}`,
      time: job.updated_at,
      icon: "briefcase",
      color: job.status === "completed" ? "text-[#34C759]" : job.status === "cancelled" ? "text-red-400" : "text-[#0071E3]",
    });
  }
  for (const inv of recentInvoices) {
    const clientData = inv.clients as { first_name: string; last_name: string } | null;
    const name = clientData ? `${clientData.first_name} ${clientData.last_name}` : "Client";
    activity.push({
      type: "invoice",
      label: inv.status === "paid" ? "Payment received" : "Invoice created",
      detail: `${name} · $${(inv.total || 0).toFixed(2)}`,
      time: inv.created_at,
      icon: "receipt",
      color: inv.status === "paid" ? "text-[#34C759]" : "text-[#FF9F0A]",
    });
  }
  activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const recentActivity = activity.slice(0, 8);

  const jobStatusConfig: Record<string, { dot: string; label: string; badge: string }> = {
    scheduled: { dot: "bg-[#0071E3]", label: "Scheduled", badge: "bg-[#0071E3]/10 text-[#0071E3]" },
    in_progress: { dot: "bg-[#FF9F0A]", label: "In Progress", badge: "bg-[#FF9F0A]/10 text-[#FF9F0A]" },
    completed: { dot: "bg-[#34C759]", label: "Completed", badge: "bg-[#34C759]/10 text-[#34C759]" },
    invoiced: { dot: "bg-[#30B0C7]", label: "Invoiced", badge: "bg-[#30B0C7]/10 text-[#30B0C7]" },
    cancelled: { dot: "bg-[#555555]", label: "Cancelled", badge: "bg-[#555555]/20 text-[#888888]" },
  };

  function formatTime(time: string | null) {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const todayDisplay = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#555555] mb-1">{todayDisplay}</p>
          <h1 className="text-[24px] font-bold text-[#D4D4D4] tracking-[-0.04em] leading-tight">
            {greeting}, {firstName}.
          </h1>
        </div>
        {/* Quick add */}
        <div className="flex items-center gap-1.5 mt-1">
          <Link href="/dashboard/clients" className="flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-[#888888] hover:text-[#D4D4D4] rounded-[4px] hover:bg-white/[0.05] transition-all border border-transparent hover:border-[#2C2C2C]">
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.6} />
            Client
          </Link>
          <Link href="/dashboard/schedule" className="flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-[#888888] hover:text-[#D4D4D4] rounded-[4px] hover:bg-white/[0.05] transition-all border border-transparent hover:border-[#2C2C2C]">
            <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.6} />
            Job
          </Link>
          <Link href="/dashboard/invoices" className="flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-white bg-[#0071E3] hover:bg-[#0077ED] rounded-[4px] transition-all">
            <Receipt className="h-3.5 w-3.5" strokeWidth={1.8} />
            New Invoice
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

        {/* Clients */}
        <Link href="/dashboard/clients" className="group block">
          <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[6px] p-5 hover:border-[#3A3A3A] transition-all hover:shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 rounded-[4px] bg-[#0071E3]/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-[#0071E3]" strokeWidth={1.8} />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#333333] group-hover:text-[#888888] transition-colors" strokeWidth={2} />
            </div>
            <div className="text-[36px] font-bold text-[#D4D4D4] leading-none tracking-[-0.04em] tabular-nums mb-1.5">
              {clientCount}
            </div>
            <p className="text-[12px] font-medium text-[#555555]">Total Clients</p>
          </div>
        </Link>

        {/* Upcoming Jobs */}
        <Link href="/dashboard/schedule" className="group block">
          <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[6px] p-5 hover:border-[#3A3A3A] transition-all hover:shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 rounded-[4px] bg-[#34C759]/10 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-[#34C759]" strokeWidth={1.8} />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#333333] group-hover:text-[#888888] transition-colors" strokeWidth={2} />
            </div>
            <div className="text-[36px] font-bold text-[#D4D4D4] leading-none tracking-[-0.04em] tabular-nums mb-1.5">
              {jobCount}
            </div>
            <p className="text-[12px] font-medium text-[#555555]">Upcoming Jobs</p>
          </div>
        </Link>

        {/* Open Estimates */}
        <Link href="/dashboard/estimates" className="group block">
          <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[6px] p-5 hover:border-[#3A3A3A] transition-all hover:shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 rounded-[4px] bg-[#FF9F0A]/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#FF9F0A]" strokeWidth={1.8} />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#333333] group-hover:text-[#888888] transition-colors" strokeWidth={2} />
            </div>
            <div className="text-[36px] font-bold text-[#D4D4D4] leading-none tracking-[-0.04em] tabular-nums mb-1.5">
              {estimateCount}
            </div>
            <p className="text-[12px] font-medium text-[#555555]">Open Estimates</p>
          </div>
        </Link>

        {/* Unpaid Invoices */}
        <Link href="/dashboard/invoices" className="group block">
          <div className={`bg-[#1E1E1E] border rounded-[6px] p-5 hover:border-[#3A3A3A] transition-all hover:shadow-[0_2px_12px_rgba(0,0,0,0.4)] ${invoiceCount > 0 ? "border-red-500/30" : "border-[#2C2C2C]"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`h-8 w-8 rounded-[4px] flex items-center justify-center ${invoiceCount > 0 ? "bg-red-500/10" : "bg-[#252525]"}`}>
                <Receipt className={`h-4 w-4 ${invoiceCount > 0 ? "text-red-400" : "text-[#888888]"}`} strokeWidth={1.8} />
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#333333] group-hover:text-[#888888] transition-colors" strokeWidth={2} />
            </div>
            <div className={`text-[36px] font-bold leading-none tracking-[-0.04em] tabular-nums mb-1.5 ${invoiceCount > 0 ? "text-red-400" : "text-[#D4D4D4]"}`}>
              {invoiceCount}
            </div>
            <p className="text-[12px] font-medium text-[#555555]">Unpaid Invoices</p>
          </div>
        </Link>
      </div>

      {/* ── This Week strip ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#252525] rounded-[6px] overflow-hidden border border-[#252525]">
        {[
          { label: "This week", value: weekTotal, suffix: "jobs", color: "text-[#D4D4D4]" },
          { label: "Completed", value: weekCompleted, suffix: "", color: "text-[#34C759]" },
          { label: "Remaining", value: weekScheduled, suffix: "", color: "text-[#FF9F0A]" },
          { label: "Week earned", value: `$${weekRevenue.toLocaleString()}`, suffix: "", color: "text-[#D4D4D4]" },
        ].map((item) => (
          <div key={item.label} className="bg-[#1E1E1E] px-5 py-4">
            <p className="text-[10px] font-semibold text-[#555555] uppercase tracking-[0.09em] mb-1.5">{item.label}</p>
            <p className={`text-[22px] font-bold tracking-[-0.03em] tabular-nums ${item.color}`}>
              {item.value}{item.suffix ? <span className="text-[13px] font-medium text-[#555555] ml-1">{item.suffix}</span> : null}
            </p>
          </div>
        ))}
      </div>

      {/* ── Main content row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Today's Jobs — 3 cols */}
        <div className="lg:col-span-3 bg-[#1E1E1E] rounded-[6px] border border-[#2C2C2C] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#252525]">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-[#0071E3]" strokeWidth={2} />
              <h2 className="text-[14px] font-bold text-[#D4D4D4] tracking-[-0.02em]">Today&apos;s Schedule</h2>
              {todayJobs.length > 0 && (
                <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-[#0071E3]/15 text-[#0071E3] text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {todayJobs.length}
                </span>
              )}
            </div>
            <Link href="/dashboard/schedule" className="text-[11px] font-semibold text-[#555555] hover:text-[#D4D4D4] transition-colors flex items-center gap-1">
              Schedule <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </div>

          {todayJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-10 w-10 rounded-full bg-[#252525] flex items-center justify-center mb-3">
                <CheckCircle2 className="h-5 w-5 text-[#333333]" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-semibold text-[#555555]">Clear schedule today</p>
              <p className="text-[11px] text-[#444444] mt-1">No jobs scheduled for today</p>
            </div>
          ) : (
            <div>
              {(todayJobs as Array<{
                id: string;
                start_time: string | null;
                service_type: string | null;
                status: string;
                price: number | null;
                duration_minutes: number | null;
                clients: { first_name: string; last_name: string } | null;
              }>).map((job, idx) => {
                const config = jobStatusConfig[job.status] || jobStatusConfig.scheduled;
                const clientData = job.clients as { first_name: string; last_name: string } | null;
                return (
                  <div
                    key={job.id}
                    className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors ${idx < todayJobs.length - 1 ? "border-b border-[#252525]" : ""}`}
                  >
                    {/* Time */}
                    <div className="w-14 shrink-0">
                      <p className="text-[12px] font-semibold text-[#888888] tabular-nums">{formatTime(job.start_time) || "TBD"}</p>
                      {job.duration_minutes && (
                        <p className="text-[10px] text-[#444444] tabular-nums">{job.duration_minutes}m</p>
                      )}
                    </div>
                    {/* Status dot */}
                    <div className={`h-2 w-2 rounded-full shrink-0 ${config.dot}`} />
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#D4D4D4] truncate">
                        {clientData ? `${clientData.first_name} ${clientData.last_name}` : "Client"}
                      </p>
                      <p className="text-[11px] text-[#888888] truncate">{job.service_type || "Service"}</p>
                    </div>
                    {/* Price */}
                    {job.price != null && (
                      <p className="text-[14px] font-bold text-[#D4D4D4] tabular-nums shrink-0 tracking-[-0.02em]">
                        ${Number(job.price).toFixed(0)}
                      </p>
                    )}
                    {/* Badge */}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${config.badge}`}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity — 2 cols */}
        <div className="lg:col-span-2 bg-[#1E1E1E] rounded-[6px] border border-[#2C2C2C] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#252525]">
            <h2 className="text-[14px] font-bold text-[#D4D4D4] tracking-[-0.02em]">Activity</h2>
            <Link href="/dashboard/notifications" className="text-[11px] font-semibold text-[#555555] hover:text-[#D4D4D4] transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 flex-1 text-center">
              <Briefcase className="h-6 w-6 text-[#333333] mb-2" strokeWidth={1.5} />
              <p className="text-[12px] text-[#555555]">Activity will appear here</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-[#252525]">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className={`mt-0.5 h-6 w-6 rounded-[4px] bg-[#252525] flex items-center justify-center shrink-0`}>
                    {item.icon === "receipt"
                      ? <Receipt className={`h-3.5 w-3.5 ${item.color}`} strokeWidth={1.8} />
                      : <Briefcase className={`h-3.5 w-3.5 ${item.color}`} strokeWidth={1.8} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#D4D4D4] leading-tight">{item.label}</p>
                    <p className="text-[11px] text-[#888888] truncate mt-0.5">{item.detail}</p>
                  </div>
                  <span className="text-[10px] text-[#444444] shrink-0 tabular-nums mt-0.5">{timeAgo(item.time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Charts row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue chart — 2 cols */}
        <div className="lg:col-span-2 bg-[#1E1E1E] rounded-[6px] border border-[#2C2C2C] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#252525]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <TrendingUp className="h-4 w-4 text-[#0071E3]" strokeWidth={2} />
                  <h2 className="text-[14px] font-bold text-[#D4D4D4] tracking-[-0.02em]">Revenue</h2>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-[28px] font-bold text-[#D4D4D4] tracking-[-0.04em] tabular-nums leading-none">
                    ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[12px] text-[#555555]">last 6 months</span>
                </div>
              </div>
              {revGrowth !== null && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold ${revGrowth >= 0 ? "bg-[#34C759]/10 text-[#34C759]" : "bg-red-500/10 text-red-400"}`}>
                  <TrendingUp className="h-3 w-3" strokeWidth={2} />
                  {revGrowth >= 0 ? "+" : ""}{revGrowth}% vs last month
                </div>
              )}
            </div>
          </div>
          <div className="p-5">
            <RevenueChart data={revenueChartData} />
          </div>
        </div>

        {/* Services donut — 1 col */}
        <div className="bg-[#1E1E1E] rounded-[6px] border border-[#2C2C2C] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#252525]">
            <h2 className="text-[14px] font-bold text-[#D4D4D4] tracking-[-0.02em]">Services</h2>
            <p className="text-[11px] text-[#555555] mt-0.5">Revenue by type</p>
          </div>
          <div className="p-5 flex-1 flex items-center justify-center">
            <ServiceDonut services={serviceDonutData} total={serviceTotal} />
          </div>
        </div>
      </div>

    </div>
  );
}
