import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ _id: false })
class SkillReport {
  @Prop()
  skill!: string;

  @Prop({ default: 0 })
  score!: number;

  @Prop()
  comment?: string;
}

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ default: 'weekly', enum: ['daily', 'weekly', 'monthly', 'manual'] })
  period!: string;

  @Prop()
  summary?: string;

  @Prop({ type: [SkillReport], default: [] })
  skillBreakdown!: SkillReport[];

  @Prop({ type: [String], default: [] })
  strengths!: string[];

  @Prop({ type: [String], default: [] })
  weaknesses!: string[];

  @Prop({ type: [String], default: [] })
  recommendations!: string[];
}

export const ReportSchema = SchemaFactory.createForClass(Report);
