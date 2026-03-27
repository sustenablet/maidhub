import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr.split("T")[0]);
}

export default async function FinancesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const currentOrgId = cookieStore.get("mh_org_id")?.value;

  // Fetch all financial data in parallel
  const [
    allInvoicesRes,
    paidInvoicesRes,
    unpaidInvoicesRes,
    overdueRes,
    recentInvoicesRes,
    monthInvoicesRes,
  ] = await Promise.allSettled([
    // All invoices (non-void)
    supabase.from("invoices").select("total, status").eq("user_id", user.id).eq("organization_id", currentOrgId || "").neq("status", "void"),
    // Paid invoices
    supabase.from("invoices").select("total").eq("user_id", user.id).eq("organization_id", currentOrgId || "").eq("status", "paid"),
    // Unpaid invoices
    supabase.from("invoices").select("total, due_date").eq("user_id", user.id).eq("organization_id", currentOrgId || "").eq("status", "unpaid"),
    // Overdue (unpaid + past due date)
    supabase.from("invoices").select("total").eq("user_id", user.id).eq("organization_id", currentOrgId || "").eq("status", "unpaid").lt("due_date", new Date().toISOString().split("T")[0]),
    // Recent invoices for table
    supabase.from("invoices").select("id, total, status, due_date, payment_date, created_at, clients(first_name, last_name)").eq("user_id", user.id).eq("organization_id", currentOrgId || "").order("created_at", { ascending: false }).limit(10),
    // This month's paid invoices
    supabase.from("invoices").select("total").eq("user_id", user.id).eq("organization_id", currentOrgId || "").eq("status", "paid").gte("payment_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]),
  ]);

  // Calculate totals
  const allInvoices = allInvoicesRes.status === "fulfilled" ? (allInvoicesRes.value.data ?? []) : [];
  const paidInvoices = paidInvoicesRes.status === "fulfilled" ? (paidInvoicesRes.value.data ?? []) : [];
  const unpaidInvoices = unpaidInvoicesRes.status === "fulfilled" ? (unpaidInvoicesRes.value.data ?? []) : [];
  const overdueInvoices = overdueRes.status === "fulfilled" ? (overdueRes.value.data ?? []) : [];
  const recentInvoices = recentInvoicesRes.status === "fulfilled" ? (recentInvoicesRes.value.data ?? []) : [];
  const monthInvoices = monthInvoicesRes.status === "fulfilled" ? (monthInvoicesRes.value.data ?? []) : [];

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const thisMonthRevenue = monthInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const avgInvoice = allInvoices.length > 0
    ? allInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0) / allInvoices.length
    : 0;

  // Status breakdown
  const invoiceCount = allInvoices.length;
  const paidCount = paidInvoices.length;
  const unpaidCount = unpaidInvoices.length;
  const overdueCount = overdueInvoices.length;

  const statusConfig: Record<string, { className: string; label: string }> = {
    paid: { className: "bg-[#34C759]/10 text-[#34C759] ring-1 ring-inset ring-[#34C759]/20", label: "Paid" },
    unpaid: { className: "bg-[#FF9F0A]/10 text-[#FF9F0A] ring-1 ring-inset ring-[#FF9F0A]/20", label: "Unpaid" },
    void: { className: "bg-[var(--mh-surface-raised)] text-[var(--mh-text-muted)] ring-1 ring-inset ring-[#2C2C2C]", label: "Void" },
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] md:text-[21px] font-bold md:font-semibold text-[var(--mh-text)] tracking-[-0.03em] md:tracking-[-0.02em]">Finances</h1>
          <p className="hidden md:block text-[13px] text-[var(--mh-text-muted)] mt-0.5">Overview of your revenue and invoices</p>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          detail={`${paidCount} paid invoice${paidCount !== 1 ? "s" : ""}`}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={Clock}
          detail={`${unpaidCount} unpaid`}
          alert={overdueCount > 0}
        />
        <StatCard
          label="This Month"
          value={formatCurrency(thisMonthRevenue)}
          icon={TrendingUp}
          detail={new Date().toLocaleDateString("en-US", { month: "long" })}
        />
        <StatCard
          label="Avg. Invoice"
          value={formatCurrency(avgInvoice)}
          icon={Receipt}
          detail={`${invoiceCount} total`}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Recent transactions */}
        <div className="lg:col-span-2 bg-[var(--mh-surface)] rounded-[6px] border border-[var(--mh-border)] shadow-[0_1px_3px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--mh-divider)]">
            <h2 className="text-[14px] font-bold text-[var(--mh-text)]">
              Recent Transactions
            </h2>
            <Link
              href="/dashboard/invoices"
              className="flex items-center gap-1 text-[12px] font-semibold text-[var(--mh-text-subtle)] hover:text-[var(--mh-text)] transition-colors"
            >
              View All
              <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="h-12 w-12 rounded-[6px] bg-[var(--mh-surface-raised)] flex items-center justify-center mb-3">
                <Receipt className="h-6 w-6 text-[var(--mh-text-faint)]" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-semibold text-[var(--mh-text-muted)]">
                No transactions yet
              </p>
              <p className="text-[12px] text-[var(--mh-text-subtle)] mt-1 max-w-xs">
                Create your first invoice to start tracking revenue
              </p>
              <Link
                href="/dashboard/invoices"
                className="mt-4 flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold bg-[#0071E3] text-white rounded-[6px] hover:bg-[#0071E3]/90 transition-colors"
              >
                Create Invoice
                <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--mh-divider)]">
              {recentInvoices.map((inv: {
                id: string;
                total: number | null;
                status: string;
                due_date: string | null;
                payment_date: string | null;
                created_at: string;
                clients: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
              }) => {
                const clientRaw = inv.clients;
                const client = Array.isArray(clientRaw) ? clientRaw[0] ?? null : clientRaw;
                const clientName = client ? `${client.first_name} ${client.last_name}` : "Unknown";
                const config = statusConfig[inv.status] || statusConfig.unpaid;

                return (
                  <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--mh-hover-overlay)] transition-colors">
                    <div className={`h-8 w-8 rounded-[6px] flex items-center justify-center shrink-0 ${
                      inv.status === "paid" ? "bg-[#34C759]/10" : inv.status === "unpaid" ? "bg-[#FF9F0A]/10" : "bg-[var(--mh-surface-raised)]"
                    }`}>
                      {inv.status === "paid" ? (
                        <CheckCircle2 className="h-4 w-4 text-[#34C759]" strokeWidth={1.8} />
                      ) : (
                        <Clock className="h-4 w-4 text-[#FF9F0A]" strokeWidth={1.8} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--mh-text)] truncate">
                        {clientName}
                      </p>
                      <p className="text-[11px] text-[var(--mh-text-subtle)]">
                        {timeAgo(inv.created_at)}
                        {inv.due_date && inv.status === "unpaid" && (
                          <> &middot; Due {formatDate(inv.due_date)}</>
                        )}
                      </p>
                    </div>

                    <span className="text-[14px] font-bold text-[var(--mh-text)] tabular-nums shrink-0">
                      {inv.total != null ? formatCurrency(Number(inv.total)) : "-"}
                    </span>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.className} shrink-0`}
                    >
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Summary panel */}
        <div className="space-y-4">
          {/* Payment Status */}
          <div className="bg-[var(--mh-surface)] rounded-[6px] border border-[var(--mh-border)] shadow-[0_1px_3px_rgba(0,0,0,0.4)] p-5">
            <h3 className="text-[13px] font-bold text-[var(--mh-text)] mb-4">
              Invoice Status
            </h3>
            <div className="space-y-3">
              <StatusRow
                label="Paid"
                count={paidCount}
                total={invoiceCount}
                color="bg-[#34C759]"
              />
              <StatusRow
                label="Unpaid"
                count={unpaidCount - overdueCount}
                total={invoiceCount}
                color="bg-[#FF9F0A]"
              />
              <StatusRow
                label="Overdue"
                count={overdueCount}
                total={invoiceCount}
                color="bg-red-400"
              />
            </div>

            {invoiceCount === 0 && (
              <p className="text-[12px] text-[var(--mh-text-faint)] text-center py-4">
                No invoices yet
              </p>
            )}
          </div>

          {/* Overdue alert */}
          {overdueCount > 0 && (
            <div className="bg-red-500/100/[0.06] rounded-[6px] border border-red-500/20 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" strokeWidth={1.8} />
                <div>
                  <p className="text-[13px] font-semibold text-red-400">
                    {overdueCount} overdue invoice{overdueCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[12px] text-red-400/70 mt-0.5">
                    {formatCurrency(totalOverdue)} outstanding past due date
                  </p>
                  <Link
                    href="/dashboard/invoices"
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-400 hover:text-red-300 mt-2 transition-colors"
                  >
                    Review invoices
                    <ArrowRight className="h-3 w-3" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            <Link
              href="/dashboard/invoices"
              className="flex items-center justify-between p-3.5 bg-[var(--mh-surface)] rounded-[6px] border border-[var(--mh-border)] hover:border-[var(--mh-border)] hover:bg-[var(--mh-surface-raised)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-[6px] bg-[var(--mh-surface-raised)] flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-[var(--mh-text-muted)]" strokeWidth={1.8} />
                </div>
                <span className="text-[13px] font-semibold text-[var(--mh-text-muted)]">
                  Create Invoice
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--mh-text-faint)] group-hover:text-[var(--mh-text-muted)] transition-colors" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────── */

function StatCard({
  label,
  value,
  icon: Icon,
  detail,
  alert,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  detail?: string;
  alert?: boolean;
}) {
  return (
    <div className="bg-[var(--mh-surface)] rounded-[6px] border border-[var(--mh-border)] shadow-[0_1px_3px_rgba(0,0,0,0.4)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`h-8 w-8 rounded-[6px] flex items-center justify-center ${
          alert ? "bg-red-500/10" : "bg-[var(--mh-surface-raised)]"
        }`}>
          <Icon className={`h-4 w-4 ${alert ? "text-red-400" : "text-[var(--mh-text-muted)]"}`} strokeWidth={1.8} />
        </div>
        {alert && (
          <AlertCircle className="h-3.5 w-3.5 text-red-400" strokeWidth={1.8} />
        )}
      </div>
      <p className="text-[20px] font-normal text-[var(--mh-text)] tabular-nums">
        {value}
      </p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-[11px] text-[var(--mh-text-subtle)] font-medium">
          {label}
        </p>
        {detail && (
          <p className="text-[10px] text-[var(--mh-text-faint)]">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[var(--mh-text-muted)] font-medium">
          {label}
        </span>
        <span className="text-[12px] text-[var(--mh-text-subtle)] tabular-nums">
          {count}
        </span>
      </div>
      <div className="h-1.5 bg-[var(--mh-hover-overlay)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
