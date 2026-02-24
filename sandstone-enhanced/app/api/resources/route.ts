import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DatabaseResource, ResourceFilter } from "@/types/resources";

// GET /api/resources - List all resources with optional filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Build query
    let query = supabase
      .from("resources")
      .select("*")
      .eq("user_id", user.id);

    // Apply filters
    const folderId = searchParams.get("folderId");
    if (folderId) {
      query = query.eq("folder_id", folderId);
    }

    const type = searchParams.get("type");
    if (type) {
      query = query.eq("type", type);
    }

    const category = searchParams.get("category");
    if (category) {
      query = query.eq("category", category);
    }

    const subject = searchParams.get("subject");
    if (subject) {
      query = query.eq("subject", subject);
    }

    const difficulty = searchParams.get("difficulty");
    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const status = searchParams.get("status");
    if (status) {
      query = query.eq("status", status);
    }

    const isFavorite = searchParams.get("isFavorite");
    if (isFavorite !== null) {
      query = query.eq("is_favorite", isFavorite === "true");
    }

    const search = searchParams.get("search");
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    // Apply sorting
    const sortBy = searchParams.get("sortBy") || "updated_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching resources:", error);
      return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
    }

    return NextResponse.json({ resources: data });
  } catch (error) {
    console.error("Error in GET /api/resources:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/resources - Create a new resource
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const resourceData = {
      user_id: user.id,
      title: body.title,
      description: body.description || null,
      type: body.type || "article",
      category: body.category || "custom",
      subject: body.subject || "economics",
      url: body.url || null,
      content: body.content || null,
      difficulty: body.difficulty || "all_levels",
      status: body.status || "active",
      tags: body.tags || [],
      author: body.author || null,
      source: body.source || null,
      thumbnail_url: body.thumbnailUrl || null,
      file_size: body.fileSize || null,
      file_type: body.fileType || null,
      duration: body.duration || null,
      folder_id: body.folderId || null,
      parent_resource_id: body.parentResourceId || null,
      metadata: body.metadata || {},
      view_count: 0,
      download_count: 0,
      is_favorite: false,
      is_pinned: false,
    };

    const { data, error } = await supabase
      .from("resources")
      .insert(resourceData)
      .select()
      .single();

    if (error) {
      console.error("Error creating resource:", error);
      return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
    }

    // Update folder resource count if folder is specified
    if (body.folderId) {
      await supabase.rpc("increment_folder_resource_count", {
        folder_id: body.folderId,
      });
    }

    return NextResponse.json({ resource: data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/resources:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/resources - Bulk update resources
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
      return NextResponse.json({ error: "Resource IDs are required" }, { status: 400 });
    }

    // Verify all resources belong to the user
    const { data: existingResources, error: fetchError } = await supabase
      .from("resources")
      .select("id, folder_id")
      .in("id", ids)
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Error fetching resources:", fetchError);
      return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
    }

    if (existingResources.length !== ids.length) {
      return NextResponse.json({ error: "Some resources not found or unauthorized" }, { status: 403 });
    }

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.url !== undefined) updateData.url = updates.url;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.author !== undefined) updateData.author = updates.author;
    if (updates.source !== undefined) updateData.source = updates.source;
    if (updates.thumbnailUrl !== undefined) updateData.thumbnail_url = updates.thumbnailUrl;
    if (updates.fileSize !== undefined) updateData.file_size = updates.fileSize;
    if (updates.fileType !== undefined) updateData.file_type = updates.fileType;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.folderId !== undefined) updateData.folder_id = updates.folderId;
    if (updates.parentResourceId !== undefined) updateData.parent_resource_id = updates.parentResourceId;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;
    if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("resources")
      .update(updateData)
      .in("id", ids)
      .select();

    if (error) {
      console.error("Error updating resources:", error);
      return NextResponse.json({ error: "Failed to update resources" }, { status: 500 });
    }

    // Handle folder resource count updates if folder changed
    if (updates.folderId !== undefined) {
      const oldFolderIds = existingResources.map(r => r.folder_id).filter(Boolean);
      const newFolderId = updates.folderId;

      // Decrement old folders
      for (const folderId of oldFolderIds) {
        if (folderId !== newFolderId) {
          await supabase.rpc("decrement_folder_resource_count", { folder_id: folderId });
        }
      }

      // Increment new folder
      if (newFolderId) {
        await supabase.rpc("increment_folder_resource_count", { folder_id: newFolderId });
      }
    }

    return NextResponse.json({ resources: data });
  } catch (error) {
    console.error("Error in PATCH /api/resources:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/resources - Bulk delete resources
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
      return NextResponse.json({ error: "Resource IDs are required" }, { status: 400 });
    }

    const ids = idsParam.split(",");

    // Get folder IDs before deletion to update counts
    const { data: resourcesToDelete, error: fetchError } = await supabase
      .from("resources")
      .select("folder_id")
      .in("id", ids)
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Error fetching resources:", fetchError);
      return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
    }

    const { error } = await supabase
      .from("resources")
      .delete()
      .in("id", ids)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting resources:", error);
      return NextResponse.json({ error: "Failed to delete resources" }, { status: 500 });
    }

    // Update folder resource counts
    const folderIds = resourcesToDelete?.map(r => r.folder_id).filter(Boolean) || [];
    for (const folderId of folderIds) {
      await supabase.rpc("decrement_folder_resource_count", { folder_id: folderId });
    }

    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error("Error in DELETE /api/resources:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
