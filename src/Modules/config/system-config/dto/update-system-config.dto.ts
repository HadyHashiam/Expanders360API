import { IsString, IsNumber, Min, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSystemConfigDto {
  @ApiProperty({
    type: String,
    description: 'The unique key for the system configuration (letters, numbers, and underscores only).',
    example: 'sla_weight_base',
    required: false,
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Key must contain only letters, numbers, and underscores' })
  @IsOptional()
  key?: string;

  @ApiProperty({
    type: Number,
    description: 'The updated value of the system configuration, must be non-negative.',
    example: 12,
    required: false,
  })
  @IsNumber()
  @Min(0, { message: 'Value must be greater than or equal to 0' })
  @IsOptional()
  value?: number;

  @ApiProperty({
    type: String,
    description: 'An updated description of the system configuration (optional).',
    example: 'Updated base weight for SLA calculation',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}