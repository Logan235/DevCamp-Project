import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, Compass, Award } from "lucide-react";
import { RoadmapHeader } from "./RoadmapHeader";
import { RoadmapSidebar } from "./RoadmapSidebar";
import { Connector } from "../../../components/common/Connector";
import { Node } from "../../../components/common/Node";
import { Preview } from "../../../components/common/Preview";
import StatCard from "../../dashboard/components/StatCard";
import bg from "../../../assets/bg.png";
import { getMyRoadmapsApi } from "../api";

type NodeStatus = "completed" | "current" | "locked";
type DifficultyVariant = "success" | "warning" | "error" | "info";

type ChallengeSnapshot = {
  title?: string;
  slug?: string;
  difficulty?: string;
  skillSlugs?: string[];
  xpReward?: number;
};

type RoadmapTemplateNode = {
  order?: number;
  challengeId?: string | { _id?: string; title?: string; slug?: string };
  nodeType?: "challenge" | "checkpoint";
  challengesSnapshot?: ChallengeSnapshot;
};

type RoadmapTemplate = {
  _id?: string;
  title?: string;
  description?: string;
  nodes?: RoadmapTemplateNode[];
};

type UserRoadmap = {
  _id?: string;
  title?: string;
  status?: string;
  totalNodes?: number;
  completedNodes?: number;
  generationParams?: {
    detectedLevel?: string;
    weakSkills?: string[];
    strongSkills?: string[];
    pacePreference?: "slow" | "medium" | "fast";
  };
  templateId?: string | RoadmapTemplate;
};

type RoadmapViewNode = {
  id: string;
  challengeId: string;
  title: string;
  desc: string;
  xp: number;
  status: NodeStatus;
  difficulty: DifficultyVariant;
  syntaxSnippet: string;
  concept: string;
  x: number;
  y: number;
};

const NODE_POSITIONS = [
  { x: 8, y: 70 },
  { x: 20, y: 40 },
  { x: 34, y: 65 },
  { x: 48, y: 35 },
  { x: 62, y: 60 },
  { x: 74, y: 30 },
  { x: 86, y: 55 },
  { x: 95, y: 35 },
];

function getChallengeId(node: RoadmapTemplateNode): string {
  if (!node.challengeId) return "";

  if (typeof node.challengeId === "string") {
    return node.challengeId;
  }

  return node.challengeId._id || "";
}

function mapDifficultyToVariant(difficulty?: string): DifficultyVariant {
  switch (difficulty) {
    case "easy":
      return "info";
    case "medium":
      return "warning";
    case "hard":
      return "error";
    default:
      return "info";
  }
}

