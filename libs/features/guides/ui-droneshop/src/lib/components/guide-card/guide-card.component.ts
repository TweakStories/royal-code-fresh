/**
 * @file guide-card.component.ts
 * @Version 2.0.0 (Progress Bar Integration)
 * @Description Displays a guide summary card, now with a progress bar.
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GuideSummary } from '@royal-code/features/guides/domain';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiProgressComponent } from '@royal-code/ui/progress';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { DecimalPipe } from '@angular/common'; 


@Component({
  selector: 'droneshop-guide-card',
  standalone: true,
  imports: [
    RouterModule, UiCardComponent, UiImageComponent, UiTitleComponent,
    UiBadgeComponent, UiParagraphComponent, UiProgressComponent, UiButtonComponent,
    DecimalPipe 
  ],
  template: `
    <a [routerLink]="['/guides', guide().slug]" class="block h-full group">
      <royal-code-ui-card extraContentClasses="!p-0 flex flex-col h-full !border-2 !border-black group-hover:!border-primary transition-colors duration-200">
        <div class="relative overflow-hidden aspect-[16/9]">
          <royal-code-ui-image
            [image]="guide().coverImage"
            [alt]="guide().coverImage.altText"
            objectFit="cover"
            extraClasses="group-hover:scale-105 transition-transform duration-300"
            [rounding]="'none'"
          />
          <div class="absolute top-3 right-3 flex flex-col items-end gap-2">
            <royal-code-ui-badge [color]="difficultyBadge().color">
              {{ difficultyBadge().text }}
            </royal-code-ui-badge>
            <royal-code-ui-badge color="muted">
              ± {{ guide().estimatedMinutes | number }} min
            </royal-code-ui-badge>
          </div>
        </div>

        <div class="p-4 flex flex-col flex-grow border-t-2 border-black">
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="guide().title" extraClasses="!mb-2 group-hover:text-primary transition-colors" />
          <royal-code-ui-paragraph size="sm" color="muted" extraClasses="line-clamp-3">
            {{ guide().description }}
          </royal-code-ui-paragraph>

          <div class="mt-auto pt-4 space-y-3">
            @if (guide().userProgressPercent; as progress) {
              @if(progress > 0) {
                <div>
                  <royal-code-ui-paragraph size="xs" color="muted" extraClasses="mb-1">
                    Voortgang: {{ progress | number:'1.0-0' }}%
                  </royal-code-ui-paragraph>
                  <royal-code-ui-progress [value]="progress" />
                </div>
              }
            }
            <royal-code-ui-button type="default" [isFullWidth]="true" extraClasses="!rounded-none !border-black group-hover:!bg-primary group-hover:!text-black transition-colors">
              {{ (guide().userProgressPercent ?? 0) > 0 ? 'Ga Verder' : 'Start Gids' }}
            </royal-code-ui-button>
          </div>
        </div>
      </royal-code-ui-card>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideCardComponent {
  guide = input.required<GuideSummary>();

  protected readonly TitleTypeEnum = TitleTypeEnum;

  readonly difficultyBadge = computed(() => {
    switch (this.guide().difficulty) {
      case 'beginner': return { text: 'Beginner', color: 'success' as const };
      case 'intermediate': return { text: 'Gevorderd', color: 'warning' as const };
      case 'expert': return { text: 'Expert', color: 'error' as const };
      default: return { text: 'N.v.t.', color: 'muted' as const };
    }
  });
}