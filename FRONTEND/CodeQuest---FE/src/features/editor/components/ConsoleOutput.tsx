import React from "react";
import { ArrowRight } from "lucide-react";

interface ConsoleOutputProps {
  output: string;
  isError: boolean;
  onRunCode: () => void;
  onSubmitCode: () => void;
  isRunning: boolean;
  isPassed: boolean;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  output,
  isError,
  isPassed,
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
                <div className="pt-2 animate-fadeIn">
                  <a
                    href="/roadmap"
                    className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-orange-400 hover:text-orange-300 border border-orange-500/20 bg-orange-500/5 px-3 py-1.5 rounded transition-colors group"
                  >
                    Quay lại Roadmap
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </a>
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
