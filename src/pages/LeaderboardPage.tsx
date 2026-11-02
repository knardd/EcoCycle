import { useState, useMemo } from "react";
import {
  Trophy,
  Users,
  Award,
  Crown,
  Medal,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import {
  computeClassLeaderboard,
  computeStudentLeaderboard,
} from "../lib/leaderboard";

type LeaderboardTab = "classes" | "students";
type TimeFilter = "month" | "semester" | "all";

export function LeaderboardPage() {
  const { transactions } = useData();
  const { profile } = useAuth();
  const isStudent = profile?.role === "student";
  const studentClass = profile?.class_name || "8A";

  const [activeTab, setActiveTab] = useState<LeaderboardTab>("classes");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");

  // Data teragregasi secara reaktif
  const classLeaderboard = useMemo(
    () => computeClassLeaderboard(transactions),
    [transactions],
  );
  const studentLeaderboard = useMemo(
    () => computeStudentLeaderboard(transactions),
    [transactions],
  );

  // Top 3 untuk podium
  const top3Classes = classLeaderboard.slice(0, 3);
  const top3Students = studentLeaderboard.slice(0, 3);

  return (
    <div className="max-w-5xl space-y-6">
      {/* 1. Header & Tab Pilihan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-main flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Papan Peringkat Bank Sampah
          </h2>
          <p className="text-xs text-muted mt-1">
            Kompetisi gotong-royong pemilahan sampah antar-kelas dan pejuang
            lingkungan sekolah.
          </p>
        </div>

        {/* Filter Periode */}
        <div className="inline-flex rounded-lg border border-line bg-white p-1">
          <button
            type="button"
            onClick={() => setTimeFilter("month")}
            className={`min-h-[36px] px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              timeFilter === "month"
                ? "bg-brand text-white shadow-xs"
                : "text-muted hover:text-main"
            }`}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter("semester")}
            className={`min-h-[36px] px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              timeFilter === "semester"
                ? "bg-brand text-white shadow-xs"
                : "text-muted hover:text-main"
            }`}
          >
            Semester Ini
          </button>
          <button
            type="button"
            onClick={() => setTimeFilter("all")}
            className={`min-h-[36px] px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              timeFilter === "all"
                ? "bg-brand text-white shadow-xs"
                : "text-muted hover:text-main"
            }`}
          >
            Semua Waktu
          </button>
        </div>
      </div>

      {/* 3. Tab Navigasi Utama */}
      <div className="flex gap-2 border-b border-line pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("classes")}
          className={`flex min-h-[44px] items-center gap-2 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "classes"
              ? "border-brand text-brand"
              : "border-transparent text-muted hover:text-main"
          }`}
        >
          <Users className="h-4 w-4" />
          Peringkat Kelas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("students")}
          className={`flex min-h-[44px] items-center gap-2 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "students"
              ? "border-brand text-brand"
              : "border-transparent text-muted hover:text-main"
          }`}
        >
          <Award className="h-4 w-4" />
          Top Siswa (Eco-Warriors)
        </button>
      </div>

      {/* 4. TAMPILAN PERINGKAT KELAS */}
      {activeTab === "classes" && (
        <div className="space-y-6">
          {/* Top 3 Podium Kelas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Juara 2 (Perak) */}
            {top3Classes[1] && (
              <div className="order-2 md:order-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-center flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 mb-2">
                  <Medal className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  Juara 2
                </span>
                <h3 className="font-display text-lg font-bold text-main mt-1">
                  Kelas {top3Classes[1].className}
                </h3>
                <span className="text-[11px] text-muted block">
                  {top3Classes[1].waliKelas}
                </span>
                <div className="mt-3 pt-3 border-t border-line w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Total Sampah</span>
                  <span className="font-bold text-main">
                    {top3Classes[1].totalWeightKg} Kg
                  </span>
                </div>
                <div className="mt-1 w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Poin Kelas</span>
                  <span className="font-bold text-brand">
                    +{top3Classes[1].totalPoints.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}

            {/* Juara 1 (Emas - Podium Utama) */}
            {top3Classes[0] && (
              <div className="order-1 md:order-2 rounded-2xl border-2 border-amber-400 bg-linear-to-b from-amber-50/60 to-white p-6 shadow-sm text-center flex flex-col items-center md:-mt-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-2 shadow-xs">
                  <Crown className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800">
                  🥇 Juara 1 Sekolah
                </span>
                <h3 className="font-display text-xl font-bold text-main mt-1.5">
                  Kelas {top3Classes[0].className}
                </h3>
                <span className="text-[11px] text-muted block">
                  {top3Classes[0].waliKelas}
                </span>

                <div className="mt-4 pt-3 border-t border-amber-200/60 w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Total Sampah Terkumpul</span>
                  <span className="font-display text-lg font-black text-main">
                    {top3Classes[0].totalWeightKg} Kg
                  </span>
                </div>
                <div className="mt-1 w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Poin Kelas</span>
                  <span className="font-bold text-brand text-sm">
                    +{top3Classes[0].totalPoints.toLocaleString("id-ID")} poin
                  </span>
                </div>
                <div className="mt-2 w-full">
                  <div className="flex justify-between text-[10px] text-muted mb-1">
                    <span>Progress Target</span>
                    <span>
                      {Math.min(
                        100,
                        Math.round(
                          (top3Classes[0].totalWeightKg /
                            top3Classes[0].targetWeightKg) *
                            100,
                        ),
                      )}
                      % ({top3Classes[0].targetWeightKg} Kg)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-amber-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (top3Classes[0].totalWeightKg /
                            top3Classes[0].targetWeightKg) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Juara 3 (Perunggu) */}
            {top3Classes[2] && (
              <div className="order-3 rounded-2xl border border-amber-200 bg-white p-5 shadow-xs text-center flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700 mb-2">
                  <Award className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Juara 3
                </span>
                <h3 className="font-display text-lg font-bold text-main mt-1">
                  Kelas {top3Classes[2].className}
                </h3>
                <span className="text-[11px] text-muted block">
                  {top3Classes[2].waliKelas}
                </span>
                <div className="mt-3 pt-3 border-t border-line w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Total Sampah</span>
                  <span className="font-bold text-main">
                    {top3Classes[2].totalWeightKg} Kg
                  </span>
                </div>
                <div className="mt-1 w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Poin Kelas</span>
                  <span className="font-bold text-brand">
                    +{top3Classes[2].totalPoints.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tabel Detail Peringkat Kelas Lengkap */}
          <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-line flex justify-between items-center">
              <h3 className="text-xs font-bold text-main uppercase tracking-wider">
                Semua Kelas ({classLeaderboard.length} Kelas Berpartisipasi)
              </h3>
              <span className="text-[11px] text-muted flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Update Otomatis per Setoran
              </span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-line bg-surface-subtle text-muted font-semibold">
                  <th scope="col" className="py-3 px-4 w-14 text-center">
                    Posisi
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Kelas
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">
                    Siswa Aktif
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Total Berat
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Poin Terkumpul
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {classLeaderboard.map((cls) => {
                  const isCurrentClass =
                    isStudent && cls.className === studentClass;
                  return (
                    <tr
                      key={cls.className}
                      className={`transition-colors ${
                        isCurrentClass
                          ? "bg-brand-light/30 font-semibold"
                          : "hover:bg-canvas"
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-bold">
                        {cls.rank === 1 && "🥇"}
                        {cls.rank === 2 && "🥈"}
                        {cls.rank === 3 && "🥉"}
                        {cls.rank > 3 && (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-subtle text-muted text-xs">
                            {cls.rank}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-main text-sm">
                            Kelas {cls.className}
                          </span>
                          {isCurrentClass && (
                            <span className="rounded bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white">
                              Kelas Anda
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted block">
                          {cls.waliKelas}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-body">
                        {cls.activeStudents} siswa
                      </td>
                      <td className="py-3 px-4 text-right font-display font-bold text-main text-sm">
                        {cls.totalWeightKg.toFixed(1)} Kg
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-brand">
                        +{cls.totalPoints.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-surface-subtle text-body border border-line">
                          {cls.badge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAMPILAN PERINGKAT SISWA (ECO-WARRIORS) */}
      {activeTab === "students" && (
        <div className="space-y-6">
          {/* Top 3 Podium Siswa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Top 2 Siswa */}
            {top3Students[1] && (
              <div className="order-2 md:order-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-center flex flex-col items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold mb-2">
                  {top3Students[1].name.charAt(0)}
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  Peringkat 2
                </span>
                <h3 className="font-display text-base font-bold text-main mt-1">
                  {top3Students[1].name}
                </h3>
                <span className="text-[11px] text-muted block">
                  Kelas {top3Students[1].className} • NIS {top3Students[1].nis}
                </span>
                <div className="mt-3 pt-3 border-t border-line w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Setoran</span>
                  <span className="font-bold text-main">
                    {top3Students[1].totalWeightKg} Kg
                  </span>
                </div>
                <div className="mt-1 w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Poin</span>
                  <span className="font-bold text-brand">
                    +{top3Students[1].totalPoints.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}

            {/* Top 1 Siswa (Emas) */}
            {top3Students[0] && (
              <div className="order-1 md:order-2 rounded-2xl border-2 border-amber-400 bg-linear-to-b from-amber-50/60 to-white p-6 shadow-sm text-center flex flex-col items-center md:-mt-2">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-extrabold text-lg mb-2 shadow-xs">
                    {top3Students[0].name.charAt(0)}
                  </div>
                  <Crown className="absolute -top-2 -right-1 h-5 w-5 text-amber-500" />
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800">
                  🥇 Siswa Teraktif Sekolah
                </span>
                <h3 className="font-display text-lg font-bold text-main mt-1.5">
                  {top3Students[0].name}
                </h3>
                <span className="text-[11px] text-muted block">
                  Kelas {top3Students[0].className} • NIS {top3Students[0].nis}
                </span>

                <div className="mt-4 pt-3 border-t border-amber-200/60 w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Total Sampah Terpilah</span>
                  <span className="font-display text-lg font-black text-main">
                    {top3Students[0].totalWeightKg} Kg
                  </span>
                </div>
                <div className="mt-1 w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Perolehan Poin</span>
                  <span className="font-bold text-brand text-sm">
                    +{top3Students[0].totalPoints.toLocaleString("id-ID")} poin
                  </span>
                </div>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-deep bg-brand-light px-2 py-0.5 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  {top3Students[0].tierTitle}
                </span>
              </div>
            )}

            {/* Top 3 Siswa */}
            {top3Students[2] && (
              <div className="order-3 rounded-2xl border border-amber-200 bg-white p-5 shadow-xs text-center flex flex-col items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700 font-bold mb-2">
                  {top3Students[2].name.charAt(0)}
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Peringkat 3
                </span>
                <h3 className="font-display text-base font-bold text-main mt-1">
                  {top3Students[2].name}
                </h3>
                <span className="text-[11px] text-muted block">
                  Kelas {top3Students[2].className} • NIS {top3Students[2].nis}
                </span>
                <div className="mt-3 pt-3 border-t border-line w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Setoran</span>
                  <span className="font-bold text-main">
                    {top3Students[2].totalWeightKg} Kg
                  </span>
                </div>
                <div className="mt-1 w-full flex justify-between items-center text-xs">
                  <span className="text-muted">Poin</span>
                  <span className="font-bold text-brand">
                    +{top3Students[2].totalPoints.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tabel Detail Siswa */}
          <div className="rounded-xl border border-line bg-white shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-line flex justify-between items-center">
              <h3 className="text-xs font-bold text-main uppercase tracking-wider">
                Daftar Peringkat Siswa Sekolah
              </h3>
              <span className="text-[11px] text-muted">
                {studentLeaderboard.length} Siswa Terdaftar
              </span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-line bg-surface-subtle text-muted font-semibold">
                  <th scope="col" className="py-3 px-4 w-14 text-center">
                    Posisi
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Siswa
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">
                    Frekuensi Setor
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Total Berat
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Poin
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Gelar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {studentLeaderboard.map((std) => (
                  <tr
                    key={std.name}
                    className="hover:bg-canvas transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-bold">
                      {std.rank === 1 && "🥇"}
                      {std.rank === 2 && "🥈"}
                      {std.rank === 3 && "🥉"}
                      {std.rank > 3 && (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-subtle text-muted text-xs">
                          {std.rank}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-main text-sm block">
                        {std.name}
                      </span>
                      <span className="text-[10px] text-muted">
                        Kelas {std.className} • NIS {std.nis}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-body">
                      {std.depositCount}x penimbangan
                    </td>
                    <td className="py-3 px-4 text-right font-display font-bold text-main text-sm">
                      {std.totalWeightKg.toFixed(1)} Kg
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-brand">
                      +{std.totalPoints.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-brand-light text-brand-deep">
                        {std.tierTitle}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
