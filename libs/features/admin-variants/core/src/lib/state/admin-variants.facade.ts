/**
 * @file admin-variants.facade.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description Facade for the Admin Variants feature state.
 */
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { adminVariantsFeature } from './admin-variants.feature';
import { AdminVariantActions } from './admin-variants.actions';
import { CreateVariantValuePayload, UpdateVariantValuePayload } from '@royal-code/features/admin-variants/data-access';

@Injectable({ providedIn: 'root' })
export class AdminVariantsFacade {
  private readonly store = inject(Store);

  readonly groupedAttributes = this.store.selectSignal(adminVariantsFeature.selectGroupedAttributes);
  readonly isLoading = this.store.selectSignal(adminVariantsFeature.selectIsLoading);
  readonly error = this.store.selectSignal(adminVariantsFeature.selectError);

  loadVariants(): void {
    this.store.dispatch(AdminVariantActions.loadVariants());
  }

  createVariant(payload: CreateVariantValuePayload): void {
    this.store.dispatch(AdminVariantActions.createVariant({ payload }));
  }

  updateVariant(id: string, payload: UpdateVariantValuePayload): void {
    this.store.dispatch(AdminVariantActions.updateVariant({ id, payload }));
  }

  deleteVariant(id: string, attributeType: string): void {
    this.store.dispatch(AdminVariantActions.deleteVariant({ id, attributeType }));
  }
}