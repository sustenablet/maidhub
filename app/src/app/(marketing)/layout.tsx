import type { Metadata } from "next";
import { Poppins, Lora } from "next/font/google";
import Link from "next/link";
import "./marketing.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MaidHub — Run your cleaning business like a pro",
  description:
    "The back-office OS for solo residential cleaners. Manage clients, schedule recurring jobs, send professional invoices — all in one place.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${poppins.variable} ${lora.variable} marketing-app`}>
      {/* Header */}
      <header className="marketing-header">
        <div className="header-container">
          <Link href="/" className="logo">
            <span className="logo-text">MaidHub</span>
            <span className="logo-dot"></span>
          </Link>

          <nav className="nav-menu">
            <Link href="/">Home</Link>
            <Link href="/features">Features</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className="nav-cta">
            <Link href="/auth/login" className="btn-ghost">
              Log in
            </Link>
            <Link href="/auth/signup" className="btn-primary">
              Get started free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="mobile-menu-btn" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="marketing-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo">
                <span className="logo-text">MaidHub</span>
              </div>
              <p>The back-office OS for solo cleaners.</p>
            </div>

            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/how-it-works">How it works</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 MaidHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
