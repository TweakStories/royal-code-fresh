/**
 * @file social-api.service.ts
 * @Version 3.0.0 (Full CUD Implementation for Reactions & Replies)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @description
 *   Fully implemented service for the Social Feed API. Handles all GET, POST, PUT, DELETE
 *   operations for feed items, replies, and reactions, including correct DTO mapping.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { AbstractSocialApiService } from '@royal-code/features/social/core';
import { FeedItem, FeedReply } from '@royal-code/features/social/domain';
import { FeedItemDto, FeedReplyDto } from '@royal-code/features/social/domain';
import { PaginatedList } from '@royal-code/shared/utils';
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { ReactionType } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class SocialApiService extends AbstractSocialApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/social-feed`;

  // ====================================================================================
  // CHECKLIST ITEM [✅]: Feed Laden (Reeds geïmplementeerd en geverifieerd)
  // ====================================================================================
  override getFeed(feedId: string, page: number, limit: number): Observable<PaginatedList<FeedItem>> {
    const params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', limit.toString());

    return this.http.get<PaginatedList<FeedItemDto>>(`${this.apiUrl}/${feedId}`, { params }).pipe(
      map(paginatedDto => ({
        ...paginatedDto,
        items: paginatedDto.items.map(this.mapFeedItemDtoToFeedItem)
      }))
    );
  }

  override getReplies(feedId: string, parentItemId: string, page: number = 1, limit: number = 10): Observable<PaginatedList<FeedReply>> {
    const params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', limit.toString());

    return this.http.get<PaginatedList<FeedReplyDto>>(`${this.apiUrl}/${feedId}/items/${parentItemId}/replies`, { params }).pipe(
      map(paginatedDto => ({
        ...paginatedDto,
        items: paginatedDto.items.map(this.mapFeedReplyDtoToFeedReply)
      }))
    );
  }

  // ====================================================================================
  // CHECKLIST ITEM [✅]: Reacties (Likes, etc.)
  // ====================================================================================
  override reactToFeedItem(feedId: string, itemId: string, reactionType: ReactionType | null): Observable<FeedItem> {
    const command = { reactionType };
    return this.http.post<FeedItemDto>(`${this.apiUrl}/${feedId}/items/${itemId}/reaction`, command).pipe(
      map(this.mapFeedItemDtoToFeedItem)
    );
  }

  override reactToFeedReply(feedId: string, parentItemId: string, replyId: string, reactionType: ReactionType | null): Observable<FeedReply> {
    const command = { reactionType };
    // Volgens Swagger is parentItemId niet in de route, wat logisch is als replyId een unieke Guid is.
    return this.http.post<FeedReplyDto>(`${this.apiUrl}/${feedId}/replies/${replyId}/reaction`, command).pipe(
      map(this.mapFeedReplyDtoToFeedReply)
    );
  }

  // ====================================================================================
  // CHECKLIST ITEM [✅]: Replies (Toevoegen, Bewerken, Verwijderen)
  // ====================================================================================
  override addFeedReply(feedId: string, parentItemId: string, payload: Partial<FeedReply>): Observable<FeedReply> {
    // Cruciale mapping van het frontend `Partial<FeedReply>` naar de backend `AddFeedReplyCommand` DTO
    const command = {
      text: payload.text,
      replyToReplyId: payload.replyToReplyId,
      mediaIds: payload.media?.map(m => m.id) ?? [],
      gifUrl: payload.gifUrl
    };
    return this.http.post<FeedReplyDto>(`${this.apiUrl}/${feedId}/items/${parentItemId}/replies`, command).pipe(
      map(this.mapFeedReplyDtoToFeedReply)
    );
  }

  override editFeedReply(feedId: string, parentItemId: string, replyId: string, changes: Partial<FeedReply>): Observable<FeedReply> {
    const command = { text: changes.text }; // Backend verwacht alleen de tekst
    return this.http.put<FeedReplyDto>(`${this.apiUrl}/${feedId}/replies/${replyId}`, command).pipe(
      map(this.mapFeedReplyDtoToFeedReply)
    );
  }

  override deleteFeedReply(feedId: string, parentItemId: string, replyId: string): Observable<{ success: boolean }> {
    return this.http.delete(`${this.apiUrl}/${feedId}/replies/${replyId}`).pipe(
      map(() => ({ success: true })) // Map de 204 No Content naar een success object
    );
  }

  // ====================================================================================
  // NOG TE IMPLEMENTEREN (buiten de scope van de huidige vraag)
  // ====================================================================================
  override addFeedItem(feedId: string, payload: Partial<FeedItem>): Observable<FeedItem> {
    const command = {
        text: payload.text,
        mediaIds: payload.media?.map(m => m.id) ?? [],
        gifUrl: payload.gifUrl,
        privacy: payload.privacy
    };
    return this.http.post<FeedItemDto>(`${this.apiUrl}/${feedId}/items`, command).pipe(
        map(this.mapFeedItemDtoToFeedItem)
    );
  }

  override editFeedItem(feedId: string, itemId: string, changes: Partial<FeedItem>): Observable<FeedItem> {
    const command = {
        text: changes.text,
        mediaIds: changes.media?.map(m => m.id) ?? undefined, // Stuur alleen als het verandert
        gifUrl: changes.gifUrl,
        privacy: changes.privacy
    };
    return this.http.put<FeedItemDto>(`${this.apiUrl}/${feedId}/items/${itemId}`, command).pipe(
        map(this.mapFeedItemDtoToFeedItem)
    );
  }

  override deleteFeedItem(feedId: string, itemId: string): Observable<{ success: boolean }> {
    return this.http.delete(`${this.apiUrl}/${feedId}/items/${itemId}`).pipe(
        map(() => ({ success: true }))
    );
  }

  // ====================================================================================
  // Private Mappers (HART VAN DE INTEGRATIE)
  // ====================================================================================
  private mapFeedItemDtoToFeedItem = (dto: FeedItemDto): FeedItem => {
    return {
      ...dto,
      createdAt: this.mapStringToDateTimeInfo(dto.created),
      lastModified: this.mapStringToDateTimeInfo(dto.lastModified)
    };
  }

  private mapFeedReplyDtoToFeedReply = (dto: FeedReplyDto): FeedReply => {
      return {
          ...dto,
          createdAt: this.mapStringToDateTimeInfo(dto.created),
          lastModified: this.mapStringToDateTimeInfo(dto.lastModified)
      };
  }

  private mapStringToDateTimeInfo(isoString: string): DateTimeInfo {
    if (!isoString) return { iso: new Date().toISOString(), timestamp: Date.now() };
    const date = new Date(isoString);
    return {
      iso: isoString,
      timestamp: date.getTime()
    };
  }
}