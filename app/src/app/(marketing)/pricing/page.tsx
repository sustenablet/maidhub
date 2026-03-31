"use client";

import Link from "next/link";
import { useState } from "react";

const INCLUDED = [
  "Unlimited clients",
  "Unlimited jobs & scheduling",
  "Professional invoicing",
  "Estimates & quotes",
  "Online payment collection",
  "SMS & email notifications",
  "Client portal access",
  "Analytics & reporting",
  "Mobile-optimized web app",
  "Priority support",
];

const TIERS = [
  {
    name: "Starter",
    monthly: 29,
    yearly: 23,
    tagline: "Perfect for getting started",
    cta: "Start free trial",
    href: "/auth/signup",
    popular: false,
    features: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    name: "Professional",
    monthly: 59,
    yearly: 47,
    tagline: "For growing cleaning businesses",
    cta: "Start free trial",
    href: "/auth/signup",
    popular: true,
    features: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  {
    name: "Business",
    monthly: 99,
    yearly: 79,
    tagline: "Agencies & multi-operator teams",
    cta: "Contact sales",
    href: "/contact",
    popular: false,
    features: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
];

const FAQS = [
  { q: "Is there a free trial?", a: "Yes. All plans include a 30-day free trial, no credit card required. You'll get full access to every feature from day one." },
  { q: "What happens after the trial?", a: "You'll receive an email reminder 3 days before your trial ends. If you choose to continue, we'll automatically bill your card. Cancel anytime before." },
  { q: "Can I change plans later?", a: "Absolutely. Upgrade or downgrade anytime from your account settings. We pro-rate charges based on your billing cycle." },
  { q: "Do you offer annual billing?", a: "Yes — save 20% when you pay annually. Toggle between monthly and yearly above to see the annual price." },
  { q: "Is my data safe?", a: "MaidHub uses bank-level encryption. Your client data and payment information are protected at all times." },
  { q: "Do you offer refunds?", a: "If you're not satisfied within the first 14 days of a paid plan, email us for a full refund. No questions asked." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #E9E7E0" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 0", background: "none", border: "none", cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: "#0C1B2A", paddingRight: 16 }}>{q}</span>
        <span style={{
          width: 28, height: 28, borderRadius: "50%",
          background: open ? "#0071E3" : "#F4F2ED",
          color: open ? "#fff" : "#6B7280",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0, transition: "all .2s",
        }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div style={{ paddingBottom: 20 }}>
          <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg, #FEFCF7 0%, #EBF4FF 100%)", padding: "80px 0 60px", textAlign: "center" }}>
        <div className="mkt-container">
          <p className="mkt-eyebrow" style={{ justifyContent: "center" }}>Pricing</p>
          <h1 className="mkt-h1" style={{ maxWidth: 560, margin: "0 auto 20px" }}>
            Simple, transparent pricing
          </h1>
          <p className="mkt-lead" style={{ margin: "0 auto 40px", textAlign: "center" }}>
            No setup fees. No hidden costs. Start your 30-day trial for free, no credit card needed.
          </p>

          {/* Billing toggle */}
          <div style={{ display: "inline-flex", background: "#F4F2ED", padding: 4, borderRadius: 100, gap: 4 }}>
            {["Monthly", "Yearly"].map((opt) => {
              const active = (opt === "Yearly") === yearly;
              return (
                <button
                  key={opt}
                  onClick={() => setYearly(opt === "Yearly")}
                  style={{
                    padding: "9px 22px",
                    background: active ? "#fff" : "transparent",
                    border: "none",
                    borderRadius: 100,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    color: active ? "#0071E3" : "#9CA3AF",
                    boxShadow: active ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                    transition: "all .2s",
                    fontFamily: "inherit",
                  }}
                >
                  {opt}{opt === "Yearly" && !active && (
                    <span style={{ marginLeft: 8, background: "#D1FAE5", color: "#059669", padding: "1px 7px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>-20%</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section style={{ background: "#FEFCF7", padding: "60px 0 100px" }}>
        <div className="mkt-container">
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "start" }}
            className="mkt-pricing-grid"
          >
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                style={{
                  background: tier.popular ? "#0071E3" : "#fff",
                  border: tier.popular ? "none" : "1.5px solid #E9E7E0",
                  borderRadius: 20,
                  padding: "36px 32px",
                  boxShadow: tier.popular ? "0 20px 60px rgba(0,113,227,.35)" : "0 4px 16px rgba(0,0,0,.06)",
                  position: "relative",
                  ...(tier.popular ? { transform: "scale(1.03)" } : {}),
                }}
              >
                {tier.popular && (
                  <div style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: "#D4A574", color: "#0C1B2A",
                    padding: "4px 16px", borderRadius: 100,
                    fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ fontSize: 13, fontWeight: 700, color: tier.popular ? "rgba(255,255,255,.7)" : "#9CA3AF", marginBottom: 8 }}>
                  {tier.name.toUpperCase()}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700, color: tier.popular ? "#fff" : "#0C1B2A", lineHeight: 1 }}>
                    ${yearly ? tier.yearly : tier.monthly}
                  </span>
                  <span style={{ fontSize: 14, color: tier.popular ? "rgba(255,255,255,.6)" : "#9CA3AF" }}>/mo</span>
                </div>
                {yearly && (
                  <div style={{ fontSize: 13, color: tier.popular ? "rgba(255,255,255,.5)" : "#9CA3AF", marginBottom: 8 }}>
                    Billed ${tier.yearly * 12}/year
                  </div>
                )}
                <p style={{ fontSize: 14, color: tier.popular ? "rgba(255,255,255,.65)" : "#6B7280", marginBottom: 28 }}>
                  {tier.tagline}
                </p>

                <Link
                  href={tier.href}
                  style={{
                    display: "block", textAlign: "center",
                    padding: "13px 24px",
                    background: tier.popular ? "#fff" : "#0071E3",
                    color: tier.popular ? "#0071E3" : "#fff",
                    borderRadius: 100, fontSize: 14, fontWeight: 700,
                    marginBottom: 28,
                    boxShadow: tier.popular ? "none" : "0 4px 16px rgba(0,113,227,.3)",
                  }}
                >
                  {tier.cta}
                </Link>

                <div style={{ borderTop: `1px solid ${tier.popular ? "rgba(255,255,255,.15)" : "#F4F2ED"}`, paddingTop: 24 }}>
                  <ul style={{ listStyle: "none" }}>
                    {INCLUDED.map((feat, i) => (
                      <li
                        key={feat}
                        style={{
                          display: "flex", gap: 10, alignItems: "flex-start",
                          padding: "7px 0",
                          color: tier.features.includes(i)
                            ? (tier.popular ? "rgba(255,255,255,.9)" : "#2D3142")
                            : (tier.popular ? "rgba(255,255,255,.25)" : "#D1D5DB"),
                          fontSize: 13,
                          textDecoration: tier.features.includes(i) ? "none" : "line-through",
                        }}
                      >
                        <span style={{ color: tier.features.includes(i) ? (tier.popular ? "#D4A574" : "#10B981") : "currentColor", flexShrink: 0, marginTop: 1 }}>
                          {tier.features.includes(i) ? "✓" : "—"}
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", marginTop: 40, fontSize: 14, color: "#9CA3AF" }}>
            All plans include a 30-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
        <style>{`@media(max-width:900px){.mkt-pricing-grid{grid-template-columns:1fr !important;} .mkt-pricing-grid > div:nth-child(2){transform:none !important;}}`}</style>
      </section>

      {/* FAQ */}
      <section style={{ background: "#F8F5EE", padding: "100px 0" }}>
        <div className="mkt-container">
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p className="mkt-eyebrow" style={{ justifyContent: "center" }}>FAQ</p>
              <h2 className="mkt-h2">Questions? We've got answers.</h2>
            </div>
            <div>
              {FAQS.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <p style={{ fontSize: 15, color: "#6B7280" }}>
                Still have questions?{" "}
                <Link href="/contact" style={{ color: "#0071E3", fontWeight: 600 }}>
                  Contact our team →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#0C1B2A", padding: "100px 0", textAlign: "center" }}>
        <div className="mkt-container">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 700, color: "#fff", marginBottom: 24 }}>
            Ready to try MaidHub?
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,.55)", marginBottom: 40 }}>
            30-day free trial. Every feature included. No credit card.
          </p>
          <Link href="/auth/signup" className="mkt-btn mkt-btn-gold mkt-btn-lg">
            Start free trial →
          </Link>
        </div>
      </section>
    </>
  );
}
