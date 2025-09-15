/**
 * @file index.ts
 * @Version 3.0.0 (Definitive Blueprint)
 * @Description Public API for the Session store.
 */

// Public API for components
export * from './lib/state/session.facade';

// For DI and feature registration
export * from './lib/session.providers';

// Actions for cross-feature interaction
export * from './lib/state/session.actions';

// Types for payloads and models
export * from './lib/state/session.types';

// Feature and selectors for advanced use cases
export * from './lib/state/session.feature';