/**
 * @file product-filters.resolver.ts
 * @Version 3.1.0 (FIXED: Query Parameter Detection & Mapping)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-07
 * @Description
 *   FIXED: Enhanced resolver with better query parameter detection and mapping.
 *   Now properly handles navigation from header links with category filtering.
 */
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take, map, tap } from 'rxjs';
import { ProductActions, selectIsLoading } from '@royal-code/features/products/core';
import { ProductFilters } from '@royal-code/features/products/domain';
import { LoggerService } from '@royal-code/core/core-logging';

/**
 * FIXED: Complete mapping table for all navigation slugs to backend category keys
 */
const SLUG_TO_KEY_MAPPING: Record<string, string> = {
  // FPV Gear - FIXED: Add missing mappings
  'fpv-gear': 'fpvGear',
  'digital-fpv-goggles': 'fpvGear.digitalGoggles', // FIXED: Main mapping for header nav
  'analog-fpv-goggles': 'fpvGear.analogGoggles',   // FIXED: Main mapping for header nav
  'digital-goggles': 'fpvGear.digitalGoggles',     // ALTERNATIVE: Keep as fallback
  'analog-goggles': 'fpvGear.analogGoggles',       // ALTERNATIVE: Keep as fallback
  'goggle-accessories': 'fpvGear.goggleAccessories',
  'fpv-cameras': 'fpvGear.fpvCameras',
  'digital-fpv-cameras': 'fpvGear.digitalFpvCameras',
  'analog-fpv-cameras': 'fpvGear.analogFpvCameras',
  'video-transmitters': 'fpvGear.videoTransmitters',
  'digital-vtx': 'fpvGear.digitalVtx',
  'analog-vtx': 'fpvGear.analogVtx',
  'receiver-modules': 'fpvGear.receiverModules',
  'fpv-antennas': 'fpvGear.fpvAntennas',
  'monitors-dvrs': 'fpvGear.monitorsDvrs',
  
  // Complete Systems
  'drones-kits': 'dronesAndKits',
  'rtf-drones': 'dronesAndKits.rtfDrones',
  'build-kits': 'dronesAndKits.buildKits',
  'complete-systems': 'dronesAndKits',
  
  // Parts - Electronics
  'parts': 'parts',
  'elektronica-flight-stack': 'parts.electronics',
  'flight-controllers': 'parts.flightControllers',
  'escs': 'parts.escs',
  'fc-esc-stacks': 'parts.fcEscStacks',
  'pdbs': 'parts.pdbs',
  'voltage-regulators-bec': 'parts.voltageRegulatorsBec',
  'gps-kompas-modules': 'parts.gpsCompassModules',
  'sensoren-blackbox': 'parts.sensorsBlackbox',
  'buzzers-leds': 'parts.buzzersLeds',
  
  // Parts - Mechanical
  'aandrijving': 'parts.drivetrain',
  'motors': 'parts.motors',
  'propellers': 'parts.propellers',
  'motor-hardware': 'parts.motorHardware',
  'frames-hardware': 'parts.framesHardware',
  'frames': 'parts.framesHardware',
  'frames-5inch': 'parts.5InchFrames',
  'frames-3-4inch': 'parts.34InchFrames',
  'frames-cinewhoop': 'parts.cinewhoopFrames',
  'frames-micro-tiny': 'parts.microTinywhoopFrames',
  'frame-parts': 'parts.framePartsReplacements',
  'algemene-hardware': 'parts.generalHardware',
  '3d-printed-parts': 'parts.3dPrintedPartsTpu',
  'camera-mounts': 'parts.cameraMounts',
  'antenne-mounts': 'parts.antennaMounts',
  'motor-soft-mounts-guards': 'parts.motorSoftMountsGuards',
  'frame-beschermers': 'parts.frameProtectors',
  
  // Radio Control
  'radio-control': 'radioControl',
  'radio-zenders': 'radioControl.transmitters',
  'multi-protocol-zenders': 'radioControl.multiProtocolTransmitters',
  'elrs-zenders': 'radioControl.elrsTransmitters',
  'crossfire-zenders-modules': 'radioControl.crossfireTransmittersModules',
  'tx-accessoires-upgrades': 'radioControl.transmitterAccessoriesUpgrades',
  'rc-ontvangers': 'radioControl.receivers',
  'elrs-ontvangers': 'radioControl.elrsReceivers',
  'crossfire-ontvangers': 'radioControl.crossfireReceivers',
  'frsky-ontvangers': 'radioControl.frskyReceivers',
  'overige-rc-ontvangers': 'radioControl.otherRcReceivers',
  'externe-rc-modules': 'radioControl.externalRcModules',
  'elrs-modules': 'radioControl.elrsModules',
  'crossfire-modules': 'radioControl.crossfireModules',
  'multi-protocol-modules': 'radioControl.multiProtocolModules',
  'rc-antennes': 'radioControl.rcAntennas',
  'gimbals-schakelaars': 'radioControl.gimbalsSwitches',
  
  // Power & Energy
  'power-energy': 'chargersAndLipos',
  'batteries': 'chargersAndLipos.lipos',
  'lipo-1s': 'chargersAndLipos.lipos.s1',
  'lipo-2s': 'chargersAndLipos.lipos.s2', 
  'lipo-3s': 'chargersAndLipos.lipos.s3',
  'lipo-4s': 'chargersAndLipos.lipos.s4',
  'lipo-6s': 'chargersAndLipos.lipos.s6',
  'lipo-8s': 'chargersAndLipos.lipos.s8',
  'chargers-power-supplies': 'chargersAndLipos.chargers',
  'hota-laders': 'chargersAndLipos.chargers.hota',
  'isdt-laders': 'chargersAndLipos.chargers.isdt',
  'ac-dc-laders': 'chargersAndLipos.chargers.acdc',
  'dc-laders': 'chargersAndLipos.chargers.dc',
  'voedingen': 'chargersAndLipos.chargers.psu',
  
  // Workshop & Field
  'werkplaats-veld': 'workshopField',
  'gereedschap-bouwbenodigdheden': 'workshopField.toolsBuildingSupplies',
  'soldeerbouten-accessoires': 'workshopField.solderingIronsAccessories',
  'handgereedschap': 'workshopField.handTools',
  'draden-connectoren-krimpkous': 'workshopField.wiresConnectorsHeatShrink',
  'bevestigingsmaterialen': 'workshopField.fasteners',
  'tape-lijm': 'workshopField.tapeGlue',
  'transport-opslag': 'workshopField.transportStorage',
  'backpacks-koffers': 'workshopField.backpacksCases',
  'opbergdozen-organizers': 'workshopField.storageBoxesOrganizers',
  'landing-pads': 'workshopField.landingPads',
  'simulatoren-training': 'workshopField.simulatorsTraining',
  'fpv-simulatoren': 'workshopField.fpvSimulators',
  'simulator-controllers': 'workshopField.simulatorControllers',
};

