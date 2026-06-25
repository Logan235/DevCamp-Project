import React, { useState } from 'react';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';

type LessonLevel = 'info' | 'warning' | 'success' | 'error';

interface LearningTask {
  lessonTitle: string;
  topic: string;
  level: LessonLevel;
  concept: string;
  objective: string;
  todoList: string[];
  checkpoint: {
    input: string;
    expectedOutput: string;
  };
  syntaxHint: string;
}

const LEVEL_LABELS: Record<LessonLevel, string> = {
  info: 'Nhập môn',
  warning: 'Cơ bản',
  success: 'Nâng cao',
  error: 'Thử thách',
};

// regex chuyển toàn bộ chữ trong dấu backticks thành code format
const renderFormattedText = (text: string) => {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className=" px-1.5 py-0.5 rounded font-mono text-[11px] border-zinc-700/50 mx-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

export const SidebarTask: React.FC = () => {
  const [showHint, setShowHint] = useState(false);

  // phân loại label
  const learningTask: LearningTask = {
    lessonTitle: "Bài 4: Thao tác với Mảng",
    topic: "Phương thức .map()",
    level: "warning", 
    
    concept: "Phương thức `map()` giúp bạn duyệt qua từng phần tử của một mảng cũ, biến đổi nó và trả về một mảng hoàn toàn mới mà không làm thay đổi mảng ban đầu.",
    
    objective: "Giả sử bạn đang làm tính năng Giỏ hàng. Hãy dùng `.map()` để duyệt qua danh sách các sản phẩm (mảng `products`) và nhân đôi giá (`price`) của từng sản phẩm để chuẩn bị cho chương trình khuyến mãi 'Black Friday'.",
    
    todoList: [
      "Sử dụng phương thức `products.map()`",
      "Trả về một object mới giữ nguyên các thuộc tính cũ (`id`, `name`) nhưng cập nhật lại `price = price * 2`.",
      "Lưu kết quả vào biến `saleProducts`."
    ],

    checkpoint: {
      input: `const products = [
  { id: 1, name: "Bàn phím cơ", price: 100 },
  { id: 2, name: "Chuột Gaming", price: 50 }
];`,
      expectedOutput: `[
  { id: 1, name: "Bàn phím cơ", price: 200 },
  { id: 2, name: "Chuột Gaming", price: 100 }
]`
    },

    syntaxHint: "const newArray = oldArray.map(item => {\n  return { ...item, newProperty: value };\n});"
  };

  return (
    <div className="p-6 h-full flex flex-col justify-between select-none bg-[#050816] text-zinc-100">
      <div className="space-y-6 overflow-y-auto pr-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {learningTask.lessonTitle}
            </span>
            <Badge variant={learningTask.level}>
              {LEVEL_LABELS[learningTask.level]}
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            {learningTask.topic}
          </h2>
        </div>

        <div className="bg-zinc-900/40 border-zinc-800/60 rounded-xl p-4 text-xs text-zinc-300 leading-relaxed">
          {renderFormattedText(learningTask.concept)}
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            Nhiệm vụ
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {renderFormattedText(learningTask.objective)}
          </p>
          
          <ul className="space-y-2 mt-2 rounded-xl p-3">
            <p>Các yêu cầu cần có:</p>
            {learningTask.todoList.map((todo, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs">
                <span>{idx + 1}. {renderFormattedText(todo)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            Kết quả kiểm tra
          </h3>
          <div className="bg-zinc-900/60 border-zinc-800/80 rounded-xl p-4 space-y-3 text-xs font-mono">
            <div>
              <div className="text-zinc-500 font-bold mb-1">Input:</div>
              <pre className="text-zinc-300 bg-[#050816]/50 p-2 rounded border-zinc-900 overflow-x-auto whitespace-pre-wrap">{learningTask.checkpoint.input}</pre>
            </div>
            <div>
              <div className="text-emerald-400 font-bold mb-1">Expected output:</div>
              <pre className="text-emerald-300 bg-emerald-950/10 p-2 rounded border-emerald-900/30 overflow-x-auto whitespace-pre-wrap">{learningTask.checkpoint.expectedOutput}</pre>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-zinc-800/80 pt-4">
        {!showHint ? (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setShowHint(true)}
            className="w-full gap-1.5 text-xs text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Hint gợi ý
          </Button>
        ) : (
          <div className="bg-amber-500/5 border-amber-500/10 rounded-xl p-4 space-y-2 animate-fadeIn">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                Cấu trúc code
              </span>
              <button 
                onClick={() => setShowHint(false)} 
                className="text-zinc-500 hover:text-zinc-300 text-xs font-mono transition-colors"
              >
                [Hide]
              </button>
            </div>
            <pre className="text-2xs text-zinc-400 font-mono whitespace-pre-wrap bg-[#050816]/40 p-2.5 rounded border-zinc-900 leading-relaxed">
              {learningTask.syntaxHint}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarTask;