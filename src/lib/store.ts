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
import { supabase } from './supabase'

const KEYS = {
  officers: 'sbo_officers',
  promises: 'sbo_promises',
  budget: 'sbo_budget',
  updates: 'sbo_updates',
  reports: 'sbo_reports',
  news: 'sbo_news',
  polls: 'sbo_polls',
  votedPolls: 'sbo_voted_polls',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
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

function dispatchChange(detail: string = 'all') {
  bus.dispatchEvent(new CustomEvent('change', { detail }))
}

export const bus = new EventTarget()

const uid = () => Math.random().toString(36).slice(2, 10)
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

// ── Officers ───────────────────────────────────────────────
export const officersDb = {
  async list(): Promise<Officer[]> {
    if (supabase) {
      const { data, error } = await supabase.from('officers').select('*').order('order', { ascending: true })
      if (!error && data && data.length > 0) {
        return data.map(toCamelOfficer).sort((a, b) => a.order - b.order)
      }
    }
    return read(KEYS.officers, seedOfficers).sort((a, b) => a.order - b.order)
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

    const all = read(KEYS.officers, seedOfficers)
    const idx = all.findIndex((o) => o.id === record.id)
    if (idx >= 0) all[idx] = record
    else all.push(record)
    write(KEYS.officers, all)
    return record
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('officers').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.officers)
        return
      }
    }
    write(KEYS.officers, read(KEYS.officers, seedOfficers).filter((o) => o.id !== id))
  },
}

// ── Promises ───────────────────────────────────────────────
export const promisesDb = {
  async list(): Promise<Promise_[]> {
    if (supabase) {
      const { data: promisesData, error: promisesError } = await supabase.from('promises').select('*')
      if (!promisesError && promisesData && promisesData.length > 0) {
        const { data: officersData } = await supabase.from('officers').select('id, name')
        const officerNames = new Map((officersData ?? []).map((row: any) => [row.id, row.name]))
        return promisesData.map((row: any) => toCamelPromise(row, officerNames.get(row.officer_id)))
      }
    }
    return read(KEYS.promises, seedPromises)
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

    const all = read(KEYS.promises, seedPromises)
    const idx = all.findIndex((p) => p.id === record.id)
    if (idx >= 0) all[idx] = record
    else all.unshift(record)
    write(KEYS.promises, all)
    return record
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('promises').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.promises)
        return
      }
    }
    write(KEYS.promises, read(KEYS.promises, seedPromises).filter((p) => p.id !== id))
  },
}

// ── Budget ─────────────────────────────────────────────────
export const budgetDb = {
  async list(): Promise<BudgetItem[]> {
    if (supabase) {
      const { data, error } = await supabase.from('budget_items').select('*')
      if (!error && data && data.length > 0) {
        return data.map(toCamelBudget)
      }
    }
    return read(KEYS.budget, seedBudget)
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

    const all = read(KEYS.budget, seedBudget)
    const idx = all.findIndex((b) => b.id === record.id)
    if (idx >= 0) all[idx] = record
    else all.push(record)
    write(KEYS.budget, all)
    return record
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('budget_items').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.budget)
        return
      }
    }
    write(KEYS.budget, read(KEYS.budget, seedBudget).filter((b) => b.id !== id))
  },
}

// ── Updates (live meeting / decision feed) ────────────────
export const updatesDb = {
  async list(): Promise<UpdateEntry[]> {
    if (supabase) {
      const { data, error } = await supabase.from('updates').select('*')
      if (!error && data && data.length > 0) {
        return data.map(toCamelUpdate).sort((a, b) => (a.date < b.date ? 1 : -1))
      }
    }
    return read(KEYS.updates, seedUpdates).sort((a, b) => (a.date < b.date ? 1 : -1))
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

    const all = read(KEYS.updates, seedUpdates)
    const idx = all.findIndex((u) => u.id === record.id)
    if (idx >= 0) all[idx] = record
    else all.unshift(record)
    write(KEYS.updates, all)
    return record
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('updates').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.updates)
        return
      }
    }
    write(KEYS.updates, read(KEYS.updates, seedUpdates).filter((u) => u.id !== id))
  },
}

