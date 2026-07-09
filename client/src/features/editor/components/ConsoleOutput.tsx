import React from "react";
import { ArrowRight } from "lucide-react";

interface ConsoleOutputProps {
  output: string;
  isError: boolean;
  onRunCode: () => void;
  onSubmitCode: () => void;
  isRunning: boolean;
  isPassed: boolean;
  onBackToRoadmap?: () => void;
  onNextExercise?: () => void;
  nextExerciseLabel?: string;
  completionMessage?: string;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  output,
  isError,
  isPassed,
  onBackToRoadmap,
  onNextExercise,
  nextExerciseLabel = "Bài tiếp theo",
  completionMessage,
}) => {
  return (
    <div className="h-full bg-[#050816] border-t border-zinc-800/80 flex flex-col justify-between">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="h-10 px-4 border-b border-zinc-900 bg-[#050816]/50 flex items-center justify-between select-none">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
            Console Output
          </span>
        </div>

        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-[#050816]/30 selection:bg-zinc-800">
          {output ? (
            <div className="space-y-4">
              <pre
                className={`whitespace-pre-wrap leading-relaxed ${isError ? "text-rose-400" : "text-emerald-500"}`}
              >
                {output}
              </pre>
              {isPassed && (
                <div className="space-y-2 pt-2 animate-fadeIn font-sans">
                  {completionMessage && (
                    <p className="text-xs text-emerald-300">
                      {completionMessage}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {onNextExercise && (
                      <button
                        type="button"
                        onClick={onNextExercise}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 rounded transition-colors group"
                      >
                        {nextExerciseLabel}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onBackToRoadmap}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 border border-orange-500/20 bg-orange-500/5 px-3 py-1.5 rounded transition-colors group"
                    >
                      Quay lại Roadmap
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className="text-zinc-600 text-2xl italic">
              KẾt quả sẽ được hiển thị sau khi bạn ấn Run Code
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsoleOutput;
