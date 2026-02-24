# Sandstone UI Components Library

A comprehensive collection of reusable UI components for the Sandstone app, built with React, TypeScript, Tailwind CSS, and Radix UI primitives.

## Features

- **Consistent Design** - All components follow the Sandstone Design System
- **TypeScript Support** - Full type safety with comprehensive type definitions
- **Accessibility** - Built on Radix UI primitives for excellent a11y
- **Customizable** - Extensive variants and styling options via CVA
- **Responsive** - Mobile-first design with responsive variants
- **Animation Ready** - Built-in support for smooth transitions and animations

## Installation

Components are already included in the project. Simply import from the barrel export:

```tsx
import { Button, Card, Input, Modal } from '@/components/ui';
```

## Component Categories

### Basic Components

#### Button
Versatile button with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// States
<Button loading>Loading</Button>
<Button disabled>Disabled</Button>
<Button leftIcon={<Icon />}>With Icon</Button>
```

#### Card
Flexible card component with multiple variants.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
  <CardFooter>Footer content</CardFooter>
</Card>

// Variants
<Card variant="default">Default</Card>
<Card variant="feature">Feature Card</Card>
<Card variant="interactive">Interactive Card</Card>
<Card variant="flat">Flat Card</Card>
<Card variant="ghost">Ghost Card</Card>
```

#### Input
Comprehensive input component with label, helper text, and error states.

```tsx
import { Input, Textarea, Select } from '@/components/ui';

<Input 
  label="Email" 
  placeholder="Enter your email"
  helper="We'll never share your email"
/>

<Input 
  label="Password" 
  type="password"
  error="Password must be at least 8 characters"
/>

<Input 
  label="Search"
  icon={<SearchIcon />}
  iconPosition="left"
/>

<Textarea 
  label="Description" 
  minRows={4}
/>

<Select 
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
/>
```

### Feedback Components

#### Alert
Display important messages with different severity levels.

```tsx
import { Alert, AlertTitle, AlertDescription, ToastAlert, InlineAlert, BannerAlert } from '@/components/ui';

<Alert variant="info">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>This is an informational message.</AlertDescription>
</Alert>

// Variants: default, info, success, warning, error, primary
<Alert variant="success" dismissible onDismiss={handleDismiss}>
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>

// Toast Alert
<ToastAlert 
  variant="success"
  title="Success!"
  message="Your changes have been saved."
  onClose={handleClose}
/>

// Inline Alert
<InlineAlert variant="error" message="This field is required" />

// Banner Alert
<BannerAlert 
  variant="warning"
  title="Maintenance Scheduled"
  message="The system will be down for maintenance on Sunday."
/>
```

#### Toast
Notification toasts with auto-dismiss and actions.

```tsx
import { useToast, ToastContainer, SimpleToast } from '@/components/ui';

// Using the hook
function MyComponent() {
  const { toasts, toast, dismiss, dismissAll } = useToast();
  
  const showToast = () => {
    toast({
      variant: 'success',
      title: 'Success!',
      description: 'Your changes have been saved.',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked'),
      },
    });
  };
  
  return (
    <>
      <button onClick={showToast}>Show Toast</button>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

// Simple Toast
<SimpleToast
  open={isOpen}
  onOpenChange={setIsOpen}
  variant="success"
  title="Success!"
  description="Your changes have been saved."
/>
```

#### Loading
Various loading indicators and skeletons.

```tsx
import { Spinner, Skeleton, Shimmer, LoadingState, PageLoading, SkeletonCard, SkeletonList } from '@/components/ui';

<Spinner size="md" variant="default" />
<Skeleton className="h-20 w-full" />
<Skeleton variant="avatar" />
<Skeleton variant="text" />
<Shimmer className="h-20 w-full" />

<LoadingState type="spinner" text="Loading..." />
<LoadingState type="skeleton" count={3} />
<PageLoading text="Loading page..." />
<SkeletonCard hasImage lines={2} />
<SkeletonList items={5} hasAvatar />
```

#### Empty State
Display empty states with consistent styling.

