// libs/features/nodes/src/lib/state/nodes.facade.ts
/**
 * @fileoverview Facade service providing a simplified public API for interacting
 *               with the Nodes feature state and dispatching related actions.
 * @version 2.1.0 - Selectors and actions aligned with nested state.
 */
import { Injectable, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, Observable, tap } from 'rxjs';

import { NodesActions } from './nodes.actions';
import * as NodesSelectors from './nodes.selectors';
import { NodesState } from './nodes.state';
import { NodeSummary, NodeFull, INodesFacade } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { Dictionary } from '@ngrx/entity';

/**
 * @Injectable NodesFacade
 * @description Provides a clean interface for components and other services to interact
 *              with the Nodes feature's state without direct knowledge of NgRx specifics.
 */
@Injectable({ providedIn: 'root' })
export class NodesFacade implements INodesFacade {
  private store = inject(Store<NodesState>); // Use specific state type
  private logger = inject(LoggerService);
  private readonly logPrefix = '[NodesFacade]';

  // === Summary State Observables ===
  /** Observable emitting the array of node summaries for map/list views. */
  readonly nodeSummaries$: Observable<ReadonlyArray<NodeSummary>> = this.store.pipe(select(NodesSelectors.selectNodeSummaries));
  /** Observable emitting true if the node summary list is currently loading. */
  readonly loadingSummaries$: Observable<boolean> = this.store.pipe(select(NodesSelectors.selectNodesLoadingSummaries));
  /** Observable emitting the error message for summary loading, or null. */
  readonly errorSummaries$: Observable<string | null> = this.store.pipe(select(NodesSelectors.selectNodesErrorSummaries));

  // === Detail State Observables ===
  /** Observable emitting the dictionary map of full node details (ID -> NodeFull). */
  readonly nodeEntitiesMap$: Observable<Dictionary<NodeFull>> = this.store.pipe(select(NodesSelectors.selectNodeEntitiesMap));
  /** Observable emitting the ID of the currently selected node, or null. */
  readonly selectedNodeId$: Observable<string | null> = this.store.pipe(select(NodesSelectors.selectCurrentNodeId));
  /** Observable emitting the full details of the currently selected node, or undefined. */
  readonly selectedNode$: Observable<NodeFull | undefined> = this.store.pipe(select(NodesSelectors.selectCurrentNode));
  /** Observable emitting true if specific node details are loading. */
  readonly loadingDetails$: Observable<boolean> = this.store.pipe(select(NodesSelectors.selectNodesLoadingDetails));
  /** Observable emitting true if a node interaction is in progress. */
  readonly loadingInteraction$: Observable<boolean> = this.store.pipe(select(NodesSelectors.selectNodesLoadingInteraction));
  /** Observable emitting the error message for details/interactions, or null. */
  readonly errorDetails$: Observable<string | null> = this.store.pipe(select(NodesSelectors.selectNodesErrorDetails));

  // === Combined State Observables ===
  /** Observable emitting true if *any* node-related operation is loading. */
  readonly isLoading$: Observable<boolean> = this.store.pipe(select(NodesSelectors.selectAnyNodesLoading));
  /** Observable emitting the first available error message (details prioritized), or null. */
  readonly error$: Observable<string | null> = this.store.pipe(select(NodesSelectors.selectAnyNodesError));

  /**
   * Returns an observable selecting a specific node's full details by ID.
   * @param nodeId The ID of the node to select.
   */
  selectNodeById(nodeId: string | null | undefined): Observable<NodeFull | undefined> {
    return this.store.pipe(select(NodesSelectors.selectNodeById(nodeId)));
  }

  // === Action Dispatchers ===

  /** Dispatches action to load node summaries. */
  loadNodeSummaries(filter?: any): void {
    this.logger.info(`${this.logPrefix} Dispatching Load Node Summaries Requested`, { filter });
    this.store.dispatch(NodesActions.loadNodeSummariesRequested({ filter }));
  }

  /** Dispatches action to load full details for a specific node. */
  loadFullNodeDetails(id: string): void {
    this.logger.info(`${this.logPrefix} Dispatching Load Full Node Details Requested`, { id });
    this.store.dispatch(NodesActions.loadFullNodeDetailsRequested({ id }));
  }

  /** Dispatches action to initiate interaction with a node. */
  interactWithNode(id: string, action: string): void {
    this.logger.info(`${this.logPrefix} Dispatching Interact With Node Requested`, { id, action });
    this.store.dispatch(NodesActions.interactWithNodeRequested({ id, action }));
  }

  /** Dispatches action to set the currently selected node ID. */
  selectNode(id: string | null): void {
    this.logger.info(`${this.logPrefix} Dispatching Node Selected`, { id });
    this.store.dispatch(NodesActions.nodeSelected({ id }));
  }

  /** Dispatches action to clear the details/interaction error state. */
  clearDetailsError(): void {
    this.logger.info(`${this.logPrefix} Dispatching Clear Details Error`);
    this.store.dispatch(NodesActions.clearDetailsError());
  }

  /** Dispatches action to clear the summaries error state. */
  clearSummariesError(): void {
    this.logger.info(`${this.logPrefix} Dispatching Clear Summaries Error`);
    this.store.dispatch(NodesActions.clearSummariesError());
  }

  /**
   * Convenience method to select or load node details. Checks if the node
   * exists in the state first before dispatching a load action.
   * Useful for components like the overlay that need details on demand.
   * @param nodeId The ID of the node to select or load.
   * @returns An Observable that emits the NodeFull details (or undefined).
   */
  selectOrLoadNodeDetails(nodeId: string): Observable<NodeFull | undefined> {
    return this.store.pipe(
      select(NodesSelectors.selectNodeById(nodeId)),
      tap(nodeFromState => {
        if (!nodeFromState) {
          // Only dispatch load if not already loading for this specific node (prevent rapid dispatches)
          // This requires more complex state (e.g., loadingById map) or checking the general loading flag cautiously.
          // For simplicity here, we dispatch if not found, relying on effects/reducers to handle potential duplicates if needed.
          this.logger.info(`${this.logPrefix} Node ${nodeId} not in state, dispatching load request.`);
          this.loadFullNodeDetails(nodeId);
        } else {
           this.logger.debug(`${this.logPrefix} Node ${nodeId} found in state.`);
        }
      }),
      filter(node => !!node) // Ensure the observable only emits once the node is actually available
    );
  }
}
