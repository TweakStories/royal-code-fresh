import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Guide, GuideSummary } from '@royal-code/features/guides/domain';
import { StructuredError } from '@royal-code/shared/domain';

export const GuidesActions = createActionGroup({
  source: 'Guides',
  events: {
    // Overview
    'Overview Page Opened': emptyProps(),
    'Load Summaries Success': props<{ summaries: GuideSummary[] }>(),
    'Load Summaries Failure': props<{ error: StructuredError }>(),

    // Detail
    'Detail Page Opened': props<{ slug: string }>(),
    'Load Guide Success': props<{ guide: Guide }>(),
    'Load Guide Failure': props<{ error: StructuredError }>(),
    'Toggle Step Completion': props<{ stepId: string }>(),
    'Clear Current Guide': emptyProps(),

    // --- Persistentie & Rehydratatie ---
    'Rehydrate Progress Requested': emptyProps(),
    'Rehydrate Progress Success': props<{ completedStepIds: Record<string, boolean> }>(),
  },
});