import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Primitives'
import { useLiveData } from '@/lib/hooks'
import { freedomWallDb } from '@/lib/store'
import type { FreedomMessage } from '@/lib/types'

export default function AdminCommunity() {
  const [messages, reload] = useLiveData(freedomWallDb.list)
  const [busyId, setBusyId] = useState<string | null>(null)

  const visibleMessages = useMemo(() => {
    return (messages ?? []).filter((message) => !message.isDeleted)
  }, [messages])

  async function handleRemove(id: string) {
    setBusyId(id)
    try {
      await freedomWallDb.remove(id)
      await reload()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Community wall</h1>
          <p className="mt-1 text-sm text-ink-600">Remove inappropriate or outdated notes from the public wall.</p>
        </div>
      </div>

      <Card className="mt-6 overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Message</th>
                <th className="px-4 py-3 font-semibold">Author</th>
                <th className="px-4 py-3 font-semibold">Song</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleMessages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No community notes to moderate yet.</td>
                </tr>
              ) : (
                visibleMessages.map((message) => (
                  <tr key={message.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 align-top">
                      <p className="font-semibold text-slate-800">{message.message}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-600">
                      <p>{message.nickname || message.senderName || 'Anonymous'}</p>
                      <p className="text-xs text-slate-500">to {message.recipientName || 'someone special'}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-slate-600">
                      {message.songTitle ? <p className="font-medium text-slate-800">{message.songTitle}</p> : <span className="text-slate-400">No song</span>}
                      {message.songArtist ? <p className="text-xs text-slate-500">{message.songArtist}</p> : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        onClick={() => void handleRemove(message.id)}
                        disabled={busyId === message.id}
                        className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {busyId === message.id ? 'Removing…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
