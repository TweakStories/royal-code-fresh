// libs/features/character-progression/src/lib/state/character-progression.actions.ts
/**
 * @fileoverview Defines NgRx actions for the Character Progression feature.
 * These actions cover loading and updating core stats, stat definitions, lifeskills,
 * skill definitions, user-specific skill progression, and skill lifecycle events like
 * learning (add), forgetting (delete), and upgrading skills.
 * @version 1.2.0
 * @author ChallengerAppDevAI
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CharacterStats, Lifeskill, StatDefinition, SkillDefinition, UserSkill, SkillId } from '@royal-code/shared/domain';

/**
 * @type CharacterProgressionErrorPayload
 * @description Defines a standard structure for error payloads within character progression actions.
 * @property {string} error - The error message or translation key.
 */
export type CharacterProgressionErrorPayload = { error: string };

/**
 * @ActionGroup Character Progression Actions
 * @description A group of NgRx actions related to managing all aspects of character progression.
 *              The `source` property helps in identifying the origin of actions in devtools.
 */
export const CharacterProgressionActions = createActionGroup({
  source: 'Character Progression API/UI',
  events: {
    // --- Core Stats Actions ---
    /** Dispatched to request loading of the user's current character statistics. */
    'Load Character Stats Requested': emptyProps(),
    /** Dispatched upon successful loading of character stats from the backend. */
    'Load Character Stats Success': props<{ stats: CharacterStats }>(),
    /** Dispatched if loading character stats fails. */
    'Load Character Stats Failure': props<CharacterProgressionErrorPayload>(),

    // --- Stat Definitions Actions ---
    /** Dispatched to request loading of the definitions for all character statistics. */
    'Load Stat Definitions Requested': emptyProps(),
    /** Dispatched upon successful loading of stat definitions. */
    'Load Stat Definitions Success': props<{ definitions: StatDefinition[] }>(),
    /** Dispatched if loading stat definitions fails. */
    'Load Stat Definitions Failure': props<CharacterProgressionErrorPayload>(),

    // --- Update Character Stats Actions ---
    /** Dispatched to request an update to the user's character stats (e.g., after distributing attribute points). */
    'Update Character Stats Requested': props<{ statsChanges: Partial<CharacterStats> }>(),
    /** Dispatched upon successful update of character stats. */
    'Update Character Stats Success': props<{ stats: CharacterStats }>(),
    /** Dispatched if updating character stats fails. */
    'Update Character Stats Failure': props<CharacterProgressionErrorPayload>(),

    // --- Lifeskills Actions ---
    /** Dispatched to request loading of the user's current lifeskill progression. */
    'Load Lifeskills Requested': emptyProps(),
    /** Dispatched upon successful loading of lifeskill data. */
    'Load Lifeskills Success': props<{ lifeskills: Lifeskill[] }>(),
    /** Dispatched if loading lifeskills fails. */
    'Load Lifeskills Failure': props<CharacterProgressionErrorPayload>(),

    // --- Skill Definitions Actions ---
    /** Dispatched to request loading of all available skill definitions (static data). */
    'Load Skill Definitions Requested': emptyProps(),
    /** Dispatched upon successful loading of skill definitions from the backend. */
    'Load Skill Definitions Success': props<{ definitions: SkillDefinition[] }>(),
    /** Dispatched if loading skill definitions fails. */
    'Load Skill Definitions Failure': props<CharacterProgressionErrorPayload>(),

    // --- User Skills (Progression) Actions ---
    /** Dispatched to request loading of the user's current progression for all skills. */
    'Load User Skills Requested': emptyProps(),
    /** Dispatched upon successful loading of the user's skill progression from the backend. */
    'Load User Skills Success': props<{ userSkills: UserSkill[] }>(),
    /** Dispatched if loading user skill progression fails. */
    'Load User Skills Failure': props<CharacterProgressionErrorPayload>(),

    // --- User Skill Lifecycle Actions ---
    /** Dispatched when a user attempts to learn (add) a new skill. */
    'Add User Skill Requested': props<{ skillId: SkillId; initialLevel?: number }>(),
    /** Dispatched upon successful addition of a skill to the user's known skills by the backend. */
    'Add User Skill Success': props<{ userSkill: UserSkill }>(),
    /** Dispatched if adding a user skill fails. Includes skillId for potential UI feedback. */
    'Add User Skill Failure': props<{ skillId: SkillId } & CharacterProgressionErrorPayload>(),

    /** Dispatched when a user attempts to upgrade an existing skill (spend a skill point). */
    'Upgrade Skill Requested': props<{ skillId: SkillId }>(),
    /** Dispatched upon successful upgrade of a skill by the backend. */
    'Upgrade Skill Success': props<{ updatedUserSkill: UserSkill }>(),
    /** Dispatched if upgrading a skill fails. Includes skillId for UI feedback. */
    'Upgrade Skill Failure': props<{ skillId: SkillId } & CharacterProgressionErrorPayload>(),

    /** Dispatched when a user attempts to "forget" or remove a learned skill (if applicable by game design). */
    'Delete User Skill Requested': props<{ skillId: SkillId }>(),
    /** Dispatched upon successful deletion of a user's skill by the backend. */
    'Delete User Skill Success': props<{ skillId: SkillId }>(),
    /** Dispatched if deleting a user skill fails. Includes skillId for UI feedback. */
    'Delete User Skill Failure': props<{ skillId: SkillId } & CharacterProgressionErrorPayload>(),

    // --- General Error Handling ---
    /** Dispatched to clear any existing error message within the character progression state. */
    'Clear Character Progression Error': emptyProps(),
  },
});