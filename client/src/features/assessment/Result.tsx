import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Award,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Map,
  RotateCcw,
} from "lucide-react";
import { NavBar } from "../NavBar";
import { Button } from "../../components/common/Button";
import { TopicHeader } from "./TopicHeader";
import { getMyRoadmapsApi } from "../roadmap/api";

interface AssessmentDetail {
  questionOrder?: number;
  type?: string;
  status?: string;
  input?: string; // Nội dung câu hỏi
  expected?: string; // Nội dung đáp án đúng dạng chữ
  actual?: string; // Nội dung đáp án bạn chọn dạng chữ
  category?: string;
  level?: string;
  userAnswerText?: string;
  expectedAnswerText?: string;
}

interface AssessmentResultState {
  assessmentId?: string;
  roadmap?: RoadmapItem;
  assessmentTitle?: string;
  status?: string;
  score?: number;
  detectedLevel?: string;
  strongSkills?: string[];
  weakSkills?: string[];
  passed?: string;
  details?: AssessmentDetail[];
  XP?: number;
}

interface GenerationParams {
  detectedLevel?: string;
  weakSkills?: string[];
  strongSkills?: string[];
  pacePreference?: "slow" | "medium" | "fast";
}

interface RoadmapItem {
  _id?: string;
  userId?: string;
  templateId?: string | unknown;
  title?: string;
  status?: "active" | "inactive" | "draft" | "completed" | "archived" | string;
  totalNodes?: number;
  completedNodes?: number;
  generationParams?: GenerationParams;
}

