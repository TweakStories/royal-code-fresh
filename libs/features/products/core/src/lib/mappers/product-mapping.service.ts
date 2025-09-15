/**
 * @file product-mapping.service.ts
 * @version 19.0.0 (DEFINITIVE FIX: Correct Numeric StockStatus Mapping)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Definitieve, gecorrigeerde mapping service. Deze versie lost een kritieke bug op
 *   door een private helper `mapNumericStockStatusToString` toe te voegen, die
 *   numerieke stock statussen (zoals '1' voor 'inStock') van de backend DTO's
 *   correct vertaalt naar de string-enums die de frontend state verwacht. Dit
 *   herstelt de functionaliteit van de "Toevoegen aan Winkelwagen" knop.
 */
import { Injectable, inject } from '@angular/core';
import {
  Product,
  PhysicalProduct,
  VariantAttribute,
  VariantAttributeValue,
  ProductVariantCombination,
  VariantAttributeType,
  ProductType,
  ProductAvailabilityRules,
  ProductDisplaySpecification,
  ProductColorVariantTeaser,
  ProductDiscount,
  DiscountType,
  StockStatus,
  ProductStatus,
} from '@royal-code/features/products/domain';
import { Image, Media, MediaType } from '@royal-code/shared/domain';
import {
  BackendProductListItemDto,
  BackendProductDetailDto,
  BackendMediaDto,
  BackendVariantAttributeDto,
  BackendVariantAttributeValueDto,
  BackendProductVariantCombinationDto,
  BackendColorVariantTeaserDto,
  BackendProductDisplaySpecificationDto,
  BackendProductAvailabilityRulesDto,
  BackendMediaTeaserDto,
  BackendPaginatedListDto,
} from '../DTO/backend.types';
import { mapProductStatus, mapProductType, mapStockStatus } from './enum.mappers';
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { AppIcon } from '@royal-code/shared/domain';
import { APP_CONFIG, AppConfig } from '@royal-code/core/config';
import { LoggerService } from '@royal-code/core/core-logging';

