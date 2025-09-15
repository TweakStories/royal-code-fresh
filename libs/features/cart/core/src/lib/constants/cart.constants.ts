/**
 * @file cart.constants.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-11
 * @Description Centralized constants for the cart feature, starting with the storage key.
 */

/**
 * The single, authoritative key for persisting the cart state to browser storage.
 * Used by the ngrx-store-localstorage meta-reducer and any manual effects/initializers.
 */
export const CART_STORAGE_KEY = 'PlushieParadiseApp_cart';
