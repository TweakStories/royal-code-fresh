/**
 * @file chat.effects.ts
 * @version 5.0.0 (Definitive, Corrected & Complete)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @description
 *   The definitive, enterprise-grade effects for the Chat domain. This version
 *   corrects all previous dependency injection and import errors. It implements
 *   a robust, streamlined effect for associating anonymous chat sessions upon
 *   user login and contains the complete logic for all chat-related side effects.
 */
import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { of, Observable, forkJoin, throwError } from 'rxjs';
import { map, switchMap, catchError, mergeMap, exhaustMap, tap, filter, withLatestFrom } from 'rxjs/operators';

// --- Domain & State ---
import { Conversation, ConversationType, Message } from '@royal-code/features/chat/domain';
import { Media, StructuredError } from '@royal-code/shared/domain';
import { AuthActions } from '@royal-code/store/auth';
import { ErrorActions } from '@royal-code/store/error';
import { ChatActions } from './chat.actions';

// --- Services ---
import { StorageService } from '@royal-code/core/storage';
import { LoggerService } from '@royal-code/core/core-logging';
import { NotificationService } from '@royal-code/ui/notifications';
import { ChatMappingService } from '../mappers/chat-mapping.service';
import { AbstractChatApiService } from '../data-access/abstract-chat-api.service';
import { PlushieMediaApiService } from '@royal-code/features/media/data-access-plushie';
import { TranslateService } from '@ngx-translate/core';
import { LoginComponent } from '@royal-code/features/authentication';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { AnonymousChatResponseDto } from '../dto/backend.dto';

const ANONYMOUS_AI_SESSION_ID_KEY = 'anonymousAiSessionId';

