/**
 * @file admin-reviews-mapping.service.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Service for mapping Admin Review DTOs to domain models.
 */
import { Injectable } from '@angular/core';
import { AdminReview, AdminReviewListItemDto } from '@royal-code/features/admin-reviews/domain';
import { DateTimeUtil } from '@royal-code/shared/utils';
import { ReviewTargetEntityType } from '@royal-code/features/reviews/domain';

@Injectable({ providedIn: 'root' })
export class AdminReviewsMappingService {

  mapListItemToAdminReview(dto: AdminReviewListItemDto): AdminReview {
    // Aangezien AdminReview momenteel een alias is voor Review, mappen we naar die structuur.
    return {
      id: dto.id,
      rating: dto.rating,
      title: dto.title,
      reviewText: dto.reviewText,
      isVerifiedPurchase: dto.isVerifiedPurchase,
      likes: dto.likes,
      dislikes: dto.dislikes,
      status: dto.status,
      createdAt: DateTimeUtil.createDateTimeInfo(dto.createdAt),
      lastModified: DateTimeUtil.createDateTimeInfo(dto.createdAt), // lastModified is niet in DTO, fallback
      authorId: dto.authorId,
      profile: {
        id: dto.authorId,
        displayName: dto.authorDisplayName,
        // Avatar mapping zou hier komen als de volledige URL beschikbaar was
      },
      targetEntityId: '', // DTO bevat deze niet, moet evt. uit context komen
      targetEntityType: ReviewTargetEntityType.PRODUCT, // Aanname
      mediaCount: dto.mediaCount,
      replyCount: dto.replyCount,
    };
  }
}