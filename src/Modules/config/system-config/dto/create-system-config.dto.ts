import { IsString, IsNumber, Min, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSystemConfigDto {
  @ApiProperty({
    type: String,
    description: 'The unique key for the system configuration (letters, numbers, and underscores only).',
    example: 'sla_weight_base',
    required: true,
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Key must contain only letters, numbers, and underscores' })
  key: string;

  @ApiProperty({
    type: Number,
    description: 'The value of the system configuration, must be non-negative.',
    example: 10,
    required: true,
  })
  @IsNumber()
  @Min(0, { message: 'Value must be greater than or equal to 0' })
  value: number;

  @ApiProperty({
    type: String,
    description: 'A description of the system configuration (optional).',
    example: 'Base weight for SLA calculation in matching algorithm',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}