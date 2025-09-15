// libs/features/nodes/src/lib/state/nodes.state.ts
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { NodeFull, NodeSummary } from '@royal-code/shared/domain';

/** NgRx Entity state slice for full Node details. */
export interface NodeDetailsState extends EntityState<NodeFull> {
  readonly selectedNodeId: string | null;
  readonly loadingDetails: boolean;
  readonly loadingInteraction: boolean;
  readonly errorDetails: string | null;
}

/** Adapter for NodeFull entities. */
export const nodeAdapter: EntityAdapter<NodeFull> = createEntityAdapter<NodeFull>({
  selectId: (node: NodeFull) => node.id,
});

/** Initial state for NodeDetailsState. */
export const initialNodeDetailsState: NodeDetailsState = nodeAdapter.getInitialState({
  selectedNodeId: null,
  loadingDetails: false,
  loadingInteraction: false,
  errorDetails: null,
});

/** State slice for Node summaries. */
export interface NodeSummariesState {
  readonly summaries: ReadonlyArray<NodeSummary>;
  readonly loadingSummaries: boolean;
  readonly errorSummaries: string | null;
}

/** Initial state for NodeSummariesState. */
export const initialNodeSummariesState: NodeSummariesState = {
  summaries: [],
  loadingSummaries: false,
  errorSummaries: null,
};

/** Root state for the Nodes feature. */
export interface NodesState {
  readonly details: NodeDetailsState;
  readonly summaries: NodeSummariesState;
}

/** Initial state for the entire Nodes feature. */
export const initialNodesState: NodesState = {
  details: initialNodeDetailsState,
  summaries: initialNodeSummariesState,
};

/** Feature key for the Nodes state slice. */
export const NODES_FEATURE_KEY = 'nodes';
