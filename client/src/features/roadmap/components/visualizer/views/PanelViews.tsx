import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import type { CellView, GridView as GridViewData, MapEntryView, NodeState } from "../types";
import { CARD_STATE, PANEL_LABEL } from "../styles";

const SPRING = { type: "spring" as const, stiffness: 340, damping: 26 };

/* ------------------------------- STACK ------------------------------- */

export function StackView({
  items,
  label = "Stack (LIFO)",
}: {
  items: CellView[];
  label?: string;
}) {
  // Hiển thị từ đỉnh xuống đáy để khớp trực giác "đỉnh ở trên".
  const topDown = [...items].reverse();

  return (
    <div className="flex flex-col items-center select-none">
      <span className={`${PANEL_LABEL} mb-2`}>{label}</span>

      <div className="flex flex-col items-center gap-1 min-w-[92px]">
        {items.length > 0 && (
          <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400">
            ▲ TOP
          </span>
        )}

        <AnimatePresence mode="popLayout" initial={false}>
          {topDown.map((item, i) => (
            <motion.div
              key={`${items.length - 1 - i}-${item.value}`}
              layout
              initial={{ opacity: 0, y: -14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.9 }}
              transition={SPRING}
              className={`
                w-full px-4 py-2 rounded-xl border-2
                flex items-center justify-center
                font-mono font-bold text-sm
                ${CARD_STATE[item.state ?? "idle"]}
              `}
            >
              {item.value}
              {item.badge && (
                <span className="ml-2 text-[9px] font-bold uppercase opacity-70">
                  {item.badge}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="w-full border-t-2 border-zinc-300 dark:border-slate-700 pt-1 text-center">
          <span className="text-[9px] font-mono text-zinc-400 dark:text-slate-500">
            {items.length === 0 ? "stack rỗng" : "đáy stack"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- QUEUE ------------------------------- */

export function QueueView({
  items,
  label = "Queue (FIFO)",
}: {
  items: CellView[];
  label?: string;
}) {
  // Khóa theo giá trị (kèm số lần lặp) để khi dequeue, các ô còn lại TRƯỢT sang
  // trái thay vì bị mount lại từ đầu.
  const seen = new Map<string, number>();
  const keys = items.map((item) => {
    const k = String(item.value);
    const n = seen.get(k) ?? 0;
    seen.set(k, n + 1);
    return `${k}#${n}`;
  });

  return (
    <div className="w-full flex flex-col items-center select-none">
      <span className={`${PANEL_LABEL} mb-2`}>{label}</span>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          FRONT →
        </span>

        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item, i) => (
            <motion.div
              key={keys[i]}
              layout
              initial={{ opacity: 0, x: 18, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -18, scale: 0.9 }}
              transition={SPRING}
              className={`
                px-3 h-11 min-w-11 rounded-xl border-2
                flex items-center justify-center
                font-mono font-bold text-sm
                ${CARD_STATE[item.state ?? "idle"]}
              `}
            >
              {item.value}
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <span className="px-3 h-11 flex items-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-slate-700 text-[10px] font-mono text-zinc-400 dark:text-slate-500">
            queue rỗng
          </span>
        )}

        <span className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
          ← REAR
        </span>
      </div>
    </div>
  );
}

/* -------------------------------- GRID -------------------------------- */

/** Lớp CSS riêng cho ô tường, không trộn với bảng màu trạng thái. */
const WALL_CELL =
  "bg-zinc-300 dark:bg-slate-700 border-zinc-400 dark:border-slate-600 text-transparent";

function gridCellState(r: number, c: number, grid: GridViewData): NodeState {
  const hit = (list?: [number, number][]) =>
    list?.some(([a, b]) => a === r && b === c) ?? false;
  if (hit(grid.active)) return "active";
  if (hit(grid.found)) return "found";
  if (hit(grid.visited)) return "visited";
  return "idle";
}

export function GridView({ grid, label }: { grid: GridViewData; label?: string }) {
  const cols = grid.cells[0]?.length ?? 0;

  return (
    <div className="w-full flex flex-col items-center select-none overflow-x-auto">
      {label && <span className={`${PANEL_LABEL} mb-2 self-start`}>{label}</span>}

      <div className="inline-flex flex-col gap-1">
        {/* Nhãn cột */}
        {grid.colLabels && (
          <div className="flex gap-1">
            {grid.rowLabels && <span className="w-16 shrink-0" />}
            {grid.colLabels.slice(0, cols).map((cl, i) => (
              <span
                key={i}
                className="w-9 text-center text-[10px] font-mono font-bold text-zinc-400 dark:text-slate-500"
              >
                {cl}
              </span>
            ))}
          </div>
        )}

        {grid.cells.map((row, r) => (
          <div key={r} className="flex gap-1 items-center">
            {grid.rowLabels && (
              <span className="w-16 shrink-0 text-right pr-1.5 text-[10px] font-mono font-bold text-zinc-400 dark:text-slate-500">
                {grid.rowLabels[r]}
              </span>
            )}
            {row.map((value, c) => {
              const isWall = String(value) === (grid.wallValue ?? "#");
              return (
                <div
                  key={c}
                  className={`
                    w-9 h-9 rounded-lg border
                    flex items-center justify-center
                    font-mono font-bold text-[11px]
                    transition-colors duration-200
                    ${isWall ? WALL_CELL : CARD_STATE[gridCellState(r, c, grid)]}
                  `}
                >
                  {isWall ? "" : value}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {grid.caption && (
        <span className="mt-2 text-[10px] font-mono text-zinc-400 dark:text-slate-500">
          {grid.caption}
        </span>
      )}
    </div>
  );
}

/* --------------------------------- MAP -------------------------------- */

export function MapView({
  entries,
  label = "Bảng băm / Bộ nhớ phụ",
}: {
  entries: MapEntryView[];
  label?: string;
}) {
  return (
    <div className="w-full flex flex-col select-none">
      <span className={`${PANEL_LABEL} mb-2`}>{label}</span>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {entries.map((e) => (
            <motion.div
              key={String(e.key)}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={SPRING}
              className={`
                px-2.5 py-1.5 rounded-xl border-2
                flex items-center gap-1.5
                font-mono text-[11px] font-bold
                ${CARD_STATE[e.state ?? "idle"]}
              `}
            >
              <span className="opacity-70">{e.key}</span>
              <ArrowRight className="w-3 h-3 opacity-50" />
              <span>{e.value}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length === 0 && (
          <span className="px-3 py-1.5 rounded-xl border-2 border-dashed border-zinc-300 dark:border-slate-700 text-[10px] font-mono text-zinc-400 dark:text-slate-500">
            rỗng
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- OUTPUT ------------------------------- */

export function OutputView({
  output,
  label = "Kết quả đang tích lũy",
}: {
  output: string;
  label?: string;
}) {
  return (
    <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-black/50 border border-slate-800">
      <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono shrink-0">
        {label}
      </span>
      <motion.span
        key={output}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="font-mono text-xs font-bold text-emerald-400 truncate"
      >
        {output || "—"}
      </motion.span>
    </div>
  );
}
