// ─── supabaseClient.js ─────────────────────────────────────────────────────
// Official Supabase client for the Legal Leads Group portal.
// Uses @supabase/supabase-js for proper auth + RLS support.
// ────────────────────────────────────────────────────────────────────────────
 
import { createClient } from "@supabase/supabase-js";
 
const SUPABASE_URL =
  import.meta.env?.VITE_SUPABASE_URL ||
  "https://eifrudtwwojllvwzzryo.supabase.co";
 
const SUPABASE_ANON_KEY =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZnJ1ZHR3d29qbGx2d3p6cnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODM2OTMsImV4cCI6MjA4ODY1OTY5M30.pf429A2VpgZBlMPz2midncjPf_cdGWGUfQXekIASv9I";
 
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
 