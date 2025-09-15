/**
 * @file abstract-guides-api.service.ts
 * @Version 1.1.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Defines the abstract contract for fetching guide data.
 */
import { Observable } from 'rxjs';
import { Guide, GuideSummary } from '@royal-code/features/guides/domain'; // << Zorg ervoor dat Guide hier ook geïmporteerd wordt.

export abstract class AbstractGuidesApiService {
  /**
   * @method getGuideSummaries
   * @description Fetches a list of all available guide summaries.
   * @returns An Observable emitting an array of GuideSummary.
   */
  abstract getGuideSummaries(): Observable<GuideSummary[]>;

  /**
   * @method getGuideBySlug
   * @description Fetches the detailed content of a single guide by its unique slug.
   * @param slug The unique identifier (slug) of the guide.
   * @returns An Observable emitting the full Guide object, or undefined if not found.
   */
  abstract getGuideBySlug(slug: string): Observable<Guide | undefined>; 

}