```tsx
import { EmptyState, NoResults, NoData, ComingSoon, ErrorState } from '@/components/ui';

<EmptyState
  icon={FileQuestion}
  title="No essays yet"
  description="Start by grading your first essay"
  action={{ label: "Grade Essay", onClick: handleAction }}
/>

<NoResults 
  searchTerm="query"
  onClearSearch={handleClear}
/>

<NoData 
  itemName="documents"
  onCreate={handleCreate}
/>

<ComingSoon featureName="Analytics" />

<ErrorState 
  error="Failed to load data"
  onRetry={handleRetry}
/>
```

### Overlay Components

#### Modal/Dialog
Flexible modal dialog with multiple sizes and specialized variants.

```tsx
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ConfirmModal, AlertModal } from '@/components/ui';

<Modal open={isOpen} onOpenChange={setIsOpen}>
  <ModalContent size="md">
    <ModalHeader>
      <ModalTitle>Modal Title</ModalTitle>
      <ModalDescription>Modal description</ModalDescription>
    </ModalHeader>
    <ModalBody>Content goes here</ModalBody>
    <ModalFooter>
      <Button variant="secondary" onClick={handleClose}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </ModalFooter>
  </ModalContent>
</Modal>

// Sizes: sm, md, lg, xl, 2xl, 3xl, 4xl, full

// Confirm Modal
<ConfirmModal
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Delete Item?"
  description="This action cannot be undone."
  confirmText="Delete"
  confirmVariant="destructive"
/>

// Alert Modal
<AlertModal
  isOpen={isOpen}
  onClose={handleClose}
  title="Success!"
  description="Your changes have been saved."
  variant="success"
/>
```

#### Dropdown
Comprehensive dropdown menu with items, checkboxes, and radio items.

```tsx
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownCheckboxItem, DropdownRadioItem, DropdownLabel, DropdownSeparator, ActionDropdown, UserDropdown } from '@/components/ui';

<Dropdown>
  <DropdownTrigger>
    <Button>Open Menu</Button>
  </DropdownTrigger>
  <DropdownContent align="end" size="md">
    <DropdownLabel>Actions</DropdownLabel>
    <DropdownItem icon={<EditIcon />}>Edit</DropdownItem>
    <DropdownItem icon={<CopyIcon />} shortcut="⌘C">Copy</DropdownItem>
    <DropdownSeparator />
    <DropdownItem variant="destructive" icon={<TrashIcon />}>Delete</DropdownItem>
  </DropdownContent>
</Dropdown>

// Action Dropdown
<ActionDropdown
  trigger={<Button>Actions</Button>}
  actions={[
    { id: 'edit', label: 'Edit', icon: <EditIcon />, onClick: handleEdit },
    { id: 'delete', label: 'Delete', icon: <TrashIcon />, variant: 'destructive', onClick: handleDelete },
  ]}
  groups={[
    { label: 'General', actionIds: ['edit'] },
    { label: 'Danger Zone', actionIds: ['delete'] },
  ]}
/>

// User Dropdown
<UserDropdown
  trigger={<Avatar />}
  userName="John Doe"
  userEmail="john@example.com"
  onProfile={handleProfile}
  onSettings={handleSettings}
  onLogout={handleLogout}
/>
```

#### Tooltip
Simple and informative tooltips.

```tsx
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, SimpleTooltip, IconTooltip, InfoTooltip } from '@/components/ui';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>

// Simple Tooltip
<SimpleTooltip content="This is a tooltip">
  <Button>Hover me</Button>
</SimpleTooltip>

// Icon Tooltip
<IconTooltip 
  icon={<SettingsIcon />}
  label="Settings"
  onClick={handleClick}
/>

// Info Tooltip
<InfoTooltip content="Additional information about this field" />
```

### Navigation Components

#### Tabs
Flexible tabs with multiple variants and specialized layouts.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent, VerticalTabs, IconTabs, ScrollableTabs, BadgeTabs } from '@/components/ui';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>

// Variants: default, pills, underline, cards
<TabsList variant="pills">
  <TabsTrigger value="tab1" icon={<HomeIcon />}>Home</TabsTrigger>
</TabsList>

// Vertical Tabs
<VerticalTabs
  tabs={[
    { id: 'general', label: 'General', icon: <SettingsIcon />, content: <GeneralSettings /> },
    { id: 'security', label: 'Security', icon: <LockIcon />, content: <SecuritySettings /> },
  ]}
