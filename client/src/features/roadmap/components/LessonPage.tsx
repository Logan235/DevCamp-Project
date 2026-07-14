import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../../../components/common/Button";
import { getExerciseByIdApi } from "../../editor/api";
import { ChevronLeft } from "lucide-react";

type ExerciseExample = {
  input?: string;
  output?: string;
  explanation?: string;
};

type ExerciseDetail = {
  _id?: string;
  title?: string;
  problem_name?: string;
  slug?: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard" | string;
  challengeType?: "coding" | "multiple_choice" | string;
  examples?: ExerciseExample[];
  constraints?: string[];
  thinkingHint?: string[];
  skillSlug?: string[];
  patternGroup?: string;
};

function getDifficultyLabel(difficulty?: string) {
  switch (difficulty) {
    case "easy":
      return "Dễ";
    case "medium":
      return "Trung bình";
    case "hard":
      return "Khó";
    default:
      return "Chưa phân loại";
  }
}

function getDifficultyClass(difficulty?: string) {
  switch (difficulty) {
    case "easy":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30";
    case "hard":
      return "bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/30";
    default:
      return "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30";
  }
}

export default function LessonPage() {
  const { id: challengeId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<ExerciseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadLesson() {
      if (!challengeId) {
        setLoadError("Thiếu challengeId trong URL.");
        return;
      }

      try {
        setIsLoading(true);
        setLoadError("");

        const data = await getExerciseByIdApi(challengeId);
        setLesson(data);
      } catch (error) {
        console.error(error);
        setLoadError(
          "Không thể tải bài học. Hãy kiểm tra challengeId có phải MongoDB ObjectId hợp lệ không.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadLesson();
  }, [challengeId]);

  const title = useMemo(() => {
    return (
      lesson?.title ||
      lesson?.problem_name ||
      lesson?.slug ||
      "Chi tiết bài học"
    );
  }, [lesson]);

  if (isLoading) {
    return (
      <div
        style={{ backgroundColor: "var(--bg)" }}
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
      >
        <div style={{ color: "var(--text-h)" }}>Đang tải bài học...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        style={{ backgroundColor: "var(--bg)" }}
        className="min-h-screen flex items-center justify-center p-10 transition-colors duration-300"
      >
        <div className="max-w-xl w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <h1 className="text-xl font-bold text-red-500 dark:text-red-300 mb-3">
            Không thể mở bài học
          </h1>
          <p className="text-sm text-red-700 dark:text-red-100/80 mb-6">
            {loadError}
          </p>

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" to="/roadmap">
              Quay lại roadmap
            </Button>
            <Button variant="primary" to="/assessment">
              Làm assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div
        style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
      >
        Không tìm thấy bài học.
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
      className="min-h-screen p-6 md:p-10 transition-colors duration-300"
    >
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--border)",
        }}
        className="
          max-w-5xl
          mx-auto
          rounded-3xl
          border
          p-6 md:p-10
          shadow-[0_0_50px_rgba(59,130,246,0.04)]
        "
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`px-3 py-1 rounded-full border text-xs font-semibold ${getDifficultyClass(
                  lesson.difficulty,
                )}`}
              >
                {getDifficultyLabel(lesson.difficulty)}
              </span>

              {lesson.challengeType && (
                <span className="px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs font-semibold">
                  {lesson.challengeType}
                </span>
              )}
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{ color: "var(--text)" }}
            >
              {title}
            </h1>

            {lesson.slug && (
              <p
                className="text-sm mt-2 font-mono"
                style={{ color: "var(--text-h)" }}
              >
                {lesson.slug}
              </p>
            )}
          </div>

          <Button variant="secondary" to="/roadmap">
            <ChevronLeft/>
            Roadmap
          </Button>
        </div>

        <div className="space-y-6 leading-8" style={{ color: "var(--text)" }}>
          <section
            className="bg-zinc-100/80 dark:bg-[#0f172a]/40 rounded-2xl p-5 border"
            style={{
              borderColor: "var(--border)",
              background: "var(--card-bg)",
            }}
          >
            <h2 className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
              Mô tả bài toán
            </h2>
            <pre
              className="whitespace-pre-wrap leading-8 font-sans"
              style={{ color: "var(--text)" }}
            >
              {lesson.description || "Bài này chưa có mô tả chi tiết."}
            </pre>
          </section>

          {lesson.constraints && lesson.constraints.length > 0 && (
            <section
              className="bg-zinc-100/80 dark:bg-[#0f172a]/40 rounded-2xl p-5 border"
              style={{
                borderColor: "var(--border)",
                background: "var(--card-bg)",
              }}
            >
              <h2 className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                Ràng buộc
              </h2>
              <ul className="list-disc list-inside space-y-2">
                {lesson.constraints.map((constraint, index) => (
                  <li key={`${constraint}-${index}`}>{constraint}</li>
                ))}
              </ul>
            </section>
          )}

          {lesson.examples && lesson.examples.length > 0 && (
            <section
              className="bg-zinc-100/80 dark:bg-[#0f172a]/40 rounded-2xl p-5 border"
              style={{
                borderColor: "var(--border)",
                background: "var(--card-bg)",
              }}
            >
              <h2 className="text-blue-600 dark:text-blue-400 font-semibold mb-4">
                Ví dụ
              </h2>

              <div className="space-y-4">
                {lesson.examples.map((example, index) => (
                  <div
                    key={`example-${index}`}
                    className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#020617] p-4"
                    style={{background: "var(--panel-bg)"}}
                  >
                    <h3
                      className="text-sm font-semibold mb-3"
                      style={{ color: "var(--text)" }}
                    >
                      Ví dụ {index + 1}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p
                          className="text-xs uppercase tracking-wide mb-2"
                          style={{ color: "var(--text-h)" }}
                        >
                          Input
                        </p>
                        <pre className="text-green-600 dark:text-green-400 overflow-x-auto whitespace-pre-wrap">
                          {example.input || "(empty)"}
                        </pre>
                      </div>

                      <div>
                        <p
                          className="text-xs uppercase tracking-wide mb-2"
                          style={{ color: "var(--text-h)" }}
                        >
                          Output
                        </p>
                        <pre className="text-sky-600 dark:text-sky-400 overflow-x-auto whitespace-pre-wrap">
                          {example.output || "(empty)"}
                        </pre>
                      </div>
                    </div>

                    {example.explanation && (
                      <div className="mt-4">
                        <p
                          className="text-xs uppercase tracking-wide mb-2"
                          style={{ color: "var(--text-h)" }}
                        >
                          Giải thích
                        </p>
                        <p className="text-sm">{example.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {lesson.thinkingHint && lesson.thinkingHint.length > 0 && (
            <section
              className="bg-zinc-100/80 dark:bg-[#0f172a]/40 rounded-2xl p-5 border"
              style={{ borderColor: "var(--border)" }}
            >
              <h2 className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                Gợi ý tư duy
              </h2>
              <ul className="list-disc list-inside space-y-2">
                {lesson.thinkingHint.map((hint, index) => (
                  <li key={`${hint}-${index}`}>{hint}</li>
                ))}
              </ul>
            </section>
          )}

          {lesson.skillSlug && lesson.skillSlug.length > 0 && (
            <section
              className="bg-zinc-100/80 dark:bg-[#0f172a]/40 rounded-2xl p-5 border"
              style={{ borderColor: "var(--border)" }}
            >
              <h2 className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                Kỹ năng liên quan
              </h2>
              <div className="flex flex-wrap gap-2">
                {lesson.skillSlug.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-600 dark:text-violet-300 text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          <div className="flex justify-end pt-4">
            <Button
              variant="primary"
              onClick={() => navigate(`/editor/${challengeId}`)}
              className="
                px-6 py-3
                rounded-xl
                bg-linear-to-r
                from-[#1d4ed8]
                to-[#2563eb]
                text-white
                font-semibold
                hover:scale-105
                transition-all
                shadow-[0_0_20px_rgba(37,99,235,0.25)]
              "
            >
              Bắt đầu code →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
