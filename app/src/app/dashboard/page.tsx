import { createClient } from "@/lib/supabase/server";
import { Users, CalendarDays, FileText, Receipt } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ServiceDonut } from "@/components/dashboard/service-donut";
import { UpcomingJobsTable } from "@/components/dashboard/upcoming-jobs-table";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [clientsRes, jobsRes, estimatesRes, invoicesRes] =
    await Promise.allSettled([
      supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("status", "scheduled"),
      supabase
        .from("estimates")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .in("status", ["draft", "sent"]),
      supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("status", "unpaid"),
    ]);

  const clientCount =
    clientsRes.status === "fulfilled" ? (clientsRes.value.count ?? 0) : 0;
  const jobCount =
    jobsRes.status === "fulfilled" ? (jobsRes.value.count ?? 0) : 0;
  const estimateCount =
    estimatesRes.status === "fulfilled" ? (estimatesRes.value.count ?? 0) : 0;
  const invoiceCount =
    invoicesRes.status === "fulfilled" ? (invoicesRes.value.count ?? 0) : 0;

  const stats = [
    {
      title: "Clients",
      value: clientCount,
      icon: Users,
      iconClass: "bg-blue-50 text-blue-500",
      desc: "Total active clients",
    },
    {
      title: "Upcoming Jobs",
      value: jobCount,
      icon: CalendarDays,
      iconClass: "bg-teal-50 text-teal-500",
      desc: "Scheduled",
    },
    {
      title: "Open Estimates",
      value: estimateCount,
      icon: FileText,
      iconClass: "bg-purple-50 text-purple-500",
      desc: "Draft or sent",
    },
    {
      title: "Unpaid Invoices",
      value: invoiceCount,
      icon: Receipt,
      iconClass: "bg-red-50 text-red-500",
      desc: "Awaiting payment",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold text-[#1A2332]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Dashboard
        </h1>
        <button
          className="px-4 py-2 text-sm font-semibold text-[#1A2332] bg-white rounded-xl border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Custom Widget
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`h-10 w-10 rounded-xl ${stat.iconClass} flex items-center justify-center`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <button className="text-gray-200 hover:text-gray-400 transition-colors mt-0.5">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <circle cx="8" cy="3.5" r="1.25" />
                  <circle cx="8" cy="8" r="1.25" />
                  <circle cx="8" cy="12.5" r="1.25" />
                </svg>
              </button>
            </div>
            <div
              className="text-3xl font-bold text-[#1A2332] mb-1 tabular-nums"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {stat.value}
            </div>
            <div
              className="text-xs text-gray-400 font-medium"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80">
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-sm font-semibold text-[#1A2332]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Revenue Statistics
            </h2>
            <div className="flex items-center gap-2">
              <select
                className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                <option>Monthly</option>
                <option>Weekly</option>
              </select>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-baseline gap-2.5 mb-5">
            <span
              className="text-2xl font-bold text-[#1A2332]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              $9,355.00
            </span>
            <span
              className="text-xs font-semibold text-red-500"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              ↓ 3.5%
            </span>
            <span
              className="text-xs text-gray-400"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Last updated: Mar 17, 2026
            </span>
          </div>
          <RevenueChart />
        </div>

        {/* Service donut */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-sm font-semibold text-[#1A2332]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Service Category
            </h2>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          <ServiceDonut />
        </div>
      </div>

      {/* Jobs table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80">
        <UpcomingJobsTable />
      </div>
    </div>
  );
}
