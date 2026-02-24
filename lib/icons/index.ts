/**
 * Icon System
 * 
 * A comprehensive icon system for the Sandstone application.
 * 
 * Features:
 * - Tree-shaking friendly exports from lucide-react
 * - Centralized icon registry with categorized exports
 * - Accessible Icon component with proper ARIA attributes
 * - Optimized SVG icon component for custom icons
 * - Lazy loading support for performance optimization
 * - Consistent sizing, coloring, and animation system
 * 
 * @example
 * ```tsx
 * // Import specific icons (tree-shaking friendly)
 * import { Home, Settings, User } from "@/lib/icons";
 * 
 * // Use the Icon component
 * import { Icon } from "@/lib/icons";
 * <Icon icon={Home} size="lg" color="primary" />
 * 
 * // Use SVG icons for custom icons
 * import { SVGIcon, UploadIcon } from "@/lib/icons";
 * <UploadIcon size="md" />
 * 
 * // Lazy load icons
 * import { LazyIcon } from "@/lib/icons";
 * <LazyIcon icon={HeavyIcon} fallback={<Skeleton />} />
 * 
 * // Import icon categories
 * import { navigationIcons, actionIcons } from "@/lib/icons";
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export type {
  IconSize,
  IconColor,
  IconAnimation,
  BaseIconProps,
  SVGIconProps,
  LucideIconWrapperProps,
  NavIcon,
  IconCategory,
  IconSizeConfig,
  IconColorConfig,
} from "./types";

// ============================================================================
// Constants
// ============================================================================

export {
  ICON_SIZES,
  ICON_COLORS,
  ICON_ANIMATIONS,
  ICON_ACCESSIBILITY,
  COMPONENT_ICON_SIZES,
  LAZY_ICON_CONFIG,
  SVG_DEFAULTS,
  SVG_PATHS,
} from "./constants";

// ============================================================================
// Registry - All Lucide Icons (Tree-shaking friendly)
// ============================================================================

export {
  // Navigation
  Home,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  CornerUpLeft,
  CornerUpRight,
  ExternalLink,
  Link,
  LogOut,
  LogIn,
  // Actions
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Save,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  Undo,
  Redo,
  Search,
  Filter,
  SlidersHorizontal,
  MoreHorizontal,
  MoreVertical,
  GripVertical,
  Check,
  CheckCheck,
  XCircle,
  CheckCircle2,
  Circle,
  Square,
  // Status
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Loader2,
  Sparkles,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  // Files
  File,
  FileText,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  FileJson,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  Image,
  Images,
  Paperclip,
  // Communication
  Mail,
  MessageSquare,
  MessageCircle,
  Send,
  Share2,
  Bell,
  BellOff,
  Phone,
  Video,
  Mic,
  MicOff,
  // Media
  Play,
  Pause,
  StopCircle,
  SkipBack,
  SkipForward,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  // Editor
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Terminal,
  Type,
  Heading1,
  Heading2,
  Heading3,
  // Layout
  Layout,
  LayoutGrid,
  LayoutList,
  LayoutTemplate,
  Grid3X3,
  Columns,
  Rows3,
  PanelLeft,
  PanelRight,
  Sidebar,
  // Data
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Gauge,
  Calculator,
  // Time
  Clock,
  Calendar,
  CalendarDays,
  Timer,
  History,
  Hourglass,
  Watch,
  // User
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Contact,
  IdCard,
  // Settings
  Settings,
  Settings2,
  Cog,
  Wrench,
  Palette,
  Sun,
  Moon,
  Monitor,
  Keyboard,
  Globe,
  Languages,
  // Education
  BookOpen,
  Book,
  Library,
  GraduationCap,
  Award,
  Trophy,
  Medal,
  Certificate,
  Layers,
  Layers2,
  Brain,
  Lightbulb,
  Zap,
  Flame,
  // Development
  Bug,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Cpu,
  HardDrive,
  // Icon categories
  navigationIcons,
  actionIcons,
  statusIcons,
  fileIcons,
  communicationIcons,
  mediaIcons,
  editorIcons,
  layoutIcons,
  dataIcons,
  timeIcons,
  userIcons,
  settingsIcons,
  educationIcons,
  developmentIcons,
  allIcons,
} from "./registry";

// ============================================================================
// Components
// ============================================================================

// Main Icon component
export { Icon, IconXs, IconSm, IconMd, IconLg, IconXl } from "./Icon";
export type { IconProps } from "./Icon";

// Pre-colored icon components
export {
  IconPrimary,
  IconMuted,
  IconSuccess,
  IconWarning,
  IconError,
  IconInfo,
} from "./Icon";

// Animated icon components
export { IconSpin, IconPulse, IconBounce } from "./Icon";

// SVG Icon component
export {
  SVGIcon,
  UploadIcon,
  FileIcon,
  CloseIcon,
  UserIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  SpinnerIcon,
} from "./SVGIcon";
export type { SVGIconComponentProps } from "./SVGIcon";

// Lazy Icon component
export { LazyIcon, DynamicIcon, useLazyIcons } from "./LazyIcon";
export type { LazyIconProps, DynamicIconProps } from "./LazyIcon";

// ============================================================================
// Utilities
// ============================================================================

import { ICON_SIZES, ICON_COLORS, ICON_ANIMATIONS } from "./constants";
import { IconSize, IconColor, IconAnimation } from "./types";

/**
 * Get the Tailwind class for an icon size
 */
export function getIconSizeClass(size: IconSize): string {
  return ICON_SIZES[size].className;
}

/**
 * Get the pixel value for an icon size
 */
export function getIconSizePx(size: IconSize): number {
  return ICON_SIZES[size].px;
}

/**
 * Get the Tailwind class for an icon color
 */
export function getIconColorClass(color: IconColor): string {
  return ICON_COLORS[color].className;
}

/**
 * Get the CSS value for an icon color
 */
export function getIconColorValue(color: IconColor): string {
  return ICON_COLORS[color].value;
}

/**
 * Get the animation class for an icon
 */
export function getIconAnimationClass(animation: IconAnimation): string {
  return ICON_ANIMATIONS[animation];
}

// ============================================================================
// Re-export LucideIcon type for convenience
// ============================================================================

export type { LucideIcon } from "lucide-react";
