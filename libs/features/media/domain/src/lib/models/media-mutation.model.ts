/**
 * @file media-mutation.model.ts
 * @Version 1.1.0 (Definitive Payload Contracts)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-21
 * @Description
 *   Defines the standardized Data Transfer Objects (DTOs) or "payloads" for
 *   Create, Update, and Delete (CUD) operations on Media entities. These types
 *   ensure strict contracts for state management actions and API service calls.
 *   These are the definitive source of truth for media mutation payloads.
 */
import { Media } from '@royal-code/shared/domain';

export interface CreateMediaPayload {
  altText: string;
  title?: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'archive' | 'other';
  tags?: string[];
}

export type UpdateMediaPayload = Partial<Omit<Media, 'id' | 'type' | 'createdAt' | 'lastModified'>>;