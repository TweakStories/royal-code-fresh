// libs/shared/domain/src/lib/nodes/nodes.model.ts
/**
 * @fileoverview Defines the data models related to Nodes within the application domain.
 *               Includes base definitions, summaries for overview displays (like maps),
 *               and full details for dedicated views or interactions. Also includes
 *               relevant enums for Node types and statuses.
 * @version 2.1.0 - Added optional challenge preview fields to NodeSummary.
 */
import { Coordinates, Locations } from '../locations/location.model';
import { Media } from '../media/media.model';

// --- Enums ---

/**
 * @enum NodeType
 * @description Defines the functional purpose of a Node within the application world.
 *              Corresponds to Feature 3.2.6.
 */
export enum NodeType {
  START = 'start',                     // Challenge Start Point
  END = 'end',                       // Challenge End Point
  CHECKPOINT = 'checkpoint',           // Challenge Waypoint
  LEADERBOARD = 'leaderboard',       // Node displaying leaderboards
  SHOP = 'shop',                     // In-game vendor
  QUEST = 'quest',                   // Quest giver or objective location
  POI = 'poi',                       // Point of Interest (lore, view, etc.)
  DISCOVERY = 'discovery',           // Hidden/rewarding exploration node
  WAYPOINT = 'waypoint',             // Fast travel point
  RESOURCE = 'resource',             // Resource gathering location
  VENDOR = 'vendor',                 // System-driven shop (alias for SHOP?)
  TRADING_POST = 'trading_post',     // Player-to-player trading hub
  COMMUNITY_HUB = 'community_hub',   // Social meeting spot
  GUILD_HALL = 'guild_hall',         // Guild-specific location
  TERRITORY_CONTROL = 'territory_control', // Strategic point for guilds
  WATCHTOWER = 'watchtower',         // Defensive/visibility node
  ARENA = 'arena',                   // Formal PvP location
  EVENT_SPAWN = 'event_spawn',       // Location for temporary events
  SANCTUARY = 'sanctuary',           // Safe zone
  HAZARD = 'hazard',                 // Environmental effect zone
  // Add other types as needed
  UNKNOWN = 'unknown',                // Fallback type
  FINISH = 'finish',                 // Challenge Finish Point

}

/**
 * @enum NodeStatus
 * @description Represents the current state and accessibility of a Node for the user or system.
 *              Corresponds to Feature 3.2.9.
 */
export enum NodeStatus {
  LOCKED = 'locked',                 // Not accessible or requires prerequisite
  VISIBLE = 'visible',               // Can be seen on map, basic info available
  UNLOCKED = 'unlocked',             // Interaction possible (synonym for VISIBLE?)
  ACTIVE = 'active',                 // Currently part of an active challenge/quest for the user
  COMPLETED = 'completed',           // Interaction finished for the user/session/objective
  DEPLETED = 'depleted',             // Resource node temporarily unavailable
  CONTESTED = 'contested',           // Territory node under attack
  HIDDEN = 'hidden',                 // Not normally visible, requires discovery
  ARCHIVED = 'archived',             // No longer in active use
  SKIPPED = 'skipped',               // User skipped the node
  VISITED = 'visited',               // User visited the node
  FINISH = 'finish',             // User finished the node
  // Add other statuses as needed
}

// --- Interfaces ---

/**
 * @interface NodeBase
 * @description Contains the common core properties shared by all Node representations (Summary and Full).
 */
export interface NodeBase {
  readonly id: string;
  readonly title: string;
  readonly type: NodeType;
  readonly status: NodeStatus;
  readonly location: Locations;
  readonly popularity: number;
}

/**
 * @interface NodeSummary
 * @extends NodeBase
 * @description A lightweight representation of a Node, suitable for lists or map overviews.
 *              Includes essential identification, location, type, status, and potentially
 *              a minimal preview of a linked Challenge if applicable.
 */
export interface NodeSummary extends NodeBase {
  readonly location: { readonly coordinates: Coordinates; readonly address?: string; };
  readonly challengeId?: string | null;
}

/**
 * @interface NodeFull
 * @extends NodeBase
 * @description The complete data representation of a Node, containing all details
 *              needed for detail views, interactions, or complex logic.
 */
export interface NodeFull extends NodeBase {
  readonly description?: string;
  readonly challengeId?: string | null; // <-- Ook hier
  readonly mediaGallery?: ReadonlyArray<Media>;
  readonly socialFeedId?: string | null;
  readonly properties?: Record<string, any>;
}

