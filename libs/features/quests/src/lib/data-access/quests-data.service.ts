// libs/features/quests/src/lib/data-access/quests-data.service.ts
/**
 * @fileoverview Service for interacting with the Quests API endpoint.
 *               Provides methods for fetching quest lists, details, and handling
 *               quest lifecycle actions (accept, progress, abandon, claim).
 * @version 2.0.0 - Refactored to use HttpClient, APP_CONFIG, and enterprise patterns.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

// --- Domain Imports ---
// Why: Use shared domain models for consistent data structures and type safety.
import { Quest, QuestStatus } from '@royal-code/shared/domain';

// --- Core Imports ---
// Why: Utilize core configuration and services for API URL and logging.
import { APP_CONFIG, AppConfig } from '@royal-code/core/config';
import { LoggerService } from '@royal-code/core/core-logging';

/**
 * @Injectable QuestsDataService
 * @providedIn 'root' // Provided globally, ensuring a single instance.
 * @description
 * Service responsible for all communication with the backend API regarding Quests.
 * It encapsulates HTTP requests for fetching and modifying quest data.
 */
@Injectable({ providedIn: 'root' })
export class QuestsDataService {
  // --- Dependencies ---
  // Why: Inject necessary services using Angular's inject() function.
  private http = inject(HttpClient);
  /** @property {LoggerService} logger - Service for application logging. */
  private logger = inject(LoggerService);
  /** @property {string} apiUrl - Base URL for the quests API, retrieved from global configuration. */
  private readonly apiUrl = `${inject(APP_CONFIG).apiUrl}/quests`; // Construct API URL using injected config.
  /** @property {string} logPrefix - Consistent prefix for log messages from this service. */
  private readonly logPrefix = '[QuestsDataService]';

  // --- Public API Methods ---

  /**
   * @method getQuests
   * @description Fetches a list of quests relevant to the current user from the backend.
   *              Supports optional filtering parameters.
   * @param {any} [filter] - Optional object containing filter criteria (e.g., { status: 'Active', challengeId: 'xyz' }).
   *                         Filtering implementation depends on the backend API capabilities.
   * @returns {Observable<Quest[]>} An observable emitting an array of Quest objects.
   */
  getQuests(filter?: any): Observable<Quest[]> {
    const context = 'getQuests'; // Context for logging and error handling.
    // Why: Use HttpParams for cleanly adding query parameters to the request.
    const params = this.buildParams(filter);
    this.logger.debug(`${this.logPrefix} ${context} - Fetching quests with params:`, params.toString());

    // Why: Perform the HTTP GET request using HttpClient. Type safety ensured by <Quest[]>.
    return this.http.get<Quest[]>(this.apiUrl, { params }).pipe(
      tap(quests => this.logger.debug(`${this.logPrefix} ${context} - Success. Received ${quests.length} quests.`)), // Log successful response.
      catchError(error => this.handleError(error, context)) // Centralized error handling.
    );
  }

  /**
   * @method getQuestById
   * @description Fetches the full details of a single quest by its unique identifier.
   * @param {string} id - The ID of the quest to retrieve.
   * @returns {Observable<Quest>} An observable emitting the detailed Quest object.
   */
  getQuestById(id: string): Observable<Quest> {
    const context = `getQuestById(${id})`;
    // Why: Construct the specific URL for fetching a single resource by ID.
    const url = `${this.apiUrl}/${id}`;
    this.logger.debug(`${this.logPrefix} ${context} - Fetching quest details.`);

    return this.http.get<Quest>(url).pipe(
      tap(quest => this.logger.debug(`${this.logPrefix} ${context} - Success. Received quest:`, quest?.id)),
      catchError(error => this.handleError(error, context))
    );
  }

  /**
   * @method acceptQuest
   * @description Sends a request to the backend to mark a specific quest as 'Active' for the current user.
   * @param {string} questId - The ID of the quest to accept.
   * @returns {Observable<Quest>} An observable emitting the updated Quest object (with status 'Active') from the backend.
   */
  acceptQuest(questId: string): Observable<Quest> {
    const context = `acceptQuest(${questId})`;
    // Why: Define the specific endpoint for the 'accept' action according to API design.
    const url = `${this.apiUrl}/${questId}/accept`;
    this.logger.debug(`${this.logPrefix} ${context} - Sending POST request.`);

    // Why: Use POST for actions that change state, even if the request body is empty.
    // The response is expected to be the updated Quest object.
    return this.http.post<Quest>(url, {}).pipe(
      tap(updatedQuest => this.logger.info(`${this.logPrefix} ${context} - Success. Quest status likely updated to Active.`)),
      catchError(error => this.handleError(error, context))
    );
  }

