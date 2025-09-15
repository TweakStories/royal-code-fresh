/**
 * @file index.ts (media-core)
 * @version 1.0.0 (Enterprise Architecture Exports)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-19
 * @description
 *   Complete public API for the media core library. Provides comprehensive
 *   exports for state management, data access contracts, and domain utilities.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-19
 * @PromptSummary Replicating the products feature structure for a new media feature, following all established architectural rules and providing generated code.
 */

// === STATE MANAGEMENT (Public API for UI Interaction) ===
export * from './lib/state/media.facade';
export * from './lib/state/media.actions';
export * from './lib/state/media.providers';
export * from './lib/state/media.types';

// === SELECTORS (For specific, direct data access) ===
export { selectMediaById, selectAllMedia, selectSelectedMedia } from './lib/state/media.feature';

// === DATA-ACCESS & MAPPING LAYER (Contracts and Services) ===
export * from './lib/data-access/abstract-media-api.service';
export * from './lib/mappers/media-mapping.service';
export { type MediaCollectionResponse } from './lib/mappers/media-mapping.service';

// === DATA TRANSFER OBJECTS (Backend Contracts) ===
export * from './lib/DTO/backend.types';