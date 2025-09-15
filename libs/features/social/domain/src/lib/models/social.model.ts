// libs/features/social/domain/src/lib/models/social.model.ts
/**
 * @fileoverview Defines the core data models for the social feature,
 * including Feeds, Conversations, Messages, Reactions, and associated enums.
 * @version 1.3.0 - Centralized Reaction models to break circular dependency.
 */
import { Media, PrivacyLevel, Profile, Tag } from "@royal-code/shared/domain"; // Assuming Tag is from shared/domain
import { AuditableEntityBase } from "@royal-code/shared/base-models";
import { ReactionSummary, ReactionType } from '@royal-code/shared/domain'; // <-- CORRECTED IMPORT

/** Represents a container for social feed items, identified by a unique ID. */
export interface Feed {
  id: string;
  /** An array of FeedItem objects belonging to this feed. */
  feedItems: FeedItem[];
  /** Optional: Structure to hold replies keyed by their parent item's ID, if not directly nested in FeedItem. */
  repliesByItem?: Record<string, FeedReply[]>;
}

/** Enum representing the read status (potentially unused currently). */
export enum ReadStatus {
  UNREAD = 'unread',
  READ = 'Read',
}

/** Represents a single post or item within a social feed. */
export interface FeedItem extends AuditableEntityBase {
  /** Unique identifier for the feed item (primary key for NgRx entity). */
  id: string;
  /** Identifier of the feed this item belongs to. */
  feedId: string;
  /** Profile of the item's author. */
  author: Profile;
  /** Optional text content of the feed item. Accepteert nu `null`. */
  text?: string | null; // <-- FIX: Nu string | null
  /** Optional array of media objects (images, videos) attached. Accepteert nu `null`. */
  media?: Media[] | null; // <-- FIX: Nu Media[] | null
  /** Optional URL of an attached GIF. Accepteert nu `null`. */
  gifUrl?: string | null; // <-- FIX: Nu string | null
  /** Array summarizing reaction counts for this item. Accepteert nu `null`. */
  reactions?: ReadonlyArray<ReactionSummary> | null; // <-- FIX: Nu ReadonlyArray<ReactionSummary> | null
  /** The reaction type applied by the current user (or null). */
  userReaction?: ReactionType | null;
  /** The total number of replies (direct and nested) to this item. */
  replyCount: number;
  /** Optional array of associated tags. Accepteert nu `null`. */
  tags?: Tag[] | null; // <-- FIX: Nu Tag[] | null
  /** Flag indicating if the item has been edited. */
  isEdited?: boolean;
  /** Flag indicating if the item is pinned. */
  isPinned?: boolean;
  /** Flag indicating if the item is hidden by the current user. */
  isHidden?: boolean;
  /** Flag indicating if the item is saved by the current user. */
  isSaved?: boolean;
  /** Privacy setting for the item. */
  privacy: PrivacyLevel;
}

/** Represents a reply or comment on a FeedItem or another FeedReply. */
export interface FeedReply extends AuditableEntityBase {
  /** Unique identifier for the reply (primary key for NgRx entity). */
  id: string;
  /** ID of the *top-level* FeedItem this reply chain belongs to. */
  parentId: string;
  /** Optional ID of the specific FeedReply this is a direct response to (for nesting). Accepteert nu `null`. */
  replyToReplyId?: string | null; // <-- FIX: Nu string | null
  /** Identifier of the feed this reply belongs to. */
  feedId: string;
  /** Profile of the reply's author. */
  author: Profile;
  /** Optional text content of the reply. Accepteert nu `null`. */
  text?: string | null; // <-- FIX: Nu string | null
  /** Optional array of media objects attached to the reply. Accepteert nu `null`. */
  media?: Media[] | null; // <-- FIX: Nu Media[] | null
  /** Optional URL of an attached GIF. Accepteert nu `null`. */
  gifUrl?: string | null; // <-- FIX: Nu string | null
  /** Array summarizing reaction counts for this reply. Accepteert nu `null`. */
  reactions?: ReadonlyArray<ReactionSummary> | null; // <-- FIX: Nu ReadonlyArray<ReactionSummary> | null
  /** The reaction type applied by the current user (or null). */
  userReaction?: ReactionType | null;
  /** Flag indicating if the reply has been edited. */
  isEdited?: boolean;
  /** Flag indicating if the reply has been soft-deleted. */
  isDeleted?: boolean;
  /** Optional nesting level for UI indentation (0 for direct replies to FeedItem). Accepteert nu `null`. */
  level?: number | null; // <-- FIX: Nu number | null
}