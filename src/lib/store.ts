// Data layer — reads and writes straight to Supabase. list() returns
// [] when Supabase is unconfigured/empty/errors; upsert()/remove()
// throw if it isn't configured. The only localStorage key left is a
// per-device "which poll option did I vote for" receipt used to
// disable the vote button — never as poll data itself.

import type {
  Officer,
  Promise_,
  BudgetItem,
  UpdateEntry,
  Report,
  NewsPost,
  Poll,
  PollOption,
  FreedomMessage,
  ScheduledEvent,
} from './types'
import { supabase } from './supabase'

const KEYS = {
  officers: 'sbo_officers',
  promises: 'sbo_promises',
  budget: 'sbo_budget',
  updates: 'sbo_updates',
  reports: 'sbo_reports',
  news: 'sbo_news',
  events: 'sbo_events',
  polls: 'sbo_polls',
  votedPolls: 'sbo_voted_polls',
  freedomWall: 'sbo_freedom_wall',
  settings: 'sbo_settings',
} as const

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
  bus.dispatchEvent(new CustomEvent('change', { detail: key }))
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function dispatchChange(detail: string = 'all') {
  bus.dispatchEvent(new CustomEvent('change', { detail }))
}

export const bus = new EventTarget()

const uid = () => {
  if (typeof globalThis !== 'undefined' && typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16)
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

const nowISO = () => new Date().toISOString().slice(0, 10)

function toCamelOfficer(row: any): Officer {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    order: row.order,
    year: row.year,
    major: row.major,
    email: row.email,
    photoUrl: row.photo_url ?? row.photoUrl ?? '',
    bio: row.bio,
  }
}

function toSnakeOfficer(row: Officer): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    order: row.order,
    year: row.year,
    major: row.major,
    email: row.email,
    photo_url: row.photoUrl,
    bio: row.bio,
  }
}

function toCamelPromise(row: any, officerName?: string): Promise_ {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    officerId: row.officer_id ?? row.officerId ?? '',
    officerName: officerName ?? row.officer_name ?? row.officerName ?? '',
    status: row.status,
    progress: row.progress,
    impactNote: row.impact_note ?? row.impactNote,
    updatedAt: row.updated_at ?? row.updatedAt ?? nowISO(),
  }
}

function toSnakePromise(row: Promise_): Record<string, unknown> {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    officer_id: row.officerId,
    status: row.status,
    progress: row.progress,
    impact_note: row.impactNote,
    updated_at: row.updatedAt,
  }
}

function toCamelBudget(row: any): BudgetItem {
  return {
    id: row.id,
    category: row.category,
    allocated: Number(row.allocated ?? 0),
    spent: Number(row.spent ?? 0),
    description: row.description,
  }
}

function toSnakeBudget(row: BudgetItem): Record<string, unknown> {
  return {
    id: row.id,
    category: row.category,
    allocated: row.allocated,
    spent: row.spent,
    description: row.description,
  }
}

function toCamelUpdate(row: any): UpdateEntry {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    date: row.date,
  }
}

function toSnakeUpdate(row: UpdateEntry): Record<string, unknown> {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    date: row.date,
  }
}

function toCamelReport(row: any): Report {
  return {
    id: row.id,
    trackingCode: row.tracking_code ?? row.trackingCode,
    visibility: row.visibility,
    fullName: row.full_name ?? row.fullName,
    email: row.email,
    studentId: row.student_id ?? row.studentId,
    section: row.section,
    contactMethod: row.contact_method ?? row.contactMethod,
    contactValue: row.contact_value ?? row.contactValue,
    category: row.category,
    content: row.content,
    status: row.status,
    adminNotes: row.admin_notes ?? row.adminNotes,
    adminReply: row.admin_reply ?? row.adminReply,
    isAnonymous: row.is_anonymous ?? row.isAnonymous ?? false,
    disclaimerAccepted: row.disclaimer_accepted ?? row.disclaimerAccepted ?? false,
    isApproved: row.is_approved ?? row.isApproved ?? false,
    isShadowbanned: row.is_shadowbanned ?? row.isShadowbanned ?? false,
    createdAt: row.created_at ?? row.createdAt,
    updatedAt: row.updated_at ?? row.updatedAt,
  }
}

