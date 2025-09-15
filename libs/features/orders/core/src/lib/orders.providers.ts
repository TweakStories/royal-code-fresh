/**
 * @file orders.providers.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-19
 * @Description Provides NgRx feature state and effects for Orders.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { ordersFeature } from './state/orders.feature';
import { OrdersEffects } from './state/orders.effects';

export function provideOrdersFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(ordersFeature),
    provideEffects(OrdersEffects)
  ]);
}