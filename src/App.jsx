// ─── App.jsx ───────────────────────────────────────────────────────────────
// Main entry point for the Legal Leads Group client portal.
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
 
const DEMO_USER = {
  id: "demo",
  email: "ana@garcialaw.com",
  full_name: "Ana Garcia",
};
 
function getRouteFromHash() {
  const hash = window.location.hash.replace("#/", "").replace("#", "");
  if (!hash || hash === "/") return "overview";
  return hash;
}
 
function setHash(route) {
  window.location.hash = `#/${route}`;
}
 
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
          {user?.email || "—"}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#7B6F8E", marginBottom: 4 }}>Last sign in</div>
        <div style={{ fontSize: 15, color: "#1A1222", marginBottom: 24 }}>
          {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "—"}
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
 
function PageRouter({ route, user, onSignOut, onNavigate }) {
  switch (route) {
    case "overview": return <Dashboard />;
    case "support-tickets": return <SupportTicketsPage />;
    case "team": return <TeamPage onNavigate={onNavigate} />;
    case "seo-plan": return <SeoPlanPage />;
    case "integrations": return <IntegrationsPage />;
    case "admin": return <AdminPanel />;
    case "profile": return <ProfilePage user={user} onSignOut={onSignOut} />;
    default: return <Dashboard />;
  }
}
 
function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(165deg, #120D18, #1E1428, #1A1222)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, margin: "0 auto 16px",
          border: "3px solid rgba(196,164,80,0.2)", borderTopColor: "#C4A450",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
        <div style={{
          fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "rgba(255,255,255,0.6)",
        }}>
          Loading portal…
        </div>
      </div>
    </div>
  );
}
 
export default function App() {
  const [authState, setAuthState] = useState("loading");
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(getRouteFromHash());
 
  useEffect(() => {
    // Check for demo mode
    if (localStorage.getItem("llg_portal_demo") === "true") {
      setUser(DEMO_USER);
      setIsDemo(true);
      setAuthState("authenticated");
      return;
    }
 
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
      }
    });
 
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          setAuthState("authenticated");
          if (window.location.search) {
            window.history.replaceState({}, "", window.location.pathname + window.location.hash);
          }
        } else if (event === "SIGNED_OUT" && !isDemo) {
          setUser(null);
          setAuthState("unauthenticated");
        }
      }
    );
 
    return () => subscription.unsubscribe();
  }, []);
 
  useEffect(() => {
    function onHashChange() { setCurrentRoute(getRouteFromHash()); }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
 
  const navigate = (route) => {
    setCurrentRoute(route);
    setHash(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
 
  const enterDemo = () => {
    localStorage.setItem("llg_portal_demo", "true");
    setUser(DEMO_USER);
    setIsDemo(true);
    setAuthState("authenticated");
  };
 
  const handleSignOut = async () => {
    localStorage.removeItem("llg_portal_demo");
    setIsDemo(false);
    await supabase.auth.signOut();
    setUser(null);
    setAuthState("unauthenticated");
    setCurrentRoute("overview");
    window.location.hash = "";
  };
 
  if (authState === "loading") return <LoadingScreen />;
 
  if (authState === "unauthenticated") {
    return <LoginPage onDemo={enterDemo} />;
  }
 
  return (
    <>
      {isDemo && (
        <div style={{
          background: "linear-gradient(90deg, #3B1460, #5B2D8E)",
          color: "white", textAlign: "center", padding: "8px 16px",
          fontSize: 13, fontWeight: 600, position: "sticky", top: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        }}>
          <span style={{ opacity: 0.9 }}>You're viewing a demo — data shown is from Garcia Law Firm (sample client)</span>
          <button onClick={handleSignOut} style={{
            background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)",
            padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit",
          }}>
            Exit Demo
          </button>
        </div>
      )}
      <Layout currentRoute={currentRoute} onNavigate={navigate} onSignOut={handleSignOut}>
        <PageRouter route={currentRoute} user={user} onSignOut={handleSignOut} onNavigate={navigate} />
      </Layout>
    </>
  );
}
 