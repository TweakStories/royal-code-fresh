// libs/ui/stat-visualization/src/lib/components/resource-battery/ui-resource-battery.component.ts
import { Component, ChangeDetectionStrategy, InputSignal, Signal, computed, input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ResourceBatteryType = 'health' | 'mana' | 'stamina';
export type ResourceBatterySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface BarSegment {
  isFilled: boolean;
  key: string;
}

@Component({
  selector: 'royal-code-ui-resource-battery',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [ngClass]="containerClasses()"
      role="meter"
      [attr.aria-valuenow]="currentValue()"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="maxValue()"
      [attr.aria-label]="label() || type()"
      [title]="tooltipText()"
      class="resource-battery group"
    >
      <div class="battery-body relative w-full h-full border-2 bg-transparent"
           [ngClass]="[borderColorClass(), neonTargetClass()]">
        <!-- Border Onderbrekers -->
        <div class="absolute -top-0.5 left-1/4 w-1/2 h-0.5 bg-background z-10"></div>
        <div class="absolute -bottom-0.5 left-1/4 w-1/2 h-0.5 bg-background z-10"></div>
        <div class="absolute -left-0.5 top-1/4 h-1/2 w-0.5 bg-background z-10"></div>
        <div class="absolute -right-0.5 top-1/4 h-1/2 w-0.5 bg-background z-10"></div>

        <!-- Barretjes Container -->
        <div [ngClass]="barsContainerClasses()">
          @for (segment of segments(); track segment.key; let i = $index) {
            <div
              class="bar-segment"
              [class]="barHeightClass()"
              [ngClass]="{
                'bg-[var(--color-resource-health)]': segment.isFilled && type() === 'health',
                'bg-[var(--color-resource-mana)]': segment.isFilled && type() === 'mana',
                'bg-[var(--color-resource-stamina)]': segment.isFilled && type() === 'stamina',
                'bg-transparent': !segment.isFilled
              }"
              [style.box-shadow]="segment.isFilled ? innerGlowStyle() : 'none'"
            ></div>
          }
        </div>
      </div>
      @if (showValueText()) {
        <div class="text-center text-xs mt-1.5"
             [ngClass]="label() && label()!.length > 2 ? 'flex flex-col items-center' : 'text-foreground'">
          @if (label() && label()!.length > 2) {
            <span class="font-medium text-foreground">{{ label() }}</span>
            <span class="text-foreground">{{ currentValue() }} / {{ maxValue() }}</span>
          } @else {
            <span class="font-medium text-foreground">
              {{ label() ? label() + ':' : '' }} {{ currentValue() }} / {{ maxValue() }}
            </span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    .battery-body {
      transition: box-shadow 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    .bar-segment {
      transition: background-color 0.2s ease-out, box-shadow 0.2s ease-out;
    }
  `]
})
export class UiResourceBatteryComponent {
  readonly type: InputSignal<ResourceBatteryType> = input.required<ResourceBatteryType>();
  readonly currentValue: InputSignal<number> = input.required<number>();
  readonly maxValue: InputSignal<number> = input.required<number>();
  // readonly numberOfBars: InputSignal<number> = input(10); // VERWIJDERD
  readonly unitsPerBlock: InputSignal<number> = input<number>(1); // NIEUW of al bestaand, belangrijk voor segment berekening
  readonly sizeVariant: InputSignal<ResourceBatterySize> = input<ResourceBatterySize>('md');
  readonly label: InputSignal<string | undefined> = input<string>();
  readonly showValueText: InputSignal<boolean> = input(true);
  readonly enableNeonEffect = input(false, { transform: booleanAttribute });

  readonly containerClasses: Signal<string> = computed(() => {
    const size = this.sizeVariant();
    const sizeMap: Record<ResourceBatterySize, string> = {
      xs: 'w-5 h-7', sm: 'w-6 h-9', md: 'w-8 h-12',
      lg: 'w-10 h-16', xl: 'w-12 h-20',
    };
    return `inline-block ${sizeMap[size]}`;
  });

  readonly barsContainerClasses: Signal<string> = computed(() => {
    const size = this.sizeVariant();
    const paddingMap: Record<ResourceBatterySize, string> = {
      xs: 'p-0.5 space-y-px', sm: 'p-0.5 space-y-px', md: 'p-1 space-y-0.5',
      lg: 'p-1 space-y-0.5', xl: 'p-1.5 space-y-1',
    };
    return `relative w-full h-full flex flex-col justify-end overflow-hidden ${paddingMap[size]}`;
  });

  readonly barHeightClass: Signal<string> = computed(() => {
    const size = this.sizeVariant();
    const heightClassMap: Record<ResourceBatterySize, string> = {
      xs: 'h-[2px]', sm: 'h-1', md: 'h-1', lg: 'h-1.5', xl: 'h-1.5',
    };
    return heightClassMap[size];
  });

  readonly borderColorClass: Signal<string> = computed(() => {
    switch (this.type()) {
      case 'health':  return 'border-[var(--color-resource-health)]';
      case 'mana':    return 'border-[var(--color-resource-mana)]';
      case 'stamina': return 'border-[var(--color-resource-stamina)]';
      default:        return 'border-primary';
    }
  });

  readonly neonTargetClass: Signal<string> = computed(() => {
    if (!this.enableNeonEffect()) return '';
    let themeHueForNeon: string;
    switch (this.type()) {
      case 'health':  themeHueForNeon = 'fire'; break;
      case 'mana':    themeHueForNeon = 'water'; break;
      case 'stamina': themeHueForNeon = 'sun'; break;
      default:        themeHueForNeon = 'primary';
    }
    return `neon-card-border neon-${themeHueForNeon}`;
  });

  readonly innerGlowStyle: Signal<string> = computed(() => {
    if (!this.segments().some(s => s.isFilled)) return 'none';
    let hueVar: string;
    let satVar: string;
    switch (this.type()) {
      case 'health':  hueVar = 'var(--hue-resource-health)';   satVar = 'var(--sat-resource-health)';   break;
      case 'mana':    hueVar = 'var(--hue-resource-mana)';    satVar = 'var(--sat-resource-mana)';    break;
      case 'stamina': hueVar = 'var(--hue-resource-stamina)';  satVar = 'var(--sat-resource-stamina)';  break;
      default:        hueVar = 'var(--hue-app-primary)';    satVar = 'var(--sat-app-primary)';
    }
    return `inset 0 0 3px 1px hsla(${hueVar}, ${satVar}, 75%, 0.35)`;
  });

  readonly segments: Signal<BarSegment[]> = computed(() => {
    const maxVal = Math.max(1, this.maxValue());
    const currentVal = Math.max(0, Math.min(this.currentValue(), maxVal));
    const valPerBlock = Math.max(1, this.unitsPerBlock());

    // Totaal aantal visuele blokken wordt bepaald door maxValue en unitsPerBlock
    const totalVisualBlocks = Math.ceil(maxVal / valPerBlock);

    // Aantal gevulde visuele blokken
    const filledVisualBlocks = Math.floor(currentVal / valPerBlock);

    const segmentsArray: BarSegment[] = [];
    for (let i = 0; i < totalVisualBlocks; i++) { // Loop tot het berekende aantal visuele blokken
      segmentsArray.push({
        // Een blok 'i' (0-gebaseerd van onder) is gevuld als zijn 'positie vanaf boven'
        // binnen het aantal gevulde blokken valt.
        // Positie vanaf boven = (totalVisualBlocks - 1 - i)
        // Gevuld als (totalVisualBlocks - 1 - i) < filledVisualBlocks
        // Of, omgedraaid (en makkelijker te lezen voor vulling van onder naar boven):
        // het i-de segment is gevuld als i < filledVisualBlocks.
        // ECHTER, de visuele weergave vult van ONDER naar BOVEN,
        // dus het `i`-de segment (0 is het onderste) is gevuld als `i < filledVisualBlocks`.
        // De template rendert de @for van boven naar beneden, dus we moeten
        // de `isFilled` logica aanpassen zodat de *onderste* `filledVisualBlocks` segmenten gevuld zijn.
        // Als de bars visueel van ONDER naar BOVEN vullen in de flex-col:
        // isFilled: i < filledVisualBlocks,
        // Als de bars visueel van BOVEN naar ONDER vullen (wat hier het geval is door `justify-end` en de loop):
        isFilled: i >= (totalVisualBlocks - filledVisualBlocks),
        key: `bar-${i}-${totalVisualBlocks}`
      });
    }
    return segmentsArray;
  });

  readonly tooltipText: Signal<string> = computed(() => {
    const l = this.label();
    const c = this.currentValue();
    const m = this.maxValue();
    const t = this.type().charAt(0).toUpperCase() + this.type().slice(1);
    return l ? `${l}: ${c}/${m}` : `${t}: ${c}/${m}`;
  });
}
