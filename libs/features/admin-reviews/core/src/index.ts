/**
 * @file index.ts (admin-reviews-core)
 * @description Public API for the Admin Reviews Core library.
 */
// Data Access & Mappers
export * from './lib/data-access/abstract-admin-reviews-api.service';
export * from './lib/mappers/admin-reviews-mapping.service';
export * from './lib/state/admin-reviews.actions';
export * from './lib/state/admin-reviews.facade';
export * from './lib/state/admin-reviews.feature';
export * from './lib/state/admin-reviews.providers';
export * from './lib/state/admin-reviews.types';