/>

// Icon Tabs
<IconTabs
  tabs={[
    { id: 'home', label: 'Home', icon: <HomeIcon />, content: <Home /> },
    { id: 'profile', label: 'Profile', icon: <UserIcon />, content: <Profile /> },
  ]}
  position="left"
/>

// Badge Tabs
<BadgeTabs
  tabs={[
    { id: 'all', label: 'All', badge: 10, content: <AllItems /> },
    { id: 'unread', label: 'Unread', badge: 3, badgeVariant: 'primary', content: <UnreadItems /> },
  ]}
/>
```

#### Accordion
Collapsible content sections with multiple variants.

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, FAQAccordion, SettingsAccordion, TreeAccordion, StepAccordion } from '@/components/ui';

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
  </AccordionItem>
</Accordion>

// Variants: default, bordered, card, ghost
<AccordionItem value="item-1" variant="card">
  <AccordionTrigger variant="card">Settings</AccordionTrigger>
  <AccordionContent>Content</AccordionContent>
</AccordionItem>

// FAQ Accordion
<FAQAccordion
  items={[
    { id: '1', question: 'What is Sandstone?', answer: 'Sandstone is...' },
    { id: '2', question: 'How do I get started?', answer: 'To get started...' },
  ]}
/>

// Settings Accordion
<SettingsAccordion
  sections={[
    { 
      id: 'account', 
      title: 'Account', 
      description: 'Manage your account settings',
      icon: <UserIcon />,
      content: <AccountSettings />
    },
  ]}
/>

// Step Accordion
<StepAccordion
  steps={[
    { id: '1', number: 1, title: 'Personal Info', content: <Step1 />, completed: true },
    { id: '2', number: 2, title: 'Address', content: <Step2 /> },
  ]}
/>
```

### Form Components

#### Switch
Toggle switch with label support.

```tsx
import { Switch, LabeledSwitch, SwitchGroup } from '@/components/ui';

<Switch checked={enabled} onCheckedChange={setEnabled} />

// Sizes: sm, md, lg
<Switch size="lg" variant="success" />

// Labeled Switch
<LabeledSwitch
  label="Enable notifications"
  description="Receive email notifications"
  checked={enabled}
  onCheckedChange={setEnabled}
/>

// Switch Group
<SwitchGroup
  items={[
    { id: 'email', label: 'Email', checked: emailEnabled, onChange: setEmailEnabled },
    { id: 'push', label: 'Push', checked: pushEnabled, onChange: setPushEnabled },
  ]}
/>
```

#### Checkbox
Checkbox with label and group support.

```tsx
import { Checkbox, IndeterminateCheckbox, LabeledCheckbox, CheckboxGroup, CheckboxCard } from '@/components/ui';

<Checkbox checked={checked} onCheckedChange={handleChange} />

// Indeterminate Checkbox
<IndeterminateCheckbox 
  checked={checked} 
  indeterminate={indeterminate}
  onCheckedChange={handleChange}
/>

// Labeled Checkbox
<LabeledCheckbox
  label="Accept terms"
  description="You must accept the terms to continue"
  checked={accepted}
  onCheckedChange={setAccepted}
/>

// Checkbox Group
<CheckboxGroup
  options={[
    { id: 'a', label: 'Option A' },
    { id: 'b', label: 'Option B' },
  ]}
  selected={selected}
  onChange={setSelected}
/>

// Checkbox Card
<CheckboxCard
  title="Pro Plan"
  description="Get access to all features"
  icon={<CrownIcon />}
  checked={selected}
  onCheckedChange={setSelected}
/>
```

#### Radio Group
Radio buttons with various layouts.

