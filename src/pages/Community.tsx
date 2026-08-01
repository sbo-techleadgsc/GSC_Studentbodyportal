import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageSquare, Music4, Pause, Play, RotateCcw, Search, Sparkles } from 'lucide-react'
import { Button, Card } from '@/components/ui/Primitives'
import { freedomWallDb } from '@/lib/store'
import { formatDate } from '@/lib/format'
import type { FreedomMessage, NoteColor } from '@/lib/types'

const COLORS = [
  { name: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-300', shadow: 'shadow-yellow-300/50' },
  { name: 'pink', bg: 'bg-pink-200', border: 'border-pink-300', shadow: 'shadow-pink-300/50' },
  { name: 'blue', bg: 'bg-blue-200', border: 'border-blue-300', shadow: 'shadow-blue-300/50' },
  { name: 'green', bg: 'bg-green-200', border: 'border-green-300', shadow: 'shadow-green-300/50' },
  { name: 'orange', bg: 'bg-orange-200', border: 'border-orange-300', shadow: 'shadow-orange-300/50' },
]

const ROTATIONS = [-2, -1, 0, 1, 2, 3, -3]

type MessageMeta = {
  nickname: string
  senderName: string
  recipientName: string
  spotifyUrl: string
  spotifyQuery?: string
  songTitle?: string
  songArtist?: string
  songArtwork?: string
}

type SpotifySearchItem = {
  id: string
  title: string
  artist: string
  spotifyUrl: string
  previewUrl?: string
  artwork?: string
}

const STORAGE_KEYS = {
  nickname: 'sbo_freedom_wall_nickname',
  likes: 'sbo_freedom_wall_liked_messages',
  meta: 'sbo_freedom_wall_message_meta',
}

const BAD_WORDS = ['fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'hell', 'stupid', 'idiot', 'hate', 'kill', 'die']

function containsBadWords(text: string): boolean {
  const lowerText = text.toLowerCase()
  return BAD_WORDS.some((word) => lowerText.includes(word))
}

function getStoredNickname(): string {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(STORAGE_KEYS.nickname) ?? ''
}

function saveStoredNickname(nickname: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEYS.nickname, nickname)
}

function getLikedMessageIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.likes)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLikedMessageIds(ids: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEYS.likes, JSON.stringify(ids))
}

function getMessageMeta(): Record<string, MessageMeta> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.meta)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, MessageMeta>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveMessageMeta(meta: Record<string, MessageMeta>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify(meta))
}

function normalizeSpotifyUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://www.deezer.com/search/${encodeURIComponent(trimmed)}`
}

function getSpotifyAudioUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    const path = parsed.pathname.replace(/^\/+/, '')

    if (!path) return null

    if (parsed.hostname.includes('deezer.com') && parsed.searchParams.get('id')) {
      return trimmed
    }

    if (parsed.hostname.includes('spotify.com') || parsed.hostname.includes('open.spotify.com')) {
      const segments = path.split('/').filter(Boolean)
      const type = segments[0]
      const id = segments[1]

      if (!type || !id) return null

      const supportedTypes = ['track', 'album', 'playlist', 'artist', 'episode', 'show']
      if (!supportedTypes.includes(type)) return null

      return `https://open.spotify.com/embed/${type}/${id}`
    }
  } catch {
    return null
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return null
}

function buildLyricsUrl(title: string, artist: string): string | null {
  const cleanTitle = title?.trim()
  const cleanArtist = artist?.trim()

  if (!cleanTitle || !cleanArtist) return null

  return `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`
}

function parseLyrics(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\[.*?\]/g, '').trim())
    .filter((line) => line.length > 0)
}

function getLyricIndexForTime(currentTime: number, lyrics: string[], duration: number): number {
  if (lyrics.length === 0) return 0

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 30
  const step = Math.max(2.2, safeDuration / Math.max(lyrics.length, 1))
  return Math.min(lyrics.length - 1, Math.max(0, Math.floor(currentTime / step)))
}

function buildDisplayName(value: string): string {
  return value.trim()
}

