import React from "react";
import { Badge } from "./Badge";

interface PreviewProps {
  title: string;
  conceptText: string;
  difficulty: "success" | "warning" | "error" | "info";
  x: number;
  y: number;
  visible: boolean;
}

export const Preview: React.FC<PreviewProps> = ({
  title,
  conceptText,
  difficulty,
  x,
  y,
  visible,
}) => {
  const getTenWords = (text: string) => {
    const cleanText = text.replace(/`/g, "");
    const words = cleanText.split(/\s+/);
    if (words.length <= 10) return cleanText;
    return words.slice(0, 10).join(" ") + "...";
  };

  return (
    <div
      className={`fixed z-50 pointer-events-none bg-[#111625]/95 border border-zinc-800/80 rounded-lg p-3 w-56 shadow-2xl backdrop-blur-md transition-all duration-200 ease-out font-sans
        ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2"}`}
      style={{
        left: `${x + 15}px`,
        top: `${y + 15}px`,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          Xem trước
        </span>
        <Badge
          variant={difficulty}
          className="scale-90 origin-right py-0! px-1.5!"
        >
          {difficulty === "success"
            ? "Cơ bản"
            : difficulty === "warning"
              ? "Nâng cao"
              : difficulty === "error"
                ? "Thử thách"
                : "Nhập môn"}
        </Badge>
      </div>
      <h4 className="text-xs font-bold text-white mb-1 truncate">{title}</h4>
      <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-950/40 p-2 rounded border border-zinc-900 font-mono">
        {getTenWords(conceptText)}
      </p>
    </div>
  );
};
