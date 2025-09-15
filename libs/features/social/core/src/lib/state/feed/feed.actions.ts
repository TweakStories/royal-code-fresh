/**
 * @file feed.actions.ts
 * @Version 1.1.0 (Corrected readonly types)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @description Defines all NgRx actions for the Social Feed domain.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { HttpErrorResponse } from '@angular/common/http';
import { Media, ReactionType } from '@royal-code/shared/domain';
import { PrivacyLevel } from '@royal-code/shared/domain';
import { FeedItem, FeedReply } from '@royal-code/features/social/domain';

export type FeedErrorPayload = { error: HttpErrorResponse | unknown };

export const FeedActions = createActionGroup({
  source: 'Feed',
  events: {
    'Load Feed': props<{ feedId: string; page?: number; pageSize?: number; forceReload?: boolean; append?: boolean; }>(),
    'Load Feed Success': props<{ feedId: string; items: readonly FeedItem[]; page: number; totalPages: number; totalItems: number; append?: boolean; }>(),
    'Load Feed Failure': props<{ feedId: string } & FeedErrorPayload>(),

    'Add Feed Item':  props<{ feedId: string; content: string; media?: Media[]; gifUrl?: string; privacy: PrivacyLevel; }>(),
    'Add Feed Item Success': props<{ feedId: string; item: FeedItem }>(),
    'Add Feed Item Failure': props<{ feedId: string } & FeedErrorPayload>(),

    'Edit Feed Item': props<{ feedId: string; itemUpdate: Update<FeedItem> }>(),
    'Edit Feed Item Success': props<{ feedId: string; itemUpdate: Update<FeedItem> }>(),
    'Edit Feed Item Failure': props<{ feedId: string; itemId: string } & FeedErrorPayload>(),

    'Delete Feed Item': props<{ feedId: string; itemId: string }>(),
    'Delete Feed Item Success': props<{ feedId: string; itemId: string }>(),
    'Delete Feed Item Failure': props<{ feedId: string; itemId: string } & FeedErrorPayload>(),

    'React to Feed Item': props<{ feedId: string; itemId: string; reactionType: ReactionType | null }>(),
    'React to Feed Item Success': props<{ feedId: string; itemUpdate: Update<FeedItem> }>(),
    'React to Feed Item Failure': props<{ feedId: string; itemId: string; reactionType: ReactionType | null } & FeedErrorPayload>(),

    'Save Feed Item': props<{ feedId: string; itemId: string; save: boolean }>(),
    'Save Feed Item Success': props<{ feedId: string; itemUpdate: Update<FeedItem> }>(),
    'Save Feed Item Failure': props<{ feedId: string; itemId: string } & FeedErrorPayload>(),

    'Hide Feed Item': props<{ feedId: string; itemId: string }>(),
    'Hide Feed Item Success': props<{ feedId: string; itemId: string }>(),
    'Hide Feed Item Failure': props<{ feedId: string; itemId: string } & FeedErrorPayload>(),

    'Report Feed Item': props<{ feedId: string; itemId: string; reason: string }>(),
    'Report Feed Item Success': props<{ feedId: string; itemId: string }>(),
    'Report Feed Item Failure': props<{ feedId: string; itemId: string } & FeedErrorPayload>(),

    'Load Replies': props<{ feedId: string; parentId: string; forceReload?: boolean }>(),
    'Load Replies Success': props<{ feedId: string; parentId: string; replies: readonly FeedReply[] }>(),
    'Load Replies Failure': props<{ feedId: string; parentId: string } & FeedErrorPayload>(),

    'Add Feed Reply': props<{ feedId: string; parentId: string; replyToReplyId?: string; content?: string; media?: Media[]; gifUrl?:string }>(),
    'Add Feed Reply Success': props<{ feedId: string; parentId: string; reply: FeedReply }>(),
    'Add Feed Reply Failure': props<{ feedId: string; parentId: string } & FeedErrorPayload>(),

    'Edit Feed Reply': props<{ feedId: string; parentId: string; replyUpdate: Update<FeedReply> }>(),
    'Edit Feed Reply Success': props<{ feedId: string; parentId: string; replyUpdate: Update<FeedReply> }>(),
    'Edit Feed Reply Failure': props<{ feedId: string; parentId: string; replyId: string } & FeedErrorPayload>(),

    'Delete Feed Reply': props<{ feedId: string; parentId: string; replyId: string }>(),
    'Delete Feed Reply Success': props<{ feedId: string; parentId: string; replyId: string }>(),
    'Delete Feed Reply Failure': props<{ feedId: string; parentId: string; replyId: string } & FeedErrorPayload>(),

    'React to Feed Reply': props<{ feedId: string; parentId: string; replyId: string; reactionType: ReactionType | null }>(),
    'React to Feed Reply Success': props<{ feedId: string; parentId: string; replyUpdate: Update<FeedReply> }>(),
    'React to Feed Reply Failure': props<{ feedId: string; parentId: string; replyId: string; reactionType: ReactionType | null } & FeedErrorPayload>(),

    'Report Feed Reply': props<{ feedId: string; parentId: string; replyId: string; reason: string }>(),
    'Report Feed Reply Success': props<{ feedId: string; parentId: string; replyId: string }>(),
    'Report Feed Reply Failure': props<{ feedId: string; parentId: string; replyId: string } & FeedErrorPayload>(),

    'Clear Feed Item Error': emptyProps(),
    'Clear Replies Error': props<{ parentId: string }>(),
  }
});