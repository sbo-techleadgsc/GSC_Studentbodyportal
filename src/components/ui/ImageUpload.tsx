import { useState, useRef } from 'react'
import { X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadImage, deleteImage } from '@/lib/storage'
import { clsx } from '@/lib/clsx'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  folder?: string
  className?: string
}

export function ImageUpload({ value, onChange, label = 'Image', folder = 'general', className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const result = await uploadImage(file, folder)

    if (result.error) {
      setError(result.error)
      setUploading(false)
      return
    }

    onChange(result.url)
    setUploading(false)
  }

  async function handleRemove() {
    if (value) {
      await deleteImage(value)
    }
    onChange('')
    setError('')
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {label && <label className="block text-sm font-semibold text-ink-900">{label}</label>}
      
      <div className="relative">
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt="Uploaded"
              className="h-40 w-full rounded-app border border-navy-900/10 object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-lg transition hover:bg-white"
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              'flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-app border-2 border-dashed transition',
              error ? 'border-danger-300 bg-danger-50' : 'border-navy-900/20 bg-surface-muted hover:border-navy-900/40 hover:bg-navy-50'
            )}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-navy-900" />
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-ink-400" />
                <p className="mt-2 text-sm font-medium text-ink-600">Click to upload image</p>
                <p className="text-xs text-ink-400">PNG, JPG, WebP up to 5MB</p>
              </>
            )}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {error && (
        <p className="text-xs text-danger-600">{error}</p>
      )}

      {value && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image URL..."
            className="flex-1 rounded-app border border-navy-900/10 bg-surface px-3 py-2 text-xs text-ink-900 focus:border-navy-900/30 focus:outline-none"
          />
        </div>
      )}
    </div>
  )
}
