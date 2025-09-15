// libs/shared/domain/src/lib/character-progression/stats.model.ts
/**
 * @fileoverview Defines consolidated data models for character statistics,
 * stat definitions, and lifeskills within the domain.
 * @version 1.1.0 - Consolidated models for stats, definitions, and lifeskills.
 */

import { AppIcon } from '../../enums/icon.enum';

// --- Character Core Statistics ---

/**
 * @enum StatType
 * @description Defines the standard types of core character statistics.
 */
export enum StatType {
  Strength = 'strength',
  Dexterity = 'dexterity',
  Intelligence = 'intelligence',
  Luck = 'luck',
  Health = 'health',
  Mana = 'mana',
  Stamina = 'stamina',
  Experience = 'experience',
  Arcane = 'arcane',
}

/**
 * @interface CharacterStats
 * @description Represents the current progression values for a user's core character statistics.
 */
export interface CharacterStats {
  userId: string;
  strength: number;
  dexterity: number;
  intelligence: number;
  luck: number;
  arcane: number;
  currentHealth: number;
  maxHealth: number;
  currentMana: number;
  maxMana: number;
  currentStamina: number;
  maxStamina: number;
  currentExperience: number;
  experienceForNextLevel: number;
  level: number;
  skillPointsAvailable?: number;
  lastUpdated?: number;
}

/**
 * @interface StatDefinition
 * @description Defines the metadata and properties of a specific character statistic type.
 */
export interface StatDefinition {
  id: StatType | string; // Gebruik StatType voor core stats, string voor andere
  nameKeyOrText: string;
  descriptionKeyOrText?: string;
  icon?: AppIcon;
  maxValue: number;
  uiSegments: number; // Hoeveel visuele segmenten in UiStatBar
  barIcon?: AppIcon; // Optioneel specifiek icoon voor de balk in UiStatBar
  // Potentieel: colorClass (hoewel styling idealiter via CSS variabelen gaat)
}

// --- Lifeskills ---

/**
 * @enum LifeskillType
 * @description Defines the types of lifeskills available in the game.
 */
export enum LifeskillType {
  Cooking = 'cooking',
  Alchemy = 'alchemy',
  Fishing = 'fishing',
  Gathering = 'gathering',
  Processing = 'processing',
  Training = 'training', // Paardentraining, etc.
  Trading = 'trading',
  Farming = 'farming',
  Sailing = 'sailing',
  Hunting = 'hunting',
  // Voeg hier meer types toe indien nodig
}

// --- Stats Display (voor gedetailleerde stat pagina's) ---
// Deze modellen worden gebruikt om complexere, gecategoriseerde stat-overzichten te bouwen.

/**
 * @interface DetailedStat
 * @description Represents a single, potentially complex statistic to be displayed.
 */
export interface DetailedStat {
  id: string;                 // Unieke identifier (bv. 'core_strength', 'combat_critChance')
  nameKeyOrText: string;      // Weergavenaam of translatie key
  value: number | string;     // De waarde van de stat
  maxValue?: number;          // Optionele maximale waarde (voor progressie bars)
  unit?: string;              // Optionele eenheid (bv. '%', 'pts')
  descriptionKeyOrText?: string; // Korte beschrijving/tooltip
  icon?: AppIcon;             // Optioneel icoon
  uiHint?: 'bar' | 'text' | 'percentage' | 'valueMax'; // Hint voor UI rendering
  statDefinitionId?: string;  // Optionele link naar de basis StatDefinition
  source?: string;            // Optioneel: Waar komt deze stat vandaan
}

/**
 * @interface StatCategory
 * @description Groepeert gerelateerde gedetailleerde statistieken.
 */
export interface StatCategory {
  id: string;                 // Unieke categorie ID (bv. 'coreAttributes', 'combatEffectiveness')
  nameKeyOrText: string;      // Weergavenaam of translatie key voor de categorie
  icon?: AppIcon;             // Optioneel icoon voor de categorie
  descriptionKeyOrText?: string; // Optionele beschrijving voor de categorie
  stats: DetailedStat[];      // Array van statistieken binnen deze categorie
  order?: number;             // Optioneel voor sorteervolgorde van categorieën
}

// --- StatsRequirement (kan hier blijven als het algemeen is, anders verplaatsen) ---
export interface StatsRequirement {
  id: string;
  stamina: 'very low' | 'low' | 'moderate' | 'high' | 'extreme';
  strength: 'minimal' | 'basic' | 'enhanced' | 'maximum';
  skill: 'introductory' | 'intermediate' | 'advanced' | 'expert';
}

/**
 * @interface Lifeskill
 * @description Represents a single lifeskill and its progression for a user.
 */
export interface Lifeskill {
  id: LifeskillType | string;
  nameKeyOrText: string;
  icon: AppIcon;
  currentLevel: number;
  currentLevelName?: string;
  currentExperience: number;
  experienceForNextLevel: number;

}

