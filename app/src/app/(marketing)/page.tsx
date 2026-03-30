import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <p className="eyebrow">Solo Cleaners, Simplified</p>
            <h1 style={{ color: "#0C1B2A", marginBottom: 24 }}>
              Stop <span style={{ color: "#0071E3" }}>managing</span> and
              start <span style={{ fontStyle: "italic" }}>building</span>
            </h1>
            <p
              style={{
                fontSize: 20,
                color: "#6B7280",
                marginBottom: 40,
                lineHeight: 1.8,
              }}
            >
              MaidHub handles your clients, schedules, invoices, and payments.
              You focus on growing your business.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/signup" className="btn btn-primary btn-lg">
                Start free trial →
              </Link>
              <Link href="/how-it-works" className="btn btn-outline" style={{ padding: "16px 32px" }}>
                See how it works
              </Link>
            </div>
            <p style={{ marginTop: 24, fontSize: 14, color: "#9CA3AF" }}>
              ✓ 30-day free trial · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section style={{ background: "#F9F7F1", padding: "48px 0", borderTop: "1px solid #E5E3DC", borderBottom: "1px solid #E5E3DC" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 32 }}>
            {[
              { n: "5000+", label: "Cleaners using MaidHub" },
              { n: "$2.5M+", label: "Payments processed" },
              { n: "98%", label: "Uptime SLA" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#0071E3",
                    marginBottom: 8,
                  }}
                >
                  {stat.n}
                </div>
                <div style={{ fontSize: 14, color: "#6B7280" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core features */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p className="eyebrow">Everything You Need</p>
            <h2>One app. Four superpowers.</h2>
          </div>

          <div className="grid-4">
            {[
              {
                icon: "👥",
                title: "Client Management",
                desc: "Store every detail. Never lose a client or their preferences again.",
              },
              {
                icon: "📅",
                title: "Smart Scheduling",
                desc: "Auto-schedule recurring cleans. Your calendar fills itself.",
              },
              {
                icon: "💰",
                title: "Instant Invoicing",
                desc: "Generate invoices in seconds. Get paid faster. Track everything.",
              },
              {
                icon: "📱",
                title: "Mobile First",
                desc: "Works perfectly on your phone. Manage your business from anywhere.",
              },
            ].map((feature) => (
              <div key={feature.title} className="card">
                <div style={{ fontSize: 48, marginBottom: 16 }}>{feature.icon}</div>
                <h3 style={{ marginBottom: 12 }}>{feature.title}</h3>
                <p style={{ color: "#6B7280" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem statement */}
      <section className="section dark">
        <div className="container">
          <div style={{ maxWidth: 700 }}>
            <p className="eyebrow">The Challenge</p>
            <h2>Before MaidHub:</h2>
            <ul
              style={{
                listStyle: "none",
                fontSize: 18,
                lineHeight: 1.8,
                marginTop: 32,
              }}
            >
              {[
                "Spreadsheets, napkins, and sticky notes",
                "Manual invoicing taking hours every week",
                "Chasing late payments over text",
                "Double-booked appointments",
                "No visibility into your actual revenue",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ color: "#D4A574", fontSize: 24 }}>✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Solution section */}
      <section className="section">
        <div className="container">
          <div style={{ maxWidth: 700 }}>
            <p className="eyebrow">The Solution</p>
            <h2>After MaidHub:</h2>
            <ul
              style={{
                listStyle: "none",
                fontSize: 18,
                lineHeight: 1.8,
                marginTop: 32,
              }}
            >
              {[
                "One dashboard. Everything organized.",
                "Invoices auto-generated after each job",
                "Clients pay online instantly",
                "Recurring schedules on autopilot",
                "Real-time revenue tracking",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ color: "#0071E3", fontSize: 24 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonial strip */}
      <section style={{ background: "#F9F7F1", padding: "64px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="eyebrow">What Cleaners Say</p>
            <h2>Loved by solo cleaners</h2>
          </div>

          <div className="grid-3">
            {[
              {
                quote:
                  "I used to spend 2 hours every Sunday managing my schedule. Now it's automatic. This freed up so much time.",
                author: "Sarah",
                role: "Residential Cleaner",
              },
              {
                quote:
                  "Getting paid within 24 hours instead of chasing invoices is a game-changer. I can finally focus on what I love.",
                author: "Marcus",
                role: "House Cleaning Owner",
              },
              {
                quote:
                  "My clients love the professional invoices and the ability to reschedule through their portal. Highly professional.",
                author: "Jennifer",
                role: "Solo Cleaner",
              },
            ].map((testimonial) => (
              <div key={testimonial.author} className="card">
                <p style={{ fontSize: 18, marginBottom: 20, lineHeight: 1.8 }}>
                  "{testimonial.quote}"
                </p>
                <div style={{ borderTop: "1px solid #E5E3DC", paddingTop: 16 }}>
                  <div style={{ fontWeight: 600, color: "#0C1B2A" }}>
                    {testimonial.author}
                  </div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section dark" style={{ textAlign: "center" }}>
        <div className="container">
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ color: "#FFF", marginBottom: 24 }}>
              Ready to grow your <span style={{ color: "#D4A574" }}>cleaning business?</span>
            </h2>
            <p style={{ fontSize: 18, marginBottom: 40, color: "rgba(255,255,255,0.7)" }}>
              Join thousands of solo cleaners running professional businesses with MaidHub.
              Start your free trial today — no credit card required.
            </p>
            <Link href="/auth/signup" className="btn btn-secondary btn-lg">
              Get started free →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