export default function Community() {
  const [messages, setMessages] = useState<FreedomMessage[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [nicknameInput, setNicknameInput] = useState(() => getStoredNickname())
  const [senderNameInput, setSenderNameInput] = useState('')
  const [recipientNameInput, setRecipientNameInput] = useState('')
  const [spotifySearchInput, setSpotifySearchInput] = useState('')
  const [selectedSong, setSelectedSong] = useState<SpotifySearchItem | null>(null)
  const [spotifyResults, setSpotifyResults] = useState<SpotifySearchItem[]>([])
  const [spotifySearchLoading, setSpotifySearchLoading] = useState(false)
  const [spotifySearchError, setSpotifySearchError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedColor, setSelectedColor] = useState<NoteColor>('yellow')
  const [warning, setWarning] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [messageMeta, setMessageMeta] = useState<Record<string, MessageMeta>>(() => getMessageMeta())
  const [likedMessageIds, setLikedMessageIds] = useState<string[]>(() => getLikedMessageIds())
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null)
  const [activePlayback, setActivePlayback] = useState<{ url: string; title: string; artist: string } | null>(null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const [lyricsLines, setLyricsLines] = useState<string[]>([])
  const [lyricsStatus, setLyricsStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [lyricsNotice, setLyricsNotice] = useState('')
  const [activeLyricIndex, setActiveLyricIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    void loadMessages()
  }, [])

  useEffect(() => {
    if (messages.length < 2) return
    const timer = window.setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % Math.min(messages.length, 4))
    }, 3500)
    return () => window.clearInterval(timer)
  }, [messages.length])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!activePreviewUrl) {
      audio.pause()
      setIsPreviewPlaying(false)
      return
    }

    if (audio.src !== activePreviewUrl) {
      audio.src = activePreviewUrl
      audio.load()
    }

    const handlePlay = () => {
      setIsPreviewPlaying(true)
      setPreviewError('')
    }
    const handlePause = () => setIsPreviewPlaying(false)
    const handleEnded = () => {
      setIsPreviewPlaying(false)
      setActivePreviewUrl(null)
    }
    const handleError = () => {
      setIsPreviewPlaying(false)
      setPreviewError('Preview unavailable for this track right now.')
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [activePreviewUrl])

  useEffect(() => {
    const query = spotifySearchInput.trim()
    if (!query) {
      setSpotifyResults([])
      setSpotifySearchError('')
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setSpotifySearchLoading(true)
      setSpotifySearchError('')

      try {
        const response = await fetch(`/api/spotify-search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload?.error || 'Spotify search failed')
        }

        const tracks = Array.isArray(payload?.tracks) ? payload.tracks : []
        setSpotifyResults(tracks)
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Failed to search Spotify:', error)
        setSpotifyResults([])
        setSpotifySearchError(error instanceof Error ? error.message : 'Unable to search Spotify right now.')
      } finally {
        if (!controller.signal.aborted) {
          setSpotifySearchLoading(false)
        }
      }
    }, 350)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [spotifySearchInput])

  async function loadMessages() {
    try {
      const data = await freedomWallDb.list()
      setMessages(data)
      const storedMeta = getMessageMeta()
      const mergedMeta = data.reduce<Record<string, MessageMeta>>((acc, item) => {
        const meta = item as FreedomMessage & Partial<MessageMeta>
        const nextMeta = {
          nickname: meta.nickname ?? storedMeta[item.id]?.nickname ?? '',
          senderName: meta.senderName ?? storedMeta[item.id]?.senderName ?? '',
          recipientName: meta.recipientName ?? storedMeta[item.id]?.recipientName ?? '',
          spotifyUrl: meta.spotifyUrl ?? storedMeta[item.id]?.spotifyUrl ?? '',
          spotifyQuery: meta.spotifyQuery ?? storedMeta[item.id]?.spotifyQuery ?? '',
          songTitle: meta.songTitle ?? storedMeta[item.id]?.songTitle ?? '',
          songArtist: meta.songArtist ?? storedMeta[item.id]?.songArtist ?? '',
          songArtwork: meta.songArtwork ?? storedMeta[item.id]?.songArtwork ?? '',
        }
        if (Object.values(nextMeta).some(Boolean)) {
          acc[item.id] = nextMeta
        }
        return acc
      }, {})
      setMessageMeta({ ...storedMeta, ...mergedMeta })
      setLikedMessageIds(getLikedMessageIds())
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setWarning('')

    if (!newMessage.trim()) {
      setWarning('Please write a message')
      return
    }

    if (newMessage.length > 220) {
      setWarning('Message must be 220 characters or less')
      return
    }

    if (containsBadWords(newMessage)) {
      setWarning('Please keep it positive - inappropriate language is not allowed')
      return
    }

    const finalNickname = buildDisplayName(nicknameInput)
    const finalSenderName = buildDisplayName(senderNameInput)
    const finalRecipientName = buildDisplayName(recipientNameInput)

    if (!finalNickname || !finalSenderName || !finalRecipientName) {
      setWarning('Please add your nickname, sender name, and recipient name before posting')
      return
    }

    saveStoredNickname(finalNickname)

    try {
      const createdMessage = await freedomWallDb.submit({
        message: newMessage.trim(),
        color: selectedColor,
        meta: {
          nickname: finalNickname,
          senderName: finalSenderName,
          recipientName: finalRecipientName,
          spotifyUrl: selectedSong?.spotifyUrl || normalizeSpotifyUrl(spotifySearchInput),
          spotifyQuery: selectedSong ? `${selectedSong.title} ${selectedSong.artist}` : spotifySearchInput.trim(),
          songTitle: selectedSong?.title ?? '',
          songArtist: selectedSong?.artist ?? '',
          songArtwork: selectedSong?.artwork ?? '',
        },
      })

      const nextMeta = {
        ...messageMeta,
        [createdMessage.id]: {
          nickname: finalNickname,
          senderName: finalSenderName,
          recipientName: finalRecipientName,
          spotifyUrl: selectedSong?.previewUrl || selectedSong?.spotifyUrl || normalizeSpotifyUrl(spotifySearchInput),
          spotifyQuery: selectedSong ? `${selectedSong.title} ${selectedSong.artist}` : spotifySearchInput.trim(),
          songTitle: selectedSong?.title ?? '',
          songArtist: selectedSong?.artist ?? '',
          songArtwork: selectedSong?.artwork ?? '',
        },
      }
      setMessageMeta(nextMeta)
      saveMessageMeta(nextMeta)

      setNewMessage('')
      setNicknameInput(finalNickname)
      setSenderNameInput('')
      setRecipientNameInput('')
      setSpotifySearchInput('')
      setSelectedSong(null)
      setShowForm(false)
      setSelectedColor('yellow')
      await loadMessages()
    } catch {
      setWarning('Failed to post message. Please try again.')
    }
  }

  async function handleLike(id: string) {
    if (likedMessageIds.includes(id)) {
      setWarning('You already liked this message.')
      return
    }

    const nextLikedIds = [...likedMessageIds, id]
    setLikedMessageIds(nextLikedIds)
    saveLikedMessageIds(nextLikedIds)

    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, likes: msg.likes + 1 } : msg)))

    try {
      await freedomWallDb.like(id)
      await loadMessages()
    } catch (error) {
      console.error('Failed to like message:', error)
      setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, likes: Math.max(0, msg.likes - 1) } : msg)))
      const revertedIds = nextLikedIds.filter((likedId) => likedId !== id)
      setLikedMessageIds(revertedIds)
      saveLikedMessageIds(revertedIds)
    }
  }

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return messages

    return messages.filter((msg) => {
      const meta = messageMeta[msg.id] || {} as MessageMeta
      const haystack = [
        meta.nickname,
        meta.senderName,
        meta.recipientName,
        msg.message,
        meta.songTitle,
        meta.songArtist,
        meta.spotifyQuery,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [messages, messageMeta, searchQuery])

  const featuredMessages = useMemo(() => {
    return [...messages].sort((a, b) => b.likes - a.likes).slice(0, 4)
  }, [messages])

  function getRandomRotation() {
    return ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)]
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || lyricsLines.length === 0 || !activePlayback?.url) return

    const syncLyrics = () => {
      const nextIndex = getLyricIndexForTime(audio.currentTime, lyricsLines, audio.duration)
      setActiveLyricIndex((current) => (current === nextIndex ? current : nextIndex))
    }

    syncLyrics()
    audio.addEventListener('timeupdate', syncLyrics)
    audio.addEventListener('play', syncLyrics)
    audio.addEventListener('seeked', syncLyrics)

    return () => {
      audio.removeEventListener('timeupdate', syncLyrics)
      audio.removeEventListener('play', syncLyrics)
      audio.removeEventListener('seeked', syncLyrics)
    }
  }, [activePlayback?.url, lyricsLines])

  async function loadLyrics(title: string, artist: string) {
    const lyricsUrl = buildLyricsUrl(title, artist)

    if (!lyricsUrl) {
      setLyricsLines([])
      setLyricsStatus('error')
      setLyricsNotice('Lyrics unavailable for this track.')
      setActiveLyricIndex(0)
      return
    }

    setLyricsStatus('loading')
    setLyricsNotice('')
    setLyricsLines([])
    setActiveLyricIndex(0)

    try {
      const response = await fetch(lyricsUrl)
      if (!response.ok) throw new Error('Unable to load lyrics')

      const payload = await response.json()
      const lines = parseLyrics(payload?.lyrics ?? '')

      if (lines.length === 0) {
        setLyricsStatus('error')
        setLyricsNotice('No lyrics available for this track yet.')
        return
      }

      setLyricsLines(lines)
      setLyricsStatus('ready')
    } catch {
      setLyricsStatus('error')
      setLyricsNotice('Lyrics are not available for this track right now.')
    }
  }

  async function togglePreview(url: string, title?: string, artist?: string) {
    if (!url) return

    const audio = audioRef.current
    if (!audio) return

    if (activePreviewUrl === url && isPreviewPlaying) {
      audio.pause()
      setIsPreviewPlaying(false)
      setActivePreviewUrl(null)
      setActivePlayback(null)
      return
    }

    const playbackMeta = { url, title: title ?? '', artist: artist ?? '' }
    setActivePlayback(playbackMeta)
    setActiveLyricIndex(0)
    setPreviewError('')

    if (title || artist) {
      void loadLyrics(title ?? '', artist ?? '')
    } else {
      setLyricsLines([])
      setLyricsStatus('idle')
      setLyricsNotice('')
    }

    const startFromBeginning = () => {
      audio.currentTime = 0
      setActiveLyricIndex(0)
      audio.removeEventListener('loadedmetadata', startFromBeginning)
      audio.removeEventListener('canplay', startFromBeginning)
    }

    audio.pause()
    audio.src = url
    audio.load()
    audio.currentTime = 0
    audio.addEventListener('loadedmetadata', startFromBeginning, { once: true })
    audio.addEventListener('canplay', startFromBeginning, { once: true })

    try {
      await audio.play()
      audio.currentTime = 0
      setActivePreviewUrl(url)
      setIsPreviewPlaying(true)
      setPreviewError('')
    } catch {
      setActivePreviewUrl(url)
      setIsPreviewPlaying(false)
      setPreviewError('Preview playback was blocked by the browser. Please try another track.')
    }
  }

  function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900 mx-auto" />
          <p className="mt-4 text-ink-600">Loading freedom wall...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <audio ref={audioRef} preload="auto" controls className="hidden" />
        <div className="rounded-[32px] border border-amber-800/20 bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.10)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">Community music wall</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Share songs, moods, and messages</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                Search a song, send it to someone, and let the wall feel like a shared note board.
              </p>
            </div>
            <Button onClick={() => setShowForm(true)} className="rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-800">
              + Add a song
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mt-6 border border-amber-800/20 bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-800">Your nickname</label>
                  <input
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    placeholder="Enter your nickname"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    maxLength={24}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-800">Recipient</label>
                  <input
                    value={recipientNameInput}
                    onChange={(e) => setRecipientNameInput(e.target.value)}
                    placeholder="Who is this for?"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    maxLength={24}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">From</label>
                <input
                  value={senderNameInput}
                  onChange={(e) => setSenderNameInput(e.target.value)}
                  placeholder="Your name"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  maxLength={24}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800">Your message</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Share something positive..."
                  className="mt-2 min-h-[110px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  maxLength={220}
                />
              </div>

              <div className="rounded-[24px] border border-amber-800/20 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2">
                  <Music4 className="h-4 w-4 text-amber-700" />
                  <label className="text-sm font-semibold text-slate-800">Search songs</label>
                </div>
                <div className="relative mt-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={spotifySearchInput}
                    onChange={(e) => setSpotifySearchInput(e.target.value)}
                    placeholder="Search a track, artist, or mood"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {!spotifySearchInput.trim() && !spotifySearchLoading && !spotifySearchError && (
                    <p className="text-sm text-slate-600">Type a song title or artist to search music live.</p>
                  )}

                  {spotifySearchLoading && (
                    <p className="text-sm text-slate-600">Searching music…</p>
                  )}

                  {!spotifySearchLoading && spotifySearchError && (
                    <p className="rounded-2xl border border-amber-400/30 bg-amber-50 px-3 py-2 text-sm text-amber-700">{spotifySearchError}</p>
                  )}

                  {!spotifySearchLoading && !spotifySearchError && spotifySearchInput.trim() && spotifyResults.length === 0 && (
                    <p className="text-sm text-slate-600">No matches yet. Try another title or artist.</p>
                  )}

                  <div className="grid gap-2 sm:grid-cols-2">
                    {spotifyResults.map((item) => {
                      const isSelected = selectedSong?.id === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedSong(item)}
                          className={`rounded-2xl border p-3 text-left transition ${isSelected ? 'border-amber-600 bg-amber-100 shadow-sm' : 'border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50'}`}
                        >
                          {item.artwork ? (
                            <img src={item.artwork} alt={`${item.title} artwork`} className="h-14 w-full rounded-xl object-cover" />
                          ) : (
                            <div className="h-14 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400" />
                          )}
                          <p className="mt-3 text-sm font-semibold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-600">{item.artist}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {warning && (
                <p className="rounded-2xl border border-rose-400/30 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {warning}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" className="rounded-full bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800">
                  Post song
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setWarning(''); setNewMessage(''); setSpotifySearchInput(''); setSelectedSong(null); }} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="mt-6 rounded-[32px] border border-amber-800/20 bg-amber-900/10 p-6 shadow-inner">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Most liked notes</h2>
              <p className="text-sm text-slate-600">A rotating peek at the songs and messages people are loving most.</p>
            </div>
            <Button onClick={loadMessages} variant="ghost" className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
              <RotateCcw className="h-4 w-4" />
              Refresh wall
            </Button>
          </div>

          <div className="rounded-[28px] border border-amber-800/20 bg-amber-950/10 p-4">
            <div className="relative min-h-[260px] overflow-hidden rounded-[24px] border border-amber-800/20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(255,255,255,0.15))] p-4">
              {messages.slice(0, 6).map((msg, index) => {
                const meta = messageMeta[msg.id] || {} as MessageMeta
                const rotation = getRandomRotation()
                const colorConfig = COLORS[index % COLORS.length]
                const top = ['12%', '24%', '48%', '68%', '20%', '58%'][index]
                const left = ['6%', '28%', '58%', '74%', '44%', '16%'][index]

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className={`absolute w-[160px] rounded-[18px] border-2 p-3 shadow-lg ${colorConfig.bg} ${colorConfig.border} ${colorConfig.shadow}`}
                    style={{ top, left, transform: `rotate(${rotation}deg)` }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">{meta.senderName || meta.nickname || 'Anonymous'}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">{msg.message.slice(0, 36)}{msg.message.length > 36 ? '…' : ''}</p>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-4 rounded-[24px] border border-amber-800/20 bg-white/80 p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Sparkles className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em]">Most-liked loop</h3>
              </div>
              {featuredMessages.length > 0 ? (
                <div className="mt-3 flex flex-col gap-3 md:flex-row">
                  {featuredMessages.map((msg, index) => {
                    const meta = messageMeta[msg.id] || {} as MessageMeta
                    const isActive = index === featuredIndex % featuredMessages.length
                    return (
                      <div key={msg.id} className={`rounded-2xl border p-3 transition ${isActive ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-slate-200 bg-white'}`}>
                        <p className="text-sm font-semibold text-slate-800">{meta.recipientName ? `For ${meta.recipientName}` : 'A new note'}</p>
                        <p className="mt-1 text-sm text-slate-600">{msg.message.slice(0, 70)}{msg.message.length > 70 ? '…' : ''}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                          <span>{meta.senderName || meta.nickname || 'Anonymous'}</span>
                          <span>{msg.likes} likes</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">The featured rail will appear once there are liked notes.</p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-amber-800/20 bg-white/80 p-5">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Share your notes here</h3>
                <p className="text-sm text-slate-600">Search by nickname, message, or song title.</p>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-amber-800/20 bg-amber-50/70 p-10 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-amber-600/60" />
                <p className="mt-3 text-sm text-slate-600">No notes match that search yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((msg) => {
                  const meta = messageMeta[msg.id] || {} as MessageMeta
                  const spotifyUrl = getSpotifyAudioUrl(meta.spotifyUrl ?? '')

                  return (
                    <div key={msg.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">{meta.senderName || meta.nickname || 'Anonymous'}</p>
                            <span className="text-xs text-slate-500">to</span>
                            <p className="text-sm font-semibold text-slate-700">{meta.recipientName || 'someone special'}</p>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{formatDate(msg.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => handleLike(msg.id)}
                          disabled={likedMessageIds.includes(msg.id)}
                          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm transition ${likedMessageIds.includes(msg.id) ? 'bg-rose-500/15 text-rose-600' : 'bg-slate-100 text-slate-700 hover:bg-rose-500/10 hover:text-rose-600'}`}
                        >
                          <Heart className={`h-4 w-4 ${likedMessageIds.includes(msg.id) ? 'fill-rose-500' : ''}`} />
                          {msg.likes}
                        </button>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{msg.message}</p>

                      {meta.songTitle && (
                        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${meta.songArtwork || 'from-amber-400 to-rose-400'}`} />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{meta.songTitle}</p>
                            <p className="text-xs text-slate-500">{meta.songArtist}</p>
                          </div>
                        </div>
                      )}

                      {spotifyUrl ? (
                        <div className="mt-3 overflow-hidden rounded-[24px] border border-emerald-600/20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-3 text-white shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                          <div className="flex items-center gap-3">
                            {meta.songArtwork ? (
                              <img src={meta.songArtwork} alt={meta.songTitle || 'Album artwork'} className="h-14 w-14 rounded-xl object-cover shadow-md" />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-white/80">
                                <Music4 className="h-6 w-6" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{meta.songTitle || 'Untitled track'}</p>
                              <p className="truncate text-xs text-emerald-100/80">{meta.songArtist || 'Unknown artist'}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => void togglePreview(spotifyUrl, meta.songTitle || '', meta.songArtist || '')}
                              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                              aria-label={isPreviewPlaying && activePreviewUrl === spotifyUrl ? 'Pause preview' : 'Play preview'}
                            >
                              {isPreviewPlaying && activePreviewUrl === spotifyUrl ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              {isPreviewPlaying && activePreviewUrl === spotifyUrl ? (
                                <span className="absolute inset-0 rounded-full border-2 border-emerald-300/60 animate-ping" />
                              ) : null}
                            </button>
                          </div>

                          <div className="mt-3 rounded-[18px] border border-white/10 bg-black/10 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                                  <Music4 className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-100/70">Now playing</p>
                                  <p className="truncate text-sm font-semibold text-white">{meta.songTitle || 'Untitled track'}</p>
                                </div>
                              </div>
                              <span className="text-[10px] uppercase tracking-[0.24em] text-emerald-100/70">
                                {isPreviewPlaying && activePreviewUrl === spotifyUrl ? 'Live' : 'Preview'}
                              </span>
                            </div>

                            {activePreviewUrl === spotifyUrl ? (
                              <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-100/70">Live lyrics</p>
                                  <span className="text-[10px] text-emerald-100/70">
                                    {lyricsStatus === 'loading' ? 'Loading…' : lyricsStatus === 'ready' ? 'Synced' : 'Preview'}
                                  </span>
                                </div>

                                <div className="mt-2 min-h-[40px]">
                                  {lyricsStatus === 'loading' ? (
                                    <p className="text-sm text-emerald-50/90">Finding lyrics for this track…</p>
                                  ) : null}
                                  {lyricsStatus === 'error' ? (
                                    <p className="text-sm text-amber-100">{lyricsNotice}</p>
                                  ) : null}
                                  {lyricsStatus === 'ready' && lyricsLines.length > 0 ? (
                                    <p className="text-sm font-semibold text-white">{lyricsLines[activeLyricIndex] || lyricsLines[0]}</p>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                          </div>

                          {previewError && activePreviewUrl === spotifyUrl ? (
                            <p className="mt-2 text-[11px] text-amber-200">{previewError}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
