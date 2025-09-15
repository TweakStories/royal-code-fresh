// libs/features/nodes/src/lib/state/nodes.reducer.ts
import { createReducer, on, Action } from '@ngrx/store';
import { nodeAdapter, initialNodesState, NodesState } from './nodes.state';
import { NodesActions } from './nodes.actions';

/** Internal reducer function for the 'nodes' feature state. */
const _nodesReducer = createReducer(
  initialNodesState,

  // --- Summary Reducers ---
  on(NodesActions.loadNodeSummariesRequested, (state): NodesState => ({
    ...state,
    summaries: { ...state.summaries, loadingSummaries: true, errorSummaries: null }
  })),
  on(NodesActions.loadNodeSummariesSuccess, (state, { summaries }): NodesState => ({
    ...state,
    summaries: { ...state.summaries, summaries: summaries, loadingSummaries: false, errorSummaries: null }
  })),
  on(NodesActions.loadNodeSummariesFailure, (state, { error }): NodesState => ({
    ...state,
    summaries: { ...state.summaries, summaries: [], loadingSummaries: false, errorSummaries: error }
  })),
  on(NodesActions.clearSummariesError, (state): NodesState => ({
    ...state,
    summaries: { ...state.summaries, errorSummaries: null }
  })),

  // --- Detail Reducers ---
  on(NodesActions.loadFullNodeDetailsRequested, (state): NodesState => ({
    ...state,
    details: { ...state.details, loadingDetails: true, errorDetails: null }
  })),
  on(NodesActions.loadFullNodeDetailsSuccess, (state, { node }): NodesState => ({
    ...state,
    details: nodeAdapter.upsertOne(node, { ...state.details, loadingDetails: false, errorDetails: null })
  })),
  on(NodesActions.loadFullNodeDetailsFailure, (state, { error }): NodesState => ({
    ...state,
    details: { ...state.details, loadingDetails: false, errorDetails: error }
  })),

  // --- Interaction Reducers ---
  on(NodesActions.interactWithNodeRequested, (state): NodesState => ({
    ...state,
    details: { ...state.details, loadingInteraction: true, errorDetails: null }
  })),
  on(NodesActions.interactWithNodeSuccess, (state, { node }): NodesState => {
    // Why: Update both details and the corresponding summary immutably.
    const updatedDetailsState = nodeAdapter.upsertOne(node, { ...state.details, loadingInteraction: false, errorDetails: null });
    const updatedSummariesArray = state.summaries.summaries.map(summary =>
      summary.id === node.id
        ? { ...summary, status: node.status, popularity: node.popularity }
        : summary
    );
    return {
      ...state,
      details: updatedDetailsState,
      summaries: { ...state.summaries, summaries: updatedSummariesArray }
    };
  }),
  on(NodesActions.interactWithNodeFailure, (state, { error }): NodesState => ({
    ...state,
    details: { ...state.details, loadingInteraction: false, errorDetails: error }
  })),

  // --- Selection Reducer ---
  on(NodesActions.nodeSelected, (state, { id }): NodesState => ({
    ...state,
    details: { ...state.details, selectedNodeId: id }
  })),
  on(NodesActions.clearDetailsError, (state): NodesState => ({
    ...state,
    details: { ...state.details, errorDetails: null }
  }))
);

/** Exported reducer function for NgRx registration. */
export function nodesReducer(state: NodesState | undefined, action: Action): NodesState {
  return _nodesReducer(state, action);
}
