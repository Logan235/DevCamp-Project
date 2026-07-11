import React, { useState } from "react";
import { Button } from "../components/common/Button";
import {
  ChevronDown,
  LayoutDashboard,
  Map,
  LogOut,
  User,
  Save,
  Menu,
  X,
} from "lucide-react";
import ProgressBar from "./assessment/Progressbar";

interface NavBarProps {
  isLoggedIn?: boolean;
  userName?: string;
  userAvatar?: string;
  role?: "user" | "admin";
  currentLevel?: number;
  xpTotal?: number;
  variant?: "default" | "editor" | "quiz";
  showProgressBar?: boolean;
  showSave?: boolean;
  totalquest?: number;
  answeredCount?: number;
}

export const NavBar: React.FC<NavBarProps> = ({
  isLoggedIn = false,
  userName = "Dev",
  userAvatar,
  role = "user",
  currentLevel = 1,
  xpTotal = 0,
  variant = "default",
  showProgressBar = true,
  showSave = true,
  answeredCount = 0,
  totalquest = 15,
}) => {
  const isEditor = variant === "editor";
  const isQuiz = variant === "quiz";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const showDesktopLinks = isLoggedIn && !isEditor && !isQuiz;

  return (
    <nav
      className={`sticky top-0 z-50 flex flex-wrap items-center justify-between border-b border-gray-800 bg-[#0b0f19]/90 px-4 py-3 backdrop-blur transition-all sm:px-6 md:px-10 md:py-4 ${isEditor ? "px-4 py-2" : "px-4 py-3 sm:px-6 md:px-10 md:py-4"}`}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-6">
        <a
          className={`flex items-center gap-3 font-extrabold tracking-tight ${
            isEditor
              ? "text-2xl sm:text-3xl"
              : "text-3xl sm:text-4xl md:text-5xl"
          }`}
          href="/"
        >
          <span className="text-blue-500">&lt;/&gt;</span>
          <span className="text-blue-400">CodeQuest</span>
        </a>

        {showDesktopLinks && (
          <div className="hidden items-center gap-4 font-mono text-xs text-zinc-400 md:flex">
            <a
              href="/dashboard"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Bảng điều khiển
            </a>
            <a
              href="/roadmap"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Map className="w-3.5 h-3.5" /> Lộ trình
            </a>
          </div>
        )}
      </div>
      {isQuiz && showProgressBar && (
        <div className="order-3 mt-3 flex w-full max-w-xl items-center justify-center md:order-0 md:mx-4 md:mt-0 md:flex-1">
          <ProgressBar answeredCount={answeredCount} totalquest={totalquest} />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 sm:gap-4">
        {isQuiz && showSave && (
          <Button variant="normal" className="flex gap-3 hover:text-white">
            <Save className="w-5 h-5" />
            <span
              className="
                px-5 py-3
                rounded-xl
                bg-linear-to-r
                from-[#2563eb]
                to-[#3b82f6]
                text-white
                font-semibold
                shadow-[0_0_20px_rgba(59,130,246,0.3)]
                hover:scale-105
                transition-all
              "
            >
              Lưu bài làm
            </span>
          </Button>
        )}
        {showDesktopLinks && (
          <button
            type="button"
            className="rounded-lg border border-zinc-800/80 p-2 text-zinc-300 md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        )}

        {isLoggedIn || isQuiz ? (
          <div className="group relative flex cursor-pointer select-none items-center gap-2 py-2 sm:gap-3 selective-zone">
            <div className="flex flex-col items-end pointer-events-none">
              <span className="text-sm font-semibold text-white">
                {userName}
              </span>

              {role === "admin" ? (
                <span className="text-xs font-bold text-red-500 tracking-wide mt-0.5">
                  ADMIN
                </span>
              ) : (
                <>
                  <span className="text-xs text-slate-400">
                    Cấp độ {currentLevel}
                  </span>
                  {!isEditor && !isQuiz && (
                    <span className="text-[10px] text-cyan-400 font-medium">
                      {xpTotal.toLocaleString()} XP
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="relative pointer-events-none">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                />
              ) : (
                <div
                  className="
                    w-10 h-10
                    rounded-full
                    bg-linear-to-br
                    from-blue-500
                    via-cyan-500
                    to-purple-600
                    flex items-center justify-center
                    shadow-[0_0_15px_rgba(59,130,246,0.3)]
                  "
                >
                  <span className="text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0b0f19]" />
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-all pointer-events-none" />

            <div
              className="
                absolute right-0 top-full mt-0 w-44 
                bg-[#111625] border border-zinc-800 rounded-lg shadow-2xl 
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 transform translate-y-1 group-hover:translate-y-0
                overflow-hidden z-50 py-1
              "
            >
              <a
                href="/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-zinc-400" /> Hồ sơ cá nhân
              </a>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/30 border-t border-zinc-800/60 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="normal"
              size="sm"
              to="/signup"
              className="
                border border-[#3b82f6]
                text-[#60a5fa]
                hover:bg-[#3b82f6]/10
              "
            >
              Đăng ký
            </Button>
            <Button variant="primary" size="sm" to="/login">
              Đăng nhập
            </Button>
          </div>
        )}
      </div>

      {showDesktopLinks && (
        <div
          className={`w-full md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}
        >
          <div className="mt-3 rounded-xl border border-zinc-800/80 bg-[#111625]/95 p-3 shadow-xl">
            <a
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800/80"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4" /> Bảng điều khiển
            </a>
            <a
              href="/roadmap"
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800/80"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Map className="h-4 w-4" /> Lộ trình
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
