// ─── supabaseClient.js ─────────────────────────────────────────────────────
// Central Supabase client for the Legal Leads Group portal.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file,
// or edit the fallback values below.
// ────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  "https://eifrudtwwojllvwzzryo.supabase.co";

const SUPABASE_ANON_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZnJ1ZHR3d29qbGx2d3p6cnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODM2OTMsImV4cCI6MjA4ODY1OTY5M30.pf429A2VpgZBlMPz2midncjPf_cdGWGUfQXekIASv9I";

// ─── Lightweight Supabase-like client (no npm dependency needed) ───────────
// Covers: auth (magic link, session), and DB queries (select, insert, update).
// For a production app you can swap this out for the official @supabase/supabase-js SDK.

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.accessToken = null;
    this.user = null;
    this._refreshTimer = null;
    this._restoreSession();
  }

  // ── Internal helpers ────────────────────────────────────────────────────

  _headers(withAuth = true) {
    const h = {
      apikey: this.key,
      "Content-Type": "application/json",
    };
    if (withAuth && this.accessToken) {
      h["Authorization"] = `Bearer ${this.accessToken}`;
    }
    return h;
  }

  _storeSession(session) {
    if (!session) return;
    this.accessToken = session.access_token;
    this.user = session.user;
    try {
      sessionStorage.setItem(
        "llg_session",
        JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          user: session.user,
        })
      );
    } catch {}
  }

  _restoreSession() {
    try {
      const raw = sessionStorage.getItem("llg_session");
      if (!raw) return;
      const session = JSON.parse(raw);
      if (session.expires_at && Date.now() / 1000 > session.expires_at) {
        sessionStorage.removeItem("llg_session");
        return;
      }
      this.accessToken = session.access_token;
      this.user = session.user;
    } catch {}
  }

  _clearSession() {
    this.accessToken = null;
    this.user = null;
    try { sessionStorage.removeItem("llg_session"); } catch {}
  }

  // ── Auth ─────────────────────────────────────────────────────────────────

  auth = {
    /** Send a magic link to the given email */
    signInWithOtp: async ({ email }) => {
      const res = await fetch(`${this.url}/auth/v1/magiclink`, {
        method: "POST",
        headers: this._headers(false),
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || "Failed to send magic link");
      }
      return { error: null };
    },

    /** Exchange the token hash from the magic link callback URL for a session */
    exchangeCodeForSession: async (tokenHash) => {
      const res = await fetch(`${this.url}/auth/v1/verify`, {
        method: "POST",
        headers: this._headers(false),
        body: JSON.stringify({ token_hash: tokenHash, type: "magiclink" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { data: null, error: err };
      }
      const data = await res.json();
      this._storeSession(data);
      return { data, error: null };
    },

    /** Get the current session if one exists */
    getSession: () => {
      if (!this.accessToken) return { data: { session: null } };
      return {
        data: {
          session: { access_token: this.accessToken, user: this.user },
        },
      };
    },

    /** Get the current user */
    getUser: () => {
      return { data: { user: this.user } };
    },

    /** Sign out and clear session */
    signOut: async () => {
      try {
        await fetch(`${this.url}/auth/v1/logout`, {
          method: "POST",
          headers: this._headers(),
        });
      } catch {}
      this._clearSession();
      return { error: null };
    },
  };

  // ── Database (PostgREST) ────────────────────────────────────────────────

  from(table) {
    return new QueryBuilder(this, table);
  }
}

class QueryBuilder {
  constructor(client, table) {
    this.client = client;
    this.table = table;
    this._filters = [];
    this._select = "*";
    this._order = null;
    this._limit = null;
    this._single = false;
  }

  select(columns = "*") {
    this._select = columns;
    return this;
  }

  eq(column, value) {
    this._filters.push(`${column}=eq.${value}`);
    return this;
  }

  neq(column, value) {
    this._filters.push(`${column}=neq.${value}`);
    return this;
  }

  in(column, values) {
    this._filters.push(`${column}=in.(${values.join(",")})`);
    return this;
  }

  order(column, { ascending = true } = {}) {
    this._order = `${column}.${ascending ? "asc" : "desc"}`;
    return this;
  }

  limit(count) {
    this._limit = count;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

  async _execute(method = "GET", body = null) {
    const params = new URLSearchParams();
    params.set("select", this._select);
    this._filters.forEach((f) => {
      const [key, val] = f.split("=");
      params.append(key, val.replace(/^eq\./, "eq."));
    });
    if (this._order) params.set("order", this._order);
    if (this._limit) params.set("limit", this._limit);

    const url = `${this.client.url}/rest/v1/${this.table}?${params.toString()}`;
    const headers = this.client._headers();

    if (this._single) headers["Accept"] = "application/vnd.pgrst.object+json";
    if (method === "GET") headers["Accept"] = headers["Accept"] || "application/json";

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(url, opts);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { data: null, error: err };
      }
      const data = await res.json();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }

  /** Execute a SELECT query */
  then(resolve, reject) {
    return this._execute("GET").then(resolve, reject);
  }

  /** Insert one or more rows */
  async insert(rows) {
    const url = `${this.client.url}/rest/v1/${this.table}`;
    const headers = this.client._headers();
    headers["Prefer"] = "return=representation";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(rows),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { data: null, error: err };
      }
      const data = await res.json();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }

  /** Update matching rows */
  async update(values) {
    const params = new URLSearchParams();
    this._filters.forEach((f) => {
      const [key, ...rest] = f.split("=");
      params.append(key, rest.join("="));
    });

    const url = `${this.client.url}/rest/v1/${this.table}?${params.toString()}`;
    const headers = this.client._headers();
    headers["Prefer"] = "return=representation";

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { data: null, error: err };
      }
      const data = await res.json();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }
}

// ─── Export singleton ──────────────────────────────────────────────────────
export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