function toSnakeReport(row: Report): Record<string, unknown> {
  return {
    id: row.id,
    tracking_code: row.trackingCode,
    visibility: row.visibility,
    full_name: row.fullName,
    email: row.email,
    student_id: row.studentId,
    section: row.section,
    contact_method: row.contactMethod,
    contact_value: row.contactValue,
    category: row.category,
    content: row.content,
    status: row.status,
    admin_notes: row.adminNotes,
    admin_reply: row.adminReply,
    is_anonymous: row.isAnonymous,
    disclaimer_accepted: row.disclaimerAccepted,
    is_approved: row.isApproved,
    is_shadowbanned: row.isShadowbanned,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }
}

function toCamelFreedomMessage(row: any): FreedomMessage {
  const meta = Array.isArray(row.freedom_wall_meta) ? row.freedom_wall_meta[0] : row.freedom_wall_meta ?? {}

  return {
    id: row.id,
    message: row.message,
    color: row.color,
    createdAt: row.created_at ?? row.createdAt,
    likes: row.likes ?? 0,
    isDeleted: row.is_deleted ?? row.isDeleted ?? false,
    deletedAt: row.deleted_at ?? row.deletedAt ?? null,
    deletedBy: row.deleted_by ?? row.deletedBy ?? null,
    nickname: meta.nickname ?? row.nickname ?? '',
    senderName: meta.sender_name ?? row.senderName ?? '',
    recipientName: meta.recipient_name ?? row.recipientName ?? '',
    spotifyUrl: meta.spotify_url ?? row.spotifyUrl ?? '',
    spotifyQuery: meta.spotify_query ?? row.spotifyQuery ?? '',
    songTitle: meta.song_title ?? row.songTitle ?? '',
    songArtist: meta.song_artist ?? row.songArtist ?? '',
    songArtwork: meta.song_artwork ?? row.songArtwork ?? '',
  }
}

function toSnakeFreedomMessage(row: FreedomMessage): Record<string, unknown> {
  return {
    id: row.id,
    message: row.message,
    color: row.color,
    created_at: row.createdAt,
    likes: row.likes,
    is_deleted: row.isDeleted ?? false,
    deleted_at: row.deletedAt ?? null,
    deleted_by: row.deletedBy ?? null,
  }
}

function toCamelPoll(row: any, options: PollOption[]): Poll {
  return {
    id: row.id,
    question: row.question,
    type: row.type,
    isOpen: row.is_open ?? true,
    options,
    startDate: row.start_date ?? row.startDate,
    endDate: row.end_date ?? row.endDate,
  }
}

function toSnakePoll(row: Poll): Record<string, unknown> {
  return {
    id: row.id,
    question: row.question,
    type: row.type,
    is_open: row.isOpen,
    start_date: row.startDate,
    end_date: row.endDate,
  }
}

function toCamelPollOption(row: any): PollOption {
  return {
    id: row.id,
    label: row.label,
    votes: row.votes ?? 0,
  }
}

function toCamelNewsPost(row: any): NewsPost {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    imageUrl: row.image_url ?? row.imageUrl ?? undefined,
    date: row.date,
  }
}

function toSnakeNewsPost(row: NewsPost): Record<string, unknown> {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    image_url: row.imageUrl,
    date: row.date,
  }
}

function toCamelEvent(row: any): ScheduledEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location,
    startDate: row.start_date ?? row.startDate,
    endDate: row.end_date ?? row.endDate ?? undefined,
    startTime: row.start_time ?? row.startTime ?? undefined,
    endTime: row.end_time ?? row.endTime ?? undefined,
    imageUrl: row.image_url ?? row.imageUrl ?? undefined,
  }
}

