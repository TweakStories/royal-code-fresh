// libs/features/nodes/src/lib/state/nodes.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { NodeFull, NodeSummary } from '@royal-code/shared/domain';

/** Error payload structure for node actions. */
export type NodeErrorPayload = { readonly error: string };

/** Actions related to the Nodes feature state. */
export const NodesActions = createActionGroup({
  source: 'Nodes API/UI',
  events: {
    // Summaries
    'Load Node Summaries Requested': props<{ filter?: any }>(),
    'Load Node Summaries Success': props<{ summaries: ReadonlyArray<NodeSummary> }>(),
    'Load Node Summaries Failure': props<NodeErrorPayload>(),
    'Clear Summaries Error': emptyProps(),

    // Details
    'Load Full Node Details Requested': props<{ id: string }>(),
    'Load Full Node Details Success': props<{ node: NodeFull }>(),
    'Load Full Node Details Failure': props<NodeErrorPayload & { readonly nodeId: string }>(),
    'Clear Details Error': emptyProps(),

    // Interactions
    'Interact With Node Requested': props<{ id: string; action: string }>(),
    'Interact With Node Success': props<{ node: NodeFull }>(),
    'Interact With Node Failure': props<NodeErrorPayload & { readonly nodeId: string }>(),

    // UI Selection
    'Node Selected': props<{ id: string | null }>(),
  }
});
