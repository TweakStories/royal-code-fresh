// libs/features/character-progression/src/lib/state/character-progression.effects.ts
/**
 * @fileoverview NgRx effects for the Character Progression feature.
 * This class handles asynchronous operations such as fetching data from the
 * `CharacterProgressionDataService` and dispatching corresponding success or failure actions.
 * It includes effects for core stats, stat definitions, lifeskills, skill definitions,
 * user skills, and skill lifecycle management (add, upgrade, delete).
 * It also listens to authentication events to trigger initial data loads.
 * @version 1.2.1
 * @author ChallengerAppDevAI
 */
import { Injectable, inject, NgZone } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap, exhaustMap, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';

import { CharacterProgressionActions, CharacterProgressionErrorPayload } from './character-progression.actions';
import { CharacterProgressionDataService } from '../data-access/character-progression-data.service';
import { LoggerService } from '@royal-code/core/core-logging';
import { NotificationService } from '@royal-code/ui/notifications';
import { SkillDefinition, UserSkill, SkillId, CharacterStats, StatDefinition, Lifeskill } from '@royal-code/shared/domain';
import { UserActions } from '@royal-code/store/user'; // To listen for login/auth events

/**
 * Helper function to format API error messages.
 * @param error - The caught error object.
 * @param context - A string describing the operation context.
 * @returns A formatted error message string.
 */
function getApiErrorMessage(error: unknown, context: string = 'Character Progression API'): string {
  if (error instanceof HttpErrorResponse) {
    const backendMsg = error.error?.message || error.error?.error || error.statusText; // Check nested error messages
    return `${context} Error (${error.status}): ${backendMsg || 'Server error'}`;
  }
  if (error instanceof Error) {
    return `${context} Error: ${error.message}`;
  }
  return `${context}: An unknown error occurred.`;
}

/**
 * @Injectable CharacterProgressionEffects
 * @description Manages side effects for character progression actions, primarily
 *              API interactions and user notifications.
 */
@Injectable()
export class CharacterProgressionEffects {
  // --- Injected Dependencies ---
  private actions$ = inject(Actions);
  private charProgressionService = inject(CharacterProgressionDataService);
  private logger = inject(LoggerService);
  private zone = inject(NgZone); // For running UI updates (notifications) safely within Angular's zone
  private notificationService = inject(NotificationService);
  private store = inject(Store); // For dispatching further actions or selecting state if needed

  /** @const {string} logPrefix - Consistent prefix for log messages. */
  private readonly logPrefix = '[CharProgressionEffects]';

  /**
   * Effect to load all essential character progression data after a successful user profile load (e.g., post-login).
   * This ensures that stats, definitions, skills, and lifeskills are fetched when the user is authenticated.
   */
  loadProgressionDataAfterAuth$ = createEffect(() =>
     this.actions$.pipe(
         ofType(UserActions.loadProfileSuccess), // Listen for successful profile load from Auth feature
         tap(() => this.logger.info(`${this.logPrefix} User profile loaded. Dispatching requests for all character progression data.`)),
         mergeMap(() => [ // Dispatch multiple actions to load different aspects of progression
             CharacterProgressionActions.loadCharacterStatsRequested(),
             CharacterProgressionActions.loadStatDefinitionsRequested(),
             CharacterProgressionActions.loadSkillDefinitionsRequested(),
             CharacterProgressionActions.loadUserSkillsRequested(),
             CharacterProgressionActions.loadLifeskillsRequested(),
         ])
     )
  );

  // --- Core Stats Effects ---
  /** Effect to handle loading of core character statistics. */
  loadCharacterStats$ = createEffect(() => this.actions$.pipe(
    ofType(CharacterProgressionActions.loadCharacterStatsRequested),
    tap(() => this.logger.info(`${this.logPrefix} Handling Load Character Stats Requested.`)),
    switchMap(() => // Use switchMap to cancel previous requests if new ones come in
      this.charProgressionService.loadCharacterStats().pipe(
        map((stats: CharacterStats) => {
          this.logger.info(`${this.logPrefix} Load Character Stats Success for user: ${stats.userId}`);
          return CharacterProgressionActions.loadCharacterStatsSuccess({ stats });
        }),
        catchError(error => {
          const message = getApiErrorMessage(error, 'Load Core Stats');
          this.zone.run(() => this.logger.error(`${this.logPrefix} Load Character Stats Failed.`, { error, message }));
          return of(CharacterProgressionActions.loadCharacterStatsFailure({ error: message }));
        })
      )
    )
  ));

