/**
 * @file libs/shared/domain/src/lib/challenges/challenge.model.ts
 * @Version 1.1.0
 * @Author ChallengerAppDevAI
 * @Description Defines the data models for Challenges within the application.
 *              This includes summaries for overview displays, full details for
 *              dedicated views, and related enumerations and interfaces for
 *              objectives, difficulty, participants, and more. These models
 *              are designed to be comprehensive and support a rich challenge system.
 */

import { AuditableEntityBase } from "../../base/auditable-entity-base.model";
import { DateTimeInfo } from "../../base/common.model";
import { Equipment } from "../items/equipment.model";
import { Route } from "../locations/route.model";
import { Media, MediaType, Image } from "../media/media.model";
import { PrivacyLevel } from "../privacy.model";
import { Reward } from "../rewards/reward.model";
import { IUserStub } from "../user/user-stub.model";
import { ChallengeTracker } from "./challenge-tracker.model";

// --- Domain Model Imports ---

/**
 * @Interface ChallengeSummary
 * @Description Provides a concise representation of a Challenge, suitable for list views,
 *              map popups, or cards where full detail is not required. It includes key
 *              identifying information, primary image, difficulty, rating, and essential
 *              contextual data like start/end dates and participant counts.
 */
export interface ChallengeSummary extends AuditableEntityBase {
  /** @property {string} id - Unique identifier for the Challenge. */
  id: string;
  /** @property {string} title - The display title of the Challenge. */
  title: string;
  /** @property {string} summary - A brief summary or teaser for the Challenge. */
  summary: string;
  /** @property {Image} mainImageUrl - URL for the primary display image of the Challenge, often used in headers or large previews. */
  mainImageUrl: Image;
  /** @property {Image} coverImageUrl - URL for an alternative or cover image, potentially used in different contexts or layouts. */
  coverImageUrl: Image;
  /** @property {DifficultyLevel} difficultyLevel - The defined difficulty level of the Challenge. See `DifficultyLevel` interface. */
  difficultyLevel: DifficultyLevel;
  /** @property {number} popularity - A numerical score or count indicating the Challenge's popularity or engagement. */
  popularity: number;
  /** @property {number} rating - The average user rating for the Challenge, typically on a 1-5 scale. */
  rating: number;
  /** @property {DateTimeInfo} startDate - The scheduled start date and time for the Challenge. */
  startDate: DateTimeInfo;
  /** @property {DateTimeInfo} endDate - The scheduled end date and time for the Challenge. */
  endDate: DateTimeInfo;
  /** @property {number} maxParticipants - The maximum number of participants allowed. 0 often indicates unlimited. */
  maxParticipants: number;
  /** @property {string} starterNodeId - The ID of the `Node` that serves as the starting point for this Challenge. */
  starterNodeId: string;
  /** @property {string} [type] - Optional: A category or type string for the Challenge (e.g., "Physical", "Exploration"). */
  type?: string;
  /** @property {number} [rewardXP] - Optional: Amount of experience points (XP) awarded upon completion. */
  rewardXP?: number;
  /** @property {boolean} [hasItemReward] - Optional: Flag indicating if completing this Challenge yields one or more item rewards. */
  hasItemReward?: boolean;
  /** @property {Reward[]} rewards - An array detailing all rewards associated with completing this Challenge. */
  rewards: Reward[];
  /** @property {ModeOfCompletion[]} modeOfCompletions - An array specifying the allowed or intended modes of completing this Challenge. */
  modeOfCompletions: ModeOfCompletion[];
  /** @property {string} feedId - Identifier for the social feed associated with this Challenge, for discussions and updates. */
  feedId: string;
  /** @property {number} estimatedDuration - Estimated time (e.g., in seconds or minutes) required to complete the Challenge. */
  estimatedDuration: number;
  /** @property {Equipment[]} equipment - Array of equipment groups recommended or required for this Challenge. */
  equipment: Equipment[];
  /** @property {boolean} isGroupChallenge - Flag indicating if this Challenge is designed for groups or teams. */
  isGroupChallenge: boolean;
  /** @property {Review[]} [reviews] - Optional: Array of user reviews for this Challenge. */
  reviewIds?: string[];
}

/**
 * @Interface Challenge
 * @extends ChallengeSummary
 * @Description Represents the full, detailed data model for a Challenge. It inherits all
 *              properties from `ChallengeSummary` and adds more comprehensive information
 *              such as detailed descriptions, rules, specific objectives, participant lists,
 *              and associated media.
 */
