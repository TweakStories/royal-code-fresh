/**
 * @file guide-summary.model.ts
 * @Version 1.1.0 (Progress Tracking Fields)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Defines the lightweight data model for a guide summary, now including
 *   `totalSteps` to facilitate progress calculation.
 */
import { Image } from '@royal-code/shared/domain';

export interface GuideSummary {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly coverImage: Image;
  readonly difficulty: 'beginner' | 'intermediate' | 'expert';
  readonly estimatedMinutes: number;
  readonly totalSteps: number; 
  userProgressPercent?: number;
}