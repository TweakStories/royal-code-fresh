/**
 * @file media-mapping.service.ts
 * @Version 2.2.0 (DEFINITIVE GOLD STANDARD: Complete & Self-contained Media Mapper)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-05
 * @description The definitive, fully type-safe, and self-contained mapping service for
 *              Media entities. This comprehensive version correctly handles null vs. undefined,
 *              derives data from raw DTOs, resolves relative URLs to absolute URLs, and
 *              ensures all properties match the frontend Media domain models, resolving
 *              all previous compiler errors and logical inconsistencies.
 */
import { inject, Injectable } from '@angular/core';
import { Media, Image, MediaType, ImageVariant } from '@royal-code/shared/domain';
import { AuditableEntityBase, DateTimeInfo } from '@royal-code/shared/base-models'; // Nodig voor DateTimeInfo
import {
  BackendPaginatedListDto,
  BackendMediaDto,
  BackendImageVariantDto,
} from '../DTO/backend.types';
import { LoggerService } from '@royal-code/core/core-logging';
import { APP_CONFIG, AppConfig } from '@royal-code/core/config';

export interface MediaCollectionResponse {
  readonly items: Media[];
  readonly totalCount: number;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

@Injectable({ providedIn: 'root' })
export class MediaMappingService {
  private readonly logger = inject(LoggerService);
  private readonly config: AppConfig = inject(APP_CONFIG);
  private readonly logPrefix = '[MediaMappingService]';
  private readonly backendOrigin: string;

  constructor() {
    try {
      const url = new URL(this.config.backendUrl);
      this.backendOrigin = url.origin;
    } catch (error) {
      this.logger.error(`${this.logPrefix} Invalid backendUrl in config. Could not determine origin.`, this.config.backendUrl);
      this.backendOrigin = '';
    }
  }

  /**
   * @method toAbsoluteUrl
   * @description Converteert een relatieve URL naar een absolute URL met behulp van de geconfigureerde backend origin.
   * @param relativePath De relatieve URL of een al absolute URL.
   * @returns De absolute URL, of undefined als de input leeg was.
   */
  private toAbsoluteUrl(relativePath: string | null | undefined): string | undefined {
    if (!relativePath) return undefined;
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) return relativePath;
    return `${this.backendOrigin}${relativePath}`;
  }

  /**
   * @method toDateTimeInfo
   * @description Converteert een ISO-datumstring naar een `DateTimeInfo` object.
   *              Deze methode is generiek en kan hier dus prima staan.
   * @param isoString De ISO-datumstring.
   * @returns Een `DateTimeInfo` object, of undefined.
   */
  private toDateTimeInfo(isoString?: string | null): DateTimeInfo | undefined { // <<< FIX HIER: accepteert nu ook 'null'
    if (!isoString) return undefined;
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return undefined; // Controleer op ongeldige datum
      return { iso: isoString, timestamp: date.getTime() };
    } catch (e) {
      this.logger.error(`[MediaMappingService] Failed to parse date string: ${isoString}`, e);
      return undefined;
    }
  }
  /**
   * @method mapMediaListResponse
   * @description Mapt een gepagineerde lijst van backend `BackendMediaDto`'s naar `MediaCollectionResponse`.
   * @param backendResponse Het ruwe, gepagineerde DTO-object van de backend.
   * @returns Een `MediaCollectionResponse` object met gemapte `Media` domeinmodellen.
   */
  public mapMediaListResponse(
    backendResponse: BackendPaginatedListDto<BackendMediaDto>
  ): MediaCollectionResponse {
    try {
      const transformedItems = (backendResponse.items ?? []).map(dto => {
        try {
          return this.mapMedia(dto);
        } catch (error) {
          this.logger.warn(`${this.logPrefix} Failed to map media list item ${dto.id}:`, error, dto);
          return this.createFallbackMedia(dto);
        }
      });

      return {
        items: transformedItems,
        totalCount: backendResponse.totalCount ?? 0,
        pageNumber: backendResponse.pageNumber ?? 1,
        totalPages: backendResponse.totalPages ?? 0,
        hasNextPage: backendResponse.hasNextPage ?? false,
        hasPreviousPage: backendResponse.hasPreviousPage ?? false,
      };
    } catch (error) {
      this.logger.error(`${this.logPrefix} Critical failure in media list mapping`, { error, backendResponse });
      throw new Error('Failed to transform media list response');
    }
  }

  /**
   * @method mapMedia
   * @description Mapt een enkele backend `BackendMediaDto` naar een frontend `Media` domeinmodel.
   *              Dit is de centrale mapping voor individuele media-items.
   * @param dto De ruwe `BackendMediaDto` van de backend.
   * @returns Een `Media` domeinmodel (Image, Video, etc.).
   */
