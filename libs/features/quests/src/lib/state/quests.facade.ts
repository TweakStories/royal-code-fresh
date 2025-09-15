// libs/features/quests/src/lib/state/quests.facade.ts
import { Injectable, inject, Signal, computed } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import { Update } from '@ngrx/entity';
import { toSignal } from '@angular/core/rxjs-interop'; // Import toSignal

import { QuestsActions } from './quests.actions';
import * as QuestsSelectors from './quests.selectors';
import { Quest, QuestStatus } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';

/**
 * @Injectable QuestFacade
 * @description Provides a simplified public API for interacting with the Quests feature state.
 *              It abstracts away the NgRx store specifics (dispatching actions, selecting state).
 */
@Injectable({ providedIn: 'root' }) // Provide globally or in feature module as needed
export class QuestFacade {
  private store = inject(Store);
  private logger = inject(LoggerService);
  private readonly logPrefix = '[QuestFacade]';

  // --- State Selectors ---
  readonly allQuests: Signal<Quest[]> = toSignal(this.store.pipe(select(QuestsSelectors.selectAllQuests)), { initialValue: [] });
  readonly selectedQuest: Signal<Quest | undefined> = toSignal(this.store.pipe(select(QuestsSelectors.selectCurrentQuest)), { initialValue: undefined });
  readonly isLoading: Signal<boolean> = toSignal(this.store.pipe(select(QuestsSelectors.selectLoading)), { initialValue: false });
  readonly error: Signal<string | null> = toSignal(this.store.pipe(select(QuestsSelectors.selectError)), { initialValue: null });
  readonly activeQuests: Signal<Quest[]> = toSignal(this.store.pipe(select(QuestsSelectors.selectActiveQuests)), { initialValue: [] });
  readonly availableQuests: Signal<Quest[]> = toSignal(this.store.pipe(select(QuestsSelectors.selectAvailableQuests)), { initialValue: [] });
  readonly completedQuests: Signal<Quest[]> = toSignal(this.store.pipe(select(QuestsSelectors.selectCompletedQuests)), { initialValue: [] });

  // --- Selector Factory Functions ---
  selectQuestById(id: string | null | undefined): Observable<Quest | undefined> {
    return this.store.pipe(select(QuestsSelectors.selectQuestById(id)));
  }
    /** Factory function returning a signal for a specific quest by its ID. */
    selectQuestByIdSignal(idSignal: Signal<string | null | undefined>): Signal<Quest | undefined> {
      return computed(() => {
          const id = idSignal();
          if (!id) return undefined;
          const entities = this.store.selectSignal(QuestsSelectors.selectEntities)(); // Haal entities op
          return entities[id];
      });
  }

  // --- NEW METHOD ---
  /**
   * Selects relevant quests (currently simplified to active quests) from the store.
   * If the quest state hasn't been loaded yet (or is forced), it dispatches the load action.
   * @param _nodeId - Placeholder for future node-specific quest filtering (currently unused).
   * @param _challengeId - Placeholder for future challenge-specific quest filtering (currently unused).
   * @param forceReload - If true, forces a refetch even if quests seem loaded.
   * @returns Observable emitting an array of relevant Quest objects.
   */
  selectOrLoadRelevantQuests(
    _nodeId: string | null | undefined, // <<< Accepteer undefined
    _challengeId: string | null | undefined, // <<< Accepteer undefined
    forceReload = false
  ): Observable<Quest[]> {
    this.logger.debug(`${this.logPrefix} Selecting/Loading relevant quests. ForceReload: ${forceReload}`);
    // For now, relevance is simplified: just return active quests after ensuring data is loaded.
    // TODO: Implement more sophisticated relevance checking (e.g., based on node/challenge context)
    //       possibly via new selectors or by passing context to the load action/effect/service.

    return this.store.pipe(
        select(QuestsSelectors.selectQuestsState), // Select the whole quest state once
        take(1), // Only need the current state to decide whether to load
        tap(state => {
            // Dispatch load action if quests haven't been loaded yet or if forced
            if (forceReload || state.ids.length === 0 && !state.loading) { // Check if empty AND not already loading
                this.logger.info(`${this.logPrefix} Relevant quests not loaded or forced, dispatching load action.`);
                this.store.dispatch(QuestsActions.loadQuestsRequested());
            } else {
                 this.logger.debug(`${this.logPrefix} Quests already loaded or loading, skipping dispatch.`);
            }
        }),
        // After potentially dispatching, switch to selecting the desired quests (active ones for now)
        // This ensures the component always gets the latest relevant quests from the store.
        switchMap(() => this.store.pipe(select(QuestsSelectors.selectActiveQuests)))
    );
  }
  // --- END NEW METHOD ---
  // --- Action Dispatchers ---
  // Why: Provide clear methods for components to trigger quest-related actions.

  /** Dispatches an action to load quests from the backend. */
  loadQuests(): void {
    this.logger.info(`${this.logPrefix} Dispatching Load Quests Requested`);
    this.store.dispatch(QuestsActions.loadQuestsRequested());
  }

  /** Dispatches an action to accept a specific quest. */
  acceptQuest(questId: string): void {
    this.logger.info(`${this.logPrefix} Dispatching Accept Quest Requested: ${questId}`);
    this.store.dispatch(QuestsActions.acceptQuestRequested({ questId }));
  }

  /** Dispatches an action to update the progress of a quest objective. */
  updateQuestProgress(questId: string, objectiveId: string, progress: number): void {
    this.logger.info(`${this.logPrefix} Dispatching Update Quest Progress: Quest=${questId}, Obj=${objectiveId}, Prog=${progress}`);
    this.store.dispatch(QuestsActions.updateQuestProgressRequested({ questId, objectiveId, progress }));
  }

  /** Dispatches an action to abandon an active quest. */
  abandonQuest(questId: string): void {
    this.logger.info(`${this.logPrefix} Dispatching Abandon Quest Requested: ${questId}`);
    this.store.dispatch(QuestsActions.abandonQuestRequested({ questId }));
  }

  /** Dispatches an action to claim the reward for a completed quest. */
  claimQuestReward(questId: string): void {
      this.logger.info(`${this.logPrefix} Dispatching Claim Quest Reward Requested: ${questId}`);
      this.store.dispatch(QuestsActions.claimQuestRewardRequested({ questId }));
  }

  /** Dispatches an action to set the currently selected quest in the UI. */
  selectQuest(id: string | null): void {
    this.logger.info(`${this.logPrefix} Dispatching Select Quest: ${id}`);
    this.store.dispatch(QuestsActions.selectQuest({ id }));
  }

  /** Dispatches an action to clear any current quest error message. */
  clearError(): void {
    this.logger.info(`${this.logPrefix} Dispatching Clear Quests Error`);
    this.store.dispatch(QuestsActions.clearQuestsError());
  }
}
