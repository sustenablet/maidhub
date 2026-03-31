import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Features — MaidHub" };

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    tag: "Client Management",
    title: "Know every client, every detail",
    body: "Complete client profiles with addresses, access instructions, preferences, job history, and payment status. Never lose a detail.",
    bullets: ["Full profile with photos & notes", "Complete job history per client", "Preference & allergy tracking", "Client portal for self-service"],
    accent: "#EBF4FF",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    tag: "Scheduling",
    title: "Calendar that fills itself",
    body: "Create recurring schedules once. MaidHub auto-books every future job, sends reminders, and prevents double-booking.",
    bullets: ["Recurring weekly/bi-weekly/monthly jobs", "Conflict detection & alerts", "Client self-service reschedule", "SMS reminders before each job"],
    accent: "#EBF4FF",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    tag: "Invoicing & Payments",
    title: "Invoice in seconds, paid in hours",
    body: "Auto-generate invoices from completed jobs. Send via SMS or email. Clients pay online — you get paid within 24 hours.",
    bullets: ["Auto-invoice after job completion", "SMS & email delivery", "Online payment (card, bank, Apple Pay)", "Automated payment reminders"],
    accent: "#EBF4FF",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    tag: "Analytics",
    title: "Your business, by the numbers",
    body: "Real-time revenue tracking, profit margins, client retention, and job completion rates. Know exactly how your business is performing.",
    bullets: ["Monthly & yearly revenue reports", "Client retention metrics", "Profitability by service type", "Export for tax season"],
    accent: "#EBF4FF",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    tag: "Automated Notifications",
    title: "Stay connected without the hassle",
    body: "Appointment reminders, invoice notifications, payment confirmations — all sent automatically to you and your clients.",
    bullets: ["Pre-job SMS reminders to clients", "Payment confirmation receipts", "Overdue invoice alerts", "Custom message templates"],
    accent: "#EBF4FF",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    tag: "Mobile First",
    title: "Manage from anywhere, on any device",
    body: "MaidHub is built mobile-first. Works perfectly on your iPhone or Android. No app download required — access it from your browser.",
    bullets: ["Full-featured mobile web app", "Works offline for job notes", "GPS-optimized for cleaners", "Instant sync across devices"],
    accent: "#EBF4FF",
  },
];

