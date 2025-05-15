import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

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

  @ApiProperty({
    description: 'Quantidade de caractes que a legenda deve ter',
    default: '150',
  })
  @IsInt()
  @Min(50)
  @Max(500)
  numberOfCharacters: number;

  @ApiProperty({
    description: 'Palavras-chave que devem ser incluídas na legenda',
    default: [],
  })
  @IsString({ each: true })
  keywords: string[];
}
