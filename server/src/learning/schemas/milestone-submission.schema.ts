import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MilestoneSubmissionDocument = MilestoneSubmission & Document;

@Schema({ timestamps: true })
export class MilestoneSubmission {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Milestone', required: true })
  milestoneId!: Types.ObjectId;

  @Prop()
  note?: string;

  @Prop()
  evidenceUrl?: string;

  @Prop({
    default: 'pending',
    enum: ['pending', 'approved', 'rejected'],
  })
  status!: string;

  @Prop()
  reviewedAt?: Date;
}

export const MilestoneSubmissionSchema =
  SchemaFactory.createForClass(MilestoneSubmission);
