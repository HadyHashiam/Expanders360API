import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Document extends MongooseDocument {
  @Prop({ required: true })
  projectId: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: false })
  filePath?: string;

  @Prop({ required: false })
  secureUrl?: string;

  @Prop({ required: false })
  publicId?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
// Ensure _id is converted to string in toJSON
DocumentSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});