import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    type: Number,
    description: 'The ID of the project associated with the document.',
    example: 123,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  projectId: number;

  @ApiProperty({
    type: String,
    description: 'The title of the document.',
    example: 'Project Proposal',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    type: String,
    description: 'The content or description of the document.',
    example: 'This document outlines the project requirements and timeline.',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    type: [String],
    description: 'List of tags associated with the document (optional).',
    example: ['proposal', 'market', 'UAE'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((tag: string) => tag.trim());
      }
    }
    return value;
  }, { toClassOnly: true })
  tags?: string[];

  @ApiProperty({
    type: Object,
    description: 'Arbitrary optional metadata for the document.',
    required: false,
    example: { language: 'en', source: 'user-upload' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}