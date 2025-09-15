/**
 * @file chat.types.ts
 * @version 2.1.0 (Synchronized with StructuredError)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-28
 * @description Defines TypeScript interfaces specific to the chat feature's NgRx state,
 *              now fully synchronized to store `StructuredError` objects.
 */

import { Conversation, Message } from "@royal-code/features/chat/domain";
import { StructuredError } from "@royal-code/shared/domain"; // << BELANGRIJKE IMPORT


/**
 * @interface ChatError
 * @description Represents a simple, localized error within the chat feature's state.
 *              Nu direct gekoppeld aan StructuredError, of als een deel ervan.
 */
export type ChatError = StructuredError; // << NU DIRECT STRUCTUREDERROR

/**
 * @interface ChatViewModel
 * @description A comprehensive, flattened data structure for a chat component.
 *              It aggregates all necessary state into a single object to simplify component logic.
 */
export interface ChatViewModel {
  readonly conversations: readonly Conversation[];
  readonly selectedConversation: Conversation | undefined;
  readonly messages: readonly Message[];
  readonly isLoadingConversations: boolean;
  readonly isLoadingMessages: boolean;
  readonly isSendingMessage: boolean;
  readonly error: StructuredError | null; // << AANGEPAST NAAR StructuredError
  readonly hasConversations: boolean;
  readonly hasMessages: boolean;
  readonly isBusy: boolean;
}