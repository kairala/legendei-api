import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ type: String })
  readonly email: string;

  @ApiProperty({ type: String })
  readonly password: string;
}
