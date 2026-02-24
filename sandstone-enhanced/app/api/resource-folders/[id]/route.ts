import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/resource-folders/[id] - Get a single folder
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("resource_folders")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
      console.error("Error fetching folder:", error);
      return NextResponse.json({ error: "Failed to fetch folder" }, { status: 500 });
    }

    return NextResponse.json({ folder: data });
  } catch (error) {
    console.error("Error in GET /api/resource-folders/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/resource-folders/[id] - Update a folder
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify folder belongs to user
    const { error: fetchError } = await supabase
      .from("resource_folders")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
      console.error("Error fetching folder:", fetchError);
      return NextResponse.json({ error: "Failed to fetch folder" }, { status: 500 });
    }

    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.parentId !== undefined) updateData.parent_id = body.parentId;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.icon !== undefined) updateData.icon = body.icon;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("resource_folders")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating folder:", error);
      return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
    }

    return NextResponse.json({ folder: data });
  } catch (error) {
    console.error("Error in PATCH /api/resource-folders/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/resource-folders/[id] - Delete a folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if folder has resources
    const { data: folder, error: fetchError } = await supabase
      .from("resource_folders")
      .select("resource_count")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
      console.error("Error fetching folder:", fetchError);
      return NextResponse.json({ error: "Failed to fetch folder" }, { status: 500 });
    }

    if (folder.resource_count > 0) {
      return NextResponse.json({
        error: "Folder contains resources",
        message: "Please move or delete all resources in this folder first",
      }, { status: 400 });
    }

    // Check if folder has child folders
    const { data: childFolders, error: childError } = await supabase
      .from("resource_folders")
      .select("id")
      .eq("parent_id", params.id)
      .eq("user_id", user.id);

    if (childError) {
      console.error("Error checking child folders:", childError);
      return NextResponse.json({ error: "Failed to check child folders" }, { status: 500 });
    }

    if (childFolders && childFolders.length > 0) {
      return NextResponse.json({
        error: "Folder has subfolders",
        message: "Please delete or move all subfolders first",
      }, { status: 400 });
    }

    const { error } = await supabase
      .from("resource_folders")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting folder:", error);
      return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/resource-folders/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
