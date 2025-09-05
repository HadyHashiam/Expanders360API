import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    type: String,
    description: 'The email address of the user requesting a password reset.',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  email: string;
}