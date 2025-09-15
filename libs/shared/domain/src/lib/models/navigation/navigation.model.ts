/**
 * @file navigation.model.ts
 * @Version 2.6.0 (Added 'external' property)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-10
 * @Description
 *   De definitieve versie van de NavigationItem interface, nu met een optionele
 *   'external' boolean property om externe links correct te kunnen afhandelen.
 */
import { AppIcon } from '../../enums/icon.enum';
import { BadgeColor, BadgeSize } from '../../types/badge.types';
import { Image } from '../media/media.model';

export enum NavDisplayHintEnum {
  Desktop = 'desktop',
  MobileBottom = 'mobile-bottom',
  MobileModal = 'mobile-modal',
  UserMenu = 'user-menu',
}

export type NavDisplayHint = NavDisplayHintEnum;

export interface NavigationBadge {
  text: string;
  color: BadgeColor;
  size?: BadgeSize;
}

export interface NavigationItem {
  id: string;
  labelKey: string;
  route?: string | string[];
  external?: boolean; // <-- DE FIX: Eigenschap toegevoegd
  queryParams?: { [key: string]: any };
  queryParamsHandling?: 'merge' | 'preserve' | 'replace';
  icon?: AppIcon;
  children?: NavigationItem[];
  menuType?: 'default' | 'mega-menu' | 'dropdown';
  megaMenuLayout?: 'vertical-split' | 'featured-grid';
  megaMenuFeaturedItems?: NavigationItem[];
  displayHint?: NavDisplayHintEnum[];
  dividerBefore?: boolean;
  isSectionHeader?: boolean;
  image?: Image;
  description?: string;
  requiresAuth?: boolean;
  hoverImage?: Image;
  priceRangeKey?: string;
  badges?: NavigationBadge[];
  layoutHint?: 'featured' | 'standard';
}