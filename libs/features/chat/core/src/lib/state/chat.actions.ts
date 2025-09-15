/**
 * @file chat.actions.ts
 * @version 3.0.0 (Refactored for StructuredError & Payload Consistency)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-28
 * @description
 *   Defines all NgRx actions for the Chat domain, now consistently using `StructuredError`
 *   for error payloads and ensuring `SendMessagePayload.tempId` is explicitly required.
 *   This version aligns with the enterprise blueprint for robust state management.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { Conversation, Message } from '@royal-code/features/chat/domain';
import { Media, ReactionType } from '@royal-code/shared/domain';
import { ConversationType } from '@royal-code/features/chat/domain';


// --- IMPORTS VOOR STRUCTURED ERROR ---
import { StructuredError } from '@royal-code/shared/domain'; 
import { AnonymousConversationDto, AnonymousSendMessagePayloadDto } from '../dto/backend.dto';

// Payload voor het verzenden van een nieuw bericht
export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
  media?: (File | Media)[];
  gifUrl?: string;
  tempId: string; 
}

// << GEBRUIK NU STRUCTUREDERROR OVERAL WAAR EEN FOUT WORDT VERSTUURD >>
export type ChatErrorPayload = { error: StructuredError };

export const ChatActions = createActionGroup({
  source: 'Chat',
  events: {
    // --- Conversation Actions ---
    'Load Conversations Requested': emptyProps(),
    'Load Conversations Success': props<{ conversations: Conversation[] }>(),
    'Load Conversations Failure': props<ChatErrorPayload>(), // << AANGEPAST

    'Load Anonymous Conversation Requested': props<{ anonymousSessionId: string }>(),
    'Load Anonymous Conversation Success': props<{ conversation: Conversation; messages: Message[] }>(),
    'Load Anonymous Conversation Failure': props<ChatErrorPayload>(),

    'Select Conversation': props<{ conversationId: string | null }>(),

    'Start Conversation Requested': props<{ conversationType: ConversationType.AIBOT | ConversationType.DIRECTMESSAGE; targetUserId?: string; initialMessage?: Partial<Message> }>(),
    'Start Conversation Success': props<{ conversation: Conversation }>(),
    'Start Conversation Failure': props<ChatErrorPayload>(), // << AANGEPAST

    // --- Message Actions ---
    'Load Messages Requested': props<{ conversationId: string; beforeMessageId?: string; limit?: number }>(),
    'Load Messages Success': props<{ conversationId: string; messages: readonly Message[]; prepended?: boolean }>(),
    'Load Messages Failure': props<{ conversationId: string } & ChatErrorPayload>(), // << AANGEPAST

    'Send Message Requested': props<{ payload: SendMessagePayload }>(),
    'Send Message Success': props<{ conversationId: string; sentMessage: Message; tempId: string }>(),
    'Send Message Failure': props<{ conversationId:string; tempId: string } & ChatErrorPayload>(), // << AANGEPAST

    'Send Message To AI Bot Requested': props<{ payload: SendMessagePayload }>(),
  'Send Message To AI Bot Success': props<{
        userMessage: Message;
        botReply: Message;
        tempId: string;
        conversationId: string; 
    }>(),
    'Send Message To AI Bot Failure': props<{ conversationId:string; tempId: string } & ChatErrorPayload>(),

    // --- Real-time & UI Updates ---
    'Message Received': props<{ conversationId: string; message: Message }>(),
    'Message Updated': props<{ conversationId: string; messageUpdate: Update<Message> }>(),
    'Message Deleted': props<{ conversationId: string; messageId: string }>(),

    // --- React To Message ---
    'React To Message Requested': props<{ conversationId: string; messageId: string; reactionType: ReactionType | null }>(),
    'React To Message Success': props<{ conversationId: string; messageUpdate: Update<Message> }>(),
    'React To Message Failure': props<{ conversationId: string; messageId: string } & ChatErrorPayload>(), // << AANGEPAST

    'Edit Message Requested': props<{ conversationId: string; messageUpdate: Update<Message> }>(),
    'Edit Message Success': props<{ conversationId: string; messageUpdate: Update<Message> }>(),
    'Edit Message Failure': props<{ conversationId: string; messageId: string } & ChatErrorPayload>(), // << AANGEPAST

    'Delete Message Requested': props<{ conversationId: string; messageId: string }>(),
    'Delete Message Success': props<{ conversationId: string; messageId: string }>(),
    'Delete Message Failure': props<{ conversationId: string; messageId: string } & ChatErrorPayload>(), // << AANGEPAST

    'Report Message Requested': props<{ conversationId: string; messageId: string; reason: string }>(),
    'Report Message Success': props<{ conversationId: string; messageId: string }>(),
    'Report Message Failure': props<{ conversationId: string; messageId: string } & ChatErrorPayload>(), // << AANGEPAST

    // === ANONYMOUS AI CHAT FLOW ===
    'Send Anonymous Message To AI Bot Requested': props<{ payload: AnonymousSendMessagePayloadDto; tempId: string }>(),
'Send Anonymous Message To AI Bot Success': props<{
      userMessage: Message;
      aiReply: Message;
      anonymousSessionId: string;
      tempId: string
    }>(),
    'Send Anonymous Message To AI Bot Failure': props<{ error: StructuredError; tempId: string }>(),

    // === CHAT ASSOCIATION FLOW ===
    'Associate Anonymous Chat On Login': emptyProps(),
    'Associate Anonymous Chat Success': emptyProps(),
    'Associate Anonymous Chat Failure': props<ChatErrorPayload>(),
    
    // Clear Chat Error: deze actie ontvangt al de scope en optionele conversationId,
    // en de reducer zal de error uit de state verwijderen. De payload hoeft hier
    // geen error object meer mee te geven als je de error via een andere action dispatchet.
    'Clear Chat Error': props<{ scope: 'Conversations' | 'Messages'; conversationId?: string }>(),
  }
});