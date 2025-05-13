import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  GenerateCaptionRequestDto,
  GenerateCaptionDto,
} from '../services/generateCaption.dto';
import { GenerateCaptionService } from '../services/generateCaption.service';
import JwtAuthGuard from '../../../guards/jwtAuth.guard';
import { UserService } from '../../../auth/services/user.service';

@ApiTags('IA')
@Controller('ia/caption')
export class CaptionController {
  constructor(
    private readonly generateCaptionService: GenerateCaptionService,
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
}
