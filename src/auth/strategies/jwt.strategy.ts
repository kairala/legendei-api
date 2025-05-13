import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants/jwt.constants';
import { User } from '../../db/schemas/user.schema';
import { IJwtStrategyValidate } from '../types/validate.type';

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: User): Promise<IJwtStrategyValidate> {
    return new Promise((resolve) => {
      resolve({
        id: payload._id,
        email: payload.email,
      });
    });
  }
}
