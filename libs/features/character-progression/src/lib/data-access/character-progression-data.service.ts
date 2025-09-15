// libs/features/character-progression/src/lib/data-access/character-progression-data.service.ts
/**
 * @fileoverview Data service for the Character Progression feature.
 * This service is responsible for all HTTP communication with the backend API
 * related to character statistics, definitions, lifeskills, and skills.
 * @version 1.2.0
 * @author ChallengerAppDevAI
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { CharacterStats, Lifeskill, StatDefinition, SkillDefinition, UserSkill, SkillId } from '@royal-code/shared/domain';
import { APP_CONFIG } from '@royal-code/core/config';
import { LoggerService } from '@royal-code/core/core-logging';

/**
 * @Injectable CharacterProgressionDataService
 * @providedIn 'root'
 * @description Service for fetching and updating character progression data from the backend.
 */
@Injectable({ providedIn: 'root' })
export class CharacterProgressionDataService {
  // --- Injected Dependencies ---
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private appConfig = inject(APP_CONFIG);

  /** @property {string} apiUrl - Base URL for the character progression API, derived from global app config. */
  private readonly apiUrl = `${this.appConfig.backendUrl}/User`; // Assumes user-specific progression data is under /user
  /** @property {string} statsEndpoint - Specific endpoint for character core statistics. */
  private readonly statsEndpoint = `${this.apiUrl}/Stats`;
  /** @property {string} definitionsEndpoint - Specific endpoint for static stat definitions. */
  private readonly definitionsEndpoint = `${this.appConfig.backendUrl}/Stats/definitions`; // Global definitions
  /** @property {string} lifeskillsEndpoint - Specific endpoint for user's lifeskills. */
  private readonly lifeskillsEndpoint = `${this.apiUrl}/lifeskills`;
  /** @property {string} skillDefinitionsEndpoint - Specific endpoint for static skill definitions. */
  private readonly skillDefinitionsEndpoint = `${this.appConfig.backendUrl}/Skills/definitions`; // Global definitions
  /** @property {string} userSkillsEndpoint - Specific endpoint for user's skill progression. */
  private readonly userSkillsEndpoint = `${this.apiUrl}/Skills`;

  /** @const {string} logPrefix - Standardized prefix for log messages from this service. */
  private readonly logPrefix = '[CharProgressionDataService]';

  // --- Core Stats & Definitions ---

  /**
   * @method loadCharacterStats
   * @description Fetches the current character's core statistics from the backend.
   * @returns {Observable<CharacterStats>} An observable emitting the character's stats.
   */
  loadCharacterStats(): Observable<CharacterStats> {
    const context = 'loadCharacterStats';
    this.logger.info(`${this.logPrefix} ${context} - Fetching user stats from: ${this.statsEndpoint}`);
    return this.http.get<CharacterStats>(this.statsEndpoint).pipe(
      tap(stats => this.logger.debug(`${this.logPrefix} ${context} - Success. Received stats for user: ${stats.userId}`)),
      catchError(error => this.handleError(error, context))
    );
  }

  /**
   * @method loadStatDefinitions
   * @description Fetches the static definitions for all core statistics.
   * @returns {Observable<StatDefinition[]>} An observable emitting an array of stat definitions.
   */
  loadStatDefinitions(): Observable<StatDefinition[]> {
    const context = 'loadStatDefinitions';
    this.logger.info(`${this.logPrefix} ${context} - Fetching stat definitions from: ${this.definitionsEndpoint}`);
    return this.http.get<StatDefinition[]>(this.definitionsEndpoint).pipe(
        tap(definitions => this.logger.debug(`${this.logPrefix} ${context} - Success. Received ${definitions.length} definitions.`)),
        catchError(error => this.handleError(error, context))
    );
  }

  /**
   * @method updateCharacterStats
   * @description Sends a request to update the user's character statistics.
   * @param {Partial<CharacterStats>} statsChanges - An object containing the stat fields to be updated.
   * @returns {Observable<CharacterStats>} An observable emitting the full, updated character stats from the backend.
   */
  updateCharacterStats(statsChanges: Partial<CharacterStats>): Observable<CharacterStats> {
    const context = 'updateCharacterStats';
    this.logger.info(`${this.logPrefix} ${context} - Updating user stats with:`, statsChanges);
    return this.http.put<CharacterStats>(this.statsEndpoint, statsChanges).pipe(
      tap(updatedStats => this.logger.debug(`${this.logPrefix} ${context} - Success. Received updated stats for user: ${updatedStats.userId}`)),
      catchError(error => this.handleError(error, context))
    );
  }

  // --- Lifeskills ---

  /**
   * @method loadLifeskills
   * @description Fetches the user's current lifeskill progression data.
   * @returns {Observable<Lifeskill[]>} An observable emitting an array of the user's lifeskills.
   */
  loadLifeskills(): Observable<Lifeskill[]> {
    const context = 'loadLifeskills';
    this.logger.info(`${this.logPrefix} ${context} - Fetching user lifeskills from: ${this.lifeskillsEndpoint}`);
    return this.http.get<Lifeskill[]>(this.lifeskillsEndpoint).pipe(
        tap(skills => this.logger.debug(`${this.logPrefix} ${context} - Success. Received ${skills.length} lifeskills.`)),
        catchError(error => this.handleError(error, context))
    );
  }

  // --- Skill Definitions ---

