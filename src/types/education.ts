export type MissionType = 'login' | 'read_article' | 'watch_video' | 'article_approved'

export interface DailyMission {
  id: string
  title: string
  description: string
  pointsReward: number
  type: MissionType
  isCompleted: boolean
  isClaimed: boolean
  targetCount: number
  currentCount: number
}

export type ArticleStatus = 'approved' | 'pending_review' | 'rejected'

export interface EduArticle {
  id: string
  title: string
  category: 'Plastik' | 'Kertas & Kardus' | 'Minyak Jelantah' | 'Kompos' | 'Kreasi Kriya'
  authorName: string
  authorRole: 'Siswa' | 'Pengelola EcoCycle'
  authorNis?: string
  authorClassName?: string
  content: string
  summary: string
  readTimeMinutes: number
  status: ArticleStatus
  submittedAt: string
  approvedAt?: string
  pointsReward: number
}

export interface EduVideo {
  id: string
  title: string
  duration: string
  category: string
  embedUrl: string
  thumbnailUrl: string
  description: string
}

export interface ActivityAnnouncement {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  createdAt: string
}

