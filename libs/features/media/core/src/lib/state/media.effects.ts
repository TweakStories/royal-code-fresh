// --- IN libs/features/media/core/src/lib/state/media.effects.ts, VERVANG HET VOLLEDIGE BESTAND ---
/**
 * @file media.effects.ts
 * @version 1.0.0 (Enterprise Production-Ready)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-19
 * @description
 *   Enterprise-grade NgRx effects for the Media domain.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-19
 * @PromptSummary Replicating the products feature structure for a new media feature, following all established architectural rules and providing generated code.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, catchError, withLatestFrom, filter, concatMap, tap, exhaustMap } from 'rxjs/operators'; // <-- exhaustMap toegevoegd
import { Update } from '@ngrx/entity';
import { Media, Image } from '@royal-code/shared/domain';
import { NotificationService } from '@royal-code/ui/notifications';
import { LoggerService } from '@royal-code/core/core-logging';
import { MediaActions } from './media.actions';
import { selectIsStale, selectMediaState } from './media.feature';
import { AbstractMediaApiService } from '../data-access/abstract-media-api.service';
import { MediaMappingService } from '../mappers/media-mapping.service';
import { FeatureError, CreateMediaPayload } from './media.types'; // <-- CreateMediaPayload toegevoegd

function isPageOpenedAction(action: Action): action is ReturnType<typeof MediaActions.pageOpened> {
    return action.type === MediaActions.pageOpened.type;
}

@Injectable()
export class MediaEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly mediaApiService = inject(AbstractMediaApiService);
  private readonly mappingService = inject(MediaMappingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly logPrefix = '[MediaEffects]';

  triggerLoad$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MediaActions.pageOpened, MediaActions.filtersUpdated, MediaActions.dataRefreshed),
      withLatestFrom(this.store.select(selectIsStale)),
      filter(([action, isStale]) => isPageOpenedAction(action) ? (action.forceRefresh || isStale) : isStale),
      map(() => MediaActions.loadMedia())
    )
  );

  loadMedia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MediaActions.loadMedia, MediaActions.nextPageLoaded),
      withLatestFrom(this.store.select(selectMediaState)),
      switchMap(([action, state]) => {
        const { filters, currentPage } = state;
        return this.mediaApiService.getMedia(filters, currentPage, filters.pageSize).pipe(
          map(dto => {
            const response = this.mappingService.mapMediaListResponse(dto);
            this.logger.info(`${this.logPrefix} Successfully loaded ${response.items.length} media items.`);
            return MediaActions.loadMediaSuccess({
              media: response.items,
              totalCount: response.totalCount,
              hasMore: response.hasNextPage,
            });
          }),
          catchError(error => {
            this.logger.error(`${this.logPrefix} Failed to load media`, error);
            return of(MediaActions.loadMediaFailure({
              error: { message: 'Failed to load media.', operation: 'loadMedia' }
            }));
          })
        );
      })
    )
  );

  loadSelectedMedia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MediaActions.mediaSelected),
      filter(action => !!action.id),
      switchMap(({ id }) =>
        this.mediaApiService.getMediaById(id!).pipe(
          map(dto => {
            const mediaItem = this.mappingService.mapMedia(dto);
            const mediaUpdate: Update<Media> = { id: mediaItem.id, changes: mediaItem };
            return MediaActions.updateMediaSuccess({ mediaUpdate });
          }),
          catchError(error => {
            this.logger.error(`${this.logPrefix} Failed to load media details for ${id}`, error);
            const featureError: FeatureError = { message: `Failed to load details for media ${id}.`, operation: 'getMediaById' };
            return of(MediaActions.loadMediaFailure({ error: featureError }));
          })
        )
      )
    )
  );

  loadNextPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MediaActions.nextPageLoaded),
      withLatestFrom(this.store.select(selectMediaState)),
      filter(([, state]) => state.hasMore && !state.isLoading),
      exhaustMap(([, state]) =>
        this.mediaApiService.getMedia(state.filters, state.currentPage, state.filters.pageSize).pipe(
          map(dto => {
            const collection = this.mappingService.mapMediaListResponse(dto);
            return MediaActions.loadMediaSuccess({ media: collection.items, totalCount: collection.totalCount, hasMore: dto.hasNextPage });
          }),
          catchError((err) => of(MediaActions.loadMediaFailure({ error: { message: err.message || 'Failed to load next page.', operation: 'loadNextPage' } })))
        )
      )
    )
  );

  // Zoek dit blok in uw media.effects.ts bestand:
createMedia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MediaActions.createMediaSubmitted),
      exhaustMap(({ payload, file, tempId }) =>
        this.mediaApiService.createMedia(payload, file).pipe(
          tap(newMedia => {
            // --- DE LOGGING WAAR JE OM VROEG ---
            this.logger.info(
              `[MediaEffects] UPLOAD VOLTOOID. Mapping:`, 
              { tempId: tempId, finalId: newMedia.id, title: newMedia.title }
            );
            this.notificationService.showSuccess(`Afbeelding '${newMedia.title}' succesvol geüpload!`);
          }),
          map(newMedia => {
            return MediaActions.createMediaSuccess({ media: newMedia, tempId });
          }),
          catchError((err) => of(MediaActions.createMediaFailure({ error: { message: err.message || 'Failed to create media.', operation: 'createMedia' }, tempId })))
        )
      )
    )
  );




  updateMedia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MediaActions.updateMediaSubmitted),
      concatMap(({ id, payload }) =>
        this.mediaApiService.updateMedia(id, payload).pipe(
          tap(() => this.notificationService.showSuccess('Media updated successfully!')),
          map(updatedMedia => {
            const mediaUpdate: Update<Media> = { id, changes: updatedMedia };
            return MediaActions.updateMediaSuccess({ mediaUpdate });
          }),
          catchError(error => {
            this.logger.error(`${this.logPrefix} Failed to update media ${id}`, error);
            const featureError: FeatureError = { message: 'Failed to update media.', operation: 'updateMedia' };
            return of(MediaActions.updateMediaFailure({ error: featureError, id }));
          })
        )
      )
    )
  );

  deleteMedia$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MediaActions.deleteMediaConfirmed),
      concatMap(({ id }) =>
        this.mediaApiService.deleteMedia(id).pipe(
          tap(() => this.notificationService.showSuccess('Media deleted successfully!')),
          map(() => MediaActions.deleteMediaSuccess({ id })),
          catchError(error => {
            this.logger.error(`${this.logPrefix} Failed to delete media ${id}`, error);
            const featureError: FeatureError = { message: 'Failed to delete media.', operation: 'deleteMedia' };
            return of(MediaActions.deleteMediaFailure({ error: featureError, id }));
          })
        )
      )
    )
  );
}