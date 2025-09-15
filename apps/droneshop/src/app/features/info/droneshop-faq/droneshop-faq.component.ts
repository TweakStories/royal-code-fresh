/**
 * @file droneshop-faq.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-09
 * @Description Component for the Frequently Asked Questions (FAQ) page.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { FaqItem } from '@royal-code/shared/domain';
import { UiFaqComponent } from '@royal-code/ui/faq';

@Component({
  selector: 'droneshop-faq',
  standalone: true,
  imports: [
    CommonModule, TranslateModule,
    UiTitleComponent, UiParagraphComponent, UiFaqComponent
  ],
  template: `
    <div class="container-max py-12 px-4">
      <header class="text-center mb-12">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H1"
          [text]="'faqPage.title' | translate"
          extraClasses="!text-4xl !font-bold mb-4"
        />
        <royal-code-ui-paragraph color="muted" extraClasses="max-w-2xl mx-auto">
          {{ 'faqPage.subtitle' | translate }}
        </royal-code-ui-paragraph>
      </header>

      <main class="max-w-4xl mx-auto">
        <royal-code-ui-faq [faqs]="faqItems" />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopFaqComponent {
  readonly TitleTypeEnum = TitleTypeEnum;

  readonly faqItems: FaqItem[] = [
    { id: 'faq-shipping', questionKey: 'faqPage.q1', answerKey: 'faqPage.a1' },
    { id: 'faq-returns', questionKey: 'faqPage.q2', answerKey: 'faqPage.a2' },
    { id: 'faq-license', questionKey: 'faqPage.q3', answerKey: 'faqPage.a3' },
    { id: 'faq-rtf', questionKey: 'faqPage.q4', answerKey: 'faqPage.a4' },
    { id: 'faq-support', questionKey: 'faqPage.q5', answerKey: 'faqPage.a5' }
  ];
}