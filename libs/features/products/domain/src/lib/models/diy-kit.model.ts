// --- VERVANG VOLLEDIG BESTAND ---
/**
 * @file diy-kit.model.ts
 * @Version 2.0.0 (Decoupled from ItemCarouselComponent)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Definieert de TypeScript-interfaces voor data-objecten gerelateerd aan
 *   "Build-It-Yourself" (DIY) drone kits. De `DiyTestimonialItem` is nu een
 *   onafhankelijke interface om circulaire afhankelijkheden te voorkomen.
 */
import { AppIcon } from '@royal-code/shared/domain';

/** Definitie voor een productkaart voor de BYS kits sectie. */
export interface DiyKitProductCardData {
  id: string;
  nameKey: string;
  imageUrl: string;
  descriptionKey: string;
  features: { icon: AppIcon; textKey: string }[];
  route: string | string[];
  priceDisplayKey?: string;
}

/** Definitie voor een highlight item in de componenten verdieping sectie. */
export interface DiyTechHighlightGridItem {
  id: string;
  icon?: AppIcon | null;
  imageUrl?: string;
  youtubeVideoId?: string;
  titleKey: string;
  descriptionKey: string;
  route?: string | string[];
  textAlign: 'left' | 'right' | 'center';
  size?: 'small' | 'medium' | 'large' | 'full-width';
  openInNewTab?: boolean;
  gridClasses?: string;
  contentPadding?: string;
}

/**
 * Interface voor een testimonial item. Dit is nu een losstaande interface
 * en niet direct gekoppeld aan de ItemCarouselComponent om circular dependencies te vermijden.
 */
export interface DiyTestimonialItem {
  id: string;
  quoteKey: string;
  author: string;
  imageUrl: string;
  name: string;
}

/** Interface voor een FAQ item. */
export interface DiyFaqItem {
  id: string;
  questionKey: string;
  answerKey: string;
}

/** Hoofdinterface voor alle data van de BYS landingspagina. */
export interface DiyKitPageData {
  hero: {
    youtubeVideoId: string; titleKey: string; subtitleKey: string;
    ctaBeginnerKey: string; ctaBeginnerAnchor: string;
    ctaExpertKey: string; ctaExpertAnchor: string;
  };
  valueProp: {
    titleKey: string;
    cards: { icon: AppIcon; titleKey: string; descriptionKey: string; }[];
  };
  kitFinder: {
    imageUrl: string; titleKey: string; subtitleKey: string;
    buttonTextKey: string; route: string;
  };
  sub250gKits: {
    titleKey: string; anchorId: string; kits: DiyKitProductCardData[];
  };
  fiveInchKits: {
    titleKey: string; anchorId: string; kits: DiyKitProductCardData[];
  };
  componentDeepDive: {
    titleKey: string; subtitleKey: string; gridItems: DiyTechHighlightGridItem[];
  };
  guides: {
    titleKey: string; subtitleKey: string;
    links: { icon: AppIcon; titleKey: string; descriptionKey: string; route: string | string[]; }[];
  };
  techHighlights: {
    titleKey: string; gridItems: DiyTechHighlightGridItem[];
  };
  testimonials: {
    titleKey: string;
    items: DiyTestimonialItem[]; // Gebruikt nu de lokale, ontkoppelde interface
  };
  faq: {
    titleKey: string; items: DiyFaqItem[];
  };
  seamlessBuildGuide: {
    imageUrl: string;
    titleKey: string;
    subtitleKey: string;
    buttonTextKey: string;
    route: string;
  };
  stickyCta: {
    textKey: string; route: string;
  };
}