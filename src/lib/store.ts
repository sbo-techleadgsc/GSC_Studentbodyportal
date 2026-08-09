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
  if (supabase.auth.getSession) {
    const { data } = await supabase.auth.getSession()
    if (data.session) return
  }

  try {
    await supabase.auth.signInAnonymously()
  } catch {
    // ignore and fall back to local-only vote tracking
  }
}

let realtimeChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null

function setupRealtime() {
  if (!supabase || realtimeChannel) return

  realtimeChannel = supabase.channel('table-changes', {
    config: {
      broadcast: { self: false },
      presence: { key: 'sbo' },
    },
  })

  ;['officers', 'promises', 'budget_items', 'updates', 'reports', 'news', 'polls', 'poll_options', 'poll_votes'].forEach((table) => {
    realtimeChannel?.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
      dispatchChange(table)
    })
  })

  realtimeChannel.subscribe()
}

setupRealtime()

if (typeof window !== 'undefined' && isSupabaseConfigured) {
  console.info('[store] Supabase is active; data will come from the remote database when the schema exists.')
}

// ── Officers ───────────────────────────────────────────────
export const officersDb = {
  async list(): Promise<Officer[]> {
    if (supabase) {
      const { data, error } = await supabase.from('officers').select('*').order('order', { ascending: true })
      if (!error && data) {
        return data.map(toCamelOfficer).sort((a, b) => a.order - b.order)
      }
    }
    return []
  },
  async upsert(officer: Omit<Officer, 'id'> & { id?: string }): Promise<Officer> {
    const record: Officer = { ...officer, id: officer.id ?? uid() } as Officer

    if (supabase) {
      const { data, error } = await supabase
        .from('officers')
        .upsert(toSnakeOfficer(record), { onConflict: 'id' })
        .select()
        .single()

      if (!error && data) {
        dispatchChange(KEYS.officers)
        return toCamelOfficer(data)
      }
    }

    throw new Error('Supabase is not configured')
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('officers').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.officers)
        return
      }
    }
    throw new Error('Supabase is not configured')
  },
}

// ── Promises ───────────────────────────────────────────────
export const promisesDb = {
  async list(): Promise<Promise_[]> {
    if (supabase) {
      const { data: promisesData, error: promisesError } = await supabase.from('promises').select('*')
      if (!promisesError && promisesData) {
        const { data: officersData } = await supabase.from('officers').select('id, name')
        const officerNames = new Map((officersData ?? []).map((row: any) => [row.id, row.name]))
        return promisesData.map((row: any) => toCamelPromise(row, officerNames.get(row.officer_id)))
      }
    }
    return []
  },
  async upsert(item: Omit<Promise_, 'id' | 'updatedAt'> & { id?: string }): Promise<Promise_> {
    const record: Promise_ = { ...item, id: item.id ?? uid(), updatedAt: nowISO() } as Promise_

    if (supabase) {
      const { data, error } = await supabase
        .from('promises')
        .upsert(toSnakePromise(record), { onConflict: 'id' })
        .select()
        .single()

      if (!error && data) {
        dispatchChange(KEYS.promises)
        return toCamelPromise(data)
      }
    }

    throw new Error('Supabase is not configured')
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('promises').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.promises)
        return
      }
    }
    throw new Error('Supabase is not configured')
  },
}

// ── Budget ─────────────────────────────────────────────────
export const budgetDb = {
  async list(): Promise<BudgetItem[]> {
    if (supabase) {
      const { data, error } = await supabase.from('budget_items').select('*')
      if (!error && data) {
        return data.map(toCamelBudget)
      }
    }
    return []
  },
  async upsert(item: Omit<BudgetItem, 'id'> & { id?: string }): Promise<BudgetItem> {
    const record: BudgetItem = { ...item, id: item.id ?? uid() } as BudgetItem

    if (supabase) {
      const { data, error } = await supabase
        .from('budget_items')
        .upsert(toSnakeBudget(record), { onConflict: 'id' })
        .select()
        .single()

      if (!error && data) {
        dispatchChange(KEYS.budget)
        return toCamelBudget(data)
      }
    }

    throw new Error('Supabase is not configured')
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('budget_items').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.budget)
        return
      }
    }
    throw new Error('Supabase is not configured')
  },
}

