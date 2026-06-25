import React from "react";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import { Terminal } from "lucide-react";

interface SidebarProps {
  node: {
    title: string;
    desc: string;
    xp: number;
    difficulty: "success" | "warning" | "error" | "info";
    syntaxSnippet: string;
    status: "completed" | "current" | "locked";
    concept: string;
  } | null;
}

export const RoadmapSidebar: React.FC<SidebarProps> = ({ node }) => {
  if (!node) {
    return (
      <div className="bg-[#111625] border border-zinc-800/60 rounded-lg p-6 flex flex-col items-center justify-center text-center text-zinc-500 h-full min-h-87.5">
        <Terminal className="w-8 h-8 mb-2 stroke-[1.5] text-zinc-600" />
        <p className="text-xs font-mono">
          Chọn một chặng học để xem trước cú pháp
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111625] border border-zinc-800 rounded-lg p-5 flex flex-col justify-between h-full space-y-5 transition-all duration-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant={node.difficulty}>
            {node.difficulty === "success"
              ? "Nâng cao"
              : node.difficulty === "warning"
                ? "Cơ bản"
                : node.difficulty === "error"
                  ? "Thử thách"
                  : "Nhập môn"}
          </Badge>
          <span className="text-[11px] font-mono text-emerald-500">
            +{node.xp} XP
          </span>
        </div>

        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            {node.title}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            {node.desc}
          </p>
        </div>

        <div className="bg-zinc-950 rounded border border-zinc-800/80 p-3 font-mono text-[11px] relative overflow-x-auto">
          <pre className="text-sky-400/90 mt-2">
            <code>{node.syntaxSnippet}</code>
          </pre>
        </div>
      </div>

      <div>
        {node.status === "completed" ? (
          <Button variant="secondary" className="w-full text-xs">
            Luyện tập lại
          </Button>
        ) : node.status === "current" ? (
          <Button variant="success" className="w-full text-xs" to="/editor">
            Bắt đầu Code ngay →
          </Button>
        ) : (
          <Button variant="secondary" className="w-full text-xs" disabled>
            Đang khóa
          </Button>
        )}
      </div>
    </div>
  );
};
