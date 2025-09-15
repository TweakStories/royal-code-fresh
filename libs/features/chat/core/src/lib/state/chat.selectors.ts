/**
 * @file chat.selectors.ts
 * @version 2.2.0 (Clean Export Gateway)
 * @description This file serves as a clean, public-facing export gateway for all
 *              selectors defined within `chat.feature.ts`.
 */
export {
  CHAT_FEATURE_KEY,
  selectChatState,
  selectSelectedConversationId,
  selectIsLoadingConversations,
  selectIsSendingMessage,
  selectError,
  selectAllConversations,
  selectConversationEntities,
  selectSelectedConversation,
  selectMessagesForConversation,
  selectMessagesForSelectedConversation,
  selectAiConversation,
  selectAiConversationMessages,
  selectIsAiChatLoading,
  selectAiChatError,
  selectChatViewModel,
  selectAllMessagesLoadedForConversation,
  selectMessagesLoadingForConversation,
  selectMessagesErrorForConversation,
  selectConversationsError,
  selectAnonymousGuestId,
} from './chat.feature';

import { createSelector } from '@ngrx/store';
import { selectConversationEntities } from './chat.feature';

export const selectConversationById = (id: string) => createSelector(
  selectConversationEntities,
  (entities) => entities?.[id]
);