export interface Challenge extends ChallengeSummary {
  /** @property {string} description - The full description of the Challenge, potentially supporting rich text formatting. */
  description: string;
  // Note: startDate and endDate are inherited from ChallengeSummary but are explicitly listed for clarity of their importance.
  // startDate: DateTimeInfo;
  // endDate: DateTimeInfo;
  /** @property {DateTimeInfo} registrationDeadline - The deadline by which participants must register for the Challenge. */
  registrationDeadline: DateTimeInfo;
  /** @property {string} difficultyLevelId - Foreign key or specific ID linking to a `DifficultyLevel` record if normalized. */
  difficultyLevelId: string; // Could be redundant if difficultyLevel object is always embedded.
  /** @property {{ minAge: number; maxAge: number }} ageRestrictions - Defines any age restrictions for participation. */
  ageRestrictions: {
    minAge: number;
    maxAge: number;
  };
  /** @property {number} participantsCount - The current number of registered or active participants. */
  participantsCount: number;
  // maxParticipants is inherited from ChallengeSummary.
  /** @property {string} safetyGuidelines - Specific safety guidelines or warnings for participants. */
  safetyGuidelines: string;
  /** @property {string} termsAndConditions - Any terms and conditions associated with participating in the Challenge. */
  termsAndConditions: string;
  /** @property {boolean} isFeatured - Flag indicating if this Challenge is currently featured or promoted. */
  isFeatured: boolean;
  /** @property {boolean} popular - Redundant if `popularity` score exists; consider which to use. True if challenge is considered popular. */
  popular: boolean; // Consider if this is different from a high `popularity` score.
  /** @property {string} [routeId] - Optional: Identifier of a specific `Route` associated with this Challenge. */
  routeId?: string;
  /** @property {Route} [route] - Optional: The detailed `Route` object itself, if embedded. */
  route?: Route;
  /** @property {ChallengeStatus} status - The current operational status of the Challenge (e.g., Active, Upcoming). */
  status: ChallengeStatus;
  /** @property {PrivacyLevel} privacy - The privacy setting determining who can see or join this Challenge. */
  privacy: PrivacyLevel;
  /** @property {Profile} creator - The profile of the user or entity that created this Challenge. */
  creator: IUserStub;
  /** @property {string[]} [nodeIds] - Optional: An array of `Node` IDs that are part of or relevant to this Challenge. */
  nodeIds?: string[];
  /** @property {FAQ[]} faqs - An array of Frequently Asked Questions and their answers related to this Challenge. */
  faqs: FAQ[];
  // reviews is inherited from ChallengeSummary.
  /** @property {ChallengeTracker[]} trackers - An array of tracking records for users participating in this Challenge. */
  trackers: ChallengeTracker[];
  /** @property {Participant[]} participants - An array detailing the participants of this Challenge. */
  participants: Participant[];
  /** @property {Media[]} mediaGallery - An array of media items (images, videos) curated by the Challenge creator. */
  mediaGallery: Media[];
  /** @property {Media[]} userMediaGallery - An array of media items contributed by Challenge participants. */
  userMediaGallery: Media[];
  /** @property {Rule[]} rules - An array of specific rules applicable to this Challenge. */
  rules: Rule[];
  /** @property {Environment[]} environments - An array specifying the environmental settings or contexts for this Challenge. */
  environments: Environment[];
  /** @property {WeatherCondition[]} weatherConditions - An array detailing expected or relevant weather conditions. */
  weatherConditions: WeatherCondition[];
  /** @property {Hazard[]} hazards - An array listing potential hazards associated with this Challenge. */
  hazards: Hazard[];
  /** @property {ChallengeObjective[]} [objectives] - Optional: An array of specific objectives or tasks to be completed. */
  objectives?: ChallengeObjective[];
}

/**
 * @TypeUnion ChallengeStatus
 * @Description Defines the possible operational statuses of a Challenge.
 * - `Active`: The Challenge is currently ongoing and participants can engage.
 * - `Upcoming`: The Challenge is scheduled but has not started yet.
 * - `Completed`: The Challenge has finished according to its end date or completion criteria.
 * - `Recording`: The Challenge is in a phase where results or data are being recorded/finalized.
 */
export type ChallengeStatus = 'Active' | 'Upcoming' | 'Completed' | 'Recording';

/**
 * @Interface ChallengeObjective
 * @Description Defines a single objective or task within a Challenge. Objectives can have various types,
 *              completion criteria, and optional requirements.
 */
export interface ChallengeObjective {
  /** @property {string} id - Unique identifier for this objective within the context of its parent Challenge. */
  id: string;
  /** @property {string} descriptionKeyOrText - A translatable key or direct text describing the objective. */
  descriptionKeyOrText: string;
  /** @property {number} order - Defines the sequence or display order of this objective relative to others in the Challenge. */
  order: number;
  /** @property {ObjectiveType} type - Specifies the nature and method of completing this objective. See `ObjectiveType`. */
  type: ObjectiveType;
  /** @property {boolean} [isOptional] - Indicates if this objective is optional for Challenge completion. Defaults to false. */
  isOptional?: boolean;
  /** @property {number} [targetProgress] - The target value or count needed to complete this objective (e.g., visit 5 locations, collect 10 items). */
  targetProgress?: number;

