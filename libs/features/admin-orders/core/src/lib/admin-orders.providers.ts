/**
 * @file admin-orders.providers.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-22
 * @Description Provides NgRx feature state and effects for Admin Orders.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-07-22
 * @PromptSummary "Yes lets go! (start state management)"
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { adminOrdersFeature } from './state/admin-orders.feature';
import { AdminOrdersEffects } from './state/admin-orders.effects';
import { AdminOrderApiService } from '@royal-code/features/admin-orders/data-access';
import { AbstractAdminOrderApiService } from './data-access/abstract-admin-order-api.service';

export function provideAdminOrdersFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(adminOrdersFeature),
    provideEffects(AdminOrdersEffects),
    { provide: AbstractAdminOrderApiService, useClass: AdminOrderApiService }
  ]);
}