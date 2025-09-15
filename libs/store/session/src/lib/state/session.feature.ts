/**
 * @file session.feature.ts
 * @Description Session NgRx feature configuration.
 */

import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { SessionActions } from './session.actions';
import { SessionState } from './session.types';

const initialState: SessionState = {
  isActive: false,
  sessionId: null,
  expiryTime: null,
};

export const sessionFeature = createFeature({
  name: 'session',
  reducer: createReducer(
    initialState,
    on(SessionActions.startSession, (state, { sessionId, expiryTime }) => ({
      ...state,
      isActive: true,
      sessionId,
      expiryTime,
    })),
    on(SessionActions.endSession, (state) => ({
      ...state,
      isActive: false,
      sessionId: null,
      expiryTime: null,
    }))
  ),
});

export const {
  selectIsActive,
  selectSessionId,
  selectExpiryTime,
} = sessionFeature;