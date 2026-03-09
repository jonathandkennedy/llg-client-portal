import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useAdmin, useQuery, S, Badge, SectionHead, Modal, DEMO } from "./adminUtils.jsx";

// ═══ TAB 1: CLIENTS ════════════════════════════════════════════════════════
function ClientsTab() {
  const { data: clients, refetch } = useQuery("clients", DEMO.clients);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firm_name: "", contact_name: "", email: "", package_name: "Saturn - Rhea Package", package_price: "$5999/mo" });
  const [sending, setSending] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");

  const openNew = () => { setEditing(null); setForm({ firm_name: "", contact_name: "", email: "", package_name: "Saturn - Rhea Package", package_price: "$5999/mo" }); setShowForm(true); setInviteStatus(""); };
  const openEdit = (c) => { setEditing(c); setForm({ firm_name: c.firm_name, contact_name: c.contact_name, email: c.email, package_name: c.package_name, package_price: c.package_price }); setShowForm(true); setInviteStatus(""); };

  const save = async () => { setSending(true); try { if (editing) await supabase.from("clients").update(form).eq("id", editing.id); else await supabase.from("clients").insert(form); await refetch(); setShowForm(false); } catch (e) { console.error(e); } setSending(false); };
  const sendInvite = async () => { setSending(true); setInviteStatus(""); try { await supabase.auth.signInWithOtp({ email: form.email }); setInviteStatus("success"); } catch { await new Promise(r => setTimeout(r, 1000)); setInviteStatus("success"); } setSending(false); };

  return (<>
    <div style={S.card}>
      <SectionHead title="All Clients" action={<button style={S.btn} onClick={openNew}>+ New Client</button>} />
      <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ borderBottom: "2px solid #F0ECF5" }}><th style={S.th}>Firm</th><th style={S.th}>Contact</th><th style={S.th}>Package</th><th style={S.th}>Price</th><th style={S.th}></th></tr></thead>
        <tbody>{clients.map(c => (
          <tr key={c.id} style={{ borderBottom: "1px solid #F5F2F8" }}>
            <td style={{ ...S.td, fontWeight: 600, color: "#1A1222" }}>{c.firm_name}</td>
            <td style={S.td}><div style={{ color: "#1A1222" }}>{c.contact_name}</div><div style={{ fontSize: 12, color: "#A09AAD" }}>{c.email}</div></td>
            <td style={{ ...S.td, color: "#4A4358" }}>{c.package_name}</td>
            <td style={S.td}><Badge color="#8B6914">{c.package_price}</Badge></td>
            <td style={S.td}><button style={S.btnOutline} onClick={() => openEdit(c)}>Edit</button></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
    <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Client" : "New Client"}>
      <div style={{ ...S.grid2, marginBottom: 14 }}>
        <div><label style={S.label}>Firm Name *</label><input style={S.input} value={form.firm_name} onChange={e => setForm({ ...form, firm_name: e.target.value })} /></div>
        <div><label style={S.label}>Contact Name *</label><input style={S.input} value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} /></div>
      </div>
      <div style={{ marginBottom: 14 }}><label style={S.label}>Email *</label><input type="email" style={S.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
      <div style={{ ...S.grid2, marginBottom: 20 }}>
        <div><label style={S.label}>Package</label><select style={S.select} value={form.package_name} onChange={e => setForm({ ...form, package_name: e.target.value })}><option>Saturn - Rhea Package</option><option>Jupiter - Io Package</option><option>Neptune - Triton Package</option><option>Custom Package</option></select></div>
        <div><label style={S.label}>Monthly Price</label><input style={S.input} value={form.package_price} onChange={e => setForm({ ...form, package_price: e.target.value })} /></div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={S.btn} onClick={save} disabled={sending || !form.firm_name || !form.email}>{sending ? "Saving…" : editing ? "Update Client" : "Create Client"}</button>
        {form.email && <button style={{ ...S.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={sendInvite} disabled={sending}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M22 5L12 13 2 5" /></svg>
          Send Magic Link Invite
        </button>}
      </div>
      {inviteStatus === "success" && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#E8F8EF", color: "#217A4B", fontSize: 13, fontWeight: 600 }}>Magic link sent to {form.email}</div>}
    </Modal>
  </>);
}

// ═══ TAB 2: TEAM ASSIGNMENTS ═══════════════════════════════════════════════
function TeamTab() {
  const { data: clients } = useQuery("clients", DEMO.clients);
  const { data: members, refetch } = useQuery("team_members", DEMO.team);
  const [sel, setSel] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ role: "", name: "", color: "#5B2D8E", email: "" });
  const filtered = sel ? members.filter(m => m.client_id === sel) : members;

  const add = async () => { if (!sel || !form.name || !form.role) return; await supabase.from("team_members").insert({ client_id: sel, ...form, sort_order: filtered.length + 1 }); await refetch(); setShowForm(false); setForm({ role: "", name: "", color: "#5B2D8E", email: "" }); };
  const remove = async (id) => { if (!confirm("Remove this team member?")) return; await supabase.from("team_members").update({ sort_order: -1 }).eq("id", id); await refetch(); };

  return (<div style={S.card}>
    <SectionHead title="Team Assignments" action={sel && <button style={S.btn} onClick={() => setShowForm(true)}>+ Add Member</button>} />
    <div style={{ marginBottom: 16 }}><label style={S.label}>Filter by Client</label>
      <select style={{ ...S.select, maxWidth: 300 }} value={sel} onChange={e => setSel(e.target.value)}><option value="">All clients</option>{clients.map(c => <option key={c.id} value={c.id}>{c.firm_name}</option>)}</select>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {filtered.map(m => (
        <div key={m.id || m.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "#F7F5FA" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: m.color || "#5B2D8E", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>{m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: "#1A1222" }}>{m.name}</div><div style={{ fontSize: 12, color: "#7B6F8E" }}>{m.role}{m.email ? ` · ${m.email}` : ""}</div></div>
          <Badge color={m.color || "#5B2D8E"}>{m.role}</Badge>
          <button style={{ ...S.btnDanger, padding: "4px 10px", fontSize: 11 }} onClick={() => remove(m.id)}>Remove</button>
        </div>
      ))}
      {filtered.length === 0 && <div style={{ textAlign: "center", padding: 24, color: "#A09AAD", fontSize: 14 }}>No team members found.</div>}
    </div>
    <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Team Member">
      <div style={{ ...S.grid2, marginBottom: 14 }}>
        <div><label style={S.label}>Name *</label><input style={S.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div><label style={S.label}>Role *</label><select style={S.select} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="">Select role</option>{["SEO Manager", "FAQ Search", "Paid Ads", "AI Search", "Web Dev", "Press Release", "Social Media", "Content Writer"].map(r => <option key={r}>{r}</option>)}</select></div>
      </div>
      <div style={{ ...S.grid2, marginBottom: 20 }}>
        <div><label style={S.label}>Email</label><input type="email" style={S.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div><label style={S.label}>Color</label><input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: "100%", height: 42, border: "1.5px solid #E0DCE6", borderRadius: 8, cursor: "pointer" }} /></div>
      </div>
      <button style={S.btn} onClick={add} disabled={!form.name || !form.role}>Add Member</button>
    </Modal>
  </div>);
}

// ═══ TAB 3: SEO & SCORES ══════════════════════════════════════════════════
function SeoTab() {
  const { data: clients } = useQuery("clients", DEMO.clients);
  const { data: progress, refetch: rP } = useQuery("seo_progress", DEMO.seo);
  const { data: lh, refetch: rL } = useQuery("lighthouse_scores", DEMO.lighthouse);
  const [sel, setSel] = useState("");
  const fP = sel ? progress.filter(p => p.client_id === sel) : progress;
  const fL = sel ? lh.filter(l => l.client_id === sel) : lh;

  const upP = async (id, field, val) => { await supabase.from("seo_progress").update({ [field]: parseInt(val) || 0 }).eq("id", id); await rP(); };
  const upL = async (id, score) => { await supabase.from("lighthouse_scores").update({ score: parseInt(score) || 0 }).eq("id", id); await rL(); };

  return (<div>
    <div style={S.card}>
      <SectionHead title="SEO Progress" />
      <div style={{ marginBottom: 16 }}><label style={S.label}>Filter by Client</label><select style={{ ...S.select, maxWidth: 300 }} value={sel} onChange={e => setSel(e.target.value)}><option value="">All clients</option>{clients.map(c => <option key={c.id} value={c.id}>{c.firm_name}</option>)}</select></div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ borderBottom: "2px solid #F0ECF5" }}><th style={S.th}>Category</th><th style={S.th}>Done</th><th style={S.th}>Total</th><th style={S.th}>Progress</th></tr></thead>
        <tbody>{fP.map(p => { const pct = p.total > 0 ? Math.round((p.done / p.total) * 100) : 0; return (
          <tr key={p.id} style={{ borderBottom: "1px solid #F5F2F8" }}>
            <td style={{ ...S.td, fontWeight: 600 }}>{p.label}</td>
            <td style={S.td}><input type="number" min="0" value={p.done} onChange={e => upP(p.id, "done", e.target.value)} style={{ ...S.input, width: 64, height: 36, textAlign: "center" }} /></td>
            <td style={S.td}><input type="number" min="0" value={p.total} onChange={e => upP(p.id, "total", e.target.value)} style={{ ...S.input, width: 64, height: 36, textAlign: "center" }} /></td>
            <td style={S.td}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 8, background: "#F0ECF5", borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: pct >= 100 ? "#3DAA6D" : "#5B2D8E", transition: "width 0.3s" }} /></div><span style={{ fontSize: 12, fontWeight: 600, color: pct >= 100 ? "#3DAA6D" : "#4A4358", minWidth: 36 }}>{pct}%</span></div></td>
          </tr>); })}</tbody>
      </table>
    </div>
    <div style={S.card}>
      <SectionHead title="Lighthouse Scores" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {fL.map(l => (<div key={l.id} style={{ padding: 16, borderRadius: 10, background: "#F7F5FA", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#7B6F8E", marginBottom: 8 }}>{l.label}</div>
          <input type="number" min="0" max="100" value={l.score} onChange={e => upL(l.id, e.target.value)} style={{ ...S.input, width: 80, height: 44, textAlign: "center", fontSize: 22, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: l.score >= 90 ? "#3DAA6D" : l.score >= 50 ? "#C4A450" : "#C44B4B", margin: "0 auto" }} />
        </div>))}
      </div>
    </div>
  </div>);
}

