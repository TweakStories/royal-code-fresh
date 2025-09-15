// libs/features/challenges/src/state/challenges.facade.ts
/**
 * @fileoverview Facade service for the Challenges feature state.
 * @version 1.0.0
 */
import { Injectable, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { tap, filter, take, switchMap, map, catchError } from 'rxjs/operators';
import { Update, Dictionary } from '@ngrx/entity';

import { ChallengesActions } from './challenges.actions';
import * as ChallengesSelectors from './challenges.selectors';
import { ChallengesState } from './challenges.state';
import { Challenge, ChallengeSummary, FilterConfig, IChallengesFacade } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { ChallengeFilters } from '../models/challenge-filter.model';

@Injectable({ providedIn: 'root' })
export class ChallengesFacade implements IChallengesFacade {
  private store = inject(Store); // Inject Store<ChallengesState> for type safety
  private logger = inject(LoggerService);
  private readonly logPrefix = '[ChallengesFacade]';

  // --- Summary Observables ---
  readonly challengeSummaries$: Observable<ReadonlyArray<ChallengeSummary>> = this.store.pipe(select(ChallengesSelectors.selectChallengeSummaries));
  readonly loadingSummaries$: Observable<boolean> = this.store.pipe(select(ChallengesSelectors.selectChallengeSummariesLoading));
  readonly errorSummaries$: Observable<string | null> = this.store.pipe(select(ChallengesSelectors.selectChallengeSummariesError));
  readonly currentPage$: Observable<number> = this.store.pipe(select(ChallengesSelectors.selectChallengeSummariesCurrentPage));
  readonly totalPages$: Observable<number> = this.store.pipe(select(ChallengesSelectors.selectChallengeSummariesTotalPages));
  readonly totalItems$: Observable<number> = this.store.pipe(select(ChallengesSelectors.selectChallengeSummariesTotalItems));
  readonly pageSize$: Observable<number> = this.store.pipe(select(ChallengesSelectors.selectChallengeSummariesPageSize));

  // --- Filter Config Observables ---
  readonly filterConfig$: Observable<ReadonlyArray<FilterConfig>> = this.store.pipe(select(ChallengesSelectors.selectChallengeFilterConfig));
  readonly loadingFilterConfig$: Observable<boolean> = this.store.pipe(select(ChallengesSelectors.selectChallengeFilterConfigLoading));
  readonly errorFilterConfig$: Observable<string | null> = this.store.pipe(select(ChallengesSelectors.selectChallengeFilterConfigError));

  // --- Detail Observables ---
  readonly challengeEntitiesMap$: Observable<Dictionary<Challenge>> = this.store.pipe(select(ChallengesSelectors.selectChallengeEntitiesMap));
  readonly selectedChallengeId$: Observable<string | null> = this.store.pipe(select(ChallengesSelectors.selectCurrentChallengeId));
  readonly selectedChallenge$: Observable<Challenge | undefined> = this.store.pipe(select(ChallengesSelectors.selectCurrentChallenge));
  readonly loadingDetails$: Observable<boolean> = this.store.pipe(select(ChallengesSelectors.selectChallengeDetailsLoading));
  readonly errorDetails$: Observable<string | null> = this.store.pipe(select(ChallengesSelectors.selectChallengeDetailsError));

  // --- Combined Observables ---
  readonly isLoading$: Observable<boolean> = this.store.pipe(select(ChallengesSelectors.selectAnyChallengesLoading));
  readonly error$: Observable<string | null> = this.store.pipe(select(ChallengesSelectors.selectAnyChallengesError)); // Combined error

  /** Selects a full challenge by ID from the details state. */
  selectChallengeById(id: string | null | undefined): Observable<Challenge | undefined> {
    return this.store.pipe(select(ChallengesSelectors.selectChallengeById(id)));
  }

  /** Selects a challenge summary by ID from the summaries state. */
  selectChallengeSummaryById(id: string | null | undefined): Observable<ChallengeSummary | undefined> {
      return this.store.pipe(select(ChallengesSelectors.selectChallengeSummaryById(id)));
  }

  /**
   * Selects a challenge summary by ID from the store, or loads it if not present in the state.
   * @param id Challenge ID to select or load. If null or undefined, returns undefined.
   * @returns Observable of the requested ChallengeSummary, or undefined if not found or ID is null.
   */
  selectOrLoadChallengeSummaryById(id: string | null | undefined): Observable<ChallengeSummary | undefined> {
    if (!id) {
      this.logger.debug(`${this.logPrefix} selectOrLoadChallengeSummaryById called with null/undefined ID`);
      return of(undefined);
    }

    this.logger.debug(`${this.logPrefix} Selecting or Loading summary for Challenge ID: ${id}`);
    return this.selectChallengeSummaryById(id).pipe(
      take(1),
      switchMap(summary => {
        if (summary) {
          // Challenge summary found in state, return it
          this.logger.debug(`${this.logPrefix} Challenge summary for ${id} found in state.`);
          return of(summary);
        }

        // Check if we have the full details which can also provide summary data
        return this.selectChallengeById(id).pipe(
          take(1),
          switchMap(details => {
            if (details) {
              // Full challenge details found, create and return summary
              this.logger.debug(`${this.logPrefix} Full challenge details for ${id} found in state, using it for summary.`);
              // No need to explicitly create summary, selectors will handle this
              return of(details as unknown as ChallengeSummary);
            }

            // Neither summary nor details found, load details
            this.logger.info(`${this.logPrefix} Neither summary nor details for ${id} in state and not loading, dispatching load details request.`);
            this.loadChallengeDetails(id);

            // Return the result after loading
            return this.store.pipe(
              select(ChallengesSelectors.selectChallengeById(id)),
              filter(challenge => !!challenge),
              take(1),
              map(challenge => challenge as unknown as ChallengeSummary),
              catchError(error => {
                this.logger.error(`${this.logPrefix} Error loading challenge ${id}:`, error);
                return of(undefined);
              })
            );
          })
        );
      })
    );
  }

  // --- Action Dispatchers ---

  /** Loads challenge summaries, typically for overview lists. */
  loadChallengeSummaries(filters?: ChallengeFilters, append: boolean = false): void {
    this.logger.info(`${this.logPrefix} Dispatching Load Challenge Summaries Requested`, { filters, append });
    this.store.dispatch(ChallengesActions.loadChallengeSummariesRequested({ filters, append }));
  }

  /** Loads the configuration for available filters. */
  loadFilterConfig(): void {
    this.logger.info(`${this.logPrefix} Dispatching Load Filter Config Requested`);
    this.store.dispatch(ChallengesActions.loadFilterConfigRequested());
   }

  /** Clears errors related to the summary list. */
  clearSummariesError(): void {
    this.logger.info(`${this.logPrefix} Dispatching Clear Summaries Error`);
    this.store.dispatch(ChallengesActions.clearSummariesError());
  }

  /** Loads full details for a specific challenge. */
  loadChallengeDetails(id: string): void {
    this.logger.info(`${this.logPrefix} Dispatching Load Challenge Details Requested`, { id });
    this.store.dispatch(ChallengesActions.loadChallengeDetailsRequested({ id }));
  }

  /** Selects details from state or dispatches load action if needed. */
  selectOrLoadChallengeDetails(id: string): Observable<Challenge | undefined> {
    this.logger.debug(`${this.logPrefix} Selecting or Loading details for Challenge ID: ${id}`);
    return this.store.pipe(
      select(ChallengesSelectors.selectChallengeById(id)),
      tap(challengeFromState => {
        if (!challengeFromState) {
          this.store.pipe(select(ChallengesSelectors.selectChallengeDetailsLoading), take(1)).subscribe(isLoading => {
               if (!isLoading) {
                    this.logger.info(`${this.logPrefix} Challenge ${id} not in state and not loading, dispatching load request.`);
                    this.loadChallengeDetails(id);
               }
          });
        }
      }),
      filter(challenge => !!challenge) // Emit only when data is available
    );
  }

  /** Selects a challenge (sets the selectedChallengeId). */
  selectChallenge(id: string | null): void {
    this.logger.info(`${this.logPrefix} Dispatching Select Challenge`, { id });
    this.store.dispatch(ChallengesActions.selectChallenge({ id }));
  }

  /** Selects challenge summaries by their IDs. */
  selectChallengeSummariesByIds(ids: string[] | undefined | null): Observable<ChallengeSummary[]> {
    return this.store.pipe(select(ChallengesSelectors.selectChallengeSummariesByIds(ids)));
  }

  /** Clears errors related to challenge details. */
  clearDetailsError(): void {
    this.logger.info(`${this.logPrefix} Dispatching Clear Details Error`);
    this.store.dispatch(ChallengesActions.clearDetailsError());
  }

  // --- CRUD Dispatchers ---
  /** Creates a new challenge. */
  createChallenge(challengeData: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.logger.info(`${this.logPrefix} Dispatching Create Challenge Requested`);
    this.store.dispatch(ChallengesActions.createChallengeRequested({ challenge: challengeData }));
  }

  /** Updates an existing challenge. */
  updateChallenge(id: string, changes: Partial<Challenge>): void {
    const challengeUpdate: Update<Challenge> = { id, changes };
    this.logger.info(`${this.logPrefix} Dispatching Update Challenge Requested`, { id, changes });
    this.store.dispatch(ChallengesActions.updateChallengeRequested({ challengeUpdate }));
  }

  /** Deletes a challenge. */
  deleteChallenge(id: string): void {
    this.logger.info(`${this.logPrefix} Dispatching Delete Challenge Requested`, { id });
    this.store.dispatch(ChallengesActions.deleteChallengeRequested({ id }));
  }
}
