// ─── App.jsx ───────────────────────────────────────────────────────────────
// Main entry point for the Legal Leads Group client portal.
// Handles: auth state, magic link callback, routing, and page rendering.
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Layout from "./Layout";
import LoginPage from "./login";
import Dashboard from "./dashboard";
import SeoPlanPage from "./seo-plan";
import SupportTicketsPage from "./SupportTickets";
import TeamPage from "./TeamPage";
import IntegrationsPage from "./IntegrationsPage";
import AdminPanel from "./AdminPanel";

// ─── Simple hash-based router ──────────────────────────────────────────────
function getRouteFromHash() {
  const hash = window.location.hash.replace("#/", "").replace("#", "");
  if (!hash || hash === "/") return "overview";
  return hash;
}

function setHash(route) {
  window.location.hash = `#/${route}`;
}

// ─── Placeholder pages ────────────────────────────────────────────────────

function ProfilePage({ user, onSignOut }) {
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#1A1222", marginBottom: 20 }}>
        Profile
      </h1>
      <div style={{
        background: "#fff", borderRadius: 14, padding: 24,
        border: "1px solid #E8E4EE", marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#7B6F8E", marginBottom: 4 }}>Email</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1222", marginBottom: 20 }}>
          {user?.email || "demo@legalleadsgroup.com"}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: "#7B6F8E", marginBottom: 4 }}>User ID</div>
        <div style={{
          fontSize: 13, fontFamily: "monospace", color: "#4A4358",
          background: "#F7F5FA", padding: "8px 12px", borderRadius: 8, marginBottom: 20,
          wordBreak: "break-all",
        }}>
          {user?.id || "demo-mode"}
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: "#7B6F8E", marginBottom: 4 }}>Last sign in</div>
        <div style={{ fontSize: 15, color: "#1A1222", marginBottom: 24 }}>
          {user?.last_sign_in_at
            ? new Date(user.last_sign_in_at).toLocaleString()
            : "—"}
        </div>

        <button
          onClick={onSignOut}
          style={{
            width: "100%", height: 48, border: "none", borderRadius: 10,
            background: "#FDF5F5", color: "#C44B4B",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            cursor: "pointer", transition: "background 0.15s",
          }}
          onMouseEnter={e => e.target.style.background = "#FAE8E8"}
          onMouseLeave={e => e.target.style.background = "#FDF5F5"}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Page router ───────────────────────────────────────────────────────────
function PageRouter({ route, user, onSignOut, onNavigate }) {
  switch (route) {
    case "overview":
      return <Dashboard />;
    case "support-tickets":
      return <SupportTicketsPage />;
    case "team":
      return <TeamPage onNavigate={onNavigate} />;
    case "seo-plan":
      return <SeoPlanPage />;
    case "integrations":
      return <IntegrationsPage />;
    case "admin":
      return <AdminPanel />;
    case "profile":
      return <ProfilePage user={user} onSignOut={onSignOut} />;
    default:
      return <Dashboard />;
  }
}

// ─── Loading spinner ───────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(165deg, #120D18, #1E1428, #1A1222)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, margin: "0 auto 16px",
          border: "3px solid rgba(196,164,80,0.2)",
          borderTopColor: "#C4A450",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 18, color: "rgba(255,255,255,0.6)",
        }}>
          Loading portal…
        </div>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [authState, setAuthState] = useState("loading"); // loading | unauthenticated | authenticated
  const [user, setUser] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(getRouteFromHash());

  // ── Check auth on mount + handle magic link callback ──
  useEffect(() => {
    async function init() {
      // Check for magic link token in URL (e.g. ?token_hash=xxx&type=magiclink)
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      if (tokenHash && type === "magiclink") {
        const { data, error } = await supabase.auth.exchangeCodeForSession(tokenHash);
        if (!error && data) {
          setUser(data.user);
          setAuthState("authenticated");
          // Clean up URL
          window.history.replaceState({}, "", window.location.pathname + window.location.hash);
          return;
        }
      }

      // Check existing session
      const { data } = supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
      }
    }

    init();
  }, []);

  // ── Listen for hash changes ──
  useEffect(() => {
    function onHashChange() {
      setCurrentRoute(getRouteFromHash());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // ── Navigation handler ──
  const navigate = (route) => {
    setCurrentRoute(route);
    setHash(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Sign out ──
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthState("unauthenticated");
    setCurrentRoute("overview");
    window.location.hash = "";
  };

  // ── Magic link sent callback (from login page) ──
  const handleMagicLinkSent = () => {
    // In demo mode, simulate login after the "check email" screen
  };

  // ── Demo login (skip auth for development) ──
  const handleDemoLogin = () => {
    setUser({ id: "demo", email: "demo@legalleadsgroup.com" });
    setAuthState("authenticated");
  };

  // ── Render ──
  if (authState === "loading") {
    return <LoadingScreen />;
  }

  if (authState === "unauthenticated") {
    return <LoginPage onDemoLogin={handleDemoLogin} />;
  }

  return (
    <Layout
      currentRoute={currentRoute}
      onNavigate={navigate}
      onSignOut={handleSignOut}
    >
      <PageRouter route={currentRoute} user={user} onSignOut={handleSignOut} onNavigate={navigate} />
    </Layout>
  );
}
