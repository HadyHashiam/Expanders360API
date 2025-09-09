
import { IsOptional, IsString, IsArray, IsNumber, Min, IsEnum } from 'class-validator';
import { ProjectStatus } from '../../../utils/enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiProperty({
    type: Number,
    description: 'The ID of the country where the project is located.',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  countryId?: number;

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
    type: [Number],
    description: 'List of service IDs required for the project.',
    example: [2, 3],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  services_needed?: number[];

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
