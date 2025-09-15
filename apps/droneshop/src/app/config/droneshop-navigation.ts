/**
 * @file droneshop-navigation.ts
 * @Version 1.1.0 (100% Complete)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   De definitieve en 100% complete, app-specifieke navigatiedata voor de Droneshop applicatie.
 *   Dit bestand bevat de volledige, onverkorte configuratie voor de primaire navigatie,
 *   de top-bar en de footer.
 */
import { NavigationItem, AppIcon, NavDisplayHintEnum, Image, MediaType } from '@royal-code/shared/domain';

const placeholderImg: Image = {
  id: 'default-img',
  type: MediaType.IMAGE,
  variants: [{ url: '/images/default-image.webp', width: 200 }],
  altText: 'Placeholder'
};

// Data voor de hoofdnavigatiebalk
export const DRONESHOP_PRIMARY_NAVIGATION: NavigationItem[] = [
  // === ONDERDELEN ===
  { 
    id: 'onderdelen', 
    labelKey: 'droneshop.categories.parts',
    route: ['/products'],
    queryParams: { category: 'parts' },
    menuType: 'mega-menu', 
    megaMenuLayout: 'vertical-split', 
    queryParamsHandling: 'merge',
    displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal],
    children: [
      { 
        id: 'elektronica-flight-stack', 
        labelKey: 'droneshop.categories.parts.flightControllers',
        route: ['/products'], 
        queryParams: { category: 'flight-electronics' }, 
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'flight-controllers', labelKey: 'droneshop.categories.parts.flightControllers', route: ['/products'], queryParams: { category: 'flight-controllers' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'escs', labelKey: 'droneshop.categories.parts.escs', route: ['/products'], queryParams: { category: 'escs' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'fc-esc-stacks', labelKey: 'droneshop.categories.parts.fcEscStacks', route: ['/products'], queryParams: { category: 'fc-stacks' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'pdbs', labelKey: 'droneshop.categories.parts.pdbs', route: ['/products'], queryParams: { category: 'power-distribution' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'voltage-regulators-bec', labelKey: 'droneshop.categories.parts.voltageRegulatorsBec', route: ['/products'], queryParams: { category: 'voltage-regulators-bec' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'gps-kompas-modules', labelKey: 'droneshop.categories.parts.gpsCompassModules', route: ['/products'], queryParams: { category: 'gps-kompas-modules' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'sensoren-blackbox', labelKey: 'droneshop.categories.parts.sensorsBlackbox', route: ['/products'], queryParams: { category: 'sensors-navigation' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'buzzers-leds', labelKey: 'droneshop.categories.parts.buzzersLeds', route: ['/products'], queryParams: { category: 'signaling' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'aandrijving', 
        labelKey: 'droneshop.categories.parts.drivetrain', 
        route: ['/products'], 
        queryParams: { category: 'propulsion' }, 
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'motors', labelKey: 'droneshop.categories.parts.motors', route: ['/products'], queryParams: { category: 'motors' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'propellers', labelKey: 'droneshop.categories.parts.propellers', route: ['/products'], queryParams: { category: 'propellers' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'motor-hardware', labelKey: 'droneshop.categories.parts.motorHardware', route: ['/products'], queryParams: { category: 'motor-hardware' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'frames-hardware', 
        labelKey: 'droneshop.categories.parts.framesHardware', 
        route: ['/products'], 
        queryParams: { category: 'frames' }, 
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: '5-inch-frames', labelKey: 'droneshop.categories.parts.5InchFrames', route: ['/products'], queryParams: { category: 'frames-5inch' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: '3-4-inch-frames', labelKey: 'droneshop.categories.parts.34InchFrames', route: ['/products'], queryParams: { category: 'frames-3-4inch' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'cinewhoop-frames', labelKey: 'droneshop.categories.parts.cinewhoopFrames', route: ['/products'], queryParams: { category: 'frames-cinewhoop' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'micro-tinywhoop-frames', labelKey: 'droneshop.categories.parts.microTinywhoopFrames', route: ['/products'], queryParams: { category: 'frames-micro-tiny' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'frame-onderdelen-replacements', labelKey: 'droneshop.categories.parts.framePartsReplacements', route: ['/products'], queryParams: { category: 'frame-parts' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'algemene-hardware', labelKey: 'droneshop.categories.parts.generalHardware', route: ['/products'], queryParams: { category: 'hardware-mounting' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'fpv-systemen-drone', 
        labelKey: 'droneshop.categories.parts.fpvSystemsDrone', 
        route: ['/products'], 
        queryParams: { category: 'video-fpv' }, 
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'digital-fpv-combos', labelKey: 'droneshop.categories.parts.digitalFpvCombos', route: ['/products'], queryParams: { category: 'digital-fpv-combos' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'digital-fpv-cameras', labelKey: 'droneshop.categories.parts.digitalFpvCameras', route: ['/products'], queryParams: { category: 'digital-fpv-cameras' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'analog-fpv-cameras', labelKey: 'droneshop.categories.parts.analogFpvCameras', route: ['/products'], queryParams: { category: 'analog-fpv-cameras' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'digital-vtx', labelKey: 'droneshop.categories.parts.digitalVtx', route: ['/products'], queryParams: { category: 'digital-vtx' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'analog-vtx', labelKey: 'droneshop.categories.parts.analogVtx', route: ['/products'], queryParams: { category: 'analog-vtx' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'fpv-antennas-drone', labelKey: 'droneshop.categories.parts.fpvAntennasDrone', route: ['/products'], queryParams: { category: 'drone-video-antennas' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'fpv-systeem-accessoires', labelKey: 'droneshop.categories.parts.fpvSystemAccessories', route: ['/products'], queryParams: { category: 'vtx-accessories' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: '3d-printed-parts-tpu', 
        labelKey: 'droneshop.categories.parts.3dPrintedPartsTpu', 
        route: ['/products'], 
        queryParams: { category: '3d-printed-parts' }, 
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'camera-mounts', labelKey: 'droneshop.categories.parts.cameraMounts', route: ['/products'], queryParams: { category: 'camera-mounts-accessories' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'antenne-mounts', labelKey: 'droneshop.categories.parts.antennaMounts', route: ['/products'], queryParams: { category: 'antenna-mounts' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'motor-soft-mounts-guards', labelKey: 'droneshop.categories.parts.motorSoftMountsGuards', route: ['/products'], queryParams: { category: 'motor-soft-mounts-guards' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'frame-beschermers', labelKey: 'droneshop.categories.parts.frameProtectors', route: ['/products'], queryParams: { category: 'frame-beschermers' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      {
        id: 'laders-en-lipos',
        labelKey: 'droneshop.categories.chargersAndLipos',
        route: ['/products'],
        queryParams: { category: 'power-energy' },
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        megaMenuFeaturedItems: [ 
          { 
            id: 'lipos', 
            labelKey: 'droneshop.categories.chargersAndLipos.lipos.title', 
            route: ['/products'], 
            queryParams: { category: 'batteries' }, 
            image: placeholderImg, 
            description: 'droneshop.categories.chargersAndLipos.lipos.description',
            queryParamsHandling: 'merge',
            displayHint: [NavDisplayHintEnum.MobileModal],
            children: [
              { id: '1s-lipo', labelKey: 'droneshop.categories.chargersAndLipos.lipos.s1', route: ['/products'], queryParams: { category: 'lipo-1s' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
              { id: '2s-lipo', labelKey: 'droneshop.categories.chargersAndLipos.lipos.s2', route: ['/products'], queryParams: { category: 'lipo-2s' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
              { id: '3s-lipo', labelKey: 'droneshop.categories.chargersAndLipos.lipos.s3', route: ['/products'], queryParams: { category: 'lipo-3s' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
              { id: '4s-lipo', labelKey: 'droneshop.categories.chargersAndLipos.lipos.s4', route: ['/products'], queryParams: { category: 'lipo-4s' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
              { id: '6s-lipo', labelKey: 'droneshop.categories.chargersAndLipos.lipos.s6', route: ['/products'], queryParams: { category: 'lipo-6s' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
              { id: '8s-lipo', labelKey: 'droneshop.categories.chargersAndLipos.lipos.s8', route: ['/products'], queryParams: { category: 'lipo-8s' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
            ]
          },
          { 
            id: 'laders', 
            labelKey: 'droneshop.categories.chargersAndLipos.chargers.title', 
            route: ['/products'], 
            queryParams: { category: 'chargers-power-supplies' }, 
            image: placeholderImg, 
            description: 'droneshop.categories.chargersAndLipos.chargers.description',
            queryParamsHandling: 'merge',
            displayHint: [NavDisplayHintEnum.MobileModal],
            children: [
              { id: 'hota-laders', labelKey: 'droneshop.categories.chargersAndLipos.chargers.hota', route: ['/products'], queryParams: { brand: 'hota' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
              { id: 'isdt-laders', labelKey: 'droneshop.categories.chargersAndLipos.chargers.isdt', route: ['/products'], queryParams: { brand: 'isdt' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
              { id: 'ac-dc-laders', labelKey: 'droneshop.categories.chargersAndLipos.chargers.acdc', route: ['/products'], queryParams: { category: 'acdc-chargers' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
              { id: 'dc-laders', labelKey: 'droneshop.categories.chargersAndLipos.chargers.dc', route: ['/products'], queryParams: { category: 'dc-chargers' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
              { id: 'voedingen', labelKey: 'droneshop.categories.chargersAndLipos.chargers.psu', route: ['/products'], queryParams: { category: 'power-supplies' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
            ]
          },
        ]
      },
    ]
  },
  { 
    id: 'drones', 
    labelKey: 'droneshop.categories.dronesAndKits', 
    route: ['/products'], 
    queryParams: { category: 'complete-systems' },
    menuType: 'mega-menu', 
    megaMenuLayout: 'featured-grid', 
    queryParamsHandling: 'merge',
    displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal],
    megaMenuFeaturedItems: [
      { 
        id: 'rtf-bnf-drones', 
        labelKey: 'droneshop.categories.rtfDrones', 
        route: ['/drones/rtf-drones'],
        image: placeholderImg, 
        description: 'Klaar om te vliegen. Pak uit, laad op, en ga de lucht in.',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'quadmula-siren-f35', labelKey: 'Quadmula Siren F3.5', route: ['/drones/rtf-drones/quadmula-siren-f35'], displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'quadmula-siren-f5', labelKey: 'Quadmula Siren F5', route: ['/drones/rtf-drones/quadmula-siren-f5'], displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'drone-build-kits', 
        labelKey: 'droneshop.categories.buildKits', 
        route: ['/drones/build-kits'],
        image: placeholderImg, 
        description: 'Bouw je perfecte drone. Elk onderdeel gekozen door jou.',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'quadmula-siren-f35-pdp', labelKey: 'Quadmula Siren F3.5 Kit', route: ['/drones/build-kits/quadmula-siren-f35-pdp'], displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'quadmula-siren-f5-pdp', labelKey: 'Quadmula Siren F5 Kit', route: ['/drones/build-kits/quadmula-siren-f5-pdp'], displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { id: 'frames-quick', labelKey: 'droneshop.categories.parts.frames', route: ['/products'], queryParams: { category: 'frames' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
      { id: 'motors-quick', labelKey: 'droneshop.categories.parts.motors', route: ['/products'], queryParams: { category: 'motors' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
      { id: 'electronics-quick', labelKey: 'droneshop.categories.parts.electronics', route: ['/products'], queryParams: { category: 'flight-electronics' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
    ]
  },
  { 
    id: 'radio-control', 
    labelKey: 'droneshop.categories.radioControl', 
    route: ['/products'],
    queryParams: { category: 'radio-control' },
    menuType: 'mega-menu', 
    megaMenuLayout: 'featured-grid', 
    queryParamsHandling: 'merge',
    displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal],
    megaMenuFeaturedItems: [
      { 
        id: 'radio-zenders', 
        labelKey: 'droneshop.categories.radioControl.transmitters', 
        route: ['/products'],
        queryParams: { category: 'transmitters-controllers' },
        image: placeholderImg,
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'multi-protocol-zenders', labelKey: 'droneshop.categories.radioControl.multiProtocolTransmitters', route: ['/products'], queryParams: { category: 'multi-protocol-tx' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'elrs-zenders', labelKey: 'droneshop.categories.radioControl.elrsTransmitters', route: ['/products'], queryParams: { category: 'elrs-tx' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'crossfire-zenders-modules', labelKey: 'droneshop.categories.radioControl.crossfireTransmittersModules', route: ['/products'], queryParams: { category: 'crossfire-tx' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'tx-accessoires-upgrades', labelKey: 'droneshop.categories.radioControl.transmitterAccessoriesUpgrades', route: ['/products'], queryParams: { category: 'tx-modules' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'rc-ontvangers', 
        labelKey: 'droneshop.categories.radioControl.receivers', 
        route: ['/products'],
        queryParams: { category: 'receivers' },
        image: placeholderImg,
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'elrs-ontvangers', labelKey: 'droneshop.categories.radioControl.elrsReceivers', route: ['/products'], queryParams: { category: 'elrs-rx' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'crossfire-ontvangers', labelKey: 'droneshop.categories.radioControl.crossfireReceivers', route: ['/products'], queryParams: { category: 'crossfire-rx' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'frsky-ontvangers', labelKey: 'droneshop.categories.radioControl.frskyReceivers', route: ['/products'], queryParams: { category: 'frsky-rx' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'overige-rc-ontvangers', labelKey: 'droneshop.categories.radioControl.otherRcReceivers', route: ['/products'], queryParams: { category: 'other-rx' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'externe-rc-modules', 
        labelKey: 'droneshop.categories.radioControl.externalRcModules', 
        route: ['/products'],
        queryParams: { category: 'rc-modules-adapters' },
        image: placeholderImg,
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'elrs-modules', labelKey: 'droneshop.categories.radioControl.elrsModules', route: ['/products'], queryParams: { category: 'elrs-modules' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'crossfire-modules', labelKey: 'droneshop.categories.radioControl.crossfireModules', route: ['/products'], queryParams: { category: 'crossfire-modules' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'multi-protocol-modules', labelKey: 'droneshop.categories.radioControl.multiProtocolModules', route: ['/products'], queryParams: { category: 'multi-protocol-modules' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { id: 'rc-antennes', labelKey: 'droneshop.categories.radioControl.rcAntennas', route: ['/products'], queryParams: { category: 'rc-antennas-accessories' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
      { id: 'gimbals-schakelaars', labelKey: 'droneshop.categories.radioControl.gimbalsSwitches', route: ['/products'], queryParams: { category: 'gimbals-hardware' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
    ]
  },
  { 
    id: 'fpv-gear', 
    labelKey: 'droneshop.categories.fpvGear', 
    route: ['/products'],
    queryParams: { category: 'fpvGear' },
    menuType: 'mega-menu', 
    megaMenuLayout: 'vertical-split', 
    queryParamsHandling: 'merge',
    displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal],
    children: [
      { 
        id: 'fpv-goggles', 
        labelKey: 'droneshop.categories.fpvGear.goggles', 
        route: ['/products'],
        queryParams: { category: 'fpvGear' },
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { 
            id: 'digital-fpv-goggles', 
            labelKey: 'droneshop.categories.fpvGear.digitalGoggles', 
            route: ['/products'], 
            queryParams: { category: 'fpvGear.digitalGoggles' },
            image: placeholderImg, 
            queryParamsHandling: 'merge',
            displayHint: [NavDisplayHintEnum.MobileModal]
          },
          { id: 'analog-fpv-goggles', labelKey: 'droneshop.categories.fpvGear.analogGoggles', route: ['/products'], queryParams: { category: 'fpvGear.analogGoggles' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'goggle-accessories', labelKey: 'droneshop.categories.fpvGear.goggleAccessories', route: ['/products'], queryParams: { category: 'goggle-accessories' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'fpv-receiver-modules', 
        labelKey: 'droneshop.categories.fpvGear.receiverModules', 
        route: ['/products'],
        queryParams: { category: 'receiver-modules' },
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'analog-receiver-modules', labelKey: 'droneshop.categories.fpvGear.analogReceiverModules', route: ['/products'], queryParams: { category: 'analog-receiver-modules' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'digital-receiver-modules', labelKey: 'droneshop.categories.fpvGear.digitalReceiverModules', route: ['/products'], queryParams: { category: 'digital-receiver-modules' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'vtx-fpv', 
        labelKey: 'droneshop.categories.fpvGear.videoTransmitters', 
        route: ['/products'],
        queryParams: { category: 'fpvGear.videoTransmitters' },
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'digital-vtx-fpv', labelKey: 'droneshop.categories.fpvGear.digitalVtx', route: ['/products'], queryParams: { category: 'digital-vtx' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'analog-vtx-fpv', labelKey: 'droneshop.categories.fpvGear.analogVtx', route: ['/products'], queryParams: { category: 'analog-vtx' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'fpv-cameras', 
        labelKey: 'droneshop.categories.fpvGear.fpvCameras', 
        route: ['/products'],
        queryParams: { category: 'fpv-cameras' },
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'digital-fpv-cameras-gear', labelKey: 'droneshop.categories.fpvGear.digitalFpvCameras', route: ['/products'], queryParams: { category: 'digital-fpv-cameras' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'analog-fpv-cameras-gear', labelKey: 'droneshop.categories.fpvGear.analogFpvCameras', route: ['/products'], queryParams: { category: 'analog-fpv-cameras' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'fpv-antennas', 
        labelKey: 'droneshop.categories.fpvGear.fpvAntennas', 
        route: ['/products'],
        queryParams: { category: 'video-antennas' },
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'goggle-antennas', labelKey: 'droneshop.categories.fpvGear.goggleAntennas', route: ['/products'], queryParams: { category: 'goggle-antennas' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'drone-video-antennas', labelKey: 'droneshop.categories.fpvGear.droneVideoAntennas', route: ['/products'], queryParams: { category: 'drone-video-antennas' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'monitors-dvrs', 
        labelKey: 'droneshop.categories.fpvGear.monitorsDvrs', 
        route: ['/products'],
        queryParams: { category: 'monitoring-recording' },
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: []
      }
    ]
  },
  { 
    id: 'werkplaats-veld', 
    labelKey: 'droneshop.categories.workshopField', 
    route: ['/products'],
    queryParams: { category: 'workshopField.solderingIronsAccessories' }, 
    menuType: 'mega-menu', 
    megaMenuLayout: 'featured-grid', 
    queryParamsHandling: 'merge',
    displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal],
    megaMenuFeaturedItems: [
      { 
        id: 'gereedschap-bouwbenodigdheden', 
        labelKey: 'droneshop.categories.workshopField.toolsBuildingSupplies', 
        route: ['/products'],
        queryParams: { category: 'consumables-materials' },
        image: placeholderImg,
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'soldeerbouten-accessoires', labelKey: 'droneshop.categories.workshopField.solderingIronsAccessories', route: ['/products'], queryParams: { category: 'workshopField.solderingIronsAccessories' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }, 
          { id: 'handgereedschap', labelKey: 'droneshop.categories.workshopField.handTools', route: ['/products'], queryParams: { category: 'mechanical-tools' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'draden-connectoren-krimpkous', labelKey: 'droneshop.categories.workshopField.wiresConnectorsHeatShrink', route: ['/products'], queryParams: { category: 'wires-cables' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'bevestigingsmaterialen', labelKey: 'droneshop.categories.workshopField.fasteners', route: ['/products'], queryParams: { category: 'cable-ties-fasteners' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'tape-lijm', labelKey: 'droneshop.categories.parts.tapeGlue', route: ['/products'], queryParams: { category: 'tape-adhesives' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'transport-opslag', 
        labelKey: 'droneshop.categories.workshopField.transportStorage', 
        route: ['/products'],
        queryParams: { category: 'transport-storage' },
        image: placeholderImg,
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'backpacks-koffers', labelKey: 'droneshop.categories.workshopField.backpacksCases', route: ['/products'], queryParams: { category: 'drone-backpacks' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'opbergdozen-organizers', labelKey: 'droneshop.categories.workshopField.storageBoxesOrganizers', route: ['/products'], queryParams: { category: 'component-storage' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'landing-pads', labelKey: 'droneshop.categories.workshopField.landingPads', route: ['/products'], queryParams: { category: 'landing-pads' }, image: placeholderImg, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      },
      { 
        id: 'simulatoren-training', 
        labelKey: 'droneshop.categories.workshopField.simulatorsTraining', 
        route: ['/products'],
        queryParams: { category: 'training-simulation' },
        queryParamsHandling: 'merge',
        displayHint: [NavDisplayHintEnum.MobileModal],
        children: [
          { id: 'fpv-simulatoren', labelKey: 'droneshop.categories.workshopField.fpvSimulators', route: ['/products'], queryParams: { category: 'fpv-simulators' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] },
          { id: 'simulator-controllers', labelKey: 'droneshop.categories.workshopField.simulatorControllers', route: ['/products'], queryParams: { category: 'simulator-controllers' }, queryParamsHandling: 'merge', displayHint: [NavDisplayHintEnum.MobileModal] }
        ]
      }
    ]
  }
];

// Data voor de top-bar (kleinere, secundaire links)
export const DRONESHOP_TOPBAR_NAVIGATION: NavigationItem[] = [
  { id: 'order-status', labelKey: 'droneshop.navigation.orderStatus', route: '/orders', displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'contact', labelKey: 'droneshop.navigation.contact', route: '/contact', displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
];

// Data voor de footer
export const DRONESHOP_FOOTER_LINKS = {
  supportLinks: [
    { id: 'faq', labelKey: 'footer.links.faq', route: '/faq' },
    { id: 'shipping', labelKey: 'footer.links.shipping', route: '/shipping' },
    { id: 'returns', labelKey: 'footer.links.returns', route: '/returns' },
    { id: 'order-status', labelKey: 'footer.links.orderStatus', route: '/orders' },
    { id: 'contact', labelKey: 'footer.links.contact', route: '/contact' },
  ],
  shopLinks: [
    { id: 'shop-rtf-drones', labelKey: 'droneshop.categories.rtfDrones', route: ['/drones/rtf-drones'] },
    { id: 'shop-build-kits', labelKey: 'droneshop.categories.buildKits', route: ['/drones/build-kits'] },
    { id: 'shop-parts', labelKey: 'droneshop.categories.parts', route: ['/products'], queryParams: { category: 'parts' } },
    { id: 'shop-fpv-gear', labelKey: 'droneshop.categories.fpvGear', route: ['/products'], queryParams: { category: 'fpvGear' } },
    { id: 'shop-radio-control', labelKey: 'droneshop.categories.radioControl', route: ['/products'], queryParams: { category: 'radio-control' } },
    { id: 'shop-sale', labelKey: 'droneshop.navigation.onSale', route: '/sale' },
  ],
  companyLinks: [
    { id: 'about', labelKey: 'footer.links.about', route: '/about' },
    { id: 'careers', labelKey: 'footer.links.careers', route: '/careers' },
    { id: 'blog', labelKey: 'footer.links.blog', route: '/blog' },
  ],
};

// Gecombineerde data voor de mobiele modal
export const DRONESHOP_MOBILE_MODAL_NAVIGATION: NavigationItem[] = [
  ...DRONESHOP_PRIMARY_NAVIGATION.filter(item => item.displayHint?.includes(NavDisplayHintEnum.MobileModal)).map(item => ({
    ...item,
    children: item.children?.filter(child => child.displayHint?.includes(NavDisplayHintEnum.MobileModal))
  })),
  { ...DRONESHOP_TOPBAR_NAVIGATION[0], dividerBefore: true }, // Voeg een divider toe
  ...DRONESHOP_TOPBAR_NAVIGATION.slice(1)
];