import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 120, paddingBottom: 60 }}>
        <div className="container">
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <p className="eyebrow">Getting Started</p>
            <h1 style={{ color: "#0C1B2A", marginBottom: 24 }}>
              Up and running in minutes
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "#6B7280",
                marginBottom: 40,
              }}
            >
              MaidHub works intuitively. No complicated onboarding. No confusing dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* Step 1 */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap: 48, alignItems: "center" }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  background: "rgba(0, 113, 227, 0.1)",
                  borderRadius: 12,
                  fontSize: 28,
                  marginBottom: 24,
                }}
              >
                1️⃣
              </div>
              <h2 style={{ marginBottom: 16 }}>Sign up in 60 seconds</h2>
              <p>
                Enter your email, create a password, and you're in. We'll ask a few
                questions to customize your account, but it's completely optional.
              </p>
              <p style={{ marginTop: 16, fontSize: 14, color: "#9CA3AF" }}>
                No credit card required. No spam. We promise.
              </p>
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
              [Signup Screen]
            </div>
          </div>
        </div>
      </section>

      {/* Step 2 */}
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
              [Add Clients Screen]
            </div>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  background: "rgba(212, 165, 116, 0.1)",
                  borderRadius: 12,
                  fontSize: 28,
                  marginBottom: 24,
                  color: "#D4A574",
                }}
              >
                2️⃣
              </div>
              <h2 style={{ marginBottom: 16, color: "#FFF" }}>
                Add your first clients
              </h2>
              <p>
                Click "Add Client" and fill in their details: name, address, phone,
                service type, rate. Everything syncs to your mobile app instantly.
              </p>
              <p style={{ marginTop: 16, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                You can import from a spreadsheet if you prefer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap: 48, alignItems: "center" }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  background: "rgba(0, 113, 227, 0.1)",
                  borderRadius: 12,
                  fontSize: 28,
                  marginBottom: 24,
                }}
              >
                3️⃣
              </div>
              <h2 style={{ marginBottom: 16 }}>Schedule recurring cleans</h2>
              <p>
                Set up weekly, bi-weekly, or monthly schedules. MaidHub automatically
                books jobs and sends reminders to your phone.
              </p>
              <p style={{ marginTop: 16, fontSize: 14, color: "#9CA3AF" }}>
                Your calendar fills itself. No more manual scheduling.
              </p>
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
              [Calendar Screen]
            </div>
          </div>
        </div>
      </section>

      {/* Step 4 */}
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
              [Invoice Screen]
            </div>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  background: "rgba(212, 165, 116, 0.1)",
                  borderRadius: 12,
                  fontSize: 28,
                  marginBottom: 24,
                  color: "#D4A574",
                }}
              >
                4️⃣
              </div>
              <h2 style={{ marginBottom: 16, color: "#FFF" }}>
                Send invoices and get paid
              </h2>
              <p>
                After completing a job, MaidHub auto-generates a professional invoice.
                Send it with one click via email or SMS.
              </p>
              <p style={{ marginTop: 16, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                Clients pay online. You get paid in 24 hours. No chasing late payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="eyebrow">Your First Month</p>
            <h2>What to expect</h2>
          </div>

          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {[
              {
                day: "Day 1",
                title: "Setup complete",
                desc: "Finish onboarding, add clients, and start scheduling.",
              },
              {
                day: "Days 2-7",
                title: "First jobs",
                desc: "Complete your first cleans. Generate invoices. Get paid.",
              },
              {
                day: "Week 2",
                title: "Recurring patterns",
                desc: "Set up weekly/bi-weekly schedules. Your calendar fills automatically.",
              },
              {
                day: "Week 3-4",
                title: "Optimization",
                desc: "Review analytics, optimize pricing, and add more clients.",
              },
            ].map((item, i) => (
              <div
                key={item.day}
                style={{
                  display: "flex",
                  gap: 24,
                  marginBottom: 32,
                  paddingBottom: 32,
                  borderBottom: i < 3 ? "1px solid #E5E3DC" : "none",
                }}
              >
                <div
                  style={{
                    minWidth: 120,
                    fontWeight: 600,
                    color: "#0071E3",
                    fontSize: 15,
                  }}
                >
                  {item.day}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ marginBottom: 4, color: "#0C1B2A" }}>
                    {item.title}
                  </h4>
                  <p style={{ color: "#6B7280", fontSize: 15 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section style={{ background: "#F9F7F1", padding: "64px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center" }}>
            <p className="eyebrow">We're Here to Help</p>
            <h2 style={{ marginBottom: 48 }}>Get support whenever you need it</h2>

            <div className="grid-3" style={{ marginTop: 40 }}>
              {[
                {
                  icon: "📧",
                  title: "Email Support",
                  desc: "Email us anytime. We typically respond within a few hours.",
                },
                {
                  icon: "💬",
                  title: "Live Chat",
                  desc: "Chat with our team directly in MaidHub. Super quick.",
                },
                {
                  icon: "📚",
                  title: "Help Center",
                  desc: "Browse tutorials, guides, and FAQs anytime.",
                },
              ].map((item) => (
                <div key={item.title} className="card">
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
                  <h3 style={{ marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ color: "#6B7280" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section dark" style={{ textAlign: "center" }}>
        <div className="container">
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ color: "#FFF", marginBottom: 24 }}>
              Start your free trial <span style={{ color: "#D4A574" }}>today</span>
            </h2>
            <p style={{ fontSize: 18, marginBottom: 40, color: "rgba(255,255,255,0.7)" }}>
              30 days free. No credit card. No surprises. Cancel anytime.
            </p>
            <Link href="/auth/signup" className="btn btn-secondary btn-lg">
              Get started now →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
