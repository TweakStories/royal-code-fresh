/**
 * @file media.actions.ts
 * @Version 1.1.0 (Enterprise Production-Ready Action Blueprint)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-27
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-07-27
 * @PromptSummary "Schrijf heel media actions en reducer met de juiste comment strategie uit de readme."
 * @Description
 *   Enterprise-grade NgRx action definities voor het Media domein. Implementeert
 *   uitgebreide "action modeling" met createActionGroup voor optimale type-veiligheid,
 *   ontwikkelaarservaring en Redux DevTools integratie. De acties zijn logisch
 *   gegroepeerd en bevatten rijke payload types voor alle media management scenario's.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { Media } from '@royal-code/shared/domain';
import {
  MediaFilters,
  CreateMediaPayload,
  UpdateMediaPayload,
  FeatureError
} from './media.types';

/**
 * @description
 * De complete "action group" voor het Media domein.
 */
export const MediaActions = createActionGroup({
  source: 'Media',
  events: {

    // === CATEGORY: PAGE LIFECYCLE & CONTEXT MANAGEMENT ===

    'Page Opened': props<{ forceRefresh?: boolean; initialFilters?: Partial<MediaFilters> }>(),

    'Page Closed': emptyProps(),

    'Filters Updated': props<{ filters: Partial<MediaFilters> }>(),

    'Next Page Loaded': emptyProps(),

    'Data Refreshed': emptyProps(),

    'State Reset': emptyProps(),

    // === CATEGORY: DATA LOADING API OPERATIONS ===

    'Load Media': emptyProps(),

    'Load Media Success': props<{
      media: Media[];
      totalCount: number;
      hasMore: boolean
    }>(),

    'Load Media Failure': props<{ error: FeatureError }>(),

    'Media Loaded From Source': props<{ media: readonly Media[] }>(),

    // === CATEGORY: CRUD OPERATIONS (CREATE, UPDATE, DELETE) ===

    // --- SUB-GROUP: CREATE ---
    'Create Media Submitted': props<{
      payload: CreateMediaPayload;
      file: File;
      tempId: string
    }>(),

    'Create Media Success': props<{
      media: Media;
      tempId: string
    }>(),

    'Create Media Failure': props<{
      error: FeatureError;
      tempId: string
    }>(),

    // --- SUB-GROUP: UPDATE ---
    'Update Media Submitted': props<{
      id: string;
      payload: UpdateMediaPayload
    }>(),

    'Update Media Success': props<{
      mediaUpdate: Update<Media>
    }>(),

    'Update Media Failure': props<{
      error: FeatureError;
      id: string
    }>(),

    // --- SUB-GROUP: DELETE ---
    'Delete Media Confirmed': props<{ id: string }>(),

    'Delete Media Success': props<{ id: string }>(),

    'Delete Media Failure': props<{
      error: FeatureError;
      id: string
    }>(),

    // === CATEGORY: UI STATE MANAGEMENT & USER INTERACTIONS ===

    'Media Selected': props<{ id: string | null }>(),

    'Error Cleared': emptyProps(),
  },
});