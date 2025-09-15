// libs/features/quests/src/lib/state/quests.state.ts
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Quest } from '@royal-code/shared/domain';

/**
 * @interface QuestsState
 * @extends EntityState<Quest>
 * @description Defines the structure for the quests feature state,
 *              including quest entities, loading status, errors, and selected quest ID.
 */
export interface QuestsState extends EntityState<Quest> {
  selectedQuestId: string | null; // ID of the quest currently selected in the UI (e.g., detail view)
  loading: boolean;              // True if quests are currently being loaded or modified via API.
  error: string | null;          // Holds the last error message related to quest operations.
  // Consider adding flags for specific operations if needed, e.g.,
  // loadingAccepting: { [questId: string]: boolean };
  // errorAccepting: { [questId: string]: string | null };
}

/**
 * Entity adapter for managing Quest entities efficiently.
 * - selectId: Uses the 'id' property as the unique identifier.
 * - sortComparer: Optional: Sort quests, e.g., by status then title, or by accepted date.
 *                 Example: Sort active first, then available, then others, then by title.
 */
export const questsAdapter: EntityAdapter<Quest> = createEntityAdapter<Quest>({
  selectId: (quest: Quest) => quest.id,
  // sortComparer: (a: Quest, b: Quest): number => { /* TODO: Implement sorting logic if desired */ return 0; }
});

/**
 * Initial state for the quests feature slice.
 * Uses the adapter's getInitialState and sets default values for custom properties.
 */
export const initialQuestsState: QuestsState = questsAdapter.getInitialState({
  selectedQuestId: null,
  loading: false,
  error: null,
});

/**
 * Feature key used to register this state slice in the root store.
 * Should be unique across the application.
 */
export const QUESTS_FEATURE_KEY = 'quests';