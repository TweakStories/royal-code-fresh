/**
 * @file guides.effects.ts
 * @Version 2.1.0 (Progress Enrichment on Load)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   NgRx effects for the Guides feature. `loadSummaries$` now enriches
 *   guide summaries with user progress from storage before updating the state.
 */
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { GuidesActions } from './guides.actions';
import { AbstractGuidesApiService } from '../data-access/abstract-guides-api.service';
import { StructuredError } from '@royal-code/shared/domain';
import { StorageService } from '@royal-code/core/storage';
import { selectCompletedStepIds } from './guides.feature';
import { GuideSummary } from '@royal-code/features/guides/domain';

const GUIDE_PROGRESS_STORAGE_KEY = 'droneshopApp_guideProgress';

@Injectable()
export class GuidesEffects {
  private actions$ = inject(Actions);
  private guidesApiService = inject(AbstractGuidesApiService);
  private storageService = inject(StorageService);
  private store = inject(Store);

  loadSummaries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GuidesActions.overviewPageOpened),
      switchMap(() => this.guidesApiService.getGuideSummaries().pipe(
        map((summaries) => {
          const completedIds = this.storageService.getItem<Record<string, boolean>>(GUIDE_PROGRESS_STORAGE_KEY) ?? {};
          const enrichedSummaries = summaries.map(summary => {
            const completedStepsForGuide = Object.keys(completedIds).filter(key => key.startsWith(`${summary.id}_`)).length;
            const progressPercent = summary.totalSteps > 0
              ? (completedStepsForGuide / summary.totalSteps) * 100
              : 0;
            return { ...summary, userProgressPercent: progressPercent };
          });
          return GuidesActions.loadSummariesSuccess({ summaries: enrichedSummaries });
        }),
        catchError((err) => of(this.createErrorAction('GUIDES_LOAD_FAILURE', 'Failed to load summaries.')))
      ))
    )
  );

  loadGuideDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GuidesActions.detailPageOpened),
      switchMap(({ slug }) => this.guidesApiService.getGuideBySlug(slug).pipe(
        map((guide) => {
          if (guide) { return GuidesActions.loadGuideSuccess({ guide }); }
          return GuidesActions.loadGuideFailure({ error: { message: `Guide with slug '${slug}' not found.`, code: 'GUIDE_NOT_FOUND', timestamp: Date.now(), severity: 'warning', source: '[GuidesEffects]' } });
        }),
        catchError((err) => of(GuidesActions.loadGuideFailure({ error: { message: 'Failed to load guide details.', code: 'GUIDE_DETAIL_LOAD_FAILURE', timestamp: Date.now(), severity: 'error', source: '[GuidesEffects]', context: { originalError: err.message || err.toString() } } })))
      ))
    )
  );

  persistProgress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GuidesActions.toggleStepCompletion),
      withLatestFrom(this.store.select(selectCompletedStepIds)),
      tap(([, completedIds]) => {
        this.storageService.setItem(GUIDE_PROGRESS_STORAGE_KEY, completedIds);
      })
    ),
    { dispatch: false }
  );

  rehydrateProgress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GuidesActions.rehydrateProgressRequested),
      switchMap(() => {
        const completedStepIds = this.storageService.getItem<Record<string, boolean>>(GUIDE_PROGRESS_STORAGE_KEY);
        return completedStepIds ? of(GuidesActions.rehydrateProgressSuccess({ completedStepIds })) : of();
      })
    )
  );

  private createErrorAction(code: string, message: string) {
    const error: StructuredError = { message, code, timestamp: Date.now(), severity: 'error', source: '[GuidesEffects]' };
    return GuidesActions.loadSummariesFailure({ error });
  }
}