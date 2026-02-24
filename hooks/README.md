# Sandstone Custom Hooks

A comprehensive collection of custom React hooks for the Sandstone application.

## Table of Contents

- [Data Fetching](#data-fetching)
- [Form Handling](#form-handling)
- [Storage](#storage)
- [Debounce & Throttle](#debounce--throttle)
- [Media Queries](#media-queries)
- [Intersection Observer](#intersection-observer)
- [Utilities](#utilities)

---

## Data Fetching

### `useFetch`

Hook for data fetching with fetch API.

```tsx
import { useFetch } from "@/hooks";

function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, isFetching, refetch } = useFetch<User>({
    url: `/api/users/${userId}`,
    enabled: !!userId,
    onSuccess: (data) => console.log("Fetched:", data),
    onError: (error) => console.error("Error:", error),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data?.name}</h1>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### `useSupabaseQuery`

Hook for Supabase queries with proper state management.

```tsx
import { useSupabaseQuery } from "@/hooks";
import { supabase } from "@/lib/supabase/client";

function DocumentsList() {
  const query = supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  const { data, error, isLoading, refetch } = useSupabaseQuery({
    query,
    enabled: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map((doc) => (
        <li key={doc.id}>{doc.title}</li>
      ))}
    </ul>
  );
}
```

---

## Form Handling

### `useForm`

Hook for form handling with Zod validation.

```tsx
import { useForm } from "@/hooks";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  } = useForm<FormData>({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async (values) => {
      await login(values);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={values.email}
        onChange={(e) => handleChange("email")(e.target.value)}
        onBlur={handleBlur("email")}
      />
      {touched.email && errors.email && <span>{errors.email}</span>}

      <input
        type="password"
        value={values.password}
        onChange={(e) => handleChange("password")(e.target.value)}
        onBlur={handleBlur("password")}
      />
      {touched.password && errors.password && <span>{errors.password}</span>}

      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>

      <button type="button" onClick={() => reset()}>
        Reset
      </button>
    </form>
  );
}
```

### `useField`

Hook for individual form field handling.

```tsx
import { useField } from "@/hooks";
import { z } from "zod";

function EmailField() {
  const { value, error, touched, onChange, onBlur, reset } = useField({
    name: "email",
    initialValue: "",
    validationSchema: z.string().email("Invalid email"),
    validateOnBlur: true,
  });

  return (
    <div>
      <input
        type="email"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {touched && error && <span>{error}</span>}
    </div>
  );
}
```

---

## Storage

### `useLocalStorage`

Hook for local storage with SSR support and cross-tab sync.

```tsx
import { useLocalStorage } from "@/hooks";

function ThemeToggle() {
  const { value, setValue, removeValue, isLoaded } = useLocalStorage({
    key: "theme",
    initialValue: "light",
    syncAcrossTabs: true,
  });

  if (!isLoaded) return null;

  return (
    <button onClick={() => setValue(value === "light" ? "dark" : "light")}>
      Current: {value}
    </button>
  );
}
```

---

## Debounce & Throttle

### `useDebounce`

Hook for debouncing a value.

```tsx
import { useDebounce } from "@/hooks";

function SearchInput() {
  const [search, setSearch] = useState("");
  const { debouncedValue, isPending, cancel } = useDebounce(search, {
    delay: 500,
    trailing: true,
  });

  useEffect(() => {
    // Search API call with debouncedValue
    searchAPI(debouncedValue);
  }, [debouncedValue]);

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {isPending && <span>Typing...</span>}
    </div>
  );
}
```

### `useDebouncedCallback`

Hook for debouncing a callback function.

```tsx
import { useDebouncedCallback } from "@/hooks";

function SearchComponent() {
  const { callback: debouncedSearch, isPending } = useDebouncedCallback(
    (query: string) => {
      searchAPI(query);
    },
    { delay: 500, maxWait: 2000 }
  );

  return (
    <input
      type="text"
      onChange={(e) => debouncedSearch(e.target.value)}
    />
  );
}
```

### `useThrottle` / `useThrottledCallback`

Similar to debounce but with throttling behavior.

---

## Media Queries

### `useMediaQuery`

Hook for media query matching.

```tsx
import { useMediaQuery, useIsMobile, usePrefersDarkMode } from "@/hooks";

function ResponsiveComponent() {
  const isMobile = useIsMobile();
  const prefersDark = usePrefersDarkMode();
  const isLargeScreen = useMediaQuery("(min-width: 1440px)");

  return (
    <div className={prefersDark ? "dark" : "light"}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### Predefined Breakpoint Hooks

- `useIsMobile()` - max-width: 639px
- `useIsTablet()` - 640px to 1023px
- `useIsDesktop()` - min-width: 1024px
- `useIsLargeDesktop()` - min-width: 1280px

### Preference Hooks

- `usePrefersReducedMotion()`
- `usePrefersDarkMode()`
- `usePrefersLightMode()`
- `useHoverCapability()`
- `usePointerCoarse()`
- `usePointerFine()`

---

## Intersection Observer

### `useInView`

Hook for intersection observer.

```tsx
import { useInView } from "@/hooks";

function FadeInSection({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-500 ${
        inView ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
```

### `useInfiniteScroll`

Hook for infinite scroll.

```tsx
import { useInfiniteScroll } from "@/hooks";

function InfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(/* ... */);

  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <>
      {data?.pages.map((page) => (
        <Item key={page.id} data={page} />
      ))}
      <div ref={loadMoreRef}>
        {isFetchingNextPage && <Spinner />}
      </div>
    </>
  );
}
```

### `useScrollSpy`

Hook for scroll spy functionality.

```tsx
import { useScrollSpy } from "@/hooks";

function TableOfContents() {
  const { activeId } = useScrollSpy({
    sectionIds: ["intro", "features", "pricing", "contact"],
  });

  return (
    <nav>
      {["intro", "features", "pricing", "contact"].map((id) => (
        <a
          key={id}
          href={`#${id}`}
          className={activeId === id ? "active" : ""}
        >
          {id}
        </a>
      ))}
    </nav>
  );
}
```

---

## Utilities

### `useToggle`

Hook for boolean toggle state.

```tsx
import { useToggle } from "@/hooks";

function Modal() {
  const { value: isOpen, toggle, setTrue: open, setFalse: close } = useToggle(false);

  return (
    <>
      <button onClick={open}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <button onClick={close}>Close</button>
        </div>
      )}
    </>
  );
}
```

### `useOnClickOutside`

Hook to handle clicks outside an element.

```tsx
import { useOnClickOutside } from "@/hooks";

function Dropdown() {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div className="dropdown-menu">Menu items</div>}
    </div>
  );
}
```

### `useKeyPress` / `useKeyCombo`

Hook for keyboard event handling.

```tsx
import { useKeyPress, useKeyCombo } from "@/hooks";

