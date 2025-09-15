/**
 * @file guides.facade.ts
 * @Version 2.0.0 (Progress Persistence)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Facade for the Guides feature. Now includes logic to dispatch the rehydration
 *   action on initialization to load user progress from storage.
 */
import { inject, Injectable, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { GuidesActions } from './guides.actions';
import { selectCurrentGuide, selectError, selectGuideProgress, selectIsLoading, selectSummaries, selectCompletedStepIds } from './guides.feature';

@Injectable({ providedIn: 'root' })
export class GuidesFacade {
  private readonly store = inject(Store);

  // Signals
  readonly summaries = toSignal(this.store.select(selectSummaries), { initialValue: [] });
  readonly currentGuide = toSignal(this.store.select(selectCurrentGuide));
  readonly progress = toSignal(this.store.select(selectGuideProgress));
  readonly isLoading = toSignal(this.store.select(selectIsLoading), { initialValue: true });
  readonly error = toSignal(this.store.select(selectError));
  readonly completedStepsMap = toSignal(this.store.select(selectCompletedStepIds), { initialValue: {} as Record<string, boolean> });

  // Computed Signal for current guide's completion status
  readonly currentGuideCompletionStatus = computed(() => {
    const guide = this.currentGuide();
    const completedMap = this.completedStepsMap();
    
    if (!guide) return {};

    const statusMap: Record<string, boolean> = {};
    for (const step of guide.steps) {
      const key = `${guide.id}_${step.id}`;
      statusMap[step.id] = !!completedMap[key]; 
    }
    return statusMap;
  });

  constructor() {
    this.store.dispatch(GuidesActions.rehydrateProgressRequested());
  }
  
  // Actions
  loadSummaries(): void { this.store.dispatch(GuidesActions.overviewPageOpened()); }
  loadGuide(slug: string): void { this.store.dispatch(GuidesActions.detailPageOpened({ slug })); }
  toggleStepCompletion(stepId: string): void { this.store.dispatch(GuidesActions.toggleStepCompletion({ stepId })); }
  clearCurrentGuide(): void { this.store.dispatch(GuidesActions.clearCurrentGuide()); }
}