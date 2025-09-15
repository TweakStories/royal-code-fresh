/**
 * @file social-backend.types.ts
 * @version 1.1.0 (Added FeedReplyDto & Ensured Consistency)
 * @author Royal-Code MonorepoAppDevAI
 * @description Defines the exact DTO structures as received from the backend API,
 *              including date fields as strings for mapping purposes.
 */
import { Image, Media, Profile, ReactionSummary, ReactionType } from "@royal-code/shared/domain"; // Voor Media/Image structuur
import { PrivacyLevel } from "@royal-code/shared/domain";


// De DTO voor een FeedItem zoals die uit de Swagger / API komt
export interface FeedItemDto {
  readonly id: string;
  readonly feedId: string;
  readonly author: Profile; // Aanname: Profile DTO is 1-op-1
  readonly text: string | null;
  readonly media: Media[] | null; // Assumed to match frontend Media structure
  readonly gifUrl: string | null;
  readonly reactions: ReadonlyArray<ReactionSummary> | null;
  readonly userReaction: ReactionType | null;
  readonly replyCount: number;
  readonly isEdited: boolean;
  readonly isPinned: boolean;
  readonly isHidden: boolean;
  readonly isSaved: boolean;
  readonly privacy: PrivacyLevel;
  readonly created: string; // <-- Belangrijk: dit is een string!
  readonly lastModified: string; // <-- Belangrijk: dit is een string!
}

export interface FeedReplyDto {
  readonly id: string;
  readonly parentId: string;
  readonly replyToReplyId: string | null;
  readonly feedId: string;
  readonly author: Profile; // Aanname: Profile DTO is 1-op-1
  readonly text: string | null;
  readonly media: Media[] | null; // Assumed to match frontend Media structure
  readonly gifUrl: string | null;
  readonly reactions: ReadonlyArray<ReactionSummary> | null;
  readonly userReaction: ReactionType | null;
  readonly isEdited: boolean;
  readonly isDeleted: boolean; // Toegevoegd o.b.v. backend model
  readonly level: number | null; // Toegevoegd o.b.v. backend model
  readonly created: string; // <-- Belangrijk: dit is een string!
  readonly lastModified: string; // <-- Belangrijk: dit is een string!
}