// libs/features/social/src/lib/services/feed.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FeedItem,
  FeedReply,
  ReactionType,
} from '@royal-code/features/social/domain'; 
import { LoggerService } from '@royal-code/core/core-logging';
import { PaginatedList } from '@royal-code/shared/utils';

/**
 * @Injectable FeedService
 * @description
 * This service acts as the primary interface for interacting with the backend API
 * related to social feeds, including feed items and replies. It encapsulates
 * HTTP requests for fetching, creating, updating, deleting, and interacting
 * with feed content.
 */
@Injectable({
  providedIn: 'root',
})
export class FeedService {
  /** Base URL for the social feed API endpoints. */
  private apiUrl = '/api/socialFeeds'; // Example API base URL
  private http = inject(HttpClient);
  private readonly logger = inject(LoggerService);

  // --- Feed Item Methods ---

  /**
   * Fetches feed items for a specific feed ID, supporting pagination.
   * @param feedId - The unique identifier of the feed to fetch.
   * @param options - Optional pagination parameters { page?: number, limit?: number }.
   * @returns An Observable emitting a PaginatedList of FeedItem objects.
   */
  getFeed(feedId: string, options?: { page?: number, limit?: number }): Observable<PaginatedList<FeedItem>> { // <<== Return type aangepast
    let params = new HttpParams();
    if (options?.page !== undefined) {
      params = params.set('page', options.page.toString()); // Gebruik 'page' als query param
    }
    if (options?.limit !== undefined) {
      params = params.set('limit', options.limit.toString()); // Gebruik 'limit' als query param
    }

    this.logger.debug(`[FeedService] Fetching feed ${feedId} with params:`, params.toString());
    // Verwacht nu een PaginatedList<FeedItem> van de (InMemory) API
    return this.http.get<PaginatedList<FeedItem>>(`${this.apiUrl}/${feedId}`, { params });
  }

  /**
   * Adds a new feed item to a specific feed.
   * @param feedId - The ID of the feed to add the item to.
   * @param item - A partial FeedItem object containing the data for the new item (e.g., text, media, privacy).
   * @returns An Observable emitting the newly created FeedItem object as returned by the backend.
   */
  addFeedItem(feedId: string, item: Partial<FeedItem>): Observable<FeedItem> {
    this.logger.debug(`[FeedService] Posting new FeedItem for feed ${feedId}:`, JSON.stringify(item)); // Log de volledige payload
    return this.http.post<FeedItem>(`${this.apiUrl}/${feedId}/items`, item);
}

  /**
   * Edits an existing feed item.
   * @param feedId - The ID of the feed containing the item.
   * @param itemId - The ID of the feed item to edit.
   * @param changes - A partial FeedItem object containing the fields to update.
   * @returns An Observable emitting the updated FeedItem object.
   */
  editFeedItem(feedId: string, itemId: string, changes: Partial<FeedItem>): Observable<FeedItem> {
    return this.http.put<FeedItem>(`${this.apiUrl}/${feedId}/items/${itemId}`, changes);
  }

