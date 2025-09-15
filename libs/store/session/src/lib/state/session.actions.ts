/**
 * @file session.actions.ts
 * @Description Session store actions.
 */

import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const SessionActions = createActionGroup({
  source: 'Session',
  events: {
    'Start Session': props<{ sessionId: string; expiryTime: Date }>(),
    'End Session': emptyProps(),
    'Check Session': emptyProps(),
  },
});