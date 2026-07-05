import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'challenges', timestamps: true })
export class Challenge extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @Prop({ type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] })
  difficulty: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop({ type: Number })
  timeLimit: number;

  @Prop({ type: Number })
  memoryLimit: number;
}
export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
