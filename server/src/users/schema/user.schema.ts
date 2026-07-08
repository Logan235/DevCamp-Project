import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true }) // Timestamps will automatically create createdAt and updatedAt fields
export class User extends Document {
  declare _id: Types.ObjectId;
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop()
  displayName!: string;

  @Prop()
  passHash?: string;

  @Prop({ default: 'user' })
  role?: string;

  @Prop()
  avatarUrl?: string;

  @Prop()
  programLang!: string;

  @Prop({ default: 'beginner' })
  currentLevel!: string; // User Level: Beginner, Intermediate, Advanced, Pro

  @Prop({ type: Object })
  thinkingProfile!: {
    strongSkill: string[];
    weakSkill: string[];
    lastUpdateAt: Date;
  };

  @Prop({ type: Object })
  authProviders!: {
    provider: string;
    providerId: string;
    providerEmail: string;
    providerConnectedAt: Date;
  };

  @Prop({ default: 0 })
  xpTotal!: number;

  @Prop({ default: 0 })
  streakCount!: number;

  @Prop()
  lastActiveAt!: Date;

  @Prop()
  createAt!: Date;

  @Prop()
  updateAt!: Date;

  @Prop({ type: Object })
  refreshToken!: {
    token: string;
    expiresAt: Date;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
