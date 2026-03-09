// ─── IntegrationsPage.jsx ──────────────────────────────────────────────────
// Client-facing read-only view of connected integrations.
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useClient, useIntegrations } from "./usePortalData";

// ─── Integration icon/color mapping ────────────────────────────────────────
const ICON_MAP = {
  GA: { gradient: "linear-gradient(135deg, #E37400, #F59E0B)", label: "Analytics" },
  KT: { gradient: "linear-gradient(135deg, #C4A450, #DFC777)", label: "Keywords" },
  NW: { gradient: "linear-gradient(135deg, #5B2D8E, #7B4BAE)", label: "NAP+W" },
};

function IntegrationCard({ integration }) {
  const [hovered, setHovered] = useState(false);
  const iconInfo = ICON_MAP[integration.icon] || ICON_MAP.GA;

  return (
    <div
      className="int-card"
      style={{
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 8px 28px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.03)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: iconInfo.gradient,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 16, fontWeight: 800, flexShrink: 0,
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          letterSpacing: "-0.02em",
        }}>
          {integration.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1222", marginBottom: 2 }}>
            {integration.name}
          </div>
          <div style={{ fontSize: 13, color: "#7B6F8E" }}>{iconInfo.label}</div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 6,
          background: "#E8F8EF", color: "#217A4B",
          fontSize: 11, fontWeight: 600,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3DAA6D" }} />
          Connected
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: "#4A4358", lineHeight: 1.55, marginBottom: 18 }}>
        {integration.name === "Google Analytics"
          ? "Track website visitors, traffic sources, and conversion data for your firm's site."
          : integration.name === "Keyword Tool"
          ? "Monitor keyword rankings, search volume, and competition for your target terms."
          : "Audit your Name, Address, Phone + Website consistency across directories."}
      </p>

      {/* Action */}
      <a
        href="#"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 20px", borderRadius: 10,
          background: hovered ? "var(--purple-mid)" : "var(--mist)",
          color: hovered ? "#fff" : "var(--purple-mid)",
          fontWeight: 600, fontSize: 13, textDecoration: "none",
          transition: "all 0.2s",
          border: `1.5px solid ${hovered ? "var(--purple-mid)" : "var(--border)"}`,
        }}
      >
        {integration.action_label}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      </a>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function IntegrationsPage() {
  const { data: client } = useClient();
  const clientId = client?.id;
  const { data: integrations } = useIntegrations(clientId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <>
      <style>{`
        .int-page {
          max-width: 960px;
          margin: 0 auto;
          padding: 28px 24px 80px;
        }

        .int-header {
          margin-bottom: 28px;
        }

        .int-header h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: var(--ink);
          margin-bottom: 6px;
        }

        .int-header p {
          font-size: 15px;
          color: var(--slate);
          line-height: 1.55;
        }

        .int-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
          margin-bottom: 32px;
        }

        .int-card {
          background: #fff;
          border-radius: 14px;
          padding: 24px;
          border: 1px solid var(--border);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .int-info-card {
          background: #fff;
          border-radius: 14px;
          padding: 24px 28px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .int-info-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--mist);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .int-info-content {
          flex: 1;
          min-width: 200px;
        }

        .int-info-content h3 {
          font-family: 'DM Serif Display', serif;
          font-size: 16px;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .int-info-content p {
          font-size: 13px;
          color: var(--slate);
          line-height: 1.5;
        }

        @media (max-width: 640px) {
          .int-page { padding: 20px 16px 100px; }
          .int-header h1 { font-size: 24px; }
          .int-grid { grid-template-columns: 1fr; }
          .int-info-card { flex-direction: column; text-align: center; }
          .int-info-content { min-width: unset; }
        }
      `}</style>

      <div
        className="int-page"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="int-header">
          <h1>Integrations</h1>
          <p>
            Tools connected to <strong>{client.firm_name}</strong>'s account. These are managed by your Legal Leads Group team — data syncs automatically.
          </p>
        </div>

        <div className="int-grid">
          {integrations.map((int, i) => (
            <IntegrationCard key={int.id || i} integration={int} />
          ))}
        </div>

        <div className="int-info-card">
          <div className="int-info-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="int-info-content">
            <h3>Need a new integration?</h3>
            <p>
              Contact your SEO Manager or create a support ticket to request additional tools or data connections for your account.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
