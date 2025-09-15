/**
 * @file admin-variants.actions.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description NgRx actions for the Admin Variants feature.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { PredefinedAttributesMap, PredefinedAttributeValueDto } from '@royal-code/features/admin-products/core';
import { CreateVariantValuePayload, UpdateVariantValuePayload } from '@royal-code/features/admin-variants/data-access';

export const AdminVariantActions = createActionGroup({
  source: 'Admin Variants',
  events: {
    // === PAGE LIFECYCLE ===
    'Load Variants': emptyProps(),
    'Load Variants Success': props<{ attributeMap: PredefinedAttributesMap }>(),
    'Load Variants Failure': props<{ error: string }>(),

    // === CREATE ===
    'Create Variant': props<{ payload: CreateVariantValuePayload }>(),
    'Create Variant Success': props<{ variant: PredefinedAttributeValueDto, attributeType: string }>(),
    'Create Variant Failure': props<{ error: string }>(),
    
    // === UPDATE ===
    'Update Variant': props<{ id: string, payload: UpdateVariantValuePayload }>(),
    'Update Variant Success': props<{ variantUpdate: Update<PredefinedAttributeValueDto> }>(),
    'Update Variant Failure': props<{ error: string }>(),

    // === DELETE ===
    'Delete Variant': props<{ id: string, attributeType: string }>(),
    'Delete Variant Success': props<{ id: string, attributeType: string }>(),
    'Delete Variant Failure': props<{ error: string }>(),
  },
});