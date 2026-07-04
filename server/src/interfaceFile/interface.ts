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
}

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
}