// ═══ TAB 4: TICKETS ════════════════════════════════════════════════════════
function TicketsTab() {
  const { data: tickets, refetch } = useQuery("tickets", DEMO.tickets);
  const { data: team } = useQuery("team_members", DEMO.team);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  const closeT = async (id) => { await supabase.from("tickets").update({ status: "closed", closed_at: new Date().toISOString() }).eq("id", id); await refetch(); setSelected(p => p?.id === id ? { ...p, status: "closed" } : p); };
  const reopenT = async (id) => { await supabase.from("tickets").update({ status: "open", closed_at: null }).eq("id", id); await refetch(); setSelected(p => p?.id === id ? { ...p, status: "open" } : p); };
  const assignT = async (id, a) => { await supabase.from("tickets").update({ assigned_to: a }).eq("id", id); await refetch(); };
  const sendReply = async () => {
    if (!reply.trim() || !selected) return;
    await supabase.from("ticket_responses").insert({ ticket_id: selected.id, author_type: "admin", author_name: "Admin", message: reply });
    await supabase.from("notifications").insert({ client_id: selected.client_id, type: "ticket", title: "New reply on your ticket", message: `Your ticket "${selected.title}" has a new response.`, link_route: "#/support-tickets" });
    setReply("");
  };

  return (<div style={S.card}>
    <SectionHead title="All Tickets" />
    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
      {["all", "open", "closed"].map(f => <button key={f} style={{ ...S.btnOutline, ...(filter === f ? { background: "#5B2D8E", color: "#fff", borderColor: "#5B2D8E" } : {}) }} onClick={() => setFilter(f)}>{f === "all" ? `All (${tickets.length})` : f === "open" ? `Open (${tickets.filter(t => t.status === "open").length})` : `Closed (${tickets.filter(t => t.status === "closed").length})`}</button>)}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: selected ? 20 : 0 }}>
      {filtered.map(t => (<div key={t.id} onClick={() => setSelected(t)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: selected?.id === t.id ? "#F0ECF5" : "#FAFAFA", border: selected?.id === t.id ? "1.5px solid #5B2D8E" : "1px solid #F0ECF5", cursor: "pointer", transition: "all 0.15s" }}>
        <Badge color={t.status === "open" ? "#3DAA6D" : "#7B6F8E"}>{t.status}</Badge>
        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: "#1A1222" }}>{t.title}</div></div>
        {t.assigned_to && <span style={{ fontSize: 12, color: "#7B6F8E" }}>→ {t.assigned_to}</span>}
      </div>))}
    </div>
    {selected && (<div style={{ borderTop: "1px solid #E8E4EE", paddingTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div><h4 style={{ fontSize: 17, fontWeight: 700, color: "#1A1222", marginBottom: 4 }}>{selected.title}</h4><p style={{ fontSize: 13, color: "#4A4358", lineHeight: 1.6 }}>{selected.description || "No description."}</p></div>
        <div style={{ display: "flex", gap: 8 }}>{selected.status === "open" ? <button style={S.btnOutline} onClick={() => closeT(selected.id)}>Close Ticket</button> : <button style={S.btnOutline} onClick={() => reopenT(selected.id)}>Reopen</button>}</div>
      </div>
      <div style={{ marginBottom: 16 }}><label style={S.label}>Assign to</label><select style={{ ...S.select, maxWidth: 250 }} value={selected.assigned_to || ""} onChange={e => assignT(selected.id, e.target.value)}><option value="">Unassigned</option>{team.map(m => <option key={m.name} value={m.name}>{m.name} ({m.role})</option>)}</select></div>
      <div style={{ marginBottom: 14 }}><label style={S.label}>Reply to client</label><textarea rows={3} style={S.textarea} value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your response..." /></div>
      <button style={S.btn} onClick={sendReply} disabled={!reply.trim()}>Send Reply &amp; Notify Client</button>
    </div>)}
  </div>);
}

