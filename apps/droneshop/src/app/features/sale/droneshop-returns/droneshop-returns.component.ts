/**
 * @file droneshop-returns.component.ts
 * @Version 2.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-09
 * @Description Component for the static returns policy page.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';

@Component({
  selector: 'droneshop-returns',
  standalone: true,
  imports: [CommonModule, UiTitleComponent, TranslateModule, UiParagraphComponent],
  template: `
    <div class="container-max py-12 px-4">
      <header class="text-center mb-12">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H1"
          [text]="'returnsPage.title' | translate"
          extraClasses="!text-4xl !font-bold mb-4"
        />
        <royal-code-ui-paragraph color="muted" extraClasses="max-w-2xl mx-auto">
          {{ 'returnsPage.subtitle' | translate }}
        </royal-code-ui-paragraph>
      </header>

      <main class="max-w-4xl mx-auto space-y-10">
        <!-- Section: Voorwaarden -->
        <section>
          <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'returnsPage.conditions.title' | translate" blockStyle="true" blockStyleType="primary" extraClasses="!mb-4" />
          <div class="space-y-4 text-secondary prose">
            <p [innerHTML]="'returnsPage.conditions.p1' | translate"></p>
          </div>
        </section>

        <!-- Section: Procedure -->
        <section>
          <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'returnsPage.procedure.title' | translate" blockStyle="true" blockStyleType="secondary" extraClasses="!mb-4" />
          <div class="space-y-4 text-secondary prose">
            <p [innerHTML]="'returnsPage.procedure.p1' | translate"></p>
          </div>
        </section>

        <!-- Section: Uitzonderingen -->
        <section>
          <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'returnsPage.exceptions.title' | translate" blockStyle="true" blockStyleType="secondary" extraClasses="!mb-4" />
          <div class="space-y-4 text-secondary">
            <p>{{ 'returnsPage.exceptions.p1' | translate }}</p>
          </div>
        </section>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopReturnsComponent {
  readonly TitleTypeEnum = TitleTypeEnum;
}