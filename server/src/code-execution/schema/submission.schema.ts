import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Submission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: true })
  challengeId: Types.ObjectId;

  @Prop({ required: true })
  code: string;

  @Prop({ default: 'cpp' })
  language: string;

  @Prop()
  input?: string;

  @Prop()
  output?: string;

  @Prop()
  error?: string;

  @Prop()
  statusCode?: number; // Local engine/Judge0-compatible code: 3 Accepted, 4 Wrong Answer, 6 Compile Error, 11 Runtime Error

  @Prop()
  runtime?: number; // milliseconds

  @Prop()
  memory?: number; // bytes

  @Prop({ default: 'pending' })
  status: string; // pending, success, wrong_answer, compile_error, runtime_error, error

  @Prop({ alias: 'expected_output' })
  expectedOutput?: string; // Optional expected output for comparison

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
