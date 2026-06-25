import React from "react";
import { Check, Lock, Play } from "lucide-react";

interface NodeProps {
  title: string;
  xp: number;
  status: "completed" | "current" | "locked";
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

export const Node: React.FC<NodeProps> = ({
  title,
  xp,
  status,
  isActive,
  onClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
}) => {
  const statusStyles = {
    completed:
      "border-emerald-500 bg-emerald-950/80 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    current:
      "border-sky-500 bg-sky-950/80 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.4)] animate-pulse",
    locked: "border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center select-none ${status !== "locked" ? "cursor-pointer" : ""}`}
      onClick={status !== "locked" ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-200 relative z-10
          ${statusStyles[status]}
          ${isActive && status !== "locked" ? "scale-110 ring-4 ring-sky-500/20" : "hover:scale-105"}
        `}
      >
        {status === "completed" && <Check className="w-5 h-5 stroke-[2.5]" />}
        {status === "current" && (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
        {status === "locked" && <Lock className="w-4 h-4" />}
      </div>

      <div className="mt-3 max-w-30 absolute translate-y-12">
        <p
          className={`text-xs font-semibold tracking-wide truncate ${status === "locked" ? "text-zinc-600" : "text-zinc-200"}`}
        >
          {title}
        </p>
        {status !== "locked" && (
          <span className="text-[10px] font-mono text-zinc-500 mt-0.5 block">
            {xp} XP
          </span>
        )}
      </div>
    </div>
  );
};