// ── Reports ────────────────────────────────────────────────
let reportCounter = 1003

export const reportsDb = {
  async list(): Promise<Report[]> {
    if (supabase) {
      const { data, error } = await supabase.from('reports').select('*')
      if (!error && data && data.length > 0) {
        return data.map(toCamelReport).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      }
    }
    return read(KEYS.reports, seedReports).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
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

      if (!error && data) {
        dispatchChange(KEYS.reports)
        return toCamelReport(data)
      }
    }

    const all = read(KEYS.reports, seedReports)
    all.unshift(record)
    write(KEYS.reports, all)
    return record
  },
  async updateStatus(id: string, status: Report['status'], adminNotes?: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('reports').update({ status, admin_notes: adminNotes }).eq('id', id)
      if (!error) {
        dispatchChange(KEYS.reports)
        return
      }
    }

    const all = read(KEYS.reports, seedReports)
    const idx = all.findIndex((r) => r.id === id)
    if (idx >= 0) {
      all[idx] = { ...all[idx], status, adminNotes: adminNotes ?? all[idx].adminNotes }
      write(KEYS.reports, all)
    }
  },
  async findByTrackingCode(code: string): Promise<Report | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from('reports').select('*').eq('tracking_code', code.trim())
      if (!error && data && data.length > 0) {
        return toCamelReport(data[0])
      }
    }
    const all = read(KEYS.reports, seedReports)
    return all.find((r) => r.trackingCode.toLowerCase() === code.trim().toLowerCase())
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('reports').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.reports)
        return
      }
    }
    write(KEYS.reports, read(KEYS.reports, seedReports).filter((r) => r.id !== id))
  },
}

// ── News ───────────────────────────────────────────────────
export const newsDb = {
  async list(): Promise<NewsPost[]> {
    if (supabase) {
      const { data, error } = await supabase.from('news').select('*')
      if (!error && data && data.length > 0) {
        return data.map(toCamelNews).sort((a, b) => (a.date < b.date ? 1 : -1))
      }
    }
    return read(KEYS.news, seedNews).sort((a, b) => (a.date < b.date ? 1 : -1))
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

    const all = read(KEYS.news, seedNews)
    const idx = all.findIndex((n) => n.id === record.id)
    if (idx >= 0) all[idx] = record
    else all.unshift(record)
    write(KEYS.news, all)
    return record
  },
  async remove(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('news').delete().eq('id', id)
      if (!error) {
        dispatchChange(KEYS.news)
        return
      }
    }
    write(KEYS.news, read(KEYS.news, seedNews).filter((n) => n.id !== id))
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

          return pollsData.map((row: any) => toCamelPoll(row, optionsByPoll.get(row.id) ?? []))
        }
      }
    }
    return read(KEYS.polls, seedPolls)
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
      await ensureGuestSession()
      const { data: pollData } = await supabase.from('polls').select('id, is_open').eq('id', pollId).single()
      if (!pollData?.is_open) return { ok: false, reason: 'closed' }

      const { data: optionData } = await supabase.from('poll_options').select('id').eq('id', optionId).single()
      if (!optionData) return { ok: false, reason: 'closed' }

      const { error } = await supabase.from('poll_votes').insert({ poll_id: pollId, option_id: optionId, user_id: (await supabase.auth.getUser()).data.user?.id })
      if (!error) {
        await supabase.from('poll_options').update({ votes: (await supabase.from('poll_options').select('votes').eq('id', optionId).single()).data?.votes ?? 0 + 1 }).eq('id', optionId)
        voted[pollId] = optionId
        write(KEYS.votedPolls, voted)
        dispatchChange(KEYS.polls)
        return { ok: true }
      }

      if (error?.message?.includes('violates unique constraint') || error?.message?.includes('duplicate')) {
        return { ok: false, reason: 'already-voted' }
      }
    }

    const all = read(KEYS.polls, seedPolls)
    const poll = all.find((p) => p.id === pollId)
    if (!poll || !poll.isOpen) return { ok: false, reason: 'closed' }

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

// ── Reset helper (handy for demoing) ─────────────────────────
export function resetAllData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  bus.dispatchEvent(new CustomEvent('change', { detail: 'all' }))
}
