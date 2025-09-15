/**
 * @file product-review-mapping.service.ts
 * @Version 1.1.0 (Fixes Type Mismatches & Enum Mapping)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description
 *   Mapping service om review data tussen frontend domeinmodellen (`Review`)
 *   en backend DTO's (`BackendReviewDto`) te transformeren.
 *   Deze service is tweerichtingsverkeer, wat handig is voor mocking en
 *   wanneer de backend-structuur strak moet worden gevolgd.
 *   Corrigeert type mismatches door expliciete casting en correcte enum-mappings.
 */
import { Injectable } from '@angular/core';
import { Review, ReviewTargetEntityType, ReviewVoteType } from '@royal-code/features/reviews/domain';
import { BackendReviewDto } from '@royal-code/features/reviews/core'; // Update import
import { DateTimeInfo } from '@royal-code/shared/base-models';

@Injectable({ providedIn: 'root' })
export class ProductReviewMappingService {

  /**
   * @method mapBackendDtoToReview
   * @description Converteert een backend `BackendReviewDto` naar een frontend `Review` domeinmodel.
   * @param dto Het backend DTO-object.
   * @returns Het gemapte `Review` object.
   */
  mapBackendDtoToReview(dto: BackendReviewDto): Review {
    return {
      id: dto.id,
      userId: dto.userId, // Property bestaat nu op BackendReviewDto
      userName: dto.userName, // Property bestaat nu op BackendReviewDto
      rating: dto.rating,
      comment: dto.comment, // Property bestaat nu op BackendReviewDto
      targetEntityId: dto.targetEntityId, // Property bestaat nu op BackendReviewDto
      targetEntityType: this.mapTargetEntityType(dto.targetEntityType),
      createdAt: this.toDateTimeInfo(dto.createdAt),
      lastModified: this.toDateTimeInfo(dto.lastModified),
      likes: dto.likes,
      dislikes: dto.dislikes,
      userVote: this.mapVoteType(dto.userVote),
    };
  }

  /**
   * @method mapReviewToBackendDto
   * @description Converteert een frontend `Review` domeinmodel naar een backend `BackendReviewDto`.
   *              Dit is voornamelijk handig voor het maken van mock data die de API nabootst.
   * @param review Het frontend `Review` object.
   * @returns Het gemapte `BackendReviewDto` object.
   */
  mapReviewToBackendDto(review: Review): BackendReviewDto {
    return {
      id: review.id,
      userId: review.userId, // Property bestaat nu op Review
      userName: review.userName, // Property bestaat nu op Review
      rating: review.rating,
      comment: review.comment, // Property bestaat nu op Review
      targetEntityId: review.targetEntityId, // Property bestaat nu op Review
      targetEntityType: this.mapTargetEntityTypeToNumber(review.targetEntityType),
      createdAt: review.createdAt?.iso ?? new Date().toISOString(),
      lastModified: review.lastModified?.iso ?? new Date().toISOString(),
      likes: review.likes,
      dislikes: review.dislikes,
      userVote: this.mapVoteTypeToNumber(review.userVote as ReviewVoteType | undefined), // Cast naar correct type
    };
  }

  private mapTargetEntityType(typeNumber: number): ReviewTargetEntityType {
    switch (typeNumber) {
      case 0: return ReviewTargetEntityType.PRODUCT;
      case 1: return ReviewTargetEntityType.GUIDE;
      case 2: return ReviewTargetEntityType.USER;
      default: return ReviewTargetEntityType.PRODUCT; // Fallback
    }
  }

  private mapTargetEntityTypeToNumber(type: ReviewTargetEntityType): number {
    switch (type) {
      case ReviewTargetEntityType.PRODUCT: return 0;
      case ReviewTargetEntityType.GUIDE: return 1;
      case ReviewTargetEntityType.USER: return 2;
      default: return 0;
    }
  }

  private mapVoteType(voteNumber: number | null | undefined): ReviewVoteType | undefined {
    if (voteNumber === null || voteNumber === undefined) return undefined;
    switch (voteNumber) {
      case 0: return ReviewVoteType.Like; // Corrected: Like (PascalCase)
      case 1: return ReviewVoteType.Dislike; // Corrected: Dislike (PascalCase)
      default: return undefined;
    }
  }

  private mapVoteTypeToNumber(voteType: ReviewVoteType | undefined): number | null {
    if (voteType === undefined) return null;
    switch (voteType) {
      case ReviewVoteType.Like: return 0; // Corrected: Like (PascalCase)
      case ReviewVoteType.Dislike: return 1; // Corrected: Dislike (PascalCase)
      default: return null;
    }
  }

  private toDateTimeInfo(isoString?: string): DateTimeInfo | undefined {
    return isoString ? { iso: isoString } : undefined;
  }
}