import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  GenerateCaptionRequestDto,
  GenerateCaptionDto,
} from '../dtos/generateCaption.dto';
import { GenerateCaptionService } from '../services/generateCaption.service';
import JwtAuthGuard from '../../../guards/jwtAuth.guard';
import { UserService } from '../../../auth/services/user.service';
import { CaptionService } from '../services/captions.service';

@ApiTags('IA')
@Controller('ia/caption')
export class CaptionController {
  constructor(
    private readonly generateCaptionService: GenerateCaptionService,
    private readonly captionService: CaptionService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async generateCaption(
    @Body() body: GenerateCaptionRequestDto,
    @Req() request: any,
  ): Promise<GenerateCaptionDto> {
    const user = await this.userService.findUserByEmail(
      request.user.email as string,
    );
    if (!user) {
      throw new NotFoundException();
    }
    return this.generateCaptionService.generateCaption(user, body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Req() request: any): Promise<any> {
    const user = await this.userService.findUserByEmail(
      request.user.email as string,
    );
    if (!user) {
      throw new NotFoundException();
    }
    return this.captionService.list({ userId: user._id });
  }
}