  // --- Requirements for Objective ---
  /** @property {{ [statType: string]: number }} [requiredStats] - Optional: Minimum core character stats required to attempt or complete this objective. Key is stat type string (e.g., 'strength'), value is the minimum value. */
  requiredStats?: { [statType: string]: number };
  /** @property {string[]} [requiredSkillIds] - Optional: IDs of specific skills required to attempt or complete this objective. */
  requiredSkillIds?: string[];
  /** @property {number} [requiredLevel] - Optional: Minimum overall user level required to attempt or complete this objective. */
  requiredLevel?: number;

  // --- Data specific to ObjectiveType ---
  /** @property {string} [requiredNodeId] - Optional: The ID of a specific `Node` that must be visited or interacted with (if `type` is `LocationVisit`). */
  requiredNodeId?: string;
  /** @property {MediaType} [requiredMediaType] - Optional: The type of media (e.g., IMAGE, VIDEO) that needs to be uploaded (if `type` is `MediaUpload`). */
  requiredMediaType?: MediaType;
  /** @property {string} [requiredDataMetric] - Optional: An identifier for an external data source or metric that triggers completion (if `type` is `DataTrigger`). */
  requiredDataMetric?: string;
  /** @property {string} [quizId] - Optional: Identifier for an associated quiz or form that must be completed (if `type` is `Quiz`). */
  quizId?: string;
  /** @property {any} [validationDetails] - Optional: Placeholder for more complex or custom validation logic or parameters. */
  validationDetails?: any;
}

/**
 * @Enum ObjectiveType
 * @Description Specifies the different mechanisms by which a Challenge objective can be completed.
 * - `ManualCheck`: Requires manual verification or input by a user or moderator.
 * - `LocationVisit`: Requires the participant to physically visit a specified `Node` or geographic location.
 * - `MediaUpload`: Requires the participant to upload a media file (e.g., photo, video) as proof of completion.
 * - `DataTrigger`: Completion is triggered automatically based on data from an external system or game event.
 * - `Quiz`: Requires the participant to successfully complete an associated quiz or form.
 */
export enum ObjectiveType {
  ManualCheck = 'manualCheck',
  LocationVisit = 'locationVisit',
  MediaUpload = 'mediaUpload',
  DataTrigger = 'dataTrigger',
  Quiz = 'quiz',
}

/**
 * @Enum ObjectiveStatus
 * @Description Represents the current completion status of a specific Challenge objective for a user.
 *              This is typically part of the `ChallengeTracker` data.
 */
export enum ObjectiveStatus {
  /** The objective has not yet been started or addressed by the participant. */
  Pending = 'pending',
  /** The participant is actively working on this objective. Relevant for objectives with trackable progress. */
  InProgress = 'inProgress',
  /** The objective has been successfully completed by the participant. */
  Completed = 'completed',
  /** The participant has chosen to skip this objective (if it was marked as optional). */
  Skipped = 'skipped',
  /** The participant failed to complete this objective, if failure is a possible outcome for the objective type. */
  Failed = 'failed',
}

/**
 * @Interface Participant
 * @Description Represents a user participating in a Challenge, including their progress and relevant stats.
 */
export interface Participant {
  /** @property {string} userId - The unique identifier of the participating user. */
  userId: string;
  /** @property {string} userName - The display name of the participant. */
  userName: string;
  /** @property {string} profileImageUrl - URL to the participant's profile image. */
  profileImageUrl: string;
  /** @property {number} progressPercentage - The participant's overall progress in the Challenge (0-100). */
  progressPercentage: number;
  /** @property {number} experiencePoints - Experience points earned by the participant within this Challenge. */
  experiencePoints: number;
  /** @property {number} level - The participant's level at the time of this record or relevant to this Challenge. */
  level: number;
}

/**
 * @Interface Template
 * @Description (Future Use) Represents a predefined template for creating new Challenges,
 *              allowing for standardized layouts and customizable components.
 */
export interface Template {
  /** @property {string} templateId - Unique identifier for the Challenge template. */
  templateId: string;
  /** @property {string} name - The name of the template. */
  name: string;
  /** @property {string} description - A description of what the template is for or includes. */
  description: string;
  /** @property {string[]} applicableChallengeTypes - Array of Challenge types this template is suitable for. */
  applicableChallengeTypes: string[];
  /** @property {string} defaultLayout - Reference to a default layout configuration or name. */
  defaultLayout: string;
  /** @property {string[]} customizableComponents - List of UI components or sections that are customizable when using this template. */
  customizableComponents: string[];
}

/**
 * @Interface DifficultyLevel
 * @Description Defines a level of difficulty for a Challenge, including descriptive text and
 *              qualitative assessments of physical and mental requirements, time commitment,
 *              and potential rewards.
 */
