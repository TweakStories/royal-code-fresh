// libs/features/social/src/lib/state/socials.effects.ts
/**
 * @fileoverview Defines the root effects for the 'Social' feature.
 *              This file typically just exports an array containing the effect classes
 *              from its sub-features (e.g., FeedEffects, ChatEffects).
 * @version 1.0.0
 * @author ChallengerAppDevAI
 */
import { Injectable } from '@angular/core'; // Actions is hier niet per se nodig
import { FeedEffects } from './feed/feed.effects';
// Importeer hier eventuele andere sub-feature effects

/**
 * @const SocialEffects
 * @description An array containing all effect classes for the Social feature.
 *              This array is provided to `provideEffects` when registering the feature.
 */
export const SocialEffects = [
  FeedEffects,
  // OtherSocialSubFeatureEffects,
];

// Als je SocialsEffects class zelf ook nog root-level effects heeft:
/*
@Injectable()
export class RootSocialEffects {
  constructor(private actions$: Actions) {}
  // Define root-level social effects here if any
}
export const SocialEffects = [RootSocialEffects, FeedEffects, ChatEffects];
*/
