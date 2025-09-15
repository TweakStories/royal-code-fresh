// libs/ui/stat-visualization/src/lib/models/stat-visualization.model.ts
/**
 * @fileoverview Defines data models and enums for stat and progress visualization
 * components within the `@royal-code/ui/meters` library.
 * These models are used to configure the appearance and behavior of components like
 * `UiStatBarComponent` and `UiResourceBlocksComponent`.
 * @version 1.4.0
 * @author ChallengerAppDevAI
 */
import { AppIcon } from '../../enums/icon.enum';

/**
 * @enum SegmentState
 * @description Defines the visual state of a single segment within a segmented bar
 *              (e.g., `UiStatBarSegmentComponent`) or a block in `UiResourceBlocksComponent`.
 */
export enum SegmentState {
  Empty = 'empty',
  Filled = 'filled',
  BonusFilled = 'bonusFilled',
  Depleted = 'depleted',
}

/**
 * @enum StatBarSegmentStyle
 * @description Defines the visual rendering style for segments within the `UiStatBarSegmentComponent`.
 *              This enum is primarily used by `UiStatBarComponent` to instruct its segments.
 */
export enum StatBarSegmentStyle {
  /** Renders segments with a chevron (pointed) shape. */
  Chevron = 'chevron',
  /** Renders segments as rectangular blocks, typically filled with a gradient or solid color. */
  Gradient = 'gradient',
  // Note: 'Blocks' style for Minecraft-like resources is handled directly by UiResourceBlocksComponent,
  // not typically as a displayStyle for individual UiStatBarSegments.
}

/**
 * @interface StatBarInput
 * @description Input configuration for the `UiStatBarComponent`.
 *              Defines how a segmented stat bar (typically using chevrons or simple gradients
 *              via `UiStatBarSegmentComponent`) should be rendered.
 */
export interface StatBarInput {
  /**
   * The number of segments that should visually appear in the 'Filled' state.
   * This value should be relative to `totalSegments`.
   */
  filledCount: number;
  /** Optional: The number of segments visually in the 'BonusFilled' state. */
  bonusCount?: number;
  /** Optional: The number of segments visually in the 'Depleted' state. */
  depletedCount?: number;
  /** The total number of *visual* segments to display in this stat bar. */
  totalSegments: number;

  /** Optional: An accessible label for the entire stat bar (e.g., "Strength Attribute"). */
  barLabel?: string;
  /** Optional: An `AppIcon` enum value for an icon to display alongside the bar or its label. */
  barIcon?: AppIcon;
  /** Optional: Tailwind CSS class for the color of the `barIcon` (e.g., 'text-primary'). */
  iconColorClass?: string;

  /**
   * The visual style for the segments rendered by `UiStatBarSegmentComponent`.
   * Defaults to `StatBarSegmentStyle.Chevron` if not specified by the consumer.
   */
  displayStyle?: StatBarSegmentStyle.Chevron | StatBarSegmentStyle.Gradient;

  /**
   * Optional: A type identifier (e.g., 'hp', 'mp', 'attribute_strength') to allow
   * type-specific styling within `UiStatBarSegmentComponent`'s rendering logic,
   * particularly for color schemes or gradients.
   */
  resourceType?: 'hp' | 'mp' | 'stamina' | 'xp' | 'attribute' | `attribute_${string}` | string;
}