// ── Updates (live meeting / decision feed) ────────────────
export const updatesDb = {
  async list(): Promise<UpdateEntry[]> {
    if (supabase) {
      const { data, error } = await supabase.from('updates').select('*')
      if (!error && data) {
        return data.map(toCamelUpdate).sort((a, b) => (a.date < b.date ? 1 : -1))
      }
    }
    return []
  },
  async upsert(item: Omit<UpdateEntry, 'id'> & { id?: string }): Promise<UpdateEntry> {
    const record: UpdateEntry = { ...item, id: item.id ?? uid() } as UpdateEntry

    if (supabase) {
      const { data, error } = await supabase
        .from('updates')
        .upsert(toSnakeUpdate(record), { onConflict: 'id' })
        .select()
        .single()

      if (!error && data) {
        dispatchChange(KEYS.updates)
        return toCamelUpdate(data)
      }
    }

    throw new Error('Supabase is not configured')
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('updates').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.updates)
        return
      }
    }
    throw new Error('Supabase is not configured')
  },
}

// ── Reports ────────────────────────────────────────────────
let reportCounter = 1003

export const reportsDb = {
  async list(): Promise<Report[]> {
    if (supabase) {
      const { data, error } = await supabase.from('reports').select('*')
      if (error) {
        console.error('[reportsDb] list failed', error)
        return []
      }
      if (data) {
        return data.map(toCamelReport).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      }
    }
    return []
  },
  async submit(input: {
    visibility: 'public' | 'anonymous'
    fullName?: string
    email?: string
    category: string
    content: string
  }): Promise<Report> {
    const record: Report = {
      id: uid(),
      trackingCode: `REPORT-${1000 + reportCounter + 1}`,
      visibility: input.visibility,
      fullName: input.visibility === 'public' ? input.fullName : undefined,
      email: input.visibility === 'public' ? input.email : undefined,
      category: input.category,
      content: input.content,
      status: 'new',
      createdAt: nowISO(),
    }
    reportCounter += 1

    if (supabase) {
      const { data, error } = await supabase
        .from('reports')
        .insert(toSnakeReport(record))
        .select()
        .single()

      if (error) {
        console.error('[reportsDb] submit failed', error)
        throw new Error(error.message || 'Unable to submit report right now.')
      }

      dispatchChange(KEYS.reports)
      return toCamelReport(data)
    }

    throw new Error('Supabase is not configured')
  },
  async updateStatus(id: string, status: Report['status'], adminNotes?: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('reports').update({ status, admin_notes: adminNotes }).eq('id', id)
      if (error) {
        console.error('[reportsDb] updateStatus failed', error)
        throw new Error(error.message || 'Unable to update report status.')
      }
      dispatchChange(KEYS.reports)
      return
    }

    throw new Error('Supabase is not configured')
  },
  async findByTrackingCode(code: string): Promise<Report | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from('reports').select('*').eq('tracking_code', code.trim())
      if (error) {
        console.error('[reportsDb] findByTrackingCode failed', error)
        return undefined
      }
      if (data && data.length > 0) {
        return toCamelReport(data[0])
      }
      return undefined
    }
    return undefined
  },
  async findByEmail(email: string): Promise<Report[]> {
    if (supabase) {
      const { data, error } = await supabase.from('reports').select('*').eq('email', email.trim().toLowerCase())
      if (error) {
        console.error('[reportsDb] findByEmail failed', error)
        return []
      }
      if (data && data.length > 0) {
        return data.map(toCamelReport).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      }
      return []
    }
    return []
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('reports').delete().eq('id', id)
      if (error) {
        console.error('[reportsDb] remove failed', error)
        throw new Error(error.message || 'Unable to delete report.')
      }
      dispatchChange(KEYS.reports)
      return
    }
    throw new Error('Supabase is not configured')
  },
}

// ── News ───────────────────────────────────────────────────
export const newsDb = {
  async list(): Promise<NewsPost[]> {
    if (supabase) {
      const { data, error } = await supabase.from('news').select('*')
      if (!error && data) {
        return data.map(toCamelNews).sort((a, b) => (a.date < b.date ? 1 : -1))
      }
    }
    return []
  },
  async upsert(item: Omit<NewsPost, 'id'> & { id?: string }): Promise<NewsPost> {
    const record: NewsPost = { ...item, id: item.id ?? uid() } as NewsPost

    if (supabase) {
      const { data, error } = await supabase
        .from('news')
        .upsert(toSnakeNews(record), { onConflict: 'id' })
        .select()
        .single()

      if (!error && data) {
        dispatchChange(KEYS.news)
        return toCamelNews(data)
      }
    }

    throw new Error('Supabase is not configured')
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('news').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.news)
        return
      }
    }
    throw new Error('Supabase is not configured')
  },
}

