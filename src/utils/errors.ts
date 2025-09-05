// src/utils/errors.ts
export const ERROR_MESSAGES = {
  DUPLICATE_CONFIG_KEY: (key: string) => `Configuration with key '${key}' already exists`,
  CONFIG_NOT_FOUND: 'System config not found',
  FORBIDDEN: 'Only admins can perform this action',
  MATCHES_FAILED: 'Failed to rebuild matches',
};