function ComparisonTable() {
  const rows = [
    { feature: "Client management", maid: true, sheet: false, jobber: true },
    { feature: "Recurring scheduling", maid: true, sheet: false, jobber: true },
    { feature: "Auto-invoicing", maid: true, sheet: false, jobber: true },
    { feature: "Online payments", maid: true, sheet: false, jobber: true },
    { feature: "SMS notifications", maid: true, sheet: false, jobber: false },
    { feature: "Client portal", maid: true, sheet: false, jobber: false },
    { feature: "Mobile app", maid: true, sheet: false, jobber: true },
    { feature: "Built for solo cleaners", maid: true, sheet: true, jobber: false },
    { feature: "Price", maid: "$29/mo", sheet: "Free", jobber: "$149/mo" },
  ];

  return (
    <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid #E9E7E0", background: "#fff" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #F4F2ED" }}>
            <th style={{ padding: "16px 24px", textAlign: "left", color: "#9CA3AF", fontWeight: 600, fontSize: 13 }}>Feature</th>
            <th style={{ padding: "16px 24px", textAlign: "center", color: "#0071E3", fontWeight: 700, fontSize: 14, background: "#EBF4FF" }}>
              MaidHub
              <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", marginTop: 2 }}>Recommended</div>
            </th>
            <th style={{ padding: "16px 24px", textAlign: "center", color: "#6B7280", fontWeight: 600, fontSize: 13 }}>Spreadsheet</th>
            <th style={{ padding: "16px 24px", textAlign: "center", color: "#6B7280", fontWeight: 600, fontSize: 13 }}>Jobber</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.feature} style={{ borderBottom: i < rows.length - 1 ? "1px solid #F4F2ED" : "none" }}>
              <td style={{ padding: "14px 24px", color: "#2D3142", fontWeight: 500 }}>{row.feature}</td>
              <td style={{ padding: "14px 24px", textAlign: "center", background: "#EBF4FF" }}>
                {typeof row.maid === "boolean"
                  ? <span style={{ color: row.maid ? "#10B981" : "#9CA3AF", fontSize: 16 }}>{row.maid ? "✓" : "✕"}</span>
                  : <span style={{ fontWeight: 700, color: "#0071E3" }}>{row.maid}</span>}
              </td>
              <td style={{ padding: "14px 24px", textAlign: "center" }}>
                {typeof row.sheet === "boolean"
                  ? <span style={{ color: row.sheet ? "#10B981" : "#D1D5DB", fontSize: 16 }}>{row.sheet ? "✓" : "✕"}</span>
                  : <span style={{ fontWeight: 600, color: "#6B7280" }}>{row.sheet}</span>}
              </td>
              <td style={{ padding: "14px 24px", textAlign: "center" }}>
                {typeof row.jobber === "boolean"
                  ? <span style={{ color: row.jobber ? "#10B981" : "#D1D5DB", fontSize: 16 }}>{row.jobber ? "✓" : "✕"}</span>
                  : <span style={{ fontWeight: 600, color: "#6B7280" }}>{row.jobber}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg, #FEFCF7 0%, #EBF4FF 100%)", padding: "80px 0 100px", textAlign: "center" }}>
        <div className="mkt-container">
          <p className="mkt-eyebrow" style={{ justifyContent: "center" }}>Everything You Need</p>
          <h1 className="mkt-h1" style={{ maxWidth: 640, margin: "0 auto 24px" }}>
            One platform.<br />Every tool your business needs.
          </h1>
          <p className="mkt-lead" style={{ margin: "0 auto 40px", textAlign: "center" }}>
            We've thought through every part of running a solo cleaning business and built the tools you actually need — nothing more, nothing less.
          </p>
          <Link href="/auth/signup" className="mkt-btn mkt-btn-primary mkt-btn-lg">
            Start free trial →
          </Link>
        </div>
      </section>

      {/* Feature cards grid */}
      <section className="mkt-section mkt-bg-cream">
        <div className="mkt-container">
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
            className="mkt-feat-cards"
          >
            {FEATURES.map((f) => (
              <div key={f.tag} className="mkt-card">
                <div className="mkt-icon-wrap">{f.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#0071E3", marginBottom: 8 }}>
                  {f.tag}
                </div>
                <h3 className="mkt-h3" style={{ marginBottom: 12 }}>{f.title}</h3>
                <p className="mkt-body" style={{ marginBottom: 20 }}>{f.body}</p>
                <ul className="mkt-check-list">
                  {f.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:900px){.mkt-feat-cards{grid-template-columns:1fr 1fr !important;}} @media(max-width:600px){.mkt-feat-cards{grid-template-columns:1fr !important;}}`}</style>
      </section>

      {/* Comparison */}
      <section className="mkt-section mkt-bg-cream-2">
        <div className="mkt-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p className="mkt-eyebrow" style={{ justifyContent: "center" }}>Comparison</p>
            <h2 className="mkt-h2" style={{ maxWidth: 500, margin: "0 auto" }}>
              MaidHub vs the alternatives
            </h2>
          </div>
          <ComparisonTable />
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#0C1B2A", padding: "100px 0", textAlign: "center" }}>
        <div className="mkt-container">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, color: "#fff", marginBottom: 24, letterSpacing: "-1px" }}>
            All features. One simple price.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,.55)", marginBottom: 40 }}>
            30-day free trial. No credit card required. Cancel anytime.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/signup" className="mkt-btn mkt-btn-gold mkt-btn-lg">Get started free →</Link>
            <Link href="/pricing" className="mkt-btn" style={{ padding: "16px 32px", background: "rgba(255,255,255,.08)", color: "#fff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 9999, fontSize: 16, fontWeight: 600 }}>View pricing</Link>
          </div>
        </div>
      </section>
    </>
  );
}
