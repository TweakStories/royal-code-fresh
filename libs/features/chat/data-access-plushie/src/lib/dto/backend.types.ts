/**
 * @file backend.types.ts (chat/data-access-plushie)
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-28
 * @Description
 *   Defines the Data Transfer Object (DTO) contracts for the Chat API backend.
 */
import { BackendMessageDto } from '@royal-code/features/chat/core';
import { Conversation, ConversationType, Message, MessageStatus } from '@royal-code/features/chat/domain';
import { AuditableEntityBase } from '@royal-code/shared/base-models';

export interface BackendParticipantDto {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
}






export interface BackendConversationDto {
  id: string; 
  participants?: BackendParticipantDto[];
  type: ConversationType;
  createdAt?: string;
  lastModified?: string;
  lastMessage?: BackendMessageDto;
}


export interface StartConversationResponseDto {
  conversationId: string;
  isNew: boolean;
}

