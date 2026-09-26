import { motion } from "framer-motion";
import type { NodeState, TreeNodeView } from "../types";
import { CARD_STATE, PANEL_LABEL, STROKE_STATE } from "../styles";

type Placed = {
  id: string;
  node: TreeNodeView;
  x: number; // % chiều ngang
  y: number; // % chiều dọc
};

/**
 * Bố cục cây nhị phân: hoành độ theo thứ tự duyệt giữa (in-order) nên không có
 * hai node nào chồng nhau; tung độ theo độ sâu.
 */
function layoutTree(root: TreeNodeView) {
  const rows: { id: string; node: TreeNodeView; depth: number; order: number }[] = [];
  const edges: { from: string; to: string; state: NodeState }[] = [];
  let counter = 0;
  let maxDepth = 0;

  const walk = (node: TreeNodeView, depth: number, id: string) => {
    maxDepth = Math.max(maxDepth, depth);
    if (node.left) {
      walk(node.left, depth + 1, `${id}L`);
      edges.push({ from: id, to: `${id}L`, state: node.left.state ?? "idle" });
    }
    rows.push({ id, node, depth, order: counter++ });
    if (node.right) {
      walk(node.right, depth + 1, `${id}R`);
      edges.push({ from: id, to: `${id}R`, state: node.right.state ?? "idle" });
    }
  };
  walk(root, 0, "n");

  const levels = maxDepth + 1;
  const placed: Placed[] = rows.map((r) => ({
    id: r.id,
    node: r.node,
    x: ((r.order + 0.5) / counter) * 100,
    y: ((r.depth + 0.5) / levels) * 100,
  }));

  const byId = new Map(placed.map((p) => [p.id, p]));
  return { placed, edges, byId, levels };
}

export function TreeView({
  tree,
  label,
}: {
  tree: TreeNodeView;
  label?: string;
}) {
  const { placed, edges, byId, levels } = layoutTree(tree);

  return (
    <div className="w-full select-none">
      {label && <span className={`${PANEL_LABEL} mb-2 block`}>{label}</span>}

      <div
        className="relative w-full"
        style={{ height: `${levels * 74}px`, minHeight: "150px" }}
      >
        {/* Các nhánh cây */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {edges.map((e) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            return (
              <line
                key={`${e.from}-${e.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
                className={`transition-colors duration-300 ${STROKE_STATE[e.state]}`}
              />
            );
          })}
        </svg>

        {/* Các node */}
        {placed.map((p) => (
          <motion.div
            key={p.id}
            layout
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div
              className={`
                w-11 h-11 rounded-full border-2
                flex items-center justify-center
                font-extrabold text-sm
                transition-colors duration-200
                ${CARD_STATE[p.node.state ?? "idle"]}
              `}
            >
              {p.node.value}
            </div>

            {p.node.badge && (
              <span className="absolute left-1/2 -translate-x-1/2 -top-4 px-1.5 py-0.5 rounded bg-blue-600 dark:bg-blue-500 text-white text-[8px] font-bold font-mono whitespace-nowrap shadow-md">
                {p.node.badge}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
