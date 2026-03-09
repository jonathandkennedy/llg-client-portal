import { useState, useEffect } from "react";
import {
  useClient,
  useSeoProgress,
  useLighthouse,
  useTickets,
  useTeam,
  useUpdates,
  useIntegrations,
  timeAgo,
} from "./usePortalData";


// ─── Circular Score Gauge ──────────────────────────────────────────────────
function ScoreGauge({ score, label, color, delay = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const r = 38;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    const timer = setTimeout(() => {
      let frame = 0;
      const total = 40;
      const interval = setInterval(() => {
        frame++;
        setAnimatedScore(Math.round((frame / total) * score));
        if (frame >= total) clearInterval(interval);
      }, 20);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  const offset = circ - (animatedScore / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 90, height: 90 }}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="#F0ECF5" strokeWidth="7" />
          <circle
            cx="45" cy="45" r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 45 45)"
            style={{ transition: "stroke-dashoffset 0.3s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 700, color: "#1A1222"
        }}>
          {animatedScore}
        </div>
      </div>
      <span style={{ fontSize: 12, color: "#4A4358", fontWeight: 500, textAlign: "center" }}>{label}</span>
    </div>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────
function ProgressBar({ done, total, color = "#C4A450", height = 8 }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div style={{ width: "100%", height, background: "#F0ECF5", borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`, height: "100%", borderRadius: height / 2,
        background: pct >= 100
          ? "linear-gradient(90deg, #3DAA6D, #2D8F5A)"
          : `linear-gradient(90deg, ${color}, ${color}CC)`,
        transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)"
      }} />
    </div>
  );
}

// ─── Avatar Placeholder ────────────────────────────────────────────────────
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

// ─── Card Wrapper ──────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 16,
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
      border: "1px solid #F0ECF5",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Create Ticket Modal ───────────────────────────────────────────────────
function TicketModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState("CWS - Website Updates (Client Portal)");
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

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(26,18,34,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "32px", maxWidth: 520, width: "100%",
        boxShadow: "0 24px 48px rgba(0,0,0,0.15)", animation: "modalIn 0.25s ease"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1A1222" }}>Create Support Ticket</h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", padding: 4,
            color: "#4A4358", fontSize: 20, lineHeight: 1
          }}>&times;</button>
        </div>

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1A1222", marginBottom: 6 }}>Ticket title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={{
          width: "100%", height: 44, padding: "0 14px", fontSize: 14,
          border: "1.5px solid #E0DCE6", borderRadius: 10, outline: "none",
          fontFamily: "'DM Sans', sans-serif", marginBottom: 18,
          background: "#FAFAFA"
        }} />

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1A1222", marginBottom: 6 }}>Describe your update/issue</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe your update/issue" rows={4} style={{
          width: "100%", padding: "12px 14px", fontSize: 14,
          border: "1.5px solid #E0DCE6", borderRadius: 10, outline: "none",
          fontFamily: "'DM Sans', sans-serif", marginBottom: 18, resize: "vertical",
          background: "#FAFAFA"
        }} />

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1A1222", marginBottom: 6 }}>Add File(s)</label>
        <div style={{
          border: "1.5px dashed #D0CCDA", borderRadius: 10, padding: "16px",
          textAlign: "center", marginBottom: 24, cursor: "pointer", background: "#FAFAFA"
        }}>
          <span style={{ fontSize: 13, color: "#7B6F8E" }}>Click or drag files here to upload</span>
        </div>

        <button onClick={handleSubmit} disabled={submitting || !title.trim()} style={{
          width: "100%", height: 48, border: "none", borderRadius: 10,
          background: "linear-gradient(135deg, #3B1460, #5B2D8E)", color: "#fff",
          fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600,
          cursor: submitting ? "wait" : "pointer", boxShadow: "0 4px 12px rgba(59,20,96,0.25)",
          opacity: submitting ? 0.7 : 1
        }}>
          {submitting ? "Submitting…" : "Submit Ticket"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard() {
  const [ticketTab, setTicketTab] = useState("closed");
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ── Supabase data (falls back to demo data automatically) ──
  const { data: client } = useClient();
  const clientId = client?.id;
  const { data: seoProgress } = useSeoProgress(clientId);
  const { data: lighthouse } = useLighthouse(clientId);
  const { data: tickets, createTicket } = useTickets(clientId);
  const { data: team } = useTeam(clientId);
  const { data: updates } = useUpdates(clientId);
  const { data: integrations } = useIntegrations(clientId);

  // Derived ticket lists
  const openTickets = tickets.filter((t) => t.status === "open");
  const closedTickets = tickets.filter((t) => t.status === "closed");

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <>
      <style>{`
        /* ── Dashboard Grid ── */
        .dash-grid {
          display: grid;
          grid-template-columns: 320px 1fr 320px;
          gap: 20px;
          padding: 24px 32px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-title {
          font-family: 'DM Serif Display', serif;
          font-size: 17px;
          color: var(--ink);
          margin-bottom: 16px;
        }

        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        /* ── Ticket Tab ── */
        .tab-bar {
          display: flex;
          border-bottom: 1.5px solid var(--border);
          margin-bottom: 16px;
        }

        .tab-btn {
          flex: 1;
          padding: 10px 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: var(--slate);
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          transition: color 0.15s;
        }

        .tab-btn.active {
          color: var(--purple-mid);
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1.5px;
          left: 0;
          right: 0;
          height: 2.5px;
          background: var(--purple-mid);
          border-radius: 2px;
        }

        /* ── Status Chip ── */
        .chip {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: lowercase;
        }

        .chip-closed {
          background: #F0ECF5;
          color: var(--slate);
        }

        .chip-open {
          background: #E8F8EF;
          color: var(--green);
        }

        /* ── Create Ticket Btn ── */
        .create-ticket-btn {
          padding: 8px 20px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, var(--purple-deep), var(--purple-mid));
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(59,20,96,0.2);
        }

        .create-ticket-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(59,20,96,0.3);
        }

        /* ── Integration Row ── */
        .integration-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #F5F2F8;
        }

        .integration-row:last-child {
          border-bottom: none;
        }

        .integration-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .integration-action {
          margin-left: auto;
          font-size: 12px;
          font-weight: 600;
          color: var(--purple-mid);
          cursor: pointer;
          text-decoration: none;
          transition: color 0.15s;
        }

        .integration-action:hover {
          color: var(--purple-light);
        }

        /* ── Updates ── */
        .update-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #F5F2F8;
        }

        .update-item:last-child {
          border-bottom: none;
        }

        .update-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .update-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        /* ── Team Grid ── */
        .team-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .team-member {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: var(--mist);
          transition: background 0.15s;
        }

        .team-member:hover {
          background: #EDE8F4;
        }

        .team-role {
          font-size: 11px;
          color: var(--slate);
          font-weight: 500;
        }

        .team-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }

        /* ── Check Icon ── */
        .check-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .check-complete {
          background: var(--green);
          color: #fff;
        }

        .check-pending {
          background: #E0DCE6;
          color: #fff;
        }

        /* ── Responsive ── */
        @media (max-width: 1200px) {
          .dash-grid {
            grid-template-columns: 1fr 1fr;
          }
          .dash-grid > :nth-child(1) { order: 1; }
          .dash-grid > :nth-child(2) { order: 3; grid-column: 1 / -1; }
          .dash-grid > :nth-child(3) { order: 2; }
        }

        @media (max-width: 768px) {
          .dash-grid {
            grid-template-columns: 1fr;
            padding: 16px 16px 24px;
            gap: 16px;
          }
          .dash-grid > * { order: unset !important; grid-column: unset !important; }
          .team-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Dashboard Content ── */}
      <div className="dash-grid">

        {/* ═══ LEFT COLUMN ═══ */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 20,
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s"
        }}>

          {/* SEO Plan Progress */}
          <Card>
            <h2 className="section-title">SEO Plan Progress</h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1222" }}>{client.package_name}</div>
              </div>
              <div style={{
                fontSize: 14, fontWeight: 700, color: "#5B2D8E",
                background: "#F0ECF5", padding: "4px 12px", borderRadius: 8
              }}>
                {client.package_price}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {seoProgress.map((item, i) => {
                const subs = item.seo_progress_subs || item.subs || [];
                return (
                <div key={item.id || i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div className={`check-icon ${item.done >= item.total ? "check-complete" : "check-pending"}`}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1222", flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#4A4358" }}>{item.done}/{item.total}</span>
                  </div>
                  <ProgressBar done={item.done} total={item.total} />
                  {subs.length > 0 && (
                    <div style={{ display: "flex", gap: 16, marginTop: 6, paddingLeft: 26 }}>
                      {subs.map((sub, j) => (
                        <span key={j} style={{ fontSize: 11, color: "#7B6F8E", fontWeight: 500 }}>
                          {sub.label}: {sub.done}/{sub.total}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </Card>

          {/* Integrations */}
          <Card>
            <h2 className="section-title">Integrations</h2>
            {integrations.map((int, i) => (
              <div className="integration-row" key={i}>
                <div className="integration-icon" style={{
                  background: int.color === "#E37400"
                    ? "linear-gradient(135deg, #E37400, #F59E0B)"
                    : int.color === "#C4A450"
                    ? "linear-gradient(135deg, #C4A450, #DFC777)"
                    : "linear-gradient(135deg, #5B2D8E, #7B4BAE)"
                }}>
                  {int.icon}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1222" }}>{int.name}</span>
                <a className="integration-action" href="#">{int.action_label}</a>
              </div>
            ))}
          </Card>
        </div>

        {/* ═══ MIDDLE COLUMN ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20,
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s" }}>

          {/* Support & Tickets */}
          <Card>
            <div className="section-title-row">
              <h2 className="section-title" style={{ marginBottom: 0 }}>Support &amp; Tickets</h2>
              <button className="create-ticket-btn" onClick={() => setShowModal(true)}>
                Create New Ticket
              </button>
            </div>

            <div className="tab-bar">
              <button className={`tab-btn ${ticketTab === "open" ? "active" : ""}`} onClick={() => setTicketTab("open")}>
                Open Tickets
              </button>
              <button className={`tab-btn ${ticketTab === "closed" ? "active" : ""}`} onClick={() => setTicketTab("closed")}>
                Closed Tickets
              </button>
            </div>

            {ticketTab === "open" && openTickets.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#A09AAD", fontSize: 14 }}>
                No open tickets — you're all caught up!
              </div>
            )}

            {ticketTab === "open" && openTickets.map((t, i) => (
              <div key={t.id || i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: i < openTickets.length - 1 ? "1px solid #F5F2F8" : "none"
              }}>
                <span style={{ fontSize: 14, color: "#1A1222" }}>{t.title}</span>
                <span className="chip chip-open">{t.status}</span>
              </div>
            ))}

            {ticketTab === "closed" && closedTickets.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#A09AAD", fontSize: 14 }}>
                No closed tickets yet.
              </div>
            )}

            {ticketTab === "closed" && closedTickets.map((t, i) => (
              <div key={t.id || i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: i < closedTickets.length - 1 ? "1px solid #F5F2F8" : "none"
              }}>
                <span style={{ fontSize: 14, color: "#1A1222" }}>{t.title}</span>
                <span className="chip chip-closed">{t.status}</span>
              </div>
            ))}
          </Card>

          {/* Your Support Team */}
          <Card>
            <h2 className="section-title">Your Support Team</h2>
            <div className="team-grid">
              {team.map((m, i) => (
                <div className="team-member" key={i}>
                  <Avatar name={m.name} size={34} color={m.color} />
                  <div>
                    <div className="team-role">{m.role}</div>
                    <div className="team-name">{m.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#A09AAD", marginTop: 14, textAlign: "center" }}>
              Reference these names in your support tickets.
            </p>
          </Card>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20,
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s" }}>

          {/* NAP Lighthouse Scores */}
          <Card>
            <h2 className="section-title">NAP Lighthouse Scores</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, justifyItems: "center", padding: "8px 0" }}>
              {lighthouse.map((item, i) => (
                <ScoreGauge key={i} score={item.score} label={item.label} color={item.color} delay={300 + i * 150} />
              ))}
            </div>
          </Card>

          {/* Recent Updates */}
          <Card>
            <h2 className="section-title">Recent Updates</h2>
            {updates.map((u, i) => (
              <div className="update-item" key={u.id || i}>
                <div className="update-dot" style={{ background: u.color }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span className="update-badge" style={{
                      background: u.type === "Recent" ? "#F0ECF5" : "#FFF5E6",
                      color: u.type === "Recent" ? "#5B2D8E" : "#B8860B"
                    }}>
                      {u.type}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1222" }}>{u.text}</div>
                  <div style={{ fontSize: 12, color: "#A09AAD", marginTop: 2 }}>{timeAgo(u.created_at)}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* ── Ticket Modal ── */}
      <TicketModal open={showModal} onClose={() => setShowModal(false)} onSubmit={createTicket} />
    </>
  );
}
