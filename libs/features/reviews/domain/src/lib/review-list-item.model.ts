/**
 * @file review-list-item.model.ts
 * @Version 2.3.0 (Added userVote and helpfulScore)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description Frontend DTO for a review item in a list, correctly handling nullability for avatar IDs and adding userVote and helpfulScore.
 */
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { ReviewStatus, ReviewVoteType } from './review.model'; // Importeer ReviewVoteType

export interface ReviewListItemDto {
  readonly id: string;
  readonly rating: number;
  readonly title: string | null;
  readonly reviewText: string;
  readonly isVerifiedPurchase: boolean;
  readonly likes: number;
  readonly dislikes: number;
  readonly status: ReviewStatus; // Enum string, bijv. 'pending'
  readonly createdAt: DateTimeInfo; // ISO string
  readonly authorId: string;
  readonly authorDisplayName: string;
  readonly authorAvatarMediaId?: string | null; // Sta 'null' expliciet toe
  readonly mediaCount: number;
  readonly replyCount: number;
  readonly totalVotes: number;
  readonly likePercentage: number;
  readonly truncatedText: string;
  readonly targetEntityId: string; // Het ID van het product/entiteit waar de review over gaat
  readonly productName?: string; // Optioneel, voor weergave in lijsten
  readonly productImageUrl?: string; // Optioneel, voor weergave in lijsten
  readonly helpfulScore?: number; // << TOEGEVOEGD
  readonly userVote?: ReviewVoteType | null; // << TOEGEVOEGD
  readonly lastModified: DateTimeInfo; // << TOEGEVOEGD, omdat het in AuditableEntityBase zit
}