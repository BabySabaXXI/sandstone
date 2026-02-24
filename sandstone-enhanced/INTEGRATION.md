# Resource Library Integration Guide

This guide provides step-by-step instructions for integrating the enhanced resource library into the Sandstone app.

## Files Created

### Types
- `/types/resources.ts` - Resource type definitions
- `/types/index.ts` - Updated main types export

### Store
- `/stores/resource-store.ts` - Zustand resource store with search/filter

### Components
- `/components/resources/index.ts` - Component exports
- `/components/resources/ResourceCard.tsx` - Resource card component
- `/components/resources/ResourceGrid.tsx` - Resource grid/list view
- `/components/resources/ResourceSearch.tsx` - Search component
- `/components/resources/ResourceFilters.tsx` - Filter component

### API Routes
- `/app/api/resources/route.ts` - Resources CRUD API
- `/app/api/resources/[id]/route.ts` - Individual resource API
- `/app/api/resources/search/route.ts` - Search API
- `/app/api/resources/stats/route.ts` - Statistics API
- `/app/api/resource-folders/route.ts` - Folders CRUD API
- `/app/api/resource-folders/[id]/route.ts` - Individual folder API

### Pages
- `/app/library/page.tsx` - Enhanced library page (replaces existing)

### Database
- `/supabase/migrations/20240220000001_add_resource_library.sql` - Database schema

## Integration Steps

### Step 1: Apply Database Migration

```bash
# Navigate to your project
cd /path/to/sandstone

# Apply the migration
supabase db push
```

Or run the SQL directly in the Supabase SQL editor.

### Step 2: Copy Type Definitions

```bash
# Copy resource types
cp sandstone-enhanced/types/resources.ts your-project/types/

# Update or replace types/index.ts
cp sandstone-enhanced/types/index.ts your-project/types/
```

### Step 3: Copy Store

```bash
# Copy resource store
cp sandstone-enhanced/stores/resource-store.ts your-project/stores/
```

### Step 4: Copy Components

```bash
# Create resources component directory if not exists
mkdir -p your-project/components/resources

# Copy all resource components
cp sandstone-enhanced/components/resources/* your-project/components/resources/
```

### Step 5: Copy API Routes

```bash
# Create API directories if not exists
mkdir -p your-project/app/api/resources/search
mkdir -p your-project/app/api/resources/stats
mkdir -p your-project/app/api/resource-folders

# Copy API routes
cp sandstone-enhanced/app/api/resources/route.ts your-project/app/api/resources/
cp sandstone-enhanced/app/api/resources/[id]/route.ts your-project/app/api/resources/[id]/
cp sandstone-enhanced/app/api/resources/search/route.ts your-project/app/api/resources/search/
cp sandstone-enhanced/app/api/resources/stats/route.ts your-project/app/api/resources/stats/
cp sandstone-enhanced/app/api/resource-folders/route.ts your-project/app/api/resource-folders/
cp sandstone-enhanced/app/api/resource-folders/[id]/route.ts your-project/app/api/resource-folders/[id]/
```

### Step 6: Replace Library Page

```bash
# Backup existing library page
cp your-project/app/library/page.tsx your-project/app/library/page.tsx.backup

# Copy new library page
cp sandstone-enhanced/app/library/page.tsx your-project/app/library/
```

### Step 7: Update Dependencies (if needed)

Ensure you have the following dependencies installed:

```bash
npm install zustand framer-motion lucide-react
```

### Step 8: Update Tailwind Config (if needed)

Add any custom colors to your tailwind.config.ts:

```typescript
colors: {
  // ... existing colors
  sandstone: {
    50: '#FDF8F3',
    100: '#F5F0EB',
    200: '#E8E4DF',
    300: '#E8D5C4',
    400: '#D4C4B5',
    500: '#8A8A8A',
    600: '#5A5A5A',
    700: '#2D2D2D',
  },
}
```

### Step 9: Update Navigation (if needed)

Update your navigation to link to the new library page:

```tsx
// In your navigation component
<Link href="/library">
  <BookOpen className="w-4 h-4" />
  Library
</Link>
```

### Step 10: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/library`

3. Test the following features:
   - Create a new resource
   - Create a folder
   - Move resources to folders
   - Search for resources
   - Apply filters
   - Toggle favorites and pins
   - Delete resources

## Troubleshooting

### Issue: "Cannot find module '@/types/resources'"

**Solution**: Update your tsconfig.json paths:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: "Table 'resources' does not exist"

**Solution**: Run the database migration:

```bash
supabase db push
```

Or manually run the SQL in the Supabase SQL editor.

### Issue: "Type error: Property 'X' does not exist on type 'Y'"

**Solution**: Ensure all type definitions are properly imported and exported. Check that `/types/index.ts` exports everything from `/types/resources.ts`.

### Issue: "API routes returning 401"

**Solution**: Ensure your Supabase client is properly configured and the user is authenticated. Check that RLS policies are enabled.

### Issue: "Components not rendering correctly"

**Solution**: 
1. Check that all UI components (Button, Input, Badge, etc.) are available
2. Ensure Tailwind CSS is properly configured
3. Verify that the component imports match your project structure

## Customization

### Adding New Resource Types

1. Update the `ResourceType` enum in `/types/resources.ts`:

```typescript
export type ResourceType = 
  | "article" 
  | "video"
  | "your-new-type";  // Add here
```

2. Add the icon in `ResourceCard.tsx`:

```typescript
const resourceTypeIcons: Record<ResourceType, React.ComponentType> = {
  // ... existing icons
  "your-new-type": YourNewIcon,
};
```

3. Add the color:

```typescript
const resourceTypeColors: Record<ResourceType, string> = {
  // ... existing colors
  "your-new-type": "bg-your-color text-your-text-color",
};
```

### Adding New Categories

1. Update the `ResourceCategory` enum in `/types/resources.ts`
2. Add the label in `categoryLabels` object

### Customizing the UI

The library page uses Tailwind CSS classes. You can customize:

- Colors: Update the color values in the component classes
- Layout: Modify the grid columns in `ResourceGrid.tsx`
- Card design: Update the `ResourceCard.tsx` component

## Performance Considerations

### Pagination

For large resource libraries, consider implementing pagination:

```typescript
// In your API route
const page = parseInt(searchParams.get("page") || "1");
const limit = parseInt(searchParams.get("limit") || "20");
const offset = (page - 1) * limit;

query = query.range(offset, offset + limit - 1);
```

### Virtualization

For very large lists, consider using virtual scrolling:

```bash
npm install react-window
```

### Caching

The resource store uses Zustand's persist middleware for local caching. You can customize the cache duration:

```typescript
persist(
  (set, get) => ({ ... }),
  {
    name: "resource-store",
    // Add custom storage or serialization
  }
);
```

## Security Considerations

### Row Level Security (RLS)

The database schema includes RLS policies that ensure users can only access their own resources. Make sure these are enabled:

```sql
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_collections ENABLE ROW LEVEL SECURITY;
```

### API Authentication

All API routes check for authentication:

```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments in the source files
3. Refer to the RESOURCE_LIBRARY.md documentation

## License

MIT License - Part of the Sandstone Learning Platform
