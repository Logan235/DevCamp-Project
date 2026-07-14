import React, { useMemo } from "react";
import { Badge } from "../../../components/common/Badge";

type LessonLevel = "info" | "warning" | "success" | "error";

type ExerciseExample = {
  input?: string;
  output?: string;
  explanation?: string;
};

type ExerciseData = {
  _id?: string;
  title?: string;
  slug?: string;
  difficulty?: "easy" | "medium" | "hard" | string;
  description?: string;
  challengeType?: "coding" | "multiple_choice" | string;
  examples?: ExerciseExample[];
  constraints?: string[];
  thinkingHint?: string[];
  patternGroup?: string;
  multipleChoice_content?: string;
};

interface SidebarTaskProps {
  exercise?: ExerciseData | null;
  isLoading?: boolean;
  error?: string;
}

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
  info: "Nhập môn",
  warning: "Cơ bản",
  success: "Nâng cao",
  error: "Thử thách",
};

const DIFFICULTY_TO_LEVEL: Record<string, LessonLevel> = {
  easy: "info",
  medium: "warning",
  hard: "error",
};

const DEFAULT_TASK: LearningTask = {
  lessonTitle: "Bài luyện tập",
  topic: "Phương thức .map()",
  level: "warning",
  concept:
    "Phương thức `map()` giúp bạn duyệt qua từng phần tử của một mảng cũ, biến đổi nó và trả về một mảng hoàn toàn mới mà không làm thay đổi mảng ban đầu.",
  objective:
    "Giả sử bạn đang làm tính năng Giỏ hàng. Hãy dùng `.map()` để duyệt qua danh sách các sản phẩm và nhân đôi giá (`price`) của từng sản phẩm.",
  todoList: [
    "Đọc kỹ đề bài và xác định input/output.",
    "Viết hàm xử lý chính trong editor.",
    "Bấm `Run Code` để chạy thử với input mẫu.",
    "Bấm `Submit Code` để chấm với toàn bộ test cases.",
  ],
  checkpoint: {
    input: `const products = [
  { id: 1, name: "Bàn phím cơ", price: 100 },
  { id: 2, name: "Chuột Gaming", price: 50 }
];`,
    expectedOutput: `[
  { id: 1, name: "Bàn phím cơ", price: 200 },
  { id: 2, name: "Chuột Gaming", price: 100 }
]`,
  },
  syntaxHint:
    "const newArray = oldArray.map(item => {\n  return { ...item, newProperty: value };\n});",
};

