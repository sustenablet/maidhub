import Link from "next/link";

/* ─── Dashboard Mockup (Hero) ─────────────────────────────── */
function DashboardMockup() {
  const clients = [
    { initials: "SJ", name: "Sarah Johnson", address: "842 Oak Ave", next: "Tue 9:00 AM", amount: "$150", done: true },
    { initials: "MD", name: "Mark Davis", address: "219 Elm St", next: "Thu 2:00 PM", amount: "$200", done: false },
    { initials: "EC", name: "Emily Chen", address: "1105 Pine Rd", next: "Fri 10:00 AM", amount: "$175", done: false },
    { initials: "RB", name: "Robert Brown", address: "67 Maple Dr", next: "Mon 8:00 AM", amount: "$165", done: true },
  ];

  return (
    <div className="mkt-browser" style={{ fontSize: 13, userSelect: "none" }}>
      {/* Browser bar */}
      <div className="mkt-browser-bar">
        <div className="mkt-browser-dots">
          <span /><span /><span />
        </div>
        <div className="mkt-browser-url">app.maidhub.io/clients</div>
      </div>

      {/* App UI */}
      <div style={{ display: "flex", height: 360 }}>
        {/* Sidebar */}
        <div style={{ width: 180, background: "#F8F5EE", borderRight: "1px solid #E9E7E0", padding: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0C1B2A", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, background: "#0071E3", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 2L13 5V11L8 14L3 11V5L8 2Z" fill="white"/></svg>
            </div>
            MaidHub
          </div>
          {[
            { icon: "⊞", label: "Dashboard", active: false },
            { icon: "👥", label: "Clients", active: true },
            { icon: "📅", label: "Schedule", active: false },
            { icon: "💰", label: "Invoices", active: false },
            { icon: "📊", label: "Analytics", active: false },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px", borderRadius: 6, marginBottom: 2,
                background: item.active ? "#EBF4FF" : "transparent",
                color: item.active ? "#0071E3" : "#6B7280",
                fontWeight: item.active ? 600 : 400,
                fontSize: 12,
              }}
            >
              <span style={{ fontSize: 11 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, background: "#fff", padding: 20, overflow: "hidden" }}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0C1B2A" }}>Clients</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>12 active clients</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0071E3", color: "#fff", padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
              + Add Client
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Revenue (MTD)", value: "$3,450" },
              { label: "Jobs this week", value: "14" },
              { label: "Unpaid invoices", value: "2" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#F8F5EE", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0C1B2A" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Client list */}
          <div>
            {clients.map((c) => (
              <div
                key={c.name}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 0", borderBottom: "1px solid #F4F2ED",
                }}
              >
                <div
                  style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: "#EBF4FF", color: "#0071E3",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, flexShrink: 0,
                  }}
                >
                  {c.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0C1B2A" }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: "#9CA3AF" }}>{c.next}</div>
                </div>
                <div
                  style={{
                    padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: c.done ? "#D1FAE5" : "#EBF4FF",
                    color: c.done ? "#059669" : "#0071E3",
                  }}
                >
                  {c.done ? "Paid" : "Upcoming"}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0C1B2A", width: 40, textAlign: "right" }}>
                  {c.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Schedule Mockup ─────────────────────────────────────── */
function ScheduleMockup() {
  const jobs = [
    { name: "Sarah J.", time: "9:00 AM", duration: 2, col: 1, color: "#EBF4FF", border: "#0071E3", text: "#0071E3" },
    { name: "Mark D.", time: "11:30 AM", duration: 1.5, col: 2, color: "#D1FAE5", border: "#10B981", text: "#059669" },
    { name: "Emily C.", time: "2:00 PM", duration: 2, col: 3, color: "#FDF3E7", border: "#D4A574", text: "#92400E" },
    { name: "Robert B.", time: "10:00 AM", duration: 3, col: 2, color: "#EBF4FF", border: "#0071E3", text: "#0071E3" },
  ];

  return (
    <div className="mkt-browser" style={{ fontSize: 13, userSelect: "none" }}>
      <div className="mkt-browser-bar">
        <div className="mkt-browser-dots"><span /><span /><span /></div>
        <div className="mkt-browser-url">app.maidhub.io/schedule</div>
      </div>

      <div style={{ background: "#fff", padding: 20, height: 340, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0C1B2A" }}>This Week</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
              <div key={d} style={{
                width: 36, height: 36, borderRadius: 8,
                background: i === 1 ? "#0071E3" : "#F8F5EE",
                color: i === 1 ? "#fff" : "#6B7280",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: i === 1 ? 700 : 400,
              }}>
                <span>{d}</span>
                <span style={{ fontSize: 9, opacity: .7 }}>{[14,15,16,17,18][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time slots */}
        {["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"].map((time, i) => (
          <div key={time} style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "center" }}>
            <div style={{ width: 52, fontSize: 9, color: "#9CA3AF", textAlign: "right", flexShrink: 0 }}>{time}</div>
            <div style={{ flex: 1, height: 28, background: "#F8F5EE", borderRadius: 4, position: "relative", overflow: "hidden" }}>
              {i === 1 && (
                <div style={{ position: "absolute", left: "5%", top: 2, bottom: 2, width: "38%", background: "#EBF4FF", border: "1px solid #0071E3", borderRadius: 3, display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 9, fontWeight: 600, color: "#0071E3" }}>
                  Sarah J. — $150
                </div>
              )}
              {i === 3 && (
                <div style={{ position: "absolute", left: "45%", top: 2, bottom: 2, width: "42%", background: "#D1FAE5", border: "1px solid #10B981", borderRadius: 3, display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 9, fontWeight: 600, color: "#059669" }}>
                  Mark D. — $200
                </div>
              )}
              {i === 6 && (
                <div style={{ position: "absolute", left: "20%", top: 2, bottom: 2, width: "40%", background: "#FDF3E7", border: "1px solid #D4A574", borderRadius: 3, display: "flex", alignItems: "center", paddingLeft: 6, fontSize: 9, fontWeight: 600, color: "#92400E" }}>
                  Emily C. — $175
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Invoice Mockup ──────────────────────────────────────── */
function InvoiceMockup() {
  return (
    <div className="mkt-browser" style={{ fontSize: 13, userSelect: "none" }}>
      <div className="mkt-browser-bar">
        <div className="mkt-browser-dots"><span /><span /><span /></div>
        <div className="mkt-browser-url">app.maidhub.io/invoices/1042</div>
      </div>

      <div style={{ background: "#fff", padding: 24, height: 340, overflow: "hidden" }}>
        {/* Invoice header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0C1B2A", fontFamily: "var(--font-display)" }}>Invoice #1042</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>March 15, 2025</div>
          </div>
          <div style={{ padding: "4px 12px", background: "#FEF3C7", color: "#B45309", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
            UNPAID
          </div>
        </div>

        {/* Client */}
        <div style={{ background: "#F8F5EE", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 3 }}>BILL TO</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0C1B2A" }}>Sarah Johnson</div>
          <div style={{ fontSize: 11, color: "#6B7280" }}>842 Oak Ave, Orlando FL</div>
        </div>

        {/* Line items */}
        <div style={{ borderTop: "1px solid #F4F2ED", borderBottom: "1px solid #F4F2ED", marginBottom: 12 }}>
          {[
            { desc: "Deep Clean — 3BR/2BA", qty: 1, price: "$150.00" },
            { desc: "Oven cleaning add-on", qty: 1, price: "$25.00" },
          ].map((item) => (
            <div key={item.desc} style={{ display: "flex", padding: "8px 0", gap: 8 }}>
              <div style={{ flex: 1, fontSize: 11, color: "#0C1B2A" }}>{item.desc}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0C1B2A" }}>{item.price}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0C1B2A" }}>Total</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0071E3" }}>$175.00</div>
        </div>

        <button style={{ width: "100%", padding: "10px", background: "#0071E3", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Send Invoice via SMS →
        </button>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(160deg, #FEFCF7 0%, #F0F6FF 100%)",
          padding: "80px 0 100px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background accent blobs */}
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,113,227,.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -60,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,165,116,.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="mkt-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.2fr",
              gap: 64,
              alignItems: "center",
            }}
            className="mkt-hero-grid"
          >
            {/* Left: Copy */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#EBF4FF",
                  border: "1px solid rgba(0,113,227,.2)",
                  borderRadius: 100,
                  padding: "6px 14px 6px 8px",
                  marginBottom: 28,
                }}
              >
                <span style={{ background: "#0071E3", color: "#fff", borderRadius: 100, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>NEW</span>
                <span style={{ fontSize: 13, color: "#0071E3", fontWeight: 500 }}>Early access — 30-day free trial</span>
              </div>

              <h1 className="mkt-h1" style={{ marginBottom: 24, lineHeight: 1.08 }}>
                Stop juggling.<br />
                Start{" "}
                <em style={{ fontStyle: "italic", color: "#0071E3" }}>building</em>{" "}
                your business.
              </h1>

              <p className="mkt-lead" style={{ marginBottom: 40 }}>
                MaidHub is the all-in-one back-office platform for solo house cleaners.
                Clients, schedules, invoices, and payments — one clean dashboard.
              </p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 36 }}>
                <Link href="/auth/signup" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                  Get started free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8h9M9 4.5l3.5 3.5L9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link href="/how-it-works" className="mkt-btn mkt-btn-ghost">
                  See how it works
                </Link>
              </div>

              {/* Trust badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                {[
                  { icon: "🔒", label: "Secure & encrypted" },
                  { icon: "✓", label: "No credit card" },
                  { icon: "↺", label: "Cancel anytime" },
                ].map((b) => (
                  <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280" }}>
                    <span style={{ fontSize: 14 }}>{b.icon}</span>
                    {b.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product screenshot */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute", top: -20, right: -20,
                  width: "calc(100% + 20px)", height: "calc(100% + 20px)",
                  background: "linear-gradient(135deg, rgba(0,113,227,.06) 0%, rgba(212,165,116,.06) 100%)",
                  borderRadius: 20,
                  zIndex: 0,
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <DashboardMockup />
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .mkt-hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          }
        `}</style>
      </section>

      {/* ─── STATS BAR ────────────────────────────────────── */}
      <div style={{ background: "#fff", borderTop: "1px solid #E9E7E0", borderBottom: "1px solid #E9E7E0", padding: "32px 0" }}>
        <div className="mkt-container">
          <div
            style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 32 }}
          >
            {[
              { n: "5,000+", label: "Solo cleaners onboarded" },
              { n: "$4.2M+", label: "Invoices sent through MaidHub" },
              { n: "98%", label: "Clients pay within 48 hrs" },
              { n: "4.9★", label: "Average rating" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "#0071E3", lineHeight: 1.1, marginBottom: 6 }}>
                  {stat.n}
                </div>
                <div style={{ fontSize: 13, color: "#9CA3AF" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FEATURE 1: CLIENT MANAGEMENT ─────────────────── */}
      <section className="mkt-section mkt-bg-cream">
        <div className="mkt-container">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}
            className="mkt-feature-grid"
          >
            <div>
              <p className="mkt-eyebrow">Client Management</p>
              <h2 className="mkt-h2" style={{ marginBottom: 24 }}>
                Every client.<br />Every detail.<br />One place.
              </h2>
              <p className="mkt-body" style={{ marginBottom: 32 }}>
                Stop losing clients in your contacts app. MaidHub gives every client a complete profile — addresses, preferences, entry notes, cleaning history, and payment status.
              </p>
              <ul className="mkt-check-list">
                <li>Full client profiles with photos, notes & preferences</li>
                <li>Complete job history per client, always accessible</li>
                <li>Automatic follow-up reminders and re-booking</li>
                <li>Client satisfaction tracking and review requests</li>
              </ul>
              <div style={{ marginTop: 36 }}>
                <Link href="/features" className="mkt-btn mkt-btn-primary">
                  Explore all features →
                </Link>
              </div>
            </div>
            <div>
              <DashboardMockup />
            </div>
          </div>
        </div>
        <style>{`.mkt-feature-grid { } @media(max-width:900px){ .mkt-feature-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
      </section>

      {/* ─── FEATURE 2: SCHEDULING ────────────────────────── */}
      <section className="mkt-section" style={{ background: "#0C1B2A" }}>
        <div className="mkt-container">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}
            className="mkt-feature-grid-2"
          >
            <div style={{ order: 2 }}>
              <p className="mkt-eyebrow" style={{ color: "#D4A574" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 24, height: 2, background: "#D4A574", borderRadius: 1 }} />
                  Smart Scheduling
                </span>
              </p>
              <h2 className="mkt-h2" style={{ color: "#fff", marginBottom: 24 }}>
                Your calendar.<br />Fills itself.
              </h2>
              <p className="mkt-body" style={{ color: "rgba(255,255,255,.65)", marginBottom: 32 }}>
                Set up weekly, bi-weekly, or monthly recurring cleans once. MaidHub handles the rest — automatic job creation, reminders, and route optimization.
              </p>
              <ul className="mkt-check-list" style={{ color: "#fff" }}>
                <li style={{ color: "rgba(255,255,255,.85)" }}>Recurring schedules — weekly, bi-weekly, monthly</li>
                <li style={{ color: "rgba(255,255,255,.85)" }}>Smart conflict detection prevents double-booking</li>
                <li style={{ color: "rgba(255,255,255,.85)" }}>Client self-service reschedule portal</li>
                <li style={{ color: "rgba(255,255,255,.85)" }}>SMS reminders sent automatically before each job</li>
              </ul>
              <div style={{ marginTop: 36 }}>
                <Link href="/auth/signup" className="mkt-btn mkt-btn-gold">
                  Try it free →
                </Link>
              </div>
            </div>
            <div style={{ order: 1 }}>
              <ScheduleMockup />
            </div>
          </div>
        </div>
        <style>{`@media(max-width:900px){ .mkt-feature-grid-2 { grid-template-columns: 1fr !important; gap: 48px !important; } .mkt-feature-grid-2 > div { order: unset !important; } }`}</style>
      </section>

      {/* ─── FEATURE 3: INVOICING ─────────────────────────── */}
      <section className="mkt-section mkt-bg-cream-2">
        <div className="mkt-container">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}
            className="mkt-feature-grid-3"
          >
            <div>
              <p className="mkt-eyebrow">Invoicing & Payments</p>
              <h2 className="mkt-h2" style={{ marginBottom: 24 }}>
                Send invoices.<br />Get paid in 24 hrs.
              </h2>
              <p className="mkt-body" style={{ marginBottom: 32 }}>
                After each job, MaidHub auto-generates a professional invoice. Send via SMS or email with one tap. Clients pay online — you get paid fast.
              </p>
              <ul className="mkt-check-list">
                <li>Auto-generate invoices from completed jobs</li>
                <li>Send via SMS or email in under 30 seconds</li>
                <li>Online payment link — card, bank, or Apple Pay</li>
                <li>Automatic payment reminders chase late payers</li>
              </ul>
              <div style={{ marginTop: 36 }}>
                <Link href="/features" className="mkt-btn mkt-btn-primary">
                  See all features →
                </Link>
              </div>
            </div>
            <div>
              <InvoiceMockup />
            </div>
          </div>
        </div>
        <style>{`@media(max-width:900px){ .mkt-feature-grid-3 { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────── */}
      <section className="mkt-section mkt-bg-cream">
        <div className="mkt-container">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="mkt-eyebrow" style={{ justifyContent: "center" }}>Testimonials</p>
            <h2 className="mkt-h2" style={{ maxWidth: 480, margin: "0 auto" }}>
              Cleaners who made the switch
            </h2>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
            className="mkt-testi-grid"
          >
            {[
              {
                quote: "I used to spend Sunday evenings doing admin. Now MaidHub handles everything — I spend that time with my family instead.",
                name: "Sarah M.",
                role: "Solo Cleaner · Orlando, FL",
                initials: "SM",
                color: "#EBF4FF",
                text: "#0071E3",
              },
              {
                quote: "Getting paid within 24 hours instead of waiting two weeks changed my cash flow completely. I can actually plan my business now.",
                name: "Marcus T.",
                role: "House Cleaning Owner · Austin, TX",
                initials: "MT",
                color: "#D1FAE5",
                text: "#059669",
              },
              {
                quote: "My clients think I'm so professional. They get appointment reminders, beautiful invoices, and can reschedule themselves. Worth every penny.",
                name: "Jennifer K.",
                role: "Residential Cleaner · Denver, CO",
                initials: "JK",
                color: "#FDF3E7",
                text: "#D4A574",
              },
            ].map((t) => (
              <div key={t.name} className="mkt-card">
                <div className="mkt-stars">
                  {[1,2,3,4,5].map((s) => <span key={s}>★</span>)}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: "#2D3142", marginBottom: 24, fontStyle: "italic" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #F4F2ED", paddingTop: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: t.color, color: t.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0C1B2A" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media(max-width:900px){ .mkt-testi-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0C1B2A 0%, #122030 100%)",
          padding: "100px 0",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(0,113,227,.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div className="mkt-container" style={{ position: "relative" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#D4A574", marginBottom: 20 }}>
            Start today
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 700, color: "#fff",
              letterSpacing: "-1px", lineHeight: 1.15,
              maxWidth: 640, margin: "0 auto 24px",
            }}
          >
            Your business deserves better tools.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,.55)", maxWidth: 440, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Join thousands of solo cleaners running tighter, more professional businesses with MaidHub.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/signup" className="mkt-btn mkt-btn-gold mkt-btn-lg">
              Start your free trial →
            </Link>
            <Link href="/pricing" className="mkt-btn" style={{ padding: "16px 32px", background: "rgba(255,255,255,.08)", color: "#fff", border: "1px solid rgba(255,255,255,.12)", borderRadius: 9999, fontSize: 16, fontWeight: 600 }}>
              View pricing
            </Link>
          </div>
          <p style={{ marginTop: 24, fontSize: 13, color: "rgba(255,255,255,.3)" }}>
            No credit card required · 30-day free trial · Cancel anytime
          </p>
        </div>
      </section>
    </>
  );
}
