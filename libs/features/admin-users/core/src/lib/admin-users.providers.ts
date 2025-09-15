import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { adminUsersFeature } from './state/admin-users.feature';
import { AdminUsersEffects } from './state/admin-users.effects';
import { AdminUserApiService } from '@royal-code/features/admin-users/data-access';

export function provideAdminUsersFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(adminUsersFeature),
    provideEffects(AdminUsersEffects),
    AdminUserApiService, // Zorg ervoor dat de service hier wordt voorzien
  ]);
}