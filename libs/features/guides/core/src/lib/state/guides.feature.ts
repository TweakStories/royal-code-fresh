import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { Guide, GuideSummary } from '@royal-code/features/guides/domain';
import { StructuredError } from '@royal-code/shared/domain';
import { GuidesActions } from './guides.actions';

export interface GuidesState {
  summaries: GuideSummary[];
  currentGuide: Guide | null;
  completedStepIds: Record<string, boolean>; // { [guideId_stepId]: true }
  isLoading: boolean;
  error: StructuredError | null;
}

export const initialGuidesState: GuidesState = {
  summaries: [],
  currentGuide: null,
  completedStepIds: {},
  isLoading: false,
  error: null,
};

export const guidesFeature = createFeature({
  name: 'guides',
  reducer: createReducer(
    initialGuidesState,
    // Overview
    on(GuidesActions.overviewPageOpened, (state) => ({ ...state, isLoading: true, error: null })),
    on(GuidesActions.loadSummariesSuccess, (state, { summaries }) => ({ ...state, summaries, isLoading: false })),
    on(GuidesActions.loadSummariesFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
    on(GuidesActions.loadGuideFailure, (state, { error }) => ({ ...state, isLoading: false, error })), 
    // Detail
    on(GuidesActions.detailPageOpened, (state) => ({ ...state, isLoading: true, currentGuide: null, error: null })),
    on(GuidesActions.loadGuideSuccess, (state, { guide }) => ({ ...state, currentGuide: guide, isLoading: false })),
    on(GuidesActions.loadGuideFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
    on(GuidesActions.toggleStepCompletion, (state, { stepId }) => {
      const guideId = state.currentGuide?.id;
      if (!guideId) return state;
      const key = `${guideId}_${stepId}`;
      const newCompleted = { ...state.completedStepIds };
      if (newCompleted[key]) {
        delete newCompleted[key];
      } else {
        newCompleted[key] = true;
      }
      return { ...state, completedStepIds: newCompleted };
    }),
    on(GuidesActions.clearCurrentGuide, (state) => ({ ...state, currentGuide: null })),
        on(GuidesActions.rehydrateProgressSuccess, (state, { completedStepIds }) => ({
      ...state,
      completedStepIds: { ...state.completedStepIds, ...completedStepIds }
    }))

  ),
  extraSelectors: ({ selectCurrentGuide, selectCompletedStepIds }) => ({
    selectGuideProgress: createSelector(
      selectCurrentGuide,
      selectCompletedStepIds,
      (guide, completed) => {
        if (!guide || !guide.steps.length) return { percent: 0, completedCount: 0, totalCount: 0 };
        const totalCount = guide.steps.length;
        const completedCount = guide.steps.filter(step => completed[`${guide.id}_${step.id}`]).length;
        return {
          percent: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
          completedCount,
          totalCount,
        };
      }
    )
  })
});

export const {
  name: GUIDES_FEATURE_KEY,
  reducer: guidesReducer,
  selectSummaries,
  selectCurrentGuide,
  selectIsLoading,
  selectError,
  selectCompletedStepIds,
  selectGuideProgress,
} = guidesFeature;