function buildRoadmapNodes(
  activeRoadmap?: UserRoadmap | null,
): RoadmapViewNode[] {
  const template =
    activeRoadmap?.templateId && typeof activeRoadmap.templateId !== "string"
      ? activeRoadmap.templateId
      : null;

  const templateNodes = [...(template?.nodes || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  const completedNodes = activeRoadmap?.completedNodes || 0;

  return templateNodes
    .map((node, index) => {
      const challengeId = getChallengeId(node);
      const snapshot = node.challengesSnapshot || {};
      const position = NODE_POSITIONS[index % NODE_POSITIONS.length];

      let status: NodeStatus = "locked";

      if (index < completedNodes) {
        status = "completed";
      } else if (index === completedNodes) {
        status = "current";
      }

      return {
        id: `${node.order ?? index + 1}`,
        challengeId,
        title:
          snapshot.title ||
          (typeof node.challengeId === "object"
            ? node.challengeId.title
            : "") ||
          `Bài học ${index + 1}`,
        desc:
          snapshot.skillSlugs && snapshot.skillSlugs.length > 0
            ? `Chủ đề: ${snapshot.skillSlugs.join(", ")}`
            : template?.description ||
              "Bài tập trong lộ trình cá nhân hóa của bạn.",
        xp: snapshot.xpReward || 100,
        status,
        difficulty: mapDifficultyToVariant(snapshot.difficulty),
        syntaxSnippet:
          snapshot.slug ||
          (typeof node.challengeId === "object" ? node.challengeId.slug : "") ||
          "Mở bài để xem chi tiết",
        concept:
          snapshot.skillSlugs && snapshot.skillSlugs.length > 0
            ? `Bài này giúp bạn luyện nhóm kỹ năng: ${snapshot.skillSlugs.join(", ")}.`
            : "Bài tập được chọn từ roadmap dựa trên kết quả assessment của bạn.",
        x: position.x,
        y: position.y,
      };
    })
    .filter((node) => Boolean(node.challengeId));
}

export default function RoadmapPage() {
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState<UserRoadmap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    title: string;
    concept: string;
    difficulty: DifficultyVariant;
  } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    async function loadRoadmaps() {
      try {
        setIsLoading(true);
        setLoadError("");

        const data = await getMyRoadmapsApi();
        setRoadmaps(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setLoadError(
          "Không thể tải roadmap. Hãy kiểm tra token hoặc API /roadmaps/me.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadRoadmaps();
  }, []);

  const activeRoadmap = useMemo(() => {
    return (
      roadmaps.find((roadmap) => roadmap.status === "active") ||
      roadmaps[0] ||
      null
    );
  }, [roadmaps]);

  const stepsData = useMemo(
    () => buildRoadmapNodes(activeRoadmap),
    [activeRoadmap],
  );

  useEffect(() => {
    if (!activeNodeId && stepsData.length > 0) {
      const currentNode =
        stepsData.find((node) => node.status === "current") || stepsData[0];

      setActiveNodeId(currentNode.id);
    }
  }, [activeNodeId, stepsData]);

  const activeNode =
    stepsData.find((step) => step.id === activeNodeId) ||
    stepsData.find((step) => step.status === "current") ||
    stepsData[0] ||
    null;

  const completedCount = stepsData.filter(
    (step) => step.status === "completed",
  ).length;

  const progressPercent =
    stepsData.length > 0
      ? Math.round((completedCount / stepsData.length) * 100)
      : 0;

  const handleOpenNode = (step: RoadmapViewNode) => {
    if (step.status === "locked") return;

    setActiveNodeId(step.id);
    navigate(`/lesson/${step.challengeId}`);
  };

  return (
    <div className="bg-[#0b0f19] min-h-screen text-zinc-300 font-sans antialiased overflow-x-hidden">
      <RoadmapHeader />

      <main className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div
          className="lg:col-span-3 bg-[#111625]/40 border border-zinc-800/60 rounded-xl p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 relative"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px] pointer-events-none z-0" />

          <div className="w-350 h-112.5 relative mt-10 z-10">
            <div className="absolute -top-7.5 left-2">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                {activeRoadmap?.title || "Lộ trình học cá nhân hóa"}
              </h2>
            </div>

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
                Đang tải roadmap...
              </div>
            )}

            {!isLoading && loadError && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-red-400">
                {loadError}
              </div>
            )}

            {!isLoading && !loadError && stepsData.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-sm text-zinc-400">
                  Chưa có roadmap active hoặc roadmap chưa có node bài tập.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/assessment")}
                  className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
                >
                  Làm assessment để tạo roadmap
                </button>
              </div>
            )}

            {stepsData.map((step, index) => {
              if (index === stepsData.length - 1) return null;

              const nextStep = stepsData[index + 1];

              return (
                <Connector
                  key={`line-${step.id}-${nextStep.id}`}
                  status={nextStep.status}
                  x1={step.x}
                  y1={step.y}
                  x2={nextStep.x}
                  y2={nextStep.y}
                />
              );
            })}

            {stepsData.map((step) => (
              <div
                key={step.challengeId}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${step.x}%`, top: `${step.y}%` }}
              >
                <Node
                  title={step.title}
                  xp={step.xp}
                  status={step.status}
                  isActive={activeNodeId === step.id}
                  onClick={() => handleOpenNode(step)}
                  onMouseEnter={(e) => {
                    setPreviewData({
                      title: step.title,
                      concept: step.concept,
                      difficulty: step.difficulty,
                    });
                    setMousePos({ x: e.clientX, y: e.clientY });
                    setShowPreview(true);
                  }}
                  onMouseMove={(e) => {
                    setMousePos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => {
                    setShowPreview(false);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <RoadmapSidebar node={activeNode} />
        </div>
      </main>

      {previewData && (
        <Preview
          title={previewData.title}
          conceptText={previewData.concept}
          difficulty={previewData.difficulty}
          x={mousePos.x}
          y={mousePos.y}
          visible={showPreview}
        />
      )}

      <footer className="max-w-7xl mx-auto px-6 md:px-8 pb-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          variant="solved"
          icon={<CheckCircle2 fill="currentColor" />}
          value={`${completedCount}`}
          label="Chủ đề đã hoàn thành"
          subText={
            stepsData.length > 0
              ? `${stepsData.length - completedCount} bài còn lại`
              : "Chưa có dữ liệu"
          }
          subColor="text-emerald-400/80"
        />

        <StatCard
          variant="xp"
          icon={<Compass />}
          value={`${progressPercent}%`}
          label="Tiến độ lộ trình hiện tại"
          subText={activeRoadmap?.title || "Roadmap cá nhân hóa"}
          subColor="text-blue-400/80"
        />

        <StatCard
          variant="level"
          icon={<Award />}
          value={activeRoadmap?.generationParams?.detectedLevel || "N/A"}
          label="Trình độ hiện tại"
          subText=""
          progress={progressPercent}
        />
      </footer>
    </div>
  );
}
