/**
 * @file ui-rating.component.ts
 * @Version 1.3.4 // Added hover preview functionality and fixed missing method error.
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-07-28
 * @PromptSummary Updated UiRatingComponent with hover preview functionality that shows filled stars up to hovered position. Added proper method declarations and hover state management.
 * @Description The definitive, standalone Angular component for displaying a star rating.
 *              It correctly supports a 0-10 data scale, is fully compatible with both template-driven
 *              and reactive forms (`ControlValueAccessor`), and uses `UiIconComponent` with Lucide icons.
 *              Features interactive hover preview for rating selection and readonly mode for display only.
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, OutputEmitterRef, signal, WritableSignal, effect, forwardRef, ViewEncapsulation } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';

/**
 * @Interface StarRenderData
 * @Description Represents the rendering state for a single visual star.
 */
interface StarRenderData {
  index: number;
  state: 'full' | 'half' | 'empty';
}

@Component({
  selector: 'royal-code-ui-rating',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiIconComponent],
  template: `
    <div
      class="flex items-center gap-0.5"
      role="img"
      [attr.aria-label]="ratingAriaLabel()"
      (mouseleave)="!isEffectivelyDisabled() && handleStarHover(0)"
    >
      @for (star of starRenderData(); track star.index) {
        <span
          class="text-lg leading-none transition-colors duration-200"
          [ngClass]="getStarClasses(star)"
          [class.cursor-pointer]="!isEffectivelyDisabled()"
          [class.hover:text-primary-hover]="!isEffectivelyDisabled() && star.state === 'empty'"
          [class.hover:opacity-80]="!isEffectivelyDisabled() && (star.state === 'full' || star.state === 'half')"
          (click)="!isEffectivelyDisabled() && handleStarClick(star.index + 1)"
          (keydown.enter)="!isEffectivelyDisabled() && handleStarClick(star.index + 1)"
          (keydown.space)="!isEffectivelyDisabled() && handleStarClick(star.index + 1); $event.preventDefault()"
          (mouseenter)="!isEffectivelyDisabled() && handleStarHover(star.index + 1)"
          (mouseleave)="!isEffectivelyDisabled() && handleStarHover(0)"
          [tabindex]="isEffectivelyDisabled() ? -1 : 0"
          [attr.aria-hidden]="true"
        >
          @if (star.state === 'half') {
            <!-- Half ster: combinatie van outline base + half-filled overlay -->
            <div class="relative">
              <!-- Base: outline ster -->
              <royal-code-ui-icon
                [icon]="AppIcon.Star"
                [colorClass]="'text-secondary'"
              />
              <!-- Overlay: gevulde ster met clip-path voor linkerhelft -->
              <div class="absolute inset-0 half-star-fill">
                <royal-code-ui-icon
                  [icon]="AppIcon.Star"
                  [colorClass]="'text-primary'"
                />
              </div>
            </div>
          } @else if (star.state === 'full') {
            <!-- Volle ster: gebruik Star icon met primary fill -->
            <royal-code-ui-icon
              [icon]="AppIcon.Star"
              [colorClass]="'text-primary'"
            />
          } @else {
            <!-- Lege ster: gebruik Star icon zonder fill, alleen outline -->
            <royal-code-ui-icon
              [icon]="AppIcon.Star"
              [colorClass]="'text-secondary'"
            />
          }
        </span>
      }
    </div>
  `,
  styles: [`
    royal-code-ui-rating {
      display: inline-flex;
    }

    /* Forceer de fill op SVG elementen - overschrijf Lucide's hardcoded fill="none" */
    royal-code-ui-rating .star-filled lucide-icon svg {
      fill: var(--color-primary) !important;
      color: var(--color-primary);
    }

    royal-code-ui-rating .star-empty lucide-icon svg {
      fill: none !important;
      color: var(--color-secondary);
    }

    /* Half sterren: clip de gevulde overlay tot de linkerhelft */
    royal-code-ui-rating .half-star-fill {
      clip-path: polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%);
    }

    /* Zorg dat de half-star overlay ook gevuld wordt */
    royal-code-ui-rating .half-star-fill lucide-icon svg {
      fill: var(--color-primary) !important;
      color: var(--color-primary);
    }

    /* Hover effects voor interactieve ratings */
    royal-code-ui-rating .star-icon {
      transition: all 0.2s ease-in-out;
    }

    /* Voeg een subtiele glow toe bij hover op interactieve ratings */
    royal-code-ui-rating .star-icon:hover:not(.readonly) lucide-icon svg {
      filter: drop-shadow(0 0 2px currentColor);
    }

    /* Zorg dat filled sterren een subtiele opacity change hebben bij hover */
    royal-code-ui-rating .star-icon:hover.star-filled lucide-icon svg {
      opacity: 0.85;
    }

    /* Half-star hover effects - apply to both base and overlay */
    royal-code-ui-rating .star-icon:hover.star-half .half-star-fill lucide-icon svg {
      opacity: 0.85;
    }

    /* Also apply hover to the base outline star in half-stars */
    royal-code-ui-rating .star-icon:hover.star-half > royal-code-ui-icon lucide-icon svg {
      opacity: 0.85;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // Disable encapsulation so CSS can reach nested components
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiRatingComponent),
      multi: true
    }
  ]
})
export class UiRatingComponent implements ControlValueAccessor {
  /**
   * @description Optional input for setting an initial rating value when not using forms.
   */
  readonly rating = input<number>(0);

  /**
   * @description If true, the rating component is for display only and cannot be changed by user interaction.
   */
  readonly readonly = input<boolean>(false);

  /**
   * @description Emits the new rating value (on a 0-10 scale) when a star is clicked.
   */
  readonly ratingChange: OutputEmitterRef<number> = output<number>();

  /**
   * @description Internal signal for managing the rating value. It's the single source of truth inside the component.
   */
  private readonly _currentRating = signal(0);

  /**
   * @description Internal signal to track the disabled state coming from the form control.
   */
  private readonly _formDisabled = signal(false);

  /**
   * @description Internal signal to track which star is currently being hovered (1-based index, 0 = no hover).
   */
  private readonly _hoveredStarIndex = signal(0);

  private readonly visualMaxStars = 5;
  private readonly dataMaxRating = 10;
  private readonly translate = inject(TranslateService, { optional: true });

  readonly AppIcon = AppIcon;

  // CVA required functions
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isEffectivelyDisabled = computed(() => this.readonly() || this._formDisabled());

constructor() {
    effect(() => {
      if (!this._formDisabled()) { // Zorg ervoor dat deze update niet conflicteert als het formulier al disabled is
        this._currentRating.set(this.rating());
      }
    });
  }


  readonly starRenderData = computed<StarRenderData[]>(() => {
    const currentRating = Math.max(0, Math.min(this._currentRating(), this.dataMaxRating));
    const hoveredIndex = this._hoveredStarIndex();
    const isInteractive = !this.isEffectivelyDisabled();

    // Gebruik hover preview als hovering en interactief, anders gebruik huidige rating
    const effectiveRating = isInteractive && hoveredIndex > 0
      ? hoveredIndex * 2 // Als er gehoverd wordt, vul alle sterren tot en met de gehoverde ster (x2 omdat 1 ster = 2 punten)
      : currentRating;

    const states: StarRenderData[] = [];
    for (let i = 0; i < this.visualMaxStars; i++) {
      const starValue = (i + 1); // 1-based index voor de ster zelf
      
      // Bereken de drempels in de 0-10 data schaal
      const fullThreshold = starValue * 2;   // bv. voor ster 3: 3*2=6
      const halfThreshold = starValue * 2 - 1; // bv. voor ster 3: 3*2-1=5

      if (effectiveRating >= fullThreshold) {
        states.push({ index: i, state: 'full' });
      } else if (effectiveRating >= halfThreshold) {
        states.push({ index: i, state: 'half' });
      } else {
        states.push({ index: i, state: 'empty' });
      }
    }
    return states;
  });

  getStarClasses(star: StarRenderData): string {
    const baseClasses = 'star-icon';
    const disabledClass = this.isEffectivelyDisabled() ? 'readonly' : '';

    let stateClass = '';
    switch (star.state) {
      case 'full':
        stateClass = 'star-filled';
        break;
      case 'half':
        stateClass = 'star-half'; // Separate class for half stars
        break;
      case 'empty':
      default:
        stateClass = 'star-empty';
        break;
    }

    return [baseClasses, stateClass, disabledClass].filter(Boolean).join(' ');
  }

  readonly ratingAriaLabel = computed(() => {
    const rating = this._currentRating();
    const stars = rating / 2; // Convert 0-10 scale to 0-5 stars for user comprehension
    const params = { rating, max: this.dataMaxRating, stars };

    if (this.translate) {
      return this.translate.instant('RATING.ARIA_LABEL', params);
    }
    return `Rating: ${stars.toFixed(1)} out of 5 stars`;
  });

  handleStarClick(clickedVisualStarIndexOneBased: number): void {
    if (this.isEffectivelyDisabled()) return;
    const newRatingValue = clickedVisualStarIndexOneBased * 2;
    this._currentRating.set(newRatingValue);
    this.onChange(newRatingValue);
    this.onTouched();
    this.ratingChange.emit(newRatingValue);
  }

  handleStarHover(hoveredStarIndexOneBased: number): void {
    if (this.isEffectivelyDisabled()) return;
    this._hoveredStarIndex.set(hoveredStarIndexOneBased);
  }

  // ==================================================================================
  // ControlValueAccessor Implementation
  // ==================================================================================

  
  writeValue(value: number | null | undefined): void {
    this._currentRating.set(value ?? 0);
  }


  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }


  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._formDisabled.set(isDisabled);
  }
}
