// libs/ui/meters/src/lib/components/segmented-bar/ui-segmented-bar.component.ts
/**
 * @fileoverview Defines the UiSegmentedBarComponent for displaying a bar composed of visual segments.
 * This component is responsible *only* for rendering the visual bar itself.
 * Any surrounding labels, icons, or value texts must be handled by the parent component.
 *
 * @Component UiSegmentedBarComponent
 * @description
 * Renders a series of `UiBarSegmentComponent` instances based on the provided `SegmentedBarConfig`.
 * It calculates the state of each segment (filled, bonus, depleted, empty)
 * and passes the necessary properties to the child segment components.
 * This component is part of the `@royal-code/ui/meters` library.
 * @version 1.0.0 - Initial focused version for rendering only segments.
 * @author ChallengerAppDevAI
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  InputSignal,
  Signal,
} from '@angular/core';

import { UiBarSegmentComponent } from '../bar-segment/ui-bar-segment.component'; // Correcte pad
import { SegmentState, SegmentStyle, SegmentedBarConfig } from '../../models/meter-config.model'; // Pad naar lokaal model

/**
 * @interface RenderSegment
 * @description Internal interface defining the properties needed to render a single segment.
 * @internal
 */
interface RenderSegment {
  key: string;
  state: SegmentState;
  isFirst: boolean;
  isLast: boolean;
  tooltip: string;
  segmentIndex: number;
  totalSegments: number;
  displayStyle: SegmentStyle;
  colorPatternKey?: string;
}

@Component({
  selector: 'royal-code-ui-segmented-bar',
  standalone: true,
  imports: [
    UiBarSegmentComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Renders only the bar segments based on the config input -->
    @if (config()) {
      <div class="flex items-center" [style.gap]="segmentGap()"
           role="progressbar"
           [attr.aria-label]="config()!.ariaLabel || 'Segmented bar'"
           [attr.aria-valuenow]="config()!.filledValue"
           [attr.aria-valuemin]="0"
           [attr.aria-valuemax]="config()!.totalValue">
        @for (segment of renderedSegments(); track segment.key) {
          <royal-code-ui-bar-segment
            [state]="segment.state"
            [isFirst]="segment.isFirst"
            [isLast]="segment.isLast"
            [tooltip]="segment.tooltip"
            [segmentIndex]="segment.segmentIndex"
            [totalSegments]="segment.totalSegments"
            [displayStyle]="segment.displayStyle"
            [colorPatternKey]="segment.colorPatternKey"
          />
        }
      </div>
    } @else {
      <!-- Fallback UI if config is not yet available, e.g., a simple loading skeleton -->
      <div class="h-[18px] bg-muted rounded animate-pulse w-full"
           aria-label="Loading segmented bar">
      </div>
    }
  `,
  styles: [` :host { display: block; } `], // Ensures the component can be sized by its parent
})
export class UiSegmentedBarComponent {
  /**
   * @Input config
   * @description The configuration object defining the segmented bar's appearance and data. Required.
   * See `SegmentedBarConfig` interface for details.
   */
  readonly config: InputSignal<SegmentedBarConfig | undefined> = input.required<SegmentedBarConfig | undefined>();

  /**
   * @internal
   * @Signal renderedSegments
   * @description Generates an array of `RenderSegment` objects, each representing a segment's state
   * and properties, for rendering by child `UiBarSegmentComponent` instances.
   * This logic determines how many segments are filled, bonus, depleted, or empty based on the input config.
   */
  readonly renderedSegments: Signal<RenderSegment[]> = computed(() => {
    const cfg = this.config();
    // Ensure config and essential properties are available before proceeding
    if (!cfg || cfg.numberOfSegments <= 0 || cfg.totalValue <= 0) {
      return [];
    }

    const totalVisSegments = Math.max(1, cfg.numberOfSegments);
    const valuePerSegment = cfg.totalValue / totalVisSegments;

    const filledValue = cfg.filledValue;
    const bonusValue = cfg.bonusValue ?? 0;
    const depletedValue = cfg.depletedValue ?? 0;

    const segments: RenderSegment[] = [];
    for (let i = 0; i < totalVisSegments; i++) {
      const segmentEndValue = (i + 1) * valuePerSegment;
      let segmentState: SegmentState;

      // Determine segment state based on values
      // Order of checks is important: depleted, then filled, then bonus
      if (segmentEndValue <= depletedValue) {
        segmentState = SegmentState.Depleted;
      } else if (segmentEndValue <= filledValue) {
        segmentState = SegmentState.Filled;
      } else if (segmentEndValue <= filledValue + bonusValue) {
        // Bonus segments are those *after* the regular fill, up to the bonus value limit
        segmentState = SegmentState.BonusFilled;
      } else {
        segmentState = SegmentState.Empty;
      }

      const tooltipText = `${cfg.ariaLabel || 'Segment'}: ${i + 1}/${totalVisSegments}`;

      segments.push({
        key: `segbar-seg-${i}-${cfg.ariaLabel ?? 'bar'}-${cfg.segmentColorPattern ?? ''}`,
        state: segmentState,
        isFirst: i === 0,
        isLast: i === totalVisSegments - 1,
        tooltip: tooltipText,
        segmentIndex: i,
        totalSegments: totalVisSegments,
        displayStyle: cfg.displayStyle ?? SegmentStyle.Chevron,
        colorPatternKey: cfg.segmentColorPattern,
      });
    }
    return segments;
  });

  /**
   * @internal
   * @Signal segmentGap
   * @description Determines the CSS gap string between segments based on the `displayStyle`.
   */
  readonly segmentGap: Signal<string> = computed(() => {
    const style = this.config()?.displayStyle ?? SegmentStyle.Chevron;
    return style === SegmentStyle.Chevron ? '1px' : '2px';
  });

  /**
   * @internal
   * TrackBy function for Angular's `@for` directive over segments.
   */
  trackByKey(_index: number, segment: RenderSegment): string {
    return segment.key;
  }
}