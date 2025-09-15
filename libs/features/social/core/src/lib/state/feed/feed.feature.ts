/**
 * @file feed.feature.ts
 * @Version 1.0.0 (Enterprise Blueprint Standard)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description
 *   The definitive NgRx feature definition for the Social Feed domain, using `createFeature`.
 *   This file co-locates the state slice, reducer logic, and all selectors into a single,
 *   cohesive, and type-safe unit, following the project's "golden standard".
 */
import { createFeature, createSelector, createReducer, on } from '@ngrx/store';
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { FeedActions } from './feed.actions';
import { FeedItem, FeedReply } from '@royal-code/features/social/domain';

// --- HELPER ---
function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return 'An unknown error occurred processing feed data.';
}

// --- ENTITY ADAPTERS ---
export const feedItemAdapter: EntityAdapter<FeedItem> = createEntityAdapter<FeedItem>({
  selectId: (item: FeedItem) => item.id,
  sortComparer: (a, b) => (b.createdAt?.timestamp ?? 0) - (a.createdAt?.timestamp ?? 0),
});

export const feedReplyAdapter: EntityAdapter<FeedReply> = createEntityAdapter<FeedReply>({
  selectId: (reply: FeedReply) => reply.id,
  sortComparer: false,
});

// --- STATE DEFINITION ---
export interface FeedItemsState extends EntityState<FeedItem> {
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface FeedRepliesState extends EntityState<FeedReply> {
  loadingByParentId: { [parentId: string]: boolean };
  errorByParentId: { [parentId: string]: string | null };
  loadedByParentId: { [parentId: string]: boolean };
}

export interface FeedState {
  items: FeedItemsState;
  replies: FeedRepliesState;
}

// --- INITIAL STATE ---
export const initialFeedItemsState: FeedItemsState = feedItemAdapter.getInitialState({
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
});

export const initialFeedRepliesState: FeedRepliesState = feedReplyAdapter.getInitialState({
  loadingByParentId: {},
  errorByParentId: {},
  loadedByParentId: {},
});

export const initialFeedState: FeedState = {
  items: initialFeedItemsState,
  replies: initialFeedRepliesState,
};

// --- NGRX FEATURE ---
export const feedFeature = createFeature({
  name: 'feed',
  reducer: createReducer(
    initialFeedState,
    // --- Reducer logic from old feed.reducer.ts goes here ---
    on(FeedActions.loadFeed, (state, { forceReload }) => ({
      ...state,
      items: {
        ...state.items,
        loading: true,
        error: null,
        // Reset entities only if forcing a full reload from page 1
        ...(forceReload && { ...feedItemAdapter.removeAll(state.items) })
      }
    })),

    on(FeedActions.loadFeedSuccess, (state, { items, page, totalPages, totalItems, append }) => {
        const adapterFn = append ? feedItemAdapter.upsertMany : feedItemAdapter.setAll;
        return {
            ...state,
            items: adapterFn(items as FeedItem[], {
                ...state.items,
                loading: false,
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
                error: null,
            })
        };
    }),

    on(FeedActions.loadFeedFailure, (state, { feedId, error }) => ({
        ...state,
        items: { ...state.items, loading: false, error: `Failed loading feed ${feedId}: ${getErrorMessage(error)}` }
    })),

    on(FeedActions.addFeedItemSuccess, (state, { item }) => ({
        ...state,
        items: feedItemAdapter.addOne(item, { ...state.items, loading: false, error: null })
    })),

    on(FeedActions.editFeedItemSuccess, FeedActions.reactToFeedItemSuccess, (state, { itemUpdate }) => ({
        ...state,
        items: feedItemAdapter.updateOne(itemUpdate, state.items)
    })),

    on(FeedActions.deleteFeedItemSuccess, (state, { itemId }) => ({
        ...state,
        items: feedItemAdapter.removeOne(itemId, state.items),
        replies: feedReplyAdapter.removeMany(
            (reply: FeedReply) => reply.parentId === itemId,
            state.replies
        )
    })),

    // --- Replies Reducers ---
    on(FeedActions.loadReplies, (state, { parentId }) => ({
        ...state,
        replies: {
            ...state.replies,
            loadingByParentId: { ...state.replies.loadingByParentId, [parentId]: true },
            errorByParentId: { ...state.replies.errorByParentId, [parentId]: null },
        }
    })),

    on(FeedActions.loadRepliesSuccess, (state, { parentId, replies }) => ({
      ...state,
      replies: feedReplyAdapter.upsertMany(replies as FeedReply[], { // <-- HIER DE FIX: Cast naar FeedReply[]
        ...state.replies,
        loadingByParentId: { ...state.replies.loadingByParentId, [parentId]: false },
        loadedByParentId: { ...state.replies.loadedByParentId, [parentId]: true },
      })
    })),


    on(FeedActions.addFeedReplySuccess, (state, { reply }) => {
        const parentId = reply.parentId;
        const itemUpdate = state.items.entities[parentId]
            ? { id: parentId, changes: { replyCount: (state.items.entities[parentId]!.replyCount ?? 0) + 1 } }
            : null;

        return {
            ...state,
            replies: feedReplyAdapter.addOne(reply, state.replies),
            ...(itemUpdate && { items: feedItemAdapter.updateOne(itemUpdate, state.items) })
        };
    }),

    on(FeedActions.editFeedReplySuccess, FeedActions.reactToFeedReplySuccess, (state, { replyUpdate }) => ({
        ...state,
        replies: feedReplyAdapter.updateOne(replyUpdate, state.replies)
    })),

    on(FeedActions.deleteFeedReplySuccess, (state, { parentId, replyId }) => {
        const itemUpdate = state.items.entities[parentId]
            ? { id: parentId, changes: { replyCount: Math.max(0, (state.items.entities[parentId]!.replyCount ?? 0) - 1) } }
            : null;
        return {
            ...state,
            replies: feedReplyAdapter.removeOne(replyId, state.replies),
            ...(itemUpdate && { items: feedItemAdapter.updateOne(itemUpdate, state.items) })
        };
    }),
     // ... (voeg hier de rest van de reducer-logica uit feed.reducer.ts toe)
  ),

  extraSelectors: ({ selectFeedState }) => {
    // --- Base Selectors ---
    const selectItemsState = createSelector(selectFeedState, (state) => state.items);
    const selectRepliesState = createSelector(selectFeedState, (state) => state.replies);

    // --- Item Selectors ---
    const { selectAll: selectAllFeedItems, selectEntities: selectFeedItemEntities } = feedItemAdapter.getSelectors(selectItemsState);
    const selectFeedItemsLoading = createSelector(selectItemsState, (state) => state.loading);
    const selectFeedItemsError = createSelector(selectItemsState, (state) => state.error);
    const selectFeedCurrentPage = createSelector(selectItemsState, (state) => state.currentPage);
    const selectFeedTotalPages = createSelector(selectItemsState, (state) => state.totalPages);
    const selectFeedItemById = (id: string) => createSelector(selectFeedItemEntities, (entities) => entities[id]);

    // --- Reply Selectors ---
    const { selectAll: selectAllReplies, selectEntities: selectReplyEntities } = feedReplyAdapter.getSelectors(selectRepliesState);
    const selectReplyById = (id: string) => createSelector(selectReplyEntities, (entities) => entities[id]);
    const selectRepliesForParentId = (parentId: string) => createSelector(selectAllReplies, (replies) => replies.filter(r => r.parentId === parentId && !r.replyToReplyId));
    const selectRepliesForReplyId = (replyId: string) => createSelector(selectAllReplies, (replies) => replies.filter(r => r.replyToReplyId === replyId));
    const selectRepliesLoadingForParent = (parentId: string) => createSelector(selectRepliesState, (state) => !!state.loadingByParentId[parentId]);
    const selectRepliesErrorForParent = (parentId: string) => createSelector(selectRepliesState, (state) => state.errorByParentId[parentId] ?? null);
    const selectRepliesLoadedForParent = (parentId: string) => createSelector(selectRepliesState, (state) => !!state.loadedByParentId[parentId]);

    return {
      selectAllFeedItemsOrdered: selectAllFeedItems,
      selectFeedItemEntities,
      selectFeedItemsLoading,
      selectFeedItemsError,
      selectFeedCurrentPage,
      selectFeedTotalPages,
      selectFeedItemById,
      selectReplyEntities,
      selectReplyById,
      selectRepliesForParentId,
      selectRepliesForReplyId,
      selectRepliesLoadingForParent,
      selectRepliesErrorForParent,
      selectRepliesLoadedForParent,
    };
  }
});

// --- PUBLIC API EXPORTS ---
export const {
  name: FEED_FEATURE_KEY,
  reducer: feedReducer,
  selectFeedState,
  // Export all selectors from extraSelectors
  selectAllFeedItemsOrdered,
  selectFeedItemEntities,
  selectFeedItemsLoading,
  selectFeedItemsError,
  selectFeedCurrentPage,
  selectFeedTotalPages,
  selectFeedItemById,
  selectReplyEntities,
  selectReplyById,
  selectRepliesForParentId,
  selectRepliesForReplyId,
  selectRepliesLoadingForParent,
  selectRepliesErrorForParent,
  selectRepliesLoadedForParent,
} = feedFeature;