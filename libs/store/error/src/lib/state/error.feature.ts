/**
 * @file error.feature.ts
 * @Version 4.0.0 (Simplified Reducer Logic)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-28
 * @description
 *   Definitive NgRx feature for global Error state. This version simplifies
 *   the reducer to work with the direct StructuredError payload.
 */
import { createFeature, createSelector, createReducer, on } from '@ngrx/store';
import { ErrorActions } from './error.actions';
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { StructuredError } from '@royal-code/shared/domain';

export interface AppError extends StructuredError {
  readonly id: string;
  readonly createdAt: DateTimeInfo;
}

export interface State {
  readonly currentError: AppError | null;
  readonly errorHistory: readonly AppError[];
}

export const initialErrorState: State = {
  currentError: null,
  errorHistory: [],
};

export const errorFeature = createFeature({
  name: 'error',
  reducer: createReducer(
    initialErrorState,
    on(ErrorActions.reportError, (state, { error }): State => { // 'error' is nu direct de StructuredError
      const now = new Date();
      const newError: AppError = {
        ...error, // De payload is de StructuredError zelf
        id: `err-${Date.now()}`,
        createdAt: { iso: now.toISOString(), timestamp: now.getTime() },
      };
      return { ...state, currentError: newError, errorHistory: [newError, ...state.errorHistory].slice(0, 20) };
    }),
    on(ErrorActions.clearCurrentError, (state): State => ({ ...state, currentError: null })),
    on(ErrorActions.clearErrorHistory, (state): State => ({ ...state, errorHistory: [] }))
  ),

  extraSelectors: ({ selectCurrentError }) => ({
    selectHasActiveError: createSelector(
      selectCurrentError,
      (currentError) => currentError !== null
    ),
  })
});

export const {
  name: ERROR_FEATURE_KEY,
  reducer: errorReducer,
  selectCurrentError,
  selectErrorHistory,
  selectErrorState,
  selectHasActiveError,
} = errorFeature;