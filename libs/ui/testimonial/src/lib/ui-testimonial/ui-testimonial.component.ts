/**
 * @file testimonial-card.component.ts (Shared UI)
 * @description A reusable, presentational component for displaying a single testimonial.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Testimonial } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-testimonial-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiParagraphComponent, UiImageComponent, UiIconComponent],
  template: `
    <figure class="testimonial-card h-full flex flex-col p-6 bg-card border border-border rounded-xs shadow-sm">
      <blockquote>
        <royal-code-ui-paragraph [text]="testimonial().quoteKey | translate" size="md" color="foreground" extraClasses="italic" />
      </blockquote>
      <figcaption class="flex items-center gap-4 mt-6 pt-4 border-t border-border">
        @if(testimonial().authorImage) {
          <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <royal-code-ui-image [image]="testimonial().authorImage!" objectFit="cover" class="w-full h-full" />
          </div>
        }
        <div>
          <p class="font-semibold text-text">{{ testimonial().authorName }}</p>
          <p class="text-sm text-secondary">{{ (testimonial().authorTitleKey | translate) + ', ' + testimonial().authorCompany }}</p>
        </div>
      </figcaption>
    </figure>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTestimonialCardComponent {
  testimonial = input.required<Testimonial>();
  protected readonly AppIcon = AppIcon;
}