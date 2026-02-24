// Resource Library Types

import { Subject } from "./index";

export type ResourceType = 
  | "article" 
  | "video" 
  | "audio" 
  | "pdf" 
  | "document" 
  | "link" 
  | "image" 
  | "interactive"
  | "quiz"
  | "flashcard";

export type ResourceCategory =
  | "writing_tips"
  | "vocabulary"
  | "practice"
  | "grammar"
  | "reading"
  | "listening"
  | "speaking"
  | "exam_prep"
  | "study_guides"
  | "past_papers"
  | "mark_schemes"
  | "theory"
  | "case_studies"
  | "diagrams"
  | "formulas"
  | "custom";

export type ResourceDifficulty = "beginner" | "intermediate" | "advanced" | "all_levels";
export type ResourceStatus = "active" | "archived" | "draft";

export interface ResourceTag {
  id: string;
  name: string;
  color?: string;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  category: ResourceCategory;
  subject: Subject;
  url?: string;
  content?: string;
  difficulty: ResourceDifficulty;
  status: ResourceStatus;
  tags: string[];
  author?: string;
  source?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  fileType?: string;
  duration?: number; // in seconds for videos/audio
  viewCount: number;
  downloadCount: number;
  isFavorite: boolean;
  isPinned: boolean;
  userId: string;
  folderId?: string;
  parentResourceId?: string; // for related resources
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

export interface ResourceFolder {
  id: string;
  name: string;
  description?: string;
  subject: Subject;
  parentId?: string;
  color?: string;
  icon?: string;
  resourceCount: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceCollection {
  id: string;
  name: string;
  description?: string;
  subject: Subject;
  resourceIds: string[];
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceFilter {
  searchQuery?: string;
  types?: ResourceType[];
  categories?: ResourceCategory[];
  subjects?: Subject[];
  difficulties?: ResourceDifficulty[];
  tags?: string[];
  status?: ResourceStatus[];
  folderId?: string;
  isFavorite?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "newest" | "oldest" | "name" | "popular" | "recently_viewed";
}

export interface ResourceSearchResult {
  resource: Resource;
  relevanceScore: number;
  matchedFields: string[];
}

export interface ResourceStats {
  totalResources: number;
  byType: Record<ResourceType, number>;
  byCategory: Record<ResourceCategory, number>;
  bySubject: Record<Subject, number>;
  byDifficulty: Record<ResourceDifficulty, number>;
  totalViews: number;
  totalDownloads: number;
  favoriteCount: number;
}

export interface ResourceImportOptions {
  source: "url" | "file" | "clipboard" | "document";
  autoCategorize?: boolean;
  extractMetadata?: boolean;
  folderId?: string;
  tags?: string[];
}

export interface ResourceExportOptions {
  format: "json" | "csv" | "pdf";
  includeContent?: boolean;
  filter?: ResourceFilter;
}

// Database types for Supabase
export interface DatabaseResource {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: string;
  category: string;
  subject: string;
  url?: string;
  content?: string;
  difficulty: string;
  status: string;
  tags: string[];
  author?: string;
  source?: string;
  thumbnail_url?: string;
  file_size?: number;
  file_type?: string;
  duration?: number;
  view_count: number;
  download_count: number;
  is_favorite: boolean;
  is_pinned: boolean;
  folder_id?: string;
  parent_resource_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
}

export interface DatabaseResourceFolder {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  subject: string;
  parent_id?: string;
  color?: string;
  icon?: string;
  resource_count: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseResourceCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  subject: string;
  resource_ids: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
