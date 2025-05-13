import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true, collection: 'storageFiles' })
export class StorageFile {
  @ApiProperty({ type: String })
  _id: ObjectId;

  @ApiProperty({ type: String })
  @Prop({ required: true })
  fileName: string;

  @ApiProperty({ type: String })
  @Prop({ required: true })
  url: string;

  @ApiProperty({ type: String })
  @Prop({ required: true })
  key: string;

  @ApiProperty({ type: String })
  @Prop({ required: true })
  fileType: string;

  @ApiProperty({ type: String })
  @Prop({ required: true })
  fileSize: string;
}

export type StorageFileDocument = HydratedDocument<StorageFile>;

export const StorageFileSchema = SchemaFactory.createForClass(StorageFile);
