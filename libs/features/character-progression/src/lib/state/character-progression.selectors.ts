// libs/features/character-progression/src/lib/state/character-progression.selectors.ts
/**
 * @fileoverview NgRx selectors for the Character Progression feature state.
 * This file provides memoized selector functions to efficiently retrieve data
 * from the character progression state slice, including core stats, definitions,
 * lifeskills, skills, and combined display data.
 * @version 1.2.0
 * @author ChallengerAppDevAI
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CharacterProgressionState, CHARACTER_PROGRESSION_FEATURE_KEY } from './character-progression.state';
import {
  CharacterStats, Lifeskill, StatDefinition, SkillDefinition, UserSkill, SkillId, SkillDisplay,
  StatCategory, DetailedStat, AppIcon, StatType
} from '@royal-code/shared/domain';
import { SkillCategorySummary } from '../components/skills/skill-category-card/skill-category-card.component';
import { SegmentedBarConfig, SegmentStyle } from '@royal-code/ui/meters';
import { getStatTypeFromSkillTreeId, getSkillIconPath } from '@royal-code/shared/utils';
import { CharacterStatDisplayItem } from './character-progression.types';

// --- Base Feature Selector ---
/**
 * @Selector selectCharacterProgressionState
 * @description Selects the top-level 'characterProgression' feature state slice from the root store.
 * @returns {Selector<object, CharacterProgressionState>} The selector for the character progression state.
 */
export const selectCharacterProgressionState = createFeatureSelector<CharacterProgressionState>(CHARACTER_PROGRESSION_FEATURE_KEY);

// =============================================================================
// --- Core Stats & Stat Definitions Selectors ---
// =============================================================================
/**
 * @Selector selectCharacterStats
 * @description Selects the user's current core character statistics object.
 * @returns {CharacterStats | null} The character stats or null if not loaded.
 */
export const selectCharacterStats = createSelector(
  selectCharacterProgressionState,
  (state: CharacterProgressionState): CharacterStats | null => state.stats
);

/**
 * @Selector selectCharacterStatsLoading
 * @description Selects the loading status for core character statistics.
 * @returns {boolean} True if stats are currently loading.
 */
export const selectCharacterStatsLoading = createSelector(
  selectCharacterProgressionState,
  (state: CharacterProgressionState): boolean => state.loadingStats
);

/**
 * @Selector selectStatDefinitions
 * @description Selects the array of all static stat definitions.
 * @returns {StatDefinition[]} An array of stat definitions.
 */
export const selectStatDefinitions = createSelector(
  selectCharacterProgressionState,
  (state: CharacterProgressionState): StatDefinition[] => state.statDefinitions
);

/**
 * @Selector selectStatDefinitionsLoading
 * @description Selects the loading status for static stat definitions.
 * @returns {boolean} True if stat definitions are currently loading.
 */
export const selectStatDefinitionsLoading = createSelector(
  selectCharacterProgressionState,
  (state: CharacterProgressionState): boolean => state.loadingDefinitions
);

/**
 * @SelectorFactory selectStatDefinitionById
 * @description Creates a selector for retrieving a specific stat definition by its ID.
 * @param {StatType | string} statId - The ID (enum or string) of the stat definition.
 * @returns {Selector<object, StatDefinition | undefined>} The specific stat definition or undefined.
 */
export const selectStatDefinitionById = (statId: StatType | string) => createSelector(
    selectStatDefinitions,
    (definitions: StatDefinition[]): StatDefinition | undefined => definitions.find(def => def.id === statId)
);

// =============================================================================
// --- Lifeskills Selectors ---
// =============================================================================
/**
 * @Selector selectLifeskills
 * @description Selects the array of the user's current lifeskill progression data.
 * @returns {Lifeskill[]} An array of lifeskills, or an empty array if null/undefined.
 */
export const selectLifeskills = createSelector(
  selectCharacterProgressionState,
  (state: CharacterProgressionState): Lifeskill[] => state.lifeskills ?? []
);

