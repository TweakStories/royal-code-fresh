// --- VERVANG VOLLEDIG BESTAND ---
/**
 * @file ui-faq-item.component.ts
 * @Version 1.2.0 (FIXED: Input Type Mismatch)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Component representing a single collapsible FAQ item.
 *   FIXED: Corrected the input type to match the data structure (with resolved strings)
 *   passed by the parent UiFaqComponent, resolving the TS2339 compiler error.
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  OnInit,
  OutputEmitterRef,
  InputSignal,
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, ResolvedFaqItem } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'royal-code-ui-faq-item',
  standalone: true,
  imports: [CommonModule, UiIconComponent, UiParagraphComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="faq-item border border-border rounded-lg bg-surface overflow-hidden">
      <button
        type="button"
        class="flex justify-between items-center w-full p-5 text-left text-foreground font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
        (click)="toggle()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="contentId()"
        [id]="headerId()">
          <span>
            {{ faqItem()?.question }}
          </span>
          <royal-code-ui-icon
              [icon]="AppIcon.ChevronDown"
              sizeVariant="md"
              extraClass="transition-transform duration-200"
              [class.rotate-180]="isOpen()">
          </royal-code-ui-icon>
      </button>
      <div
        [id]="contentId()"
        role="region"
        [attr.aria-labelledby]="headerId()"
        [@contentExpansion]="isOpen() ? 'expanded' : 'collapsed'"
        class="overflow-hidden">
          @if (isOpen()) {
            <div class="p-5 pt-0 border-t border-border mt-0.5">
              <royal-code-ui-paragraph
                [text]="faqItem()?.answer ?? ''"
                size="md"
                color="foreground"
                extraClasses="leading-relaxed"
              />
            </div>
          }
      </div>
    </div>
  `,
  animations: [
    trigger('contentExpansion', [
      state('collapsed', style({ height: '0px', opacity: 0, visibility: 'hidden' })),
      state('expanded', style({ height: '*', opacity: 1, visibility: 'visible' })),
      transition('expanded <=> collapsed', [
        animate('200ms ease-out')
      ])
    ])
  ],
  styles: [`:host { display: block; }`]
})
export class UiFaqItemComponent implements OnInit {
  readonly faqItem: InputSignal<ResolvedFaqItem | undefined> = input<ResolvedFaqItem | undefined>(undefined);
  /** Input: Determines if the item is initially open. */
  readonly initiallyOpen: InputSignal<boolean> = input(false);

  /** Output: Emits the new open state when the item is toggled. */
  readonly toggled: OutputEmitterRef<boolean> = output<boolean>();

  readonly isOpen = signal(false);
  readonly AppIcon = AppIcon;

  readonly headerId = computed(() => `${this.faqItem()?.id}-header`);
  readonly contentId = computed(() => `${this.faqItem()?.id}-content`);

  ngOnInit(): void {
    this.isOpen.set(this.initiallyOpen());
  }

  toggle(): void {
    this.isOpen.update(open => !open);
    this.toggled.emit(this.isOpen());
  }
}