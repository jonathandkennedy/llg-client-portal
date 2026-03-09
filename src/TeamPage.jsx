// ─── TeamPage.jsx ──────────────────────────────────────────────────────────
// Full team page showing all assigned support team members.
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useClient, useTeam } from "./usePortalData";

// ─── Avatar ────────────────────────────────────────────────────────────────
function Avatar({ name, size = 56, color = "#5B2D8E" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(145deg, ${color}, ${color}BB)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.34, fontWeight: 700, flexShrink: 0,
      boxShadow: `0 4px 14px ${color}33`,
      letterSpacing: "-0.01em",
    }}>
      {initials}
    </div>
  );
}

// ─── Status indicator ──────────────────────────────────────────────────────
function StatusDot({ status }) {
  const isAvailable = status === "available";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600,
      color: isAvailable ? "#217A4B" : "#B8860B",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: isAvailable ? "#3DAA6D" : "#E6A817",
        boxShadow: isAvailable ? "0 0 0 3px rgba(61,170,109,0.15)" : "0 0 0 3px rgba(230,168,23,0.15)",
      }} />
      {isAvailable ? "Available" : "Busy"}
    </span>
  );
}

// ─── Role icon by type ─────────────────────────────────────────────────────
function RoleIcon({ role, color }) {
  const icons = {
    "SEO Manager": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    "FAQ Search": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    "Paid Ads": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    "AI Search": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4z" /><path d="M16 14H8a4 4 0 00-4 4v2h16v-2a4 4 0 00-4-4z" />
      </svg>
    ),
    "Web Dev": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    "Press Release": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  };
  return icons[role] || icons["SEO Manager"];
}

// ─── Member Card ───────────────────────────────────────────────────────────
function MemberCard({ member, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="member-card"
      style={{
        animationDelay: `${index * 0.07}s`,
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 8px 28px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.02)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Color accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        borderRadius: "14px 14px 0 0",
        background: `linear-gradient(90deg, ${member.color}, ${member.color}88)`,
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
        <Avatar name={member.name} size={56} color={member.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 17, fontWeight: 700, color: "#1A1222",
            marginBottom: 2, lineHeight: 1.3,
          }}>
            {member.name}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 6,
              background: `${member.color}12`, color: member.color,
              fontSize: 12, fontWeight: 600,
            }}>
              <RoleIcon role={member.role} color={member.color} />
              {member.role}
            </div>
          </div>
        </div>
      </div>

      {/* Specialty */}
      {member.specialty && (
        <div style={{
          fontSize: 13, color: "#4A4358", lineHeight: 1.55,
          marginBottom: 16,
        }}>
          {member.specialty}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 14, borderTop: "1px solid #F0ECF5",
      }}>
        <StatusDot status={member.status || "available"} />

        {member.email && (
          <a
            href={`mailto:${member.email}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, fontWeight: 600, color: "#5B2D8E",
              textDecoration: "none", padding: "5px 10px",
              borderRadius: 6, transition: "background 0.12s",
              background: hovered ? "rgba(91,45,142,0.06)" : "transparent",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <path d="M22 5L12 13 2 5" />
            </svg>
            Email
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Main Team Page ────────────────────────────────────────────────────────
export default function TeamPage({ onNavigate }) {
  const { data: client } = useClient();
  const clientId = client?.id;
  const { data: team } = useTeam(clientId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .team-page {
          max-width: 960px;
          margin: 0 auto;
          padding: 28px 24px 80px;
        }

        .team-page-header {
          margin-bottom: 28px;
        }

        .team-page-header h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #1A1222;
          margin-bottom: 6px;
        }

        .team-page-header p {
          font-size: 15px;
          color: #4A4358;
          line-height: 1.55;
        }

        /* Card grid */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
          margin-bottom: 32px;
        }

        .member-card {
          position: relative;
          background: #FFFFFF;
          border-radius: 14px;
          padding: 24px 22px 20px;
          border: 1px solid #E8E4EE;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: cardIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }

        /* Tip card */
        .team-tip-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 24px 28px;
          border: 1px solid #E8E4EE;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .team-tip-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #F5EDD4, #FFF9EC);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .team-tip-content {
          flex: 1;
          min-width: 200px;
        }

        .team-tip-content h3 {
          font-family: 'DM Serif Display', serif;
          font-size: 16px;
          color: #1A1222;
          margin-bottom: 4px;
        }

        .team-tip-content p {
          font-size: 13px;
          color: #7B6F8E;
          line-height: 1.5;
        }

        .tip-cta {
          padding: 10px 22px;
          border-radius: 10px;
          border: 1.5px solid #5B2D8E;
          background: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #5B2D8E;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .tip-cta:hover {
          background: #5B2D8E;
          color: #fff;
        }

        @media (max-width: 640px) {
          .team-page { padding: 20px 16px 100px; }
          .team-page-header h1 { font-size: 24px; }
          .team-grid { grid-template-columns: 1fr; }
          .team-tip-card {
            flex-direction: column;
            text-align: center;
          }
          .team-tip-content { min-width: unset; }
        }
      `}</style>

      <div
        className="team-page"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* ── Header ── */}
        <div className="team-page-header">
          <h1>Your Support Team</h1>
          <p>
            Meet the team assigned to <strong>{client.firm_name}</strong>. Reference their names when creating support tickets so we can route your request to the right specialist.
          </p>
        </div>

        {/* ── Team Grid ── */}
        <div className="team-grid">
          {team.map((member, i) => (
            <MemberCard key={member.name + i} member={member} index={i} />
          ))}
        </div>

        {/* ── Tip Card ── */}
        <div className="team-tip-card">
          <div className="team-tip-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C4A450" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="team-tip-content">
            <h3>Need something from your team?</h3>
            <p>
              Create a support ticket with a clear description and tag the relevant team member. Most requests are handled within 24–48 hours.
            </p>
          </div>
          {onNavigate && (
            <button className="tip-cta" onClick={() => onNavigate("support-tickets")}>
              Create a Ticket
            </button>
          )}
        </div>
      </div>
    </>
  );
}
