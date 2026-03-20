// ─── usePortalData.js ──────────────────────────────────────────────────────
// React hooks for fetching client portal data from Supabase.
// Falls back to demo data when no data exists for the client.
// ────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ─── Auth Hook ─────────────────────────────────────────────────────────────

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signInWithMagicLink, signOut };
}

// ─── Generic fetch-or-fallback hook ────────────────────────────────────────

function useSupabaseQuery(queryFn, fallbackData, deps = []) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await queryFn();
      if (result.error) throw result.error;
      if (result.data && (Array.isArray(result.data) ? result.data.length > 0 : result.data)) {
        setData(result.data);
      } else {
        setData(fallbackData);
      }
      setError(null);
    } catch (err) {
      console.warn("Supabase fetch failed, using fallback data:", err?.message || err);
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
  firm_name: "Your Law Firm",
  contact_name: "Client",
  email: "client@example.com",
  avatar_url: null,
  package_name: "Saturn Package",
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
  { id: "t1", title: "Change courthouse in social post", description: "The social media post references the wrong courthouse.", status: "closed", created_at: new Date(Date.now() - 86400000 * 5).toISOString(), closed_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "t2", title: "Add new attorney headshot to team page", description: "We hired a new associate. Please add her headshot and bio.", status: "open", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "t3", title: "Update office hours for holiday schedule", description: "We need to update the hours on our Google Business Profile.", status: "open", created_at: new Date(Date.now() - 86400000).toISOString() },
];

const DEMO_TEAM = [
  { role: "SEO Manager", name: "Your SEO Lead", color: "#5B2D8E", sort_order: 1, specialty: "On-page SEO, keyword strategy, content planning", status: "available", email: "seo@legalleadsgroup.com" },
  { role: "Web Dev", name: "Your Developer", color: "#3498DB", sort_order: 2, specialty: "Site speed, Core Web Vitals, technical SEO", status: "available", email: "dev@legalleadsgroup.com" },
  { role: "Paid Ads", name: "Your Ads Manager", color: "#C4A450", sort_order: 3, specialty: "Google Ads, PPC campaigns, conversion tracking", status: "available", email: "ads@legalleadsgroup.com" },
];

const DEMO_UPDATES = [
  { type: "Recent", text: "Blog post added", color: "#5B2D8E", created_at: new Date(Date.now() - 7200000).toISOString() },
  { type: "Recent", text: "YouTube Video added", color: "#C4A450", created_at: new Date(Date.now() - 7200000).toISOString() },
];

const DEMO_INTEGRATIONS = [
  { name: "Google Analytics", action_label: "View Dashboard", icon: "GA", color: "#E37400", sort_order: 1 },
  { name: "Keyword Tool", action_label: "Analyze Keywords", icon: "KT", color: "#C4A450", sort_order: 2 },
  { name: "NAP+W Scores", action_label: "View Scores", icon: "NW", color: "#5B2D8E", sort_order: 3 },
];

const DEMO_DELIVERABLES = [
  { id: "d1", seo_progress_id: "1", title: "Personal Injury Landing Page", language: "EN", status: "complete", url: "https://example.com/personal-injury", completed_at: new Date(Date.now() - 12*86400000).toISOString(), sort_order: 1 },
  { id: "d2", seo_progress_id: "1", title: "Car Accident Attorney Page", language: "EN", status: "complete", url: "https://example.com/car-accident", completed_at: new Date(Date.now() - 8*86400000).toISOString(), sort_order: 2 },
  { id: "d3", seo_progress_id: "1", title: "Abogado de Lesiones Personales", language: "ES", status: "in_progress", url: null, completed_at: null, sort_order: 3 },
  { id: "d4", seo_progress_id: "2", title: "What To Do After a Car Accident", language: "EN", status: "complete", url: "https://youtube.com/watch?v=abc123", completed_at: new Date(Date.now() - 14*86400000).toISOString(), sort_order: 1 },
  { id: "d5", seo_progress_id: "5", title: "Firm Launch Press Release", language: "EN", status: "pending", completed_at: null, sort_order: 1 },
];

// ─── Data Hooks ────────────────────────────────────────────────────────────

/**
 * Fetch the current client's profile.
 * Looks up the clients table by matching the logged-in user's auth ID.
 * If the user is a team member (not a client), returns demo data.
 */
export function useClient() {
  const [data, setData] = useState(DEMO_CLIENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClient() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setData(DEMO_CLIENT);
          setLoading(false);
          return;
        }

        // Try to find a client record linked to this auth user
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("*")
          .eq("user_id", user.id)
          .limit(1)
          .single();

        if (clientError || !clientData) {
          // User might be a team member viewing demo, or client not set up yet
          // Enrich demo data with real email
          setData({ ...DEMO_CLIENT, email: user.email });
        } else {
          // Found real client — also fetch their project for package info
          const { data: projectData } = await supabase
            .from("projects")
            .select("*, packages(name, monthly_price)")
            .eq("client_id", clientData.id)
            .limit(1)
            .single();

          setData({
            ...clientData,
            package_name: projectData?.packages?.name || "Saturn Package",
            package_price: projectData?.packages?.monthly_price
              ? `$${Number(projectData.packages.monthly_price).toLocaleString()}/mo`
              : "—",
          });
        }
      } catch (err) {
        console.warn("Client fetch error:", err?.message || err);
        setData(DEMO_CLIENT);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, []);

  return { data, loading, error };
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

/** Fetch team members assigned to this client */
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

/** Fetch recent updates for this client */
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

/** Fetch connected integrations for this client */
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