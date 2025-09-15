/**
 * @file diy-kits-page.data.ts
 * @Version 1.3.0 (Geïntegreerde "Zorgeloos Bouwen" Sectie & Guides Link)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Hardcoded data-object voor de "Build-It-Yourself" landingspagina.
 *   Nu uitgebreid met de "Zorgeloos Bouwen" sectie en de juiste link naar de guides.
 */
import { AppIcon } from '@royal-code/shared/domain';
import { DiyKitPageData, DiyKitProductCardData, DiyTechHighlightGridItem } from '@royal-code/features/products/domain';

export const DIY_KITS_PAGE_DATA: DiyKitPageData = {
  hero: {
    youtubeVideoId: 'YNuc4wsvnZY', // Aangepast naar default YouTube ID
    titleKey: 'droneshop.diyKitsOverview.hero.title',
    subtitleKey: 'droneshop.diyKitsOverview.hero.subtitle',
    ctaBeginnerKey: 'droneshop.diyKitsOverview.hero.ctaBeginner',
    ctaBeginnerAnchor: '#sub250g-kits',
    ctaExpertKey: 'droneshop.diyKitsOverview.hero.ctaExpert',
    ctaExpertAnchor: '#five-inch-kits'
  },
  valueProp: {
    titleKey: 'droneshop.diyKitsOverview.valueProp.title',
    cards: [
      { icon: AppIcon.Link, titleKey: 'droneshop.diyKitsOverview.valueProp.cards.compatibility.title', descriptionKey: 'droneshop.diyKitsOverview.valueProp.cards.compatibility.description' },
      { icon: AppIcon.PlayCircle, titleKey: 'droneshop.diyKitsOverview.valueProp.cards.guides.title', descriptionKey: 'droneshop.diyKitsOverview.valueProp.cards.guides.description' },
      { icon: AppIcon.LifeBuoy, titleKey: 'droneshop.diyKitsOverview.valueProp.cards.support.title', descriptionKey: 'droneshop.diyKitsOverview.valueProp.cards.support.description' },
      { icon: AppIcon.Award, titleKey: 'droneshop.diyKitsOverview.valueProp.cards.components.title', descriptionKey: 'droneshop.diyKitsOverview.valueProp.cards.components.description' },
      // { icon: AppIcon.BookOpen, titleKey: 'droneshop.diyKitsOverview.valueProp.cards.seamlessBuild.title', descriptionKey: 'droneshop.diyKitsOverview.valueProp.cards.seamlessBuild.description' }
    ]
  },
  kitFinder: {
    imageUrl: 'images/default-image.webp', // Aangepast naar default image
    titleKey: 'droneshop.diyKitsOverview.kitFinder.title',
    subtitleKey: 'droneshop.diyKitsOverview.kitFinder.subtitle',
    buttonTextKey: 'droneshop.diyKitsOverview.kitFinder.cta',
    route: '/quiz/drone-builder'
  },
  sub250gKits: {
    titleKey: 'droneshop.diyKitsOverview.sub250gKits.title',
    anchorId: 'sub250g-kits',
    kits: [
      {
        id: 'bys-siren-f35', nameKey: 'droneshop.diyKitsOverview.sirenF35Kit.name',
        imageUrl: 'images/default-image.webp', // Aangepast naar default image
        descriptionKey: 'droneshop.diyKitsOverview.sirenF35Kit.description',
        features: [
          { icon: AppIcon.Users, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.features.0' },
          { icon: AppIcon.Feather, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.features.1' },
          { icon: AppIcon.Package, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.features.2' },
          { icon: AppIcon.Video, textKey: 'droneshop.diyKitsOverview.sirenF35Kit.features.3' }
        ],
        route: '/products/f3500001-0000-0000-0000-000000000001'
      }
    ] as DiyKitProductCardData[]
  },
  fiveInchKits: {
    titleKey: 'droneshop.diyKitsOverview.fiveInchKits.title',
    anchorId: 'five-inch-kits',
    kits: [
      {
        id: 'bys-siren-f5', nameKey: 'droneshop.diyKitsOverview.sirenF5Kit.name',
        imageUrl: 'images/default-image.webp', // Aangepast naar default image
        descriptionKey: 'droneshop.diyKitsOverview.sirenF5Kit.description',
        features: [
          { icon: AppIcon.BatteryCharging, textKey: 'droneshop.diyKitsOverview.sirenF5Kit.features.0' },
          { icon: AppIcon.GitCommit, textKey: 'droneshop.diyKitsOverview.sirenF5Kit.features.1' },
          { icon: AppIcon.Cpu, textKey: 'droneshop.diyKitsOverview.sirenF5Kit.features.2' },
          { icon: AppIcon.BookOpen, textKey: 'droneshop.diyKitsOverview.sirenF5Kit.features.3' }
        ],
        route: '/products/f5000002-0000-0000-0000-000000000002'
      }
    ] as DiyKitProductCardData[]
  },
  componentDeepDive: {
    titleKey: 'droneshop.diyKitsOverview.componentDeepDive.title',
    subtitleKey: 'droneshop.diyKitsOverview.componentDeepDive.subtitle',
    gridItems: [
      { id: 'frames', icon: AppIcon.GitCommit, titleKey: 'droneshop.navigation.parts.frames', descriptionKey: 'droneshop.diyKitsOverview.componentDeepDive.frames.description', route: '/products/parts/frames' },
      { id: 'stacks', icon: AppIcon.Cpu, titleKey: 'droneshop.navigation.parts.flightControllers', descriptionKey: 'droneshop.diyKitsOverview.componentDeepDive.stacks.description', route: '/products/parts/flight-controllers' },
      { id: 'motors', icon: AppIcon.Power, titleKey: 'droneshop.navigation.parts.motors', descriptionKey: 'droneshop.diyKitsOverview.componentDeepDive.motors.description', route: '/products/parts/motors' },
      { id: 'vtx', icon: AppIcon.Camera, titleKey: 'droneshop.navigation.parts.vtx', descriptionKey: 'droneshop.diyKitsOverview.componentDeepDive.vtx.description', route: '/products/parts/vtx' },
    ] as DiyTechHighlightGridItem[]
  },
  guides: {
    titleKey: 'droneshop.diyKitsOverview.guides.title',
    subtitleKey: 'droneshop.diyKitsOverview.guides.subtitle',
    links: [
      { icon: AppIcon.Video, titleKey: 'droneshop.diyKitsOverview.guides.video.title', descriptionKey: 'droneshop.diyKitsOverview.guides.video.description', route: '/guides/build-videos' },
      { icon: AppIcon.Flame, titleKey: 'droneshop.diyKitsOverview.guides.soldering.title', descriptionKey: 'droneshop.diyKitsOverview.guides.soldering.description', route: '/guides/soldering-101' },
      { icon: AppIcon.Sliders, titleKey: 'droneshop.diyKitsOverview.guides.betaflight.title', descriptionKey: 'droneshop.diyKitsOverview.guides.betaflight.description', route: '/guides/betaflight-tuning' },
    ]
  },
  techHighlights: {
    titleKey: 'droneshop.rtfDronesOverview.techHighlights.title',
    gridItems: [
      { id: 'dji-o4', youtubeVideoId: 'YNuc4wsvnZY', titleKey: 'droneshop.rtfDronesOverview.techHighlights.djiO4.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.djiO4.description', route: '/guides/dji-o4', textAlign: 'center', size: 'large', gridClasses: 'md:col-span-2 lg:col-span-3 lg:row-span-2' },
      { id: 'rcinpower-motors', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.rtfDronesOverview.techHighlights.rcinpower.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.rcinpower.description', route: '/products/parts/motors', textAlign: 'center', size: 'medium', gridClasses: 'md:col-span-1 lg:col-start-4 lg:col-span-3 lg:row-start-1 lg:row-span-1' },
      { id: 'foxeer-hardware', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.rtfDronesOverview.techHighlights.foxeer.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.foxeer.description', route: '/products/parts/flight-controllers', textAlign: 'center', size: 'medium', gridClasses: 'md:col-span-1 lg:col-start-4 lg:col-span-3 lg:row-start-2 lg:row-span-1' },
      { id: 'frame-choice', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.rtfDronesOverview.techHighlights.frameChoice.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.frameChoice.description', route: '/products/parts/frames', textAlign: 'center', size: 'small', gridClasses: 'md:col-span-1 lg:col-span-3' },
      { id: 'radiomaster-txrx', imageUrl: 'images/default-image.webp', titleKey: 'droneshop.rtfDronesOverview.techHighlights.radiomaster.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.radiomaster.description', route: '/products/parts/radios', textAlign: 'center', size: 'small', gridClasses: 'md:col-span-1 lg:col-span-3' },
      { id: 'dji-o4-pro-video-tx', youtubeVideoId: 'YNuc4wsvnZY', titleKey: 'droneshop.rtfDronesOverview.techHighlights.djiO4ProVideoTx.title', descriptionKey: 'droneshop.rtfDronesOverview.techHighlights.djiO4ProVideoTx.description', route: '/guides/dji-o4-pro-transmission', textAlign: 'center', size: 'full-width', gridClasses: 'lg:col-span-6' }
    ] as DiyTechHighlightGridItem[]
  },
  testimonials: {
    titleKey: 'droneshop.diyKitsOverview.testimonials.title',
    items: [
      { id: 't1', name: 'Mark V.', imageUrl: 'images/default-image.webp', quoteKey: 'droneshop.diyKitsOverview.testimonials.t1.quote', author: 'droneshop.diyKitsOverview.testimonials.t1.author' },
      { id: 't2', name: 'Jessica de G.', imageUrl: 'images/default-image.webp', quoteKey: 'droneshop.diyKitsOverview.testimonials.t2.quote', author: 'droneshop.diyKitsOverview.testimonials.t2.author' },
    ]
  },
  faq: {
    titleKey: 'droneshop.diyKitsOverview.faq.title',
    items: [
      { id: 'faq1', questionKey: 'droneshop.diyKitsOverview.faq.q1', answerKey: 'droneshop.diyKitsOverview.faq.a1' },
      { id: 'faq2', questionKey: 'droneshop.diyKitsOverview.faq.q2', answerKey: 'droneshop.diyKitsOverview.faq.a2' },
      { id: 'faq3', questionKey: 'droneshop.diyKitsOverview.faq.q3', answerKey: 'droneshop.diyKitsOverview.faq.a3' },
    ]
  },
  stickyCta: {
    textKey: 'droneshop.diyKitsOverview.stickyCta.text',
    route: '#sub250g-kits'
  },
  seamlessBuildGuide: {
    imageUrl: 'images/default-image.webp', // Aangepast naar default image
    titleKey: 'droneshop.diyKitsOverview.seamlessBuildGuide.title',
    subtitleKey: 'droneshop.diyKitsOverview.seamlessBuildGuide.subtitle',
    buttonTextKey: 'droneshop.diyKitsOverview.seamlessBuildGuide.cta',
    route: '/guides'
  }
};