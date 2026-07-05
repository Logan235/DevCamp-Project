import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ChallengeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}
// Define schema Example no Id to save in R2
@Schema({ _id: false })
class ExampleItem {
  @Prop({ required: true })
  input!: string;

  @Prop({ required: true })
  output!: string;

  @Prop()
  explanation?: string;
}

@Schema({ collection: 'challenges', timestamps: true }) // Changed class name to Challenge
export class Challenge extends Document {
  declare _id: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'categories', required: true })
  categoryId!: Types.ObjectId;
  @Prop({ required: true, enum: ['coding', 'multiple_choice'] })
  challengeType!: 'coding' | 'multiple_choice';
  @Prop()
  title!: string;
  @Prop({ required: true, unique: true })
  slug!: string;
  @Prop()
  skillSlug?: string[];
  @Prop({
    type: String,
    enum: Object.values(ChallengeDifficulty),
    default: ChallengeDifficulty.EASY,
    required: true,
  })
  difficulty!: ChallengeDifficulty;
  @Prop({ required: true })
  description!: string; // This is name excersire
  @Prop({ type: [ExampleItem], default: [] })
  examples?: ExampleItem[]; // This is in/out/explanation always appeared along with the question.
  @Prop()
  constraints?: string[]; // Conditions in question
  @Prop()
  patternGroup?: string;
  @Prop()
  thinkingHint?: string[];
  @Prop({ required: true })
  testcasePath!: string;
  @Prop()
  multipleChoice_content!: string;
  @Prop({
    type: Boolean,
    default: true,
  })
  isActive?: boolean;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);

@Schema({ collection: 'submissions', timestamps: true })
export class Submission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: true })
  challengeId: Types.ObjectId;

  @Prop({ type: String, required: true })
  language: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true, default: 'pending' })
  status: string;

  @Prop({ type: Number, default: 0 })
  runtime: number;

  @Prop({ type: Number, default: 0 })
  memory: number;

  @Prop({ type: String })
  sourceCodePath: string;
}
export const SubmissionSchema = SchemaFactory.createForClass(Submission);
