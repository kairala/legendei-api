import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.schema';

@Schema({ timestamps: true, collection: 'captions' })
export class Caption {
  @ApiProperty({ type: String })
  _id: ObjectId;

  @ApiProperty({ type: String })
  @Prop({ required: true })
  imageUrl: string;

  @ApiProperty({ type: String })
  @Prop({ required: true })
  style: string;

  @ApiProperty({ type: String })
  @Prop({ required: true })
  network: string;

  @ApiProperty({ type: Number })
  @Prop({ required: true })
  executionTime: number;

  @ApiProperty({ type: String })
  @Prop({ required: true })
  caption: string;

  @ApiProperty({ type: User })
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: User;
}

export type CaptionDocument = HydratedDocument<Caption>;

export const CaptionSchema = SchemaFactory.createForClass(Caption);
