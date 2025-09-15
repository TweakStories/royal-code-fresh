// libs/features/challenges/src/state/challenges.selectors.ts
/**
 * @fileoverview NgRx selectors for the Challenges feature state.
 * @version 1.0.0
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Dictionary } from '@ngrx/entity';
import { Challenge, ChallengeSummary, FilterConfig } from '@royal-code/shared/domain';
import { CHALLENGES_FEATURE_KEY, challengeAdapter, ChallengesState, ChallengesDetailsState, ChallengesSummariesState } from './challenges.state';

// --- Feature State Selectors ---
/** Selects the top-level 'challenges' feature state. */
export const selectChallengesState = createFeatureSelector<ChallengesState>(CHALLENGES_FEATURE_KEY);
/** Selects the `details` state slice. */
export const selectChallengesDetailsState = createSelector(selectChallengesState, (state) => state.details);
/** Selects the `summaries` state slice. */
export const selectChallengesSummariesState = createSelector(selectChallengesState, (state) => state.summaries);

// --- Summary Selectors ---
/** Selects the array of challenge summaries for the current view/page. */
export const selectChallengeSummaries = createSelector(selectChallengesSummariesState, (state) => state.summaries);
/** Selects the loading status for the challenge summary list. */
export const selectChallengeSummariesLoading = createSelector(selectChallengesSummariesState, (state) => state.loadingSummaries);
/** Selects the error message for summary loading. */
export const selectChallengeSummariesError = createSelector(selectChallengesSummariesState, (state) => state.errorSummaries);
/** Selects the current page number for summaries. */
export const selectChallengeSummariesCurrentPage = createSelector(selectChallengesSummariesState, (state) => state.currentPage);
/** Selects the total number of pages for summaries. */
export const selectChallengeSummariesTotalPages = createSelector(selectChallengesSummariesState, (state) => state.totalPages);
/** Selects the total number of summary items available. */
export const selectChallengeSummariesTotalItems = createSelector(selectChallengesSummariesState, (state) => state.totalItems);
/** Selects the page size for the summary list. */
export const selectChallengeSummariesPageSize = createSelector(selectChallengesSummariesState, (state) => state.pageSize);

// --- Filter Config Selectors ---
/** Selects the filter configuration options. */
export const selectChallengeFilterConfig = createSelector(selectChallengesSummariesState, (state) => state.filterConfig);
/** Selects the loading status for the filter configuration. */
export const selectChallengeFilterConfigLoading = createSelector(selectChallengesSummariesState, (state) => state.loadingFilterConfig);
/** Selects the error message for filter config loading. */
export const selectChallengeFilterConfigError = createSelector(selectChallengesSummariesState, (state) => state.errorFilterConfig);

// --- Detail Selectors ---
const { selectEntities: selectChallengeEntitiesInternal } = challengeAdapter.getSelectors(selectChallengesDetailsState);

/** Selects the dictionary map of challenge IDs to full `Challenge` objects. */
export const selectChallengeEntitiesMap = selectChallengeEntitiesInternal;
/** Selects a full challenge by its ID. */
export const selectChallengeById = (challengeId: string | null | undefined) => createSelector(
    selectChallengeEntitiesMap,
    (entities: Dictionary<Challenge>): Challenge | undefined => (challengeId ? entities[challengeId] : undefined)
);
/** Selects the ID of the currently selected challenge. */
export const selectCurrentChallengeId = createSelector(selectChallengesDetailsState, (state) => state.selectedChallengeId);
/** Selects the full details of the currently selected challenge. */
export const selectCurrentChallenge = createSelector(
    selectChallengeEntitiesMap, selectCurrentChallengeId,
    (entities, selectedId): Challenge | undefined => (selectedId ? entities[selectedId] : undefined)
);
/** Selects the loading status for challenge details. */
export const selectChallengeDetailsLoading = createSelector(selectChallengesDetailsState, (state) => state.loadingDetails);
/** Selects the error message for challenge details operations. */
export const selectChallengeDetailsError = createSelector(selectChallengesDetailsState, (state) => state.errorDetails);

// --- Combined Selectors ---
/** Selects true if *any* challenge operation is loading. */
export const selectAnyChallengesLoading = createSelector(
    selectChallengeSummariesLoading, selectChallengeDetailsLoading,
    (loadingSummaries, loadingDetails): boolean => loadingSummaries || loadingDetails
);
/** Selects the first available error message (details prioritized). */
export const selectAnyChallengesError = createSelector(
    selectChallengeDetailsError, selectChallengeSummariesError,
    (detailsError, summariesError): string | null => detailsError ?? summariesError ?? null
);

/** Selects a specific Challenge Summary from the summaries list. */
export const selectChallengeSummaryById = (id: string | null | undefined) => createSelector(
    selectChallengeSummaries,
    (summaries): ChallengeSummary | undefined => (id ? summaries.find(s => s.id === id) : undefined)
);

/** Selects the dictionary map of challenge summaries. */
export const selectChallengeSummariesMap = createSelector(
  selectChallengesSummariesState, // Selects the summaries slice: { summaries: [], loadingSummaries: ..., ... }
  (state): Dictionary<ChallengeSummary> => {
    // Create a dictionary from the summaries array for easy lookup
    return state.summaries.reduce((acc, summary) => {
      acc[summary.id] = summary;
      return acc;
    }, {} as Dictionary<ChallengeSummary>);
  }
);

/** Factory function returning a selector for challenge summaries by an array of IDs. */
export const selectChallengeSummariesByIds = (ids: string[] | undefined | null) => createSelector(
  selectChallengeSummariesMap, // Use the map for efficient lookup
  (entities): ChallengeSummary[] => {
    if (!ids) return [];
    return ids.map(id => entities[id]).filter((summary): summary is ChallengeSummary => !!summary); // Map IDs to summaries and filter out undefined
  }
);
