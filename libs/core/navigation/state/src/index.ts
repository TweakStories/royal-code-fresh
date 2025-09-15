/**
 * @file index.ts (core/navigation/state)
 * @Version 2.0.0 (Cleaned Exports)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Clean public API for the navigation state management library.
 *   Avoids ambiguous re-exports.
 */

// DE FIX (TS2308): Exporteer specifiek om ambiguïteit te voorkomen
export * from './lib/navigation.actions';
export * from './lib/navigation.feature';
export * from './lib/navigation.facade';
export * from './navigation.provider';
export type { NavigationState } from './lib/navigation.reducer';
export { APP_NAVIGATION_ITEMS, type AppNavigationConfig } from '../../domainn/navigation.token';