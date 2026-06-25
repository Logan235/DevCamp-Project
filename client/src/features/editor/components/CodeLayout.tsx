import React, { useEffect, useState } from "react";
import SidebarTask from "./SidebarTask";
import CodeEditor from "./CodeEditor";
import ConsoleOutput from "./ConsoleOutput";
import { CodeHeader } from "./CodeHeader";
import { INITIAL_CODE } from "./constants";
import { useParams } from "react-router";
import { getExerciseByIdApi, submitExerciseApi } from "../api";

export const CodeLayout: React.FC = () => {
  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState<string>(INITIAL_CODE.javascript);
  const [output, setOutput] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const { challengeId } = useParams();
  const [exercise, setExercise] = useState<any>(null);

  useEffect(() => {
    if (!challengeId) return;

    getExerciseByIdApi(challengeId).then(setExercise).catch(console.error);
  }, [challengeId]);

  const handleLanguageChange = (selectedLang: string) => {
    setLanguage(selectedLang);
    setCode(INITIAL_CODE[selectedLang]);
  };

  const handleResetCode = () => {
    setCode(INITIAL_CODE[language]);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setOutput(
        '[\n\t{ id: 1, name: "Bàn phím cơ", price: 200 },\n\t{ id: 2, name: "Chuột Gaming", price: 100 }\n]',
      );
      setIsError(false);
      setIsRunning(false);
    }, 1000);
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

      const result = await submitExerciseApi(challengeId, {
        language,
        code,
      });

      setOutput(
        `Status: ${result.status}\nRuntime: ${result.runtime}ms\nMemory: ${result.memory}KB`,
      );

      setIsError(result.status !== "Accepted");
      setIsPassed(result.status === "Accepted");
    } catch {
      setOutput(
        "Submit failed. Please check the backend, token, or challengeId.",
      );
      setIsError(true);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#050816] overflow-hidden">
      <CodeHeader />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-10 overflow-hidden p-2 gap-2">
        <div className="md:col-span-3 bg-[#050816] border border-zinc-900 rounded-xl overflow-hidden flex flex-col h-full">
          <SidebarTask />
        </div>

        <div className="md:col-span-7 flex flex-col h-full overflow-hidden gap-2">
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
      </div>
    </div>
  );
};

export default CodeLayout;
