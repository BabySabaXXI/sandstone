# Sandstone Feedback System Integration Guide

This guide explains how to integrate the feedback system into the existing Sandstone application.

## Quick Start

### 1. Copy Files to Project

Copy all files from `sandstone-feedback/` to your project root:

```bash
cp -r sandstone-feedback/components/* your-project/components/
cp -r sandstone-feedback/hooks/* your-project/hooks/
cp -r sandstone-feedback/lib/* your-project/lib/
cp -r sandstone-feedback/store/* your-project/store/
```

### 2. Update Dependencies

Ensure you have the required dependencies in `package.json`:

```json
{
  "dependencies": {
    "sonner": "^2.0.7",
    "framer-motion": "^11.0.0",
    "zustand": "^4.5.0",
    "lucide-react": "^0.344.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

Install if needed:
```bash
npm install sonner framer-motion zustand lucide-react clsx tailwind-merge
```

### 3. Update Layout

Update `app/layout.tsx` to include the FeedbackProvider:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { FeedbackProvider } from "@/components/feedback";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Sandstone - AI-Powered Learning",
  description: "AI-powered A-Level response grading with detailed examiner feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <FeedbackProvider
              toastPosition="top-center"
              toastDuration={4000}
              enableNetworkStatus={true}
              enableKeyboardShortcuts={true}
            >
              {children}
            </FeedbackProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Usage Examples

### Document Operations

```tsx
// components/documents/DocumentTree.tsx
import { useToastFeedback } from '@/hooks';
import { DeleteDialog } from '@/components/ui';

