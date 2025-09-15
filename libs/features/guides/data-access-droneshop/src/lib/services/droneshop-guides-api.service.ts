/**
 * @file droneshop-guides-api.service.ts
 * @Version 3.0.0 (DEFINITIVE - Correctly implements AbstractApiService)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Pure mock implementation of the Guides API service for Droneshop,
 *   now correctly implementing the `AbstractGuidesApiService` contract.
 */
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Guide, GuideSummary, MOCK_GUIDES } from '@royal-code/features/guides/domain';
import { AbstractGuidesApiService } from '@royal-code/features/guides/core';

@Injectable({ providedIn: 'root' })
export class DroneshopGuidesApiService extends AbstractGuidesApiService {
  /**
   * @override
   * @method getGuideSummaries
   * @description Retrieves a list of all guide summaries from mock data.
   * @returns An Observable emitting an array of GuideSummary after a delay.
   */
  override getGuideSummaries(): Observable<GuideSummary[]> {
    const summaries: GuideSummary[] = MOCK_GUIDES.map(guide => ({
      id: guide.id,
      slug: guide.slug,
      title: guide.title,
      description: guide.description,
      coverImage: guide.coverImage,
      difficulty: guide.difficulty,
      estimatedMinutes: guide.estimatedMinutes,
      totalSteps: guide.steps.length,
    }));
    return of(summaries).pipe(delay(500));
  }


  /**
   * @override
   * @method getGuideBySlug
   * @description Retrieves a specific guide by its slug from mock data.
   * @param slug The unique identifier (slug) of the guide.
   * @returns An Observable emitting the full Guide object, or undefined if not found, after a delay.
   */
  override getGuideBySlug(slug: string): Observable<Guide | undefined> {
    return of(MOCK_GUIDES.find(g => g.slug === slug)).pipe(delay(500));
  }
}