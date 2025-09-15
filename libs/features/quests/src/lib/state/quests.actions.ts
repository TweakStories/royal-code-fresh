// libs/features/quests/src/lib/state/quests.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Quest } from '@royal-code/shared/domain';
import { Update } from '@ngrx/entity';

/** Type alias for error payloads */
type QuestErrorPayload = { error: string }; // Simple string error for now

/**
 * @ActionGroup Quests Actions
 * @description Defines actions related to loading, selecting, and modifying quests.
 *              Organized using createActionGroup for better structure and type safety.
 */
export const QuestsActions = createActionGroup({
  source: 'Quests API/UI', // Identifies the origin of the actions
  events: {
    // --- Loading All Relevant Quests ---
    /** Dispatched to trigger loading of quests relevant to the user. */
    'Load Quests Requested': emptyProps(),
    /** Dispatched by effects upon successful loading of quests. */
    'Load Quests Success': props<{ quests: Quest[] }>(),
    /** Dispatched by effects if loading quests fails. */
    'Load Quests Failure': props<QuestErrorPayload>(),

    // --- Loading Single Quest Details (Optional Use Case) ---
    /** Dispatched to load details for a specific quest if not already present. */
    'Load Quest Details Requested': props<{ id: string }>(),
    /** Dispatched by effects upon successful loading of quest details. */
    'Load Quest Details Success': props<{ quest: Quest }>(), // Upserts the quest
    /** Dispatched by effects if loading specific quest details fails. */
    'Load Quest Details Failure': props<{ id: string } & QuestErrorPayload>(),

    // --- UI Interaction ---
    /** Dispatched when a user selects a quest in the UI (e.g., to view details). */
    'Select Quest': props<{ id: string | null }>(),

    // --- Quest Lifecycle Actions ---
    /** Dispatched when the user attempts to accept a quest. */
    'Accept Quest Requested': props<{ questId: string }>(),
    /** Dispatched by effects upon successful acceptance of a quest (backend confirmation). */
    'Accept Quest Success': props<{ questUpdate: Update<Quest> }>(), // Returns update for reducer
    /** Dispatched by effects if accepting a quest fails. */
    'Accept Quest Failure': props<{ questId: string } & QuestErrorPayload>(),

    /** Dispatched when progress is made on a quest objective. */
    'Update Quest Progress Requested': props<{ questId: string; objectiveId: string; progress: number }>(),
    /** Dispatched by effects after backend confirms progress update (returns updated quest). */
    'Update Quest Progress Success': props<{ questUpdate: Update<Quest> }>(),
    /** Dispatched by effects if updating progress fails. */
    'Update Quest Progress Failure': props<{ questId: string; objectiveId: string } & QuestErrorPayload>(),

    /** Dispatched when the user explicitly abandons an active quest. */
    'Abandon Quest Requested': props<{ questId: string }>(),
    /** Dispatched by effects upon successful abandonment. */
    'Abandon Quest Success': props<{ questUpdate: Update<Quest> }>(), // Update status to Abandoned
    /** Dispatched by effects if abandoning fails. */
    'Abandon Quest Failure': props<{ questId: string } & QuestErrorPayload>(),

    /** Dispatched when the user claims rewards for a completed quest. */
    'Claim Quest Reward Requested': props<{ questId: string }>(),
    /** Dispatched by effects upon successful reward claim. */
    'Claim Quest Reward Success': props<{ questUpdate: Update<Quest> }>(), // Update status to Claimed
    /** Dispatched by effects if claiming fails. */
    'Claim Quest Reward Failure': props<{ questId: string } & QuestErrorPayload>(),

    // --- Error Handling ---
    /** Dispatched to clear any existing quest-related error messages from the state. */
    'Clear Quests Error': emptyProps(),
  },
});