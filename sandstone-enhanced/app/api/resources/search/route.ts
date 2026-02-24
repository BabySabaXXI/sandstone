import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/resources/search - Search resources
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // Use the database search function
    const { data, error } = await supabase.rpc("search_resources", {
      p_user_id: user.id,
      p_query: query,
      p_limit: limit,
    });

    if (error) {
      console.error("Error searching resources:", error);
      return NextResponse.json({ error: "Failed to search resources" }, { status: 500 });
    }

    return NextResponse.json({ results: data });
  } catch (error) {
    console.error("Error in GET /api/resources/search:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/resources/search - Advanced search with filters
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      query,
      types,
      categories,
      subjects,
      difficulties,
      tags,
      status = ["active"],
      folderId,
      isFavorite,
      dateFrom,
      dateTo,
      sortBy = "relevance",
      limit = 20,
      offset = 0,
    } = body;

    // Build the query
    let dbQuery = supabase
      .from("resources")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // Apply text search if provided
    if (query) {
      const searchQuery = query
        .split(" ")
        .filter((term: string) => term.length > 0)
        .map((term: string) => `${term}:*`)
        .join(" & ");
      
      dbQuery = dbQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`
      );
    }

    // Apply filters
    if (types?.length > 0) {
      dbQuery = dbQuery.in("type", types);
    }

    if (categories?.length > 0) {
      dbQuery = dbQuery.in("category", categories);
    }

    if (subjects?.length > 0) {
      dbQuery = dbQuery.in("subject", subjects);
    }

    if (difficulties?.length > 0) {
      dbQuery = dbQuery.in("difficulty", difficulties);
    }

    if (status?.length > 0) {
      dbQuery = dbQuery.in("status", status);
    }

    if (tags?.length > 0) {
      dbQuery = dbQuery.contains("tags", tags);
    }

    if (folderId !== undefined) {
      if (folderId === null) {
        dbQuery = dbQuery.is("folder_id", null);
      } else {
        dbQuery = dbQuery.eq("folder_id", folderId);
      }
    }

    if (isFavorite !== undefined) {
      dbQuery = dbQuery.eq("is_favorite", isFavorite);
    }

    if (dateFrom) {
      dbQuery = dbQuery.gte("created_at", dateFrom);
    }

    if (dateTo) {
      dbQuery = dbQuery.lte("created_at", dateTo);
    }

    // Apply sorting
    switch (sortBy) {
      case "oldest":
        dbQuery = dbQuery.order("created_at", { ascending: true });
        break;
      case "name":
        dbQuery = dbQuery.order("title", { ascending: true });
        break;
      case "popular":
        dbQuery = dbQuery.order("view_count", { ascending: false });
        break;
      case "recently_viewed":
        dbQuery = dbQuery.order("last_accessed_at", { ascending: false });
        break;
      case "newest":
      default:
        dbQuery = dbQuery.order("created_at", { ascending: false });
        break;
    }

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error("Error in advanced search:", error);
      return NextResponse.json({ error: "Failed to search resources" }, { status: 500 });
    }

    return NextResponse.json({
      resources: data,
      total: count,
      offset,
      limit,
    });
  } catch (error) {
    console.error("Error in POST /api/resources/search:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
