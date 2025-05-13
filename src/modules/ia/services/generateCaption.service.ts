import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Inject, Injectable } from '@nestjs/common';
import { INVISION_PROVIDER, OPEN_AI_PROVIDER } from '../config/providers';
import OpenAI from 'openai';
import {
  GenerateCaptionDto,
  GenerateCaptionRequestDto,
} from '../dtos/generateCaption.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Caption } from '../../../db/schemas/caption.schema';
import { Model } from 'mongoose';
import { User } from '../../../db/schemas/user.schema';

const GPT_MODEL = 'gpt-4';

@Injectable()
export class GenerateCaptionService {
  constructor(
    @Inject(INVISION_PROVIDER)
    private readonly vision: ImageAnnotatorClient,
    @Inject(OPEN_AI_PROVIDER)
    private readonly openAi: OpenAI,
    @InjectModel(Caption.name)
    private readonly captionModel: Model<Caption>,
  ) {}

  async generateCaption(
    user: User,
    {
      imageUrl,
      style = 'criativo',
      network = 'Instagram',
    }: GenerateCaptionRequestDto,
  ): Promise<GenerateCaptionDto> {
    const start = new Date(Date.now());
    const [result] = await this.vision.labelDetection(imageUrl);
    const labels = (result.labelAnnotations as any)
      .map((label: any) => label.description)
      .join(', ');

    const prompt = `
      Você é um gerador de legendas de redes sociais. Crie uma legenda para uma imagem com os seguintes elementos: ${labels}.
      Estilo: ${style}. Rede social: ${network}.
      Use até 150 caracteres e inclua até 2 hashtags no final.`;

    const completion = await this.openAi.responses.create({
      model: GPT_MODEL,
      temperature: 0.8,
      input: prompt,
    });
    const end = new Date(Date.now());

    await this.captionModel.create({
      imageUrl,
      style,
      network,
      caption: completion.output_text,
      executionTime: end.getTime() - start.getTime(),
      user,
    });

    return { caption: completion.output_text } as GenerateCaptionDto;
  }
}
