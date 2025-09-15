/**
 * @file abstract-chat-api.service.ts
 * @Version 3.0.0 (Anonymous Chat Support)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @description
 *   Abstract service defining the contract for the chat data-access layer.
 *   This version adds support for the full anonymous chat lifecycle, including
 *   sending messages and associating the session with a user account after login.
 */
import { Observable } from 'rxjs';
import { Conversation, Message, ConversationType } from '@royal-code/features/chat/domain';
import { PaginatedList } from '@royal-code/shared/utils';
import { Media } from '@royal-code/shared/domain';
import { AnonymousChatResponseDto, AnonymousConversationDto, AnonymousSendMessagePayloadDto, BackendMessageDto } from '../dto/backend.dto';

export abstract class AbstractChatApiService {
  abstract getConversations(): Observable<Conversation[]>;
  abstract getMessages(conversationId: string, before?: string, limit?: number): Observable<PaginatedList<Message>>;
  abstract sendMessage(conversationId: string, content: string, media?: Media[], gifUrl?: string): Observable<Message>;

  abstract startConversation(
    conversationType: ConversationType.AIBOT | ConversationType.DIRECTMESSAGE,
    targetUserId?: string,
    initialMessageContent?: string
  ): Observable<Conversation>;

  abstract sendMessageToAiBot(
    conversationId: string,
    content: string,
    media?: Media[],
    gifUrl?: string
  ): Observable<{ userMessage: Message; botReply: Message }>;

/**
   * @method sendAnonymousMessageToAiBot
   * @description Sends a message as an anonymous user to the AI bot.
   * @param payload The message content and AI persona ID.
   * @param anonymousSessionId Optional ID for an existing anonymous session.
   * @returns An Observable of the AnonymousChatResponseDto from the AI, which includes the session ID.
   */
  abstract sendAnonymousMessageToAiBot(
    payload: AnonymousSendMessagePayloadDto,
    anonymousSessionId?: string | null
  ): Observable<AnonymousChatResponseDto>; 

  /**
   * @method associateAnonymousChat
   * @description Associates a given anonymous chat session with the currently authenticated user.
   * @param anonymousSessionId The ID of the session to associate.
   * @returns An Observable that completes with void on success.
   */
  abstract associateAnonymousChat(anonymousSessionId: string): Observable<void>;

  /**
   * @method getAnonymousConversation
   * @description Retrieves the full conversation history for a given anonymous session ID.
   * @param anonymousSessionId The unique identifier of the anonymous chat session.
   * @returns An Observable of the AnonymousConversationDto, or null if not found.
   */
  abstract getAnonymousConversation(anonymousSessionId: string): Observable<AnonymousConversationDto | null>;

}