@Injectable()
export class ChatEffects {
  // === DEPS ===
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly chatApiService = inject(AbstractChatApiService);
  private readonly mappingService = inject(ChatMappingService);
  private readonly storageService = inject(StorageService);
  private readonly mediaService = inject(PlushieMediaApiService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly logPrefix = '[ChatEffects]';
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly translate = inject(TranslateService);

  // === CATEGORY: ANONYMOUS & AUTHENTICATION FLOWS ===

sendAnonymousMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.sendAnonymousMessageToAIBotRequested),
      mergeMap(({ payload, tempId }) => {
        const sessionId = this.storageService.getItem<string>(ANONYMOUS_AI_SESSION_ID_KEY);
        return this.chatApiService.sendAnonymousMessageToAiBot(payload, sessionId).pipe(
          map((response: AnonymousChatResponseDto) => { // <-- FIX: Type-assertie toegevoegd
            if (response.anonymousSessionId) {
              this.storageService.setItem(ANONYMOUS_AI_SESSION_ID_KEY, response.anonymousSessionId);
            }
            const userMessage = this.mappingService.mapMessage(response.userMessage);
            const aiReply = this.mappingService.mapMessage(response.aiReply);

            // --- FIX: Zorg ervoor dat `anonymousSessionId` altijd een string is ---
            const finalAnonymousSessionId = response.anonymousSessionId ?? ''; // Default naar lege string

            return ChatActions.sendAnonymousMessageToAIBotSuccess({
              userMessage,
              aiReply,
              anonymousSessionId: finalAnonymousSessionId, // <-- FIX: Gebruik de gegarandeerde string
              tempId,
            });
          }),
          catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse && error.status === 403 && error.error?.errorCode === 'MESSAGE_LIMIT_REACHED') {
              return of(AuthActions.loginPromptRequired({
                messageKey: 'chat.errors.messageLimitReached',
                reason: 'MESSAGE_LIMIT_REACHED'
              }));
            }
            return of(ChatActions.sendAnonymousMessageToAIBotFailure({
              error: this.createStructuredError(error, 'Send Anonymous AI Message'),
              tempId,
            }));
          })
        );
      })
    )
  );





  associateOnLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      exhaustMap(() => {
        const sessionId = this.storageService.getItem<string>(ANONYMOUS_AI_SESSION_ID_KEY);
        if (!sessionId) {
          return of({ type: '[ChatEffects] Association skipped, no session ID found.' });
        }
        return this.chatApiService.associateAnonymousChat(sessionId).pipe(
          map(() => {
            this.storageService.removeItem(ANONYMOUS_AI_SESSION_ID_KEY);
            this.notificationService.showSuccess('Vorige chat is opgeslagen in je account!');
            return ChatActions.loadConversationsRequested();
          }),
          catchError((error: unknown) => {
             this.logger.error(`${this.logPrefix} Failed to associate anonymous chat.`, error);
             this.storageService.removeItem(ANONYMOUS_AI_SESSION_ID_KEY);
             const structuredError = this.createStructuredError(error, 'Associate Anonymous Chat');
             return of(ChatActions.associateAnonymousChatFailure({ error: structuredError }), ErrorActions.reportError({ error: structuredError }));
          })
        );
      })
    )
  );


  // === CATEGORY: STANDARD CHAT OPERATIONS (Authenticated) ===

  loadConversations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadConversationsRequested),
      switchMap(() =>
        this.chatApiService.getConversations().pipe(
          map((conversations: Conversation[]) => ChatActions.loadConversationsSuccess({ conversations })),
          catchError((error: unknown) => of(ChatActions.loadConversationsFailure({ error: this.createStructuredError(error, 'Load Conversations') })))
        )
      )
    )
  );

  startConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.startConversationRequested),
      mergeMap(({ conversationType, targetUserId, initialMessage }) =>
        this.chatApiService.startConversation(conversationType, targetUserId, initialMessage?.content).pipe(
          map((conversation: Conversation) => ChatActions.startConversationSuccess({ conversation })),
          catchError((error: unknown) => of(ChatActions.startConversationFailure({ error: this.createStructuredError(error, 'Start Conversation', { conversationType, targetUserId }) })))
        )
      )
    )
  );

  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.sendMessageRequested),
       mergeMap(({ payload }) => {
        const filesToUpload: File[] = (payload.media ?? []).filter((item): item is File => item instanceof File);
        const { conversationId, content, gifUrl, tempId } = payload;

        return this.uploadMediaAndProceed(filesToUpload).pipe(
            switchMap((uploadedMedia: Media[]) =>
              this.chatApiService.sendMessage(conversationId, content, uploadedMedia.length > 0 ? uploadedMedia : undefined, gifUrl).pipe(
                map((sentMessage: Message) => ChatActions.sendMessageSuccess({ conversationId, sentMessage, tempId })),
                catchError((error: unknown) => of(ChatActions.sendMessageFailure({ conversationId, tempId, error: this.createStructuredError(error, 'Send Message') })))
              )
            ),
            catchError((uploadError: unknown) => of(ChatActions.sendMessageFailure({ conversationId, tempId, error: this.createStructuredError(uploadError, 'File Upload for Send Message') })))
        );
      })
    )
  );

  loadAnonymousConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadAnonymousConversationRequested),
      exhaustMap(({ anonymousSessionId }) =>
        this.chatApiService.getAnonymousConversation(anonymousSessionId).pipe(
          map(responseDto => {
            if (responseDto) {
              const messages = responseDto.messages.map(dto => this.mappingService.mapMessage(dto));
              const conversation: Conversation = {
                id: responseDto.conversationId,
                type: ConversationType.AIBOT,
                name: responseDto.aiPersona.name,
                lastMessage: messages.length ? messages[messages.length - 1] : undefined,
              } as Conversation;
              return ChatActions.loadAnonymousConversationSuccess({ conversation, messages });
            }
            // Als de backend null retourneert (404), is de sessie ongeldig
            this.storageService.removeItem(ANONYMOUS_AI_SESSION_ID_KEY);
            return ChatActions.loadAnonymousConversationFailure({
              error: this.createStructuredError(new Error(`Session ${anonymousSessionId} not found or expired.`), 'Load Anonymous Conversation')
            });
          }),
          catchError((error: unknown) => {
            this.logger.error(`${this.logPrefix} Failed to load anonymous conversation.`, error);
            this.storageService.removeItem(ANONYMOUS_AI_SESSION_ID_KEY); // Verwijder de ongeldige ID
            return of(ChatActions.loadAnonymousConversationFailure({
              error: this.createStructuredError(error, 'Load Anonymous Conversation')
            }));
          })
        )
      )
    )
  );


  sendMessageToAiBot$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.sendMessageToAIBotRequested),
      mergeMap(({ payload }) => {
        const { conversationId, content, gifUrl, tempId, media } = payload;
        const filesToUpload: File[] = (media ?? []).filter((item): item is File => item instanceof File);

        return this.uploadMediaAndProceed(filesToUpload).pipe(
          switchMap((uploadedMedia: Media[]) =>
            this.chatApiService.sendMessageToAiBot(conversationId, content, uploadedMedia.length > 0 ? uploadedMedia : undefined, gifUrl).pipe(
              map(response => ChatActions.sendMessageToAIBotSuccess({
                userMessage: response.userMessage,
                botReply: response.botReply,
                tempId,
                conversationId: response.userMessage.conversationId // <-- DE FIX
              })),
              catchError((error: unknown) => of(ChatActions.sendMessageToAIBotFailure({ conversationId, tempId, error: this.createStructuredError(error, 'Send AI Message') })))
            )
          ),
          catchError((uploadError: unknown) => of(ChatActions.sendMessageToAIBotFailure({ conversationId, tempId, error: this.createStructuredError(uploadError, 'Upload for AI Message') })))
        );
      })
    )
  );


  // === UTILITY METHODS ===

  private uploadMediaAndProceed(filesToUpload: File[]): Observable<Media[]> {
    if (filesToUpload.length === 0) {
        return of([]);
    }
    const uploadObservables$: Observable<Media>[] = filesToUpload.map((file: File) =>
      this.mediaService.uploadMediaWithProgress(file).pipe(
        filter((event: HttpEvent<Media>): event is HttpResponse<Media> => event.type === HttpEventType.Response),
        map(event => {
          if (event.body) return event.body;
          throw new Error(`Invalid media data for ${file.name}.`);
        })
      )
    );
    return forkJoin(uploadObservables$);
  }

  private createStructuredError(error: unknown, operation: string, context: Record<string, any> = {}): StructuredError {
    const rawMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    return {
      message: `${operation} failed: ${rawMessage.split('\n')[0]}`,
      code: `CHAT_${operation.toUpperCase().replace(/\s/g, '_')}_FAILED`,
      operation,
      context: { ...context, rawError: rawMessage },
      timestamp: Date.now(),
      severity: 'error',
      source: this.logPrefix
    };
  }
}