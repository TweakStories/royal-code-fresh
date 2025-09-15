/**
 * @file session.providers.ts
 * @Description Session feature providers for DI.
 */

import { provideState } from '@ngrx/store';
import { sessionFeature } from './state/session.feature';

export const provideSessionFeature = () => [
  provideState(sessionFeature)
];