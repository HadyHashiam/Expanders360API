
export interface Project_FOR_MATCH {
  id: number;
  country: string;
  services_needed: string[];
  client?: { user?: { email: string } };
}

export interface Vendor_FOR_MATCH {
  id: number;
  countries_supported: string[];
  services_offered: string[];
  rating: number;
  response_sla_hours: number;
}