function toSnakeEvent(row: ScheduledEvent): Record<string, unknown> {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location,
    start_date: row.startDate,
    end_date: row.endDate,
    start_time: row.startTime,
    end_time: row.endTime,
    image_url: row.imageUrl,
  }
}

// Officers
export const officersDb = {
  async list(): Promise<Officer[]> {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase
      .from('officers')
      .select('*')
      .order('order', { ascending: true })

    if (error) {
      console.error('[officersDb] Error fetching officers:', error)
      return []
    }

    return (data ?? []).map(toCamelOfficer)
  },

  async upsert(item: Officer): Promise<Officer> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase
      .from('officers')
      .upsert(toSnakeOfficer(item), { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert officer: ${error.message}`)
    }

    dispatchChange(KEYS.officers)
    return toCamelOfficer(data)
  },

  async remove(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.from('officers').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to remove officer: ${error.message}`)
    }

    dispatchChange(KEYS.officers)
  },
}

// Promises
export const promisesDb = {
  async list(): Promise<Promise_[]> {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase.from('promises').select('*')

    if (error) {
      console.error('[promisesDb] Error fetching promises:', error)
      return []
    }

    return (data ?? []).map((row: any) => toCamelPromise(row))
  },

  async upsert(item: Promise_): Promise<Promise_> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase
      .from('promises')
      .upsert(toSnakePromise(item), { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert promise: ${error.message}`)
    }

    dispatchChange(KEYS.promises)
    return toCamelPromise(data)
  },

  async remove(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.from('promises').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to remove promise: ${error.message}`)
    }

    dispatchChange(KEYS.promises)
  },
}

// Budget
export const budgetDb = {
  async list(): Promise<BudgetItem[]> {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase.from('budget').select('*')

    if (error) {
      console.error('[budgetDb] Error fetching budget:', error)
      return []
    }

    return (data ?? []).map(toCamelBudget)
  },

  async upsert(item: BudgetItem): Promise<BudgetItem> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase
      .from('budget')
      .upsert(toSnakeBudget(item), { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert budget item: ${error.message}`)
    }

    dispatchChange(KEYS.budget)
    return toCamelBudget(data)
  },

  async remove(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.from('budget').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to remove budget item: ${error.message}`)
    }

    dispatchChange(KEYS.budget)
  },
}

// Updates
export const updatesDb = {
  async list(): Promise<UpdateEntry[]> {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('[updatesDb] Error fetching updates:', error)
      return []
    }

    return (data ?? []).map(toCamelUpdate)
  },

  async upsert(item: UpdateEntry): Promise<UpdateEntry> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase
      .from('updates')
      .upsert(toSnakeUpdate(item), { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert update: ${error.message}`)
    }

    dispatchChange(KEYS.updates)
    return toCamelUpdate(data)
  },

  async remove(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.from('updates').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to remove update: ${error.message}`)
    }

    dispatchChange(KEYS.updates)
  },
}

