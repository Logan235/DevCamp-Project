import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import SidebarTask from "./SidebarTask";
import CodeEditor from "./CodeEditor";
import ConsoleOutput from "./ConsoleOutput";
import { CodeHeader } from "./CodeHeader";
import { INITIAL_CODE } from "./constants";
import {
  chatAiMirrorApi,
  getSubmissionDetailApi,
  runExerciseApi,
  submitExerciseApi,
  getExerciseByIdApi,
  completeRoadmapChallengeApi,
} from "../api";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type SubmissionStatus = "pending" | "running" | "success" | "error" | string;

type SubmissionDetail = {
  _id: string;
  status?: SubmissionStatus;
  output?: string;
  error?: string;
  statusCode?: number;
  runtime?: number;
};

type AiMirrorMessage = {
  role: "user" | "assistant";
  content: string;
};

type RoadmapCompletion = {
  completedNodes?: number;
  totalNodes?: number;
  isRoadmapCompleted?: boolean;
  currentNode?: {
    title?: string;
    isCompleted?: boolean;
  };
  nextChallengeInNodeId?: string;
  nextNodeChallengeId?: string;
};

const FINAL_SUBMISSION_STATUSES = new Set([
  "success",
  "wrong_answer",
  "compile_error",
  "runtime_error",
  "time_limit_exceeded",
  "error",
  "failed",
]);
const POLL_INTERVAL_MS = 1200;
const MAX_POLL_ATTEMPTS = 15;

function formatSubmissionOutput(submission: SubmissionDetail) {
  const lines = [
    `Status: ${submission.status || "unknown"}`,
    submission.statusCode !== undefined
      ? `Exit code: ${submission.statusCode}`
      : "",
    submission.runtime !== undefined ? `Runtime: ${submission.runtime} ms` : "",
    submission.output ? `\nOutput:\n${submission.output}` : "",
    submission.error ? `\nError:\n${submission.error}` : "",
  ].filter(Boolean);

  return lines.join("\n");
}

function isMongoObjectId(value?: string) {
  return Boolean(value && /^[a-f\d]{24}$/i.test(value));
}

