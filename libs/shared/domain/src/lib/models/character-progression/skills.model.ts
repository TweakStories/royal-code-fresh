// libs/shared/domain/src/lib/character-progression/skills.model.ts
/**
 * @fileoverview Defines data models related to character skills, including
 * skill definitions (static properties) and user-specific skill progression.
 * These models are used across the character progression feature and potentially
 * other parts of the application that interact with skills.
 * @version 1.0.0
 * @author ChallengerAppDevAI
 */
import { AppIcon } from '../../enums/icon.enum';

/**
 * @typedef {string} SkillId
 * @description A unique identifier for a skill. Can be an enum key or a database ID string.
 */
export type SkillId = string;

/**
 * @interface SkillDefinition
 * @description Defines the static properties and metadata of a specific skill available in the game.
 *              This includes its name, description, visual representation, maximum level,
 *              and potential association with a skill tree.
 */
export interface SkillDefinition {
  /** @property {SkillId} id - The unique identifier for this skill definition. */
  id: SkillId;
  /** @property {string} nameKeyOrText - A translation key or direct text for the skill's display name. */
  nameKeyOrText: string;
  /** @property {string} descriptionKeyOrText - A translation key or direct text for the skill's detailed description. */
  descriptionKeyOrText: string;
  /** @property {AppIcon} icon - The icon representing this skill in the UI. */
  icon: AppIcon;
  /** @property {number} maxLevel - The maximum attainable level for this skill. */
  maxLevel: number;
  /** @property {string} [skillTreeId] - Optional identifier of the skill tree this skill belongs to. */
  skillTreeId?: string;
  /**
   * @property {Array<{ level: number; descriptionKeyOrText: string; bonuses: any }>} [effectsPerLevel]
   * @description Optional array defining specific effects, bonuses, or descriptions for each level of the skill.
   *              The 'bonuses' property is intentionally 'any' for flexibility in defining diverse skill effects.
   */
  effectsPerLevel?: Array<{ level: number; descriptionKeyOrText: string; bonuses: any }>;
}

/**
 * @interface UserSkill
 * @description Represents the current progression of a specific skill for a particular user.
 *              This includes their current level in the skill and their experience points towards the next level.
 */
export interface UserSkill {
  /** @property {SkillId} id - The identifier of the skill definition this progression data pertains to. */
  id: SkillId;
  /** @property {string} userId - The identifier of the user this progression data pertains to. */
  userId: string;
  /** @property {number} currentLevel - The user's current achieved level in this skill. */
  currentLevel: number;
  /** @property {number} currentExperience - The amount of experience points the user has accumulated towards the next level of this skill. */
  currentExperience: number;
  /** @property {number} experienceForNextLevel - The total experience points required to advance from the currentLevel to currentLevel + 1. */
  experienceForNextLevel: number;
  /** @property {boolean} [isMastered] - Optional flag indicating if the skill is fully mastered (e.g., reached maxLevel and maxXP). */
  isMastered?: boolean;
}

/**
 * @interface SkillTree
 * @description Represents a skill tree, which is a collection or pathway of related skills.
 *              Users might progress through skill trees to specialize their character.
 */
export interface SkillTree {
  /** @property {string} id - The unique identifier for this skill tree. */
  id: string;
  /** @property {string} nameKeyOrText - A translation key or direct text for the skill tree's display name. */
  nameKeyOrText: string;
  /** @property {SkillId[]} skills - An array of SkillIds that belong to this skill tree, often defining a progression path. */
  skills: SkillId[];
  /** @property {string} [descriptionKeyOrText] - Optional description for the skill tree. */
  descriptionKeyOrText?: string;
  /** @property {AppIcon} [icon] - Optional icon representing the skill tree. */
  icon?: AppIcon;
}

/**
 * @Interface SkillDisplay
 * @description A combined data structure merging `SkillDefinition` with `UserSkill`
 *              progression, and adding UI-specific properties like `canUpgrade`.
 *              This is ideal for direct use in components like skill cards.
 */
export interface SkillDisplay extends SkillDefinition {
  /** @property {number} currentLevel - The user's current level in this skill. */
  currentLevel: number;
  /** @property {number} currentExperience - XP accumulated towards the next level. */
  currentExperience: number;
  /** @property {number} experienceForNextLevel - XP required for the next level. */
  experienceForNextLevel: number;
  /** @property {boolean} [canUpgrade] - Indicates if the user can currently upgrade this skill (has points, not max level). */
  canUpgrade?: boolean;
  iconPath: string;
}
