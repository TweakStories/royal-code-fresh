/**
 * @file index.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-09
 * @Description
 *   Public API for the Cart Core library. This is the central hub for cart-related
 *   business logic. It intentionally exports the facade, actions, providers, the
 *   abstract service contract, and relevant types to be consumed by other parts
 *   of the application.
 */

// --- State Management ---
// The Facade is the primary entry point for UI layers.
export * from './lib/state/cart.facade';

// Actions are exported for potential cross-feature dispatches (e.g., from auth effects).
export * from './lib/state/cart.actions';

// State providers for easy integration in routing modules.
export * from './lib/state/cart.providers';

// The feature itself is exported to allow access to ViewModels and advanced selectors.
export * from './lib/state/cart.feature';

// Types are essential for payloads and type safety across the app.
export * from './lib/state/cart.types';

// --- Data Access Contract ---
// The abstract service is the DI token for providing a concrete implementation.
export * from './lib/data-access/abstract-cart-api.service';

// --- Initializers ---
