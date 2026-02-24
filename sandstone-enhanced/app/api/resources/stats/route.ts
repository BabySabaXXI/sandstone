import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/resources/stats - Get resource statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get overall stats
    const { data: stats, error: statsError } = await supabase.rpc("get_resource_stats", {
      p_user_id: user.id,
    });

    if (statsError) {
      console.error("Error getting resource stats:", statsError);
      return NextResponse.json({ error: "Failed to get resource stats" }, { status: 500 });
    }

    // Get resources by type
    const { data: byType, error: typeError } = await supabase.rpc("get_resources_by_type", {
      p_user_id: user.id,
    });

    if (typeError) {
      console.error("Error getting resources by type:", typeError);
    }

    // Get resources by category
    const { data: byCategory, error: categoryError } = await supabase.rpc("get_resources_by_category", {
      p_user_id: user.id,
    });

    if (categoryError) {
      console.error("Error getting resources by category:", categoryError);
    }

    // Get recent activity
    const { data: recentActivity, error: activityError } = await supabase
      .from("resources")
      .select("id, title, type, view_count, download_count, updated_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (activityError) {
      console.error("Error getting recent activity:", activityError);
    }

    // Get most viewed resources
    const { data: mostViewed, error: viewedError } = await supabase
      .from("resources")
      .select("id, title, type, view_count")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("view_count", { ascending: false })
      .limit(5);

    if (viewedError) {
      console.error("Error getting most viewed resources:", viewedError);
    }

    return NextResponse.json({
      overall: stats?.[0] || {
        total_resources: 0,
        total_views: 0,
        total_downloads: 0,
        favorite_count: 0,
      },
      byType: byType || [],
      byCategory: byCategory || [],
      recentActivity: recentActivity || [],
      mostViewed: mostViewed || [],
    });
  } catch (error) {
    console.error("Error in GET /api/resources/stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
