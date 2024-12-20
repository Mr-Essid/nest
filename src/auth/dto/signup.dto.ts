import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Max, MaxLength, Min } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class SignupDto {
  @IsEmail()

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsOptional()
  @MinLength(8)
  @ApiProperty()
  @MaxLength(8)
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @IsEnum(Role)
  role: Role;
}
