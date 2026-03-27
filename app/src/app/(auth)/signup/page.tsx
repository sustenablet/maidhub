"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Step = 1 | 2 | 3;

interface Onboarding {
  businessName: string;
  yearsExp: string;
  clientCount: string;
  services: string[];
  bookingMethod: string;
  challenge: string;
}

const SERVICES = [
  { id: "regular",    icon: "🔄", label: "Regular / recurring cleaning" },
  { id: "deep",       icon: "✨", label: "Deep cleaning" },
  { id: "moveinout",  icon: "📦", label: "Move-in / move-out" },
  { id: "airbnb",     icon: "🏡", label: "Airbnb / short-term rental" },
  { id: "commercial", icon: "🏢", label: "Office / commercial" },
];

/* ─────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */
const CSS = `
  .sp-root {
    min-height: 100vh;
    background: linear-gradient(158deg, #FAF8F2 0%, #EDE9DF 100%);
    font-family: 'Syne', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
  }

  /* Header */
  .sp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 40px;
    border-bottom: 1px solid rgba(12,27,42,0.07);
    position: sticky;
    top: 0;
    background: rgba(250,248,242,0.88);
    backdrop-filter: blur(14px);
    z-index: 20;
  }

  .sp-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .sp-logomark {
    width: 34px; height: 34px;
    background: #0C1B2A;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 900;
    font-size: 15px;
    color: #C5F244;
    font-style: italic;
  }

  .sp-logoname {
    color: #0C1B2A;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: -0.3px;
  }

  .sp-progress-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
  }

  .sp-progress-track {
    width: 180px;
    height: 4px;
    background: rgba(12,27,42,0.1);
    border-radius: 99px;
    overflow: hidden;
  }

  .sp-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #0B8775 0%, #C5F244 100%);
    border-radius: 99px;
    transition: width 0.45s cubic-bezier(0.34,1.56,0.64,1);
  }

  .sp-progress-label {
    font-size: 11px;
    font-weight: 700;
    color: #5C6B7A;
    letter-spacing: 0.5px;
  }

  .sp-signin-link {
    font-size: 14px;
    color: #0B8775;
    font-weight: 700;
    text-decoration: none;
  }
  .sp-signin-link:hover { text-decoration: underline; }

  /* Content area */
  .sp-body {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 56px 24px 80px;
  }

  /* Step cards */
  .sp-step {
    width: 100%;
    max-width: 560px;
    animation: spIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  @keyframes spIn {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sp-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: #0B8775;
    margin-bottom: 14px;
  }

  .sp-heading {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 40px;
    font-weight: 800;
    color: #0C1B2A;
    line-height: 1.08;
    margin: 0 0 12px;
    letter-spacing: -1.2px;
  }

  .sp-subtext {
    font-size: 15px;
    color: #5C6B7A;
    margin: 0 0 44px;
    line-height: 1.55;
  }

  /* Field groups */
  .sp-fields {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .sp-field-label {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: #0C1B2A;
    margin-bottom: 14px;
    line-height: 1.4;
  }

  .sp-field-label span {
    font-weight: 400;
    color: #5C6B7A;
  }

  .sp-text-input {
    width: 100%;
    padding: 14px 18px;
    border: 1.5px solid rgba(12,27,42,0.14);
    border-radius: 12px;
    background: #fff;
    font-size: 15px;
    color: #0C1B2A;
    outline: none;
    box-sizing: border-box;
    font-family: 'Syne', system-ui, sans-serif;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .sp-text-input:focus {
    border-color: #0B8775;
    box-shadow: 0 0 0 3px rgba(11,135,117,0.1);
  }

  .sp-text-input::placeholder { color: #93A3B1; }

  /* Pill options (single-select) */
  .sp-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .sp-pill {
    padding: 11px 20px;
    border: 1.5px solid rgba(12,27,42,0.14);
    border-radius: 99px;
    background: #fff;
    font-size: 14px;
    font-weight: 600;
    color: #5C6B7A;
    cursor: pointer;
    font-family: 'Syne', system-ui, sans-serif;
    transition: all 0.15s;
  }

  .sp-pill:hover {
    border-color: #0B8775;
    color: #0B8775;
    background: rgba(11,135,117,0.04);
  }

  .sp-pill.active {
    border-color: #0B8775;
    background: rgba(11,135,117,0.09);
    color: #0B8775;
  }

  /* Column options (single-select full-width) */
  .sp-options-col {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .sp-option-row {
    padding: 13px 18px;
    border: 1.5px solid rgba(12,27,42,0.12);
    border-radius: 12px;
    background: #fff;
    font-size: 14px;
    font-weight: 600;
    color: #5C6B7A;
    cursor: pointer;
    font-family: 'Syne', system-ui, sans-serif;
    text-align: left;
    transition: all 0.15s;
  }

  .sp-option-row:hover {
    border-color: #0B8775;
    color: #0B8775;
  }

  .sp-option-row.active {
    border-color: #0B8775;
    background: rgba(11,135,117,0.08);
    color: #0B8775;
  }

  /* Checkbox cards (multi-select) */
  .sp-checks {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .sp-check-card {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 14px 18px;
    border: 1.5px solid rgba(12,27,42,0.12);
    border-radius: 12px;
    background: #fff;
    font-size: 14px;
    font-weight: 600;
    color: #5C6B7A;
    cursor: pointer;
    font-family: 'Syne', system-ui, sans-serif;
    text-align: left;
    transition: all 0.15s;
  }

  .sp-check-card:hover {
    border-color: #0B8775;
    color: #0B8775;
  }

  .sp-check-card.active {
    border-color: #0B8775;
    background: rgba(11,135,117,0.07);
    color: #0B8775;
  }

  .sp-check-icon { font-size: 18px; flex-shrink: 0; }

  .sp-check-tick {
    margin-left: auto;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #0B8775;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    flex-shrink: 0;
  }

  /* Buttons */
  .sp-btn-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 36px;
  }

  .sp-btn-primary {
    padding: 15px 32px;
    background: #0C1B2A;
    color: #F6F3EC;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Syne', system-ui, sans-serif;
    letter-spacing: -0.2px;
    transition: background 0.15s, transform 0.1s;
  }

  .sp-btn-primary:hover:not(:disabled) {
    background: #122030;
    transform: translateY(-1px);
  }

  .sp-btn-primary:active:not(:disabled) { transform: translateY(0); }

  .sp-btn-primary:disabled {
    background: #C8D0D8;
    cursor: not-allowed;
  }

  .sp-btn-back {
    padding: 15px 22px;
    background: transparent;
    color: #5C6B7A;
    border: 1.5px solid rgba(12,27,42,0.14);
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Syne', system-ui, sans-serif;
    transition: all 0.15s;
  }

  .sp-btn-back:hover {
    border-color: #0C1B2A;
    color: #0C1B2A;
  }

  .sp-legal {
    font-size: 13px;
    color: #93A3B1;
    text-align: center;
    margin-top: 16px;
    line-height: 1.6;
  }

  .sp-legal a { color: #0B8775; text-decoration: none; }
  .sp-legal a:hover { text-decoration: underline; }

  /* Success screen */
  .sp-success {
    margin: auto;
    text-align: center;
    max-width: 440px;
    padding: 60px 24px;
    animation: spIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  .sp-success-icon {
    font-size: 52px;
    margin-bottom: 24px;
    display: block;
  }

  .sp-success-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 36px;
    font-weight: 800;
    color: #0C1B2A;
    margin: 0 0 14px;
    letter-spacing: -0.8px;
  }

  .sp-success-text {
    color: #5C6B7A;
    font-size: 16px;
    line-height: 1.7;
    margin: 0 0 28px;
  }

  .sp-success-link {
    color: #0B8775;
    font-weight: 700;
    font-size: 14px;
    text-decoration: none;
  }

  .sp-success-link:hover { text-decoration: underline; }

  .sp-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 24px 0 0;
    color: rgba(12,27,42,0.3);
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .sp-divider::before, .sp-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(12,27,42,0.12);
  }

  .sp-google {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 14px;
    padding: 14px;
    background: #fff;
    border: 1.5px solid rgba(12,27,42,0.14);
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    color: #0C1B2A;
    cursor: pointer;
    font-family: 'Syne', system-ui, sans-serif;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .sp-google:hover:not(:disabled) {
    border-color: rgba(12,27,42,0.3);
    box-shadow: 0 1px 4px rgba(12,27,42,0.08);
  }

  .sp-google:disabled { opacity: 0.5; cursor: not-allowed; }

  @media (max-width: 600px) {
    .sp-header { padding: 16px 20px; }
    .sp-progress-track { width: 120px; }
    .sp-heading { font-size: 28px; }
    .sp-body { padding: 36px 16px 60px; }
  }
`;

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function SignupPage() {
  const [step, setStep] = useState<Step>(1);
  const [ob, setOb] = useState<Onboarding>({
    businessName: "",
    yearsExp: "",
    clientCount: "",
    services: [],
    bookingMethod: "",
    challenge: "",
  });
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  function toggleService(id: string) {
    setOb(p => ({
      ...p,
      services: p.services.includes(id)
        ? p.services.filter(s => s !== id)
        : [...p.services, id],
    }));
  }

  const canStep1 = ob.businessName.trim() && ob.yearsExp && ob.clientCount;
  const canStep2 = ob.services.length > 0 && ob.bookingMethod && ob.challenge;

  async function handleGoogleSignup() {
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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          business_name: ob.businessName,
          years_experience: ob.yearsExp,
          client_count: ob.clientCount,
          services: ob.services,
          booking_method: ob.bookingMethod,
          main_challenge: ob.challenge,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  /* ── Success ── */
  if (sent) {
    return (
      <>
        <style>{CSS}</style>
        <div className="sp-root">
          <div className="sp-body">
            <div className="sp-success">
              <span className="sp-success-icon">✉️</span>
              <h2 className="sp-success-title">Check your inbox</h2>
              <p className="sp-success-text">
                We sent a verification link to <strong>{email}</strong>.
                <br />Click it to activate your MaidHub account.
              </p>
              <Link href="/login" className="sp-success-link">← Back to sign in</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="sp-root">

        {/* Header */}
        <header className="sp-header">
          <Link href="/" className="sp-logo">
            <div className="sp-logomark">M</div>
            <span className="sp-logoname">MaidHub</span>
          </Link>

          <div className="sp-progress-wrap">
            <div className="sp-progress-track">
              <div className="sp-progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
            <span className="sp-progress-label">Step {step} of 3</span>
          </div>

          <Link href="/login" className="sp-signin-link">Sign in</Link>
        </header>

        {/* Body */}
        <div className="sp-body">

          {/* ── STEP 1: Business basics ── */}
          {step === 1 && (
            <div className="sp-step" key="step1">
              <p className="sp-eyebrow">Getting started</p>
              <h1 className="sp-heading">Tell us about<br />your business</h1>
              <p className="sp-subtext">We&apos;ll personalize MaidHub to fit exactly how you work</p>

              <div className="sp-fields">
                <div>
                  <label className="sp-field-label">What&apos;s your business called?</label>
                  <input
                    className="sp-text-input"
                    type="text"
                    placeholder="e.g. Sparkle Clean Co."
                    value={ob.businessName}
                    onChange={e => setOb(p => ({ ...p, businessName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="sp-field-label">How long have you been cleaning professionally?</label>
                  <div className="sp-pills">
                    {[
                      { v: "new",  l: "Just starting" },
                      { v: "1-3",  l: "1–3 years" },
                      { v: "3-7",  l: "3–7 years" },
                      { v: "7+",   l: "7+ years" },
                    ].map(o => (
                      <button
                        key={o.v}
                        type="button"
                        className={`sp-pill${ob.yearsExp === o.v ? " active" : ""}`}
                        onClick={() => setOb(p => ({ ...p, yearsExp: o.v }))}
                      >{o.l}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="sp-field-label">How many active clients do you have?</label>
                  <div className="sp-pills">
                    {[
                      { v: "0-5",   l: "0–5 clients" },
                      { v: "6-20",  l: "6–20 clients" },
                      { v: "21-50", l: "21–50 clients" },
                      { v: "50+",   l: "50+ clients" },
                    ].map(o => (
                      <button
                        key={o.v}
                        type="button"
                        className={`sp-pill${ob.clientCount === o.v ? " active" : ""}`}
                        onClick={() => setOb(p => ({ ...p, clientCount: o.v }))}
                      >{o.l}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sp-btn-row">
                <button
                  type="button"
                  className="sp-btn-primary"
                  disabled={!canStep1}
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: How you work ── */}
          {step === 2 && (
            <div className="sp-step" key="step2">
              <p className="sp-eyebrow">How you work</p>
              <h1 className="sp-heading">What does your<br />day-to-day look like?</h1>
              <p className="sp-subtext">This helps us set up the right tools for your workflow</p>

              <div className="sp-fields">
                <div>
                  <label className="sp-field-label">
                    What services do you offer?{" "}
                    <span>(select all that apply)</span>
                  </label>
                  <div className="sp-checks">
                    {SERVICES.map(svc => (
                      <button
                        key={svc.id}
                        type="button"
                        className={`sp-check-card${ob.services.includes(svc.id) ? " active" : ""}`}
                        onClick={() => toggleService(svc.id)}
                      >
                        <span className="sp-check-icon">{svc.icon}</span>
                        <span>{svc.label}</span>
                        {ob.services.includes(svc.id) && (
                          <span className="sp-check-tick">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="sp-field-label">How do you currently manage bookings?</label>
                  <div className="sp-options-col">
                    {[
                      { v: "memory",      l: "Memory / paper notes" },
                      { v: "spreadsheet", l: "Google Sheets or Excel" },
                      { v: "another-app", l: "Another app" },
                      { v: "nothing",     l: "Nothing yet" },
                    ].map(o => (
                      <button
                        key={o.v}
                        type="button"
                        className={`sp-option-row${ob.bookingMethod === o.v ? " active" : ""}`}
                        onClick={() => setOb(p => ({ ...p, bookingMethod: o.v }))}
                      >{o.l}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="sp-field-label">What&apos;s your #1 challenge right now?</label>
                  <div className="sp-options-col">
                    {[
                      { v: "organizing",  l: "Staying organized" },
                      { v: "payments",    l: "Getting paid on time" },
                      { v: "scheduling",  l: "Managing my schedule" },
                      { v: "clients",     l: "Keeping track of clients" },
                    ].map(o => (
                      <button
                        key={o.v}
                        type="button"
                        className={`sp-option-row${ob.challenge === o.v ? " active" : ""}`}
                        onClick={() => setOb(p => ({ ...p, challenge: o.v }))}
                      >{o.l}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sp-btn-row">
                <button type="button" className="sp-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button
                  type="button"
                  className="sp-btn-primary"
                  disabled={!canStep2}
                  onClick={() => setStep(3)}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Create account ── */}
          {step === 3 && (
            <div className="sp-step" key="step3">
              <p className="sp-eyebrow">Almost there</p>
              <h1 className="sp-heading">Create your<br />account</h1>
              <p className="sp-subtext">30-day free trial &middot; No credit card required</p>

              <form onSubmit={handleSignup}>
                <div className="sp-fields">
                  <div>
                    <label className="sp-field-label" htmlFor="name">Your full name</label>
                    <input
                      id="name"
                      className="sp-text-input"
                      type="text"
                      placeholder="Jane Doe"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="sp-field-label" htmlFor="email">Email address</label>
                    <input
                      id="email"
                      className="sp-text-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="sp-field-label" htmlFor="password">Password</label>
                    <input
                      id="password"
                      className="sp-text-input"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="sp-btn-row">
                  <button type="button" className="sp-btn-back" onClick={() => setStep(2)}>← Back</button>
                  <button
                    type="submit"
                    className="sp-btn-primary"
                    disabled={loading || !displayName || !email || !password}
                  >
                    {loading ? "Creating account…" : "Start free trial →"}
                  </button>
                </div>

                <p className="sp-legal">
                  By creating an account you agree to our{" "}
                  <Link href="/terms">Terms of Service</Link> and{" "}
                  <Link href="/privacy">Privacy Policy</Link>.
                </p>
              </form>

              <div className="sp-divider">or</div>
              <button type="button" className="sp-google" onClick={handleGoogleSignup} disabled={loading}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path fill="#4285F4" d="M17.64 9.2a10.34 10.34 0 00-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26a5.4 5.4 0 01-8.07-2.85H.96v2.33A9 9 0 009 18z"/>
                  <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 013.69 9c0-.6.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3.01 2.33C4.66 5.1 6.6 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
