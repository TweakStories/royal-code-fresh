/**
 * @file guide.model.ts
 * @Version 1.0.0
 * @Description Defines the full data model for a single, detailed guide.
 */
import { GuideSummary } from './guide-summary.model';
import { GuideStep } from './guide-step.model';

export interface Guide extends GuideSummary {
  readonly steps: readonly GuideStep[];
  readonly requiredTools: readonly string[]; // Array of Product IDs
  readonly includedParts: readonly string[]; // Array of Product IDs
}