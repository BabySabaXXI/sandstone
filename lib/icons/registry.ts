/**
 * Icon Registry
 * 
 * Centralized icon exports with tree-shaking support.
 * All icons are re-exported from lucide-react for consistent usage.
 * 
 * Usage:
 * ```tsx
 * import { Home, Settings, User } from "@/lib/icons/registry";
 * 
 * // Or import specific categories
 * import { navigationIcons, actionIcons } from "@/lib/icons/registry";
 * ```
 */

// ============================================================================
// Re-exports from lucide-react (Tree-shaking friendly)
// ============================================================================

// Navigation Icons
export {
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
} from "lucide-react";

// Action Icons
export {
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
} from "lucide-react";

// Status Icons
export {
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
} from "lucide-react";

// File & Document Icons
export {
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
} from "lucide-react";

// Communication Icons
export {
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
} from "lucide-react";

// Media Icons
export {
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
} from "lucide-react";

// Editor Icons
export {
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
} from "lucide-react";

// Layout Icons
export {
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
} from "lucide-react";

// Data & Analytics Icons
export {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Gauge,
  Calculator,
} from "lucide-react";

// Time Icons
export {
  Clock,
  Calendar,
  CalendarDays,
  Timer,
  History,
  Hourglass,
  Watch,
} from "lucide-react";

// User Icons
export {
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Contact,
  IdCard,
} from "lucide-react";

// Settings Icons
export {
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
} from "lucide-react";

// Education & Learning Icons
export {
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
} from "lucide-react";

// Development Icons
export {
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
} from "lucide-react";

// ============================================================================
// Icon Categories (for organized imports)
// ============================================================================

import {
  // Navigation
  Home,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  // Actions
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  XCircle,
  CheckCircle2,
  // Status
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Loader2,
  Sparkles,
  Star,
  Eye,
  EyeOff,
  Lock,
  // Files
  File,
  FileText,
  Folder,
  FolderOpen,
  Image,
  Paperclip,
  // Communication
  Mail,
  MessageSquare,
  Send,
  Share2,
  Bell,
  // Media
  Play,
  Pause,
  Volume2,
  VolumeX,
  // Editor
  Bold,
  Italic,
  List,
  Code,
  // Layout
  LayoutGrid,
  LayoutList,
  Sidebar,
  // Data
  BarChart3,
  TrendingUp,
  Activity,
  // Time
  Clock,
  Calendar,
  History,
  // User
  User,
  Users,
  UserPlus,
  // Settings
  Settings,
  Sun,
  Moon,
  Globe,
  // Education
  BookOpen,
  Library,
  GraduationCap,
  Award,
  Layers,
  Brain,
  Lightbulb,
  // Development
  Bug,
  Database,
  Cloud,
  Wifi,
} from "lucide-react";

/** Navigation icons organized collection */
export const navigationIcons = {
  Home,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
} as const;

/** Action icons organized collection */
export const actionIcons = {
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  XCircle,
  CheckCircle2,
} as const;

/** Status icons organized collection */
export const statusIcons = {
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Loader2,
  Sparkles,
  Star,
  Eye,
  EyeOff,
  Lock,
} as const;

/** File icons organized collection */
export const fileIcons = {
  File,
  FileText,
  Folder,
  FolderOpen,
  Image,
  Paperclip,
} as const;

/** Communication icons organized collection */
export const communicationIcons = {
  Mail,
  MessageSquare,
  Send,
  Share2,
  Bell,
} as const;

/** Media icons organized collection */
export const mediaIcons = {
  Play,
  Pause,
  Volume2,
  VolumeX,
} as const;

/** Editor icons organized collection */
export const editorIcons = {
  Bold,
  Italic,
  List,
  Code,
} as const;

/** Layout icons organized collection */
export const layoutIcons = {
  LayoutGrid,
  LayoutList,
  Sidebar,
} as const;

/** Data icons organized collection */
export const dataIcons = {
  BarChart3,
  TrendingUp,
  Activity,
} as const;

/** Time icons organized collection */
export const timeIcons = {
  Clock,
  Calendar,
  History,
} as const;

/** User icons organized collection */
export const userIcons = {
  User,
  Users,
  UserPlus,
} as const;

/** Settings icons organized collection */
export const settingsIcons = {
  Settings,
  Sun,
  Moon,
  Globe,
} as const;

/** Education icons organized collection */
export const educationIcons = {
  BookOpen,
  Library,
  GraduationCap,
  Award,
  Layers,
  Brain,
  Lightbulb,
} as const;

/** Development icons organized collection */
export const developmentIcons = {
  Bug,
  Database,
  Cloud,
  Wifi,
} as const;

/** All icon categories combined */
export const allIcons = {
  navigation: navigationIcons,
  action: actionIcons,
  status: statusIcons,
  file: fileIcons,
  communication: communicationIcons,
  media: mediaIcons,
  editor: editorIcons,
  layout: layoutIcons,
  data: dataIcons,
  time: timeIcons,
  user: userIcons,
  settings: settingsIcons,
  education: educationIcons,
  development: developmentIcons,
} as const;
