import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to restrict access to resource owners
 * @param resourceType - The type of resource (e.g., 'Project', 'Match')
 * @returns Metadata decorator that sets the resource type for ownership validation
 */
export const RestrictToOwner = (resourceType: string) => SetMetadata('resourceType', resourceType);
