import Link from "next/link";

export default function PricingPage() {
  const features = [
    "Unlimited clients",
    "Unlimited jobs & scheduling",
    "Professional invoicing",
    "Automated estimates",
    "Payment collection",
    "Analytics & reporting",
    "Mobile app access",
    "Email support",
    "Priority support",
    "Advanced integrations",
    "Custom branding",
  ];

  const tiers = [
    {
      name: "Starter",
      price: 29,
      description: "Perfect for solo cleaners just getting started",
      cta: "Start free trial",
      highlight: false,
      features: [0, 1, 2, 3, 4, 5, 6, 7],
    },
    {
      name: "Professional",
      price: 69,
      description: "For growing cleaning businesses",
      cta: "Start free trial",
      highlight: true,
      features: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    {
      name: "Enterprise",
      price: 149,
      description: "For agencies and teams",
      cta: "Contact sales",
      highlight: false,
      features: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 120, paddingBottom: 60 }}>
        <div className="container">
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <p className="eyebrow">Simple, Transparent Pricing</p>
            <h1 style={{ color: "#0C1B2A", marginBottom: 24 }}>
              No surprises. No hidden fees.
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "#6B7280",
                marginBottom: 40,
              }}
            >
              All plans include a 30-day free trial. No credit card required.
              Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Billing toggle */}
      <section style={{ textAlign: "center", paddingBottom: 64 }}>
        <div className="container">
          <div
            style={{
              display: "inline-flex",
              background: "#F9F7F1",
              padding: 8,
              borderRadius: 100,
              gap: 8,
            }}
          >
            <button
              style={{
                padding: "8px 24px",
                background: "#FFF",
                border: "none",
                borderRadius: 100,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                color: "#0071E3",
              }}
            >
              Monthly
            </button>
            <button
              style={{
                padding: "8px 24px",
                background: "transparent",
                border: "none",
                borderRadius: 100,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                color: "#9CA3AF",
              }}
            >
              Yearly{" "}
              <span style={{ color: "#0071E3", fontWeight: 700 }}>
                (Save 20%)
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section">
        <div className="container">
          <div className="grid-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={tier.highlight ? "card" : "card"}
                style={{
                  ...(tier.highlight && {
                    border: "2px solid #0071E3",
                    transform: "scale(1.05)",
                  }),
                }}
              >
                {tier.highlight && (
                  <div
                    style={{
                      display: "inline-block",
                      background: "#0071E3",
                      color: "#FFF",
                      padding: "4px 12px",
                      borderRadius: 100,
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 16,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <h3 style={{ marginBottom: 8 }}>{tier.name}</h3>
                <p style={{ color: "#6B7280", marginBottom: 24 }}>
                  {tier.description}
                </p>

                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, color: "#0C1B2A" }}>
                    ${tier.price}
                  </span>
                  <span style={{ color: "#6B7280", marginLeft: 8 }}>/month</span>
                </div>

                <p style={{ color: "#9CA3AF", fontSize: 13, marginBottom: 24 }}>
                  Billed {tier.price === 29 ? "$348/year" : tier.price === 69 ? "$828/year" : "$1,788/year"}
                </p>

                <Link
                  href="/auth/signup"
                  className={`btn ${tier.highlight ? "btn-primary" : "btn-outline"} btn-lg`}
                  style={{ width: "100%", marginBottom: 32 }}
                >
                  {tier.cta}
                </Link>

                <div
                  style={{
                    borderTop: "1px solid #E5E3DC",
                    paddingTop: 24,
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#0C1B2A",
                      marginBottom: 16,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    What's Included
                  </p>
                  <ul style={{ listStyle: "none" }}>
                    {features.map((feature, i) => (
                      <li
                        key={feature}
                        style={{
                          padding: "8px 0",
                          color:
                            tier.features.includes(i)
                              ? "#0C1B2A"
                              : "#D1D5DB",
                          fontSize: 14,
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <span style={{ color: "#0071E3" }}>
                          {tier.features.includes(i) ? "✓" : "—"}
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#F9F7F1", padding: "64px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="eyebrow">Questions?</p>
            <h2>Frequently asked</h2>
          </div>

          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {[
              {
                q: "Can I try MaidHub free?",
                a: "Yes, all plans include a 30-day free trial. No credit card required. You can upgrade or cancel anytime.",
              },
              {
                q: "What happens after the free trial?",
                a: "Your plan automatically converts to paid after 30 days. You'll get an email reminder before we charge you.",
              },
              {
                q: "Can I switch plans?",
                a: "Absolutely. Upgrade or downgrade anytime. We'll pro-rate any changes based on your billing cycle.",
              },
              {
                q: "Do you offer annual discounts?",
                a: "Yes. Pay yearly and save 20% off the monthly price for any plan.",
              },
              {
                q: "Is there a contract?",
                a: "No contracts. Cancel anytime with one click. No hidden fees or penalties.",
              },
              {
                q: "Do you offer refunds?",
                a: "We're confident you'll love MaidHub, but if you don't, we offer a 14-day money-back guarantee.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                style={{
                  borderBottom: "1px solid #E5E3DC",
                  paddingBottom: 24,
                  marginBottom: 24,
                }}
              >
                <summary
                  style={{
                    fontWeight: 600,
                    color: "#0C1B2A",
                    cursor: "pointer",
                    paddingBottom: 12,
                  }}
                >
                  {faq.q}
                </summary>
                <p style={{ marginTop: 12, color: "#6B7280", lineHeight: 1.7 }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section dark" style={{ textAlign: "center" }}>
        <div className="container">
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ color: "#FFF", marginBottom: 24 }}>
              Ready to grow your <span style={{ color: "#D4A574" }}>cleaning empire?</span>
            </h2>
            <p style={{ fontSize: 18, marginBottom: 40, color: "rgba(255,255,255,0.7)" }}>
              Join thousands of solo cleaners and agencies. Start free today.
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
