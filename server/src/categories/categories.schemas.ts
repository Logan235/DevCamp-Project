import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'categories' })
export class Category extends Document {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, trim: true })
  slug!: string;

  @Prop({ trim: true, default: '' })
  description!: string;

  @Prop({ type: Number, default: 0 })
  ordinal!: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