/**
 * @Selector selectLifeskillsLoading
 * @description Selects the loading status for lifeskill data.
 * @returns {boolean} True if lifeskills are currently loading.
 */
export const selectLifeskillsLoading = createSelector(
  selectCharacterProgressionState,
  (state: CharacterProgressionState): boolean => state.loadingLifeskills
);

// =============================================================================
// --- Skill Definitions & User Skills Selectors ---
// =============================================================================
/**
 * @Selector selectSkillDefinitions
 * @description Selects the array of all available static skill definitions.
 * @returns {SkillDefinition[]} An array of skill definitions.
 */
export const selectSkillDefinitions = createSelector(
  selectCharacterProgressionState,
  (state: CharacterProgressionState): SkillDefinition[] => state.skillDefinitions
);

/**
 * @SelectorFactory selectSkillDefinitionById
 * @description Creates a selector for retrieving a specific skill definition by its ID.
 * @param {SkillId} skillId - The ID of the skill definition.
 * @returns {Selector<object, SkillDefinition | undefined>} The specific skill definition or undefined.
 */
export const selectSkillDefinitionById = (skillId: SkillId) => createSelector(
    selectSkillDefinitions,
    (definitions: SkillDefinition[]): SkillDefinition | undefined => definitions.find(def => def.id === skillId)
);

/**
 * @Selector selectUserSkills
 * @description Selects the array of the current user's skill progression data.
 * @returns {UserSkill[]} An array of user skills.
 */
export const selectUserSkills = createSelector(
  selectCharacterProgressionState,
  (state: CharacterProgressionState): UserSkill[] => state.userSkills
);

/**
 * @SelectorFactory selectUserSkillById
 * @description Creates a selector for retrieving the user's progression for a specific skill by ID.
 * @param {SkillId} skillId - The ID of the user skill.
 * @returns {Selector<object, UserSkill | undefined>} The specific user skill progression or undefined.
 */
export const selectUserSkillById = (skillId: SkillId) => createSelector(
    selectUserSkills,
    (userSkills: UserSkill[]): UserSkill | undefined => userSkills.find(skill => skill.id === skillId)
);

/**
 * @Selector selectSkillsLoading
 * @description Selects the loading state for skill-related data (definitions or user progression).
 * @returns {boolean} True if any skill data is currently loading.
 */
export const selectSkillsLoading = createSelector(
  selectCharacterProgressionState,
  (state: CharacterProgressionState): boolean => state.loadingSkills
);

// =============================================================================
// --- Combined/Derived Selectors for UI Display ---
// =============================================================================

/**
 * @Selector selectSkillsForDisplay
 * @description Combines all skill definitions with the user's current progression for each skill.
 *              It also calculates `canUpgrade` status based on available skill points and max level.
 * @returns {SkillDisplay[]} An array of `SkillDisplay` objects ready for UI rendering.
 */
export const selectSkillsForDisplay = createSelector(
  selectSkillDefinitions,
  selectUserSkills,
  selectCharacterStats,
  (definitions, userSkills, stats): SkillDisplay[] => {
    if (!definitions || definitions.length === 0) {
      return [];
    }
    return definitions.map(def => {
      const userSkill = userSkills?.find(us => us.id === def.id);
      const currentLevel = userSkill?.currentLevel ?? 0;
      const canActuallyUpgrade = (stats?.skillPointsAvailable ?? 0) > 0 && currentLevel < def.maxLevel;

      let expForNext = userSkill?.experienceForNextLevel;
      if (currentLevel === 0 && (userSkill?.currentExperience ?? 0) === 0 && def.maxLevel > 0 && expForNext === undefined) {
        expForNext = 100;
      } else if (currentLevel >= def.maxLevel) {
        expForNext = 0;
      }

      // === SVG Pad Generatie ===
      const associatedStat = getStatTypeFromSkillTreeId(def.skillTreeId);
      let iconPathValue = 'assets/svg/stats/skills/tiers/default-tier-1.svg'; // Fallback icoon
      if (associatedStat) {
        iconPathValue = getSkillIconPath(associatedStat, currentLevel);
      }
      // =========================

      return {
        ...def,
        currentLevel: currentLevel,
        currentExperience: userSkill?.currentExperience ?? 0,
        experienceForNextLevel: expForNext ?? (def.maxLevel > 0 ? 100 : 0),
        canUpgrade: canActuallyUpgrade,
        iconPath: iconPathValue, // <<< TOEGEVOEGD
        // De 'icon: AppIcon' property van SkillDefinition blijft bestaan, maar
        // SkillCardComponent zal 'iconPath' gebruiken.
      };
    });
  }
);

