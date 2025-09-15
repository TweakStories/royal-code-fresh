// libs/features/challenges/src/controllers/challenges.service.ts
/**
 * @fileoverview Service for interacting with the Challenges API endpoint.
 *               Provides methods for fetching challenge lists (full or summaries),
 *               individual challenge details, and performing CRUD operations.
 * @version 1.1.0 - Added getChallengeSummaries method.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Challenge, ChallengeSummary, DifficultyLevel, Environment, Equipment, ModeOfCompletion, StatsRequirement } from '@royal-code/shared/domain'; // Import ChallengeSummary
import { APP_CONFIG } from '@royal-code/core/config';
import { PaginatedList } from '@royal-code/shared/utils';
import { LoggerService } from '@royal-code/core/core-logging'; // Import LoggerService
import { ChallengeFilters } from '../models/challenge-filter.model';

@Injectable({
  providedIn: 'root',
})
export class ChallengesService {
  // --- Dependencies ---
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${inject(APP_CONFIG).apiUrl}/challenges`; // Base URL for challenges
  private readonly logger = inject(LoggerService); // Inject LoggerService
  private readonly logPrefix = '[ChallengesService]';

  /** Helper to build HttpParams from filter object. */
  private buildParams(filters: ChallengeFilters): HttpParams {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') { // Skip empty strings too
        if (Array.isArray(value)) {
          value.forEach((item: any) => { params = params.append(key, item); });
        } else {
          params = params.set(key, value.toString());
        }
      }
    });
    return params;
  }

  /** Helper for consistent error handling. */
  private handleError(error: HttpErrorResponse, context: string) {
    const errMsg = getApiErrorMessage(error, context); // Use shared helper if defined, or simple format
    this.logger.error(`${this.logPrefix} ${context} failed:`, { status: error.status, message: error.message, url: error.url, error: error.error });
    return throwError(() => new Error(errMsg)); // Return factory function
  }

  /**
   * Fetches a paginated list of **Challenge Summaries** based on filters.
   * Assumes the backend endpoint supports returning summaries (e.g., via query param or specific path).
   * @param filters - Optional filters (ChallengeFilters) including pagination.
   * @returns Observable emitting a PaginatedList of ChallengeSummary objects.
   */
  getChallengeSummaries(filters: ChallengeFilters): Observable<PaginatedList<ChallengeSummary>> {
    const context = 'getChallengeSummaries';
    const params = this.buildParams(filters);
    // Optioneel: Voeg parameter toe om aan te geven dat we summaries willen
    // params = params.set('view', 'summary'); // Of hoe je API dit ook verwacht
    this.logger.debug(`${this.logPrefix} ${context} called with params:`, params.toString());

    // Roep het endpoint aan dat summaries teruggeeft
    // Pas evt. URL aan als het een apart endpoint is (bv. /api/challenges/summaries)
    return this.http.get<PaginatedList<ChallengeSummary>>(this.apiUrl, { params }).pipe(
      tap(response => this.logger.debug(`${this.logPrefix} ${context} success. Count: ${response?.items?.length ?? 0}, Page: ${response?.pageIndex}`)),
      catchError(error => this.handleError(error, context))
    );
  }

  /**
   * Fetches a paginated list of **full Challenge** objects based on filters.
   * @param filters - Optional filters (ChallengeFilters) including pagination.
   * @returns Observable emitting a PaginatedList of Challenge objects.
   */
  getChallenges(filters: ChallengeFilters): Observable<PaginatedList<Challenge>> {
    const context = 'getChallenges (full)';
    const params = this.buildParams(filters);
    this.logger.debug(`${this.logPrefix} ${context} called with params:`, params.toString());
    // Roep het endpoint aan dat volledige challenges teruggeeft
    return this.http.get<PaginatedList<Challenge>>(this.apiUrl, { params }).pipe(
      tap(response => this.logger.debug(`${this.logPrefix} ${context} success. Count: ${response?.items?.length ?? 0}, Page: ${response?.pageIndex}`)),
      catchError(error => this.handleError(error, context))
    );
  }

  /**
   * Fetches the full details of a single challenge by its ID.
   * @param id - The unique identifier of the challenge.
   * @returns Observable emitting the full Challenge object.
   */
  getChallengeById(id: string): Observable<Challenge> {
    const context = `getChallengeById(${id})`;
    const url = `${this.apiUrl}/${id}`;
    this.logger.debug(`${this.logPrefix} ${context} called.`);
    return this.http.get<Challenge>(url).pipe(
      tap(challenge => this.logger.debug(`${this.logPrefix} ${context} success.`)),
      catchError(error => this.handleError(error, context))
    );
  }

  /**
   * Creates a new challenge.
   * @param challenge - The challenge data (potentially excluding server-generated fields like ID).
   * @returns Observable emitting the newly created Challenge object from the backend.
   */
  addChallenge(challenge: Partial<Challenge>): Observable<Challenge> { // Accept Partial<Challenge>
    const context = 'addChallenge';
    this.logger.debug(`${this.logPrefix} ${context} called.`);
    return this.http.post<Challenge>(this.apiUrl, challenge).pipe(
      tap(newChallenge => this.logger.info(`${this.logPrefix} ${context} success. ID: ${newChallenge.id}`)),
      catchError(error => this.handleError(error, context))
    );
  }

  /**
   * Updates an existing challenge.
   * @param challenge - The full challenge object containing updates.
   * @returns Observable emitting the updated Challenge object from the backend.
   */
  updateChallenge(challenge: Challenge): Observable<Challenge> {
    const context = `updateChallenge(${challenge.id})`;
    this.logger.debug(`${this.logPrefix} ${context} called.`);
    return this.http.put<Challenge>(`${this.apiUrl}/${challenge.id}`, challenge).pipe(
      tap(updatedChallenge => this.logger.info(`${this.logPrefix} ${context} success.`)),
      catchError(error => this.handleError(error, context))
    );
  }

  /**
   * Deletes a challenge by its ID.
   * @param id - The ID of the challenge to delete.
   * @returns Observable indicating success or failure (body might be empty or { success: boolean }).
   */
  deleteChallenge(id: string): Observable<any> {
    const context = `deleteChallenge(${id})`;
    const url = `${this.apiUrl}/${id}`;
    this.logger.debug(`${this.logPrefix} ${context} called.`);
    return this.http.delete(url).pipe(
      tap(() => this.logger.info(`${this.logPrefix} ${context} success.`)),
      catchError(error => this.handleError(error, context))
    );
  }

  // --- Methods for related static data (Difficulty, Modes etc.) ---
  // These likely call different endpoints (e.g., /api/difficultylevels)

  getDifficultyLevels(): Observable<DifficultyLevel[]> {
    // Assume separate endpoint, adjust URL as needed
    return this.http.get<DifficultyLevel[]>('/api/difficultyLevels').pipe(catchError(error => this.handleError(error, 'getDifficultyLevels')));
  }
  getModesOfCompletion(): Observable<ModeOfCompletion[]> {
    return this.http.get<ModeOfCompletion[]>('/api/modesOfCompletion').pipe(catchError(error => this.handleError(error, 'getModesOfCompletion')));
  }
  getEnvironments(): Observable<Environment[]> {
    return this.http.get<Environment[]>('/api/environments').pipe(catchError(error => this.handleError(error, 'getEnvironments')));
  }
  getEquipmentNeeded(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>('/api/equipment').pipe(catchError(error => this.handleError(error, 'getEquipmentNeeded'))); // Endpoint likely different
  }
  getStatsRequirements(): Observable<StatsRequirement[]> {
    return this.http.get<StatsRequirement[]>('/api/statsRequirements').pipe(catchError(error => this.handleError(error, 'getStatsRequirements')));
  }
}

// Helper (kan ook in een aparte utility file)
function getApiErrorMessage(error: unknown, context: string = 'API'): string {
    if (error instanceof HttpErrorResponse) return `${context} Error (${error.status}): ${error.message || error.statusText}`;
    if (error instanceof Error) return `${context} Error: ${error.message}`;
    return `${context}: Unknown error occurred.`;
}
