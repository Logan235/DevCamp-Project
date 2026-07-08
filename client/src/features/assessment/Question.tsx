import { Flag } from "lucide-react";

export type OptionItem = {
  id: string;
  text: string;
};

export type QuestionItem = {
  id: number;
  level: string;
  title: string;
  code?: string;
  type?: "multiple-choice" | "essay";
  category: string;
  options?: OptionItem[];
};

type QuestionProps = {
  activeQuest: QuestionItem;
  handleSelect: (select: string) => void;
  handleNext: () => void;
  currentQuest: number;
  selectedAns: string;
  flag: boolean;
  setFlag: () => void;
};

export default function Question({
  activeQuest,
  handleSelect,
  handleNext,
  selectedAns,
  currentQuest,
  flag,
  setFlag,
}: QuestionProps) {
  if (!activeQuest) return null;

  const formatTitle = (title: string) => {
    if (!title) return "";

    const parts = title.split(/(\{[^}]+\})/g);

    return parts.map((part, index) => {
      if (part.startsWith("{") && part.endsWith("}")) {
        const variable = part.slice(1, -1);

        return (
          <code
            key={`code-${index}-${variable}`}
            className="text-[#20bd5b]! font-bold! text-[18px]! h-fit!"
          >
            {variable}
          </code>
        );
      }

      return <span key={`text-${index}-${part}`}>{part}</span>;
    });
  };

  let levelClass = "rounded-sm text-[14px] px-2 py-0.25 ";

  if (activeQuest.level === "Vừa" || activeQuest.level === "medium") {
    levelClass += "border border-[#503217] bg-[#231d1b] text-[#ee8006]";
  } else if (activeQuest.level === "Dễ" || activeQuest.level === "easy") {
    levelClass += "border border-[#113b2e] bg-[#0c2324] text-[#22c55e]";
  } else if (activeQuest.level === "Khó" || activeQuest.level === "hard") {
    levelClass += "border border-[#3b1111] bg-[#240c0c] text-[#ef4444]";
  } else {
    levelClass += "border border-[#1d395f] bg-[#111f35] text-[#4a94e9]";
  }

  const isEssay = activeQuest.type === "essay";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex">
        <div className="flex flex-1 gap-4">
          <span className="font-bold text-[15px] text-[#c6cad1] px-2 py-1.5 bg-[#171c2b] h-fit leading-none rounded-lg border border-[#2e333f]">
            Câu {currentQuest}
          </span>

          <span className={levelClass}>{activeQuest.level}</span>

          <span className="rounded-sm font-semibold text-[14px] px-2 py-px border border-[#1d395f] bg-[#111f35] text-[#4a94e9]">
            {activeQuest.category}
          </span>
        </div>

        <button
          type="button"
          onClick={setFlag}
          className={`${flag ? "border-orange-500/50 text-orange-500" : "text-slate-500"}`}
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      <h2 className="text-left text-white">{formatTitle(activeQuest.title)}</h2>

      {activeQuest.code && (
        <pre className="codeblock">
          <code>{activeQuest.code}</code>
        </pre>
      )}

      {isEssay ? (
        <div className="flex flex-col gap-4">
          <textarea
            value={selectedAns}
            onChange={(e) => handleSelect(e.target.value)}
            placeholder="Nhập câu trả lời của bạn tại đây..."
            className="w-full min-h-37.5 p-4 rounded-xl border border-slate-800 bg-[#161f32]/50 text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-y"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeQuest.options?.map((opt, index) => {
            const optionId = opt.id || String(index + 1);
            const optionText = opt.text || "";
            const isSelected = selectedAns === optionId;

            return (
              <button
                key={`${activeQuest.id}-${optionId}-${index}`}
                type="button"
                onClick={() => {
                  handleSelect(optionId);
                  handleNext();
                }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left w-full
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-950/40 text-blue-300"
                    : "border-slate-800 bg-[#161f32]/50 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs
                ${isSelected ? "bg-blue-500 text-white" : "bg-[#161f32] text-slate-400"}`}
                >
                  {optionId}
                </div>

                <span>{optionText}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
