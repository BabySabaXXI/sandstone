# Sandstone Document Management System

A comprehensive, feature-rich document management system for the Sandstone learning platform.

## Features

### Block Editor
- **14 Block Types**: Heading 1/2/3, Paragraph, Bullet List, Numbered List, Checklist, Quote, Callout, Code Block, Image, Divider, Table, Equation
- **Slash Commands**: Type `/` to open the command menu with search and keyboard shortcuts
- **Block Toolbar**: Contextual toolbar for each block with convert, duplicate, move, and delete actions
- **Keyboard Navigation**: Full keyboard support for efficient editing
- **Auto-save**: Automatic saving with debounced sync to Supabase

### Document Organization
- **Folders**: Create, rename, delete folders with custom colors
- **Drag & Drop**: Move documents between folders via drag and drop
- **Tags**: Add, remove, and filter documents by tags
- **Search**: Full-text search across document titles and content
- **Sorting**: Sort by name, date created, date modified, or subject
- **Filtering**: Filter by tags and search queries

### Content Blocks
- **Rich Text Editing**: Contenteditable-based blocks with placeholder support
- **Checklists**: Interactive checkboxes with state persistence
- **Code Blocks**: Syntax highlighting support with language selection
- **Callouts**: Highlighted info boxes with customizable icons and colors
- **Images**: Image block support with captions (URL-based)

### Export Functionality
- **Markdown Export**: Export documents as `.md` files
- **JSON Export**: Export documents as structured `.json` files
- **Plain Text Export**: Export documents as `.txt` files
- **Bulk Export**: Export all documents at once

### Enhanced UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Animations**: Smooth transitions with Framer Motion
- **Dark Mode Ready**: Color scheme supports dark mode
- **Accessibility**: ARIA labels and keyboard navigation
- **Stats Dashboard**: View document statistics and recent activity

## File Structure

```
output/
├── app/
│   └── documents/
│       └── page.tsx          # Main documents page
├── components/
│   └── documents/
│       ├── index.ts          # Component exports
│       ├── Block.tsx         # Individual block component
│       ├── BlockEditor.tsx   # Main editor component
│       ├── BlockToolbar.tsx  # Block action toolbar
│       ├── DocumentTree.tsx  # Sidebar document tree
│       ├── ExportMenu.tsx    # Export options menu
│       ├── SlashCommand.tsx  # Slash command palette
│       └── TagInput.tsx      # Tag input component
├── hooks/
│   ├── index.ts              # Hook exports
│   ├── useAutoSave.ts        # Auto-save hook
│   └── useDocuments.ts       # Document data hooks
├── lib/
│   └── documents/
│       ├── index.ts          # Library exports
│       └── blocks.ts         # Block utilities and types
├── stores/
│   └── document-store.ts     # Zustand document store
└── types/
    └── index.ts              # TypeScript type definitions
```

## Usage

### Basic Setup

```tsx
import { DocumentsPage } from "@/app/documents/page";

export default function App() {
  return <DocumentsPage />;
}
```

### Using the Document Store

```tsx
import { useDocumentStore } from "@/stores/document-store";

function MyComponent() {
  const { 
    documents, 
    createDocument, 
    updateDocument,
    deleteDocument 
  } = useDocumentStore();

  const handleCreate = async () => {
    const id = await createDocument("My New Document");
    console.log("Created document:", id);
  };

  return (
    <button onClick={handleCreate}>
      Create Document
    </button>
  );
}
```

### Using Hooks

```tsx
import { useDocuments, useDocument } from "@/hooks/useDocuments";

function DocumentList() {
  const { documents, loading, refresh } = useDocuments();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <ul>
      {documents.map(doc => (
        <li key={doc.id}>{doc.title}</li>
      ))}
    </ul>
  );
}

function SingleDocument({ id }: { id: string }) {
  const { document, updateDocument } = useDocument(id);
  
  return (
    <div>
      <h1>{document?.title}</h1>
    </div>
  );
}
```

## Block Types

| Type | Description | Keyboard Shortcut |
|------|-------------|-------------------|
| `heading1` | Large heading | `1` |
| `heading2` | Medium heading | `2` |
| `heading3` | Small heading | `3` |
| `paragraph` | Regular text | `p` |
| `bullet` | Bullet list item | `b` |
| `numbered` | Numbered list item | `n` |
| `checklist` | Checkbox item | `c` |
| `quote` | Blockquote | `q` |
| `callout` | Highlighted info box | `l` |
| `code` | Code block | `x` |
| `image` | Image placeholder | `i` |
| `divider` | Horizontal line | `d` |
| `table` | Table (coming soon) | `t` |
| `equation` | Math equation (coming soon) | `e` |

## Keyboard Shortcuts

### Editor Shortcuts
- `Cmd/Ctrl + S` - Save document
- `Cmd/Ctrl + E` - Export document
- `Enter` - Create new block
- `Shift + Enter` - New line in current block
- `Backspace` (on empty block) - Delete block
- `/` - Open slash command menu
- `Escape` - Close menus

### Block Navigation
- `Arrow Up/Down` - Navigate between blocks
- `Tab` - Indent list items
- `Shift + Tab` - Outdent list items

## Database Schema

### Documents Table
```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  subject text not null,
  content jsonb default '[]'::jsonb,
  folder_id uuid references folders(id),
  tags text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### Folders Table
```sql
create table folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  subject text not null,
  parent_id uuid references folders(id),
  color text,
  created_at timestamp with time zone default now()
);
```

## Migration Guide

### From Old Document Store

1. Update imports:
```tsx
// Old
import { useDocumentStore } from "@/stores/document-store";

// New (same import, enhanced functionality)
import { useDocumentStore } from "@/stores/document-store";
```

2. Block type changes:
```tsx
// Old
{ type: "bullet", label: "Bullet List" }

// New (added category)
{ type: "bullet", label: "Bullet List", category: "list" }
```

3. Document structure (added tags):
```tsx
// Old
interface Document {
  id: string;
  title: string;
  blocks: DocumentBlock[];
}

// New
interface Document {
  id: string;
  title: string;
  blocks: DocumentBlock[];
  tags?: string[];  // New field
}
```

## Performance Considerations

1. **Debounced Sync**: Document changes are synced to Supabase with a 1-second debounce
2. **Memoized Components**: Block components use React.memo for performance
3. **Selector Hooks**: Use selector hooks to avoid unnecessary re-renders
4. **Lazy Loading**: Document content is loaded on demand

## Troubleshooting

### Common Issues

1. **Blocks not syncing**: Check Supabase connection and auth status
2. **Slash command not appearing**: Ensure focus is on a text block
3. **Export not working**: Check browser download permissions

### Debug Mode

Enable debug logging:
```tsx
// In browser console
localStorage.setItem('document-debug', 'true');
```

## Contributing

When adding new block types:

1. Add to `blockTypes` array in `lib/documents/blocks.ts`
2. Add styles in `getBlockStyles()` function
3. Add placeholder in `getPlaceholder()` function
4. Add icon in `SlashCommand.tsx` iconMap
5. Add render case in `Block.tsx`
6. Add serialization in `serializeBlock()` function

## License

MIT License - Part of the Sandstone Learning Platform