  /** Effect to handle loading of static stat definitions. */
  loadStatDefinitions$ = createEffect(() => this.actions$.pipe(
    ofType(CharacterProgressionActions.loadStatDefinitionsRequested),
    tap(() => this.logger.info(`${this.logPrefix} Handling Load Stat Definitions Requested.`)),
    switchMap(() =>
      this.charProgressionService.loadStatDefinitions().pipe(
        map((definitions: StatDefinition[]) => {
          this.logger.info(`${this.logPrefix} Load Stat Definitions Success. Count: ${definitions.length}`);
          return CharacterProgressionActions.loadStatDefinitionsSuccess({ definitions });
        }),
        catchError(error => {
          const message = getApiErrorMessage(error, 'Load Stat Definitions');
          this.zone.run(() => this.logger.error(`${this.logPrefix} Load Stat Definitions Failed.`, { error, message }));
          return of(CharacterProgressionActions.loadStatDefinitionsFailure({ error: message }));
        })
      )
    )
  ));

  /** Effect to handle updating character statistics. */
  updateCharacterStats$ = createEffect(() => this.actions$.pipe(
    ofType(CharacterProgressionActions.updateCharacterStatsRequested),
    tap(action => this.logger.info(`${this.logPrefix} Handling Update Character Stats Requested.`, action.statsChanges)),
    exhaustMap(({ statsChanges }) => // Use exhaustMap to prevent concurrent updates
      this.charProgressionService.updateCharacterStats(statsChanges).pipe(
        map((updatedStats: CharacterStats) => {
          this.logger.info(`${this.logPrefix} Update Character Stats Success for user: ${updatedStats.userId}`);
          this.zone.run(() => this.notificationService.showSuccess('charProgression.stats.updateSuccess'));
          return CharacterProgressionActions.updateCharacterStatsSuccess({ stats: updatedStats });
        }),
        catchError(error => {
          const message = getApiErrorMessage(error, 'Update Core Stats');
          this.zone.run(() => {
            this.logger.error(`${this.logPrefix} Update Character Stats Failed.`, { error, message });
            this.notificationService.showError('charProgression.stats.updateFailed');
          });
          return of(CharacterProgressionActions.updateCharacterStatsFailure({ error: message }));
        })
      )
    )
  ));

  // --- Lifeskills Effects ---
  /** Effect to handle loading of user's lifeskill progression. */
  loadLifeskills$ = createEffect(() => this.actions$.pipe(
    ofType(CharacterProgressionActions.loadLifeskillsRequested),
    tap(() => this.logger.info(`${this.logPrefix} Handling Load Lifeskills Requested.`)),
    switchMap(() =>
      this.charProgressionService.loadLifeskills().pipe(
        map((lifeskills: Lifeskill[]) => {
          this.logger.info(`${this.logPrefix} Load Lifeskills Success. Count: ${lifeskills.length}`);
          return CharacterProgressionActions.loadLifeskillsSuccess({ lifeskills });
        }),
        catchError(error => {
          const message = getApiErrorMessage(error, 'Load Lifeskills');
          this.zone.run(() => this.logger.error(`${this.logPrefix} Load Lifeskills Failed.`, { error, message }));
          return of(CharacterProgressionActions.loadLifeskillsFailure({ error: message }));
        })
      )
    )
  ));

  // --- Skill Definitions Effects ---
  /** Effect to handle loading of all static skill definitions. */
  loadSkillDefinitions$ = createEffect(() => this.actions$.pipe(
    ofType(CharacterProgressionActions.loadSkillDefinitionsRequested),
    tap(() => this.logger.info(`${this.logPrefix} Handling Load Skill Definitions Requested.`)),
    switchMap(() =>
      this.charProgressionService.loadSkillDefinitions().pipe(
        map((definitions: SkillDefinition[]) => {
          this.logger.info(`${this.logPrefix} Load Skill Definitions Success. Count: ${definitions.length}`);
          return CharacterProgressionActions.loadSkillDefinitionsSuccess({ definitions });
        }),
        catchError(error => {
          const message = getApiErrorMessage(error, 'Load Skill Definitions');
          this.zone.run(() => this.logger.error(`${this.logPrefix} Load Skill Definitions Failed.`, { error, message }));
          return of(CharacterProgressionActions.loadSkillDefinitionsFailure({ error: message }));
        })
      )
    )
  ));

  // --- User Skills (Progression) Effects ---
  /** Effect to handle loading of the user's specific skill progression. */
  loadUserSkills$ = createEffect(() => this.actions$.pipe(
    ofType(CharacterProgressionActions.loadUserSkillsRequested),
    tap(() => this.logger.info(`${this.logPrefix} Handling Load User Skills Requested.`)),
    switchMap(() =>
      this.charProgressionService.loadUserSkills().pipe(
        map((userSkills: UserSkill[]) => {
          this.logger.info(`${this.logPrefix} Load User Skills Success. Count: ${userSkills.length}`);
          return CharacterProgressionActions.loadUserSkillsSuccess({ userSkills });
        }),
        catchError(error => {
          const message = getApiErrorMessage(error, 'Load User Skills');
          this.zone.run(() => this.logger.error(`${this.logPrefix} Load User Skills Failed.`, { error, message }));
          return of(CharacterProgressionActions.loadUserSkillsFailure({ error: message }));
        })
      )
    )
  ));

