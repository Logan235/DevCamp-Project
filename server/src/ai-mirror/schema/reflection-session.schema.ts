import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ReflectionSession extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Submission' })
  submissionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Challenge' })
  challengeId?: Types.ObjectId;

  @Prop({ required: true })
  userMessage!: string;

  @Prop({ required: true })
  aiReply!: string;

  @Prop({ default: 0 })
  thinkingScore!: number;

  @Prop({ type: [String], default: [] })
  strengths!: string[];

  @Prop({ type: [String], default: [] })
  weaknesses!: string[];

  @Prop({ type: [String], default: [] })
  followUpQuestions!: string[];
}

export const ReflectionSessionSchema =
  SchemaFactory.createForClass(ReflectionSession);
