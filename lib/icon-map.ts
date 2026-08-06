import {
  BadgeCheck,
  CalendarCheck,
  Camera,
  Gift,
  Headphones,
  MapPin,
  Megaphone,
  Monitor,
  Search,
  Share2,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icons are stored in the database as lucide-react component names, since a
 * Postgres column cannot hold a React component. Add an entry here before
 * using a new icon name in the admin dashboard.
 */
export const iconMap: Record<string, LucideIcon> = {
  BadgeCheck,
  CalendarCheck,
  Camera,
  Gift,
  Headphones,
  MapPin,
  Megaphone,
  Monitor,
  Search,
  Share2,
  Sparkles,
  Star,
  Zap,
};

/** Falls back to a neutral icon so an unknown name never crashes a page. */
export function resolveIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Sparkles;
  return iconMap[name] ?? Sparkles;
}
