/**
 * @file node-challenge.service.ts
 * @description Service to handle bidirectional node-challenge relationships
 * @version 1.0.0
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { INodesFacade, IChallengesFacade } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class NodeChallengeService {
  
  /**
   * Inject facades dynamically to avoid circular dependencies
   */
  private nodesFacade: INodesFacade | null = null;
  private challengesFacade: IChallengesFacade | null = null;

  /**
   * Lazy load NodesFacade to avoid circular dependency
   */
  private async getNodesFacade(): Promise<INodesFacade> {
    if (!this.nodesFacade) {
      const { NodesFacade } = await import('@royal-code/features/nodes');
      this.nodesFacade = inject(NodesFacade);
    }
    return this.nodesFacade;
  }

  /**
   * Lazy load ChallengesFacade to avoid circular dependency  
   */
  private async getChallengesFacade(): Promise<IChallengesFacade> {
    if (!this.challengesFacade) {
      const { ChallengesFacade } = await import('@royal-code/features/challenges');
      this.challengesFacade = inject(ChallengesFacade);
    }
    return this.challengesFacade;
  }

  /**
   * Load node details with related challenge information
   */
  async loadNodeWithChallenges(nodeId: string): Promise<any> {
    const nodesFacade = await this.getNodesFacade();
    return nodesFacade.selectOrLoadNodeDetails(nodeId);
  }

  /**
   * Load challenge details with related node information
   */
  async loadChallengeWithNodes(challengeId: string): Promise<any> {
    const challengesFacade = await this.getChallengesFacade();
    return challengesFacade.selectOrLoadChallengeSummaryById(challengeId);
  }
}