export interface ProductCollectionResponse {
  readonly items: Product[];
  readonly totalCount: number;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductMappingService {
  private readonly config = inject(APP_CONFIG) as AppConfig;
  private readonly logger = inject(LoggerService);
  private readonly backendOrigin: string;

  constructor() {
    try {
      const url = new URL(this.config.backendUrl);
      this.backendOrigin = url.origin;
    } catch (error) {
      this.logger.error(`[ProductMappingService] Invalid backendUrl in config. Could not determine origin.`, this.config.backendUrl);
      this.backendOrigin = '';
    }
  }

  /**
   * @method toAbsoluteUrl
   * @description Converteert een relatieve URL naar een absolute URL met behulp van de geconfigureerde backend origin.
   */
  private toAbsoluteUrl(relativePath: string | null | undefined): string | undefined {
    if (!relativePath) {
      return undefined;
    }
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    const finalPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${this.backendOrigin}${finalPath}`;
  }

  /**
   * @method mapProductListResponse
   * @description Mapt een gepagineerde lijst van `BackendProductListItemDto`'s naar `ProductCollectionResponse`.
   */
  public mapProductListResponse(
    backendResponse: BackendPaginatedListDto<BackendProductListItemDto>
  ): ProductCollectionResponse {
    try {
      const transformedItems = backendResponse.items.map((dto) => {
        try {
          return this.mapListItemToProduct(dto);
        } catch (error) {
          this.logger.warn(`[ProductMappingService] Failed to map product list item ${dto.id}:`, error, dto);
          return this.createFallbackProduct(dto);
        }
      });

      return {
        items: transformedItems,
        totalCount: backendResponse.totalCount,
        pageNumber: backendResponse.pageNumber,
        totalPages: backendResponse.totalPages,
        hasNextPage: backendResponse.hasNextPage,
        hasPreviousPage: backendResponse.hasPreviousPage,
      };
    } catch (error) {
      this.logger.error('[ProductMappingService] Failed to transform product list response:', error, { backendResponse });
      throw new Error('Failed to transform product list response');
    }
  }

  /**
   * @method mapListItemToProduct
   * @description Mapt een `BackendProductListItemDto` naar een `Product` domeinmodel (unchanged).
   */
  public mapListItemToProduct(dto: BackendProductListItemDto): Product {
    try {
      const allMedia = new Map<string, Media>();
      const addMediaFromTeaser = (teaser: BackendMediaTeaserDto) => {
        if (teaser && !allMedia.has(teaser.id)) {
          allMedia.set(teaser.id, this.mapMediaTeaser(teaser));
        }
      };

      (dto.featuredImages ?? []).forEach(addMediaFromTeaser);
      (dto.selectedVariant?.media ?? []).forEach(addMediaFromTeaser);
      (dto.colorVariants ?? []).forEach(cv => (cv.media ?? []).forEach(addMediaFromTeaser));

      const mappedColorVariants: ProductColorVariantTeaser[] = (dto.colorVariants ?? []).map((cv, index) => ({
        uiId: index,
        attributeValueId: cv.attributeValueId,
        defaultVariantId: cv.defaultVariantId,
        value: cv.value,
        displayName: cv.displayName,
        colorHex: cv.colorHex,
        price: cv.price,
        originalPrice: cv.originalPrice,
        media: (cv.media ?? []).map(m => allMedia.get(m.id)).filter((m): m is Media => !!m) as Image[],
      }));

      const variantAttributes: VariantAttribute[] = [];
      if (mappedColorVariants.length > 0) {
        variantAttributes.push({
          id: 'color-attribute',
          type: VariantAttributeType.COLOR,
          name: 'Kleur',
          nameKeyOrText: 'attribute.color',
          isRequired: true,
          displayType: 'swatches',
          displayOrder: 1,
          values: mappedColorVariants.map((cv, index) => ({
            id: cv.attributeValueId,
            value: cv.value,
            displayName: cv.displayName,
            displayNameKeyOrText: cv.displayName,
            sortOrder: index,
            colorHex: cv.colorHex,
            isAvailable: true,
            media: cv.media,
          })),
        });
      }

      const variantCombinations: ProductVariantCombination[] = [];
      if (dto.selectedVariant) {
        variantCombinations.push({
          id: dto.selectedVariant.id,
          sku: dto.selectedVariant.sku,
          attributes: [],
          price: dto.selectedVariant.price,
          originalPrice: dto.selectedVariant.originalPrice,
          stockQuantity: dto.selectedVariant.stockQuantity,
          stockStatus: mapStockStatus(dto.selectedVariant.stockStatus),
          isActive: true,
          isDefault: dto.selectedVariant.isDefault,
          mediaIds: (dto.selectedVariant.media ?? []).map(m => m.id),
        });
      }

      const product: PhysicalProduct = {
      id: dto.id,
      createdAt: this.toDateTimeInfo(undefined),
      lastModified: this.toDateTimeInfo(undefined),
      name: dto.name,
      shortDescription: dto.shortDescription,
      description: dto.shortDescription ?? '',
      media: Array.from(allMedia.values()),
      currency: dto.currency,
      colorVariants: mappedColorVariants,
      categoryIds: (dto.categories ?? []).map(c => c.id), // FIX: Extract IDs from category objects
      tags: dto.tags ? [...dto.tags] : [],
      variantAttributes: variantAttributes,
      variantCombinations: variantCombinations,
      averageRating: dto.averageRating ?? 0,
      reviewCount: dto.reviewCount,
      isActive: dto.isActive,
      isFeatured: dto.isFeatured,
      status: mapProductStatus(dto.status), 
      price: dto.price,
      originalPrice: dto.originalPrice,
      stockStatus: mapStockStatus(dto.stockStatus), 
      inStock: dto.inStock,
      stockQuantity: dto.selectedVariant?.stockQuantity,
      type: ProductType.PHYSICAL,
      sku: dto.selectedVariant?.sku,
      manageStock: true,
      allowBackorders: false,
    };

    return product;
  } catch (error) {
    this.logger.error(`[ProductMappingService] Critical error mapping list item for ID: ${dto.id}`, error, dto);
    return this.createFallbackProduct(dto);
  }
}

   public mapProductDetail(dto: BackendProductDetailDto): Product {
    if (!dto) {
      this.logger.error('[ProductMappingService] Cannot map product detail: DTO is null or undefined.');
      throw new Error('Cannot map product detail: DTO is null or undefined.');
    }

    try {
      const allMedia = new Map<string, Media>();
      const addMediaToMap = (mediaItem: Media) => {
        if (mediaItem && !allMedia.has(mediaItem.id)) {
          allMedia.set(mediaItem.id, mediaItem);
        }
      };

      if (dto.featuredImage) {
        const featuredMedia: Image = {
          id: dto.featuredImage.id,
          type: MediaType.IMAGE,
          variants: [{ url: this.toAbsoluteUrl(dto.featuredImage.url) || '', purpose: 'original' }],
          altText: dto.featuredImage.altTextKeyOrText,
        };
        addMediaToMap(featuredMedia);
      }

      const variantAttributes = (dto.variantAttributes ?? []).map(attrDto => {
        const mappedAttr = this.mapVariantAttribute(attrDto);
        mappedAttr.values.forEach(value => {
          (value.media ?? []).forEach(addMediaToMap);
        });
        return mappedAttr;
      });

      const variantCombinations = (dto.variantCombinations ?? []).map(comboDto => {
        const mappedCombo = this.mapVariantCombination(comboDto);
        (comboDto.media ?? []).forEach(mediaDto => {
          addMediaToMap(this.mapMedia(mediaDto));
        });
        return mappedCombo;
      });

      if (dto.selectedVariant?.media) {
        dto.selectedVariant.media.forEach(mediaDto => {
          addMediaToMap(this.mapMedia(mediaDto as BackendMediaDto));
        });
      }

      const media = Array.from(allMedia.values());
      const colorAttribute = variantAttributes.find(attr => attr.type === VariantAttributeType.COLOR);
      const mappedColorVariants: ProductColorVariantTeaser[] = (colorAttribute?.values ?? []).map(val => {
        const combo = variantCombinations.find(c => c.attributes.some(a => a.attributeValueId === val.id));
        return {
          uiId: 0,
          attributeValueId: val.id,
          defaultVariantId: combo?.id ?? val.id,
          value: val.value,
          displayName: val.displayName,
          colorHex: val.colorHex,
          price: combo?.price ?? 0,
          originalPrice: combo?.originalPrice,
          media: val.media,
        };
      });

      const physicalConfig = dto.physicalProductConfig;
      const selectedVariantDto = dto.selectedVariant;
      const defaultVariantCombinationDto = dto.variantCombinations?.find(v => v.isDefault) ?? dto.variantCombinations?.[0];
      const priceRange = dto.priceRange;

      const price: number = selectedVariantDto?.price ?? physicalConfig?.pricing?.price ?? defaultVariantCombinationDto?.price ?? priceRange?.maxPrice ?? priceRange?.minPrice ?? 0;
      const originalPrice = selectedVariantDto?.originalPrice ?? physicalConfig?.pricing?.originalPrice ?? defaultVariantCombinationDto?.originalPrice ?? priceRange?.maxOriginalPrice ?? priceRange?.minOriginalPrice ?? undefined;
      const stockQuantity = selectedVariantDto?.stockQuantity ?? physicalConfig?.stockQuantity ?? dto.stockQuantity ?? undefined;

      const stockStatus = mapStockStatus(selectedVariantDto?.stockStatus ?? dto.stockStatus);

      const displaySpecifications = this.mapDisplaySpecifications(physicalConfig?.displaySpecifications ?? dto.displaySpecifications ?? []);
      const availabilityRules = this.mapAvailabilityRules(dto.availabilityRules ?? null);

      const hasDiscount = dto.hasDiscount;
      const activeDiscount: ProductDiscount | null = hasDiscount && originalPrice && price < originalPrice ? {
        id: 'product-discount',
        type: DiscountType.PERCENTAGE,
        value: Math.round(((originalPrice - price) / originalPrice) * 100),
        isActive: true,
      } : null;

      const mappedType = mapProductType(dto.type);

      const baseProduct: Omit<Product, 'type'> = {
      id: dto.id,
      createdAt: this.toDateTimeInfo(undefined),
      lastModified: this.toDateTimeInfo(undefined),
      name: dto.name,
      shortDescription: dto.shortDescription ?? undefined,
      description: dto.description ?? '',
      media: media,
      currency: dto.currency ?? 'EUR',
      colorVariants: mappedColorVariants,
      categoryIds: (dto.categories ?? []).map(cat => cat.id), // FIX: Extract IDs properly
      tags: dto.tags ? [...dto.tags] : [],
      variantAttributes,
      variantCombinations,
      averageRating: dto.averageRating ?? 0,
      reviewCount: dto.reviewCount || 0,
      isActive: dto.isActive,
      isFeatured: dto.isFeatured,
      status: mapProductStatus(dto.status), // FIX: Use numeric mapper
      searchKeywords: dto.seo?.keywords ? [...dto.seo.keywords] : dto.tags ? [...dto.tags] : undefined,
      customAttributes: dto.customAttributes ?? undefined,
      appScope: dto.appScope ?? undefined,
      metaTitle: dto.seo?.title ?? dto.name,
      metaDescription: dto.seo?.description ?? dto.shortDescription,
      metaKeywords: dto.seo?.keywords ? [...dto.seo.keywords] : dto.tags ? [...dto.tags] : undefined,
      price,
      originalPrice,
      stockStatus: mapStockStatus(dto.stockStatus), // FIX: Use numeric mapper
      inStock: dto.inStock,
      stockQuantity,
    };

    const detailProductType = mapProductType(dto.type);

    if (detailProductType === ProductType.PHYSICAL) {
      return {
        ...baseProduct,
        type: ProductType.PHYSICAL,
        activeDiscount,
        sku: dto.sku ?? physicalConfig?.sku ?? undefined,
        brand: dto.brand ?? physicalConfig?.brand ?? undefined,
        manageStock: dto.availabilityRules?.manageStock ?? physicalConfig?.manageStock ?? true,
        allowBackorders: dto.availabilityRules?.allowBackorders ?? physicalConfig?.allowBackorders ?? false,
        lowStockThreshold: dto.availabilityRules?.lowStockThreshold ?? physicalConfig?.lowStockThreshold ?? undefined,
        displaySpecifications,
        availabilityRules,
      } as PhysicalProduct;
    }

    return { ...baseProduct, type: ProductType.PHYSICAL, sku: dto.sku ?? undefined } as PhysicalProduct;

  } catch (error) {
    this.logger.error(`[ProductMappingService] Critical error mapping product detail for ID: ${dto.id}`, error, dto);
    return this.createFallbackProduct(dto);
  }
}
  
  public mapMediaArray(dtos: readonly BackendMediaDto[] | null): Media[] {
    if (!dtos) return [];
    return dtos.map(dto => this.mapMedia(dto));
  }

  private mapMediaTeaser(dto: BackendMediaTeaserDto): Media {
    const variants: Image['variants'] = [];
    const mainUrl = this.toAbsoluteUrl(dto.url);
    const thumbUrl = this.toAbsoluteUrl(dto.thumbnailUrl);

    if (mainUrl) {
      variants.push({ url: mainUrl, purpose: 'original' });
    }
    if (thumbUrl && thumbUrl !== mainUrl) {
      variants.push({ url: thumbUrl, purpose: 'thumbnail' });
    }
    if (variants.length === 0 && thumbUrl) {
        variants.push({ url: thumbUrl, purpose: 'fallback' });
    }

    return {
      id: dto.id,
      type: MediaType.IMAGE,
      variants: variants,
      altText: dto.altText ?? undefined,
    } as Image;
  }

  private mapMedia(dto: BackendMediaDto): Media {
    const mediaType = this.mapMediaType(dto.type ?? 0);

    const common = {
      id: dto.id,
      type: mediaType,
      createdAt: this.toDateTimeInfo(undefined),
      lastModified: this.toDateTimeInfo(undefined),
    };

    if (mediaType === MediaType.IMAGE) {
      const variants: Image['variants'] = [];
      const mainUrl = this.toAbsoluteUrl(dto.url);
      const thumbUrl = this.toAbsoluteUrl(dto.thumbnailUrl);

      if (mainUrl) {
        variants.push({ url: mainUrl, purpose: 'original' });
      }
      if (thumbUrl && thumbUrl !== mainUrl) {
        variants.push({ url: thumbUrl, purpose: 'thumbnail' });
      }
      if (variants.length === 0 && mainUrl) {
          variants.push({ url: mainUrl, purpose: 'fallback' });
      }

      return { ...common, variants, altText: dto.altTextKeyOrText ?? undefined } as Image;
    }

    return {
      ...common,
      url: this.toAbsoluteUrl(dto.url) || '',
      thumbnailUrl: this.toAbsoluteUrl(dto.thumbnailUrl) ?? undefined
    } as Media;
  }

  private mapMediaType(backendType: number | string): MediaType {
    if (typeof backendType === 'string') {
      const stringToEnumMap: Record<string, MediaType> = {
        image: MediaType.IMAGE, video: MediaType.VIDEO, audio: MediaType.AUDIO,
        document: MediaType.DOCUMENT, archive: MediaType.ARCHIVE, other: MediaType.OTHER,
      };
      return stringToEnumMap[backendType.toLowerCase()] ?? MediaType.OTHER;
    } else if (typeof backendType === 'number') {
      const numberToEnumMap: Record<number, MediaType> = {
        0: MediaType.IMAGE, 1: MediaType.VIDEO, 2: MediaType.AUDIO,
        3: MediaType.DOCUMENT, 4: MediaType.ARCHIVE,
      };
      return numberToEnumMap[backendType] ?? MediaType.OTHER;
    }
    this.logger.warn(`[ProductMappingService] Unknown backend media type encountered: ${backendType}. Falling back to OTHER.`);
    return MediaType.OTHER;
  }

  private mapVariantAttribute(dto: BackendVariantAttributeDto): VariantAttribute {
    const typeMap: Record<number, VariantAttributeType> = {
      0: VariantAttributeType.COLOR,
      18: VariantAttributeType.CUSTOM,
      19: VariantAttributeType.CUSTOM,
    };

    const attributeId = dto.id;
    const nameKeyOrText = dto.nameKeyOrText;
    const attributeType = typeMap[dto.type] ?? VariantAttributeType.CUSTOM;

    let displayName = nameKeyOrText;
    if (nameKeyOrText.includes('.')) {
      displayName = (nameKeyOrText.split('.').pop() || '').replace(/^\w/, c => c.toUpperCase());
    } else if (nameKeyOrText === 'attribute.other' || attributeType === VariantAttributeType.CUSTOM) {
      displayName = 'Configuratie';
    }

    return {
      id: attributeId,
      type: attributeType,
      name: displayName,
      nameKeyOrText: nameKeyOrText,
      isRequired: dto.isRequired,
      displayType: dto.displayType as any,
      displayOrder: 0,
      values: dto.values.map(v => this.mapVariantAttributeValue(v)),
    };
  }

  private mapVariantAttributeValue(dto: BackendVariantAttributeValueDto): VariantAttributeValue {
    const mediaItems: Media[] = [];
    if (dto.media) {
        mediaItems.push(this.mapMedia(dto.media as BackendMediaDto));
    }

    return {
      id: dto.id,
      value: dto.value,
      displayName: dto.displayNameKeyOrText,
      displayNameKeyOrText: dto.displayNameKeyOrText,
      sortOrder: 0,
      colorHex: dto.colorHex ?? undefined,
      priceModifier: dto.priceModifier ?? undefined,
      isAvailable: dto.isAvailable,
      media: mediaItems,
    };
  }

  private mapVariantCombination(dto: BackendProductVariantCombinationDto): ProductVariantCombination {
  return {
    id: dto.id,
    sku: dto.sku,
    attributes: (dto.attributes ?? []).map(a => ({
      attributeId: a.attributeId,
      attributeValueId: a.attributeValueId,
      attributeNameKeyOrText: a.attributeNameKeyOrText,
      attributeValueNameKeyOrText: a.attributeValueNameKeyOrText,
      colorHex: a.colorHex ?? undefined,
    })),
    price: dto.price ?? undefined,
    originalPrice: dto.originalPrice ?? undefined,
    stockQuantity: dto.stockQuantity ?? undefined,
    stockStatus: mapStockStatus(dto.stockStatus), // FIX: Use numeric mapper
    isActive: true,
    isDefault: dto.isDefault ?? false,
    mediaIds: (dto.media ?? []).map(m => m.id),
  };
}

  private mapDisplaySpecifications(dtos: readonly BackendProductDisplaySpecificationDto[]): ProductDisplaySpecification[] {
    return dtos.map(dto => ({
      specKey: dto.specKey,
      labelKeyOrText: dto.labelKeyOrText,
      valueKeyOrText: dto.valueKeyOrText,
      icon: (dto.icon as AppIcon) ?? null,
      groupKeyOrText: dto.groupKeyOrText ?? null,
      displayOrder: dto.displayOrder ?? 0,
    }));
  }

  private mapAvailabilityRules(dto: BackendProductAvailabilityRulesDto | null): ProductAvailabilityRules | undefined {
    if (!dto) return undefined;
    return {
      minOrderQuantity: dto.minOrderQuantity ?? undefined,
      maxOrderQuantity: dto.maxOrderQuantity ?? undefined,
      quantityIncrements: dto.quantityIncrements ?? undefined,
    };
  }

  private createFallbackProduct(dto: BackendProductListItemDto | BackendProductDetailDto): Product {
    this.logger.warn(`[ProductMappingService] Creating fallback product for ID: ${dto.id}`);

    return {
      id: dto.id,
      createdAt: this.toDateTimeInfo(undefined),
      lastModified: this.toDateTimeInfo(undefined),
      name: dto.name || 'Unknown Product',
      shortDescription: dto.shortDescription ?? undefined,
      description: dto.shortDescription ?? 'Product details unavailable',
      currency: 'EUR',
      categoryIds: [],
      tags: dto.tags ? [...dto.tags] : [],
      averageRating: dto.averageRating ?? 0,
      reviewCount: dto.reviewCount || 0,
      isActive: dto.isActive,
      isFeatured: false,
      status: ProductStatus.DRAFT,
      searchKeywords: undefined,
      customAttributes: undefined,
      appScope: undefined,
      metaTitle: dto.name,
      metaDescription: dto.shortDescription,
      metaKeywords: undefined,
      price: 0,
      originalPrice: undefined,
      stockStatus: StockStatus.OUT_OF_STOCK,
      inStock: false,
      stockQuantity: undefined,
      type: ProductType.PHYSICAL,
      media: [],
      variantAttributes: [],
      variantCombinations: [],
      colorVariants: [],
      sku: undefined,
    } as PhysicalProduct;
  }

  private toDateTimeInfo(isoString?: string): DateTimeInfo | undefined {
    if (!isoString) return undefined;
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return undefined;
      return { iso: isoString, timestamp: date.getTime() };
    } catch (e) {
      this.logger.error(`[ProductMappingService] Failed to parse date string: ${isoString}`, e);
      return undefined;
    }
  }
}