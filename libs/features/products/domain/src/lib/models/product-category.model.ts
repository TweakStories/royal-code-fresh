/**
 * @file product-category.model.ts
 * @Version 2.1.0 (Key Property Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-08
 * @Description Defines the ProductCategory interface, now including the 'key' property
 *              to align with backend DTOs and enable correct display name derivation.
 */
import { AppIcon } from '@royal-code/shared/domain';
import { Media } from '@royal-code/shared/domain';
import { AuditableEntityBase } from '@royal-code/shared/base-models';

export interface ProductCategory extends AuditableEntityBase {
  readonly id: string;
  name: string;
  key: string; // << DE FIX: 'key' property toegevoegd
  slug: string;
  description?: string;
  parentId?: string | null;
  children?: ProductCategory[];
  categoryPathSlugs?: string[];
  level?: number;
  image?: Media;
  icon?: AppIcon;
  colorHex?: string;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  featuredProductIds?: string[];
  isActive: boolean;
  isVisibleInNavigation?: boolean;
  productCount?: number;
}

export interface CategoryFilterOptions {
  parentId?: string | null;
  level?: number;
  isActive?: boolean;
  isVisibleInNavigation?: boolean;
  searchTerm?: string;
  sortBy?: 'name' | 'displayOrder' | 'productCount' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
  includeProductCount?: boolean;
}