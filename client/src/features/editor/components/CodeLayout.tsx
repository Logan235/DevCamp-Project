import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router";
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
} from "../api";
import { AIChatbot } from "./AIChatbot";

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

const FINAL_SUBMISSION_STATUSES = new Set([
  "success",
  "wrong_answer",
  "compile_error",
  "runtime_error",
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

export const CodeLayout: React.FC = () => {
  const { challengeId } = useParams();

  const [language, setLanguage] = useState<string>("cpp");
  const [code, setCode] = useState<string>(INITIAL_CODE.cpp);
  const [output, setOutput] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [latestSubmissionId, setLatestSubmissionId] = useState<string>();
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>();
  const [aiInput, setAiInput] = useState<string>("");
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [exercise, setExercise] = useState<any>(null);
  const [hasRunCode, setHasRunCode] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<AiMirrorMessage[]>([
    {
      role: "assistant",
      content:
        "Mình là AI Mirror. Hãy submit code trước, sau đó hỏi mình phân tích tư duy, lỗi sai hoặc hướng tối ưu nhé.",
    },
  ]);

  useEffect(() => {
    if (!challengeId) return;
  });
  const canAskAi = useMemo(
    () => Boolean(challengeId || latestSubmissionId),
    [challengeId, latestSubmissionId],
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

    return null;
  };

  const handleSubmitCode = async () => {
    if (!challengeId) {
      setOutput("Challenge ID not found.");
      setIsError(true);
      return;
    }

    try {
      setIsRunning(true);
      setIsError(false);
      setIsPassed(false);
      setSubmissionStatus("pending");
      setOutput("Submitting code to all test cases...");

      const result = await submitExerciseApi(challengeId, {
        language,
        code,
      });

      const submissionIds = (result.testCaseSubmissionIds || []).map(String);
      const firstSubmissionId = submissionIds[0];

      if (!firstSubmissionId) {
        throw new Error("No submission IDs returned from backend");
      }

      setLatestSubmissionId(firstSubmissionId);
      setHasRunCode(true);

      setOutput(
        `Submit queued.\nTest cases: ${submissionIds.length}\nFirst submission ID: ${firstSubmissionId}\n\nWaiting for results...`,
      );

      const results = await Promise.all(
        submissionIds.map((submissionId) =>
          pollSubmissionResult(submissionId, { silent: true }),
        ),
      );

      const completedResults = results.filter(Boolean) as SubmissionDetail[];

      const passedCount = completedResults.filter(
        (submission) => submission.status === "success",
      ).length;

      const allPassed =
        completedResults.length === submissionIds.length &&
        passedCount === submissionIds.length;

      setIsPassed(allPassed);
      setIsError(!allPassed);
      setSubmissionStatus(allPassed ? "success" : "wrong_answer");

      setOutput(
        [
          `Submit finished: ${passedCount}/${submissionIds.length} test cases passed.`,
          "",
          ...completedResults.map(
            (submission, index) =>
              `Test ${index + 1}: ${submission.status} (${submission._id})` +
              (submission.error ? `\n${submission.error}` : ""),
          ),
          "",
          "Bạn có thể hỏi AI Mirror để phân tích submission đầu tiên hoặc lỗi sai mới nhất.",
        ].join("\n"),
      );
    } catch (error) {
      console.error(error);
      setOutput(
        "Submit failed. Please check the backend, token, challengeId, Redis, or local g++.",
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

    try {
      setIsRunning(true);
      setIsError(false);
      setIsPassed(false);
      setSubmissionStatus("pending");
      setOutput("Running code with the local C++ engine...");

      const result = await runExerciseApi(challengeId, {
        language,
        code,
        stdin: "",
      });

      setLatestSubmissionId(result.submissionId);
      setHasRunCode(true);

      setOutput(
        `Run queued.\nSubmission ID: ${result.submissionId}\n\nWaiting for result...`,
      );

      await pollSubmissionResult(result.submissionId);
    } catch (error) {
      console.error(error);
      setOutput("Run failed. Local engine currently supports C++ only.");
      setIsError(true);
      setIsPassed(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSendAiMessage = async () => {
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
        challengeId,
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
    } catch (error) {
      console.error(error);

      setAiMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            "AI Mirror chưa phản hồi được. Hãy kiểm tra token, GEMINI_API_KEY hoặc backend /ai-mirror/chat.",
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#050816] overflow-hidden relative">
      {" "}
      {/* Thêm relative ở đây để button chat căn góc đúng vị trí */}
      <CodeHeader />
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden p-2 gap-2">
        <div className="xl:col-span-3 bg-[#050816] border border-zinc-900 rounded-xl overflow-hidden flex flex-col h-full">
          <SidebarTask />
        </div>

        <div className="xl:col-span-6 flex flex-col h-full overflow-hidden gap-2">
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

          <div className="h-56 shrink-0 border border-[#050816] rounded-xl overflow-hidden">
            <ConsoleOutput
              output={output}
              isError={isError}
              isRunning={isRunning}
              isPassed={isPassed}
              onRunCode={handleRunCode}
              onSubmitCode={handleSubmitCode}
            />
          </div>
        </div>

        <aside className="xl:col-span-3 bg-[#090d16] border border-zinc-900 rounded-xl overflow-hidden flex flex-col min-h-0">
          <div className="h-12 px-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">AI Mirror</h2>
              <p className="text-[11px] text-zinc-500">
                {latestSubmissionId
                  ? `Submission: ${latestSubmissionId.slice(-8)}`
                  : submissionStatus
                    ? `Status: ${submissionStatus}`
                    : "Phân tích tư duy từ bài submit"}
              </p>
            </div>

            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              Mirror
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {aiMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                  message.role === "user"
                    ? "ml-6 bg-blue-500/15 border border-blue-500/20 text-blue-100"
                    : "mr-6 bg-zinc-900/80 border border-zinc-800 text-zinc-200"
                }`}
              >
                {message.content}
              </div>
            ))}

            {isAiThinking && (
              <div className="mr-6 rounded-xl px-3 py-2 text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800">
                AI Mirror đang phân tích...
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800 p-3 space-y-2">
            {!latestSubmissionId && (
              <p className="text-[11px] text-amber-300/80">
                Nên submit code trước để AI Mirror có đủ code, output và lỗi khi
                phân tích.
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
              placeholder="Hỏi AI Mirror: code của tôi sai ở đâu, tư duy tối ưu thế nào...?"
              className="h-20 w-full resize-none rounded-lg border border-zinc-800 bg-[#050816] p-2 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-blue-500/60"
              disabled={isAiThinking}
            />

            <button
              type="button"
              onClick={handleSendAiMessage}
              disabled={!aiInput.trim() || isAiThinking || !canAskAi}
              className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isAiThinking ? "Đang hỏi AI..." : "Gửi cho AI Mirror"}
            </button>
          </div>
        </aside>
      </div>
      <AIChatbot hasRunCode={hasRunCode} />
    </div>
  );
};

export default CodeLayout;
