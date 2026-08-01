// ─────────────────────────────────────────────────────────────
// Shared data types for the SBO Web Portal
//
// These map 1:1 to the tables described in supabase/schema.sql.
// Keeping them in one place means swapping the mock data layer
// (src/lib/store.ts) for real Supabase calls later doesn't
// require touching any page or component — only store.ts changes.
// ─────────────────────────────────────────────────────────────

export type PromiseStatus = 'pending' | 'in-progress' | 'completed'
export type ReportStatus = 'new' | 'in-review' | 'resolved'
export type ReportVisibility = 'public' | 'anonymous'
export type UpdateCategory =
  | 'General Assembly'
  | 'Exec Board'
  | 'Finance'
  | 'Event'
  | 'Policy'
export type NewsCategory = 'Announcement' | 'Events' | 'Update'
export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange'

export interface Officer {
  id: string
  name: string
  position: string
  order: number // controls display order (President first, etc.)
  year: string
  major: string
  email: string
  photoUrl: string
  bio?: string
}

export interface Promise_ {
  id: string
  title: string
  description: string
  officerId: string
  officerName: string
  status: PromiseStatus
  progress: number // 0-100
  impactNote?: string // short "what happened" line once completed
  updatedAt: string
}

export interface BudgetItem {
  id: string
  category: string
  allocated: number
  spent: number
  description?: string
}

export interface UpdateEntry {
  id: string
  title: string
  category: UpdateCategory
  description: string
  date: string
}

export interface Report {
  id: string
  trackingCode: string
  visibility: ReportVisibility
  fullName?: string
  email?: string
  category: string
  content: string
  status: ReportStatus
  adminNotes?: string
  createdAt: string
}

export interface NewsPost {
  id: string
  title: string
  category: NewsCategory
  content: string
  imageUrl?: string
  date: string
}

export interface PollOption {
  id: string
  label: string
  votes: number
}

export interface Poll {
  id: string
  question: string
  type: 'single' | 'multiple'
  options: PollOption[]
  startDate: string
  endDate: string
  isOpen: boolean
}

export interface FreedomMessage {
  id: string
  message: string
  color: NoteColor
  createdAt: string
  likes: number
}

export interface OrgStats {
  totalBudget: number
  totalSpent: number
}
