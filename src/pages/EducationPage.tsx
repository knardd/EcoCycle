import { useState } from 'react'
import {
  BookOpen,
  Video,
  PenSquare,
  ShieldCheck,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Eye,
  Play,
  Megaphone,
  Calendar,
  MapPin,
  Trash2,
  Plus
} from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { playSuccessChime } from '../lib/sound'
import type { EduArticle, EduVideo } from '../types/education'
import { ArticleDetailModal } from '../components/ArticleDetailModal'
import { ArticleFormModal } from '../components/ArticleFormModal'
import { VideoPlayerModal } from '../components/VideoPlayerModal'
import { AnnouncementFormModal } from '../components/AnnouncementFormModal'

type EducationTab = 'articles' | 'videos' | 'announcements' | 'moderation'

const getTodayDateStr = () => new Date().toISOString().split('T')[0]

export function EducationPage() {
  const {
    articles,
    videos,
    announcements,
    markArticleRead,
    markVideoWatched,
    submitArticle,
    approveArticle,
    rejectArticle,
    addAnnouncement,
    deleteAnnouncement
  } = useData()
  const { profile, addBonusPoints } = useAuth()

  const isStaffOrAdmin =
    profile?.role === 'branch_staff' ||
    profile?.role === 'school_admin' ||
    profile?.role === 'platform_admin'

  const [activeTab, setActiveTab] = useState<EducationTab>('articles')
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua')

  // State Modal
  const [readingArticle, setReadingArticle] = useState<EduArticle | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAnnouncementFormOpen, setIsAnnouncementFormOpen] = useState(false)
  const [watchingVideo, setWatchingVideo] = useState<EduVideo | null>(null)
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null)

  // Filter artikel yang sudah disetujui untuk ditampilkan ke publik
  const approvedArticles = articles.filter((a) => a.status === 'approved')
  const pendingArticles = articles.filter((a) => a.status === 'pending_review')

  const filteredArticles = approvedArticles.filter((a) => {
    if (selectedCategory === 'Semua') return true
    return a.category === selectedCategory
  })

  // Filter pengumuman: Mendatang vs Selesai (berdasarkan tanggal hari ini)
  const todayStr = getTodayDateStr()
  const upcomingAnnouncements = announcements
    .filter((a) => a.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
  const pastAnnouncements = announcements
    .filter((a) => a.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date))

  const CATEGORY_FILTERS = [
    'Semua',
    'Plastik',
    'Kertas & Kardus',
    'Minyak Jelantah',
    'Kompos',
    'Kreasi Kriya'
  ]

  const formatDisplayDate = (isoDate: string) => {
    try {
      const parts = isoDate.split('-')
      if (parts.length === 3) {
        const year = parts[0]
        const monthIdx = parseInt(parts[1], 10) - 1
        const day = parts[2]
        const months = [
          'Januari',
          'Februari',
          'Maret',
          'April',
          'Mei',
          'Juni',
          'Juli',
          'Agustus',
          'September',
          'Oktober',
          'November',
          'Desember'
        ]
        return `${day} ${months[monthIdx]} ${year}`
      }
      return isoDate
    } catch {
      return isoDate
    }
  }

  const handleApprove = (article: EduArticle) => {
    approveArticle(article.id)
    playSuccessChime()

    // Jika siswa yang sedang login adalah si penulis, tambahkan saldo langsung
    if (
      profile?.role === 'student' &&
      article.authorName.toLowerCase() === (profile?.full_name || '').toLowerCase()
    ) {
      addBonusPoints(article.pointsReward || 50)
    }

    setFeedbackNotice(
      `Naskah "${article.title}" karya ${article.authorName} telah disetujui dan poin +${article.pointsReward} dicairkan!`
    )
  }

  const handleReject = (article: EduArticle) => {
    rejectArticle(article.id)
    setFeedbackNotice(`Naskah "${article.title}" telah ditolak.`)
  }

  const handleFormSubmit = (data: {
    title: string
    category: EduArticle['category']
    content: string
    summary: string
  }) => {
    submitArticle({
      ...data,
      authorName: profile?.full_name || 'Siswa Mandiri',
      authorNis: profile?.nis || '8492',
      authorClassName: profile?.class_name || '8A'
    })
    setFeedbackNotice(
      'Naskah berhasil dikirim! Naskah akan dimoderasi oleh guru/petugas pos. Poin reward (+50 poin) akan cair pada hari naskah disetujui.'
    )
  }

  const handleCreateAnnouncement = (data: {
    title: string
    date: string
    time: string
    location: string
    description: string
  }) => {
    addAnnouncement(data)
    playSuccessChime()
    setFeedbackNotice('Pengumuman kegiatan baru berhasil diterbitkan!')
  }

  const handleDeleteAnnouncement = (id: string, title: string) => {
    if (window.confirm(`Hapus pengumuman "${title}"?`)) {
      deleteAnnouncement(id)
      setFeedbackNotice(`Pengumuman "${title}" telah dihapus.`)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Feedback Banner */}
      {feedbackNotice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl bg-brand-light border border-brand-subtle px-4 py-3 text-xs font-semibold text-brand-deep"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-xs text-muted hover:text-main cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-main">
            Pusat Edukasi & Karya Lingkungan
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Panduan memilah sampah, tutorial video daur ulang, agenda kegiatan, serta karya siswa.
          </p>
        </div>

        {activeTab === 'announcements' && isStaffOrAdmin ? (
          <button
            onClick={() => setIsAnnouncementFormOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            Buat Pengumuman Baru
          </button>
        ) : (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <PenSquare className="h-4 w-4" />
            Tulis Artikel Siswa
          </button>
        )}
      </div>

      {/* Navigasi Tab */}
      <div className="border-b border-line flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'articles'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted hover:text-main'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Artikel & Panduan ({approvedArticles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'videos'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted hover:text-main'
          }`}
        >
          <Video className="h-4 w-4" />
          <span>Video Edukasi ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted hover:text-main'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Pengumuman Kegiatan ({upcomingAnnouncements.length})</span>
        </button>

        {isStaffOrAdmin && (
          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-main'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Moderasi Naskah</span>
            {pendingArticles.length > 0 && (
              <span className="rounded-full bg-amber-500 text-white px-2 py-0.2 text-[10px] font-extrabold ml-1">
                {pendingArticles.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* KONTEN TAB 1: ARTIKEL */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {/* Filter Kategori */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted mr-1">Kategori:</span>
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer border ${
                    isActive
                      ? 'bg-brand text-white border-brand shadow-xs'
                      : 'bg-white text-body border-line hover:bg-surface-subtle'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Grid Kartu Artikel */}
          {filteredArticles.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-8 text-center text-xs text-muted">
              Tidak ada artikel pada kategori ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setReadingArticle(article)}
                  className="rounded-2xl border border-line bg-white p-5 hover:border-brand/50 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-brand-light text-brand px-2.5 py-0.5 text-[10px] font-bold border border-brand-subtle">
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted">
                        <Clock className="h-3 w-3" />
                        {article.readTimeMinutes} menit
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-main group-hover:text-brand transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-xs text-body line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="h-3.5 w-3.5 text-brand shrink-0" />
                      <span className="font-semibold text-main truncate">
                        {article.authorName}
                      </span>
                      {article.authorClassName && (
                        <span className="text-[11px] text-muted truncate">
                          ({article.authorClassName})
                        </span>
                      )}
                    </div>
                    <span className="text-brand font-semibold text-[11px] flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                      Baca Naskah &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* KONTEN TAB 2: VIDEO */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {videos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => setWatchingVideo(vid)}
              className="rounded-2xl border border-line bg-white overflow-hidden hover:border-brand/50 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-main/10 overflow-hidden">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-main/20 flex items-center justify-center group-hover:bg-main/30 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-brand text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 ml-0.5 fill-current" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 rounded-md bg-main/80 text-white px-2 py-0.5 text-[10px] font-bold">
                    {vid.duration}
                  </span>
                </div>

                <div className="p-4 space-y-1.5">
                  <span className="rounded-full bg-brand-light text-brand px-2 py-0.5 text-[10px] font-bold border border-brand-subtle inline-block">
                    {vid.category}
                  </span>
                  <h3 className="font-display text-sm font-bold text-main line-clamp-2 group-hover:text-brand transition-colors">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-body line-clamp-2">
                    {vid.description}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-1">
                <span className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-surface-subtle py-2 text-xs font-semibold text-main group-hover:bg-brand group-hover:text-white transition-colors">
                  <Play className="h-3.5 w-3.5" />
                  Tonton Video
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KONTEN TAB 3: PENGUMUMAN KEGIATAN */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* Sub-bagian 1: Kegiatan Mendatang */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-main flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand" />
                <span>Kegiatan Mendatang</span>
              </h2>
              <span className="text-xs text-muted">
                {upcomingAnnouncements.length} agenda terdaftar
              </span>
            </div>

            {upcomingAnnouncements.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-8 text-center text-xs text-muted">
                Belum ada agenda kegiatan mendatang yang diumumkan.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-2xl border-2 border-brand-subtle bg-white p-5 space-y-3 shadow-xs hover:border-brand transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-brand-light text-brand px-2.5 py-0.5 text-[11px] font-bold border border-brand-subtle">
                          Mendatang
                        </span>
                        {isStaffOrAdmin && (
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                            aria-label="Hapus pengumuman"
                            className="p-1 text-muted hover:text-red-600 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <h3 className="font-display text-base font-bold text-main">
                        {ann.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-body pt-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-brand shrink-0" />
                          <span className="font-semibold text-main">
                            {formatDisplayDate(ann.date)}
                          </span>
                          <span>•</span>
                          <span>{ann.time}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                          <span>{ann.location}</span>
                        </div>
                      </div>

                      <p className="text-xs text-body leading-relaxed pt-2 border-t border-line">
                        {ann.description}
                      </p>
                    </div>

                    <div className="text-[11px] text-muted pt-2 flex items-center justify-between">
                      <span>Diumumkan: {ann.createdAt}</span>
                      <span className="text-brand font-semibold">Pengelola Pos</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sub-bagian 2: Riwayat Kegiatan Lampau (Selesai) */}
          {pastAnnouncements.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-line">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-muted flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Riwayat Kegiatan Selesai</span>
                </h2>
                <span className="text-xs text-muted">
                  {pastAnnouncements.length} kegiatan lampau
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="rounded-2xl border border-line bg-canvas/60 p-4 space-y-2 opacity-85"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-surface-subtle text-muted px-2 py-0.5 text-[10px] font-bold">
                        Selesai
                      </span>
                      {isStaffOrAdmin && (
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                          aria-label="Hapus pengumuman"
                          className="p-1 text-muted hover:text-red-600 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="font-display text-sm font-bold text-main">
                      {ann.title}
                    </h3>

                    <div className="text-[11px] text-muted flex items-center gap-2">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{formatDisplayDate(ann.date)}</span>
                      <span>•</span>
                      <span>{ann.location}</span>
                    </div>

                    <p className="text-[11px] text-body line-clamp-2">
                      {ann.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KONTEN TAB 4: MODERASI (STAF POS & GURU) */}
      {activeTab === 'moderation' && isStaffOrAdmin && (
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-canvas p-4 text-xs text-muted flex items-center justify-between">
            <span>
              Menampilkan <strong>{pendingArticles.length} naskah siswa</strong> yang menunggu peninjauan dan persetujuan.
            </span>
            <span className="text-brand font-semibold">
              Poin reward (+50 Poin) akan dicairkan saat disetujui.
            </span>
          </div>

          {pendingArticles.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-12 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-brand mx-auto" />
              <h3 className="font-display text-base font-bold text-main">
                Semua Naskah Telah Ditinjau
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Tidak ada naskah siswa baru yang sedang menunggu persetujuan saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingArticles.map((art) => (
                <div
                  key={art.id}
                  className="rounded-2xl border border-line bg-white p-5 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-bold border border-amber-200">
                        Menunggu Persetujuan
                      </span>
                      <span className="rounded-full bg-surface-subtle text-body px-2.5 py-0.5 text-xs font-semibold">
                        {art.category}
                      </span>
                    </div>
                    <span className="text-xs text-muted">
                      Dikirim pada: {art.submittedAt}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-display text-base font-bold text-main">
                      {art.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-body">
                      <User className="h-3.5 w-3.5 text-brand" />
                      <span className="font-semibold text-main">{art.authorName}</span>
                      <span>•</span>
                      <span>Kelas {art.authorClassName || '8A'}</span>
                      <span>•</span>
                      <span>NIS {art.authorNis || '8492'}</span>
                    </div>
                    <p className="text-xs text-muted italic bg-canvas p-2.5 rounded-lg border border-line mt-2">
                      "{art.summary}"
                    </p>
                    <div className="text-xs text-body whitespace-pre-line pt-2 line-clamp-3">
                      {art.content}
                    </div>
                  </div>

                  {/* Tombol Moderasi */}
                  <div className="flex items-center justify-between pt-3 border-t border-line">
                    <button
                      onClick={() => setReadingArticle(art)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-body hover:text-brand transition-colors cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      Baca Seluruh Naskah
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(art)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <XCircle className="h-4 w-4" />
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApprove(art)}
                        className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Setujui & Beri Poin (+50)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Baca Artikel */}
      <ArticleDetailModal
        article={readingArticle}
        onClose={() => setReadingArticle(null)}
        onReadComplete={markArticleRead}
      />

      {/* Modal Tulis Artikel Siswa */}
      <ArticleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Modal Tonton Video */}
      <VideoPlayerModal
        video={watchingVideo}
        onClose={() => setWatchingVideo(null)}
        onWatchComplete={markVideoWatched}
      />

      {/* Modal Buat Pengumuman Baru (Khusus Staf/Admin) */}
      <AnnouncementFormModal
        isOpen={isAnnouncementFormOpen}
        onClose={() => setIsAnnouncementFormOpen(false)}
        onSubmit={handleCreateAnnouncement}
      />
    </div>
  )
}
