import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "How It Works — MaidHub" };

const STEPS = [
  {
    n: "01",
    tag: "Sign Up",
    title: "Create your account in 60 seconds",
    body: "Enter your name, email, and password. No credit card required. You're immediately taken to your dashboard — clean, organized, ready.",
    bullets: ["No credit card required", "Instant access to all features", "Guided onboarding walkthrough"],
    mockup: (
      <div className="mkt-browser" style={{ fontSize: 13 }}>
        <div className="mkt-browser-bar">
          <div className="mkt-browser-dots"><span /><span /><span /></div>
          <div className="mkt-browser-url">app.maidhub.io/signup</div>
        </div>
        <div style={{ background: "#fff", padding: 32, display: "flex", flexDirection: "column", gap: 16, height: 320 }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: "#0071E3", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" fill="white"/></svg>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#0C1B2A" }}>Create your account</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>30-day free trial, no card needed</div>
          </div>
          {[{ label: "Full name", placeholder: "Sarah Johnson" }, { label: "Email", placeholder: "sarah@example.com" }, { label: "Password", placeholder: "••••••••" }].map((f) => (
            <div key={f.label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0C1B2A", marginBottom: 4 }}>{f.label}</div>
              <div style={{ padding: "9px 12px", border: "1.5px solid #E9E7E0", borderRadius: 8, fontSize: 13, color: "#9CA3AF" }}>{f.placeholder}</div>
            </div>
          ))}
          <div style={{ background: "#0071E3", color: "#fff", padding: "11px", borderRadius: 8, textAlign: "center", fontSize: 13, fontWeight: 600 }}>
            Create account →
          </div>
        </div>
      </div>
    ),
  },
  {
    n: "02",
    tag: "Add Clients",
    title: "Set up your client list",
    body: "Add your existing clients in minutes. Name, address, contact, entry instructions, service type, and rate. Or import from a spreadsheet if you prefer.",
    bullets: ["Full client profiles", "Spreadsheet import available", "Tag by service type or location"],
    mockup: (
      <div className="mkt-browser" style={{ fontSize: 13 }}>
        <div className="mkt-browser-bar">
          <div className="mkt-browser-dots"><span /><span /><span /></div>
          <div className="mkt-browser-url">app.maidhub.io/clients/new</div>
        </div>
        <div style={{ background: "#fff", padding: 24, height: 320, overflow: "hidden" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0C1B2A", marginBottom: 16 }}>New Client</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[{ l: "First name", v: "Sarah" }, { l: "Last name", v: "Johnson" }, { l: "Phone", v: "(407) 555-0192" }, { l: "Email", v: "sarah@example.com" }].map((f) => (
              <div key={f.l}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", marginBottom: 3 }}>{f.l}</div>
                <div style={{ padding: "7px 10px", border: "1px solid #E9E7E0", borderRadius: 6, fontSize: 12, color: "#0C1B2A" }}>{f.v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", marginBottom: 3 }}>Service address</div>
            <div style={{ padding: "7px 10px", border: "1px solid #E9E7E0", borderRadius: 6, fontSize: 12, color: "#0C1B2A" }}>842 Oak Ave, Orlando, FL 32801</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[{ l: "Service type", v: "Deep Clean" }, { l: "Rate", v: "$150.00" }].map((f) => (
              <div key={f.l}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", marginBottom: 3 }}>{f.l}</div>
                <div style={{ padding: "7px 10px", border: "1.5px solid #0071E3", borderRadius: 6, fontSize: 12, color: "#0071E3", fontWeight: 600 }}>{f.v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#0071E3", color: "#fff", padding: "9px", borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 600 }}>Save Client</div>
        </div>
      </div>
    ),
  },
  {
    n: "03",
    tag: "Schedule Jobs",
    title: "Set up recurring schedules",
    body: "Choose how often each client wants their home cleaned — weekly, bi-weekly, monthly. MaidHub creates all future appointments automatically.",
    bullets: ["Weekly, bi-weekly, monthly options", "Jobs auto-created for the whole year", "Edit or reschedule anytime"],
    mockup: (
      <div className="mkt-browser" style={{ fontSize: 13 }}>
        <div className="mkt-browser-bar">
          <div className="mkt-browser-dots"><span /><span /><span /></div>
          <div className="mkt-browser-url">app.maidhub.io/schedule/new</div>
        </div>
        <div style={{ background: "#fff", padding: 24, height: 320 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0C1B2A", marginBottom: 16 }}>Schedule for Sarah J.</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>Frequency</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Weekly", "Bi-weekly", "Monthly"].map((opt, i) => (
                <div key={opt} style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, border: `1.5px solid ${i === 1 ? "#0071E3" : "#E9E7E0"}`, color: i === 1 ? "#0071E3" : "#6B7280", background: i === 1 ? "#EBF4FF" : "transparent" }}>{opt}</div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[{ l: "Start date", v: "Tue, Mar 18" }, { l: "Time", v: "9:00 AM" }].map((f) => (
              <div key={f.l}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#6B7280", marginBottom: 3 }}>{f.l}</div>
                <div style={{ padding: "7px 10px", border: "1px solid #E9E7E0", borderRadius: 6, fontSize: 12, color: "#0C1B2A" }}>{f.v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#F8F5EE", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 11, color: "#6B7280" }}>
            <span style={{ color: "#0071E3", fontWeight: 600 }}>26 jobs</span> will be created automatically for the next 12 months.
          </div>
          <div style={{ background: "#0071E3", color: "#fff", padding: "9px", borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 600 }}>Create Schedule</div>
        </div>
      </div>
    ),
  },
  {
    n: "04",
    tag: "Get Paid",
    title: "Invoice and collect automatically",
    body: "After each job, MaidHub generates a professional invoice. Send it in one tap. Your clients pay online and you receive the funds within 24 hours.",
    bullets: ["Auto-invoice after job completion", "SMS delivery in one tap", "Online payment link for clients", "Funds in your account in 24 hours"],
    mockup: (
      <div className="mkt-browser" style={{ fontSize: 13 }}>
        <div className="mkt-browser-bar">
          <div className="mkt-browser-dots"><span /><span /><span /></div>
          <div className="mkt-browser-url">app.maidhub.io/invoices</div>
        </div>
        <div style={{ background: "#fff", padding: 20, height: 320, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0C1B2A" }}>Invoices</div>
            <div style={{ fontSize: 12, color: "#0071E3", fontWeight: 600 }}>+ New Invoice</div>
          </div>
          {[
            { name: "Sarah Johnson", date: "Mar 15", amount: "$150", status: "Paid", statusColor: "#D1FAE5", statusText: "#059669" },
            { name: "Mark Davis", date: "Mar 16", amount: "$200", status: "Sent", statusColor: "#EBF4FF", statusText: "#0071E3" },
            { name: "Emily Chen", date: "Mar 17", amount: "$175", status: "Unpaid", statusColor: "#FEF3C7", statusText: "#B45309" },
            { name: "Robert Brown", date: "Mar 18", amount: "$165", status: "Paid", statusColor: "#D1FAE5", statusText: "#059669" },
          ].map((inv) => (
            <div key={inv.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F4F2ED" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0C1B2A" }}>{inv.name}</div>
                <div style={{ fontSize: 10, color: "#9CA3AF" }}>{inv.date}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0C1B2A" }}>{inv.amount}</div>
              <div style={{ padding: "2px 9px", borderRadius: 100, fontSize: 10, fontWeight: 700, background: inv.statusColor, color: inv.statusText }}>{inv.status}</div>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: "10px 14px", background: "#EBF4FF", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#6B7280" }}>Total collected (March)</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0071E3" }}>$3,450</span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg, #FEFCF7 0%, #EBF4FF 100%)", padding: "80px 0 100px", textAlign: "center" }}>
        <div className="mkt-container">
          <p className="mkt-eyebrow" style={{ justifyContent: "center" }}>Setup in minutes</p>
          <h1 className="mkt-h1" style={{ maxWidth: 600, margin: "0 auto 24px" }}>
            From zero to fully<br />automated in 4 steps
          </h1>
          <p className="mkt-lead" style={{ margin: "0 auto 40px", textAlign: "center" }}>
            No training required. No complicated setup. Start managing your cleaning business professionally in under 10 minutes.
          </p>
          <Link href="/auth/signup" className="mkt-btn mkt-btn-primary mkt-btn-lg">
            Get started free →
          </Link>
        </div>
      </section>

      {/* Steps */}
      {STEPS.map((step, i) => (
        <section
          key={step.n}
          className="mkt-section"
          style={{ background: i % 2 === 0 ? "#FEFCF7" : "#F8F5EE" }}
        >
          <div className="mkt-container">
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}
              className={`mkt-step-grid-${i}`}
            >
              <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: "#E9E7E0", lineHeight: 1, fontFamily: "var(--font-display)" }}>
                    {step.n}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#0071E3" }}>
                    {step.tag}
                  </span>
                </div>
                <h2 className="mkt-h2" style={{ marginBottom: 20 }}>{step.title}</h2>
                <p className="mkt-body" style={{ marginBottom: 28 }}>{step.body}</p>
                <ul className="mkt-check-list">
                  {step.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
              <div style={{ order: i % 2 === 0 ? 2 : 1 }}>
                {step.mockup}
              </div>
            </div>
          </div>
          <style>{`@media(max-width:900px){.mkt-step-grid-${i}{grid-template-columns:1fr !important;gap:48px !important;} .mkt-step-grid-${i}>div{order:unset !important;}}`}</style>
        </section>
      ))}

      {/* Result */}
      <section style={{ background: "#0C1B2A", padding: "80px 0" }}>
        <div className="mkt-container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "#fff", marginBottom: 16 }}>
              What your first month looks like
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }} className="mkt-timeline-grid">
            {[
              { period: "Day 1", title: "Setup complete", body: "Account created, clients added, schedule set up." },
              { period: "Week 1", title: "First jobs logged", body: "Complete jobs, send invoices, get paid online." },
              { period: "Week 2", title: "Recurring patterns", body: "Schedules running automatically. Calendar fills itself." },
              { period: "Month 1", title: "Full autopilot", body: "Analytics, revenue tracked. Business runs smoothly." },
            ].map((t, i) => (
              <div key={t.period} style={{ background: "rgba(255,255,255,.05)", borderRadius: i === 0 ? "12px 0 0 12px" : i === 3 ? "0 12px 12px 0" : 0, padding: "28px 24px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,.08)" : "none" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#D4A574", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{t.period}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.6 }}>{t.body}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:768px){.mkt-timeline-grid{grid-template-columns:1fr 1fr !important;} .mkt-timeline-grid>div{border-radius:12px !important;border-left:none !important;margin-bottom:2px;}}`}</style>
      </section>

      {/* CTA */}
      <section style={{ background: "#FEFCF7", padding: "100px 0", textAlign: "center" }}>
        <div className="mkt-container">
          <h2 className="mkt-h2" style={{ maxWidth: 500, margin: "0 auto 24px" }}>
            Ready to get started?
          </h2>
          <p className="mkt-lead" style={{ margin: "0 auto 40px", textAlign: "center" }}>
            It takes less than 10 minutes to set up. Your first free trial includes everything.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/signup" className="mkt-btn mkt-btn-primary mkt-btn-lg">Start free trial →</Link>
            <Link href="/contact" className="mkt-btn mkt-btn-ghost" style={{ padding: "16px 32px" }}>Talk to our team</Link>
          </div>
        </div>
      </section>
    </>
  );
}
