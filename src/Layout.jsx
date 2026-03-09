// ─── Layout.jsx ────────────────────────────────────────────────────────────
// Shared shell: top nav, mobile bottom nav, auth-aware.
// Wraps all authenticated pages.
// ────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useClient } from "./usePortalData";

// ─── Avatar ────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36, color = "#5B2D8E" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}, ${color}BB)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.36, fontWeight: 600, flexShrink: 0,
      boxShadow: `0 2px 8px ${color}33`
    }}>
      {initials}
    </div>
  );
}

// ─── Route → nav label mapping ─────────────────────────────────────────────
const NAV_ITEMS = [
  { route: "overview",          label: "Overview" },
  { route: "support-tickets",   label: "Support & Tickets" },
  { route: "team",              label: "Team" },
  { route: "seo-plan",          label: "SEO Plan" },
  { route: "integrations",      label: "Integrations" },
];

const BOTTOM_NAV = [
  {
    route: "overview", label: "Dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    route: "support-tickets", label: "Tickets",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5v2m0 4v2m0 4v2" />
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M2 10h20M2 14h20" />
      </svg>
    ),
  },
  {
    route: "seo-plan", label: "SEO Plan",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M8 11h6M11 8v6" />
      </svg>
    ),
  },
  {
    route: "profile", label: "Profile",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

// ─── Layout Component ──────────────────────────────────────────────────────
export default function Layout({ currentRoute, onNavigate, onSignOut, children }) {
  const { data: client } = useClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        /* ── Top Nav ── */
        .topnav {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 0 32px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }

        .topnav-left {
          display: flex;
          align-items: center;
          gap: 36px;
        }

        .topnav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          cursor: pointer;
          border: none;
          background: none;
          font-family: inherit;
        }

        .topnav-logo {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--purple-deep), var(--purple-mid));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(91,45,142,0.2);
        }

        .topnav-title {
          font-family: 'DM Serif Display', serif;
          font-size: 17px;
          color: var(--ink);
          text-align: left;
        }

        .topnav-subtitle {
          font-size: 10px;
          color: var(--slate);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 1px;
          text-align: left;
        }

        .nav-links {
          display: flex;
          gap: 4px;
        }

        .nav-link {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--slate);
          text-decoration: none;
          border-radius: 8px;
          cursor: pointer;
          border: none;
          background: none;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s ease;
          position: relative;
        }

        .nav-link:hover {
          color: var(--purple-mid);
          background: rgba(91,45,142,0.05);
        }

        .nav-link.active {
          color: var(--purple-mid);
          font-weight: 600;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -22px;
          left: 16px;
          right: 16px;
          height: 2.5px;
          background: var(--purple-mid);
          border-radius: 2px;
        }

        .topnav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .client-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 14px 6px 6px;
          border-radius: 12px;
          background: var(--mist);
          border: 1px solid var(--border);
        }

        .client-firm {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }

        .client-name-text {
          font-size: 11px;
          color: var(--slate);
        }

        .signout-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: var(--white);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: var(--slate);
          cursor: pointer;
          transition: all 0.15s;
        }

        .signout-btn:hover {
          border-color: #C44B4B;
          color: #C44B4B;
        }

        .hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        /* ── Mobile Dropdown ── */
        .mobile-dropdown {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 8px 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mobile-dropdown .nav-link.active::after {
          display: none;
        }

        .mobile-dropdown .nav-link.active {
          background: rgba(91,45,142,0.06);
          border-radius: 8px;
        }

        /* ── Page Content ── */
        .page-content {
          min-height: calc(100vh - 68px);
        }

        /* ── Mobile Bottom Nav ── */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 200;
          background: var(--white);
          border-top: 1px solid var(--border);
          padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px));
          justify-content: space-around;
          align-items: center;
          box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
        }

        .bnav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 6px 12px;
          border: none;
          background: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s ease;
          position: relative;
          border-radius: 10px;
          min-width: 64px;
        }

        .bnav-item .bnav-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #A09AAD;
          transition: color 0.15s ease, transform 0.2s ease;
        }

        .bnav-item .bnav-label {
          font-size: 10.5px;
          font-weight: 500;
          color: #A09AAD;
          transition: color 0.15s ease;
          letter-spacing: 0.01em;
        }

        .bnav-item.active .bnav-icon {
          color: var(--purple-mid);
          transform: translateY(-1px);
        }

        .bnav-item.active .bnav-label {
          color: var(--purple-mid);
          font-weight: 700;
        }

        .bnav-item.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2.5px;
          border-radius: 0 0 2px 2px;
          background: var(--purple-mid);
        }

        .bnav-item:active .bnav-icon {
          transform: scale(0.9);
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hamburger { display: block; }
          .topnav { padding: 0 16px; }
          .client-badge { display: none; }
          .signout-btn { display: none; }
          .admin-nav-btn { display: none; }
          .mobile-bottom-nav { display: flex; }
          .page-content { padding-bottom: 72px; }
        }
      `}</style>

      {/* ── Top Navigation ── */}
      <nav className="topnav">
        <div className="topnav-left">
          <button className="topnav-brand" onClick={() => onNavigate("overview")}>
            <div className="topnav-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z"
                  fill="rgba(196,164,80,0.3)" stroke="#C4A450" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 12.5l2 2 4.5-4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="topnav-title">Legal Leads Group</div>
              <div className="topnav-subtitle">Success Doesn't Find You, We Do</div>
            </div>
          </button>

          <div className="nav-links">
            {NAV_ITEMS.map(item => (
              <button
                key={item.route}
                className={`nav-link ${currentRoute === item.route ? "active" : ""}`}
                onClick={() => onNavigate(item.route)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="topnav-right">
          <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1222" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div className="client-badge">
            <Avatar name={client.contact_name} size={32} color="#5B2D8E" />
            <div>
              <div className="client-firm">{client.firm_name}</div>
              <div className="client-name-text">{client.contact_name}</div>
            </div>
          </div>
          <button
            className="admin-nav-btn"
            onClick={() => onNavigate("admin")}
            title="Admin Panel"
            style={{
              width: 36, height: 36, borderRadius: 8,
              border: currentRoute === "admin" ? "1.5px solid var(--purple-mid)" : "1.5px solid var(--border)",
              background: currentRoute === "admin" ? "rgba(91,45,142,0.06)" : "var(--white)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: currentRoute === "admin" ? "var(--purple-mid)" : "var(--slate)",
              transition: "all 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
            </svg>
          </button>
          <button className="signout-btn" onClick={onSignOut}>Sign out</button>
        </div>
      </nav>

      {/* ── Mobile Nav Dropdown ── */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown">
          {NAV_ITEMS.map(item => (
            <button
              key={item.route}
              className={`nav-link ${currentRoute === item.route ? "active" : ""}`}
              onClick={() => { onNavigate(item.route); setMobileMenuOpen(false); }}
              style={{ textAlign: "left", padding: "10px 12px" }}
            >
              {item.label}
            </button>
          ))}
          <button
            className={`nav-link ${currentRoute === "admin" ? "active" : ""}`}
            onClick={() => { onNavigate("admin"); setMobileMenuOpen(false); }}
            style={{ textAlign: "left", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" />
            </svg>
            Admin Panel
          </button>
          <button
            className="nav-link"
            onClick={onSignOut}
            style={{ textAlign: "left", padding: "10px 12px", color: "#C44B4B" }}
          >
            Sign out
          </button>
        </div>
      )}

      {/* ── Page Content ── */}
      <div className="page-content">
        {children}
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <div className="mobile-bottom-nav">
        {BOTTOM_NAV.map(item => (
          <button
            key={item.route}
            className={`bnav-item ${currentRoute === item.route ? "active" : ""}`}
            onClick={() => onNavigate(item.route)}
          >
            <span className="bnav-icon">{item.icon}</span>
            <span className="bnav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export { Avatar };