// Reports
export const reportsDb = {
  async list(): Promise<Report[]> {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[reportsDb] Error fetching reports:', error)
      return []
    }

    return (data ?? []).map(toCamelReport)
  },

  async upsert(item: Report): Promise<Report> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase
      .from('reports')
      .upsert(toSnakeReport(item), { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert report: ${error.message}`)
    }

    dispatchChange(KEYS.reports)
    return toCamelReport(data)
  },

  async remove(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.from('reports').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to remove report: ${error.message}`)
    }

    dispatchChange(KEYS.reports)
  },

  async findByEmail(email: string): Promise<Report[]> {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[reportsDb] Error finding reports by email:', error)
      return []
    }

    return (data ?? []).map(toCamelReport)
  },

  async findByTrackingCode(code: string): Promise<Report | null> {
    if (!supabase) {
      return null
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('tracking_code', code)
      .single()

    if (error) {
      console.error('[reportsDb] Error finding report by tracking code:', error)
      return null
    }

    return data ? toCamelReport(data) : null
  },

  async findByTrackingCodeAndStudentId(code: string, studentId: string): Promise<Report | null> {
    if (!supabase) {
      return null
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('tracking_code', code.trim())
      .eq('student_id', studentId.trim())
      .maybeSingle()

    if (error) {
      console.error('[reportsDb] Error finding report by tracking code and student ID:', error)
      return null
    }

    return data ? toCamelReport(data) : null
  },

  async submit(data: Omit<Report, 'id' | 'trackingCode' | 'status' | 'createdAt' | 'isApproved' | 'isShadowbanned'>): Promise<Report> {
    const newItem: Report = {
      ...data,
      id: uid(),
      trackingCode: `SBO-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      status: 'pending',
      isApproved: false,
      isShadowbanned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return this.upsert(newItem)
  },

  async updateStatus(id: string, status: Report['status'], adminNotes?: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase
      .from('reports')
      .update({ status, admin_notes: adminNotes })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update report status: ${error.message}`)
    }

    dispatchChange(KEYS.reports)
  },

  async approve(id: string, adminReply?: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const updates: Record<string, unknown> = {
      is_approved: true,
      status: 'under-review',
    }
    if (adminReply !== undefined) {
      updates.admin_reply = adminReply
    }

    const { error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to approve report: ${error.message}`)
    }

    dispatchChange(KEYS.reports)
  },

  async shadowban(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase
      .from('reports')
      .update({ is_shadowbanned: true })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to shadowban report: ${error.message}`)
    }

    dispatchChange(KEYS.reports)
  },
}

// News
export const newsDb = {
  async list(): Promise<NewsPost[]> {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('[newsDb] Error fetching news:', error)
      return []
    }

    return (data ?? []).map(toCamelNewsPost)
  },

  async upsert(item: NewsPost): Promise<NewsPost> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase
      .from('news')
      .upsert(toSnakeNewsPost(item), { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert news post: ${error.message}`)
    }

    dispatchChange(KEYS.news)
    return toCamelNewsPost(data)
  },

  async remove(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.from('news').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to remove news post: ${error.message}`)
    }

    dispatchChange(KEYS.news)
  },
}

// Events (calendar)
export const eventsDb = {
  async list(): Promise<ScheduledEvent[]> {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) {
      console.error('[eventsDb] Error fetching events:', error)
      return []
    }

    return (data ?? []).map(toCamelEvent)
  },

  async upsert(item: ScheduledEvent): Promise<ScheduledEvent> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase
      .from('events')
      .upsert(toSnakeEvent(item), { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert event: ${error.message}`)
    }

    dispatchChange(KEYS.events)
    return toCamelEvent(data)
  },

  async remove(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.from('events').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to remove event: ${error.message}`)
    }

    dispatchChange(KEYS.events)
  },
}

// Freedom Wall
async function ensureGuestSession() {
  if (!supabase) return

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) return

  try {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.warn('[freedomWallDb] Failed to create guest session:', error)
    }
  } catch (error) {
    console.warn('[freedomWallDb] Guest session error:', error)
  }
}

