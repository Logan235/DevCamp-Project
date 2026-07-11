import React from "react";
import Editor from "@monaco-editor/react";
import { Select } from "../../../components/common/Select";
import { Button } from "../../../components/common/Button";

const LANGUAGE_OPTIONS = [{ value: "cpp", label: "C++ (Local Engine)" }];

interface CodeEditorProps {
  language: string;
  code: string;
  onCodeChange: (value: string) => void;
  onLanguageChange: (lang: string) => void;
  onResetCode: () => void;
  onRunCode: () => void;
  onSubmitCode: () => void;
  isRunning: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  code,
  onCodeChange,
  onLanguageChange,
  onResetCode,
  onRunCode,
  onSubmitCode,
  isRunning,
}) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLanguageChange(e.target.value);
  };

  return (
    <div className="flex flex-col h-full min-h-87.5 bg-[#0d111c]/60 rounded-xl border border-zinc-900 overflow-hidden">
      
      <div className="flex flex-wrap gap-2 justify-between items-center px-3 py-2 sm:px-4 bg-[#090d16] border-b border-gray-800/80 select-none">
        <div className="flex items-center gap-3">
          <Select
            options={LANGUAGE_OPTIONS}
            value={language}
            onChange={handleSelectChange}
            className="min-w-30 py-1! text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetCode}
            disabled={isRunning}
            className="px-2 py-1 text-xs"
          >
            Reset
          </Button>

          <Button
            variant="thirdary"
            size="sm"
            onClick={onRunCode}
            disabled={isRunning}
            className="gap-1 px-2 py-1 text-xs font-semibold"
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {isRunning ? "Running..." : "Run"}
          </Button>

          <Button
            variant="success"
            size="sm"
            onClick={onSubmitCode}
            className="gap-1 px-2 py-1 text-xs font-semibold"
          >
            Submit
          </Button>
        </div>
      </div>
      
      <div className="flex-1 h-0 relative bg-[#0f1422]/40 pt-2">
        <div className="absolute inset-0 w-full h-full">
          <Editor
            height="100%"
            language={language}
            value={code}
            theme="vs-dark"
            onChange={(value) => onCodeChange(value || "")}
            options={{
              fontSize: 13, 
              fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
              minimap: { enabled: false },
              wordWrap: "on",
              automaticLayout: true,
              cursorBlinking: "smooth",
              lineNumbersMinChars: 3,
            }}
            loading={
              <div className="flex items-center justify-center h-full text-zinc-500 text-sm gap-2">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Đang kết nối...</span>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;