  /**
   * Deletes a specific feed item.
   * @param feedId - The ID of the feed containing the item.
   * @param itemId - The ID of the feed item to delete.
   * @returns An Observable emitting an object indicating success, typically { success: boolean }.
   */
  deleteFeedItem(feedId: string, itemId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${feedId}/items/${itemId}`);
  }

  /**
   * Applies a 'like' reaction to a feed item.
   * Assumes a specific endpoint for liking.
   * @param feedId - The ID of the feed containing the item.
   * @param itemId - The ID of the feed item to like.
   * @param reactionType - The type of reaction (e.g., ReactionType.Like).
   * @returns An Observable emitting the updated FeedItem with new reaction state.
   */
  likeFeedItem(feedId: string, itemId: string, reactionType: ReactionType): Observable<FeedItem> {
    // Sends POST to the /like endpoint, passing the reaction type.
    return this.http.post<FeedItem>(`${this.apiUrl}/${feedId}/items/${itemId}/like`, { reactionType });
  }

  /**
   * Removes a 'like' reaction from a feed item.
   * Assumes a specific endpoint for unliking.
   * @param feedId - The ID of the feed containing the item.
   * @param itemId - The ID of the feed item to unlike.
   * @param reactionType - The type of reaction being removed (e.g., ReactionType.Like).
   * @returns An Observable emitting the updated FeedItem with new reaction state.
   */
  unlikeFeedItem(feedId: string, itemId: string, reactionType: ReactionType): Observable<FeedItem> {
    // Sends POST to the /unlike endpoint (or potentially DELETE to /like).
    // Passes the reaction type to indicate which reaction is being removed.
    return this.http.post<FeedItem>(`${this.apiUrl}/${feedId}/items/${itemId}/unlike`, { reactionType });
  }

  // --- Feed Reply Methods ---

  /**
   * Fetches replies for a specific feed item.
   * Currently retrieves all replies; pagination should be added.
   * @param feedId - The ID of the feed containing the parent item.
   * @param parentItemId - The ID of the feed item whose replies are to be fetched.
   * @returns An Observable emitting an array of FeedReply objects.
   * @todo Implement pagination parameters.
   */
  getReplies(feedId: string, parentItemId: string): Observable<FeedReply[]> {
    // TODO: Add query parameters for pagination, filtering, sorting
    return this.http.get<FeedReply[]>(`${this.apiUrl}/${feedId}/items/${parentItemId}/replies`);
  }

  /**
   * Adds a new reply to a specific feed item.
   * @param feedId - The ID of the feed containing the parent item.
   * @param parentId - The ID of the feed item to reply to.
   * @param reply - A partial FeedReply object containing the reply data (e.g., text).
   * @returns An Observable emitting the newly created FeedReply object.
   */
  addFeedReply(feedId: string, parentId: string, reply: Partial<FeedReply>): Observable<FeedReply> {
    this.logger.debug(`[FeedService] Posting reply data:`, JSON.stringify(reply)); // <-- LOG HIER (Injecteer LoggerService indien nodig)
    return this.http.post<FeedReply>(`${this.apiUrl}/${feedId}/items/${parentId}/replies`, reply);
}


  /**
   * Edits an existing feed reply.
   * @param feedId - The ID of the feed.
   * @param parentItemId - The ID of the parent feed item.
   * @param replyId - The ID of the reply to edit.
   * @param changes - A partial FeedReply object containing the fields to update.
   * @returns An Observable emitting the updated FeedReply object.
   */
  editFeedReply(feedId: string, parentItemId: string, replyId: string, changes: Partial<FeedReply>): Observable<FeedReply> {
    // Construct the URL according to the API structure for nested replies.
    return this.http.put<FeedReply>(`${this.apiUrl}/${feedId}/items/${parentItemId}/replies/${replyId}`, changes);
  }

  /**
   * Deletes a specific feed reply.
   * @param feedId - The ID of the feed.
   * @param parentItemId - The ID of the parent feed item.
   * @param replyId - The ID of the reply to delete.
   * @returns An Observable emitting an object indicating success, typically { success: boolean }.
   */
  deleteFeedReply(feedId: string, parentItemId: string, replyId: string): Observable<{ success: boolean }> {
     // Construct the URL according to the API structure for nested replies.
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${feedId}/items/${parentItemId}/replies/${replyId}`);
  }

  /**
   * Applies a 'like' reaction to a feed reply.
   * @param feedId - The ID of the feed.
   * @param parentItemId - The ID of the parent feed item.
   * @param replyId - The ID of the reply to like.
   * @param reactionType - The type of reaction (e.g., ReactionType.Like).
   * @returns An Observable emitting the updated FeedReply with new reaction state.
   */
  likeFeedItemReply(
    feedId: string,
    parentItemId: string,
    replyId: string,
    reactionType: ReactionType // Should generally be ReactionType.Like here
  ): Observable<FeedReply> {
    const url = `${this.apiUrl}/${feedId}/items/${parentItemId}/replies/${replyId}/like`;
    // Send the reaction type in the body, as expected by the backend (based on mock service)
    return this.http.post<FeedReply>(url, { reactionType });
  }

  /**
   * Removes a 'like' reaction from a feed reply.
   * @param feedId - The ID of the feed.
   * @param parentItemId - The ID of the parent feed item.
   * @param replyId - The ID of the reply to unlike.
   * @param reactionType - The type of reaction being removed (e.g., ReactionType.Like).
   * @returns An Observable emitting the updated FeedReply with new reaction state.
   */
  unlikeFeedItemReply(
    feedId: string,
    parentItemId: string,
    replyId: string,
    oldReactionType: ReactionType // The type being removed, sent for backend context
  ): Observable<FeedReply> {
    const url = `${this.apiUrl}/${feedId}/items/${parentItemId}/replies/${replyId}/unlike`;
    // Send the reaction type in the body, as expected by the backend (based on mock service)
    return this.http.post<FeedReply>(url, { reactionType: oldReactionType });
  }
}
