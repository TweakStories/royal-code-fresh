/**
 * @file media.reducer.ts
 * @Version 1.1.0 (Enterprise Production-Ready)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-27
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-07-27
 * @PromptSummary "Schrijf heel media actions en reducer met de juiste comment strategie uit de readme."
 * @Description
 *   Enterprise-grade NgRx reducer voor het Media domein. Implementeert immutable state
 *   updates, error handling en entity management met het Entity Adapter patroon.
 */
import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Media, Image, MediaType } from '@royal-code/shared/domain';
import { MediaActions } from './media.actions';
import { MediaFilters, FeatureError } from './media.types';

// === CATEGORY: ADAPTER, STATE & DEFAULTS ===

const DEFAULT_MEDIA_FILTERS: Readonly<MediaFilters> = {
  sortBy: 'createdAt',
  sortDirection: 'desc',
  page: 1,
  pageSize: 50,
};

export const mediaAdapter: EntityAdapter<Media> = createEntityAdapter<Media>({
  selectId: (media: Media) => media.id,
  sortComparer: false, // Vertrouw op backend-sortering
});

export interface MediaState extends EntityState<Media> {
  /** Globale laad-indicator voor media-operaties */
  readonly isLoading: boolean;
  /** Indien een create/update/delete operatie bezig is */
  readonly isSubmitting: boolean;
  /** ID van het geselecteerde media-item voor detailweergaves */
  readonly selectedMediaId: string | null;
  /** Actieve filterconfiguratie voor media-queries */
  readonly filters: MediaFilters;
  /** Huidige paginapositie */
  readonly currentPage: number;
  /** Totaal aantal beschikbare media dat overeenkomt met de huidige filters */
  readonly totalCount: number;
  /** Geeft aan of er meer media beschikbaar zijn om te laden */
  readonly hasMore: boolean;
  /** Tijdstempel van de laatste succesvolle data-fetch voor cache-invalidatie */
  readonly lastFetched: number | null;
  /** Duur van de cache-timeout in milliseconden (standaard 5 minuten) */
  readonly cacheTimeout: number;
  /** Huidige error-status met operatie-context */
  readonly error: FeatureError | null;
}

export const initialState: MediaState = mediaAdapter.getInitialState({
  isLoading: false,
  isSubmitting: false,
  selectedMediaId: null,
  filters: { ...DEFAULT_MEDIA_FILTERS },
  currentPage: 1,
  totalCount: 0,
  hasMore: false,
  lastFetched: null,
  cacheTimeout: 300000, // 5 minuten cache-levensduur
  error: null,
});

export const mediaReducer = createReducer(
  initialState,

  // === CATEGORY: PAGE LIFECYCLE & CONTEXT MANAGEMENT ===

  on(MediaActions.pageOpened, (state, { initialFilters }) => ({
    ...initialState,
    filters: { ...initialState.filters, ...initialFilters },
    isLoading: true,
    cacheTimeout: state.cacheTimeout,
  })),

  on(MediaActions.pageClosed, () => initialState),

  on(MediaActions.filtersUpdated, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters, page: 1 },
    currentPage: 1,
    isLoading: true,
    error: null,
  })),

  on(MediaActions.nextPageLoaded, (state) =>
    !state.hasMore || state.isLoading
      ? state
      : { ...state, isLoading: true, error: null, currentPage: state.currentPage + 1 }
  ),

  on(MediaActions.dataRefreshed, (state) => ({
    ...state,
    isLoading: true,
    currentPage: 1,
    filters: { ...state.filters, page: 1 },
    error: null,
  })),

  on(MediaActions.stateReset, () => initialState),


  // === CATEGORY: DATA LOADING API OPERATIONS ===

  on(MediaActions.loadMedia, (state) => ({ ...state, isLoading: true, error: null })),

  on(MediaActions.loadMediaSuccess, (state, { media, totalCount, hasMore }) => {
    const updateFn = state.currentPage === 1 ? mediaAdapter.setAll : mediaAdapter.addMany;
    return updateFn(media, {
      ...state,
      isLoading: false,
      totalCount,
      hasMore,
      lastFetched: Date.now(),
      error: null,
    });
  }),

  on(MediaActions.loadMediaFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(MediaActions.mediaLoadedFromSource, (state, { media }) => {
    return mediaAdapter.upsertMany(media as Media[], state);
  }),


  // === CATEGORY: CRUD OPERATIONS ===
  // --- SUB-GROUP: CREATE ---
  on(MediaActions.createMediaSubmitted, (state, { payload, tempId, file }) =>
    mediaAdapter.addOne({
        id: tempId,
        type: MediaType.IMAGE,
        title: payload.title ?? file.name,
        altText: payload.altText,
        variants: [{ url: URL.createObjectURL(file), purpose: 'preview' }]
    } as Image, {
      ...state,
      isSubmitting: true,
      error: null,
    })
  ),
  on(MediaActions.createMediaSuccess, (state, { media, tempId }) => {
    const stateWithoutTemp = mediaAdapter.removeOne(tempId, state);
    return mediaAdapter.addOne(media, {
      ...stateWithoutTemp,
      isSubmitting: false,
      error: null,
      totalCount: state.totalCount + 1
    });
  }),
  on(MediaActions.createMediaFailure, (state, { error, tempId }) =>
    mediaAdapter.removeOne(tempId, { ...state, isSubmitting: false, error })
  ),

  // --- SUB-GROUP: UPDATE ---
  on(MediaActions.updateMediaSubmitted, (state) => ({ ...state, isSubmitting: true, error: null })),
  on(MediaActions.updateMediaSuccess, (state, { mediaUpdate }) =>
    mediaAdapter.upsertOne(mediaUpdate.changes as Media, {
        ...state,
        isSubmitting: false,
        error: null,
        isLoading: false
    })
  ),
  on(MediaActions.updateMediaFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),

  // --- SUB-GROUP: DELETE ---
  on(MediaActions.deleteMediaConfirmed, (state) => ({ ...state, isSubmitting: true, error: null })),
  on(MediaActions.deleteMediaSuccess, (state, { id }) =>
    mediaAdapter.removeOne(id, {
      ...state,
      isSubmitting: false,
      error: null,
      totalCount: Math.max(0, state.totalCount - 1)
    })
  ),
  on(MediaActions.deleteMediaFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),


  // === CATEGORY: UI STATE MANAGEMENT ===
  on(MediaActions.mediaSelected, (state, { id }) => ({
    ...state,
    selectedMediaId: id,
    isLoading: !!id,
    error: null,
  })),

  on(MediaActions.errorCleared, (state) => ({ ...state, error: null })),
);