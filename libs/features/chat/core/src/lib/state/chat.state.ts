/**
 * @file chat.state.ts
 * @version 2.3.0 (Corrected Interface & Anonymous Guest ID)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @description Defines the NgRx state structure for the Chat feature, now
 *              with the `ChatState` interface correctly defined (not extending `EntityState`)
 *              and including the `anonymousGuestId` for consistent anonymous user identification.
 */
import { EntityState, createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { Conversation, Message } from '@royal-code/features/chat/domain';
import { StructuredError } from '@royal-code/shared/domain';

// === CATEGORY: ADAPTERS ===
export const conversationAdapter: EntityAdapter<Conversation> = createEntityAdapter<Conversation>({
  selectId: (conversation: Conversation) => conversation.id,
  sortComparer: (a, b) => (b.lastMessage?.createdAt?.timestamp ?? 0) - (a.lastMessage?.createdAt?.timestamp ?? 0),
});

export const messageAdapter: EntityAdapter<Message> = createEntityAdapter<Message>({
  selectId: (message: Message) => message.id,
  sortComparer: (a, b) => (a.createdAt?.timestamp ?? 0) - (b.createdAt?.timestamp ?? 0),
});

// === CATEGORY: STATE INTERFACE ===
export interface ChatState {
  conversations: EntityState<Conversation>;
  messages: EntityState<Message>;

  isLoadingConversations: boolean;
  isLoadingMessages: Record<string, boolean>; // Keyed by conversationId
  isSendingMessage: Record<string, boolean>; // Keyed by tempId
  error: {
    conversations: StructuredError | null;
    messages: Record<string, StructuredError | null>;
  };

  selectedConversationId: string | null;
  anonymousGuestId: string | null;
  pagination: Record<string, { allMessagesLoaded: boolean }>;
}

// === CATEGORY: INITIAL STATE ===
export const initialChatState: ChatState = {
  conversations: conversationAdapter.getInitialState(),
  messages: messageAdapter.getInitialState(),
  isLoadingConversations: false,
  isLoadingMessages: {},
  isSendingMessage: {},
  error: {
    conversations: null,
    messages: {},
  },
  selectedConversationId: null,
  anonymousGuestId: null,
  pagination: {},
};