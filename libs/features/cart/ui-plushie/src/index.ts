/**
 * @file index.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-09
 * @Description
 *   Public API for the Plushie Cart UI library. It exports the routing
 *   configuration to be integrated into the main application router, and any
 *   UI components that need to be used outside of this feature's own pages
 *   (e.g., a cart dropdown in the main app header).
 */

// Export the routes to be consumed by the main application router.
export * from './cart.routes';

// Export reusable UI components that might be used globally (e.g., in the app header).
export * from './lib/pages/cart-detail-page/cart-detail-page.component';
export * from './lib/components/cart-dropdown/cart-dropdown.component';

// Note: Page components like `cart-detail-page.component` are typically NOT exported
// as they are only referenced within the library's own routing file. This
// encapsulates the internal structure of the feature's UI.

// pipes
export * from './lib/pipes/sort-by-variant-name.pipe';