  // --- User Skill Lifecycle Effects ---
  /** Effect to handle the request to add (learn) a new skill for the user. */
  addUserSkill$ = createEffect(() => this.actions$.pipe(
    ofType(CharacterProgressionActions.addUserSkillRequested),
    tap(action => this.logger.info(`${this.logPrefix} Handling Add User Skill Requested for: ${action.skillId}`)),
    exhaustMap(({ skillId, initialLevel }) => // exhaustMap to prevent rapid duplicate additions
      this.charProgressionService.addUserSkill(skillId, initialLevel).pipe(
        map((userSkill: UserSkill) => {
          this.logger.info(`${this.logPrefix} Add User Skill Success for: ${userSkill.id}`);
          this.zone.run(() => this.notificationService.showSuccess('charProgression.skills.addSuccess'));
          return CharacterProgressionActions.addUserSkillSuccess({ userSkill });
        }),
        catchError(error => {
          const message = getApiErrorMessage(error, `Add User Skill ${skillId}`);
          this.zone.run(() => {
            this.logger.error(`${this.logPrefix} Add User Skill Failed for: ${skillId}`, { error, message });
            this.notificationService.showError('charProgression.skills.addFailed');
          });
          return of(CharacterProgressionActions.addUserSkillFailure({ skillId, error: message }));
        })
      )
    )
  ));

  /** Effect to handle the request to upgrade an existing skill for the user. */
  upgradeSkill$ = createEffect(() => this.actions$.pipe(
    ofType(CharacterProgressionActions.upgradeSkillRequested),
    tap(action => this.logger.info(`${this.logPrefix} Handling Upgrade Skill Requested for: ${action.skillId}`)),
    exhaustMap(({ skillId }) => // exhaustMap to prevent rapid duplicate upgrades
      this.charProgressionService.upgradeSkill(skillId).pipe(
        map((updatedUserSkill: UserSkill) => {
          this.logger.info(`${this.logPrefix} Upgrade Skill Success for: ${updatedUserSkill.id}. New Level: ${updatedUserSkill.currentLevel}`);
          this.zone.run(() => this.notificationService.showSuccess('charProgression.skills.upgradeSuccess'));
          // Optionally, dispatch an action to reload character stats if skill points were consumed
          // this.store.dispatch(CharacterProgressionActions.loadCharacterStatsRequested());
          return CharacterProgressionActions.upgradeSkillSuccess({ updatedUserSkill });
        }),
        catchError(error => {
          const message = getApiErrorMessage(error, `Upgrade Skill ${skillId}`);
          this.zone.run(() => {
            this.logger.error(`${this.logPrefix} Upgrade Skill Failed for: ${skillId}`, { error, message });
            // Provide more specific error if possible (e.g., "Not enough skill points")
            this.notificationService.showError('charProgression.skills.upgradeFailed');
          });
          return of(CharacterProgressionActions.upgradeSkillFailure({ skillId, error: message }));
        })
      )
    )
  ));

  /** Effect to handle the request to delete (forget) a learned skill for the user. */
  deleteUserSkill$ = createEffect(() => this.actions$.pipe(
    ofType(CharacterProgressionActions.deleteUserSkillRequested),
    tap(action => this.logger.info(`${this.logPrefix} Handling Delete User Skill Requested for: ${action.skillId}`)),
    mergeMap(({ skillId }) => // mergeMap to allow multiple deletes concurrently if UI allows
      this.charProgressionService.deleteUserSkill(skillId).pipe(
        map(() => { // Service returns void on success
          this.logger.info(`${this.logPrefix} Delete User Skill Success for: ${skillId}`);
          this.zone.run(() => this.notificationService.showInfo('charProgression.skills.deleteSuccess'));
          return CharacterProgressionActions.deleteUserSkillSuccess({ skillId });
        }),
        catchError(error => {
          const message = getApiErrorMessage(error, `Delete User Skill ${skillId}`);
          this.zone.run(() => {
            this.logger.error(`${this.logPrefix} Delete User Skill Failed for: ${skillId}`, { error, message });
            this.notificationService.showError('charProgression.skills.deleteFailed');
          });
          return of(CharacterProgressionActions.deleteUserSkillFailure({ skillId, error: message }));
        })
      )
    )
  ));
}
