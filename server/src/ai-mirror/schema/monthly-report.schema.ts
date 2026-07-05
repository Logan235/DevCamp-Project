import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class MonthlyReport extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  month!: number;

  @Prop({ required: true })
  year!: number;

  @Prop({ required: true })
  summary!: string;

  @Prop({ type: [String], default: [] })
  strengths!: string[];

  @Prop({ type: [String], default: [] })
  weaknesses!: string[];

  @Prop({ type: [String], default: [] })
  nextSteps!: string[];

  @Prop()
  rawContent?: string;
}

export const MonthlyReportSchema = SchemaFactory.createForClass(MonthlyReport);
