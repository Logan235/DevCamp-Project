import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, HelpCircle, Pause, Play, RotateCcw } from "lucide-react";

import { resolveVisualizer } from "./visualizer/registry";
import { ArrayView } from "./visualizer/views/ArrayView";
import { LinkedListView } from "./visualizer/views/LinkedListView";
import { TreeView } from "./visualizer/views/TreeView";
import { GraphView } from "./visualizer/views/GraphView";
import {
  GridView,
  MapView,
  OutputView,
  QueueView,
  StackView,
} from "./visualizer/views/PanelViews";

interface VisualizerBoxProps {
  slug?: string;
  title?: string;
}

const PLAYBACK_SPEED = 1400; // ms cho mỗi bước khi chạy tự động

export function VisualizerBox({ slug = "", title = "" }: VisualizerBoxProps) {
  const visualizerData = useMemo(
    () => resolveVisualizer(slug, title),
    [slug, title],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = visualizerData.steps.length;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, PLAYBACK_SPEED);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, totalSteps]);

  const stepIndex = Math.min(currentStep, totalSteps - 1);
  const activeStep = visualizerData.steps[stepIndex];

  const handlePlayPause = () => {
    if (stepIndex === totalSteps - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (stepIndex < totalSteps - 1) setCurrentStep(stepIndex + 1);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (stepIndex > 0) setCurrentStep(stepIndex - 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  if (!activeStep) return null;

  const hasStack = !!activeStep.stack;
  const hasQueue = !!activeStep.queue;
  const hasVisual =
    !!activeStep.array ||
    !!activeStep.list ||
    !!activeStep.tree ||
    !!activeStep.graph ||
    !!activeStep.grid ||
    hasStack ||
    hasQueue ||
    !!activeStep.map;

  return (
    <section
      className="
        w-full
        rounded-3xl
        border
        border-zinc-200/80
        dark:border-slate-800/80
        bg-white/50
        dark:bg-slate-950/40
        backdrop-blur-xl
        p-6 md:p-8
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
        overflow-hidden
        transition-all
        duration-300
      "
    >
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-slate-800/60 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Interactive Visualizer
            </h3>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
            Trực quan hóa thuật toán:{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {visualizerData.title}
            </span>
          </h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 min-h-[280px]">
        {/* Khu vực hoạt cảnh */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-zinc-50/50 dark:bg-slate-900/30 rounded-2xl border border-zinc-200/50 dark:border-slate-800/40 p-5 sm:p-6 overflow-hidden">
          <div className="flex-1 flex flex-col justify-center gap-5 py-4">
            {activeStep.array && <ArrayView step={activeStep} />}

            {activeStep.list && <LinkedListView list={activeStep.list} />}

            {activeStep.tree && (
              <TreeView tree={activeStep.tree} label={activeStep.treeLabel} />
            )}

            {activeStep.graph && <GraphView graph={activeStep.graph} />}

            {activeStep.grid && <GridView grid={activeStep.grid} />}

            {(hasStack || hasQueue) && (
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-6">
                {hasStack && (
                  <StackView
                    items={activeStep.stack!}
                    label={activeStep.stackLabel}
                  />
                )}
                {hasQueue && (
                  <div className="flex-1 w-full">
                    <QueueView
                      items={activeStep.queue!}
                      label={activeStep.queueLabel}
                    />
                  </div>
                )}
              </div>
            )}

            {activeStep.map && (
              <MapView entries={activeStep.map} label={activeStep.mapLabel} />
            )}

            {activeStep.output !== undefined && (
              <OutputView
                output={activeStep.output}
                label={activeStep.outputLabel}
              />
            )}

            {/* Không có cấu trúc dữ liệu nào để vẽ: mô phỏng luồng chung */}
            {!hasVisual && (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <motion.div
                  key={stepIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4"
                >
                  {stepIndex === totalSteps - 1 ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <HelpCircle className="w-8 h-8" />
                  )}
                </motion.div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Trực quan hóa hoạt động
                </h4>
                <p className="text-sm text-zinc-500 dark:text-slate-400 max-w-sm">
                  Hệ thống đang chạy qua mô phỏng lý thuyết của giải pháp tối ưu.
                </p>
              </div>
            )}
          </div>

          {/* Thanh điều khiển */}
          <div className="border-t border-zinc-200/40 dark:border-slate-800/40 pt-4 mt-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleReset}
                  title="Quay lại đầu"
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-slate-800 hover:bg-zinc-100 dark:hover:bg-slate-800 text-zinc-600 dark:text-slate-300 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePrev}
                  disabled={stepIndex === 0}
                  className="
                    px-3 py-2 rounded-xl border border-zinc-200 dark:border-slate-800
                    hover:bg-zinc-100 dark:hover:bg-slate-800 text-zinc-600 dark:text-slate-300
                    disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-xs font-semibold
                  "
                >
                  Trước
                </button>

                <button
                  onClick={handlePlayPause}
                  className="
                    px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white
                    flex items-center gap-2 transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] font-semibold text-xs
                  "
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  {isPlaying
                    ? "Tạm dừng"
                    : stepIndex === totalSteps - 1
                      ? "Bắt đầu lại"
                      : "Chạy tự động"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={stepIndex === totalSteps - 1}
                  className="
                    px-3 py-2 rounded-xl border border-zinc-200 dark:border-slate-800
                    hover:bg-zinc-100 dark:hover:bg-slate-800 text-zinc-600 dark:text-slate-300
                    disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-xs font-semibold
                  "
                >
                  Tiếp tục
                </button>
              </div>

              <div className="text-xs font-mono text-zinc-500 dark:text-slate-400">
                Bước{" "}
                <span className="font-bold text-zinc-800 dark:text-slate-200">
                  {stepIndex + 1}
                </span>{" "}
                / {totalSteps}
              </div>
            </div>

            {/* Tiến trình */}
            <div className="mt-3 h-1 w-full rounded-full bg-zinc-200/70 dark:bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
                animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
                transition={{ type: "spring", stiffness: 220, damping: 28 }}
              />
            </div>
          </div>
        </div>

        {/* Giải thích từng bước */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex-1 bg-zinc-50/50 dark:bg-slate-900/30 border border-zinc-200/50 dark:border-slate-800/40 rounded-2xl p-5 flex flex-col">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1">
              <span>Trạng thái giải thích</span>
            </h4>

            <AnimatePresence mode="wait">
              <motion.p
                key={stepIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line"
              >
                {activeStep.description}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
