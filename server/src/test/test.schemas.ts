import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class GeneratedFor {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: String })
  targetWeakness?: string;
}

@Schema({ _id: false })
class StorageRef {
  @Prop({ type: String })
  inputUrl?: string;

  @Prop({ type: String })
  outputUrl?: string;
}

@Schema({ _id: false })
class OptionItem {
  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: String, required: true })
  text!: string;
}

@Schema({ _id: false })
class AssessmentOption {
  @Prop({ type: String, required: true })
  id!: string;

  @Prop({ type: String, required: true })
  text!: string;
}

@Schema({ _id: false })
class AssessmentQuestion {
  @Prop({ type: Number })
  order?: number;

  @Prop({ type: String, default: 'Dễ' })
  level?: string;

  @Prop({ type: String })
  category?: string;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String })
  code?: string;

  @Prop({
    type: String,
    enum: ['multiple-choice', 'essay'],
    default: 'multiple-choice',
  })
  type!: 'multiple-choice' | 'essay';

  @Prop({ type: [AssessmentOption], default: [] })
  options?: AssessmentOption[];

  @Prop({ type: String })
  answer?: string;
}

@Schema({ collection: 'assessments', timestamps: true })
export class Assessment extends Document {
  declare _id: Types.ObjectId;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true, unique: true, sparse: true })
  slug!: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: [AssessmentQuestion], default: [] })
  questions!: AssessmentQuestion[];

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);

@Schema({ timestamps: true })
export class TestCase extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: true })
  challengeId: Types.ObjectId;

  @Prop({ type: String }) // Not required, can be in storage
  input?: string;

  @Prop({ type: String, alias: 'expected_output' }) // Not required, can be in storage. Keep alias.
  expectedOutput?: string;

  @Prop({ type: String })
  explanation?: string;

  @Prop({
    type: String,
    required: true,
    // Type of test case:
    enum: ['sample', 'multiple-choice', 'essay'],
  })
  type: string;

  @Prop({ type: [OptionItem], default: [] })
  options?: OptionItem[];

  @Prop({ type: GeneratedFor })
  generatedFor?: GeneratedFor;

  @Prop({ type: StorageRef })
  storageRef?: StorageRef;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const TestCaseSchema = SchemaFactory.createForClass(TestCase);

@Schema({ timestamps: true })
export class TestSubmission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: true })
  challengeId: Types.ObjectId;

  @Prop({ type: [String], required: true })
  userAnswers: string[];

  @Prop({ type: Number })
  score: number;

  @Prop({ type: String })
  status: string;
}

export const TestSubmissionSchema =
  SchemaFactory.createForClass(TestSubmission);

@Schema({ collection: 'assessmentsubmissions', timestamps: true })
export class AssessmentSubmission extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessmentId!: Types.ObjectId;

  @Prop({ type: [String], required: true })
  userAnswers!: string[];

  @Prop({ type: Number, required: true })
  score!: number;

  @Prop({ type: String })
  detectedLevel?: string;

  @Prop({ type: [String], default: [] })
  strongSkills?: string[];

  @Prop({ type: [String], default: [] })
  weakSkills?: string[];

  @Prop({ type: String, default: 'Completed' })
  status!: string;
}

export const AssessmentSubmissionSchema =
  SchemaFactory.createForClass(AssessmentSubmission);
