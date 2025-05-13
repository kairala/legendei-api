import { Module } from '@nestjs/common';
import { INVISION_PROVIDER, OPEN_AI_PROVIDER } from './config/providers';
import { googleConfig } from './config/google';
import vision from '@google-cloud/vision';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { GenerateCaptionService } from './services/generateCaption.service';
import { CaptionController } from './controller/caption.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Caption, CaptionSchema } from '../../db/schemas/caption.schema';
import { AuthModule } from '../../auth/auth.module';

@Module({
  controllers: [CaptionController],
  providers: [
    {
      provide: INVISION_PROVIDER,
      useFactory: () => {
        return new vision.ImageAnnotatorClient({
          credentials: googleConfig,
        });
      },
    },
    {
      provide: OPEN_AI_PROVIDER,
      useFactory: (config: ConfigService) => {
        return new OpenAI({
          apiKey: config.getOrThrow('OPENAI_API_KEY'),
        });
      },
      inject: [ConfigService],
    },
    GenerateCaptionService,
  ],
  imports: [
    MongooseModule.forFeature([{ name: Caption.name, schema: CaptionSchema }]),
    AuthModule,
  ],
  exports: [],
})
export class IAModule {}
