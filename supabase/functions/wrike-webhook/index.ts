// ─── Wrike Webhook Edge Function ───────────────────────────────────────────
// Receives webhooks from Wrike when new projects/tasks are created.
// Auto-provisions a client account in the portal.
//
// Deploy: supabase functions deploy wrike-webhook
// Set secrets: supabase secrets set WRIKE_WEBHOOK_SECRET=your_secret
// ────────────────────────────────────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const webhookSecret = Deno.env.get("WRIKE_WEBHOOK_SECRET");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default SEO deliverables template for new clients
const DEFAULT_SEO_PROGRESS = [
  { label: "SEO Pages Done", done: 0, total: 6, sort_order: 1 },
  { label: "YouTube Videos", done: 0, total: 4, sort_order: 2 },
  { label: "FAQ VOICE Search", done: 0, total: 4, sort_order: 3 },
  { label: "AI Search", done: 0, total: 3, sort_order: 4 },
  { label: "Press Release", done: 0, total: 1, sort_order: 5 },
];

const DEFAULT_LIGHTHOUSE = [
  { label: "Performance", score: 0, color: "#5B2D8E", sort_order: 1 },
  { label: "Accessibility", score: 0, color: "#3DAA6D", sort_order: 2 },
  { label: "Best Practices", score: 0, color: "#C4A450", sort_order: 3 },
  { label: "SEO", score: 0, color: "#3DAA6D", sort_order: 4 },
];

const DEFAULT_INTEGRATIONS = [
  { name: "Google Analytics", action_label: "View Dashboard", icon: "GA", color: "#E37400", sort_order: 1 },
  { name: "Keyword Tool", action_label: "Analyze Keywords", icon: "KT", color: "#C4A450", sort_order: 2 },
  { name: "NAP+W Scores", action_label: "View Scores", icon: "NW", color: "#5B2D8E", sort_order: 3 },
];

Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Optional: verify webhook secret via header
  const secret = req.headers.get("x-webhook-secret");
  if (webhookSecret && secret !== webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Log the webhook
  await supabase.from("webhook_logs").insert({
    source: "wrike",
    event_type: payload.event_type || "unknown",
    payload,
    status: "received",
  });

  try {
    // ── Handle "client_created" event ──
    // Expected payload shape (customize to match your Wrike webhook):
    // {
    //   event_type: "client_created",
    //   firm_name: "Smith & Associates",
    //   contact_name: "John Smith",
    //   email: "john@smithlaw.com",
    //   package_name: "Saturn - Rhea Package",
    //   package_price: "$5999/mo",
    //   team: [{ role: "SEO Manager", name: "Nick Offerman" }, ...]
    // }

    if (payload.event_type === "client_created") {
      const { firm_name, contact_name, email, package_name, package_price, team } = payload;

      if (!firm_name || !contact_name || !email) {
        throw new Error("Missing required fields: firm_name, contact_name, email");
      }

      // 1. Create client (auth_user_id is null until client signs in via magic link)
      const { data: client, error: clientErr } = await supabase
        .from("clients")
        .insert({
          firm_name,
          contact_name,
          email,
          package_name: package_name || "Saturn - Rhea Package",
          package_price: package_price || "$5999/mo",
        })
        .select()
        .single();

      if (clientErr) throw clientErr;
      const clientId = client.id;

      // 2. Create SEO progress items
      await supabase.from("seo_progress").insert(
        DEFAULT_SEO_PROGRESS.map((p) => ({ ...p, client_id: clientId }))
      );

      // 3. Create lighthouse scores
      await supabase.from("lighthouse_scores").insert(
        DEFAULT_LIGHTHOUSE.map((l) => ({ ...l, client_id: clientId }))
      );

      // 4. Create integrations
      await supabase.from("integrations").insert(
        DEFAULT_INTEGRATIONS.map((i) => ({ ...i, client_id: clientId }))
      );

      // 5. Create team members (from payload or defaults)
      const teamMembers = team || [
        { role: "SEO Manager", name: "Nick Offerman", color: "#5B2D8E" },
        { role: "Web Dev", name: "Sheldon Cooper", color: "#3498DB" },
      ];
      await supabase.from("team_members").insert(
        teamMembers.map((m, i) => ({
          client_id: clientId,
          role: m.role,
          name: m.name,
          color: m.color || "#5B2D8E",
          sort_order: i + 1,
        }))
      );

      // 6. Create welcome update
      await supabase.from("updates").insert({
        client_id: clientId,
        type: "Recent",
        text: "Account created — welcome to your portal!",
        color: "#3DAA6D",
      });

      // 7. Update webhook log to processed
      await supabase
        .from("webhook_logs")
        .update({ status: "processed", client_id: clientId })
        .eq("payload->>email", email)
        .eq("source", "wrike");

      return new Response(
        JSON.stringify({ success: true, client_id: clientId }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ── Handle task_completed (update SEO progress) ──
    if (payload.event_type === "task_completed") {
      // Implement based on your Wrike task structure
      return new Response(JSON.stringify({ success: true, message: "task_completed handler pending" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Event received but no handler" }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    // Log error
    await supabase
      .from("webhook_logs")
      .update({ status: "failed", error_message: err.message })
      .eq("source", "wrike")
      .eq("status", "received");

    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
