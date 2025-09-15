/**
 * @file reviews-mapping.service.ts
 * @Version 3.1.0 (Definitive - Maps Backend DTO with Context)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description
 *   Definitive mapping service that correctly accepts a raw BackendReviewDto and
 *   contextual data (like targetEntityId) to create a fully-formed,
 *   immutable ReviewWithUIState domain model.
 */
import { Injectable, inject } from '@angular/core';
import { ReviewTargetEntityType, ReviewVoteType } from '@royal-code/features/reviews/domain';
import { Image, MediaType, IUserStub, SyncStatus } from '@royal-code/shared/domain';
import { DateTimeUtil } from '@royal-code/shared/utils';
import { APP_CONFIG } from '@royal-code/core/config';
import { ReviewWithUIState } from '../state/reviews.types';
import { BackendReviewDto } from '../DTO/backend-reviews.dto';

@Injectable({ providedIn: 'root' })
export class ReviewsMappingService {
  private readonly config = inject(APP_CONFIG);

  public mapDtoToDomain(
    dto: BackendReviewDto,
    targetEntityId: string, // FIX: Pass context in
    targetEntityType: ReviewTargetEntityType
  ): ReviewWithUIState {
    const avatar: Image | undefined = dto.authorAvatarMediaId
      ? {
          id: dto.authorAvatarMediaId,
          type: MediaType.IMAGE,
          variants: [{ url: `${this.config.backendUrl}/Media/${dto.authorAvatarMediaId}/avatar-thumbnail`, purpose: 'thumbnail' }],
          altText: `${dto.authorDisplayName}'s avatar`,
        }
      : undefined;

    const profile: IUserStub = {
      id: dto.authorId,
      displayName: dto.authorDisplayName,
      avatar: avatar,
      createdAt: undefined, 
      lastModified: undefined
    };

    return {
      id: dto.id,
      authorId: dto.authorId,
      profile: profile,
      targetEntityId: targetEntityId, // FIX: Set from parameter during creation
      targetEntityType: targetEntityType,
      rating: dto.rating,
      title: dto.title,
      reviewText: dto.reviewText,
      isVerifiedPurchase: dto.isVerifiedPurchase,
      likes: dto.likes,
      dislikes: dto.dislikes,
      status: dto.status,
      media: [],
      mediaCount: dto.mediaCount,
      replyCount: dto.replyCount,
      userVote: this.mapUserVote(dto.userVote),
      totalVotes: dto.totalVotes,
      likePercentage: dto.likePercentage,
      helpfulScore: dto.likePercentage,
      createdAt: DateTimeUtil.createDateTimeInfo(dto.createdAt),
      lastModified: DateTimeUtil.createDateTimeInfo(dto.createdAt),
      uiSyncStatus: SyncStatus.Synced,
    };
  }

  private mapUserVote(userVote: string | null | undefined): ReviewVoteType | null {
    if (!userVote) return null;
    if (userVote === 'like') return ReviewVoteType.Like;
    if (userVote === 'dislike') return ReviewVoteType.Dislike;
    return null;
  }

}