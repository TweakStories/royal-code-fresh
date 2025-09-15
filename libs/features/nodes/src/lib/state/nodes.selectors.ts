// libs/features/nodes/src/lib/state/nodes.selectors.ts
/**
 * @fileoverview NgRx selectors for the Nodes feature state.
 * @version 2.1.0 - Selectors targeting nested state slices.
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NodeFull, NodeSummary } from '@royal-code/shared/domain';
import { NodesState, nodeAdapter, NodeDetailsState, NodeSummariesState, NODES_FEATURE_KEY } from './nodes.state';

/** Selects the top-level 'nodes' feature state. */
export const selectNodesState = createFeatureSelector<NodesState>(NODES_FEATURE_KEY);

/** Selects the `details` state slice. */
export const selectNodeDetailsState = createSelector(selectNodesState, (state) => state.details);

/** Selects the `summaries` state slice. */
export const selectNodeSummariesState = createSelector(selectNodesState, (state) => state.summaries);

// === Summary Selectors ===
/** Selects the array of node summaries. */
export const selectNodeSummaries = createSelector(selectNodeSummariesState, (state) => state.summaries);
/** Selects the loading status for node summaries. */
export const selectNodesLoadingSummaries = createSelector(selectNodeSummariesState, (state) => state.loadingSummaries);
/** Selects the error message for node summaries. */
export const selectNodesErrorSummaries = createSelector(selectNodeSummariesState, (state) => state.errorSummaries);

// === Detail Selectors ===
const { selectEntities: selectNodeEntitiesInternal } = nodeAdapter.getSelectors(selectNodeDetailsState);

/** Selects the dictionary map of full node details. */
export const selectNodeEntitiesMap = selectNodeEntitiesInternal;
/** Selects a full node by its ID. */
export const selectNodeById = (nodeId: string | null | undefined) => createSelector(
    selectNodeEntitiesMap,
    (entities) => (nodeId ? entities[nodeId] : undefined)
);
/** Selects the ID of the currently selected node. */
export const selectCurrentNodeId = createSelector(selectNodeDetailsState, (state) => state.selectedNodeId);
/** Selects the full details of the currently selected node. */
export const selectCurrentNode = createSelector(selectNodeEntitiesMap, selectCurrentNodeId, (entities, selectedId) => (selectedId ? entities[selectedId] : undefined));
/** Selects the loading status for node details. */
export const selectNodesLoadingDetails = createSelector(selectNodeDetailsState, (state) => state.loadingDetails);
/** Selects the loading status for node interactions. */
export const selectNodesLoadingInteraction = createSelector(selectNodeDetailsState, (state) => state.loadingInteraction);
/** Selects the error message for node details/interactions. */
export const selectNodesErrorDetails = createSelector(selectNodeDetailsState, (state) => state.errorDetails);

// === Combined Selectors (Optional) ===
/** Selects true if *any* node operation is loading. */
export const selectAnyNodesLoading = createSelector(selectNodesLoadingSummaries, selectNodesLoadingDetails, selectNodesLoadingInteraction, (s, d, i) => s || d || i);
/** Selects the first available error message (details prioritized). */
export const selectAnyNodesError = createSelector(selectNodesErrorDetails, selectNodesErrorSummaries, (detailsError, summariesError) => detailsError ?? summariesError ?? null);
