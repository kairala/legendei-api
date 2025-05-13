import { IsNotEmpty, MinLength, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  readonly name: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  readonly password: string;
}
