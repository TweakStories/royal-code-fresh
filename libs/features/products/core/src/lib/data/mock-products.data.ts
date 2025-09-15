// libs/features/products/core/src/lib/data/mock-products.data.ts
import { 
  BackendProductListItemDto, 
  BackendProductDetailDto, 
  BackendFeaturedImageDto,
  BackendMediaDto,
  BackendPaginatedListDto,
  BackendMediaTeaserDto,
  BackendSelectedVariantDto
} from '../DTO/backend.types';

const mockMedia: BackendMediaDto = {
  id: 'media-1',
  type: 0,
  url: '/assets/mock-image.jpg',
  thumbnailUrl: '/assets/mock-image-thumb.jpg',
  altTextKeyOrText: 'Mock Product Image',
  tags: ['mock', 'test'],
};

const mockFeaturedImage: BackendFeaturedImageDto = {
  id: 'featured-1',
  url: '/assets/mock-featured.jpg',
  altTextKeyOrText: 'Mock Featured Image'
};

export const mockProductDetails: any[] = [
  {
    id: 'mock-product-1',
    name: 'Mock Product 1',
    shortDescription: 'This is a mock product for testing',
    description: 'Detailed description of mock product 1',
    type: 'physical',
    status: 'published',
    isActive: true,
    isFeatured: true,
    averageRating: 4.5,
    reviewCount: 10,
    hasDiscount: false,
    discountPercentage: 0,
    price: 99.99,
    originalPrice: 99.99,
    currency: 'EUR',
    stockStatus: 'inStock',
    inStock: true,
    stockQuantity: 10,
    featuredImage: mockFeaturedImage,
    tags: ['mock', 'test'],
    categories: [],
    featuredImages: [{
      id: 'featured-1',
      url: '/assets/mock-featured.jpg',
      altText: 'Mock Featured Image'
    }],
    selectedVariant: { // Fix: make this match BackendSelectedVariantDto structure
      id: 'variant-1',
      sku: 'MOCK-001',
      price: 99.99,
      originalPrice: 99.99,
      stockQuantity: 10,
      stockStatus: 'inStock',
      hasDiscount: false,
      isDefault: true, // Fix: add missing property
      media: [] // Fix: add missing property
    },
    colorVariants: []
  }
];

export const mockProductListResponse: BackendPaginatedListDto<BackendProductListItemDto> = {
  items: mockProductDetails.map(detail => ({
    id: detail.id,
    name: detail.name,
    shortDescription: detail.shortDescription,
    tags: detail.tags,
    type: detail.type,
    status: detail.status,
    isActive: detail.isActive,
    isFeatured: detail.isFeatured ?? false,
    averageRating: detail.averageRating,
    reviewCount: detail.reviewCount,
    hasDiscount: detail.hasDiscount,
    discountPercentage: detail.discountPercentage,
    price: detail.price ?? 0,
    originalPrice: detail.originalPrice,
    currency: detail.currency ?? 'EUR',
    stockStatus: detail.stockStatus ?? 'outOfStock',
    inStock: detail.inStock,
    featuredImages: detail.featuredImages ?? [],
    selectedVariant: {
      id: detail.selectedVariant?.id ?? 'default-variant',
      sku: detail.selectedVariant?.sku ?? 'DEFAULT',
      price: detail.selectedVariant?.price ?? 0,
      originalPrice: detail.selectedVariant?.originalPrice,
      stockQuantity: detail.selectedVariant?.stockQuantity,
      stockStatus: detail.selectedVariant?.stockStatus,
      isDefault: true, // Always true for list items
      media: [] // Empty for list items
    } as BackendSelectedVariantDto, // Cast to correct type
    colorVariants: [],
    categories: detail.categories ?? []
  })),
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  totalCount: 1,
  hasPreviousPage: false,
  hasNextPage: false
};