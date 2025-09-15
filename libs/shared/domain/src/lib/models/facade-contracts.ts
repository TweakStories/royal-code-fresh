/**
 * @file facade-contracts.ts
 * @description Shared facade interfaces to break circular dependencies between feature modules
 * @author Royal-Code MonorepoAppDevAI
 * @version 1.0.0
 */

import { Observable } from 'rxjs';
import { NodeFull, NodeSummary } from './nodes/nodes.model';
import { Challenge, ChallengeSummary } from './challenges/challenge.model';

// Use existing domain models instead of duplicating

// Facade contract interfaces
export interface INodesFacade {
  // Observables
  nodeSummaries$: Observable<NodeSummary[]>;
  selectedNode$: Observable<NodeFull | null>;
  loadingSummaries$: Observable<boolean>;
  loadingDetails$: Observable<boolean>;
  errorSummaries$: Observable<string | null>;
  errorDetails$: Observable<string | null>;

  // Methods
  loadNodeSummaries(): void;
  selectNode(nodeId: string | null): void;
  selectOrLoadNodeDetails(nodeId: string): Observable<NodeFull>;
  interactWithNode(nodeId: string, interactionType: string): void;
}

export interface IChallengesFacade {
  // Observables
  challengeSummaries$: Observable<ChallengeSummary[]>;
  selectedChallenge$: Observable<Challenge | null>;
  loadingSummaries$: Observable<boolean>;
  loadingDetails$: Observable<boolean>;
  errorSummaries$: Observable<string | null>;
  errorDetails$: Observable<string | null>;
  totalItems$: Observable<number>;

  // Methods
  loadChallengeSummaries(filters?: any): void;
  selectChallenge(challengeId: string | null): void;
  selectOrLoadChallengeSummaryById(challengeId: string): Observable<ChallengeSummary>;
}