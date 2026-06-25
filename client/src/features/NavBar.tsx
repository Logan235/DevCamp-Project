import React from "react";
import { Button } from "../components/common/Button";
import {
  ChevronDown,
  LayoutDashboard,
  Map,
  LogOut,
  User,
  Save,
} from "lucide-react";
import ProgressBar from "./assessment/Progressbar";

interface NavBarProps {
  isLoggedIn?: boolean;
  userName?: string;
  userAvatar?: string;
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
  variant = "default",
  showProgressBar = true,
  showSave = true,
  answeredCount = 0,
  totalquest = 15,
}) => {
  const isEditor = variant === "editor";
  const isQuiz = variant === "quiz";

  return (
    <nav
      className={`flex justify-between items-center border-b border-gray-800 bg-[#0b0f19]/90 backdrop-blur sticky top-0 z-50 transition-all
        ${isEditor ? "px-4 py-2" : "px-6 md:px-10 py-4"}`}
    >
      <div className="flex items-center gap-6">
        <a
          className={`font-extrabold tracking-tight flex items-center gap-3 ${
            isEditor ? "text-3xl" : "text-5xl"
          }`}
          href="/"
        >
          <span className="text-blue-500">&lt;/&gt;</span>
          <span className="text-blue-400">CodeQuest</span>
        </a>

        {isLoggedIn && !isEditor && !isQuiz && (
          <div className="hidden md:flex items-center gap-4 font-mono text-xs text-zinc-400">
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
        <div className="flex-1 max-w-xl mx-4 flex justify-center items-center">
          <ProgressBar answeredCount={answeredCount} totalquest={totalquest} />
        </div>
      )}

      <div className="flex items-center gap-4 justify-end">
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
        {isLoggedIn || isQuiz ? (
          <div className="flex items-center gap-3 group relative cursor-pointer py-1">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-white">
                {userName}
              </span>

              <span className="text-xs text-slate-400">Learner</span>
              {!isEditor && !isQuiz && (
                <span className="text-[10px] text-emerald-400">Pro Member</span>
              )}
            </div>

            <div className="relative">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="
      w-10 h-10
      rounded-full
      object-cover
      ring-2 ring-blue-500/30
      "
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

              <span
                className="
    absolute
    bottom-0
    right-0
    w-3
    h-3
    rounded-full
    bg-green-500
    border-2
    border-[#0b0f19]
    "
              />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-all" />

            <div className="absolute right-0 top-full mt-1 w-40 bg-[#111625] border border-zinc-800 rounded shadow-xl hidden group-hover:block overflow-hidden z-50">
              <a
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <User className="w-3.5 h-3.5" /> Hồ sơ cá nhân
              </a>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 border-t border-zinc-800/60 transition-colors text-left"
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
    </nav>
  );
};
