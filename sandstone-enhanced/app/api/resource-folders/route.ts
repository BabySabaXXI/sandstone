import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/resource-folders - List all folders
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    let query = supabase
      .from("resource_folders")
      .select("*")
      .eq("user_id", user.id);

    if (parentId !== null) {
      query = parentId === "null"
        ? query.is("parent_id", null)
        : query.eq("parent_id", parentId);
    }

    const { data, error } = await query.order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching folders:", error);
      return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
    }

    return NextResponse.json({ folders: data });
  } catch (error) {
    console.error("Error in GET /api/resource-folders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/resource-folders - Create a new folder
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const folderData = {
      user_id: user.id,
      name: body.name,
      description: body.description || null,
      subject: body.subject || "economics",
      parent_id: body.parentId || null,
      color: body.color || "#E8D5C4",
      icon: body.icon || "folder",
      resource_count: 0,
    };

    const { data, error } = await supabase
      .from("resource_folders")
      .insert(folderData)
      .select()
      .single();

    if (error) {
      console.error("Error creating folder:", error);
      return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
    }

    return NextResponse.json({ folder: data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/resource-folders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/resource-folders - Bulk update folders
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, updates } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Folder IDs are required" }, { status: 400 });
    }

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("resource_folders")
      .update(updateData)
      .in("id", ids)
      .eq("user_id", user.id)
      .select();

    if (error) {
      console.error("Error updating folders:", error);
      return NextResponse.json({ error: "Failed to update folders" }, { status: 500 });
    }

    return NextResponse.json({ folders: data });
  } catch (error) {
    console.error("Error in PATCH /api/resource-folders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/resource-folders - Bulk delete folders
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ error: "Folder IDs are required" }, { status: 400 });
    }

    const ids = idsParam.split(",");

    // Check if folders have resources
    const { data: foldersWithResources, error: countError } = await supabase
      .from("resource_folders")
      .select("id, resource_count")
      .in("id", ids)
      .eq("user_id", user.id);

    if (countError) {
      console.error("Error checking folder resources:", countError);
      return NextResponse.json({ error: "Failed to check folder resources" }, { status: 500 });
    }

    const nonEmptyFolders = foldersWithResources?.filter(f => f.resource_count > 0) || [];

    if (nonEmptyFolders.length > 0) {
      return NextResponse.json({
        error: "Some folders contain resources",
        nonEmptyFolders: nonEmptyFolders.map(f => f.id),
      }, { status: 400 });
    }

    const { error } = await supabase
      .from("resource_folders")
      .delete()
      .in("id", ids)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting folders:", error);
      return NextResponse.json({ error: "Failed to delete folders" }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error("Error in DELETE /api/resource-folders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
