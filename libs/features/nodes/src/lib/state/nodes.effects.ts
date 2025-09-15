// libs/features/nodes/src/lib/state/nodes.effects.ts
/**
 * @fileoverview NgRx effects for the Nodes feature. Handles asynchronous operations
 *               like fetching data from NodesService and dispatching corresponding
 *               success or failure actions.
 * @version 2.1.0 - Effects aligned with nested state actions.
 */
import { Injectable, inject, NgZone } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NodesActions } from './nodes.actions';
import { NodesService } from '../services/nodes.service'; // Service for API calls
import { catchError, map, switchMap, exhaustMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { NodeFull, NodeSummary } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { HttpErrorResponse } from '@angular/common/http';
// Optional: Import ErrorActions for global error reporting
// import { ErrorActions } from '@royal-code/store/error';

/** Helper to format error messages. */
function getApiErrorMessage(error: unknown, context: string = 'Nodes API'): string {
  // Basic error formatting, can be enhanced
  if (error instanceof HttpErrorResponse) return `${context} Error (${error.status}): ${error.message}`;
  if (error instanceof Error) return `${context} Error: ${error.message}`;
  return `${context}: Unknown error occurred.`;
}

@Injectable()
export class NodesEffects {
  private actions$ = inject(Actions);
  private nodesService = inject(NodesService);
  private logger = inject(LoggerService);
  private zone = inject(NgZone);
  private readonly logPrefix = '[NodesEffects]';

  /** Effect to load node summaries. */
  loadNodeSummaries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NodesActions.loadNodeSummariesRequested),
      tap(action => this.logger.info(`${this.logPrefix} Handling ${action.type}`, action.filter)),
      switchMap(({ filter }) =>
        this.nodesService.getNodeSummaries(filter).pipe(
          map((summaries: NodeSummary[]) => {
            this.logger.info(`${this.logPrefix} Load Summaries Success. Count: ${summaries.length}`);
            return NodesActions.loadNodeSummariesSuccess({ summaries });
          }),
          catchError((error: unknown) => {
            const errorMessage = getApiErrorMessage(error, 'Load Summaries');
            this.zone.run(() => this.logger.error(`${this.logPrefix} Load Summaries Failed.`, { error: error, message: errorMessage }));
            return of(NodesActions.loadNodeSummariesFailure({ error: errorMessage })); // Dispatch specific failure
          })
        )
      )
    )
  );

  /** Effect to load full node details. */
  loadFullNodeDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NodesActions.loadFullNodeDetailsRequested),
      tap(action => this.logger.info(`${this.logPrefix} Handling ${action.type}. ID: ${action.id}`)),
      switchMap(({ id }) => // Use switchMap or mergeMap based on desired concurrency
        this.nodesService.getNodeById(id).pipe(
          map((node: NodeFull) => {
            this.logger.info(`${this.logPrefix} Load Details Success. ID: ${id}`);
            return NodesActions.loadFullNodeDetailsSuccess({ node });
          }),
          catchError((error: unknown) => {
            const errorMessage = getApiErrorMessage(error, `Load Detail (${id})`);
            this.zone.run(() => this.logger.error(`${this.logPrefix} Load Details Failed. ID: ${id}`, { error: error, message: errorMessage }));
            return of(NodesActions.loadFullNodeDetailsFailure({ error: errorMessage, nodeId: id }));
          })
        )
      )
    )
  );

  /** Effect to handle node interactions. */
  interactWithNode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NodesActions.interactWithNodeRequested),
      tap(action => this.logger.info(`${this.logPrefix} Handling ${action.type}. ID: ${action.id}, Action: ${action.action}`)),
      exhaustMap(({ id, action }) => // Prevent concurrent interactions
        this.nodesService.interactWithNode(id, action).pipe(
          map((updatedNode: NodeFull) => {
            this.logger.info(`${this.logPrefix} Interact Success. ID: ${id}`);
            return NodesActions.interactWithNodeSuccess({ node: updatedNode });
          }),
          catchError((error: unknown) => {
            const errorMessage = getApiErrorMessage(error, `Interact (${id}, ${action})`);
            this.zone.run(() => this.logger.error(`${this.logPrefix} Interact Failed. ID: ${id}`, { error: error, message: errorMessage }));
            return of(NodesActions.interactWithNodeFailure({ error: errorMessage, nodeId: id }));
          })
        )
      )
    )
  );
}
