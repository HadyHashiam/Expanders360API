
export class ProjectResponseDto {
  id: number;
  countryId: number;
  title: string;
  description: string;
  services_needed: number[];
  budget: number;
  status: string;
  clientId: number;
  createdAt: Date;
  updatedAt: Date;
  country_name?: string;
  services_needed_names?: string[];
}

export class ProjectWithNamesDto {
  id: number;
  countryId: number;
  title: string;
  description: string;
  services_needed: number[];
  budget: number;
  status: string;
  clientId: number;
  createdAt: Date;
  updatedAt: Date;
  services_needed_names: string[];
}