function KeyboardShortcuts() {
  const { pressed } = useKeyPress("Escape");
  const { pressed: ctrlS } = useKeyPress("ctrl+s");

  useKeyCombo("cmd+k", () => {
    openCommandPalette();
  });

  useEffect(() => {
    if (pressed) closeModal();
  }, [pressed]);

  return <div>Press Cmd+K for command palette</div>;
}
```

### `useAsync`

Hook for async operations.

```tsx
import { useAsync } from "@/hooks";

function UserData({ userId }: { userId: string }) {
  const { execute, data, error, isPending, isSuccess } = useAsync(fetchUser);

  useEffect(() => {
    execute(userId);
  }, [userId]);

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (isSuccess) return <div>Hello, {data.name}!</div>;

  return null;
}
```

### `useCopyToClipboard`

Hook for copying text to clipboard.

```tsx
import { useCopyToClipboard } from "@/hooks";

function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useCopyToClipboard({ timeout: 2000 });

  return (
    <button onClick={() => copy(text)}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
```

### `useHover` / `useHoverDelay`

Hook for hover state tracking.

```tsx
import { useHover, useHoverDelay } from "@/hooks";

function Tooltip() {
  const { ref, isHovered } = useHoverDelay({
    enterDelay: 200,
    leaveDelay: 100,
  });

  return (
    <div ref={ref}>
      Hover me
      {isHovered && <div className="tooltip">Tooltip content</div>}
    </div>
  );
}
```

### `useWindowSize` / `useWindowScroll`

Hooks for window dimensions and scroll position.

```tsx
import { useWindowSize, useWindowScroll } from "@/hooks";

function ScrollIndicator() {
  const { width, height, isMobile } = useWindowSize();
  const { y, scrollToTop } = useWindowScroll();

  const scrollPercent = (y / (document.body.scrollHeight - height)) * 100;

  return (
    <>
      <div
        className="scroll-indicator"
        style={{ width: `${scrollPercent}%` }}
      />
      {y > 500 && (
        <button onClick={scrollToTop} className="back-to-top">
          ↑
        </button>
      )}
    </>
  );
}
```

### `useAutoSave`

Hook for auto-saving data with debouncing.

```tsx
import { useAutoSave } from "@/hooks";

function DocumentEditor({ documentId }: { documentId: string }) {
  const [content, setContent] = useState("");

  const { isDirty, save, cancel } = useAutoSave({
    data: content,
    onSave: async (data) => {
      await saveDocument(documentId, data);
    },
    delay: 2000,
  });

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {isDirty && <span>Unsaved changes...</span>}
      <button onClick={save}>Save Now</button>
      <button onClick={cancel}>Cancel</button>
    </div>
  );
}
```

---

## Best Practices

1. **Always clean up**: All hooks properly clean up event listeners, timeouts, and observers on unmount.

2. **SSR-safe**: Hooks that access browser APIs check for `typeof window !== "undefined"`.

3. **TypeScript support**: All hooks are fully typed with generic support.

4. **Dependency optimization**: Hooks use `useCallback` and `useRef` to prevent unnecessary re-renders.

5. **Cancellation support**: Async hooks provide cancellation mechanisms where applicable.

---

## License

MIT
