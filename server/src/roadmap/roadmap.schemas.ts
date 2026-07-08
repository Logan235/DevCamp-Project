import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class ChallengeSnapshot {
  @Prop({ type: Types.ObjectId, ref: 'Challenge' }) challengeId: Types.ObjectId;
  @Prop({ type: String }) title: string;
  @Prop({ type: String }) slug: string;
  @Prop({ type: String }) difficulty: string;
  @Prop({ type: [String] }) skillSlugs: string[];
  @Prop({ type: Number }) xpReward: number;
}

@Schema({ _id: false })
class RoadmapNode {
  @Prop({ type: Number, required: true }) order: number;
  @Prop({ type: String, required: true }) title: string;
  @Prop({ type: String }) objective?: string;
  @Prop({ type: String }) skillSlug?: string;
  @Prop({ type: String }) patternGroup?: string;
  @Prop({ type: String, enum: ['practice', 'checkpoint'], default: 'practice' })
  nodeType: string;
  @Prop({ type: [Types.ObjectId], ref: 'Challenge', default: [] })
  challengeIds: Types.ObjectId[];
  @Prop({ type: [ChallengeSnapshot], default: [] })
  challengesSnapshot?: ChallengeSnapshot[];
}

@Schema({ timestamps: true })
export class RoadmapTemplate extends Document {
  @Prop({ type: String, required: true }) title: string;
  @Prop({ type: String, required: true, unique: true }) slug: string;
  @Prop({ type: String }) description?: string;
  @Prop({
    type: String,
    format: 'enum',
    enum: ['absolute_beginner', 'beginner', 'intermediate', 'advanced'],
  })
  targetLevel?: string;
  @Prop({ type: Types.ObjectId, ref: 'Category' }) categoryId?: Types.ObjectId;
  @Prop({ type: [RoadmapNode] }) nodes: RoadmapNode[];
  @Prop({ type: Boolean, default: true }) isActive: boolean;
}
export const RoadmapTemplateSchema =
  SchemaFactory.createForClass(RoadmapTemplate);

@Schema({ _id: false })
class GenerationParams {
  @Prop({ type: String })
  detectedLevel?: string;

  @Prop({ type: [String], default: [] })
  weakSkills: string[];

  @Prop({ type: [String], default: [] })
  strongSkills: string[];

  @Prop({ type: String, enum: ['slow', 'medium', 'fast'] })
  pacePreference?: string;

  @Prop({ type: [String], default: [] })
  skillOrder?: string[];

  @Prop({ type: [String], default: [] })
  difficulties?: string[];

  @Prop({ type: String })
  reason?: string;

  @Prop({ type: String })
  assessmentId?: string;
}

@Schema({ timestamps: true })
export class UserRoadmap extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'RoadmapTemplate', required: true })
  templateId: Types.ObjectId;
  @Prop({ type: String, required: true }) title: string;
  @Prop({
    type: String,
    required: true,
    enum: ['draft', 'active', 'completed', 'archived'],
  })
  status: string;
  @Prop({ type: Number }) totalNodes?: number;
  @Prop({ type: Number }) completedNodes?: number;
  @Prop({ type: GenerationParams }) generationParams?: GenerationParams;
}
export const UserRoadmapSchema = SchemaFactory.createForClass(UserRoadmap);