/**
 * ENHANCED: Maps URL query parameters to ProductFilters with comprehensive validation
 */
function mapQueryParamsToFilters(queryParams: { [key: string]: any }, logger: LoggerService): Partial<ProductFilters> {
  const filters: Partial<ProductFilters> = {};
  
  logger.info('[ProductFiltersResolver] === QUERY PARAMETER PROCESSING START ===');
  logger.debug('[ProductFiltersResolver] Raw query parameters:', queryParams);
  
  // ENHANCED: Category filtering with slug-to-key mapping
  if (queryParams['category']) {
    const categoryParams = Array.isArray(queryParams['category']) 
      ? queryParams['category'] 
      : [queryParams['category']];
      
    logger.debug(`[ProductFiltersResolver] Processing category parameters:`, categoryParams);
      
    const mappedCategoryIds = categoryParams.map(slug => {
      const mappedKey = SLUG_TO_KEY_MAPPING[slug];
      if (mappedKey) {
        logger.info(`[ProductFiltersResolver] ✅ Mapped category slug '${slug}' -> '${mappedKey}'`);
        return mappedKey;
      } else {
        logger.warn(`[ProductFiltersResolver] ⚠️ No mapping found for category slug '${slug}', using as-is`);
        return slug; // Fallback to using slug as-is
      }
    });
    
    Object.assign(filters, { categoryIds: mappedCategoryIds });
    logger.info(`[ProductFiltersResolver] 🎯 Final category IDs:`, mappedCategoryIds);
  }
  
  // Brand filtering
  if (queryParams['brand']) {
    const brandIds = Array.isArray(queryParams['brand']) 
      ? queryParams['brand'] 
      : [queryParams['brand']];
    Object.assign(filters, { brandIds });
    logger.debug(`[ProductFiltersResolver] Brand filters:`, brandIds);
  }
  
  // Search term
  if (queryParams['q']) {
    Object.assign(filters, { searchTerm: queryParams['q'] });
    logger.debug(`[ProductFiltersResolver] Search term: '${queryParams['q']}'`);
  }
  
  // Sorting
  if (queryParams['sortBy']) {
    Object.assign(filters, { sortBy: queryParams['sortBy'] });
    logger.debug(`[ProductFiltersResolver] Sort by: ${queryParams['sortBy']}`);
  }
  
  if (queryParams['sortDirection']) {
    Object.assign(filters, { sortDirection: queryParams['sortDirection'] });
    logger.debug(`[ProductFiltersResolver] Sort direction: ${queryParams['sortDirection']}`);
  }
  
  // Pagination
  if (queryParams['page']) {
    const page = parseInt(queryParams['page'], 10);
    if (!isNaN(page) && page > 0) {
      Object.assign(filters, { page });
      logger.debug(`[ProductFiltersResolver] Page: ${page}`);
    }
  }
  
  // Price range
  if (queryParams['minPrice'] || queryParams['maxPrice']) {
    const priceRange: any = {};
    if (queryParams['minPrice']) {
      const min = parseFloat(queryParams['minPrice']);
      if (!isNaN(min)) priceRange.min = min;
    }
    if (queryParams['maxPrice']) {
      const max = parseFloat(queryParams['maxPrice']);
      if (!isNaN(max)) priceRange.max = max;
    }
    if (Object.keys(priceRange).length > 0) {
      Object.assign(filters, { priceRange });
      logger.debug(`[ProductFiltersResolver] Price range:`, priceRange);
    }
  }
  
  // Boolean filters
  if (queryParams['onSale'] === 'true') {
    Object.assign(filters, { onSaleOnly: true });
    logger.debug(`[ProductFiltersResolver] On sale only: true`);
  }
  
  if (queryParams['inStock'] === 'true') {
    Object.assign(filters, { inStockOnly: true });
    logger.debug(`[ProductFiltersResolver] In stock only: true`);
  }
  
  if (queryParams['featured'] === 'true') {
    Object.assign(filters, { isFeatured: true });
    logger.debug(`[ProductFiltersResolver] Featured only: true`);
  }
  
  logger.info('[ProductFiltersResolver] === FINAL MAPPED FILTERS ===');
  logger.info('[ProductFiltersResolver] Final mapped filters:', filters);
  return filters;
}

