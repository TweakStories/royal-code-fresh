// --- IN APPS/DRONESHOP/SRC/APP/FEATURES/PRODUCTS/SIREN-F5-DETAIL/SIREN-F5-EXPLANATION.DATA.TS, VERVANG HET BLOK 'SIREN_F5_EXPLANATION_DATA' ---
/**
 * @file siren-f5-explanation.data.ts
 * @Version 1.2.0 (Ultieme Conversie Masterplan Content voor F5 - Gestroomlijnde Tekst & Knoppen Verwijderd)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   De definitieve, conversie-geoptimaliseerde content voor de Quadmula Siren F5.
 *   Deze content is gericht op de meer ervaren piloot die op zoek is naar maximale
 *   kracht (8S), duurzaamheid en professionele prestaties in een 5-inch klasse.
 *   `heroVideoUrl` is vervangen door `heroVideoId`.
 *   `ctaTextKey` is verwijderd uit `storySections`.
 *   `detailedContentBlocks` zijn gestroomlijnd naar bullet points.
 */
import { DroneExplanationData } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain';

export const SIREN_F5_EXPLANATION_DATA: DroneExplanationData = {
  id: 'f5000001-0000-0000-0000-000000000001', // <<< DE FIX
  name: 'Quadmula Siren F5 RTF (8S)',
  shortDescriptionKey: 'droneshop.sirenF5.shortDescription',
  brand: 'Quadmula',
  explanationPageRoute: '/drones/rtf-drones/quadmula-siren-f5',
  productPurchaseRoute: '/products/rtf-drones/quadmula-siren-f5-pdp',

  heroVideoId: 'YNuc4wsvnZY', // Aangepast naar default YouTube ID
  heroImageUrl: 'images/default-image.webp', // Aangepast naar default image
  heroTitleKey: 'droneshop.sirenF5.hero.title',
  heroSubtitleKey: 'droneshop.sirenF5.hero.subtitle',
  heroCtaKey: 'droneshop.sirenF5.hero.ctaConfigure',

  promiseStats: [
    { icon: AppIcon.Zap, titleKey: 'droneshop.sirenF5.promise.components.label', descriptionKey: 'droneshop.sirenF5.promise.components.value', textWrap: true },
    { icon: AppIcon.Shield, titleKey: 'droneshop.sirenF5.promise.assembly.label', descriptionKey: 'droneshop.sirenF5.promise.assembly.value', textWrap: true },
    { icon: AppIcon.Flame, titleKey: 'droneshop.sirenF5.promise.tested.label', descriptionKey: 'droneshop.sirenF5.promise.tested.value', textWrap: true },
  ],

  coreDescriptionBlocks: [
    { type: 'paragraph', contentKey: 'droneshop.sirenF5.longDescription.p1' },
    {
      type: 'feature-list',
      contentKey: 'droneshop.sirenF5.longDescription.highlightsTitle',
      items: [
        { icon: AppIcon.Rocket, textKey: 'droneshop.sirenF5.longDescription.highlight1' },
        { icon: AppIcon.GitCommit, textKey: 'droneshop.sirenF5.longDescription.highlight2' },
        { icon: AppIcon.Camera, textKey: 'droneshop.sirenF5.longDescription.highlight3' },
        { icon: AppIcon.Wrench, textKey: 'droneshop.sirenF5.longDescription.highlight4' },
      ],
    },
    { type: 'paragraph', contentKey: 'droneshop.sirenF5.longDescription.p2' },
    { type: 'quote-block', contentKey: 'droneshop.sirenF5.customerQuote' },
    { type: 'cta-block', ctaTextKey: 'droneshop.sirenF5.ctaLink', ctaRoute: '/products/rtf-drones/quadmula-siren-f5-pdp' },
  ],

  storySections: [
    {
      id: 'frame-f5', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.sirenF5.story.frame.title', subtitleKey: 'droneshop.sirenF5.story.frame.subtitle', textAlign: 'left', relatedProductRoute: '/products/quadmula-siren-f5-frame',
      detailedContentBlocks: [
        { type: 'paragraph', contentKey: 'droneshop.sirenF5.story.frame.details.p1_short' }, // Ingekort
        { type: 'bullet-list', bulletPoints: [
            'Maximale Duurzaamheid: Gebouwd om de meest extreme crashes te weerstaan.',
            'Geoptimaliseerde Geometrie: Voor een perfect uitgebalanceerd zwaartepunt.',
            'Ruimte voor Componenten: Genoeg plek voor een robuuste stack en DJI O4.'
        ]},
      ]
    },
    {
      id: 'stack-f5', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.sirenF5.story.stack.title', subtitleKey: 'droneshop.sirenF5.story.stack.subtitle', textAlign: 'right', relatedProductRoute: '/products/foxeer-reaper-f7-65a-stack',
      detailedContentBlocks: [
        { type: 'paragraph', contentKey: 'droneshop.sirenF5.story.stack.details.p1_short' }, // Ingekort
        { type: 'bullet-list', bulletPoints: [
            '8S LiPo Compatibel: Ontworpen voor hoogspanning en extreme prestaties.',
            'Krachtige F7 Processor: Vloeiende, responsieve vluchtcontrole zonder compromissen.',
            'Duurzame Componenten: Gebouwd om de zwaarste omstandigheden te doorstaan.'
        ]},
      ]
    },
    {
      id: 'motors-f5', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.sirenF5.story.motors.title', subtitleKey: 'droneshop.sirenF5.story.motors.subtitle', textAlign: 'left', relatedProductRoute: '/products/rcinpower-gts-v4-motors',
      detailedContentBlocks: [
        { type: 'paragraph', contentKey: 'droneshop.sirenF5.story.motors.details.p1_short' }, // Ingekort
        { type: 'bullet-list', bulletPoints: [
            'Ongekende Stuwkracht: Maximale acceleratie en controle.',
            'Competitie-Bewezen: Vertrouwd door top FPV-piloten wereldwijd.',
            'Efficiënt & Duurzaam: Langere vliegtijden en een langere levensduur.'
        ]},
      ]
    },
  ],

  basePriceDisplay: '€ 549,95',
  priceDisclaimerKey: 'droneshop.sirenF5.priceDisclaimer',
  callToActionLinkKey: 'droneshop.sirenF5.ctaLink',

  inTheBoxItems: [
    { icon: AppIcon.CheckCircle, textKey: 'droneshop.sirenF5.inTheBox.drone' }, { icon: AppIcon.BatteryCharging, textKey: 'droneshop.sirenF5.inTheBox.lipoStrap' }, { icon: AppIcon.ShieldCheck, textKey: 'droneshop.sirenF5.inTheBox.propellers' }, { icon: AppIcon.FileText, textKey: 'droneshop.sirenF5.inTheBox.quickstart' }, { icon: AppIcon.Settings, textKey: 'droneshop.sirenF5.inTheBox.betaflightTune' }, { icon: AppIcon.ClipboardCheck, textKey: 'droneshop.sirenF5.inTheBox.qcReport' },
  ],

  essentialAccessories: [
    { id: 'dji-goggles-2', name: 'DJI Goggles 2', imageUrl: 'images/default-image.webp', route: '/products/dji-goggles-2' }, { id: 'radiomaster-tx16s', name: 'RadioMaster TX16S MKII ELRS', imageUrl: 'images/default-image.webp', route: '/products/radiomaster-tx16s' }, { id: 'cnhl-lipo-8s', name: 'CNHL Black Series 8S 1100mAh', imageUrl: 'images/default-image.webp', route: '/products/cnhl-lipo-8s' }, { id: 'hota-d6-pro-charger', name: 'HOTA D6 Pro Lader', imageUrl: 'images/default-image.webp', route: '/products/hota-d6-pro' },
  ],

  reviewSummary: { averageRating: 4.9, totalReviews: 31, targetEntityId: 'f5000001-0000-0000-0000-000000000001', ratingDistribution: { 5: 27, 4: 4, 3: 0, 2: 0, 1: 0 } }, // <<< DE FIX

  faqTitleKey: 'droneshop.sirenF5.faq.title',
  faqItems: [
    { id: 'faq1-f5', questionKey: 'droneshop.sirenF5.faq.q1', answerKey: 'droneshop.sirenF5.faq.a1' },
    { id: 'faq2-f5', questionKey: 'droneshop.sirenF5.faq.q2', answerKey: 'droneshop.sirenF5.faq.a2' },
    { id: 'faq3-f5', questionKey: 'droneshop.sirenF5.faq.q3', answerKey: 'droneshop.sirenF5.faq.a3' },
  ],
};