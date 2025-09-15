// libs/features/nodes/src/lib/resolvers/node-detail.resolver.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, first, map, switchMap, take, tap } from 'rxjs/operators';
import { NodeFull } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { NodesActions } from '../state/nodes.actions';
import { selectNodeById } from '../state/nodes.selectors';
// Verwijder import van GlobalState als niet nodig
// import { GlobalState } from '@royal-code/store';

// Definieer het type voor de data die de resolver teruggeeft
export type NodeDetailResolvedData = { node: NodeFull | null }; // Kan null zijn bij error

export const nodeDetailResolver: ResolveFn<NodeDetailResolvedData> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<NodeDetailResolvedData> => {

  const store = inject(Store); // Injecteer Store
  const logger = inject(LoggerService);
  const nodeId = route.paramMap.get('id'); // Haal ID uit route

  if (!nodeId) {
    logger.error('[NodeDetailResolver] No node ID found in route parameters.');
    // Geef een object terug dat aangeeft dat de node niet geladen kon worden
    return of({ node: null });
  }

  logger.info(`[NodeDetailResolver] Attempting to resolve node data for ID: ${nodeId}`);

  return store.select(selectNodeById(nodeId)).pipe(
    tap(nodeFromState => logger.debug(`[NodeDetailResolver] Node from state for ${nodeId}:`, nodeFromState ? 'Found' : 'Not Found')),
    // Wacht eventueel ook tot loading false is als de selector direct reageert op loading state
    // switchMap(nodeFromState =>
    //   store.select(selectNodesLoading).pipe(
    //       filter(loading => !loading), // Wacht tot niet meer aan het laden
    //       take(1),
    //       map(() => nodeFromState) // Geef node door
    //   )
    // ),
    take(1), // Neem de HUIDIGE waarde uit de state
    switchMap((nodeFromState: NodeFull | undefined): Observable<NodeDetailResolvedData> => {
      if (nodeFromState) {
        // --- Node al in de State ---
        logger.info(`[NodeDetailResolver] Node ${nodeId} found in state. Resolving immediately.`);
        return of({ node: nodeFromState }); // Geef de gevonden node direct terug
      } else {
        // --- Node NIET in de State: Start Laden ---
        logger.info(`[NodeDetailResolver] Node ${nodeId} not found in state. Dispatching load action.`);
        store.dispatch(NodesActions.loadFullNodeDetailsRequested({ id: nodeId }));

        // Wacht nu op de state update NA het laden
        return store.select(selectNodeById(nodeId)).pipe(
          // filter(node => !!node), // Wacht tot de node een waarde heeft (NIET null/undefined)
           filter((node): node is NodeFull => !!node), // Type guard + wacht op waarde
          take(1), // Neem de EERSTE keer dat de node in de state verschijnt
          tap(loadedNode => logger.info(`[NodeDetailResolver] Node ${nodeId} loaded into state. Resolving.`)),
          map(loadedNode => ({ node: loadedNode })), // Verpak in het ResolveData object
          catchError(err => {
              logger.error(`[NodeDetailResolver] Error while waiting for node ${nodeId} state update.`, err);
              return of({ node: null }); // Geef null terug bij error
          })
        );
      }
    })
  );
};
