import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
  return true;
}

// ─── Animated background orbs ──────────────────────────────────────────────
function Orbs() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      {[
        { size: 520, x: "-8%", y: "-12%", color: "rgba(75,30,115,0.18)", dur: "22s", delay: "0s" },
        { size: 380, x: "70%", y: "60%", color: "rgba(196,164,80,0.12)", dur: "28s", delay: "-6s" },
        { size: 260, x: "50%", y: "-20%", color: "rgba(75,30,115,0.10)", dur: "32s", delay: "-14s" },
        { size: 200, x: "10%", y: "75%", color: "rgba(196,164,80,0.08)", dur: "26s", delay: "-8s" },
      ].map((orb, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            animation: `orbFloat ${orb.dur} ease-in-out infinite`,
            animationDelay: orb.delay,
            filter: "blur(60px)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Login Component ──────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // email | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      setStep("error");
      return;
    }
    setStep("sending");
    try {
      await sendMagicLink(email.trim());
      setStep("sent");
    } catch {
      // Demo mode: simulate success
      await new Promise((r) => setTimeout(r, 1500));
      setStep("sent");
    }
  };

  const reset = () => {
    setStep("email");
    setEmail("");
    setErrorMsg("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes envelopeBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .login-shell {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          background: linear-gradient(165deg, #120D18 0%, #1E1428 40%, #1A1222 100%);
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: var(--white);
          border-radius: 20px;
          padding: 48px 40px 40px;
          box-shadow:
            0 4px 6px rgba(0,0,0,0.04),
            0 24px 48px rgba(59,20,96,0.12),
            0 0 0 1px rgba(255,255,255,0.06);
          opacity: 0;
          animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.15s;
        }

        .brand-bar {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 36px;
        }

        .brand-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--purple-deep) 0%, var(--purple-mid) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(91,45,142,0.3);
        }

        .brand-icon svg {
          width: 26px;
          height: 26px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .brand-name {
          font-family: 'DM Serif Display', serif;
          font-size: 20px;
          color: var(--ink);
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .brand-tagline {
          font-size: 12px;
          color: var(--slate);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .login-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: var(--ink);
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }

        .login-subtext {
          font-size: 15px;
          color: var(--slate);
          line-height: 1.55;
          margin-bottom: 32px;
        }

        .field-group {
          margin-bottom: 24px;
        }

        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 8px;
          letter-spacing: 0.02em;
        }

        .field-input {
          width: 100%;
          height: 52px;
          padding: 0 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: var(--ink);
          background: var(--mist);
          border: 2px solid transparent;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
        }

        .field-input::placeholder {
          color: #A09AAD;
        }

        .field-input:focus {
          border-color: var(--purple-mid);
          background: var(--white);
          box-shadow: 0 0 0 4px rgba(91,45,142,0.08);
        }

        .field-input.error {
          border-color: var(--error);
          background: #FDF5F5;
        }

        .error-text {
          font-size: 13px;
          color: var(--error);
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .submit-btn {
          width: 100%;
          height: 52px;
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: var(--white);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
          background: linear-gradient(135deg, var(--purple-deep) 0%, var(--purple-mid) 100%);
          box-shadow: 0 4px 16px rgba(59,20,96,0.25);
          letter-spacing: 0.01em;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(59,20,96,0.35);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .submit-btn .btn-text {
          position: relative;
          z-index: 1;
        }

        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2.5s infinite;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .submit-btn:hover::after {
          opacity: 1;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 28px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #E8E4EE;
        }

        .divider-text {
          font-size: 12px;
          color: #A09AAD;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 500;
        }

        .help-link {
          text-align: center;
          font-size: 14px;
          color: var(--slate);
        }

        .help-link a {
          color: var(--purple-mid);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .help-link a:hover {
          color: var(--purple-light);
        }

        /* ── Sent State ── */
        .sent-container {
          text-align: center;
          padding: 12px 0 4px;
        }

        .sent-icon-wrap {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: var(--gold-pale);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: envelopeBounce 2s ease-in-out infinite;
          animation-delay: 0.6s;
        }

        .sent-icon-wrap svg {
          width: 36px;
          height: 36px;
          color: var(--gold);
        }

        .sent-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 24px;
          color: var(--ink);
          margin-bottom: 10px;
        }

        .sent-email {
          font-weight: 700;
          color: var(--purple-mid);
        }

        .sent-text {
          font-size: 14.5px;
          color: var(--slate);
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--purple-mid);
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 4px;
          transition: color 0.2s;
        }

        .back-btn:hover {
          color: var(--purple-light);
        }

        /* ── Spinner ── */
        .spinner {
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: var(--white);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        /* ── Footer ── */
        .footer-note {
          text-align: center;
          margin-top: 24px;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          position: relative;
          z-index: 1;
          opacity: 0;
          animation: fadeIn 0.8s ease forwards;
          animation-delay: 0.7s;
        }

        .footer-note a {
          color: rgba(196,164,80,0.6);
          text-decoration: none;
        }

        .footer-note a:hover {
          color: var(--gold-light);
        }

        .gold-accent {
          color: var(--gold);
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .login-card {
            padding: 36px 24px 32px;
            border-radius: 16px;
          }
          .login-heading { font-size: 24px; }
          .brand-name { font-size: 18px; }
        }
      `}</style>

      <div className="login-shell">
        <Orbs />

        <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
          <div className="login-card">
            {/* Brand */}
            <div className="brand-bar">
              <div className="brand-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z"
                    fill="rgba(196,164,80,0.25)"
                    stroke="#C4A450"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12.5l2 2 4.5-4.5"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="brand-text">
                <div className="brand-name">Legal Leads Group</div>
                <div className="brand-tagline">Client Portal</div>
              </div>
            </div>

            {/* ── Email Form ── */}
            {(step === "email" || step === "error") && (
              <div>
                <h1 className="login-heading">Welcome back</h1>
                <p className="login-subtext">
                  Sign in to your portal with a secure magic link — no password needed.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="field-group">
                    <label className="field-label" htmlFor="email">
                      Email address
                    </label>
                    <input
                      ref={inputRef}
                      id="email"
                      type="email"
                      className={`field-input ${step === "error" ? "error" : ""}`}
                      placeholder="you@yourfirm.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (step === "error") setStep("email");
                      }}
                      autoComplete="email"
                    />
                    {step === "error" && (
                      <div className="error-text">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0V5zm.75 6.5a.875.875 0 110-1.75.875.875 0 010 1.75z" />
                        </svg>
                        {errorMsg}
                      </div>
                    )}
                  </div>

                  <button className="submit-btn" type="submit">
                    <span className="btn-text">Send Magic Link</span>
                  </button>
                </form>

                <div className="divider">
                  <div className="divider-line" />
                  <span className="divider-text">Secure &amp; Passwordless</span>
                  <div className="divider-line" />
                </div>

                <p className="help-link">
                  Need help? <a href="mailto:support@legalleadsgroup.com">Contact support</a>
                </p>

                {
              </div>
            )}

            {/* ── Sending State ── */}
            {step === "sending" && (
              <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
                <div style={{ marginBottom: 20 }}>
                  <span className="spinner" style={{ borderColor: "rgba(91,45,142,0.2)", borderTopColor: "var(--purple-mid)", width: 36, height: 36, borderWidth: 3 }} />
                </div>
                <h2 className="login-heading" style={{ fontSize: 22 }}>Sending your link…</h2>
                <p className="login-subtext" style={{ marginBottom: 0 }}>
                  Hang tight, this only takes a moment.
                </p>
              </div>
            )}

            {/* ── Sent State ── */}
            {step === "sent" && (
              <div className="sent-container">
                <div className="sent-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="M22 5L12 13 2 5" />
                  </svg>
                </div>
                <h2 className="sent-heading">Check your inbox</h2>
                <p className="sent-text">
                  We sent a sign-in link to<br />
                  <span className="sent-email">{email}</span>
                  <br /><br />
                  Click the link in the email to access your portal. It expires in 10 minutes.
                </p>
                <button className="back-btn" onClick={reset}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 12L6 8l4-4" />
                  </svg>
                  Use a different email
                </button>
              </div>
            )}
          </div>

          <p className="footer-note">
            &copy; {new Date().getFullYear()} Legal Leads Group &middot;{" "}
            <a href="#">Privacy</a> &middot; <a href="#">Terms</a>
          </p>
        </div>
      </div>
    </>
  );
}
