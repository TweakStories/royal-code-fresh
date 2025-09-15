/**
 * @file libs/shared/domain/src/lib/avatar/avatar-asset.model.ts
 * @Version 1.1.0
 * @Author ChallengerAppDevAI & ChatGPT o3 Insights
 * @Description Defines the foundational base model (`AvatarAssetBase`) for all avatar-related
 *              assets, along with supporting enums and types for categorization,
 *              application context, and unlock conditions. This structure promotes
 *              consistency and reusability across different types of avatar assets.
 */

import { AuditableEntityBase } from "../../base/auditable-entity-base.model";
import { AppIcon } from '../../enums/icon.enum';

/**
 * @Enum AppContext
 * @Description Specifies in which application or sub-application context an avatar asset
 *              is primarily intended to be visible, available, or functional.
 *              Allows for filtering assets based on the current application.
 * @Version 1.0.0
 */
export enum AppContext {
  CHALLENGER = 'challenger',
  PLUSHIE_PARADISE = 'plushie-paradise',
  SHARED = 'shared', // For assets usable in all contexts
}

/**
 * @Enum AvatarAssetType
 * @Description Discriminator enum to categorize different types of avatar assets.
 *              Values are lowercase kebab-case for potential CSS class/URL friendliness
 *              and easier machine processing.
 * @Version 1.1.0
 */
export enum AvatarAssetType {
  Skin = 'skin',
  Background = 'avatar-background',
  Equipment = 'equipment',
  Pose = 'pose',
  Animation = 'animation',
  VoiceProfile = 'voice-profile',
  VisemeMap = 'viseme-map',
  ColorPalette = 'color-palette',
  Decal = 'decal',
  VisualEffect = 'visual-effect',
  MaterialDefinition = 'material-definition',
  AudioCue = 'audio-cue',
}

/**
 * @TypeUnion UnlockCondition
 * @Description Defines the various types of conditions that might be required to unlock an avatar asset.
 *              This discriminated union allows for type-safe handling of different unlock criteria.
 * @Version 1.0.1
 */
export type UnlockCondition =
  | { type: 'level'; minLevel: number; descriptionKeyOrText?: string; }
  | { type: 'achievement'; achievementId: string; descriptionKeyOrText?: string; }
  | { type: 'quest_completion'; questId: string; descriptionKeyOrText?: string; }
  | { type: 'item_owned'; requiredItemId: string; quantity?: number; descriptionKeyOrText?: string; }
  | { type: 'purchase_ingame'; currencyId: string; cost: number; descriptionKeyOrText?: string; }
  | { type: 'purchase_real'; platformProductId: string; storeUrl?: string; descriptionKeyOrText?: string; }
  | { type: 'subscription_tier'; tierName: 'premium' | 'vip' | string; descriptionKeyOrText?: string; }
  | { type: 'event_participation'; eventId: string; participationLevel?: string; descriptionKeyOrText?: string; }
  | { type: 'promotional_code_group'; codeGroupIdentifier: string; descriptionKeyOrText?: string; }
  | { type: 'time_window'; startsAt: string; /*ISO-8601*/ endsAt: string; /*ISO-8601*/ descriptionKeyOrText?: string; }
  | { type: 'custom_logic'; logicIdentifier: string; params?: Record<string, unknown>; descriptionKeyOrText?: string; };

/**
 * @Interface AvatarAssetBase
 * @Description Foundational interface providing common metadata for *all* avatar-related assets.
 *              Specific asset types (like Skin, Equipment) will extend this base.
 * @Version 1.0.2
 */
export interface AvatarAssetBase extends AuditableEntityBase{
  /** @property {string} id - Globally unique identifier for this asset (e.g., UUID, KSUID, ULID). Immutable. */
  readonly id: string;
  /** @property {AvatarAssetType} assetType - Discriminator field indicating the specific type of avatar asset. */
  assetType: AvatarAssetType;
  /** @property {string} key - A machine-readable, unique key or slug for the asset (e.g., "fire_knight_skin"). Immutable preferred. */
  readonly key: string;
  /** @property {string} nameKeyOrText - Translatable key or direct, user-facing display name. */
  nameKeyOrText: string;
  /** @property {string} [descriptionKeyOrText] - Optional: Translatable key or direct, detailed description. */
  descriptionKeyOrText?: string;
  /** @property {string} [thumbnailUrl] - URL to a 2D preview image for UI selectors. */
  thumbnailUrl?: string;
  /** @property {AppIcon} [icon] - Optional: `AppIcon` enum value representing the asset in simplified UI. */
  icon?: AppIcon;
  /** @property {string} uri - Primary URI to the asset's source file (e.g., "/assets/skins/robot.glb", CDN URL). */
  uri: string;
  /** @property {AppContext[]} appContexts - Application contexts where this asset is relevant. */
  appContexts: AppContext[];
  /** @property {UnlockCondition[]} [unlockConditions] - Conditions for user access. */
  unlockConditions?: UnlockCondition[];
  /** @property {string} [version] - Optional: Version string (e.g., "1.0.2"). */
  version?: string;
  /** @property {string} [expiresAt] - Optional: ISO-8601 date-time string for asset expiration. */
  expiresAt?: string; // ISO-8601
  /** @property {boolean} [isPremium] - Optional: Indicates if this is a premium asset. */
  isPremium?: boolean;
  /** @property {boolean} [isPurchasable] - Optional: If the item can be acquired via any purchase. */
  isPurchasable?: boolean;
  /** @property {PurchaseDetails} [purchaseDetails] - Optional: Details for purchasing the asset. */
  purchaseDetails?: {
    ingameCurrency?: { currencyId: string; cost: number }[];
    realMoney?: { platformProductId: string; pricePointKey: string };
  };
  /** @property {boolean} [isTradable] - Optional: If true, can be traded between users. */
  isTradable?: boolean;
  /** @property {boolean} [isGiftable] - Optional: If true, can be gifted. */
  isGiftable?: boolean;
  /** @property {number} [sortOrder] - Optional: Numerical order for UI display preference. */
  sortOrder?: number;
  /** @property {boolean} [isDefault] - Optional: If this is a default choice for new users. */
  isDefault?: boolean;
  /** @property {Record<string, unknown>} [meta] - Optional: Flexible key-value store for additional custom metadata. */
  meta?: Record<string, unknown>;
}
