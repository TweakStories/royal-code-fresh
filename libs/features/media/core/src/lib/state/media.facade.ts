/**
 * @file media.facade.ts
 * @Version 2.2.0 (Cleaned Comments & Grouping - Fixed Initial ViewModel)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-21
 * @Description
 *   Enterprise-grade facade providing a comprehensive, public-facing API for Media
 *   state management. Implements a hybrid architectural pattern supporting both
 *   traditional Observable-based APIs and modern Signal-based APIs. This version
 *   corrects the `createInitialViewModel` to avoid reliance on an external `initialState`.
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MediaFilters, UpdateMediaPayload } from '@royal-code/features/media/domain';
import { MediaActions } from './media.actions';
import { selectIsLoading, selectIsSubmitting, selectError, selectAllMedia, selectSelectedMedia, selectMediaListViewModel, selectHasMedia, selectIsBusy } from './media.feature';
import { CreateMediaPayload, FeatureError, MediaListViewModel } from './media.types';
import { Media } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class MediaFacade {
  private readonly store = inject(Store);

  // === PRIMARY API: VIEWMODEL ===
  public readonly viewModel$: Observable<MediaListViewModel> = this.store.select(selectMediaListViewModel);
  public readonly viewModel: Signal<MediaListViewModel> = toSignal(this.viewModel$, {
    initialValue: this.createInitialViewModel(),
  });

  // === GRANULAR STATE ACCESSORS: SIGNALS ===
  public readonly isLoading: Signal<boolean> = this.store.selectSignal(selectIsLoading);
  public readonly isSubmitting: Signal<boolean> = this.store.selectSignal(selectIsSubmitting);
  public readonly error: Signal<FeatureError | null> = this.store.selectSignal(selectError);
  public readonly allMedia: Signal<readonly Media[]> = this.store.selectSignal(selectAllMedia);
  public readonly selectedMedia: Signal<Media | undefined> = this.store.selectSignal(selectSelectedMedia);
  public readonly hasMedia: Signal<boolean> = this.store.selectSignal(selectHasMedia);
  public readonly hasError: Signal<boolean> = computed(() => this.error() !== null);
  public readonly isBusy: Signal<boolean> = this.store.selectSignal(selectIsBusy);

  // === GRANULAR STATE ACCESSORS: OBSERVABLES ===
  public readonly isLoading$: Observable<boolean> = this.store.select(selectIsLoading);
  public readonly isSubmitting$: Observable<boolean> = this.store.select(selectIsSubmitting);
  public readonly error$: Observable<FeatureError | null> = this.store.select(selectError);
  public readonly allMedia$: Observable<readonly Media[]> = this.store.select(selectAllMedia);
  public readonly selectedMedia$: Observable<Media | undefined> = this.store.select(selectSelectedMedia);

  // === ACTION DISPATCHERS ===

  openPage(options?: { forceRefresh?: boolean; initialFilters?: Partial<MediaFilters> }): void {
    this.store.dispatch(MediaActions.pageOpened({ ...options }));
  }

  closePage(): void {
    this.store.dispatch(MediaActions.pageClosed());
  }

  updateFilters(filters: Partial<MediaFilters>): void {
    this.store.dispatch(MediaActions.filtersUpdated({ filters }));
  }

  loadNextPage(): void {
    this.store.dispatch(MediaActions.nextPageLoaded());
  }

  refreshData(): void {
    this.store.dispatch(MediaActions.dataRefreshed());
  }

  createMedia(payload: CreateMediaPayload, file: File): string {
    // Generate temporary ID for optimistic updates
    const tempId = `temp_media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.store.dispatch(MediaActions.createMediaSubmitted({ payload, file, tempId }));
    return tempId;
  }

  updateMedia(id: string, payload: UpdateMediaPayload): void {
    this.store.dispatch(MediaActions.updateMediaSubmitted({ id, payload }));
  }

  deleteMedia(id: string): void {
    this.store.dispatch(MediaActions.deleteMediaConfirmed({ id }));
  }

  selectMedia(id: string | null): void {
    this.store.dispatch(MediaActions.mediaSelected({ id }));
  }

  clearError(): void {
    this.store.dispatch(MediaActions.errorCleared());
  }

  // === PRIVATE UTILITIES ===
  private createInitialViewModel(): MediaListViewModel {
    return {
      media: [],
      selectedMedia: undefined,
      isLoading: true,
      isSubmitting: false,
      error: null,
      filters: { pageSize: 50, page: 1, sortBy: 'createdAt', sortDirection: 'desc' },
      totalCount: 0,
      hasMore: false,
      currentPage: 1, // Hardcoded initiële waarde
      pageSize: 50,    // Hardcoded initiële waarde
      loadedCount: 0,
      lastFetched: null,
      isStale: true,
      hasMedia: false,
      isEmpty: true,
      isBusy: true,
    };
  }
}