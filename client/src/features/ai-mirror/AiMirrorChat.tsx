import { useState } from "react";
import type { ChatMessage } from "./models/chat.model";
import { ChatMessageItem } from "./components/ChatMessage";
import { sendAiMirrorMessage } from "./services/aiMirrorApi";

interface Props {
  challengeId?: string;
  submissionId?: string | null;
}

export function AiMirrorChat({ challengeId, submissionId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content:
        "Mình là AI Mirror. Hãy hỏi mình về hướng giải, lỗi code, hoặc cách debug bài này.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || isSending) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setIsSending(true);

    try {
      const result = await sendAiMirrorMessage({
        message,
        challengeId,
        submissionId: submissionId || undefined,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: result.reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "Mình chưa phân tích được. Hãy kiểm tra đăng nhập, backend, hoặc submission của bài này.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col rounded-xl border border-zinc-800 bg-[#050816] overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-100">AI Mirror</h2>
        <p className="text-xs text-zinc-500">
          Tự phân tích code đã submit của bài hiện tại
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message, index) => (
          <ChatMessageItem key={index} message={message} />
        ))}
        {isSending && (
          <div className="text-xs text-zinc-500">
            AI Mirror đang suy nghĩ...
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-800 flex gap-2">
        <textarea
          className="flex-1 resize-none rounded-lg bg-zinc-900 text-zinc-100 text-sm px-3 py-2 outline-none border border-zinc-800"
          rows={2}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Hỏi: code của tôi sai ở đâu, nên debug thế nào?"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          className="rounded-lg bg-blue-600 text-white px-4 text-sm disabled:opacity-50"
          onClick={sendMessage}
          disabled={isSending}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
