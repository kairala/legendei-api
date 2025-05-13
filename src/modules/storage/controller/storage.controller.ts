import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StorageFileService } from '../services/storageFile.service';
import { FileInterceptor } from '@nestjs/platform-express';
import JwtAuthGuard from '../../../guards/jwtAuth.guard';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageFileService: StorageFileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.storageFileService.upload({
      body: file,
      fileName: file.originalname,
      contentType: file.mimetype,
    });
  }
}
