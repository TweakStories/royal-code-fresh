// libs/core/state/navigation/navigation.state.ts

import { NavigationItem } from "@royal-code/shared/domain";

export interface NavigationState {
  items: NavigationItem[];
  loading: boolean;
  error: string | null;
}

export const initialNavigationState: NavigationState = {
  items: [],
  loading: false,
  error: null,
};
