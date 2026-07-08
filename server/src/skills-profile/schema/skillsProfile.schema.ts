import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ _id: false })
export class PerformanceByCategory {
  @Prop({ required: true })
  category: string;

  @Prop({ default: 0 })
  assessmentCorrect: number;

  @Prop({ default: 0 })
  assessmentTotal: number;

  @Prop({ default: 0 })
  challengeAccepted: number;

  @Prop({ default: 0 })
  challengeTotal: number;

  @Prop({ type: Map, of: Number, default: {} })
  errorTypes: Map<string, number>;
}

@Schema({ timestamps: true })
export class UserSkillProfile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [PerformanceByCategory], default: [] })
  performance: PerformanceByCategory[];

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  aiAnalyses: any[];
}

export const UserSkillProfileSchema =
  SchemaFactory.createForClass(UserSkillProfile);
