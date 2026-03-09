import { useState, useEffect, useMemo } from "react";
import {
  useClient,
  useSeoProgress,
  useSeoDeliverables,
} from "./usePortalData";

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_MAP = {
  complete:    { label: "Complete",    bg: "#E8F8EF", color: "#217A4B", icon: "✓" },
  in_progress: { label: "In Progress", bg: "#EDE8F4", color: "#5B2D8E", icon: "◎" },
  review:      { label: "In Review",   bg: "#FFF5E6", color: "#B8860B", icon: "◉" },
  pending:     { label: "Pending",     bg: "#F0ECF5", color: "#7B6F8E", icon: "○" },
};

// ─── Progress Ring (small) ─────────────────────────────────────────────────
function MiniRing({ done, total, size = 48 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;
  const offset = circ - pct * circ;
  const isComplete = done >= total;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0ECF5" strokeWidth="5" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={isComplete ? "#3DAA6D" : "#5B2D8E"}
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, color: isComplete ? "#3DAA6D" : "#1A1222"
      }}>
        {done}/{total}
      </div>
    </div>
  );
}

// ─── Big overall progress ──────────────────────────────────────────────────
function OverallProgress({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1222" }}>Overall Completion</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#5B2D8E" }}>{pct}%</span>
        </div>
        <div style={{ width: "100%", height: 12, background: "#F0ECF5", borderRadius: 6, overflow: "hidden" }}>
          <div style={{
            width: `${pct}%`, height: "100%", borderRadius: 6,
            background: pct >= 100
              ? "linear-gradient(90deg, #3DAA6D, #2D8F5A)"
              : "linear-gradient(90deg, #5B2D8E, #7B4BAE)",
            transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)"
          }} />
        </div>
      </div>
      <div style={{
        fontSize: 13, fontWeight: 600, color: "#4A4358",
        background: "#F7F5FA", padding: "6px 14px", borderRadius: 8, whiteSpace: "nowrap"
      }}>
        {done} of {total} items
      </div>
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 6,
      fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      <span style={{ fontSize: 10 }}>{s.icon}</span>
      {s.label}
    </span>
  );
}

// ─── Language badge ────────────────────────────────────────────────────────
function LangBadge({ lang }) {
  const isEN = lang === "EN";
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
      background: isEN ? "#E8F0FE" : "#FFF5E6",
      color: isEN ? "#1A73E8" : "#B8860B",
    }}>
      {lang}
    </span>
  );
}

