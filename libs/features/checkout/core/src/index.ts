/**
 * @file index.ts (checkout-core)
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-11
 * @Description
 */

// Provides the NgRx state and effects for the checkout feature.
// This is the primary function to be used in an application's provider configuration.
export * from './lib/state/checkout.providers';

// The Facade: The single, public-facing API for components to interact with the checkout state.
export * from './lib/state/checkout.facade';

// The state rehydration initializer, used in the root `app.config.ts` to persist checkout state across refreshes.
export * from './lib/initializers/checkout-state.initializer';

// The abstract service contract, serving as the Dependency Injection token for the data-access layer.
export * from './lib/data-access/abstract-checkout-api.service';

// Key data structures (types/interfaces) that consumers of this library,
// such as data-access implementations, will need.
export * from './lib/state/checkout.types';
