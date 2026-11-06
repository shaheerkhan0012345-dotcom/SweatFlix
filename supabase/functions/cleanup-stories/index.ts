// =============================================================================
// SWEATFLIX EDGE FUNCTION: cleanup-stories
// =============================================================================
// Runs on a scheduled hourly cron to delete expired stories (older than 24h)
// and their associated media files from the private 'stories' storage bucket.
//
// Uses the service_role key ONLY inside the function's own secure server
// environment, never in the mobile client.
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    }

    // Initialize privileged admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const nowIso = new Date().toISOString();

    // 1. Fetch expired stories
    const { data: expiredStories, error: fetchError } = await supabaseAdmin
      .from("stories")
      .select("id, media_path")
      .lte("expires_at", nowIso);

    if (fetchError) {
      throw new Error(`Failed to query expired stories: ${fetchError.message}`);
    }

    if (!expiredStories || expiredStories.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No expired stories found to clean up.",
          cleanedCount: 0,
          timestamp: nowIso,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // 2. Remove files from storage
    const mediaPaths = expiredStories
      .map((s: { media_path: string }) => s.media_path)
      .filter((p: string): p is string => Boolean(p && p.trim().length > 0));

    let removedFilesCount = 0;
    if (mediaPaths.length > 0) {
      const { data: removeData, error: storageError } = await supabaseAdmin.storage
        .from("stories")
        .remove(mediaPaths);

      if (storageError) {
        console.warn("Storage files cleanup warning:", storageError.message);
      } else if (removeData) {
        removedFilesCount = removeData.length;
      }
    }

    // 3. Delete expired rows from database (cascades to story_views and story_reports)
    const storyIds = expiredStories.map((s: { id: string }) => s.id);
    const { error: deleteError } = await supabaseAdmin
      .from("stories")
      .delete()
      .in("id", storyIds);

    if (deleteError) {
      throw new Error(`Failed to delete expired story rows: ${deleteError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully cleaned up ${storyIds.length} expired stories and ${removedFilesCount} files.`,
        storiesRemoved: storyIds.length,
        filesRemoved: removedFilesCount,
        timestamp: nowIso,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error("Cleanup-stories error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || "Unknown error occurred during story cleanup",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