/**
 * @Selector selectCharacterStatsForDisplay
 * @description Combines core character stats (CharacterStats) with their static definitions (StatDefinition)
 *              and generates the configuration for the UiStatBarComponent.
 *              This structure is suitable for components like `CharacterStatsDisplayComponent`.
 * @returns {CharacterStatDisplayItem[]} An array of objects, ready for UI display.
 */
export const selectCharacterStatsForDisplay = createSelector(
  selectCharacterStats,
  selectStatDefinitions,
  (stats: CharacterStats | null, definitions: StatDefinition[]): CharacterStatDisplayItem[] => {
    if (!stats || !definitions || definitions.length === 0) {
      return [];
    }

    const coreStatTypes: StatType[] = [
      StatType.Strength, StatType.Dexterity, StatType.Intelligence, StatType.Arcane, StatType.Luck
    ];
    const displayItems: CharacterStatDisplayItem[] = [];

    for (const statType of coreStatTypes) {
      const definition = definitions.find((def) => def.id === statType);
      const currentValue = (stats as any)[statType.toLowerCase() as keyof typeof stats] as number | undefined;

      if (definition && typeof currentValue === 'number') {
        const barCfg: SegmentedBarConfig = {
          filledValue: currentValue,
          totalValue: definition.maxValue,
          numberOfSegments: definition.uiSegments ?? definition.maxValue,
          ariaLabel: definition.nameKeyOrText, // Voor ARIA op de bar zelf
          segmentColorPattern: `attribute_${statType.toLowerCase()}`,
          displayStyle: SegmentStyle.Chevron, // Of haal uit definition als je dat wilt
        };

        displayItems.push({
          type: statType,
          labelKey: definition.nameKeyOrText, // Voor UiMeterDisplayComponent
          currentValue: currentValue,         // Ook nodig voor UiMeterDisplayComponent context
          maxValue: definition.maxValue,      // Ook nodig voor UiMeterDisplayComponent context
          icon: definition.icon || AppIcon.HelpCircle, // Voor UiMeterDisplayComponent
          iconColorClass: getStatIconColorClassHelper(statType), // Helper voor kleur
          valueText: `${currentValue} / ${definition.maxValue}`, // Voor UiMeterDisplayComponent
          effectDescriptionKey: definition.descriptionKeyOrText, // Voor de UI
          barConfig: barCfg, // Voor de geprojecteerde UiSegmentedBarComponent
        });
      }
    }
    return displayItems;
  }
);

// Helper functie voor icon kleur, kan ook in de component als private methode.
function getStatIconColorClassHelper(statType: StatType): string {
  switch (statType) {
    case StatType.Strength:     return 'text-[var(--color-theme-fire)]';
    case StatType.Dexterity:    return 'text-[var(--color-theme-forest)]';
    case StatType.Intelligence: return 'text-[var(--color-theme-water)]';
    case StatType.Arcane:       return 'text-[var(--color-theme-arcane)]';
    case StatType.Luck:         return 'text-[var(--color-theme-sun)]';
    default: return 'text-secondary';
  }
}

/**
 * @Selector selectCategorizedStatsForDisplay
 * @description Combines and categorizes all relevant character statistics (core, combat, etc.)
 *              into a structured format suitable for display on a detailed stats page.
 * @returns {StatCategory[]} An array of `StatCategory` objects, each containing related `DetailedStat` items.
 */
