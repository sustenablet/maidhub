"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg, #FEFCF7 0%, #EBF4FF 100%)", padding: "80px 0 100px" }}>
        <div className="mkt-container">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}
            className="mkt-contact-grid"
          >
            {/* Left: Info */}
            <div>
              <p className="mkt-eyebrow">Get in Touch</p>
              <h1 className="mkt-h1" style={{ marginBottom: 24 }}>
                We'd love<br />to hear from you.
              </h1>
              <p className="mkt-lead" style={{ marginBottom: 48 }}>
                Have questions about MaidHub? Want a demo? Need help migrating from another tool? Our team responds within a few hours.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {[
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                    ),
                    title: "Email us",
                    body: "hello@maidhub.io",
                    note: "We typically respond within a few hours on business days.",
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    ),
                    title: "Live chat",
                    body: "Chat with us in MaidHub",
                    note: "Available Monday–Friday, 9am–5pm EST.",
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    ),
                    title: "Response time",
                    body: "Within 4 hours",
                    note: "During business hours. 24 hours on weekends.",
                  },
                ].map((item) => (
                  <div key={item.title} style={{ display: "flex", gap: 16 }}>
                    <div style={{ width: 44, height: 44, background: "#EBF4FF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0C1B2A", marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 15, color: "#0071E3", fontWeight: 500, marginBottom: 4 }}>{item.body}</div>
                      <div style={{ fontSize: 13, color: "#9CA3AF" }}>{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div>
              <div style={{ background: "#fff", border: "1px solid #E9E7E0", borderRadius: 20, padding: "40px", boxShadow: "0 8px 40px rgba(0,0,0,.08)" }}>
                {submitted ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div style={{ width: 64, height: 64, background: "#D1FAE5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>
                      ✓
                    </div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "#0C1B2A", marginBottom: 12 }}>
                      Message sent!
                    </h3>
                    <p style={{ color: "#6B7280", lineHeight: 1.7 }}>
                      Thanks for reaching out. We'll get back to you within a few hours.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", company: "", message: "" }); }}
                      style={{ marginTop: 24, padding: "10px 24px", background: "#EBF4FF", color: "#0071E3", border: "none", borderRadius: 100, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#0C1B2A", marginBottom: 28 }}>
                      Send us a message
                    </h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      {[
                        { name: "name", label: "Your name", placeholder: "Sarah Johnson", required: true },
                        { name: "company", label: "Business name", placeholder: "Sarah's Cleaning", required: false },
                      ].map((field) => (
                        <div key={field.name}>
                          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#2D3142", marginBottom: 6 }}>
                            {field.label} {field.required && <span style={{ color: "#0071E3" }}>*</span>}
                          </label>
                          <input
                            type="text"
                            name={field.name}
                            value={form[field.name as keyof typeof form]}
                            onChange={handleChange}
                            required={field.required}
                            placeholder={field.placeholder}
                            style={{
                              width: "100%", padding: "11px 14px",
                              border: "1.5px solid #E9E7E0", borderRadius: 10,
                              fontSize: 14, fontFamily: "inherit",
                              outline: "none", transition: "border-color .2s",
                              color: "#0C1B2A",
                            }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "#0071E3"; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "#E9E7E0"; }}
                          />
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#2D3142", marginBottom: 6 }}>
                        Email address <span style={{ color: "#0071E3" }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="sarah@example.com"
                        style={{
                          width: "100%", padding: "11px 14px",
                          border: "1.5px solid #E9E7E0", borderRadius: 10,
                          fontSize: 14, fontFamily: "inherit",
                          outline: "none",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#0071E3"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#E9E7E0"; }}
                      />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#2D3142", marginBottom: 6 }}>
                        Message <span style={{ color: "#0071E3" }}>*</span>
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us about your cleaning business or what you'd like to know..."
                        style={{
                          width: "100%", padding: "11px 14px",
                          border: "1.5px solid #E9E7E0", borderRadius: 10,
                          fontSize: 14, fontFamily: "inherit",
                          resize: "vertical", outline: "none",
                          color: "#0C1B2A",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#0071E3"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#E9E7E0"; }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: "100%", padding: "14px",
                        background: loading ? "#6B7280" : "#0071E3",
                        color: "#fff", border: "none", borderRadius: 10,
                        fontSize: 15, fontWeight: 700, cursor: loading ? "wait" : "pointer",
                        transition: "all .2s", fontFamily: "inherit",
                      }}
                    >
                      {loading ? "Sending..." : "Send message →"}
                    </button>

                    <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#9CA3AF" }}>
                      We respond within 4 hours on business days
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:900px){.mkt-contact-grid{grid-template-columns:1fr !important;gap:48px !important;}}`}</style>
      </section>

      {/* Not ready CTA */}
      <section style={{ background: "#0C1B2A", padding: "80px 0", textAlign: "center" }}>
        <div className="mkt-container">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "#fff", marginBottom: 16 }}>
            Not ready to chat? Try for free.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", marginBottom: 36 }}>
            Start your 30-day trial and explore everything MaidHub has to offer.
          </p>
          <Link href="/auth/signup" className="mkt-btn mkt-btn-gold mkt-btn-lg">
            Start free trial →
          </Link>
        </div>
      </section>
    </>
  );
}
