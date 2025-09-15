// libs/features/challenges/src/lib/resolvers/challenge-detail.resolver.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, switchMap, take, tap, catchError, map, timeout } from 'rxjs/operators'; // filter, first, map, timeout toegevoegd
import { Challenge } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { ChallengesActions } from '../state/challenges.actions';
import { selectChallengeById } from '../state/challenges.selectors';

// Type voor de resolver data
export type ChallengeDetailResolvedData = { challenge: Challenge | null };

/**
 * @ResolveFn challengeDetailResolver
 * @description Resolves the Challenge data before activating the ChallengeDetailComponent route.
 * It checks if the challenge is already in the NgRx store. If not, it dispatches an action
 * to load it and waits for the data to become available in the store.
 * Handles potential errors during loading.
 */
export const challengeDetailResolver: ResolveFn<ChallengeDetailResolvedData> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<ChallengeDetailResolvedData> => {

  const store = inject(Store);
  const logger = inject(LoggerService);
  const challengeId = route.paramMap.get('id');
  const logPrefix = '[ChallengeDetailResolver]';

  if (!challengeId) {
    logger.error(`${logPrefix} No challenge ID found in route parameters.`);
    return of({ challenge: null }); // Return null data if ID is missing
  }

  logger.info(`${logPrefix} Attempting to resolve challenge data for ID: ${challengeId}`);

  return store.select(selectChallengeById(challengeId)).pipe(
    // Log de waarde uit de state
    tap(challengeFromState => logger.debug(`${logPrefix} Challenge ${challengeId} from state:`, challengeFromState ? 'Found' : 'Not Found')),
    // Wacht tot de algemene challenge loading klaar is (als die bestaat en relevant is)
    // Dit voorkomt een race condition als er al een lijst geladen wordt.
    // switchMap(challengeFromState =>
    //   store.select(selectChallengesLoading).pipe(
    //     filter(loading => !loading),
    //     take(1),
    //     map(() => challengeFromState),
    //     tap(() => logger.debug(`${logPrefix} Loading state is false for ${challengeId}.`))
    //   )
    // ),
    // Neem de eerste waarde (kan undefined zijn)
    take(1),
    switchMap((challengeFromState: Challenge | undefined): Observable<ChallengeDetailResolvedData> => {
      if (challengeFromState) {
        // --- Challenge al in de State ---
        logger.info(`${logPrefix} Challenge ${challengeId} found in state. Resolving.`);
        return of({ challenge: challengeFromState });
      } else {
        // --- Challenge NIET in de State: Start Laden ---
        logger.info(`${logPrefix} Challenge ${challengeId} not in state. Dispatching loadChallenge action.`);
        store.dispatch(ChallengesActions.loadChallenge({ id: challengeId }));

        // Wacht nu op de state update NA het laden.
        return store.select(selectChallengeById(challengeId)).pipe(
          // Log elke emissie tijdens het wachten
          // tap(challenge => logger.debug(`${logPrefix} Waiting for challenge ${challengeId} state update. Current value: ${challenge ? 'Found' : 'Still Not Found'}`)),
          // Wacht tot de node daadwerkelijk in de state zit (niet meer undefined)
          filter((challenge): challenge is Challenge => !!challenge),
          // Neem de EERSTE keer dat de challenge in de state verschijnt
          take(1),
          tap(loadedChallenge => logger.info(`${logPrefix} Challenge ${challengeId} resolved successfully from store after loading.`)),
           // Voeg een timeout toe om oneindig wachten te voorkomen
           timeout({
             first: 5000, // Wacht maximaal 5 seconden op de eerste waarde
             with: () => {
                 logger.error(`${logPrefix} Timeout waiting for challenge ${challengeId} state update.`);
                 return of({ challenge: null }); // Geef null terug bij timeout
             }
           }),
          // Verpak in het ResolveData object
          map(loadedChallenge => ({ challenge: loadedChallenge })),
          // Vang eventuele errors in de selector stream zelf op
          catchError(err => {
              logger.error(`${logPrefix} Error while waiting for challenge ${challengeId} state update.`, err);
              return of({ challenge: null }); // Geef null terug bij error
          })
        );
      }
    })
  );
};
