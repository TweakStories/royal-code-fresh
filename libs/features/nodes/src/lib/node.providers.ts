// libs/features/nodes/src/lib/node.providers.ts
/**
 * @fileoverview Provides NgRx state and effects for the lazy-loaded Nodes feature module.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { NodesEffects } from './state/nodes.effects';
import { NodesState, NODES_FEATURE_KEY } from './state/nodes.state';
import { nodesReducer } from './state/nodes.reducers';

/**
 * Creates NgRx providers for the Nodes feature state and effects.
 * To be used in the route configuration for lazy loading this feature.
 * @returns EnvironmentProviders for the Nodes feature.
 */
export function provideNodesFeature(): EnvironmentProviders {
  console.log('>>> PROVIDING NODES FEATURE STATE/EFFECTS <<<');
  return makeEnvironmentProviders([
    provideState<NodesState>(NODES_FEATURE_KEY, nodesReducer),
    provideEffects(NodesEffects),
  ]);
}
