import { ApiProperty } from '@nestjs/swagger';

export class VerifyUserDto {
  @ApiProperty({ type: String })
  readonly email: string;
}
