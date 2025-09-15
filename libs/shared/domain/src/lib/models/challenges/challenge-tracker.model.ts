/**
 * @file libs/shared/domain/src/lib/challenges/challenge-tracker.model.ts
 * @Version 1.0.0
 * @Author ChallengerAppDevAI
 * @Description Defines the data model for tracking a user's progress and status
 *              within a specific challenge. This includes information about visited
 *              nodes, overall progress, and timestamps.
 */
import { DateTimeInfo } from "../../base/common.model";
import { Route } from "../locations/route.model";

/**
 * @Interface ChallengeTracker
 * @Description Represents the tracking data for a user's participation in a challenge.
 */
export interface ChallengeTracker {
  /** Unique identifier for this specific tracking instance. */
  trackerId: string;
  /** Identifier of the `Challenge` this tracker pertains to. */
  challengeId: string;
  /** Identifier of the `User` whose progress is being tracked. */
  userId: string;
  /** Current status of the user's participation in the challenge. */
  status: ChallengeTrackerStatus;
  /** Optional: The specific route taken by the user, if applicable for this challenge. */
  route?: Route;
  /** An array of Node IDs that the user has visited or completed as part of this challenge. */
  nodesVisited: string[];
  /** Overall progress of the user in this challenge, typically represented as a percentage (0-100). */
  progress: number;
  /** Timestamp indicating when this tracker was last updated. Uses the shared `DateTimeInfo` model. */
  lastUpdated: DateTimeInfo;
}

/**
 * @TypeUnion ChallengeTrackerStatus
 * @Description Defines the possible states for a user's challenge participation.
 * - `Not Started`: The user has not yet begun the challenge.
 * - `In Progress`: The user is actively participating in the challenge.
 * - `Completed`: The user has successfully finished all objectives of the challenge.
 * - `Failed`: The user did not successfully complete the challenge (e.g., time limit exceeded, objectives not met).
 */
export type ChallengeTrackerStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Failed';