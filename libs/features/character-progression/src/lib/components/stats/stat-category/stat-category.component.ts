// libs/features/character-progression/src/lib/components/stat-category/stat-category.component.ts
import { Component, ChangeDetectionStrategy, input, InputSignal } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { StatCategory } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon'; // Import UiIconComponent
import { DetailedStatItemComponent } from '../../detailed-stat-item/detailed-stat-item.component'; // Import DetailedStatItemComponent

@Component({
  selector: 'royal-code-stat-category',
  standalone: true,
  imports: [TranslateModule, UiIconComponent, DetailedStatItemComponent], // Voeg imports toe
  template:
  `
  <section class="stat-category-section mb-6 p-4 bg-card rounded-xs shadow border border-border" [attr.aria-labelledby]="category()?.id + '-title'">
    <header class="flex items-center gap-2 mb-3 pb-2 border-b border-border">
      @if (category()?.icon) {
        <royal-code-ui-icon [icon]="category()!.icon!" sizeVariant="md" colorClass="text-primary"></royal-code-ui-icon>
      }
      <h3 [id]="category()?.id + '-title'" class="text-xl font-semibold text-foreground">{{ (category()?.nameKeyOrText ?? '') | translate }}</h3>
    </header>
    @if (category()?.descriptionKeyOrText) {
      <p class="text-sm text-secondary mb-3">{{ (category()?.descriptionKeyOrText ?? '') | translate }}</p>
    }
  
    @if (category()?.stats && category()!.stats.length > 0) {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
        @for (stat of category()!.stats; track stat.id) {
          <royal-code-detailed-stat-item [stat]="stat"></royal-code-detailed-stat-item>
        }
      </div>
    } @else {
      <p class="text-sm text-secondary italic">{{ 'charProgression.messages.noStatsInCategory' | translate }}</p>
    }
  </section>
  `,
  // styleUrls: ['./stat-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCategoryComponent {
  readonly category: InputSignal<StatCategory | undefined> = input<StatCategory>();
}
