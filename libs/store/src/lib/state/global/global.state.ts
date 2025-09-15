// libs/store/src/lib/state/global/global.state.ts
import { RouterReducerState } from '@ngrx/router-store';
import { RouterStateUrl } from '@royal-code/core/routing'; // Zorg ervoor dat deze import correct is
// Importeer GEEN feature state interfaces meer (AuthState, UserState, etc.)

/**
 * Interface for the Root state slices that are ALWAYS present.
 * Feature states (even eager ones like auth, user) are managed separately
 * via provideState and are implicitly part of the overall application state.
 */
export interface RootState { // Hernoemd voor duidelijkheid
  router: RouterReducerState<RouterStateUrl>;
  // Voeg hier ALLEEN andere ECHTE root-level state slices toe, indien van toepassing
}
