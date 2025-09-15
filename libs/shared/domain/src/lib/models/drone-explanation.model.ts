// --- VERVANG VOLLEDIG BESTAND ---
/**
 * @file drone-explanation.model.ts
 * @Version 3.0.0 (FIXED: Circular Dependency by Consolidation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Definieert de datastructuren voor de generieke, datagedreven
 *   DroneExplanationPageComponent. Deze versie lost de circulaire afhankelijkheid op
 *   door de CoreDescriptionBlock interface direct in dit bestand te consolideren,
 *   waardoor een problematische relatieve import wordt verwijderd.
 */
import { AppIcon } from '../enums/icon.enum';
import { ReviewSummary } from '../models/reviews/review-summary.model';
import { ButtonType } from '../types/button.types';
import { FaqItem } from './faq.model';

// === GECONSOLIDEERDE INTERFACE VAN core-description-block.model.ts ===
export interface CoreDescriptionBlock {
  type: 'paragraph' | 'feature-list' | 'quote-block' | 'cta-block' | 'media-embed' | 'bullet-list';
  contentKey?: string;
  items?: { icon: AppIcon; textKey: string }[];
  ctaTextKey?: string;
  ctaRoute?: string | string[];
  youtubeVideoId?: string;
  bulletPoints?: string[];
}
// === EINDE GECONSOLIDEERDE INTERFACE ===

// Sub-interfaces voor duidelijkheid
export interface ExplanationStatCard {
  icon: AppIcon;
  titleKey: string;
  descriptionKey: string;
  textWrap?: boolean;
}

export interface ProductStorySection {
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

export interface ExplanationInTheBoxItem {
  icon: AppIcon;
  textKey: string;
}

export interface ExplanationAccessoryItem {
  id: string;
  name: string;
  imageUrl: string;
  route: string | string[];
}



// Hoofdinterface
export interface DroneExplanationData {
  id: string;
  name: string;
  shortDescriptionKey: string;
  brand: string;
  explanationPageRoute: string | string[];
  productPurchaseRoute: string | string[];

  // Secties
  heroVideoId: string;
  heroImageUrl: string;
  heroTitleKey: string;
  heroSubtitleKey: string;
  heroCtaKey: string;
  promiseStats: ExplanationStatCard[];
  coreDescriptionBlocks: CoreDescriptionBlock[];
  storySections: ProductStorySection[];
  basePriceDisplay: string;
  priceDisclaimerKey: string;
  callToActionLinkKey: string;
  inTheBoxItems: ExplanationInTheBoxItem[];
  essentialAccessories: ExplanationAccessoryItem[];
  reviewSummary: ReviewSummary;
  faqTitleKey: string;
  faqItems: FaqItem[];
}

