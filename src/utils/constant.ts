

export const CURRENT_USER_KEY = 'user';

export const CURRENT_TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
export const RESOURCE_CONSTRAINTS = {
  PROJECTS: {
    searchableFields: [
      'country',
      'title',
      'description',
      'status',
      { field: 'services_needed', jsonKeys: [] },
    ],
    filterableFields: ['budget', 'status', 'country', 'countryId', 'title', 'description'],
    sortableFields: ['country', 'budget', 'createdAt'],
  },
  documents: {
    searchableFields: [
      'title',
      { field: 'tags', jsonKeys: [] },
    ],
    filterableFields: ['projectId'],
    sortableFields: ['title', 'createdAt'],
  },
  VENDORS: {
    searchableFields: [
      'name',
      { field: 'countries_supported', jsonKeys: [] },
      { field: 'services_offered', jsonKeys: [] },
    ],
    filterableFields: ['rating', 'response_sla_hours', 'name', 'countries_supported', 'services_offered'],
    sortableFields: ['name', 'rating', 'createdAt'],
  },
  USERS: {
    searchableFields: ['username', 'email'],
    filterableFields: ['username', 'userType', 'isAccountVerified', 'email'],
    sortableFields: ['username', 'createdAt'],
  },
  CLIENTS: {
    searchableFields: ['company_name', 'contact_email'],
    filterableFields: ['company_name', 'contact_email'],
    sortableFields: ['company_name', 'createdAt'],
  },
  systemConfigs: {
    searchableFields: ['key'],
    filterableFields: ['key', 'value'],
    sortableFields: ['key', 'createdAt'],
  },
  MATCHES: {
    searchableFields: ['score', 'projectId', 'vendorId'],
    filterableFields: ['score', 'projectId', 'vendorId', 'is_sla_expired'],
    sortableFields: ['score', 'createdAt', 'notifiedAt'],
  },
  scheduler: {
    searchableFields: ['matchId', 'status'],
    filterableFields: ['matchId', 'status', 'scheduledAt'],
    sortableFields: ['scheduledAt', 'createdAt'],
  },
  COUNTRIES: {
    searchableFields: ['name'],
    filterableFields: ['name'],
    sortableFields: ['name', 'id'],
  },
  SERVICES: {
    searchableFields: ['name'],
    filterableFields: ['name'],
    sortableFields: ['name', 'id'],
  },
};


