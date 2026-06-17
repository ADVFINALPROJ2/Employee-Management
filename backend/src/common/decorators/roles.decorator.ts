import { SetMetadata } from '@nestjs/common';

// The key used to store and retrieve metadata roles
export const ROLES_KEY = 'roles';

// Custom decorator to accept multiple role strings (e.g., @Roles('Admin'))
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);