import type { NodeState } from "./types";

/** Màu nền/viền/chữ cho từng trạng thái của một ô dữ liệu. */
export const CARD_STATE: Record<NodeState, string> = {
  idle:
    "bg-white dark:bg-slate-900 border-zinc-300 dark:border-slate-700 text-slate-800 dark:text-slate-200",
  active:
    "bg-amber-500/10 dark:bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
  found:
    "bg-emerald-500/20 dark:bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
  visited:
    "bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/70 text-blue-600 dark:text-blue-400",
  muted:
    "bg-zinc-100 dark:bg-slate-900/50 border-zinc-200 dark:border-slate-800 text-zinc-400 dark:text-slate-600",
  danger:
    "bg-rose-500/10 dark:bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
};

/** Màu nét vẽ SVG (cạnh đồ thị, nhánh cây) theo trạng thái. */
export const STROKE_STATE: Record<NodeState, string> = {
  idle: "stroke-zinc-300 dark:stroke-slate-700",
  active: "stroke-amber-500",
  found: "stroke-emerald-500",
  visited: "stroke-blue-500",
  muted: "stroke-zinc-200 dark:stroke-slate-800",
  danger: "stroke-rose-500",
};

/**
 * Màu badge cho từng tên con trỏ. Giữ màu cố định theo tên để người học
 * nhận ra ngay con trỏ nào đang di chuyển giữa các bước.
 */
export function pointerColor(name: string): string {
  const key = name.toLowerCase();
  if (key === "min" || key === "slow" || key === "start") {
    return "bg-emerald-600 dark:bg-emerald-500";
  }
  if (key === "max" || key === "fast" || key === "end") {
    return "bg-rose-600 dark:bg-rose-500";
  }
  if (key === "prev" || key === "l" || key === "left" || key === "p") {
    return "bg-violet-600 dark:bg-violet-500";
  }
  if (key === "r" || key === "right" || key === "q") {
    return "bg-orange-600 dark:bg-orange-500";
  }
  if (key === "mid" || key === "cur" || key === "curr") {
    return "bg-amber-600 dark:bg-amber-500";
  }
  return "bg-blue-600 dark:bg-blue-500";
}

/** Nhãn tiêu đề nhỏ dùng chung cho các khung trực quan. */
export const PANEL_LABEL =
  "text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500 font-mono";
