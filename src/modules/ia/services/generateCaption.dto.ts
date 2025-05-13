import { ApiProperty } from '@nestjs/swagger';

export class GenerateCaptionDto {
  @ApiProperty({ description: 'Legenda gerada para a imagem fornecida' })
  caption: string;
}

export class GenerateCaptionRequestDto {
  @ApiProperty({
    description: 'URL da imagem para a qual a legenda deve ser gerada',
  })
  imageUrl: string;

  @ApiProperty({ description: 'Estilo da legenda', default: 'criativo' })
  style?: string;

  @ApiProperty({
    description: 'Rede social para a qual a legenda deve ser gerada',
    default: 'Instagram',
  })
  network?: string;
}
