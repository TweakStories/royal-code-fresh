// libs/store/src/lib/state/global/root.reducer.ts
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';
import { RootState } from './global.state'; // Gebruik nieuwe naam RootState

// Bevat ALLEEN de root reducers
export const rootReducers: ActionReducerMap<RootState> = { // Gebruik RootState
  router: routerReducer,
  // Geen authReducer, userReducer, etc. hier
};
