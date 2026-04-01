"use client";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ background: "#0C1B2A", color: "rgba(255,255,255,.75)", paddingTop: 72, paddingBottom: 40 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 48,
            paddingBottom: 48,
            borderBottom: "1px solid rgba(255,255,255,.09)",
            marginBottom: 36,
          }}
          className="mkt-footer-grid"
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                marginBottom: 16,
                background: "rgba(255,255,255,.96)",
                padding: "10px 16px",
                borderRadius: 10,
              }}
            >
              <Image
                src="/zentih-logo.png"
                alt="Zentih"
                width={612}
                height={408}
                style={{
                  height: 42,
                  width: "auto",
                  maxWidth: 220,
                  objectFit: "contain",
                }}
              />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,.5)", maxWidth: 240 }}>
              The back-office OS for solo residential cleaners. Run your business like a pro.
            </p>
          </div>

          {[
            {
              heading: "Product",
              links: [
                { label: "Features", href: "/features" },
                { label: "Pricing", href: "/pricing" },
                { label: "How it works", href: "/how-it-works" },
              ],
            },
            {
              heading: "Company",
              links: [
                { label: "Contact", href: "/contact" },
                { label: "Blog", href: "#" },
              ],
            },
            {
              heading: "Legal",
              links: [
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ],
            },
          ].map((col) => (
            <div key={col.heading}>
              <h4 style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,.4)", marginBottom: 18 }}>
                {col.heading}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {col.links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      style={{ fontSize: 14, color: "rgba(255,255,255,.6)", transition: "color .15s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.6)"; }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>
            © 2025 MaidHub, Inc. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/privacy" style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>Privacy</Link>
            <Link href="/terms" style={{ fontSize: 13, color: "rgba(255,255,255,.3)" }}>Terms</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mkt-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .mkt-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
