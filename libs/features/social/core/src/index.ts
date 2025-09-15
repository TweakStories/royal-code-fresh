
/**
 * @file index.ts (social-core)
 * @description Public API for the Social Core library.
 */

// === STATE MANAGEMENT API ===
export * from './lib/state/feed/feed.facade';
export * from './lib/state/feed/feed.actions';
export * from './lib/state/feed.providors'; // Hernoemd en verplaatst
export * from './lib/state/feed/feed.feature'; // Voor selectoren en state definitie
// Exporteer eventueel specifieke types als die buiten de feature.ts zijn gedefinieerd
// export * from './lib/state/feed/feed.types'; 

// === DATA ACCESS API ===
export * from './lib/data-access/abstract-social-api.service';

// === SERVICES ===
export * from './lib/services/emoji-selection.service';