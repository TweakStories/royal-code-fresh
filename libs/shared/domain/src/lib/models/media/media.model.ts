/**
 * @file media.model.ts
 * @Version 1.3.1 - Ensured DateTimeInfo is used for date fields, added MediaType enum and Media union type.
 * @Author ChallengerAppDevAI
 * @Description Defines core data models for all media assets within the application.
 *              This includes a flexible `Image` model supporting multiple variants for
 *              responsive display and a general `Media` union type to represent
 *              diverse asset types like images, videos, audio, and documents,
 *              ensuring a consistent approach to media management across features.
 */

// Importeer DateTimeInfo als het in een ander bestand binnen shared/domain staat,
// bijvoorbeeld common.model.ts. Pas het pad zo nodig aan.
import { AuditableEntityBase } from "../../base/auditable-entity-base.model";

/**
 * @Enum ImageSourceType
 * @Description Indicates the origin or creator of an image asset. This metadata helps in
 *              categorizing images, understanding their provenance (e.g., AI-generated vs.
 *              supplier-provided), and potentially applying different handling,
 *              licensing logic, or display rules.
 */
export enum ImageSourceType {
  SUPPLIER = 'supplier',
  AI_GENERATED = 'ai-generated',
  USER_UPLOADED = 'user-uploaded',
  SYSTEM_DEFAULT = 'system-default',
  STOCK_PHOTO = 'stock-photo',
  SCREENSHOT = 'screenshot',
}

/**
 * @Interface ImageVariant
 * @Description Defines a specific variant (e.g., size, format, crop, resolution) of a single conceptual image.
 *              An array of `ImageVariant` objects allows a parent `Image` entity to effectively support
 *              responsive images (`srcset`), art direction via the `<picture>` element, and optimized
 *              delivery of appropriate image versions for different client capabilities and contexts.
 */
export interface ImageVariant {
  url: string;
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | string;
  descriptor?: string;
  purpose?: 'thumbnail' | 'icon' | 'small_display' | 'medium_display' | 'large_display' | 'original_quality' | 'banner' | string;
  fileSizeBytes?: number;
}

/**
 * @Enum MediaType
 * @Description Categorizes the general type of a media asset for differentiated handling.
 *              This enum is crucial for the discriminated union `Media`.
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

/**
 * @Interface Image
 * @Description Defines the structure for a single conceptual image asset. An `Image` entity
 *              groups together multiple `ImageVariant` instances, each representing different
 *              versions (sizes, formats, crops, resolutions) of the same underlying visual content.
 *              This model is designed for broad, reusable application across various features.
 *              Includes an explicit 'type' property for consistency within the Media union type.
 * @Version 1.2.1
 */
export interface Image extends AuditableEntityBase{
  /** Unique identifier for this image record (e.g., a UUID). This ID refers to the conceptual image. */
  id: string;
  /** Discriminator property: Indicates that this media asset is an Image. */
  type: MediaType.IMAGE;
  /** An array of `ImageVariant` objects, for responsive image delivery. */
  variants: ImageVariant[];
  /** Alternative text for the image, crucial for accessibility (WCAG) and SEO. */
  altText?: string;
  /** Optional title or caption for the image. */
  title?: string;
  /** Optional: The original source type of the master image. See `ImageSourceType`. */
  sourceType?: ImageSourceType;
  /** If AI-generated, the prompt used can be stored for reference. */
  aiGenerationPrompt?: string;
  /** Optional: Array of dominant hexadecimal color codes from the image. */
  dominantColorsHex?: string[];
  /** Optional: Dimensions (width and height in pixels) of the original master image. */
  originalMasterDimensions?: { width: number; height: number; };
  /** Optional: User ID of the uploader, if applicable. */
  uploaderUserId?: string;
  /** Optional: Tags or keywords associated with the image. */
  tags?: string[];
}

/**
 * @Interface MediaBase
 * @Description Common base properties for all media asset types EXCEPT `Image`,
 *              as `Image` has a more complex structure with `variants`.
 *              For `Image` type, many of these base properties (like `url`, `thumbnailUrl`)
 *              are effectively superseded or derived from its `variants` array.
 * @Version 1.1.0 - Clarified relationship with Image model.
 */
export interface MediaBase extends AuditableEntityBase {
  /** Unique identifier for the media asset record. */
  id: string;
  /** The general category of the media asset. See `MediaType`. This is the discriminator. */
  type: Exclude<MediaType, MediaType.IMAGE>; // Exclude IMAGE type as it has its own interface
  /**
   * The primary URL to access or stream the media asset.
   * For non-Image types (Video, Audio, Document, etc.), this is the direct content URL.
   */
  url: string;
  /** Optional title or display name for the media asset. */
  title?: string;
  /** Optional detailed description or caption for the media asset. */
  description?: string;
  /**
   * Optional URL to a representative thumbnail image for non-Image media assets.
   * Useful for providing a visual preview (e.g., video poster frame, document icon).
   */
  thumbnailUrl?: string;
  /** The size of the media file in bytes. */
  fileSizeBytes?: number;
  /** The MIME type of the media asset (e.g., 'video/mp4', 'application/pdf'). */
  mimeType?: string;
  /** User ID of the person who uploaded this media asset, if applicable. */
  uploaderUserId?: string;
  /** Optional: Filename as it was originally uploaded, for reference or download purposes. */
  originalFilename?: string;
}

/** @Interface VideoMedia - Extends `MediaBase` for video-specific properties. */
export interface VideoMedia extends MediaBase {
  type: MediaType.VIDEO;
  /** Optional: Duration of the video in seconds. */
  durationSeconds?: number;
  /** Optional: Width of the video in pixels. */
  width?: number;
  /** Optional: Height of the video in pixels. */
  height?: number;
  /** Optional: URL for a poster image to display before video playback begins. */
  posterImageUrl?: string;
}

/** @Interface AudioMedia - Extends `MediaBase` for audio-specific properties. */
export interface AudioMedia extends MediaBase {
  type: MediaType.AUDIO;
  /** Optional: Duration of the audio in seconds. */
  durationSeconds?: number;
}

/** @Interface DocumentMedia - Extends `MediaBase` for document-specific properties. */
export interface DocumentMedia extends MediaBase {
  type: MediaType.DOCUMENT;
  /** Optional: The file extension of the document (e.g., 'pdf', 'docx'). */
  fileExtension?: string;
  /** Optional: The number of pages in the document, if applicable. */
  pageCount?: number;
}

/** @Interface ArchiveMedia - Extends `MediaBase` for archive file properties. */
export interface ArchiveMedia extends MediaBase {
  type: MediaType.ARCHIVE;
  /** Optional: The file extension of the archive (e.g., 'zip', 'rar'). */
  fileExtension?: string;
  /** Optional: Uncompressed size of the archive contents in bytes. */
  uncompressedSizeBytes?: number;
}

/** @Interface OtherMedia - Extends `MediaBase` as a fallback for other media types. */
export interface OtherMedia extends MediaBase {
  type: MediaType.OTHER;
  /** Optional: The file extension, if applicable, for better identification. */
  fileExtension?: string;
}

/**
 * @TypeUnion Media
 * @Description A discriminated union type representing any possible media asset within the application.
 *              The `Image` interface (with its `variants` and explicit `type: MediaType.IMAGE`) is one of the constituents.
 *              Other media types extend `MediaBase` and have their own specific `type` discriminator.
 *              This structure allows for type-safe handling and differentiation of various media kinds.
 */
export type Media = Image | VideoMedia | AudioMedia | DocumentMedia | ArchiveMedia | OtherMedia;
