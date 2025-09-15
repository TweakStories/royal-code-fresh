// libs/features/challenges/src/state/challenges.actions.ts
/**
 * @fileoverview Defines NgRx actions for the Challenges feature.
 * @version 1.0.0
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { Challenge, ChallengeSummary, FilterConfig } from '@royal-code/shared/domain';
import { PaginatedList } from '@royal-code/shared/utils';
import { ChallengeFilters } from '../models/challenge-filter.model';

/** Error payload structure for challenge actions. */
export type ChallengeErrorPayload = { readonly error: string };

/** Actions related to managing Challenge state. */
export const ChallengesActions = createActionGroup({
  source: 'Challenges API/UI',
  events: {
    // Summary List Actions
    'Load Challenge Summaries Requested': props<{ filters?: ChallengeFilters; append?: boolean }>(),
    'Load Challenge Summaries Success': props<{ response: PaginatedList<ChallengeSummary>; append?: boolean }>(),
    'Load Challenge Summaries Failure': props<ChallengeErrorPayload>(),
    'Clear Summaries Error': emptyProps(),

    // Detail Actions
    'Load Challenge Details Requested': props<{ id: string }>(),
    'Load Challenge Details Success': props<{ challenge: Challenge }>(),
    'Load Challenge Details Failure': props<ChallengeErrorPayload & { readonly challengeId: string }>(),
    'Clear Details Error': emptyProps(),
    'Select Challenge': props<{ id: string | null }>(),

    // Filter Config Actions
    'Load Filter Config Requested': emptyProps(),
    'Load Filter Config Success': props<{ config: ReadonlyArray<FilterConfig> }>(),
    'Load Filter Config Failure': props<ChallengeErrorPayload>(),

    // CRUD Actions
    'Create Challenge Requested': props<{ challenge: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'> }>(),
    'Create Challenge Success': props<{ challenge: Challenge }>(),
    'Create Challenge Failure': props<ChallengeErrorPayload>(),

    'Update Challenge Requested': props<{ challengeUpdate: Update<Challenge> }>(),
    'Update Challenge Success': props<{ challengeUpdate: Update<Challenge> }>(),
    'Update Challenge Failure': props<ChallengeErrorPayload & { readonly challengeId: string }>(),

    'Delete Challenge Requested': props<{ id: string }>(),
    'Delete Challenge Success': props<{ id: string }>(),
    'Delete Challenge Failure': props<ChallengeErrorPayload & { readonly challengeId: string }>(),
  }
});
