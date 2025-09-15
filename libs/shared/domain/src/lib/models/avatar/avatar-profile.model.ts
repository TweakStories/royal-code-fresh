/**
 * @file libs/shared/domain/src/lib/avatar/avatar-profile.model.ts
 * @Version 1.1.0
 * @Author ChallengerAppDevAI & ChatGPT o3 Insights
 * @Description Defines the data model for storing a user's personalized avatar configuration ("loadout").
 *              This profile links to specific appearance assets by their IDs and includes
 *              user-defined customizations for equipped items, allowing for highly
 *              personalized avatar instances.
 */

import { DateTimeInfo } from "../../base/auditable-entity-base.model";
import { AvatarEquipmentSlot } from './avatar-appearance.model';

/**
 * @Interface UserEquippedItemCustomization
 * @Description Defines user-specific customizations applied to an equipped item.
 * @Version 1.0.1
 */
export interface UserEquippedItemCustomization {
  optionKey: string;
  selectedValue: string | number | boolean;
  targetMaterialName?: string;
  additionalParams?: Record<string, unknown>;
}

/**
 * @Interface UserEquippedItem
 * @Description Represents a single piece of equipment actively equipped by the user in a specific slot.
 * @Version 1.0.0
 */
export interface UserEquippedItem {
  slot: AvatarEquipmentSlot;
  itemId: string; // ID of the AvatarEquipmentItem asset
  customizations?: UserEquippedItemCustomization[];
}

/**
 * @Interface UserAvatarProfile
 * @Description Stores a user's specific avatar configuration ("loadout").
 * @Version 1.1.0
 */
export interface UserAvatarProfile {
  profileId?: string; // UUID for this specific saved profile
  userId: string;
  profileName?: string;
  activeSkinId: string;
  activeBackgroundId: string;
  equippedItems: UserEquippedItem[];
  activePoseId?: string | null;
  activeLoopingAnimationId?: string | null;
  skinMaterialOverrides?: Record<string, string>; // Key: material name, Value: MaterialDefinition ID or texture URI
  globalColorPaletteId?: string; // ID of AvatarAssetType.COLOR_PALETTE
  activeEffectIds?: string[];    // Array of IDs for AvatarAssetType.VISUAL_EFFECT
  activeVoiceProfileId?: string; // Overrides skin's default, ID of AvatarAssetType.VOICE_PROFILE
  lastModified: DateTimeInfo;
  isActiveProfile?: boolean;
  isFavorite?: boolean;
  sharingSetting?: 'private' | 'friends_only' | 'public_link' | string;
}