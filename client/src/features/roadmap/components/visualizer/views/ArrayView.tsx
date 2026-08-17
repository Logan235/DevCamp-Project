import { motion } from "framer-motion";
import type { NodeState, VisualizerStep } from "../types";
import { CARD_STATE, PANEL_LABEL, pointerColor } from "../styles";

/**
 * Sinh khóa ổn định cho từng ô: "giá trị#lần_xuất_hiện".
 * Nhờ vậy khi thuật toán hoán vị/xoay mảng, framer-motion nhận ra cùng một ô
 * và animate nó trượt sang vị trí mới thay vì mount lại.
 */
function stableKeys(values: (string | number)[]): string[] {
  const seen = new Map<string, number>();
  return values.map((v) => {
    const k = String(v);
    const n = seen.get(k) ?? 0;
    seen.set(k, n + 1);
    return `${k}#${n}`;
  });
}

function cellState(idx: number, step: VisualizerStep): NodeState {
  if (step.activeIndices?.includes(idx)) return "active";
  if (step.foundIndices?.includes(idx)) return "found";
  if (step.visitedIndices?.includes(idx)) return "visited";
  if (step.mutedIndices?.includes(idx)) return "muted";
  return "idle";
}

export function ArrayView({ step }: { step: VisualizerStep }) {
  const values = step.array;
  if (!values) return null;

  const keys = stableKeys(values);
  const pointers = step.pointers ?? {};
  const isWide = values.some((v) => String(v).length > 2);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {step.arrayLabel && (
        <span className={`${PANEL_LABEL} mb-2 self-start`}>{step.arrayLabel}</span>
      )}

      {/* Dãy ô giá trị */}
      <div className="flex gap-2 sm:gap-3 justify-center items-start py-2 w-full flex-wrap">
        {values.map((value, idx) => {
          const state = cellState(idx, step);
          const onThis = Object.entries(pointers).filter(([, v]) => v === idx);

          return (
            <div
              key={keys[idx]}
              className="relative flex flex-col items-center gap-2 pb-14"
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`
                  h-12 sm:h-14 ${isWide ? "min-w-12 sm:min-w-14 px-3" : "w-12 sm:w-14"}
                  rounded-2xl border-2
                  flex items-center justify-center
                  font-extrabold ${isWide ? "text-sm sm:text-base" : "text-base sm:text-lg"}
                  transition-colors duration-200
                  ${CARD_STATE[state]}
                `}
              >
                {value}
              </motion.div>

              {/* Chỉ số của ô */}
              <span className="text-[10px] font-mono text-zinc-400 dark:text-slate-500">
                {idx}
              </span>

              {/* Nhãn con trỏ, trượt bằng layoutId khi đổi chỉ số */}
              {onThis.map(([name], pointerIdx) => (
                <motion.span
                  key={name}
                  layoutId={`pointer-${name}`}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  style={{ bottom: `${pointerIdx * 18}px` }}
                  className={`absolute px-1.5 py-0.5 ${pointerColor(name)} text-white text-[8px] font-bold rounded shadow-md uppercase whitespace-nowrap z-10`}
                >
                  {name}
                </motion.span>
              ))}
            </div>
          );
        })}
      </div>

      {/* Bảng tóm tắt vị trí các con trỏ */}
      {Object.keys(pointers).length > 0 && (
        <div className="w-full mt-2 flex flex-wrap gap-x-3 gap-y-1.5 justify-center font-mono text-xs">
          {Object.entries(pointers).map(([name, val]) => {
            const inRange = val >= 0 && val < values.length;
            return (
              <div
                key={name}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-200/50 dark:bg-slate-800 text-zinc-700 dark:text-slate-300 border border-zinc-300/30 dark:border-slate-700"
              >
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {name}:
                </span>
                <span>
                  {inRange
                    ? `Chỉ số ${val} (Giá trị ${values[val]})`
                    : "Ngoài mảng"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
