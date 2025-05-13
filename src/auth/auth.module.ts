import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import AuthController from './controllers/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constants';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../db/schemas/user.schema';
import {
  UserRefreshToken,
  UserRefreshTokenSchema,
} from '../db/schemas/userRefreshToken';
import { AuthService } from './services/auth.service';
import LocalStrategy from './strategies/local.strategy';
import JwtStrategy from './strategies/jwt.strategy';
import GoogleStrategy from './strategies/google.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserRefreshToken.name, schema: UserRefreshTokenSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    UserService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [UserService],
})
export class AuthModule {}
