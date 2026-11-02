import { useEffect } from 'react'
import { X, Play, CheckCircle } from 'lucide-react'
import type { EduVideo } from '../types/education'

interface VideoPlayerModalProps {
  video: EduVideo | null
  onClose: () => void
  onWatchComplete?: (videoId: string) => void
}

export function VideoPlayerModal({
  video,
  onClose,
  onWatchComplete
}: VideoPlayerModalProps) {
  useEffect(() => {
    if (!video) return

    // Selesaikan misi tonton video
    if (onWatchComplete) {
      onWatchComplete(video.id)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [video, onClose, onWatchComplete])

  if (!video) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-line shadow-2xl overflow-hidden my-8 z-10">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-canvas/50">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-light text-brand px-2.5 py-0.5 text-xs font-bold border border-brand-subtle">
              {video.category}
            </span>
            <span className="text-xs text-muted font-medium">
              Durasi: {video.duration}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup video"
            className="rounded-lg p-1 text-muted hover:bg-surface-subtle hover:text-main transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Player (16:9 Iframe) */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={`${video.embedUrl}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Video Info */}
        <div className="p-5 space-y-2 bg-white">
          <h2
            id="video-modal-title"
            className="font-display text-lg font-bold text-main"
          >
            {video.title}
          </h2>
          <p className="text-xs text-body leading-relaxed">
            {video.description}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-line mt-3">
            <div className="flex items-center gap-1.5 text-xs text-brand font-semibold">
              <CheckCircle className="h-4 w-4" />
              <span>Misi tonton video tercatat selesai!</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg bg-surface-subtle border border-line px-3.5 py-1.5 text-xs font-semibold text-main hover:bg-canvas transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5 text-brand" />
              Selesai Menonton
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
