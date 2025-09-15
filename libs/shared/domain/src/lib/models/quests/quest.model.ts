// libs/shared/domain/src/lib/quests/quest.model.ts
import { AppIcon } from '../../enums/icon.enum';
import { AuditableEntityBase, DateTimeInfo } from "../../base/auditable-entity-base.model";

/**
 * @enum QuestStatus
 * @description Defines the possible statuses of a quest.
 */
export enum QuestStatus {
  Available = 'available',
  Active = 'active',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Locked = 'locked',
  Claimed = 'claimed'
}

/**
 * @interface QuestObjective
 * @description Defines the structure for a single objective within a quest.
 */
export interface QuestObjective {
  id: string;
  titleKeyOrText: string;
  descriptionKeyOrText: string;
  targetProgress: number;
  currentProgress?: number;
  isOptional?: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

/**
 * @interface QuestReward
 * @description Defines the potential rewards for completing a quest.
 */
export interface QuestReward {
  xp?: number;
  itemIds?: string[];
  currency?: { type: string; amount: number }[];
  unlocks?: string[];
  badgeId?: string;
}

/**
 * @interface Quest
 * @description Represents a single quest available or active for the user.
 */
export interface Quest extends AuditableEntityBase {
  id: string;
  titleKeyOrText: string;
  descriptionKeyOrText: string;
  status: QuestStatus;
  reward?: QuestReward;
  icon?: AppIcon;
  objectives?: QuestObjective[];
  giverInfo?: string;
  requiredLevel?: number;
  prerequisiteQuestIds?: string[];
  linkedChallengeId?: string;
  timeLimit?: number;
  isRepeatable?: boolean;
  category?: string;
  expiresAt?: DateTimeInfo;
  acceptedAt?: DateTimeInfo;
  completedAt?: DateTimeInfo;
  failedAt?: DateTimeInfo;
  claimedAt?: DateTimeInfo;
}
