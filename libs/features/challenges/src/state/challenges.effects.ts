// libs/features/challenges/src/state/challenges.effects.ts
/**
 * @fileoverview NgRx effects for the Challenges feature. Handles API interactions
 *               for loading summaries, details, filters, and performing CRUD operations.
 * @version 1.0.0
 */
import { Injectable, inject, NgZone } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, exhaustMap, tap, withLatestFrom, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Update } from '@ngrx/entity';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store'; // Import Store if needed for withLatestFrom

import { ChallengesActions } from './challenges.actions';
import { Challenge, ChallengeSummary, FilterConfig } from '@royal-code/shared/domain';
import { PaginatedList } from '@royal-code/shared/utils';
import { LoggerService } from '@royal-code/core/core-logging';
import { ChallengesService } from '../controllers/challenges.service';
import { FilterChallengeService } from '../controllers/filter-challenge.service';
// Optional: Import global error action
// import { ErrorActions } from '@royal-code/store/error';

/** Helper to format error messages. */
function getApiErrorMessage(error: unknown, context: string = 'Challenges API'): string {
  if (error instanceof HttpErrorResponse) return `${context} Error (${error.status}): ${error.message}`;
  if (error instanceof Error) return `${context} Error: ${error.message}`;
  return `${context}: Unknown error occurred.`;
}

@Injectable()
export class ChallengesEffects {
  // --- Dependencies ---
  private actions$ = inject(Actions);
  private challengesService = inject(ChallengesService);
  private filterService = inject(FilterChallengeService);
  private logger = inject(LoggerService);
  private zone = inject(NgZone);
  private store = inject(Store); // Inject if using withLatestFrom

  /** Consistent log prefix. */
  private readonly logPrefix = '[ChallengesEffects]';

  // ===========================================================================
  // Effects
  // ===========================================================================

