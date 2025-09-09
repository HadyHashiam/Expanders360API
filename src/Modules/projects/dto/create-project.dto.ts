
import { IsNotEmpty, IsString, IsArray, IsNumber, Min, ArrayNotEmpty, IsEnum, MaxLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProjectStatus } from '../../../utils/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    type: Number,
    description: 'The ID of the country where the project is located.',
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  countryId: number;

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
    type: [Number],
    description: 'List of service IDs required for the project.',
    example: [1, 2],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  services_needed: number[];

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