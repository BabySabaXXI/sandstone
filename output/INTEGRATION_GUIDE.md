# Document System Integration Guide

## Quick Start

### 1. Copy Files to Your Project

Copy the following files to your Sandstone project:

```bash
# Components
cp -r output/components/documents/* your-project/components/documents/

# Hooks
cp output/hooks/useAutoSave.ts your-project/hooks/
cp output/hooks/useDocuments.ts your-project/hooks/

# Libraries
cp -r output/lib/documents/* your-project/lib/documents/
cp output/lib/utils.ts your-project/lib/

# Store
cp output/stores/document-store.ts your-project/stores/

# Types (merge with existing)
cp output/types/index.ts your-project/types/

# Page
cp output/app/documents/page.tsx your-project/app/documents/
```

### 2. Run Database Migration

```bash
# Using Supabase CLI
supabase db reset
supabase db push

# Or run directly with psql
psql $DATABASE_URL -f output/database/migrations/001_document_system.sql
```

### 3. Install Dependencies

```bash
npm install framer-motion sonner zustand
```

### 4. Update Imports

In your existing files, update imports to use the new document system:

```tsx
// Before
import { useDocumentStore } from "@/stores/document-store";

// After (same import, enhanced functionality)
import { useDocumentStore } from "@/stores/document-store";
```

## File Structure After Integration

```
your-project/
├── app/
│   └── documents/
│       └── page.tsx              # Main documents page
├── components/
│   └── documents/
│       ├── Block.tsx             # Block component
│       ├── BlockEditor.tsx       # Editor component
│       ├── BlockToolbar.tsx      # Block toolbar
│       ├── DocumentTree.tsx      # Document tree sidebar
│       ├── ExportMenu.tsx        # Export menu
│       ├── SlashCommand.tsx      # Slash command palette
│       ├── TagInput.tsx          # Tag input
│       └── index.ts              # Exports
├── hooks/
│   ├── useAutoSave.ts            # Auto-save hook
│   ├── useDocuments.ts           # Document hooks
│   └── index.ts                  # Hook exports
├── lib/
│   ├── documents/
│   │   ├── blocks.ts             # Block utilities
│   │   └── index.ts              # Library exports
│   └── utils.ts                  # Utilities
├── stores/
│   └── document-store.ts         # Document store
├── types/
│   └── index.ts                  # Type definitions
└── database/
    └── migrations/
        └── 001_document_system.sql # Database schema
```

## Configuration

### Tailwind Config

Add these colors to your `tailwind.config.ts`:

```typescript
colors: {
  sandstone: {
    primary: "#2D2D2D",
    secondary: "#5A5A5A",
    muted: "#8A8A8A",
    border: "#E5E5E0",
    background: "#FAFAF8",
    surface: "#F0F0EC",
    accent: "#E8D5C4",
    blue: "#A8C5D4",
    green: "#A8D4B5",
    red: "#D4A8A8",
    yellow: "#E5D4A8",
  },
},
```

### Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage Examples

### Basic Document Editor

```tsx
import { BlockEditor } from "@/components/documents";

function DocumentPage({ documentId }: { documentId: string }) {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <BlockEditor documentId={documentId} />
    </div>
  );
}
```

### Document List with Filters

```tsx
import { useDocumentStore } from "@/stores/document-store";
import { DocumentTree } from "@/components/documents";

function DocumentSidebar() {
  const { setCurrentDocument } = useDocumentStore();
  
  return (
    <DocumentTree 
      onSelectDocument={setCurrentDocument}
      selectedId={currentDocumentId}
    />
  );
}
```

### Creating Documents

```tsx
import { useDocumentStore } from "@/stores/document-store";

function CreateDocumentButton() {
  const { createDocument } = useDocumentStore();
  
  const handleCreate = async () => {
    const id = await createDocument("New Document", folderId, subject);
    // Navigate to new document
  };
  
  return <button onClick={handleCreate}>Create</button>;
}
```

### Using Hooks

```tsx
import { useDocument, useDocuments } from "@/hooks/useDocuments";

function DocumentView({ id }: { id: string }) {
  const { document, loading, updateDocument } = useDocument(id);
  
  if (loading) return <div>Loading...</div>;
  
  return <div>{document?.title}</div>;
}

function DocumentList() {
  const { documents, refresh } = useDocuments({ subject: "economics" });
  
  return (
    <ul>
      {documents.map(doc => (
        <li key={doc.id}>{doc.title}</li>
      ))}
    </ul>
  );
}
```

## Customization

### Adding New Block Types

1. Add to `lib/documents/blocks.ts`:

```typescript
export const blockTypes = [
  // ... existing types
  { type: "custom", label: "Custom Block", icon: "✨", category: "advanced" },
] as const;
```

2. Add styles in `getBlockStyles()`:

```typescript
case "custom":
  return `${baseStyles} custom-styles-here`;
```

3. Add render in `Block.tsx`:

```typescript
if (block.type === "custom") {
  return <CustomBlockComponent />;
}
```

### Customizing Folder Colors

Edit the `FOLDER_COLORS` array in `DocumentTree.tsx`:

```typescript
const FOLDER_COLORS: FolderColor[] = [
  { name: "Yellow", value: "#E5D4A8" },
  { name: "Blue", value: "#A8C5D4" },
  // Add your colors
];
```

### Custom Export Formats

Add to `ExportMenu.tsx`:

```typescript
const exportOptions = [
  // ... existing options
  {
    id: "pdf" as const,
    label: "PDF",
    description: "Export as PDF",
    icon: FileText,
    color: "#FF0000",
  },
];
```

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Check that all files are in the correct locations
   - Verify import paths match your project structure

2. **TypeScript errors**
   - Ensure `types/index.ts` is properly merged with existing types
   - Check that all dependencies are installed

3. **Database errors**
   - Run the migration SQL file
   - Verify Supabase connection settings

4. **Blocks not rendering**
   - Check that block types are properly defined
   - Verify Block component handles all block types

### Debug Mode

Enable debug logging:

```typescript
// In browser console
localStorage.setItem('document-debug', 'true');
```

## Support

For issues or questions:
1. Check the README: `DOCUMENT_SYSTEM_README.md`
2. Review the summary: `DOCUMENT_SYSTEM_SUMMARY.md`
3. Check the GitHub repository issues
