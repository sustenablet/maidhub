"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const LINKS = [
  { label: "Features", href: "/features" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 200,
          background: "rgba(254,252,247,0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${scrolled ? "#E9E7E0" : "transparent"}`,
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,.06)" : "none",
          transition: "border-color .3s, box-shadow .3s",
        }}
      >
        <div
          className="mkt-nav-inner"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 48px",
            display: "flex",
            alignItems: "center",
            minHeight: 72,
            gap: 40,
          }}
        >
          {/* Logo — full wordmark, readable size */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              flexShrink: 0,
              minWidth: 0,
            }}
          >
            <Image
              src="/zentih-logo.png"
              alt="Zentih"
              width={612}
              height={408}
              priority
              sizes="(max-width: 600px) 200px, 260px"
              style={{
                height: "clamp(38px, 10vw, 52px)",
                width: "auto",
                maxWidth: "min(260px, 58vw)",
                objectFit: "contain",
              }}
            />
          </Link>

          {/* Desktop nav links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flex: 1,
            }}
            className="mkt-nav-links"
          >
            {LINKS.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: "8px 14px",
                    fontSize: 14,
                    fontWeight: active ? 600 : 500,
                    color: active ? "#0071E3" : "#6B7280",
                    borderRadius: 8,
                    transition: "color .15s, background .15s",
                    background: active ? "#EBF4FF" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "#2D3142";
                      (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "#6B7280";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* CTA */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}
            className="mkt-nav-cta"
          >
            <Link
              href="/auth/login"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#6B7280",
                padding: "8px 16px",
                transition: "color .15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#2D3142"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6B7280"; }}
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 20px",
                background: "#0071E3",
                color: "#fff",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                transition: "all .2s",
                boxShadow: "0 2px 12px rgba(0,113,227,.28)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0058B2";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,113,227,.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0071E3";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,113,227,.28)";
              }}
            >
              Get started free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* Hamburger */}
          <button
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              flexDirection: "column",
              gap: 5,
            }}
            className="mkt-hamburger"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: 22,
                  height: 2,
                  background: "#2D3142",
                  borderRadius: 1,
                  transition: "all .3s",
                  ...(menuOpen && i === 0 ? { transform: "translateY(7px) rotate(45deg)" } : {}),
                  ...(menuOpen && i === 1 ? { opacity: 0 } : {}),
                  ...(menuOpen && i === 2 ? { transform: "translateY(-7px) rotate(-45deg)" } : {}),
                }}
              />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 199,
          background: "rgba(12,27,42,.6)",
          backdropFilter: "blur(8px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transition: "opacity .3s",
        }}
        onClick={() => setMenuOpen(false)}
      />
      <div
        style={{
          position: "fixed",
          top: 72,
          left: 0,
          right: 0,
          zIndex: 199,
          background: "#FEFCF7",
          borderBottom: "1px solid #E9E7E0",
          padding: "24px 20px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          transform: menuOpen ? "translateY(0)" : "translateY(-120%)",
          transition: "transform .35s cubic-bezier(.16,1,.3,1)",
        }}
      >
        {LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            style={{
              padding: "14px 16px",
              fontSize: 16,
              fontWeight: 500,
              color: "#2D3142",
              borderRadius: 8,
            }}
          >
            {label}
          </Link>
        ))}
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <Link
            href="/auth/login"
            style={{
              padding: "13px 24px",
              border: "1.5px solid #E9E7E0",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              color: "#2D3142",
              textAlign: "center",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            style={{
              padding: "13px 24px",
              background: "#0071E3",
              color: "#fff",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              textAlign: "center",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Get started free →
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mkt-nav-inner { padding: 0 20px !important; gap: 16px !important; }
          .mkt-nav-links, .mkt-nav-cta { display: none !important; }
          .mkt-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
