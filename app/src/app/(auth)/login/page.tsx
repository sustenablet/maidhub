"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const CSS = `
  .lp-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Syne', system-ui, sans-serif;
  }

  /* ── LEFT PANEL ── */
  .lp-brand {
    width: 44%;
    background: #0C1B2A;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px;
    position: relative;
    overflow: hidden;
  }

  .lp-brand::before {
    content: '';
    position: absolute;
    top: -140px; right: -100px;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: rgba(11,135,117,0.18);
    filter: blur(100px);
    pointer-events: none;
  }

  .lp-brand::after {
    content: '';
    position: absolute;
    bottom: -80px; left: -60px;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: rgba(197,242,68,0.1);
    filter: blur(80px);
    pointer-events: none;
  }

  .lp-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 1;
    text-decoration: none;
  }

  .lp-logomark {
    width: 38px; height: 38px;
    background: #C5F244;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 900;
    font-size: 17px;
    color: #0C1B2A;
    font-style: italic;
  }

  .lp-logoname {
    color: #F6F3EC;
    font-weight: 700;
    font-size: 20px;
    letter-spacing: -0.3px;
  }

  .lp-headline {
    position: relative;
    z-index: 1;
  }

  .lp-headline h1 {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 48px;
    font-weight: 800;
    color: #F6F3EC;
    line-height: 1.07;
    margin: 0 0 20px;
    letter-spacing: -1.5px;
  }

  .lp-headline h1 em {
    font-style: italic;
    color: #C5F244;
  }

  .lp-headline p {
    color: rgba(246,243,236,0.45);
    font-size: 15px;
    line-height: 1.65;
    margin: 0;
    max-width: 340px;
  }

  .lp-stat-row {
    display: flex;
    gap: 28px;
    position: relative;
    z-index: 1;
    margin-top: 32px;
  }

  .lp-stat {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .lp-stat-num {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 28px;
    font-weight: 800;
    color: #F6F3EC;
    letter-spacing: -1px;
  }

  .lp-stat-label {
    font-size: 12px;
    color: rgba(246,243,236,0.38);
    letter-spacing: 0.3px;
  }

  .lp-testimonial {
    background: rgba(255,255,255,0.055);
    border-radius: 18px;
    padding: 24px 26px;
    border: 1px solid rgba(255,255,255,0.07);
    position: relative;
    z-index: 1;
  }

  .lp-testimonial blockquote {
    color: rgba(246,243,236,0.78);
    font-size: 14px;
    line-height: 1.75;
    margin: 0 0 18px;
    font-style: italic;
  }

  .lp-testimonial-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .lp-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0B8775 0%, #C5F244 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0C1B2A;
    font-weight: 800;
    font-size: 13px;
    flex-shrink: 0;
  }

  .lp-author-name {
    color: #F6F3EC;
    font-size: 13px;
    font-weight: 700;
  }

  .lp-author-role {
    color: rgba(246,243,236,0.38);
    font-size: 12px;
  }

  /* ── RIGHT PANEL ── */
  .lp-form-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 52px 64px;
    background: #F6F3EC;
  }

  .lp-form-inner {
    width: 100%;
    max-width: 380px;
    animation: lpFadeUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  @keyframes lpFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .lp-form-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: #0B8775;
    margin-bottom: 14px;
  }

  .lp-form-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 36px;
    font-weight: 800;
    color: #0C1B2A;
    margin: 0 0 8px;
    letter-spacing: -0.8px;
  }

  .lp-form-sub {
    color: #5C6B7A;
    font-size: 15px;
    margin: 0 0 36px;
  }

  .lp-field { margin-bottom: 20px; }

  .lp-label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #0C1B2A;
    margin-bottom: 8px;
  }

  .lp-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .lp-input {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid rgba(12,27,42,0.14);
    border-radius: 11px;
    background: #fff;
    font-size: 15px;
    color: #0C1B2A;
    outline: none;
    box-sizing: border-box;
    font-family: 'Syne', system-ui, sans-serif;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .lp-input:focus {
    border-color: #0B8775;
    box-shadow: 0 0 0 3px rgba(11,135,117,0.1);
  }

  .lp-input::placeholder { color: #93A3B1; }

  .lp-forgot {
    font-size: 13px;
    color: #0B8775;
    font-weight: 600;
    text-decoration: none;
  }

  .lp-forgot:hover { text-decoration: underline; }

  .lp-submit {
    width: 100%;
    padding: 15px;
    background: #0C1B2A;
    color: #F6F3EC;
    border: none;
    border-radius: 11px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 28px;
    font-family: 'Syne', system-ui, sans-serif;
    letter-spacing: -0.2px;
    transition: background 0.15s, transform 0.1s;
  }

  .lp-submit:hover:not(:disabled) {
    background: #122030;
    transform: translateY(-1px);
  }

  .lp-submit:active:not(:disabled) { transform: translateY(0); }

  .lp-submit:disabled {
    background: #B0BEC5;
    cursor: not-allowed;
  }

  .lp-switch {
    text-align: center;
    margin-top: 26px;
    font-size: 14px;
    color: #5C6B7A;
  }

  .lp-switch a {
    color: #0B8775;
    font-weight: 700;
    text-decoration: none;
  }

  .lp-switch a:hover { text-decoration: underline; }

  .lp-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 28px 0 0;
    color: rgba(12,27,42,0.3);
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .lp-divider::before, .lp-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(12,27,42,0.1);
  }

  .lp-google {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 14px;
    padding: 13px;
    background: #fff;
    border: 1.5px solid rgba(12,27,42,0.14);
    border-radius: 11px;
    font-size: 15px;
    font-weight: 600;
    color: #0C1B2A;
    cursor: pointer;
    font-family: 'Syne', system-ui, sans-serif;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .lp-google:hover:not(:disabled) {
    border-color: rgba(12,27,42,0.3);
    box-shadow: 0 1px 4px rgba(12,27,42,0.08);
  }

  .lp-google:disabled { opacity: 0.5; cursor: not-allowed; }

  @media (max-width: 768px) {
    .lp-brand { display: none; }
    .lp-form-panel { padding: 40px 24px; }
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="lp-root">

        {/* ── Brand Panel ── */}
        <div className="lp-brand">
          <Link href="/" className="lp-logo">
            <div className="lp-logomark">M</div>
            <span className="lp-logoname">MaidHub</span>
          </Link>

          <div className="lp-headline">
            <h1>
              Your cleaning<br />
              business,<br />
              <em>organized.</em>
            </h1>
            <p>
              Everything you need to run your solo cleaning business —
              clients, bookings, invoices, and more.
            </p>
            <div className="lp-stat-row">
              <div className="lp-stat">
                <span className="lp-stat-num">3h+</span>
                <span className="lp-stat-label">saved per week</span>
              </div>
              <div className="lp-stat">
                <span className="lp-stat-num">30d</span>
                <span className="lp-stat-label">free trial</span>
              </div>
              <div className="lp-stat">
                <span className="lp-stat-num">$0</span>
                <span className="lp-stat-label">to get started</span>
              </div>
            </div>
          </div>

          <div className="lp-testimonial">
            <blockquote>
              &ldquo;I went from sticky notes and spreadsheets to having everything
              in one place. I save at least 3 hours every week.&rdquo;
            </blockquote>
            <div className="lp-testimonial-author">
              <div className="lp-avatar">M</div>
              <div>
                <div className="lp-author-name">Maria G.</div>
                <div className="lp-author-role">Solo cleaner &middot; Miami, FL</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Panel ── */}
        <div className="lp-form-panel">
          <div className="lp-form-inner">
            <p className="lp-form-eyebrow">Sign in</p>
            <h2 className="lp-form-title">Welcome back</h2>
            <p className="lp-form-sub">Good to see you again</p>

            <form onSubmit={handleLogin}>
              <div className="lp-field">
                <label className="lp-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="lp-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="lp-field">
                <div className="lp-label-row">
                  <label className="lp-label" htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="lp-forgot">Forgot password?</Link>
                </div>
                <input
                  id="password"
                  className="lp-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="lp-submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            <div className="lp-divider">or</div>
            <button type="button" className="lp-google" onClick={handleGoogleLogin} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fill="#4285F4" d="M17.64 9.2a10.34 10.34 0 00-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26a5.4 5.4 0 01-8.07-2.85H.96v2.33A9 9 0 009 18z"/>
                <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 013.69 9c0-.6.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"/>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3.01 2.33C4.66 5.1 6.6 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            <p className="lp-switch">
              Don&apos;t have an account?{" "}
              <Link href="/signup">Start your free trial</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