// ── Freedom Wall ───────────────────────────────────────────
export const freedomWallDb = {
  async list(): Promise<FreedomMessage[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('freedom_wall')
          .select('*, freedom_wall_meta(*)')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })

        if (!error && data) {
          return data.map(toCamelFreedomMessage)
        }
      } catch (error) {
        console.warn('[freedomWallDb] Supabase list failed, using local fallback', error)
      }
    }

    const localMessages = readFreedomWallMessages()
      .filter((message) => !message.isDeleted)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    return localMessages
  },
  async submit(input: { message: string; color: NoteColor; meta?: Record<string, string> }): Promise<FreedomMessage> {
    const record: FreedomMessage = {
      id: uid(),
      message: input.message,
      color: input.color,
      createdAt: nowISO(),
      likes: 0,
      nickname: input.meta?.nickname ?? '',
      senderName: input.meta?.senderName ?? '',
      recipientName: input.meta?.recipientName ?? '',
      spotifyUrl: input.meta?.spotifyUrl ?? '',
      spotifyQuery: input.meta?.spotifyQuery ?? '',
      songTitle: input.meta?.songTitle ?? '',
      songArtist: input.meta?.songArtist ?? '',
      songArtwork: input.meta?.songArtwork ?? '',
    }

    if (supabase) {
      try {
        const { data: inserted, error: insertError } = await supabase
          .from('freedom_wall')
          .insert(toSnakeFreedomMessage(record))
          .select()
          .single()

        if (!insertError && inserted) {
          const metaPayload = toSnakeFreedomMeta(record)
          await supabase.from('freedom_wall_meta').insert(metaPayload)

          const { data: withMeta, error: metaError } = await supabase
            .from('freedom_wall')
            .select('*, freedom_wall_meta(*)')
            .eq('id', inserted.id)
            .single()

          if (!metaError && withMeta) {
            dispatchChange(KEYS.freedomWall)
            return toCamelFreedomMessage(withMeta)
          }

          dispatchChange(KEYS.freedomWall)
          return toCamelFreedomMessage(inserted)
        }
      } catch (error) {
        console.warn('[freedomWallDb] Supabase submit failed, using local fallback', error)
      }
    }

    const nextMessages = [record, ...readFreedomWallMessages()]
    writeFreedomWallMessages(nextMessages)
    dispatchChange(KEYS.freedomWall)
    return record
  },
  async like(id: string): Promise<void> {
    if (supabase) {
      try {
        const { data: current } = await supabase.from('freedom_wall').select('likes').eq('id', id).single()
        const currentLikes = current?.likes ?? 0
        const { error } = await supabase.from('freedom_wall').update({ likes: currentLikes + 1 }).eq('id', id)
        if (!error) {
          dispatchChange(KEYS.freedomWall)
          return
        }
      } catch (error) {
        console.warn('[freedomWallDb] Supabase like failed, using local fallback', error)
      }
    }

    const nextMessages = readFreedomWallMessages().map((message) =>
      message.id === id ? { ...message, likes: message.likes + 1 } : message,
    )
    writeFreedomWallMessages(nextMessages)
    dispatchChange(KEYS.freedomWall)
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('freedom_wall')
          .update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: 'admin' })
          .eq('id', id)

        if (!error) {
          dispatchChange(KEYS.freedomWall)
          return
        }
      } catch (error) {
        console.warn('[freedomWallDb] Supabase remove failed, using local fallback', error)
      }
    }

    const nextMessages = readFreedomWallMessages().map((message) => (message.id === id ? { ...message, isDeleted: true, deletedAt: new Date().toISOString(), deletedBy: 'admin' } : message))
    writeFreedomWallMessages(nextMessages)
    dispatchChange(KEYS.freedomWall)
  },
}

