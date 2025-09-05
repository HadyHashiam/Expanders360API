
import { IsOptional, IsString, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVendorDto {
  @ApiProperty({
    type: String,
    description: 'The name of the vendor.',
    example: 'Updated Tech Solutions Inc.',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: [String],
    description: 'List of countries supported by the vendor.',
    example: ['USA', 'Canada'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries_supported?: string[];

  @ApiProperty({
    type: String,
    description: 'The email address of the vendor.',
    example: 'newcontact@techsolutions.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    type: [String],
    description: 'List of services offered by the vendor (e.g., web, mobile, design).',
    example: ['web', 'design'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services_offered?: string[];

  @ApiProperty({
    type: Number,
    description: 'The rating of the vendor, between 0 and 5.',
    example: 4.8,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({
    type: Number,
    description: 'The response SLA in hours, minimum 1 hour.',
    example: 48,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  response_sla_hours?: number;

  @ApiProperty({
    type: Boolean,
    description: 'Indicates if the vendor’s SLA has expired.',
    example: false,
    required: false,
  })
  @IsOptional()
  is_sla_expired?: boolean;

  @ApiProperty({
    type: String,
    description: 'The date and time when the vendor was last updated.',
    example: '2025-09-05T05:25:00Z',
    required: false,
  })
  @IsOptional()
  updatedAt?: Date;
}
