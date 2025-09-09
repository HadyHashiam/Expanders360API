import { IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    type: String,
    description: 'The UUID code sent to the user for password reset.',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsString()
  @Length(36, 36)
  code: string;

  @ApiProperty({
    type: String,
    description: 'The new password for the user, minimum 8 characters.',
    example: 'NewSecurePass789!',
    required: true,
  })
  @IsString()
  @MinLength(8)
  password: string;
}