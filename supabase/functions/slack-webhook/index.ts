// ─── Slack Webhook Edge Function ───────────────────────────────────────────
// Receives Slack event payloads (e.g., message posted in a client channel).
// Maps channel → client and creates an update in the portal feed.
//
// Deploy: supabase functions deploy slack-webhook
// Set secrets: supabase secrets set SLACK_SIGNING_SECRET=your_secret
//
// Slack App setup:
// 1. Create app at api.slack.com/apps
// 2. Enable Event Subscriptions → Request URL: your edge function URL
// 3. Subscribe to bot events: message.channels
// 4. Install to workspace
// ────────────────────────────────────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const slackSigningSecret = Deno.env.get("SLACK_SIGNING_SECRET");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── Verify Slack signature ────────────────────────────────────────────────
function verifySlackSignature(body, timestamp, signature) {
  if (!slackSigningSecret) return true; // skip if not configured

  const sigBaseString = `v0:${timestamp}:${body}`;
  const hmac = createHmac("sha256", slackSigningSecret);
  hmac.update(sigBaseString);
  const mySignature = `v0=${hmac.digest("hex")}`;

  return mySignature === signature;
}

// ─── Map update types to colors ────────────────────────────────────────────
function getUpdateColor(text) {
  const lower = text.toLowerCase();
  if (lower.includes("blog") || lower.includes("article")) return "#5B2D8E";
  if (lower.includes("youtube") || lower.includes("video")) return "#C4A450";
  if (lower.includes("social") || lower.includes("facebook") || lower.includes("post")) return "#3DAA6D";
  if (lower.includes("faq") || lower.includes("search")) return "#95A5A6";
  if (lower.includes("page") || lower.includes("seo")) return "#5B2D8E";
  if (lower.includes("press") || lower.includes("release")) return "#E67E22";
  return "#5B2D8E";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  let payload;

  try {
    payload = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // ── Slack URL verification challenge ──
  if (payload.type === "url_verification") {
    return new Response(
      JSON.stringify({ challenge: payload.challenge }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  }

  // ── Verify signature ──
  const timestamp = req.headers.get("x-slack-request-timestamp");
  const slackSignature = req.headers.get("x-slack-signature");

  if (slackSigningSecret && !verifySlackSignature(body, timestamp, slackSignature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  // ── Log the webhook ──
  await supabase.from("webhook_logs").insert({
    source: "slack",
    event_type: payload.event?.type || payload.type || "unknown",
    payload,
    status: "received",
  });

  try {
    // ── Handle message events ──
    if (payload.type === "event_callback" && payload.event?.type === "message") {
      const event = payload.event;

      // Skip bot messages and edits
      if (event.subtype === "bot_message" || event.subtype === "message_changed") {
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      const channelId = event.channel;
      const text = event.text || "";

      // ── Look up channel → client mapping ──
      // Method 1: Check slack_config for channel_mapping
      // Method 2: Channel name matches client firm (convention-based)
      const { data: slackCfg } = await supabase
        .from("slack_config")
        .select("channel_mapping")
        .eq("is_active", true)
        .limit(1)
        .single();

      let clientId = null;

      if (slackCfg?.channel_mapping) {
        // channel_mapping format: { "C1234ABCD": "client-uuid", ... }
        clientId = slackCfg.channel_mapping[channelId] || null;
      }

      if (!clientId) {
        // Fallback: try to extract client identifier from message
        // Convention: messages tagged with [ClientName] or sent to #firm-name channel
        // For now, skip if we can't map
        await supabase
          .from("webhook_logs")
          .update({ status: "failed", error_message: `No client mapping for channel ${channelId}` })
          .eq("source", "slack")
          .eq("status", "received");

        return new Response(
          JSON.stringify({ ok: true, message: "No client mapping found" }),
          { status: 200 }
        );
      }

      // ── Create update in portal ──
      const updateText = text.length > 120 ? text.slice(0, 117) + "..." : text;

      await supabase.from("updates").insert({
        client_id: clientId,
        type: "Recent",
        text: updateText,
        color: getUpdateColor(text),
      });

      // Mark webhook as processed
      await supabase
        .from("webhook_logs")
        .update({ status: "processed", client_id: clientId })
        .eq("source", "slack")
        .eq("status", "received");

      return new Response(
        JSON.stringify({ ok: true, client_id: clientId }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: "Event type not handled" }),
      { status: 200 }
    );
  } catch (err) {
    await supabase
      .from("webhook_logs")
      .update({ status: "failed", error_message: err.message })
      .eq("source", "slack")
      .eq("status", "received");

    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