  /**
   * @method loadSkillDefinitions
   * @description Fetches all available skill definitions from the backend.
   * @returns {Observable<SkillDefinition[]>} An observable emitting an array of skill definitions.
   */
  loadSkillDefinitions(): Observable<SkillDefinition[]> {
    const context = 'loadSkillDefinitions';
    this.logger.info(`${this.logPrefix} ${context} - Fetching skill definitions from: ${this.skillDefinitionsEndpoint}`);
    return this.http.get<SkillDefinition[]>(this.skillDefinitionsEndpoint).pipe(
        tap(definitions => this.logger.debug(`${this.logPrefix} ${context} - Success. Received ${definitions.length} skill definitions.`)),
        catchError(error => this.handleError(error, context))
    );
  }

  // --- User Skills (Progression) ---

  /**
   * @method loadUserSkills
   * @description Fetches the current user's progression data for all their skills.
   * @returns {Observable<UserSkill[]>} An observable emitting an array of user-specific skill data.
   */
  loadUserSkills(): Observable<UserSkill[]> {
    const context = 'loadUserSkills';
    this.logger.info(`${this.logPrefix} ${context} - Fetching user skills from: ${this.userSkillsEndpoint}`);
    return this.http.get<UserSkill[]>(this.userSkillsEndpoint).pipe(
        tap(skills => this.logger.debug(`${this.logPrefix} ${context} - Success. Received ${skills.length} user skills.`)),
        catchError(error => this.handleError(error, context))
    );
  }

  // --- User Skill Lifecycle Methods ---

  /**
   * @method addUserSkill
   * @description Sends a request to the backend for the user to learn (add) a new skill.
   * @param {SkillId} skillId - The ID of the skill to add.
   * @param {number} [initialLevel=1] - Optional initial level for the skill (backend might default).
   * @returns {Observable<UserSkill>} An observable emitting the newly added user skill data from the backend.
   */
  addUserSkill(skillId: SkillId, initialLevel: number = 1): Observable<UserSkill> {
    const context = `addUserSkill (id: ${skillId})`;
    this.logger.info(`${this.logPrefix} ${context} - Requesting to add skill.`);
    // The body depends on what the backend expects. Sometimes only skillId is enough.
    return this.http.post<UserSkill>(`${this.userSkillsEndpoint}`, { skillId, initialLevel }).pipe(
        tap(userSkill => this.logger.debug(`${this.logPrefix} ${context} - Success. Skill added:`, userSkill)),
        catchError(error => this.handleError(error, context))
    );
  }

  /**
   * @method upgradeSkill
   * @description Sends a request to the backend to upgrade a specific skill for the user.
   *              This typically implies spending a skill point.
   * @param {SkillId} skillId - The ID of the skill to upgrade.
   * @returns {Observable<UserSkill>} An observable emitting the updated user skill data after the upgrade.
   */
  upgradeSkill(skillId: SkillId): Observable<UserSkill> {
    const context = `upgradeSkill (id: ${skillId})`;
    this.logger.info(`${this.logPrefix} ${context} - Requesting to upgrade skill.`);
    // The body might be empty if the backend handles upgrade logic based on skillId.
    return this.http.post<UserSkill>(`${this.userSkillsEndpoint}/${skillId}/upgrade`, {}).pipe( // Example endpoint
        tap(updatedSkill => this.logger.debug(`${this.logPrefix} ${context} - Success. Skill upgraded:`, updatedSkill)),
        catchError(error => this.handleError(error, context))
    );
  }

  /**
   * @method deleteUserSkill
   * @description Sends a request to the backend for the user to "forget" (delete) a learned skill.
   * @param {SkillId} skillId - The ID of the skill to delete.
   * @returns {Observable<void>} An observable that completes upon successful deletion, or errors.
   *          The backend might return an empty body or a success indicator.
   */
  deleteUserSkill(skillId: SkillId): Observable<void> { // Backend might return void
    const context = `deleteUserSkill (id: ${skillId})`;
    this.logger.info(`${this.logPrefix} ${context} - Requesting to delete skill.`);
    return this.http.delete<void>(`${this.userSkillsEndpoint}/${skillId}`).pipe(
        tap(() => this.logger.debug(`${this.logPrefix} ${context} - Success. Skill deleted.`)),
        catchError(error => this.handleError(error, context))
    );
  }

  /**
   * @method handleError
   * @description Centralized private method for handling HTTP errors from API calls.
   *              It logs the error and transforms it into a user-friendly error message
   *              to be emitted by the failing observable.
   * @param {HttpErrorResponse | unknown} error - The error object caught from an HttpClient operation.
   * @param {string} context - A string describing the operation that failed, used for logging.
   * @returns {Observable<never>} An observable that immediately emits an error with a formatted message.
   * @private
   */
  private handleError(error: HttpErrorResponse | unknown, context: string): Observable<never> {
    // Log the detailed error for debugging purposes.
    this.logger.error(`${this.logPrefix} API Call Failed - ${context}:`, error instanceof Error ? error.message : error);

    // Format a more user-friendly message (implementation depends on desired level of detail).
    let displayMessage = `Failed during ${context}.`;
    if (error instanceof HttpErrorResponse) {
        // Attempt to extract backend error message if available.
        const backendError = error.error?.message || error.error?.error || error.message; // Check nested error properties
        displayMessage = `API Error (${error.status}): ${backendError || 'Unknown server error'}`;
    } else if (error instanceof Error) {
        displayMessage = error.message; // Use standard JS error message
    }
    // Why: Use throwError with a factory function to ensure the error is thrown correctly within the RxJS stream.
    return throwError(() => new Error(displayMessage));
  }
}