function normalizeLevel(level?: string) {
  switch (level) {
    case "advanced":
      return "Advanced";
    case "intermediate":
      return "Intermediate";
    case "beginner":
      return "Beginner";
    case "absolute_beginner":
      return "Absolute Beginner";
    default:
      return level || "Chưa xác định";
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Nền tảng tốt";
  if (score >= 50) return "Đang phát triển";
  return "Cần củng cố";
}

function uniqueValues(values?: string[]) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = (location.state || {}) as AssessmentResultState;
  const details = Array.isArray(result.details) ? result.details : [];

  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapItem | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState("");

  const score = typeof result.score === "number" ? result.score : 0;
  const xp = typeof result.XP === "number" ? result.XP : 0;
  const strongSkills = uniqueValues(result.strongSkills);
  const weakSkills = uniqueValues(result.weakSkills);
  const detectedLevel = result.detectedLevel || "beginner";

  const passedCount = useMemo(() => {
    return details.filter((item) => item.status === "Passed").length;
  }, [details]);

  const failedCount = useMemo(() => {
    return details.filter((item) => item.status === "Failed").length;
  }, [details]);

  const submittedCount = useMemo(() => {
    return details.filter((item) => item.status === "Submitted").length;
  }, [details]);

  useEffect(() => {
    if (result.roadmap) {
      setActiveRoadmap(result.roadmap);
      return;
    }

    const fetchRoadmap = async () => {
      try {
        setLoadingRoadmap(true);
        setRoadmapError("");

        const data = await getMyRoadmapsApi();
        const roadmaps = Array.isArray(data) ? data : [];
        const active = roadmaps.find(
          (item: RoadmapItem) => item.status === "active",
        );

        setActiveRoadmap(active || null);
      } catch (error) {
        console.error("Lỗi khi fetch roadmap:", error);
        setRoadmapError(
          "Chưa tải được roadmap. Bạn vẫn có thể xem kết quả assessment trước.",
        );
      } finally {
        setLoadingRoadmap(false);
      }
    };

    void fetchRoadmap();
  }, [result.roadmap]);

  const displayLevel =
    activeRoadmap?.generationParams?.detectedLevel || detectedLevel;

  const displayStrongSkills =
    activeRoadmap?.generationParams?.strongSkills &&
    activeRoadmap.generationParams.strongSkills.length > 0
      ? activeRoadmap.generationParams.strongSkills
      : strongSkills;

  const displayWeakSkills =
    activeRoadmap?.generationParams?.weakSkills &&
    activeRoadmap.generationParams.weakSkills.length > 0
      ? activeRoadmap.generationParams.weakSkills
      : weakSkills;

  const pacePreference =
    activeRoadmap?.generationParams?.pacePreference || "medium";

  return (
    <div
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
      className="w-full mx-auto min-h-screen flex flex-col transition-colors duration-300"
    >
      <NavBar variant="quiz" showProgressBar={false} showSave={false} />

      <main className="w-full max-w-6xl p-5 flex flex-col gap-8 mx-auto">
        {/* Header Section */}
        <section className="flex flex-col justify-center items-center gap-5 text-center pt-6">
          <div
            style={{ borderColor: "var(--accent-border)" }}
            className="w-fit h-fit p-5 bg-emerald-500/10 dark:bg-[#0b3026] rounded-2xl border shadow-md dark:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
          >
            <Award className="text-emerald-600 dark:text-emerald-400 w-12 h-12" />
          </div>

          <div>
            <h1
              style={{ color: "var(--text)" }}
              className="text-3xl font-bold transition-colors"
            >
              Hoàn thành bài đánh giá!
            </h1>
            <p
              style={{ color: "var(--text-h)" }}
              className="mt-3 max-w-2xl text-sm md:text-base"
            >
              AI Mirror đã phân tích kết quả làm bài của bạn. Dữ liệu này sẽ
              được dùng để cá nhân hóa roadmap học tập tiếp theo.
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
            }}
            className="border p-5 rounded-2xl flex flex-col gap-3 transition-colors"
          >
            <span
              style={{ color: "var(--text-h)" }}
              className="text-xs font-semibold uppercase"
            >
              Điểm số
            </span>
            <div className={`text-4xl font-black ${getScoreColor(score)}`}>
              {score}
              <span
                style={{ color: "var(--text-h)" }}
                className="text-base ml-1 opacity-75"
              >
                /100
              </span>
            </div>
            <span
              style={{ color: "var(--text)" }}
              className="text-sm font-medium"
            >
              {getScoreLabel(score)}
            </span>
          </div>

          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
            }}
            className="border p-5 rounded-2xl flex flex-col gap-3 transition-colors"
          >
            <span
              style={{ color: "var(--text-h)" }}
              className="text-xs font-semibold uppercase"
            >
              Trình độ
            </span>
            <div className="w-fit px-4 py-2 rounded-xl bg-linear-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-lg font-bold">
              {normalizeLevel(displayLevel)}
            </div>
            <span
              style={{ color: "var(--text-h)" }}
              className="text-xs md:text-sm"
            >
              Cấp độ hiện tại được suy luận từ bài đánh giá.
            </span>
          </div>

          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
            }}
            className="border p-5 rounded-2xl flex flex-col gap-3 transition-colors"
          >
            <span
              style={{ color: "var(--text-h)" }}
              className="text-xs font-semibold uppercase"
            >
              Kết quả câu hỏi
            </span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {result.passed || `${passedCount}/${details.length || 0}`}
              </span>
            </div>
            <span
              style={{ color: "var(--text-h)" }}
              className="text-xs md:text-sm"
            >
              Đúng: {passedCount} · Sai: {failedCount} · Tự luận:{" "}
              {submittedCount}
            </span>
          </div>

          <div
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
            }}
            className="border p-5 rounded-2xl flex flex-col gap-3 transition-colors"
          >
            <span
              style={{ color: "var(--text-h)" }}
              className="text-xs font-semibold uppercase"
            >
              Phần thưởng
            </span>
            <div className="flex items-center gap-3">
              <div className="rounded-full w-11 h-11 flex justify-center items-center bg-emerald-500/10">
                <Zap className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span
                  style={{ color: "var(--text)" }}
                  className="text-2xl font-black"
                >
                  +{xp}
                </span>
                <span style={{ color: "var(--text-h)" }} className="text-xs">
                  XP nhận vào hồ sơ
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* AI Insight Section */}
        <section
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border)",
          }}
          className="border h-fit p-5 rounded-2xl transition-colors"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-3 items-center">
              <Sparkles className="text-violet-600 dark:text-violet-400" />
              <span
                style={{ color: "var(--text)" }}
                className="text-2xl font-bold"
              >
                Kết quả đánh giá của AI Mirror
              </span>
            </div>
            <Button variant="secondary" to="/roadmap">
              Xem toàn bộ lộ trình
            </Button>
          </div>

          {roadmapError && (
            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-200">
              {roadmapError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-1 md:p-6 mt-4">
            {loadingRoadmap ? (
              <div
                style={{ color: "var(--text-h)" }}
                className="col-span-3 text-center py-10 text-sm"
              >
                Đang tải dữ liệu roadmap từ hệ thống...
              </div>
            ) : (
              <>
                <TopicHeader
                  id="overview"
                  title="Đánh giá tổng quan"
                  description={`Hệ thống xác định trình độ hiện tại của bạn là ${normalizeLevel(
                    displayLevel,
                  )}. Nhịp độ học tập đề xuất: ${
                    pacePreference === "fast"
                      ? "Cấp tốc"
                      : pacePreference === "slow"
                        ? "Thong thả"
                        : "Tiêu chuẩn"
                  }.`}
                  icon={
                    <Target className="w-7 h-7 text-blue-500 dark:text-blue-400" />
                  }
                />

                <TopicHeader
                  id="strong-skills"
                  title="Kỹ năng vững chắc"
                  description={
                    displayStrongSkills.length > 0
                      ? `Bạn làm tốt các mảng: ${displayStrongSkills.join(
                          ", ",
                        )}. Đây là nền tảng nên tiếp tục phát huy.`
                      : "Hệ thống chưa ghi nhận thế mạnh vượt trội. Hãy hoàn thành thêm bài tập để cập nhật hồ sơ năng lực."
                  }
                  icon={
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  }
                />

                <TopicHeader
                  id="weak-skills"
                  title="Trọng tâm cải thiện"
                  description={
                    displayWeakSkills.length > 0
                      ? `Các điểm cần cải thiện gồm: ${displayWeakSkills.join(
                          ", ",
                        )}. Roadmap tiếp theo nên ưu tiên các chủ đề này.`
                      : "Tốt! Bài đánh giá chưa phát hiện lỗ hổng rõ ràng trong các nhóm kiến thức chính."
                  }
                  icon={
                    <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  }
                />
              </>
            )}
          </div>
        </section>

        {/* Details Question Section */}
        {details.length > 0 && (
          <section
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
            }}
            className="border rounded-2xl p-5 transition-colors"
          >
            <div className="flex items-center gap-3 mb-5">
              <AlertTriangle className="text-amber-600 dark:text-amber-400" />
              <h2
                style={{ color: "var(--text)" }}
                className="text-xl font-bold"
              >
                Chi tiết từng câu hỏi
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.map((item, index) => {
                const isPassed = item.status === "Passed";
                const isSubmitted = item.status === "Submitted";

                return (
                  <div
                    key={`${item.questionOrder || index}-${item.category || "item"}`}
                    style={{
                      backgroundColor: "var(--bg)",
                      borderColor: "var(--border)",
                    }}
                    className="rounded-xl border p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          style={{ color: "var(--text)" }}
                          className="text-sm font-semibold"
                        >
                          Câu {item.questionOrder || index + 1}
                        </p>
                        <p
                          style={{ color: "var(--text-h)" }}
                          className="text-xs mt-1"
                        >
                          {item.category || "Assessment"} ·{" "}
                          {item.level || "Chưa phân loại"}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isPassed
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                            : isSubmitted
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                              : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                        }`}
                      >
                        {item.status || "Unknown"}
                      </span>
                    </div>

                    <p
                      style={{ color: "var(--text)" }}
                      className="mt-4 text-sm line-clamp-3 font-medium"
                    >
                      {item.input || "Không có nội dung câu hỏi"}
                    </p>

                    <div className="mt-4 flex flex-col gap-3 text-xs">
                      <div className="rounded-lg bg-gray-50/50 dark:bg-slate-900/40 p-3 border border-gray-200/50 dark:border-zinc-800">
                        <p
                          style={{ color: "var(--text-h)" }}
                          className="mb-1 font-medium"
                        >
                          Bạn chọn
                        </p>
                        <p
                          className={`font-semibold ${isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                        >
                          {item.actual ||
                            (item as any).userAnswerText ||
                            "(empty)"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-50/50 dark:bg-slate-900/40 p-3 border border-gray-200/50 dark:border-zinc-800">
                        <p
                          style={{ color: "var(--text-h)" }}
                          className="mb-1 font-medium"
                        >
                          Đáp án đúng
                        </p>
                        <p
                          style={{ color: "var(--text)" }}
                          className="font-semibold"
                        >
                          {item.expected ||
                            (item as any).expectedAnswerText ||
                            "(essay)"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom Actions */}
        <section className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
          <Button
            variant="secondary"
            size="lg"
            to="/assessment"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Làm lại assessment
          </Button>

          <Button variant="primary" size="lg" to="/roadmap" className="gap-2">
            <Map className="w-4 h-4" />
            Đi tới Roadmap
          </Button>
        </section>
      </main>
    </div>
  );
}
