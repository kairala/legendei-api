import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @MinLength(32)
  @IsString()
  refreshToken: string;
}
