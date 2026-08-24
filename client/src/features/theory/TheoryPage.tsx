import { useMemo, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRightLeft,
  BookOpen,
  ChevronDown,
  Crosshair,
  GitBranch,
  Hash,
  Layers,
  LayoutGrid,
  Network,
  Search,
  Table2,
  Target,
  Link2,
} from "lucide-react";

import { NavBar } from "../NavBar";
import { VisualizerBox } from "../roadmap/components/VisualizerBox";
import { theoryTopics, type TheoryTopic } from "./data/topics";

/** Map tên icon trong dữ liệu sang component của lucide-react. */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  LayoutGrid,
  Hash,
  Crosshair,
  Link2,
  Layers,
  ArrowRightLeft,
  GitBranch,
  Network,
  Table2,
};

/**
 * Class Tailwind viết sẵn cho từng tông màu. Phải là chuỗi tĩnh, không ghép
 * động, để Tailwind quét ra được lúc build.
 */
const ACCENT: Record<
  TheoryTopic["accent"],
  {
    ring: string;
    iconBox: string;
    text: string;
    chip: string;
    tabActive: string;
    bar: string;
  }
> = {
  blue: {
    ring: "hover:border-blue-500/60 focus-visible:border-blue-500/60",
    iconBox:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    text: "text-blue-600 dark:text-blue-400",
    chip: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    tabActive: "bg-blue-600 text-white border-blue-600",
    bar: "bg-blue-500",
  },
  emerald: {
    ring: "hover:border-emerald-500/60 focus-visible:border-emerald-500/60",
    iconBox:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    text: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    tabActive: "bg-emerald-600 text-white border-emerald-600",
    bar: "bg-emerald-500",
  },
  violet: {
    ring: "hover:border-violet-500/60 focus-visible:border-violet-500/60",
    iconBox:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25",
    text: "text-violet-600 dark:text-violet-400",
    chip: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
    tabActive: "bg-violet-600 text-white border-violet-600",
    bar: "bg-violet-500",
  },
  amber: {
    ring: "hover:border-amber-500/60 focus-visible:border-amber-500/60",
    iconBox:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    text: "text-amber-600 dark:text-amber-400",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    tabActive: "bg-amber-600 text-white border-amber-600",
    bar: "bg-amber-500",
  },
  rose: {
    ring: "hover:border-rose-500/60 focus-visible:border-rose-500/60",
    iconBox:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    text: "text-rose-600 dark:text-rose-400",
    chip: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    tabActive: "bg-rose-600 text-white border-rose-600",
    bar: "bg-rose-500",
  },
  cyan: {
    ring: "hover:border-cyan-500/60 focus-visible:border-cyan-500/60",
    iconBox:
      "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25",
    text: "text-cyan-600 dark:text-cyan-400",
    chip: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
    tabActive: "bg-cyan-600 text-white border-cyan-600",
    bar: "bg-cyan-500",
  },
  indigo: {
    ring: "hover:border-indigo-500/60 focus-visible:border-indigo-500/60",
    iconBox:
      "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
    text: "text-indigo-600 dark:text-indigo-400",
    chip: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    tabActive: "bg-indigo-600 text-white border-indigo-600",
    bar: "bg-indigo-500",
  },
};

