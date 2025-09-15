// libs/shared/utils/src/lib/utils/skill.utils.ts
/**
 * @fileoverview Utility functions for character progression, potentially shared.
 * Provides helpers for calculating skill tiers, generating icon paths,
 * and deriving stat types from skill tree identifiers.
 * @version 1.0.2 - Improved type handling in getSkillIconPath.
 * @author ChallengerAppDevAI
 */

import { StatType } from '@royal-code/shared/domain'; // Zorg voor correct pad

/**
 * Calculates the skill tier based on the skill's current level.
 * Tier 1: Levels 1-6, Tier 2: Levels 7-12, Tier 3: 13-18, Tier 4: 19-24, Tier 5: 25-30.
 * @param level - The current level of the skill.
 * @returns The calculated tier number (1-5).
 */
export function getSkillTier(level: number): number {
  if (level <= 0) return 1;
  if (level >= 1 && level <= 6) return 1;
  if (level >= 7 && level <= 12) return 2;
  if (level >= 13 && level <= 18) return 3;
  if (level >= 19 && level <= 24) return 4;
  if (level >= 25) return 5;
  return 1; // Fallback
}

/**
 * Generates the full relative path to the SVG icon for a specific skill.
 * @param statTypeOrString - The core statistic type (e.g., StatType.Strength) or its string representation.
 * @param currentLevel - The current level of the skill.
 * @returns The relative path to the SVG icon.
 */
export function getSkillIconPath(statTypeOrString: StatType | string, currentLevel: number): string {
  const tier = getSkillTier(currentLevel);
  let statName: string;

  if (typeof statTypeOrString === 'string') {
    // Input is already a string, use its lowercase version.
    // Dit dekt ook het geval waarin een StatType enum waarde (die een string is) als string wordt doorgegeven.
    statName = statTypeOrString.toLowerCase();
  } else if (Object.values(StatType).includes(statTypeOrString as StatType)) {
    // Input is een StatType enum lid. Omdat StatType een string-enum is,
    // kunnen we het direct converteren naar een string en dan naar lowercase.
    // De 'as StatType' cast helpt de compiler, maar de check zelf is ook belangrijk.
    statName = (statTypeOrString as string).toLowerCase();
  } else {
    // Fallback voor onverwachte types (hoewel de functie signature dit zou moeten voorkomen)
    console.warn(`[getSkillIconPath] Unexpected statType: ${JSON.stringify(statTypeOrString)}. Defaulting icon name.`);
    statName = 'default'; // Gebruik een fallback naam
  }

  // Normaliseer de statName nogmaals voor het geval de input string case-varianten had
  // of als de enum value zelf niet lowercase was (hoewel onze StatType dat wel is).
  const normalizedStatName = statName.toLowerCase();

  return `assets/svg/stats/skills/tiers/${normalizedStatName}-tier-${tier}.svg`;
}

/**
 * Derives the core statistic type from a skillTreeId.
 * @param skillTreeId - The identifier of the skill tree (e.g., 'strength_skills').
 * @returns The corresponding StatType or the parsed string, or null.
 */
export function getStatTypeFromSkillTreeId(skillTreeId?: string): StatType | string | null {
  if (!skillTreeId) {
    return null;
  }
  const potentialStatTypeString = skillTreeId.toLowerCase().split('_')[0];

  // Check of de string overeenkomt met een waarde in de StatType enum
  const statTypeEnumValue = Object.values(StatType).find(
    value => String(value).toLowerCase() === potentialStatTypeString
  );

  // Retourneer de enum waarde indien gevonden, anders de string zelf.
  return statTypeEnumValue || potentialStatTypeString;
}