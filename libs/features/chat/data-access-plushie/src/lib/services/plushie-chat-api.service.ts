/**
 * @file plushie-chat-api.service.ts
 * @version 4.0.1 (Definitive & Robust AI Bot Mock)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-29
 * @description
 *   The definitive, simplified, and architecturally correct implementation.
 *   This version includes a more robust and realistic mock for `sendMessageToAiBot`
 *   that correctly simulates the API returning the user's message before the bot replies.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { APP_CONFIG } from '@royal-code/core/config';
import { AbstractChatApiService, ChatMappingService } from '@royal-code/features/chat/core';
import { Conversation, Message, ConversationType, MessageStatus } from '@royal-code/features/chat/domain';
import { DateTimeUtil, PaginatedList } from '@royal-code/shared/utils';
import { Media } from '@royal-code/shared/domain';
import { AnonymousChatResponseDto, AnonymousConversationDto, AnonymousSendMessagePayloadDto, BackendMessageDto } from '@royal-code/features/chat/core';
import { StartConversationResponseDto } from '../dto/backend.types';

@Injectable({ providedIn: 'root' })
export class PlushieChatApiService extends AbstractChatApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly mappingService = inject(ChatMappingService);
  private readonly apiUrl = `${this.config.backendUrl}/Chat`;

  override getConversations(): Observable<Conversation[]> {
    console.warn('[PlushieChatApiService] getConversations is mocked.');
    return of([]);
  }

  override getMessages(conversationId: string, before?: string, limit = 20): Observable<PaginatedList<Message>> {
    let params = new HttpParams().set('pageSize', limit.toString());
    if (before) {
        params = params.set('pageNumber', before);
    }
    return this.http.get<PaginatedList<BackendMessageDto>>(`${this.apiUrl}/conversations/${conversationId}/messages`, { params }).pipe(
      map(paginatedDto => ({
        ...paginatedDto,
        items: paginatedDto.items.map(dto => this.mappingService.mapMessage(dto))
      }))
    );
  }

  override sendMessage(conversationId: string, content: string, media?: Media[], gifUrl?: string): Observable<Message> {
    const payload = { content, mediaIds: media?.map(m => m.id), gifUrl };
    return this.http.post<BackendMessageDto>(`${this.apiUrl}/conversations/${conversationId}/messages`, payload).pipe(
      map(dto => this.mappingService.mapMessage(dto))
    );
  }

  override sendMessageToAiBot(
    conversationId: string,
    content: string,
    media?: Media[],
    gifUrl?: string
  ): Observable<{ userMessage: Message; botReply: Message }> {
    // Stap 1: Hergebruik de echte `sendMessage` om het bericht van de gebruiker te "versturen" en een bevestiging te krijgen.
    // De vernieuwde mapping service zorgt ervoor dat dit bericht `status: 'sent'` krijgt.
    return this.sendMessage(conversationId, content, media, gifUrl).pipe(
      map(confirmedUserMessage => {
        
        // Stap 2: Creëer het bot-antwoord. Dit antwoord moet OOK een expliciete 'sent' status hebben.
        const botReply: Message = {
          id: `bot-reply-to-${confirmedUserMessage.id}`,
          conversationId: confirmedUserMessage.conversationId,
          senderId: 'ai-persona-id-01',
          senderType: 'bot',
          senderProfile: { id: 'ai-persona-id-01', displayName: 'Plushie Pal' },
          content: `Dit is een gesimuleerd antwoord op: "${confirmedUserMessage.content.substring(0, 50)}..."`,
          createdAt: DateTimeUtil.now(),
          status: MessageStatus.SENT, // Expliciet instellen!
        };
        
        // Stap 3: Retourneer het object dat het effect verwacht, nu met correcte statussen.
        return { userMessage: confirmedUserMessage, botReply };
      })
    );
  }

  override startConversation(
    conversationType: ConversationType.AIBOT | ConversationType.DIRECTMESSAGE,
    targetUserId?: string,
    initialMessageContent?: string
  ): Observable<Conversation> {
    if (conversationType === ConversationType.AIBOT) {
      const payload = { aiPersonaName: 'Plushie Pal', initialMessageContent };
      return this.http.post<StartConversationResponseDto>(`${this.apiUrl}/conversations/ai-bot`, payload).pipe(
        map(responseDto => ({
          id: responseDto.conversationId,
          type: ConversationType.AIBOT,
          participantIds: [],
          isNew: responseDto.isNew,
        } as Conversation))
      );
    }

    if (conversationType === ConversationType.DIRECTMESSAGE && targetUserId) {
      const payload = { otherUserId: targetUserId, initialMessageContent };
      return this.http.post<StartConversationResponseDto>(`${this.apiUrl}/conversations/direct-message`, payload).pipe(
        map(responseDto => ({
          id: responseDto.conversationId,
          type: ConversationType.DIRECTMESSAGE,
          participantIds: [],
          isNew: responseDto.isNew,
        } as Conversation))
      );
    }
    
    return throwError(() => new Error('Invalid conversation type or missing targetUserId for user-to-user chat.'));
  }

override sendAnonymousMessageToAiBot(
    payload: AnonymousSendMessagePayloadDto,
    anonymousSessionId?: string | null
  ): Observable<AnonymousChatResponseDto> { // <-- FIX: Return type is nu AnonymousChatResponseDto
    let params = new HttpParams();
    if (anonymousSessionId) {
      params = params.set('anonymousSessionId', anonymousSessionId);
    }
    const url = `${this.apiUrl}/conversations/ai-bot/anonymous`;
    return this.http.post<AnonymousChatResponseDto>(url, payload, { params }); // <-- FIX: Http POST verwacht nu AnonymousChatResponseDto
  }


  override associateAnonymousChat(anonymousSessionId: string): Observable<void> {
    const url = `${this.apiUrl}/conversations/anonymous/associate`;
    const payload = { anonymousSessionId };
    // Verwacht een 204 No Content, dus responseType 'json' is niet nodig.
    return this.http.post<void>(url, payload);
  }

  override getAnonymousConversation(anonymousSessionId: string): Observable<AnonymousConversationDto | null> {
    const url = `${this.apiUrl}/conversations/anonymous/${anonymousSessionId}`;
    return this.http.get<AnonymousConversationDto>(url).pipe(
      catchError(err => {
        if (err.status === 404) {
          return of(null); // Return null for Not Found
        }
        return throwError(() => err); // Re-throw other errors
      })
    );
  }

}