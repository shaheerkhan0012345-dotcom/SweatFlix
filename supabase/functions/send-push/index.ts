// =============================================================================
// SWEATFLIX EDGE FUNCTION: send-push
// =============================================================================
// Triggered by a Supabase Database Webhook on INSERT into public.notifications.
// - Looks up the recipient's active push tokens and notification preferences.
// - Formats a rich, athletic push notification message.
// - Dispatches to the Expo Push API (https://exp.host/--/api/v2/push/send).
// - Deletes unregistered tokens reported by Expo (DeviceNotRegistered).
// - Privileged service role key stays strictly within this server environment.
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRecord {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  ref_id: string | null;
  data: Record<string, any>;
  created_at: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const body = await req.json();
    const record: NotificationRecord = body?.record || body;

    if (!record || !record.user_id || !record.type) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook payload: missing record, user_id or type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Check user notification settings
    const { data: settings } = await supabaseAdmin
      .from("notification_settings")
      .select("friend_requests, challenges, likes")
      .eq("user_id", record.user_id)
      .maybeSingle();

    if (settings) {
      if (
        (record.type === "friend_request" || record.type === "friend_accepted") &&
        settings.friend_requests === false
      ) {
        return new Response(
          JSON.stringify({ message: "Skipped: friend notifications disabled by user" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (
        (record.type === "challenge_invite" ||
          record.type === "challenge_accepted" ||
          record.type === "challenge_entry" ||
          record.type === "challenge_result") &&
        settings.challenges === false
      ) {
        return new Response(
          JSON.stringify({ message: "Skipped: challenge notifications disabled by user" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (record.type === "post_like" && settings.likes === false) {
        return new Response(
          JSON.stringify({ message: "Skipped: like notifications disabled by user" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 2. Fetch recipient's push tokens
    const { data: tokenRows, error: tokenError } = await supabaseAdmin
      .from("push_tokens")
      .select("token")
      .eq("user_id", record.user_id);

    if (tokenError) {
      throw new Error(`Failed to fetch push tokens: ${tokenError.message}`);
    }

    if (!tokenRows || tokenRows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No registered push tokens for recipient" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Format title & body based on notification type
    const actorName = record.data?.actor_name || "An athlete";
    const exerciseName = record.data?.exercise_name || "workout";
    const amount = record.data?.amount || "";
    let title = "SweatFlix";
    let messageBody = "You have a new update";

    switch (record.type) {
      case "friend_request":
        title = "Friend Request 👋";
        messageBody = `${actorName} sent you a friend request.`;
        break;

      case "friend_accepted":
        title = "Friend Request Accepted 🤝";
        messageBody = `${actorName} accepted your friend request!`;
        break;

      case "challenge_invite":
        title = "New 1v1 Challenge! 🔥";
        messageBody = `${actorName} challenged you to ${record.data?.target || ''} ${record.data?.metric || ''} in ${exerciseName}!`;
        break;

      case "challenge_accepted":
        title = "Challenge Accepted! ⚔️";
        messageBody = `${actorName} accepted your challenge in ${exerciseName}! Get ready!`;
        break;

      case "challenge_entry":
        title = "Challenge Progress ⚡";
        messageBody = `${actorName} logged ${amount} in ${exerciseName}! Keep up!`;
        break;

      case "challenge_result":
        title = "Challenge Completed! 🏁";
        if (record.data?.is_winner) {
          messageBody = `🏆 You won the ${exerciseName} challenge! Great job!`;
        } else if (record.data?.is_draw) {
          messageBody = `🤝 It's a draw in the ${exerciseName} challenge!`;
        } else {
          messageBody = `The ${exerciseName} challenge has finished! Tap to view results.`;
        }
        break;

      case "post_like":
        title = "SweatFlix ❤️";
        messageBody = `${actorName} liked your workout post.`;
        break;

      default:
        messageBody = `${actorName} sent you a notification.`;
        break;
    }

    // 4. Construct Expo push payload
    const messages = tokenRows.map((row) => ({
      to: row.token,
      sound: "default",
      title,
      body: messageBody,
      data: {
        type: record.type,
        ref_id: record.ref_id,
        notification_id: record.id,
        ...(record.data || {}),
      },
      channelId: "sweatflix_notifications",
      color: "#E5252A",
      priority: "high",
    }));

    // 5. Send through Expo Push API
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const expoResult = await expoResponse.json();

    // 6. Handle unregistered or invalid tokens
    const tickets = expoResult?.data || [];
    const tokensToDelete: string[] = [];

    tickets.forEach((ticket: any, index: number) => {
      if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
        tokensToDelete.push(tokenRows[index].token);
      }
    });

    if (tokensToDelete.length > 0) {
      await supabaseAdmin
        .from("push_tokens")
        .delete()
        .in("token", tokensToDelete);
      console.log(`Cleaned up ${tokensToDelete.length} unregistered tokens.`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentCount: messages.length,
        cleanedCount: tokensToDelete.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("send-push Edge Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
