/**
 * @file social.providors.ts
 * @Version 2.0.0 (Feature-based providers)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description
 *   Provides the NgRx state and effects for the standalone 'Feed' feature.
 *   This is intended to be used when lazy-loading the feed routes.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { FeedEffects } from "./state/feed/feed.effects";
import { feedFeature } from "./state/feed/feed.feature";

export function provideFeedFeature(): EnvironmentProviders {
  console.log("<<<< PROVIDE FEED FEATURE EXECUTED >>>>");
  return makeEnvironmentProviders([
      provideState(feedFeature),
      provideEffects(FeedEffects)
  ]);
}