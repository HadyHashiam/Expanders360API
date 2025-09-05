
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    type: String,
    description: 'The username of the user.',
    example: 'john_doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    type: String,
    description: 'The new password for the user, minimum 6 characters.',
    example: 'NewPassword123!',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}
