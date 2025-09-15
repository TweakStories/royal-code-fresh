/**
 * @file ui-card.component.ts
 * @Version 7.0.0 (Definitive Rework: Configurable Hover Effects & Full Feature Retention)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Een robuuste, generieke kaartcomponent die alle eerdere functionaliteit herstelt en
 *   configureerbare hover-effecten introduceert.
 *   - FEATURE: Nieuwe `hoverEffectEnabled` input (boolean) om hover-animaties (schaal, schaduw, border)
 *     expliciet in te schakelen. Dit is essentieel voor een herbruikbare component.
 *   - FIX: Alle "passthrough" properties voor de UiTitleComponent zijn aanwezig.
 *   - FIX: De `CardRounding` en `rounding` input zijn correct geïmplementeerd.
 *   - FIX: De padding-logica is correct, waardoor `extraContentClasses` de controle heeft.
 */
import { ChangeDetectionStrategy, Component, input, computed, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { CardAppearance, CardBorderColor, CardRounding } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-card',
  standalone: true,
  imports: [CommonModule, UiTitleComponent],
  template: `
    <div [ngClass]="cardClasses()">
      <div [ngClass]="contentClasses()">
        @if (title(); as cardTitle) {
          <header class="mb-4">
            <royal-code-ui-title
              [level]="titleLevel()"
              [text]="cardTitle"
              [bold]="titleBold()"
              [center]="titleCenter()"
              [truncate]="titleTruncate()"
              [blockStyle]="titleBlockStyle()"
              [blockStyleType]="titleBlockStyleType()"
              [extraClasses]="titleExtraClasses()"
            />
          </header>
        }
        <ng-content />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiCardComponent {
  // === Card Container Properties ===
  readonly appearance = input<CardAppearance>('default');
  readonly borderColor = input<CardBorderColor>('default');
  readonly rounding = input<CardRounding>('xs');
  readonly extraContentClasses = input<string>('');
  readonly hoverEffectEnabled = input(false, { transform: booleanAttribute }); // Nieuwe input

  // === Title Passthrough Properties ===
  readonly title = input<string | undefined>();
  readonly titleLevel = input<TitleTypeEnum>(TitleTypeEnum.H3);
  readonly titleBold = input(true, { transform: booleanAttribute });
  readonly titleCenter = input(false, { transform: booleanAttribute });
  readonly titleTruncate = input(false, { transform: booleanAttribute });
  readonly titleBlockStyle = input(false, { transform: booleanAttribute });
  readonly titleBlockStyleType = input<'primary' | 'secondary'>('primary');
  readonly titleExtraClasses = input<string>('!text-lg');

  protected readonly TitleTypeEnum = TitleTypeEnum;

  readonly cardClasses = computed(() => {
    const base = 'w-full transition-all duration-300';
    const appearanceClass = this.appearance() === 'gradient'
      ? 'bg-gradient-to-br from-card to-surface-alt'
      : 'bg-card';

    const roundingClassMap: Record<CardRounding, string> = {
      none: 'rounded-none', xs: 'rounded-xs', sm: 'rounded-sm', md: 'rounded-md',
      lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full',
    };
    const roundingClass = roundingClassMap[this.rounding()];

    let borderClass = '';
    switch (this.borderColor()) {
      case 'primary':
        borderClass = 'border-2 border-primary';
        break;
      case 'gradient':
        borderClass = 'border-gradient-primary';
        break;
      default: // 'default'
        borderClass = this.hoverEffectEnabled()
          ? 'border-2 border-border group-hover:border-primary'
          : 'border-2 border-border';
        break;
    }

    const hoverClasses = this.hoverEffectEnabled()
      ? 'shadow-md group-hover:shadow-xl group-hover:scale-105'
      : 'shadow-md';

    return `${base} ${appearanceClass} ${borderClass} ${roundingClass} ${hoverClasses}`;
  });

  readonly contentClasses = computed(() => {
    return `p-6 ${this.extraContentClasses()}`;
  });
}