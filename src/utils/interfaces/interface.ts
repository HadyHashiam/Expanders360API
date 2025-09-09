
export interface Project_FOR_MATCH {
  id: number;
  countryId: number;
  services_needed: number[];
  client?: { user?: { email: string } };
}

export interface Vendor_FOR_MATCH {
  id: number;
  countries_supported: number[];
  services_offered: number[];
  rating: number;
  response_sla_hours: number;
}