export const CodeLayout: React.FC = () => {
  const { challengeId } = useParams();
  const isValidChallengeId = isMongoObjectId(challengeId);
  const navigate = useNavigate();

  const [language, setLanguage] = useState<string>("cpp");
  const [code, setCode] = useState<string>(INITIAL_CODE.cpp);
  const [output, setOutput] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [latestSubmissionId, setLatestSubmissionId] = useState<string>();
  const [, setSubmissionStatus] = useState<SubmissionStatus>();
  const [aiInput, setAiInput] = useState<string>("");
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [exercise, setExercise] = useState<any>(null);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [exerciseError, setExerciseError] = useState("");
  const [unlockAIMirror, setUnlockAIMirror] = useState<boolean>(false);
  const [roadmapCompletion, setRoadmapCompletion] =
    useState<RoadmapCompletion | null>(null);

  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);

  const [, setHasRunCode] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<AiMirrorMessage[]>([
    {
      role: "assistant",
      content:
        "Mình là AI Mirror. Hãy submit code trước, sau đó hỏi mình phân tích tư lưu, lỗi sai hoặc hướng tối ưu nhé.",
    },
  ]);

  useEffect(() => {
    setExercise(null);
    setExerciseError("");
    setOutput("");
    setIsError(false);
    setIsPassed(false);
    setLatestSubmissionId(undefined);
    setSubmissionStatus(undefined);
    setHasRunCode(false);
    setRoadmapCompletion(null);

    if (!challengeId) {
      setExerciseError("Thiếu challengeId trên URL.");
      return;
    }

    if (!isValidChallengeId) {
      setExerciseError(
        `challengeId "${challengeId}" không hợp lệ. Hãy mở bài từ Roadmap để dùng MongoDB ObjectId thật.`,
      );
      return;
    }

    async function loadExercise() {
      try {
        setExerciseLoading(true);
        const data = await getExerciseByIdApi(challengeId!);
        setExercise(data);
      } catch (error: any) {
        console.error("Failed to load exercise:", error);
        setExerciseError(
          error.response?.data?.message ||
            "Failed to load exercise. Please check the backend, token, challengeId, or Redis.",
        );
      } finally {
        setExerciseLoading(false);
      }
    }

    void loadExercise();
  }, [challengeId, isValidChallengeId]);

  const canAskAi = useMemo(
    () => unlockAIMirror && Boolean(latestSubmissionId),
    [unlockAIMirror, latestSubmissionId],
  );

  const handleLanguageChange = (selectedLang: string) => {
    setLanguage(selectedLang);
    setCode(INITIAL_CODE[selectedLang] || "");
  };

  const handleResetCode = () => {
    setCode(INITIAL_CODE[language] || "");
    setOutput("");
    setIsError(false);
    setIsPassed(false);
    setSubmissionStatus(undefined);
    setUnlockAIMirror(false);
  };

  const pollSubmissionResult = async (
    submissionId: string,
    options: { silent?: boolean } = {},
  ) => {
    for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt += 1) {
      const submission = await getSubmissionDetailApi(submissionId);
      const status = submission.status || "pending";

      if (!options.silent) {
        setSubmissionStatus(status);
        setOutput(formatSubmissionOutput(submission));
        setIsError(
          status !== "pending" && status !== "running" && status !== "success",
        );
        setIsPassed(status === "success");
      }

      if (FINAL_SUBMISSION_STATUSES.has(status)) {
        return submission;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    if (!options.silent) {
      setOutput(
        (currentOutput) =>
          `${currentOutput}\n\nSubmission is still processing. Please check again later.`,
      );
    }

    throw new Error(
      `Submission ${submissionId} is still processing after ${MAX_POLL_ATTEMPTS} attempts.`,
    );
  };

  const handleSubmitCode = async () => {
    if (!challengeId) {
      setOutput("Challenge ID not found.");
      setIsError(true);
      return;
    }

    if (!isValidChallengeId) {
      setOutput(
        `Invalid challengeId "${challengeId}". Please open the exercise from Roadmap to use a valid MongoDB ObjectId.`,
      );
      setIsError(true);
      return;
    }

    try {
      setIsRunning(true);
      setIsError(false);
      setIsPassed(false);
      setSubmissionStatus("pending");
      setOutput("Submitting code to all test cases...");

      let result;

      try {
        result = await submitExerciseApi(challengeId, {
          language,
          code,
        });
      } catch (submitError: any) {
        console.error("Submit request failed:", {
          status: submitError.response?.status,
          data: submitError.response?.data,
          message: submitError.message,
        });

        throw new Error(
          [
            "Submit request failed.",
            submitError.response?.status
              ? `HTTP status: ${submitError.response.status}`
              : "",
            submitError.response?.data?.message ||
              submitError.response?.data?.error ||
              submitError.message,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }

      const submissionIds = (result.testCaseSubmissionIds || []).map(String);
      const firstSubmissionId = submissionIds[0];

      if (!firstSubmissionId) {
        throw new Error(
          `Backend did not return testCaseSubmissionIds. Response: ${JSON.stringify(
            result,
          )}`,
        );
      }

      setLatestSubmissionId(firstSubmissionId);
      setHasRunCode(true);

      setOutput(
        `Submit queued.\nTest cases: ${submissionIds.length}\nWaiting for results...`,
      );

      let results;

      try {
        results = await Promise.all(
          submissionIds.map((submissionId: string) =>
            pollSubmissionResult(submissionId, { silent: true }),
          ),
        );
      } catch (pollError: any) {
        console.error("Polling submission failed:", {
          status: pollError.response?.status,
          data: pollError.response?.data,
          message: pollError.message,
        });

        throw new Error(
          [
            "Submit was queued, but polling result failed.",
            pollError.response?.status
              ? `HTTP status: ${pollError.response.status}`
              : "",
            pollError.response?.data?.message ||
              pollError.response?.data?.error ||
              pollError.message,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      }

      const completedResults = results.filter(Boolean) as SubmissionDetail[];

      const aiTargetSubmission =
        completedResults.find(
          (submission) => submission.status !== "success",
        ) || completedResults[0];

      if (aiTargetSubmission?._id) {
        setLatestSubmissionId(aiTargetSubmission._id);
      }

      const passedCount = completedResults.filter(
        (submission) => submission.status === "success",
      ).length;

      const allPassed =
        completedResults.length === submissionIds.length &&
        passedCount === submissionIds.length;

      setIsPassed(allPassed);
      setIsError(!allPassed);
      setSubmissionStatus(allPassed ? "success" : "wrong_answer");

      let completion: RoadmapCompletion | null = null;

      if (allPassed && isValidChallengeId && challengeId) {
        try {
          completion = await completeRoadmapChallengeApi(
            challengeId,
            submissionIds,
          );
          setRoadmapCompletion(completion);
        } catch (completionError: any) {
          console.error("Failed to update roadmap completion:", {
            status: completionError.response?.status,
            data: completionError.response?.data,
            message: completionError.message,
          });
        }
      }

      setOutput(
        [
          `Submit finished: ${passedCount}/${submissionIds.length} test cases passed.`,
          allPassed && completion
            ? `Roadmap updated: ${completion.completedNodes || 0}/${completion.totalNodes || 0} node completed.`
            : "",
          "",
          ...completedResults.map(
            (submission, index) =>
              `Test ${index + 1}: ${submission.status}` +
              (submission.error ? `\n${submission.error}` : ""),
          ),
          "",
          "Bạn có thể hỏi AI Mirror để phân tích submission đầu tiên hoặc lỗi sai mới nhất.",
        ].join("\n"),
      );
    } catch (error: any) {
      console.error("Submit flow failed:", error);

      setOutput(
        error.message ||
          "Submit failed. Please check backend logs for submit or polling errors.",
      );

      setIsError(true);
      setIsPassed(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCode = async () => {
    if (!challengeId) {
      setOutput("Challenge ID not found.");
      setIsError(true);
      return;
    }

    if (!isValidChallengeId) {
      setOutput(
        `Invalid challengeId "${challengeId}". Please open the exercise from Roadmap to use a valid MongoDB ObjectId.`,
      );
      setIsError(true);
      return;
    }

    try {
      setIsRunning(true);
      setIsError(false);
      setIsPassed(false);
      setSubmissionStatus("pending");
      setOutput("Running code with the local C++ engine...");

      const result = await runExerciseApi(challengeId, {
        language,
        code,
        stdin: exercise?.examples?.[0]?.input || "",
      });

      setUnlockAIMirror(true);
      setLatestSubmissionId(result.submissionId);
      setHasRunCode(true);

      setOutput(
        `Run queued. Submission ID: ${result.submissionId}\nWaiting for result...`,
      );

      await pollSubmissionResult(result.submissionId);
    } catch (error: any) {
      console.error("Submit error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      setOutput(
        [
          "Submit failed.",
          backendMessage ? `Reason: ${backendMessage}` : "",
          error.response?.status ? `HTTP status: ${error.response.status}` : "",
          "Please check backend console for /exercises/:id/submit.",
        ]
          .filter(Boolean)
          .join("\n"),
      );

      setIsError(true);
      setIsPassed(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSendAiMessage = async () => {
    if (!unlockAIMirror) return;
    const message = aiInput.trim();

    if (!message || !canAskAi) return;
    try {
      setIsAiThinking(true);
      setAiInput("");

      setAiMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "user",
          content: message,
        },
      ]);

      const result = await chatAiMirrorApi({
        message,
        challengeId: isValidChallengeId ? challengeId : undefined,
        submissionId: latestSubmissionId,
        includeLatestSubmission: true,
      });

      const analysis = result.analysis;

      const analysisSummary = analysis
        ? [
            analysis.thinkingScore !== undefined
              ? `\n\nThinking score: ${analysis.thinkingScore}`
              : "",
            analysis.strengths?.length
              ? `\nStrengths: ${analysis.strengths.join(", ")}`
              : "",
            analysis.weaknesses?.length
              ? `\nWeaknesses: ${analysis.weaknesses.join(", ")}`
              : "",
            analysis.followUpQuestions?.length
              ? `\nFollow-up: ${analysis.followUpQuestions.join(" | ")}`
              : "",
            analysis.codeScore !== undefined
              ? `\nCode score: ${analysis.codeScore}/100`
              : "",
            analysis.verdict ? `\nVerdict: ${analysis.verdict}` : "",
            analysis.nextActions?.length
              ? `\nNext actions: ${analysis.nextActions.join(" | ")}`
              : "",
          ].join("")
        : "";

      setAiMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: `${result.reply}${analysisSummary}`,
        },
      ]);
    } catch (error: any) {
      console.error("AI Mirror request failed:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "AI Mirror chưa phản hồi được.";

      setAiMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: `AI Mirror chưa phản hồi được.\n\nLý do: ${backendMessage}`,
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const nextExerciseId =
    roadmapCompletion?.nextChallengeInNodeId ||
    roadmapCompletion?.nextNodeChallengeId;

  const completionMessage = roadmapCompletion
    ? roadmapCompletion.isRoadmapCompleted
      ? "Bạn đã hoàn thành toàn bộ roadmap này."
      : roadmapCompletion.currentNode?.isCompleted
        ? "Node hiện tại đã hoàn thành. Roadmap đã mở node tiếp theo."
        : "Bài này đã hoàn thành. Bạn có thể làm bài tiếp theo trong cùng node."
    : undefined;

  const nextExerciseLabel = roadmapCompletion?.nextChallengeInNodeId
    ? "Làm bài tiếp theo trong node"
    : "Đến bài đầu tiên của node tiếp theo";

  const renderAiChat = () => (
    <div className="flex flex-col h-full bg-(--bg-header)">
      <div className="h-12 px-4 border-b border-(--border-main) flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-(--text-main)">AI Mirror</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiOpen(false)}
            className="xl:hidden text-(--text-muted) hover:text-(--text-main) p-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {aiMessages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
              message.role === "user"
                ? "ml-6 bg-(--bg-chat-bubble-user) border border-(--border-user-sub) text-(--text-chat-bubble-user)"
                : "mr-6 bg-(--bg-chat-bubble-ai) border border-(--border-sub) text-(--text-sub)"
            }`}
          >
            {message.role === "user" ? (
              message.content
            ) : (
              <div
                className="prose prose-xs max-w-none dark:prose-invert
                  [&_strong]:text-emerald-600
                  dark:[&_strong]:text-emerald-400
                  [&_strong]:font-bold
                  [&_ul]:list-disc
                  [&_ul]:ml-4
                  [&_li]:mt-1"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {message.content || ""}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}

        {isAiThinking && (
          <div className="mr-6 rounded-xl px-3 py-2 text-xs text-(--text-muted) bg-(--bg-chat-bubble-ai) border border-(--border-sub)">
            AI Mirror đang phân tích...
          </div>
        )}
      </div>

      <div className="border-t border-(--border-main) p-3 space-y-2 shrink-0 bg-(--bg-header)">
        {!latestSubmissionId && (
          <p className="text-[11px] text-red-500">
            Bạn phải Run code trước khi hỏi AI Mirror
          </p>
        )}

        <textarea
          value={aiInput}
          onChange={(event) => setAiInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSendAiMessage();
            }
          }}
          placeholder="Nhập câu hỏi cho AI Mirror..."
          className="h-20 w-full resize-none rounded-lg border border-(--border-main)] bg-(--bg-main)] p-2 text-xs text-(--text-main)] outline-none placeholder:text-(--text-placeholder) focus:border-blue-500/60"
          disabled={isAiThinking || !unlockAIMirror}
        />

        <button
          type="button"
          onClick={handleSendAiMessage}
          disabled={
            !unlockAIMirror || !aiInput.trim() || isAiThinking || !canAskAi
          }
          className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white! transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-(--bg-toggle-disabled)] disabled:text-(--text-toggle-disabled)]"
        >
          {isAiThinking ? "Đang hỏi AI..." : "Gửi"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full flex flex-col bg-(--bg-main) overflow-hidden relative">
      <CodeHeader />

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-14 overflow-y-auto xl:overflow-hidden p-2 gap-2">
        <div className="xl:col-span-3 bg-(--bg-main) border border-(--border-main) rounded-xl overflow-hidden flex flex-col h-75 xl:h-full">
          <SidebarTask
            exercise={exercise}
            isLoading={exerciseLoading}
            error={exerciseError}
          />
        </div>

        <div className="xl:col-span-8 flex flex-col h-162.5 xl:h-full overflow-hidden gap-2">
          <div className="flex-1 min-h-0">
            <CodeEditor
              language={language}
              code={code}
              onCodeChange={setCode}
              onLanguageChange={handleLanguageChange}
              onResetCode={handleResetCode}
              onRunCode={handleRunCode}
              onSubmitCode={handleSubmitCode}
              isRunning={isRunning}
            />
          </div>

          <div className="h-56 shrink-0 border border-(--border-main) rounded-xl overflow-hidden">
            <ConsoleOutput
              output={output}
              isError={isError}
              isRunning={isRunning}
              isPassed={isPassed}
              onRunCode={handleRunCode}
              onSubmitCode={handleSubmitCode}
              onBackToRoadmap={() => navigate("/roadmap")}
              onNextExercise={
                nextExerciseId
                  ? () => navigate(`/lesson/${nextExerciseId}`)
                  : undefined
              }
              nextExerciseLabel={nextExerciseLabel}
              completionMessage={completionMessage}
            />
          </div>
        </div>

        <aside className="hidden xl:flex xl:col-span-3 bg-(--bg-header) border border-(--border-main) rounded-xl overflow-hidden flex-col min-h-0">
          {renderAiChat()}
        </aside>
      </div>

      <button
        onClick={() => setIsAiOpen(true)}
        className="xl:hidden fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 transition-all active:scale-95 border border-blue-400/20"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {isAiOpen && (
        <>
          <div
            className="xl:hidden fixed inset-0 bg-black/60 z-40 transition-opacity"
            onClick={() => setIsAiOpen(false)}
          />
          <div className="xl:hidden fixed bottom-0 right-0 left-0 md:left-auto md:w-100 h-125 md:h-150 bg-(--bg-header) border-t md:border-l border-(--border-main) rounded-t-2xl md:rounded-tr-none md:rounded-l-2xl shadow-2xl z-50 overflow-hidden flex flex-col transition-transform animate-in slide-in-from-bottom duration-200">
            {renderAiChat()}
          </div>
        </>
      )}
    </div>
  );
};

export default CodeLayout;
