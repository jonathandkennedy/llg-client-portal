// ─── SupportTickets.jsx ────────────────────────────────────────────────────
// Full-page Support & Tickets view.
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import {
  useClient,
  useTickets,
  useTeam,
  timeAgo,
} from "./usePortalData";

// ─── Status helpers ────────────────────────────────────────────────────────
const STATUS_STYLE = {
  open:   { bg: "#E8F8EF", color: "#217A4B", label: "Open" },
  closed: { bg: "#F0ECF5", color: "#7B6F8E", label: "Closed" },
};

function StatusChip({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.open;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 6,
      fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: status === "open" ? "#3DAA6D" : "#A09AAD",
      }} />
      {s.label}
    </span>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────
function Avatar({ name, size = 32, color = "#5B2D8E" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}, ${color}BB)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.36, fontWeight: 600, flexShrink: 0,
      boxShadow: `0 2px 6px ${color}22`,
    }}>
      {initials}
    </div>
  );
}

// ─── Create Ticket Modal ───────────────────────────────────────────────────
function TicketModal({ open, onClose, onSubmit, team }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      if (onSubmit) await onSubmit({ title, description: desc });
      setTitle("");
      setDesc("");
      onClose();
    } catch (err) {
      console.error("Failed to create ticket:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(26,18,34,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 32, maxWidth: 560, width: "100%",
        boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
        animation: "modalIn 0.25s ease",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1A1222" }}>
            Create Support Ticket
          </h3>
          <button onClick={onClose} style={{
            background: "#F7F5FA", border: "none", cursor: "pointer", padding: "6px 10px",
            borderRadius: 8, color: "#4A4358", fontSize: 18, lineHeight: 1,
          }}>&times;</button>
        </div>

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1A1222", marginBottom: 6 }}>
          Ticket title
        </label>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Update homepage hero image"
          style={{
            width: "100%", height: 46, padding: "0 14px", fontSize: 14,
            border: "1.5px solid #E0DCE6", borderRadius: 10, outline: "none",
            fontFamily: "'DM Sans', sans-serif", marginBottom: 18, background: "#FAFAFA",
          }}
          onFocus={e => e.target.style.borderColor = "#5B2D8E"}
          onBlur={e => e.target.style.borderColor = "#E0DCE6"}
        />

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1A1222", marginBottom: 6 }}>
          Describe your update/issue
        </label>
        <textarea
          value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="Provide details so your team can help quickly..."
          rows={5}
          style={{
            width: "100%", padding: "12px 14px", fontSize: 14,
            border: "1.5px solid #E0DCE6", borderRadius: 10, outline: "none",
            fontFamily: "'DM Sans', sans-serif", marginBottom: 18, resize: "vertical",
            background: "#FAFAFA",
          }}
          onFocus={e => e.target.style.borderColor = "#5B2D8E"}
          onBlur={e => e.target.style.borderColor = "#E0DCE6"}
        />

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1A1222", marginBottom: 6 }}>
          Add File(s)
        </label>
        <div style={{
          border: "1.5px dashed #D0CCDA", borderRadius: 10, padding: 20,
          textAlign: "center", marginBottom: 20, cursor: "pointer", background: "#FAFAFA",
          transition: "border-color 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#5B2D8E"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#D0CCDA"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B6F8E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 6 }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div style={{ fontSize: 13, color: "#7B6F8E" }}>Click or drag files here to upload</div>
        </div>

        {/* Team reference */}
        <div style={{
          background: "#F7F5FA", borderRadius: 10, padding: "14px 16px", marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#7B6F8E", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
            Reference your team in tickets
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {team.map((m, i) => (
              <span key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 10px 3px 4px", borderRadius: 6,
                background: "#fff", border: "1px solid #E8E4EE",
                fontSize: 12, fontWeight: 500, color: "#1A1222",
              }}>
                <Avatar name={m.name} size={18} color={m.color} />
                {m.name}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim()}
          style={{
            width: "100%", height: 50, border: "none", borderRadius: 10,
            background: "linear-gradient(135deg, #3B1460, #5B2D8E)", color: "#fff",
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
            cursor: submitting ? "wait" : "pointer",
            boxShadow: "0 4px 12px rgba(59,20,96,0.25)",
            opacity: (submitting || !title.trim()) ? 0.6 : 1,
            transition: "all 0.2s",
          }}
        >
          {submitting ? "Submitting…" : "Submit Ticket"}
        </button>
      </div>
    </div>
  );
}

// ─── Ticket Detail Panel ───────────────────────────────────────────────────
function TicketDetail({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: 28,
      border: "1px solid #E8E4EE",
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <StatusChip status={ticket.status} />
            <span style={{ fontSize: 12, color: "#A09AAD" }}>#{ticket.id.slice(0, 8)}</span>
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1A1222", lineHeight: 1.3 }}>
            {ticket.title}
          </h2>
        </div>
        <button onClick={onClose} style={{
          background: "#F7F5FA", border: "none", cursor: "pointer", padding: "6px 10px",
          borderRadius: 8, color: "#4A4358", fontSize: 16, lineHeight: 1, flexShrink: 0, marginLeft: 12,
        }}>✕</button>
      </div>

      {/* Timeline */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: "#3DAA6D", flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, color: "#4A4358" }}>
            <strong>Created</strong> {new Date(ticket.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            {" · "}
            {timeAgo(ticket.created_at)}
          </span>
        </div>
        {ticket.closed_at && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 0 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "#A09AAD", flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, color: "#4A4358" }}>
              <strong>Closed</strong> {new Date(ticket.closed_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              {" · "}
              {timeAgo(ticket.closed_at)}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#7B6F8E", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
          Description
        </div>
        <div style={{
          fontSize: 14, color: "#1A1222", lineHeight: 1.7,
          background: "#F7F5FA", borderRadius: 10, padding: "16px 18px",
          borderLeft: "3px solid #5B2D8E",
        }}>
          {ticket.description || "No description provided."}
        </div>
      </div>

      {/* Attachments placeholder */}
      {ticket.file_urls && ticket.file_urls.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#7B6F8E", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
            Attachments
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ticket.file_urls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8,
                background: "#F7F5FA", border: "1px solid #E8E4EE",
                fontSize: 13, color: "#5B2D8E", textDecoration: "none", fontWeight: 500,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
                File {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function SupportTicketsPage() {
  const { data: client } = useClient();
  const clientId = client?.id;
  const { data: tickets, createTicket } = useTickets(clientId);
  const { data: team } = useTeam(clientId);
  const [tab, setTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const filteredTickets = useMemo(() => {
    if (tab === "all") return tickets;
    return tickets.filter(t => t.status === tab);
  }, [tickets, tab]);

  const openCount = tickets.filter(t => t.status === "open").length;
  const closedCount = tickets.filter(t => t.status === "closed").length;

  // When a new ticket is created, switch to the "open" tab
  const handleCreate = async (data) => {
    await createTicket(data);
    setTab("open");
  };

  return (
    <>
      <style>{`
        .tickets-page {
          max-width: 1060px;
          margin: 0 auto;
          padding: 28px 24px 80px;
        }

        .tickets-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }

        .tickets-header h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #1A1222;
        }

        .create-btn {
          padding: 10px 24px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #3B1460, #5B2D8E);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 3px 12px rgba(59,20,96,0.2);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .create-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 18px rgba(59,20,96,0.3);
        }

        /* Stats */
        .ticket-stats {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          background: #fff;
          border: 1px solid #E8E4EE;
          font-size: 14px;
          font-weight: 600;
        }

        .stat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* Tabs */
        .ticket-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          background: #fff;
          border-radius: 10px;
          padding: 4px;
          border: 1px solid #E8E4EE;
          width: fit-content;
        }

        .ticket-tab {
          padding: 8px 20px;
          border-radius: 8px;
          border: none;
          background: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #7B6F8E;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ticket-tab:hover {
          color: #5B2D8E;
        }

        .ticket-tab.active {
          background: #5B2D8E;
          color: #fff;
          box-shadow: 0 2px 6px rgba(91,45,142,0.2);
        }

        /* Layout */
        .tickets-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 20px;
          align-items: start;
        }

        /* Ticket List */
        .ticket-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ticket-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: #fff;
          border-radius: 12px;
          border: 1.5px solid #E8E4EE;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ticket-row:hover {
          border-color: #D0C8DC;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }

        .ticket-row.selected {
          border-color: #5B2D8E;
          box-shadow: 0 0 0 3px rgba(91,45,142,0.08);
        }

        .ticket-row-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ticket-row-icon.open {
          background: #E8F8EF;
          color: #3DAA6D;
        }

        .ticket-row-icon.closed {
          background: #F0ECF5;
          color: #A09AAD;
        }

        .ticket-row-body {
          flex: 1;
          min-width: 0;
        }

        .ticket-row-title {
          font-size: 14px;
          font-weight: 600;
          color: #1A1222;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 3px;
        }

        .ticket-row-meta {
          font-size: 12px;
          color: #A09AAD;
        }

        /* Team sidebar */
        .team-sidebar {
          background: #fff;
          border-radius: 14px;
          padding: 22px;
          border: 1px solid #E8E4EE;
        }

        .team-sidebar-title {
          font-family: 'DM Serif Display', serif;
          font-size: 16px;
          color: #1A1222;
          margin-bottom: 16px;
        }

        .team-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          margin-bottom: 6px;
          transition: background 0.12s;
        }

        .team-row:hover {
          background: #F7F5FA;
        }

        .team-row:last-child {
          margin-bottom: 0;
        }

        .team-role {
          font-size: 11px;
          color: #7B6F8E;
          font-weight: 500;
        }

        .team-name {
          font-size: 13px;
          font-weight: 600;
          color: #1A1222;
        }

        .online-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3DAA6D;
          margin-left: auto;
          flex-shrink: 0;
        }

        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 48px 20px;
          color: #A09AAD;
        }

        .empty-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: #F7F5FA;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 860px) {
          .tickets-layout {
            grid-template-columns: 1fr;
          }
          .team-sidebar { order: -1; }
          .tickets-page { padding: 20px 16px 100px; }
          .tickets-header h1 { font-size: 24px; }
        }
      `}</style>

      <div
        className="tickets-page"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* ── Header ── */}
        <div className="tickets-header">
          <h1>Support &amp; Tickets</h1>
          <button className="create-btn" onClick={() => setShowModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create New Ticket
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="ticket-stats">
          <div className="stat-pill">
            <span className="stat-dot" style={{ background: "#3DAA6D" }} />
            <span style={{ color: "#3DAA6D" }}>{openCount}</span>
            <span style={{ color: "#7B6F8E", fontWeight: 500 }}>Open</span>
          </div>
          <div className="stat-pill">
            <span className="stat-dot" style={{ background: "#A09AAD" }} />
            <span style={{ color: "#7B6F8E" }}>{closedCount}</span>
            <span style={{ color: "#7B6F8E", fontWeight: 500 }}>Closed</span>
          </div>
          <div className="stat-pill">
            <span style={{ color: "#1A1222" }}>{tickets.length}</span>
            <span style={{ color: "#7B6F8E", fontWeight: 500 }}>Total</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="ticket-tabs">
          {[
            { key: "all", label: `All (${tickets.length})` },
            { key: "open", label: `Open (${openCount})` },
            { key: "closed", label: `Closed (${closedCount})` },
          ].map(t => (
            <button
              key={t.key}
              className={`ticket-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="tickets-layout">
          {/* Ticket list + detail */}
          <div>
            {/* List */}
            <div className="ticket-list">
              {filteredTickets.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A09AAD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 5v2m0 4v2m0 4v2" />
                      <rect x="2" y="3" width="20" height="18" rx="2" />
                      <path d="M2 10h20M2 14h20" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#4A4358", marginBottom: 4 }}>
                    {tab === "open" ? "No open tickets" : tab === "closed" ? "No closed tickets" : "No tickets yet"}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    {tab === "open"
                      ? "You're all caught up! Create a ticket when you need something."
                      : "Tickets will appear here once created."}
                  </div>
                </div>
              )}

              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className={`ticket-row ${selectedTicket?.id === ticket.id ? "selected" : ""}`}
                  onClick={() => setSelectedTicket(
                    selectedTicket?.id === ticket.id ? null : ticket
                  )}
                >
                  <div className={`ticket-row-icon ${ticket.status}`}>
                    {ticket.status === "open" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                  </div>
                  <div className="ticket-row-body">
                    <div className="ticket-row-title">{ticket.title}</div>
                    <div className="ticket-row-meta">{timeAgo(ticket.created_at)}</div>
                  </div>
                  <StatusChip status={ticket.status} />
                </div>
              ))}
            </div>

            {/* Detail panel (below list on mobile, inline on desktop) */}
            {selectedTicket && (
              <div style={{ marginTop: 20 }}>
                <TicketDetail
                  ticket={selectedTicket}
                  onClose={() => setSelectedTicket(null)}
                />
              </div>
            )}
          </div>

          {/* Team sidebar */}
          <div className="team-sidebar">
            <div className="team-sidebar-title">Your Support Team</div>
            {team.map((m, i) => (
              <div className="team-row" key={i}>
                <Avatar name={m.name} size={34} color={m.color} />
                <div>
                  <div className="team-role">{m.role}</div>
                  <div className="team-name">{m.name}</div>
                </div>
                <div className="online-dot" />
              </div>
            ))}
            <div style={{
              marginTop: 16, padding: "12px 14px",
              background: "#F7F5FA", borderRadius: 10,
              fontSize: 12, color: "#7B6F8E", lineHeight: 1.5,
            }}>
              Reference these names in your support tickets so we can route them to the right person.
            </div>
          </div>
        </div>
      </div>

      {/* ── Create Modal ── */}
      <TicketModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreate}
        team={team}
      />
    </>
  );
}
