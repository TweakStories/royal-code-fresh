/**
 * @file review-mutation.model.ts
 * @Version 2.1.0 (Writable Payload)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description Payloads for creating and updating reviews, now 100% aligned with the Swagger API contract and allowing modification for construction.
 */
import { ReviewTargetEntityType } from "./review.model";

export interface CreateReviewPayload {
  readonly targetEntityId: string;
  readonly targetEntityType: ReviewTargetEntityType;
  readonly rating: number;
  title?: string; 
  readonly reviewText: string;
  readonly isVerifiedPurchase?: boolean;
  readonly mediaIds?: string[];
}

export interface UpdateReviewPayload {
  readonly rating?: number;
  title?: string; 
  readonly reviewText?: string;
  readonly mediaIds?: string[];
}