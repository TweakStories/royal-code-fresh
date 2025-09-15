/**
 * @file feed.effects.ts
 * @Version 2.1.0 (Definitive Fixes for API Service and Typing)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @description Manages side effects for social feed actions, now correctly using the
 *              `AbstractSocialApiService` and ensuring type safety in RxJS streams.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Update } from '@ngrx/entity';
import * as FeedSelectors from './feed.selectors';
import { FeedActions } from './feed.actions';
import { AbstractSocialApiService } from '../../data-access/abstract-social-api.service';
import { FeedItem, FeedReply } from '@royal-code/features/social/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { PaginatedList } from '@royal-code/shared/utils';

@Injectable()
export class FeedEffects {
  private readonly actions$ = inject(Actions);
  private readonly socialApiService = inject(AbstractSocialApiService);
  private readonly logger = inject(LoggerService);
  private readonly store = inject(Store);
  private readonly logPrefix = '[FeedEffects]';

  constructor() {
    this.logger.info("<<<< FEED EFFECTS CONSTRUCTOR EXECUTED (v2.1) >>>>");
  }

  // =============================================================================
  // Feed Item Effects
  // =============================================================================

  loadFeed$ = createEffect(() => this.actions$.pipe(
    ofType(FeedActions.loadFeed),
    tap(({ feedId, page, pageSize, forceReload, append }) => this.logger.info(`${this.logPrefix} Requesting feed: ${feedId}, Page: ${page ?? 1}, PageSize: ${pageSize ?? 10}, Force: ${!!forceReload}, Append: ${!!append}`)),
    mergeMap(({ feedId, page = 1, pageSize = 10, append }) =>
      this.socialApiService.getFeed(feedId, page, pageSize).pipe(
        map((response: PaginatedList<FeedItem>) => {
            const items = response.items ?? [];
            this.logger.info(`${this.logPrefix} Fetched ${items.length} items for page ${response.pageNumber}.`);
            return FeedActions.loadFeedSuccess({
                feedId, items,
                page: response.pageNumber,
                totalPages: response.totalPages,
                totalItems: response.totalCount,
                append: append
             });
        }),
        catchError((error: HttpErrorResponse | unknown) => {
          this.logger.error(`${this.logPrefix} Load Feed Failed: ${feedId}`, error);
          return of(FeedActions.loadFeedFailure({ feedId, error }));
        })
      )
    )
  ));


  addFeedItem$ = createEffect(() => this.actions$.pipe(
    ofType(FeedActions.addFeedItem),
    tap(action => this.logger.info(`${this.logPrefix} Adding feed item for feed: ${action.feedId}`)),
    mergeMap(({ feedId, content, media, gifUrl, privacy }) =>
      this.socialApiService.addFeedItem(feedId, { text: content, media, gifUrl, privacy } as Partial<FeedItem>).pipe(
        map((newItem: FeedItem) => { // <-- FIX: Expliciet type
          this.logger.info(`${this.logPrefix} Add Feed Item Success: ${newItem.id}`);
          return FeedActions.addFeedItemSuccess({ feedId, item: newItem });
        }),
        catchError((error: HttpErrorResponse | unknown) => {
          this.logger.error(`${this.logPrefix} Add Feed Item Failed: ${feedId}`, error);
          return of(FeedActions.addFeedItemFailure({ feedId, error }));
        })
      )
    )
  ));

  editFeedItem$ = createEffect(() => this.actions$.pipe(
    ofType(FeedActions.editFeedItem),
    mergeMap(({ feedId, itemUpdate }) =>
      this.socialApiService.editFeedItem(feedId, itemUpdate.id as string, itemUpdate.changes).pipe(
        map((updated: FeedItem) => { // <-- FIX: Expliciet type
          this.logger.info(`${this.logPrefix} Edit Feed Item Success: ${updated.id}`);
          return FeedActions.editFeedItemSuccess({
             feedId,
             itemUpdate: { id: updated.id, changes: updated }
        })}),
        catchError((error: HttpErrorResponse | unknown) => {
          this.logger.error(`${this.logPrefix} Edit Feed Item Failed: ${itemUpdate.id}`, error);
          return of(FeedActions.editFeedItemFailure({ feedId, itemId: itemUpdate.id as string, error }));
        })
      )
    )
  ));

  deleteFeedItem$ = createEffect(() => this.actions$.pipe(
    ofType(FeedActions.deleteFeedItem),
    mergeMap(({ feedId, itemId }) =>
      this.socialApiService.deleteFeedItem(feedId, itemId).pipe(
        map(() => FeedActions.deleteFeedItemSuccess({ feedId, itemId })),
        catchError((error: HttpErrorResponse | unknown) => {
          this.logger.error(`${this.logPrefix} Delete Feed Item Failed: ${itemId}`, error);
          return of(FeedActions.deleteFeedItemFailure({ feedId, itemId, error }));
        })
      )
    )
  ));

  reactToFeedItem$ = createEffect(() => this.actions$.pipe(
    ofType(FeedActions.reactToFeedItem),
    mergeMap(({ feedId, itemId, reactionType }) =>
      this.socialApiService.reactToFeedItem(feedId, itemId, reactionType).pipe(
        map((updated: FeedItem) => {
          const itemUpdate: Update<FeedItem> = {
             id: updated.id,
             changes: { reactions: updated.reactions, userReaction: updated.userReaction }
           };
          return FeedActions.reactToFeedItemSuccess({ feedId, itemUpdate });
        }),
        catchError((error: HttpErrorResponse | unknown) => {
          this.logger.error(`${this.logPrefix} React to Feed Item Failed: ${itemId}`, error);
          return of(FeedActions.reactToFeedItemFailure({ feedId, itemId, reactionType, error }));
        })
      )
    )
  ));

  // =============================================================================
  // Feed Reply Effects
  // =============================================================================

  loadReplies$ = createEffect(() => this.actions$.pipe(
    ofType(FeedActions.loadReplies),
    mergeMap(({ feedId, parentId }) =>
      this.socialApiService.getReplies(feedId, parentId).pipe(
        map((response: PaginatedList<FeedReply>) => { // <-- FIX: Verwacht PaginatedList
          const replies = response.items;
          this.logger.info(`${this.logPrefix} Load Replies Success: Got ${replies.length} replies for parent ${parentId}`);
          return FeedActions.loadRepliesSuccess({ feedId, parentId, replies });
        }),
        catchError((error: HttpErrorResponse | unknown) => {
          this.logger.error(`${this.logPrefix} Load Replies Failed for parent: ${parentId}`, error);
          return of(FeedActions.loadRepliesFailure({ feedId, parentId, error }));
        })
      )
    )
  ));

  addFeedReply$ = createEffect(() => this.actions$.pipe(
    ofType(FeedActions.addFeedReply),
    mergeMap(({ feedId, parentId, content, replyToReplyId, media, gifUrl }) => {
      const payload: Partial<FeedReply> = { text: content, replyToReplyId, media, gifUrl };
      return this.socialApiService.addFeedReply(feedId, parentId, payload).pipe(
        map((newReply: FeedReply) => { // <-- FIX: Expliciet type
          this.logger.info(`${this.logPrefix} Add Feed Reply Success (API): ${newReply.id}`);
          return FeedActions.addFeedReplySuccess({ feedId, parentId, reply: newReply });
        }),
        catchError((error: HttpErrorResponse | unknown) => {
          this.logger.error(`${this.logPrefix} Add Feed Reply Failed for parent: ${parentId}`, error);
          return of(FeedActions.addFeedReplyFailure({ feedId, parentId, error }));
        })
      );
    })
  ));

  editFeedReply$ = createEffect(() => this.actions$.pipe(
    ofType(FeedActions.editFeedReply),
    mergeMap(({ feedId, parentId, replyUpdate }) =>
      this.socialApiService.editFeedReply(feedId, parentId, replyUpdate.id as string, replyUpdate.changes).pipe(
        map((updated: FeedReply) => { // <-- FIX: Expliciet type
          this.logger.info(`${this.logPrefix} Edit Feed Reply Success: ${updated.id}`);
          return FeedActions.editFeedReplySuccess({
            feedId,
            parentId,
            replyUpdate: { id: updated.id, changes: updated }
          });
        }),
        catchError((error: HttpErrorResponse | unknown) => {
          this.logger.error(`${this.logPrefix} Edit Feed Reply Failed: ${replyUpdate.id}`, error);
          return of(FeedActions.editFeedReplyFailure({ feedId, parentId, replyId: replyUpdate.id as string, error }));
        })
      )
    )
  ));

  deleteFeedReply$ = createEffect(() => this.actions$.pipe(
    ofType(FeedActions.deleteFeedReply),
    mergeMap(({ feedId, parentId, replyId }) =>
      this.socialApiService.deleteFeedReply(feedId, parentId, replyId).pipe(
        map(() => FeedActions.deleteFeedReplySuccess({ feedId, parentId, replyId })),
        catchError((error: HttpErrorResponse | unknown) => {
          this.logger.error(`${this.logPrefix} Delete Feed Reply Failed: ${replyId}`, error);
          return of(FeedActions.deleteFeedReplyFailure({ feedId, parentId, replyId, error }));
        })
      )
    )
  ));

  reactToFeedReply$ = createEffect(() => this.actions$.pipe(
    ofType(FeedActions.reactToFeedReply),
    switchMap(action =>
      this.store.pipe(
        select(FeedSelectors.selectReplyById(action.replyId)),
        take(1),
        map(currentReplyState => ({ action, currentReplyState }))
      )
    ),
    mergeMap(({ action, currentReplyState }) => {
      const { feedId, parentId, replyId, reactionType } = action;
      return this.socialApiService.reactToFeedReply(feedId, parentId, replyId, reactionType).pipe(
        map((updated: FeedReply) => {
          const changes: Partial<FeedReply> = {
            reactions: updated.reactions,
            userReaction: updated.userReaction
          };
          const replyUpdate: Update<FeedReply> = { id: updated.id, changes: changes };
          return FeedActions.reactToFeedReplySuccess({ feedId: action.feedId, parentId: action.parentId, replyUpdate });
        }),
        catchError((error: HttpErrorResponse | unknown) => {
          this.logger.error(`${this.logPrefix} Failed to react to reply ${replyId}`, error);
          return of(FeedActions.reactToFeedReplyFailure({
              feedId: action.feedId,
              parentId: action.parentId,
              replyId: action.replyId,
              reactionType: action.reactionType,
              error
            }));
        })
      );
    })
  ));
}