// libs/features/social/src/lib/state/feed/feed.state.ts
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { FeedItem, FeedReply } from '@royal-code/features/social/domain';

// --- Feed Items State Definition ---

/**
 * Defines the structure for managing FeedItem entities within the NgRx store.
 * Uses NgRx EntityState for normalized storage (`ids`, `entities`).
 * Includes additional properties for managing collection-level state like loading status,
 * errors, and pagination metadata.
 */
export interface FeedItemsState extends EntityState<FeedItem> {
  /** True if the primary list of feed items is currently being fetched from the API. */
  loading: boolean;
  /** Stores the last error encountered during feed item operations, or null if none. */
  error: string | null;
  /** Current page number for pagination (relevant if pagination is implemented). */
  currentPage: number;
  /** Total number of pages available (relevant if pagination is implemented). */
  totalPages: number;
  /** Total number of items available across all pages (relevant if pagination is implemented). */
  totalItems: number;
}

// --- Feed Replies State Definition ---

/**
 * Defines the structure for managing FeedReply entities within the NgRx store.
 * Uses NgRx EntityState for normalized storage.
 * Includes maps keyed by the parent FeedItem ID (`parentId`) to track loading,
 * error, and loaded status independently for each comment thread.
 */
export interface FeedRepliesState extends EntityState<FeedReply> {
  /** Tracks loading status per parent item. Key: parentId, Value: boolean. */
  loadingByParentId: { [parentId: string]: boolean };
  /** Stores error messages per parent item. Key: parentId, Value: string | null. */
  errorByParentId: { [parentId: string]: string | null };
  /** Tracks whether replies have been successfully loaded for a parent item. Key: parentId, Value: boolean. */
  loadedByParentId: { [parentId: string]: boolean };
}

// --- Combined Feed Feature State Definition ---

/**
 * Represents the complete state slice for the 'feed' feature.
 * It aggregates the state for both feed items and replies.
 */
export interface FeedState {
  /** The state slice managing FeedItem entities and related metadata. */
  items: FeedItemsState;
  /** The state slice managing FeedReply entities and related metadata. */
  replies: FeedRepliesState;
  // Add other potential sub-states within the 'feed' feature if needed.
}

// --- NgRx Entity Adapters ---

/**
 * NgRx Entity adapter for FeedItem entities.
 * - `selectId`: Uses the 'id' property as the primary key.
 * - `sortComparer`: Sorts items by creation timestamp in descending order (newest first).
 */
export const feedItemAdapter: EntityAdapter<FeedItem> = createEntityAdapter<FeedItem>({
  selectId: (item: FeedItem) => item.id,
  sortComparer: (a, b) => (b.createdAt?.timestamp ?? 0) - (a.createdAt?.timestamp ?? 0), // Newest first
});

/**
 * NgRx Entity adapter for FeedReply entities.
 * - `selectId`: Uses the 'id' property as the primary key.
 * - `sortComparer`: Sorts replies by creation timestamp in ascending order (oldest first, typical for comments).
 */
export const feedReplyAdapter: EntityAdapter<FeedReply> = createEntityAdapter<FeedReply>({
  selectId: (reply: FeedReply) => reply.id,
  sortComparer: (a, b) => (a.createdAt?.timestamp ?? 0) - (b.createdAt?.timestamp ?? 0), // Oldest first
});

// --- Initial State Values ---

/** The initial state for the FeedItemsState slice. */
export const initialFeedItemsState: FeedItemsState = feedItemAdapter.getInitialState({
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
});

/** The initial state for the FeedRepliesState slice. */
export const initialFeedRepliesState: FeedRepliesState = feedReplyAdapter.getInitialState({
  loadingByParentId: {},
  errorByParentId: {},
  loadedByParentId: {},
});

/** The initial state for the entire FeedState feature slice. */
export const initialFeedState: FeedState = {
  items: initialFeedItemsState,
  replies: initialFeedRepliesState,
};

/**
 * The feature key used when registering this state slice with `StoreModule.forFeature`.
 * Ensure this matches the key used in your module registration and potentially in the parent state interface.
 */
// export const FEED_FEATURE_KEY = 'feed'; // Define if needed at this level, or use parent key.
