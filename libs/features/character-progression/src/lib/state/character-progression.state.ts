// libs/features/character-progression/src/lib/state/character-progression.state.ts
/**
 * @fileoverview Defines the state structure for the Character Progression feature.
 * This includes core statistics, static stat definitions, user-specific lifeskill progression,
 * static skill definitions, user-specific skill progression, and associated loading and error states.
 * @version 1.2.0
 * @author ChallengerAppDevAI
 */
import { CharacterStats, Lifeskill, StatDefinition, SkillDefinition, UserSkill } from '@royal-code/shared/domain';

/**
 * @interface CharacterProgressionState
 * @description Defines the complete state slice for the Character Progression feature.
 *              It aggregates substates for various aspects of character development,
 *              such as core stats, learned skills, and acquired lifeskills, along with
 *              their respective loading statuses and potential errors.
 */
export interface CharacterProgressionState {
  /** @property {CharacterStats | null} stats - Current core statistics of the character (e.g., strength, dexterity). Null if not yet loaded. */
  stats: CharacterStats | null;
  /** @property {StatDefinition[]} statDefinitions - Static definitions for all core statistics, providing metadata like max values and UI hints. */
  statDefinitions: StatDefinition[];
  /** @property {Lifeskill[] | null} lifeskills - The user's current progression in various lifeskills (e.g., cooking, fishing). Null if not loaded. */
  lifeskills: Lifeskill[] | null;

  /** @property {SkillDefinition[]} skillDefinitions - Static definitions for all available gameplay skills (name, description, maxLevel, etc.). */
  skillDefinitions: SkillDefinition[];
  /** @property {UserSkill[]} userSkills - The user's current progression data for each learned or available skill (currentLevel, currentXP, etc.). */
  userSkills: UserSkill[];

  /** @property {boolean} loadingStats - Indicates if core character statistics are currently being fetched. */
  loadingStats: boolean;
  /** @property {boolean} loadingDefinitions - Indicates if static stat definitions are currently being fetched. */
  loadingDefinitions: boolean;
  /** @property {boolean} loadingLifeskills - Indicates if lifeskill progression data is currently being fetched. */
  loadingLifeskills: boolean;
  /** @property {boolean} loadingSkills - Indicates if skill definitions or user skill progression data are currently being fetched. */
  loadingSkills: boolean;

  /** @property {string | null} error - Stores the last error message related to any character progression operation. Null if no error. */
  error: string | null;
}

/**
 * @const initialCharacterProgressionState
 * @description The initial default state for the Character Progression feature slice.
 *              All data arrays are initialized as empty, loading flags as false, and error as null.
 */
export const initialCharacterProgressionState: CharacterProgressionState = {
  stats: null,
  statDefinitions: [],
  lifeskills: null,
  skillDefinitions: [],
  userSkills: [],
  loadingStats: false,
  loadingDefinitions: false,
  loadingLifeskills: false,
  loadingSkills: false,
  error: null,
};

/**
 * @const CHARACTER_PROGRESSION_FEATURE_KEY
 * @description The unique string key used to register this state slice within the NgRx root store.
 *              This key is essential for selecting this feature's state.
 */
export const CHARACTER_PROGRESSION_FEATURE_KEY = 'characterProgression';