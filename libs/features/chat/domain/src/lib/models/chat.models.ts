/**
 * @file chat.model.ts
 * @version 2.3.0 - Centralized Reaction models to break circular dependency.
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-28
 * @description
 *   Defines the core domain models for the Chat feature, now
 *   synchronized with `StructuredError` and updated DTO expectations,
 *   with cleaned and concise comments.
 */
import { Media, Image, StructuredError, Profile } from '@royal-code/shared/domain';
import { ReactionSummary, ReactionType } from '@royal-code/shared/domain'; // <-- CORRECTED IMPORT
import { AuditableEntityBase } from '@royal-code/shared/base-models';

export enum ConversationType {
  DIRECTMESSAGE = 'direct-message',
  GROUPCHAT = 'group-chat',
  AIBOT = 'ai-bot',
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export interface Message extends AuditableEntityBase {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'bot';
  senderProfile?: Profile;
  content: string;
  media?: readonly Media[];
  gifUrl?: string;
  status: MessageStatus; // Verwijder het vraagteken. Maak het verplicht.
  isRead?: boolean;
  isEdited?: boolean;
  error?: StructuredError | null;
  reactions?: readonly ReactionSummary[];
  userReaction?: ReactionType | null;
}


export interface Conversation extends AuditableEntityBase {
  id: string;
  type: ConversationType;
  name?: string;
  avatar?: Image;
  participantIds?: readonly string[];
  botId?: string;
  lastMessage?: Message | null;
  unreadCount?: number;
  isMuted?: boolean;
  isNew?: boolean; 
}