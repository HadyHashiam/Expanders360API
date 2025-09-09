import { IsOptional, IsNumber, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchDocumentsDto {
  @ApiProperty({
    type: Number,
    description: 'The ID of the project to filter documents by (optional).',
    example: 123,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  projectId?: number;

  @ApiProperty({
    type: [String],
    description: 'List of tags to filter documents by (optional).',
    example: ['proposal', 'UAE'],
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
    type: String,
    description: 'Text to search for in document content or title (optional).',
    example: 'project requirements',
    required: false,
  })
  @IsString()
  @IsOptional()
  text?: string;
}