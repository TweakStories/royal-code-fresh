/**
 * @file chat.feature.ts
 * @version 2.3.0 (Added Anonymous Guest ID Selector)
 * @description The definitive NgRx feature definition for the Chat domain.
 *              This version adds and exports the `selectAnonymousGuestId` selector.
 */
import { createFeature, createSelector } from '@ngrx/store';
import { chatReducer } from './chat.reducers';
import { conversationAdapter, messageAdapter } from './chat.state';
import { ChatViewModel } from './chat.types';
import { ConversationType } from '@royal-code/features/chat/domain';
import { StructuredError } from '@royal-code/shared/domain';

export const CHAT_FEATURE_KEY = 'chat';

export const chatFeature = createFeature({
  name: CHAT_FEATURE_KEY,
  reducer: chatReducer,
  extraSelectors: ({
    selectConversations, selectMessages, selectSelectedConversationId,
    selectIsLoadingConversations, selectIsLoadingMessages, selectIsSendingMessage,
    selectError, selectPagination, selectAnonymousGuestId,
  }) => {
    const { selectAll: selectAllConversations, selectEntities: selectConversationEntities } = conversationAdapter.getSelectors(selectConversations);
    const { selectAll: selectAllMessages } = messageAdapter.getSelectors(selectMessages);

    const selectSelectedConversation = createSelector(selectConversationEntities, selectSelectedConversationId, (entities, selectedId) => (selectedId ? entities[selectedId] : undefined));
    const selectMessagesForConversation = (conversationId: string) => createSelector(selectAllMessages, (allMessages) => allMessages.filter(msg => msg.conversationId === conversationId));
    const selectMessagesForSelectedConversation = createSelector(selectAllMessages, selectSelectedConversationId, (allMessages, selectedId) => { if (!selectedId) return []; return allMessages.filter(msg => msg.conversationId === selectedId); });
    const selectAiConversation = createSelector(selectAllConversations, (convs) => convs.find(c => c.type === ConversationType.AIBOT));
    const selectAiConversationMessages = createSelector(selectAllMessages, selectAiConversation, (allMessages, aiConv) => { if (!aiConv) return []; return allMessages.filter(msg => msg.conversationId === aiConv.id); });
    const selectConversationsError = createSelector(selectError, (errorState) => errorState.conversations);
    const selectMessagesLoadingForConversation = (conversationId: string) => createSelector(selectIsLoadingMessages, (loadingMap) => !!loadingMap[conversationId]);
    const selectMessagesErrorForConversation = (conversationId: string) => createSelector(selectError, (errorState) => errorState.messages[conversationId] ?? null);
    const selectAllMessagesLoadedForConversation = (conversationId: string) => createSelector(selectPagination, (paginationState) => paginationState[conversationId]?.allMessagesLoaded ?? false);
    const selectIsAiChatLoading = createSelector(selectIsLoadingConversations, selectIsLoadingMessages, selectAiConversation, (convsLoading, msgLoadingMap, aiConv) => { if (!aiConv) return convsLoading; return convsLoading || !!msgLoadingMap[aiConv.id]; });
    const selectAiChatError = createSelector(selectError, selectAiConversation, (errorState, aiConv) => { const convError = errorState.conversations; const msgError = aiConv?.id ? errorState.messages[aiConv.id] : null; return convError || msgError || null; });
    const selectChatViewModel = createSelector(
      selectAllConversations, selectSelectedConversation, selectMessagesForSelectedConversation,
      selectIsLoadingConversations, selectIsLoadingMessages, selectIsSendingMessage,
      selectError, selectSelectedConversationId,
      (conversations, selectedConversation, messages, isLoadingConv, msgLoadingMap, isSendingMap, errorState, selectedId): ChatViewModel => {
        let combinedError: StructuredError | null = null;
        if (errorState.conversations) { combinedError = errorState.conversations; }
        else if (selectedId && errorState.messages[selectedId]) { combinedError = errorState.messages[selectedId]; }
        return {
          conversations, selectedConversation, messages, isLoadingConversations: isLoadingConv,
          isLoadingMessages: selectedId ? !!msgLoadingMap[selectedId] : false,
          isSendingMessage: Object.values(isSendingMap).some(v => v),
          error: combinedError, hasConversations: conversations.length > 0, hasMessages: messages.length > 0,
          isBusy: isLoadingConv || (selectedId ? !!msgLoadingMap[selectedId] : false) || Object.values(isSendingMap).some(v => v),
        }
      }
    );
    return {
      selectAllConversations, selectConversationEntities, selectSelectedConversation, selectMessagesForConversation,
      selectMessagesForSelectedConversation, selectAiConversation, selectAiConversationMessages, selectIsAiChatLoading,
      selectAiChatError, selectChatViewModel, selectAllMessagesLoadedForConversation, selectMessagesLoadingForConversation,
      selectMessagesErrorForConversation, selectConversationsError,
    };
  },
});

export const {
  name, reducer, selectChatState, selectSelectedConversationId,
  selectIsLoadingConversations, selectIsSendingMessage,
  selectError, selectAllConversations, selectConversationEntities, selectSelectedConversation,
  selectMessagesForConversation, selectMessagesForSelectedConversation, selectAiConversation,
  selectAiConversationMessages, selectIsAiChatLoading, selectAiChatError, selectChatViewModel,
  selectAllMessagesLoadedForConversation, selectMessagesLoadingForConversation,
  selectMessagesErrorForConversation, selectConversationsError,
  selectAnonymousGuestId,
} = chatFeature;