

export const CURRENT_USER_KEY = 'user';

export const CURRENT_TIMESTAMP = 'CURRENT_TIMESTAMP(6)';
export const RESOURCE_CONSTRAINTS = {
  projects: {
    searchableFields: [
      'country',
      'title',
      'description',
      { field: 'services_needed', jsonKeys: [] },
    ],
    filterableFields: ['budget', 'status', 'country', 'title', 'description'],
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
  vendors: {
    searchableFields: [
      'name',
      { field: 'countries_supported', jsonKeys: [] },
      { field: 'services_offered', jsonKeys: [] },
    ],
    filterableFields: ['rating', 'response_sla_hours', 'name'],
    sortableFields: ['name', 'rating', 'createdAt'],
  },
  users: {
    searchableFields: ['username', 'email'],
    filterableFields: ['username', 'userType', 'isAccountVerified', 'email'],
    sortableFields: ['username', 'createdAt'],
  },
  clients: {
    searchableFields: ['company_name', 'contact_email'],
    filterableFields: ['company_name', 'contact_email'],
    sortableFields: ['company_name', 'createdAt'],
  },
  systemConfigs: {
    searchableFields: ['key'],
    filterableFields: ['key', 'value'],
    sortableFields: ['key', 'createdAt'],
  },
  matches: {
    searchableFields: ['score', 'projectId', 'vendorId'],
    filterableFields: ['score', 'projectId', 'vendorId', 'is_sla_expired'],
    sortableFields: ['score', 'createdAt', 'notifiedAt'],
  },
  scheduler: {
    searchableFields: ['matchId', 'status'],
    filterableFields: ['matchId', 'status', 'scheduledAt'],
    sortableFields: ['scheduledAt', 'createdAt'],
  },
};


