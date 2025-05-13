import { Injectable } from '@nestjs/common';
import { IAuthLoginInput, IAuthLoginOutput } from '../types/validate.type';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../constants/jwt.constants';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserRefreshToken,
  UserRefreshTokenDocument,
} from '../../db/schemas/userRefreshToken';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(UserRefreshToken.name)
    private readonly userRefreshTokenModel: Model<UserRefreshTokenDocument>,
  ) {}

  async login(data: IAuthLoginInput): Promise<IAuthLoginOutput> {
    const payload = {
      id: data._id,
      email: data.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConstants.accessTokenExpirationTime,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: jwtConstants.refreshTokenExpirationTime,
    });

    await this.userRefreshTokenModel.deleteMany({ email: payload.email });
    await this.userRefreshTokenModel.create({
      email: payload.email,
      token: refreshToken,
      expiresIn: 86400,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getRefreshTokenByEmail(
    email: string,
  ): Promise<UserRefreshToken | null> {
    return this.userRefreshTokenModel.findOne({ email });
  }

  async deleteTokenByEmail(email: string): Promise<number> {
    await this.userRefreshTokenModel.deleteMany({ email });

    return 1;
  }

  async deleteAllTokens(): Promise<string> {
    await this.userRefreshTokenModel.deleteMany({});

    return '';
  }
}
