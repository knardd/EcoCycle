import { useEffect } from 'react'
import { X, Clock, User, BookOpen, CheckCircle } from 'lucide-react'
import type { EduArticle } from '../types/education'

interface ArticleDetailModalProps {
  article: EduArticle | null
  onClose: () => void
  onReadComplete?: (articleId: string) => void
}

export function ArticleDetailModal({
  article,
  onClose,
  onReadComplete
}: ArticleDetailModalProps) {
  useEffect(() => {
    if (!article) return

    // Tandai artikel sudah dibaca untuk menyelesaikan misi harian
    if (onReadComplete) {
      onReadComplete(article.id)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [article, onClose, onReadComplete])

  if (!article) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main/40 backdrop-blur-xs overflow-y-auto"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-line shadow-xl overflow-hidden my-8 z-10">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-canvas/40">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-light text-brand px-3 py-1 text-xs font-bold border border-brand-subtle">
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <Clock className="h-3.5 w-3.5" />
              {article.readTimeMinutes} menit baca
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup artikel"
            className="rounded-lg p-1.5 text-muted hover:bg-surface-subtle hover:text-main transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Isi Artikel */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          <h2
            id="article-modal-title"
            className="font-display text-xl sm:text-2xl font-bold text-main leading-tight"
          >
            {article.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-body pb-3 border-b border-line">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-brand" />
              <span className="font-semibold text-main">{article.authorName}</span>
              {article.authorClassName && (
                <span className="text-muted">({article.authorClassName})</span>
              )}
            </div>
            <span>•</span>
            <span className="text-muted">
              {article.authorRole}
            </span>
            <span>•</span>
            <span className="text-muted">
              Diterbitkan: {article.approvedAt || article.submittedAt}
            </span>
          </div>

          <div className="bg-brand-light/30 border-l-4 border-brand p-3 rounded-r-lg text-xs text-main italic">
            "{article.summary}"
          </div>

          <div className="prose prose-sm max-w-none text-main space-y-3.5 text-sm leading-relaxed whitespace-pre-line pt-2">
            {article.content}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="border-t border-line px-6 py-3.5 bg-canvas/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-brand font-semibold">
            <CheckCircle className="h-4 w-4" />
            <span>Misi membaca artikel tercatat selesai!</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Selesai Membaca
          </button>
        </div>
      </div>
    </div>
  )
}
