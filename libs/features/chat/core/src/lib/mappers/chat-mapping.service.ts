/**
 * @file chat-mapping.service.ts
 * @Version 3.1.0 (Restored to Clean Mapping)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-29
 * @description
 *   This clean version of the mapper trusts the backend to provide the correct
 *   message status. The defensive `status: MessageStatus.SENT` override has been
 *   removed now that the backend bug is fixed, restoring a clean data flow.
 */
import { Injectable } from '@angular/core';
import { Message, MessageStatus } from '@royal-code/features/chat/domain';
import { BackendMessageDto } from '../dto/backend.dto';
import { DateTimeUtil } from '@royal-code/shared/utils';
import { MediaType, Image } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class ChatMappingService {

  public mapMessage(dto: BackendMessageDto): Message {
    return {
      id: dto.id,
      conversationId: dto.conversationId,
      senderId: dto.sender.id,
      senderType: 'user', // Aanname, dit moet wellicht uit de DTO komen
      senderProfile: {
          id: dto.sender.id,
          displayName: dto.sender.displayName || 'Unknown User',
          avatar: dto.sender.avatarUrl ? { id: 'avatar-' + dto.sender.id, type: MediaType.IMAGE, variants: [{ url: dto.sender.avatarUrl, purpose: 'thumbnail' }] } as Image : undefined
      },
      content: dto.content,
      createdAt: DateTimeUtil.fromISO(dto.timestamp),
      // --- DE FIX IS HIER ---
      // We vertrouwen nu weer op de status die de (gefixte) backend ons geeft.
      status: dto.status ?? MessageStatus.SENT, // Fallback voor het geval de DTO het veld mist
    };
  }
}