/**
 * ENHANCED: Product Filters Resolver with comprehensive state synchronization
 */
export const productFiltersResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const logger = inject(LoggerService);
  
  // CRITICAL FIX: Ensure we get the query parameters correctly
  const queryParams = route.queryParams || {};
  
  logger.info('[ProductFiltersResolver] ===== RESOLVER EXECUTION START =====');
  logger.info('[ProductFiltersResolver] Route configuration:', {
    path: route.routeConfig?.path,
    url: route.url,
    queryParams: queryParams,
    parameterCount: Object.keys(queryParams).length
  });
  
  const initialFilters = mapQueryParamsToFilters(queryParams, logger);
  
  // ENHANCED: Force refresh to ensure clean state
  store.dispatch(ProductActions.pageOpened({ 
    initialFilters,
    forceRefresh: true 
  }));
  
  logger.info('[ProductFiltersResolver] Dispatched pageOpened action with filters:', initialFilters);
  
  // Wait for initial loading to complete
  return store.select(selectIsLoading).pipe(
    tap(isLoading => logger.debug(`[ProductFiltersResolver] Loading state: ${isLoading}`)),
    filter(isLoading => !isLoading), 
    take(1), 
    map(() => {
      logger.info('[ProductFiltersResolver] ===== RESOLVER EXECUTION COMPLETE =====');
      logger.debug('[ProductFiltersResolver] Initial loading completed, component can now initialize');
      return true;
    })
  );
};