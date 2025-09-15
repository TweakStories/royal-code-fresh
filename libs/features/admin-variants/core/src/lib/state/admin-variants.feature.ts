/**
 * @file admin-variants.feature.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description NgRx feature slice for managing global product attributes.
 *              Normalizes the data for efficient lookups.
 */
import { createFeature, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { PredefinedAttributeValueDto } from '@royal-code/features/admin-products/core';
import { AdminVariantActions } from './admin-variants.actions';

export const ADMIN_VARIANTS_FEATURE_KEY = 'adminVariants';

// === STATE INTERFACE ===
export interface State extends EntityState<PredefinedAttributeValueDto> {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  groups: Record<string, string[]>; // Key: "Color", Value: ["id1", "id2"]
}

export const adapter = createEntityAdapter<PredefinedAttributeValueDto>();

export const initialState: State = adapter.getInitialState({
  isLoading: false,
  isSubmitting: false,
  error: null,
  groups: {},
});

// === FEATURE (REDUCER & SELECTORS) ===
export const adminVariantsFeature = createFeature({
  name: ADMIN_VARIANTS_FEATURE_KEY,
  reducer: createReducer(
    initialState,
    // --- LOAD ---
    on(AdminVariantActions.loadVariants, (state) => ({ ...state, isLoading: true })),
    on(AdminVariantActions.loadVariantsSuccess, (state, { attributeMap }) => {
      const allValues = Object.values(attributeMap).flat();
      const newGroups = Object.fromEntries(
        Object.entries(attributeMap).map(([key, values]) => [key, values.map(v => v.id)])
      );
      return adapter.setAll(allValues, { ...state, isLoading: false, groups: newGroups });
    }),
    on(AdminVariantActions.loadVariantsFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    // --- CREATE ---
    on(AdminVariantActions.createVariant, (state) => ({ ...state, isSubmitting: true })),
    on(AdminVariantActions.createVariantSuccess, (state, { variant, attributeType }) => {
        const updatedGroup = [...(state.groups[attributeType] || []), variant.id];
        return adapter.addOne(variant, { 
            ...state, 
            isSubmitting: false, 
            groups: { ...state.groups, [attributeType]: updatedGroup } 
        });
    }),
    on(AdminVariantActions.createVariantFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),

    // --- UPDATE ---
    on(AdminVariantActions.updateVariant, (state) => ({ ...state, isSubmitting: true })),
    on(AdminVariantActions.updateVariantSuccess, (state, { variantUpdate }) => adapter.updateOne(variantUpdate, { ...state, isSubmitting: false })),
    on(AdminVariantActions.updateVariantFailure, (state, { error }) => ({ ...state, isSubmitting: false, error })),
    
    // --- DELETE ---
    on(AdminVariantActions.deleteVariant, (state) => ({ ...state, isSubmitting: true })),
    on(AdminVariantActions.deleteVariantSuccess, (state, { id, attributeType }) => {
        const updatedGroup = (state.groups[attributeType] || []).filter(variantId => variantId !== id);
        return adapter.removeOne(id, {
            ...state,
            isSubmitting: false,
            groups: { ...state.groups, [attributeType]: updatedGroup }
        });
    }),
    on(AdminVariantActions.deleteVariantFailure, (state, { error }) => ({ ...state, isSubmitting: false, error }))
  ),
  extraSelectors: ({ selectEntities, selectGroups }) => ({
    selectGroupedAttributes: createSelector(
      selectEntities,
      selectGroups,
      (entities, groups): Record<string, PredefinedAttributeValueDto[]> => {
        return Object.fromEntries(
          Object.entries(groups).map(([groupName, ids]) => [
            groupName,
            ids.map(id => entities[id]).filter(Boolean) as PredefinedAttributeValueDto[]
          ])
        );
      }
    )
  })
});