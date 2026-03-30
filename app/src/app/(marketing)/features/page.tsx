import Link from "next/link";

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 120, paddingBottom: 60 }}>
        <div className="container">
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <p className="eyebrow">Powerful Tools</p>
            <h1 style={{ color: "#0C1B2A", marginBottom: 24 }}>
              Everything built to help you win
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "#6B7280",
                marginBottom: 40,
              }}
            >
              We've thought through every part of running a residential cleaning business.
              Here's what you get.
            </p>
          </div>
        </div>
      </section>

      {/* Feature 1: Client Management */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap: 48, alignItems: "center" }}>
            <div>
              <p className="eyebrow">Client Management</p>
              <h2 style={{ marginBottom: 32 }}>Know your clients better</h2>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 8 }}>Store complete profiles</h4>
                <p>
                  Address, phone, email, special instructions, entry details, payment method — everything in one place.
                </p>
              </div>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 8 }}>Track cleaning history</h4>
                <p>
                  See every job completed, notes, photos, and preferences. Build stronger relationships.
                </p>
              </div>
              <div>
                <h4 style={{ marginBottom: 8 }}>Segments & tags</h4>
                <p>
                  Organize by location, frequency, service type. Target specific groups with offers.
                </p>
              </div>
            </div>
            <div
              style={{
                background: "#F9F7F1",
                borderRadius: 12,
                padding: 40,
                textAlign: "center",
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9CA3AF",
              }}
            >
              [Client Interface Preview]
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Smart Scheduling */}
      <section className="section dark">
        <div className="container">
          <div className="grid-2" style={{ gap: 48, alignItems: "center" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                padding: 40,
                textAlign: "center",
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              [Schedule Interface Preview]
            </div>
            <div>
              <p className="eyebrow">Scheduling</p>
              <h2 style={{ marginBottom: 32, color: "#FFF" }}>Never miss a job</h2>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 8, color: "#FFF" }}>
                  Recurring patterns
                </h4>
                <p>
                  Set weekly, bi-weekly, monthly cleans. Auto-assign dates. Your calendar fills automatically.
                </p>
              </div>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 8, color: "#FFF" }}>
                  Collision detection
                </h4>
                <p>
                  MaidHub prevents double-booking and routing conflicts. Smart routing saves time.
                </p>
              </div>
              <div>
                <h4 style={{ marginBottom: 8, color: "#FFF" }}>
                  Client portal
                </h4>
                <p>
                  Clients reschedule themselves. Fewer texts and calls for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Invoicing */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap: 48, alignItems: "center" }}>
            <div>
              <p className="eyebrow">Invoicing & Payments</p>
              <h2 style={{ marginBottom: 32 }}>Get paid faster</h2>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 8 }}>Auto-generate invoices</h4>
                <p>
                  After each job, MaidHub creates professional invoices automatically. No manual work.
                </p>
              </div>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 8 }}>Multiple payment methods</h4>
                <p>
                  Clients pay online via card, bank transfer, or cash. You get paid in your account within 24 hours.
                </p>
              </div>
              <div>
                <h4 style={{ marginBottom: 8 }}>Payment reminders</h4>
                <p>
                  Automated reminders sent before due dates. Get paid on time, every time.
                </p>
              </div>
            </div>
            <div
              style={{
                background: "#F9F7F1",
                borderRadius: 12,
                padding: 40,
                textAlign: "center",
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9CA3AF",
              }}
            >
              [Invoice Interface Preview]
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Analytics & Reports */}
      <section className="section dark">
        <div className="container">
          <div className="grid-2" style={{ gap: 48, alignItems: "center" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                padding: 40,
                textAlign: "center",
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              [Analytics Interface Preview]
            </div>
            <div>
              <p className="eyebrow">Analytics</p>
              <h2 style={{ marginBottom: 32, color: "#FFF" }}>See what's working</h2>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 8, color: "#FFF" }}>
                  Real-time metrics
                </h4>
                <p>
                  Monthly revenue, profit margin, client lifetime value, churn rate — at a glance.
                </p>
              </div>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 8, color: "#FFF" }}>
                  Export reports
                </h4>
                <p>
                  Download detailed reports for accounting, taxes, or investor presentations.
                </p>
              </div>
              <div>
                <h4 style={{ marginBottom: 8, color: "#FFF" }}>
                  Actionable insights
                </h4>
                <p>
                  See which services are most profitable. Optimize your pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="eyebrow">How We Compare</p>
            <h2>MaidHub vs the spreadsheet</h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #E5E3DC" }}>
                  <th style={{ padding: 16, textAlign: "left", fontWeight: 600 }}>
                    Feature
                  </th>
                  <th style={{ padding: 16, textAlign: "center", color: "#0071E3" }}>
                    MaidHub
                  </th>
                  <th style={{ padding: 16, textAlign: "center", color: "#9CA3AF" }}>
                    Spreadsheet
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Client management", true, false],
                  ["Automatic scheduling", true, false],
                  ["Invoice generation", true, false],
                  ["Payment collection", true, false],
                  ["Analytics & reporting", true, false],
                  ["Mobile access", true, false],
                  ["Customer support", true, false],
                  ["Data backup & security", true, false],
                  ["Time tracking", true, false],
                  ["Recurring jobs", true, false],
                ].map(([feature, maidhub, spreadsheet], idx) => (
                  <tr
                    key={`feature-${idx}`}
                    style={{ borderBottom: "1px solid #E5E3DC" }}
                  >
                    <td style={{ padding: 16 }}>{String(feature)}</td>
                    <td
                      style={{
                        padding: 16,
                        textAlign: "center",
                        color: maidhub ? "#0071E3" : "#9CA3AF",
                      }}
                    >
                      {maidhub ? "✓" : "✕"}
                    </td>
                    <td
                      style={{
                        padding: 16,
                        textAlign: "center",
                        color: spreadsheet ? "#0071E3" : "#9CA3AF",
                      }}
                    >
                      {spreadsheet ? "✓" : "✕"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section dark" style={{ textAlign: "center" }}>
        <div className="container">
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ color: "#FFF", marginBottom: 24 }}>
              Ready to run your business <span style={{ color: "#D4A574" }}>smarter?</span>
            </h2>
            <p style={{ fontSize: 18, marginBottom: 40, color: "rgba(255,255,255,0.7)" }}>
              All features included in your free 30-day trial. No credit card.
            </p>
            <Link href="/auth/signup" className="btn btn-secondary btn-lg">
              Start free trial →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