// ─── Expandable Category Section ───────────────────────────────────────────
function CategorySection({ category, deliverables, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const subs = category.seo_progress_subs || [];
  const isComplete = category.done >= category.total;

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 14,
      border: "1px solid #E8E4EE",
      overflow: "hidden",
      transition: "box-shadow 0.2s",
      boxShadow: open ? "0 4px 16px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.03)",
    }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 16,
          padding: "18px 20px", border: "none", background: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", textAlign: "left",
        }}
      >
        <MiniRing done={category.done} total={category.total} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{
              width: 20, height: 20, borderRadius: "50%",
              background: isComplete ? "#3DAA6D" : "#E0DCE6",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 10, flexShrink: 0,
            }}>
              {isComplete ? "✓" : ""}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1222" }}>
              {category.label}
            </span>
          </div>

          {subs.length > 0 && (
            <div style={{ display: "flex", gap: 12, paddingLeft: 28 }}>
              {subs.map((sub, j) => (
                <span key={j} style={{ fontSize: 11, color: "#7B6F8E", fontWeight: 500 }}>
                  {sub.label}: {sub.done}/{sub.total}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: "#4A4358",
            background: "#F7F5FA", padding: "4px 10px", borderRadius: 6,
          }}>
            {category.done}/{category.total}
          </span>
          <svg
            width="18" height="18" viewBox="0 0 18 18" fill="none"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s ease", color: "#7B6F8E",
            }}
          >
            <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Expanded Items */}
      {open && (
        <div style={{ borderTop: "1px solid #F0ECF5" }}>
          {/* Column headers — desktop */}
          <div className="deliverable-header">
            <span>Deliverable</span>
            <span>Lang</span>
            <span>Status</span>
            <span>Assigned</span>
          </div>

          {deliverables.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", color: "#A09AAD", fontSize: 13 }}>
              No items match the current filters.
            </div>
          )}

          {deliverables.map((item, i) => (
            <div
              key={item.id || i}
              className="deliverable-row"
              style={{
                borderBottom: i < deliverables.length - 1 ? "1px solid #F5F2F8" : "none",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1222", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.title}
                </div>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 11, color: "#5B2D8E", textDecoration: "none", fontWeight: 500 }}
                  >
                    View live page →
                  </a>
                )}
                {!item.url && item.completed_at && (
                  <span style={{ fontSize: 11, color: "#A09AAD" }}>
                    Completed {new Date(item.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
                {!item.url && !item.completed_at && item.started_at && (
                  <span style={{ fontSize: 11, color: "#A09AAD" }}>
                    Started {new Date(item.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
                {/* Mobile: show lang + status inline */}
                <div className="mobile-meta">
                  <LangBadge lang={item.language} />
                  <StatusBadge status={item.status} />
                </div>
              </div>

              <div className="col-lang"><LangBadge lang={item.language} /></div>
              <div className="col-status"><StatusBadge status={item.status} /></div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "linear-gradient(135deg, #5B2D8E, #7B4BAE)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 9, fontWeight: 700, flexShrink: 0,
                }}>
                  {(item.assigned_to || "?").split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <span style={{ fontSize: 12, color: "#4A4358", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.assigned_to || "Unassigned"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main SEO Plan Page ────────────────────────────────────────────────────
export default function SeoPlanPage() {
  const { data: client } = useClient();
  const clientId = client?.id;
  const { data: seoProgress } = useSeoProgress(clientId);
  const { data: deliverables } = useSeoDeliverables(clientId);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLang, setFilterLang] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Group deliverables by progress category
  const deliverablesByCategory = useMemo(() => {
    const map = {};
    deliverables.forEach((d) => {
      const key = d.seo_progress_id;
      if (!map[key]) map[key] = [];
      map[key].push(d);
    });
    return map;
  }, [deliverables]);

  // Apply filters
  const filteredByCategory = useMemo(() => {
    const map = {};
    deliverables
      .filter((d) => {
        if (filterStatus !== "all" && d.status !== filterStatus) return false;
        if (filterLang !== "all" && d.language !== filterLang) return false;
        return true;
      })
      .forEach((d) => {
        const key = d.seo_progress_id;
        if (!map[key]) map[key] = [];
        map[key].push(d);
      });
    return map;
  }, [deliverables, filterStatus, filterLang]);

  // Overall stats
  const totalItems = deliverables.length;
  const completedItems = deliverables.filter((d) => d.status === "complete").length;
  const inProgressItems = deliverables.filter((d) => d.status === "in_progress").length;
  const pendingItems = deliverables.filter((d) => d.status === "pending").length;

  const statCards = [
    { label: "Total Deliverables", value: totalItems, color: "#5B2D8E", bg: "#F0ECF5" },
    { label: "Complete", value: completedItems, color: "#3DAA6D", bg: "#E8F8EF" },
    { label: "In Progress", value: inProgressItems, color: "#5B2D8E", bg: "#EDE8F4" },
    { label: "Pending", value: pendingItems, color: "#7B6F8E", bg: "#F7F5FA" },
  ];

  const hasActiveFilters = filterStatus !== "all" || filterLang !== "all";
  const totalFiltered = Object.values(filteredByCategory).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <>
      <style>{`
        .seo-page {
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 24px 80px;
        }

        .seo-header {
          margin-bottom: 28px;
        }

        .seo-header h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #1A1222;
          margin-bottom: 8px;
        }

        .seo-header-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .package-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 8px;
          background: linear-gradient(135deg, #3B1460, #5B2D8E);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
        }

        .price-badge {
          padding: 5px 14px;
          border-radius: 8px;
          background: #F5EDD4;
          color: #8B6914;
          font-size: 13px;
          font-weight: 700;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 18px;
          border: 1px solid #E8E4EE;
          text-align: center;
        }

        .stat-value {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          line-height: 1.1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 500;
          color: #7B6F8E;
        }

        .progress-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 24px;
          border: 1px solid #E8E4EE;
          margin-bottom: 24px;
        }

        .filters-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-label {
          font-size: 13px;
          font-weight: 600;
          color: #4A4358;
        }

        .filter-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1.5px solid #E8E4EE;
          background: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #4A4358;
          cursor: pointer;
          transition: all 0.15s;
        }

        .filter-btn:hover {
          border-color: #5B2D8E;
          color: #5B2D8E;
        }

        .filter-btn.active {
          background: #5B2D8E;
          border-color: #5B2D8E;
          color: #fff;
        }

        .filter-divider {
          width: 1px;
          height: 24px;
          background: #E8E4EE;
          margin: 0 4px;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Deliverable grid rows */
        .deliverable-header {
          display: grid;
          grid-template-columns: 1fr 54px 100px 140px;
          gap: 8px;
          padding: 10px 20px;
          background: #FAFAFA;
          font-size: 11px;
          font-weight: 600;
          color: #A09AAD;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .deliverable-row {
          display: grid;
          grid-template-columns: 1fr 54px 100px 140px;
          gap: 8px;
          padding: 14px 20px;
          align-items: center;
          transition: background 0.15s;
        }

        .deliverable-row:hover {
          background: #FAFAFA;
        }

        .mobile-meta {
          display: none;
        }

        .col-lang, .col-status {
          display: block;
        }

        @media (max-width: 640px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .seo-page { padding: 20px 16px 100px; }
          .seo-header h1 { font-size: 24px; }

          .deliverable-header { display: none; }
          .deliverable-row {
            grid-template-columns: 1fr auto;
            gap: 8px;
          }
          .col-lang, .col-status { display: none; }
          .mobile-meta {
            display: flex;
            gap: 6px;
            margin-top: 6px;
          }
        }
      `}</style>

      <div
        className="seo-page"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* ── Header ── */}
        <div className="seo-header">
          <h1>SEO Plan Progress</h1>
          <div className="seo-header-meta">
            <span className="package-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z"
                  fill="rgba(255,255,255,0.2)" stroke="#C4A450" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              {client.package_name}
            </span>
            <span className="price-badge">{client.package_price}</span>
            <span style={{ fontSize: 13, color: "#7B6F8E" }}>{client.firm_name}</span>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="stats-row">
          {statCards.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Overall Progress ── */}
        <div className="progress-card">
          <OverallProgress done={completedItems} total={totalItems} />
        </div>

        {/* ── Filters ── */}
        <div className="filters-row">
          <span className="filter-label">Status:</span>
          {["all", "complete", "in_progress", "pending"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filterStatus === f ? "active" : ""}`}
              onClick={() => setFilterStatus(f)}
            >
              {f === "all" ? "All" : STATUS_MAP[f]?.label || f}
            </button>
          ))}

          <div className="filter-divider" />

          <span className="filter-label">Language:</span>
          {["all", "EN", "ES"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filterLang === f ? "active" : ""}`}
              onClick={() => setFilterLang(f)}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}

          {hasActiveFilters && (
            <>
              <div className="filter-divider" />
              <button
                className="filter-btn"
                onClick={() => { setFilterStatus("all"); setFilterLang("all"); }}
                style={{ color: "#C44B4B", borderColor: "#F5D5D5" }}
              >
                Clear filters
              </button>
              <span style={{ fontSize: 12, color: "#7B6F8E" }}>
                Showing {totalFiltered} of {totalItems}
              </span>
            </>
          )}
        </div>

        {/* ── Category Sections ── */}
        <div className="category-list">
          {seoProgress.map((cat, i) => {
            const catId = cat.id;
            const items = filteredByCategory[catId] || [];
            const allItems = deliverablesByCategory[catId] || [];
            if (allItems.length > 0 && items.length === 0 && hasActiveFilters) {
              return null;
            }
            return (
              <CategorySection
                key={catId}
                category={cat}
                deliverables={items}
                defaultOpen={i === 0}
              />
            );
          })}
        </div>

        {totalFiltered === 0 && hasActiveFilters && (
          <div style={{
            textAlign: "center", padding: "40px 20px",
            color: "#A09AAD", fontSize: 14
          }}>
            No deliverables match the current filters.
          </div>
        )}
      </div>
    </>
  );
}
