// ─── usePortalData.js ──────────────────────────────────────────────────────
// React hooks for fetching dashboard data from Supabase.
// Falls back to demo data when Supabase is not configured.
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ─── Auth Hook ─────────────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.getSession();
    if (data?.session?.user) {
      setUser(data.session.user);
    }
    setLoading(false);
  }, []);

  const signInWithMagicLink = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signInWithMagicLink, signOut };
}

// ─── Helper: detect if Supabase is configured ─────────────────────────────

function isSupabaseConfigured() {
  // The placeholder URL means the user hasn't set up Supabase yet
  return !supabase.url.includes("YOUR_PROJECT");
}

// ─── Generic fetch-or-fallback hook ────────────────────────────────────────

function useSupabaseQuery(queryFn, fallbackData, deps = []) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setData(fallbackData);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await queryFn();
      if (result.error) throw result.error;
      setData(result.data && result.data.length > 0 ? result.data : fallbackData);
      setError(null);
    } catch (err) {
      console.warn("Supabase fetch failed, using demo data:", err);
      setData(fallbackData);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ─── Demo / Fallback Data ──────────────────────────────────────────────────

const DEMO_CLIENT = {
  id: "demo",
  firm_name: "Azizi Law Firm",
  contact_name: "Zain Azizi",
  email: "zain@azizilaw.com",
  avatar_url: null,
  package_name: "Saturn - Rhea Package",
  package_price: "$5999/mo",
};

const DEMO_SEO_PROGRESS = [
  { id: "1", label: "SEO Pages Done", done: 3, total: 6, sort_order: 1, seo_progress_subs: [{ label: "EN", done: 2, total: 3 }, { label: "ES", done: 1, total: 3 }] },
  { id: "2", label: "YouTube Videos", done: 3, total: 4, sort_order: 2, seo_progress_subs: [{ label: "EN", done: 2, total: 2 }, { label: "ES", done: 1, total: 2 }] },
  { id: "3", label: "FAQ VOICE Search", done: 4, total: 4, sort_order: 3, seo_progress_subs: [] },
  { id: "4", label: "AI Search", done: 2, total: 3, sort_order: 4, seo_progress_subs: [] },
  { id: "5", label: "Press Release", done: 0, total: 1, sort_order: 5, seo_progress_subs: [] },
];

const DEMO_LIGHTHOUSE = [
  { label: "Performance", score: 98, color: "#5B2D8E", sort_order: 1 },
  { label: "Accessibility", score: 100, color: "#3DAA6D", sort_order: 2 },
  { label: "Best Practices", score: 100, color: "#C4A450", sort_order: 3 },
  { label: "SEO", score: 100, color: "#3DAA6D", sort_order: 4 },
];

const DEMO_TICKETS = [
  { id: "t1", title: "Change courthouse in social post", description: "The social media post from Feb 5th references the wrong courthouse. Should be Los Angeles Superior Court, not Orange County.", status: "closed", created_at: new Date(Date.now() - 86400000 * 5).toISOString(), closed_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "t2", title: "Feb 2nd update blog info", description: "The blog post about settlement amounts needs to be updated with the new 2026 statistics. I'll attach the data sheet.", status: "closed", created_at: new Date(Date.now() - 86400000 * 8).toISOString(), closed_at: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: "t3", title: "Add new attorney headshot to team page", description: "We hired a new associate, Maria Gonzalez. Please add her headshot and bio to the team page. Photo attached.", status: "open", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "t4", title: "Update office hours for holiday schedule", description: "We need to update the hours on our Google Business Profile and website for the upcoming holiday closures: Mar 28-31.", status: "open", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "t5", title: "Fix broken link on car accident page", description: "The 'Learn More' button in the FAQ section of the car accident landing page leads to a 404.", status: "closed", created_at: new Date(Date.now() - 86400000 * 14).toISOString(), closed_at: new Date(Date.now() - 86400000 * 12).toISOString() },
  { id: "t6", title: "Request Google review response templates", description: "Can you provide us with some professional response templates for both positive and negative Google reviews?", status: "closed", created_at: new Date(Date.now() - 86400000 * 20).toISOString(), closed_at: new Date(Date.now() - 86400000 * 18).toISOString() },
];

const DEMO_TEAM = [
  { role: "SEO Manager", name: "Nick Offerman", color: "#5B2D8E", sort_order: 1, specialty: "On-page SEO, keyword strategy, content planning", status: "available", email: "nick@legalleadsgroup.com" },
  { role: "FAQ Search", name: "Hans Gruber", color: "#3DAA6D", sort_order: 2, specialty: "FAQ schema markup, voice search optimization", status: "available", email: "hans@legalleadsgroup.com" },
  { role: "Paid Ads", name: "Larry David", color: "#C4A450", sort_order: 3, specialty: "Google Ads, PPC campaigns, conversion tracking", status: "available", email: "larry@legalleadsgroup.com" },
  { role: "AI Search", name: "2/AI Search", color: "#E67E22", sort_order: 4, specialty: "AI search optimization, entity SEO, knowledge panels", status: "busy", email: "ai@legalleadsgroup.com" },
  { role: "Web Dev", name: "Sheldon Cooper", color: "#3498DB", sort_order: 5, specialty: "Site speed, Core Web Vitals, technical SEO", status: "available", email: "sheldon@legalleadsgroup.com" },
  { role: "Press Release", name: "Tony Montana", color: "#95A5A6", sort_order: 6, specialty: "PR distribution, media outreach, backlink building", status: "busy", email: "tony@legalleadsgroup.com" },
];

const DEMO_UPDATES = [
  { type: "Recent", text: "Blog post added", color: "#5B2D8E", created_at: new Date(Date.now() - 7200000).toISOString() },
  { type: "Recent", text: "YouTube Video added", color: "#C4A450", created_at: new Date(Date.now() - 7200000).toISOString() },
  { type: "Recent", text: "Facebook Post", color: "#3DAA6D", created_at: new Date(Date.now() - 7200000).toISOString() },
  { type: "Uncent", text: "FAQ search added", color: "#95A5A6", created_at: new Date(Date.now() - 7200000).toISOString() },
];

const DEMO_INTEGRATIONS = [
  { name: "Google Analytics", action_label: "View Dashboard", icon: "GA", color: "#E37400", sort_order: 1 },
  { name: "Keyword Tool", action_label: "Analyze Keywords", icon: "KT", color: "#C4A450", sort_order: 2 },
  { name: "NAP+W Scores", action_label: "View Scores", icon: "NW", color: "#5B2D8E", sort_order: 3 },
];

const DEMO_DELIVERABLES = [
  // SEO Pages Done (progress id "1")
  { id: "d1",  seo_progress_id: "1", title: "Car Accident Lawyer",          language: "EN", status: "complete",    assigned_to: "Nick Offerman",  url: "https://azizilaw.com/car-accident-lawyer",  completed_at: "2025-12-15T00:00:00Z", sort_order: 1 },
  { id: "d2",  seo_progress_id: "1", title: "Personal Injury Attorney",     language: "EN", status: "complete",    assigned_to: "Nick Offerman",  url: "https://azizilaw.com/personal-injury",      completed_at: "2025-12-28T00:00:00Z", sort_order: 2 },
  { id: "d3",  seo_progress_id: "1", title: "Truck Accident Lawyer",        language: "EN", status: "in_progress", assigned_to: "Nick Offerman",  started_at: "2026-01-10T00:00:00Z",               sort_order: 3 },
  { id: "d4",  seo_progress_id: "1", title: "Abogado de Accidentes",        language: "ES", status: "complete",    assigned_to: "Nick Offerman",  url: "https://azizilaw.com/es/abogado-accidentes", completed_at: "2026-01-05T00:00:00Z", sort_order: 4 },
  { id: "d5",  seo_progress_id: "1", title: "Abogado de Lesiones Personales", language: "ES", status: "pending",  assigned_to: "Nick Offerman",  sort_order: 5 },
  { id: "d6",  seo_progress_id: "1", title: "Abogado de Accidentes de Camión", language: "ES", status: "pending", assigned_to: "Nick Offerman",  sort_order: 6 },
  // YouTube Videos (progress id "2")
  { id: "d7",  seo_progress_id: "2", title: "What To Do After a Car Accident",     language: "EN", status: "complete",    assigned_to: "Hans Gruber",  url: "https://youtube.com/watch?v=abc1", completed_at: "2025-11-20T00:00:00Z", sort_order: 1 },
  { id: "d8",  seo_progress_id: "2", title: "How to Choose a Personal Injury Lawyer", language: "EN", status: "complete", assigned_to: "Hans Gruber",  url: "https://youtube.com/watch?v=abc2", completed_at: "2026-01-08T00:00:00Z", sort_order: 2 },
  { id: "d9",  seo_progress_id: "2", title: "Qué Hacer Después de un Accidente",   language: "ES", status: "complete",    assigned_to: "Hans Gruber",  url: "https://youtube.com/watch?v=abc3", completed_at: "2026-01-12T00:00:00Z", sort_order: 3 },
  { id: "d10", seo_progress_id: "2", title: "Cómo Elegir un Abogado",              language: "ES", status: "in_progress", assigned_to: "Hans Gruber",  started_at: "2026-02-01T00:00:00Z",     sort_order: 4 },
  // FAQ VOICE Search (progress id "3")
  { id: "d11", seo_progress_id: "3", title: "FAQ Schema – Car Accidents",       language: "EN", status: "complete", assigned_to: "Hans Gruber", completed_at: "2025-11-10T00:00:00Z", sort_order: 1 },
  { id: "d12", seo_progress_id: "3", title: "FAQ Schema – Personal Injury",     language: "EN", status: "complete", assigned_to: "Hans Gruber", completed_at: "2025-12-01T00:00:00Z", sort_order: 2 },
  { id: "d13", seo_progress_id: "3", title: "FAQ Schema – Truck Accidents",     language: "EN", status: "complete", assigned_to: "Hans Gruber", completed_at: "2025-12-20T00:00:00Z", sort_order: 3 },
  { id: "d14", seo_progress_id: "3", title: "FAQ Schema – Workplace Injury",    language: "EN", status: "complete", assigned_to: "Hans Gruber", completed_at: "2026-01-15T00:00:00Z", sort_order: 4 },
  // AI Search (progress id "4")
  { id: "d15", seo_progress_id: "4", title: "AI Search – Firm Overview",        language: "EN", status: "complete",    assigned_to: "2/AI Search", completed_at: "2026-01-02T00:00:00Z", sort_order: 1 },
  { id: "d16", seo_progress_id: "4", title: "AI Search – Practice Areas",       language: "EN", status: "complete",    assigned_to: "2/AI Search", completed_at: "2026-01-18T00:00:00Z", sort_order: 2 },
  { id: "d17", seo_progress_id: "4", title: "AI Search – Attorney Profiles",    language: "EN", status: "in_progress", assigned_to: "2/AI Search", started_at: "2026-02-10T00:00:00Z",  sort_order: 3 },
  // Press Release (progress id "5")
  { id: "d18", seo_progress_id: "5", title: "Firm Launch Press Release",        language: "EN", status: "pending", assigned_to: "Tony Montana", sort_order: 1 },
];

// ─── Data Hooks ────────────────────────────────────────────────────────────

/** Fetch the current client's profile */
export function useClient() {
  return useSupabaseQuery(
    () => supabase.from("clients").select("*").single(),
    DEMO_CLIENT
  );
}

/** Fetch SEO progress with sub-counts */
export function useSeoProgress(clientId) {
  return useSupabaseQuery(
    () =>
      supabase
        .from("seo_progress")
        .select("*, seo_progress_subs(*)")
        .eq("client_id", clientId)
        .order("sort_order"),
    DEMO_SEO_PROGRESS,
    [clientId]
  );
}

/** Fetch individual deliverable items across all categories */
export function useSeoDeliverables(clientId) {
  return useSupabaseQuery(
    () =>
      supabase
        .from("seo_deliverables")
        .select("*")
        .eq("client_id", clientId)
        .order("sort_order"),
    DEMO_DELIVERABLES,
    [clientId]
  );
}

/** Fetch lighthouse scores */
export function useLighthouse(clientId) {
  return useSupabaseQuery(
    () =>
      supabase
        .from("lighthouse_scores")
        .select("*")
        .eq("client_id", clientId)
        .order("sort_order"),
    DEMO_LIGHTHOUSE,
    [clientId]
  );
}

/** Fetch support tickets */
export function useTickets(clientId) {
  const result = useSupabaseQuery(
    () =>
      supabase
        .from("tickets")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
    DEMO_TICKETS,
    [clientId]
  );

  const createTicket = async ({ title, description, fileUrls = [] }) => {
    if (!isSupabaseConfigured()) {
      // Demo mode: add to local state
      const newTicket = {
        id: `t${Date.now()}`,
        client_id: clientId,
        title,
        description,
        status: "open",
        file_urls: fileUrls,
        created_at: new Date().toISOString(),
      };
      result.refetch(); // Would re-pull in production
      return { data: newTicket, error: null };
    }

    const { data, error } = await supabase.from("tickets").insert([
      {
        client_id: clientId,
        title,
        description,
        file_urls: fileUrls,
        status: "open",
      },
    ]);

    if (!error) result.refetch();
    return { data, error };
  };

  return { ...result, createTicket };
}

/** Fetch team members */
export function useTeam(clientId) {
  return useSupabaseQuery(
    () =>
      supabase
        .from("team_members")
        .select("*")
        .eq("client_id", clientId)
        .order("sort_order"),
    DEMO_TEAM,
    [clientId]
  );
}

/** Fetch recent updates */
export function useUpdates(clientId) {
  return useSupabaseQuery(
    () =>
      supabase
        .from("updates")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(10),
    DEMO_UPDATES,
    [clientId]
  );
}

/** Fetch integrations */
export function useIntegrations(clientId) {
  return useSupabaseQuery(
    () =>
      supabase
        .from("integrations")
        .select("*")
        .eq("client_id", clientId)
        .order("sort_order"),
    DEMO_INTEGRATIONS,
    [clientId]
  );
}

// ─── Date formatting helper ───────────────────────────────────────────────

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Time formatting helper ────────────────────────────────────────────────

export function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
