import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  CheckCircle2,
  Gift,
  ArrowRight,
  BookOpen,
  Video,
  FileCheck2,
  LogIn
} from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { playSuccessChime } from '../lib/sound'
import type { DailyMission } from '../types/education'

export function DailyMissionsCard() {
  const {
    dailyMissions,
    missionBonusClaimed,
    claimMissionReward,
    claimAllClearBonus
  } = useData()
  const { addBonusPoints } = useAuth()
  const navigate = useNavigate()

  const completedCount = dailyMissions.filter((m) => m.isCompleted).length
  const totalCount = dailyMissions.length
  const isAllCompleted = completedCount === totalCount
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  const handleClaim = (mission: DailyMission) => {
    const points = claimMissionReward(mission.id)
    if (points > 0) {
      addBonusPoints(points)
      playSuccessChime()
    }
  }

  const handleClaimAllClear = () => {
    const bonus = claimAllClearBonus()
    if (bonus > 0) {
      addBonusPoints(bonus)
      playSuccessChime()
    }
  }

  const getMissionIcon = (type: DailyMission['type']) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-4 w-4" />
      case 'read_article':
        return <BookOpen className="h-4 w-4" />
      case 'watch_video':
        return <Video className="h-4 w-4" />
      case 'article_approved':
        return <FileCheck2 className="h-4 w-4" />
    }
  }

  const handleGoToMission = (type: DailyMission['type']) => {
    if (type === 'read_article' || type === 'watch_video' || type === 'article_approved') {
      navigate('/education')
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white shadow-xs p-5 space-y-4">
      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold text-main">
                Misi Harian Peduli Lingkungan
              </h2>
              <span className="rounded-full bg-brand-light text-brand px-2 py-0.5 text-[10px] font-bold border border-brand-subtle">
                Hari Ini
              </span>
            </div>
            <p className="text-xs text-muted">
              Selesaikan misi setiap hari untuk menambah poin dan mempercepat penukaran reward.
            </p>
          </div>
        </div>

        {/* Progress Counter */}
        <div className="flex items-center gap-2 shrink-0 bg-canvas px-3 py-1.5 rounded-lg border border-line self-start sm:self-auto">
          <span className="text-xs text-muted">Progres:</span>
          <span className="font-display text-sm font-bold text-brand">
            {completedCount}/{totalCount}
          </span>
          <span className="text-[11px] text-body">Tuntas</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden border border-line/60">
        <div
          className="bg-brand h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Bonus All-Clear Banner */}
      {isAllCompleted && (
        <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shrink-0">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">
                Bonus Penyelesaian Penuh!
              </span>
              <p className="font-display text-sm font-bold text-white">
                Hebat! Kamu telah menuntaskan seluruh 4 misi harian hari ini.
              </p>
            </div>
          </div>
          {missionBonusClaimed ? (
            <span className="shrink-0 rounded-lg bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 self-start sm:self-auto">
              <CheckCircle2 className="h-4 w-4" />
              Bonus +40 Poin Diklaim
            </span>
          ) : (
            <button
              onClick={handleClaimAllClear}
              className="shrink-0 rounded-lg bg-white text-brand-deep px-4 py-2 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Gift className="h-4 w-4 text-brand" />
              Klaim Bonus +40 Poin
            </button>
          )}
        </div>
      )}

      {/* Daftar Misi Harian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {dailyMissions.map((mission) => {
          const isDone = mission.isCompleted
          const isClaimed = mission.isClaimed

          return (
            <div
              key={mission.id}
              className={`rounded-xl border p-3.5 flex items-center justify-between gap-3 transition-colors ${
                isClaimed
                  ? 'border-line/70 bg-canvas/60 opacity-80'
                  : isDone
                  ? 'border-brand bg-brand-light/30 shadow-xs'
                  : 'border-line bg-white hover:border-brand/40'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5 ${
                    isClaimed
                      ? 'bg-surface-subtle text-muted'
                      : isDone
                      ? 'bg-brand text-white'
                      : 'bg-brand-light text-brand'
                  }`}
                >
                  {getMissionIcon(mission.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-main truncate block">
                      {mission.title}
                    </span>
                    <span className="shrink-0 font-display text-[11px] font-bold text-brand">
                      +{mission.pointsReward} Poin
                    </span>
                  </div>
                  <p className="text-[11px] text-body line-clamp-1 mt-0.5">
                    {mission.description}
                  </p>
                </div>
              </div>

              {/* Status & Tombol Aksi */}
              <div className="shrink-0">
                {isClaimed ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-muted">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
                    Diklaim
                  </span>
                ) : isDone ? (
                  <button
                    onClick={() => handleClaim(mission)}
                    className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark transition-all cursor-pointer shadow-xs animate-pulse"
                  >
                    Klaim
                  </button>
                ) : (
                  <button
                    onClick={() => handleGoToMission(mission.type)}
                    className="flex items-center gap-1 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-[11px] font-semibold text-body hover:text-brand hover:border-brand transition-colors cursor-pointer"
                  >
                    <span>Kerjakan</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
