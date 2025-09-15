/**
 * @file droneshop-shipping.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-09
 * @Description Component for the static shipping information page.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'droneshop-shipping',
  standalone: true,
  imports: [
    CommonModule, TranslateModule,
    UiTitleComponent, UiParagraphComponent
  ],
  template: `
    <div class="container-max py-12 px-4">
      <header class="text-center mb-12">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H1"
          [text]="'shippingPage.title' | translate"
          extraClasses="!text-4xl !font-bold mb-4"
        />
        <royal-code-ui-paragraph color="muted" extraClasses="max-w-2xl mx-auto">
          {{ 'shippingPage.subtitle' | translate }}
        </royal-code-ui-paragraph>
      </header>

      <main class="max-w-4xl mx-auto space-y-10">
        <!-- Section: Binnenland -->
        <section>
          <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'shippingPage.domestic.title' | translate" blockStyle="true" blockStyleType="primary" extraClasses="!mb-4" />
          <div class="space-y-4 text-secondary">
            <p [innerHTML]="'shippingPage.domestic.p1' | translate"></p>
            <p>{{ 'shippingPage.domestic.p2' | translate }}</p>
          </div>
        </section>

        <!-- Section: Internationaal -->
        <section>
          <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'shippingPage.international.title' | translate" blockStyle="true" blockStyleType="secondary" extraClasses="!mb-4" />
          <div class="space-y-4 text-secondary">
            <p>{{ 'shippingPage.international.p1' | translate }}</p>
          </div>
        </section>

        <!-- Section: Track & Trace -->
        <section>
          <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'shippingPage.tracking.title' | translate" blockStyle="true" blockStyleType="secondary" extraClasses="!mb-4" />
           <div class="space-y-4 text-secondary">
            <p>{{ 'shippingPage.tracking.p1' | translate }}</p>
          </div>
        </section>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopShippingComponent {
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
}