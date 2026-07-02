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
