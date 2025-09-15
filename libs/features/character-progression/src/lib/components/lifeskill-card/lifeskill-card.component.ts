import { ChangeDetectionStrategy, Component, InputSignal, Signal, computed, input } from '@angular/core';
import { CommonModule, DecimalPipe, PercentPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiPercentageBarComponent } from '@royal-code/ui/meters';
import { AppIcon, Lifeskill } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-lifeskill-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    UiIconComponent,
    UiPercentageBarComponent,
    TranslateModule,
    PercentPipe,
    DecimalPipe
  ],
  template: `
  @if (lifeskill(); as skill) {
    <div
      class="lifeskill-card flex flex-col bg-surface-alt p-3 rounded-xs shadow-surface-md border border-border h-full
             text-foreground transition-shadow duration-200 ease-out hover:shadow-surface-lg hover:border-primary/50">

      <!-- icon + level/percent -->
      <div class="flex items-start gap-3 mb-2">
        <royal-code-ui-icon
          [icon]="skill.icon"
          sizeVariant="lg"
          colorClass="text-primary"
          extraClass="w-10 h-10" />

        <div class="flex-grow text-right min-w-0">
          <span class="block text-xl font-bold text-primary truncate"
                [title]="xpPct() | percent:'1.0-0'">
            {{ xpPct() | percent:'1.0-0' }}
          </span>
          <span class="block text-xs text-muted-foreground -mt-0.5 truncate"
                [title]="(skill.currentLevelName || 'skills.levelPrefix' | translate) + ' ' + (skill.currentLevel | number)">
            {{ (skill.currentLevelName || ('skills.levelPrefix' | translate)) | translate }}
            {{ skill.currentLevel | number }}
          </span>
        </div>
      </div>

      <!-- name -->
      <h4 class="text-sm font-semibold mb-2 truncate"
          [title]="skill.nameKeyOrText | translate">
        {{ skill.nameKeyOrText | translate }}
      </h4>

      <!-- progress bar -->
      <div class="mt-auto pt-2">
        <royal-code-ui-percentage-bar
          [currentValue]="skill.currentExperience"
          [maxValue]="skill.experienceForNextLevel"
          [showValueText]="false"
          heightClass="h-1.5"
          barColorClass="bg-primary"
          trackColorClass="bg-muted" />

        <div class="text-right text-[10px] text-muted-foreground mt-0.5">
          {{ skill.currentExperience | number }} /
          {{ skill.experienceForNextLevel | number }} XP
        </div>
      </div>
    </div>
  } @else {
    <div
      class="lifeskill-card flex flex-col items-center justify-center bg-surface-alt p-3 rounded-xs shadow-surface-md
             border border-border h-full min-h-[130px] text-muted-foreground">
      <royal-code-ui-icon
        [icon]="AppIcon.HelpCircle"
        sizeVariant="xl"
        colorClass="text-muted-foreground opacity-50 mb-2" />
      <p class="text-xs">
        {{ 'common.messages.noDataAvailable' | translate }}
      </p>
    </div>
  }
  `,
  styles: [`:host{display:block;height:100%}`]
})
export class LifeskillCardComponent {
  readonly lifeskill: InputSignal<Lifeskill | null | undefined> =
    input<Lifeskill | null | undefined>(undefined);

  readonly AppIcon = AppIcon;

  /** 0–1 percentage for tooltip */
  readonly xpPct: Signal<number> = computed(() => {
    const s = this.lifeskill();
    if (!s) return 0;
    return s.experienceForNextLevel > 0
      ? Math.max(0, Math.min(1, s.currentExperience / s.experienceForNextLevel))
      : (s.currentExperience > 0 ? 1 : 0);
  });
}
