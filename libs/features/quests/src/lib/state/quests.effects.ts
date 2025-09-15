// libs/features/quests/src/lib/state/quests.effects.ts
import { Injectable, inject, NgZone } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap, mergeMap, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Update } from '@ngrx/entity';

import { QuestsActions } from './quests.actions';
import { QuestsDataService } from '../data-access/quests-data.service'; // Service for API calls
import { Quest, QuestStatus } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '@royal-code/ui/notifications'; // For user feedback

/** Helper to format error messages (can be moved to a shared utility) */
function getApiErrorMessage(error: unknown, context: string): string {
  if (error instanceof HttpErrorResponse) return `${context} Error (${error.status}): ${error.message || error.statusText}`;
  if (error instanceof Error) return error.message;
  return `${context}: Unknown error occurred.`;
}

/**
 * @Injectable QuestsEffects
 * @description Manages side effects for quest-related actions, primarily interacting
 *              with the QuestsDataService for API communication.
 */
@Injectable()
export class QuestsEffects {
  // --- Dependencies ---
  private actions$ = inject(Actions);
  private questsDataService = inject(QuestsDataService); // Service for API calls
  private logger = inject(LoggerService);
  private notificationService = inject(NotificationService); // For success/error feedback
  private zone = inject(NgZone); // For running UI updates (notifications) inside Angular zone
  private readonly logPrefix = '[QuestsEffects]';

  // --- Effects ---

  /** Effect to load all relevant quests for the user. */
  loadQuests$ = createEffect(() => this.actions$.pipe(
    ofType(QuestsActions.loadQuestsRequested), // Listen for the request action.
    tap(() => this.logger.info(`${this.logPrefix} Handling Load Quests Requested.`)),
    switchMap(() => // Use switchMap to cancel previous requests if a new one comes in quickly.
      this.questsDataService.getQuests().pipe( // Call the data service method.
        tap(quests => this.logger.info(`${this.logPrefix} Load Quests Success. Count: ${quests.length}`)),
        map(quests => QuestsActions.loadQuestsSuccess({ quests })), // Dispatch success action on successful fetch.
        catchError(error => {
          // Handle API errors.
          const message = getApiErrorMessage(error, 'Load Quests');
          this.zone.run(() => { // Ensure UI updates (notifications) run inside Angular's zone.
             this.logger.error(`${this.logPrefix} Load Quests Failed.`, { error, message });
             this.notificationService.showError('quests.errors.loadFailed'); // Show user-friendly error.
          });
          // Dispatch failure action with the error message.
          return of(QuestsActions.loadQuestsFailure({ error: message }));
        })
      )
    )
  ));

  /** Effect to handle accepting a quest. */
  acceptQuest$ = createEffect(() => this.actions$.pipe(
    ofType(QuestsActions.acceptQuestRequested),
    tap(action => this.logger.info(`${this.logPrefix} Handling Accept Quest Requested: ${action.questId}`)),
    // Use exhaustMap to prevent multiple accept requests for the same quest simultaneously.
    exhaustMap(({ questId }) =>
      this.questsDataService.acceptQuest(questId).pipe(
        tap(updatedQuest => this.logger.info(`${this.logPrefix} Accept Quest Success: ${updatedQuest.id}`)),
        map(updatedQuest => {
          // Create an Update object for the NgRx Entity reducer.
          const questUpdate: Update<Quest> = { id: updatedQuest.id, changes: updatedQuest };
          // Dispatch success action with the update payload.
          return QuestsActions.acceptQuestSuccess({ questUpdate });
        }),
        catchError(error => {
          const message = getApiErrorMessage(error, `Accept Quest ${questId}`);
          this.zone.run(() => {
            this.logger.error(`${this.logPrefix} Accept Quest Failed: ${questId}`, { error, message });
            this.notificationService.showError('quests.errors.acceptFailed');
          });
          // Dispatch failure action.
          return of(QuestsActions.acceptQuestFailure({ questId, error: message }));
        })
      )
    )
  ));

  /** Effect to handle updating quest progress. */
  updateQuestProgress$ = createEffect(() => this.actions$.pipe(
    ofType(QuestsActions.updateQuestProgressRequested),
    tap(action => this.logger.info(`${this.logPrefix} Handling Update Quest Progress: Quest=${action.questId}, Obj=${action.objectiveId}, Prog=${action.progress}`)),
    // Use mergeMap to allow multiple progress updates potentially concurrently (e.g., from different sources).
    mergeMap(({ questId, objectiveId, progress }) =>
      this.questsDataService.updateQuestProgress(questId, objectiveId, progress).pipe(
        tap(updatedQuest => this.logger.info(`${this.logPrefix} Update Quest Progress Success: ${updatedQuest.id}, Status: ${updatedQuest.status}`)),
        map(updatedQuest => {
          const questUpdate: Update<Quest> = { id: updatedQuest.id, changes: updatedQuest };
          // Check if quest is now completed and show notification
          if (updatedQuest.status === QuestStatus.Completed) {
              this.zone.run(() => this.notificationService.showSuccess('quests.notifications.completed'));
          }
          return QuestsActions.updateQuestProgressSuccess({ questUpdate });
        }),
        catchError(error => {
          const message = getApiErrorMessage(error, `Update Quest Progress ${questId}/${objectiveId}`);
          this.zone.run(() => {
             this.logger.error(`${this.logPrefix} Update Quest Progress Failed: ${questId}/${objectiveId}`, { error, message });
             this.notificationService.showError('quests.errors.progressUpdateFailed');
           });
          return of(QuestsActions.updateQuestProgressFailure({ questId, objectiveId, error: message }));
        })
      )
    )
  ));

  // TODO: Implement effects for Abandon Quest, Claim Reward, Load Details if needed, following similar patterns.
}
