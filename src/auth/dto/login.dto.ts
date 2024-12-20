import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;



  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
