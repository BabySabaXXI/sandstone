"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  Resource, 
  ResourceFolder, 
  ResourceCollection, 
  ResourceFilter, 
  ResourceType, 
  ResourceCategory,
  ResourceDifficulty,
  ResourceStatus,
  ResourceSearchResult,
  ResourceStats,
  DatabaseResource,
  DatabaseResourceFolder 
} from "@/types/resources";
import { Subject } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ResourceStore {
  // State
  resources: Resource[];
  folders: ResourceFolder[];
  collections: ResourceCollection[];
  currentFolderId: string | null;
  currentResourceId: string | null;
  selectedResourceIds: string[];
  loading: boolean;
  syncing: boolean;
  lastSyncAt?: Date;
  
  // Filter state
  activeFilter: ResourceFilter;
  searchResults: ResourceSearchResult[];
  isSearching: boolean;
  
  // Getters
  getResource: (id: string) => Resource | undefined;
  getFolder: (id: string) => ResourceFolder | undefined;
  getCollection: (id: string) => ResourceCollection | undefined;
  getResourcesInFolder: (folderId?: string) => Resource[];
  getResourcesBySubject: (subject: Subject) => Resource[];
  getResourcesByCategory: (category: ResourceCategory) => Resource[];
  getResourcesByType: (type: ResourceType) => Resource[];
  getFavoriteResources: () => Resource[];
  getPinnedResources: () => Resource[];
  getRecentResources: (limit?: number) => Resource[];
  getFilteredResources: () => Resource[];
  getFolderPath: (folderId: string) => ResourceFolder[];
  getChildFolders: (parentId?: string) => ResourceFolder[];
  getResourceStats: () => ResourceStats;
  
  // Resource operations
  createResource: (resource: Partial<Resource>) => Promise<string>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  deleteMultipleResources: (ids: string[]) => Promise<void>;
  duplicateResource: (id: string) => Promise<string>;
  moveResource: (resourceId: string, folderId?: string) => Promise<void>;
  moveMultipleResources: (resourceIds: string[], folderId?: string) => Promise<void>;
  setCurrentResource: (id: string | null) => void;
  toggleResourceSelection: (id: string) => void;
  clearResourceSelection: () => void;
  selectAllResources: () => void;
  
  // Folder operations
  createFolder: (folder: Partial<ResourceFolder>) => Promise<string>;
  updateFolder: (id: string, updates: Partial<ResourceFolder>) => Promise<void>;
  deleteFolder: (id: string, moveResourcesToParent?: boolean) => Promise<void>;
  setCurrentFolder: (id: string | null) => void;
  
  // Collection operations
  createCollection: (collection: Partial<ResourceCollection>) => Promise<string>;
  updateCollection: (id: string, updates: Partial<ResourceCollection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addToCollection: (collectionId: string, resourceIds: string[]) => Promise<void>;
  removeFromCollection: (collectionId: string, resourceIds: string[]) => Promise<void>;
  
  // Filter & Search operations
  setFilter: (filter: Partial<ResourceFilter>) => void;
  clearFilter: () => void;
  searchResources: (query: string) => ResourceSearchResult[];
  advancedSearch: (filter: ResourceFilter) => ResourceSearchResult[];
  
  // Resource interactions
  incrementViewCount: (id: string) => Promise<void>;
  incrementDownloadCount: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  
  // Import/Export
  importResources: (resources: Partial<Resource>[], folderId?: string) => Promise<string[]>;
  exportResources: (resourceIds: string[]) => Promise<Resource[]>;
  
  // Sync operations
  syncWithSupabase: () => Promise<void>;
  fetchResources: () => Promise<void>;
  fetchFolders: () => Promise<void>;
}

const defaultFilter: ResourceFilter = {
  searchQuery: "",
  types: [],
  categories: [],
  subjects: [],
  difficulties: [],
  tags: [],
  status: ["active"],
  sortBy: "newest",
};

// Helper function to calculate relevance score for search
function calculateRelevance(resource: Resource, query: string): { score: number; matchedFields: string[] } {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return { score: 0, matchedFields: [] };
  
  const matchedFields: string[] = [];
  let score = 0;
  
  // Title match (highest weight)
  if (resource.title.toLowerCase().includes(normalizedQuery)) {
    score += resource.title.toLowerCase() === normalizedQuery ? 100 : 50;
    matchedFields.push("title");
  }
  
  // Description match
  if (resource.description?.toLowerCase().includes(normalizedQuery)) {
    score += 30;
    matchedFields.push("description");
  }
  
  // Tags match
  if (resource.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) {
    score += 25;
    matchedFields.push("tags");
  }
  
  // Content match
  if (resource.content?.toLowerCase().includes(normalizedQuery)) {
    score += 20;
    matchedFields.push("content");
  }
  
  // Category match
  if (resource.category.toLowerCase().includes(normalizedQuery)) {
    score += 15;
    matchedFields.push("category");
  }
  
  // Author match
  if (resource.author?.toLowerCase().includes(normalizedQuery)) {
    score += 10;
    matchedFields.push("author");
  }
  
  return { score, matchedFields };
}

// Helper function to filter resources
function filterResources(resources: Resource[], filter: ResourceFilter): Resource[] {
  return resources.filter(resource => {
    // Search query filter
    if (filter.searchQuery) {
      const { score } = calculateRelevance(resource, filter.searchQuery);
      if (score === 0) return false;
    }
    
    // Type filter
    if (filter.types?.length && !filter.types.includes(resource.type)) {
      return false;
    }
    
    // Category filter
    if (filter.categories?.length && !filter.categories.includes(resource.category)) {
      return false;
    }
    
    // Subject filter
    if (filter.subjects?.length && !filter.subjects.includes(resource.subject)) {
      return false;
    }
    
    // Difficulty filter
    if (filter.difficulties?.length && !filter.difficulties.includes(resource.difficulty)) {
      return false;
    }
    
    // Tags filter
    if (filter.tags?.length && !filter.tags.some(tag => resource.tags.includes(tag))) {
      return false;
    }
    
    // Status filter
    if (filter.status?.length && !filter.status.includes(resource.status)) {
      return false;
    }
    
    // Folder filter
    if (filter.folderId !== undefined && resource.folderId !== filter.folderId) {
      return false;
    }
    
    // Favorite filter
    if (filter.isFavorite !== undefined && resource.isFavorite !== filter.isFavorite) {
      return false;
    }
    
    // Date range filter
    if (filter.dateFrom && new Date(resource.createdAt) < filter.dateFrom) {
      return false;
    }
    if (filter.dateTo && new Date(resource.createdAt) > filter.dateTo) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (filter.sortBy) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name":
        return a.title.localeCompare(b.title);
      case "popular":
        return (b.viewCount + b.downloadCount) - (a.viewCount + a.downloadCount);
      case "recently_viewed":
        const aTime = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
        const bTime = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
        return bTime - aTime;
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
}

export const useResourceStore = create<ResourceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      resources: [],
      folders: [],
      collections: [],
      currentFolderId: null,
      currentResourceId: null,
      selectedResourceIds: [],
      loading: false,
      syncing: false,
      activeFilter: defaultFilter,
      searchResults: [],
      isSearching: false,
      
      // Getters
      getResource: (id) => get().resources.find(r => r.id === id),
      getFolder: (id) => get().folders.find(f => f.id === id),
      getCollection: (id) => get().collections.find(c => c.id === id),
      
      getResourcesInFolder: (folderId) => {
        return get().resources.filter(r => r.folderId === folderId && r.status === "active");
      },
      
      getResourcesBySubject: (subject) => {
        return get().resources.filter(r => r.subject === subject && r.status === "active");
      },
      
      getResourcesByCategory: (category) => {
        return get().resources.filter(r => r.category === category && r.status === "active");
      },
      
      getResourcesByType: (type) => {
        return get().resources.filter(r => r.type === type && r.status === "active");
      },
      
      getFavoriteResources: () => {
        return get().resources.filter(r => r.isFavorite && r.status === "active");
      },
      
      getPinnedResources: () => {
        return get().resources.filter(r => r.isPinned && r.status === "active");
      },
      
      getRecentResources: (limit = 10) => {
        return get().resources
          .filter(r => r.status === "active")
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit);
      },
      
      getFilteredResources: () => {
        return filterResources(get().resources, get().activeFilter);
      },
      
      getFolderPath: (folderId) => {
        const path: ResourceFolder[] = [];
        let current = get().getFolder(folderId);
        
        while (current) {
          path.unshift(current);
          current = current.parentId ? get().getFolder(current.parentId) : undefined;
        }
        
        return path;
      },
      
      getChildFolders: (parentId) => {
        return get().folders.filter(f => f.parentId === parentId);
      },
      
      getResourceStats: () => {
        const resources = get().resources.filter(r => r.status === "active");
        
        const stats: ResourceStats = {
          totalResources: resources.length,
          byType: {} as Record<ResourceType, number>,
          byCategory: {} as Record<ResourceCategory, number>,
          bySubject: {} as Record<Subject, number>,
          byDifficulty: {} as Record<ResourceDifficulty, number>,
          totalViews: resources.reduce((sum, r) => sum + r.viewCount, 0),
          totalDownloads: resources.reduce((sum, r) => sum + r.downloadCount, 0),
          favoriteCount: resources.filter(r => r.isFavorite).length,
        };
        
        resources.forEach(r => {
          stats.byType[r.type] = (stats.byType[r.type] || 0) + 1;
          stats.byCategory[r.category] = (stats.byCategory[r.category] || 0) + 1;
          stats.bySubject[r.subject] = (stats.bySubject[r.subject] || 0) + 1;
          stats.byDifficulty[r.difficulty] = (stats.byDifficulty[r.difficulty] || 0) + 1;
        });
        
        return stats;
      },
      
      // Resource operations
      createResource: async (resource) => {
        const id = crypto.randomUUID();
        const newResource: Resource = {
          id,
          title: resource.title || "Untitled Resource",
          description: resource.description || "",
          type: resource.type || "article",
          category: resource.category || "custom",
          subject: resource.subject || "economics",
          url: resource.url || "",
          content: resource.content || "",
          difficulty: resource.difficulty || "all_levels",
          status: resource.status || "active",
          tags: resource.tags || [],
          author: resource.author || "",
          source: resource.source || "",
          thumbnailUrl: resource.thumbnailUrl || "",
          fileSize: resource.fileSize || 0,
          fileType: resource.fileType || "",
          duration: resource.duration || 0,
          viewCount: 0,
          downloadCount: 0,
          isFavorite: false,
          isPinned: false,
          userId: "",
          folderId: resource.folderId,
          parentResourceId: resource.parentResourceId,
          metadata: resource.metadata || {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => ({ resources: [...state.resources, newResource] }));
        
        // Sync with Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from("resources").insert({
              id: newResource.id,
              user_id: user.id,
              title: newResource.title,
              description: newResource.description,
              type: newResource.type,
              category: newResource.category,
              subject: newResource.subject,
              url: newResource.url,
              content: newResource.content,
              difficulty: newResource.difficulty,
              status: newResource.status,
              tags: newResource.tags,
              author: newResource.author,
              source: newResource.source,
              thumbnail_url: newResource.thumbnailUrl,
              file_size: newResource.fileSize,
              file_type: newResource.fileType,
              duration: newResource.duration,
              folder_id: newResource.folderId,
              parent_resource_id: newResource.parentResourceId,
              metadata: newResource.metadata,
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error("Error saving resource:", error);
        }
        
        toast.success("Resource created successfully");
        return id;
      },
      
      updateResource: async (id, updates) => {
        set(state => ({
          resources: state.resources.map(r =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
          ),
        }));
        
        try {
          const { error } = await supabase.from("resources").update({
            title: updates.title,
            description: updates.description,
            type: updates.type,
            category: updates.category,
            subject: updates.subject,
            url: updates.url,
            content: updates.content,
            difficulty: updates.difficulty,
            status: updates.status,
            tags: updates.tags,
            author: updates.author,
            source: updates.source,
            thumbnail_url: updates.thumbnailUrl,
            file_size: updates.fileSize,
            file_type: updates.fileType,
            duration: updates.duration,
            folder_id: updates.folderId,
            parent_resource_id: updates.parentResourceId,
            metadata: updates.metadata,
            is_favorite: updates.isFavorite,
            is_pinned: updates.isPinned,
            updated_at: new Date().toISOString(),
          }).eq("id", id);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating resource:", error);
        }
        
        toast.success("Resource updated successfully");
      },
      
      deleteResource: async (id) => {
        set(state => ({
          resources: state.resources.filter(r => r.id !== id),
          currentResourceId: state.currentResourceId === id ? null : state.currentResourceId,
          selectedResourceIds: state.selectedResourceIds.filter(rid => rid !== id),
        }));
        
        try {
          const { error } = await supabase.from("resources").delete().eq("id", id);
          if (error) throw error;
          toast.success("Resource deleted");
        } catch (error) {
          console.error("Error deleting resource:", error);
        }
      },
      
      deleteMultipleResources: async (ids) => {
        set(state => ({
          resources: state.resources.filter(r => !ids.includes(r.id)),
          selectedResourceIds: [],
        }));
        
        try {
          const { error } = await supabase.from("resources").delete().in("id", ids);
          if (error) throw error;
          toast.success(`${ids.length} resources deleted`);
        } catch (error) {
          console.error("Error deleting resources:", error);
        }
      },
      
      duplicateResource: async (id) => {
        const resource = get().getResource(id);
        if (!resource) throw new Error("Resource not found");
        
        const newId = await get().createResource({
          ...resource,
          title: `${resource.title} (Copy)`,
          viewCount: 0,
          downloadCount: 0,
          isFavorite: false,
          isPinned: false,
        });
        
        toast.success("Resource duplicated");
        return newId;
      },
      
      moveResource: async (resourceId, folderId) => {
        await get().updateResource(resourceId, { folderId });
      },
      
      moveMultipleResources: async (resourceIds, folderId) => {
        for (const id of resourceIds) {
          await get().updateResource(id, { folderId });
        }
        toast.success(`${resourceIds.length} resources moved`);
      },
      
      setCurrentResource: (id) => set({ currentResourceId: id }),
      
      toggleResourceSelection: (id) => {
        set(state => ({
          selectedResourceIds: state.selectedResourceIds.includes(id)
            ? state.selectedResourceIds.filter(rid => rid !== id)
            : [...state.selectedResourceIds, id],
        }));
      },
      
      clearResourceSelection: () => set({ selectedResourceIds: [] }),
      
      selectAllResources: () => {
        const filtered = get().getFilteredResources();
        set({ selectedResourceIds: filtered.map(r => r.id) });
      },
      
      // Folder operations
      createFolder: async (folder) => {
        const id = crypto.randomUUID();
        const newFolder: ResourceFolder = {
          id,
          name: folder.name || "New Folder",
          description: folder.description || "",
          subject: folder.subject || "economics",
          parentId: folder.parentId,
          color: folder.color || "#E8D5C4",
          icon: folder.icon || "folder",
          resourceCount: 0,
          userId: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => ({ folders: [...state.folders, newFolder] }));
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from("resource_folders").insert({
              id: newFolder.id,
              user_id: user.id,
              name: newFolder.name,
              description: newFolder.description,
              subject: newFolder.subject,
              parent_id: newFolder.parentId,
              color: newFolder.color,
              icon: newFolder.icon,
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error("Error saving folder:", error);
        }
        
        toast.success("Folder created");
        return id;
      },
      
      updateFolder: async (id, updates) => {
        set(state => ({
          folders: state.folders.map(f =>
            f.id === id ? { ...f, ...updates, updatedAt: new Date() } : f
          ),
        }));
        
        try {
          const { error } = await supabase.from("resource_folders").update({
            name: updates.name,
            description: updates.description,
            subject: updates.subject,
            parent_id: updates.parentId,
            color: updates.color,
            icon: updates.icon,
            updated_at: new Date().toISOString(),
          }).eq("id", id);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating folder:", error);
        }
        
        toast.success("Folder updated");
      },
      
      deleteFolder: async (id, moveResourcesToParent = true) => {
        const folder = get().getFolder(id);
        if (!folder) return;
        
        set(state => {
          const newState: any = {
            folders: state.folders.filter(f => f.id !== id),
          };
          
          if (moveResourcesToParent) {
            newState.resources = state.resources.map(r =>
              r.folderId === id ? { ...r, folderId: folder.parentId } : r
            );
          }
          
          return newState;
        });
        
        try {
          const { error } = await supabase.from("resource_folders").delete().eq("id", id);
          if (error) throw error;
          toast.success("Folder deleted");
        } catch (error) {
          console.error("Error deleting folder:", error);
        }
      },
      
      setCurrentFolder: (id) => set({ currentFolderId: id }),
      
      // Collection operations
      createCollection: async (collection) => {
        const id = crypto.randomUUID();
        const newCollection: ResourceCollection = {
          id,
          name: collection.name || "New Collection",
          description: collection.description || "",
          subject: collection.subject || "economics",
          resourceIds: collection.resourceIds || [],
          isPublic: collection.isPublic || false,
          userId: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => ({ collections: [...state.collections, newCollection] }));
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from("resource_collections").insert({
              id: newCollection.id,
              user_id: user.id,
              name: newCollection.name,
              description: newCollection.description,
              subject: newCollection.subject,
              resource_ids: newCollection.resourceIds,
              is_public: newCollection.isPublic,
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error("Error saving collection:", error);
        }
        
        toast.success("Collection created");
        return id;
      },
      
      updateCollection: async (id, updates) => {
        set(state => ({
          collections: state.collections.map(c =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
          ),
        }));
        
        try {
          const { error } = await supabase.from("resource_collections").update({
            name: updates.name,
            description: updates.description,
            subject: updates.subject,
            resource_ids: updates.resourceIds,
            is_public: updates.isPublic,
            updated_at: new Date().toISOString(),
          }).eq("id", id);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating collection:", error);
        }
      },
      
      deleteCollection: async (id) => {
        set(state => ({
          collections: state.collections.filter(c => c.id !== id),
        }));
        
        try {
          const { error } = await supabase.from("resource_collections").delete().eq("id", id);
          if (error) throw error;
          toast.success("Collection deleted");
        } catch (error) {
          console.error("Error deleting collection:", error);
        }
      },
      
      addToCollection: async (collectionId, resourceIds) => {
        const collection = get().getCollection(collectionId);
        if (!collection) return;
        
        const newResourceIds = [...new Set([...collection.resourceIds, ...resourceIds])];
        await get().updateCollection(collectionId, { resourceIds: newResourceIds });
        
        toast.success(`${resourceIds.length} resources added to collection`);
      },
      
      removeFromCollection: async (collectionId, resourceIds) => {
        const collection = get().getCollection(collectionId);
        if (!collection) return;
        
        const newResourceIds = collection.resourceIds.filter(id => !resourceIds.includes(id));
        await get().updateCollection(collectionId, { resourceIds: newResourceIds });
        
        toast.success(`${resourceIds.length} resources removed from collection`);
      },
      
      // Filter & Search operations
      setFilter: (filter) => {
        set(state => ({
          activeFilter: { ...state.activeFilter, ...filter },
        }));
      },
      
      clearFilter: () => {
        set({ activeFilter: defaultFilter });
      },
      
      searchResources: (query) => {
        const resources = get().resources.filter(r => r.status === "active");
        const results: ResourceSearchResult[] = [];
        
        resources.forEach(resource => {
          const { score, matchedFields } = calculateRelevance(resource, query);
          if (score > 0) {
            results.push({ resource, relevanceScore: score, matchedFields });
          }
        });
        
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      },
      
      advancedSearch: (filter) => {
        const filtered = filterResources(get().resources, filter);
        return filtered.map(resource => ({
          resource,
          relevanceScore: 1,
          matchedFields: ["filter"],
        }));
      },
      
      // Resource interactions
      incrementViewCount: async (id) => {
        const resource = get().getResource(id);
        if (!resource) return;
        
        const newCount = resource.viewCount + 1;
        set(state => ({
          resources: state.resources.map(r =>
            r.id === id ? { ...r, viewCount: newCount, lastAccessedAt: new Date() } : r
          ),
        }));
        
        try {
          await supabase.from("resources").update({
            view_count: newCount,
            last_accessed_at: new Date().toISOString(),
          }).eq("id", id);
        } catch (error) {
          console.error("Error updating view count:", error);
        }
      },
      
      incrementDownloadCount: async (id) => {
        const resource = get().getResource(id);
        if (!resource) return;
        
        const newCount = resource.downloadCount + 1;
        set(state => ({
          resources: state.resources.map(r =>
            r.id === id ? { ...r, downloadCount: newCount } : r
          ),
        }));
        
        try {
          await supabase.from("resources").update({
            download_count: newCount,
          }).eq("id", id);
        } catch (error) {
          console.error("Error updating download count:", error);
        }
      },
      
      toggleFavorite: async (id) => {
        const resource = get().getResource(id);
        if (!resource) return;
        
        const newValue = !resource.isFavorite;
        set(state => ({
          resources: state.resources.map(r =>
            r.id === id ? { ...r, isFavorite: newValue } : r
          ),
        }));
        
        try {
          await supabase.from("resources").update({
            is_favorite: newValue,
          }).eq("id", id);
          
          toast.success(newValue ? "Added to favorites" : "Removed from favorites");
        } catch (error) {
          console.error("Error toggling favorite:", error);
        }
      },
      
      togglePin: async (id) => {
        const resource = get().getResource(id);
        if (!resource) return;
        
        const newValue = !resource.isPinned;
        set(state => ({
          resources: state.resources.map(r =>
            r.id === id ? { ...r, isPinned: newValue } : r
          ),
        }));
        
        try {
          await supabase.from("resources").update({
            is_pinned: newValue,
          }).eq("id", id);
          
          toast.success(newValue ? "Resource pinned" : "Resource unpinned");
        } catch (error) {
          console.error("Error toggling pin:", error);
        }
      },
      
      // Import/Export
      importResources: async (resources, folderId) => {
        const ids: string[] = [];
        
        for (const resource of resources) {
          const id = await get().createResource({
            ...resource,
            folderId: folderId || resource.folderId,
          });
          ids.push(id);
        }
        
        toast.success(`${resources.length} resources imported`);
        return ids;
      },
      
      exportResources: async (resourceIds) => {
        return get().resources.filter(r => resourceIds.includes(r.id));
      },
      
      // Sync operations
      syncWithSupabase: async () => {
        set({ syncing: true });
        
        try {
          await get().fetchResources();
          await get().fetchFolders();
          set({ lastSyncAt: new Date() });
        } catch (error) {
          console.error("Error syncing:", error);
        } finally {
          set({ syncing: false });
        }
      },
      
      fetchResources: async () => {
        set({ loading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ loading: false });
            return;
          }
          
          const { data, error } = await supabase
            .from("resources")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });
          
          if (error) throw error;
          
          const mappedResources: Resource[] = (data as DatabaseResource[]).map(doc => ({
            id: doc.id,
            title: doc.title,
            description: doc.description,
            type: doc.type as ResourceType,
            category: doc.category as ResourceCategory,
            subject: doc.subject as Subject,
            url: doc.url,
            content: doc.content,
            difficulty: doc.difficulty as ResourceDifficulty,
            status: doc.status as ResourceStatus,
            tags: doc.tags || [],
            author: doc.author,
            source: doc.source,
            thumbnailUrl: doc.thumbnail_url,
            fileSize: doc.file_size,
            fileType: doc.file_type,
            duration: doc.duration,
            viewCount: doc.view_count,
            downloadCount: doc.download_count,
            isFavorite: doc.is_favorite,
            isPinned: doc.is_pinned,
            userId: doc.user_id,
            folderId: doc.folder_id,
            parentResourceId: doc.parent_resource_id,
            metadata: doc.metadata,
            createdAt: new Date(doc.created_at),
            updatedAt: new Date(doc.updated_at),
            lastAccessedAt: doc.last_accessed_at ? new Date(doc.last_accessed_at) : undefined,
          }));
          
          set({ resources: mappedResources });
        } catch (error) {
          console.error("Error fetching resources:", error);
        } finally {
          set({ loading: false });
        }
      },
      
      fetchFolders: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          const { data, error } = await supabase
            .from("resource_folders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });
          
          if (error) throw error;
          
          const mappedFolders: ResourceFolder[] = (data as DatabaseResourceFolder[]).map(folder => ({
            id: folder.id,
            name: folder.name,
            description: folder.description,
            subject: folder.subject as Subject,
            parentId: folder.parent_id,
            color: folder.color,
            icon: folder.icon,
            resourceCount: folder.resource_count,
            userId: folder.user_id,
            createdAt: new Date(folder.created_at),
            updatedAt: new Date(folder.updated_at),
          }));
          
          set({ folders: mappedFolders });
        } catch (error) {
          console.error("Error fetching folders:", error);
        }
      },
    }),
    {
      name: "resource-store",
      partialize: (state) => ({
        resources: state.resources,
        folders: state.folders,
        collections: state.collections,
        currentFolderId: state.currentFolderId,
        activeFilter: state.activeFilter,
      }),
    }
  )
);
