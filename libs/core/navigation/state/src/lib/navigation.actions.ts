// libs/core/state/navigation/navigation.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { NavigationItem } from '@royal-code/shared/domain';

export const NavigationActions = createActionGroup({
  source: 'Navigation',
  events: {
    'Load Navigation': emptyProps(),
    'Load Navigation Success': props<{ navigation: NavigationItem[] }>(),
    'Load Navigation Failure': props<{ error: string }>(),
  },
});
