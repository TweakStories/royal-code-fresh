/**
 * @file chat.reducers.ts
 * @version 9.1.0 (Definitive with Anonymous Guest ID Sync)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   The definitive, enterprise-grade reducer for the Chat domain. This version
 *   correctly synchronizes the `anonymousGuestId` from the backend API responses,
 *   ensuring consistent UI rendering for anonymous user messages.
 */
import { createReducer, on, Action } from '@ngrx/store';
import { initialChatState, ChatState, conversationAdapter, messageAdapter } from './chat.state';
import { ChatActions } from './chat.actions';
import { Conversation, Message, MessageStatus, ConversationType } from '@royal-code/features/chat/domain';
import { DateTimeUtil } from '@royal-code/shared/utils';
import { EntityState } from '@ngrx/entity';

const _chatReducer = createReducer(
  initialChatState,

  // === CATEGORY: CONVERSATION MANAGEMENT ===

  on(ChatActions.loadConversationsRequested, ChatActions.startConversationRequested, ChatActions.loadAnonymousConversationRequested, (state): ChatState => ({
    ...state,
    isLoadingConversations: true,
    error: { ...state.error, conversations: null },
  })),

  on(ChatActions.loadConversationsSuccess, (state, { conversations }): ChatState => ({
    ...state,
    conversations: conversationAdapter.setAll(conversations, state.conversations),
    isLoadingConversations: false,
  })),

  on(ChatActions.startConversationSuccess, (state, { conversation }): ChatState => ({
    ...state,
    conversations: conversationAdapter.addOne(conversation, state.conversations),
    isLoadingConversations: false,
  })),

  on(ChatActions.loadConversationsFailure, ChatActions.startConversationFailure, ChatActions.loadAnonymousConversationFailure, (state, { error }): ChatState => ({
    ...state,
    isLoadingConversations: false,
    error: { ...state.error, conversations: error },
  })),

  on(ChatActions.loadAnonymousConversationSuccess, (state, { conversation, messages }): ChatState => {
    const updatedConversations = conversationAdapter.upsertOne(conversation, state.conversations);
    const updatedMessages = messageAdapter.upsertMany(messages, state.messages);
    const userMessage = messages.find(m => m.senderProfile?.displayName === 'You');
    const guestId = userMessage?.senderId ?? null;

    return {
      ...state,
      conversations: updatedConversations,
      messages: updatedMessages,
      selectedConversationId: conversation.id,
      anonymousGuestId: guestId,
      isLoadingConversations: false,
    };
  }),

  // === CATEGORY: MESSAGE MANAGEMENT ===

  on(ChatActions.loadMessagesRequested, (state, { conversationId }): ChatState => ({
    ...state,
    isLoadingMessages: { ...state.isLoadingMessages, [conversationId]: true },
    error: { ...state.error, messages: { ...state.error.messages, [conversationId]: null } },
  })),

  on(ChatActions.loadMessagesSuccess, (state, { messages, conversationId }): ChatState => ({
    ...state,
    messages: messageAdapter.upsertMany([...messages], state.messages),
    isLoadingMessages: { ...state.isLoadingMessages, [conversationId]: false }
  })),

  on(ChatActions.loadMessagesFailure, (state, { conversationId, error }): ChatState => ({
    ...state,
    isLoadingMessages: { ...state.isLoadingMessages, [conversationId]: false },
    error: { ...state.error, messages: { ...state.error.messages, [conversationId]: error } },
  })),

  on(ChatActions.messageReceived, (state, { message }): ChatState => ({
    ...state,
    messages: messageAdapter.upsertOne(message, state.messages),
  })),


  // === CATEGORY: OPTIMISTIC MESSAGE SENDING (ALL FLOWS) ===

  on(ChatActions.sendMessageRequested, (state, { payload }): ChatState => {
    const optimisticMessage: Message = {
      id: payload.tempId,
      conversationId: payload.conversationId,
      content: payload.content,
      gifUrl: payload.gifUrl,
      media: [],
      status: MessageStatus.SENDING,
      senderId: payload.senderId,
      senderType: 'user',
      createdAt: DateTimeUtil.now(),
    };
    return {
      ...state,
      messages: messageAdapter.addOne(optimisticMessage, state.messages),
      isSendingMessage: { ...state.isSendingMessage, [payload.tempId]: true },
    };
  }),

  on(ChatActions.sendMessageToAIBotRequested, (state, { payload }): ChatState => {
    const optimisticMessage: Message = {
      id: payload.tempId,
      conversationId: payload.conversationId,
      content: payload.content,
      gifUrl: payload.gifUrl,
      media: [],
      status: MessageStatus.SENDING,
      senderId: payload.senderId,
      senderType: 'user',
      createdAt: DateTimeUtil.now(),
    };
    return {
      ...state,
      messages: messageAdapter.addOne(optimisticMessage, state.messages),
      isSendingMessage: { ...state.isSendingMessage, [payload.tempId]: true },
    };
  }),

  on(ChatActions.sendAnonymousMessageToAIBotRequested, (state, { payload, tempId }): ChatState => {
    const aiConv = Object.values(state.conversations.entities).find(c => c?.type === ConversationType.AIBOT);
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: aiConv?.id ?? 'anonymous-ai-conv',
      content: payload.content,
      status: MessageStatus.SENDING,
      senderId: state.anonymousGuestId ?? 'anonymous-user',
      senderType: 'user',
      createdAt: DateTimeUtil.now(),
    };
    return {
      ...state,
      messages: messageAdapter.addOne(optimisticMessage, state.messages),
      isSendingMessage: { ...state.isSendingMessage, [tempId]: true },
    };
  }),

  // === CATEGORY: MESSAGE SEND SUCCESS (IDEMPOTENT & STATE SYNC) ===

  on(ChatActions.sendMessageSuccess, (state, { tempId, sentMessage, conversationId }): ChatState => {
    const { [tempId]: _, ...newIsSendingState } = state.isSendingMessage;
    const stateWithoutTemp = messageAdapter.removeOne(tempId, state.messages);
    const finalMessagesState = messageAdapter.upsertOne(sentMessage, stateWithoutTemp);

    const updatedConversation = conversationAdapter.updateOne({
      id: conversationId,
      changes: { lastMessage: sentMessage }
    }, state.conversations);

    return { ...state, messages: finalMessagesState, conversations: updatedConversation, isSendingMessage: newIsSendingState };
  }),

  on(ChatActions.sendMessageToAIBotSuccess, (state, { tempId, userMessage, botReply, conversationId }): ChatState => {
    const { [tempId]: _, ...newIsSendingState } = state.isSendingMessage;
    const stateWithoutTemp = messageAdapter.removeOne(tempId, state.messages);
    const finalMessagesState = messageAdapter.upsertMany([userMessage, botReply], stateWithoutTemp);

    const updatedConversation = conversationAdapter.updateOne({
      id: conversationId,
      changes: { lastMessage: botReply }
    }, state.conversations);

    return { ...state, messages: finalMessagesState, conversations: updatedConversation, isSendingMessage: newIsSendingState };
  }),

  on(ChatActions.sendAnonymousMessageToAIBotSuccess, (state, { userMessage, aiReply, tempId }): ChatState => {
    const { [tempId]: _, ...newIsSendingState } = state.isSendingMessage;
    const stateWithoutTemp = messageAdapter.removeOne(tempId, state.messages);
    const finalMessagesState = messageAdapter.upsertMany([userMessage, aiReply], stateWithoutTemp);

    const aiConvExists = !!state.conversations.entities[userMessage.conversationId];
    let finalConversationsState: EntityState<Conversation>;
  
    if (!aiConvExists) {
      finalConversationsState = conversationAdapter.addOne({
        id: userMessage.conversationId,
        type: ConversationType.AIBOT,
        name: 'Plushie Pal',
        lastMessage: aiReply,
      } as Conversation, state.conversations);
    } else {
      finalConversationsState = conversationAdapter.updateOne({
        id: userMessage.conversationId,
        changes: { lastMessage: aiReply }
      }, state.conversations);
    }

    return {
      ...state,
      messages: finalMessagesState,
      conversations: finalConversationsState,
      isSendingMessage: newIsSendingState,
      anonymousGuestId: userMessage.senderId,
    };
  }),

  // === CATEGORY: MESSAGE SEND FAILURE (ALL FLOWS) ===

  on(ChatActions.sendMessageFailure, ChatActions.sendMessageToAIBotFailure, ChatActions.sendAnonymousMessageToAIBotFailure, (state, { tempId, error }): ChatState => {
    if (!tempId) return state;
    const { [tempId]: __, ...newIsSendingState } = state.isSendingMessage;
    const messageUpdate = { id: tempId, changes: { status: MessageStatus.FAILED, error: error } };
    return { ...state, messages: messageAdapter.updateOne(messageUpdate, state.messages), isSendingMessage: newIsSendingState };
  }),

  // === CATEGORY: OTHER UPDATES & CLEANUP ===
  
  on(ChatActions.selectConversation, (state, { conversationId }): ChatState => ({
    ...state,
    selectedConversationId: conversationId,
  })),

  on(ChatActions.reactToMessageSuccess, ChatActions.editMessageSuccess, ChatActions.messageUpdated, (state, { messageUpdate }): ChatState => ({
    ...state,
    messages: messageAdapter.updateOne(messageUpdate, state.messages),
  })),

  on(ChatActions.deleteMessageSuccess, ChatActions.messageDeleted, (state, { messageId }): ChatState => ({
    ...state,
    messages: messageAdapter.removeOne(messageId, state.messages),
  })),

  on(ChatActions.clearChatError, (state, { scope, conversationId }): ChatState => {
    if (scope === 'Conversations') return { ...state, error: { ...state.error, conversations: null } };
    if (scope === 'Messages' && conversationId) {
      const { [conversationId]: _, ...remainingMessagesErrors } = state.error.messages;
      return { ...state, error: { ...state.error, messages: remainingMessagesErrors } };
    }
    return state;
  })
);

export function chatReducer(state: ChatState | undefined, action: Action): ChatState {
  return _chatReducer(state, action);
}