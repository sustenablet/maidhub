import { createClient } from "@/lib/supabase/server";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  CalendarPlus,
  Receipt,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import type { RevenueDataPoint } from "@/components/dashboard/revenue-chart";
import { ServiceDonut } from "@/components/dashboard/service-donut";
import type { ServiceDataPoint } from "@/components/dashboard/service-donut";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all stats in parallel, gracefully handle missing tables
  // Calculate current week boundaries (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const mondayStr = monday.toISOString().split("T")[0];
  const sundayStr = sunday.toISOString().split("T")[0];

  const [clientsRes, jobsRes, estimatesRes, invoicesRes, todayJobsRes, recentJobsRes, recentInvoicesRes, paidInvoicesRes, allJobsServiceRes, weekJobsRes] =
    await Promise.allSettled([
      supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "scheduled"),
      supabase.from("estimates").select("*", { count: "exact", head: true }).eq("user_id", user!.id).in("status", ["draft", "sent"]),
      supabase.from("invoices").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "unpaid"),
      // Today's jobs
      supabase.from("jobs").select("*, clients(first_name, last_name)").eq("user_id", user!.id).eq("scheduled_date", new Date().toISOString().split("T")[0]).order("start_time", { ascending: true }).limit(5),
      // Recent jobs (last 5 completed/scheduled)
      supabase.from("jobs").select("*, clients(first_name, last_name)").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(5),
      // Recent invoices
      supabase.from("invoices").select("*, clients(first_name, last_name)").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
      // Paid invoices for revenue chart (last 6 months)
      supabase.from("invoices").select("total, payment_date").eq("user_id", user!.id).eq("status", "paid").gte("payment_date", new Date(Date.now() - 180 * 86400000).toISOString().split("T")[0]),
      // All jobs for service donut
      supabase.from("jobs").select("service_type, price").eq("user_id", user!.id),
      // This week's jobs
      supabase.from("jobs").select("id, scheduled_date, start_time, service_type, price, status, duration_minutes, clients(first_name, last_name)").eq("user_id", user!.id).gte("scheduled_date", mondayStr).lte("scheduled_date", sundayStr).order("scheduled_date").order("start_time"),
    ]);

  const clientCount = clientsRes.status === "fulfilled" ? (clientsRes.value.count ?? 0) : 0;
  const jobCount = jobsRes.status === "fulfilled" ? (jobsRes.value.count ?? 0) : 0;
  const estimateCount = estimatesRes.status === "fulfilled" ? (estimatesRes.value.count ?? 0) : 0;
  const invoiceCount = invoicesRes.status === "fulfilled" ? (invoicesRes.value.count ?? 0) : 0;
  const todayJobs = todayJobsRes.status === "fulfilled" ? (todayJobsRes.value.data ?? []) : [];
  const recentJobs = recentJobsRes.status === "fulfilled" ? (recentJobsRes.value.data ?? []) : [];
  const recentInvoices = recentInvoicesRes.status === "fulfilled" ? (recentInvoicesRes.value.data ?? []) : [];

  // Week summary data
  const weekJobs = weekJobsRes.status === "fulfilled" ? (weekJobsRes.value.data ?? []) : [];
  const weekTotal = weekJobs.length;
  const weekCompleted = weekJobs.filter((j: { status: string }) => j.status === "completed" || j.status === "invoiced").length;
  const weekRevenue = weekJobs
    .filter((j: { status: string }) => j.status === "completed" || j.status === "invoiced")
    .reduce((sum: number, j: { price: number | null }) => sum + (j.price || 0), 0);
  const weekScheduled = weekJobs.filter((j: { status: string }) => j.status === "scheduled").length;

  // Revenue chart data — group paid invoices by month
  const paidInvoices = paidInvoicesRes.status === "fulfilled" ? (paidInvoicesRes.value.data ?? []) : [];
  const monthlyRevenue: Record<string, number> = {};
  for (const inv of paidInvoices) {
    if (!inv.payment_date) continue;
    const date = new Date(inv.payment_date + "T00:00:00");
    const key = date.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (inv.total || 0);
  }
  // Sort by date and take last 6 months
  const revenueChartData: RevenueDataPoint[] = Object.entries(monthlyRevenue)
    .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }));
  const totalRevenue = revenueChartData.reduce((sum, d) => sum + d.amount, 0);

  // Service donut data — group jobs by service_type
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

  // Build activity feed from recent items
  type ActivityItem = { type: string; label: string; detail: string; time: string; icon: string; color: string };
  const activity: ActivityItem[] = [];

  for (const job of recentJobs) {
    const name = job.clients ? `${job.clients.first_name} ${job.clients.last_name}` : "Client";
    const statusLabel: Record<string, string> = {
      scheduled: "Job scheduled",
      in_progress: "Job started",
      completed: "Job completed",
      invoiced: "Job invoiced",
      cancelled: "Job cancelled",
    };
    activity.push({
      type: "job",
      label: statusLabel[job.status] || "Job updated",
      detail: `${name} — ${job.service_type || "Service"}`,
      time: job.updated_at,
      icon: "briefcase",
      color: job.status === "completed" ? "bg-[#34C759]/10 text-[#34C759]" : job.status === "cancelled" ? "bg-red-500/10 text-red-400" : "bg-[#0071E3]/10 text-[#0071E3]",
    });
  }

  for (const inv of recentInvoices) {
    const name = inv.clients ? `${inv.clients.first_name} ${inv.clients.last_name}` : "Client";
    activity.push({
      type: "invoice",
      label: inv.status === "paid" ? "Payment received" : "Invoice created",
      detail: `${name} — $${(inv.total || 0).toFixed(2)}`,
      time: inv.created_at,
      icon: "receipt",
      color: inv.status === "paid" ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#FF9F0A]/10 text-[#FF9F0A]",
    });
  }

  // Sort by time, take top 8
  activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const recentActivity = activity.slice(0, 8);

  const stats = [
    { title: "Clients", value: clientCount, href: "/dashboard/clients" },
    { title: "Upcoming Jobs", value: jobCount, href: "/dashboard/schedule" },
    { title: "Open Estimates", value: estimateCount, href: "/dashboard/estimates" },
    { title: "Unpaid Invoices", value: invoiceCount, href: "/dashboard/invoices" },
  ];

  const jobStatusConfig: Record<string, { badge: string; label: string }> = {
    scheduled: { badge: "bg-[#0071E3]/10 text-[#0071E3] ring-1 ring-inset ring-[#0071E3]/20", label: "Scheduled" },
    in_progress: { badge: "bg-[#FF9F0A]/10 text-[#FF9F0A] ring-1 ring-inset ring-[#FF9F0A]/20", label: "In Progress" },
    completed: { badge: "bg-[#34C759]/10 text-[#34C759] ring-1 ring-inset ring-[#34C759]/20", label: "Completed" },
    invoiced: { badge: "bg-[#30B0C7]/10 text-[#30B0C7] ring-1 ring-inset ring-[#30B0C7]/20", label: "Invoiced" },
    cancelled: { badge: "bg-[#555555]/20 text-[#888888] ring-1 ring-inset ring-[#555555]/20", label: "Cancelled" },
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
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  }

  const ActivityIcon = ({ type, className }: { type: string; className: string }) => {
    if (type === "receipt") return <Receipt className={className} />;
    return <Briefcase className={className} />;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[21px] font-bold text-[#D4D4D4] tracking-[-0.03em]">
            Dashboard
          </h1>
          <p className="text-[12.5px] text-[#555555] mt-0.5">
            Here&apos;s your business at a glance.
          </p>
        </div>
        {/* Quick Actions */}
        <div className="flex items-center gap-1 text-[12px]">
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-[#555555] hover:text-[#D4D4D4] rounded-[4px] hover:bg-white/[0.05] transition-all"
          >
            <UserPlus className="h-3 w-3" strokeWidth={1.6} />
            Client
          </Link>
          <Link
            href="/dashboard/schedule"
            className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-[#555555] hover:text-[#D4D4D4] rounded-[4px] hover:bg-white/[0.05] transition-all"
          >
            <CalendarPlus className="h-3 w-3" strokeWidth={1.6} />
            Job
          </Link>
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-[#555555] hover:text-[#D4D4D4] rounded-[4px] hover:bg-white/[0.05] transition-all"
          >
            <Receipt className="h-3 w-3" strokeWidth={1.6} />
            Invoice
          </Link>
          <Link
            href="/dashboard/estimates"
            className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-[#555555] hover:text-[#D4D4D4] rounded-[4px] hover:bg-white/[0.05] transition-all"
          >
            <FileText className="h-3 w-3" strokeWidth={1.6} />
            Estimate
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <Link key={stat.title} href={stat.href} className="group">
            <div className={`bg-[#1E1E1E] rounded-[6px] p-4 border border-[#2C2C2C] shadow-[0_1px_3px_rgba(0,0,0,0.4)] group-hover:border-[#3A3A3A] group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-all ${i === 0 ? "border-l-2 border-l-[#0071E3]" : ""}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-[#555555] mb-3">
                {stat.title}
              </p>
              <div className="text-[36px] font-bold text-[#D4D4D4] tabular-nums leading-none tracking-[-0.03em]">
                {stat.value}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Week summary strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 bg-[#1E1E1E]/60 rounded-[6px] border border-[#2C2C2C]">
        <span className="text-[10px] font-bold text-[#555555] uppercase tracking-[0.1em]">
          This Week
        </span>
        <span className="text-[12px] text-[#888888]">
          <span className="font-semibold text-[#D4D4D4]">{weekTotal}</span> jobs
        </span>
        <span className="text-[12px] text-[#888888]">
          <span className="font-semibold text-[#34C759]">{weekCompleted}</span> completed
        </span>
        <span className="text-[12px] text-[#888888]">
          <span className="font-bold text-[#D4D4D4]">${weekRevenue.toLocaleString()}</span> earned
        </span>
        {weekScheduled > 0 && (
          <span className="text-[12px] text-[#888888]">
            <span className="font-semibold text-[#FF9F0A]">{weekScheduled}</span> remaining
          </span>
        )}
      </div>

      {/* Today's Jobs + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Jobs */}
        <div className="bg-[#1E1E1E] rounded-[6px] border border-[#2C2C2C] shadow-[0_1px_3px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2C2C2C]">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#0071E3]" strokeWidth={2} />
              <h2 className="text-[13px] font-semibold text-[#D4D4D4]">
                Today&apos;s Jobs
              </h2>
            </div>
            <Link
              href="/dashboard/schedule"
              className="text-[11px] font-medium text-[#555555] hover:text-[#D4D4D4] transition-colors"
            >
              View all →
            </Link>
          </div>

          {todayJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-[#333333] mb-2" strokeWidth={1.5} />
              <p className="text-[12px] text-[#555555]">
                No jobs scheduled for today
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#252525]">
              {todayJobs.map((job: { id: string; start_time: string | null; service_type: string | null; status: string; price: number | null; clients: { first_name: string; last_name: string } | null }) => {
                const config = jobStatusConfig[job.status] || jobStatusConfig.scheduled;
                return (
                  <div key={job.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="text-[11px] font-medium text-[#555555] w-14 shrink-0 tabular-nums">
                      {formatTime(job.start_time) || "TBD"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#D4D4D4] truncate">
                        {job.clients ? `${job.clients.first_name} ${job.clients.last_name}` : "Client"}
                      </p>
                      <p className="text-[11px] text-[#888888] truncate">
                        {job.service_type || "Service"}
                      </p>
                    </div>
                    {job.price != null && (
                      <span className="text-[13px] font-semibold text-[#D4D4D4] shrink-0 tabular-nums">
                        ${Number(job.price).toFixed(0)}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.badge} shrink-0`}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1E1E1E] rounded-[6px] border border-[#2C2C2C] shadow-[0_1px_3px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#2C2C2C]">
            <AlertCircle className="h-3.5 w-3.5 text-[#555555]" strokeWidth={2} />
            <h2 className="text-[13px] font-semibold text-[#D4D4D4]">
              Recent Activity
            </h2>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Briefcase className="h-8 w-8 text-[#333333] mb-2" strokeWidth={1.5} />
              <p className="text-[12px] text-[#555555]">
                Activity will appear here as you use MaidHub
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#252525]">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className={`h-7 w-7 rounded-[4px] ${item.color} flex items-center justify-center shrink-0`}>
                    <ActivityIcon type={item.icon} className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#D4D4D4]">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-[#888888] truncate">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#444444] shrink-0 tabular-nums">
                    {timeAgo(item.time)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#1E1E1E] rounded-[6px] border border-[#2C2C2C] shadow-[0_1px_3px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2C2C2C]">
            <div>
              <h2 className="text-[13px] font-semibold text-[#D4D4D4]">Revenue</h2>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-[22px] font-bold text-[#D4D4D4] leading-none tabular-nums tracking-[-0.03em]">
                  ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {revenueChartData.length === 0 && (
                  <span className="text-[11px] text-[#444444]">No paid invoices yet</span>
                )}
              </div>
            </div>
          </div>
          <div className="p-5">
            <RevenueChart data={revenueChartData} />
          </div>
        </div>

        <div className="bg-[#1E1E1E] rounded-[6px] border border-[#2C2C2C] shadow-[0_1px_3px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#2C2C2C]">
            <h2 className="text-[13px] font-semibold text-[#D4D4D4]">Services</h2>
          </div>
          <div className="p-5">
            <ServiceDonut services={serviceDonutData} total={serviceTotal} />
          </div>
        </div>
      </div>
    </div>
  );
}
