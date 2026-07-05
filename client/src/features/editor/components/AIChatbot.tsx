import React, { useState } from "react";
import { Button } from "../../../components/common/Button";

interface AIChatbotProps {
  hasRunCode: boolean; 
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ hasRunCode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    { role: "ai", text: "Xin chào! Tôi có thể giúp gì cho bài code của bạn?" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleToggleChat = () => {
    if (!hasRunCode) {
      alert(
        "Bạn cần phải Run code ít nhất một lần trước khi sử dụng AI Chatbot!",
      );
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newMessages = [
      ...messages,
      { role: "user" as const, text: inputValue },
    ];
    setMessages(newMessages);
    setInputValue("");

    // Giả lập AI phản hồi sau 1 giây
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai" as const,
          text: "Tôi đã nhận được câu hỏi. Tính năng AI đang được xử lý...",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans text-sm text-gray-200">
      {isOpen && (
        <div className="w-80 sm:w-96 h-112.5 flex flex-col bg-[#0d111c]/95 backdrop-blur-md rounded-xl border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex justify-between items-center px-4 py-3 bg-[#090d16] border-b border-gray-800/80 select-none">
            <div className="flex items-center gap-2 font-semibold text-emerald-400">
              <svg
                className="w-4 h-4 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              AI Code Assistant
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
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

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0f1422]/40 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-[#1e2538] text-gray-200 border border-zinc-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-[#090d16] border-t border-gray-800/80 flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hỏi AI về lỗi hoặc cách tối ưu..."
              className="flex-1 bg-[#141b2e] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 placeholder-zinc-500"
            />
            <Button variant="success" size="sm" type="submit" className="py-1!">
              Gửi
            </Button>
          </form>
        </div>
      )}

      <button
        onClick={handleToggleChat}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-zinc-800 text-white"
            : !hasRunCode
              ? "bg-zinc-700/50 text-zinc-500 cursor-not-allowed opacity-60"
              : "bg-linear-to-tr from-emerald-600 to-teal-500 text-white hover:shadow-emerald-500/20"
        }`}
        title={!hasRunCode ? "Vui lòng submit code trước" : "Chat với AI"}
      >
        {isOpen ? (
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
              d="M19 9l-7 7-7-7"
            />
          </svg>
        ) : (
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
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default AIChatbot;
