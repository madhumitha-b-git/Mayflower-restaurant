// Supabase Edge Function: process-email-outbox
// Processes pending records from public.email_outbox via official Google Gmail API (OAuth 2.0)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const GMAIL_CLIENT_ID = Deno.env.get("Gmail_api_client_id") || Deno.env.get("GMAIL_API_CLIENT_ID") || "";
const GMAIL_CLIENT_SECRET = Deno.env.get("Gmail_api_client_secret") || Deno.env.get("GMAIL_API_CLIENT_SECRET") || "";
const GMAIL_REFRESH_TOKEN = Deno.env.get("GMAIL_REFRESH_TOKEN") || Deno.env.get("Gmail_refresh_token") || "";
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "The Mayflower <me>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function encodeBase64Url(str: string): string {
  return encodeBase64(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function createMimeMessage(from: string, to: string, subject: string, html: string): string {
  const subjectEncoded = encodeBase64(subject);
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?utf-8?B?${subjectEncoded}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
  ];
  return `${headers.join("\r\n")}\r\n\r\n${html}`;
}

async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || `OAuth token refresh failed (${res.status})`);
  }
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    return new Response(JSON.stringify({ error: "Missing Gmail API OAuth credentials in environment variables" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const accessToken = await getAccessToken(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN);

    // 1. Fetch pending emails from outbox
    const { data: outboxItems, error: fetchErr } = await supabase
      .from("email_outbox")
      .select("*")
      .eq("status", "pending")
      .lt("attempt_count", 3)
      .order("created_at", { ascending: true })
      .limit(10);

    if (fetchErr) throw fetchErr;
    if (!outboxItems || outboxItems.length === 0) {
      return new Response(JSON.stringify({ message: "No pending emails to dispatch", processed: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const item of outboxItems) {
      // Build HTML
      const htmlContent = item.payload?.html || `<p>${item.subject}</p>`;
      const mime = createMimeMessage(EMAIL_FROM, item.recipient_email, item.subject, htmlContent);
      const rawBase64Url = encodeBase64Url(mime);

      // Call official Gmail API
      const gmailResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw: rawBase64Url,
        }),
      });

      const resData = await gmailResponse.json();

      if (gmailResponse.ok) {
        await supabase
          .from("email_outbox")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_message_id: resData.id,
            attempt_count: item.attempt_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        results.push({ id: item.id, status: "sent", providerId: resData.id });
      } else {
        const nextStatus = item.attempt_count + 1 >= 3 ? "failed" : "pending";
        const errMsg = resData?.error?.message || "Delivery failed";
        await supabase
          .from("email_outbox")
          .update({
            status: nextStatus,
            last_error: errMsg,
            attempt_count: item.attempt_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id);

        results.push({ id: item.id, status: nextStatus, error: errMsg });
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
