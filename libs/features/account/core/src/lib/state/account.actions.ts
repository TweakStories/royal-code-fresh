import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ChangePasswordPayload, DeleteAccountPayload, StructuredError, UpdateUserAvatarPayload, UpdateUserProfilePayload, UserProfileDetails } from '@royal-code/shared/domain';

export const AccountActions = createActionGroup({
  source: 'Account',
  events: {
    // Page Lifecycle
    'My Profile Page Opened': emptyProps(),

    // Load Profile
    'Load Profile Details': emptyProps(),
    'Load Profile Details Success': props<{ profile: UserProfileDetails }>(),
    'Load Profile Details Failure': props<{ error: StructuredError }>(),

    // Update Profile
    'Update Profile Submitted': props<{ payload: UpdateUserProfilePayload }>(),
    'Update Profile Success': props<{ profile: UserProfileDetails }>(),
    'Update Profile Failure': props<{ error: StructuredError }>(),
    
    // Update Avatar
    'Update Avatar Submitted': props<{ payload: UpdateUserAvatarPayload }>(),
    'Update Avatar Success': props<{ updatedProfile: UserProfileDetails }>(),
    'Update Avatar Failure': props<{ error: StructuredError }>(),

        // Change Password
    'Change Password Submitted': props<{ payload: ChangePasswordPayload }>(),
    'Change Password Success': emptyProps(),
    'Change Password Failure': props<{ error: StructuredError }>(),

    // Delete Account
    'Delete Account Submitted': props<{ payload: DeleteAccountPayload }>(),
    'Delete Account Success': emptyProps(),
    'Delete Account Failure': props<{ error: StructuredError }>(),

  },
});