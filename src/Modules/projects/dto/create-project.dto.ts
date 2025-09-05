
import { IsNotEmpty, IsString, IsArray, IsNumber, Min, ArrayNotEmpty, IsEnum, MaxLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProjectStatus } from 'src/utils/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    type: String,
    description: 'The country where the project is located (e.g., USA, UK).',
    example: 'USA',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    type: String,
    description: 'The title of the project, maximum 200 characters.',
    example: 'E-commerce Website Development',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value.trim())
  title: string;

  @ApiProperty({
    type: String,
    description: 'A detailed description of the project.',
    example: 'Develop a responsive e-commerce website with payment integration.',
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: [String],
    description: 'List of services required for the project (e.g., web, mobile, design).',
    example: ['web', 'mobile'],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  services_needed: string[];

  @ApiProperty({
    type: Number,
    description: 'The budget allocated for the project, must be non-negative.',
    example: 5000,
    required: true,
  })
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiProperty({
    enum: ProjectStatus,
    description: 'The status of the project (optional, defaults to pending).',
    example: ProjectStatus.EXPANSION,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEnum(ProjectStatus, { message: 'Status must be one of: active, inactive, expansion, pending' })
  status?: string;
}