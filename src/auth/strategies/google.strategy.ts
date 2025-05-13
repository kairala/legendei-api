import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EProviders, User } from '../../db/schemas/user.schema';
import { UserService } from '../services/user.service';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { emails } = profile;
    const user = await this.userService.findUserByProvider(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      emails[0].value,
      EProviders.GOOGLE,
    );

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
