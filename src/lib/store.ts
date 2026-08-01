// ─────────────────────────────────────────────────────────────
// DATA LAYER — backed by Supabase when configured.
//
// The app uses the same async methods as before, so pages and
// components do not need to change. When Supabase is configured,
// the store reads/writes the matching tables and subscribes to
// realtime updates. Otherwise it falls back to the browser's
// localStorage demo data.
// ─────────────────────────────────────────────────────────────

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
  NoteColor,
} from './types'
import {
  seedOfficers,
  seedPromises,
  seedBudget,
  seedUpdates,
  seedReports,
  seedNews,
  seedPolls,
} from '@/data/seed'
import { isSupabaseConfigured, supabase } from './supabase'

const KEYS = {
  officers: 'sbo_officers',
  promises: 'sbo_promises',
  budget: 'sbo_budget',
  updates: 'sbo_updates',
  reports: 'sbo_reports',
  news: 'sbo_news',
  polls: 'sbo_polls',
  votedPolls: 'sbo_voted_polls',
  freedomWall: 'sbo_freedom_wall',
  settings: 'sbo_settings',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
  bus.dispatchEvent(new CustomEvent('change', { detail: key }))
}

function readFreedomWallMessages(): FreedomMessage[] {
  return read<FreedomMessage[]>(KEYS.freedomWall, [])
}

function writeFreedomWallMessages(messages: FreedomMessage[]) {
  write(KEYS.freedomWall, messages)
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
    category: row.category,
    content: row.content,
    status: row.status,
    adminNotes: row.admin_notes ?? row.adminNotes,
    createdAt: row.created_at ?? row.createdAt,
  }
}

function toSnakeReport(row: Report): Record<string, unknown> {
  return {
    id: row.id,
    tracking_code: row.trackingCode,
    visibility: row.visibility,
    full_name: row.fullName,
    email: row.email,
    category: row.category,
    content: row.content,
    status: row.status,
    admin_notes: row.adminNotes,
    created_at: row.createdAt,
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

function toSnakeFreedomMeta(row: FreedomMessage): Record<string, unknown> {
  return {
    message_id: row.id,
    nickname: row.nickname ?? '',
    sender_name: row.senderName ?? '',
    recipient_name: row.recipientName ?? '',
    spotify_url: row.spotifyUrl ?? '',
    spotify_query: row.spotifyQuery ?? '',
    song_title: row.songTitle ?? '',
    song_artist: row.songArtist ?? '',
    song_artwork: row.songArtwork ?? '',
  }
}

function toCamelNews(row: any): NewsPost {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    imageUrl: row.image_url ?? row.imageUrl,
    date: row.date,
  }
}

function toSnakeNews(row: NewsPost): Record<string, unknown> {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    image_url: row.imageUrl,
    date: row.date,
  }
}

function toCamelPoll(row: any, options: PollOption[] = []): Poll {
  return {
    id: row.id,
    question: row.question,
    type: row.type ?? 'single',
    options,
    startDate: row.start_date ?? row.startDate ?? '',
    endDate: row.end_date ?? row.endDate ?? '',
    isOpen: row.is_open ?? row.isOpen ?? true,
  }
}

function toSnakePoll(row: Poll): Record<string, unknown> {
  return {
    id: row.id,
    question: row.question,
    type: row.type,
    start_date: row.startDate,
    end_date: row.endDate,
    is_open: row.isOpen,
  }
}

function toCamelPollOption(row: any): PollOption {
  return {
    id: row.id,
    label: row.label,
    votes: Number(row.votes ?? 0),
  }
}

async function ensureGuestSession(): Promise<void> {
  if (!supabase) return
  try {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      await supabase.auth.signInAnonymously()
    }
  } catch (err) {
    console.error('Guest authorization setup breakdown:', err)
  }
}

// ── Site settings Data Schema ──────────────────────────────────────
export interface SiteSettings {
  maintenanceMode: boolean
  maintenanceMessage: string
}

const defaultSettings: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage: "We're making a few updates. Check back shortly.",
}

function toCamelSettings(row: any): SiteSettings {
  return {
    maintenanceMode: row.maintenance_mode,
    maintenanceMessage: row.maintenance_message,
  }
}

// ── Central Settings Store Layer ───────────────────────────────────
export const settingsDb = {
  async get(): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('sbo_settings')
          .select('maintenance_mode, maintenance_message')
          .eq('id', 1)
          .single()

        if (error || !data) throw error
        return toCamelSettings(data)
      } catch (err) {
        console.error('Supabase settings query failure:', err)
        return defaultSettings
      }
    }
    return read<SiteSettings>(KEYS.settings, defaultSettings)
  },

  async update(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const updatePayload: any = {}
        if (patch.maintenanceMode !== undefined) updatePayload.maintenance_mode = patch.maintenanceMode
        if (patch.maintenanceMessage !== undefined) updatePayload.maintenance_message = patch.maintenanceMessage

        const { error } = await supabase
          .from('sbo_settings')
          .update(updatePayload)
          .eq('id', 1)

        if (error) throw error
        
        dispatchChange(KEYS.settings)
        return this.get()
      } catch (err) {
        console.error('Supabase settings mutate failure:', err)
      } // 👈 Added missing closing try-catch bracket
    }

    const current = read<SiteSettings>(KEYS.settings, defaultSettings)
    const next = { ...current, ...patch }
    write(KEYS.settings, next)
    return next
  }, // 👈 Properly closed the update method
}

// ── Realtime Synchronization Channels ──────────────────────────────
if (isSupabaseConfigured && supabase) {
  supabase
    .channel('public:sbo_settings')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'sbo_settings', filter: 'id=eq.1' },
      () => {
        dispatchChange(KEYS.settings) 
      }
    )
    .subscribe()
}
