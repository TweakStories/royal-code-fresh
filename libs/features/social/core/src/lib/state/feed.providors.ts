/**
 * @file feed.providors.ts
 * @Version 2.0.1 (Corrected paths after domain refactor)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @description
 *   Provides the NgRx state and effects for the standalone 'Feed' feature.
 *   This is intended to be used when lazy-loading the feed routes or eager-loading.
 */
import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { FeedEffects } from "./feed/feed.effects"; // Let op: FeedEffects zal nu in 'feed' subfolder staan
import { feedFeature } from "./feed/feed.feature"; // De NgRx Feature definitie

export function provideFeedFeature(): EnvironmentProviders {
  console.log("<<<< PROVIDE FEED FEATURE EXECUTED >>>>");
  return makeEnvironmentProviders([
      provideState(feedFeature),
      provideEffects(FeedEffects)
  ]);
}