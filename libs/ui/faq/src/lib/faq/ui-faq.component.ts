// --- VERVANG VOLLEDIG BESTAND ---
/**
 * @file ui-faq.component.ts
 * @Version 1.2.0 (FIXED: Child Component Binding)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Een herbruikbare component om een lijst van FAQ-items weer te geven.
 *   FIXED: De binding naar de child component is nu type-correct.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiFaqItemComponent } from '../ui-faq-item/ui-faq-item.component'; 
import { FaqItem } from '@royal-code/shared/domain';
import { inject } from '@angular/core';

@Component({
  selector: 'royal-code-ui-faq',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiFaqItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="faq-list space-y-4">
      @for (faq of faqs(); track faq.id) {
        <royal-code-ui-faq-item
          [faqItem]="{ id: faq.id, question: (faq.questionKey | translate), answer: (faq.answerKey | translate) }"
          [initiallyOpen]="false"
        />
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class UiFaqComponent {
  readonly faqs = input.required<FaqItem[]>();
  private readonly translate = inject(TranslateService);
}