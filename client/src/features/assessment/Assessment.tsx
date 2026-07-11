import { ArrowLeft, ArrowRight, Star, Target, Timer, Zap } from "lucide-react";
import { NavBar } from "../NavBar";
import Navigator from "./Navigator";
import { useEffect, useState } from "react";
import Question from "./Question";
import { Button } from "../../components/common/Button";
import Confirm from "./Confirm";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Badge } from "../../components/common/Badge";
import type { QuestionItem, OptionItem } from "./Question";
import { getAssessmentQuestionsApi, submitAssessmentApi } from "./api";
import { getMyRoadmapsApi } from "../roadmap/api";
import { useSelector } from "react-redux";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

function normalizeOption(option: any, optionIndex: number): OptionItem {
  if (typeof option === "string") {
    return {
      id: optionLabels[optionIndex] || String(optionIndex + 1),
      text: option,
    };
  }

  return {
    id:
      option?.id ||
      option?.key ||
      option?.value ||
      optionLabels[optionIndex] ||
      String(optionIndex + 1),
    text:
      option?.text || option?.label || option?.content || option?.value || "",
  };
}

function normalizeQuestion(q: any, index: number): QuestionItem {
  const rawType = q?.type || q?.questionType || q?.challengeType;

  return {
    id: Number(q?.id || q?.order) || index + 1,
    level: q?.level || q?.difficulty || "Dễ",
    title: q?.input || q?.title || q?.question || q?.content || "No title",
    code: q?.code || q?.snippet || "",
    type: rawType === "essay" ? "essay" : "multiple-choice",
    category: q?.category || q?.categoryId || q?.skillSlug || "Assessment",
    options: Array.isArray(q?.options)
      ? q.options.map((option: any, optionIndex: number) =>
          normalizeOption(option, optionIndex),
        )
      : [],
  };
}

function getAnswerValue(question: QuestionItem, answer: string) {
  if (question.type === "essay") {
    return answer || "";
  }

  return answer || "";
}

