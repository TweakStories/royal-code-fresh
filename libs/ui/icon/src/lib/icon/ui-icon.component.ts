/**
 * @file ui-icon.component.ts
 * @Version 1.4.0 - Fixed Button Integration
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-20
 * @Description Een standalone Angular component voor het consistent weergeven van Lucide iconen.
 *              Verbeterde versie met betere button integratie en minder wrapper divs.
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  Signal,
  OnInit,
  Injector,
  HostBinding,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AppIcon } from '@royal-code/shared/domain';

type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'inherit';

@Component({
  selector: 'royal-code-ui-icon',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (iconMode()) {
      @case ('background') {
        <!-- Background mode: only for explicit backgrounds -->
        <div class="rc-ui-icon-wrapper inline-block">
          <div
            class="rc-icon-background flex flex-col items-center justify-center p-1.5 rounded-md"
            [ngClass]="computedBackgroundClass()"
          >
            <lucide-icon
              [name]="iconName()"
              [attr.aria-label]="ariaLabel()"
              [size]="computedIconSizeNumber()"
              [strokeWidth]="computedStrokeWidthNumber()"
              [ngClass]="[computedColorClass(), iconClass() ?? '']"
              [attr.aria-hidden]="!ariaLabel()"
            >
            </lucide-icon>
            @if (itemDescription(); as desc) {
              <span class="mt-1 text-center text-[10px] leading-tight" [ngClass]="computedColorClass()">
                 {{ desc }}
              </span>
            }
          </div>
        </div>
      }

      @case ('inline') {
        <!-- Inline mode: wrapper sized to exactly match SVG -->
        <span
          class="inline-flex items-center justify-center flex-shrink-0"
          [ngClass]="extraClass() ?? ''"
          [style.width.px]="computedIconSizeNumber()"
          [style.height.px]="computedIconSizeNumber()"
          style="line-height: 1;"
        >
          <lucide-icon
            [name]="iconName()"
            [attr.aria-label]="ariaLabel()"
            [size]="computedIconSizeNumber()"
            [strokeWidth]="computedStrokeWidthNumber()"
            [ngClass]="[computedColorClass(), iconClass() ?? '', extraClassSignal() ?? '']"
            [attr.aria-hidden]="!ariaLabel()">
          </lucide-icon>
        </span>
      }

      @case ('simple') {
        <!-- Simple mode: direct icon, SVG determines size -->
        <lucide-icon
          [name]="iconName()"
          [attr.aria-label]="ariaLabel()"
          [size]="computedIconSizeNumber()"
          [strokeWidth]="computedStrokeWidthNumber()"
          [ngClass]="[computedColorClass(), iconClass() ?? '', extraClass() ?? '', extraClassSignal() ?? '']"
          [attr.aria-hidden]="!ariaLabel()">
        </lucide-icon>
      }
    }
  `,
})
export class UiIconComponent implements OnInit {
  private readonly injector = inject(Injector);
  private readonly logPrefix = '[UiIconComponent]';

  // --- Inputs (HERNOEMD: geen 'Signal' suffix, geen aliassen) ---
  /** @description Het icoon dat weergegeven moet worden, van het type `AppIcon` enum. Vereist. */
  public readonly icon: InputSignal<AppIcon | keyof typeof AppIcon | string | null> = input.required<AppIcon | keyof typeof AppIcon | string | null>();

  /** @description Optioneel label dat naast of onder het icoon wordt getoond (niet bij `showBackground`). */
  public readonly label: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Optionele beschrijving die onder het icoon wordt getoond wanneer `showBackground` true is. */
  public readonly itemDescription: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Positie van het label relatief aan het icoon (alleen als `showBackground` false is). Default 'right'. */
  public readonly labelPosition: InputSignal<'bottom' | 'right'> = input<'bottom' | 'right'>('right');

  /** @description De groottevariant van het icoon. Default 'md'. */
  public readonly sizeVariant: InputSignal<SizeVariant> = input<SizeVariant>('md');

  /** @description Optionele Tailwind CSS class(es) voor de kleur van het icoon (en label/description indien niet overschreven). Default 'text-current'. */
  public readonly colorClass: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Optionele stroke width voor het Lucide icoon. Kan een getal of string zijn. */
  public readonly strokeWidth: InputSignal<string | number | undefined> = input<string | number | undefined>();

  /** @description Boolean (of string "true"/"false") om een achtergrondvlak achter het icoon te tonen. Default false. */
  public readonly showBackground = input(false, { transform: (value: boolean | string) => typeof value === 'string' ? (value === '' || value.toLowerCase() === 'true') : !!value });

  /** @description Optionele Tailwind CSS class(es) voor de styling van het achtergrondvlak. Default 'bg-surface'. */
  public readonly backgroundClass: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Optionele extra Tailwind CSS class(es) om toe te voegen aan de root container van het icoon. */
  public readonly extraClass: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Optionele extra Tailwind CSS class(es) om direct aan het `<lucide-icon>` element toe te voegen. */
  public readonly iconClass: InputSignal<string | undefined> = input<string | undefined>();

  /** @description Extra signal om van buitenaf classes toe te voegen (voor backwards compatibility). */
  public readonly extraClassSignal: InputSignal<string | undefined> = input<string | undefined>();

  @HostBinding('attr.role')
  get hostRole(): string | null {
    return this.label() || this.itemDescription() ? 'figure' : 'img';
  }

  @HostBinding('attr.aria-label')
  get hostAriaLabel(): string | null {
    if (this.label() || this.itemDescription()) return null;
    return this.icon() || null;
  }

  constructor() {
    // effect(() => {
    //   // Debugging hier indien nodig
    // }, { injector: this.injector });
  }

  // Simplified mode detection
  readonly iconMode = computed<'background' | 'simple' | 'inline'>(() => {
    // Background mode: only for explicit showBackground
    if (this.showBackground()) return 'background';

    // Detect inline mode: spacing classes suggest text alongside icon
    const extraClasses = this.extraClass() || '';
    const extraClassSignal = this.extraClassSignal() || '';
    const allExtraClasses = `${extraClasses} ${extraClassSignal}`.trim();

    // Common spacing classes used with text
    const inlineIndicators = ['mr-', 'ml-', 'space-x-', 'gap-'];
    const hasInlineSpacing = inlineIndicators.some(indicator =>
      allExtraClasses.includes(indicator)
    );

    if (hasInlineSpacing) return 'inline';

    // Default to simple for standalone icons
    return 'simple';
  });

  ngOnInit(): void {
    this.validateInputType('colorClass', this.colorClass());
    this.validateInputType('extraClass', this.extraClass());
    this.validateInputType('iconClass', this.iconClass());
    this.validateInputType('backgroundClass', this.backgroundClass());
  }

  private validateInputType(inputName: string, inputValue: unknown): void {
    if (typeof inputValue === 'object' && inputValue !== null && !Array.isArray(inputValue)) {
      console.error(`${this.logPrefix} CRITICAL TYPE ERROR for icon '${this.icon()}': Input '${inputName}' received an OBJECT. Value:`, inputValue);
    }
  }

  // --- Computed Signals (gebruiken nu de hernoemde input signals) ---

  public readonly iconName: Signal<string> = computed(() => {
    const currentIcon = this.icon();
    return currentIcon || 'alert-circle';
  });

  public readonly ariaLabel: Signal<string | undefined> = computed(() => {
    return this.label() || this.itemDescription() || this.iconName();
  });

  public readonly computedIconSizeNumber: Signal<number | undefined> = computed(() => {
    const sizeMap: { [key in SizeVariant]: number | undefined } = {
      xs: 14, sm: 16, md: 20, lg: 24, xl: 32, inherit: undefined,
    };
    return sizeMap[this.sizeVariant()] ?? undefined;
  });

  public readonly computedIconSizeClass: Signal<string> = computed(() => {
    // Alleen gebruiken wanneer we sizing control willen (niet voor simple mode)
    const sizeMap: { [key in SizeVariant]: string } = {
      xs: 'w-3.5 h-3.5', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6', xl: 'w-8 h-8', inherit: 'w-auto h-auto',
    };
    return sizeMap[this.sizeVariant()] ?? 'w-auto h-auto';
  });

  public readonly computedStrokeWidthNumber: Signal<number | undefined> = computed(() => {
    const rawValue = this.strokeWidth();
    if (rawValue === undefined || rawValue === null || rawValue === '') return undefined;
    const num = Number(rawValue);
    return isNaN(num) ? undefined : num;
  });

  public readonly computedColorClass: Signal<string> = computed(() => {
    const color = this.colorClass();
    if (typeof color === 'object' && color !== null && !Array.isArray(color)) {
      console.error(`${this.logPrefix} computedColorClass received an OBJECT for icon '${this.icon()}'. Value:`, color);
      return 'text-red-600 dark:text-red-400 border-2 border-red-500 !bg-yellow-200';
    }

    // Combineer alle extra classes
    const extraClasses = [
      color ?? 'text-current',
      this.extraClassSignal() ?? ''
    ].filter(Boolean).join(' ');

    return extraClasses;
  });

  public readonly containerClasses: Signal<string> = computed(() => {
    const hasLabel = !!this.label();
    const showingBackground = this.showBackground();
    let layoutClasses = '';

    if (showingBackground) {
      layoutClasses = 'inline-block align-middle';
    } else if (hasLabel) {
      layoutClasses = (this.labelPosition() === 'bottom')
        ? 'inline-flex flex-col items-center align-middle'
        : 'inline-flex items-center align-middle';
    } else {
      layoutClasses = 'inline-block align-middle';
    }
    return layoutClasses.trim();
  });

  public readonly innerContainerClasses: Signal<string> = computed(() => {
    if (!this.showBackground() && this.label()) {
      return this.labelPosition() === 'bottom'
        ? 'flex flex-col items-center'
        : 'inline-flex items-center space-x-1 md:space-x-1.5';
    }
    return 'flex items-center justify-center';
  });

  public readonly labelClasses: Signal<string> = computed(() => {
    if (!this.showBackground() && this.label()) {
      const base = 'rc-icon-label text-xs leading-none';
      const position = this.labelPosition() === 'bottom' ? 'mt-1 text-center' : 'ml-1 md:ml-1.5';
      return `${base} ${position} ${this.computedColorClass()}`;
    }
    return '';
  });

  public readonly computedBackgroundClass: Signal<string> = computed(() => {
    const bgClass = this.backgroundClass();
    if (typeof bgClass === 'object' && bgClass !== null && !Array.isArray(bgClass)) {
        console.error(`${this.logPrefix} computedBackgroundClass received an OBJECT for icon '${this.icon()}'. Value:`, bgClass);
        return '!bg-red-200 border-2 border-red-500';
    }
    return bgClass ?? 'bg-surface group-hover/button:bg-hover';
  });
}