    import { SetMetadata } from '@nestjs/common';
import { UserType } from '../../../utils/enums';

    // Decorator to set allowed roles for a route
    export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);