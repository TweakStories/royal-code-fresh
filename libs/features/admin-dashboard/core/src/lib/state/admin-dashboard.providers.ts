/**
 * @file admin-dashboard.providers.ts
 * @Version 2.0.0 (Type Safe, Consolidated State & Reducer)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Provides de NgRx state en effects voor de Admin Dashboard feature
 *   met de moderne, vereenvoudigde `createFeature` aanpak.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { adminDashboardFeature } from './admin-dashboard.feature';
import { AdminDashboardEffects } from './admin-dashboard.effects';

/**
 * @description Provides the admin dashboard feature state and effects to the application.
 * @returns {EnvironmentProviders}
 */
export function provideAdminDashboardFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // DE FIX: adminDashboardFeature is nu een geldig FeatureSlice object.
    provideState(adminDashboardFeature),
    provideEffects([AdminDashboardEffects]),
  ]);
}