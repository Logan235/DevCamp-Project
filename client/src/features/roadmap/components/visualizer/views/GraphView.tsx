import type { GraphView as GraphViewData } from "../types";
import { CARD_STATE, PANEL_LABEL, STROKE_STATE } from "../styles";

export function GraphView({
  graph,
  label,
}: {
  graph: GraphViewData;
  label?: string;
}) {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));

  return (
    <div className="w-full select-none">
      {label && <span className={`${PANEL_LABEL} mb-2 block`}>{label}</span>}

      {/* Chừa chỗ cho badge nằm dưới mỗi đỉnh nên khung cao hơn vùng toạ độ. */}
      <div className="relative w-full" style={{ height: "240px" }}>
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {graph.directed && (
            <defs>
              <marker
                id="viz-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" className="fill-zinc-400 dark:fill-slate-600" />
              </marker>
            </defs>
          )}

          {graph.edges.map((e) => {
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
                strokeWidth={e.state && e.state !== "idle" ? 3 : 2}
                vectorEffect="non-scaling-stroke"
                markerEnd={graph.directed ? "url(#viz-arrow)" : undefined}
                className={`transition-all duration-300 ${STROKE_STATE[e.state ?? "idle"]}`}
              />
            );
          })}
        </svg>

        {/* Trọng số các cạnh */}
        {graph.edges.map((e) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b || e.weight === undefined) return null;
          return (
            <span
              key={`w-${e.from}-${e.to}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 text-[9px] font-mono font-bold text-zinc-600 dark:text-slate-300 shadow-sm"
              style={{ left: `${(a.x + b.x) / 2}%`, top: `${(a.y + b.y) / 2}%` }}
            >
              {e.weight}
            </span>
          );
        })}

        {/* Các đỉnh */}
        {graph.nodes.map((n) => (
          <div
            key={n.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div
              className={`
                w-10 h-10 rounded-full border-2
                flex items-center justify-center
                font-extrabold text-sm
                transition-colors duration-200
                ${CARD_STATE[n.state ?? "idle"]}
              `}
            >
              {n.id}
            </div>
            {n.badge && (
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-4 px-1.5 py-0.5 rounded bg-blue-600 dark:bg-blue-500 text-white text-[8px] font-bold font-mono whitespace-nowrap shadow-md">
                {n.badge}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
