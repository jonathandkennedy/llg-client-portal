// ─── adminUtils.jsx ────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function check() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
          setIsAdmin(data?.role === "admin");
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
      setLoading(false);
    }
    check();
  }, []);
  return { isAdmin, loading };
}

export function useQuery(table, fallback = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try { const { data: rows } = await supabase.from(table).select("*"); if (rows && rows.length > 0) setData(rows); } catch {}
    setLoading(false);
  }, [table]);
  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, refetch };
}

export const S = {
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#1A1222", marginBottom: 4 },
  input: { width: "100%", height: 42, padding: "0 12px", border: "1.5px solid #E0DCE6", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#FAFAFA", outline: "none" },
  textarea: { width: "100%", padding: "10px 12px", border: "1.5px solid #E0DCE6", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#FAFAFA", outline: "none", resize: "vertical" },
  select: { width: "100%", height: 42, padding: "0 10px", border: "1.5px solid #E0DCE6", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "#FAFAFA", outline: "none" },
  btn: { padding: "9px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #3B1460, #5B2D8E)", color: "#fff", fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnOutline: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #E8E4EE", background: "#fff", fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 600, color: "#4A4358", cursor: "pointer" },
  btnDanger: { padding: "8px 16px", borderRadius: 8, border: "1.5px solid #F5D5D5", background: "#FDF5F5", fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 600, color: "#C44B4B", cursor: "pointer" },
  card: { background: "#fff", borderRadius: 14, border: "1px solid #E8E4EE", padding: 24, marginBottom: 16 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  th: { padding: "10px 12px", fontWeight: 600, color: "#7B6F8E", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "left" },
  td: { padding: "12px", fontSize: 14 },
};

export function Badge({ color, children }) {
  return <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}18`, color }}>{children}</span>;
}

export function SectionHead({ title, action }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#1A1222" }}>{title}</h3>{action}</div>;
}

export function Modal({ open, onClose, title, children, width = 560 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(26,18,34,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: width, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.15)", animation: "modalIn 0.25s ease", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1A1222" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#F7F5FA", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 8, color: "#4A4358", fontSize: 18, lineHeight: 1 }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const DEMO = {
  clients: [
    { id: "demo-1", firm_name: "Azizi Law Firm", contact_name: "Zain Azizi", email: "zain@azizilaw.com", package_name: "Saturn - Rhea Package", package_price: "$5999/mo" },
    { id: "demo-2", firm_name: "Martinez Legal", contact_name: "Ana Martinez", email: "ana@martinezlegal.com", package_name: "Jupiter - Io Package", package_price: "$3999/mo" },
  ],
  team: [
    { id: "tm-1", client_id: "demo-1", role: "SEO Manager", name: "Nick Offerman", color: "#5B2D8E", email: "nick@llg.com" },
    { id: "tm-2", client_id: "demo-1", role: "Web Dev", name: "Sheldon Cooper", color: "#3498DB", email: "sheldon@llg.com" },
    { id: "tm-3", client_id: "demo-1", role: "Paid Ads", name: "Larry David", color: "#C4A450", email: "larry@llg.com" },
    { id: "tm-4", client_id: "demo-2", role: "SEO Manager", name: "Nick Offerman", color: "#5B2D8E", email: "nick@llg.com" },
  ],
  seo: [
    { id: "sp-1", client_id: "demo-1", label: "SEO Pages Done", done: 3, total: 6, sort_order: 1 },
    { id: "sp-2", client_id: "demo-1", label: "YouTube Videos", done: 3, total: 4, sort_order: 2 },
    { id: "sp-3", client_id: "demo-1", label: "FAQ VOICE Search", done: 4, total: 4, sort_order: 3 },
    { id: "sp-4", client_id: "demo-1", label: "AI Search", done: 2, total: 3, sort_order: 4 },
  ],
  lighthouse: [
    { id: "lh-1", client_id: "demo-1", label: "Performance", score: 98, color: "#5B2D8E" },
    { id: "lh-2", client_id: "demo-1", label: "Accessibility", score: 100, color: "#3DAA6D" },
    { id: "lh-3", client_id: "demo-1", label: "Best Practices", score: 100, color: "#C4A450" },
    { id: "lh-4", client_id: "demo-1", label: "SEO", score: 100, color: "#3DAA6D" },
  ],
  tickets: [
    { id: "t-1", client_id: "demo-1", title: "Add new attorney headshot", description: "New associate Maria Gonzalez needs to be added to the team page.", status: "open", assigned_to: null, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "t-2", client_id: "demo-1", title: "Update office hours", description: "Holiday hours for Mar 28-31 closure.", status: "open", assigned_to: "Sheldon Cooper", created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "t-3", client_id: "demo-1", title: "Change courthouse in social post", description: "Wrong courthouse referenced.", status: "closed", assigned_to: "Nick Offerman", created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  ],
  approvals: [
    { id: "a-1", client_id: "demo-1", title: "Blog Post: Car Accident Settlement Guide", category: "blog_post", status: "pending", preview_url: "https://preview.azizilaw.com/blog/car-accident-guide", submitted_by: "Nick Offerman", due_date: "2026-03-15" },
    { id: "a-2", client_id: "demo-1", title: "YouTube Thumbnail: Injury Lawyer Tips", category: "youtube_video", status: "approved", submitted_by: "Hans Gruber" },
  ],
};