/**
 * @file ui-accordion-item.component.ts
 * @Version 2.0.0 (Corrected Arrow & Button Styling)
 * @Author Royal-Code MonorepoAppDevAI
 * @Description
 *   Represents a single item within an accordion, with correct arrow rotation
 *   and consistent button styling.
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  booleanAttribute,
  signal,
  computed,
  OnInit,
  Injector,
  effect,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UiAccordionComponent } from '../accordion/ui-accordion.component';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';

let uniqueItemIdCounter = 0;

@Component({
  selector: 'royal-code-ui-accordion-item',
  standalone: true,
  imports: [CommonModule, UiIconComponent], 
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ui-accordion-item overflow-hidden" [ngClass]="itemContainerClasses()">
      <h3>
        <button
          type="button"
          royal-code-ui-button
          type="transparent"
          sizeVariant="block"
          extraClasses="text-left !px-3 !py-2 !gap-3"
          (clicked)="toggle()"
          [disabled]="disabled()"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-controls]="contentId()"
          [id]="headerId()">
            <!-- Project content for the title slot -->
            <span class="flex-grow">
               <ng-content select="[accordion-item-title]"></ng-content>
            </span>
            <!-- Chevron icon with correct rotation -->
            <royal-code-ui-icon
                [icon]="AppIcon.ChevronRight"
                sizeVariant="sm"
                extraClass="text-secondary transition-transform duration-200 ease-out"
                [ngClass]="{ 'rotate-90': isOpen() }"> <!-- FIX: rotate-90 to point down when open -->
            </royal-code-ui-icon>
        </button>
      </h3>
      <div
        [id]="contentId()"
        role="region"
        [attr.aria-labelledby]="headerId()"
        [@contentExpansion]="isOpen() ? 'expanded' : 'collapsed'"
        class="overflow-hidden">
          <div class="p-3 pt-2" [ngClass]="contentContainerClasses()">
             <ng-content select="[accordion-item-content]"></ng-content>
          </div>
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
  styles: [` :host { display: block; } `]
})
export class UiAccordionItemComponent implements OnInit {
  readonly title = input<string | undefined>();
  readonly itemId = input<string | undefined>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly transparent = input(false, { transform: booleanAttribute });

  private parentAccordion = inject(UiAccordionComponent);
  private injector = inject(Injector);
  private logger = inject(LoggerService, { optional: true });
  private cdr = inject(ChangeDetectorRef);
  private readonly logContextBase = '[UiAccordionItem]';

  readonly uniqueId = signal(`accordion-item-${uniqueItemIdCounter++}`);
  readonly finalItemId = computed<string>(() => this.itemId() ?? this.uniqueId());
  readonly isOpen = computed<boolean>(() => {
    const id = this.finalItemId();
    return this.parentAccordion.isItemOpen(id);
  });

  readonly headerId = computed<string>(() => `${this.finalItemId()}-header`);
  readonly contentId = computed<string>(() => `${this.finalItemId()}-content`);
  readonly AppIcon = AppIcon;

  readonly hasProjectedTitle = computed<boolean>(() => {
    return !this.title();
  });

  readonly itemContainerClasses = computed<string>(() => {
    const classes = ['ui-accordion-item', 'overflow-hidden'];
    if (this.transparent()) {
      classes.push('border-transparent', 'rounded-none');
    } else {
      classes.push('border', 'border-border', 'rounded-md');
    }
    return classes.join(' ');
  });

  readonly contentContainerClasses = computed<string>(() => {
    const classes = ['p-3', 'pt-2'];
    if (this.transparent()) {
      classes.push('bg-transparent', 'border-t-transparent');
    } else {
      classes.push('border-t', 'border-border', 'bg-background-secondary');
    }
    return classes.join(' ');
  });

  constructor() {
    effect(() => {
      const id = this.finalItemId();
      const open = this.isOpen();
      this.logger?.debug(`${this.logContextBase} (ID: ${id}) Effect: finalItemId or isOpen changed. isOpen is now: ${open}`);
      this.cdr.detectChanges();
    }, { injector: this.injector });
  }

  ngOnInit(): void {
    this.logger?.debug(`${this.logContextBase} (ID: ${this.finalItemId()}) Initialized. Initial isOpen: ${this.isOpen()}`);
  }

  toggle(): void {
    if (!this.disabled()) {
      const idToToggle = this.finalItemId();
      this.logger?.debug(`${this.logContextBase} (ID: ${idToToggle}) Toggling... Calling parent.toggleItem.`);
      this.parentAccordion.toggleItem(idToToggle);
    } else {
      this.logger?.debug(`${this.logContextBase} (ID: ${this.finalItemId()}) Toggle attempt on disabled item.`);
    }
  }
}