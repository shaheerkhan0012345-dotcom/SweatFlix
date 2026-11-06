// =============================================================================
// SWEATFLIX EDGE FUNCTION: process-weekly-leagues
// =============================================================================
// Runs on a scheduled weekly cron (every Monday at 00:05 UTC) to:
// 1. Process rankings for every 30-player group of the finished week.
// 2. Promote top 5 players to the next division (unless Diamond).
// 3. Demote bottom 5 active players to the lower division (unless Bronze).
// 4. Award 1st place champion: 7 Days of Free Premium + Weekly Champion Crown 👑.
// 5. Generate league_results records so users see the Result Popup on launch.
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Optional override for testing specific weeks
    let targetWeekStart: string | null = null;
    try {
      const body = await req.json();
      if (body && body.week_start) {
        targetWeekStart = body.week_start;
      }
    } catch {
      // No JSON body provided, default to previous Monday
    }

    // Call the database ranking engine
    const { data, error } = await supabaseAdmin.rpc("execute_weekly_league_reset", {
      p_target_week_start: targetWeekStart,
    });

    if (error) {
      console.error("execute_weekly_league_reset error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Weekly league reset completed successfully:", data);

    return new Response(
      JSON.stringify({
        success: true,
        summary: data,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("process-weekly-leagues unhandled error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
