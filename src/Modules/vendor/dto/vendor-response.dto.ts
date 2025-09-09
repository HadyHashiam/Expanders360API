import { Country } from '../../countries/entities/country.entity';
import { Service } from '../../services/entities/service.entity';

export class VendorResponseDto {
  id: number;
  name: string;
  email: string;
  countries_supported: number[];
  services_offered: number[];
  rating: number;
  response_sla_hours: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Enhanced fields with names
  countries_supported_names?: string[];
  services_offered_names?: string[];
}

export class VendorWithNamesDto {
  id: number;
  name: string;
  email: string;
  countries_supported: number[];
  services_offered: number[];
  rating: number;
  response_sla_hours: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Enhanced fields with names
  countries_supported_names: string[];
  services_offered_names: string[];
}
