// libs/ui/meters/src/lib/components/meter-display/ui-meter-display.component.ts
/**
 * @fileoverview
 * Defines the UiMeterDisplayComponent, a flexible layout component for presenting
 * a single statistic or value with an icon, textual information (name, value),
 * and a projected visual representation (e.g., a segmented bar or percentage bar).
 *
 * @Component UiMeterDisplayComponent
 * @description
 * This component acts as a configurable wrapper. It allows choosing the layout
 * (e.g., icon/text to the left of visualization, or icon/text above visualization)
 * or projecting its parts into an external grid. It expects the actual visualizer
 * component (like UiSegmentedBarComponent) to be projected into its `visualizationTemplate`
 * slot for internal layouts, or for the parts to be projected directly by the parent
 * when using 'parts-for-grid' layoutMode.
 * @version 1.2.0 - Added 'parts-for-grid' layoutMode and host display:contents binding.
 * @author ChallengerAppDevAI
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  InputSignal,
  TemplateRef,
  HostBinding, // Import HostBinding
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';


// Add 'parts-for-grid' to the existing type
export type MeterDisplayLayoutMode = 'icon-text-left-vis-right' | 'icon-text-top-vis-bottom' | 'parts-for-grid';
export type StatVisualizationType = 'segmented-bar' | 'percentage-bar' | 'none';

@Component({
  selector: 'royal-code-ui-meter-display',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    UiIconComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      Conditionally render based on layoutMode.
      If 'parts-for-grid', project content directly for the parent grid.
      Otherwise, use the internal flex layout.
    -->
    @if (layoutMode() === 'parts-for-grid') {
      <ng-content select="[meter-label-content]"></ng-content>
      <ng-content select="[meter-visualization-content]"></ng-content>
    } @else {
      <!-- Original Flexbox layout for 'icon-text-left-vis-right' and 'icon-text-top-vis-bottom' -->
      <div
        class="meter-display-item-internal flex w-full items-center"
        [ngClass]="{
          'flex-row gap-x-3': layoutMode() === 'icon-text-left-vis-right',
          'flex-col gap-y-1': layoutMode() === 'icon-text-top-vis-bottom'
        }"
        role="group"
        [attr.aria-labelledby]="(labelKey() || '') + '-label'"
        [attr.aria-describedby]="(labelKey() || '') + '-value-text'"
      >
        <!-- Icon & Text Block -->
        <div
          class="icon-text-block flex items-center"
          [ngClass]="{
            'flex-shrink-0 min-w-[10ch] gap-x-1.5': layoutMode() === 'icon-text-left-vis-right',
            'w-full gap-x-2 mb-0.5': layoutMode() === 'icon-text-top-vis-bottom',
            'justify-start': layoutMode() === 'icon-text-top-vis-bottom' && iconPosition() === 'top-left',
            'flex-col items-center text-center': layoutMode() === 'icon-text-top-vis-bottom' && iconPosition() === 'top-center'
          }"
        >
          @if (icon(); as meterIcon) {
            <royal-code-ui-icon [icon]="meterIcon" [sizeVariant]="iconSize()" [colorClass]="iconColorClass()" />
          }
          <div class="flex flex-col"
               [ngClass]="{
                 'text-left': layoutMode() === 'icon-text-left-vis-right' || (layoutMode() === 'icon-text-top-vis-bottom' && iconPosition() === 'top-left'),
                 'items-center text-center': layoutMode() === 'icon-text-top-vis-bottom' && iconPosition() === 'top-center'
               }">
            @if (labelKey(); as key) {
              <span [id]="key + '-label'" class="text-xs font-medium text-text leading-tight">
                {{ (key || '') | translate }}
              </span>
            }
            @if (valueText()) {
              <span [id]="(labelKey() || '') + '-value-text'" class="text-[10px] text-secondary leading-tight">
                {{ valueText() }}
              </span>
            }
          </div>
        </div>

        <!-- Visualization Block (Internal Content Projection Slot for non-parts-for-grid modes) -->
        <div
          class="visualization-block min-w-0"
          [ngClass]="{
            'flex-grow': layoutMode() === 'icon-text-left-vis-right',
            'w-full mt-0.5': layoutMode() === 'icon-text-top-vis-bottom'
          }"
        >
          @if (visualizationTemplate(); as template) {
            <ng-container *ngTemplateOutlet="template; context: { $implicit: contextForVisualization() }"></ng-container>
          } @else {
            <div class="h-[18px] bg-muted rounded animate-pulse w-full"
                 [attr.aria-label]="((labelKey() || '') | translate) + ' visualization loading'">
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [` :host { display: block; width: 100%; } `], // Default host display
})
export class UiMeterDisplayComponent {
  // --- Inputs ---
  readonly labelKey = input<string | undefined>();
  readonly valueText = input<string | undefined>();
  readonly icon = input<AppIcon | undefined>();
  readonly iconColorClass = input<string>('text-secondary');
  readonly iconSize = input<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'inherit'>('sm');
  /**
   * Defines the layout mode.
   * 'icon-text-left-vis-right': Icon and text on the left, visualization on the right.
   * 'icon-text-top-vis-bottom': Icon and text on top, visualization below.
   * 'parts-for-grid': Component expects its content to be projected into an external CSS Grid. Host uses `display: contents`.
   */
  readonly layoutMode: InputSignal<MeterDisplayLayoutMode> = input<MeterDisplayLayoutMode>('icon-text-left-vis-right');
  readonly iconPosition = input<'top-left' | 'top-center'>('top-left');
  /** Template for the visualization part when NOT using 'parts-for-grid' mode. */
  readonly visualizationTemplate = input<TemplateRef<any> | undefined>();
  readonly visualizationContext = input<any>();
  readonly activeSkin = input<string | undefined>();

  // --- Host Binding for display: contents ---
  /**
   * Binds the `display` style of the host element.
   * If `layoutMode` is 'parts-for-grid', it sets `display: contents` so that the projected
   * slots become direct children of the parent's CSS Grid. Otherwise, it defaults to 'block'.
   */
  @HostBinding('style.display')
  get hostDisplay(): string {
    return this.layoutMode() === 'parts-for-grid' ? 'contents' : 'block';
  }

  // --- Computed Signals ---
  /** Context object for the internally projected visualizationTemplate. */
  readonly contextForVisualization = computed(() => {
    return this.visualizationContext();
  });

  /**
   * @constructor
   */
  constructor() {
    // Constructor logic if needed
  }
}
