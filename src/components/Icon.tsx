import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  Camera,
  Check,
  Plus,
  Minus,
  Star,
  Bell,
  Home,
  Users,
  ShoppingBag,
  User,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Search,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Filter,
  Navigation,
  LogOut,
  Sliders,
  Calendar,
  TrendingUp,
  BarChart2,
  Briefcase,
  Clock,
  Sparkles,
  ShieldCheck,
  Phone,
  PhoneCall,
  Mail,
  Building,
  Store,
  Tag,
  CreditCard,
  DollarSign,
  Package,
  Layers,
  Edit,
  Circle,
  CheckCircle,
  Compass,
  X,
  FileText,
  Target,
  Award,
  Zap,
  Send,
  Moon,
  Sun,
  Settings,
} from 'lucide-react-native';

export type IconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'map-pin'
  | 'camera'
  | 'check'
  | 'plus'
  | 'minus'
  | 'star'
  | 'bell'
  | 'home'
  | 'users'
  | 'shopping-bag'
  | 'user'
  | 'clipboard-list'
  | 'refresh'
  | 'alert-circle'
  | 'arrow-right'
  | 'search'
  | 'eye'
  | 'eye-off'
  | 'check-square'
  | 'square'
  | 'filter'
  | 'navigation'
  | 'logout'
  | 'sliders'
  | 'calendar'
  | 'trending-up'
  | 'bar-chart'
  | 'briefcase'
  | 'clock'
  | 'sparkles'
  | 'shield-check'
  | 'phone'
  | 'phone-call'
  | 'mail'
  | 'building'
  | 'store'
  | 'tag'
  | 'credit-card'
  | 'dollar'
  | 'package'
  | 'layers'
  | 'edit'
  | 'circle'
  | 'check-circle'
  | 'compass'
  | 'x'
  | 'file-text'
  | 'target'
  | 'award'
  | 'zap'
  | 'send'
  | 'moon'
  | 'sun'
  | 'settings';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = '#111827',
  strokeWidth = 2,
}) => {
  const iconMap: Record<IconName, React.ElementType> = {
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    'chevron-down': ChevronDown,
    'map-pin': MapPin,
    camera: Camera,
    check: Check,
    plus: Plus,
    minus: Minus,
    star: Star,
    bell: Bell,
    home: Home,
    users: Users,
    'shopping-bag': ShoppingBag,
    user: User,
    'clipboard-list': ClipboardList,
    refresh: RefreshCw,
    'alert-circle': AlertCircle,
    'arrow-right': ArrowRight,
    search: Search,
    eye: Eye,
    'eye-off': EyeOff,
    'check-square': CheckSquare,
    square: Square,
    filter: Filter,
    navigation: Navigation,
    logout: LogOut,
    sliders: Sliders,
    calendar: Calendar,
    'trending-up': TrendingUp,
    'bar-chart': BarChart2,
    briefcase: Briefcase,
    clock: Clock,
    sparkles: Sparkles,
    'shield-check': ShieldCheck,
    phone: Phone,
    'phone-call': PhoneCall,
    mail: Mail,
    building: Building,
    store: Store,
    tag: Tag,
    'credit-card': CreditCard,
    dollar: DollarSign,
    package: Package,
    layers: Layers,
    edit: Edit,
    circle: Circle,
    'check-circle': CheckCircle,
    compass: Compass,
    x: X,
    'file-text': FileText,
    target: Target,
    award: Award,
    zap: Zap,
    send: Send,
    moon: Moon,
    sun: Sun,
    settings: Settings,
  };

  const Component = iconMap[name] || ClipboardList;
  return <Component size={size} color={color} strokeWidth={strokeWidth} />;
};
