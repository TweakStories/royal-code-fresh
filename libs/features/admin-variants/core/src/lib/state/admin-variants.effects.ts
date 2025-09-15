/**
 * @file admin-variants.effects.ts
 * @Version 1.1.0 (Full CRUD)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description NgRx effects for handling all Admin Variants API calls (CRUD).
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, exhaustMap } from 'rxjs/operators';
import { AdminVariantActions } from './admin-variants.actions';
import { AdminVariantsApiService } from '@royal-code/features/admin-variants/data-access';
import { NotificationService } from '@royal-code/ui/notifications';
import { Update } from '@ngrx/entity';
import { PredefinedAttributeValueDto } from '@royal-code/features/admin-products/core';

@Injectable()
export class AdminVariantsEffects {
  private readonly actions$ = inject(Actions);
  private readonly apiService = inject(AdminVariantsApiService);
  private readonly notificationService = inject(NotificationService);

  loadVariants$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminVariantActions.loadVariants),
      switchMap(() =>
        this.apiService.getAttributes().pipe(
          map(attributeMap => AdminVariantActions.loadVariantsSuccess({ attributeMap })),
          catchError(error => of(AdminVariantActions.loadVariantsFailure({ error: error.message })))
        )
      )
    )
  );

  createVariant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminVariantActions.createVariant),
      exhaustMap(({ payload }) =>
        this.apiService.createAttribute(payload).pipe(
          map(variant => {
            this.notificationService.showSuccess(`Attribute value '${variant.displayName}' created.`);
            // Normalize the type for the reducer, e.g., "color" -> "Color"
            const attributeType = payload.attributeType.charAt(0).toUpperCase() + payload.attributeType.slice(1);
            return AdminVariantActions.createVariantSuccess({ variant, attributeType });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to create attribute: ${error.message}`);
            return of(AdminVariantActions.createVariantFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateVariant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminVariantActions.updateVariant),
      exhaustMap(({ id, payload }) =>
        this.apiService.updateAttribute(id, payload).pipe(
          map(updatedVariant => {
            this.notificationService.showSuccess(`Attribute value '${updatedVariant.displayName}' updated.`);
            const variantUpdate: Update<PredefinedAttributeValueDto> = {
              id: id,
              changes: updatedVariant,
            };
            return AdminVariantActions.updateVariantSuccess({ variantUpdate });
          }),
          catchError(error => {
            this.notificationService.showError(`Failed to update attribute: ${error.message}`);
            return of(AdminVariantActions.updateVariantFailure({ error: error.message }));
          })
        )
      )
    )
  );

  deleteVariant$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminVariantActions.deleteVariant),
      exhaustMap(({ id, attributeType }) =>
        this.apiService.deleteAttribute(id).pipe(
          map(() => {
            this.notificationService.showSuccess(`Attribute value successfully deleted.`);
            return AdminVariantActions.deleteVariantSuccess({ id, attributeType });
          }),
          catchError(error => {
            const errorMessage = error.status === 409
              ? "Cannot delete attribute: it is currently in use by products."
              : `Failed to delete attribute: ${error.message}`;
            this.notificationService.showError(errorMessage);
            return of(AdminVariantActions.deleteVariantFailure({ error: errorMessage }));
          })
        )
      )
    )
  );
}