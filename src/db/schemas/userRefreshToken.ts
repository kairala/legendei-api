import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum EProviders {
  LOCAL = 'local',
  GOOGLE = 'google',
  GITHUB = 'github',
}

@Schema({ timestamps: true, collection: 'userRefreshTokens' })
export class UserRefreshToken {
  @ApiProperty({ type: String })
  _id: ObjectId;

  @ApiProperty({ type: String })
  @Prop({ required: true })
  email: string;

  @ApiProperty({ type: String })
  @Prop({ required: true })
  token: string;

  @ApiProperty({ type: Number })
  @Prop({ required: true })
  expiresIn: number;
}

export type UserRefreshTokenDocument = HydratedDocument<UserRefreshToken>;

export const UserRefreshTokenSchema =
  SchemaFactory.createForClass(UserRefreshToken);
