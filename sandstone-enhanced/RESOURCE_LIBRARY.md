# Sandstone Resource Library

A comprehensive resource library system for the Sandstone learning platform with advanced search, filtering, and resource management capabilities.

## Features

### Core Features
- **Resource Management**: Create, read, update, delete (CRUD) resources
- **Folder Organization**: Hierarchical folder structure for organizing resources
- **Advanced Search**: Full-text search with relevance scoring
- **Filtering**: Filter by type, category, difficulty, tags, and more
- **Sorting**: Sort by newest, oldest, name, popularity, and recently viewed
- **Favorites & Pins**: Mark resources as favorites or pin important ones
- **Bulk Operations**: Select and manage multiple resources at once
- **View Modes**: Grid and list view options
- **Statistics**: Track views, downloads, and resource usage

### Resource Types
- Article
- Video
- Audio
- PDF
- Document
- Link
- Image
- Interactive
- Quiz
- Flashcard

### Categories
- Writing Tips
- Vocabulary
- Practice
- Grammar
- Reading
- Listening
- Speaking
- Exam Prep
- Study Guides
- Past Papers
- Mark Schemes
- Theory
- Case Studies
- Diagrams
- Formulas
- Custom

## File Structure

```
sandstone-enhanced/
├── app/
│   ├── library/
│   │   └── page.tsx              # Enhanced library page
│   └── api/
│       ├── resources/
│       │   ├── route.ts          # Resources CRUD API
│       │   ├── search/
│       │   │   └── route.ts      # Search API
│       │   ├── stats/
│       │   │   └── route.ts      # Statistics API
│       │   └── [id]/
│       │       └── route.ts      # Individual resource API
│       └── resource-folders/
│           ├── route.ts          # Folders CRUD API
│           └── [id]/
│               └── route.ts      # Individual folder API
├── components/
│   └── resources/
│       ├── index.ts              # Component exports
│       ├── ResourceCard.tsx      # Resource card component
│       ├── ResourceGrid.tsx      # Resource grid/list view
│       ├── ResourceSearch.tsx    # Search component
│       └── ResourceFilters.tsx   # Filter component
├── stores/
│   └── resource-store.ts         # Zustand resource store
├── types/
│   ├── index.ts                  # Main types export
│   └── resources.ts              # Resource types
└── supabase/
    └── migrations/
        └── 20240220000001_add_resource_library.sql  # Database schema
```

## Database Schema

### Tables

#### `resources`
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `title` (TEXT)
- `description` (TEXT)
- `type` (resource_type enum)
- `category` (resource_category enum)
- `subject` (TEXT)
- `url` (TEXT)
- `content` (TEXT)
- `difficulty` (resource_difficulty enum)
- `status` (resource_status enum)
- `tags` (TEXT[])
- `author` (TEXT)
- `source` (TEXT)
- `thumbnail_url` (TEXT)
- `file_size` (BIGINT)
- `file_type` (TEXT)
- `duration` (INTEGER)
- `view_count` (INTEGER)
- `download_count` (INTEGER)
- `is_favorite` (BOOLEAN)
- `is_pinned` (BOOLEAN)
- `folder_id` (UUID, FK to resource_folders)
- `parent_resource_id` (UUID, FK to resources)
- `metadata` (JSONB)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `last_accessed_at` (TIMESTAMPTZ)

#### `resource_folders`
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `name` (TEXT)
- `description` (TEXT)
- `subject` (TEXT)
- `parent_id` (UUID, self-referencing FK)
- `color` (TEXT)
- `icon` (TEXT)
- `resource_count` (INTEGER)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### `resource_collections`
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `name` (TEXT)
- `description` (TEXT)
- `subject` (TEXT)
- `resource_ids` (UUID[])
- `is_public` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## API Endpoints

### Resources
- `GET /api/resources` - List all resources with filtering
- `POST /api/resources` - Create a new resource
- `PATCH /api/resources` - Bulk update resources
- `DELETE /api/resources?ids=id1,id2` - Bulk delete resources
- `GET /api/resources/[id]` - Get a single resource
- `PATCH /api/resources/[id]` - Update a resource
- `DELETE /api/resources/[id]` - Delete a resource

### Search
- `GET /api/resources/search?q=query` - Simple search
- `POST /api/resources/search` - Advanced search with filters

### Statistics
- `GET /api/resources/stats` - Get resource statistics

### Folders
- `GET /api/resource-folders` - List all folders
- `POST /api/resource-folders` - Create a new folder
- `PATCH /api/resource-folders` - Bulk update folders
- `DELETE /api/resource-folders?ids=id1,id2` - Bulk delete folders
- `GET /api/resource-folders/[id]` - Get a single folder
- `PATCH /api/resource-folders/[id]` - Update a folder
- `DELETE /api/resource-folders/[id]` - Delete a folder

## Store API

