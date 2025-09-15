/**
 * @file backend.dto.ts (chat-core)
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-11
 * @Description Defines the Data Transfer Objects (DTOs) that are part of the core chat contract.
 */
import { Conversation, ConversationType, Message, MessageStatus } from '@royal-code/features/chat/domain';

// DTOs moved from data-access-plushie to here
export interface BackendSenderDto {
  id: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface AnonymousSendMessagePayloadDto {
  aiPersonaId: string;
  content: string;
}

export interface BackendMessageDto {
  id: string;
  conversationId: string;
  sender: BackendSenderDto;
  content: string;
  timestamp: string; 
  isRead: boolean;
  status?: MessageStatus;
  anonymousSessionId?: string;
  replyToMessageId?: string; 
  isEdited?: boolean;       
}
export interface AnonymousChatResponseDto {
    userMessage: BackendMessageDto;
    aiReply: BackendMessageDto;
    anonymousSessionId: string; 
}

export interface AIPersonaDto {
  id: string;
  name: string;
  description?: string;
  avatarMediaId?: string;
}

export interface AnonymousConversationDto {
    conversationId: string;
    anonymousSessionId: string;
    aiPersona: AIPersonaDto;
    messages: BackendMessageDto[]; 
}