  /** Effect to load challenge summaries (paginated). */
  loadChallengeSummaries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChallengesActions.loadChallengeSummariesRequested),
      tap(action => this.logger.info(`${this.logPrefix} Handling ${action.type}`, action.filters)),
      switchMap(({ filters, append }) =>
        // === ROEP NU getChallengeSummaries AAN ===
        this.challengesService.getChallengeSummaries(filters ?? {}).pipe(
          map((response: PaginatedList<ChallengeSummary>) => { // <-- Verwacht nu direct summaries
            this.logger.info(`${this.logPrefix} Load Summaries Success. Page: ${response.pageIndex}, Count: ${response.items.length}`);
            // Geen mapping meer nodig hier!
            return ChallengesActions.loadChallengeSummariesSuccess({ response, append });
          }),
          catchError((error: unknown) => {
            const errorMessage = getApiErrorMessage(error, 'Load Summaries');
            this.zone.run(() => this.logger.error(`${this.logPrefix} Load Summaries Failed.`, { error: error, message: errorMessage }));
            return of(ChallengesActions.loadChallengeSummariesFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  /** Effect to load full challenge details. */
  loadChallengeDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChallengesActions.loadChallengeDetailsRequested),
      tap(action => this.logger.info(`${this.logPrefix} Handling ${action.type}. ID: ${action.id}`)),
      switchMap(({ id }) =>
        this.challengesService.getChallengeById(id).pipe( // Service call blijft hetzelfde
          map((challenge: Challenge) => {
            this.logger.info(`${this.logPrefix} Load Details Success. ID: ${id}`);
            return ChallengesActions.loadChallengeDetailsSuccess({ challenge });
          }),
          catchError((error: unknown) => {
            const errorMessage = getApiErrorMessage(error, `Load Detail (${id})`);
            this.zone.run(() => this.logger.error(`${this.logPrefix} Load Details Failed. ID: ${id}`, { error: error, message: errorMessage }));
            // Stuur challengeId mee
            return of(ChallengesActions.loadChallengeDetailsFailure({ error: errorMessage, challengeId: id }));
          })
        )
      )
    )
  );

   /** Effect to load filter configuration. */
   loadFilterConfig$ = createEffect(() =>
      this.actions$.pipe(
          ofType(ChallengesActions.loadFilterConfigRequested),
          tap(() => this.logger.info(`${this.logPrefix} Handling Load Filter Config Requested.`)),
          switchMap(() =>
              this.filterService.getFilterConfig().pipe(
                  map((config: FilterConfig[]) => {
                      this.logger.info(`${this.logPrefix} Load Filter Config Success. Count: ${config.length}`);
                      return ChallengesActions.loadFilterConfigSuccess({ config });
                  }),
                  catchError((error: unknown) => {
                      const errorMessage = getApiErrorMessage(error, 'Load Filter Config');
                      this.zone.run(() => this.logger.error(`${this.logPrefix} Load Filter Config Failed.`, { error: error, message: errorMessage }));
                      return of(ChallengesActions.loadFilterConfigFailure({ error: errorMessage }));
                  })
              )
          )
      )
   );


  // --- CRUD Effects ---

  /** Effect to create a new challenge. */
  createChallenge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChallengesActions.createChallengeRequested),
      tap(action => this.logger.info(`${this.logPrefix} Handling ${action.type}`)),
      // Use exhaustMap if you want to prevent creating multiple challenges rapidly
      exhaustMap(({ challenge }) =>
        this.challengesService.addChallenge(challenge as Challenge).pipe( // Cast needed as service likely expects full Challenge
          map((newChallenge: Challenge) => {
            this.logger.info(`${this.logPrefix} Create Challenge Success. ID: ${newChallenge.id}`);
            return ChallengesActions.createChallengeSuccess({ challenge: newChallenge });
          }),
          catchError((error: unknown) => {
            const errorMessage = getApiErrorMessage(error, 'Create Challenge');
            this.zone.run(() => this.logger.error(`${this.logPrefix} Create Challenge Failed.`, { error: error, message: errorMessage }));
            return of(ChallengesActions.createChallengeFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  /** Effect to update an existing challenge. */
  updateChallenge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChallengesActions.updateChallengeRequested),
      tap(action => this.logger.info(`${this.logPrefix} Handling ${action.type}. ID: ${action.challengeUpdate.id}`)),
      exhaustMap(({ challengeUpdate }) =>
        this.challengesService.updateChallenge(challengeUpdate.changes as Challenge).pipe( // Pass changes, assuming service handles partial update
          map((updatedChallenge: Challenge) => { // Assume service returns the full updated challenge
            this.logger.info(`${this.logPrefix} Update Challenge Success. ID: ${updatedChallenge.id}`);
            // Return an Update object for the reducer
            const updatePayload: Update<Challenge> = {
              id: updatedChallenge.id,
              changes: updatedChallenge // Send full updated object
            };
            return ChallengesActions.updateChallengeSuccess({ challengeUpdate: updatePayload });
          }),
          catchError((error: unknown) => {
            const challengeId = challengeUpdate.id as string;
            const errorMessage = getApiErrorMessage(error, `Update Challenge (${challengeId})`);
            this.zone.run(() => this.logger.error(`${this.logPrefix} Update Challenge Failed. ID: ${challengeId}`, { error: error, message: errorMessage }));
            return of(ChallengesActions.updateChallengeFailure({ error: errorMessage, challengeId }));
          })
        )
      )
    )
  );

  /** Effect to delete a challenge. */
  deleteChallenge$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChallengesActions.deleteChallengeRequested),
      tap(action => this.logger.info(`${this.logPrefix} Handling ${action.type}. ID: ${action.id}`)),
      mergeMap(({ id }) => // Use mergeMap to allow multiple deletions concurrently
        this.challengesService.deleteChallenge(id).pipe(
          map(() => {
            this.logger.info(`${this.logPrefix} Delete Challenge Success. ID: ${id}`);
            return ChallengesActions.deleteChallengeSuccess({ id }); // Only need ID for reducer
          }),
          catchError((error: unknown) => {
            const errorMessage = getApiErrorMessage(error, `Delete Challenge (${id})`);
            this.zone.run(() => this.logger.error(`${this.logPrefix} Delete Challenge Failed. ID: ${id}`, { error: error, message: errorMessage }));
            return of(ChallengesActions.deleteChallengeFailure({ error: errorMessage, challengeId: id }));
          })
        )
      )
    )
  );

} // End Class