export interface DifficultyLevel {
  /** @property {string} id - Unique identifier for this difficulty level. */
  id: string;
  /** @property {'novice' | 'beginner' | ...} level - The standardized difficulty name. */
  level: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  /** @property {string} [description] - Optional: A textual description of this difficulty level. */
  description?: string;
  /** @property {object} [physicalRequirements] - Optional: Qualitative assessment of physical demands. */
  physicalRequirements?: {
    stamina: 'very low' | 'low' | 'moderate' | 'high' | 'extreme';
    strength: 'minimal' | 'basic' | 'enhanced' | 'maximum';
    skill: 'introductory' | 'intermediate' | 'advanced' | 'expert';
  };
  /** @property {object} [mentalRequirements] - Optional: Qualitative assessment of mental demands. */
  mentalRequirements?: {
    focus: 'minimal' | 'basic' | 'enhanced' | 'maximum';
    determination: 'minimal' | 'basic' | 'enhanced' | 'maximum';
    problemSolving: 'none' | 'basic' | 'intermediate' | 'advanced';
  };
  /** @property {object} [timeCommitment] - Optional: Estimated time commitment. */
  timeCommitment?: {
    daily: string; // e.g., "15-30 minutes"
    weekly: string; // e.g., "2-4 hours"
  };
  /** @property {string[]} [recommendedPreparation] - Optional: List of recommended preparations. */
  recommendedPreparation?: string[];
  /** @property {string[]} [rewards] - Optional: General description of typical rewards for this difficulty. Specific rewards are in `Challenge.rewards`. */
  rewards?: string[]; // Textual description of typical rewards, not the actual Reward[] objects.
}

/**
 * @Interface ModeOfCompletion
 * @Description Specifies a method or category of activities through which a Challenge can be completed.
 */
export interface ModeOfCompletion {
  /** @property {string} id - Unique identifier for this mode of completion. */
  id: string;
  /** @property {string} category - The broad category of the mode (e.g., "Terrestrial", "Creative"). */
  category: string;
  /** @property {string[]} activities - Specific activities that fall under this mode (e.g., "Running", "Photography"). */
  activities: string[];
  /** @property {string} [iconName] - Optional: Name of an icon (e.g., from `AppIcon` enum or a Lucide string) representing this mode. */
  iconName?: string; // Consider using AppIcon type if strictly mapped
}

/**
 * @Interface Environment
 * @Description Defines the type of environment in which a Challenge takes place or is relevant.
 */
export interface Environment {
  /** @property {string} id - Unique identifier for this environment type. */
  id: string;
  /** @property {string} category - The main category of the environment (e.g., "Urban", "Wilderness"). */
  category: string;
  /** @property {string[]} [subcategories] - Optional: More specific subcategories (e.g., "Downtown" for "Urban"). */
  subcategories?: string[];
  /** @property {string} [iconName] - Optional: Name of an icon representing this environment. */
  iconName?: string; // Consider using AppIcon type
}

/**
 * @Interface WeatherCondition
 * @Description Represents a specific weather condition relevant to a Challenge.
 */
export interface WeatherCondition {
  /** @property {string} id - Unique identifier for this weather condition. */
  id: string;
  /** @property {string} name - The name of the weather condition (e.g., "Sunny", "Light Rain"). */
  name: string;
  /** @property {string} [iconName] - Optional: Name of an icon representing this weather condition. */
  iconName?: string; // Consider using AppIcon type
}

/**
 * @Interface Hazard
 * @Description Defines a potential hazard or risk associated with a Challenge.
 */
export interface Hazard {
  /** @property {string} id - Unique identifier for this hazard. */
  id: string;
  /** @property {string} name - The name of the hazard (e.g., "Slippery Surfaces", "Heavy Traffic"). */
  name: string;
  /** @property {string} [description] - Optional: A more detailed description of the hazard and mitigation advice. */
  description?: string;
  /** @property {string} [iconName] - Optional: Name of an icon representing this hazard. */
  iconName?: string; // Consider using AppIcon type
}

/**
 * @Interface Rule
 * @Description Defines a specific rule or guideline applicable to a Challenge.
 */
export interface Rule {
  /** @property {string} id - Unique identifier for this rule. */
  id: string;
  /** @property {string} name - A concise name or summary of the rule. */
  name: string;
  /** @property {string} [description] - Optional: A detailed explanation of the rule. */
  description?: string;
}

/**
 * @Interface FAQ
 * @Description Represents a Frequently Asked Question and its answer related to a Challenge.
 */
export interface FAQ {
  /** @property {string} id - Unique identifier for this FAQ entry. */
  id: string;
  /** @property {string} question - The question being asked. */
  question: string;
  /** @property {string} answer - The answer to the question. */
  answer: string;
}
