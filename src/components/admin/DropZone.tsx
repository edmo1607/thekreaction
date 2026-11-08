import { useState, type DragEvent } from 'react'
import { Icon } from '../Icon'
import { uploadMedia } from '../../lib/api'
import { mediaUrl } from '../../lib/supabase'

interface Props {
  kind: 'cover' | 'video'
  path: string | null
  onChange: (path: string | null) => void
}

const CONFIG = {
  cover: {
    accept: 'image/jpeg,image/png,image/webp,image/avif',
    folder: 'covers' as const,
    title: 'Drop image or browse',
    hint: 'JPG, PNG or WebP · vertical 3:4 works best',
    maxMb: 15,
  },
  video: {
    accept: 'video/mp4,video/quicktime,video/webm',
    folder: 'videos' as const,
    title: 'Drop video or browse',
    hint: 'MP4 or MOV · up to 500 MB · plays on hover',
    maxMb: 500,
  },
}

export function DropZone({ kind, path, onChange }: Props) {
  const cfg = CONFIG[kind]
  const [over, setOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const url = mediaUrl(path)

  async function handle(file: File | undefined) {
    if (!file) return
    setError('')
    const okType = cfg.accept.split(',').includes(file.type)
    if (!okType) return setError(kind === 'cover' ? 'Use a JPG, PNG or WebP image.' : 'Use an MP4, MOV or WebM video.')
    if (file.size > cfg.maxMb * 1024 * 1024) return setError(`File is larger than ${cfg.maxMb} MB.`)
    setUploading(true)
    try {
      onChange(await uploadMedia(file, cfg.folder))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setOver(false)
    void handle(e.dataTransfer.files[0])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      <label
        className={`drop drop--${kind}${over ? ' drop--over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept={cfg.accept}
          onChange={(e) => {
            void handle(e.target.files?.[0])
            e.target.value = ''
          }}
          disabled={uploading}
        />
        {url && !uploading ? (
          <>
            {kind === 'cover' ? (
              <img className="drop__preview" src={url} alt="Cover preview" />
            ) : (
              <video className="drop__preview" src={url} muted playsInline controls />
            )}
            <span className="drop__replace">Replace {kind === 'cover' ? 'image' : 'video'}</span>
          </>
        ) : (
          <>
            <Icon name={kind === 'cover' ? 'image' : 'reel'} size={28} strokeWidth={1.6} />
            <strong>{uploading ? 'Uploading…' : cfg.title}</strong>
            <small>{cfg.hint}</small>
          </>
        )}
      </label>
      {url && !uploading && (
        <button type="button" className="link-btn" style={{ alignSelf: 'flex-start', minHeight: 32 }} onClick={() => onChange(null)}>
          Remove {kind === 'cover' ? 'image' : 'video'}
        </button>
      )}
      {error && (
        <p className="form__error" role="alert" style={{ fontSize: 13 }}>
          {error}
        </p>
      )}
    </div>
  )
}
