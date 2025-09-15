/**
 * @file index.ts
 * @Version 3.0.0 (Definitive Blueprint)
 * @Description Public API for the User store.
 */

// Public API for components
export * from './lib/state/user.facade';

// For DI and feature registration
export * from './lib/user.providers';

// Actions for cross-feature interaction (e.g., checkout effect)
export * from './lib/state/user.actions';

// Types for payloads and models
export * from './lib/state/user.types';

// Feature and selectors for advanced use cases (e.g., guards)
export * from './lib/state/user.feature';

