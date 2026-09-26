import { motion } from "framer-motion";
import { ArrowLeft, ArrowLeftRight, ArrowRight, RotateCcw } from "lucide-react";
import type { ListCellView, ListView } from "../types";
import { CARD_STATE, PANEL_LABEL, pointerColor } from "../styles";

const SPRING = { type: "spring" as const, stiffness: 320, damping: 24 };

function NodeCard({
  node,
  badgeLayout = true,
}: {
  node: ListCellView;
  badgeLayout?: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center pb-10">
      <motion.div
        layout
        transition={SPRING}
        className={`
          h-12 sm:h-14 min-w-12 sm:min-w-14 px-3
          rounded-2xl border-2
          flex items-center justify-center
          font-extrabold text-base sm:text-lg
          transition-colors duration-200
          ${CARD_STATE[node.state ?? "idle"]}
        `}
      >
        {node.value}
      </motion.div>

      {node.badges?.map((badge, i) => (
        <motion.span
          key={badge}
          layoutId={badgeLayout ? `list-badge-${badge}` : undefined}
          transition={SPRING}
          style={{ bottom: `${i * 18}px` }}
          className={`absolute px-1.5 py-0.5 ${pointerColor(badge)} text-white text-[8px] font-bold rounded shadow-md uppercase whitespace-nowrap z-10`}
        >
          {badge}
        </motion.span>
      ))}
    </div>
  );
}

function NullCap() {
  return (
    <div className="flex flex-col items-center pb-10">
      <div className="h-12 sm:h-14 px-3 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-slate-700 flex items-center justify-center font-mono text-[10px] font-bold text-zinc-400 dark:text-slate-500">
        NULL
      </div>
    </div>
  );
}

function Link({ kind }: { kind: "right" | "left" | "both" | "gap" }) {
  if (kind === "gap") {
    return (
      <div className="flex flex-col items-center pb-10">
        <div className="h-12 sm:h-14 flex items-center px-1">
          <span className="h-6 border-l-2 border-dashed border-zinc-300 dark:border-slate-700" />
        </div>
      </div>
    );
  }

  const Icon =
    kind === "left" ? ArrowLeft : kind === "both" ? ArrowLeftRight : ArrowRight;
  const tone =
    kind === "right"
      ? "text-zinc-400 dark:text-slate-600"
      : "text-violet-500 dark:text-violet-400";

  return (
    <div className="flex flex-col items-center pb-10">
      <div className="h-12 sm:h-14 flex items-center">
        <Icon className={`w-4 h-4 shrink-0 ${tone}`} />
      </div>
    </div>
  );
}

export function LinkedListView({ list }: { list: ListView }) {
  const { nodes, doubly, pending, cycleTo, label } = list;
  const reversed = list.reversedCount ?? 0;
  const showTailNull = list.tailNull !== false;
  const hasCycle = cycleTo !== undefined && cycleTo !== null;

  /** Chiều mũi tên giữa node i và node i+1. */
  const linkKind = (i: number): "right" | "left" | "both" | "gap" => {
    if (i + 1 === reversed && reversed > 0) return "gap";
    if (i + 1 < reversed) return "left";
    return doubly ? "both" : "right";
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {label && <span className={`${PANEL_LABEL} mb-2 self-start`}>{label}</span>}

      {/* Node vừa được cấp phát, chưa nối vào chuỗi */}
      {pending && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-3 flex flex-col items-center gap-1"
        >
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
            {list.pendingLabel ?? "Node mới (chưa liên kết)"}
          </span>
          <NodeCard node={pending} badgeLayout={false} />
        </motion.div>
      )}

      <div className="flex items-start justify-center flex-wrap gap-x-1 gap-y-2">
        {/* Đầu NULL của đoạn đã đảo chiều */}
        {reversed > 0 && (
          <>
            <NullCap />
            <Link kind="left" />
          </>
        )}

        {nodes.map((node, idx) => (
          <div key={node.id ?? `${idx}-${node.value}`} className="flex items-start">
            <NodeCard node={node} />
            {idx < nodes.length - 1 && <Link kind={linkKind(idx)} />}
          </div>
        ))}

        {/* Kết thúc chuỗi: NULL hoặc liên kết vòng */}
        {hasCycle ? (
          <div className="flex items-start">
            <Link kind="right" />
            <div className="flex flex-col items-center pb-10">
              <div className="h-12 sm:h-14 px-3 rounded-2xl border-2 border-dashed border-rose-400 dark:border-rose-500/70 bg-rose-500/5 flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="font-mono text-[10px] font-bold whitespace-nowrap">
                  quay về node[{cycleTo}] = {nodes[cycleTo as number]?.value}
                </span>
              </div>
            </div>
          </div>
        ) : (
          showTailNull &&
          reversed < nodes.length && (
            <div className="flex items-start">
              <Link kind={doubly ? "both" : "right"} />
              <NullCap />
            </div>
          )
        )}
      </div>
    </div>
  );
}
