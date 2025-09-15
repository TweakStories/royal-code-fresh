/**
 * @file siren-f35-build-kit.data.ts
 * @Version 2.0.0 (DEFINITIEF: 100% correcte ReviewSummary data - GEEN FOUTEN MEER)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Hardcoded data voor de Siren F3.5 Build Kit productdetailpagina.
 *   Deze versie bevat de definitieve en volledig correcte ReviewSummary data.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-09-02
 * @PromptSummary "ABSOLUTE FINAL FIX: ReviewSummary properties in data files."
 */
import { AppIcon } from '@royal-code/shared/domain';
import { DroneExplanationData } from '@royal-code/shared/domain';

export const SIREN_F35_BUILD_KIT_DATA: DroneExplanationData = {
  id: 'f3500001-0000-0000-0000-000000000001', // <<< DE FIX
  name: 'Quadmula Siren F3.5 BYS Kit',
  shortDescriptionKey: 'droneshop.diyKitsOverview.sirenF35Kit.longDescription.p1',
  brand: 'Quadmula',
  explanationPageRoute: '/drones/build-kits/quadmula-siren-f35-pdp',
  productPurchaseRoute: '/drones/build-kits/quadmula-siren-f35-pdp',

  heroVideoId: 'YNuc4wsvnZY', // Aangepast naar default YouTube ID
  heroImageUrl: 'images/default-image.webp', // Aangepast naar default image
  heroTitleKey: 'droneshop.diyKitsOverview.sirenF35Kit.hero.title',
  heroSubtitleKey: 'droneshop.diyKitsOverview.sirenF35Kit.hero.subtitle',
  heroCtaKey: 'droneshop.diyKitsOverview.sirenF35Kit.hero.cta',

  promiseStats: [
    { icon: AppIcon.CheckCircle, titleKey: 'droneshop.diyKitsOverview.sirenF35Kit.promise.compatibility.label', descriptionKey: 'droneshop.diyKitsOverview.sirenF35Kit.promise.compatibility.value', textWrap: true },
    { icon: AppIcon.Video, titleKey: 'droneshop.diyKitsOverview.sirenF35Kit.promise.guides.label', descriptionKey: 'droneshop.diyKitsOverview.sirenF35Kit.promise.guides.value', textWrap: true },
    { icon: AppIcon.LifeBuoy, titleKey: 'droneshop.diyKitsOverview.sirenF35Kit.promise.support.label', descriptionKey: 'droneshop.diyKitsOverview.sirenF35Kit.promise.support.value', textWrap: true },
  ],

  coreDescriptionBlocks: [
    { type: 'paragraph', contentKey: 'droneshop.diyKitsOverview.sirenF35Kit.longDescription.p1' },
    { type: 'feature-list', contentKey: 'droneshop.diyKitsOverview.sirenF35Kit.longDescription.highlightsTitle', items: [
        { icon: AppIcon.Package, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.longDescription.highlight1' },
        { icon: AppIcon.Users, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.longDescription.highlight2' },
        { icon: AppIcon.Wrench, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.longDescription.highlight3' },
        { icon: AppIcon.Sliders, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.longDescription.highlight4' },
      ],
    },
    { type: 'paragraph', contentKey: 'droneshop.diyKitsOverview.sirenF35Kit.longDescription.p2_details' },
    { type: 'quote-block', contentKey: 'droneshop.diyKitsOverview.sirenF35Kit.longDescription.customerQuote' },
    { type: 'cta-block', ctaTextKey: 'droneshop.diyKitsOverview.productCardCta', ctaRoute: '/drones/build-kits/quadmula-siren-f35-pdp' },
  ],

  storySections: [
    { id: 'frame', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.diyKitsOverview.sirenF35Kit.story.frame.title', subtitleKey: 'droneshop.diyKitsOverview.sirenF35Kit.story.frame.subtitle', textAlign: 'right', relatedProductRoute: '/guides/frame-assembly',
      detailedContentBlocks: [ { type: 'bullet-list', bulletPoints: ['Leer over het ultralichte carbon fiber frame en zijn duurzaamheid.','Stap-voor-stap montagehandleiding beschikbaar in onze gidsen.','Optimaliseer je gewichtsverdeling voor perfecte freestyle manoeuvres.'] } ]
    },
    { id: 'stack', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.diyKitsOverview.sirenF35Kit.story.stack.title', subtitleKey: 'droneshop.diyKitsOverview.sirenF35Kit.story.stack.subtitle', textAlign: 'left', relatedProductRoute: '/guides/fc-esc-installation',
      detailedContentBlocks: [ { type: 'bullet-list', bulletPoints: ['Installeer de krachtige Foxeer F722 V4 Mini Flight Controller en 45A BL32 ESC.','Begrijp de bedrading en stroomverdeling voor een veilige build.','Configureer Betaflight: De eerste stappen naar jouw tune.'] } ]
    },
    { id: 'motors', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.diyKitsOverview.sirenF35Kit.story.motors.title', subtitleKey: 'droneshop.diyKitsOverview.sirenF35Kit.story.motors.subtitle', textAlign: 'right', relatedProductRoute: '/guides/motor-propeller-guide',
      detailedContentBlocks: [ { type: 'bullet-list', bulletPoints: ['Monteer de AOS 1404 4600KV motoren: De spierkracht van je drone.','Leer over Kv-waardes en de impact op de vliegkarakteristiek.','Kies de perfecte HQProp 3.5 Inch propellers voor optimale stuwkracht.'] } ]
    },
    { id: 'radio', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.diyKitsOverview.sirenF35Kit.story.radio.title', subtitleKey: 'droneshop.diyKitsOverview.sirenF35Kit.story.radio.subtitle', textAlign: 'left', relatedProductRoute: '/guides/elrs-binding-setup',
      detailedContentBlocks: [ { type: 'bullet-list', bulletPoints: ['Installeer en bind je RadioMaster ELRS Nano ontvanger voor rotsvaste controle.','Begrijp de frequentiebanden en antenne-plaatsing.','Minimaliseer latency voor directe responsiviteit.'] } ]
    },
    { id: 'dji-o4', imageUrl: 'images/default-image.webp', youtubeVideoId: 'YNuc4wsvnZY', titleKey: 'droneshop.diyKitsOverview.sirenF35Kit.story.djiO4.title', subtitleKey: 'droneshop.diyKitsOverview.sirenF35Kit.story.djiO4.subtitle', textAlign: 'right', relatedProductRoute: '/guides/dji-o4-integration',
      detailedContentBlocks: [
        { type: 'media-embed', youtubeVideoId: 'YNuc4wsvnZY' }, // Aangepast naar default YouTube ID
        { type: 'bullet-list', bulletPoints: ['Integreer de optionele DJI O4 Air Unit voor kristalheldere HD-beelden.','Optimaliseer de plaatsing en bedrading voor minimale storing.','Ervaar ongeëvenaarde digitale FPV-immersie.'] }
      ]
    },
  ],

  basePriceDisplay: '€ 389,95',
  priceDisclaimerKey: 'droneshop.diyKitsOverview.sirenF35Kit.priceDisclaimer',
  callToActionLinkKey: 'droneshop.diyKitsOverview.productCardCta',

  inTheBoxItems: [
    { icon: AppIcon.CheckCircle, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.inTheBox.frame' },
    { icon: AppIcon.Cpu, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.inTheBox.stack' },
    { icon: AppIcon.Power, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.inTheBox.motors' },
    { icon: AppIcon.Radio, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.inTheBox.rx' },
    { icon: AppIcon.ShieldCheck, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.inTheBox.propellers' },
    { icon: AppIcon.Settings, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.inTheBox.hardware' },
    { icon: AppIcon.BookOpen, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.inTheBox.guides' },
    { icon: AppIcon.ClipboardCheck, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.inTheBox.qcReport' },
  ],

  essentialAccessories: [
    { id: 'soldering-station', name: 'TS101 Mini Soldeerstation', imageUrl: 'images/default-image.webp', route: '/products/tools/ts101-soldering-iron' },
    { id: 'hex-driver-set', name: 'Toolkit RC Hex Driver Set', imageUrl: 'images/default-image.webp', route: '/products/tools/rc-hex-driver-set' },
    { id: 'smokestopper', name: 'FPV Smokestopper', imageUrl: 'images/default-image.webp', route: '/products/tools/fpv-smokestopper' },
    { id: 'lipo-battery', name: 'Tattu R-Line 6S 850mAh LiPo', imageUrl: 'images/default-image.webp', route: '/products/batteries/tattu-6s-850mah' },
    { id: 'fpv-goggles', name: 'DJI Goggles 2', imageUrl: 'images/default-image.webp', route: '/products/goggles/dji-goggles-2' },
    { id: 'fpv-transmitter', name: 'RadioMaster Zorro ELRS', imageUrl: 'images/default-image.webp', route: '/products/radios/radiomaster-zorro-elrs' },
  ],

  reviewSummary: {
    targetEntityId: 'f3500001-0000-0000-0000-000000000001', // <<< DE FIX
    averageRating: 4.9,
    totalReviews: 18,
    ratingDistribution: {
      5: 16,
      4: 2,
      3: 0,
      2: 0,
      1: 0
    }
  },

  faqTitleKey: 'droneshop.diyKitsOverview.faq.title',
  faqItems: [
    { id: 'faq1', questionKey: 'droneshop.diyKitsOverview.sirenF35Kit.faq.q1', answerKey: 'droneshop.diyKitsOverview.sirenF35Kit.faq.a1' },
    { id: 'faq2', questionKey: 'droneshop.diyKitsOverview.sirenF35Kit.faq.q2', answerKey: 'droneshop.diyKitsOverview.sirenF35Kit.faq.a2' },
    { id: 'faq3', questionKey: 'droneshop.diyKitsOverview.sirenF35Kit.faq.q3', answerKey: 'droneshop.diyKitsOverview.sirenF35Kit.faq.a3' },
  ],
};