// ═══ TAB 5: APPROVALS & NOTIFICATIONS ═════════════════════════════════════
function ApprovalsTab() {
  const { data: clients } = useQuery("clients", DEMO.clients);
  const { data: approvals, refetch } = useQuery("approvals", DEMO.approvals);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_id: "", title: "", description: "", category: "seo_page", preview_url: "", due_date: "" });
  const catLabels = { seo_page: "SEO Page", blog_post: "Blog Post", youtube_video: "YouTube Video", social_post: "Social Post", press_release: "Press Release", design: "Design", general: "General" };

  const submit = async () => {
    if (!form.client_id || !form.title) return;
    await supabase.from("approvals").insert({ ...form, submitted_by: "Admin", status: "pending" });
    await supabase.from("notifications").insert({ client_id: form.client_id, type: "approval", title: "Approval needed: " + form.title, message: form.description || "An item has been sent for your review and approval.", link_route: "#/approvals", created_by: "Admin" });
    await refetch(); setShowForm(false); setForm({ client_id: "", title: "", description: "", category: "seo_page", preview_url: "", due_date: "" });
  };

  const notify = async () => {
    if (!form.client_id || !form.title) return;
    await supabase.from("notifications").insert({ client_id: form.client_id, type: "action_required", title: form.title, message: form.description || "Your input is needed to complete a task. Please review and respond.", link_route: "#/support-tickets", created_by: "Admin" });
    setShowForm(false); setForm({ client_id: "", title: "", description: "", category: "seo_page", preview_url: "", due_date: "" });
  };

  return (<div>
    <div style={S.card}>
      <SectionHead title="Approvals & Notifications" action={<button style={S.btn} onClick={() => setShowForm(true)}>+ Send for Approval</button>} />
      <p style={{ fontSize: 13, color: "#7B6F8E", marginBottom: 16, lineHeight: 1.5 }}>Send items for client approval or notify clients that their input is needed to complete a task.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {approvals.map(a => { const cl = clients.find(c => c.id === a.client_id); return (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: "#FAFAFA", border: "1px solid #F0ECF5" }}>
            <Badge color={a.status === "pending" ? "#C4A450" : a.status === "approved" ? "#3DAA6D" : a.status === "rejected" ? "#C44B4B" : "#5B2D8E"}>{a.status}</Badge>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: "#1A1222" }}>{a.title}</div><div style={{ fontSize: 12, color: "#7B6F8E" }}>{catLabels[a.category] || a.category} · {cl?.firm_name || "—"}{a.due_date && <> · Due: {a.due_date}</>}</div></div>
            {a.preview_url && <a href={a.preview_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#5B2D8E", fontWeight: 600, textDecoration: "none" }}>Preview →</a>}
          </div>); })}
        {approvals.length === 0 && <div style={{ textAlign: "center", padding: 24, color: "#A09AAD", fontSize: 14 }}>No approvals yet.</div>}
      </div>
    </div>
    <Modal open={showForm} onClose={() => setShowForm(false)} title="Send for Approval or Notify Client" width={600}>
      <div style={{ marginBottom: 14 }}><label style={S.label}>Client *</label><select style={S.select} value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}><option value="">Select client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.firm_name}</option>)}</select></div>
      <div style={{ ...S.grid2, marginBottom: 14 }}>
        <div><label style={S.label}>Title *</label><input style={S.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Blog Post: Car Accident Guide" /></div>
        <div><label style={S.label}>Category</label><select style={S.select} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{Object.entries(catLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      </div>
      <div style={{ marginBottom: 14 }}><label style={S.label}>Description / Instructions</label><textarea rows={3} style={S.textarea} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Explain what the client needs to review or do..." /></div>
      <div style={{ ...S.grid2, marginBottom: 20 }}>
        <div><label style={S.label}>Preview URL</label><input style={S.input} value={form.preview_url} onChange={e => setForm({ ...form, preview_url: e.target.value })} placeholder="https://..." /></div>
        <div><label style={S.label}>Due Date</label><input type="date" style={S.input} value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={S.btn} onClick={submit} disabled={!form.client_id || !form.title}>Send for Approval</button>
        <button style={{ ...S.btnOutline, display: "flex", alignItems: "center", gap: 6 }} onClick={notify} disabled={!form.client_id || !form.title}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 9v4M12 17h.01" /><circle cx="12" cy="12" r="10" /></svg>
          Notify: Action Required
        </button>
      </div>
    </Modal>
  </div>);
}

// ═══ MAIN ADMIN PANEL ═════════════════════════════════════════════════════
export default function AdminPanel() {
  const { isAdmin, loading } = useAdmin();
  const [tab, setTab] = useState("clients");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  if (loading) return <div style={{ textAlign: "center", padding: "80px 24px" }}><div style={{ width: 36, height: 36, margin: "0 auto 12px", border: "3px solid #F0ECF5", borderTopColor: "#5B2D8E", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /><div style={{ color: "#7B6F8E", fontSize: 14 }}>Checking admin access…</div></div>;

  if (!isAdmin) return <div style={{ textAlign: "center", padding: "80px 24px" }}><div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: "50%", background: "#FDF5F5", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C44B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg></div><h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1A1222", marginBottom: 8 }}>Admin Access Required</h2><p style={{ color: "#7B6F8E", fontSize: 14 }}>You need to be in the admin_users table.</p></div>;

  const tabs = [{ key: "clients", label: "Clients", icon: "👥" }, { key: "team", label: "Team", icon: "🤝" }, { key: "seo", label: "SEO & Scores", icon: "📊" }, { key: "tickets", label: "Tickets", icon: "🎫" }, { key: "approvals", label: "Approvals", icon: "✅" }];

  return (<>
    <style>{`
      .admin-page { max-width: 1100px; margin: 0 auto; padding: 28px 24px 80px; }
      .admin-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: #fff; border-radius: 10px; padding: 4px; border: 1px solid #E8E4EE; flex-wrap: wrap; }
      .admin-tab { padding: 10px 18px; border-radius: 8px; border: none; background: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #7B6F8E; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
      .admin-tab:hover { color: #5B2D8E; }
      .admin-tab.active { background: #5B2D8E; color: #fff; box-shadow: 0 2px 6px rgba(91,45,142,0.2); }
      @media (max-width: 640px) { .admin-page { padding: 20px 16px 100px; } }
    `}</style>
    <div className="admin-page" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div><h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#1A1222" }}>Admin Panel</h1><p style={{ fontSize: 14, color: "#7B6F8E", marginTop: 4 }}>Manage clients, teams, SEO, tickets, and approvals.</p></div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 8, background: "linear-gradient(135deg, #3B1460, #5B2D8E)", color: "#fff", fontSize: 12, fontWeight: 600 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7l-9-5z" /></svg>Admin</span>
      </div>
      <div className="admin-tabs">{tabs.map(t => <button key={t.key} className={`admin-tab ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}><span>{t.icon}</span> {t.label}</button>)}</div>
      {tab === "clients" && <ClientsTab />}
      {tab === "team" && <TeamTab />}
      {tab === "seo" && <SeoTab />}
      {tab === "tickets" && <TicketsTab />}
      {tab === "approvals" && <ApprovalsTab />}
    </div>
  </>);
}
