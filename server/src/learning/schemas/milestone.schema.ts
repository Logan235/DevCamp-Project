import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MilestoneDocument = Milestone & Document;

@Schema({ timestamps: true })
export class Milestone {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
    enum: [
      'xp',
      'streak',
      'challenge_completed',
      'roadmap_completed',
      'manual',
    ],
  })
  type!: string;

  @Prop({ default: 1 })
  targetValue!: number;

  @Prop({ default: 0 })
  xpReward!: number;

  @Prop()
  badgeName?: string;

  @Prop()
  badgeIconUrl?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const MilestoneSchema = SchemaFactory.createForClass(Milestone);
