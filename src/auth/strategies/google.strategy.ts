import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EProviders, User } from '../../db/schemas/user.schema';
import { UserService } from '../services/user.service';
import { GoogleProfile } from '../types/googleProfile';

@Injectable()
export default class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    done: VerifyCallback,
  ): Promise<User | null> {
    const { emails } = profile;

    let user = await this.userService.findUserByEmail(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      emails[0].value,
    );

    if (user && user.provider !== EProviders.GOOGLE) {
      throw new PreconditionFailedException(
        'User already exists with different provider',
      );
    }

    if (!user) {
      user = await this.userService.createFromGoogle(profile as GoogleProfile);
    }

    return user;
  }
}
