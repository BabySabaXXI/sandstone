import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/resources/[id] - Get a single resource
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
      .from("resources")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Resource not found" }, { status: 404 });
      }
      console.error("Error fetching resource:", error);
      return NextResponse.json({ error: "Failed to fetch resource" }, { status: 500 });
    }

    return NextResponse.json({ resource: data });
  } catch (error) {
    console.error("Error in GET /api/resources/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/resources/[id] - Update a resource
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

    // Verify resource belongs to user
    const { data: existingResource, error: fetchError } = await supabase
      .from("resources")
      .select("folder_id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Resource not found" }, { status: 404 });
      }
      console.error("Error fetching resource:", fetchError);
      return NextResponse.json({ error: "Failed to fetch resource" }, { status: 500 });
    }

    const body = await request.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.difficulty !== undefined) updateData.difficulty = body.difficulty;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.thumbnailUrl !== undefined) updateData.thumbnail_url = body.thumbnailUrl;
    if (body.fileSize !== undefined) updateData.file_size = body.fileSize;
    if (body.fileType !== undefined) updateData.file_type = body.fileType;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.folderId !== undefined) updateData.folder_id = body.folderId;
    if (body.parentResourceId !== undefined) updateData.parent_resource_id = body.parentResourceId;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;
    if (body.isFavorite !== undefined) updateData.is_favorite = body.isFavorite;
    if (body.isPinned !== undefined) updateData.is_pinned = body.isPinned;
    if (body.viewCount !== undefined) updateData.view_count = body.viewCount;
    if (body.downloadCount !== undefined) updateData.download_count = body.downloadCount;
    if (body.lastAccessedAt !== undefined) updateData.last_accessed_at = body.lastAccessedAt;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("resources")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating resource:", error);
      return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
    }

    // Handle folder resource count updates if folder changed
    if (body.folderId !== undefined && body.folderId !== existingResource.folder_id) {
      if (existingResource.folder_id) {
        await supabase.rpc("decrement_folder_resource_count", {
          folder_id: existingResource.folder_id,
        });
      }
      if (body.folderId) {
        await supabase.rpc("increment_folder_resource_count", {
          folder_id: body.folderId,
        });
      }
    }

    return NextResponse.json({ resource: data });
  } catch (error) {
    console.error("Error in PATCH /api/resources/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/resources/[id] - Delete a resource
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

    // Get folder ID before deletion
    const { data: resource, error: fetchError } = await supabase
      .from("resources")
      .select("folder_id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Resource not found" }, { status: 404 });
      }
      console.error("Error fetching resource:", fetchError);
      return NextResponse.json({ error: "Failed to fetch resource" }, { status: 500 });
    }

    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting resource:", error);
      return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
    }

    // Update folder resource count
    if (resource.folder_id) {
      await supabase.rpc("decrement_folder_resource_count", {
        folder_id: resource.folder_id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/resources/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
