// libs/features/character-progression/src/lib/state/character-progression.reducers.ts
/**
 * @fileoverview Defines the NgRx reducer for the Character Progression feature state.
 * This reducer handles state transitions based on dispatched actions for core stats,
 * stat definitions, lifeskills, skill definitions, user skills, and skill lifecycle events.
 * @version 1.2.0
 * @author ChallengerAppDevAI
 */
import { createReducer, on, Action } from '@ngrx/store';
import { CharacterProgressionActions, CharacterProgressionErrorPayload } from './character-progression.actions';
import { CharacterProgressionState, initialCharacterProgressionState } from './character-progression.state';

/**
 * Helper function to extract a user-friendly error message from an error object.
 * @param error - The error object, which can be of various types.
 * @returns A string representing the error message.
 */
function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    // Potentially add HttpErrorResponse specific handling if not done in effects
    return 'An unknown error occurred while processing character progression data.';
}

/**
 * @const _characterProgressionReducer
 * @description The internal reducer function created using NgRx `createReducer`.
 *              It defines how the `CharacterProgressionState` transitions in response to dispatched actions.
 */
const _characterProgressionReducer = createReducer(
  initialCharacterProgressionState,

  // --- Core Stats Reducers ---
  on(CharacterProgressionActions.loadCharacterStatsRequested, (state): CharacterProgressionState => ({
    ...state,
    loadingStats: true,
    error: null, // Clear previous error on new request
  })),
  on(CharacterProgressionActions.loadCharacterStatsSuccess, (state, { stats }): CharacterProgressionState => ({
    ...state,
    stats: stats,
    loadingStats: false,
    error: null,
  })),
  on(CharacterProgressionActions.loadCharacterStatsFailure, (state, { error }): CharacterProgressionState => ({
    ...state,
    stats: null, // Or keep old stats, depending on desired UX
    loadingStats: false,
    error: getErrorMessage(error),
  })),

  // --- Stat Definitions Reducers ---
  on(CharacterProgressionActions.loadStatDefinitionsRequested, (state): CharacterProgressionState => ({
    ...state,
    loadingDefinitions: true,
    error: null,
  })),
  on(CharacterProgressionActions.loadStatDefinitionsSuccess, (state, { definitions }): CharacterProgressionState => ({
     ...state,
     statDefinitions: definitions,
     loadingDefinitions: false,
     error: null,
  })),
  on(CharacterProgressionActions.loadStatDefinitionsFailure, (state, { error }): CharacterProgressionState => ({
     ...state,
     statDefinitions: [], // Reset on failure
     loadingDefinitions: false,
     error: getErrorMessage(error),
  })),

  // --- Update Character Stats Reducers ---
  on(CharacterProgressionActions.updateCharacterStatsRequested, (state): CharacterProgressionState => ({
      ...state,
      loadingStats: true, // Reuse general stats loading flag or use a specific one
      error: null,
  })),
  on(CharacterProgressionActions.updateCharacterStatsSuccess, (state, { stats }): CharacterProgressionState => ({
       ...state,
       stats: stats, // Update with the full new stats from the backend
       loadingStats: false,
       error: null,
  })),
   on(CharacterProgressionActions.updateCharacterStatsFailure, (state, { error }): CharacterProgressionState => ({
       ...state,
       loadingStats: false, // Ensure loading is reset
       error: getErrorMessage(error),
   })),

  // --- Lifeskills Reducers ---
  on(CharacterProgressionActions.loadLifeskillsRequested, (state): CharacterProgressionState => ({
    ...state,
    loadingLifeskills: true,
    error: null,
  })),
  on(CharacterProgressionActions.loadLifeskillsSuccess, (state, { lifeskills }): CharacterProgressionState => ({
    ...state,
    lifeskills: lifeskills,
    loadingLifeskills: false,
    error: null,
  })),
  on(CharacterProgressionActions.loadLifeskillsFailure, (state, { error }): CharacterProgressionState => ({
    ...state,
    lifeskills: null, // Or keep old data
    loadingLifeskills: false,
    error: getErrorMessage(error),
  })),

  // --- Skill Definitions Reducers ---
  on(CharacterProgressionActions.loadSkillDefinitionsRequested, (state): CharacterProgressionState => ({
    ...state,
    loadingSkills: true,
    error: null,
  })),
  on(CharacterProgressionActions.loadSkillDefinitionsSuccess, (state, { definitions }): CharacterProgressionState => ({
     ...state,
     skillDefinitions: definitions,
     // Set loadingSkills to false only if userSkills are also not considered to be loading.
     // This handles parallel or separate loading scenarios for definitions and user progression.
     loadingSkills: state.loadingSkills && state.userSkills?.length > 0 ? state.loadingSkills : false,
     error: null,
  })),
  on(CharacterProgressionActions.loadSkillDefinitionsFailure, (state, { error }): CharacterProgressionState => ({
     ...state,
     skillDefinitions: [],
     loadingSkills: false,
     error: getErrorMessage(error),
  })),

  // --- User Skills (Progression) Reducers ---
  on(CharacterProgressionActions.loadUserSkillsRequested, (state): CharacterProgressionState => ({
    ...state,
    loadingSkills: true,
    error: null,
  })),
  on(CharacterProgressionActions.loadUserSkillsSuccess, (state, { userSkills }): CharacterProgressionState => ({
     ...state,
     userSkills: userSkills,
     // Set loadingSkills to false only if skillDefinitions are also not considered to be loading.
     loadingSkills: state.loadingSkills && state.skillDefinitions?.length > 0 ? state.loadingSkills : false,
     error: null,
  })),
  on(CharacterProgressionActions.loadUserSkillsFailure, (state, { error }): CharacterProgressionState => ({
     ...state,
     userSkills: [],
     loadingSkills: false,
     error: getErrorMessage(error),
  })),

  // --- User Skill Lifecycle Reducers ---
  on(CharacterProgressionActions.addUserSkillRequested, (state): CharacterProgressionState => ({
      ...state,
      loadingSkills: true, // Indicate general skill operation in progress
      error: null,
  })),
  on(CharacterProgressionActions.addUserSkillSuccess, (state, { userSkill }): CharacterProgressionState => {
      // Add the new skill or update if it already exists (e.g., re-learning)
      const skillExists = state.userSkills.some(s => s.id === userSkill.id);
      return {
          ...state,
          userSkills: skillExists
              ? state.userSkills.map(s => s.id === userSkill.id ? userSkill : s)
              : [...state.userSkills, userSkill],
          loadingSkills: false,
          error: null,
      };
  }),
  on(CharacterProgressionActions.addUserSkillFailure, (state, { error }): CharacterProgressionState => ({
       ...state,
       loadingSkills: false,
       error: getErrorMessage(error),
  })),

  on(CharacterProgressionActions.upgradeSkillRequested, (state): CharacterProgressionState => ({
      ...state,
      loadingSkills: true,
      error: null,
  })),
  on(CharacterProgressionActions.upgradeSkillSuccess, (state, { updatedUserSkill }): CharacterProgressionState => {
      // Update the specific user skill in the array.
      const updatedUserSkills = state.userSkills.map(skill =>
        skill.id === updatedUserSkill.id ? updatedUserSkill : skill
      );
      // Decrement available skill points from the main character stats.
      const currentSkillPoints = state.stats?.skillPointsAvailable ?? 0;
      const newSkillPoints = Math.max(0, currentSkillPoints - 1); // Prevent negative points
      return {
       ...state,
       userSkills: updatedUserSkills,
       stats: state.stats ? { ...state.stats, skillPointsAvailable: newSkillPoints } : null,
       loadingSkills: false,
       error: null,
      };
  }),
  on(CharacterProgressionActions.upgradeSkillFailure, (state, { error }): CharacterProgressionState => ({
       ...state,
       loadingSkills: false,
       error: getErrorMessage(error),
  })),

  on(CharacterProgressionActions.deleteUserSkillRequested, (state): CharacterProgressionState => ({
      ...state,
      loadingSkills: true,
      error: null,
  })),
  on(CharacterProgressionActions.deleteUserSkillSuccess, (state, { skillId }): CharacterProgressionState => ({
       ...state,
       userSkills: state.userSkills.filter(skill => skill.id !== skillId),
       loadingSkills: false,
       error: null,
  })),
  on(CharacterProgressionActions.deleteUserSkillFailure, (state, { error }): CharacterProgressionState => ({
       ...state,
       loadingSkills: false,
       error: getErrorMessage(error),
  })),

  // --- General Error Clearing ---
  on(CharacterProgressionActions.clearCharacterProgressionError, (state): CharacterProgressionState => ({
      ...state,
      error: null,
      // Optionally reset all individual loading flags here if needed
      // loadingStats: false, loadingDefinitions: false, loadingLifeskills: false, loadingSkills: false,
  })),
);

/**
 * Exported reducer function for NgRx registration.
 * This wrapper ensures AOT compatibility and allows the use of `createReducer`.
 * @param state - The current `CharacterProgressionState` or undefined.
 * @param action - The dispatched NgRx `Action`.
 * @returns The new `CharacterProgressionState`.
 */
export function characterProgressionReducer(state: CharacterProgressionState | undefined, action: Action): CharacterProgressionState {
  return _characterProgressionReducer(state, action);
}