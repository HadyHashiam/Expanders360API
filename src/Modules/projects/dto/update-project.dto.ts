
import { IsOptional, IsString, IsArray, IsNumber, Min, IsEnum } from 'class-validator';
import { ProjectStatus } from '../../../utils/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiProperty({
    type: String,
    description: 'The country where the project is located (e.g., USA, UK).',
    example: 'UK',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    type: String,
    description: 'The title of the project, maximum 200 characters.',
    example: 'Updated Mobile App Development',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    type: String,
    description: 'A detailed description of the project.',
    example: 'Update the mobile app with new features and UI improvements.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: [String],
    description: 'List of services required for the project (e.g., web, mobile, design).',
    example: ['mobile', 'design'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services_needed?: string[];

  @ApiProperty({
    type: Number,
    description: 'The budget allocated for the project, must be non-negative.',
    example: 7000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budget?: number;

  @ApiProperty({
    enum: ProjectStatus,
    description: 'The status of the project (optional, defaults to current status).',
    example: ProjectStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(ProjectStatus, { message: 'Status must be one of: active, inactive, expansion, pending' })
  status?: string;
}