export const freedomWallDb = {
  async list(): Promise<FreedomMessage[]> {
    if (!supabase) {
      return []
    }

    const { data, error } = await supabase
      .from('freedom_wall')
      .select('*, freedom_wall_meta(*)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[freedomWallDb] Error fetching messages:', error)
      return []
    }

    return (data ?? []).map(toCamelFreedomMessage)
  },

  async upsert(item: FreedomMessage): Promise<FreedomMessage> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase
      .from('freedom_wall')
      .upsert(toSnakeFreedomMessage(item), { onConflict: 'id' })
      .select('*, freedom_wall_meta(*)')
      .single()

    if (error) {
      throw new Error(`Failed to upsert freedom wall message: ${error.message}`)
    }

    dispatchChange(KEYS.freedomWall)
    return toCamelFreedomMessage(data)
  },

  async like(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { data: message, error: fetchError } = await supabase
      .from('freedom_wall')
      .select('likes')
      .eq('id', id)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch message: ${fetchError.message}`)
    }

    const { error } = await supabase
      .from('freedom_wall')
      .update({ likes: (message?.likes ?? 0) + 1 })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to like message: ${error.message}`)
    }

    dispatchChange(KEYS.freedomWall)
  },

  async remove(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase
      .from('freedom_wall')
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: 'admin' })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to remove message: ${error.message}`)
    }

    dispatchChange(KEYS.freedomWall)
  },

  async submit(data: Omit<FreedomMessage, 'id' | 'createdAt' | 'likes'> & { meta?: Record<string, unknown> }): Promise<FreedomMessage> {
    await ensureGuestSession()
    
    const newItem: FreedomMessage = {
      id: uid(),
      message: data.message,
      color: data.color,
      createdAt: new Date().toISOString(),
      likes: 0,
      isDeleted: false,
      nickname: data.meta?.nickname as string | undefined,
      senderName: data.meta?.senderName as string | undefined,
      recipientName: data.meta?.recipientName as string | undefined,
      spotifyUrl: data.meta?.spotifyUrl as string | undefined,
      spotifyQuery: data.meta?.spotifyQuery as string | undefined,
      songTitle: data.meta?.songTitle as string | undefined,
      songArtist: data.meta?.songArtist as string | undefined,
      songArtwork: data.meta?.songArtwork as string | undefined,
    }
    
    return this.upsert(newItem)
  },
}

// Polls
export const pollsDb = {
  async list(): Promise<Poll[]> {
    if (!supabase) {
      return []
    }

    const { data: pollsData, error: pollsError } = await supabase
      .from('polls')
      .select('*')

    if (pollsError) {
      console.error('[pollsDb] Error fetching polls:', pollsError)
      return []
    }

    if (!pollsData || pollsData.length === 0) {
      return []
    }

    const { data: optionsData, error: optionsError } = await supabase
      .from('poll_options')
      .select('*')

    if (optionsError) {
      console.error('[pollsDb] Error fetching poll options:', optionsError)
      return []
    }

    const optionsByPoll = new Map<string, PollOption[]>()
    ;(optionsData ?? []).forEach((row: any) => {
      const pool = optionsByPoll.get(row.poll_id) ?? []
      pool.push(toCamelPollOption(row))
      optionsByPoll.set(row.poll_id, pool)
    })

    // Force polls to be open on localhost for testing
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

    return pollsData.map((row: any) => {
      const poll = toCamelPoll(row, optionsByPoll.get(row.id) ?? [])
      if (isLocalhost) {
        poll.isOpen = true
      }
      return poll
    })
  },

  async upsert(item: Omit<Poll, 'id' | 'options'> & { id?: string; options: (Omit<PollOption, 'id' | 'votes'> & { id?: string; votes?: number })[] }): Promise<Poll> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const record: Poll = {
      ...item,
      id: item.id ?? uid(),
      options: item.options.map((o) => ({ id: o.id ?? uid(), label: o.label, votes: o.votes ?? 0 })) as any,
    }

    const { data, error } = await supabase
      .from('polls')
      .upsert(toSnakePoll(record), { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert poll: ${error.message}`)
    }

    const optionRows = record.options.map((option) => ({
      id: option.id,
      poll_id: record.id,
      label: option.label,
      votes: option.votes,
    }))
    await supabase.from('poll_options').delete().eq('poll_id', record.id)
    await supabase.from('poll_options').upsert(optionRows, { onConflict: 'id' })
    dispatchChange(KEYS.polls)
    return toCamelPoll(data, record.options)
  },

  async toggleOpen(id: string, isOpen: boolean): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.from('polls').update({ is_open: isOpen }).eq('id', id)

    if (error) {
      throw new Error(`Failed to toggle poll: ${error.message}`)
    }

    dispatchChange(KEYS.polls)
  },

  async vote(pollId: string, optionId: string): Promise<{ ok: boolean; reason?: string }> {
    if (!supabase) {
      return { ok: false, reason: 'supabase-not-configured' }
    }

    const voted = read<Record<string, string>>(KEYS.votedPolls)
    if (voted?.[pollId]) {
      return { ok: false, reason: 'already-voted' }
    }

try {
      // Only authenticated students can vote. Anonymous/guest sessions are
      // rejected so every vote is tied to a real verified account (transparency).
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.is_anonymous) {
        return { ok: false, reason: 'sign-in-required' }
      }
      const userId = user.id

      const { data: pollData } = await supabase
        .from('polls')
        .select('id, is_open')
        .eq('id', pollId)
        .single()

      // Skip closed check for localhost development
      const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      if (!pollData?.is_open && !isLocalhost) {
        return { ok: false, reason: 'closed' }
      }

      const { data: optionData } = await supabase
        .from('poll_options')
        .select('id')
        .eq('id', optionId)
        .single()

      if (!optionData) {
        return { ok: false, reason: 'option-not-found' }
      }

const { error } = await supabase
        .from('poll_votes')
        .insert({ poll_id: pollId, option_id: optionId, user_id: userId })

      if (!error) {
        // Vote tallying is handled by the DB trigger (bump_poll_option_votes),
        // so client code never touches votes directly — no inflation possible.
        const votedData = voted ?? {}
        votedData[pollId] = optionId
        write(KEYS.votedPolls, votedData)
        dispatchChange(KEYS.polls)
        return { ok: true }
      }

      console.error('[pollsDb] Vote failed:', error)
      if (error?.message?.includes('violates unique constraint') || error?.message?.includes('duplicate')) {
        return { ok: false, reason: 'already-voted' }
      }
      return { ok: false, reason: error?.message }
    } catch (err) {
      console.error('[pollsDb] Vote error:', err)
      return { ok: false, reason: 'error' }
    }
  },

  async remove(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.from('polls').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to remove poll: ${error.message}`)
    }

    dispatchChange(KEYS.polls)
  },

  getMyVote(pollId: string): string | undefined {
    const voted = read<Record<string, string>>(KEYS.votedPolls)
    return voted?.[pollId]
  },
}

// Site settings (maintenance mode, etc.)
export interface SiteSettings {
  maintenanceMode: boolean
  maintenanceMessage: string
}

const defaultSettings: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage: "We're making a few updates. Check back shortly.",
}

export const settingsDb = {
  async get(): Promise<SiteSettings> {
    if (!supabase) {
      return defaultSettings
    }

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('maintenance_mode, maintenance_message')
        .limit(1)
        .maybeSingle()

      if (!error && data) {
        return {
          maintenanceMode: data.maintenance_mode,
          maintenanceMessage: data.maintenance_message || defaultSettings.maintenanceMessage,
        }
      }
    } catch (err) {
      console.error('[settingsDb] Error fetching settings:', err)
    }

    return defaultSettings
  },

  async update(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    const current = await this.get()
    const next = { ...current, ...patch }

    const { data: row, error: readError } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (readError) {
      throw new Error(readError.message)
    }

    const payload = {
      maintenance_mode: next.maintenanceMode,
      maintenance_message: next.maintenanceMessage,
      updated_at: new Date().toISOString(),
    }

    const { error: writeError } = row
      ? await supabase.from('site_settings').update(payload).eq('id', row.id)
      : await supabase.from('site_settings').insert(payload)

    if (writeError) {
      throw new Error(writeError.message)
    }

    dispatchChange('settings')
    return next
  },
}

// Reset helper (handy for demoing)
export function resetAllData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  bus.dispatchEvent(new CustomEvent('change', { detail: 'all' }))
}