export function DocumentTree() {
  const toast = useToastFeedback();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    const toastId = toast.loading('Creating document...');
    try {
      await createDocument();
      toast.dismiss(toastId);
      toast.success('Document created!');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to create document');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDocument(deleteId);
      toast.success('Document deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  return (
    <>
      <button onClick={handleCreate}>New Document</button>
      
      <DeleteDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        itemType="document"
      />
    </>
  );
}
```

### File Upload with Progress

```tsx
// components/documents/FileUpload.tsx
import { useState } from 'react';
import { useFeedbackStore } from '@/store';
import { FileUploadProgress } from '@/components/ui';

export function FileUpload() {
  const [uploads, setUploads] = useState([]);
  const startProgress = useFeedbackStore((state) => state.startProgress);
  const updateProgress = useFeedbackStore((state) => state.updateProgress);
  const completeProgress = useFeedbackStore((state) => state.completeProgress);

  const handleUpload = async (file: File) => {
    const progressId = startProgress({
      title: `Uploading ${file.name}`,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      await uploadFile(formData, {
        onProgress: (progress) => {
          updateProgress(progressId, progress);
        },
      });

      completeProgress(progressId, 'Upload complete!');
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="space-y-2">
      {uploads.map((upload) => (
        <FileUploadProgress
          key={upload.id}
          fileName={upload.name}
          progress={upload.progress}
          fileSize={upload.size}
          status={upload.status}
        />
      ))}
    </div>
  );
}
```

### Grading Feedback

```tsx
// components/grading/GradingForm.tsx
import { useFeedback } from '@/hooks';
import { LoadingFeedback, SuccessFeedback } from '@/components/ui';

export function GradingForm() {
  const { execute, isLoading, isSuccess, data } = useFeedback({
    successMessage: 'Response submitted for grading',
    errorMessage: 'Failed to submit response',
  });

  const handleSubmit = async (response: string) => {
    await execute(submitForGrading(response));
  };

  if (isLoading) {
    return (
      <LoadingFeedback
        title="Analyzing your response"
        message="Our AI is reviewing your answer..."
      />
    );
  }

  if (isSuccess && data) {
    return (
      <SuccessFeedback
        title="Grading Complete!"
        message={`Score: ${data.score}/100`}
        action={{
          label: 'View Feedback',
          onClick: () => showFeedback(data),
        }}
      />
    );
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Flashcard Operations

```tsx
// components/flashcards/DeckManager.tsx
import { useToastFeedback } from '@/hooks';
import { ToastMessages } from '@/lib';

export function DeckManager() {
  const toast = useToastFeedback();

  const handleCreateDeck = async (name: string) => {
    try {
      await createDeck(name);
      ToastMessages.flashcards.deckCreated();
    } catch (error) {
      toast.error('Failed to create deck');
    }
  };

  const handleStudyComplete = (stats: StudyStats) => {
    ToastMessages.flashcards.studyComplete(
      `${stats.correct}/${stats.total} cards mastered`
    );
  };

  return <div>...</div>;
}
```

### AI Generation Feedback

```tsx
// components/layout/AIChat.tsx
import { useFeedback } from '@/hooks';
import { ProcessingStatus } from '@/components/ui';

export function AIChat() {
  const { status, execute } = useFeedback({
    showToast: false, // We'll show custom UI instead
  });

  const handleGenerate = async (prompt: string) => {
    await execute(generateAIResponse(prompt));
  };

  return (
    <div>
      {status === 'loading' && (
        <ProcessingStatus
          title="AI is thinking..."
          steps={[
            { label: 'Analyzing prompt', status: 'completed' },
            { label: 'Generating response', status: 'processing' },
            { label: 'Formatting output', status: 'pending' },
          ]}
        />
      )}
      
      {/* Chat UI */}
    </div>
  );
}
```

### Auth Feedback

```tsx
// components/auth-provider.tsx
import { ToastMessages } from '@/lib';
import { useFeedbackStore } from '@/store';

export function AuthProvider({ children }) {
  const showToast = useFeedbackStore((state) => state.showToast);

  const handleLogin = async (credentials) => {
    try {
      const user = await login(credentials);
      ToastMessages.auth.loginSuccess(user.name);
    } catch (error) {
      ToastMessages.auth.loginError();
    }
  };

  const handleLogout = async () => {
    const { confirm } = useFeedbackStore.getState();
    confirm({
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      onConfirm: async () => {
        await logout();
        ToastMessages.auth.logoutSuccess();
      },
    });
  };

  return <>{children}</>;
}
```

## Best Practices

### 1. Use Toast for Simple Feedback

```tsx
// Good
const toast = useToastFeedback();
toast.success('Saved!');

// Avoid
alert('Saved!');
```

### 2. Use Feedback Hook for Async Operations

```tsx
// Good
const { execute, isLoading } = useFeedback();
const handleClick = () => execute(saveData());

// Avoid
const [loading, setLoading] = useState(false);
const handleClick = async () => {
  setLoading(true);
  try {
    await saveData();
    toast.success('Saved!');
  } catch (error) {
    toast.error('Failed!');
  } finally {
    setLoading(false);
  }
};
```

### 3. Use Confirmation Dialogs for Destructive Actions

```tsx
// Good
const handleDelete = () => {
  confirm({
    title: 'Delete Document',
    message: 'This cannot be undone.',
    isDestructive: true,
    onConfirm: deleteDocument,
  });
};

// Avoid
const handleDelete = () => {
  if (confirm('Are you sure?')) {
    deleteDocument();
  }
};
```

### 4. Show Progress for Long Operations

```tsx
// Good
const progressId = startProgress({ title: 'Uploading...' });
updateProgress(progressId, 50);
completeProgress(progressId);

// Avoid
// No feedback during long operations
```

### 5. Handle Network Status

```tsx
const { isOnline } = useNetworkStatus();

if (!isOnline) {
  return (
    <StatusMessage type="offline" message="You are offline">
      Some features may be unavailable.
    </StatusMessage>
  );
}
```

## Customization

### Custom Toast Styles

Update `app/layout.tsx`:

```tsx
<Toaster
  position="top-center"
  toastOptions={{
    style: {
      background: '#your-color',
      color: '#your-text-color',
    },
  }}
/>
```

### Custom Alert Styles

```tsx
<Alert
  variant="custom"
  className="bg-purple-100 border-purple-500"
>
  Custom styled alert
</Alert>
```

## Troubleshooting

### Toasts not appearing
- Check that `FeedbackProvider` is wrapping your app
- Verify Sonner is installed: `npm install sonner`

### Animations not working
- Check that Framer Motion is installed: `npm install framer-motion`
- Verify no CSS is overriding animations

### Store not persisting
- Check that Zustand persist middleware is configured
- Verify localStorage is available

## Migration from Existing Toast System

If you're using a different toast library:

1. Replace existing toast imports with new ones
2. Update toast calls to use new API
3. Remove old toast provider
4. Add FeedbackProvider to layout

Example migration:

```tsx
// Before
import { toast } from 'react-hot-toast';
toast.success('Saved!');

// After
import { useToastFeedback } from '@/hooks';
const toast = useToastFeedback();
toast.success('Saved!');
```
