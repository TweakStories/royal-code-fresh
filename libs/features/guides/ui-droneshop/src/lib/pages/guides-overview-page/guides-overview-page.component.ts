/**
 * @file guides-overview-page.component.ts
 * @Version 2.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Smart component for the guides overview page, now integrated with the facade.
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuidesFacade } from '@royal-code/features/guides/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiGridComponent } from '@royal-code/ui/grid';
import { GuideCardComponent } from '../../components/guide-card/guide-card.component';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';

@Component({
  selector: 'droneshop-guides-overview-page',
  standalone: true,
  imports: [
    CommonModule, UiTitleComponent, UiParagraphComponent, UiGridComponent,
    GuideCardComponent, UiSpinnerComponent
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6">
      <header>
        <royal-code-ui-title [level]="TitleTypeEnum.H1" text="Interactieve Bouwgidsen" />
        <royal-code-ui-paragraph color="muted" extraClasses="max-w-2xl">
          Welkom bij de Droneshop bouwgidsen. Hier vind je gedetailleerde, stap-voor-stap instructies om jouw
          zelfbouw drone kit met succes te assembleren. Kies je model en start met bouwen!
        </royal-code-ui-paragraph>
      </header>

      <!-- TODO: Hier komt de GuideFilterBarComponent -->
      <div class="h-12 bg-surface-alt border border-dashed border-border rounded-xs flex items-center justify-center text-secondary text-sm">
        Filter & Sorteer Placeholder
      </div>

      <main>
        @if (facade.isLoading()) {
          <div class="flex items-center justify-center p-12">
            <royal-code-ui-spinner size="xl" />
          </div>
        } @else {
          <royal-code-ui-grid
            [data]="facade.summaries()"
            [cellTemplate]="guideCardTemplate"
            [minItemWidth]="320"
            [gap]="1.5"
            [maxCols]="3"
            layoutMode="dynamic"
          />
        }
      </main>

      <ng-template #guideCardTemplate let-guide>
        <droneshop-guide-card [guide]="guide" />
      </ng-template>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuidesOverviewPageComponent implements OnInit {
  protected readonly facade = inject(GuidesFacade);
  protected readonly TitleTypeEnum = TitleTypeEnum;

  ngOnInit(): void {
    this.facade.loadSummaries();
  }
}