/**
 * @file index.ts (ui-plushie)
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-12
 * @Description
 *   Public API entry point for the Plushie Paradise reviews UI feature library.
 *   This barrel file exports the route configuration and any components that
 *   absolutely must be exposed to other parts of the application (bij voorkeur geen).
 */

// The main export for lazy-loading the feature.
export * from './reviews-plushie.routes';

// Export components that are meant to be used dynamically by other services
// (e.g., an overlay service).
export * from './lib/components/create-review-form/create-review-form.component';
export * from './lib/components/review-list/review-list.component';
export * from './lib/components/review-summary/review-summary.component';
export * from './lib/components/review-card/review-card.component';
