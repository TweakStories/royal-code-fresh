/**
 * @file feed.facade.ts
 * @Version 2.0.0 (Refactored for createFeature)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description
 *   Abstraction layer for feed state management, updated to consume selectors
 *   directly from the new `feed.feature.ts` public API.
 */
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { first, map, switchMap, take, tap } from 'rxjs/operators';
import { Update } from '@ngrx/entity';

import { FeedActions } from './feed.actions';
// --- CORRECTED IMPORT ---
import {
  selectAllFeedItemsOrdered,
  selectFeedItemsLoading,
  selectFeedItemsError,
  selectFeedCurrentPage,
  selectFeedTotalPages,
  selectRepliesLoadedForParent,
  selectRepliesForParentId,
  selectRepliesLoadingForParent,
  selectRepliesErrorForParent
} from './feed.feature';
import { Media, ReactionType } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { FeedItem, FeedReply } from '@royal-code/features/social/domain';
import { PrivacyLevel } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class FeedFacade {
  private readonly store = inject(Store);
  private readonly logger = inject(LoggerService);
  private readonly logPrefix = '[FeedFacade]';

  // --- Observables use the new direct imports ---
  readonly feedItems$: Observable<FeedItem[]> = this.store.select(selectAllFeedItemsOrdered);
  readonly loading$: Observable<boolean> = this.store.select(selectFeedItemsLoading);
  readonly error$: Observable<string | null> = this.store.select(selectFeedItemsError);
  readonly currentPage$: Observable<number> = this.store.select(selectFeedCurrentPage);
  readonly totalPages$: Observable<number> = this.store.select(selectFeedTotalPages);

  // --- ACTION DISPATCHERS (remain unchanged) ---
  loadFeed(feedId: string, page?: number, forceReload?: boolean, pageSize?: number): void {
    this.logger?.info(`${this.logPrefix} Dispatching loadFeed: feedId=${feedId}, page=${page}, forceReload=${forceReload}, pageSize=${pageSize}`);
    this.store.dispatch(FeedActions.loadFeed({ feedId, page, pageSize, forceReload }));
  }

  loadMoreFeedItems(feedId: string): void {
      this.logger?.info(`${this.logPrefix} Requesting to load more items for feed: ${feedId}`);
      combineLatest([this.currentPage$, this.totalPages$, this.loading$])
        .pipe(first())
        .subscribe(([currentPage, totalPages, isLoading]) => {
          const nextPage = currentPage + 1;
          if (isLoading || nextPage > totalPages) {
            if (isLoading) this.logger?.debug(`${this.logPrefix} Already loading.`);
            else this.logger?.info(`${this.logPrefix} No more pages.`);
            return;
          }
          this.logger?.info(`${this.logPrefix} Dispatching loadFeed for page: ${nextPage} (append: true)`);
          this.store.dispatch(FeedActions.loadFeed({ feedId: feedId, page: nextPage, append: true }));
        });
    }

  addFeedItem(feedId: string, content: string, media?: Media[], gifUrl?: string, privacy: PrivacyLevel = PrivacyLevel.PUBLIC): void {
    this.logger?.info(`${this.logPrefix} Dispatching addFeedItem: feedId=${feedId}`);
    this.store.dispatch(FeedActions.addFeedItem({ feedId, content, media, gifUrl, privacy }));
  }

  editFeedItem(feedId: string, itemId: string, changes: Partial<FeedItem>): void {
    const itemUpdate: Update<FeedItem> = { id: itemId, changes };
    this.logger?.info(`${this.logPrefix} Dispatching editFeedItem: itemId=${itemId}`);
    this.store.dispatch(FeedActions.editFeedItem({ feedId, itemUpdate }));
  }

  deleteFeedItem(feedId: string, itemId: string): void {
    this.logger?.info(`${this.logPrefix} Dispatching deleteFeedItem: itemId=${itemId}`);
    this.store.dispatch(FeedActions.deleteFeedItem({ feedId, itemId }));
  }

  reactToFeedItem(feedId: string, itemId: string, reactionType: ReactionType | null): void {
    this.logger?.info(`${this.logPrefix} Dispatching reactToFeedItem: itemId=${itemId}, reaction=${reactionType}`);
    this.store.dispatch(FeedActions.reactToFeedItem({ feedId, itemId, reactionType }));
  }

  addFeedReply(feedId: string, parentId: string, content?: string, replyToReplyId?: string, media?: Media[], gifUrl?: string): void {
    this.logger?.info(`${this.logPrefix} Dispatching addFeedReply: parentId=${parentId}, replyToReplyId=${replyToReplyId}`);
    this.store.dispatch(FeedActions.addFeedReply({ feedId, parentId, content, replyToReplyId, media, gifUrl}));
  }

  editFeedReply(feedId: string, parentId: string, replyId: string, changes: Partial<FeedReply>): void {
    const replyUpdate: Update<FeedReply> = { id: replyId, changes };
    this.logger?.info(`${this.logPrefix} Dispatching editFeedReply: replyId=${replyId}`);
    this.store.dispatch(FeedActions.editFeedReply({ feedId, parentId, replyUpdate }));
  }

  deleteFeedReply(feedId: string, parentId: string, replyId: string): void {
    this.logger?.info(`${this.logPrefix} Dispatching deleteFeedReply: replyId=${replyId}`);
    this.store.dispatch(FeedActions.deleteFeedReply({ feedId, parentId, replyId }));
  }

  reactToFeedReply(feedId: string, parentId: string, replyId: string, reactionType: ReactionType | null): void {
    this.logger?.info(`${this.logPrefix} Dispatching reactToFeedReply: replyId=${replyId}, reaction=${reactionType}`);
    this.store.dispatch(FeedActions.reactToFeedReply({ feedId, parentId, replyId, reactionType }));
  }

  reportFeedReply(feedId: string, parentId: string, replyId: string, reason: string): void {
      this.logger.info(`${this.logPrefix} Dispatching reportFeedReply: replyId=${replyId}`);
      this.store.dispatch(FeedActions.reportFeedReply({ feedId, parentId, replyId, reason }));
  }

  getOrLoadReplies(feedId: string, parentId: string): Observable<FeedReply[]> {
    return this.store.select(selectRepliesLoadedForParent(parentId)).pipe(
      take(1),
      tap((hasLoaded) => {
        if (!hasLoaded) {
          this.logger?.info(`${this.logPrefix} Replies not loaded for ${parentId}, dispatching loadReplies.`);
          this.store.dispatch(FeedActions.loadReplies({ feedId, parentId }));
        }
      }),
      switchMap(() => this.store.select(selectRepliesForParentId(parentId)))
    );
  }
}