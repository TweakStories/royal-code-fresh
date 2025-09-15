// apps/droneshop/src/app/features/products/siren-f35-detail/siren-f35-explanation.data.ts
/**
 * @file siren-f35-explanation.data.ts
 * @Version 2.4.0 (Definitief: Gestroomlijnde Data & Knoppen Verwijderd)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   De definitieve, gestroomlijnde content voor de Siren F3.5.
 *   `ctaTextKey` is permanent verwijderd uit de `storySections` en de overbodige paragraaf
 *   in `detailedContentBlocks` is weggehaald.
 */
import { DroneExplanationData } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain';

export const SIREN_F35_EXPLANATION_DATA: DroneExplanationData = {
  id: 'f3500002-0000-0000-0000-000000000002', // <<< DE FIX
  name: 'Quadmula Siren F3.5 RTF',
  shortDescriptionKey: 'droneshop.sirenF35.shortDescription',
  brand: 'Quadmula',
  explanationPageRoute: '/drones/rtf-drones/quadmula-siren-f35',
  productPurchaseRoute: '/products/rtf-drones/quadmula-siren-f35-pdp',

  heroVideoId: 'YNuc4wsvnZY', // Aangepast naar default YouTube ID
  heroImageUrl: 'images/default-image.webp', // Aangepast naar default image
  heroTitleKey: 'droneshop.sirenF35.hero.title',
  heroSubtitleKey: 'droneshop.sirenF35.hero.subtitle',
  heroCtaKey: 'droneshop.sirenF35.hero.ctaConfigure',

  promiseStats: [
    { icon: AppIcon.Cpu, titleKey: 'droneshop.sirenF35.promise.components.label', descriptionKey: 'droneshop.sirenF35.promise.components.value', textWrap: true },
    { icon: AppIcon.Wrench, titleKey: 'droneshop.sirenF35.promise.assembly.label', descriptionKey: 'droneshop.sirenF35.promise.assembly.value', textWrap: true },
    { icon: AppIcon.CheckCircle, titleKey: 'droneshop.sirenF35.promise.tested.label', descriptionKey: 'droneshop.sirenF35.promise.tested.value', textWrap: true },
  ],

  coreDescriptionBlocks: [
    { type: 'paragraph', contentKey: 'droneshop.sirenF35.longDescription.p1' },
    { type: 'feature-list', contentKey: 'droneshop.sirenF35.longDescription.highlightsTitle', items: [
        { icon: AppIcon.Zap, textKey: 'droneshop.sirenF35.longDescription.highlight1' }, { icon: AppIcon.Feather, textKey: 'droneshop.sirenF35.longDescription.highlight2' },
        { icon: AppIcon.Gauge, textKey: 'droneshop.sirenF35.longDescription.highlight3' }, { icon: AppIcon.Shield, textKey: 'droneshop.sirenF35.longDescription.highlight4' },
      ],
    },
    { type: 'paragraph', contentKey: 'droneshop.sirenF35.longDescription.p2' },
    { type: 'quote-block', contentKey: 'droneshop.sirenF35.customerQuote' },
    { type: 'cta-block', ctaTextKey: 'droneshop.sirenF35.ctaLink', ctaRoute: '/products/rtf-drones/quadmula-siren-f35-pdp' },
  ],

  storySections: [
    {
      id: 'frame', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.sirenF35.story.frame.title', subtitleKey: 'droneshop.sirenF35.story.frame.subtitle', textAlign: 'right', relatedProductRoute: '/products/quadmula-siren-f35-frame',
      detailedContentBlocks: [ { type: 'bullet-list', bulletPoints: ['Extreme Duurzaamheid: Sterk carbon fiber voor maximale levensduur.', 'Optimaal Gewicht: Perfect gebalanceerd voor precieze manoeuvres.', 'Innovatief Design: Vermindert resonantie voor vloeiendere vluchten.'] } ]
    },
    {
      id: 'stack', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.sirenF35.story.stack.title', subtitleKey: 'droneshop.sirenF35.story.stack.subtitle', textAlign: 'left', relatedProductRoute: '/products/foxeer-f722-mini-stack',
      detailedContentBlocks: [ { type: 'bullet-list', bulletPoints: ['Ongevoelig voor Extreme Hitte: Consistente prestaties onder druk.', 'Bliksemsnelle F7 Processor: Voor vloeiende en responsieve vluchtcontrole.', 'Bewezen Betrouwbaarheid: Vertrouw op hardware die is ontworpen om te presteren.'] } ]
    },
    {
      id: 'motors', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.sirenF35.story.motors.title', subtitleKey: 'droneshop.sirenF35.story.motors.subtitle', textAlign: 'right', relatedProductRoute: '/products/aos-1404-motors',
      detailedContentBlocks: [ { type: 'bullet-list', bulletPoints: ['Ontketen Brute 8S Kracht: Maximale acceleratie en topsnelheid.', 'Fluisterstil, voor Ongehinderde Vluchten: Geniet van de pure klank van de wind.', 'Gebouwd voor Toekomstige Upgrades: Klaar voor jouw creatieve aanpassingen.'] } ]
    },
    {
      id: 'radio', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.sirenF35.story.radio.title', subtitleKey: 'droneshop.sirenF35.story.radio.subtitle', textAlign: 'left', relatedProductRoute: '/products/radiomaster-elrs-receiver',
      detailedContentBlocks: [ { type: 'bullet-list', bulletPoints: ['Ongeëvenaard Bereik: Vlieg verder en met meer vertrouwen.', 'Minimale Latency: Directe controle, geen vertraging.', 'Rotsvaste Verbinding: Nooit meer signaalverlies.'] } ]
    },
    {
      id: 'dji-o4', imageUrl: 'images/default-image.webp', youtubeVideoId: 'YNuc4wsvnZY', titleKey: 'droneshop.sirenF35.story.djiO4.title', subtitleKey: 'droneshop.sirenF35.story.djiO4.subtitle', textAlign: 'right', relatedProductRoute: '/products/dji-o4-air-unit',
      detailedContentBlocks: [ { type: 'media-embed', youtubeVideoId: 'YNuc4wsvnZY' }, { type: 'bullet-list', bulletPoints: ['Kristalheldere HD-Beelden: Zie de wereld door de ogen van je drone in ongekende details.', 'Verbreed Je Horizon met Ultiem Bereik: Ervaar stabiele video over lange afstanden.', 'Elk Detail Zichtbaar: Voor Uitmuntende Controle en Immersie.'] } ]
    },
  ],

  basePriceDisplay: '€ 389,95',
  priceDisclaimerKey: 'droneshop.sirenF35.priceDisclaimer',
  callToActionLinkKey: 'droneshop.sirenF35.ctaLink',

  inTheBoxItems: [
    { icon: AppIcon.CheckCircle, textKey: 'droneshop.sirenF35.inTheBox.drone' }, { icon: AppIcon.BatteryCharging, textKey: 'droneshop.sirenF35.inTheBox.lipoStrap' }, { icon: AppIcon.ShieldCheck, textKey: 'droneshop.sirenF35.inTheBox.propellers' }, { icon: AppIcon.FileText, textKey: 'droneshop.sirenF35.inTheBox.quickstart' }, { icon: AppIcon.Settings, textKey: 'droneshop.sirenF35.inTheBox.betaflightTune' }, { icon: AppIcon.ClipboardCheck, textKey: 'droneshop.sirenF35.inTheBox.qcReport' },
  ],

  essentialAccessories: [
    { id: 'dji-goggles-2', name: 'DJI Goggles 2', imageUrl: 'images/default-image.webp', route: '/products/dji-goggles-2' }, { id: 'radiomaster-zorro', name: 'RadioMaster Zorro ELRS', imageUrl: 'images/default-image.webp', route: '/products/radiomaster-zorro' }, { id: 'tattu-lipo-6s', name: 'Tattu R-Line 6S 1300mAh', imageUrl: 'images/default-image.webp', route: '/products/tattu-lipo-6s-1300mah' }, { id: 'isdt-q6-nano-charger', name: 'ISDT Q6 Nano Lader', imageUrl: 'images/default-image.webp', route: '/products/isdt-q6-nano' },
  ],

  reviewSummary: { averageRating: 4.8, totalReviews: 22, targetEntityId: 'f3500002-0000-0000-0000-000000000002', ratingDistribution: { 5: 18, 4: 4, 3: 0, 2: 0, 1: 0 } }, // <<< DE FIX

  faqTitleKey: 'droneshop.sirenF35.faq.title',
  faqItems: [
    { id: 'faq1', questionKey: 'droneshop.sirenF35.faq.q1', answerKey: 'droneshop.sirenF35.faq.a1' },
    { id: 'faq2', questionKey: 'droneshop.sirenF35.faq.q2', answerKey: 'droneshop.sirenF35.faq.a2' },
    { id: 'faq3', questionKey: 'droneshop.sirenF35.faq.q3', answerKey: 'droneshop.sirenF35.faq.a3' },
  ],
};