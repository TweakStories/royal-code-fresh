/**
 * @file predefined-attribute.dto.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-20
 * @Description Defines the DTO for predefined, selectable attribute values fetched from the backend.
 */
export interface PredefinedAttributeValueDto {
  readonly id: string;
  readonly value: string;
  readonly name: string;
  readonly displayName: string;
  readonly colorHex: string | null;
  readonly priceModifier: number | null;
}

export type PredefinedAttributesMap = Record<string, PredefinedAttributeValueDto[]>;
