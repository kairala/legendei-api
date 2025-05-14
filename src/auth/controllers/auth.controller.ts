import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import LocalAuthGuard from '../../guards/localAuth.guard';
import GoogleAuthGuard from '../../guards/googleAuth.guard';
import { AuthService } from '../services/auth.service';
import { SignInDto } from '../dto/signIn.dto';
import { UserService } from '../services/user.service';
import { IAuthLoginInput, IAuthLoginOutput } from '../types/validate.type';
import { CreateUserDto } from '../dto/signUp.dto';
import OkResponseDto from '../../dto/okResponse.dto';
import { RefreshTokenDto } from '../dto/refreshToken.dto';
import { VerifyUserDto } from '../dto/verifyUser.dto';
import JwtAuthGuard from '../../guards/jwtAuth.guard';
import { Response } from 'express';
import { Caption } from '../../db/schemas/caption.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@ApiTags('Auth')
@Controller('auth')
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
    @InjectModel(Caption.name)
    private readonly captionModel: Model<Caption>,
  ) {}

  @ApiBody({ type: SignInDto })
  @ApiOkResponse({ description: 'Returns jwt tokens' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError' })
  @ApiBearerAuth()
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  signIn(@Request() req: { user: IAuthLoginInput }) {
    return this.authService.login(req.user);
  }

  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: '200, Success' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError' })
  @Post('sign-up')
  async signUp(@Body() user: CreateUserDto): Promise<OkResponseDto> {
    await this.usersService.create(user);

    return {
      message: 'The item was created successfully',
    };
  }

  @ApiBody({})
  @ApiOkResponse({ description: 'Success, redirect' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError' })
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req: any) {}

  @ApiOkResponse({ description: 'Success, redirect' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError' })
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: { user: IAuthLoginInput },
    @Res() res: Response,
  ) {
    const tokens = await this.authService.login(req.user);

    const searchParams = new URLSearchParams();

    searchParams.append('accessToken', tokens?.accessToken);
    searchParams.append('refreshToken', tokens.refreshToken);

    res.redirect(`legendei://?${searchParams.toString()}`);
  }

  @ApiOkResponse({ description: '200, returns new jwt tokens' })
  @ApiUnauthorizedResponse({ description: '401. Token has been expired' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError ' })
  @ApiBearerAuth()
  @Post('refresh-token')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<IAuthLoginOutput> {
    const verifiedUser = this.jwtService.verify<{ email: string; id: string }>(
      refreshTokenDto.refreshToken,
    );

    const oldRefreshToken = await this.authService.getRefreshTokenByEmail(
      verifiedUser.email,
    );

    // if the old refresh token is not equal to request refresh token then this user is unauthorized
    if (
      !oldRefreshToken ||
      oldRefreshToken.token !== refreshTokenDto.refreshToken
    ) {
      throw new UnauthorizedException(
        'Authentication credentials were missing or incorrect',
      );
    }

    const payload = {
      id: verifiedUser.id,
      email: verifiedUser.email,
    };

    const newTokens = await this.authService.login(payload);

    return newTokens;
  }

  @ApiOkResponse({
    type: OkResponseDto,
    description: 'User was successfully verified',
  })
  @ApiNotFoundResponse({
    description: 'User was not found',
  })
  @Post('verify')
  async verifyUser(@Body() verifyUserDto: VerifyUserDto): Promise<boolean> {
    const foundUser = await this.usersService.findUserByEmail(
      verifyUserDto.email,
    );

    if (!foundUser) {
      throw new NotFoundException('The user does not exist');
    }

    await this.usersService.update(foundUser._id, { verified: true });

    return true;
  }

  @Get('me')
  @ApiOkResponse({ description: '200, returns user data' })
  @ApiUnauthorizedResponse({ description: '401. Token has been expired' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: { user: IAuthLoginInput }) {
    if (!req.user || !req.user.email) {
      throw new UnauthorizedException(
        'Authentication credentials were missing',
      );
    }

    const user = await this.usersService.findUserByEmail(req.user.email);
    if (!user) {
      throw new NotFoundException('The user does not exist');
    }

    const usedCaptionsToday = await this.captionModel.countDocuments({
      user: user._id,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      verified: user.verified,
      currentPlan: user.currentPlan,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      usedCaptionsToday,
    };
  }

  @ApiOkResponse({ description: '200, returns new jwt tokens' })
  @ApiUnauthorizedResponse({ description: '401. Token has been expired' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError ' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('logout/:token')
  @HttpCode(204)
  async logout(@Param('token') token: string): Promise<void> {
    const { email } = this.jwtService.verify<{ email: string }>(token);

    const deletedUserCount = await this.authService.deleteTokenByEmail(email);

    if (deletedUserCount === 0) {
      throw new NotFoundException('The item does not exist');
    }
  }

  @ApiOkResponse({ description: '200, returns new jwt tokens' })
  @ApiInternalServerErrorResponse({ description: '500. InternalServerError' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('logoutAll')
  @HttpCode(204)
  async logoutAll(): Promise<void> {
    await this.authService.deleteAllTokens();
  }
}
