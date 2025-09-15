// libs/features/challenges/src/state/challenges.state.ts
/**
 * @fileoverview Defines the state structure for the Challenges feature.
 * @version 1.0.0
 */
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Challenge, ChallengeSummary, FilterConfig } from '@royal-code/shared/domain';

/** State slice for full Challenge details (normalized). */
export interface ChallengesDetailsState extends EntityState<Challenge> {
  readonly selectedChallengeId: string | null;
  readonly loadingDetails: boolean;
  readonly errorDetails: string | null;
  // Add other detail-specific state if needed (e.g., loadingInteraction)
}

/** Adapter for Challenge entities. */
export const challengeAdapter: EntityAdapter<Challenge> = createEntityAdapter<Challenge>({
  selectId: (challenge: Challenge) => challenge.id,
});

/** Initial state for ChallengesDetailsState. */
export const initialChallengesDetailsState: ChallengesDetailsState = challengeAdapter.getInitialState({
  selectedChallengeId: null,
  loadingDetails: false,
  errorDetails: null,
});

/** State slice for Challenge summaries and list management. */
export interface ChallengesSummariesState {
  readonly summaries: ReadonlyArray<ChallengeSummary>;
  readonly loadingSummaries: boolean;
  readonly errorSummaries: string | null;
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly pageSize: number;
  readonly filterConfig: ReadonlyArray<FilterConfig>;
  readonly loadingFilterConfig: boolean;
  readonly errorFilterConfig: string | null;
}

/** Initial state for ChallengesSummariesState. */
export const initialChallengesSummariesState: ChallengesSummariesState = {
  summaries: [],
  loadingSummaries: false,
  errorSummaries: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  pageSize: 10, // Default page size
  filterConfig: [],
  loadingFilterConfig: false,
  errorFilterConfig: null,
};

/** Root state structure for the 'challenges' feature. */
export interface ChallengesState {
  readonly details: ChallengesDetailsState;
  readonly summaries: ChallengesSummariesState;
}

/** Initial state for the entire ChallengesState. */
export const initialChallengesState: ChallengesState = {
  details: initialChallengesDetailsState,
  summaries: initialChallengesSummariesState,
};

/** Feature key for the Challenges state slice. */
export const CHALLENGES_FEATURE_KEY = 'challenges';