```tsx
import { RadioGroup, RadioGroupItem, LabeledRadio, RadioGroupOptions, RadioCard, RadioGroupCards, SegmentedControl } from '@/components/ui';

<RadioGroup value={value} onValueChange={setValue}>
  <RadioGroupItem value="option1" id="option1" />
  <label htmlFor="option1">Option 1</label>
</RadioGroup>

// Radio Group Options
<RadioGroupOptions
  options={[
    { value: 'monthly', label: 'Monthly', description: 'Billed monthly' },
    { value: 'yearly', label: 'Yearly', description: 'Billed annually' },
  ]}
  value={plan}
  onChange={setPlan}
/>

// Radio Cards
<RadioGroupCards
  options={[
    { value: 'basic', title: 'Basic', description: 'For individuals', icon: <UserIcon /> },
    { value: 'pro', title: 'Pro', description: 'For teams', icon: <UsersIcon /> },
  ]}
  value={plan}
  onChange={setPlan}
  columns={2}
/>

// Segmented Control
<SegmentedControl
  options={[
    { value: 'day', label: 'Day', icon: <SunIcon /> },
    { value: 'week', label: 'Week', icon: <CalendarIcon /> },
    { value: 'month', label: 'Month', icon: <CalendarDaysIcon /> },
  ]}
  value={view}
  onChange={setView}
/>
```

### Data Display Components

#### Badge
Status indicators and labels.

```tsx
import { Badge, ScoreBadge, StatusBadge, CountBadge } from '@/components/ui';

<Badge>Default</Badge>
<Badge variant="primary">New</Badge>
<Badge variant="success" dot>Online</Badge>

// Variants: default, primary, secondary, accent, success, warning, error, info, outline, ghost

// Score Badge
<ScoreBadge score={85} />
<ScoreBadge score={92} maxScore={100} size="lg" showMax />

// Status Badge
<StatusBadge status="completed" />
<StatusBadge status="processing" />
<StatusBadge status="failed" />

// Count Badge
<CountBadge count={5} />
<CountBadge count={150} max={99} />
```

#### Avatar
User avatars with various sizes and configurations.

```tsx
import { Avatar, AvatarImage, AvatarFallback, UserAvatar, AvatarGroup, AvatarWithDetails } from '@/components/ui';

<Avatar>
  <AvatarImage src="https://example.com/avatar.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// Sizes: xs, sm, md, lg, xl, 2xl, 3xl
<Avatar size="lg">
  <AvatarImage src="avatar.jpg" />
  <AvatarFallback size="lg">JD</AvatarFallback>
</Avatar>

// User Avatar with Status
<UserAvatar
  src="avatar.jpg"
  name="John Doe"
  email="john@example.com"
  status="online"
  showStatus
  size="md"
/>

// Avatar Group
<AvatarGroup
  avatars={[
    { id: '1', name: 'John', src: 'john.jpg' },
    { id: '2', name: 'Jane', src: 'jane.jpg' },
  ]}
  max={3}
/>

// Avatar with Details
<AvatarWithDetails
  src="avatar.jpg"
  name="John Doe"
  role="Administrator"
  layout="horizontal"
/>
```

## Design Tokens

All components use the following design tokens:

### Colors
- `--primary` - Primary brand color (peach)
- `--secondary` - Secondary color (sand)
- `--accent` - Accent colors
- `--success` - Success state (sage)
- `--warning` - Warning state (amber)
- `--error` - Error state (rose)
- `--info` - Info state (blue)
- `--sand-*` - Sand palette (50-950)
- `--peach-*` - Peach palette (50-600)

### Spacing
- Uses Tailwind's spacing scale
- Components use consistent padding (p-4, p-5, p-6)
- Gap utilities for internal spacing

### Border Radius
- `rounded-xl` (10px) - Default
- `rounded-2xl` (14px) - Cards, modals
- `rounded-lg` (6px) - Buttons, inputs
- `rounded-full` - Badges, avatars

### Shadows
- `shadow-soft-sm` - Subtle elevation
- `shadow-soft-md` - Medium elevation
- `shadow-soft-lg` - High elevation

## Customization

Components can be customized via:

1. **ClassName prop** - Add custom Tailwind classes
2. **CVA variants** - Use predefined variants
3. **CSS variables** - Override design tokens in globals.css

## Accessibility

All components:
- Support keyboard navigation
- Include proper ARIA attributes
- Work with screen readers
- Respect `prefers-reduced-motion`
- Have visible focus states

## Dependencies

- `@radix-ui/react-*` - Headless UI primitives
- `class-variance-authority` - Variant management
- `tailwind-merge` - Class merging
- `clsx` - Conditional classes
- `lucide-react` - Icons
