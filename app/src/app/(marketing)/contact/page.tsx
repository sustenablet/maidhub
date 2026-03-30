"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission (API call)
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 120, paddingBottom: 60 }}>
        <div className="container">
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <p className="eyebrow">Get in Touch</p>
            <h1 style={{ color: "#0C1B2A", marginBottom: 24 }}>
              We're here to help
            </h1>
            <p
              style={{
                fontSize: 18,
                color: "#6B7280",
                marginBottom: 40,
              }}
            >
              Have questions? Want to schedule a demo? Reach out — we'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ gap: 64, alignItems: "flex-start" }}>
            {/* Contact info */}
            <div>
              <h2 style={{ marginBottom: 40 }}>Let's talk</h2>

              <div style={{ marginBottom: 40 }}>
                <h4 style={{ marginBottom: 8, color: "#0C1B2A" }}>Email</h4>
                <a
                  href="mailto:hello@maidhub.io"
                  style={{
                    fontSize: 16,
                    color: "#0071E3",
                    textDecoration: "none",
                  }}
                >
                  hello@maidhub.io
                </a>
              </div>

              <div style={{ marginBottom: 40 }}>
                <h4 style={{ marginBottom: 8, color: "#0C1B2A" }}>Response time</h4>
                <p style={{ color: "#6B7280", fontSize: 15 }}>
                  We typically respond within 24 hours on business days.
                </p>
              </div>

              <div style={{ marginBottom: 40 }}>
                <h4 style={{ marginBottom: 8, color: "#0C1B2A" }}>What we can help with</h4>
                <ul
                  style={{
                    listStyle: "none",
                    color: "#6B7280",
                    fontSize: 15,
                    lineHeight: 1.8,
                  }}
                >
                  <li>✓ Demo and walkthrough</li>
                  <li>✓ Enterprise pricing</li>
                  <li>✓ Integration questions</li>
                  <li>✓ Technical support</li>
                  <li>✓ Feedback and feature requests</li>
                  <li>✓ Migration from other tools</li>
                </ul>
              </div>
            </div>

            {/* Contact form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#0C1B2A",
                  }}
                >
                  Your name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #E5E3DC",
                    borderRadius: 8,
                    fontSize: 16,
                    fontFamily: "inherit",
                  }}
                  placeholder="Sarah"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#0C1B2A",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #E5E3DC",
                    borderRadius: 8,
                    fontSize: 16,
                    fontFamily: "inherit",
                  }}
                  placeholder="sarah@example.com"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#0C1B2A",
                  }}
                >
                  Company/Business
                </label>
                <input
                  type="text"
                  name="company"
                  value={formState.company}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #E5E3DC",
                    borderRadius: 8,
                    fontSize: 16,
                    fontFamily: "inherit",
                  }}
                  placeholder="Sarah's House Cleaning"
                />
              </div>

              <div style={{ marginBottom: 32 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#0C1B2A",
                  }}
                >
                  Message
                </label>
                <textarea
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #E5E3DC",
                    borderRadius: 8,
                    fontSize: 16,
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                  placeholder="Tell us about your cleaning business or what you'd like to know..."
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  background: "#0071E3",
                  color: "#FFF",
                  border: "none",
                  borderRadius: 100,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#0058B2";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#0071E3";
                }}
              >
                Send message
              </button>

              {submitted && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    background: "#F0FDF4",
                    color: "#166534",
                    borderRadius: 8,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  ✓ Message sent! We'll get back to you soon.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#F9F7F1", padding: "64px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="eyebrow">Quick Answers</p>
            <h2>Frequently asked</h2>
          </div>

          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {[
              {
                q: "How do I schedule a demo?",
                a: "Fill out the form above or email hello@maidhub.io with \"demo\" in the subject. We'll send you a calendar link.",
              },
              {
                q: "Is there a phone number I can call?",
                a: "We currently support email and chat. We prefer async communication so we can serve you without delays.",
              },
              {
                q: "What's your typical response time?",
                a: "During business hours (9am-5pm EST), we usually respond within a few hours. Outside business hours, expect a response within 24 hours.",
              },
              {
                q: "Do you offer custom integrations?",
                a: "For Enterprise plans, yes. Contact sales for options to integrate with your existing tools.",
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
              Not ready to chat? <span style={{ color: "#D4A574" }}>Try free first</span>
            </h2>
            <p style={{ fontSize: 18, marginBottom: 40, color: "rgba(255,255,255,0.7)" }}>
              Start your 30-day free trial with no credit card required.
            </p>
            <Link href="/auth/signup" className="btn btn-secondary btn-lg">
              Get started →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
