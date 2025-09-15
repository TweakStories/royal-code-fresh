// libs/features/character-progression/src/lib/pages/character-stats-page/character-stats-page.component.ts
import { Component, ChangeDetectionStrategy, inject, Signal, OnInit } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { CharacterProgressionFacade } from '../../state/character-progression.facade';
import { StatCategory } from '@royal-code/shared/domain'; // Importeer StatCategory
import { StatCategoryComponent } from '../../components/stats/stat-category/stat-category.component'; // Importeer de nieuwe component
import { toSignal } from '@angular/core/rxjs-interop';
import * as CharacterProgressionSelectors from '../../state/character-progression.selectors'; // Importeer selectors
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'royal-code-character-stats-page',
  standalone: true,
  imports: [TranslateModule, StatCategoryComponent], // Voeg StatCategoryComponent toe
  template: `
  <div class="character-stats-page-container p-4 md:p-6 space-y-6">
  <header class="mb-6">
    <h1 class="text-3xl font-bold text-foreground">{{ 'charProgression.titles.fullStats' | translate }}</h1>
    <p class="text-secondary">{{ 'charProgression.descriptions.fullStats' | translate }}</p>
  </header>

  @if (isLoading()) {
    <div class="text-center text-secondary italic py-10">{{ 'common.messages.loading' | translate }}...</div>
  } @else if (error()) {
    <div class="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/30 text-center">
      {{ 'common.errors.errorOccurred' | translate }}: {{ error() }}
    </div>
  } @else if (categorizedStats().length > 0) {
    <div class="space-y-8">
      @for (category of categorizedStats(); track category.id) {
        <royal-code-stat-category [category]="category"></royal-code-stat-category>
      }
    </div>
  } @else {
    <p class="text-center text-secondary italic py-10">{{ 'charProgression.messages.noStatsAvailable' | translate }}</p>
  }
</div>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterStatsPageComponent implements OnInit {
  private charProgFacade = inject(CharacterProgressionFacade);
  private store = inject(Store);

  // Signalen van de facade
  readonly isLoading: Signal<boolean> = this.charProgFacade.isLoading;
  readonly error: Signal<string | null> = this.charProgFacade.error;

  // Nieuwe selector nodig in de facade die StatCategory[] teruggeeft
  readonly categorizedStats: Signal<StatCategory[]> = toSignal(
    this.store.pipe(select(CharacterProgressionSelectors.selectCategorizedStatsForDisplay)), // Gebruik de selector
    { initialValue: [] }
);

  ngOnInit(): void {
    // Data wordt geladen door CharacterStatsDisplayComponent of andere entry points.
    // Hier kunnen we eventueel checken of data geladen is en anders triggeren.
    this.charProgFacade.loadCharacterStats();
    this.charProgFacade.loadStatDefinitions();
  }
}
