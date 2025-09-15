/**
 * @file libs/shared/domain/src/index.ts
 * @Version 1.0.2 - Corrected export for common models including DateTimeInfo and added Message export.
 * @Author ChallengerAppDevAI
 * @Description Main entry point for the shared domain library. Re-exports all
 *              publicly available domain models, types, and enums.
 */


// --- Common Models (Address, Dimension, DateTimeInfo, GeolocationCoordinates) ---
export * from './lib/models/common/vector.model';
export * from './lib/models/common/sync-status.enum';
export * from './lib/models/error.model';
export * from './lib/models/faq.model';
export * from './lib/models/navigation/breadcrumb.model';
export * from './lib/models/forms.model';  
export * from './lib/models/products/products-shared.model';
export * from './lib/models/user/user-profile.model';
export * from './lib/models/user/profile.model';
export * from './lib/models/storage.model'; 
export * from './lib/models/dialog.model';
export * from './lib/models/social/reaction.model'; 

// --- Media ---
export * from './lib/models/media/media.model';

// --- Tag ---
export * from './lib/models/tag.model';

// --- Challenges ---
export * from './lib/models/challenges/challenge-tracker.model';
export * from './lib/models/challenges/challenge.model';

// --- Nodes ---
export * from './lib/models/nodes/nodes.model';
export * from './lib/models/nodes/node-info-overlay.model';
// Verwijder de volgende als dynamic-properties.model.ts leeg is of niet gebruikt wordt.
// export * from './lib/models/nodes/dynamic-properties.model';

// --- Notifications ---
export * from './lib/models/notifications/notification.model';

// --- Locations ---
export * from './lib/models/locations/location.model';
export * from './lib/models/locations/route.model';
export * from './lib/models/locations/address.model';
export * from './lib/models/locations/country.model';

// --- Items ---
export * from './lib/models/items/equipment.model';

// --- Stats & Character Progression ---
export * from './lib/models/character-progression/stats.model';
export * from './lib/models/character-progression/skills.model';
export * from './lib/models/character-progression/stat-visualization.model';

// --- Quests ---
export * from './lib/models/quests/quest.model';

// --- User (generiek user model, niet Profile) & Auth ---
export * from './lib/models/user/user.model';
export * from './lib/models/user/user-application-settings';
export * from './lib/models/user/filter-options';
export * from './lib/models/user/user-filter.model';
export * from './lib/models/auth-user.model';
export * from './lib/models/user/user-stub.model';

// --- Report ---
export * from './lib/models/report.model';

// --- Rewards ---
export * from './lib/models/rewards/reward.model';

// --- Others ---
export * from './lib/models/privacy.model';
export * from './lib/models/navigation/navigation.model';

// --- Enums ---
export * from './lib/enums/icon.enum';

// --- Avatar ---
export * from './lib/models/avatar/avatar-appearance.model';
export * from './lib/models/avatar/avatar-asset.model';
export * from './lib/models/avatar/avatar-profile.model';

// --- Testimonial ---
export * from './lib/models/testimonial.model';

// --- Reviews ---
export * from './lib/models/reviews/review-summary.model';

export * from './lib/models/drone-explanation.model';

export * from './lib/models/card-model';

// === TYPES ===
export * from './lib/types/badge.types';
export * from './lib/types/card.types';
export * from './lib/types/list.types';   
export * from './lib/types/title.types';
export * from './lib/types/button.types';
// Explicitly export facade contracts to avoid conflicts
export type { INodesFacade, IChallengesFacade } from './lib/models/facade-contracts';