/** Bỏ dấu tiếng Việt để ô tìm kiếm hoạt động cả khi người dùng gõ không dấu. */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function TopicBox({
  topic,
  isOpen,
  onToggle,
}: {
  topic: TheoryTopic;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [demoIndex, setDemoIndex] = useState(0);

  const accent = ACCENT[topic.accent];
  const Icon = ICONS[topic.icon] ?? BookOpen;
  const demo = topic.demos[Math.min(demoIndex, topic.demos.length - 1)];

  return (
    <section
      className={`
        rounded-3xl border border-zinc-200 dark:border-slate-800
        bg-white/60 dark:bg-slate-950/40 backdrop-blur-xl
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]
        transition-all duration-300 overflow-hidden
        ${accent.ring}
        ${isOpen ? "lg:col-span-2" : ""}
      `}
    >
      {/* Đầu box — bấm để mở/đóng */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left p-6 flex items-start gap-4 cursor-pointer"
      >
        <span
          className={`shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center ${accent.iconBox}`}
        >
          <Icon className="w-6 h-6" />
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
            {topic.title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-slate-400 mt-1 leading-relaxed">
            {topic.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={`text-[11px] font-mono font-semibold px-2 py-1 rounded-lg border ${accent.chip}`}
            >
              Thời gian {topic.complexity.time}
            </span>
            <span
              className={`text-[11px] font-mono font-semibold px-2 py-1 rounded-lg border ${accent.chip}`}
            >
              Bộ nhớ {topic.complexity.space}
            </span>
            <span className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-zinc-200 dark:border-slate-800 text-zinc-500 dark:text-slate-400">
              {topic.demos.length} bài mô phỏng
            </span>
          </div>
        </div>

        <ChevronDown
          className={`shrink-0 w-5 h-5 mt-1 text-zinc-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Thân box — lý thuyết + trực quan hóa */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-zinc-200/70 dark:border-slate-800/70 pt-6 flex flex-col gap-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Cột lý thuyết */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                  {topic.sections.map((section) => (
                    <div key={section.heading}>
                      <h4
                        className={`text-xs font-bold uppercase tracking-wider mb-2 ${accent.text}`}
                      >
                        {section.heading}
                      </h4>
                      <ul className="space-y-2">
                        {section.points.map((point) => (
                          <li
                            key={point}
                            className="flex gap-2.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                          >
                            <span
                              className={`mt-2 shrink-0 w-1.5 h-1.5 rounded-full ${accent.bar}`}
                            />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Cột phụ: dấu hiệu nhận dạng + lỗi thường gặp */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-zinc-200/70 dark:border-slate-800/70 bg-zinc-50/60 dark:bg-slate-900/30 p-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                      <Target className="w-3.5 h-3.5" /> Dấu hiệu nhận dạng
                    </h4>
                    <ul className="space-y-2">
                      {topic.signals.map((signal) => (
                        <li
                          key={signal}
                          className="text-xs leading-relaxed text-slate-600 dark:text-slate-400"
                        >
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" /> Lỗi thường gặp
                    </h4>
                    <ul className="space-y-2">
                      {topic.pitfalls.map((pitfall) => (
                        <li
                          key={pitfall}
                          className="text-xs leading-relaxed text-slate-600 dark:text-slate-400"
                        >
                          {pitfall}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Chọn bài mô phỏng */}
              <div>
                <h4
                  className={`text-xs font-bold uppercase tracking-wider mb-3 ${accent.text}`}
                >
                  Bài mô phỏng của dạng này
                </h4>
                <div className="flex flex-wrap gap-2">
                  {topic.demos.map((item, index) => (
                    <button
                      key={item.slug + item.label}
                      type="button"
                      onClick={() => setDemoIndex(index)}
                      className={`
                        text-xs font-semibold px-3 py-2 rounded-xl border transition-colors cursor-pointer
                        ${
                          index === demoIndex
                            ? accent.tabActive
                            : "border-zinc-200 dark:border-slate-800 text-zinc-600 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800"
                        }
                      `}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trực quan hóa — key để reset về bước 1 khi đổi bài */}
              {demo && (
                <VisualizerBox
                  key={`${topic.id}-${demo.slug}`}
                  slug={demo.slug}
                  title={demo.label}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function TheoryPage() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(theoryTopics[0]?.id ?? null);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return theoryTopics;

    return theoryTopics.filter((topic) => {
      const haystack = normalize(
        [
          topic.title,
          topic.tagline,
          ...topic.signals,
          ...topic.demos.map((d) => d.label),
        ].join(" "),
      );
      return haystack.includes(needle);
    });
  }, [query]);

  return (
    <div
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
      className="min-h-screen"
    >
      <NavBar />

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14">
        {/* Tiêu đề trang */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Lý thuyết theo dạng bài
            </span>
          </div>

          <h1
            className="text-3xl md:text-4xl font-extrabold mb-3"
            style={{ color: "var(--text-h)" }}
          >
            Thư viện lý thuyết DSA
          </h1>

          <p className="max-w-2xl text-sm md:text-base leading-relaxed text-zinc-500 dark:text-slate-400">
            Mỗi box là một dạng bài: bản chất, dấu hiệu nhận dạng đề, khuôn mẫu
            code, lỗi thường gặp — kèm mô phỏng từng bước để thấy thuật toán
            chạy thật thay vì chỉ đọc chữ.
          </p>

          {/* Ô tìm kiếm */}
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm dạng bài: mảng, stack, dijkstra, dp..."
              className="
                w-full pl-10 pr-4 py-3 rounded-xl text-sm
                border border-zinc-200 dark:border-slate-800
                bg-white/70 dark:bg-slate-950/50
                text-slate-700 dark:text-slate-200
                placeholder:text-zinc-400
                focus:outline-none focus:border-blue-500/60
                transition-colors
              "
            />
          </div>
        </header>

        {/* Lưới các box dạng bài */}
        {filtered.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            Không tìm thấy dạng bài nào khớp với “{query}”.
          </p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {filtered.map((topic) => (
              <TopicBox
                key={topic.id}
                topic={topic}
                isOpen={openId === topic.id}
                onToggle={() =>
                  setOpenId((prev) => (prev === topic.id ? null : topic.id))
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
