/**
 * @file variant-payloads.dto.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description Defines the DTOs for creating and updating predefined attribute values.
 */
import { VariantAttributeType } from '@royal-code/features/products/domain';

export interface CreateVariantValuePayload {
  readonly value: string;
  readonly displayName: string;
  readonly attributeType: VariantAttributeType | string; // e.g., 'color', 'size'
  readonly colorHex?: string | null;
  readonly priceModifier?: number | null;
}

export interface UpdateVariantValuePayload {
  readonly displayName: string;
  readonly colorHex?: string | null;
  readonly priceModifier?: number | null;
}