### State
```typescript
resources: Resource[]
folders: ResourceFolder[]
collections: ResourceCollection[]
currentFolderId: string | null
currentResourceId: string | null
selectedResourceIds: string[]
loading: boolean
syncing: boolean
activeFilter: ResourceFilter
```

### Getters
```typescript
getResource(id: string): Resource | undefined
getFolder(id: string): ResourceFolder | undefined
getResourcesInFolder(folderId?: string): Resource[]
getResourcesBySubject(subject: Subject): Resource[]
getResourcesByCategory(category: ResourceCategory): Resource[]
getResourcesByType(type: ResourceType): Resource[]
getFavoriteResources(): Resource[]
getPinnedResources(): Resource[]
getRecentResources(limit?: number): Resource[]
getFilteredResources(): Resource[]
getFolderPath(folderId: string): ResourceFolder[]
getResourceStats(): ResourceStats
```

### Actions
```typescript
// Resource operations
createResource(resource: Partial<Resource>): Promise<string>
updateResource(id: string, updates: Partial<Resource>): Promise<void>
deleteResource(id: string): Promise<void>
deleteMultipleResources(ids: string[]): Promise<void>
duplicateResource(id: string): Promise<string>
moveResource(resourceId: string, folderId?: string): Promise<void>

// Folder operations
createFolder(folder: Partial<ResourceFolder>): Promise<string>
updateFolder(id: string, updates: Partial<ResourceFolder>): Promise<void>
deleteFolder(id: string, moveResourcesToParent?: boolean): Promise<void>

// Collection operations
createCollection(collection: Partial<ResourceCollection>): Promise<string>
updateCollection(id: string, updates: Partial<ResourceCollection>): Promise<void>
deleteCollection(id: string): Promise<void>
addToCollection(collectionId: string, resourceIds: string[]): Promise<void>
removeFromCollection(collectionId: string, resourceIds: string[]): Promise<void>

// Search & Filter
setFilter(filter: Partial<ResourceFilter>): void
clearFilter(): void
searchResources(query: string): ResourceSearchResult[]
advancedSearch(filter: ResourceFilter): ResourceSearchResult[]

// Interactions
incrementViewCount(id: string): Promise<void>
incrementDownloadCount(id: string): Promise<void>
toggleFavorite(id: string): Promise<void>
togglePin(id: string): Promise<void>

// Sync
syncWithSupabase(): Promise<void>
fetchResources(): Promise<void>
fetchFolders(): Promise<void>
```

## Usage Examples

### Basic Usage
```tsx
import { useResourceStore } from "@/stores/resource-store";

function MyComponent() {
  const { resources, createResource, deleteResource } = useResourceStore();

  const handleCreate = async () => {
    const id = await createResource({
      title: "My Resource",
      type: "article",
      category: "study_guides",
      subject: "economics",
    });
  };

  return (
    <div>
      {resources.map((resource) => (
        <div key={resource.id}>{resource.title}</div>
      ))}
    </div>
  );
}
```

### Using Components
```tsx
import { ResourceGrid, ResourceSearch, ResourceFilters } from "@/components/resources";
import { useResourceStore } from "@/stores/resource-store";

function LibraryPage() {
  const { getFilteredResources, activeFilter, setFilter, clearFilter } = useResourceStore();
  const resources = getFilteredResources();

  return (
    <div>
      <ResourceSearch
        onSearch={(results) => console.log(results)}
        onQueryChange={(query) => setFilter({ searchQuery: query })}
      />
      <ResourceFilters
        filter={activeFilter}
        onFilterChange={setFilter}
        onClearFilters={clearFilter}
      />
      <ResourceGrid
        resources={resources}
        viewMode="grid"
        onEdit={(resource) => console.log("Edit:", resource)}
        onDelete={(resource) => console.log("Delete:", resource)}
      />
    </div>
  );
}
```

## Installation

1. Apply the database migration:
```bash
supabase db push
```

2. Copy the files to your project:
```bash
# Copy types
cp -r sandstone-enhanced/types/* your-project/types/

# Copy stores
cp -r sandstone-enhanced/stores/* your-project/stores/

# Copy components
cp -r sandstone-enhanced/components/resources your-project/components/

# Copy API routes
cp -r sandstone-enhanced/app/api/* your-project/app/api/

# Copy library page
cp sandstone-enhanced/app/library/page.tsx your-project/app/library/
```

3. Update your imports to match your project structure.

## Migration from Old Library

The old library used static hardcoded resources. To migrate:

1. Import the new resource store
2. Replace the static resources array with store data
3. Add the new UI components
4. Apply the database migration

## Future Enhancements

- [ ] Resource sharing between users
- [ ] Public resource collections
- [ ] Resource ratings and reviews
- [ ] AI-powered resource recommendations
- [ ] Resource import from external sources
- [ ] Batch import/export functionality
- [ ] Resource versioning
- [ ] Collaborative editing
- [ ] Resource comments and discussions
- [ ] Integration with external learning platforms

## License

MIT License - Part of the Sandstone Learning Platform
