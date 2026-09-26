import { Types } from 'mongoose';

export interface JwtPayload {
  userId: string;
  sub: string;
  email?: string;
  role?: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export interface TestCases extends Document {
  _id: Types.ObjectId;
  challengeId: Types.ObjectId;
  inputKey?: string;
  input?: string;
  expectedOutput: string;
}

export interface Judge0Request {
  id: number;
  name: string;
  version: string;
}

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expectedOutput?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: {
    id: number;
    description: string;
  };
  time?: string | null;
  memory?: number | null;
  token?: string;
  expected_output?: string;
}

export interface CodeExecutionJob {
  submissionId: string;
  code: string;
  language: string;
  input: string;
  timeout: number;
  expectedOutput?: string;
}

export interface ExecException extends Error {
  stderr?: string;
  cmd?: string;
  code?: number | string | null;
  killed?: boolean; /** true khi Node tự kill tiến trình vì quá timeout của execAsync. */
  signal?: NodeJS.Signals | null;
}

/** Engine dùng để compile/run code: docker (sandbox) hoặc g++ trực tiếp trên host. */
export type JudgeEngine = 'docker' | 'native';

export interface Judge0Response {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | null;
  status?: {
    id: number;
    description: string;
  };
  memory?: number | null;
  token?: string;
  timings?: ExecutionTimings;
}

/** Thời gian (ms) của từng giai đoạn trong local engine. */
export interface ExecutionTimings {
  engine?: JudgeEngine;
  compileMs: number; /** docker run gcc ./program < input (bao gồm cả thời gian khởi động container) */
  runMs: number;
  engineTotalMs: number; /** ghi file + compile + run + dọn file */
}

/** Thời gian (ms) của toàn bộ vòng đời job, lưu trong Submission.timings */
export interface SubmissionTimings extends Partial<ExecutionTimings> {
  /** Từ lúc queue.add() đến lúc worker bắt đầu process() */
  queueWaitMs: number;
  processMs: number; /** Toàn bộ process(): findById + engine + save */
  endToEndMs: number; /** queueWaitMs + processMs: từ lúc enqueue đến khi kết quả được ghi vào Mongo */
}

export interface AnalysisSkillProfile {
  userId: string;
  analysis: Record<string, any>;
}

export interface AssessmentDetail {
  // tuỳ theo cấu trúc thật, ví dụ:
  questionId?: string;
  correct?: boolean;
  [key: string]: unknown;
}

export interface AssessmentResult {
  score: number;
  detectedLevel: 'absolute_beginner' | 'beginner' | 'intermediate' | 'advanced';
  strongSkills: string[];
  weakSkills: string[];
  details?: AssessmentDetail[];
}

export interface CreateRoadmapArgs {
  title: string;
  challengeIds: string[];
  detectedLevel: 'absolute_beginner' | 'beginner' | 'intermediate' | 'advanced';
  weakSkills: string[];
  strongSkills: string[];
  pacePreference: 'slow' | 'medium' | 'fast';
}

export interface UpdateRoadmapDto {
  status?: string;
  completedNodes?: number;
  // ... các field khác cho phép update
}
