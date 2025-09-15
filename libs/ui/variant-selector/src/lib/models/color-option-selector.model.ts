// libs/ui/src/lib/components/color-option-selector/color-option-selector.model.ts
/**
 * @file color-option-selector.model.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30 // Huidige datum
 * @Description Defines the data models for the UiColorOptionSelectorComponent,
 *              representing individual color options and their display properties.
 */

/**
 * @interface ColorOption
 * @description Represents a single color option for selection.
 */
export interface ColorOption {
  id: string;
  displayName: string;
  colorValue: string;
  isAvailable: boolean;
  attributeValueId?: string; // Optioneel, want niet elke optie heeft dit (e.g. 'none')
  variantCombinationId?: string | null; // De ID van de geassocieerde variantcombinatie
}
