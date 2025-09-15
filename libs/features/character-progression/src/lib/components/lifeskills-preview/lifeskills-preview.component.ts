import { Component, ChangeDetectionStrategy, inject, input, computed, Signal } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router'; // RouterModule toegevoegd
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
// Correct pad voor LifeskillCardComponent binnen dezelfde feature library
import { LifeskillCardComponent } from '../lifeskill-card/lifeskill-card.component';
import { CharacterProgressionFacade } from '../../state/character-progression.facade';
import { Lifeskill, AppIcon } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';

@Component({
  selector: 'royal-code-lifeskills-preview',
  standalone: true,
  imports: [
    TranslateModule,
    RouterModule,
    UiButtonComponent,
    UiIconComponent,
    LifeskillCardComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lifeskills-section">
      <h3 class="text-base md:text-lg font-semibold text-foreground mb-3">{{ 'home.titles.lifeskills' | translate }}</h3>

      @if (isLoading()) {
        <p class="text-sm text-secondary italic">{{ 'common.messages.loading' | translate }}...</p>
      } @else if (displayedLifeskills().length > 0) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          @for (skill of displayedLifeskills(); track skill.id) {
            <royal-code-lifeskill-card [lifeskill]="skill" class="h-full"/>
          }
        </div>
      } @else {
        <p class="text-sm text-secondary italic">{{ 'home.messages.noLifeskills' | translate }}</p>
      }

      <div class="mt-4 text-center">
        <!-- Voeg routerLink toe -->
        <royal-code-ui-button
            type="outline"
            sizeVariant="sm"
            (click)="navigateToAllLifeskillsPage()"
            routerLink="/character/progression/skills"> <!-- Voorbeeld route -->
          {{ 'home.buttons.viewAllLifeskills' | translate }}
          <royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="xs" extraClass="ml-1.5"/>
        </royal-code-ui-button>
      </div>
    </div>
  `,
  styles: [``]
})
export class LifeskillsPreviewComponent {
  private charProgFacade = inject(CharacterProgressionFacade);
  private logger = inject(LoggerService);
  private router = inject(Router);

  readonly maxItemsToShow = input<number>(8);

  readonly isLoading = computed(() => this.charProgFacade.isLoadingLifeskills());

  readonly displayedLifeskills: Signal<Lifeskill[]> = computed(() => {
    const allSkills = this.charProgFacade.lifeskills();
    const max = this.maxItemsToShow();
    return allSkills.slice(0, max);
  });

  readonly AppIcon = AppIcon;

  navigateToAllLifeskillsPage(): void {
    this.logger.info('[LifeskillsPreviewComponent] Navigating to all lifeskills page.');
    // Navigatie wordt nu afgehandeld door routerLink in de template, maar je kunt hier extra logica toevoegen indien nodig.
    // this.router.navigate(['/character/progression/skills']); // Pas aan naar je daadwerkelijke route
  }
}
