import { useLocation } from "react-router";
import { NavBar } from "../NavBar";
import { Award, Sparkles, Zap, Target, TrendingUp } from "lucide-react";
import { Button } from "../../components/common/Button";
import { useEffect, useState } from "react";
import { TopicHeader } from "./TopicHeader";

interface GenerationParams {
  detectedLevel?: string;
  weakSkills?: string[];
  strongSkills?: string[];
  pacePreference?: "slow" | "medium" | "fast";
}
interface RoadmapItem {
  userId: string;
  templateId: string;
  title: string;
  status: "active" | "inactive" | string;
  totalNodes: number;
  completedNodes: number;
  generationParams: GenerationParams;
}
export default function Result() {
  const location = useLocation();
  const data = location.state || { XP: 250, score: 85 };
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapItem | null>({
    userId: "mock-user-123",
    templateId: "mock-template-456",
    title: "Frontend Mastery Roadmap",
    status: "active",
    totalNodes: 30,
    completedNodes: 5,
    generationParams: {
      detectedLevel: "Intermediate",
      weakSkills: ["Tối ưu hóa hiệu suất", "Quản lý State phức tạp", "Next.js"],
      strongSkills: ["React Hooks", "CSS/Tailwind", "JavaScript cơ bản"],
      pacePreference: "fast",
    },
  });
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_URL = "";
        const res = await fetch(`${API_URL}/roadmaps/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Không thể tải lộ trình học tập");
        }
        const data: RoadmapItem[] = await res.json();
        const active = data.find((item) => item.status === "active");
        if (active) {
          setActiveRoadmap(active);
        }
      } catch (error) {
        console.error("Lỗi khi fetch API:", error);
      } finally {
        setLoadingRoadmap(false);
      }
    };

    fetchRoadmap();
  }, []);
  return (
    <div className="w-full mx-auto min-h-screen flex flex-col bg-[#050b17]">
      <NavBar variant="quiz" showProgressBar={false} showSave={false} />
      <main className="p-5 flex flex-col gap-11 m-auto items-center">
        <div className="flex flex-col justify-center items-center gap-5">
          <div className="w-fit h-fit p-5 bg-[#0b3026] rounded-2xl border border-(--accent-border) animate-[glow_5s_ease-in-out_1] shadow-[0_0_25px_rgba(16,185,129,0.15)]">
            <Award className="text-(--accent) w-12 h-12"></Award>
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-2xl">
            Hoàn thành bài đánh giá!
          </h1>
          <p>
            CodeQuest AI đã phân tích kết quả làm bài của bạn và thiết lập một
            lộ trình học tập riêng cho bạn.
          </p>
        </div>
        <div className="flex gap-5">
          <div className="bg-(--card-bg) p-5 rounded-2xl gap-3 flex-col flex">
            <div className="flex flex-col gap-4">
              <span className="font-semibold text-(--text)">
                TRÌNH ĐỘ HIỆN TẠI
              </span>
              <div
                className="flex justify-center items-center
    w-fit mx-auto
    px-5 py-3
    rounded-xl
    bg-linear-to-r from-[#2563eb] to-[#3b82f6]
    text-white
    shadow-[0_0_20px_rgba(59,130,246,0.3)]
    font-bold text-center drop-shadow-md whitespace-nowrap leading-none"
              >
                {activeRoadmap?.generationParams.detectedLevel}
              </div>
            </div>
            <div className="bg-[#050b18] flex gap-3 justify-center items-center p-3 rounded-2xl border border-(--border)">
              <div className="rounded-full w-11 h-11 flex justify-center items-center bg-(--accent-bg)">
                <Zap className="text-(--accent)"></Zap>
              </div>
              <div className="flex flex-col text-white text-[12px]">
                <span className="font-semibold">Phần thưởng</span>
                <span className="text-(--text-h)">
                  +{data.XP} XP nhận vào hồ sơ của bạn
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-(--card-bg) h-fit p-5 rounded-2xl max-w-6xl">
          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <Sparkles className="text-violet-500"></Sparkles>
              <span className="text-white text-2xl font-bold">
                Kết quả đánh giá của CodeQuest AI
              </span>
            </div>
            <Button variant="secondary" to="/roadmap">
              Xem toàn bộ Lộ trình
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {loadingRoadmap ? (
              <div className="col-span-3 text-center py-10 text-slate-500 text-sm">
                Đang tải dữ liệu năng lực từ hệ thống...
              </div>
            ) : activeRoadmap?.generationParams ? (
              <>
                <TopicHeader
                  id="overview"
                  title="Đánh giá tổng quan"
                  description={`Hệ thống xác định trình độ hiện tại của bạn là ${
                    activeRoadmap.generationParams.detectedLevel || "Chưa rõ"
                  }. Nhịp độ học tập tối ưu được đề xuất cho bạn là: ${
                    activeRoadmap.generationParams.pacePreference === "fast"
                      ? "Cấp tốc (Fast)"
                      : activeRoadmap.generationParams.pacePreference === "slow"
                        ? "Thong thả (Slow)"
                        : "Tiêu chuẩn (Medium)"
                  }.`}
                  icon={<Target className="w-7 h-7 text-blue-400" />}
                />
                <TopicHeader
                  id="strong-skills"
                  title="Kỹ năng vững chắc"
                  description={
                    activeRoadmap.generationParams.strongSkills &&
                    activeRoadmap.generationParams.strongSkills.length > 0
                      ? `Chúc mừng! Bạn vượt qua tốt các bài kiểm tra thuộc mảng kiến thức: ${activeRoadmap.generationParams.strongSkills.join(", ")}. Hãy tiếp tục phát huy ưu thế này.`
                      : "Hệ thống chưa ghi nhận thế mạnh vượt trội đáng kể, hãy tích lũy thêm bài tập để nâng cấp chỉ số."
                  }
                  icon={<Zap className="w-5 h-5 text-emerald-400" />}
                />
                <TopicHeader
                  id="weak-skills"
                  title="Trọng tâm cải thiện"
                  description={
                    activeRoadmap.generationParams.weakSkills &&
                    activeRoadmap.generationParams.weakSkills.length > 0
                      ? `Các điểm cần cải thiện bao gồm: ${activeRoadmap.generationParams.weakSkills.join(", ")}. Các module tiếp theo của lộ trình học sẽ được thiết kế để tập trung khắc phục phần này.`
                      : "Tuyệt vời! Bạn có nền tảng rất đều và không bị hổng kiến thức lõi nào trong bài đánh giá này."
                  }
                  icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
                />
              </>
            ) : (
              <div className="col-span-3 text-slate-400 text-center py-4">
                Đang phân tích dữ liệu cấu trúc lộ trình của bạn...
              </div>
            )}
          </div>
        </div>
        <Button size="lg" className="text-[#0a101f]" to="/dashboard">
          Go to Dashboard
        </Button>
      </main>
    </div>
  );
}
