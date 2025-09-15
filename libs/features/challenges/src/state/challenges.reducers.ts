// libs/features/challenges/src/state/challenges.reducer.ts
/**
 * @fileoverview Defines the NgRx reducer for the Challenges feature state.
 * @version 1.0.0
 */
import { createReducer, on, Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { challengeAdapter, initialChallengesState, ChallengesState } from './challenges.state'; // Import initialChallengesState
import { ChallengesActions } from './challenges.actions';
import { Challenge, ChallengeSummary } from '@royal-code/shared/domain';

/** Internal reducer function. */
const _challengesReducer = createReducer(
  initialChallengesState, // Use the correct initial state

  // --- Summary Reducers ---
  on(ChallengesActions.loadChallengeSummariesRequested, (state): ChallengesState => ({
    ...state,
    summaries: { ...state.summaries, loadingSummaries: true, errorSummaries: null }
  })),
  on(ChallengesActions.loadChallengeSummariesSuccess, (state, { response, append }): ChallengesState => ({
    ...state,
    summaries: {
      ...state.summaries,
      summaries: append ? [...state.summaries.summaries, ...response.items] : response.items,
      loadingSummaries: false, errorSummaries: null,
      currentPage: response.pageIndex, totalPages: response.totalPages,
      totalItems: response.totalCount, pageSize: response.pageSize,
    }
  })),
  on(ChallengesActions.loadChallengeSummariesFailure, (state, { error }): ChallengesState => ({
    ...state,
    summaries: { ...state.summaries, summaries: [], loadingSummaries: false, errorSummaries: error }
  })),
  on(ChallengesActions.clearSummariesError, (state): ChallengesState => ({
    ...state,
    summaries: { ...state.summaries, errorSummaries: null }
  })),

  // --- Filter Config Reducers ---
   on(ChallengesActions.loadFilterConfigRequested, (state): ChallengesState => ({
    ...state,
    summaries: { ...state.summaries, loadingFilterConfig: true, errorFilterConfig: null }
   })),
   on(ChallengesActions.loadFilterConfigSuccess, (state, { config }): ChallengesState => ({
     ...state,
     summaries: { ...state.summaries, filterConfig: config, loadingFilterConfig: false, errorFilterConfig: null }
   })),
   on(ChallengesActions.loadFilterConfigFailure, (state, { error }): ChallengesState => ({
     ...state,
     summaries: { ...state.summaries, loadingFilterConfig: false, errorFilterConfig: error }
   })),

  // --- Detail Reducers ---
  on(ChallengesActions.loadChallengeDetailsRequested, (state, { id }): ChallengesState => ({
    ...state,
    details: { ...state.details, selectedChallengeId: id, loadingDetails: true, errorDetails: null }
  })),
  on(ChallengesActions.loadChallengeDetailsSuccess, (state, { challenge }): ChallengesState => ({
    ...state,
    details: challengeAdapter.upsertOne(challenge, { ...state.details, loadingDetails: false, errorDetails: null })
  })),
  on(ChallengesActions.loadChallengeDetailsFailure, (state, { error }): ChallengesState => ({
    ...state,
    details: { ...state.details, loadingDetails: false, errorDetails: error }
  })),
  on(ChallengesActions.clearDetailsError, (state): ChallengesState => ({
    ...state,
    details: { ...state.details, errorDetails: null }
  })),
  on(ChallengesActions.selectChallenge, (state, { id }): ChallengesState => ({
    ...state,
    details: { ...state.details, selectedChallengeId: id }
  })),

  // --- CRUD Reducers ---
  on(ChallengesActions.createChallengeRequested, (state): ChallengesState => ({
    ...state, details: { ...state.details, loadingDetails: true, errorDetails: null } // Reuse loading flag?
  })),
  on(ChallengesActions.createChallengeSuccess, (state, { challenge }): ChallengesState => ({
    ...state, details: challengeAdapter.addOne(challenge, { ...state.details, loadingDetails: false })
  })),
  on(ChallengesActions.createChallengeFailure, (state, { error }): ChallengesState => ({
    ...state, details: { ...state.details, loadingDetails: false, errorDetails: error }
  })),

  on(ChallengesActions.updateChallengeRequested, (state): ChallengesState => ({
      ...state, details: { ...state.details, loadingDetails: true, errorDetails: null }
  })),
  on(ChallengesActions.updateChallengeSuccess, (state, { challengeUpdate }): ChallengesState => {
      const updatedDetailsState = challengeAdapter.updateOne(challengeUpdate, { ...state.details, loadingDetails: false, errorDetails: null });
      const updatedSummaries = state.summaries.summaries.map(summary => {
          if (summary.id === challengeUpdate.id) {
              const changes = challengeUpdate.changes as Partial<ChallengeSummary>;
              return { ...summary, /* Update summary fields based on changes */ };
          } return summary;
      });
      return { ...state, details: updatedDetailsState, summaries: { ...state.summaries, summaries: updatedSummaries } };
  }),
  on(ChallengesActions.updateChallengeFailure, (state, { error }): ChallengesState => ({
      ...state, details: { ...state.details, loadingDetails: false, errorDetails: error }
  })),

  on(ChallengesActions.deleteChallengeRequested, (state): ChallengesState => ({
      ...state, details: { ...state.details, loadingDetails: true, errorDetails: null }
  })),
  on(ChallengesActions.deleteChallengeSuccess, (state, { id }): ChallengesState => {
      const updatedDetailsState = challengeAdapter.removeOne(id, { ...state.details, loadingDetails: false, selectedChallengeId: state.details.selectedChallengeId === id ? null : state.details.selectedChallengeId });
      const updatedSummaries = state.summaries.summaries.filter(summary => summary.id !== id);
      const newTotalItems = Math.max(0, state.summaries.totalItems - 1);
      const newTotalPages = Math.ceil(newTotalItems / state.summaries.pageSize);
      return { ...state, details: updatedDetailsState, summaries: { ...state.summaries, summaries: updatedSummaries, totalItems: newTotalItems, totalPages: newTotalPages } };
  }),
  on(ChallengesActions.deleteChallengeFailure, (state, { error }): ChallengesState => ({
      ...state, details: { ...state.details, loadingDetails: false, errorDetails: error }
  }))
);

/** Exported reducer function. */
export function challengesReducer(state: ChallengesState | undefined, action: Action): ChallengesState {
  return _challengesReducer(state, action);
}