export const selectCategorizedStatsForDisplay = createSelector(
  selectCharacterStats,
  selectStatDefinitions,
  // Add other selectors here if stats come from more sources (e.g., equipment, buffs)
  (charStats: CharacterStats | null, definitions: StatDefinition[]): StatCategory[] => {
    if (!charStats || definitions.length === 0) {
      return [];
    }
    const categories: StatCategory[] = [];

    // --- Core Attributes Category ---
    const coreStatsToDisplay: DetailedStat[] = [];
    const coreStatTypes: StatType[] = [StatType.Strength, StatType.Dexterity, StatType.Intelligence, StatType.Luck, StatType.Arcane];
    coreStatTypes.forEach(statType => {
      const definition = definitions.find(def => def.id === statType);
      const statValue = (charStats as any)[statType.toLowerCase()] as number | undefined;

      if (definition && typeof statValue === 'number') {
        coreStatsToDisplay.push({
          id: `core_${statType.toLowerCase()}`,
          nameKeyOrText: definition.nameKeyOrText,
          value: statValue,
          maxValue: definition.maxValue,
          icon: definition.icon,
          uiHint: 'bar', // Suggests a bar display for core attributes
          statDefinitionId: definition.id,
          descriptionKeyOrText: definition.descriptionKeyOrText,
        });
      }
    });
    if (coreStatsToDisplay.length > 0) {
      categories.push({
        id: 'coreAttributes',
        nameKeyOrText: 'charProgression.categories.coreAttributes',
        icon: AppIcon.UserCircle, // Example icon
        stats: coreStatsToDisplay,
        order: 1,
      });
    }

    // --- Resource Stats Category (HP, MP, Stamina) ---
    const resourceStatsToDisplay: DetailedStat[] = [];
    // Health
    resourceStatsToDisplay.push({
      id: 'resource_health', nameKeyOrText: 'stats.health.name',
      value: charStats.currentHealth, maxValue: charStats.maxHealth,
      icon: AppIcon.Heart, uiHint: 'valueMax',
      descriptionKeyOrText: 'stats.health.description'
    });
    // Mana
    resourceStatsToDisplay.push({
      id: 'resource_mana', nameKeyOrText: 'stats.mana.name',
      value: charStats.currentMana, maxValue: charStats.maxMana,
      icon: AppIcon.Sparkles, uiHint: 'valueMax',
      descriptionKeyOrText: 'stats.mana.description'
    });
    // Stamina
    resourceStatsToDisplay.push({
      id: 'resource_stamina', nameKeyOrText: 'stats.stamina.name',
      value: charStats.currentStamina, maxValue: charStats.maxStamina,
      icon: AppIcon.Activity, uiHint: 'valueMax',
      descriptionKeyOrText: 'stats.stamina.description'
    });
    categories.push({
      id: 'resources', nameKeyOrText: 'charProgression.categories.resources',
      icon: AppIcon.Heart, // General icon for resources
      stats: resourceStatsToDisplay, order: 2,
    });

    // --- Combat Stats Category (Derived) ---
    const combatStatsToDisplay: DetailedStat[] = [];
    const attackPower = (charStats.strength * 2) + (charStats.dexterity * 0.5);
    combatStatsToDisplay.push({
        id: 'combat_attackPower', nameKeyOrText: 'charProgression.stats.attackPower',
        value: parseFloat(attackPower.toFixed(1)), uiHint: 'text', icon: AppIcon.Sword
    });
    const critChance = (charStats.dexterity * 0.5) + (charStats.luck * 0.25);
    combatStatsToDisplay.push({
        id: 'combat_critChance', nameKeyOrText: 'charProgression.stats.critChance',
        value: parseFloat(critChance.toFixed(2)), unit: '%', uiHint: 'percentage', icon: AppIcon.Target
    });
    const arcanePower = (charStats.arcane * 2) + (charStats.intelligence * 0.5);
    combatStatsToDisplay.push({
        id: 'combat_arcanePower', nameKeyOrText: 'charProgression.stats.arcanePower',
        value: parseFloat(arcanePower.toFixed(1)), uiHint: 'text', icon: AppIcon.Space
    });
    // Add more derived combat stats as needed
    if (combatStatsToDisplay.length > 0) {
        categories.push({
            id: 'combatEffectiveness', nameKeyOrText: 'charProgression.categories.combatEffectiveness',
            icon: AppIcon.Swords, stats: combatStatsToDisplay, order: 3,
        });
    }

    // Sort categories by order
    return categories.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }
);


