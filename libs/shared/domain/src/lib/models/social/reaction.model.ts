/**
 * @file reaction.model.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-11
 * @Description Defines core models for social reactions, elevated to shared domain to break circular dependencies.
 */

/** Enum defining the available reaction types. */
export enum ReactionType {
  Like = 'like', Love = 'love', Haha = 'haha', Wow = 'wow', Sad = 'sad', Angry = 'angry',
}

/** Represents a summary of a specific reaction type, including its count. */
export interface ReactionSummary {
  type: ReactionType;
  count: number;
}