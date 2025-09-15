// --- IN: libs/store/user/src/lib/state/user.types.ts ---
// --- VERVANG HET HELE BESTAND OM ZEKER TE ZIJN DAT ALLES KLOPT ---

/**
 * @file user.types.ts
 * @Version 2.2.0 (Corrected with SyncStatus)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description
 *   TypeScript interfaces for the User domain, now including SyncStatus for
 *   optimistic updates on UserAddress entities.
 */
import { Address, ApplicationSettings, SyncStatus, UserProfile } from '@royal-code/shared/domain';

// Hoofd-entiteit voor de state. Dit is de versie die in de NgRx Entity state leeft.
export interface UserAddress extends Address {
  syncStatus?: SyncStatus;
  error?: string | null;
}

// Lokaal error-object voor de state
export interface FeatureError {
  readonly userMessage: string;
  readonly operation?: string;
}

// De ViewModel wordt hier gedefinieerd en geëxporteerd zodat de facade het kan gebruiken.
export interface UserViewModel {
  readonly profile: UserProfile | null;
  readonly settings: ApplicationSettings | null;
  readonly addresses: readonly UserAddress[];
  readonly defaultShippingAddress: UserAddress | undefined;
  readonly defaultBillingAddress: UserAddress | undefined;
  readonly isLoading: boolean;
  readonly error: FeatureError | null;
}