function renderFormattedText(text: string) {
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="mx-0.5 rounded border border-(--border-sub) bg-(--bg-code-inline) px-1.5 py-0.5 font-mono text-[11px text-emerald-400 dark:text-emerald-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

function getLevelFromDifficulty(difficulty?: string): LessonLevel {
  if (!difficulty) return DEFAULT_TASK.level;
  return DIFFICULTY_TO_LEVEL[difficulty.toLowerCase()] || DEFAULT_TASK.level;
}

function getLessonTitle(exercise?: ExerciseData | null) {
  if (!exercise?._id && !exercise?.slug) return DEFAULT_TASK.lessonTitle;

  if (exercise.patternGroup) {
    return `Pattern: ${exercise.patternGroup}`;
  }

  if (exercise.slug) {
    return `Challenge: ${exercise.slug}`;
  }

  return `Challenge: ${String(exercise._id).slice(-8)}`;
}

function buildTodoList(exercise?: ExerciseData | null) {
  const baseTodos = [
    "Đọc kỹ đề bài và xác định input/output.",
    "Viết code trong editor bằng ngôn ngữ đang được hỗ trợ.",
    "Dùng `Run Code` để chạy thử nhanh.",
    "Dùng `Submit Code` để chấm với toàn bộ test cases.",
  ];

  if (!exercise) return DEFAULT_TASK.todoList;

  const extraTodos: string[] = [];

  if (exercise.challengeType) {
    extraTodos.push(`Loại bài: \`${exercise.challengeType}\`.`);
  }

  if (exercise.patternGroup) {
    extraTodos.push(`Gợi ý pattern: \`${exercise.patternGroup}\`.`);
  }

  return [...baseTodos, ...extraTodos];
}

function buildSyntaxHint(exercise?: ExerciseData | null) {
  if (exercise?.thinkingHint?.length) {
    return exercise.thinkingHint
      .map((hint, index) => `${index + 1}. ${hint}`)
      .join("\n");
  }

  if (exercise?.constraints?.length) {
    return exercise.constraints
      .map((constraint, index) => `${index + 1}. ${constraint}`)
      .join("\n");
  }

  return DEFAULT_TASK.syntaxHint;
}

function buildLearningTask(exercise?: ExerciseData | null): LearningTask {
  const firstExample = exercise?.examples?.[0];

  return {
    lessonTitle: getLessonTitle(exercise),
    topic: exercise?.title || DEFAULT_TASK.topic,
    level: getLevelFromDifficulty(exercise?.difficulty),
    concept:
      exercise?.description ||
      exercise?.multipleChoice_content ||
      DEFAULT_TASK.concept,
    objective:
      exercise?.description ||
      "Hoàn thành bài tập này bằng cách viết code đúng với yêu cầu đề bài, sau đó chạy thử và submit để AI Mirror có dữ liệu phân tích.",
    todoList: buildTodoList(exercise),
    checkpoint: {
      input: firstExample?.input || DEFAULT_TASK.checkpoint.input,
      expectedOutput:
        firstExample?.output || DEFAULT_TASK.checkpoint.expectedOutput,
    },
    syntaxHint: buildSyntaxHint(exercise),
  };
}

export const SidebarTask: React.FC<SidebarTaskProps> = ({
  exercise,
  isLoading = false,
  error,
}) => {
  const learningTask = useMemo(() => buildLearningTask(exercise), [exercise]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col justify-center bg-(--bg-main) p-6 text-(--text-muted)">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-(--bg-skeleton)" />
          <div className="h-6 w-56 rounded bg-(--bg-skeleton)" />
          <div className="h-28 rounded-xl bg-(--bg-card)" />
          <div className="h-40 rounded-xl bg-(--bg-card)" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col justify-center bg-(--bg-main) p-6 text-(--text-main)">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
          <p className="text-sm font-semibold text-rose-400 dark:text-rose-300">
            Không tải được đề bài
          </p>
          <p className="mt-2 text-xs leading-relaxed text-rose-500/80 dark:text-rose-200/80">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full select-none flex-col justify-between bg-(--bg-main) p-6 text-(--text-main)">
      <div className="space-y-6 overflow-y-auto pr-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
              {learningTask.lessonTitle}
            </span>

            <Badge variant={learningTask.level}>
              {LEVEL_LABELS[learningTask.level]}
            </Badge>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-(--text-main)">
            {learningTask.topic}
          </h2>
        </div>

        <div className="rounded-xl border border-(--border-main) bg-(--bg-card) p-4 text-xs leading-relaxed text-(--text-sub)">
          {renderFormattedText(learningTask.concept)}
        </div>

        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
            Nhiệm vụ
          </h3>

          <p className="text-sm leading-relaxed text-(--text-sub)">
            {renderFormattedText(learningTask.objective)}
          </p>

          <div className="mt-2 rounded-xl bg-(--bg-input) p-3">
            <p className="mb-2 text-xs font-semibold text-(--text-muted)">
              Các yêu cầu cần có:
            </p>

            <ul className="space-y-2">
              {learningTask.todoList.map((todo, index) => (
                <li
                  key={`${todo}-${index}`}
                  className="flex items-start gap-2 text-xs"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px font-bold text-emerald-600 dark:text-emerald-300">
                    {index + 1}
                  </span>
                  <span className="text-(--text-sub)">
                    {renderFormattedText(todo)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3 sticky">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
            Kết quả kiểm tra
          </h3>

          <div className="space-y-3 rounded-xl border border-(--border-main) bg-(--bg-card) p-4 font-mono text-xs">
            <div>
              <div className="mb-1 font-bold text-(--text-muted)">Input:</div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded border border-(--border-sub) bg-(--bg-main) p-2 text-(--text-sub)">
                {learningTask.checkpoint.input || "(Không có input mẫu)"}
              </pre>
            </div>

            <div>
              <div className="mb-1 font-bold text-emerald-600 dark:text-emerald-400">
                Expected output:
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded border border-emerald-500/20 dark:border-emerald-900/30 bg-emerald-500/5 dark:bg-emerald-950/10 p-2 text-emerald-600 dark:text-emerald-300">
                {learningTask.checkpoint.expectedOutput ||
                  "(Không có expected output mẫu)"}
              </pre>
            </div>

            {exercise?.examples?.[0]?.explanation && (
              <div>
                <div className="mb-1 font-bold text-blue-600 dark:text-blue-300">
                  Explanation:
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded border border-blue-500/20 dark:border-blue-900/30 bg-blue-50/5 dark:bg-blue-950/10 p-2 text-blue-600 dark:text-blue-200">
                  {exercise.examples[0].explanation}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarTask;
