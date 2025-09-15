// libs/ui/meters/src/lib/components/bar-segment/ui-bar-segment.component.ts
/**
 * @fileoverview
 * Defines the UiBarSegmentComponent, responsible for rendering a single
 * visual segment within a segmented bar. This version aims to closely replicate
 * the visual output of the original ui-stat-bar-segment.
 *
 * @Component UiBarSegmentComponent
 * @description
 * Renders one piece of a segmented bar. Styling is primarily achieved through computed
 * CSS classes and inline styles for gradients, aiming for the "cosmic" gradient
 * for chevrons and themeable block styles.
 * @version 1.0.3 - Corrected template syntax and aligned styling logic closely with original.
 * @author ChallengerAppDevAI
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  InputSignal,
  Signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SegmentState, SegmentStyle } from '../../models/meter-config.model';

@Component({
  selector: 'royal-code-ui-bar-segment',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bar-segment relative w-[28px] h-[18px]"
      [ngClass]="shapeClasses()"
      [style.background-image]="computedBackgroundStyle()"
      [style.backgroundColor]="state() === SegmentState.Empty ? 'var(--meter-segment-empty-bg, var(--color-muted))' : 'transparent'"
      [style.opacity]="state() === SegmentState.Empty ? '0.3' : '1'"
      [title]="tooltip()">
      <!-- Inhoud van de div is hier niet nodig, styling gebeurt op de div zelf -->
    </div>
  `,
  styles: [`
    .bar-segment {
      /* transition: background-image 0.2s ease-out, opacity 0.2s ease-out; */ /* Transition kan performance kosten */
    }
    .segment-shape-chevron {
      clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%, 6px 50%);
    }
    .segment-shape-chevron.is-first-segment {
      clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%);
    }
    .segment-shape-chevron.is-single-segment { /* Als er maar één segment is, maak het een rechthoek */
      clip-path: inset(0);
    }
    .segment-shape-block {
      /* Als je Tailwind classes gebruikt voor de block shape, voeg die toe via ngClass in shapeClasses */
      /* bijv. 'rounded-sm' */
    }
  `]
})
export class UiBarSegmentComponent {
  readonly state: InputSignal<SegmentState> = input.required<SegmentState>();
  readonly isFirst: InputSignal<boolean> = input(false);
  readonly isLast: InputSignal<boolean> = input(false);
  readonly tooltip: InputSignal<string | undefined> = input<string | undefined>();
  readonly segmentIndex: InputSignal<number> = input.required<number>();
  readonly totalSegments: InputSignal<number> = input.required<number>();
  readonly displayStyle: InputSignal<SegmentStyle | undefined> = input<SegmentStyle | undefined>(SegmentStyle.Chevron);
  readonly colorPatternKey: InputSignal<string | undefined> = input<string | undefined>(); // bv. 'attribute_strength'

  readonly SegmentState = SegmentState; // Voor gebruik in computed signals indien nodig

  /**
   * @Signal shapeClasses
   * @description Computes CSS classes for the segment's shape.
   * @internal
   */
  readonly shapeClasses: Signal<string> = computed(() => {
    const style = this.displayStyle() ?? SegmentStyle.Chevron;
    const classes: string[] = [`segment-shape-${style.toLowerCase()}`];

    if (style === SegmentStyle.Chevron) {
      if (this.isFirst() && this.isLast()) classes.push('is-single-segment');
      else if (this.isFirst()) classes.push('is-first-segment');
    } else if (style === SegmentStyle.Block) {
      classes.push('rounded-sm'); // Standaard afronding voor block-stijl
    }
    return classes.join(' ');
  });

  /**
   * @Signal computedBackgroundStyle
   * @description Computes the `background-image` style, primarily for the "cosmic" gradient
   *              when the display style is 'Chevron' and the state is not 'Empty'.
   *              Voor 'Block' stijl, is het idee dat de theming via CSS vars in `styles.scss`
   *              voor de specifieke `colorPatternKey` zou kunnen gaan, of een simpelere gradient hier.
   * @internal
   */
  readonly computedBackgroundStyle: Signal<string> = computed((): string => {
    const currentState = this.state();
    if (currentState === SegmentState.Empty) {
      return 'none'; // Geen background-image, alleen backgroundColor
    }

    const currentVisualStyle = this.displayStyle() ?? SegmentStyle.Chevron;
    // De colorPatternKey (voorheen resourceType) kan gebruikt worden om basiskleuren te bepalen,
    // maar de "kosmische" gradient was complexer.
    // const patternKey = this.colorPatternKey();

    if (currentVisualStyle === SegmentStyle.Chevron) {
      // Precies dezelfde "kosmische" HSL-gebaseerde gradient logica als in je werkende frontend-code.md
      // voor ui-stat-bar-segment.component.ts (maar aangepast voor signal inputs)
      const segmentIdx = this.segmentIndex();
      const totalSegs = Math.max(1, this.totalSegments());
      const progress = totalSegs > 1 ? segmentIdx / (totalSegs - 1) : 0;

      const startHueCool = 120; const endHueCool = 220; // Groen naar Blauw
      const startHueFiery = 50; const endHueFiery = 0;   // Geel/Oranje naar Rood
      let baseHue: number;

      if (progress < 0.5) { // Eerste helft
        baseHue = startHueCool + (endHueCool - startHueCool) * (progress * 2);
      } else { // Tweede helft
        baseHue = startHueFiery + (endHueFiery - startHueFiery) * ((progress - 0.5) * 2);
      }
      baseHue = (baseHue % 360 + 360) % 360; // Normaliseer hue

      let saturation = 90;
      let lightness = 55;
      let alpha = 0.8;

      // Pas lightness/saturation/alpha aan op basis van de *daadwerkelijke* state
      if (currentState === SegmentState.Filled) {
        saturation = 95; lightness = 60; alpha = 1;
      } else if (currentState === SegmentState.BonusFilled) {
        // Voor bonus, maak het goud/geelachtig, ongeacht de 'progress' hue
        baseHue = 50; saturation = 100; lightness = 70; alpha = 1;
      } else if (currentState === SegmentState.Depleted) {
        // Voor depleted, maak het rood-achtig, ongeacht de 'progress' hue
        baseHue = 0; saturation = 70; lightness = 40; alpha = 0.7;
      }

      const color1 = `hsla(${baseHue - 10}, ${saturation}%, ${lightness + 5}%, ${alpha})`;
      const color2 = `hsla(${baseHue},      ${saturation}%, ${lightness}%, ${alpha + 0.15})`;
      const color3 = `hsla(${baseHue + 10}, ${saturation}%, ${lightness - 5}%, ${alpha})`;
      return `radial-gradient(circle, ${color2} 0%, ${color1} 50%, ${color3} 100%)`;
    }

    if (currentVisualStyle === SegmentStyle.Block) {
      // Voor 'Block' stijl, kun je een simpele CSS variabele gebruiken of een basis gradient.
      // Dit deel was minder expliciet in de originele code, die focuste op chevron.
      // Laten we een fallback nemen op basis van de state, met CSS vars als basis.
      let colorVar = 'var(--color-primary)'; // Default
      if (currentState === SegmentState.BonusFilled) colorVar = 'var(--color-meter-bonus-fill, gold)';
      if (currentState === SegmentState.Depleted) colorVar = 'var(--color-meter-depleted-fill, var(--color-destructive))';
      // Voor SegmentStyle.Block, zou een solide kleur of een simpelere gradient logischer zijn
      // dan de complexe "kosmische" gradient. Hier een solide kleur:
      return `linear-gradient(to right, ${colorVar}, color-mix(in srgb, ${colorVar} 80%, black 20%))`;
    }

    return 'none'; // Fallback
  });
}