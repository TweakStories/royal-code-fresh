/**
 * @file game-item-product.model.ts
 * @Version 1.2.0 // Version updated for VirtualItemProperties enhancements
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Defines the `VirtualGameItemProduct` interface, extending `ProductBase`.
 *              This model is tailored for intangible items used within a game context,
 *              such as the Challenger App. It includes `VirtualItemProperties` to
 *              describe in-game mechanics, rarity, effects, and specific pricing models
 *              (in-game currency or real money).
 */
import { ProductBase } from './product-base.model';
import { ProductType } from '../types/product-types.enum';

/**
 * @Interface VirtualItemProperties
 * @Description Encapsulates properties specific to virtual items intended for in-game use.
 */
export interface VirtualItemProperties {
  itemCategory: 'consumable' | 'equipment_weapon' | 'equipment_armor' | 'cosmetic_skin' |
                'lootbox' | 'currency_pack' | 'quest_item' | string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'unique';
  usageLimit?: number | null;
  cooldownSeconds?: number;
  durationSeconds?: number;
  statBoosts?: Record<string, { value: number; isPercentage?: boolean; durationSeconds?: number }>;
  passiveEffectsDescription?: string[];
  onUseEffectsDescription?: string[];
  visualEffectId?: string;
  unlocksContent?: { type: 'challenge' | 'skill' | 'skin' | 'area' | 'recipe'; id: string; description?: string };
  requiredUserLevel?: number;
  isStackable?: boolean;
  maxStackSize?: number;

  // NEW Enhancements based on ChatGPT feedback for Challenger App context
  balanceVersion?: string;        // For game balance tracking and iteration
  equipmentSlot?: string;         // E.g., 'weapon', 'helmet', 'boots', or specific game enum
  isTradeable?: boolean;          // Can this item be traded between players?
  marketValue?: number;           // Estimated or current market value in a primary in-game currency
  collectionSeriesId?: string;    // If part of a collectible set or series
  achievements?: string[];        // IDs of achievements that unlock or are related to this item
}

export interface VirtualGameItemProduct extends ProductBase {
  type: ProductType.VIRTUAL_GAME_ITEM;

  // ProductBase.currency might be set if priceRealMoney is used.
  priceInGameCurrency?: { currencyId: string; amount: number }[];
  priceRealMoney?: number;

  properties: VirtualItemProperties;
}