public mapMedia(dto: BackendMediaDto): Media {
    const mediaType = this.mapMediaType(dto.type);

    const commonProps: AuditableEntityBase & { id: string } = {
      id: dto.id,
      createdAt: this.toDateTimeInfo(dto.created) ?? undefined,
      lastModified: this.toDateTimeInfo(undefined), // Niet altijd beschikbaar in DTO
    };
    
    // <<< FIX HIER: Converteer de tag-objecten naar strings >>>
    const mappedTags = dto.tags ? dto.tags.map(tag => tag.name) : undefined;

    if (mediaType === MediaType.IMAGE) {
      const variants = (dto.variants && dto.variants.length > 0)
        ? dto.variants.map(v => this.mapImageVariant(v))
        : [];

      if (variants.length === 0 && dto.url) {
        variants.push({ url: this.toAbsoluteUrl(dto.url) || '', purpose: 'original' });
      }

      const image: Image = {
        ...commonProps,
        type: MediaType.IMAGE,
        variants,
        altText: dto.altText ?? undefined,
        title: dto.title ?? undefined,
        sourceType: undefined,
        uploaderUserId: dto.uploaderUserId ?? undefined,
        tags: mappedTags, // <<< FIX HIER: Gebruik de gemapte string-array
      };
      return image;
    }

    const media: Media = {
      ...commonProps,
      type: mediaType,
      url: this.toAbsoluteUrl(dto.url) || '',
      title: dto.title ?? undefined,
      thumbnailUrl: this.toAbsoluteUrl(dto.thumbnailUrl) ?? undefined,
      fileSizeBytes: undefined,
      mimeType: dto.mimeType ?? undefined,
      uploaderUserId: dto.uploaderUserId ?? undefined,
      // 'tags' bestaat niet op de andere Media types in de union, dus die verwijderen we hier om de TS2353 fout op te lossen.
      originalFilename: undefined,
    };
    return media;
  }

  /**
   * @method mapImageVariant
   * @description Mapt een backend `BackendImageVariantDto` naar een frontend `ImageVariant`.
   * @param dto De ruwe `BackendImageVariantDto`.
   * @returns Een `ImageVariant` object.
   */
  private mapImageVariant(dto: BackendImageVariantDto): ImageVariant {
    return {
      url: this.toAbsoluteUrl(dto.url) || '',
      width: dto.width ?? undefined,
      height: dto.height ?? undefined,
      format: dto.format ?? undefined,
      descriptor: dto.width ? `${dto.width}w` : undefined,
      purpose: dto.purpose ?? undefined,
      fileSizeBytes: undefined, // Niet in DTO
    };
  }

  /**
   * @method mapMediaType
   * @description Mapt de backend mediatype (string of nummer) naar de frontend `MediaType` enum.
   * @param backendType Het type zoals ontvangen van de backend.
   * @returns De corresponderende `MediaType` enum waarde.
   */
  private mapMediaType(backendType: number | string | null | undefined): MediaType {
    if (backendType === null || backendType === undefined) {
      this.logger.warn(`${this.logPrefix} Null or undefined media type encountered. Falling back to OTHER.`);
      return MediaType.OTHER;
    }

    if (typeof backendType === 'string') {
      const stringToEnumMap: Record<string, MediaType> = {
        image: MediaType.IMAGE, video: MediaType.VIDEO, audio: MediaType.AUDIO,
        document: MediaType.DOCUMENT, archive: MediaType.ARCHIVE, other: MediaType.OTHER,
      };
      return stringToEnumMap[backendType.toLowerCase()] ?? MediaType.OTHER;
    }
    else if (typeof backendType === 'number') {
      const numberToEnumMap: Record<number, MediaType> = {
        0: MediaType.IMAGE, 1: MediaType.VIDEO, 2: MediaType.AUDIO,
        3: MediaType.DOCUMENT, 4: MediaType.ARCHIVE,
      };
      return numberToEnumMap[backendType] ?? MediaType.OTHER;
    }

    this.logger.warn(`${this.logPrefix} Unknown media type encountered: ${backendType}. Falling back to OTHER.`);
    return MediaType.OTHER;
  }

  /**
   * @method createFallbackMedia
   * @description Creëert een fallback `Media` domeinmodel bij een mappingfout.
   * @param dto Het oorspronkelijke DTO-object waarvoor de mapping mislukte.
   * @returns Een eenvoudig `Image` met basisinformatie en een placeholder URL.
   */
  private createFallbackMedia(dto: BackendMediaDto): Media {
    this.logger.warn(`${this.logPrefix} Creating fallback media for ID: ${dto.id}`);
    const defaultImageUrl = '/images/default-image.webp'; // Placeholder afbeelding

    return {
      id: dto.id || `fallback-media-${Date.now()}`,
      type: MediaType.IMAGE,
      variants: [{ url: defaultImageUrl, purpose: 'fallback' }],
      altText: dto.altText || 'Fallback afbeelding',
      title: dto.title || 'Onbekende media',
      createdAt: this.toDateTimeInfo(undefined),
      lastModified: this.toDateTimeInfo(undefined),
    } as Image;
  }
}