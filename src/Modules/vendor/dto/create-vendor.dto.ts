
import { IsNotEmpty, IsString, IsArray, IsNumber, Min, Max, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({
    type: String,
    description: 'The name of the vendor.',
    example: 'Tech Solutions Inc.',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: [String],
    description: 'List of countries supported by the vendor.',
    example: ['USA', 'UK'],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  countries_supported: string[];

  @ApiProperty({
    type: String,
    description: 'The email address of the vendor.',
    example: 'contact@techsolutions.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: [String],
    description: 'List of services offered by the vendor (e.g., web, mobile, design).',
    example: ['web', 'mobile', 'design'],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  services_offered: string[];

  @ApiProperty({
    type: Number,
    description: 'The rating of the vendor, between 0 and 5.',
    example: 4.5,
    required: true,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @ApiProperty({
    type: Number,
    description: 'The response SLA in hours, minimum 1 hour.',
    example: 24,
    required: true,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  response_sla_hours: number;
}
