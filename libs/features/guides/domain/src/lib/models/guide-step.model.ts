/**
 * @file guide-step.model.ts
 * @Version 1.0.0
 * @Description Defines the data model for a single step within a guide.
 */
import { ContentBlock } from './content-block.model';

export interface GuideStep {
  readonly id: string;
  readonly title: string;
  readonly estimatedMinutes: number;
  readonly content: readonly ContentBlock[];
}