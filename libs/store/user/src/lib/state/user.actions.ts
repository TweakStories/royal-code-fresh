/**
 * @file user.actions.ts
 * @Version 3.0.0 (Definitive Blueprint)
 * @Description NgRx actions voor de globale User store.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ApplicationSettings, CreateAddressPayload, Profile, UpdateAddressPayload, UpdateSettingsPayload } from '@royal-code/shared/domain';
import {
  UserAddress,
} from './user.types';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    // --- Lifecycle & Context ---
    'Context Initialized': emptyProps(),
    'State Cleared on Logout': emptyProps(),

    // --- Profile Actions ---
    'Load Profile Requested': emptyProps(),
    'Load Profile Success': props<{ profile: Profile }>(),
    'Load Profile Failure': props<{ error: string }>(),

    // --- Settings Actions ---
    'Load Settings Requested': emptyProps(),
    'Load Settings Success': props<{ settings: ApplicationSettings }>(),
    'Load Settings Failure': props<{ error: string }>(),
    'Update Settings Submitted': props<{ payload: UpdateSettingsPayload }>(),
    'Update Settings Success': props<{ settings: ApplicationSettings }>(),
    'Update Settings Failure': props<{ error: string }>(),

    // --- Address Actions ---
    'Load Addresses Requested': emptyProps(),
    'Load Addresses Success': props<{ addresses: UserAddress[] }>(),
    'Load Addresses Not Modified': emptyProps(),
    'Load Addresses Failure': props<{ error:string }>(),
    'Address Version Updated': props<{ version: number }>(),
    'Create Address Submitted': props<{ payload: CreateAddressPayload; tempId: string }>(),
    'Create Address Success': props<{ address: UserAddress; tempId: string }>(),
    'Create Address Failure': props<{ error: string; tempId: string }>(),
    'Update Address Submitted': props<{ id: string; payload: UpdateAddressPayload }>(),
    'Update Address Success': props<{ addressUpdate: Update<UserAddress> }>(),
    'Update Address Failure': props<{ error: string; id: string }>(),
    'Delete Address Submitted': props<{ id: string }>(),
    'Delete Address Success': props<{ id: string }>(),
    'Delete Address Failure': props<{ error: string; id: string; originalAddress: UserAddress | null }>(),
  },
});
