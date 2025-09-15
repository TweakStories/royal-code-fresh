
/**
 * @file abstract-social-api.service.ts
 * @Version 1.0.1 (Corrected Domain Imports)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @description Defines the abstract service contract for the social/feed data-access layer.
 */
import { Observable } from 'rxjs';
import { FeedItem, FeedReply } from '@royal-code/features/social/domain'; 
import { PaginatedList } from '@royal-code/shared/utils';
import { ReactionType } from '@royal-code/shared/domain';

export abstract class AbstractSocialApiService {
  abstract getFeed(feedId: string, page: number, limit: number): Observable<PaginatedList<FeedItem>>;
  abstract addFeedItem(feedId: string, payload: Partial<FeedItem>): Observable<FeedItem>;
  abstract editFeedItem(feedId: string, itemId: string, changes: Partial<FeedItem>): Observable<FeedItem>;
  abstract deleteFeedItem(feedId: string, itemId: string): Observable<{ success: boolean }>;
  abstract reactToFeedItem(feedId: string, itemId: string, reactionType: ReactionType | null): Observable<FeedItem>;
  abstract getReplies(feedId: string, parentItemId: string): Observable<PaginatedList<FeedReply>>; // Let op: paginering toegevoegd
  abstract addFeedReply(feedId: string, parentItemId: string, payload: Partial<FeedReply>): Observable<FeedReply>;
  abstract editFeedReply(feedId: string, parentItemId: string, replyId: string, changes: Partial<FeedReply>): Observable<FeedReply>;
  abstract deleteFeedReply(feedId: string, parentItemId: string, replyId: string): Observable<{ success: boolean }>;
  abstract reactToFeedReply(feedId: string, parentItemId: string, replyId: string, reactionType: ReactionType | null): Observable<FeedReply>;
}