export default function Asssessment() {
  const { user, isLoggedIn } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const { challengeId: assessmentIdFromParams } = useParams();
  const [searchParams] = useSearchParams();

  const routeAssessmentId =
    assessmentIdFromParams ||
    searchParams.get("assessmentId") ||
    searchParams.get("challengeId") ||
    "";

  const [assessmentId, setAssessmentId] = useState("");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [currentQuest, setCurrentQuest] = useState(1);
  const [ans, setAns] = useState<Record<number, string>>({});
  const [quest, setQuest] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [flag, setFlag] = useState<number[]>([]);
  const [showConfirm, setshowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answeredCount = Object.keys(ans).filter((questionId) => {
    const answer = ans[Number(questionId)];
    return answer !== undefined && answer !== "";
  }).length;

  const XP = 50 * answeredCount;
  const totalquest = quest.length;
  const activeQuest = quest[currentQuest - 1];
  const isCompleted = totalquest > 0 && answeredCount === totalquest;

  const mapLevelToNumber = (levelStr: string): number => {
    switch (levelStr?.toLowerCase()) {
      case "beginner":
        return 1;
      case "intermediate":
        return 2;
      case "advanced":
        return 3;
      default:
        return 1;
    }
  };
  
  const handleFlag = (id: number) => {
    setFlag((prev) => {
      if (prev.includes(id)) {
        return prev.filter((questId) => questId !== id);
      }

      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (!assessmentId) {
      alert(
        "Thiếu assessmentId nên chưa thể nộp bài. Hãy kiểm tra API /assessment/questions có trả assessmentId hay không.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const userCodeOutput = quest.map((question) =>
        getAnswerValue(question, ans[question.id] || ""),
      );

      const payload = {
        assessmentId,
        userCodeOutput,
      };

      setshowConfirm(false);

      const result = await submitAssessmentApi(payload);

      navigate("/result", {
        state: {
          ...result,
          XP,
          assessmentTitle,
        },
      });
    } catch (error: any) {
      console.error("Lỗi khi nộp assessment:", error);
      alert(
        error.response?.data?.message ||
          "Không thể nộp assessment. Hãy kiểm tra token, backend hoặc assessmentId.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (answer: string) => {
    if (!activeQuest) return;

    setAns((prev) => ({
      ...prev,
      [activeQuest.id]: answer,
    }));
  };

  const handlePrev = () => {
    if (currentQuest > 1) {
      setCurrentQuest((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuest < totalquest) {
      setCurrentQuest((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const fetchQuest = async () => {
      try {
        setLoading(true);
        setLoadError(false);
        setLoadErrorMessage("");

        if (!routeAssessmentId) {
          const roadmaps = await getMyRoadmapsApi();

          const existingRoadmap = Array.isArray(roadmaps)
            ? roadmaps.find(
                (roadmap: any) =>
                  roadmap.status === "active" || roadmap.status === "completed",
              )
            : null;

          if (existingRoadmap) {
            navigate("/roadmap", { replace: true });
            return;
          }
        }

        const data = routeAssessmentId
          ? await getAssessmentQuestionsApi(routeAssessmentId)
          : await getAssessmentQuestionsApi();

        const rawQuestions = Array.isArray(data)
          ? data
          : data?.questions || data?.data || [];

        const formattedQuest = rawQuestions.map((q: any, index: number) =>
          normalizeQuestion(q, index),
        );

        setAssessmentId(String(data?.assessmentId || routeAssessmentId || ""));
        setAssessmentTitle(data?.title || "CodeQuest Assessment");
        setQuest(formattedQuest);
        setCurrentQuest(1);
        setAns({});
        setFlag([]);
      } catch (error: any) {
        console.error("Lỗi khi tải câu hỏi:", error);
        setLoadError(true);
        setLoadErrorMessage(
          error.response?.data?.message ||
            "Không thể tải assessment. Hãy kiểm tra backend /assessment/questions và collection assessments.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchQuest();
  }, [routeAssessmentId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#050b17] text-white">
        <div className="animate-pulse text-slate-400">
          Đang tải CodeQuest cho bạn...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full min-h-screen flex flex-col gap-5 items-center justify-center bg-[#050b17] px-5">
        <Badge variant="error">Error when loading assessment.</Badge>
        <p className="max-w-xl text-center text-sm text-slate-400">
          {loadErrorMessage}
        </p>
        <Button variant="secondary" onClick={() => navigate("/login")}>
          Quay lại đăng nhập
        </Button>
      </div>
    );
  }

  if (quest.length === 0 || !activeQuest) {
    return (
      <div className="w-full min-h-screen flex flex-col gap-5 items-center justify-center bg-[#050b17] text-slate-400">
        <p>Assessment hiện chưa có câu hỏi.</p>
        <p className="text-sm text-slate-500">
          Hãy kiểm tra document trong collection assessments có field questions
          hay chưa.
        </p>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return <NavBar isLoggedIn={false} />;
  }

  return (
    <div className="w-full mx-auto min-h-screen flex flex-col bg-[#050b17]">
      <NavBar
        variant="quiz"
        totalquest={totalquest}
        answeredCount={answeredCount}
        isLoggedIn={true}
        userName={user.displayName || user.email}
        role={user.role}
        currentLevel={mapLevelToNumber(user.currentLevel)}
        xpTotal={user.xpTotal || 0}
        userAvatar={user.avatar}
      />

      <main className="m-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-5 lg:p-5">
        <div className="flex flex-col gap-6 rounded-3xl border border-[#18263d] bg-[radial-gradient(circle_at_center,#0b2530_0%,#060f1d_100%)] p-6 shadow-[0_0_60px_rgba(59,130,246,0.08)] sm:p-8 lg:flex-row lg:items-center lg:gap-10 lg:p-14">
          <div className="w-full text-left lg:w-[55%]">
            <h1 className="mb-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Khám phá trình độ lập trình của bạn
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              {assessmentTitle ||
                "Trả lời một vài câu hỏi DSA và giải thuật để nhận được một lộ trình học tập cá nhân tạo bởi AI."}
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 lg:w-[45%] lg:grid-cols-1">
            <div className="min-w-0 rounded-3xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-lg transition-all duration-300 hover:border-[#3b82f6]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#13294b]">
                <Timer className="text-[#60a5fa]" />
              </div>
              <div className="text-2xl font-bold text-white">10-15</div>
              <div className="text-sm text-slate-400">phút hoàn thành</div>
            </div>

            <div className="min-w-0 rounded-3xl border border-[#1e293b] bg-[#0f172a] p-5 shadow-lg transition-all duration-300 hover:border-[#c084fc]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2a163d]">
                <Target className="text-[#c084fc]" />
              </div>
              <div className="text-2xl font-bold text-white">Adaptive</div>
              <div className="text-sm text-slate-400">Độ khó thích ứng</div>
            </div>

            <div className="min-w-0 rounded-3xl border border-[#1e3a2a] bg-[#0f172a] p-5 shadow-lg transition-all duration-300 hover:border-[#22c55e]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14532d]">
                <Zap className="text-[#22c55e]" />
              </div>
              <div className="text-3xl font-bold text-[#4ade80]">+500 XP</div>
              <div className="text-sm text-slate-400">
                Phần thưởng hoàn thành
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:items-start">
          <div className="w-full min-w-0 rounded-2xl bg-linear-to-r from-[#2783ff] to-[#1fc366] pt-1">
            <div className="p-8 bg-[#0a101f] rounded-t-2xl flex flex-col gap-5">
              <Question
                selectedAns={ans[activeQuest.id] || ""}
                activeQuest={activeQuest}
                handleNext={handleNext}
                handleSelect={handleSelect}
                currentQuest={currentQuest}
                flag={flag.includes(activeQuest.id)}
                setFlag={() => handleFlag(activeQuest.id)}
              />

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
                <Button
                  variant="normal"
                  onClick={handlePrev}
                  disabled={currentQuest === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Câu trước
                </Button>

                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={currentQuest === totalquest}
                  className="gap-2"
                >
                  Câu tiếp
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div
              className="
                bg-[#0f172a]
                border border-[#1e293b]
                rounded-2xl
                p-5
                flex
                flex-col
                gap-5
              "
            >
              <div className="flex items-center gap-3">
                <Star className="text-[#facc15]" />
                <div>
                  <h2 className="font-bold text-white">Tiến độ assessment</h2>
                  <p className="text-sm text-slate-400">
                    {answeredCount}/{totalquest} câu đã trả lời
                  </p>
                </div>
              </div>

              <Navigator
                totalquest={totalquest}
                currentQuest={currentQuest}
                setCurrentQuest={setCurrentQuest}
                ans={ans}
                flag={flag}
              />

              <Button
                variant="success"
                disabled={!isCompleted || isSubmitting}
                onClick={() => setshowConfirm(true)}
                className="w-full"
              >
                {isSubmitting
                  ? "Đang nộp..."
                  : isCompleted
                    ? "Hoàn thành assessment"
                    : "Trả lời hết câu hỏi để nộp"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Confirm
        showConfirm={showConfirm}
        setshowConfirm={setshowConfirm}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
