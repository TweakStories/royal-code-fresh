/**
 * @enum SegmentState
 * @description Defines the visual state of a single segment within a segmented bar.
 */
export enum SegmentState {
  Empty = 'empty',
  Filled = 'filled',
  BonusFilled = 'bonusFilled',
  Depleted = 'depleted',
}

/**
 * @enum SegmentStyle
 * @description Defines the visual rendering style for segments.
 */
export enum SegmentStyle {
  Chevron = 'chevron',
  Block = 'block', // Voorheen 'Gradient', nu duidelijker 'Block' voor rechthoekige segmenten
}

/**
 * @interface SegmentedBarConfig
 * @description Input configuration for the `UiSegmentedBarComponent`.
 * Defines how a segmented bar should be rendered.
 */
export interface SegmentedBarConfig {
  /** The current value represented by filled segments. */
  filledValue: number;
  /** The total maximum value the bar can represent. */
  totalValue: number;
  /** The number of visual segments to display in the bar. */
  numberOfSegments: number;

  /** Optional: The number of segments to show as 'bonus' fill beyond `filledValue`. */
  bonusValue?: number;
  /** Optional: The number of segments to show as 'depleted' (e.g., from damage). */
  depletedValue?: number;

  /** Optional: An accessible label for the entire bar (e.g., "Strength"). Used for ARIA. */
  ariaLabel?: string; // Hernoemd van barLabel voor duidelijkheid

  /**
   * The visual style for the segments.
   * Defaults to `SegmentStyle.Chevron` if not specified.
   */
  displayStyle?: SegmentStyle;

  /**
   * Optional: A type identifier (e.g., 'hp', 'mp', 'attribute_strength') to allow
   * type-specific styling within `UiBarSegmentComponent` for segment colors/gradients.
   */
  segmentColorPattern?: string; // Hernoemd van resourceType
}
