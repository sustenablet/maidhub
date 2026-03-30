"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ─── Design tokens ────────────────────────────────────────── */
const CREAM = "#F6F3EC";
const NAVY = "#0C1B2A";
const LIME = "#C5F244";
const MUTED = "#5C6B7A";

/* ─── Reusable style helpers ─────────────────────────────── */
const display: React.CSSProperties = { fontFamily: "var(--font-display, Georgia, serif)" };
const ui: React.CSSProperties = { fontFamily: "var(--font-ui, system-ui, sans-serif)" };

/* ─── Navbar ─────────────────────────────────────────────── */
function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 48px)",
          maxWidth: 900,
          zIndex: 1000,
          ...ui,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: scrolled ? "rgba(8,18,30,.97)" : "rgba(10,22,36,.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 100,
            padding: "8px 8px 8px 22px",
            boxShadow: scrolled
              ? "0 16px 48px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)"
              : "0 8px 32px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05)",
            transition: "background .3s, box-shadow .3s",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              ...display,
              fontSize: 18,
              fontWeight: 700,
              color: "rgba(255,255,255,.92)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            MaidHub
            <span
              style={{
                width: 7,
                height: 7,
                background: LIME,
                borderRadius: "50%",
                boxShadow: `0 0 0 2.5px rgba(197,242,68,.22)`,
                display: "inline-block",
              }}
            />
          </Link>

          {/* Desktop links */}
          <ul
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
            className="nav-desktop-links"
          >
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
            ].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={close}
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "rgba(255,255,255,.5)",
                    textDecoration: "none",
                    padding: "7px 13px",
                    borderRadius: 100,
                    display: "block",
                    whiteSpace: "nowrap",
                    transition: "color .15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.color = "rgba(255,255,255,.9)";
                    (e.target as HTMLElement).style.background = "rgba(255,255,255,.07)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.color = "rgba(255,255,255,.5)";
                    (e.target as HTMLElement).style.background = "transparent";
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
            className="nav-desktop-cta"
          >
            <Link
              href="/auth/login"
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: "rgba(255,255,255,.5)",
                textDecoration: "none",
                padding: "8px 14px",
                borderRadius: 100,
                whiteSpace: "nowrap",
                transition: "color .15s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "rgba(255,255,255,.88)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "rgba(255,255,255,.5)";
              }}
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: NAVY,
                background: LIME,
                textDecoration: "none",
                padding: "9px 18px",
                borderRadius: 100,
                whiteSpace: "nowrap",
                letterSpacing: "-.1px",
                transition: "background .15s, transform .15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#d0ff60";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = LIME;
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              Start free →
            </Link>
          </div>

          {/* Hamburger */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 5,
              cursor: "pointer",
              border: "none",
              background: "rgba(255,255,255,.08)",
              width: 38,
              height: 38,
              borderRadius: "50%",
              flexShrink: 0,
              padding: 0,
            }}
            className="nav-hamburger"
          >
            <span
              style={{
                width: 16,
                height: 1.5,
                background: "rgba(255,255,255,.85)",
                borderRadius: 2,
                display: "block",
                transition: "transform .3s cubic-bezier(.16,1,.3,1), opacity .2s",
                transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
              }}
            />
            <span
              style={{
                width: 16,
                height: 1.5,
                background: "rgba(255,255,255,.85)",
                borderRadius: 2,
                display: "block",
                transition: "transform .3s, opacity .2s",
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? "scaleX(0)" : "none",
              }}
            />
            <span
              style={{
                width: 16,
                height: 1.5,
                background: "rgba(255,255,255,.85)",
                borderRadius: 2,
                display: "block",
                transition: "transform .3s cubic-bezier(.16,1,.3,1), opacity .2s",
                transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile backdrop */}
      <div
        onClick={close}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 998,
          background: "rgba(4,9,18,.65)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transition: "opacity .35s",
        }}
      />

      {/* Mobile menu */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          background: "#08172B",
          borderBottom: "1px solid rgba(255,255,255,.07)",
          padding: "88px 36px 48px",
          display: "flex",
          flexDirection: "column",
          transform: menuOpen ? "translateY(0)" : "translateY(-100%)",
          transition: "transform .45s cubic-bezier(.16,1,.3,1)",
          ...ui,
        }}
      >
        {[
          { label: "Features", href: "#features" },
          { label: "How it works", href: "#how-it-works" },
          { label: "Pricing", href: "#pricing" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={close}
            style={{
              ...display,
              fontSize: 38,
              fontWeight: 700,
              color: "rgba(255,255,255,.7)",
              textDecoration: "none",
              padding: "14px 0",
              display: "block",
              borderBottom: "1px solid rgba(255,255,255,.06)",
              letterSpacing: "-.6px",
              lineHeight: 1.15,
              transition: "color .2s",
            }}
          >
            {item.label}
          </a>
        ))}
        <Link
          href="/auth/signup"
          onClick={close}
          style={{
            marginTop: 36,
            alignSelf: "flex-start",
            fontSize: 15,
            fontWeight: 700,
            color: NAVY,
            background: LIME,
            padding: "13px 26px",
            borderRadius: 100,
            textDecoration: "none",
            letterSpacing: "-.1px",
          }}
        >
          Start free trial →
        </Link>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 720px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-cta { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */
function Hero() {
  return (
    <section
      style={{
        background: CREAM,
        paddingTop: 140,
        paddingBottom: 100,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle radial accent */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(197,242,68,.13) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
        {/* Eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(197,242,68,.14)",
            border: "1px solid rgba(197,242,68,.3)",
            padding: "6px 14px",
            borderRadius: 100,
            marginBottom: 28,
            ...ui,
            fontSize: 12.5,
            fontWeight: 700,
            color: "#0B8775",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0B8775", display: "inline-block" }} />
          Now in early access — 30-day free trial
        </div>

        {/* Headline */}
        <h1
          style={{
            ...display,
            fontSize: "clamp(48px, 7vw, 88px)",
            fontWeight: 800,
            color: NAVY,
            lineHeight: 1.03,
            letterSpacing: "-2px",
            maxWidth: 800,
            margin: "0 0 24px",
          }}
        >
          Run your cleaning
          <br />
          business{" "}
          <em style={{ fontStyle: "italic", color: "#0B8775" }}>like a pro.</em>
        </h1>

        {/* Sub */}
        <p
          style={{
            ...ui,
            fontSize: 18,
            color: MUTED,
            maxWidth: 520,
            lineHeight: 1.65,
            margin: "0 0 40px",
          }}
        >
          MaidHub is the back-office command center built for solo house cleaners.
          Manage clients, schedule recurring jobs, and send professional invoices — all in one place.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <Link
            href="/auth/signup"
            style={{
              ...ui,
              fontSize: 15.5,
              fontWeight: 700,
              color: NAVY,
              background: LIME,
              padding: "14px 30px",
              borderRadius: 100,
              textDecoration: "none",
              letterSpacing: "-.1px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Start free trial →
          </Link>
          <a
            href="#how-it-works"
            style={{
              ...ui,
              fontSize: 15,
              fontWeight: 600,
              color: NAVY,
              background: "transparent",
              border: `1.5px solid rgba(12,27,42,.2)`,
              padding: "13px 28px",
              borderRadius: 100,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            See how it works
          </a>
        </div>

        {/* Trust note */}
        <p style={{ ...ui, fontSize: 13, color: MUTED, marginTop: 20 }}>
          No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}

/* ─── Social proof strip ─────────────────────────────────── */
function SocialProof() {
  const items = [
    "Clients managed effortlessly",
    "Invoices sent in seconds",
    "Recurring jobs on autopilot",
    "No spreadsheets needed",
    "Built for solo cleaners",
  ];
  return (
    <div
      style={{
        background: NAVY,
        padding: "18px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 48,
          animation: "ticker 28s linear infinite",
          whiteSpace: "nowrap",
        }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            style={{
              ...ui,
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,.45)",
              letterSpacing: ".5px",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              flexShrink: 0,
            }}
          >
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: LIME, display: "inline-block", flexShrink: 0 }} />
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}

/* ─── Pain points ────────────────────────────────────────── */
function PainPoints() {
  const pains = [
    {
      icon: "📋",
      title: "Quotes stuck in your head",
      body: "Writing estimates on napkins or texting prices one by one. No record, no system, no follow-up.",
    },
    {
      icon: "💸",
      title: "Chasing late payments",
      body: "Sending invoice reminders manually, awkwardly texting clients — and still waiting weeks to get paid.",
    },
    {
      icon: "📅",
      title: "Scheduling from memory",
      body: "Double-booking, forgetting recurring clients, losing jobs because someone slipped through the cracks.",
    },
  ];

  return (
    <section style={{ background: CREAM, padding: "100px 0" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
        <p
          style={{
            ...ui,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: MUTED,
            marginBottom: 20,
          }}
        >
          Sound familiar?
        </p>
        <h2
          style={{
            ...display,
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800,
            color: NAVY,
            letterSpacing: "-1.2px",
            lineHeight: 1.1,
            maxWidth: 560,
            margin: "0 0 64px",
          }}
        >
          Running your business
          shouldn&apos;t feel like
          <em style={{ fontStyle: "italic" }}> a second job.</em>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
          className="pain-grid"
        >
          {pains.map((p) => (
            <div
              key={p.title}
              style={{
                background: "#EDE9DF",
                borderRadius: 20,
                padding: "36px 32px",
                border: "1px solid rgba(12,27,42,.06)",
              }}
            >
              <span style={{ fontSize: 28, display: "block", marginBottom: 20 }}>{p.icon}</span>
              <h3
                style={{
                  ...display,
                  fontSize: 22,
                  fontWeight: 700,
                  color: NAVY,
                  letterSpacing: "-.4px",
                  marginBottom: 12,
                }}
              >
                {p.title}
              </h3>
              <p style={{ ...ui, fontSize: 15, color: MUTED, lineHeight: 1.6 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pain-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────────── */
function Features() {
  const features = [
    {
      tag: "Client Management",
      title: "Every client, every detail — in one place.",
      body: "Store addresses, cleaning preferences, entry instructions, and full job history. Never forget a detail again.",
      accent: LIME,
    },
    {
      tag: "Scheduling",
      title: "Set it up once. Show up and get paid.",
      body: "Create recurring schedules for weekly, bi-weekly, or monthly cleans. Your calendar fills itself.",
      accent: "#7DD3FC",
    },
    {
      tag: "Invoicing",
      title: "Professional invoices sent in under 30 seconds.",
      body: "Auto-generate invoices from completed jobs. Send via SMS or email. Get paid faster.",
      accent: "#86EFAC",
    },
    {
      tag: "Estimates",
      title: "Send quotes that close deals.",
      body: "Create polished estimates your clients can approve with a single tap. No back-and-forth.",
      accent: "#FCA5A5",
    },
  ];

  return (
    <section id="features" style={{ background: NAVY, padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          bottom: -200,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(197,242,68,.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
        <p
          style={{
            ...ui,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.3)",
            marginBottom: 20,
          }}
        >
          Everything you need
        </p>
        <h2
          style={{
            ...display,
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800,
            color: "rgba(255,255,255,.92)",
            letterSpacing: "-1.2px",
            lineHeight: 1.1,
            maxWidth: 560,
            margin: "0 0 64px",
          }}
        >
          One app. Every tool
          your business needs.
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
          }}
          className="feat-grid"
        >
          {features.map((f) => (
            <div
              key={f.tag}
              style={{
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 20,
                padding: "36px 32px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  ...ui,
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: f.accent,
                  marginBottom: 20,
                  padding: "4px 10px",
                  background: `${f.accent}18`,
                  borderRadius: 100,
                }}
              >
                {f.tag}
              </span>
              <h3
                style={{
                  ...display,
                  fontSize: 24,
                  fontWeight: 700,
                  color: "rgba(255,255,255,.88)",
                  letterSpacing: "-.4px",
                  lineHeight: 1.25,
                  marginBottom: 12,
                }}
              >
                {f.title}
              </h3>
              <p style={{ ...ui, fontSize: 15, color: "rgba(255,255,255,.45)", lineHeight: 1.65 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .feat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── How it works ───────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Add your clients", body: "Import or add clients in seconds. Store everything — addresses, preferences, entry notes." },
    { n: "02", title: "Schedule their jobs", body: "Set up recurring cleans in one click. MaidHub keeps your calendar organized automatically." },
    { n: "03", title: "Send and get paid", body: "Auto-generate invoices after each job. Send via SMS. Get paid faster than ever." },
  ];

  return (
    <section id="how-it-works" style={{ background: CREAM, padding: "100px 0" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
        <p
          style={{
            ...ui,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: MUTED,
            marginBottom: 20,
          }}
        >
          How it works
        </p>
        <h2
          style={{
            ...display,
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800,
            color: NAVY,
            letterSpacing: "-1.2px",
            lineHeight: 1.1,
            maxWidth: 540,
            margin: "0 0 72px",
          }}
        >
          Up and running in under 10 minutes.
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 32,
          }}
          className="steps-grid"
        >
          {steps.map((s) => (
            <div key={s.n}>
              <div
                style={{
                  ...display,
                  fontSize: 72,
                  fontWeight: 900,
                  color: "rgba(12,27,42,.07)",
                  lineHeight: 1,
                  marginBottom: 20,
                  letterSpacing: "-3px",
                }}
              >
                {s.n}
              </div>
              <h3
                style={{
                  ...display,
                  fontSize: 22,
                  fontWeight: 700,
                  color: NAVY,
                  letterSpacing: "-.4px",
                  marginBottom: 12,
                }}
              >
                {s.title}
              </h3>
              <p style={{ ...ui, fontSize: 15, color: MUTED, lineHeight: 1.65 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── Pricing ────────────────────────────────────────────── */
function Pricing() {
  const included = [
    "Unlimited clients",
    "Unlimited jobs & scheduling",
    "Professional invoicing",
    "Estimates & quotes",
    "SMS & email notifications",
    "Client portal access",
    "Mobile-first design",
    "Priority support",
  ];

  return (
    <section id="pricing" style={{ background: "#EDE9DF", padding: "100px 0" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
        <p
          style={{
            ...ui,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: MUTED,
            marginBottom: 20,
          }}
        >
          Pricing
        </p>
        <h2
          style={{
            ...display,
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800,
            color: NAVY,
            letterSpacing: "-1.2px",
            lineHeight: 1.1,
            margin: "0 0 64px",
          }}
        >
          Simple pricing.
          No surprises.
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
          className="pricing-grid"
        >
          {/* Card */}
          <div
            style={{
              background: NAVY,
              borderRadius: 24,
              padding: "48px 44px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -80,
                right: -80,
                width: 260,
                height: 260,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(197,242,68,.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: `${LIME}22`,
                border: `1px solid ${LIME}44`,
                padding: "5px 12px",
                borderRadius: 100,
                ...ui,
                fontSize: 12,
                fontWeight: 700,
                color: LIME,
                marginBottom: 28,
                letterSpacing: ".5px",
                textTransform: "uppercase",
              }}
            >
              Early Access
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
              <span style={{ ...display, fontSize: 64, fontWeight: 900, color: "#fff", letterSpacing: "-3px", lineHeight: 1 }}>
                $29
              </span>
              <span style={{ ...ui, fontSize: 15, color: "rgba(255,255,255,.4)" }}>/month</span>
            </div>
            <p style={{ ...ui, fontSize: 14, color: "rgba(255,255,255,.4)", marginBottom: 36 }}>
              30-day free trial included. No credit card required.
            </p>
            <Link
              href="/auth/signup"
              style={{
                display: "block",
                textAlign: "center",
                ...ui,
                fontSize: 15,
                fontWeight: 700,
                color: NAVY,
                background: LIME,
                padding: "14px 0",
                borderRadius: 100,
                textDecoration: "none",
                letterSpacing: "-.1px",
                marginBottom: 36,
              }}
            >
              Start free trial →
            </Link>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {included.map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    ...ui,
                    fontSize: 14,
                    color: "rgba(255,255,255,.7)",
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: `${LIME}22`,
                      border: `1px solid ${LIME}55`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 10,
                      color: LIME,
                    }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: FAQ-style callouts */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              {
                q: "Is there a free trial?",
                a: "Yes — 30 days free, no credit card needed. Cancel anytime with one click.",
              },
              {
                q: "Can I use it on my phone?",
                a: "MaidHub is built mobile-first. It works great on iPhone and Android — no app download required.",
              },
              {
                q: "What if I need to cancel?",
                a: "Cancel anytime from your account settings. No hidden fees, no lock-in.",
              },
              {
                q: "Do you offer support?",
                a: "Every plan includes priority email and chat support. We respond within a few hours.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                style={{
                  background: CREAM,
                  borderRadius: 16,
                  padding: "28px 28px",
                  border: "1px solid rgba(12,27,42,.07)",
                }}
              >
                <h4
                  style={{
                    ...display,
                    fontSize: 17,
                    fontWeight: 700,
                    color: NAVY,
                    marginBottom: 8,
                    letterSpacing: "-.3px",
                  }}
                >
                  {faq.q}
                </h4>
                <p style={{ ...ui, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section style={{ background: NAVY, padding: "120px 0", textAlign: "center" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 32px" }}>
        <h2
          style={{
            ...display,
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-2px",
            lineHeight: 1.05,
            margin: "0 0 24px",
          }}
        >
          Your business
          <br />
          <em style={{ color: LIME, fontStyle: "italic" }}>deserves better</em>
          <br />
          tools.
        </h2>
        <p
          style={{
            ...ui,
            fontSize: 17,
            color: "rgba(255,255,255,.45)",
            lineHeight: 1.65,
            margin: "0 0 40px",
          }}
        >
          Join solo cleaners who run tighter, more professional businesses with MaidHub.
          Start your 30-day free trial today.
        </p>
        <Link
          href="/auth/signup"
          style={{
            ...ui,
            fontSize: 16,
            fontWeight: 700,
            color: NAVY,
            background: LIME,
            padding: "16px 36px",
            borderRadius: 100,
            textDecoration: "none",
            letterSpacing: "-.1px",
            display: "inline-block",
          }}
        >
          Start free trial — no card needed →
        </Link>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        background: "#070E16",
        padding: "48px 32px",
        ...ui,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ ...display, fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>
            MaidHub
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: LIME,
              display: "inline-block",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          {[
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Log in", href: "/auth/login" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ fontSize: 13, color: "rgba(255,255,255,.35)", textDecoration: "none" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.25)", margin: 0 }}>
          © 2025 MaidHub
        </p>
      </div>
    </footer>
  );
}

/* ─── Grain overlay ──────────────────────────────────────── */
const grainSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

/* ─── Page ───────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ background: CREAM, color: NAVY, minHeight: "100vh", overflowX: "hidden" }}>
      {/* Grain texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          opacity: 0.028,
          backgroundImage: grainSvg,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <Nav />
      <Hero />
      <SocialProof />
      <PainPoints />
      <Features />
      <HowItWorks />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