  /**
   * @method updateQuestProgress
   * @description Sends a request to update the progress of a specific quest objective.
   * @param {string} questId - The ID of the quest containing the objective.
   * @param {string} objectiveId - The ID of the objective to update.
   * @param {number} progress - The new progress value for the objective.
   * @returns {Observable<Quest>} An observable emitting the updated Quest object, potentially with updated objective progress and overall quest status.
   */
  updateQuestProgress(questId: string, objectiveId: string, progress: number): Observable<Quest> {
    const context = `updateQuestProgress(${questId}, obj: ${objectiveId})`;
    // Why: Define the specific endpoint for progress updates.
    const url = `${this.apiUrl}/${questId}/progress`; // API endpoint might vary.
    // Why: Send necessary data (objective ID, new progress) in the request body.
    const body = { objectiveId, progress };
    this.logger.debug(`${this.logPrefix} ${context} - Sending POST request with body:`, body);

    return this.http.post<Quest>(url, body).pipe(
      tap(updatedQuest => this.logger.info(`${this.logPrefix} ${context} - Success. Progress updated.`)),
      catchError(error => this.handleError(error, context))
    );
  }

  /**
   * @method abandonQuest
   * @description Sends a request to the backend to mark an active quest as 'Abandoned' by the user.
   * @param {string} questId - The ID of the quest to abandon.
   * @returns {Observable<Quest>} An observable emitting the updated Quest object (with status 'Abandoned').
   *         Alternatively, the API might return void or a simple success status. Adapt return type if needed.
   */
  abandonQuest(questId: string): Observable<Quest> {
    const context = `abandonQuest(${questId})`;
    // Why: Define the specific endpoint for abandoning a quest. Could be POST or DELETE depending on API design.
    const url = `${this.apiUrl}/${questId}/abandon`;
    this.logger.debug(`${this.logPrefix} ${context} - Sending POST request.`);

    // Assume POST for now, returning the updated Quest.
    return this.http.post<Quest>(url, {}).pipe(
      tap(updatedQuest => this.logger.info(`${this.logPrefix} ${context} - Success. Quest status likely updated to Abandoned.`)),
      catchError(error => this.handleError(error, context))
    );
  }

  /**
   * @method claimQuestReward
   * @description Sends a request to the backend for the user to claim rewards for a completed quest.
   * @param {string} questId - The ID of the completed quest whose rewards are being claimed.
   * @returns {Observable<Quest>} An observable emitting the updated Quest object (with status 'Claimed').
   *         The actual reward details might be handled separately or included here depending on API design.
   */
  claimQuestReward(questId: string): Observable<Quest> {
    const context = `claimQuestReward(${questId})`;
    // Why: Define the specific endpoint for claiming rewards.
    const url = `${this.apiUrl}/${questId}/claim`;
    this.logger.debug(`${this.logPrefix} ${context} - Sending POST request.`);

    return this.http.post<Quest>(url, {}).pipe(
      tap(updatedQuest => this.logger.info(`${this.logPrefix} ${context} - Success. Quest status likely updated to Claimed.`)),
      catchError(error => this.handleError(error, context))
    );
  }

  // --- Private Helper Methods ---

  /**
   * @method buildParams
   * @description Constructs `HttpParams` from a filter object, ignoring null/undefined values.
   *              Handles potential array values for multi-select filters.
   * @param {any} [filter] - The filter object.
   * @returns {HttpParams} The constructed HttpParams object.
   * @private
   */
  private buildParams(filter?: any): HttpParams {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach((key) => {
        const value = filter[key];
        // Append parameter only if the value is meaningful (not null or undefined).
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // If the value is an array, append each item separately for the same key.
            value.forEach((item: any) => { params = params.append(key, item); });
          } else {
            // Otherwise, set the parameter normally.
            params = params.set(key, value.toString());
          }
        }
      });
    }
    return params;
  }

  /**
   * @method handleError
   * @description Centralized error handler for HTTP requests within this service.
   *              Logs the error and transforms it into a user-friendly error message observable.
   * @param {HttpErrorResponse | unknown} error - The error object caught from HttpClient.
   * @param {string} context - A string describing the operation that failed (for logging).
   * @returns {Observable<never>} An observable that immediately emits an error.
   * @private
   */
  private handleError(error: HttpErrorResponse | unknown, context: string): Observable<never> {
    // Log the detailed error for debugging purposes.
    this.logger.error(`${this.logPrefix} API Call Failed - ${context}:`, error instanceof Error ? error.message : error);

    // Format a more user-friendly message (implementation depends on desired level of detail).
    let displayMessage = `Failed during ${context}.`;
    if (error instanceof HttpErrorResponse) {
      // Attempt to extract backend error message if available.
      const backendError = error.error?.message || error.error?.error || error.message;
      displayMessage = `API Error (${error.status}): ${backendError}`;
    } else if (error instanceof Error) {
      displayMessage = error.message;
    }

    // Why: Use throwError with a factory function to ensure the error is thrown correctly within the RxJS stream.
    return throwError(() => new Error(displayMessage));
  }

} // End Service Class
