import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '@/components/ui/Primitives'
import { Mic, Music4, Send, Copy, CheckCircle2, AlertCircle, Play, Pause } from 'lucide-react'

type ShareRecord = {
  id: string
  audioUrl: string
  senderName: string
  recipientName: string
  message: string
  createdAt: string
}

const STORAGE_KEY = 'sbo_send_song_shares'

function readShares(): ShareRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ShareRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeShares(shares: ShareRecord[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shares))
}

export function SendSongPage() {
  const [senderName, setSenderName] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [message, setMessage] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState('Record a voice note or upload a song file to send.')
  const [copied, setCopied] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [shares, setShares] = useState<ShareRecord[]>(() => readShares())

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const shareUrl = useMemo(() => {
    if (!shareLink) return ''
    return `${window.location.origin}${shareLink}`
  }, [shareLink])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('Your browser does not support microphone recording.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        setStatus('Recording saved. You can send it now.')
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setIsRecording(true)
      setStatus('Recording... speak clearly into your mic.')
    } catch {
      setStatus('Microphone permission was denied or unavailable.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setStatus('Uploading your audio file...')

    try {
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
      setStatus('Audio file ready to send.')
    } catch {
      setStatus('The file could not be loaded. Please try another file.')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!senderName.trim() || !recipientName.trim() || !message.trim()) {
      setStatus('Please fill in your name, the recipient name, and a message.')
      return
    }

    if (!audioUrl) {
      setStatus('Please record or upload an audio file first.')
      return
    }

    setIsUploading(true)
    setStatus('Creating your share link...')

    try {
      const id = `song-${Math.random().toString(36).slice(2, 10)}`
      const record: ShareRecord = {
        id,
        audioUrl,
        senderName: senderName.trim(),
        recipientName: recipientName.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
      }

      const nextShares = [record, ...readShares()]
      writeShares(nextShares)
      setShares(nextShares)
      const newLink = `/song/${id}`
      setShareLink(newLink)
      setCopied(false)
      setStatus('Your song link is ready. Share it with your recipient.')
    } catch {
      setStatus('Something went wrong while creating the link.')
    } finally {
      setIsUploading(false)
    }
  }

  async function copyLink() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">Send a Song</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Make a personal song message that opens instantly</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Record a voice note, upload a file, add a message, and send a link that plays right in the browser.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border border-white/10 bg-slate-900/70 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold text-slate-200">
                  Your name
                  <input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Alex" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none ring-0" />
                </label>
                <label className="text-sm font-semibold text-slate-200">
                  Recipient name
                  <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Jordan" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none ring-0" />
                </label>
              </div>

              <label className="block text-sm font-semibold text-slate-200">
                Your message
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell them why this song matters..." className="mt-2 min-h-[110px] w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none" />
              </label>

              <div className="grid gap-3 rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-amber-200">Record live</p>
                  <p className="mt-1 text-xs text-slate-300">Use your microphone to capture a quick message.</p>
                </div>
                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button type="button" onClick={startRecording} className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400">
                      <Mic className="mr-2 h-4 w-4" /> Record
                    </Button>
                  ) : (
                    <Button type="button" onClick={stopRecording} variant="danger" className="rounded-full px-4 py-2 text-sm font-semibold">
                      <Mic className="mr-2 h-4 w-4" /> Stop
                    </Button>
                  )}
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-600 bg-slate-800/80 px-4 py-4 text-sm font-semibold text-slate-200">
                <Music4 className="h-4 w-4" />
                Upload a song or audio file
                <input type="file" accept="audio/*" className="hidden" onChange={handleUpload} />
              </label>

              {audioUrl && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-400">
                  <Send className="mr-2 h-4 w-4" /> Create link
                </Button>
                {shareUrl && (
                  <Button type="button" variant="outline" onClick={copyLink} className="rounded-full border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">
                    {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} {copied ? 'Copied' : 'Copy link'}
                  </Button>
                )}
              </div>

              <div className={`rounded-2xl border px-3 py-3 text-sm ${status.includes('ready') || status.includes('Created') ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-slate-800/70 text-slate-300'}`}>
                {status}
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="border border-white/10 bg-slate-900/70 p-6">
              <div className="flex items-center gap-2 text-amber-300">
                <Play className="h-4 w-4" />
                <h2 className="text-lg font-semibold">Recent shares</h2>
              </div>
              <div className="mt-4 space-y-3">
                {shares.length === 0 ? (
                  <p className="text-sm text-slate-400">No links created yet. Your latest sends will appear here.</p>
                ) : (
                  shares.slice(0, 5).map((share) => (
                    <Link key={share.id} to={`/song/${share.id}`} className="block rounded-2xl border border-white/10 bg-slate-800/70 p-3 text-sm text-slate-200 hover:bg-slate-800">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{share.recipientName}</span>
                        <span className="text-xs text-slate-400">{new Date(share.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">From {share.senderName}</p>
                    </Link>
                  ))
                )}
              </div>
            </Card>

            <Card className="border border-white/10 bg-slate-900/70 p-6">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertCircle className="h-4 w-4" />
                <h2 className="text-lg font-semibold">How it works</h2>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>• Record or upload an audio message</li>
                <li>• Add an optional personal note</li>
                <li>• Share the generated link instantly</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SongSharePage() {
  const { id } = useParams()
  const [share, setShare] = useState<ShareRecord | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const shares = readShares()
    const match = shares.find((item) => item.id === id)
    if (match) {
      setShare(match)
      return
    }
    setError('This song link could not be found.')
  }, [id])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
        <Card className="max-w-xl border border-white/10 bg-slate-900/70 p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-400" />
          <h1 className="mt-4 text-2xl font-bold">Link unavailable</h1>
          <p className="mt-2 text-sm text-slate-400">The song message might have been removed or the link is invalid.</p>
        </Card>
      </div>
    )
  }

  if (!share) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-4 py-8 text-slate-100">
      <Card className="w-full max-w-2xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl">
        <div className="flex items-center gap-2 text-amber-300">
          <Music4 className="h-5 w-5" />
          <h1 className="text-2xl font-bold">A song for {share.recipientName}</h1>
        </div>
        <p className="mt-3 text-sm text-slate-300">From {share.senderName}</p>
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-800/70 p-4">
          <audio controls src={share.audioUrl} className="w-full" />
        </div>
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-800/70 p-5">
          <p className="text-sm font-semibold text-slate-200">Message</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">{share.message}</p>
        </div>
      </Card>
    </div>
  )
}
