import {
  Home,
  Users,
  CheckSquare,
  DollarSign,
  Radio,
  Flag,
  Newspaper,
  Vote,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/officials', label: 'Officials', icon: Users },
  { to: '/promises', label: 'Promises', icon: CheckSquare },
  { to: '/budget', label: 'Budget', icon: DollarSign },
  { to: '/updates', label: 'Updates', icon: Radio },
  { to: '/reports', label: 'Reports', icon: Flag },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/voting', label: 'Voting', icon: Vote },
]
