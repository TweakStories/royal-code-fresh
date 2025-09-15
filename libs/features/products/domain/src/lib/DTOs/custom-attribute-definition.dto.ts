import { AppIcon } from "@royal-code/shared/domain";

export interface CustomAttributeDefinitionDto {
  readonly id: string;
  readonly key: string;
  readonly nameKeyOrText: string;
  readonly descriptionKeyOrText: string;
  readonly valueType: 'integer' | 'boolean' | 'string' | 'decimal';
  readonly uiControlType: 'slider' | 'toggle' | 'input' | 'textarea' | 'dropdown' | 'text';
  readonly validationRulesJson: string | null; // JSON string met bv. { "min": 1, "max": 10 }
  readonly defaultValue: string;
  readonly group: string;
  readonly icon: AppIcon | string; 
}