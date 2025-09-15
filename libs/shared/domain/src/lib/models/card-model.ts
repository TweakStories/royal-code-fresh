// libs/shared/domain/src/lib/models/card-model.ts

import { AppIcon } from "../enums/icon.enum";
import { CoreDescriptionBlock } from "./drone-explanation.model";

/**
 * Interface for item carousel items
 */
export interface ItemCarouselItem {
  id: string;
  name: string;
  imageUrl: string;
  route?: string | string[];
  [key: string]: any;
}

/**
 * Interface for story card data
 */
export interface StoryCardData {
  id: string;
  imageUrl: string;
  youtubeVideoId?: string;
  titleKey: string;
  subtitleKey: string;
  textAlign: 'left' | 'right';
  relatedProductRoute?: string | string[];
  ctaTextKey?: string;
  detailedContentBlocks?: CoreDescriptionBlock[];
}

/**
 * Interface for icon text row data
 */
export interface IconTextRowData {
  icon: AppIcon;
  textKey: string;
}

/**
 * Interface for product accessory card data
 */
export interface ProductAccessoryCardData {
  id: string;
  name: string;
  imageUrl: string;
  route: string | string[];
}

/**
 * Interface for profile avatar card data
 */
export interface ProfileAvatarCardData {
  id: string;
  imageUrl: string;
  titleKey: string;
  subtitleKey: string;
  route?: string | string[];
  name: string;
}