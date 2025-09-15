export interface ChallengeFilters {
  pageNumber?: number;
  pageSize?: number;
  nearMe?: boolean;
  popular?: boolean;
  newest?: boolean;
  difficultyLevelIds?: string[];
  modeOfCompletionIds?: string[];
  startDateFrom?: string;
  startDateTo?: string;
  maxParticipants?: number;
  tags?: string[];
  creatorUserId?: string;
  privacy?: 'Public' | 'Private';
  sortBy?: string;
  title?: string; // Added this
}
