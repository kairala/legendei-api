import { ObjectId } from 'mongoose';

export interface IAuthValidateUserOutput {
  id: ObjectId;
  email?: string;
}

export interface IJwtStrategyValidate {
  id: ObjectId;
  email: string;
}

export interface IAuthLoginInput {
  _id?: string;
  password?: string;
  email?: string;
}

export interface IAuthLoginOutput {
  accessToken: string;
  refreshToken: string;
}
