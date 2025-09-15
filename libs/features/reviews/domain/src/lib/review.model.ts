/**
 * @file review.model.ts
 * @Version 4.2.0 (Definitive & Aligned)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description Definitive domain models for Reviews, fully aligned.
 */
import { AuditableEntityBase, DateTimeInfo } from '@royal-code/shared/base-models';
import { Media, IUserStub, Image } from '@royal-code/shared/domain';

export enum ReviewTargetEntityType { PRODUCT = 'product' }
export enum ReviewStatus { Pending = 'pending', Approved = 'approved', Rejected = 'rejected', Flagged = 'flagged' }
export enum ReviewVoteType { Like = 'like', Dislike = 'dislike' }

export interface Review extends AuditableEntityBase {
  readonly id: string;
  readonly authorId: string;
  readonly profile: IUserStub;
  readonly targetEntityId: string;
  readonly targetEntityType: ReviewTargetEntityType;
  rating: number;
  title: string | null; // <-- FIX: Toegestaan null te zijn
  reviewText: string;
  isVerifiedPurchase: boolean;
  likes: number;
  dislikes: number;
  status: ReviewStatus;
  media?: ReadonlyArray<Media>;
  thumbnails?: ReadonlyArray<Image>;
  replyCount?: number;
  mediaCount?: number;
  userVote?: ReviewVoteType | null;
}