// =============================================================================
// --- General Loading and Error Selectors ---
// =============================================================================
/**
 * @Selector selectCharacterProgressionError
 * @description Selects the general error message for the entire character progression feature.
 * @returns {string | null} The error message or null.
 */
export const selectCharacterProgressionError = createSelector(
    selectCharacterProgressionState,
    (state: CharacterProgressionState): string | null => state.error
);

/**
 * @Selector selectAnyProgressionLoading
 * @description Selects true if *any* data within the character progression feature is currently loading.
 *              Combines all individual loading flags.
 * @returns {boolean} True if any progression-related data is loading.
 */
export const selectAnyProgressionLoading = createSelector(
    selectCharacterStatsLoading,
    selectStatDefinitionsLoading,
    selectLifeskillsLoading,
    selectSkillsLoading, // Combined loading for skill definitions and user skills
    (loadingStats, loadingStatDefs, loadingLifeskills, loadingSkills): boolean =>
        loadingStats || loadingStatDefs || loadingLifeskills || loadingSkills
);

/**
 * @Selector selectSkillCategorySummaries
 * @description Creates an array of SkillCategorySummary objects, one for each core stat,
 *              suitable for display in overview sections or category lists.
 *              Data includes associated stat value and basic skill counts for the category.
 * @returns {SkillCategorySummary[]} An array of skill category summaries.
 */
export const selectSkillCategorySummaries = createSelector(
  selectCharacterStats,
  selectStatDefinitions,    // Nodig voor categorie info (naam, icoon)
  selectSkillDefinitions,   // Nodig om ALLE skills per categorie te tellen
  selectUserSkills,         // Nodig om te tellen hoeveel skills de USER heeft geleerd
  (stats, statDefs, allSkillDefinitions, userLearnedSkills): SkillCategorySummary[] => {
    if (!stats || statDefs.length === 0) {
      return [];
    }

    const coreStatTypes: StatType[] = [StatType.Strength, StatType.Dexterity, StatType.Intelligence, StatType.Luck, StatType.Arcane];
    const summaries: SkillCategorySummary[] = [];

    coreStatTypes.forEach(coreStatType => {
      const statDefinition = statDefs.find(sd => sd.id === coreStatType);
      if (!statDefinition) return; // Sla over als de basis stat definitie mist

      // 1. Filter ALLE skill definities die bij deze coreStatType horen
      const allDefinedSkillsInThisCategory = allSkillDefinitions.filter(
        (skillDef) => skillDef.skillTreeId === `${coreStatType.toLowerCase()}_skills`
      );

      // 2. Tel hoeveel van deze gedefinieerde skills de gebruiker daadwerkelijk heeft geleerd (level > 0)
      const skillsInCategoryLearnedByUserCount = allDefinedSkillsInThisCategory.filter(
        skillDef => userLearnedSkills.some(us => us.id === skillDef.id && us.currentLevel > 0)
      ).length;

      summaries.push({
        id: coreStatType,
        nameKeyOrText: statDefinition.nameKeyOrText,
        icon: statDefinition.icon || AppIcon.HelpCircle, // Fallback icoon
        descriptionKeyOrText: statDefinition.descriptionKeyOrText, // Optioneel
        skillsInTierCount: skillsInCategoryLearnedByUserCount, // Hoeveel de gebruiker er HEEFT
        totalSkillsInTier: allDefinedSkillsInThisCategory.length, // Totaal MOGELIJK in deze categorie
        currentStatValue: (stats as any)[coreStatType.toLowerCase()] as number ?? 0,
        // requiredStatValueForNextTier: 25, // Dit zou uit game design data moeten komen
        routeLink: `/character-progression/skills/${coreStatType.toLowerCase()}`
      });
    });
    return summaries;
  }
);
