import { AppIcon } from "../../enums/icon.enum";

export interface ProductLineItemData {
  id: string;
  name: string;
  imageUrl?: string | null;
  quantity: number;
  pricePerItem: number;
  lineTotal: number;
  productId?: string; // Optioneel, voor routerLink
  route?: string | string[]; // Optioneel, voor navigatie
}

export interface CategorySelectionEvent {
  categoryId: string;
  isSelected: boolean;
  node: CategoryTreeNode;
}

export interface CategoryToggleEvent {
  categoryId: string;
  isExpanded: boolean;
}

export interface ProductQuickViewData {
  productId: string;
}

export interface RtfProductCardData {
  id: string;
  nameKey: string;
  imageUrl: string;
  descriptionKey: string;
  specs: { icon: AppIcon; textKey: string }[];
  price: string;
  route: string;
}

export interface BackendCategory {
  id: string;
  key: string;
  parentId: string | null;
  children: BackendCategory[];
}

export interface CategoryTreeNode {
  id: string;
  key: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: CategoryTreeNode[];
  count?: number;
  isExpanded?: boolean;
  isSelected?: boolean;
  level: number;
}

export interface CategoryTreeWithCounts {
  tree: CategoryTreeNode[];
  totalCount: number;
  hasFilters: boolean;
}