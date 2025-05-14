import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum EProviders {
  LOCAL = 'local',
  GOOGLE = 'google',
  GITHUB = 'github',
}

export type Plans = 'gold' | 'platinum' | 'free';

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @ApiProperty({ type: String })
  _id: ObjectId;

  @ApiProperty({ type: String })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ type: String })
  @Prop()
  password: string;

  @ApiProperty({ type: String })
  @Prop({ required: true, default: '' })
  name: string;

  @ApiProperty({ type: Boolean })
  @Prop()
  verified: boolean;

  @ApiProperty({ type: String, enum: EProviders })
  @Prop({ enum: EProviders })
  provider: EProviders;

  @ApiProperty({ type: String })
  @Prop({ nullable: true })
  stripeCustomerId: string;

  @ApiProperty({ type: String })
  @Prop({ nullable: true, type: String })
  stripeSubscriptionId: string | null;

  @ApiProperty({ type: String })
  @Prop({ nullable: true, default: 'free' })
  currentPlan: Plans;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
