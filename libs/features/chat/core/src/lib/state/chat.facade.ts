/**
 * @file chat.facade.ts
 * @version 5.1.0 (Definitive with Anonymous Guest ID)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @description
 *   The definitive, public-facing API for the Chat feature state. This facade
 *   now exposes the `anonymousGuestId` for consistent anonymous user identification
 *   in the UI layer.
 */
import { Injectable, inject, Signal, computed } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { take, tap, map, switchMap, filter, catchError, distinctUntilChanged, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { Update } from '@ngrx/entity';

import { ChatActions, SendMessagePayload } from './chat.actions';
import * as ChatSelectors from './chat.selectors';
import { LoggerService } from '@royal-code/core/core-logging';
import { DateTimeUtil } from '@royal-code/shared/utils';
import { Conversation, Message, ConversationType } from '@royal-code/features/chat/domain';
import { StructuredError } from '@royal-code/shared/domain';
import { AnonymousSendMessagePayloadDto } from '../dto/backend.dto';
import { AuthFacade } from '@royal-code/store/auth';

@Injectable({ providedIn: 'root' })
export class ChatFacade {
  private readonly store = inject(Store);
  private readonly logger = inject(LoggerService);
  private readonly authFacade = inject(AuthFacade);
  private readonly logPrefix = '[ChatFacade]';

  // === EXPOSED STATE (SIGNALS) ===
  readonly allConversations: Signal<Conversation[]> = toSignal(this.store.pipe(select(ChatSelectors.selectAllConversations)), { initialValue: [] });
  readonly selectedConversation: Signal<Conversation | undefined> = toSignal(this.store.pipe(select(ChatSelectors.selectSelectedConversation)), { initialValue: undefined });
  readonly conversationsLoading: Signal<boolean> = toSignal(this.store.pipe(select(ChatSelectors.selectIsLoadingConversations)), { initialValue: true });
  readonly aiConversation: Signal<Conversation | undefined> = toSignal(this.store.pipe(select(ChatSelectors.selectAiConversation)), { initialValue: undefined });
  readonly aiConversationMessages: Signal<Message[]> = toSignal(this.store.pipe(select(ChatSelectors.selectAiConversationMessages)), { initialValue: [] });
  readonly currentSelectedConversationMessages: Signal<Message[]> = toSignal(this.store.pipe(select(ChatSelectors.selectMessagesForSelectedConversation)), { initialValue: [] });
  readonly selectedConversationMessagesLoading: Signal<boolean> = toSignal(this.store.pipe(select(ChatSelectors.selectSelectedConversationId), distinctUntilChanged(), switchMap(selectedId => selectedId ? this.store.pipe(select(ChatSelectors.selectMessagesLoadingForConversation(selectedId))) : of(false)), startWith(false)), { initialValue: false });
  readonly isAiChatLoading: Signal<boolean> = toSignal(this.store.select(ChatSelectors.selectIsAiChatLoading), { initialValue: false });
  readonly selectedConversationId: Signal<string | null> = toSignal(this.store.pipe(select(ChatSelectors.selectSelectedConversationId)), { initialValue: null });
  readonly anonymousGuestId: Signal<string | null> = toSignal(this.store.select(ChatSelectors.selectAnonymousGuestId), { initialValue: null });

  // === ACTION DISPATCHERS ===

  public ensureAiConversationIsActiveAndLoaded(): Observable<string | null> {
    const logCtx = `${this.logPrefix} [ensureAiConversationIsActiveAndLoaded]`;
    return this.store.pipe(
      select(ChatSelectors.selectAiConversation), take(1),
      switchMap(aiConv => {
        if (aiConv?.id) {
          if (this.selectedConversationId() !== aiConv.id) { this.selectConversation(aiConv.id); }
          this.loadMessagesIfNotLoaded(aiConv.id).pipe(take(1)).subscribe();
          return of(aiConv.id);
        } else {
          this.store.dispatch(ChatActions.startConversationRequested({ conversationType: ConversationType.AIBOT }));
          return this.store.pipe(
            select(ChatSelectors.selectAiConversation), filter((newlyCreatedConv): newlyCreatedConv is Conversation => !!(newlyCreatedConv?.id)),
            take(1),
            tap(newlyCreatedConvWithId => {
              this.selectConversation(newlyCreatedConvWithId.id);
              this.loadMessages(newlyCreatedConvWithId.id, undefined, 20);
            }),
            map(newlyCreatedConvWithId => newlyCreatedConvWithId.id)
          );
        }
      }),
      catchError(err => {
        this.logger.error(`${logCtx} CRITICAL error during ensure process:`, err);
        return of(null);
      })
    );
  }

  public sendMessageToAiBot(payload: Omit<SendMessagePayload, 'conversationId' | 'tempId' | 'senderId'> & { aiPersonaId: string }): void {
    const tempId = `temp-ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const currentUserId = this.authFacade.currentUser()?.id;

    if (currentUserId) {
      this.logger.debug(`${this.logPrefix} Sending message as authenticated user.`);
      this.ensureAiConversationIsActiveAndLoaded().pipe(take(1)).subscribe({
        next: (aiConvId) => {
          if (aiConvId) {
            const finalPayload: SendMessagePayload = { ...payload, conversationId: aiConvId, tempId, senderId: currentUserId };
            this.store.dispatch(ChatActions.sendMessageToAIBotRequested({ payload: finalPayload }));
          } else {
            const error: StructuredError = { message: 'AI conversation could not be initialized.', code: 'CHAT_AI_CONV_INIT_FAILED', operation: 'sendMessageToAiBot', context: { tempId }, timestamp: Date.now(), severity: 'error' };
            this.store.dispatch(ChatActions.sendMessageToAIBotFailure({ conversationId: 'init-failed-ai-conv', tempId: tempId, error: error }));
          }
        }
      });
    } else {
      this.logger.debug(`${this.logPrefix} Sending message as anonymous user.`);
      const anonymousPayload: AnonymousSendMessagePayloadDto = {
        aiPersonaId: payload.aiPersonaId,
        content: payload.content,
      };
      this.store.dispatch(ChatActions.sendAnonymousMessageToAIBotRequested({ payload: anonymousPayload, tempId }));
    }
  }

  public sendMessage(payload: Omit<SendMessagePayload, 'tempId'>): void {
    const finalPayload: SendMessagePayload = { ...payload, tempId: `temp-msg-${Date.now()}` };
    this.store.dispatch(ChatActions.sendMessageRequested({ payload: finalPayload }));
  }

  public loadConversations(): void { this.store.dispatch(ChatActions.loadConversationsRequested()); }
  public selectConversation(conversationId: string | null): void { this.store.dispatch(ChatActions.selectConversation({ conversationId })); }
  public loadMessages(conversationId: string, beforeMessageId?: string, limit?: number): void { this.store.dispatch(ChatActions.loadMessagesRequested({ conversationId, beforeMessageId, limit })); }

  public loadMessagesIfNotLoaded(conversationId: string | null): Observable<boolean> {
    if (!conversationId) return of(false);
    return this.getAllMessagesLoadedForConversation$(conversationId).pipe(
      take(1),
      switchMap(areLoaded => this.getMessagesLoadingForConversation$(conversationId).pipe(
        take(1),
        tap(isLoading => { if (!isLoading && !areLoaded) this.loadMessages(conversationId); }),
        map(() => !areLoaded)
      ))
    );
  }

  public editMessage(conversationId: string, messageId: string, newContent: string): void {
    const messageUpdate: Update<Message> = { id: messageId, changes: { content: newContent, isEdited: true, lastModified: DateTimeUtil.now() } };
    this.store.dispatch(ChatActions.editMessageRequested({ conversationId, messageUpdate }));
  }

  public deleteMessage(conversationId: string, messageId: string): void {
    this.store.dispatch(ChatActions.deleteMessageRequested({ conversationId, messageId }));
  }

  public reportMessage(conversationId: string, messageId: string, reason: string): void {
    this.store.dispatch(ChatActions.reportMessageRequested({ conversationId, messageId, reason }));
  }

  // === OBSERVABLE ACCESSORS ===
  public getAllMessagesLoadedForConversation$(conversationId: string): Observable<boolean> {
    return this.store.pipe(select(ChatSelectors.selectAllMessagesLoadedForConversation(conversationId)));
  }

  public getMessagesLoadingForConversation$(conversationId: string): Observable<boolean> {
    return this.store.pipe(select(ChatSelectors.selectMessagesLoadingForConversation(conversationId)));
  }
}