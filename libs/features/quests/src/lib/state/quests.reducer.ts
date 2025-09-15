// libs/features/quests/src/lib/state/quests.reducer.ts
import { createFeature, createReducer, on, Action } from '@ngrx/store';
import { QuestsActions } from './quests.actions';
import { QUESTS_FEATURE_KEY, QuestsState, initialQuestsState, questsAdapter } from './quests.state';

// Helper function to handle setting loading/error states consistently
const setLoading = (state: QuestsState, loading: boolean, error: string | null = null): QuestsState => ({
  ...state, loading, error
});

/**
 * Reducer function for the quests feature, managing state transitions based on dispatched actions.
 */
const questsReducerInternal = createReducer(
  initialQuestsState,

  // --- Load All Quests ---
  on(QuestsActions.loadQuestsRequested, (state) => setLoading(state, true)),
  on(QuestsActions.loadQuestsSuccess, (state, { quests }) =>
    // Replace all existing quests with the newly loaded set. Reset loading/error.
    questsAdapter.setAll(quests, setLoading(state, false))
  ),
  on(QuestsActions.loadQuestsFailure, (state, { error }) => setLoading(state, false, error)),

  // --- Load Quest Details ---
  on(QuestsActions.loadQuestDetailsRequested, (state) => setLoading(state, true)),
  on(QuestsActions.loadQuestDetailsSuccess, (state, { quest }) =>
    // Add or update the specific quest. Reset loading/error.
    questsAdapter.upsertOne(quest, setLoading(state, false))
  ),
  on(QuestsActions.loadQuestDetailsFailure, (state, { error }) => setLoading(state, false, error)),

  // --- Select Quest ---
  on(QuestsActions.selectQuest, (state, { id }): QuestsState => ({
    ...state,
    selectedQuestId: id // Update the selected ID.
  })),

  // --- Quest Lifecycle Actions (Requested) ---
  // Set loading to true when any interaction action starts. Clear previous error.
  on(
    QuestsActions.acceptQuestRequested,
    QuestsActions.updateQuestProgressRequested,
    QuestsActions.abandonQuestRequested,
    QuestsActions.claimQuestRewardRequested,
    (state): QuestsState => setLoading(state, true)
    // TODO: Consider quest-specific loading flags if needed:
    // e.g., { ...state, loadingAccepting: { ...state.loadingAccepting, [action.questId]: true }, error: null }
  ),

  // --- Quest Lifecycle Actions (Success) ---
  // Update the specific quest entity upon successful completion of an action. Reset loading.
  on(
    QuestsActions.acceptQuestSuccess,
    QuestsActions.updateQuestProgressSuccess,
    QuestsActions.abandonQuestSuccess,
    QuestsActions.claimQuestRewardSuccess,
    (state, { questUpdate }) =>
      questsAdapter.updateOne(questUpdate, setLoading(state, false))
      // TODO: Reset quest-specific loading flags if used
  ),

  // --- Quest Lifecycle Actions (Failure) ---
  // Set the error message and reset loading state upon failure of an action.
  on(
    QuestsActions.acceptQuestFailure,
    QuestsActions.updateQuestProgressFailure,
    QuestsActions.abandonQuestFailure,
    QuestsActions.claimQuestRewardFailure,
    (state, { error }) => setLoading(state, false, error)
    // TODO: Reset quest-specific loading flags if used
  ),

  // --- Clear Error ---
  on(QuestsActions.clearQuestsError, (state): QuestsState => ({
    ...state,
    error: null // Simply clear the error message.
  }))
);

/**
 * NgRx Feature definition for quests using createFeature.
 * This bundles the name, reducer, and selectors.
 */
export const questsFeature = createFeature({
  name: QUESTS_FEATURE_KEY, // Use the defined feature key
  reducer: questsReducerInternal, // Use the internal reducer function
  // `createFeature` automatically generates basic selectors (e.g., selectQuestsState, selectLoading, selectError)
});

// Export a wrapper function for AOT compatibility if needed, although often not required with createFeature.
// export function questsReducer(state: QuestsState | undefined, action: Action): QuestsState {
//   return questsReducerInternal(state, action);
// }