// ── Polls ──────────────────────────────────────────────────
export const pollsDb = {
  async list(): Promise<Poll[]> {
    if (supabase) {
      const { data: pollsData, error: pollsError } = await supabase.from('polls').select('*')
      if (!pollsError && pollsData && pollsData.length > 0) {
        const { data: optionsData, error: optionsError } = await supabase.from('poll_options').select('*')
        if (!optionsError) {
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
        }
      }
    }
    return []
  },
  async upsert(item: Omit<Poll, 'id' | 'options'> & { id?: string; options: (Omit<PollOption, 'id' | 'votes'> & { id?: string; votes?: number })[] }): Promise<Poll> {
    const record: Poll = {
      ...item,
      id: item.id ?? uid(),
      options: item.options.map((o) => ({ id: o.id ?? uid(), label: o.label, votes: o.votes ?? 0 })),
    }

    if (supabase) {
      const { data, error } = await supabase.from('polls').upsert(toSnakePoll(record), { onConflict: 'id' }).select().single()
      if (!error && data) {
        const optionRows = record.options.map((option) => ({ id: option.id, poll_id: record.id, label: option.label, votes: option.votes }))
        await supabase.from('poll_options').delete().eq('poll_id', record.id)
        await supabase.from('poll_options').upsert(optionRows, { onConflict: 'id' })
        dispatchChange(KEYS.polls)
        return toCamelPoll(data, record.options)
      }
    }

    const all = read(KEYS.polls, seedPolls)
    const idx = all.findIndex((p) => p.id === record.id)
    if (idx >= 0) all[idx] = record
    else all.unshift(record)
    write(KEYS.polls, all)
    return record
  },
  async toggleOpen(id: string, isOpen: boolean): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('polls').update({ is_open: isOpen }).eq('id', id)
      if (!error) {
        dispatchChange(KEYS.polls)
        return
      }
    }

    const all = read(KEYS.polls, seedPolls)
    const idx = all.findIndex((p) => p.id === id)
    if (idx >= 0) {
      all[idx] = { ...all[idx], isOpen }
      write(KEYS.polls, all)
    }
  },
  async vote(pollId: string, optionId: string): Promise<{ ok: boolean; reason?: string }> {
    const voted = read<Record<string, string>>(KEYS.votedPolls, {})
    if (voted[pollId]) return { ok: false, reason: 'already-voted' }

    if (supabase) {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id

      // If no user, try to get a guest session
      if (!userId) {
        await ensureGuestSession()
      }

      const { data: pollData } = await supabase.from('polls').select('id, is_open').eq('id', pollId).single()
      // Skip closed check for localhost development
      const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      if (!pollData?.is_open && !isLocalhost) return { ok: false, reason: 'closed' }

      const { data: optionData } = await supabase.from('poll_options').select('id').eq('id', optionId).single()
      if (!optionData) return { ok: false, reason: 'closed' }

      // Get the current user ID (either authenticated or guest)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const currentUserId = currentUser?.id

      if (!currentUserId) {
        console.error('[pollsDb] No user ID available for voting')
        return { ok: false, reason: 'no-user' }
      }

      const { error } = await supabase.from('poll_votes').insert({ poll_id: pollId, option_id: optionId, user_id: currentUserId })
      if (!error) {
        // Get current votes and increment
        const { data: currentOption } = await supabase.from('poll_options').select('votes').eq('id', optionId).single()
        const currentVotes = currentOption?.votes ?? 0
        await supabase.from('poll_options').update({ votes: currentVotes + 1 }).eq('id', optionId)
        
        voted[pollId] = optionId
        write(KEYS.votedPolls, voted)
        dispatchChange(KEYS.polls)
        return { ok: true }
      }

      console.error('[pollsDb] Vote failed:', error)
      if (error?.message?.includes('violates unique constraint') || error?.message?.includes('duplicate')) {
        return { ok: false, reason: 'already-voted' }
      }
      return { ok: false, reason: error?.message }
    }

    const all = read(KEYS.polls, seedPolls)
    const poll = all.find((p) => p.id === pollId)
    // Skip closed check for localhost development
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    if (!poll || (!poll.isOpen && !isLocalhost)) return { ok: false, reason: 'closed' }

    poll.options = poll.options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o))
    write(KEYS.polls, all)

    voted[pollId] = optionId
    write(KEYS.votedPolls, voted)
    return { ok: true }
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('polls').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.polls)
        return
      }
    }
    write(KEYS.polls, read(KEYS.polls, seedPolls).filter((p) => p.id !== id))
  },
  getMyVote(pollId: string): string | undefined {
    const voted = read<Record<string, string>>(KEYS.votedPolls, {})
    return voted[pollId]
  },
}
// ── Site settings (maintenance mode, etc.) ────────────────────
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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('maintenance_mode, maintenance_message')
          .eq('id', 'site_config')
          .single()
        
        if (!error && data) {
          return {
            maintenanceMode: data.maintenance_mode,
            maintenanceMessage: data.maintenance_message || defaultSettings.maintenanceMessage,
          }
        }
      } catch (err) {
        console.error('Error fetching settings from Supabase:', err)
      }
    }
    // Fallback to localStorage
    return read(KEYS.settings, defaultSettings)
  },
  async update(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.get()
    const next = { ...current, ...patch }
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('site_settings')
          .update({
            maintenance_mode: next.maintenanceMode,
            maintenance_message: next.maintenanceMessage,
          })
          .eq('id', 'site_config')
        
        if (!error) {
          dispatchChange('settings')
          return next
        }
        console.error('Error updating settings in Supabase:', error)
      } catch (err) {
        console.error('Error updating settings in Supabase:', err)
      }
    }
    
    // Fallback to localStorage
    write(KEYS.settings, next)
    dispatchChange('settings')
    return next
  },
}
// ── Reset helper (handy for demoing) ─────────────────────────
export function resetAllData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  bus.dispatchEvent(new CustomEvent('change', { detail: 'all' }))
}
