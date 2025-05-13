import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { IAuthValidateUserOutput } from '../types/validate.type';

@Injectable()
export default class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<IAuthValidateUserOutput> {
    const user = await this.userService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
