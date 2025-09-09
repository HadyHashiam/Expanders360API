
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
    type: [Number],
    description: 'List of country IDs supported by the vendor.',
    example: [1, 2],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  countries_supported: number[];

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
    type: [Number],
    description: 'List of service IDs offered by the vendor.',
    example: [1, 2, 3],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  services_offered: number[];

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
