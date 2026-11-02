import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Scale,
  BookOpen,
  ShoppingBag,
  Leaf,
  ShieldCheck,
  Menu,
  X,
  GraduationCap,
  LogIn,
  LogOut,
  Shield,
  ArrowRightLeft,
  Trophy,
  BookOpenCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { AiChatWidget } from "./AiChatWidget";

export function Layout() {
  const { user, profile, userBalance, signOut, switchMockRole } = useAuth();
  const { currentPoolPoints } = useData();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isStudent = profile?.role === "student";

  const handleSwitchRole = (newRole: "student" | "branch_staff") => {
    switchMockRole(newRole);
    if (newRole === "student") {
      navigate("/student");
    } else {
      navigate("/pos");
    }
  };

  const navItems = isStudent
    ? [
        { path: "/student", label: "Dashboard", icon: GraduationCap },
        {
          path: "/education",
          label: "Edukasi Lingkungan",
          icon: BookOpenCheck,
        },
        { path: "/leaderboard", label: "Papan Peringkat", icon: Trophy },
        { path: "/rewards", label: "Reward & Kupon", icon: ShoppingBag },
        { path: "/impact", label: "Dampak Lingkungan", icon: Leaf },
      ]
    : [
        { path: "/pos", label: "Pos Timbang", icon: Scale },
        { path: "/transactions", label: "Transaksi Setoran", icon: BookOpen },
        {
          path: "/education",
          label: "Edukasi & Moderasi",
          icon: BookOpenCheck,
        },
        { path: "/leaderboard", label: "Papan Peringkat", icon: Trophy },
        { path: "/catalog", label: "Katalog Material", icon: ShieldCheck },
        { path: "/impact", label: "Dampak Lingkungan", icon: Leaf },
      ];

  const PAGE_TITLES: Record<string, string> = {
    "/student": "Dashboard Mandiri Siswa",
    "/education": "Pusat Edukasi & Karya Siswa",
    "/pos": "Pos Timbang & Setor Sampah",
    "/transactions": "Catatan Transaksi Setoran Sampah",
    "/leaderboard": "Papan Peringkat Bank Sampah Sekolah",
    "/impact": "Dampak Lingkungan Sekolah",
    "/rewards": "Penukaran Reward & Kupon",
    "/catalog": "Katalog Nilai Poin Sampah",
  };

  const currentTitle = PAGE_TITLES[location.pathname] || "EcoCycle Bank Sampah";

  return (
    <div className="min-h-screen bg-canvas text-main font-sans flex">
      {/* Overlay mobile */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-main/30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "max-lg:-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
              <Scale className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <span className="font-display text-base font-bold text-main">
                EcoCycle
              </span>
              <span className="block text-[10px] font-semibold text-brand">
                Bank Sampah Digital
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Tutup menu"
            className="rounded p-1 text-muted hover:bg-surface-subtle lg:hidden cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info Pengguna & Role Badge */}
        <div className="px-4 py-3 border-b border-line bg-canvas/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-brand-light text-brand flex items-center justify-center shrink-0">
                {isStudent ? (
                  <GraduationCap className="h-4 w-4" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-xs text-main block truncate">
                  {profile?.full_name ||
                    (isStudent ? "Siswa Mandiri" : "Petugas Pos")}
                </span>
                <span className="text-[10px] text-body block truncate">
                  {isStudent
                    ? `Kelas ${profile?.class_name || "8A"}`
                    : "Petugas Pos Bank Sampah"}
                </span>
              </div>
            </div>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                isStudent
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-brand-light text-brand-deep border border-brand-subtle"
              }`}
            >
              {isStudent ? "Siswa" : "Petugas Pos"}
            </span>
          </div>

          {/* Quick Demo Switcher */}
          <button
            onClick={() =>
              handleSwitchRole(isStudent ? "branch_staff" : "student")
            }
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-md border border-line bg-white py-1.5 px-2 text-[11px] font-medium text-body hover:text-brand hover:bg-canvas transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="h-3 w-3" />
            Beralih Mode: {isStudent ? "Petugas Pos" : "Siswa"}
          </button>
        </div>

        {/* Navigasi Rute Aktif */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex w-full min-h-[44px] items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-brand text-white"
                      : "text-body hover:bg-surface-subtle hover:text-main"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-line space-y-2">
          {user ? (
            <button
              onClick={() => {
                signOut();
                navigate("/login");
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-line py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar Akun
            </button>
          ) : (
            <NavLink
              to="/login"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand py-2 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer shadow-xs"
            >
              <LogIn className="h-3.5 w-3.5" />
              Masuk / Daftar
            </NavLink>
          )}

          <div className="text-[11px] text-body space-y-1 pt-1">
            <div className="flex justify-between">
              <span>{isStudent ? "Poin Saya" : "Poin Beredar"}</span>
              <span className="font-bold text-brand">
                {(isStudent ? userBalance : currentPoolPoints).toLocaleString(
                  "id-ID",
                )}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Buka menu navigasi"
              className="rounded p-1.5 text-muted hover:bg-surface-subtle lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-base font-bold text-main">
              {currentTitle}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating EcoBot AI Assistant */}
      <AiChatWidget />
    </div>
  );
}
