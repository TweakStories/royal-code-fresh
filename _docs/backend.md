--- START OF FILE src/Application/Admin/Products/Queries/GetAllAdminProductsQuery.cs ---
// --- MAAK BESTAND: src/Application/Products/Queries/GetAllAdminProducts/GetAllAdminProductsQuery.cs ---
/**
 * @file GetAllAdminProductsQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description Query and handler for administrators to retrieve a paginated list of all products,
 *              including drafts and archived items, with advanced filtering.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix 405 error on AdminProducts list view.
 */
using System.Linq;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Products.Common;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Application.Products.Queries.GetAllAdminProducts;

public record GetAllAdminProductsQuery : IRequest<PaginatedList<ProductListItemDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? SearchTerm { get; init; }
    public ProductStatus? Status { get; init; } // Admins kunnen filteren op status
    public string? SortBy { get; init; }
    public string? SortDirection { get; init; }
}

public class GetAllAdminProductsQueryHandler : IRequestHandler<GetAllAdminProductsQuery, PaginatedList<ProductListItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllAdminProductsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<ProductListItemDto>> Handle(GetAllAdminProductsQuery request, CancellationToken cancellationToken)
    {
        // Start de query ZONDER te filteren op Published/IsActive
        var query = _context.Products.OfType<PhysicalProduct>().AsNoTracking();

        // Admin-specifieke filters
        if (request.Status.HasValue)
        {
            query = query.Where(p => p.Status == request.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTermLower = request.SearchTerm.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchTermLower) ||
                (p.Sku != null && p.Sku.ToLower().Contains(searchTermLower)) ||
                (p.Brand != null && p.Brand.ToLower().Contains(searchTermLower))
            );
        }

        // Sortering
        var isDescending = request.SortDirection?.ToLower() == "desc";
        query = request.SortBy?.ToLower() switch
        {
            "name" => isDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "price" => isDescending ? query.OrderByDescending(p => p.Pricing.Price) : query.OrderBy(p => p.Pricing.Price),
            "status" => isDescending ? query.OrderByDescending(p => p.Status) : query.OrderBy(p => p.Status),
            _ => query.OrderByDescending(p => p.Created) // Standaard sortering
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var products = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Include(p => p.AttributeAssignments)
                .ThenInclude(aa => aa.AttributeValue)
            .Include(p => p.VariantCombinations)
            .ToListAsync(cancellationToken);

        var dtoItems = await ProductDtoProcessor.ProcessProductsToListItemDtosAsync(products.Cast<ProductBase>().ToList(), _context);
        return new PaginatedList<ProductListItemDto>(dtoItems, totalCount, request.PageNumber, request.PageSize);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Admin/Products/Queries/GetProductByIdForAdminQuery.cs ---
/**
 * @file GetProductByIdForAdminQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description Query and Handler to get detailed information for a single product by ID,
 *              intended for the Admin Panel. This version includes all product data,
 *              regardless of its public status (e.g., Draft, Archived).
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Create an exact copy of GetProductById for admin use.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Products.Common;
using RoyalCode.Application.Products.Queries.GetProductById; // Nodig voor ProductDetailDto
using RoyalCode.Domain.Entities.Media;
using System.Collections.Generic;

namespace RoyalCode.Application.Admin.Products.Queries;

public record GetProductByIdForAdminQuery(Guid Id, Dictionary<string, string>? SelectedAttributes = null) : IRequest<ProductDetailDto?>;

public class GetProductByIdForAdminQueryHandler : IRequestHandler<GetProductByIdForAdminQuery, ProductDetailDto?>
{
    private readonly IApplicationDbContext _context;

    public GetProductByIdForAdminQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProductDetailDto?> Handle(GetProductByIdForAdminQuery request, CancellationToken cancellationToken)
    {
        Guard.Against.Default(request.Id, nameof(request.Id));

        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.AttributeAssignments).ThenInclude(aa => aa.AttributeValue)
            .Include(p => p.VariantCombinations)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return null;
        }

        var allRequiredAttributeValueIds = product.AttributeAssignments
            .Select(a => a.AttributeValueId)
            .ToHashSet();

        foreach (var variant in product.VariantCombinations)
        {
            foreach (var attrValueId in variant.AttributeValueIds)
            {
                allRequiredAttributeValueIds.Add(attrValueId);
            }
        }

        var allRelevantAttributeValues = await _context.AttributeValues
            .AsNoTracking()
            .Where(av => allRequiredAttributeValueIds.Contains(av.Id))
            .ToDictionaryAsync(av => av.Id, cancellationToken);

        var allMediaIds = new HashSet<Guid>();
        if (product.MediaIds != null) { foreach (var mediaId in product.MediaIds) { allMediaIds.Add(mediaId); } }
        if (product.VariantCombinations != null) { foreach (var variant in product.VariantCombinations) { if (variant.MediaIds != null) { foreach (var mediaId in variant.MediaIds) { allMediaIds.Add(mediaId); } } } }

        var media = await _context.Media
            .AsNoTracking()
            .Where(m => allMediaIds.Contains(m.Id))
            .Include(m => m.Tags)
            .ToListAsync(cancellationToken);

        var productCategories = new List<ProductCategoryDto>();
        if (product.CategoryIds != null && product.CategoryIds.Any())
        {
            var categoriesInDb = await _context.ProductCategories
                .AsNoTracking()
                .Where(pc => product.CategoryIds.Contains(pc.Id))
                .Select(pc => new ProductCategoryDto(pc.Id, pc.Key))
                .ToListAsync(cancellationToken);
            productCategories.AddRange(categoriesInDb);
        }

        return ProductDtoProcessor.ProcessToDetail(product, media, productCategories, request.SelectedAttributes, allRelevantAttributeValues);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Application.csproj ---
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <RootNamespace>RoyalCode.Application</RootNamespace>
    <AssemblyName>RoyalCode.Application</AssemblyName>
    <UserSecretsId>91fc3bc9-7682-40af-8bb3-1af8daf3034c</UserSecretsId>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Ardalis.GuardClauses" />
    <PackageReference Include="AutoMapper" />
    <PackageReference Include="CsvHelper" />
    <PackageReference Include="FluentValidation.DependencyInjectionExtensions" />
    <PackageReference Include="Microsoft.AspNetCore.SignalR.Common" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" />
    <PackageReference Include="Microsoft.Extensions.Hosting" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Domain\Domain.csproj" />
  </ItemGroup>

  <ItemGroup>
    <Folder Include="Attributes\Queries\" />
    <Folder Include="Search\Commands\" />
  </ItemGroup>

</Project>
--- END OF FILE ---

--- START OF FILE src/Application/Attributes/Commands/CreateAttributeValueCommand.cs ---
/**
 * @file CreateAttributeValueCommand.cs
 * @Version 1.3.0 (Final & Corrected)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Command and handler to create a new reusable product attribute value.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Products.Queries.GetAllAttributeValues;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;
using FluentValidation;

namespace RoyalCode.Application.Products.Commands.Attributes;

public record CreateAttributeValueCommand : IRequest<AttributeValueSelectionDto>
{
    public string Value { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public VariantAttributeType AttributeType { get; init; }
    public string? ColorHex { get; init; }
    public decimal? PriceModifier { get; init; }
}

public class CreateAttributeValueCommandValidator : AbstractValidator<CreateAttributeValueCommand>
{
    public CreateAttributeValueCommandValidator()
    {
        RuleFor(x => x.Value).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.AttributeType).IsInEnum();
        RuleFor(x => x.ColorHex)
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
            .When(x => !string.IsNullOrEmpty(x.ColorHex))
            .WithMessage("ColorHex must be a valid hex color code (e.g., #RRGGBB).");
    }
}

public class CreateAttributeValueCommandHandler : IRequestHandler<CreateAttributeValueCommand, AttributeValueSelectionDto>
{
    private readonly IApplicationDbContext _context;
    public CreateAttributeValueCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<AttributeValueSelectionDto> Handle(CreateAttributeValueCommand request, CancellationToken cancellationToken)
    {
        if (await _context.AttributeValues.AnyAsync(av => av.AttributeType == request.AttributeType && av.Value.ToLower() == request.Value.ToLower(), cancellationToken))
        {
            throw new ConflictException($"An attribute value '{request.Value}' of type '{request.AttributeType}' already exists.", "DUPLICATE_ATTRIBUTE_VALUE");
        }

        var newValue = new AttributeValue(request.Value, request.DisplayName, request.AttributeType);
        newValue.SetMetadata(request.ColorHex, null, request.PriceModifier, PriceModifierType.Fixed);

        _context.AttributeValues.Add(newValue);
        await _context.SaveChangesAsync(cancellationToken);

        return new AttributeValueSelectionDto
        {
            Id = newValue.Id,
            Value = newValue.Value,
            DisplayName = newValue.DisplayName,
            ColorHex = newValue.ColorHex,
            PriceModifier = newValue.PriceModifier
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Attributes/Commands/DeleteAttributeValueCommand.cs ---
/**
 * @file DeleteAttributeValueCommand.cs
 * @Version 1.2.0 (With Referential Integrity Check)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Command and handler to delete a reusable product attribute value,
 *              now with a check for referential integrity.
 */
using FluentValidation;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Products.Commands.Attributes;

public record DeleteAttributeValueCommand(Guid Id) : IRequest;

public class DeleteAttributeValueCommandValidator : AbstractValidator<DeleteAttributeValueCommand>
{
    public DeleteAttributeValueCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

public class DeleteAttributeValueCommandHandler : IRequestHandler<DeleteAttributeValueCommand>
{
    private readonly IApplicationDbContext _context;
    public DeleteAttributeValueCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task Handle(DeleteAttributeValueCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.AttributeValues.FindAsync(request.Id)
             ?? throw new NotFoundException(nameof(Domain.Entities.Product.AttributeValue), request.Id);

        bool inUse = await _context.ProductAttributeAssignments.AnyAsync(a => a.AttributeValueId == request.Id, cancellationToken);
        if (inUse)
        {
            throw new ConflictException("Attribute value is still in use by one or more products. Please remove all assignments before deleting.", "ATTRIBUTE_IN_USE");
        }

        _context.AttributeValues.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Attributes/Commands/UpdateAttributeValueCommand.cs ---
/**
 * @file UpdateAttributeValueCommand.cs
 * @Version 2.2.0 (Full & Final)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Command and handler to fully update an existing reusable product attribute value.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Products.Queries.GetAllAttributeValues;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using FluentValidation;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Application.Products.Commands.Attributes;

public record UpdateAttributeValueCommand : IRequest<AttributeValueSelectionDto>
{
    public Guid Id { get; set; }
    public string DisplayName { get; init; } = string.Empty;
    public string? ColorHex { get; init; }
    public decimal? PriceModifier { get; init; }
}

public class UpdateAttributeValueCommandValidator : AbstractValidator<UpdateAttributeValueCommand>
{
    public UpdateAttributeValueCommandValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.DisplayName).NotEmpty().MaximumLength(100);
        RuleFor(v => v.ColorHex)
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
            .When(v => !string.IsNullOrEmpty(v.ColorHex))
            .WithMessage("ColorHex must be a valid hex color code (e.g., #RRGGBB).");
    }
}

public class UpdateAttributeValueCommandHandler : IRequestHandler<UpdateAttributeValueCommand, AttributeValueSelectionDto>
{
    private readonly IApplicationDbContext _context;
    public UpdateAttributeValueCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<AttributeValueSelectionDto> Handle(UpdateAttributeValueCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.AttributeValues.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Product.AttributeValue), request.Id);

        entity.UpdateMetadata(request.DisplayName, request.ColorHex, request.PriceModifier, PriceModifierType.Fixed);

        await _context.SaveChangesAsync(cancellationToken);

        return new AttributeValueSelectionDto
        {
            Id = entity.Id,
            Value = entity.Value,
            DisplayName = entity.DisplayName,
            ColorHex = entity.ColorHex,
            PriceModifier = entity.PriceModifier
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Cart/Commands/AddItemToCartCommand.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Application/Cart/Commands/AddItemToCartCommand.cs ---
/**
 * @file AddItemToCartCommand.cs
 * @Version 14.0.0 (Mapperless Implementation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description Definitive, mapperless version of adding an item to the cart.
 */
using System.Text.Json;
using Microsoft.Extensions.Logging;
using RoyalCode.Application.Cart.Common;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Cart;
using RoyalCode.Domain.Entities.Product;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Cart.Commands;

public class AddItemToCartCommand : IRequest<CartItemDto>
{
    public Guid UserId { get; init; }
    public Guid ProductId { get; init; }
    public Guid? VariantId { get; init; }
    public int Quantity { get; init; } = 1;
}

public class AddItemToCartCommandHandler : IRequestHandler<AddItemToCartCommand, CartItemDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<AddItemToCartCommandHandler> _logger;

    public AddItemToCartCommandHandler(IApplicationDbContext context, ILogger<AddItemToCartCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<CartItemDto> Handle(AddItemToCartCommand request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);
        if (cart == null)
        {
            _logger.LogInformation("Creating new cart for user {UserId}", request.UserId);
            cart = new Domain.Entities.Cart.Cart(request.UserId, null);
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var existingItem = await _context.CartItems.FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == request.ProductId && ci.ProductVariantId == request.VariantId, cancellationToken);
        CartItem itemToReturn;

        if (existingItem != null)
        {
            existingItem.UpdateQuantity(existingItem.Quantity + request.Quantity);
            _context.CartItems.Update(existingItem);
            itemToReturn = existingItem;
        }
        else
        {
            var productInfo = await GetProductInfoAsync(request.ProductId, request.VariantId, cancellationToken);
            var newItem = new CartItem(cart.Id, request.ProductId, request.VariantId, request.Quantity, productInfo.Name, productInfo.Price, productInfo.ImageUrl, productInfo.Sku);

            // Zet de geselecteerde variant details
            newItem.SetSelectedVariants(productInfo.SelectedVariantsJson);

            _context.CartItems.Add(newItem);
            itemToReturn = newItem;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Handmatige mapping naar het response DTO
        return MapToDto(itemToReturn);
    }

    private CartItemDto MapToDto(CartItem item)
    {
        var selectedVariants = new List<SelectedVariantDto>();
        if (!string.IsNullOrEmpty(item.SelectedVariantsJson))
        {
            try { selectedVariants = JsonSerializer.Deserialize<List<SelectedVariantDto>>(item.SelectedVariantsJson) ?? new List<SelectedVariantDto>(); }
            catch { /* Negeer deserialisatie fouten */ }
        }

        return new CartItemDto
        {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductVariantId = item.ProductVariantId,
            Quantity = item.Quantity,
            ProductName = item.ProductName,
            Sku = item.Sku,
            PricePerItem = item.PricePerItem,
            ProductImageUrl = item.ProductImageUrl,
            LineTotal = item.LineTotal,
            SelectedVariants = selectedVariants
        };
    }

    private async Task<(string Name, decimal Price, string? ImageUrl, string? Sku, string? SelectedVariantsJson)> GetProductInfoAsync(Guid productId, Guid? variantId, CancellationToken cancellationToken)
    {
        var product = await _context.Products.AsNoTracking()
            .Include(p => p.VariantCombinations)
            .Include(p => p.AttributeAssignments).ThenInclude(pa => pa.AttributeValue)
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken) ?? throw new NotFoundException(nameof(ProductBase), productId);

        var physicalProduct = product as PhysicalProduct;
        string name = product.Name;
        decimal price = physicalProduct?.Pricing.Price ?? 0m;
        string? sku = physicalProduct?.Sku;
        string? selectedVariantsJson = null;

        if (variantId.HasValue)
        {
            var variant = product.VariantCombinations.FirstOrDefault(v => v.Id == variantId) ?? throw new NotFoundException("ProductVariant", variantId.Value);
            price = variant.Price ?? price;
            sku = variant.Sku;

            var variantAttributes = product.AttributeAssignments
                .Where(paa => variant.AttributeValueIds.Contains(paa.AttributeValueId))
                .Select(paa => new SelectedVariantDto
                {
                    Name = paa.AttributeValue.AttributeType.ToString(),
                    Value = paa.AttributeValue.DisplayName,
                    DisplayValue = paa.AttributeValue.ColorHex
                }).ToList();

            selectedVariantsJson = JsonSerializer.Serialize(variantAttributes);
        }

        string? imageUrl = null;
        if (product.MediaIds.Any())
        {
            var firstMedia = await _context.Media.AsNoTracking().FirstOrDefaultAsync(m => m.Id == product.MediaIds.First(), cancellationToken);
            imageUrl = firstMedia?.ThumbnailUrl ?? firstMedia?.Url;
        }

        return (name, price, imageUrl, sku, selectedVariantsJson);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Cart/Commands/ClearCartCommand.cs ---
/**
 * @file ClearCartCommand.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-08-02
 * @Description Command and handler to clear all items from the cart.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Cart.Commands;

public record ClearCartCommand(Guid UserId) : IRequest;

public class ClearCartCommandHandler : IRequestHandler<ClearCartCommand>
{
    private readonly IApplicationDbContext _context;
    public ClearCartCommandHandler(IApplicationDbContext context) => _context = context;
    public async Task Handle(ClearCartCommand request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);
        Guard.Against.NotFound(request.UserId, cart, "Cart not found for user.");

        cart.Clear();

        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Cart/Commands/CreateCartForNewUserEventHandler.cs ---
/**
 * @file CreateCartForNewUserEventHandler.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-30
 * @Description Handles the UserRegisteredEvent to automatically create a shopping cart for new users.
 */

using MediatR;
using Microsoft.Extensions.Logging;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Events;
using CartEntity = RoyalCode.Domain.Entities.Cart.Cart;

namespace RoyalCode.Application.Users.EventHandlers;

public class CreateCartForNewUserEventHandler : INotificationHandler<UserRegisteredEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<CreateCartForNewUserEventHandler> _logger;

    public CreateCartForNewUserEventHandler(IApplicationDbContext context, ILogger<CreateCartForNewUserEventHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task Handle(UserRegisteredEvent notification, CancellationToken cancellationToken)
    {
        var cartExists = await _context.Carts.AnyAsync(c => c.UserId == notification.UserId, cancellationToken);

        if (cartExists)
        {
            _logger.LogInformation("Cart already exists for user {UserId}. Skipping creation.", notification.UserId);
            return;
        }

        var cart = new CartEntity(notification.UserId, null);
        _context.Carts.Add(cart);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Cart created for new user {UserId}.", notification.UserId);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Cart/Commands/MergeCartCommand.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Application/Cart/Commands/MergeCartCommand.cs ---
/**
 * @file MergeCartCommand.cs
 * @Version 2.0.0 (Definitive Mapperless)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description Command en handler om winkelwagens samen te voegen, nu zonder AutoMapper.
 */
using System.Linq;
using System.Text.Json;
using RoyalCode.Application.Cart.Common;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Cart;
using RoyalCode.Domain.Entities.Product;

namespace RoyalCode.Application.Cart.Commands;

public record MergeCartCommand : IRequest<CartDto>
{
    public Guid UserId { get; init; }
    public List<MergeCartItemDto> Items { get; init; } = new();
}

public class MergeCartCommandHandler : IRequestHandler<MergeCartCommand, CartDto>
{
    private readonly IApplicationDbContext _context;

    public MergeCartCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> Handle(MergeCartCommand request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);

        if (cart == null)
        {
            cart = new Domain.Entities.Cart.Cart(request.UserId, null);
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync(cancellationToken);
        }

        foreach (var itemToMerge in request.Items)
        {
            var existingItem = await _context.CartItems.FirstOrDefaultAsync(ci =>
                ci.CartId == cart.Id &&
                ci.ProductId == itemToMerge.ProductId &&
                ci.ProductVariantId == itemToMerge.VariantId,
                cancellationToken);

            if (existingItem != null)
            {
                existingItem.UpdateQuantity(existingItem.Quantity + itemToMerge.Quantity);
                _context.CartItems.Update(existingItem);
            }
            else
            {
                var product = await _context.Products.OfType<PhysicalProduct>().AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == itemToMerge.ProductId, cancellationToken);
                if (product != null)
                {
                    var newItem = new CartItem(cart.Id, itemToMerge.ProductId, itemToMerge.VariantId, itemToMerge.Quantity, product.Name, product.Pricing.Price, null, product.Sku);

                    // Zet de geselecteerde variant details van de frontend
                    if (itemToMerge.SelectedVariants != null && itemToMerge.SelectedVariants.Any())
                    {
                        newItem.SetSelectedVariants(JsonSerializer.Serialize(itemToMerge.SelectedVariants));
                    }

                    _context.CartItems.Add(newItem);
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        var finalCart = await _context.Carts
            .AsNoTracking()
            .Include(c => c.Items)
            .FirstAsync(c => c.Id == cart.Id, cancellationToken);

        // Handmatige mapping van de domein-entiteit naar de DTO.
        return new CartDto
        {
            Id = finalCart.Id,
            UserId = finalCart.UserId,
            Items = finalCart.Items.Select(MapToDto).ToList(), // Gebruik de helper
            SubTotal = finalCart.SubTotal,
            ShippingCost = finalCart.ShippingCost,
            TotalDiscountAmount = finalCart.TotalDiscountAmount,
            TotalVatAmount = finalCart.TotalVatAmount,
            TotalWithShipping = finalCart.TotalWithShipping,
            TotalItems = finalCart.TotalItems
        };
    }

    private CartItemDto MapToDto(CartItem item)
    {
        var selectedVariants = new List<SelectedVariantDto>();
        if (!string.IsNullOrEmpty(item.SelectedVariantsJson))
        {
            try { selectedVariants = JsonSerializer.Deserialize<List<SelectedVariantDto>>(item.SelectedVariantsJson) ?? new List<SelectedVariantDto>(); }
            catch { /* Negeer deserialisatie fouten */ }
        }

        return new CartItemDto
        {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductVariantId = item.ProductVariantId,
            Quantity = item.Quantity,
            ProductName = item.ProductName,
            Sku = item.Sku,
            PricePerItem = item.PricePerItem,
            ProductImageUrl = item.ProductImageUrl,
            LineTotal = item.LineTotal,
            SelectedVariants = selectedVariants
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Cart/Commands/RemoveItemFromCartCommand.cs ---
/**
 * @file RemoveItemFromCartCommand.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-08-02
 * @Description Command and handler to remove an item from the cart.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Cart.Commands;

public record RemoveItemFromCartCommand(Guid UserId, Guid CartItemId) : IRequest;

public class RemoveItemFromCartCommandHandler : IRequestHandler<RemoveItemFromCartCommand>
{
    private readonly IApplicationDbContext _context;
    public RemoveItemFromCartCommandHandler(IApplicationDbContext context) => _context = context;
    public async Task Handle(RemoveItemFromCartCommand request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);
        Guard.Against.NotFound(request.UserId, cart, "Cart not found for user.");

        cart.RemoveItem(request.CartItemId);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Cart/Commands/UpdateCartItemQuantityCommand.cs ---
/**
 * @file UpdateCartItemQuantityCommand.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-08-02
 * @Description Command and handler to update the quantity of an item in the cart.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Cart.Commands;

public record UpdateCartItemQuantityCommand : IRequest
{
    public Guid UserId { get; init; }
    public Guid CartItemId { get; init; }
    public int Quantity { get; init; }
}

public class UpdateCartItemQuantityCommandHandler : IRequestHandler<UpdateCartItemQuantityCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateCartItemQuantityCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateCartItemQuantityCommand request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);
        Guard.Against.NotFound(request.UserId, cart, "Cart not found for user.");

        cart.UpdateItemQuantity(request.CartItemId, request.Quantity);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Cart/Common/CartDtos.cs ---
/**
 * @file CartDtos.cs
 * @Version 2.0.0 (With Selected Variants)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-18
 * @Description Centralized DTOs for the Cart feature, now including selected variant details.
 */
using RoyalCode.Domain.Entities.Cart;

namespace RoyalCode.Application.Cart.Common;

/// <summary>
/// DTO for a single user-selected variant option.
/// </summary>
public record SelectedVariantDto
{
    public string Name { get; init; } = string.Empty; // e.g., "Kleur"
    public string Value { get; init; } = string.Empty; // e.g., "Goud"
    public string? DisplayValue { get; init; } // e.g., "#FFD700"
}

/// <summary>
/// DTO for a single item within the shopping cart.
/// </summary>
public record CartItemDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public Guid? ProductVariantId { get; init; }
    public int Quantity { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? Sku { get; init; }
    public decimal PricePerItem { get; init; }
    public string? ProductImageUrl { get; init; }
    public decimal LineTotal { get; init; }
    public IReadOnlyCollection<SelectedVariantDto> SelectedVariants { get; init; } = new List<SelectedVariantDto>(); // <-- NIEUW
}

/// <summary>
/// DTO representing the entire shopping cart.
/// </summary>
public record CartDto
{
    public Guid Id { get; init; }
    public Guid? UserId { get; init; }
    public IReadOnlyCollection<CartItemDto> Items { get; init; } = new List<CartItemDto>();
    public decimal SubTotal { get; init; }
    public decimal ShippingCost { get; init; }
    public decimal TotalDiscountAmount { get; init; }
    public decimal TotalVatAmount { get; init; }
    public decimal TotalWithShipping { get; init; }
    public int TotalItems { get; init; }
}

/// <summary>
/// DTO representing an item from a client-side cart to be merged.
/// </summary>
public record MergeCartItemDto
{
    public Guid ProductId { get; init; }
    public Guid? VariantId { get; init; }
    public int Quantity { get; init; }
    public List<SelectedVariantDto>? SelectedVariants { get; init; } // <-- NIEUW
}
--- END OF FILE ---

--- START OF FILE src/Application/Cart/Queries/GetCartQuery.cs ---
/**
 * @file GetCartQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-08-02
 * @Description Query to retrieve the shopping cart for a specific user.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 */
using System.Linq;
using System.Text.Json;
using RoyalCode.Application.Cart.Common;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Cart;

namespace RoyalCode.Application.Cart.Queries;

public record GetCartQuery(Guid UserId) : IRequest<CartDto?>;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, CartDto?>
{
    private readonly IApplicationDbContext _context;

    public GetCartQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto?> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts
            .AsNoTracking()
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);

        if (cart == null) return null;

        return new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = cart.Items.Select(MapToDto).ToList(), // Gebruik de helper
            SubTotal = cart.SubTotal,
            ShippingCost = cart.ShippingCost,
            TotalDiscountAmount = cart.TotalDiscountAmount,
            TotalVatAmount = cart.TotalVatAmount,
            TotalWithShipping = cart.TotalWithShipping,
            TotalItems = cart.TotalItems
        };
    }

    private CartItemDto MapToDto(CartItem item)
    {
        var selectedVariants = new List<SelectedVariantDto>();
        if (!string.IsNullOrEmpty(item.SelectedVariantsJson))
        {
            try { selectedVariants = JsonSerializer.Deserialize<List<SelectedVariantDto>>(item.SelectedVariantsJson) ?? new List<SelectedVariantDto>(); }
            catch { /* Negeer deserialisatie fouten */ }
        }

        return new CartItemDto
        {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductVariantId = item.ProductVariantId,
            Quantity = item.Quantity,
            ProductName = item.ProductName,
            Sku = item.Sku,
            PricePerItem = item.PricePerItem,
            ProductImageUrl = item.ProductImageUrl,
            LineTotal = item.LineTotal,
            SelectedVariants = selectedVariants
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Commands/AddParticipantToGroupCommand.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using RoyalCode.Domain.Enums.Chat;
using RoyalCode.Domain.Entities.Chat;

namespace RoyalCode.Application.Chat.Commands;

public record AddParticipantToGroupCommand(Guid ConversationId, Guid UserIdToAdd) : IRequest;

public class AddParticipantToGroupCommandHandler : IRequestHandler<AddParticipantToGroupCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public AddParticipantToGroupCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(AddParticipantToGroupCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException();
        var conversation = await _context.Conversations.Include(c => c.Participants).FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken)
            ?? throw new NotFoundException(nameof(Conversation), request.ConversationId);

        var currentUserParticipant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUserId);
        if (currentUserParticipant?.Role != ConversationRole.Owner) throw new ForbiddenAccessException("Only the owner can add participants.");

        conversation.AddParticipant(Participant.ForUser(request.ConversationId, request.UserIdToAdd, ConversationRole.Member));
        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Commands/AssociateAnonymousChatCommand.cs ---
/**
 * @file AssociateAnonymousChatCommand.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description Command and handler to associate an anonymous chat conversation with an authenticated user.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Chat;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Chat.Commands;

public record AssociateAnonymousChatCommand(Guid AnonymousSessionId) : IRequest;

public class AssociateAnonymousChatCommandHandler : IRequestHandler<AssociateAnonymousChatCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public AssociateAnonymousChatCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(AssociateAnonymousChatCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var conversation = await _context.Conversations
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.AnonymousSessionId == request.AnonymousSessionId, cancellationToken);

        if (conversation == null)
        {
            throw new NotFoundException(nameof(Conversation), $"Anonymous chat with ID {request.AnonymousSessionId} not found.");
        }

        conversation.AssociateWithUser(userId);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Commands/CreateGroupChatCommand.cs ---
// MAAK BESTAND: src/Application/Chat/Commands/CreateGroupChatCommand.cs
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Enums.Chat;

namespace RoyalCode.Application.Chat.Commands;

public record CreateGroupChatCommand(string Title, List<Guid> InitialUserIds) : IRequest<StartConversationResponseDto>;

public class CreateGroupChatCommandHandler : IRequestHandler<CreateGroupChatCommand, StartConversationResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public CreateGroupChatCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<StartConversationResponseDto> Handle(CreateGroupChatCommand request, CancellationToken cancellationToken)
    {
        var ownerId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var newConversation = new Conversation(ConversationType.GroupChat, request.Title, ownerId);
        newConversation.AddParticipant(Participant.ForUser(newConversation.Id, ownerId, ConversationRole.Owner));

        foreach (var userId in request.InitialUserIds.Where(id => id != ownerId).Distinct())
        {
            newConversation.AddParticipant(Participant.ForUser(newConversation.Id, userId, ConversationRole.Member));
        }

        _context.Conversations.Add(newConversation);
        await _context.SaveChangesAsync(cancellationToken);

        return new StartConversationResponseDto { ConversationId = newConversation.Id, IsNew = true };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Commands/MarkConversationAsReadCommand.cs ---
/**
 * @file MarkConversationAsReadCommand.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Command and handler to mark all messages in a conversation as read for the current user.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Implement the next step: Mark Conversation as Read.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Chat;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Chat.Commands;

public record MarkConversationAsReadCommand(Guid ConversationId) : IRequest;

public class MarkConversationAsReadCommandHandler : IRequestHandler<MarkConversationAsReadCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public MarkConversationAsReadCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(MarkConversationAsReadCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        // 1. Zoek de specifieke 'Participant' entiteit voor deze gebruiker in deze conversatie.
        var participant = await _context.ChatParticipants
            .FirstOrDefaultAsync(p => p.ConversationId == request.ConversationId && p.UserId == userId, cancellationToken);

        // 2. Guard Clause: Als de gebruiker geen deelnemer is, mag hij de chat niet als gelezen markeren.
        if (participant == null)
        {
            // We gooien een NotFoundException, omdat vanuit het perspectief van de gebruiker
            // zijn 'deelname' aan deze chat niet bestaat. Dit voorkomt ook dat we informatie lekken.
            throw new NotFoundException(nameof(Participant), $"for user {userId} in conversation {request.ConversationId}");
        }

        // 3. Roep de domeinlogica aan. Deze methode zet de UnreadCount op 0 en update de timestamp.
        participant.MarkAsRead(DateTimeOffset.UtcNow);

        // 4. Sla de wijziging op in de database.
        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Commands/RemoveParticipantFromGroupCommand.cs ---
// MAAK BESTAND: src/Application/Chat/Commands/RemoveParticipantFromGroupCommand.cs
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Enums.Chat;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Chat.Commands;

public record RemoveParticipantFromGroupCommand(Guid ConversationId, Guid UserIdToRemove) : IRequest;

public class RemoveParticipantFromGroupCommandHandler : IRequestHandler<RemoveParticipantFromGroupCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public RemoveParticipantFromGroupCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(RemoveParticipantFromGroupCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException();
        var conversation = await _context.Conversations.Include(c => c.Participants).FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken)
            ?? throw new NotFoundException(nameof(Conversation), request.ConversationId);

        var currentUserParticipant = conversation.Participants.FirstOrDefault(p => p.UserId == currentUserId);

        bool canRemove = currentUserParticipant?.Role == ConversationRole.Owner || currentUserId == request.UserIdToRemove;
        if (!canRemove) throw new ForbiddenAccessException("Only the owner can remove others, or you can remove yourself.");

        conversation.RemoveParticipant(request.UserIdToRemove);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Commands/SendAnonymousMessageCommand.cs ---
/**
 * @file SendAnonymousMessageCommand.cs
 * @Version 3.0.0 (FINAL - Guest Participant Model)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description Command and handler for an anonymous user to send a message.
 *              This version correctly models the anonymous user as a 'Guest' participant,
 *              solving the "Sender participant ID cannot be empty" domain exception.
 */
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Enums.Chat;
using RoyalCode.Domain.Exceptions;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Chat.Commands;

public record AnonymousChatResponseDto
{
    public MessageDto UserMessage { get; init; } = null!;
    public MessageDto AiReply { get; init; } = null!;
    public Guid AnonymousSessionId { get; init; }
}

public record SendAnonymousMessageCommand : IRequest<AnonymousChatResponseDto>
{
    public Guid? AnonymousSessionId { get; init; }
    public string AiPersonaId { get; init; } = string.Empty;
    public string Content { get; init; } = string.Empty;
}

public class SendAnonymousMessageCommandHandler : IRequestHandler<SendAnonymousMessageCommand, AnonymousChatResponseDto>
{
    private const int ANONYMOUS_MESSAGE_LIMIT = 10;
    private readonly IApplicationDbContext _context;

    public SendAnonymousMessageCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AnonymousChatResponseDto> Handle(SendAnonymousMessageCommand request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(request.AiPersonaId, out var parsedAiPersonaId))
        {
            throw new BadRequestException("Invalid AI Persona ID format.", "INVALID_AI_PERSONA_ID_FORMAT");
        }

        var aiPersona = await _context.AiPersonas.FindAsync(new object[] { parsedAiPersonaId }, cancellationToken)
            ?? throw new NotFoundException(nameof(AIPersona), parsedAiPersonaId.ToString());

        var currentSessionId = request.AnonymousSessionId ?? Guid.NewGuid();
        var conversation = await _context.Conversations
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.AnonymousSessionId == currentSessionId, cancellationToken);

        Participant guestParticipant;

        if (conversation == null)
        {
            conversation = new Conversation(ConversationType.AiChat, "Anonymous AI Chat", null, currentSessionId);
            var aiParticipant = Participant.ForAi(conversation.Id, parsedAiPersonaId);
            guestParticipant = Participant.ForGuest(conversation.Id);
            conversation.AddParticipant(aiParticipant);
            conversation.AddParticipant(guestParticipant);
            _context.Conversations.Add(conversation);
        }
        else
        {
            guestParticipant = conversation.Participants.First(p => p.IsGuest);
        }

        if (conversation.MessageCount >= ANONYMOUS_MESSAGE_LIMIT)
        {
            throw new DomainException("Anonymous message limit reached. Please log in to continue.", "MESSAGE_LIMIT_REACHED");
        }

        var userMessage = new Message(conversation.Id, guestParticipant.Id, request.Content);
        conversation.AddMessage(userMessage);
        userMessage.UpdateStatus(MessageStatus.Sent);
        _context.ChatMessages.Add(userMessage);

        var aiParticipantInDb = conversation.Participants.First(p => p.IsAi);
        var aiEchoContent = $"Echo (Anonymous): {request.Content}";
        var aiMessage = new Message(conversation.Id, aiParticipantInDb.Id, aiEchoContent, MessageType.Text, userMessage.Id);
        conversation.AddMessage(aiMessage);
        aiMessage.UpdateStatus(MessageStatus.Sent);
        _context.ChatMessages.Add(aiMessage);

        await _context.SaveChangesAsync(cancellationToken);

        // --- DE DEFINITIEVE FIX: Gebruik de consistente SenderDto voor de anonieme gebruiker ---
        var userSenderDto = new SenderDto { Id = guestParticipant.Id, DisplayName = "You" };
        var aiSenderDto = new SenderDto { Id = aiPersona.Id, DisplayName = aiPersona.Name };

        return new AnonymousChatResponseDto
        {
            UserMessage = MapToDto(userMessage, userSenderDto, currentSessionId),
            AiReply = MapToDto(aiMessage, aiSenderDto, currentSessionId),
            AnonymousSessionId = currentSessionId
        };
    }

    private MessageDto MapToDto(Message message, SenderDto sender, Guid sessionId)
    {
        return new MessageDto
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            AnonymousSessionId = sessionId,
            Sender = sender,
            Content = message.Content.Text,
            Status = message.Status,
            CreatedAt = message.Created,
            ReplyToMessageId = message.ReplyToMessageId,
            IsEdited = message.IsEdited
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Commands/SendMessageCommand.cs ---
/**
 * @file SendMessageCommand.cs
 * @Version 2.5.0 (FINAL - All Nullability & Alias Issues Fixed + AI Echo)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description Command and handler to send a new message, now with all nullability and alias issues resolved,
 *              and includes basic AI echo functionality for immediate feedback.
 */
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Social.Common; // Voor ProfileDto
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Enums.Chat;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Chat.Commands;

public record SendMessageCommand : IRequest<MessageDto>
{
    public Guid ConversationId { get; init; }
    public Guid SenderUserId { get; init; }
    public string Content { get; init; } = string.Empty;
    public List<Guid>? MediaIds { get; init; }
}

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, MessageDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IChatNotificationService _chatNotificationService;
    private readonly IIdentityService _identityService;

    public SendMessageCommandHandler(IApplicationDbContext context, IChatNotificationService chatNotificationService, IIdentityService identityService)
    {
        _context = context;
        _chatNotificationService = chatNotificationService;
        _identityService = identityService;
    }

    public async Task<MessageDto> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var conversation = await _context.Conversations
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken);

        if (conversation == null) throw new NotFoundException(nameof(Conversation), request.ConversationId);

        var senderParticipant = conversation.Participants.FirstOrDefault(p => p.UserId == request.SenderUserId);
        if (senderParticipant == null) throw new ForbiddenAccessException("Sender is not a participant of this conversation.");

        // --- 1. Gebruikersbericht Opslaan ---
        var userMessage = new Message(conversation.Id, senderParticipant.Id, request.Content);
        request.MediaIds?.ForEach(mediaId => userMessage.AddMediaAttachment(mediaId));

        conversation.AddMessage(userMessage);

        _context.ChatMessages.Add(userMessage);
        await _context.SaveChangesAsync(cancellationToken);

        // --- DE DEFINITIEVE FIX: Update status NA succesvolle opslag ---
        // Het bericht is nu succesvol "verzonden" vanuit het perspectief van het systeem.
        userMessage.UpdateStatus(MessageStatus.Sent);
        // Sla deze statuswijziging expliciet op.
        await _context.SaveChangesAsync(cancellationToken);
        // --- EINDE FIX ---

        var senderProfiles = await _identityService.GetProfilesByIdsAsync(new[] { request.SenderUserId });
        var senderProfile = senderProfiles.GetValueOrDefault(request.SenderUserId);

        var senderDto = new SenderDto
        {
            Id = request.SenderUserId,
            DisplayName = senderProfile?.DisplayName ?? "Onbekend",
            AvatarUrl = senderProfile?.Avatar?.Url
        };

        var createdUserMessageDto = new MessageDto
        {
            Id = userMessage.Id,
            ConversationId = userMessage.ConversationId,
            Sender = senderDto,
            Content = userMessage.Content.Text,
            Type = userMessage.Type,
            Status = userMessage.Status, // Deze is nu 'Sent'
            CreatedAt = userMessage.Created,
            ReplyToMessageId = userMessage.ReplyToMessageId,
            IsEdited = userMessage.IsEdited
        };

        var recipientUserIds = conversation.Participants
            .Where(p => p.UserId.HasValue && p.UserId.Value != request.SenderUserId)
            .Select(p => p.UserId!.Value.ToString())
            .ToList();

        // Broadcast het gebruikersbericht
        await _chatNotificationService.BroadcastMessageAsync(createdUserMessageDto, recipientUserIds);

        // --- 2. AI Echo Bericht Genereren en Opslaan (Echo Bot) ---
        if (conversation.Type == ConversationType.AiChat)
        {
            var aiParticipant = conversation.Participants.FirstOrDefault(p => p.AiPersonaId.HasValue);
            if (aiParticipant != null)
            {
                var aiPersona = await _context.AiPersonas.FindAsync(aiParticipant.AiPersonaId);
                if (aiPersona != null)
                {
                    var aiEchoContent = $"Echo: {request.Content}"; // Simpele echo
                    var aiMessage = new Message(conversation.Id, aiParticipant.Id, aiEchoContent, MessageType.Text, userMessage.Id); // Reply naar gebruikersbericht

                    conversation.AddMessage(aiMessage); // Update LastActivityAt en UnreadCounts
                    _context.ChatMessages.Add(aiMessage);
                    await _context.SaveChangesAsync(cancellationToken);

                    aiMessage.UpdateStatus(MessageStatus.Sent);
                    await _context.SaveChangesAsync(cancellationToken);

                    var aiSenderDto = new SenderDto
                    {
                        Id = aiPersona.Id, // Gebruik AI Persona ID
                        DisplayName = aiPersona.Name,
                        AvatarUrl = null // TODO: Haal avatar op indien beschikbaar
                    };

                    var createdAiMessageDto = new MessageDto
                    {
                        Id = aiMessage.Id,
                        ConversationId = aiMessage.ConversationId,
                        Sender = aiSenderDto,
                        Content = aiMessage.Content.Text,
                        Type = aiMessage.Type,
                        Status = aiMessage.Status, // Deze is nu ook 'Sent'
                        CreatedAt = aiMessage.Created,
                        ReplyToMessageId = aiMessage.ReplyToMessageId,
                        IsEdited = aiMessage.IsEdited
                    };

                    // Broadcast het AI echo bericht naar de gebruiker
                    await _chatNotificationService.BroadcastMessageAsync(createdAiMessageDto, new List<string> { request.SenderUserId.ToString() });
                }
            }
        }

        return createdUserMessageDto; // Retourneer het *gebruikersbericht* als primary response
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Commands/StartCustomerSupportChatCommand.cs ---
/**
 * @file StartCustomerSupportChatCommand.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description Command and handler for a customer to start a new support chat,
 *              or retrieve an existing one.
 */
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Enums.Chat;

namespace RoyalCode.Application.Chat.Commands;

// De Title (bv. "Plushie Paradise Support") identificeert de bron/site.
public record StartCustomerSupportChatCommand(string Title, string InitialMessage) : IRequest<StartConversationResponseDto>;

public class StartCustomerSupportChatCommandHandler : IRequestHandler<StartCustomerSupportChatCommand, StartConversationResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public StartCustomerSupportChatCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<StartConversationResponseDto> Handle(StartCustomerSupportChatCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        // Zoek naar een bestaande, open support chat voor deze gebruiker en site/titel.
        var existingConversation = await _context.Conversations
            .FirstOrDefaultAsync(c => c.Type == ConversationType.CustomerSupport &&
                                      c.Participants.Any(p => p.UserId == userId) &&
                                      c.Title == request.Title,
                                      cancellationToken);

        if (existingConversation != null)
        {
            return new StartConversationResponseDto { ConversationId = existingConversation.Id, IsNew = false };
        }

        // Maak een nieuwe conversatie aan.
        var newConversation = new Conversation(ConversationType.CustomerSupport, request.Title, userId);

        // Voeg de klant toe als deelnemer.
        var customerParticipant = Participant.ForUser(newConversation.Id, userId, ConversationRole.Member);
        newConversation.AddParticipant(customerParticipant);

        // Voeg het eerste bericht van de klant toe.
        var initialMessage = new Message(newConversation.Id, customerParticipant.Id, request.InitialMessage);
        initialMessage.UpdateStatus(MessageStatus.Sent);
        newConversation.AddMessage(initialMessage);

        _context.Conversations.Add(newConversation);
        await _context.SaveChangesAsync(cancellationToken);

        // TODO: Notificatie sturen naar alle Customer Service agents.

        return new StartConversationResponseDto { ConversationId = newConversation.Id, IsNew = true };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Commands/StartDirectMessageCommand.cs ---
/**
 * @file StartDirectMessageCommand.cs
 * @Version 1.2.0 (Clean Architecture & Namespace Fixes)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Command and handler to find or create a direct message conversation,
 *              now correctly validating user existence via IIdentityService and with namespace fixes.
 */
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Enums.Chat;
using RoyalCode.Domain.Exceptions;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException; // Alias voor duidelijkheid.

namespace RoyalCode.Application.Chat.Commands;

public record StartDirectMessageCommand(Guid OtherUserId) : IRequest<StartConversationResponseDto>;

public class StartDirectMessageCommandHandler : IRequestHandler<StartDirectMessageCommand, StartConversationResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public StartDirectMessageCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<StartConversationResponseDto> Handle(StartDirectMessageCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        if (currentUserId == request.OtherUserId)
        {
            throw new DomainException("Cannot start a conversation with yourself.", "SELF_CHAT_NOT_ALLOWED");
        }

        var existingConversation = await _context.Conversations
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Type == ConversationType.DirectMessage &&
                c.Participants.Count == 2 && // Specifiek voor 1-op-1 DM
                c.Participants.Any(p => p.UserId == currentUserId) &&
                c.Participants.Any(p => p.UserId == request.OtherUserId),
                cancellationToken);

        if (existingConversation != null)
        {
            return new StartConversationResponseDto
            {
                ConversationId = existingConversation.Id,
                IsNew = false
            };
        }

        var otherUserExists = await _identityService.DoesUserExistAsync(request.OtherUserId);
        if (!otherUserExists)
        {
            throw new NotFoundException("User", request.OtherUserId);
        }

        var newConversation = Conversation.CreateDirectMessage(currentUserId, request.OtherUserId);

        _context.Conversations.Add(newConversation);
        await _context.SaveChangesAsync(cancellationToken);

        return new StartConversationResponseDto
        {
            ConversationId = newConversation.Id,
            IsNew = true
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Common/AIPersonaDto.cs ---
/**
 * @file AiPersonaDto.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description DTO for basic AI Persona information, used for display and lookup.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary DTO for AI persona.
 */
using System;

namespace RoyalCode.Application.Chat.Common;

public record AIPersonaDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? AvatarMediaId { get; init; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Common/ChatDtos.cs ---
/**
 * @file ChatDtos.cs
 * @Version 1.2.0 (With Group Chat DTOs)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Centralized DTOs for the Chat feature, now including group chat management.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Implement Group Chat (MVP) functionality.
 */
using RoyalCode.Application.Common.Models;
using RoyalCode.Domain.Enums.Chat;

namespace RoyalCode.Application.Chat.Common;

/// <summary>
/// Represents a single conversation in a list view for the client.
/// </summary>
public record ConversationListItemDto
{
    public Guid Id { get; init; }
    public ConversationType Type { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public string? LastMessageContent { get; init; }
    public DateTimeOffset? LastMessageTimestamp { get; init; }
    public int UnreadCount { get; init; }
}

/// <summary>
/// Represents the profile of a message sender (can be a user or an AI).
/// </summary>
public record SenderDto
{
    public Guid Id { get; init; } // UserId or AIPersonaId
    public string DisplayName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
}

/// <summary>
/// Represents a single chat message for the client.
/// </summary>
public record MessageDto
{
    public Guid Id { get; init; }
    public Guid ConversationId { get; init; }
    public SenderDto Sender { get; init; } = null!;
    public string Content { get; init; } = string.Empty;
    public MessageType Type { get; init; }
    public MessageStatus Status { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public Guid? ReplyToMessageId { get; init; }
    public bool IsEdited { get; init; }
    public Guid? AnonymousSessionId { get; init; } 
}


/// <summary>
/// Represents the result of starting a new conversation.
/// </summary>
public record StartConversationResponseDto
{
    public Guid ConversationId { get; init; }
    public bool IsNew { get; init; }
}

/// <summary>
/// Represents a participant within a conversation, including their role.
/// </summary>
public record ParticipantDto
{
    public Guid UserId { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }
    public ConversationRole Role { get; init; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Common/StartAiChatCommand.cs ---
/**
 * @file StartAiChatCommand.cs
 * @Version 2.0.0 (Accepts AiPersonaId from Lookup)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description Command and handler to find or create a chat conversation with an AI Persona,
 *              now accepting the AiPersonaId (which can be looked up by name from the frontend).
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Implement getting AI persona by name.
 */
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Enums.Chat;
using RoyalCode.Domain.Exceptions;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Chat.Commands;

// De command verwacht nu direct de ID, de lookup op naam gebeurt in de Web-laag
public record StartAiChatCommand(Guid AiPersonaId) : IRequest<StartConversationResponseDto>;

public class StartAiChatCommandHandler : IRequestHandler<StartAiChatCommand, StartConversationResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public StartAiChatCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<StartConversationResponseDto> Handle(StartAiChatCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        // 1. Zoek een bestaande AI chat conversatie voor deze gebruiker en AI Persona
        var existingConversation = await _context.Conversations
            .AsNoTracking()
            .FirstOrDefaultAsync(c =>
                c.Type == ConversationType.AiChat &&
                c.Participants.Any(p => p.UserId == currentUserId) &&
                c.Participants.Any(p => p.AiPersonaId == request.AiPersonaId),
                cancellationToken);

        if (existingConversation != null)
        {
            return new StartConversationResponseDto
            {
                ConversationId = existingConversation.Id,
                IsNew = false
            };
        }

        // 2. Valideer of de AI Persona bestaat (deze check is hier redundant omdat
        //    de Web-laag dit al heeft gedaan met GetAiPersonaByNameQuery,
        //    maar het is een goede defensieve check als dit command direct zou worden aangeroepen)
        var aiPersonaExists = await _context.AiPersonas.AnyAsync(ap => ap.Id == request.AiPersonaId, cancellationToken);
        if (!aiPersonaExists)
        {
            throw new NotFoundException(nameof(AIPersona), request.AiPersonaId);
        }

        // 3. Creëer een nieuwe AI chat conversatie
        var newConversation = Domain.Entities.Chat.Conversation.CreateAiChat(currentUserId, request.AiPersonaId);

        _context.Conversations.Add(newConversation);
        await _context.SaveChangesAsync(cancellationToken);

        return new StartConversationResponseDto
        {
            ConversationId = newConversation.Id,
            IsNew = true
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Queries/GetAiPersonaByNameQuery.cs ---
/**
 * @file GetAiPersonaByNameQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description Query and handler to retrieve an AI Persona by its name.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Implement getting AI persona by name.
 */
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Chat; // Voor AIPersona

namespace RoyalCode.Application.Chat.Queries;

public record GetAiPersonaByNameQuery(string Name) : IRequest<AIPersonaDto?>;

public class GetAiPersonaByNameQueryHandler : IRequestHandler<GetAiPersonaByNameQuery, AIPersonaDto?>
{
    private readonly IApplicationDbContext _context;

    public GetAiPersonaByNameQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AIPersonaDto?> Handle(GetAiPersonaByNameQuery request, CancellationToken cancellationToken)
    {
        // Zoek de AI Persona op naam, case-insensitive
        var persona = await _context.AiPersonas
            .AsNoTracking()
            .FirstOrDefaultAsync(ap => ap.Name.ToLower() == request.Name.ToLower(), cancellationToken);

        if (persona == null)
        {
            return null;
        }

        // Handmatige mapping naar DTO
        return new AIPersonaDto
        {
            Id = persona.Id,
            Name = persona.Name,
            Description = persona.Description,
            AvatarMediaId = persona.AvatarMediaId
            // Configuratiedetails worden niet meegegeven in de DTO om privacy/beveiliging te waarborgen
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Queries/GetAnonymousConversationQuery.cs ---
/**
 * @file GetAnonymousConversationQuery.cs
 * @Version 1.1.0 (Co-located DTO & Minimal Comments)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description Query, DTO, and handler to retrieve the full history of an anonymous chat session.
 *              DTO is co-located for cohesion, following strict comment guidelines.
 */
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Chat;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Chat.Queries;

// --- DTO direct in dit bestand ---
public record AnonymousConversationDto
{
    public Guid ConversationId { get; init; }
    public Guid AnonymousSessionId { get; init; }
    public AIPersonaDto AiPersona { get; init; } = null!;
    public List<MessageDto> Messages { get; init; } = new();
}

// --- De Query ---
public record GetAnonymousConversationQuery(Guid AnonymousSessionId) : IRequest<AnonymousConversationDto?>;

// --- De Handler ---
public class GetAnonymousConversationQueryHandler : IRequestHandler<GetAnonymousConversationQuery, AnonymousConversationDto?>
{
    private readonly IApplicationDbContext _context;

    public GetAnonymousConversationQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AnonymousConversationDto?> Handle(GetAnonymousConversationQuery request, CancellationToken cancellationToken)
    {
        var conversation = await _context.Conversations
            .AsNoTracking()
            .Include(c => c.Participants)
            .Include(c => c.Messages.OrderBy(m => m.Created))
            .FirstOrDefaultAsync(c => c.AnonymousSessionId == request.AnonymousSessionId, cancellationToken);

        if (conversation == null)
        {
            return null;
        }

        var aiParticipant = conversation.Participants.FirstOrDefault(p => p.IsAi);
        // --- DE DEFINITIEVE FIX: Vind de gast-participant. Deze is cruciaal. ---
        var guestParticipant = conversation.Participants.FirstOrDefault(p => p.IsGuest);

        if (aiParticipant?.AiPersonaId == null || guestParticipant == null)
        {
            // Als er geen gast-participant is, kan de chat niet correct worden hersteld.
            return null;
        }

        var aiPersona = await _context.AiPersonas.FindAsync(new object[] { aiParticipant.AiPersonaId.Value }, cancellationToken)
            ?? throw new NotFoundException(nameof(AIPersona), aiParticipant.AiPersonaId.Value.ToString());

        var aiSenderDto = new SenderDto { Id = aiPersona.Id, DisplayName = aiPersona.Name };
        // --- DE DEFINITIEVE FIX: Gebruik de ID van de GAST-participant voor de gebruiker. ---
        var userSenderDto = new SenderDto { Id = guestParticipant.Id, DisplayName = "You" };

        var messages = conversation.Messages.Select(m => new MessageDto
        {
            Id = m.Id,
            ConversationId = m.ConversationId,
            // --- DE DEFINITIEVE FIX: Vergelijk met de ID van de AI-participant. Alle andere berichten zijn van de gast. ---
            Sender = m.SenderParticipantId == aiParticipant.Id ? aiSenderDto : userSenderDto,
            Content = m.Content.Text,
            Status = m.Status,
            CreatedAt = m.Created,
            ReplyToMessageId = m.ReplyToMessageId,
            AnonymousSessionId = conversation.AnonymousSessionId // Stuur altijd de sessie-ID mee
        }).ToList();

        return new AnonymousConversationDto
        {
            ConversationId = conversation.Id,
            AnonymousSessionId = request.AnonymousSessionId,
            AiPersona = new AIPersonaDto { Id = aiPersona.Id, Name = aiPersona.Name, Description = aiPersona.Description },
            Messages = messages
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Queries/GetMessagesForConversationQuery.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Mappings;
using RoyalCode.Application.Common.Models;

namespace RoyalCode.Application.Chat.Queries;

public record GetMessagesForConversationQuery : IRequest<PaginatedList<MessageDto>>
{
    public Guid ConversationId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}

public class GetMessagesForConversationQueryHandler : IRequestHandler<GetMessagesForConversationQuery, PaginatedList<MessageDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public GetMessagesForConversationQueryHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<PaginatedList<MessageDto>> Handle(GetMessagesForConversationQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();
        var isParticipant = await _context.ChatParticipants.AnyAsync(p => p.ConversationId == request.ConversationId && p.UserId == userId, cancellationToken);
        if (!isParticipant) throw new ForbiddenAccessException("User is not a participant of this conversation.");

        var participants = await _context.ChatParticipants.Where(p => p.ConversationId == request.ConversationId).ToListAsync(cancellationToken);
        var participantUserIds = participants.Where(p => p.UserId.HasValue).Select(p => p.UserId!.Value).ToList();
        var profilesLookup = await _identityService.GetProfilesByIdsAsync(participantUserIds);

        var paginatedMessages = await _context.ChatMessages.AsNoTracking()
            .Where(m => m.ConversationId == request.ConversationId)
            .OrderByDescending(m => m.Created)
            .PaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);

        var messageDtos = paginatedMessages.Items.Select(m =>
        {
            var senderParticipant = participants.FirstOrDefault(p => p.Id == m.SenderParticipantId);
            var senderProfile = senderParticipant?.UserId != null ? profilesLookup.GetValueOrDefault(senderParticipant.UserId.Value) : null;

            var senderDto = new SenderDto
            {
                Id = senderParticipant?.UserId ?? Guid.Empty,
                DisplayName = senderProfile?.DisplayName ?? "Systeem",
                AvatarUrl = senderProfile?.Avatar?.Url
            };

            return new MessageDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                Sender = senderDto,
                Content = m.Content.Text,
                Type = m.Type,
                Status = m.Status,
                CreatedAt = m.Created,
                ReplyToMessageId = m.ReplyToMessageId,
                IsEdited = m.IsEdited
            };
        }).OrderBy(m => m.CreatedAt).ToList();

        return new PaginatedList<MessageDto>(messageDtos, paginatedMessages.TotalCount, paginatedMessages.PageNumber, paginatedMessages.PageSize);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Queries/GetMyConversationsQuery.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Social.Common;
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Enums.Chat;

namespace RoyalCode.Application.Chat.Queries;

public record GetMyConversationsQuery : IRequest<List<ConversationListItemDto>>;

public class GetMyConversationsQueryHandler : IRequestHandler<GetMyConversationsQuery, List<ConversationListItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public GetMyConversationsQueryHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<List<ConversationListItemDto>> Handle(GetMyConversationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var conversations = await _context.Conversations.AsNoTracking()
            .Where(c => c.Participants.Any(p => p.UserId == userId))
            .Include(c => c.Participants)
            .Include(c => c.Messages.OrderByDescending(m => m.Created).Take(1))
            .OrderByDescending(c => c.LastActivityAt)
            .ToListAsync(cancellationToken);

        var allParticipantUserIds = conversations
            .SelectMany(c => c.Participants)
            .Where(p => p.UserId.HasValue)
            .Select(p => p.UserId!.Value)
            .Distinct()
            .ToList();

        var profilesLookup = await _identityService.GetProfilesByIdsAsync(allParticipantUserIds);

        var dtos = conversations.Select(conv =>
        {
            var currentUserParticipant = conv.Participants.First(p => p.UserId == userId);
            var lastMessage = conv.Messages.FirstOrDefault();

            string name = conv.Title ?? "Gesprek";
            ProfileDto? participantProfile = null;

            if (conv.Type == ConversationType.DirectMessage)
            {
                var otherParticipant = conv.Participants.FirstOrDefault(p => p.UserId != userId && p.IsHuman);
                if (otherParticipant?.UserId != null)
                {
                    participantProfile = profilesLookup.GetValueOrDefault(otherParticipant.UserId.Value);
                    name = participantProfile?.DisplayName ?? "Onbekende Gebruiker";
                }
            }

            return new ConversationListItemDto
            {
                Id = conv.Id,
                Type = conv.Type,
                Name = name,
                AvatarUrl = participantProfile?.Avatar?.Url,
                LastMessageContent = lastMessage?.Content.Text,
                LastMessageTimestamp = lastMessage?.Created,
                UnreadCount = currentUserParticipant.UnreadCount
            };
        }).ToList();

        return dtos;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Queries/GetParticipantsForConversationQuery.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Chat.Queries;

public record GetParticipantsForConversationQuery(Guid ConversationId) : IRequest<List<ParticipantDto>>;

public class GetParticipantsQueryHandler : IRequestHandler<GetParticipantsForConversationQuery, List<ParticipantDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public GetParticipantsQueryHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<List<ParticipantDto>> Handle(GetParticipantsForConversationQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();
        var isMember = await _context.ChatParticipants.AnyAsync(p => p.ConversationId == request.ConversationId && p.UserId == userId, cancellationToken);
        if (!isMember) throw new ForbiddenAccessException("User is not a member of this conversation.");

        var participants = await _context.ChatParticipants
            .Where(p => p.ConversationId == request.ConversationId && p.UserId.HasValue)
            .ToListAsync(cancellationToken);

        var userIds = participants.Select(p => p.UserId!.Value).ToList();
        var profiles = await _identityService.GetProfilesByIdsAsync(userIds);

        return participants.Select(p =>
        {
            var profile = profiles.GetValueOrDefault(p.UserId!.Value);
            return new ParticipantDto
            {
                UserId = p.UserId!.Value,
                DisplayName = profile?.DisplayName ?? "Onbekende gebruiker",
                AvatarUrl = profile?.Avatar?.Url,
                Role = p.Role
            };
        }).OrderBy(p => p.DisplayName).ToList();
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Chat/Queries/GetSupportConversationsQuery.cs ---
/**
 * @file GetSupportConversationsQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description Query and handler to fetch all active customer support conversations for the admin panel.
 */
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Enums.Chat;

namespace RoyalCode.Application.Chat.Queries;

public record GetSupportConversationsQuery : IRequest<List<ConversationListItemDto>>;

public class GetSupportConversationsQueryHandler : IRequestHandler<GetSupportConversationsQuery, List<ConversationListItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetSupportConversationsQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<List<ConversationListItemDto>> Handle(GetSupportConversationsQuery request, CancellationToken cancellationToken)
    {
        var conversations = await _context.Conversations
            .AsNoTracking()
            .Where(c => c.Type == ConversationType.CustomerSupport && c.IsActive)
            .Include(c => c.Participants)
            .Include(c => c.Messages.OrderByDescending(m => m.Created).Take(1))
            .OrderByDescending(c => c.LastActivityAt)
            .ToListAsync(cancellationToken);

        var customerUserIds = conversations
            .SelectMany(c => c.Participants.Where(p => p.IsHuman).Select(p => p.UserId!.Value))
            .Distinct()
            .ToList();

        var profilesLookup = await _identityService.GetProfilesByIdsAsync(customerUserIds);

        var dtos = conversations.Select(conv =>
        {
            var customerParticipant = conv.Participants.First(p => p.IsHuman);
            var lastMessage = conv.Messages.FirstOrDefault();
            var customerProfile = profilesLookup.GetValueOrDefault(customerParticipant.UserId!.Value);

            return new ConversationListItemDto
            {
                Id = conv.Id,
                Type = conv.Type,
                Name = customerProfile?.DisplayName ?? "Unknown Customer",
                AvatarUrl = customerProfile?.Avatar?.Url,
                LastMessageContent = lastMessage?.Content.Text,
                LastMessageTimestamp = lastMessage?.Created,
                // TODO: UnreadCount voor de admin moet apart berekend worden
                UnreadCount = 0
            };
        }).ToList();

        return dtos;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Checkout/Queries/GetAvailableShippingMethodsQuery.cs ---
/**
 * @file GetAvailableShippingMethodsQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description Query and DTOs to get available shipping methods for the current user's cart and address.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Cart;
using RoyalCode.Domain.Entities.User;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Checkout.Queries;

public record ShippingMethodDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? EstimatedDeliveryTime { get; init; }
    public decimal Cost { get; init; }
}

public record GetAvailableShippingMethodsQuery(Guid UserId, Guid ShippingAddressId) : IRequest<List<ShippingMethodDto>>;

public class GetAvailableShippingMethodsQueryHandler : IRequestHandler<GetAvailableShippingMethodsQuery, List<ShippingMethodDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAvailableShippingMethodsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ShippingMethodDto>> Handle(GetAvailableShippingMethodsQuery request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts
            .AsNoTracking()
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken)
            ?? throw new NotFoundException(nameof(Cart), request.UserId);

        var address = await _context.Addresses
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == request.ShippingAddressId && a.UserId == request.UserId, cancellationToken)
            ?? throw new NotFoundException(nameof(Address), request.ShippingAddressId);

        // --- DE FIX: Haal eerst alle actieve zones op, filter daarna in-memory ---
        // Dit voorkomt de EF Core translatie-fout.
        var allActiveZones = await _context.ShippingZones
            .AsNoTracking()
            .Where(z => z.IsActive)
            .ToListAsync(cancellationToken);

        var applicableZone = allActiveZones
            .FirstOrDefault(z => z.CountryCodes.Contains(address.CountryCode));
        // --- EINDE FIX ---

        if (applicableZone == null)
        {
            return new List<ShippingMethodDto>(); // Geen verzending mogelijk naar dit land
        }

        // Haal de methoden voor deze zone op
        var methods = await _context.ShippingMethods
            .AsNoTracking()
            .Include(m => m.Rates)
            .Where(m => m.IsActive && m.ShippingZoneId == applicableZone.Id)
            .ToListAsync(cancellationToken);

        var availableMethods = new List<ShippingMethodDto>();
        var cartSubtotal = cart.SubTotal;

        foreach (var method in methods)
        {
            var applicableRate = method.Rates.FirstOrDefault(r => r.IsApplicable(cartSubtotal));
            if (applicableRate != null)
            {
                availableMethods.Add(new ShippingMethodDto
                {
                    Id = method.Id,
                    Name = method.Name,
                    Description = method.Description,
                    EstimatedDeliveryTime = method.EstimatedDeliveryTime,
                    Cost = applicableRate.Cost
                });
            }
        }

        return availableMethods.OrderBy(m => m.Cost).ToList();
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Exceptions/BadRequestException.cs ---
/**
 * @file BadRequestException.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description Custom exception for HTTP 400 Bad Request responses with an optional error code.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix InvalidCastException by adding BadRequestException.
 */
using System;

namespace RoyalCode.Application.Common.Exceptions;

public class BadRequestException : Exception
{
    public string? ErrorCode { get; }

    public BadRequestException(string message) : base(message) { }

    public BadRequestException(string message, string errorCode) : base(message)
    {
        ErrorCode = errorCode;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Exceptions/ConflictException.cs ---
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoyalCode.Application.Common.Exceptions;

/// <summary>
/// Exception type for HTTP 409 Conflict responses, now with a structured error code.
/// </summary>
public class ConflictException : Exception
{
    /// <summary>
    /// A machine-readable error code for the client to act upon.
    /// </summary>
    public string ErrorCode { get; }

    public ConflictException(string message, string errorCode) : base(message)
    {
        ErrorCode = errorCode;
    }

    // NIEUW: Constructor met inner exception
    public ConflictException(string message, string errorCode, Exception innerException) : base(message, innerException)
    {
        ErrorCode = errorCode;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Exceptions/ForbiddenAccessException.cs ---
namespace RoyalCode.Application.Common.Exceptions;

/// <summary>
/// Exception type for HTTP 403 Forbidden responses, now with a structured error code.
/// </summary>
public class ForbiddenAccessException : Exception
{
    /// <summary>
    /// A machine-readable error code for the client to act upon.
    /// </summary>
    public string? ErrorCode { get; }

    public ForbiddenAccessException(string message) : base(message) { }

    public ForbiddenAccessException(string message, string errorCode) : base(message)
    {
        ErrorCode = errorCode;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Exceptions/NotFoundException.cs ---
namespace RoyalCode.Application.Common.Exceptions;

/// <summary>
/// Exception type for cases where a specific entity could not be found.
/// This is required by this project's CustomExceptionHandler.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException()
        : base()
    {
    }

    public NotFoundException(string message)
        : base(message)
    {
    }

    public NotFoundException(string message, Exception innerException)
        : base(message, innerException)
    {
    }

    public NotFoundException(string name, object key)
        : base($"Entity \"{name}\" ({key}) was not found.")
    {
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Exceptions/ValidationException.cs ---
/**
 * @file ValidationException.cs (With Error Codes)
 * @Version 2.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Custom validation exception now supporting structured error codes for i18n.
 */
using FluentValidation.Results;

namespace RoyalCode.Application.Common.Exceptions;

public class ValidationException : Exception
{
    public ValidationException()
        : base("One or more validation failures have occurred.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IEnumerable<ValidationFailure> failures)
        : this()
    {
        Errors = failures
            .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
            .ToDictionary(failureGroup => failureGroup.Key, failureGroup => failureGroup.ToArray());
    }

    public IDictionary<string, string[]> Errors { get; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Extensions/PredicateBuilder.cs ---
/**
 * @file PredicateBuilder.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   A utility class for dynamically composing LINQ expression predicates.
 *   Enables the creation of complex WHERE clauses with AND/OR logic that
 *   can be correctly translated by Entity Framework Core.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix "LINQ expression could not be translated" error.
 */
using System.Linq.Expressions;

namespace RoyalCode.Application.Common.Extensions;

public static class PredicateBuilder
{
    public static Expression<Func<T, bool>> True<T>() { return f => true; }
    public static Expression<Func<T, bool>> False<T>() { return f => false; }

    public static Expression<Func<T, bool>> Or<T>(this Expression<Func<T, bool>> expr1, Expression<Func<T, bool>> expr2)
    {
        var invokedExpr = Expression.Invoke(expr2, expr1.Parameters.Cast<Expression>());
        return Expression.Lambda<Func<T, bool>>(Expression.OrElse(expr1.Body, invokedExpr), expr1.Parameters);
    }

    public static Expression<Func<T, bool>> And<T>(this Expression<Func<T, bool>> expr1, Expression<Func<T, bool>> expr2)
    {
        var invokedExpr = Expression.Invoke(expr2, expr1.Parameters.Cast<Expression>());
        return Expression.Lambda<Func<T, bool>>(Expression.AndAlso(expr1.Body, invokedExpr), expr1.Parameters);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Interfaces/IApplicationDbContext.cs ---
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;
using RoyalCode.Domain.Entities;
using RoyalCode.Domain.Entities.Cart;
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Entities.Order;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Entities.Social;
using RoyalCode.Domain.Entities.ToDo;
using RoyalCode.Domain.Entities.User;
using Microsoft.EntityFrameworkCore; // <-- Deze using is nodig voor DbContext en gerelateerde types

namespace RoyalCode.Application.Common.Interfaces;

/// <summary>
/// Defines the contract for the application database context.
/// Exposes aggregate roots, concrete types for querying, and child entities for seeding.
/// </summary>
public interface IApplicationDbContext : IDisposable, IAsyncDisposable // <-- Implementeert nu ook IDisposable/IAsyncDisposable voor Clean Architecture
{
    DatabaseFacade Database { get; }
    // --- AGGREGATE ROOTS ---
    DbSet<ProductBase> Products { get; }
    DbSet<CartBase> Carts { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<AttributeValue> AttributeValues { get; }
    DbSet<MediaBase> Media { get; }
    DbSet<Review> Reviews { get; }
    DbSet<ReviewReply> ReviewReplies { get; }
    DbSet<ReviewHighlightKeyword> ReviewHighlightKeywords { get; }
    DbSet<FeatureRatingKeyword> FeatureRatingKeywords { get; }
    DbSet<ReviewHelpfulVote> HelpfulVotes { get; }
    DbSet<TodoItem> TodoItems { get; }
    DbSet<TodoList> TodoLists { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<CustomAttributeDefinition> CustomAttributeDefinitions { get; }
    DbSet<DisplaySpecificationDefinition> DisplaySpecificationDefinitions { get; }
    DbSet<OrderHistory> OrderHistories { get; }

    // --- SHIPPING DBSETS ---
    DbSet<Domain.Entities.Shipping.ShippingZone> ShippingZones { get; }
    DbSet<Domain.Entities.Shipping.ShippingMethod> ShippingMethods { get; }
    DbSet<Domain.Entities.Shipping.ShippingRate> ShippingRates { get; }
    // --- USER-RELATED ENTITIES ---
    DbSet<Address> Addresses { get; }
    DbSet<Wishlist> Wishlists { get; }
    DbSet<WishlistItem> WishlistItems { get; }

    // --- CHAT DBSETS ---
    DbSet<Conversation> Conversations { get; }
    DbSet<Participant> ChatParticipants { get; }
    DbSet<Message> ChatMessages { get; }
    DbSet<AIPersona> AiPersonas { get; }

    // --- NIEUWE SOCIAL FEED DBSETS ---
    DbSet<FeedDefinition> FeedDefinitions { get; }
    DbSet<FeedItem> FeedItems { get; }
    DbSet<FeedReply> FeedReplies { get; }
    DbSet<FeedReaction> FeedReactions { get; }
    DbSet<ProductCategory> ProductCategories { get; }


    // --- CONCRETE TYPES FOR QUERIES ONLY ---
    DbSet<PhysicalProduct> PhysicalProducts { get; }
    DbSet<DigitalProduct> DigitalProducts { get; }
    DbSet<VirtualGameItemProduct> VirtualGameItemProducts { get; }
    DbSet<ServiceProduct> ServiceProducts { get; }
    DbSet<ImageMedia> ImageMedia { get; }
    DbSet<VideoMedia> VideoMedia { get; }

    // --- CHILD ENTITIES (Exposed for seeding and advanced queries) ---
    DbSet<ProductAttributeAssignment> ProductAttributeAssignments { get; }
    DbSet<ProductVariantCombination> ProductVariantCombinations { get; }
    DbSet<ImageVariant> ImageVariants { get; }

    // --- DE FIX: Declareer Entry<TEntity> methode in de interface ---
    EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class;
    ChangeTracker ChangeTracker { get; }


    // --- DE FIX: Methode signature met Dapper's DynamicParameters compatibiliteit ---
    Task<List<Guid>> GetProductIdsMatchingCustomAttributesAsync(Dictionary<string, string> customFilters, CancellationToken cancellationToken);


    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Interfaces/IBindableFromHttp.cs ---
/**
 * @file IBindableFromHttp.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description Marker interface for query objects that support custom binding from HttpContext in Minimal APIs.
 */
namespace RoyalCode.Application.Common.Interfaces;

public interface IBindableFromHttp<T> where T : class
{
    // Deze methode wordt door de Minimal API binder gebruikt.
    // De implementatie in de record zelf moet static zijn.
    // static abstract ValueTask<T?> BindAsync(HttpContext context);
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Interfaces/IChatClient.cs ---
/**
 * @file IChatClient.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Defines the strongly-typed client-side methods that the ChatHub can invoke.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Implement SignalR for real-time chat.
 */
using RoyalCode.Application.Chat.Common;

namespace RoyalCode.Application.Common.Interfaces;

public interface IChatClient
{
    /// <summary>
    /// De server roept deze methode aan op de client om een nieuw bericht af te leveren.
    /// </summary>
    /// <param name="message">Het nieuwe bericht</param>
    Task ReceiveMessage(MessageDto message);
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Interfaces/IChatNotificationService.cs ---
using RoyalCode.Application.Chat.Common;

namespace RoyalCode.Application.Common.Interfaces;

public interface IChatNotificationService
{
    Task BroadcastMessageAsync(MessageDto message, List<string> recipientUserIds);
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Interfaces/IFileStorageService.cs ---
/**
 * @file IFileStorageService.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-26
 * @Description Defines the contract for a service that handles file storage operations,
 *              such as uploading files and returning their accessible URL.
 */
namespace RoyalCode.Application.Common.Interfaces;

/// <summary>
/// Provides an abstraction for file storage operations.
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Asynchronously uploads a file from a stream to the configured storage provider.
    /// </summary>
    /// <param name="fileStream">The stream containing the file data.</param>
    /// <param name="fileName">The original name of the file, used to determine the file extension.</param>
    /// <param name="contentType">The MIME type of the file.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A Task that represents the asynchronous operation. The task result contains the public URL of the uploaded file.</returns>
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken);

    /// <summary>
    /// Asynchronously deletes a file from the configured storage provider.
    /// </summary>
    /// <param name="fileUrl">The public (or relative) URL of the file to be deleted.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A Task that represents the asynchronous operation.</returns>
    Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken);
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Interfaces/IIdentityService.cs ---
/**
 * @file IIdentityService.cs (Definitive & SuperAdmin Ready)
 * @Version 5.1.0 (With Stats Method)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description The definitive interface for all identity operations, now including
 *              a dedicated method for statistical queries like counting new users.
 */
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Social.Common;
using RoyalCode.Application.Users.Admin.Common;
using RoyalCode.Application.Users.Queries; // Voor MyProfileDetailsDto

namespace RoyalCode.Application.Common.Interfaces;

public interface IIdentityService
{
    // === GROUP: CORE USER OPERATIONS ===
    Task<string?> GetUserNameAsync(Guid userId);
    Task<string?> GetUserFullNameAsync(Guid userId);
    Task<string?> GetUserEmailAsync(Guid userId);
    Task<(Result Result, Guid UserId)> CreateUserAsync(string userName, string password);
    Task<bool> DoesUserExistAsync(Guid userId);
    Task<Dictionary<Guid, ProfileDto>> GetProfilesByIdsAsync(IEnumerable<Guid> userIds);
    Task<Result> UpdateUserAvatarAsync(Guid userId, Guid? avatarMediaId);

    // === GROUP: USER SELF-SERVICE ACCOUNT MANAGEMENT ===
    Task<MyProfileDetailsDto?> GetMyProfileDetailsAsync(Guid userId);
    Task<Result> UpdateMyProfileDetailsAsync(Guid userId, string firstName, string? middleName, string lastName, string displayName, string? bio);
    Task<Result> ChangeUserPasswordAsync(Guid userId, string currentPassword, string newPassword);
    Task<bool> CheckUserPasswordAsync(Guid userId, string password);

    // === GROUP: USER SETTINGS & DATA VERSIONING ===
    Task<string?> GetUserSettingsJsonAsync(Guid userId);
    Task<Result> UpdateUserSettingsJsonAsync(Guid userId, string json);
    Task IncrementUserDataVersionAsync(Guid userId, UserDataAggregate aggregate);
    Task<long> GetUserDataVersionAsync(Guid userId, UserDataAggregate aggregate);

    // === GROUP: AUTHORIZATION & ROLES ===
    Task<bool> IsInRoleAsync(Guid userId, string role);
    Task<bool> AuthorizeAsync(Guid userId, string policyName);
    Task<List<string>> GetAllRolesAsync();
    Task<Result> DeleteRoleAsync(Guid roleId);
    Task<bool> IsRoleAssignedToUsersAsync(string roleName);

    // === GROUP: PERMISSION MANAGEMENT ===
    Task<List<PermissionDto>> GetAllPermissionsAsync();
    Task<List<PermissionDto>> GetPermissionsForRoleAsync(Guid roleId);
    Task<Result> UpdatePermissionsForRoleAsync(Guid roleId, IEnumerable<string> permissionValues);

    // === GROUP: ADMIN USER MANAGEMENT ===
    Task<(Result Result, Guid UserId)> CreateUserAsync(string email, string? displayName, string password, string? firstName, string? middleName, string? lastName, string? bio, IReadOnlyCollection<string> roles);
    Task<Result> UpdateUserAsync(Guid userId, string? displayName, string? firstName, string? lastName, string? bio, IReadOnlyCollection<string> roles, Guid requestingUserId);
    Task<PaginatedList<AdminUserListItemDto>> GetUsersAsync(int pageNumber, int pageSize, string? searchTerm, string? role);
    Task<AdminUserDetailDto?> GetUserByIdAsync(Guid userId);
    Task<Result> LockUserAsync(Guid userId, DateTimeOffset? lockoutEnd, Guid requestingUserId);
    Task<Result> UnlockUserAsync(Guid userId, Guid requestingUserId);
    Task<Result> SetUserPasswordAsync(Guid userId, string newPassword, Guid requestingUserId);
    Task<Result> DeleteUserAsync(Guid userId, Guid requestingUserId);

    // === GROUP: STATISTICS & REPORTING ===
    Task<int> GetNewUserCountInPeriodAsync(DateTimeOffset startDate, DateTimeOffset endDate);
}

public enum UserDataAggregate
{
    Addresses,
    Settings,
    Profile,
    Stats,
    Inventory
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Interfaces/ITokenService.cs ---
/**
 * @file ITokenService.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-05
 * @Description Defines the contract for a service that generates JWT access and refresh tokens.
 */
using System.Security.Claims;
using RoyalCode.Domain.Entities;

namespace RoyalCode.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(IEnumerable<Claim> claims);
    RefreshToken GenerateRefreshToken(Guid userId);
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Interfaces/IUser.cs ---
namespace RoyalCode.Application.Common.Interfaces;

public interface IUser
{
    Guid? Id { get; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Interfaces/IUserQueryService.cs ---
namespace RoyalCode.Application.Common.Interfaces;

// Een DTO specifiek voor de lookup-resultaten
public record UserLookupDto
{
    public Guid Id { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
}

/// <summary>
/// Defines a contract for querying user information from the Application layer
/// without depending on the Infrastructure layer.
/// </summary>
public interface IUserQueryService
{
    /// <summary>
    /// Finds a list of users based on a search term for typeahead/lookup scenarios.
    /// </summary>
    /// <param name="searchTerm">The term to search for in user names and emails.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of simplified user DTOs.</returns>
    Task<List<UserLookupDto>> FindUsersAsync(string? searchTerm, CancellationToken cancellationToken);

    /// <summary>
    /// Finds a list of user IDs based on a search term.
    /// </summary>
    /// <param name="searchTerm">The term to search for in user names.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A list of user Guids that match the search term.</returns>
    Task<List<Guid>> FindUserIdsBySearchTermAsync(string searchTerm, CancellationToken cancellationToken);
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Mappings/MappingExtensions.cs ---
using RoyalCode.Application.Common.Models;

namespace RoyalCode.Application.Common.Mappings;
public static class MappingExtensions
{
    public static Task<PaginatedList<TDestination>> PaginatedListAsync<TDestination>(this IQueryable<TDestination> queryable, int pageNumber, int pageSize, CancellationToken cancellationToken = default) where TDestination : class
        => PaginatedList<TDestination>.CreateAsync(queryable.AsNoTracking(), pageNumber, pageSize, cancellationToken);

    public static Task<List<TDestination>> ProjectToListAsync<TDestination>(this IQueryable queryable, IConfigurationProvider configuration, CancellationToken cancellationToken = default) where TDestination : class
        => queryable.ProjectTo<TDestination>(configuration).AsNoTracking().ToListAsync(cancellationToken);
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Models/LookupDto.cs ---
using RoyalCode.Domain.Entities.ToDo;

namespace RoyalCode.Application.Common.Models;
public class LookupDto
{
    public int Id { get; init; }

    public string? Title { get; init; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Models/MediaDtos.cs ---
/**
 * @file MediaDtos.cs
 * @Version 1.1.0 (Mapping Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-26
 * @Description Centralized Data Transfer Objects for all Media types, now with AutoMapper profiles.
 */
using RoyalCode.Application.Media.Queries.GetTagsForMedia;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Enums.Media;

namespace RoyalCode.Application.Common.Models;

/// <summary>
/// Base DTO for all media types. Serves as a polymorphic base.
/// </summary>
public abstract class MediaDto
{
    public Guid Id { get; init; }
    public MediaType Type { get; init; }
    public string? Title { get; init; }
    public string Url { get; init; } = string.Empty;
    public string? ThumbnailUrl { get; init; }
    public IReadOnlyCollection<MediaTagDto> Tags { get; set; } = new List<MediaTagDto>();
}


/// <summary>
/// DTO for image media, with image-specific properties.
/// </summary>
public class ImageMediaDto : MediaDto
{
    public string? AltText { get; init; }
    public ImageSourceType? SourceType { get; init; }
    public IReadOnlyCollection<ImageVariantDto> Variants { get; init; } = new List<ImageVariantDto>();
}

/// <summary>
/// DTO for video media, with video-specific properties.
/// </summary>
public class VideoMediaDto : MediaDto
{
    public int? DurationSeconds { get; init; }
    public string? PosterImageUrl { get; init; }
}

/// <summary>
/// DTO for a specific variant of an image.
/// </summary>
public class ImageVariantDto
{
    public Guid Id { get; init; }
    public string Url { get; init; } = string.Empty;
    public int? Width { get; init; }
    public int? Height { get; init; }
    public string? Format { get; init; }
    public string? Purpose { get; init; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Models/PaginatedList.cs ---
namespace RoyalCode.Application.Common.Models;

public class PaginatedList<T>
{
    public IReadOnlyCollection<T> Items { get; }
    public int PageNumber { get; }
    public int PageSize { get; } // <-- VOEG DEZE PROPERTY TOE
    public int TotalPages { get; }
    public int TotalCount { get; }

    public PaginatedList(IReadOnlyCollection<T> items, int count, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber;
        PageSize = pageSize; // <-- SET DE WAARDE IN DE CONSTRUCTOR
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalCount = count;
        Items = items;
    }

    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public static async Task<PaginatedList<T>> CreateAsync(IQueryable<T> source, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var count = await source.CountAsync(cancellationToken);
        var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PaginatedList<T>(items, count, pageNumber, pageSize);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Models/Result.cs ---
/**
 * @file Result.cs (With Error Codes)
 * @Version 2.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Generic result class now supporting a list of error codes for i18n.
 */
namespace RoyalCode.Application.Common.Models;

public class Result
{
    internal Result(bool succeeded, IEnumerable<string> errors, IEnumerable<string>? errorCodes = null)
    {
        Succeeded = succeeded;
        Errors = errors.ToArray();
        ErrorCodes = errorCodes?.ToArray() ?? Array.Empty<string>();
    }

    public bool Succeeded { get; init; }
    public string[] Errors { get; init; }
    public string[] ErrorCodes { get; init; }

    public static Result Success()
    {
        return new Result(true, Array.Empty<string>());
    }

    public static Result Failure(IEnumerable<string> errors)
    {
        return new Result(false, errors, Array.Empty<string>());
    }

    public static Result Failure(IEnumerable<string> errors, IEnumerable<string> errorCodes)
    {
        return new Result(false, errors, errorCodes);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Security/AuthorizeAttribute.cs ---
namespace RoyalCode.Application.Common.Security;

/// <summary>
/// Specifies the class this attribute is applied to requires authorization.
/// </summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
public class AuthorizeAttribute : Attribute
{
    /// <summary>
    /// Initializes a new instance of the <see cref="AuthorizeAttribute"/> class. 
    /// </summary>
    public AuthorizeAttribute() { }

    /// <summary>
    /// Gets or sets a comma delimited list of roles that are allowed to access the resource.
    /// </summary>
    public string Roles { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the policy name that determines access to the resource.
    /// </summary>
    public string Policy { get; set; } = string.Empty;
}
--- END OF FILE ---

--- START OF FILE src/Application/Dashboard/Common/DashboardDtos.cs ---
/**
 * @file DashboardDtos.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Centralized DTOs for the Admin Dashboard feature.
 */
namespace RoyalCode.Application.Dashboard.Common;

public record KpiDto<T>
{
    public T Value { get; init; } = default!;
    public decimal ChangePercentage { get; init; }
}

public record AdminDashboardStatsDto
{
    public KpiDto<decimal> TotalRevenue { get; init; } = null!;
    public KpiDto<int> TotalSales { get; init; } = null!;
    public KpiDto<int> NewCustomers { get; init; } = null!;
    public int PendingReviewsCount { get; init; }
}

public record RevenueDataPointDto
{
    public string Date { get; init; } = string.Empty; // Format: "yyyy-MM-dd"
    public decimal Revenue { get; init; }
}

public record AdminRevenueChartDto
{
    public string Period { get; init; } = "last_30_days";
    public List<RevenueDataPointDto> DataPoints { get; init; } = new();
}

public record AdminBestsellerDto
{
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? Sku { get; init; }
    public int UnitsSold { get; init; }
    public decimal TotalRevenue { get; init; }
    public string? ThumbnailUrl { get; init; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Dashboard/Queries/GetAdminBestsellersQuery.cs ---
/**
 * @file GetAdminBestsellersQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Query and handler to retrieve a list of best-selling products for the admin dashboard.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Dashboard.Common;
using RoyalCode.Domain.Entities.Product;

namespace RoyalCode.Application.Dashboard.Queries;

public record GetAdminBestsellersQuery(int Limit = 5) : IRequest<List<AdminBestsellerDto>>;

public class GetAdminBestsellersQueryHandler : IRequestHandler<GetAdminBestsellersQuery, List<AdminBestsellerDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAdminBestsellersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdminBestsellerDto>> Handle(GetAdminBestsellersQuery request, CancellationToken cancellationToken)
    {
        // Stap 1: Aggregeer verkoopdata uit OrderItems
        var bestsellersData = await _context.OrderItems
            .GroupBy(oi => oi.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                UnitsSold = g.Sum(oi => oi.Quantity),
                TotalRevenue = g.Sum(oi => oi.LineTotal)
            })
            .OrderByDescending(x => x.TotalRevenue)
            .Take(request.Limit)
            .ToListAsync(cancellationToken);

        if (!bestsellersData.Any())
        {
            return new List<AdminBestsellerDto>();
        }

        var productIds = bestsellersData.Select(b => b.ProductId).ToList();

        // Stap 2: Verrijk met productinformatie
        var products = await _context.Products.OfType<PhysicalProduct>()
            .Where(p => productIds.Contains(p.Id))
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Sku,
                FirstMediaId = p.MediaIds.Any() ? (Guid?)p.MediaIds.First() : null
            })
            .ToDictionaryAsync(p => p.Id, p => p, cancellationToken);

        var mediaIds = products.Values.Where(p => p.FirstMediaId.HasValue).Select(p => p.FirstMediaId!.Value).ToList();
        var mediaThumbnails = await _context.Media
            .Where(m => mediaIds.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id, m => m.ThumbnailUrl ?? m.Url, cancellationToken);

        // Stap 3: Combineer en retourneer de DTO's
        return bestsellersData.Select(b =>
        {
            var productInfo = products.GetValueOrDefault(b.ProductId);
            var thumbnailUrl = productInfo?.FirstMediaId.HasValue == true
                ? mediaThumbnails.GetValueOrDefault(productInfo.FirstMediaId.Value)
                : null;

            return new AdminBestsellerDto
            {
                ProductId = b.ProductId,
                ProductName = productInfo?.Name ?? "Unknown Product",
                Sku = productInfo?.Sku,
                UnitsSold = b.UnitsSold,
                TotalRevenue = b.TotalRevenue,
                ThumbnailUrl = thumbnailUrl
            };
        }).ToList();
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Dashboard/Queries/GetAdminDashboardStatsQuery.cs ---
/**
 * @file GetAdminDashboardStatsQuery.cs
 * @Version 1.1.0 (Clean Architecture Compliant)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Query and handler to retrieve aggregated KPI statistics for the admin dashboard.
 *              Now fully compliant with Clean Architecture by using IIdentityService.
 */
using Microsoft.Extensions.Logging;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Dashboard.Common;
using RoyalCode.Domain.Enums;
using RoyalCode.Domain.Enums.Review;

namespace RoyalCode.Application.Dashboard.Queries;

public record GetAdminDashboardStatsQuery : IRequest<AdminDashboardStatsDto>;

public class GetAdminDashboardStatsQueryHandler : IRequestHandler<GetAdminDashboardStatsQuery, AdminDashboardStatsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService; // GEWIJZIGD: Geen UserManager meer
    private readonly ILogger<GetAdminDashboardStatsQueryHandler> _logger;

    public GetAdminDashboardStatsQueryHandler(IApplicationDbContext context, IIdentityService identityService, ILogger<GetAdminDashboardStatsQueryHandler> logger) // GEWIJZIGD
    {
        _context = context;
        _identityService = identityService; // GEWIJZIGD
        _logger = logger;
    }

    public async Task<AdminDashboardStatsDto> Handle(GetAdminDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Calculating admin dashboard statistics...");

        var endDate = DateTimeOffset.UtcNow;
        var startDate30Days = endDate.AddDays(-30);
        var startDate60Days = endDate.AddDays(-60);

        var validOrderStatuses = new[] { OrderStatus.Completed, OrderStatus.Shipped, OrderStatus.Delivered, OrderStatus.Processing, OrderStatus.AwaitingFulfillment };

        // --- Revenue and Sales ---
        var ordersLast30Days = await _context.Orders
            .Where(o => o.OrderDate >= startDate30Days && validOrderStatuses.Contains(o.Status))
            .Select(o => new { o.GrandTotal })
            .ToListAsync(cancellationToken);

        var orders31to60Days = await _context.Orders
            .Where(o => o.OrderDate >= startDate60Days && o.OrderDate < startDate30Days && validOrderStatuses.Contains(o.Status))
            .Select(o => new { o.GrandTotal })
            .ToListAsync(cancellationToken);

        var currentRevenue = ordersLast30Days.Sum(o => o.GrandTotal);
        var previousRevenue = orders31to60Days.Sum(o => o.GrandTotal);

        // --- New Customers (GEWIJZIGD) ---
        var newCustomersLast30Days = await _identityService.GetNewUserCountInPeriodAsync(startDate30Days, endDate);
        var newCustomers31to60Days = await _identityService.GetNewUserCountInPeriodAsync(startDate60Days, startDate30Days);

        // --- Pending Reviews ---
        var pendingReviewsCount = await _context.Reviews.CountAsync(r => r.Status == ReviewStatus.Pending, cancellationToken);

        _logger.LogInformation("Statistics calculated successfully.");

        return new AdminDashboardStatsDto
        {
            TotalRevenue = new KpiDto<decimal> { Value = currentRevenue, ChangePercentage = CalculateChangePercentage(currentRevenue, previousRevenue) },
            TotalSales = new KpiDto<int> { Value = ordersLast30Days.Count, ChangePercentage = CalculateChangePercentage(ordersLast30Days.Count, orders31to60Days.Count) },
            NewCustomers = new KpiDto<int> { Value = newCustomersLast30Days, ChangePercentage = CalculateChangePercentage(newCustomersLast30Days, newCustomers31to60Days) },
            PendingReviewsCount = pendingReviewsCount
        };
    }

    private decimal CalculateChangePercentage(decimal current, decimal previous)
    {
        if (previous == 0) return current > 0 ? 100.0m : 0.0m;
        return Math.Round(((current - previous) / previous) * 100, 1);
    }

    private decimal CalculateChangePercentage(int current, int previous)
    {
        return CalculateChangePercentage((decimal)current, (decimal)previous);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Dashboard/Queries/GetAdminRevenueChartQuery.cs ---
/**
 * @file GetAdminRevenueChartQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Query and handler to retrieve time-series revenue data for the admin dashboard chart.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Dashboard.Common;
using RoyalCode.Domain.Enums;

namespace RoyalCode.Application.Dashboard.Queries;

public record GetAdminRevenueChartQuery(int Days = 30) : IRequest<AdminRevenueChartDto>;

public class GetAdminRevenueChartQueryHandler : IRequestHandler<GetAdminRevenueChartQuery, AdminRevenueChartDto>
{
    private readonly IApplicationDbContext _context;

    public GetAdminRevenueChartQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminRevenueChartDto> Handle(GetAdminRevenueChartQuery request, CancellationToken cancellationToken)
    {
        var endDate = DateTimeOffset.UtcNow.Date; // Dit retourneert een DateTimeOffset met tijd op middernacht
        var startDate = endDate.AddDays(-request.Days + 1); // Bereken de startdatum als DateTimeOffset

        var validOrderStatuses = new[] { OrderStatus.Completed, OrderStatus.Shipped, OrderStatus.Delivered, OrderStatus.Processing, OrderStatus.AwaitingFulfillment };

        var dailyRevenue = await _context.Orders
            .Where(o => o.OrderDate.Date >= startDate && o.OrderDate.Date <= endDate && validOrderStatuses.Contains(o.Status))
            .GroupBy(o => o.OrderDate.Date)
            .Select(g => new { Date = g.Key, TotalRevenue = g.Sum(o => o.GrandTotal) })
            .ToDictionaryAsync(x => x.Date, x => x.TotalRevenue, cancellationToken);

        var dataPoints = new List<RevenueDataPointDto>();
        for (var date = startDate; date <= endDate; date = date.AddDays(1)) // Increment met DateTimeOffset
        {
            dataPoints.Add(new RevenueDataPointDto
            {
                Date = date.ToString("yyyy-MM-dd"),
                Revenue = dailyRevenue.GetValueOrDefault(date, 0m) // Gebruik de DateTimeOffset 'date' als sleutel
            });
        }

        return new AdminRevenueChartDto
        {
            Period = $"last_{request.Days}_days",
            DataPoints = dataPoints
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/DependencyInjection.cs ---
using System.Reflection;
using Microsoft.Extensions.Hosting;
using RoyalCode.Application.Common.Behaviours;

namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyInjection
{
    public static void AddApplicationServices(this IHostApplicationBuilder builder)
    {

        builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        builder.Services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(UnhandledExceptionBehaviour<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(AuthorizationBehaviour<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(PerformanceBehaviour<,>));
        });
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Media/Commands/DeleteMedia/DeleteMedia.cs ---
/**
 * @file DeleteMedia.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-26
 * @Description Defines the use case (command and handler) for deleting a media item,
 *              including authorization checks and physical file deletion.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Media.Commands.DeleteMedia;

/// <summary>
/// Command to delete a media item by its unique identifier.
/// </summary>
public record DeleteMediaCommand(Guid Id) : IRequest;

/// <summary>
/// Handles the logic for the DeleteMediaCommand.
/// </summary>
public class DeleteMediaCommandHandler : IRequestHandler<DeleteMediaCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;
    private readonly IFileStorageService _fileStorageService;

    public DeleteMediaCommandHandler(IApplicationDbContext context, IUser user, IFileStorageService fileStorageService)
    {
        _context = context;
        _user = user;
        _fileStorageService = fileStorageService;
    }

    public async Task Handle(DeleteMediaCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Media
            .FindAsync(new object[] { request.Id }, cancellationToken);

        // Guard Clause: Zorg ervoor dat de entiteit bestaat.
        Guard.Against.NotFound(request.Id, entity);

        var userId = _user.Id ?? throw new UnauthorizedAccessException("User ID could not be determined.");

        // Autorisatie Guard: Zorg ervoor dat de gebruiker de eigenaar is.
        // TODO: Voeg later een check toe voor 'Administrator' rol.
        if (entity.UploaderUserId != userId)
        {
            throw new ForbiddenAccessException("User does not have the required role.");
        }

        // Bewaar de URL voordat de entiteit uit de context wordt verwijderd.
        var fileUrlToDelete = entity.Url;

        // Verwijder de entiteit uit de database context.
        _context.Media.Remove(entity);

        // Sla de wijzigingen in de database op.
        await _context.SaveChangesAsync(cancellationToken);

        // Nadat de DB-operatie succesvol is, verwijder het fysieke bestand.
        await _fileStorageService.DeleteFileAsync(fileUrlToDelete, cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Media/Commands/UpdateMedia/UpdateMedia.cs ---
/**
 * @file UpdateMedia.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-26
 * @Description Defines the use case (command, validator, handler) for updating media metadata.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Media;

namespace RoyalCode.Application.Media.Commands.UpdateMedia;

/// <summary>
/// Command to update the metadata of an existing media item.
/// Properties are nullable to allow for partial updates.
/// </summary>
public record UpdateMediaCommand : IRequest
{
    public Guid Id { get; init; }
    public string? Title { get; init; }
    public string? Description { get; init; }
    // Image-specific properties
    public string AltText { get; init; } = string.Empty;
}

public class UpdateMediaCommandValidator : AbstractValidator<UpdateMediaCommand>
{
    public UpdateMediaCommandValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.Title).MaximumLength(255).When(v => v.Title != null);
        RuleFor(v => v.AltText).MaximumLength(500).When(v => v.AltText != null);
    }
}

/// <summary>
/// Handles the logic for the UpdateMediaCommand.
/// </summary>
public class UpdateMediaCommandHandler : IRequestHandler<UpdateMediaCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public UpdateMediaCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(UpdateMediaCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Media
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        var userId = _user.Id ?? throw new UnauthorizedAccessException("User ID could not be determined.");
        if (entity.UploaderUserId != userId)
        {
            throw new ForbiddenAccessException("User does not have the required role.");
        }

        // Roep de domeinmethodes aan om de entiteit te updaten
        entity.UpdateMetadata(request.Title, request.Description);

        // Als het een afbeelding is, update dan ook de afbeelding-specifieke metadata
        if (entity is ImageMedia imageEntity)
        {
            imageEntity.UpdateAltText(request.AltText);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Media/Commands/UploadImage/UploadImage.cs ---
/**
 * @file UploadImage.cs
 * @Version 3.0.0 (Robust & Defensive)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Definitive, robust version of the image upload use case.
 *              The validator now correctly enforces non-empty alt text, and the
 *              handler is architecturally sound, preventing HTTP 500 errors.
 */
using Microsoft.Extensions.Logging;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Media.Queries.GetTagsForMedia;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Enums.Media;

namespace RoyalCode.Application.Media.Commands.UploadImage;

public record UploadImageCommand : IRequest<UploadImageResponseDto>
{
    public Stream FileStream { get; init; } = null!;
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long FileSize { get; init; }
    public string? Title { get; init; }
    public string AltText { get; init; } = string.Empty;
}

/// <summary>
/// Validator die nu robuust de input controleert, inclusief de verplichte AltText.
/// Een falende validatie hier resulteert in een correcte HTTP 400, geen 500.
/// </summary>
public class UploadImageCommandValidator : AbstractValidator<UploadImageCommand>
{
    public UploadImageCommandValidator()
    {
        RuleFor(x => x.FileStream).NotEmpty();
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(255);
        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("Content type is verplicht.")
            .Must(ct => ct.StartsWith("image/")).WithMessage("Bestand moet een afbeelding zijn.");
        RuleFor(x => x.FileSize)
            .GreaterThan(0).WithMessage("Bestandsgrootte moet groter dan 0 zijn.")
            .LessThan(10 * 1024 * 1024).WithMessage("Bestandsgrootte mag maximaal 10MB zijn.");

        // Dit voorkomt de crash in de domein-entiteit.
        RuleFor(x => x.AltText)
            .NotEmpty().WithMessage("Alternatieve tekst (AltText) is verplicht voor toegankelijkheid.");
    }
}

public class UploadImageCommandHandler : IRequestHandler<UploadImageCommand, UploadImageResponseDto>
{
    private static readonly SemaphoreSlim _uploadSemaphore = new(1, 1); // Max 1 concurrent uploadRetry
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly IUser _user;
    private readonly ILogger<UploadImageCommandHandler> _logger; // Voeg logger toe

    public UploadImageCommandHandler(
        IApplicationDbContext context,
        IFileStorageService fileStorageService,
        IUser user,
        ILogger<UploadImageCommandHandler> logger) // Injecteer logger
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _user = user;
        _logger = logger;
    }

    public async Task<UploadImageResponseDto> Handle(UploadImageCommand request, CancellationToken cancellationToken)
    {
        await _uploadSemaphore.WaitAsync(TimeSpan.FromSeconds(30), cancellationToken);
        try
        {
            _logger.LogInformation("--- UploadImageCommandHandler START --- Request for FileName: {FileName}", request.FileName);

            var uploaderId = _user.Id;
            _logger.LogInformation("Uploader ID determined: {UploaderId}", uploaderId);

            _logger.LogInformation("Attempting to upload file to storage service...");
            string fileUrl;
            using (request.FileStream)
            {
                fileUrl = await _fileStorageService.UploadFileAsync(request.FileStream, request.FileName, request.ContentType, cancellationToken);
            }
            _logger.LogInformation("File successfully uploaded to storage. URL: {FileUrl}", fileUrl);

            var imageEntity = new ImageMedia(
                masterUrl: fileUrl,
                altTextKeyOrText: request.AltText,
                uploaderId: uploaderId,
                titleKeyOrText: request.Title,
                sourceType: ImageSourceType.UserUploaded,
                sizeBytes: request.FileSize,
                mimeType: request.ContentType,
                originalFilename: request.FileName
            );
            imageEntity.SetThumbnail(fileUrl);
            _logger.LogInformation("ImageMedia domain entity created with ID: {ImageId}", imageEntity.Id);

            _context.Media.Add(imageEntity);
            _logger.LogInformation("Adding entity to DbContext...");

            // Add retry logic for database save
            var retryCount = 0;
            while (retryCount < 3)
            {
                try
                {
                    await _context.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("--- UploadImageCommandHandler SUCCESS --- Entity saved to database.");
                    break;
                }
                catch (Exception ex) when (retryCount < 2)
                {
                    _logger.LogWarning(ex, "Database save failed, retry {RetryCount}", retryCount + 1);
                    retryCount++;
                    await Task.Delay(100 * (retryCount + 1), cancellationToken);
                }
            }

            // Create Variants DTO mapping
            var variantsForDto = new List<ImageVariantDto>();
            if (!string.IsNullOrEmpty(imageEntity.Url))
            {
                variantsForDto.Add(new ImageVariantDto
                {
                    Id = Guid.NewGuid(),
                    Url = imageEntity.Url,
                    Purpose = "original"
                });
            }
            if (!string.IsNullOrEmpty(imageEntity.ThumbnailUrl) && imageEntity.ThumbnailUrl != imageEntity.Url)
            {
                variantsForDto.Add(new ImageVariantDto
                {
                    Id = Guid.NewGuid(),
                    Url = imageEntity.ThumbnailUrl,
                    Purpose = "thumbnail"
                });
            }

            return new UploadImageResponseDto
            {
                Id = imageEntity.Id,
                Type = imageEntity.Type,
                Title = imageEntity.TitleKeyOrText,
                Url = imageEntity.Url,
                ThumbnailUrl = imageEntity.ThumbnailUrl,
                AltText = imageEntity.AltTextKeyOrText,
                SourceType = imageEntity.SourceType,
                Tags = new List<MediaTagDto>(),
                Variants = variantsForDto
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CRITICAL ERROR in UploadImageCommandHandler for file {FileName}", request.FileName);
            throw;
        }
        finally
        {
            _uploadSemaphore.Release();
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Media/Commands/UploadImage/UploadImageResponseDto.cs ---
/**
 * @file UploadImageResponseDto.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-26
 * @Description Represents the data returned after a successful image upload.
 *              This is an alias for the more general ImageMediaDto.
 */
using RoyalCode.Application.Common.Models;

namespace RoyalCode.Application.Media.Commands.UploadImage;

/// <summary>
/// Represents the data returned after a successful image upload.
/// We use the existing detailed DTO for this.
/// </summary>
public class UploadImageResponseDto : ImageMediaDto
{
}
--- END OF FILE ---

--- START OF FILE src/Application/Media/Queries/GetMediaById/GetMediaById.cs ---
using System.Linq;
/**
 * @file GetMediaById.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-26
 * @Description Defines the query and handler for fetching a single, detailed media item by its ID.
 */

using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Media.Queries.GetTagsForMedia;
using RoyalCode.Domain.Entities.Media;

namespace RoyalCode.Application.Media.Queries.GetMediaById;

public record GetMediaByIdQuery(Guid Id) : IRequest<MediaDto?>;

public class GetMediaByIdQueryHandler : IRequestHandler<GetMediaByIdQuery, MediaDto?>
{
    private readonly IApplicationDbContext _context;
    // VERWIJDERD: private readonly IMapper _mapper;

    public GetMediaByIdQueryHandler(IApplicationDbContext context) // IMapper verwijderd
    {
        _context = context;
    }

    public async Task<MediaDto?> Handle(GetMediaByIdQuery request, CancellationToken cancellationToken)
    {
        var media = await _context.Media
            .AsNoTracking()
            .Include(m => (m as ImageMedia)!.Variants)
            .Include(m => m.Tags) // Tags includen voor de DTO
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (media == null) return null;

        // MAPPING: Gebruik een switch voor polymorfisme
        MediaDto result = media switch
        {
            ImageMedia image => new ImageMediaDto
            {
                Id = image.Id,
                Type = image.Type,
                Title = image.TitleKeyOrText,
                Url = image.Url,
                ThumbnailUrl = image.ThumbnailUrl,
                Tags = image.Tags.Select(t => new MediaTagDto { Id = t.Id, Name = t.Name, TagType = t.TagType }).ToList(),
                AltText = image.AltTextKeyOrText,
                SourceType = image.SourceType,
                Variants = image.Variants.Select(v => new ImageVariantDto { Id = v.Id, Url = v.Url, Width = v.Width, Height = v.Height, Format = v.Format, Purpose = v.Purpose }).ToList()
            },
            VideoMedia video => new VideoMediaDto
            {
                Id = video.Id,
                Type = video.Type,
                Title = video.TitleKeyOrText,
                Url = video.Url,
                ThumbnailUrl = video.ThumbnailUrl,
                Tags = video.Tags.Select(t => new MediaTagDto { Id = t.Id, Name = t.Name, TagType = t.TagType }).ToList(),
                DurationSeconds = video.DurationSeconds,
                PosterImageUrl = video.PosterImageUrl
            },
            _ => throw new NotImplementedException($"Mapping voor mediatype {media.Type} is niet geïmplementeerd.")
        };

        return result;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Media/Queries/GetMediaByTag/GetMediaByTagQuery.cs ---
/**
 * @file GetMediaByTagQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-30
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Maak een endpoint om media op te halen op basis van een mediatag.
 * @Description Defines the use case for fetching a paginated list of media items
 *              that are associated with a specific tag.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Media.Queries.GetMediaWithPagination;

namespace RoyalCode.Application.Media.Queries.GetMediaByTag;

public record GetMediaByTagQuery : IRequest<PaginatedList<MediaListItemDto>>
{
    public string TagName { get; init; } = string.Empty;
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public class GetMediaByTagQueryHandler : IRequestHandler<GetMediaByTagQuery, PaginatedList<MediaListItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMediaByTagQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<MediaListItemDto>> Handle(GetMediaByTagQuery request, CancellationToken cancellationToken)
    {
        var normalizedTag = request.TagName.Trim().ToLowerInvariant();

        var query = _context.Media.AsNoTracking()
            .Where(m => m.Tags.Any(t => t.Name == normalizedTag))
            .OrderByDescending(m => m.Created)
            .Select(m => new MediaListItemDto // Handmatige mapping
            {
                Id = m.Id,
                Type = m.Type,
                Title = m.TitleKeyOrText,
                Url = m.Url,
                ThumbnailUrl = m.ThumbnailUrl,
                MimeType = m.MimeType,
                UploaderUserId = m.UploaderUserId,
                Created = m.Created
            });

        return await PaginatedList<MediaListItemDto>.CreateAsync(query, request.PageNumber, request.PageSize, cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Media/Queries/GetMediaForProductAttribute/GetMediaForProductAttributeQuery.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Application/Media/Queries/GetMediaForProductAttribute/GetMediaForProductAttributeQuery.cs ---
/**
 * @file GetMediaForProductAttributeQuery.cs
 * @Version 2.0.0 (Definitive Mapperless)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description Definitive, mapperless version of fetching media for a product attribute.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Media.Queries.GetTagsForMedia; // For MediaTagDto
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Entities.Product;
using System.Linq;

namespace RoyalCode.Application.Media.Queries.GetMediaForProductAttribute;

public record GetMediaForProductAttributeQuery : IRequest<List<MediaDto>>
{
    public Guid ProductId { get; init; }
    public Guid AttributeValueId { get; init; }
}

public class GetMediaForProductAttributeQueryValidator : AbstractValidator<GetMediaForProductAttributeQuery>
{
    public GetMediaForProductAttributeQueryValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.AttributeValueId).NotEmpty();
    }
}

public class GetMediaForProductAttributeQueryHandler : IRequestHandler<GetMediaForProductAttributeQuery, List<MediaDto>>
{
    private readonly IApplicationDbContext _context;

    // De IMapper afhankelijkheid is nu verwijderd uit de constructor.
    public GetMediaForProductAttributeQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MediaDto>> Handle(GetMediaForProductAttributeQuery request, CancellationToken cancellationToken)
    {
        var productMediaIds = await _context.Products
            .AsNoTracking()
            .Where(p => p.Id == request.ProductId)
            .Select(p => p.MediaIds)
            .FirstOrDefaultAsync(cancellationToken);
        Guard.Against.NotFound(request.ProductId, productMediaIds);

        var attributeValue = await _context.AttributeValues
            .AsNoTracking()
            .FirstOrDefaultAsync(av => av.Id == request.AttributeValueId, cancellationToken);
        Guard.Against.NotFound(request.AttributeValueId, attributeValue);

        var tagToFind = $"color:{attributeValue.Value.ToLowerInvariant()}";

        var mediaEntities = await _context.Media
            .AsNoTracking()
            .Where(m => productMediaIds.Contains(m.Id) && m.Tags.Any(t => t.Name == tagToFind))
            .Include(m => (m as ImageMedia)!.Variants)
            .Include(m => m.Tags)
            .ToListAsync(cancellationToken);

        // Handmatige, polymorfe mapping van domein-entiteiten naar DTO's.
        return mediaEntities.Select(media =>
        {
            // Omdat de return type List<MediaDto> is, kunnen we instances van de afgeleide DTO's teruggeven.
            return media switch
            {
                ImageMedia image => new ImageMediaDto
                {
                    Id = image.Id,
                    Type = image.Type,
                    Title = image.TitleKeyOrText,
                    Url = image.Url,
                    ThumbnailUrl = image.ThumbnailUrl,
                    Tags = image.Tags.Select(t => new MediaTagDto { Id = t.Id, Name = t.Name, TagType = t.TagType }).ToList(),
                    AltText = image.AltTextKeyOrText,
                    SourceType = image.SourceType,
                    Variants = image.Variants.Select(v => new ImageVariantDto { Id = v.Id, Url = v.Url, Width = v.Width, Height = v.Height, Format = v.Format, Purpose = v.Purpose }).ToList()
                },
                VideoMedia video => new VideoMediaDto
                {
                    Id = video.Id,
                    Type = video.Type,
                    Title = video.TitleKeyOrText,
                    Url = video.Url,
                    ThumbnailUrl = video.ThumbnailUrl,
                    Tags = video.Tags.Select(t => new MediaTagDto { Id = t.Id, Name = t.Name, TagType = t.TagType }).ToList(),
                    DurationSeconds = video.DurationSeconds,
                    PosterImageUrl = video.PosterImageUrl
                },
                _ => (MediaDto)null!
            };
        }).Where(dto => dto != null).ToList();
    }
}
// --- EINDE VERVANGING ---
--- END OF FILE ---

--- START OF FILE src/Application/Media/Queries/GetMediaForProductVariant/GetMediaForProductVariantQuery.cs ---
/**
 * @file GetMediaForProductVariantQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-05
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Hoe lossen we media op voor generieke varianten?
 * @Description Defines the query and handler for fetching media for a specific product variant,
 *              using a generic, tag-based approach instead of hardcoding for color.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;
using System.Linq;

namespace RoyalCode.Application.Media.Queries.GetMediaForProductVariant;

public record GetMediaForProductVariantQuery(Guid ProductId, Guid VariantId) : IRequest<List<MediaDto>>;

public class GetMediaForProductVariantQueryHandler : IRequestHandler<GetMediaForProductVariantQuery, List<MediaDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMediaForProductVariantQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MediaDto>> Handle(GetMediaForProductVariantQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.Products.AsNoTracking()
            .Include(p => p.VariantCombinations)
            .Include(p => p.AttributeAssignments).ThenInclude(paa => paa.AttributeValue)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);
        Guard.Against.NotFound(request.ProductId, product);

        var variant = product.VariantCombinations.FirstOrDefault(v => v.Id == request.VariantId);
        Guard.Against.NotFound(request.VariantId, variant);

        var visualAttributeValue = product.AttributeAssignments
            .Where(paa => variant.AttributeValueIds.Contains(paa.AttributeValueId))
            .Select(paa => paa.AttributeValue)
            .FirstOrDefault(av => av.AttributeType == VariantAttributeType.Color);

        var mediaQuery = _context.Media.AsNoTracking().Where(m => product.MediaIds.Contains(m.Id));

        if (visualAttributeValue != null)
        {
            var tagToFind = $"{visualAttributeValue.AttributeType.ToString().ToLower()}:{visualAttributeValue.Value.ToLowerInvariant()}";
            var variantSpecificMedia = await mediaQuery.Where(m => m.Tags.Any(t => t.Name == tagToFind)).ToListAsync(cancellationToken);
            if (variantSpecificMedia.Any())
            {
                return MapMediaEntitiesToDtos(variantSpecificMedia);
            }
        }

        var allMedia = await mediaQuery.ToListAsync(cancellationToken);
        return MapMediaEntitiesToDtos(allMedia);
    }

    private List<MediaDto> MapMediaEntitiesToDtos(List<MediaBase> mediaEntities)
    {
        return mediaEntities.Select(media => media switch
        {
            ImageMedia image => (MediaDto)new ImageMediaDto { Id = image.Id, Type = image.Type, Title = image.TitleKeyOrText, Url = image.Url, AltText = image.AltTextKeyOrText },
            VideoMedia video => new VideoMediaDto { Id = video.Id, Type = video.Type, Title = video.TitleKeyOrText, Url = video.Url },
            _ => throw new NotImplementedException()
        }).ToList();
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Media/Queries/GetMediaWithPagination/GetMediaWithPagination.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Application/Media/Queries/GetMediaWithPagination/GetMediaWithPagination.cs ---
/**
 * @file GetMediaWithPagination.cs
 * @Version 2.0.0 (Mapperless Implementation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description Query en handler voor het ophalen van media met paginering, zonder AutoMapper.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Domain.Enums.Media;
using System.Linq;

namespace RoyalCode.Application.Media.Queries.GetMediaWithPagination;

public record GetMediaWithPaginationQuery : IRequest<PaginatedList<MediaListItemDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public MediaType? Type { get; init; }
    public Guid? UploaderId { get; init; }
    public string? SearchTerm { get; init; }
}

public class GetMediaWithPaginationQueryHandler : IRequestHandler<GetMediaWithPaginationQuery, PaginatedList<MediaListItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMediaWithPaginationQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<MediaListItemDto>> Handle(GetMediaWithPaginationQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Media.AsNoTracking();

        if (request.Type.HasValue) query = query.Where(m => m.Type == request.Type.Value);
        if (request.UploaderId.HasValue) query = query.Where(m => m.UploaderUserId == request.UploaderId.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(m =>
                (m.TitleKeyOrText != null && m.TitleKeyOrText.ToLower().Contains(searchTerm)) ||
                (m.OriginalFilename != null && m.OriginalFilename.ToLower().Contains(searchTerm)));
        }

        query = query.OrderByDescending(m => m.Created);

        // Handmatige mapping naar DTO en paginering
        var dtoQuery = query.Select(m => new MediaListItemDto
        {
            Id = m.Id,
            Type = m.Type,
            Title = m.TitleKeyOrText,
            Url = m.Url,
            ThumbnailUrl = m.ThumbnailUrl,
            MimeType = m.MimeType,
            UploaderUserId = m.UploaderUserId,
            Created = m.Created
        });

        return await PaginatedList<MediaListItemDto>.CreateAsync(dtoQuery, request.PageNumber, request.PageSize, cancellationToken);
    }
}
// --- EINDE VERVANGING ---
--- END OF FILE ---

--- START OF FILE src/Application/Media/Queries/GetMediaWithPagination/MediaListItemDto.cs ---
/**
 * @file MediaListItemDto.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-26
 * @Description DTO for displaying media items in lists (e.g., media library).
 *              Contains essential information for a list view.
 */
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Enums.Media;

namespace RoyalCode.Application.Media.Queries.GetMediaWithPagination;

public class MediaListItemDto
{
    public Guid Id { get; init; }
    public MediaType Type { get; init; }
    public string? Title { get; init; }
    public string Url { get; init; } = string.Empty;
    public string? ThumbnailUrl { get; init; }
    public string? MimeType { get; init; }
    public Guid? UploaderUserId { get; init; }
    public DateTimeOffset Created { get; init; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Media/Queries/GetTagsForMedia/GetTagsForMediaQuery.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Application/Media/Queries/GetTagsForMedia/GetTagsForMediaQuery.cs ---
/**
 * @file GetTagsForMediaQuery.cs
 * @Version 2.0.0 (Mapperless Implementation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description Definieert de use case voor het ophalen van tags voor een media item, zonder AutoMapper.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Media;
using System.Linq;

namespace RoyalCode.Application.Media.Queries.GetTagsForMedia;

public record GetTagsForMediaQuery(Guid MediaId) : IRequest<List<MediaTagDto>>;

public class GetTagsForMediaQueryHandler : IRequestHandler<GetTagsForMediaQuery, List<MediaTagDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTagsForMediaQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MediaTagDto>> Handle(GetTagsForMediaQuery request, CancellationToken cancellationToken)
    {
        var media = await _context.Media
            .AsNoTracking()
            .Include(m => m.Tags)
            .FirstOrDefaultAsync(m => m.Id == request.MediaId, cancellationToken);

        Guard.Against.NotFound(request.MediaId, media);

        // Handmatige mapping van de domein-tags naar DTO's
        return media.Tags.Select(t => new MediaTagDto
        {
            Id = t.Id,
            Name = t.Name,
            TagType = t.TagType
        }).ToList();
    }
}
// --- EINDE VERVANGING ---
--- END OF FILE ---

--- START OF FILE src/Application/Media/Queries/GetTagsForMedia/MediaTagDto.cs ---
/**
 * @file MediaTagDto.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-30
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Maak een endpoint om alle tags voor een media-ID te vinden.
 * @Description Represents a single media tag for client-side consumption.
 */
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Enums.Media;

namespace RoyalCode.Application.Media.Queries.GetTagsForMedia;

/// <summary>
/// A Data Transfer Object representing a single tag associated with a media item.
/// </summary>
public class MediaTagDto
{
    /// <summary>
    /// The unique identifier of the tag.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// The name of the tag (e.g., "color:roze", "subject:octopus").
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// The type of the tag, which defines its purpose (e.g., Descriptive, Technical, Category).
    /// </summary>
    public MediaTagType TagType { get; init; }


    /// <summary>
    /// De lijst van tags die aan dit media-item zijn gekoppeld.
    /// Essentieel voor de frontend om te kunnen filteren (bv. op kleur).
    /// </summary>
    public IReadOnlyCollection<RoyalCode.Application.Media.Queries.GetTagsForMedia.MediaTagDto> Tags { get; set; } = new List<RoyalCode.Application.Media.Queries.GetTagsForMedia.MediaTagDto>();

}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/AddItemToOrderCommand.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Application.Orders.Queries;
using RoyalCode.Domain.Entities.Order;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product; // <-- ZORG DAT DEZE USING ER IS
using System.Text.Json;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Commands;

public record AddItemToOrderCommand(Guid OrderId, Guid ProductId, Guid? VariantId, int Quantity) : IRequest<AdminOrderDetailDto>;

public class AddItemToOrderCommandHandler : IRequestHandler<AddItemToOrderCommand, AdminOrderDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public AddItemToOrderCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<AdminOrderDetailDto> Handle(AddItemToOrderCommand request, CancellationToken cancellationToken)
    {
        var orderExists = await _context.Orders.AnyAsync(o => o.Id == request.OrderId, cancellationToken);
        if (!orderExists) throw new NotFoundException(nameof(Order), request.OrderId);

        var product = await _context.Products.OfType<PhysicalProduct>().AsNoTracking()
            .Include(p => p.VariantCombinations)
            .Include(p => p.AttributeAssignments).ThenInclude(paa => paa.AttributeValue)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken) ?? throw new NotFoundException("Product", request.ProductId);

        var variant = request.VariantId.HasValue ? product.VariantCombinations.FirstOrDefault(v => v.Id == request.VariantId.Value) : null;
        var variantAttributesToStore = new List<OrderItemVariantAttribute>();
        if (variant != null && product.AttributeAssignments.Any())
        {
            foreach (var assignment in product.AttributeAssignments.Where(paa => variant.AttributeValueIds.Contains(paa.AttributeValueId)))
            {
                variantAttributesToStore.Add(new OrderItemVariantAttribute
                {
                    AttributeType = assignment.AttributeValue.AttributeType,
                    DisplayName = assignment.AttributeValue.DisplayName,
                    Value = assignment.AttributeValue.Value, 
                    ColorHex = (assignment.AttributeValue.AttributeType == VariantAttributeType.Color) ? assignment.AttributeValue.Value : null // 'Value' is hier de hex-code
                });
            }
        }


        var variantInfoJson = variantAttributesToStore.Any() ? JsonSerializer.Serialize(variantAttributesToStore) : null;
        var newItem = new OrderItem(request.OrderId, product.Id, variant?.Id, request.Quantity, product.Name, variant?.Sku ?? product.Sku, product.Type, variant?.Price ?? product.Pricing.Price, null, 0m, 0m, variantInfoJson);

        _context.OrderItems.Add(newItem);
        await _context.SaveChangesAsync(cancellationToken);

        var updatedOrder = await _context.Orders.AsNoTracking()
            .Include(o => o.Items).Include(o => o.Fulfillments).ThenInclude(f => f.Items)
            .Include(o => o.History).Include(o => o.InternalNotes).Include(o => o.Refunds)
            .FirstAsync(o => o.Id == request.OrderId, cancellationToken);

        var customerName = await _identityService.GetUserFullNameAsync(updatedOrder!.UserId) ?? "Unknown User";
        return GetOrderByIdQueryHandler.MapToAdminDetailDto(updatedOrder, customerName);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/CancelOrderCommand.cs ---
using FluentValidation;
using Microsoft.Extensions.Logging;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Enums;
using RoyalCode.Domain.Exceptions;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException; 

namespace RoyalCode.Application.Orders.Commands;

public record CancelOrderCommand(Guid OrderId) : IRequest;

public class CancelOrderCommandValidator : AbstractValidator<CancelOrderCommand>
{
    public CancelOrderCommandValidator()
    {
        RuleFor(v => v.OrderId).NotEmpty();
    }
}

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService; 
    private readonly ILogger<CancelOrderCommandHandler> _logger;

    public CancelOrderCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService, ILogger<CancelOrderCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
        _logger = logger;
    }

    public async Task Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException("User must be logged in to cancel an order.");

        var order = await _context.Orders.FindAsync(request.OrderId)
            ?? throw new NotFoundException("Order", request.OrderId); // Gebruikt nu de gealiaste NotFoundException

        // Autorisatie: Alleen de eigenaar of een beheerder mag annuleren
        if (order.UserId != userId && !await _identityService.IsInRoleAsync(userId, Domain.Constants.Roles.Administrator)) // <-- FIX: Gebruik IdentityService.IsInRoleAsync
        {
            throw new ForbiddenAccessException("You are not authorized to cancel this order.");
        }

        // Business logica: Kan alleen geannuleerd worden als het nog niet verzonden is
        if (order.Status == OrderStatus.Shipped || order.Status == OrderStatus.Delivered || order.Status == OrderStatus.Completed)
        {
            throw new DomainException($"Order cannot be cancelled in {order.Status} status.", "ORDER_CANNOT_BE_CANCELLED");
        }

        order.UpdateStatus(OrderStatus.Cancelled);

        // Optioneel: Voorraad terugboeken als dit nodig is
        // foreach (var item in order.Items) { // Logica om voorraad terug te boeken }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Order {OrderId} cancelled by user {UserId}", order.Id, userId);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/CreateFulfillmentCommand.cs ---
using FluentValidation;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Order;
using RoyalCode.Domain.Enums;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Commands;

public record FulfillmentItemPayload(Guid OrderItemId, int Quantity);
public record CreateFulfillmentCommand(
    Guid OrderId,
    string CarrierName,
    string? TrackingNumber,
    string? TrackingUrl,
    List<FulfillmentItemPayload> Items) : IRequest<Guid>;

public class CreateFulfillmentCommandHandler : IRequestHandler<CreateFulfillmentCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser; // Om de auteur van de actie te loggen

    public CreateFulfillmentCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateFulfillmentCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new NotFoundException(nameof(Order), request.OrderId);

        // TODO: Validatie om te controleren of de items en hoeveelheden geldig zijn.

        var fulfillmentItems = request.Items
            .Select(i => new OrderFulfillmentItem(i.OrderItemId, i.Quantity))
            .ToList();

        var fulfillment = new OrderFulfillment(request.OrderId, request.CarrierName, request.TrackingNumber, request.TrackingUrl, DateTimeOffset.UtcNow, fulfillmentItems);

        order.AddFulfillment(fulfillment);

        // Update order status (gedeeltelijk of volledig verzonden)
        var totalFulfilled = order.Fulfillments.SelectMany(f => f.Items).Sum(i => i.Quantity);
        var totalItemsInOrder = order.Items.Sum(i => i.Quantity);

        order.UpdateStatus(totalFulfilled >= totalItemsInOrder ? OrderStatus.Shipped : OrderStatus.Processing);

        var authorName = _currentUser.Id?.ToString() ?? "System";
        order.AddHistoryEvent("FulfillmentCreated", authorName, $"A shipment was created with carrier {request.CarrierName}.");

        await _context.SaveChangesAsync(cancellationToken);
        return fulfillment.Id;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/CreateOrderCommand.cs ---
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Domain.Entities.Order;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Entities.User;
using RoyalCode.Domain.Enums.Product;
using System.Text.Json;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Commands;

public record CreateOrderCommand(Guid ShippingAddressId, Guid BillingAddressId, Guid ShippingMethodId, string PaymentMethod, List<CreateOrderItemPayloadDto> Items, string? CustomerNotes) : IRequest<OrderDetailDto>;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(v => v.ShippingAddressId)
            .NotEmpty().WithMessage("Verzendadres is verplicht.");

        RuleFor(v => v.BillingAddressId)
            .NotEmpty().WithMessage("Factuuradres is verplicht.");

        RuleFor(v => v.ShippingMethodId)
            .NotEmpty().WithMessage("Verzendmethode is verplicht.")
            .NotEqual(Guid.Empty).WithMessage("Verzendmethode moet geselecteerd worden.");

        RuleFor(v => v.PaymentMethod)
            .NotEmpty().WithMessage("Betaalmethode is verplicht.");

        RuleFor(v => v.Items)
            .NotEmpty().WithMessage("Een order moet minimaal één item bevatten.");
    }
}

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, OrderDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public CreateOrderCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<OrderDetailDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var validator = new CreateOrderCommandValidator();
        var validationResult = await validator.ValidateAsync(request, cancellationToken);
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                Console.WriteLine($"Validation Error - Property: {error.PropertyName}, Message: {error.ErrorMessage}, Value: {error.AttemptedValue}");
            }
        }
        
        
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();
        var userEmail = await _identityService.GetUserEmailAsync(userId) ?? throw new NotFoundException("User", userId);

        var shippingAddress = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == request.ShippingAddressId && a.UserId == userId, cancellationToken) ?? throw new NotFoundException(nameof(Address), request.ShippingAddressId);
        var billingAddress = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == request.BillingAddressId && a.UserId == userId, cancellationToken) ?? throw new NotFoundException(nameof(Address), request.BillingAddressId);

        var productIds = request.Items.Select(i => i.ProductId).ToList();
        var productsDict = await _context.Products.OfType<PhysicalProduct>()
            .Where(p => productIds.Contains(p.Id))
            .Include(p => p.VariantCombinations)
            .Include(p => p.AttributeAssignments).ThenInclude(paa => paa.AttributeValue)
            .ToDictionaryAsync(p => p.Id, p => p, cancellationToken);

        var allProductMediaIds = productsDict.Values.SelectMany(p => p.MediaIds).Distinct().ToList();
        var mediaThumbnailLookup = await _context.Media.Where(m => allProductMediaIds.Contains(m.Id)).AsNoTracking().ToDictionaryAsync(m => m.Id, m => m.ThumbnailUrl, cancellationToken);

        var shippingMethod = await _context.ShippingMethods
            .AsNoTracking()
            .Include(sm => sm.Rates)
            .Include(sm => sm.ShippingZone)
            .FirstOrDefaultAsync(sm => sm.Id == request.ShippingMethodId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Shipping.ShippingMethod), request.ShippingMethodId);

        if (!shippingMethod.IsActive || !shippingMethod.ShippingZone.IsActive || !shippingMethod.ShippingZone.CountryCodes.Contains(shippingAddress.CountryCode))
        {
            throw new BadRequestException("Selected shipping method is not available for the given address.", "SHIPPING_METHOD_UNAVAILABLE");
        }

        var newOrder = new Order(userId, userEmail, shippingAddress, billingAddress, request.PaymentMethod);

        var orderItems = new List<OrderItem>();
        foreach (var itemPayload in request.Items)
        {
            if (!productsDict.TryGetValue(itemPayload.ProductId, out var product)) throw new NotFoundException("Product", itemPayload.ProductId);
            var variant = itemPayload.VariantId.HasValue ? product.VariantCombinations.FirstOrDefault(v => v.Id == itemPayload.VariantId.Value) : null;
            var variantAttributesToStore = new List<OrderItemVariantAttribute>();
            if (variant != null && product.AttributeAssignments.Any())
            {
                foreach (var assignment in product.AttributeAssignments.Where(paa => variant.AttributeValueIds.Contains(paa.AttributeValueId)))
                {
                    variantAttributesToStore.Add(new OrderItemVariantAttribute
                    {
                        AttributeType = assignment.AttributeValue.AttributeType,
                        DisplayName = assignment.AttributeValue.DisplayName,
                        Value = assignment.AttributeValue.Value,
                        ColorHex = (assignment.AttributeValue.AttributeType == VariantAttributeType.Color) ? assignment.AttributeValue.ColorHex : null
                    });
                }
            }
            var variantInfoJson = variantAttributesToStore.Any() ? JsonSerializer.Serialize(variantAttributesToStore) : null;
            string? productImageUrl = null;
            if (product.MediaIds.Any() && mediaThumbnailLookup.ContainsKey(product.MediaIds.First())) productImageUrl = mediaThumbnailLookup[product.MediaIds.First()];
            orderItems.Add(new OrderItem(newOrder.Id, product.Id, variant?.Id, itemPayload.Quantity, product.Name, variant?.Sku ?? product.Sku, product.Type, variant?.Price ?? product.Pricing.Price, productImageUrl, 0m, 0m, variantInfoJson));
        }
        newOrder.AddItems(orderItems);

        var applicableRate = shippingMethod.Rates.FirstOrDefault(r => r.IsApplicable(newOrder.SubTotal));
        if (applicableRate == null)
        {
            throw new BadRequestException("No applicable shipping rate found for the current order value.", "NO_APPLICABLE_SHIPPING_RATE");
        }

        newOrder.ApplyShippingMethod(shippingMethod, applicableRate, ConvertEstimatedTimeToDays);

        newOrder.UpdateCustomerNotes(request.CustomerNotes);
        _context.Orders.Add(newOrder);
        await _context.SaveChangesAsync(cancellationToken);

        var customerName = await _identityService.GetUserFullNameAsync(userId) ?? "Unknown";
        return MapToCustomerDetailDto(newOrder, customerName);
    }

    private int ConvertEstimatedTimeToDays(string estimatedTime)
    {
        if (estimatedTime.Contains("werkdag", StringComparison.OrdinalIgnoreCase))
        {
            var parts = estimatedTime.Split('-').Select(p => p.Trim().Replace("werkdagen", "").Replace("werkdag", "")).ToList();
            if (parts.Count == 2 && int.TryParse(parts[1], out var days)) return days;
            if (parts.Count == 1 && int.TryParse(parts[0], out days)) return days;
        }
        return 2;
    }

    private static OrderDetailDto MapToCustomerDetailDto(Order order, string customerName)
    {
        return new OrderDetailDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            OrderDate = order.OrderDate,
            Status = order.Status,
            UserId = order.UserId,
            CustomerName = customerName,
            CustomerEmail = order.CustomerEmail,
            SubTotal = order.SubTotal,
            ShippingCost = order.ShippingCost,
            TaxAmount = order.TaxAmount,
            DiscountAmount = order.DiscountAmount,
            GrandTotal = order.GrandTotal,
            Currency = order.Currency,
            ShippingAddress = order.ShippingAddress,
            BillingAddress = order.BillingAddress,
            ShippingDetails = new ShippingDetailsDto(order.ShippingDetails.MethodName, order.ShippingDetails.Cost, order.ShippingDetails.TrackingNumber, order.ShippingDetails.TrackingUrl, order.ShippingDetails.ShippedDate, order.ShippingDetails.EstimatedDeliveryDate),
            PaymentDetails = new PaymentDetailsDto(order.PaymentDetails.MethodFriendlyName, order.PaymentDetails.GatewayTransactionId, order.PaymentDetails.PaymentStatus),
            CustomerNotes = order.CustomerNotes,
            Items = order.Items.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductVariantId = oi.ProductVariantId,
                Quantity = oi.Quantity,
                ProductName = oi.ProductName,
                Sku = oi.Sku,
                ProductType = oi.ProductType,
                PricePerItem = oi.PricePerItem,
                ProductImageUrl = oi.ProductImageUrl,
                LineTotal = oi.LineTotal,
                TaxAmount = oi.TaxAmount,
                DiscountAmount = oi.DiscountAmount,
                VariantInfo = string.IsNullOrEmpty(oi.VariantInfoJson) ? null : JsonSerializer.Deserialize<List<OrderItemVariantAttributeDto>>(oi.VariantInfoJson)
            }).ToList()
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/CreateReturnRequestCommand.cs ---
using Microsoft.Extensions.Logging;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Enums;
using FluentValidation;
using Microsoft.EntityFrameworkCore; // Voeg deze using toe
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Commands;

public record CreateReturnRequestCommand(
    Guid OrderId,
    List<Guid> OrderItemIds,
    ReturnReason Reason,
    string? CustomerComments) : IRequest;

public class CreateReturnRequestCommandHandler : IRequestHandler<CreateReturnRequestCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly ILogger<CreateReturnRequestCommandHandler> _logger;

    public CreateReturnRequestCommandHandler(IApplicationDbContext context, IUser currentUser, ILogger<CreateReturnRequestCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task Handle(CreateReturnRequestCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Order.Order), request.OrderId);

        if (order.UserId != userId)
        {
            throw new ForbiddenAccessException("You can only request returns for your own orders.");
        }

        var itemsToReturn = string.Join(", ", order.Items
            .Where(oi => request.OrderItemIds.Contains(oi.Id))
            .Select(oi => oi.ProductName));

        order.UpdateStatus(OrderStatus.RefundPending);

        // --- GECORRIGEERDE LOGICA ---
        // Maak een duidelijke, gestructureerde notitie van het retouraanvraag.
        var newNote = $"Return requested by customer.\nReason: {request.Reason}\nItems: {itemsToReturn}\nComments: {request.CustomerComments}";

        // Gebruik de nieuwe methode om de notitie toe te voegen.
        order.AddInternalNote("Customer", newNote); // De auteur is de klant, of 'System'

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Return request created for Order {OrderId} by user {UserId}.", request.OrderId, userId);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/GeneratePackingSlipCommand.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using System.Text;

namespace RoyalCode.Application.Orders.Commands;

public record PackingSlipDto(string FileName, string ContentType, byte[] Content);

public record GeneratePackingSlipCommand(Guid OrderId) : IRequest<PackingSlipDto>;

public class GeneratePackingSlipCommandHandler : IRequestHandler<GeneratePackingSlipCommand, PackingSlipDto>
{
    private readonly IApplicationDbContext _context;

    public GeneratePackingSlipCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PackingSlipDto> Handle(GeneratePackingSlipCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order", request.OrderId);

        // Genereer een simpele HTML pakbon (kan later vervangen worden door een PDF-bibliotheek)
        var sb = new StringBuilder();
        sb.AppendLine("<html><head><title>Packing Slip</title></head><body>");
        sb.AppendLine($"<h1>Packing Slip for Order: {order.OrderNumber}</h1>");
        sb.AppendLine("<h3>Shipping Address:</h3>");
        sb.AppendLine($"<p>{order.ShippingAddress.ContactName}<br/>{order.ShippingAddress.Street} {order.ShippingAddress.HouseNumber}<br/>{order.ShippingAddress.PostalCode} {order.ShippingAddress.City}<br/>{order.ShippingAddress.CountryCode}</p>");
        sb.AppendLine("<hr/><h3>Items to Pack:</h3>");
        sb.AppendLine("<table border='1'><tr><th>SKU</th><th>Product</th><th>Quantity</th></tr>");
        foreach (var item in order.Items)
        {
            sb.AppendLine($"<tr><td>{item.Sku ?? "N/A"}</td><td>{item.ProductName}</td><td>{item.Quantity}</td></tr>");
        }
        sb.AppendLine("</table></body></html>");

        var fileName = $"PackingSlip_{order.OrderNumber}.html";
        var content = Encoding.UTF8.GetBytes(sb.ToString());

        return new PackingSlipDto(fileName, "text/html", content);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/RefundOrderCommand.cs ---
using Microsoft.Extensions.Logging;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Enums;
using RoyalCode.Domain.Exceptions;
using FluentValidation;
using FluentValidation.Results; // Belangrijk: Voeg deze using toe voor ValidationFailure
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException; // <-- NIEUWE ALIAS


namespace RoyalCode.Application.Orders.Commands;

public record RefundOrderCommand(Guid OrderId, decimal Amount, string Reason) : IRequest;

public class RefundOrderCommandValidator : AbstractValidator<RefundOrderCommand>
{
    public RefundOrderCommandValidator()
    {
        RuleFor(v => v.OrderId).NotEmpty();
        RuleFor(v => v.Amount).GreaterThan(0);
        RuleFor(v => v.Reason).NotEmpty().MaximumLength(500);
    }
}

public class RefundOrderCommandHandler : IRequestHandler<RefundOrderCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<RefundOrderCommandHandler> _logger;

    public RefundOrderCommandHandler(IApplicationDbContext context, ILogger<RefundOrderCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task Handle(RefundOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders.FindAsync(new object[] { request.OrderId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Order.Order), request.OrderId);

        if (request.Amount > order.GrandTotal)
        {
            throw new AppValidationException(new List<ValidationFailure>
            {
                new ValidationFailure(nameof(request.Amount), "Refund amount cannot be greater than the order total.")
            });
        }

        _logger.LogInformation("Processing refund of {Amount} for order {OrderId}. Reason: {Reason}", request.Amount, request.OrderId, request.Reason);

        if (request.Amount == order.GrandTotal)
        {
            order.UpdateStatus(OrderStatus.FullyRefunded);
        }
        else
        {
            order.UpdateStatus(OrderStatus.PartiallyRefunded);
        }

        // CORRECTE AANROEP
        order.AddInternalNote("System", $"Refunded: {request.Amount:C} on {DateTimeOffset.UtcNow:g}. Reason: {request.Reason}");

        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/RemoveOrderItemCommand.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Application.Orders.Queries;
using RoyalCode.Domain.Entities.Order;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Commands;

public record RemoveOrderItemCommand(Guid OrderItemId) : IRequest<AdminOrderDetailDto>;

public class RemoveOrderItemCommandHandler : IRequestHandler<RemoveOrderItemCommand, AdminOrderDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public RemoveOrderItemCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<AdminOrderDetailDto> Handle(RemoveOrderItemCommand request, CancellationToken cancellationToken)
    {
        var orderItem = await _context.OrderItems
            .Include(oi => oi.Order).ThenInclude(o => o.Items)
            .FirstOrDefaultAsync(oi => oi.Id == request.OrderItemId, cancellationToken)
            ?? throw new NotFoundException(nameof(OrderItem), request.OrderItemId);

        var order = orderItem.Order;

        order.RemoveItem(orderItem.Id);

        var adminName = await _identityService.GetUserFullNameAsync(_currentUser.Id!.Value) ?? "System";
        order.AddHistoryEvent("ItemRemoved", adminName, $"Removed {orderItem.ProductName} (SKU: {orderItem.Sku}) from order. A refund may be required.");

        await _context.SaveChangesAsync(cancellationToken);

        var customerName = await _identityService.GetUserFullNameAsync(order.UserId) ?? "Unknown User";
        return GetOrderByIdQueryHandler.MapToAdminDetailDto(order, customerName);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/UpdateCustomerNotesCommand.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Order;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Commands;

public record UpdateCustomerNotesCommand(Guid OrderId, string? Notes) : IRequest;

public class UpdateCustomerNotesCommandHandler : IRequestHandler<UpdateCustomerNotesCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public UpdateCustomerNotesCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateCustomerNotesCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders.FindAsync(new object[] { request.OrderId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Order), request.OrderId);

        order.UpdateCustomerNotes(request.Notes);
        order.AddHistoryEvent("NotesUpdated", _currentUser.Id?.ToString() ?? "System", "Customer notes were updated by an administrator.");

        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/UpdateInternalNotesCommand.cs ---
using Microsoft.Extensions.Logging;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Commands;

public record UpdateInternalNotesCommand(Guid OrderId, string? Notes) : IRequest;

public class UpdateInternalNotesCommandHandler : IRequestHandler<UpdateInternalNotesCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser; // Injecteer IUser om de auteur te kennen
    private readonly ILogger<UpdateInternalNotesCommandHandler> _logger;

    public UpdateInternalNotesCommandHandler(IApplicationDbContext context, IUser currentUser, ILogger<UpdateInternalNotesCommandHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task Handle(UpdateInternalNotesCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders.FindAsync(new object[] { request.OrderId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Order.Order), request.OrderId);

        // We gaan ervan uit dat een admin deze actie uitvoert. We hebben de naam nodig.
        var authorName = _currentUser.Id?.ToString() ?? "System"; // Fallback naar "System"

        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            // GEWIJZIGD: Gebruik de nieuwe methode om een notitie TOE TE VOEGEN.
            order.AddInternalNote(authorName, request.Notes);
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Internal note for Order {OrderId} added.", order.Id);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/UpdateOrderBillingAddressCommand.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Common; // Voor AddressDto
using RoyalCode.Domain.Entities.Order;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Commands;

public record UpdateOrderBillingAddressCommand(Guid OrderId, AddressDto NewAddress) : IRequest;

public class UpdateOrderBillingAddressCommandHandler : IRequestHandler<UpdateOrderBillingAddressCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public UpdateOrderBillingAddressCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateOrderBillingAddressCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders.FindAsync(new object[] { request.OrderId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Order), request.OrderId);

        var addressSnapshot = new AddressSnapshot(
            request.NewAddress.Street, request.NewAddress.HouseNumber, request.NewAddress.AddressAddition,
            request.NewAddress.City, request.NewAddress.PostalCode, request.NewAddress.CountryCode,
            request.NewAddress.ContactName
        );

        order.UpdateBillingAddress(addressSnapshot);
        order.AddHistoryEvent("AddressUpdated", _currentUser.Id?.ToString() ?? "System", "Billing address was updated by an administrator.");

        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/UpdateOrderItemCommand.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Application.Orders.Queries;
using RoyalCode.Domain.Entities.Order;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Commands;

public record UpdateOrderItemCommand(Guid OrderItemId, int Quantity) : IRequest<AdminOrderDetailDto>;

public class UpdateOrderItemCommandHandler : IRequestHandler<UpdateOrderItemCommand, AdminOrderDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public UpdateOrderItemCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<AdminOrderDetailDto> Handle(UpdateOrderItemCommand request, CancellationToken cancellationToken)
    {
        var orderItem = await _context.OrderItems
            .Include(oi => oi.Order)
            .FirstOrDefaultAsync(oi => oi.Id == request.OrderItemId, cancellationToken)
            ?? throw new NotFoundException(nameof(OrderItem), request.OrderItemId);

        var order = orderItem.Order;

        orderItem.UpdateQuantity(request.Quantity);
        order.RecalculateTotals(); // Update de Order entiteit

        var adminName = await _identityService.GetUserFullNameAsync(_currentUser.Id!.Value) ?? "System";
        order.AddHistoryEvent("ItemUpdated", adminName, $"Quantity for {orderItem.ProductName} (SKU: {orderItem.Sku}) updated to {request.Quantity}.");

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("De order of een item ervan is gewijzigd door een andere gebruiker. Laad de pagina opnieuw en probeer het nogmaals.", "ORDER_CONCURRENCY_CONFLICT");
        }

        // Na succesvolle opslag, haal de bijgewerkte order op voor de response
        var updatedOrder = await _context.Orders.AsNoTracking()
            .Include(o => o.Items).Include(o => o.Fulfillments).ThenInclude(f => f.Items)
            .Include(o => o.History).Include(o => o.InternalNotes).Include(o => o.Refunds)
            .FirstAsync(o => o.Id == order.Id, cancellationToken); // Gebruik order.Id, niet request.OrderItemId

        var customerName = await _identityService.GetUserFullNameAsync(updatedOrder.UserId) ?? "Unknown User";
        return GetOrderByIdQueryHandler.MapToAdminDetailDto(updatedOrder, customerName);
    }

}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/UpdateOrderShippingAddressCommand.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Common; // Voor AddressDto
using RoyalCode.Domain.Entities.Order;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Commands;

public record UpdateOrderShippingAddressCommand(Guid OrderId, AddressDto NewAddress) : IRequest;

public class UpdateOrderShippingAddressCommandHandler : IRequestHandler<UpdateOrderShippingAddressCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateOrderShippingAddressCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateOrderShippingAddressCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders.FindAsync(new object[] { request.OrderId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Order), request.OrderId);

        // Converteer DTO naar Value Object
        var addressSnapshot = new AddressSnapshot(
            request.NewAddress.Street,
            request.NewAddress.HouseNumber,
            request.NewAddress.AddressAddition,
            request.NewAddress.City,
            request.NewAddress.PostalCode,
            request.NewAddress.CountryCode,
            request.NewAddress.ContactName
        );

        order.UpdateShippingAddress(addressSnapshot);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Commands/UpdateOrderStatusCommand.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Enums;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Commands;

public record UpdateOrderStatusCommand(
    Guid OrderId,
    OrderStatus NewStatus,
    string? TrackingNumber,
    string? TrackingUrl,
    DateTimeOffset? ShippedDate,
    DateTimeOffset? EstimatedDeliveryDate) : IRequest;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public UpdateOrderStatusCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Order.Order), request.OrderId);

        var oldStatus = order.Status;

        // Als tracking info wordt meegegeven en de status is 'Shipped', gebruik de specifieke methode
        if (request.NewStatus == OrderStatus.Shipped && !string.IsNullOrWhiteSpace(request.TrackingNumber))
        {
            order.AddTrackingInformation(request.TrackingNumber, request.TrackingUrl, request.ShippedDate, request.EstimatedDeliveryDate);
        }
        else
        {
            order.UpdateStatus(request.NewStatus);
        }

        order.AddHistoryEvent("StatusUpdated", _currentUser.Id?.ToString() ?? "System", $"Order status changed from {oldStatus} to {request.NewStatus}.");

        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Common/OrderDtos.cs ---
/**
 * @file OrderDtos.cs
 * @Version 6.4.0 (Definitive Blauwdruk v3.3 - Strongly Typed VariantInfo)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-22
 * @Description The single, canonical source of truth for all Order-related DTOs.
 *              VariantInfo DTOs now use strongly-typed enums for AttributeType.
 */
using RoyalCode.Domain.Entities.Order; // Voor AddressSnapshot
using RoyalCode.Domain.Enums;
using RoyalCode.Domain.Enums.Product; // BELANGRIJK: Zorg dat deze using aanwezig is!
using System.Text.Json.Serialization;

namespace RoyalCode.Application.Orders.Common;

// =======================================================================
// === 1. Input DTOs (Payloads for Commands & Endpoints)
// =======================================================================

public record CreateOrderItemPayloadDto(Guid ProductId, Guid? VariantId, int Quantity);
public record CreateOrderDto(Guid ShippingAddressId, Guid BillingAddressId, Guid ShippingMethodId, string PaymentMethod, List<CreateOrderItemPayloadDto> Items, string? CustomerNotes);
public record UpdateOrderStatusDto(OrderStatus NewStatus, string? TrackingNumber, string? TrackingUrl, DateTimeOffset? ShippedDate, DateTimeOffset? EstimatedDeliveryDate);

// =======================================================================
// === 2. Customer-Facing Output DTOs (for /api/Orders)
// =======================================================================

public record OrderItemDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public Guid? ProductVariantId { get; init; }
    public int Quantity { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? Sku { get; init; }
    [JsonConverter(typeof(JsonStringEnumConverter))] public ProductType ProductType { get; init; }
    public decimal PricePerItem { get; init; }
    public string? ProductImageUrl { get; init; }
    public decimal LineTotal { get; init; }
    public decimal? TaxAmount { get; init; }
    public decimal? DiscountAmount { get; init; }
    public IReadOnlyCollection<OrderItemVariantAttributeDto>? VariantInfo { get; init; }
}


public record OrderDetailDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public DateTimeOffset OrderDate { get; init; }
    [JsonConverter(typeof(JsonStringEnumConverter))] public OrderStatus Status { get; init; }
    public Guid UserId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public decimal SubTotal { get; init; }
    public decimal ShippingCost { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal DiscountAmount { get; init; }
    public decimal GrandTotal { get; init; }
    public string Currency { get; init; } = string.Empty;
    public AddressSnapshot ShippingAddress { get; init; } = null!;
    public AddressSnapshot BillingAddress { get; init; } = null!;
    public ShippingDetailsDto ShippingDetails { get; init; } = null!;
    public PaymentDetailsDto PaymentDetails { get; init; } = null!;
    public string? CustomerNotes { get; init; }
    public IReadOnlyCollection<OrderItemDto> Items { get; init; } = new List<OrderItemDto>();
}

public record OrderListItemDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public DateTimeOffset OrderDate { get; init; }
    [JsonConverter(typeof(JsonStringEnumConverter))] public OrderStatus Status { get; init; }
    public decimal GrandTotal { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public AddressSnapshot ShippingAddress { get; init; } = null!;
    public IReadOnlyCollection<OrderItemDto> Items { get; init; } = new List<OrderItemDto>();
    public int TotalItems => Items.Sum(i => i.Quantity);
    public IReadOnlyCollection<string> ProductThumbnails => Items.Where(i => !string.IsNullOrEmpty(i.ProductImageUrl)).Select(i => i.ProductImageUrl!).ToList();
}


// =======================================================================
// === 3. Admin-Facing Output DTOs (for /api/AdminOrders)
// =======================================================================

public record AdminOrderStatsDto
{
    public decimal TotalRevenue { get; init; }
    public int TotalOrders { get; init; }
    public decimal AverageOrderValue { get; init; }
    public int OrdersAwaitingFulfillment { get; init; }
    public int NewOrdersToday { get; init; }
    public decimal RevenueToday { get; init; }
}

public record AdminOrderDetailDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public DateTimeOffset OrderDate { get; init; }
    [JsonConverter(typeof(JsonStringEnumConverter))] public OrderStatus Status { get; init; }
    public CustomerDto Customer { get; init; } = null!;
    public FinancialSummaryDto FinancialSummary { get; init; } = null!;
    public AddressSnapshot ShippingAddress { get; init; } = null!;
    public AddressSnapshot BillingAddress { get; init; } = null!;
    public PaymentDetailsDto PaymentDetails { get; init; } = null!;
    public IReadOnlyCollection<AdminOrderItemDto> Items { get; init; } = new List<AdminOrderItemDto>();
    public string? CustomerNotes { get; init; }
    public IReadOnlyCollection<InternalNoteDto> InternalNotes { get; init; } = new List<InternalNoteDto>();
    public IReadOnlyCollection<FulfillmentDto> Fulfillments { get; init; } = new List<FulfillmentDto>();
    public IReadOnlyCollection<HistoryEventDto> History { get; init; } = new List<HistoryEventDto>();
    public IReadOnlyCollection<RefundDto> Refunds { get; init; } = new List<RefundDto>();
}

public record AdminOrderItemDto(Guid Id, Guid ProductId, Guid? ProductVariantId, string ProductName, string? Sku, ProductType ProductType, int Quantity, decimal PricePerItem, decimal LineTotal, decimal? TaxAmount, decimal? DiscountAmount, IReadOnlyCollection<OrderItemVariantAttributeDto>? VariantInfo, string? ProductImageUrl);

public record AdminOrderListItemDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public DateTimeOffset OrderDate { get; init; }
    [JsonConverter(typeof(JsonStringEnumConverter))] public OrderStatus Status { get; init; }
    public string PaymentStatus { get; init; } = string.Empty;
    public decimal GrandTotal { get; init; }
    public string Currency { get; init; } = string.Empty;
    public int TotalItems { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public bool HasCustomerNotes { get; init; }
    public ShippingSummaryDto ShippingSummary { get; init; } = null!;
    public IReadOnlyCollection<string> ProductThumbnails { get; init; } = new List<string>();
}

public record OrderLookupsDto
{
    public IReadOnlyCollection<string> OrderStatuses { get; init; } = new List<string>();
    public IReadOnlyCollection<string> PaymentMethods { get; init; } = new List<string>();
    public IReadOnlyCollection<string> ShippingMethods { get; init; } = new List<string>();
}

public record OrderPickingDto
{
    public Guid OrderId { get; init; }
    public AddressSnapshot ShippingAddress { get; init; } = null!;
    public string? CustomerNotes { get; init; }
    public IReadOnlyCollection<OrderItemForPickingDto> Items { get; init; } = new List<OrderItemForPickingDto>();
    public FulfillmentForPickingDto? Fulfillment { get; init; }
}


// =======================================================================
// === 4. Shared / Reusable Child DTOs
// =======================================================================

public record CustomerDto(Guid UserId, string Name, string Email);

public record FulfillmentDto(Guid FulfillmentId, DateTimeOffset CreatedAt, string Status, string CarrierName, string? TrackingNumber, string? TrackingUrl, DateTimeOffset? ShippedDate, DateTimeOffset? EstimatedDeliveryDate, IReadOnlyCollection<FulfillmentItemDto> Items);

public record FulfillmentItemDto(Guid OrderItemId, int Quantity);

public record FulfillmentForPickingDto(string CarrierName, string? TrackingNumber, string? TrackingUrl);

public record FinancialSummaryDto(decimal SubTotal, decimal ShippingCost, decimal TaxAmount, decimal DiscountAmount, decimal GrandTotal, string Currency);

public record HistoryEventDto(DateTimeOffset Timestamp, string EventType, string Author, string Description);

public record InternalNoteDto(Guid Id, DateTimeOffset CreatedAt, string AuthorName, string Text);

public record OrderItemVariantAttributeDto
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public VariantAttributeType AttributeType { get; init; } = VariantAttributeType.Custom;
    public string DisplayName { get; init; } = string.Empty;
    public string? Value { get; init; }
    public string? ColorHex { get; init; }
}


public record PaymentDetailsDto(string MethodFriendlyName, string GatewayTransactionId, string PaymentStatus);

public record RefundDto(Guid RefundId, decimal Amount, string Reason, DateTimeOffset RefundedAt, string ProcessedBy, string GatewayRefundId);

public record ShippingDetailsDto(string MethodName, decimal Cost, string? TrackingNumber, string? TrackingUrl, DateTimeOffset? ShippedDate, DateTimeOffset? EstimatedDeliveryDate);

public record ShippingSummaryDto(string CountryCode, string MethodName, string? TrackingNumber);

public record OrderItemForPickingDto(Guid OrderItemId, string? Sku, string ProductName, IReadOnlyCollection<OrderItemVariantAttributeDto>? VariantInfo, int Quantity, string? ProductImageUrl);
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Queries/ExportOrdersQuery.cs ---
using System.Formats.Asn1;
using System.Globalization;
using System.Text;
using CsvHelper;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Enums;

namespace RoyalCode.Application.Orders.Queries;

public record ExportFileDto(byte[] Content, string FileName, string ContentType);

// Deze query hergebruikt de filterparameters van GetAllOrdersQuery
public record ExportOrdersQuery(
    OrderStatus? Status = null,
    Guid? UserId = null,
    string? SearchTerm = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null) : IRequest<ExportFileDto>;

public class ExportOrdersQueryHandler : IRequestHandler<ExportOrdersQuery, ExportFileDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public ExportOrdersQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<ExportFileDto> Handle(ExportOrdersQuery request, CancellationToken cancellationToken)
    {
        // Pas dezelfde filters toe als in GetAllOrdersQuery
        var query = _context.Orders.AsNoTracking();
        if (request.Status.HasValue) query = query.Where(o => o.Status == request.Status.Value);
        if (request.UserId.HasValue) query = query.Where(o => o.UserId == request.UserId.Value);
        if (request.DateFrom.HasValue) query = query.Where(o => o.OrderDate >= request.DateFrom.Value);
        if (request.DateTo.HasValue) query = query.Where(o => o.OrderDate <= request.DateTo.Value);
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTermLower = request.SearchTerm.ToLower();
            query = query.Where(o => o.OrderNumber.ToLower().Contains(searchTermLower) || o.CustomerEmail.ToLower().Contains(searchTermLower));
        }

        var orders = await query
            .Include(o => o.Items)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync(cancellationToken);

        // Genereer het CSV-bestand in het geheugen
        using var memoryStream = new MemoryStream();
        using (var writer = new StreamWriter(memoryStream, Encoding.UTF8))
        using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
        {
            // Schrijf de headers
            csv.WriteField("OrderNumber");
            csv.WriteField("OrderDate");
            csv.WriteField("Status");
            csv.WriteField("CustomerEmail");
            csv.WriteField("GrandTotal");
            csv.WriteField("Currency");
            csv.NextRecord();

            foreach (var order in orders)
            {
                csv.WriteField(order.OrderNumber);
                csv.WriteField(order.OrderDate);
                csv.WriteField(order.Status);
                csv.WriteField(order.CustomerEmail);
                csv.WriteField(order.GrandTotal);
                csv.WriteField(order.Currency);
                csv.NextRecord();
            }
        }

        var fileName = $"Orders_Export_{DateTime.UtcNow:yyyyMMddHHmmss}.csv";
        return new ExportFileDto(memoryStream.ToArray(), fileName, "text/csv");
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Queries/GetAdminOrderStatsQuery.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Domain.Enums;

namespace RoyalCode.Application.Orders.Queries;

public record GetAdminOrderStatsQuery(DateTimeOffset? DateFrom = null, DateTimeOffset? DateTo = null) : IRequest<AdminOrderStatsDto>;

public class GetAdminOrderStatsQueryHandler : IRequestHandler<GetAdminOrderStatsQuery, AdminOrderStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetAdminOrderStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminOrderStatsDto> Handle(GetAdminOrderStatsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders.AsNoTracking();

        // Pas optionele datumbereik toe
        if (request.DateFrom.HasValue)
        {
            query = query.Where(o => o.OrderDate >= request.DateFrom.Value);
        }
        if (request.DateTo.HasValue)
        {
            query = query.Where(o => o.OrderDate <= request.DateTo.Value);
        }

        // Berekeningen
        var totalRevenue = await query
            .Where(o => o.Status == OrderStatus.Completed || o.Status == OrderStatus.Shipped || o.Status == OrderStatus.Delivered)
            .SumAsync(o => o.GrandTotal, cancellationToken);

        var totalOrders = await query.CountAsync(cancellationToken);

        var averageOrderValue = totalOrders > 0 ? await query.AverageAsync(o => o.GrandTotal, cancellationToken) : 0;

        var ordersAwaitingFulfillment = await query
            .CountAsync(o => o.Status == OrderStatus.AwaitingFulfillment, cancellationToken);

        var todayStart = new DateTimeOffset(DateTime.UtcNow.Date, TimeSpan.Zero);
        var todayQuery = query.Where(o => o.OrderDate >= todayStart);

        var newOrdersToday = await todayQuery.CountAsync(cancellationToken);

        var revenueToday = await todayQuery
             .Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.PaymentFailed)
             .SumAsync(o => o.GrandTotal, cancellationToken);

        return new AdminOrderStatsDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            AverageOrderValue = averageOrderValue,
            OrdersAwaitingFulfillment = ordersAwaitingFulfillment,
            NewOrdersToday = newOrdersToday,
            RevenueToday = revenueToday
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Queries/GetAllOrdersQuery.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Mappings;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Domain.Enums;
using System.Text.Json; // Nodig voor het deserializeren van VariantInfo

namespace RoyalCode.Application.Orders.Queries;

/// <summary>
/// Query to retrieve a paginated list of all orders for administrators,
/// with advanced filtering and search capabilities.
/// </summary>
public record GetAllOrdersQuery(
    int PageNumber = 1,
    int PageSize = 20,
    OrderStatus? Status = null,
    Guid? UserId = null,
    string? SearchTerm = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null)
    : IRequest<PaginatedList<AdminOrderListItemDto>>; // Returneert de platte AdminOrderListItemDto

/// <summary>
/// Handles the GetAllOrdersQuery, fetching and mapping order data for the admin list view.
/// </summary>
public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, PaginatedList<AdminOrderListItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;
    private readonly IUserQueryService _userQueryService;

    public GetAllOrdersQueryHandler(IApplicationDbContext context, IIdentityService identityService, IUserQueryService userQueryService)
    {
        _context = context;
        _identityService = identityService;
        _userQueryService = userQueryService;
    }

    /// <summary>
    /// Handles the query to retrieve a paginated list of admin orders.
    /// </summary>
    /// <param name="request">The query request with pagination and filter parameters.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A paginated list of AdminOrderListItemDto.</returns>
    public async Task<PaginatedList<AdminOrderListItemDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders.AsNoTracking();

        // === Apply Filters ===
        if (request.Status.HasValue)
            query = query.Where(o => o.Status == request.Status.Value);
        if (request.UserId.HasValue)
            query = query.Where(o => o.UserId == request.UserId.Value);
        if (request.DateFrom.HasValue)
            query = query.Where(o => o.OrderDate >= request.DateFrom.Value);
        if (request.DateTo.HasValue)
            query = query.Where(o => o.OrderDate <= request.DateTo.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTermLower = request.SearchTerm.ToLower();

            // Vind overeenkomende gebruikers-ID's voor klantnaam-zoekopdrachten.
            var matchingUserIds = await _userQueryService.FindUserIdsBySearchTermAsync(request.SearchTerm, cancellationToken);

            // Breid de WHERE-clausule uit met de nieuwe zoekcriteria.
            query = query.Where(o =>
                // 1. Zoek op Ordernummer
                o.OrderNumber.ToLower().Contains(searchTermLower) ||
                // 2. Zoek op Klant E-mailadres
                o.CustomerEmail.ToLower().Contains(searchTermLower) ||
                // 3. Zoek op Klantnaam (via de gevonden IDs)
                matchingUserIds.Contains(o.UserId) ||
                // 4. Zoek op Trackingnummer
                (o.ShippingDetails.TrackingNumber != null && o.ShippingDetails.TrackingNumber.ToLower().Contains(searchTermLower)) ||
                // 5. Zoek op Productnaam of SKU binnen de orderitems
                o.Items.Any(item =>
                    item.ProductName.ToLower().Contains(searchTermLower) ||
                    (item.Sku != null && item.Sku.ToLower().Contains(searchTermLower))
                )
            );
        }

        // === Pagination and Includes ===
        var totalCount = await query.CountAsync(cancellationToken);

        var orders = await query
            .OrderByDescending(o => o.OrderDate) // Sorteer op meest recente orders
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Include(o => o.Items) // Include items voor product thumbnails en total items count
            .Include(o => o.PaymentDetails) // Include payment details voor PaymentStatus
            .Include(o => o.ShippingDetails) // Include shipping details voor ShippingSummary
            .Include(o => o.ShippingAddress) // Include shipping address voor ShippingSummary (CountryCode)
            .ToListAsync(cancellationToken);

        // === Fetch User Names for Display ===
        var userIds = orders.Select(o => o.UserId).Distinct().ToList();
        var userNames = new Dictionary<Guid, string>();
        foreach (var userId in userIds)
        {
            userNames[userId] = await _identityService.GetUserFullNameAsync(userId) ?? "Unknown User";
        }

        // === Manual Mapping to AdminOrderListItemDto ===
        var dtoItems = orders.Select(order =>
        {
            var productThumbnails = order.Items
                .Where(item => !string.IsNullOrEmpty(item.ProductImageUrl))
                .Select(item => item.ProductImageUrl!)
                .Take(3)
                .ToList();

            return new AdminOrderListItemDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                OrderDate = order.OrderDate,
                Status = order.Status,
                PaymentStatus = order.PaymentDetails.PaymentStatus,
                GrandTotal = order.GrandTotal,
                Currency = order.Currency,
                TotalItems = order.Items.Sum(item => item.Quantity),
                ProductThumbnails = productThumbnails,
                CustomerName = userNames.GetValueOrDefault(order.UserId, "Unknown User"),
                CustomerEmail = order.CustomerEmail,
                HasCustomerNotes = !string.IsNullOrWhiteSpace(order.CustomerNotes),
                ShippingSummary = new ShippingSummaryDto(
                    order.ShippingAddress.CountryCode,
                    order.ShippingDetails.MethodName,
                    order.ShippingDetails.TrackingNumber
                )
            };
        }).ToList();

        return new PaginatedList<AdminOrderListItemDto>(dtoItems, totalCount, request.PageNumber, request.PageSize);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Queries/GetMyOrderByIdQuery.cs ---
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Domain.Entities.Order;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Queries;

public record GetMyOrderByIdQuery(Guid OrderId) : IRequest<OrderDetailDto>;

public class GetMyOrderByIdQueryHandler : IRequestHandler<GetMyOrderByIdQuery, OrderDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public GetMyOrderByIdQueryHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<OrderDetailDto> Handle(GetMyOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var order = await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order", request.OrderId);

        if (order.UserId != userId)
        {
            throw new ForbiddenAccessException("You are not authorized to view this order.");
        }

        var customerName = await _identityService.GetUserFullNameAsync(order.UserId) ?? "Unknown User";

        return MapToDetailDto(order, customerName);
    }

    private static OrderDetailDto MapToDetailDto(Order order, string customerName)
    {
        return new OrderDetailDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            OrderDate = order.OrderDate,
            Status = order.Status,
            UserId = order.UserId,
            CustomerName = customerName,
            CustomerEmail = order.CustomerEmail,
            SubTotal = order.SubTotal,
            ShippingCost = order.ShippingCost,
            TaxAmount = order.TaxAmount,
            DiscountAmount = order.DiscountAmount,
            GrandTotal = order.GrandTotal,
            Currency = order.Currency,
            ShippingAddress = order.ShippingAddress,
            BillingAddress = order.BillingAddress,
            ShippingDetails = new ShippingDetailsDto(order.ShippingDetails.MethodName, order.ShippingDetails.Cost, order.ShippingDetails.TrackingNumber, order.ShippingDetails.TrackingUrl, order.ShippingDetails.ShippedDate, order.ShippingDetails.EstimatedDeliveryDate),
            PaymentDetails = new PaymentDetailsDto(order.PaymentDetails.MethodFriendlyName, order.PaymentDetails.GatewayTransactionId, order.PaymentDetails.PaymentStatus),
            CustomerNotes = order.CustomerNotes,
            Items = order.Items.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductVariantId = oi.ProductVariantId,
                Quantity = oi.Quantity,
                ProductName = oi.ProductName,
                Sku = oi.Sku,
                ProductType = oi.ProductType,
                PricePerItem = oi.PricePerItem,
                ProductImageUrl = oi.ProductImageUrl,
                LineTotal = oi.LineTotal,
                TaxAmount = oi.TaxAmount,
                DiscountAmount = oi.DiscountAmount,
                VariantInfo = string.IsNullOrEmpty(oi.VariantInfoJson) ? null : JsonSerializer.Deserialize<List<OrderItemVariantAttributeDto>>(oi.VariantInfoJson)
            }).ToList()

        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Queries/GetMyOrdersQuery.cs ---
using System.Text.Json;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Mappings;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Domain.Entities.Order;
using Microsoft.EntityFrameworkCore;
using MediatR;

namespace RoyalCode.Application.Orders.Queries;

public record GetMyOrdersQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null)
    : IRequest<PaginatedList<OrderListItemDto>>;

public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, PaginatedList<OrderListItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public GetMyOrdersQueryHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<PaginatedList<OrderListItemDto>> Handle(GetMyOrdersQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var query = _context.Orders
            .AsNoTracking()
            .Where(o => o.UserId == userId);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTermLower = request.SearchTerm.ToLower();

            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(searchTermLower) ||
                o.CustomerEmail.ToLower().Contains(searchTermLower) ||
                (o.ShippingDetails.TrackingNumber != null && o.ShippingDetails.TrackingNumber.ToLower().Contains(searchTermLower)) ||
                o.Items.Any(item =>
                    item.ProductName.ToLower().Contains(searchTermLower) ||
                    (item.Sku != null && item.Sku.ToLower().Contains(searchTermLower))
                )
            );
        }

        var paginatedOrders = await query
            .Include(o => o.Items)
            .OrderByDescending(o => o.OrderDate)
            .PaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);

        var customerName = await _identityService.GetUserFullNameAsync(userId) ?? "Unknown User";

        var dtoItems = paginatedOrders.Items.Select(o => new OrderListItemDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            OrderDate = o.OrderDate,
            Status = o.Status,
            GrandTotal = o.GrandTotal,
            Currency = o.Currency,
            CustomerName = customerName,
            ShippingAddress = o.ShippingAddress,
            Items = o.Items.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductVariantId = oi.ProductVariantId,
                Quantity = oi.Quantity,
                ProductName = oi.ProductName,
                Sku = oi.Sku,
                ProductType = oi.ProductType,
                PricePerItem = oi.PricePerItem,
                ProductImageUrl = oi.ProductImageUrl,
                LineTotal = oi.LineTotal,
                TaxAmount = oi.TaxAmount,
                DiscountAmount = oi.DiscountAmount,
                VariantInfo = string.IsNullOrEmpty(oi.VariantInfoJson)
                    ? null
                    : JsonSerializer.Deserialize<List<OrderItemVariantAttributeDto>>(oi.VariantInfoJson)
            }).ToList()
        }).ToList();

        return new PaginatedList<OrderListItemDto>(dtoItems, paginatedOrders.TotalCount, paginatedOrders.PageNumber, request.PageSize);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Queries/GetOrderByIdQuery.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Domain.Entities.Order;
using System.Text.Json;

namespace RoyalCode.Application.Orders.Queries;

// De query accepteert nu een optionele 'view' parameter
public record GetOrderByIdQuery(Guid OrderId, string? View = null) : IRequest<object>;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, object>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetOrderByIdQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<object> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var orderQuery = _context.Orders.AsNoTracking();

        // Afhankelijk van de view, laden we meer of minder gerelateerde data
        if (request.View?.ToLower() == "pickpack")
        {
            orderQuery = orderQuery.Include(o => o.Items).Include(o => o.Fulfillments);
        }
        else // Volledige detailweergave
        {
            orderQuery = orderQuery
                .Include(o => o.Items)
                .Include(o => o.Fulfillments).ThenInclude(f => f.Items)
                .Include(o => o.History)
                .Include(o => o.InternalNotes)
                .Include(o => o.Refunds);
        }

        var order = await orderQuery.FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order", request.OrderId);

        var customerName = await _identityService.GetUserFullNameAsync(order.UserId) ?? "Unknown User";

        // Conditioneel mappen naar de juiste DTO
        if (request.View?.ToLower() == "pickpack")
        {
            return MapToPickingDto(order);
        }

        return MapToAdminDetailDto(order, customerName);
    }

    private static OrderPickingDto MapToPickingDto(Order order)
    {
        return new OrderPickingDto
        {
            OrderId = order.Id,
            ShippingAddress = order.ShippingAddress,
            CustomerNotes = order.CustomerNotes,
            Items = order.Items.Select(oi => new OrderItemForPickingDto(
                oi.Id, oi.Sku ?? "N/A", oi.ProductName,
                string.IsNullOrEmpty(oi.VariantInfoJson) ? null : JsonSerializer.Deserialize<List<OrderItemVariantAttributeDto>>(oi.VariantInfoJson),
                oi.Quantity, oi.ProductImageUrl
            )).ToList(),
            Fulfillment = order.Fulfillments.OrderByDescending(f => f.Created).Select(f => new FulfillmentForPickingDto(f.CarrierName, f.TrackingNumber, f.TrackingUrl)).FirstOrDefault()
        };
    }

    public static AdminOrderDetailDto MapToAdminDetailDto(Order order, string customerName)
    {
        return new AdminOrderDetailDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            OrderDate = order.OrderDate,
            Status = order.Status,
            Customer = new CustomerDto(order.UserId, customerName, order.CustomerEmail),
            FinancialSummary = new FinancialSummaryDto(order.SubTotal, order.ShippingCost, order.TaxAmount, order.DiscountAmount, order.GrandTotal, order.Currency),
            ShippingAddress = order.ShippingAddress,
            BillingAddress = order.BillingAddress,
            PaymentDetails = new PaymentDetailsDto(order.PaymentDetails.MethodFriendlyName, order.PaymentDetails.GatewayTransactionId, order.PaymentDetails.PaymentStatus),
            Items = order.Items.Select(oi => new AdminOrderItemDto(
                oi.Id, oi.ProductId, oi.ProductVariantId, oi.ProductName, oi.Sku, oi.ProductType, oi.Quantity,
                oi.PricePerItem, oi.LineTotal, oi.TaxAmount, oi.DiscountAmount,
                string.IsNullOrEmpty(oi.VariantInfoJson) ? null : JsonSerializer.Deserialize<List<OrderItemVariantAttributeDto>>(oi.VariantInfoJson),
                oi.ProductImageUrl
            )).ToList(),
            CustomerNotes = order.CustomerNotes,
            InternalNotes = order.InternalNotes.Select(n => new InternalNoteDto(n.Id, n.Created, n.AuthorName, n.Text)).OrderByDescending(n => n.CreatedAt).ToList(),
            Fulfillments = order.Fulfillments.Select(f => new FulfillmentDto(f.Id, f.Created, f.Status, f.CarrierName, f.TrackingNumber, f.TrackingUrl, f.ShippedDate, f.EstimatedDeliveryDate, f.Items.Select(fi => new FulfillmentItemDto(fi.OrderItemId, fi.Quantity)).ToList())).ToList(),
            History = order.History.Select(h => new HistoryEventDto(h.Timestamp, h.EventType, h.Author, h.Description)).OrderByDescending(h => h.Timestamp).ToList(),
            Refunds = order.Refunds.Select(r => new RefundDto(r.Id, r.Amount, r.Reason, r.RefundedAt, r.ProcessedBy, r.GatewayRefundId)).OrderByDescending(r => r.RefundedAt).ToList()
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Queries/GetOrderInvoiceDataQuery.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Orders.Queries;

// Een simpele DTO die alleen de benodigde data bevat
public record OrderInvoiceDataDto
{
    public string OrderNumber { get; init; } = string.Empty;
    public decimal GrandTotal { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record GetOrderInvoiceDataQuery(Guid OrderId) : IRequest<OrderInvoiceDataDto>;

public class GetOrderInvoiceDataQueryHandler : IRequestHandler<GetOrderInvoiceDataQuery, OrderInvoiceDataDto>
{
    private readonly IApplicationDbContext _context;

    public GetOrderInvoiceDataQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderInvoiceDataDto> Handle(GetOrderInvoiceDataQuery request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Where(o => o.Id == request.OrderId)
            .Select(o => new OrderInvoiceDataDto
            {
                OrderNumber = o.OrderNumber,
                GrandTotal = o.GrandTotal,
                Currency = o.Currency
            })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Order", request.OrderId);

        return order;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Queries/GetOrderLookupsQuery.cs ---
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Domain.Enums;

namespace RoyalCode.Application.Orders.Queries;

public record GetOrderLookupsQuery : IRequest<OrderLookupsDto>;

public class GetOrderLookupsQueryHandler : IRequestHandler<GetOrderLookupsQuery, OrderLookupsDto>
{
    private readonly IApplicationDbContext _context;

    public GetOrderLookupsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderLookupsDto> Handle(GetOrderLookupsQuery request, CancellationToken cancellationToken)
    {
        var statuses = Enum.GetNames(typeof(OrderStatus))
            .Select(name => JsonNamingPolicy.CamelCase.ConvertName(name))
            .ToList();

        var paymentMethods = await _context.Orders
            .Select(o => o.PaymentDetails.MethodFriendlyName)
            .Distinct()
            .OrderBy(pm => pm)
            .ToListAsync(cancellationToken);

        var shippingMethods = await _context.Orders
            .Select(o => o.ShippingDetails.MethodName)
            .Distinct()
            .OrderBy(sm => sm)
            .ToListAsync(cancellationToken);

        return new OrderLookupsDto
        {
            OrderStatuses = statuses,
            PaymentMethods = paymentMethods,
            ShippingMethods = shippingMethods
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Orders/Queries/GetProductLookupQuery.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Products.Queries;

public record ProductLookupDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Sku { get; init; }
    public decimal Price { get; init; }
    public string? ThumbnailUrl { get; init; }
}

public record GetProductLookupQuery(string? SearchTerm) : IRequest<List<ProductLookupDto>>;

public class GetProductLookupQueryHandler : IRequestHandler<GetProductLookupQuery, List<ProductLookupDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductLookupQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductLookupDto>> Handle(GetProductLookupQuery request, CancellationToken cancellationToken)
    {
        var query = _context.PhysicalProducts.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(term) || (p.Sku != null && p.Sku.ToLower().Contains(term)));
        }

        var products = await query
            .OrderBy(p => p.Name)
            .Take(20)
            .ToListAsync(cancellationToken);

        var mediaIds = products.SelectMany(p => p.MediaIds).Distinct().ToList();
        var mediaThumbnails = await _context.Media
            .Where(m => mediaIds.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id, m => m.ThumbnailUrl, cancellationToken);

        return products.Select(p => new ProductLookupDto
        {
            Id = p.Id,
            Name = p.Name,
            Sku = p.Sku,
            Price = p.Pricing.Price,
            ThumbnailUrl = p.MediaIds.Any() ? mediaThumbnails.GetValueOrDefault(p.MediaIds.First()) : null
        }).ToList();
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Commands/CreateProduct/CreateProduct.cs ---
/**
 * @file CreateProduct.cs
 * @Version 6.7.0 (Corrected Variant Generation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description Implements the use case for creating a product with flexible DTOs that
 *              accept null values for optional fields and collections, preventing deserialization errors.
 *              Corrected variant generation to use GenerateAttributeBasedVariantCombinations.
 */
using System.Text.Json;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;
using FluentValidation;
using System.Collections.Generic; // Voor List en Dictionary
using System.Linq;
using RoyalCode.Application.Products.Queries.GetAllAttributeValues; // Voor LINQ-methoden

namespace RoyalCode.Application.Products.Commands.CreateProduct;

#region Data Transfer Objects (DTOs) for the Command Payload

public record CreateSeoDto(string Title, string Description, List<string>? Keywords, string? ImageUrl); // DE FIX: ImageUrl is nu string?

public record CreateVariantOverrideDto
{
    public List<string> TempAttributeValueIds { get; init; } = new(); 
    public decimal? Price { get; init; }
    public decimal? OriginalPrice { get; init; }
    public int? StockQuantity { get; init; }
    public string? Sku { get; init; }
    public bool? IsDefault { get; init; }
    public bool? IsActive { get; init; }
    public List<Guid>? MediaIds { get; init; }
}


public record CreateAttributeValueDto(
    string TempId,
    string Value,
    string DisplayNameKeyOrText,
    string? ColorHex,
    decimal? PriceModifier,
    bool IsAvailable)
{
    public RoyalCode.Application.Products.Queries.GetAllAttributeValues.AttributeValueSelectionDto? PredefinedValue { get; init; }
}

public record CreateVariantAttributeDto(
    string TempId,
    string NameKeyOrText,
    string Type,
    string DisplayType,
    bool IsRequired,
    List<CreateAttributeValueDto> Values);

// --- DE FIX: Prijzen zijn nu nullable ---
public record CreatePricingDto(decimal? Price, decimal? OriginalPrice);
public record AgeRestrictionsDto(int? MinAge, int? MaxAge);

public record CreatePhysicalProductConfigDto(
    CreatePricingDto Pricing,
    string? Sku,
    string? Brand,
    bool ManageStock,
    int? StockQuantity,
    bool AllowBackorders,
    int? LowStockThreshold,
    ProductAvailabilityRules? AvailabilityRules,
    AgeRestrictionsDto? AgeRestrictions,
    List<ProductDisplaySpecification>? DisplaySpecifications);


#endregion

public record CreateProductCommand : IRequest<Guid>
{
    public string Type { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? ShortDescription { get; init; }
    public string Status { get; init; } = string.Empty;
    public bool IsActive { get; init; } = true;
    public bool IsFeatured { get; init; } = false;
    public string Currency { get; init; } = "EUR";
    public string AppScope { get; init; } = "royal-store";
    // --- DE FIX: Collecties zijn nu nullable ---
    public List<string>? Tags { get; init; }
    public List<Guid>? CategoryIds { get; init; }
    public Guid? FeaturedImageId { get; init; }
    public CreateSeoDto? Seo { get; init; }
    public List<CreateVariantAttributeDto> VariantAttributes { get; init; } = new();
    public List<CreateVariantOverrideDto> VariantOverrides { get; init; } = new();
    public CreatePhysicalProductConfigDto? PhysicalProductConfig { get; init; }
    public Dictionary<string, object>? CustomAttributes { get; init; }
}

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(v => v.Name).NotEmpty().MaximumLength(255);
        RuleFor(v => v.Type).NotEmpty().IsEnumName(typeof(ProductType), caseSensitive: false);

        RuleFor(v => v.PhysicalProductConfig)
            .NotNull()
            .When(v => v.Type.Equals(ProductType.Physical.ToString(), StringComparison.OrdinalIgnoreCase))
            .WithMessage("PhysicalProductConfig is required for physical products.");

        // --- DE FIX: Gebruik de gedeelde validator ---
        RuleForEach(v => v.VariantAttributes).SetValidator(new RoyalCode.Application.Products.Common.CreateVariantAttributeDtoValidator());
    }
}

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = CreateProductEntity(request);
        var tempIdToGuidMap = await ProcessVariantAttributes(request, product, cancellationToken);

        // --- DE FIX: Gebruik de nieuwe GenerateAttributeBasedVariantCombinations methode ---
        var generatedVariants = product.GenerateAttributeBasedVariantCombinations();
        // Voeg deze gegenereerde varianten toe aan het product
        ProcessVariantOverrides(request, product, tempIdToGuidMap, generatedVariants);

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return product.Id;
    }

    private ProductBase CreateProductEntity(CreateProductCommand request)
    {
        if (!Enum.TryParse<ProductType>(request.Type, true, out var productType))
            throw new ValidationException("Invalid product type specified.");

        ProductBase product;
        switch (productType)
        {
            case ProductType.Physical:
                var config = request.PhysicalProductConfig!;
                var price = config.Pricing.Price ?? 0m;
                var originalPrice = config.Pricing.OriginalPrice ?? price;
                var pricing = new Pricing(price, originalPrice);

                var physicalProduct = new PhysicalProduct(request.Name, request.Description, request.AppScope, request.Currency, pricing, config.ManageStock);

                physicalProduct.SetInventoryDetails(config.Sku, config.Brand);
                physicalProduct.SetStockRules(config.AllowBackorders, config.LowStockThreshold);

                // --- DE FIX: Roep SetInitialStock aan ---
                physicalProduct.SetInitialStock(config.StockQuantity ?? 0);

                physicalProduct.SetAvailabilityRules(config.AvailabilityRules);
                if (config.AgeRestrictions != null && config.AgeRestrictions.MinAge.HasValue && config.AgeRestrictions.MaxAge.HasValue)
                    physicalProduct.SetAgeRestrictions(config.AgeRestrictions.MinAge.Value, config.AgeRestrictions.MaxAge.Value);
                config.DisplaySpecifications?.ForEach(spec => physicalProduct.AddDisplaySpecification(spec));

                product = physicalProduct;
                break;
            default:
                throw new NotImplementedException($"Product type '{request.Type}' is not yet supported.");
        }

        if (Enum.TryParse<ProductStatus>(request.Status, true, out var status) && status == ProductStatus.Published)
            product.Publish();

        product.SetFeaturedStatus(request.IsFeatured);
        product.SetShortDescription(request.ShortDescription);

        (request.Tags ?? new()).ForEach(tag => product.AddTag(tag));
        (request.CategoryIds ?? new()).ForEach(catId => product.AddCategory(catId));

        // --- DE FIX: Gebruik de bestaande SetFeaturedImageId methode ---
        product.SetFeaturedImageId(request.FeaturedImageId);

        // --- DE FIX: Roep SetSeoData aan ---
        if (request.Seo != null)
        {
            product.SetSeoData(request.Seo.Title, request.Seo.Description, request.Seo.Keywords, request.Seo.ImageUrl);
        }

        if (request.CustomAttributes != null && request.CustomAttributes.Any())
        {
            product.SetCustomAttributes(JsonSerializer.Serialize(request.CustomAttributes));
        }

        return product;
    }


    private async Task<Dictionary<string, Guid>> ProcessVariantAttributes(CreateProductCommand request, ProductBase product, CancellationToken ct)
    {
        var tempIdToGuidMap = new Dictionary<string, Guid>();
        var assignmentsToAdd = new List<ProductAttributeAssignment>();

        var allRequestedAttributeValueIds = request.VariantAttributes
            .SelectMany(attr => attr.Values)
            .Where(val => val.PredefinedValue != null && Guid.TryParse(val.PredefinedValue.Id.ToString(), out _))
            .Select(val => Guid.Parse(val.PredefinedValue!.Id.ToString()))
            .Distinct()
            .ToList();

        var existingAttributeValues = await _context.AttributeValues
            .Where(av => allRequestedAttributeValueIds.Contains(av.Id))
            .ToDictionaryAsync(av => av.Id, av => av, ct);

        foreach (var attrDto in request.VariantAttributes)
        {
            if (!Enum.TryParse<VariantAttributeType>(attrDto.Type, true, out var attrType))
                throw new ValidationException($"Invalid attribute type '{attrDto.Type}'.");

            foreach (var valDto in attrDto.Values)
            {
                AttributeValue? currentAttributeValue = null;
                Guid valueId;

                if (valDto.PredefinedValue != null && Guid.TryParse(valDto.PredefinedValue.Id.ToString(), out Guid predefinedId))
                {
                    if (existingAttributeValues.TryGetValue(predefinedId, out var existingValue))
                    {
                        valueId = existingValue.Id;
                        currentAttributeValue = existingValue;
                    }
                    else
                    {
                        var newValue = new AttributeValue(valDto.Value, valDto.DisplayNameKeyOrText, attrType);
                        newValue.SetMetadata(valDto.ColorHex, null, valDto.PriceModifier, PriceModifierType.Fixed);
                        _context.AttributeValues.Add(newValue);
                        valueId = newValue.Id;
                        currentAttributeValue = newValue;
                    }
                }
                else
                {
                    var newValue = new AttributeValue(valDto.Value, valDto.DisplayNameKeyOrText, attrType);
                    newValue.SetMetadata(valDto.ColorHex, null, valDto.PriceModifier, PriceModifierType.Fixed);
                    _context.AttributeValues.Add(newValue);
                    valueId = newValue.Id;
                    currentAttributeValue = newValue;
                }

                tempIdToGuidMap[valDto.TempId] = valueId;

                var newAssignment = new ProductAttributeAssignment(product.Id, valueId, 0);
                newAssignment.AttributeValue = currentAttributeValue!; // Deze is cruciaal!
                assignmentsToAdd.Add(newAssignment);
            }
        }
        product.AddAttributeAssignments(assignmentsToAdd);
        return tempIdToGuidMap;
    }

    private void ProcessVariantOverrides(CreateProductCommand request, ProductBase product, Dictionary<string, Guid> tempIdToGuidMap, List<ProductVariantCombination> generatedVariants)
    {
        // De 'generatedVariants' zijn de basis. We passen deze aan op basis van de overrides.
        foreach (var overrideDto in request.VariantOverrides)
        {
            if (overrideDto.TempAttributeValueIds == null || !overrideDto.TempAttributeValueIds.Any()) continue;

            // --- DE FIX: Maak de matching-logica robuuster ---
            // Deze logica kan nu zowel tijdelijke string-ID's (uit de map) als directe GUID's (uit de payload) verwerken.
            var realAttributeValueIds = overrideDto.TempAttributeValueIds
                .Select(tempId =>
                {
                    // Poging 1: Zoek op als een tijdelijke ID
                    if (tempIdToGuidMap.TryGetValue(tempId, out var realId))
                    {
                        return realId;
                    }
                    // Poging 2: Parse de string direct als een GUID
                    if (Guid.TryParse(tempId, out var parsedGuid))
                    {
                        return parsedGuid;
                    }
                    return Guid.Empty;
                })
                .Where(id => id != Guid.Empty)
                .ToHashSet();

            // Als er geen geldige IDs zijn gevonden, ga door naar de volgende override.
            if (!realAttributeValueIds.Any()) continue;
            // --- EINDE FIX ---

            var variantToOverride = generatedVariants
                .FirstOrDefault(vc => vc.AttributeValueIds.ToHashSet().SetEquals(realAttributeValueIds));

            if (variantToOverride != null)
            {
                // Pas de prijzen, voorraad, en andere eigenschappen toe van de override
                if (overrideDto.Price.HasValue)
                {
                    variantToOverride.SetPrices(overrideDto.Price.Value, overrideDto.OriginalPrice ?? overrideDto.Price.Value);
                }
                if (overrideDto.StockQuantity.HasValue)
                {
                    variantToOverride.SetStock(overrideDto.StockQuantity.Value);
                }
                if (overrideDto.IsDefault.HasValue)
                {
                    // Zorg ervoor dat slechts één variant de default is
                    if (overrideDto.IsDefault.Value)
                    {
                        generatedVariants.ForEach(v => v.SetAsDefault(false));
                    }
                    variantToOverride.SetAsDefault(overrideDto.IsDefault.Value);
                }
                if (overrideDto.IsActive.HasValue)
                {
                    variantToOverride.SetActive(overrideDto.IsActive.Value);
                }

                // --- Deze logica was al correct, maar werd nooit bereikt ---
                if (overrideDto.MediaIds != null)
                {
                    variantToOverride.ClearMedia();
                    foreach (var mediaId in overrideDto.MediaIds)
                    {
                        variantToOverride.AddMedia(mediaId);
                    }
                }
            }
        }

        // Zorg ervoor dat er altijd een default is als er varianten zijn
        if (generatedVariants.Any() && !generatedVariants.Any(vc => vc.IsDefault))
        {
            generatedVariants.First().SetAsDefault(true);
        }

        // Voeg de definitieve, aangepaste lijst van varianten toe aan het product
        foreach (var variant in generatedVariants)
        {
            product.AddVariantCombination(variant);
        }
    }

}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Commands/DeleteProduct/DeleteProduct.cs ---
/**
 * @file DeleteProduct.cs
 * @Version 2.1.0 (With Concurrency Handling)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Defines the command and handler for deleting a product,
 *              now with proper exception handling for concurrency issues.
 */
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Products.Commands.DeleteProduct;

public record DeleteProductCommand(Guid Id) : IRequest;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Products
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        _context.Products.Remove(entity);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("The product was modified or deleted by another user. Please refresh and try again.", "ENTITY_CONFLICT");
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Commands/UpdateCommand/UpdateProductCommand.cs ---
/**
 * @file UpdateProductCommand.cs
 * @Version 29.0.0 (CLEAN ARCHITECTURE - Reuse GetProductById Query)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-05
 * @Description Cleaned up UpdateProductCommandHandler that reuses existing GetProductByIdQuery
 *              instead of duplicating DTO mapping logic. This ensures consistency between
 *              GET and UPDATE responses while reducing code duplication.
 */
using System.Text.Json;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Products.Commands.CreateProduct;
using RoyalCode.Application.Products.Queries.GetProductById;
using RoyalCode.Application.Products.Common;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;
using System.Linq;
using System.Collections.Generic;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Products.Commands.UpdateProduct;

#region DTOs
public record UpdateProductAgeRestrictionsDto(int? MinAge, int? MaxAge);

public record UpdateProductPhysicalProductConfigDto(
    CreatePricingDto Pricing,
    string? Sku,
    string? Brand,
    bool ManageStock,
    int? StockQuantity,
    bool AllowBackorders,
    int? LowStockThreshold,
    ProductAvailabilityRules? AvailabilityRules,
    UpdateProductAgeRestrictionsDto? AgeRestrictions,
    List<ProductDisplaySpecification>? DisplaySpecifications);

public record UpdateProductCommand : IRequest<ProductDetailDto>
{
    public Guid Id { get; set; }
    public string Type { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? ShortDescription { get; init; }
    public string Status { get; init; } = string.Empty;
    public bool IsActive { get; init; } = true;
    public bool IsFeatured { get; init; } = false;
    public string Currency { get; init; } = "EUR";
    public string AppScope { get; init; } = "royal-store";
    public List<string>? Tags { get; init; }
    public List<Guid>? CategoryIds { get; init; }
    public List<Guid>? MediaIds { get; init; }
    public Guid? FeaturedImageId { get; init; }
    public CreateSeoDto? Seo { get; init; }
    public List<CreateVariantAttributeDto> VariantAttributes { get; init; } = new();
    public List<CreateVariantOverrideDto> VariantOverrides { get; init; } = new();
    public UpdateProductPhysicalProductConfigDto? PhysicalProductConfig { get; init; }
    public Dictionary<string, object>? CustomAttributes { get; init; }
}
#endregion

#region Validator
public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.Name).NotEmpty().MaximumLength(255);
        RuleFor(v => v.Type).NotEmpty().IsEnumName(typeof(ProductType), caseSensitive: false);

        RuleFor(v => v.PhysicalProductConfig)
            .NotNull()
            .When(v => v.Type.Equals(ProductType.Physical.ToString(), StringComparison.OrdinalIgnoreCase))
            .WithMessage("PhysicalProductConfig is required for physical products.");

        RuleForEach(v => v.VariantAttributes).SetValidator(new RoyalCode.Application.Products.Common.CreateVariantAttributeDtoValidator());
    }
}
#endregion

#region Command Handler
public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ProductDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMediator _mediator;

    public UpdateProductCommandHandler(IApplicationDbContext context, IMediator mediator)
    {
        _context = context;
        _mediator = mediator;
    }

    public async Task<ProductDetailDto> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.AttributeAssignments).ThenInclude(pa => pa.AttributeValue)
            .Include(p => p.VariantCombinations)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, product);
        var physicalProduct = product as PhysicalProduct ?? throw new InvalidOperationException("Only physical products can be updated via this handler.");

        // STAP 1: Update basis product details
        UpdateBaseProductDetails(physicalProduct, request);

        // STAP 2: ALLEEN als er variant attributes changes zijn, doe dan de sync
        if (request.VariantAttributes != null && request.VariantAttributes.Any())
        {
            var tempIdToAttributeValueMap = await GetTempIdMapAndCreateNewValues(request.VariantAttributes, cancellationToken);
            SyncProductAttributeAssignments(physicalProduct, request.VariantAttributes, tempIdToAttributeValueMap);
            await HydrateNavigationProperties(physicalProduct, cancellationToken);

            // Alleen nieuwe varianten genereren als er echt attribute changes zijn
            var currentVariantCount = physicalProduct.VariantCombinations.Count;
            var expectedVariantCount = CalculateExpectedVariantCount(request.VariantAttributes);

            if (currentVariantCount != expectedVariantCount)
            {
                var desiredVariantSpecs = GenerateDesiredVariantSpecifications(physicalProduct, request.VariantOverrides, tempIdToAttributeValueMap);
                SyncProductVariantCombinationsWithChangeTracking(physicalProduct, desiredVariantSpecs);
            }
        }

        // STAP 3: Update ALLEEN de variant images als er overrides zijn
        if (request.VariantOverrides != null && request.VariantOverrides.Any())
        {
            await UpdateVariantImagesOnly(physicalProduct, request.VariantOverrides, cancellationToken);
        }

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            throw new ConflictException("The product was modified by another process. Please refresh and try again.", "PRODUCT_CONCURRENCY_CONFLICT", ex);
        }

        // CRITICAL CHANGE: Use existing GetProductByIdQuery instead of custom DTO mapping
        var query = new GetProductByIdQuery(request.Id);
        var result = await _mediator.Send(query, cancellationToken);

        return result ?? throw new NotFoundException(nameof(ProductBase), request.Id);
    }

    /// <summary>
    /// Update alleen de images van bestaande variant combinations
    /// zonder de hele variant structure te rebuilden
    /// </summary>
    private async Task UpdateVariantImagesOnly(PhysicalProduct product, List<CreateVariantOverrideDto> overrides, CancellationToken cancellationToken)
    {
        foreach (var overrideDto in overrides.Where(o => o.MediaIds != null))
        {
            if (overrideDto.TempAttributeValueIds == null || !overrideDto.TempAttributeValueIds.Any())
                continue;

            // Vind de bestaande variant op basis van attribute value IDs
            var existingVariant = await FindExistingVariantForOverride(product, overrideDto, cancellationToken);

            if (existingVariant != null)
            {
                // Update alleen de media IDs - geen andere properties
                existingVariant.ClearMedia();
                foreach (var mediaId in overrideDto.MediaIds!)
                {
                    existingVariant.AddMedia(mediaId);
                }

                // Optioneel: update ook andere properties van de override
                if (overrideDto.Price.HasValue)
                {
                    var originalPrice = overrideDto.OriginalPrice ?? overrideDto.Price.Value;
                    existingVariant.SetPrices(overrideDto.Price.Value, originalPrice);
                }

                if (overrideDto.StockQuantity.HasValue)
                {
                    existingVariant.SetStock(overrideDto.StockQuantity.Value);
                }

                if (overrideDto.IsDefault.HasValue)
                {
                    existingVariant.SetAsDefault(overrideDto.IsDefault.Value);
                }

                if (overrideDto.IsActive.HasValue)
                {
                    existingVariant.SetActive(overrideDto.IsActive.Value);
                }
            }
        }
    }

    private async Task<ProductVariantCombination?> FindExistingVariantForOverride(
        PhysicalProduct product,
        CreateVariantOverrideDto overrideDto,
        CancellationToken cancellationToken)
    {
        // Converteer temp IDs naar echte attribute value IDs
        var attributeValueIds = new List<Guid>();

        foreach (var tempId in overrideDto.TempAttributeValueIds!)
        {
            // Probeer eerst als GUID te parsen
            if (Guid.TryParse(tempId, out var parsedGuid))
            {
                attributeValueIds.Add(parsedGuid);
            }
            else
            {
                // Als het een temp ID is, zoek de bijbehorende attribute value
                var attributeValue = await _context.AttributeValues
                    .FirstOrDefaultAsync(av => av.Value == tempId, cancellationToken);
                if (attributeValue != null)
                {
                    attributeValueIds.Add(attributeValue.Id);
                }
            }
        }

        // Zoek de variant die exact deze attribute value IDs heeft
        return product.VariantCombinations
            .FirstOrDefault(vc => vc.AttributeValueIds.ToHashSet().SetEquals(attributeValueIds.ToHashSet()));
    }

    private int CalculateExpectedVariantCount(List<CreateVariantAttributeDto> attributeDtos)
    {
        if (!attributeDtos.Any()) return 0;

        int totalCombinations = 1;
        foreach (var attr in attributeDtos)
        {
            totalCombinations *= Math.Max(1, attr.Values.Count);
        }
        return totalCombinations;
    }

    /// <summary>
    /// KRITIEKE FIX: Hydrateer de AttributeValue navigatie properties op alle ProductAttributeAssignments
    /// in de in-memory product collectie voordat variant generation wordt aangeroepen.
    /// </summary>
    private async Task HydrateNavigationProperties(PhysicalProduct product, CancellationToken cancellationToken)
    {
        // Verzamel alle AttributeValueIds uit de huidige assignments
        var attributeValueIds = product.AttributeAssignments
            .Select(paa => paa.AttributeValueId)
            .Distinct()
            .ToList();

        if (!attributeValueIds.Any()) return;

        // Laad alle AttributeValues uit de database
        var attributeValues = await _context.AttributeValues
            .Where(av => attributeValueIds.Contains(av.Id))
            .ToDictionaryAsync(av => av.Id, av => av, cancellationToken);

        // Hydrateer de navigatie properties op alle assignments in de product collectie
        foreach (var assignment in product.AttributeAssignments)
        {
            if (assignment.AttributeValue == null && attributeValues.TryGetValue(assignment.AttributeValueId, out var attributeValue))
            {
                assignment.AttributeValue = attributeValue;
            }
        }
    }

    private void UpdateBaseProductDetails(PhysicalProduct product, UpdateProductCommand request)
    {
        product.UpdateBasicInfo(request.Name, request.Description);
        product.SetShortDescription(request.ShortDescription);
        product.SetFeaturedStatus(request.IsFeatured);

        if (Enum.TryParse<ProductStatus>(request.Status, true, out var status))
        {
            if (status == ProductStatus.Published && product.Status != ProductStatus.Published) product.Publish();
            else if (status == ProductStatus.Archived && product.Status != ProductStatus.Archived) product.Archive();
        }

        if (request.CategoryIds != null) product.SetCategories(request.CategoryIds);
        if (request.MediaIds != null)
        {
            product.ClearMediaIds();
            request.MediaIds.ForEach(mediaId => product.AddMedia(mediaId));
        }
        product.SetFeaturedImageId(request.FeaturedImageId);
        if (request.Seo != null) product.SetSeoData(request.Seo.Title, request.Seo.Description, request.Seo.Keywords, request.Seo.ImageUrl);
        if (request.CustomAttributes != null) product.SetCustomAttributes(JsonSerializer.Serialize(request.CustomAttributes));
        else product.SetCustomAttributes(null);

        var config = request.PhysicalProductConfig!;
        var price = config.Pricing.Price ?? 0m;
        var originalPrice = config.Pricing.OriginalPrice ?? price;
        product.UpdatePricing(price, originalPrice);
        product.SetInventoryDetails(config.Sku, config.Brand);
        product.SetStockRules(config.AllowBackorders, config.LowStockThreshold);
        product.SetInitialStock(config.StockQuantity ?? 0);
        product.SetAvailabilityRules(config.AvailabilityRules);
        if (config.AgeRestrictions != null && config.AgeRestrictions.MinAge.HasValue && config.AgeRestrictions.MaxAge.HasValue) product.SetAgeRestrictions(config.AgeRestrictions.MinAge.Value, config.AgeRestrictions.MaxAge.Value);
        else product.SetAgeRestrictions(0, 0);
        product.ClearDisplaySpecifications();
        config.DisplaySpecifications?.ForEach(product.AddDisplaySpecification);
    }

    private async Task<Dictionary<string, AttributeValue>> GetTempIdMapAndCreateNewValues(List<CreateVariantAttributeDto> attributeDtos, CancellationToken ct)
    {
        var tempIdToAttributeValueMap = new Dictionary<string, AttributeValue>();
        foreach (var attrDto in attributeDtos)
        {
            if (!Enum.TryParse<VariantAttributeType>(attrDto.Type, true, out var attrType)) continue;
            foreach (var valDto in attrDto.Values)
            {
                var existingValue = await _context.AttributeValues.FirstOrDefaultAsync(av => av.AttributeType == attrType && av.Value == valDto.Value, ct);
                AttributeValue valueEntity;
                if (existingValue == null)
                {
                    valueEntity = new AttributeValue(valDto.Value, valDto.DisplayNameKeyOrText, attrType);
                    valueEntity.SetMetadata(valDto.ColorHex, null, valDto.PriceModifier, PriceModifierType.Fixed);
                    _context.AttributeValues.Add(valueEntity);
                }
                else
                {
                    existingValue.UpdateMetadata(valDto.DisplayNameKeyOrText, valDto.ColorHex, valDto.PriceModifier, PriceModifierType.Fixed);
                    valueEntity = existingValue;
                }
                tempIdToAttributeValueMap[valDto.TempId] = valueEntity;
            }
        }
        return tempIdToAttributeValueMap;
    }

    private void SyncProductAttributeAssignments(ProductBase product, List<CreateVariantAttributeDto> desiredAttributeDtos, Dictionary<string, AttributeValue> tempIdToAttributeValueMap)
    {
        var desiredAssignments = desiredAttributeDtos
            .SelectMany(attr => attr.Values)
            .Select(val =>
            {
                if (tempIdToAttributeValueMap.TryGetValue(val.TempId, out var attrValue))
                {
                    var assignment = new ProductAttributeAssignment(product.Id, attrValue.Id, 0);
                    assignment.AttributeValue = attrValue; // Essentieel voor de in-memory state
                    return assignment;
                }
                return null;
            })
            .Where(a => a != null)
            .Cast<ProductAttributeAssignment>()
            .ToList();

        var currentAssignmentValueIds = product.AttributeAssignments.Select(a => a.AttributeValueId).ToHashSet();
        var desiredAssignmentValueIds = desiredAssignments.Select(a => a.AttributeValueId).ToHashSet();

        var assignmentsToRemove = product.AttributeAssignments.Where(a => !desiredAssignmentValueIds.Contains(a.AttributeValueId)).ToList();
        foreach (var assignment in assignmentsToRemove)
        {
            product.RemoveAttributeAssignment(assignment.AttributeValueId);
            _context.Entry(assignment).State = EntityState.Deleted;
        }

        var assignmentsToAdd = desiredAssignments.Where(d => !currentAssignmentValueIds.Contains(d.AttributeValueId)).ToList();
        if (assignmentsToAdd.Any())
        {
            product.AddAttributeAssignments(assignmentsToAdd);
            _context.ProductAttributeAssignments.AddRange(assignmentsToAdd);
        }
    }

    private List<VariantSpecification> GenerateDesiredVariantSpecifications(PhysicalProduct product, List<CreateVariantOverrideDto> overrideDtos, Dictionary<string, AttributeValue> tempIdToAttributeValueMap)
    {
        var generatedVariants = product.GenerateAttributeBasedVariantCombinations();
        var variantSpecs = new List<VariantSpecification>();
        foreach (var variant in generatedVariants)
        {
            var spec = new VariantSpecification
            {
                AttributeValueIds = variant.AttributeValueIds.ToList(),
                Sku = variant.Sku,
                Price = variant.Price,
                OriginalPrice = variant.OriginalPrice,
                StockQuantity = variant.StockQuantity ?? 0,
                IsActive = variant.IsActive,
                IsDefault = variant.IsDefault,
                MediaIds = variant.MediaIds.ToList()
            };

            var overrideDto = overrideDtos.FirstOrDefault(o =>
            {
                if (o.TempAttributeValueIds == null || !o.TempAttributeValueIds.Any()) return false;
                var overrideAttributeGuids = o.TempAttributeValueIds.Select(tempId =>
                {
                    if (tempIdToAttributeValueMap.TryGetValue(tempId, out var attrValue)) return attrValue.Id;
                    if (Guid.TryParse(tempId, out var parsedGuid)) return parsedGuid;
                    return Guid.Empty;
                }).Where(id => id != Guid.Empty).ToHashSet();
                return overrideAttributeGuids.SetEquals(spec.AttributeValueIds);
            });

            if (overrideDto != null)
            {
                spec.Sku = overrideDto.Sku ?? spec.Sku;
                if (overrideDto.Price.HasValue)
                {
                    spec.Price = overrideDto.Price.Value;
                    if (!overrideDto.OriginalPrice.HasValue) spec.OriginalPrice = overrideDto.Price.Value;
                }
                if (overrideDto.OriginalPrice.HasValue) spec.OriginalPrice = overrideDto.OriginalPrice.Value;
                spec.StockQuantity = overrideDto.StockQuantity ?? spec.StockQuantity;
                spec.IsDefault = overrideDto.IsDefault ?? spec.IsDefault;
                spec.IsActive = overrideDto.IsActive ?? spec.IsActive;
                if (overrideDto.MediaIds != null) spec.MediaIds = overrideDto.MediaIds;
            }
            variantSpecs.Add(spec);
        }

        if (variantSpecs.Any() && !variantSpecs.Any(vs => vs.IsDefault)) variantSpecs.First().IsDefault = true;
        return variantSpecs;
    }

    private void SyncProductVariantCombinationsWithChangeTracking(PhysicalProduct product, List<VariantSpecification> desiredSpecs)
    {
        var currentVariants = product.VariantCombinations.ToList();
        var desiredVariantMap = desiredSpecs.ToDictionary(spec => CreateDeterministicGuid(product.Id, spec.AttributeValueIds), spec => spec);

        // Verwijder varianten die niet meer gewenst zijn
        var variantsToRemove = currentVariants.Where(current => !desiredVariantMap.ContainsKey(current.Id)).ToList();
        if (variantsToRemove.Any())
        {
            _context.ProductVariantCombinations.RemoveRange(variantsToRemove);
        }

        // Voeg nieuwe varianten toe of update bestaande
        foreach (var kvp in desiredVariantMap)
        {
            var variantId = kvp.Key;
            var spec = kvp.Value;
            var existingVariant = currentVariants.FirstOrDefault(v => v.Id == variantId);

            if (existingVariant != null)
            {
                // De variant bestaat al, werk hem bij. EF Core trackt dit als 'Modified'.
                UpdateVariantFromSpecification(existingVariant, spec);
            }
            else
            {
                // De variant is nieuw, maak hem aan en voeg hem toe.
                var newVariant = CreateVariantFromSpecification(product.Id, spec);
                product.AddVariantCombination(newVariant); // Voeg toe aan de in-memory collectie van de aggregate root
                // EF Core zal dit detecteren als een 'Added' entiteit omdat het nieuw is in de collectie.
            }
        }
    }

    private void UpdateVariantFromSpecification(ProductVariantCombination variant, VariantSpecification spec)
    {
        variant.SetPrices(spec.Price, spec.OriginalPrice);
        variant.SetStock(spec.StockQuantity ?? 0);
        variant.SetAsDefault(spec.IsDefault);
        variant.SetActive(spec.IsActive);
        variant.ClearMedia();
        spec.MediaIds.ForEach(variant.AddMedia);
    }

    private ProductVariantCombination CreateVariantFromSpecification(Guid productId, VariantSpecification spec)
    {
        var variant = new ProductVariantCombination(productId, spec.Sku, spec.AttributeValueIds);
        variant.SetPrices(spec.Price, spec.OriginalPrice);
        variant.SetStock(spec.StockQuantity ?? 0);
        variant.SetAsDefault(spec.IsDefault);
        variant.SetActive(spec.IsActive);
        spec.MediaIds.ForEach(variant.AddMedia);
        return variant;
    }

    /// <summary>
    /// Creëert een deterministisch GUID gebaseerd op ProductId en de gesorteerde AttributeValueIds.
    /// Dit zorgt ervoor dat dezelfde combinatie van attributen altijd dezelfde GUID krijgt.
    /// </summary>
    private static Guid CreateDeterministicGuid(Guid productId, IEnumerable<Guid> attributeValueIds)
    {
        // Sorteer de AttributeValueIds om consistentie te garanderen, ongeacht de invoervolgorde
        var combinedString = $"{productId:N}-{string.Join("-", attributeValueIds.OrderBy(id => id).Select(id => id.ToString("N")))}";
        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(combinedString));
        return new Guid(hash);
    }
}

internal class VariantSpecification
{
    public List<Guid> AttributeValueIds { get; set; } = new();
    public string Sku { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int? StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDefault { get; set; } = false;
    public List<Guid> MediaIds { get; set; } = new();
}
#endregion
--- END OF FILE ---

--- START OF FILE src/Application/Products/Common/CategoryDtos.cs ---
/**
 * @file CategoryDtos.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description Centralized DTOs for product category information, accessible across the Products feature.
 */

using System; // Nodig voor Guid
using System.Collections.Generic; // Nodig voor IReadOnlyCollection

namespace RoyalCode.Application.Products.Common;

public class ProductCategoryDto
{
    public Guid Id { get; }
    public string Key { get; } // Gebruikt nu Key ipv Name/Slug

    public ProductCategoryDto(Guid id, string key)
    {
        Id = id;
        Key = key;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Common/CreateAttributeValueDtoValidator.cs ---
/**
 * @file CreateAttributeValueDtoValidator.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-02
 * @Description Validator for CreateAttributeValueDto, now in a shared location.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix CS0246 in UpdateProductCommand.cs
 */
using FluentValidation;
using RoyalCode.Application.Products.Commands.CreateProduct; // Nodig voor CreateAttributeValueDto

namespace RoyalCode.Application.Products.Common;

public class CreateAttributeValueDtoValidator : AbstractValidator<CreateAttributeValueDto>
{
    public CreateAttributeValueDtoValidator()
    {
        RuleFor(v => v.Value).NotEmpty().MaximumLength(100);
        RuleFor(v => v.DisplayNameKeyOrText).NotEmpty().MaximumLength(100);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Common/CreateVariantAttributeDtoValidator.cs ---
/**
 * @file CreateVariantAttributeDtoValidator.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-02
 * @Description Validator for CreateVariantAttributeDto, now in a shared location.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix CS0246 in UpdateProductCommand.cs
 */
using FluentValidation;
using RoyalCode.Application.Products.Commands.CreateProduct; // Nodig voor CreateVariantAttributeDto

namespace RoyalCode.Application.Products.Common;

public class CreateVariantAttributeDtoValidator : AbstractValidator<CreateVariantAttributeDto>
{
    public CreateVariantAttributeDtoValidator()
    {
        RuleFor(v => v.NameKeyOrText).NotEmpty().MaximumLength(100);
        RuleFor(v => v.Type).NotEmpty();
        RuleFor(v => v.Values).NotEmpty();
        RuleForEach(v => v.Values).SetValidator(new CreateAttributeValueDtoValidator());
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Common/ProductDtoProcessor.cs ---
/**
 * @file ProductDtoProcessor.cs
 * @Version 17.0.0 (CONSISTENCY FIX - SelectedVariant with Media like ProductList)
 * @Author Royal-Code MonorepoAppDevAI  
 * @Date 2025-09-06
 * @Description Updated to match ProductList API structure with selectedVariant.media array.
 *              Ensures consistent media loading between list and detail endpoints.
 */
using System.Linq;
using System.Text.Json;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Products.Common;
using RoyalCode.Application.Products.Queries.GetProductById;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;


namespace RoyalCode.Application.Products.Common;

public static class ProductDtoProcessor
{
    // === MAIN LIST PROCESSING ===
    public static async Task<List<ProductListItemDto>> ProcessProductsToListItemDtosAsync(
      List<ProductBase> products,
      IApplicationDbContext context)
    {
        if (!products.Any()) return new List<ProductListItemDto>();

        // === EXTRACT ALL MEDIA IDS FROM PRODUCTS ===
        var allMediaIds = new HashSet<Guid>();

        foreach (var product in products)
        {
            if (product is PhysicalProduct physicalProduct)
            {
                // === ADD PRODUCT LEVEL MEDIA IDS ===
                foreach (var mediaId in physicalProduct.MediaIds)
                {
                    allMediaIds.Add(mediaId);
                }

                // === ADD VARIANT LEVEL MEDIA IDS ===
                foreach (var variant in physicalProduct.VariantCombinations)
                {
                    foreach (var mediaId in variant.MediaIds)
                    {
                        allMediaIds.Add(mediaId);
                    }
                }
            }
        }

        // === BATCH FETCH MEDIA AND CATEGORIES ===
        var allMediaDict = allMediaIds.Any()
            ? await context.Media
                .AsNoTracking()
                .Where(m => allMediaIds.Contains(m.Id))
                .ToDictionaryAsync(m => m.Id, m => m)
            : new Dictionary<Guid, MediaBase>();

        var allCategoryIds = products
            .SelectMany(p => p.CategoryIds)
            .Distinct()
            .ToList();

        var categoriesDict = allCategoryIds.Any()
            ? await context.ProductCategories
                .AsNoTracking()
                .Where(c => allCategoryIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c)
            : new Dictionary<Guid, ProductCategory>();

        var dtoItems = new List<ProductListItemDto>();

        foreach (var product in products)
        {
            if (product is not PhysicalProduct physicalProduct) continue;

            var dto = ProcessSingleProductToListItemDto(physicalProduct, allMediaDict, categoriesDict);
            dtoItems.Add(dto);
        }

        return dtoItems;
    }

    // === SINGLE PRODUCT PROCESSING ===
    private static ProductListItemDto ProcessSingleProductToListItemDto(
        PhysicalProduct product,
        Dictionary<Guid, MediaBase> allMediaDict,
        Dictionary<Guid, ProductCategory> categoriesDict)
    {
        // === FIND DEFAULT VARIANT ===
        var defaultVariant = product.VariantCombinations?.FirstOrDefault(vc => vc.IsDefault)
                           ?? product.VariantCombinations?.FirstOrDefault();

        // === DETERMINE PRICING ===
        var selectedPrice = defaultVariant?.Price ?? product.Pricing.Price;
        var selectedOriginalPrice = defaultVariant?.OriginalPrice ?? product.Pricing.OriginalPrice;

        // === CALCULATE IN STOCK STATUS ===
        var stockStatus = defaultVariant?.StockStatus ?? product.StockStatus;
        var inStock = stockStatus == StockStatus.InStock ||
                     stockStatus == StockStatus.LimitedStock ||
                     stockStatus == StockStatus.OnBackorder;

        // === BUILD MEDIA ARRAYS ===
        var featuredImages = DetermineFeaturedImages(product, defaultVariant, allMediaDict);
        var selectedVariantDto = defaultVariant != null
            ? CreateSelectedVariantDto(defaultVariant, allMediaDict)
            : CreateFallbackSelectedVariantDto(product, allMediaDict);
        var colorVariants = CreateColorVariants(product, allMediaDict);

        // === MAP CATEGORIES ===
        var categories = product.CategoryIds
            .Where(id => categoriesDict.ContainsKey(id))
            .Select(id => categoriesDict[id])
            .Select(c => new ProductCategoryDto(c.Id, c.Key))
            .ToList();

        return new ProductListItemDto
        {
            Id = product.Id,
            Name = product.Name,
            ShortDescription = product.ShortDescription,
            Tags = product.Tags?.ToList() ?? new List<string>(),
            Categories = categories,
            Type = product.Type,
            Status = product.Status,
            IsActive = product.IsActive,
            IsFeatured = product.IsFeatured,
            AverageRating = product.AverageRating,
            ReviewCount = product.ReviewCount,
            HasDiscount = selectedPrice < selectedOriginalPrice,
            DiscountPercentage = CalculateDiscountPercentage(selectedPrice, selectedOriginalPrice),
            Price = selectedPrice,
            OriginalPrice = selectedOriginalPrice,
            Currency = product.Currency ?? "EUR",
            StockStatus = stockStatus,
            InStock = inStock,
            FeaturedImages = featuredImages,
            SelectedVariant = selectedVariantDto,
            ColorVariants = colorVariants
        };
    }

    // === FEATURED IMAGES LOGIC ===
    private static List<ProductMediaTeaserDto> DetermineFeaturedImages(
        PhysicalProduct product,
        ProductVariantCombination? defaultVariant,
        Dictionary<Guid, MediaBase> allMediaDict)
    {
        var featuredImages = new List<ProductMediaTeaserDto>();

        // === EXPLICIT FEATURED IMAGE ===
        if (product.FeaturedImageId.HasValue && allMediaDict.ContainsKey(product.FeaturedImageId.Value))
        {
            var media = allMediaDict[product.FeaturedImageId.Value];
            featuredImages.Add(new ProductMediaTeaserDto
            {
                Id = media.Id,
                Url = media.Url,
                ThumbnailUrl = media.ThumbnailUrl ?? media.Url,
                AltText = GetMediaAltText(media)
            });
            return featuredImages;
        }

        // === DEFAULT VARIANT IMAGES (UP TO 3) ===
        var defaultVariantMediaIds = defaultVariant?.MediaIds?.Take(3).ToList() ?? new List<Guid>();
        foreach (var mediaId in defaultVariantMediaIds)
        {
            if (allMediaDict.ContainsKey(mediaId))
            {
                var media = allMediaDict[mediaId];
                featuredImages.Add(new ProductMediaTeaserDto
                {
                    Id = media.Id,
                    Url = media.Url,
                    ThumbnailUrl = media.ThumbnailUrl ?? media.Url,
                    AltText = GetMediaAltText(media)
                });
            }
        }

        // === FALLBACK TO PRODUCT IMAGES ===
        if (!featuredImages.Any())
        {
            var productMediaIds = product.MediaIds?.Take(3).ToList() ?? new List<Guid>();
            foreach (var mediaId in productMediaIds)
            {
                if (allMediaDict.ContainsKey(mediaId))
                {
                    var media = allMediaDict[mediaId];
                    featuredImages.Add(new ProductMediaTeaserDto
                    {
                        Id = media.Id,
                        Url = media.Url,
                        ThumbnailUrl = media.ThumbnailUrl ?? media.Url,
                        AltText = GetMediaAltText(media)
                    });
                }
            }
        }

        return featuredImages;
    }

    // === SELECTED VARIANT DTO ===
    private static ProductSelectedVariantDto CreateSelectedVariantDto(
        ProductVariantCombination variant,
        Dictionary<Guid, MediaBase> allMediaDict)
    {
        var media = variant.MediaIds
            .Where(id => allMediaDict.ContainsKey(id))
            .Select(id => allMediaDict[id])
            .Select(m => new ProductMediaTeaserDto
            {
                Id = m.Id,
                Url = m.Url,
                ThumbnailUrl = m.ThumbnailUrl ?? m.Url,
                AltText = GetMediaAltText(m)
            })
            .ToList();

        return new ProductSelectedVariantDto
        {
            Id = variant.Id,
            Sku = variant.Sku,
            Price = variant.Price ?? 0,
            OriginalPrice = variant.OriginalPrice,
            StockQuantity = variant.StockQuantity,
            StockStatus = variant.StockStatus,
            IsDefault = variant.IsDefault,
            Media = media
        };
    }

    // === FALLBACK SELECTED VARIANT ===
    private static ProductSelectedVariantDto CreateFallbackSelectedVariantDto(
        PhysicalProduct product,
        Dictionary<Guid, MediaBase> allMediaDict)
    {
        var media = product.MediaIds
            .Where(id => allMediaDict.ContainsKey(id))
            .Select(id => allMediaDict[id])
            .Select(m => new ProductMediaTeaserDto
            {
                Id = m.Id,
                Url = m.Url,
                ThumbnailUrl = m.ThumbnailUrl ?? m.Url,
                AltText = GetMediaAltText(m)
            })
            .ToList();

        return new ProductSelectedVariantDto
        {
            Id = Guid.NewGuid(),
            Sku = product.Sku ?? $"{product.Id}-DEFAULT",
            Price = product.Pricing.Price,
            OriginalPrice = product.Pricing.OriginalPrice,
            StockQuantity = product.StockQuantity,
            StockStatus = product.StockStatus,
            IsDefault = true,
            Media = media
        };
    }

    // === COLOR VARIANTS LOGIC ===
    /// <summary>
    /// FIXED: COLOR VARIANTS LOGIC - Now limits to representative images only
    /// </summary>
    private static List<ProductColorVariantTeaserDto> CreateColorVariants(
        PhysicalProduct product,
        Dictionary<Guid, MediaBase> allMediaDict)
    {
        var colorVariants = new List<ProductColorVariantTeaserDto>();

        // === FIND COLOR ATTRIBUTE VALUES FROM ASSIGNMENTS ===
        var colorAssignments = product.AttributeAssignments?
            .Where(aa => aa.AttributeValue?.AttributeType == VariantAttributeType.Color)
            .ToList() ?? new List<ProductAttributeAssignment>();

        if (!colorAssignments.Any())
            return colorVariants;

        foreach (var assignment in colorAssignments)
        {
            var colorValue = assignment.AttributeValue;
            if (colorValue == null) continue;

            // === FIND COMBINATIONS FOR THIS COLOR ===
            var relevantCombinations = product.VariantCombinations?
                .Where(vc => vc.AttributeValueIds.Contains(colorValue.Id))
                .ToList() ?? new List<ProductVariantCombination>();

            if (!relevantCombinations.Any()) continue;

            // === USE DEFAULT OR FIRST COMBINATION ===
            var representativeCombination = relevantCombinations.FirstOrDefault(rc => rc.IsDefault)
                                          ?? relevantCombinations.First();

            // *** FIXED: Use only representative combination images, limited to 4 ***
            var representativeMediaForColor = representativeCombination.MediaIds
                .Take(4) // Limit to maximum 4 images per color variant
                .Where(id => allMediaDict.ContainsKey(id))
                .Select(id => allMediaDict[id])
                .Select(m => new ProductMediaTeaserDto
                {
                    Id = m.Id,
                    Url = m.Url,
                    ThumbnailUrl = m.ThumbnailUrl ?? m.Url,
                    AltText = GetMediaAltText(m)
                })
                .ToList();

            colorVariants.Add(new ProductColorVariantTeaserDto
            {
                AttributeValueId = colorValue.Id.ToString(),
                Value = colorValue.Value,
                DisplayName = colorValue.DisplayName,
                ColorHex = colorValue.ColorHex,
                Price = representativeCombination.Price ?? 0,
                OriginalPrice = representativeCombination.OriginalPrice,
                DefaultVariantId = representativeCombination.Id,
                IsDefault = representativeCombination.IsDefault,
                Media = representativeMediaForColor // *** Fixed: representative images only ***
            });
        }

        return colorVariants;
    }

    // === HELPER METHODS ===
    private static string? GetMediaAltText(MediaBase media)
    {
        return media switch
        {
            ImageMedia imageMedia => imageMedia.AltTextKeyOrText,
            _ => media.TitleKeyOrText
        };
    }

    private static decimal? CalculateDiscountPercentage(decimal price, decimal? originalPrice)
    {
        if (!originalPrice.HasValue || originalPrice.Value <= price) return null;
        return Math.Round(((originalPrice.Value - price) / originalPrice.Value) * 100, 1);
    }

    /// <summary>
    /// UPDATED: Now creates selectedVariant with media for consistency with ProductList API
    /// </summary>
    public static ProductDetailDto ProcessToDetail(ProductBase product, IReadOnlyCollection<MediaBase> allMedia, IReadOnlyCollection<ProductCategoryDto> categories, Dictionary<string, string>? selectedAttributes, Dictionary<Guid, AttributeValue> allRelevantAttributeValues)
    {
        var physicalProduct = product as PhysicalProduct ?? throw new InvalidOperationException("Processing is only supported for PhysicalProduct.");
        var allAssignments = physicalProduct.AttributeAssignments;
        var allVariants = physicalProduct.VariantCombinations;
        var activeVariant = GetActiveVariant(allVariants, allAssignments, selectedAttributes);

        var variantsDto = MapVariants(allVariants, allAssignments, allMedia, allRelevantAttributeValues);
        var attributesDto = MapAttributes(product, allAssignments, allVariants, activeVariant, allMedia, allRelevantAttributeValues);

        int? topLevelStockQuantity = activeVariant?.StockQuantity ?? physicalProduct.StockQuantity;
        int? topLevelStockStatus = (int?)(activeVariant?.StockStatus ?? physicalProduct.StockStatus);
        bool topLevelInStock = (topLevelStockStatus == (int)StockStatus.InStock || topLevelStockStatus == (int)StockStatus.LimitedStock || topLevelStockStatus == (int)StockStatus.OnBackorder);

        return new ProductDetailDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            ShortDescription = product.ShortDescription,
            Type = (int)product.Type,
            Status = (int)product.Status,
            Currency = product.Currency,
            AppScope = product.AppScope,
            IsActive = product.IsActive,
            IsFeatured = product.IsFeatured,
            AverageRating = product.AverageRating ?? 0,
            ReviewCount = product.ReviewCount,
            Brand = physicalProduct.Brand,
            Sku = physicalProduct.Sku,
            Tags = product.Tags,
            Categories = categories,
            FeaturedImageId = product.FeaturedImageId,

            // REMOVED: MediaIds - now using selectedVariant.media for consistency
            // MediaIds = allMediaIds,

            FeaturedImage = ComputeFeaturedImage(allMedia, product.FeaturedImageId),
            PriceRange = ComputePriceRange(physicalProduct, allVariants),
            VariantAttributes = attributesDto,
            VariantCombinations = variantsDto,
            AvailabilityRules = MapAvailability(physicalProduct),

            // UPDATED: Now always present with media array (consistent with ProductList)
            SelectedVariant = MapSelectedVariantWithMedia(activeVariant, physicalProduct, allMedia),

            StockQuantity = topLevelStockQuantity,
            StockStatus = topLevelStockStatus,
            DisplaySpecifications = MapDisplaySpecifications(physicalProduct.DisplaySpecifications),
            CustomAttributes = DeserializeCustomAttributes(physicalProduct.CustomAttributesJson),
            Seo = ComputeSeo(product, allMedia),
            HasDiscount = variantsDto.Any(v => v.HasDiscount) || physicalProduct.Pricing.IsOnSale,
            InStock = topLevelInStock,
            PhysicalProductConfig = MapPhysicalProductConfig(physicalProduct)
        };
    }

    /// <summary>
    /// NEW METHOD: Creates SelectedVariantDto with media array for consistency with ProductList API
    /// </summary>
    private static SelectedVariantDto MapSelectedVariantWithMedia(ProductVariantCombination? activeVariant, PhysicalProduct physicalProduct, IReadOnlyCollection<MediaBase> allMedia)
    {
        if (activeVariant != null)
        {
            // Use actual variant with its media
            var variantMedia = allMedia
                .Where(m => activeVariant.MediaIds.Contains(m.Id))
                .Select(MapMediaToDto)
                .ToList();

            return new SelectedVariantDto(
                activeVariant.Id,
                activeVariant.Sku,
                activeVariant.Price ?? 0,
                activeVariant.OriginalPrice,
                activeVariant.StockQuantity ?? 0,
                (int)(activeVariant.StockStatus ?? StockStatus.Undefined),
                (activeVariant.Price ?? 0) < (activeVariant.OriginalPrice ?? 0),
                variantMedia
            );
        }
        else
        {
            // Create fallback variant with product-level media
            var productMedia = allMedia
                .Where(m => physicalProduct.MediaIds.Contains(m.Id))
                .Select(MapMediaToDto)
                .ToList();

            return new SelectedVariantDto(
                Guid.NewGuid(), // Synthetic ID for consistency
                physicalProduct.Sku ?? $"{physicalProduct.Id}-DEFAULT",
                physicalProduct.Pricing.Price,
                physicalProduct.Pricing.OriginalPrice,
                physicalProduct.StockQuantity ?? 0,
                (int)physicalProduct.StockStatus,
                physicalProduct.Pricing.IsOnSale,
                productMedia
            );
        }
    }

    /// <summary>
    /// Maps PhysicalProduct to PhysicalProductConfig DTO
    /// This ensures UPDATE forms have all required physical product data
    /// </summary>
    private static PhysicalProductConfigDto MapPhysicalProductConfig(PhysicalProduct physicalProduct)
    {
        return new PhysicalProductConfigDto
        {
            Pricing = new PricingDto
            {
                Price = physicalProduct.Pricing.Price,
                OriginalPrice = physicalProduct.Pricing.OriginalPrice
            },
            Sku = physicalProduct.Sku,
            Brand = physicalProduct.Brand,
            ManageStock = physicalProduct.ManageStock,
            StockQuantity = physicalProduct.StockQuantity,
            AllowBackorders = physicalProduct.AllowBackorders,
            LowStockThreshold = physicalProduct.LowStockThreshold,
            AvailabilityRules = physicalProduct.AvailabilityRules,
            AgeRestrictions = physicalProduct.AgeRestrictions != null ?
                new AgeRestrictionsDto
                {
                    MinAge = physicalProduct.AgeRestrictions.MinAge,
                    MaxAge = physicalProduct.AgeRestrictions.MaxAge
                } : null,
            DisplaySpecifications = physicalProduct.DisplaySpecifications?.ToList()
        };
    }

    private static ProductVariantCombination? GetActiveVariant(IReadOnlyCollection<ProductVariantCombination> variants, IReadOnlyCollection<ProductAttributeAssignment> assignments, Dictionary<string, string>? selected)
    {
        if (selected == null || !selected.Any())
        {
            return variants.FirstOrDefault(v => v.IsDefault) ?? variants.FirstOrDefault();
        }
        var selectedValueIds = assignments
            .Where(a => selected.Any(s => s.Key.Equals(a.AttributeValue.AttributeType.ToString(), StringComparison.OrdinalIgnoreCase) && s.Value.Equals(a.AttributeValue.Value, StringComparison.OrdinalIgnoreCase)))
            .Select(a => a.AttributeValueId)
            .ToHashSet();
        return variants.FirstOrDefault(v => v.AttributeValueIds.ToHashSet().SetEquals(selectedValueIds));
    }

    private static List<AttributeDto> MapAttributes(ProductBase product, IReadOnlyCollection<ProductAttributeAssignment> assignments, IReadOnlyCollection<ProductVariantCombination> allVariants, ProductVariantCombination? activeVariant, IReadOnlyCollection<MediaBase> allProductMedia, Dictionary<Guid, AttributeValue> allRelevantAttributeValues)
    {
        var activeValueIds = activeVariant?.AttributeValueIds.ToHashSet() ?? new HashSet<Guid>();
        var allVariantValueIds = allVariants.SelectMany(v => v.AttributeValueIds).ToHashSet();
        var allRelevantValues = allRelevantAttributeValues.Values
            .Where(av => allVariantValueIds.Contains(av.Id))
            .DistinctBy(av => av.Id)
            .ToList();

        return allRelevantValues
            .GroupBy(av => av.AttributeType)
            .Select(group =>
            {
                var groupAttributeType = group.Key;
                var groupDisplayNameKey = $"attribute.{groupAttributeType.ToString().ToLowerInvariant()}";
                var groupDeterministicId = CreateDeterministicGuid(groupAttributeType.ToString());

                return new AttributeDto(
                    groupDeterministicId,
                    groupDisplayNameKey,
                    (int)groupAttributeType,
                    GetDisplayType(groupAttributeType),
                    true,
                    group.Select(attributeValue =>
                    {
                        var valDto = new AttributeValueDto
                        {
                            Id = attributeValue.Id,
                            Value = attributeValue.Value,
                            DisplayNameKeyOrText = attributeValue.DisplayName,
                            ColorHex = attributeValue.ColorHex,
                            PriceModifier = attributeValue.PriceModifier
                        };

                        valDto.IsAvailable = allVariants.Any(v => v.AttributeValueIds.Contains(attributeValue.Id));

                        var tempSelection = activeValueIds
                            .Where(id =>
                            {
                                var av = allRelevantAttributeValues.GetValueOrDefault(id);
                                return av?.AttributeType != groupAttributeType;
                            })
                            .ToHashSet();
                        tempSelection.Add(attributeValue.Id);
                        var resultingVariant = allVariants.FirstOrDefault(v => v.AttributeValueIds.ToHashSet().SetEquals(tempSelection));
                        valDto.ResultingVariantId = resultingVariant?.Id;

                        // REMOVED: Media mapping for attribute values per your feedback
                        // Color variants don't need media in attribute values

                        return valDto;
                    }).ToList()
                );
            }).ToList();
    }

    private static List<VariantDto> MapVariants(IReadOnlyCollection<ProductVariantCombination> variants, IReadOnlyCollection<ProductAttributeAssignment> allAssignments, IReadOnlyCollection<MediaBase> allProductMedia, Dictionary<Guid, AttributeValue> allRelevantAttributeValues)
    {
        return variants.Select(v => new VariantDto(
            v.Id,
            v.Sku,
            v.AttributeValueIds.Select(valueId =>
            {
                allRelevantAttributeValues.TryGetValue(valueId, out var attributeValue);

                if (attributeValue == null)
                {
                    return new VariantAttributeDto(
                        Guid.Empty,
                        "attribute.missing_type",
                        valueId,
                        $"[ERROR: Missing Value for {valueId}]",
                        null
                    );
                }

                var attributeTypeString = attributeValue.AttributeType.ToString();
                var attributeDisplayNameKey = $"attribute.{attributeTypeString.ToLowerInvariant()}";

                return new VariantAttributeDto(
                    CreateDeterministicGuid(attributeTypeString),
                    attributeDisplayNameKey,
                    valueId,
                    attributeValue.DisplayName,
                    attributeValue.ColorHex
                );
            }).ToList(),
            v.Price ?? 0,
            v.OriginalPrice,
            v.StockQuantity ?? 0,
            (int)(v.StockStatus ?? StockStatus.Undefined),
            (v.Price ?? 0) < (v.OriginalPrice ?? 0),
            v.IsDefault,
            allProductMedia.Where(m => v.MediaIds.Contains(m.Id)).Select(MapMediaToDto).ToList()
        )).ToList();
    }

    /// <summary>
    /// Helper method to map MediaBase to MediaDto consistently
    /// </summary>
    private static MediaDto MapMediaToDto(MediaBase media)
    {
        return new MediaDto(
            media.Id,
            (int)media.Type,
            media.GetDeliveryUrl(),
            media.ThumbnailUrl,
            (media as ImageMedia)?.AltTextKeyOrText,
            media.Tags.Select(t => t.Name).ToList()
        );
    }

    private static List<DisplaySpecificationDto> MapDisplaySpecifications(IReadOnlyCollection<ProductDisplaySpecification>? specifications)
    {
        if (specifications == null) return new List<DisplaySpecificationDto>();
        return specifications.Select(s => new DisplaySpecificationDto(
            s.SpecKey,
            s.LabelKeyOrText,
            s.ValueKeyOrText,
            s.Icon,
            s.GroupKeyOrText,
            s.DisplayOrder
        )).OrderBy(s => s.DisplayOrder).ToList();
    }

    private static FeaturedImageDto? ComputeFeaturedImage(IReadOnlyCollection<MediaBase> media, Guid? explicitFeaturedImageId)
    {
        MediaBase? primaryMedia = null;

        if (explicitFeaturedImageId.HasValue)
        {
            primaryMedia = media.FirstOrDefault(m => m.Id == explicitFeaturedImageId.Value);
        }

        primaryMedia ??= media.FirstOrDefault(m => m.Tags.Any(t => t.Name == "featured"));
        primaryMedia ??= media.FirstOrDefault();

        if (primaryMedia == null) return null;

        return new FeaturedImageDto(
            primaryMedia.Id,
            primaryMedia.GetDeliveryUrl(),
            (primaryMedia as ImageMedia)?.AltTextKeyOrText
        );
    }

    private static PriceRangeDto? ComputePriceRange(PhysicalProduct product, IReadOnlyCollection<ProductVariantCombination> variants)
    {
        if (!variants.Any())
        {
            return new PriceRangeDto(
                product.Pricing.Price,
                product.Pricing.Price,
                product.Pricing.OriginalPrice,
                product.Pricing.OriginalPrice
            );
        }

        return new PriceRangeDto(
            variants.Min(v => v.Price ?? 0),
            variants.Max(v => v.Price ?? 0),
            variants.Min(v => v.OriginalPrice),
            variants.Max(v => v.OriginalPrice)
        );
    }

    private static AvailabilityDto? MapAvailability(PhysicalProduct? p)
    {
        if (p == null) return null;

        return new AvailabilityDto(
            p.ManageStock,
            p.AllowBackorders,
            p.LowStockThreshold,
            p.AvailabilityRules?.MinOrderQuantity,
            p.AvailabilityRules?.MaxOrderQuantity,
            p.AvailabilityRules?.QuantityIncrements
        );
    }

    private static Dictionary<string, object> DeserializeCustomAttributes(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new Dictionary<string, object>();
        return JsonSerializer.Deserialize<Dictionary<string, object>>(json) ?? new Dictionary<string, object>();
    }

    private static SeoDto ComputeSeo(ProductBase p, IReadOnlyCollection<MediaBase> m)
    {
        var keywords = new List<string>();
        if (!string.IsNullOrEmpty(p.SeoKeywordsJson))
        {
            try { keywords = JsonSerializer.Deserialize<List<string>>(p.SeoKeywordsJson) ?? new List<string>(); }
            catch { keywords.AddRange(p.Tags); }
        }
        else
        {
            keywords.AddRange(p.Tags);
        }

        return new SeoDto(
            p.SeoTitle ?? p.Name,
            p.SeoDescription ?? p.ShortDescription,
            keywords,
            p.SeoImageUrl ?? ComputeFeaturedImage(m, p.FeaturedImageId)?.Url
        );
    }

    private static string GetDisplayType(VariantAttributeType type) => type switch
    {
        VariantAttributeType.Color => "color-picker",
        _ => "dropdown"
    };

    private static Guid CreateDeterministicGuid(string input)
    {
        if (string.IsNullOrEmpty(input)) return Guid.Empty;
        using (var md5 = System.Security.Cryptography.MD5.Create())
        {
            var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
            return new Guid(hash);
        }
    }

    private static int CreateDeterministicIntId(Guid guid)
    {
        if (guid == Guid.Empty) return 0;
        return BitConverter.ToInt32(guid.ToByteArray(), 0);
    }
}

// Supporting DTOs remain the same
public class PhysicalProductConfigDto
{
    public PricingDto Pricing { get; set; } = new();
    public string? Sku { get; set; }
    public string? Brand { get; set; }
    public bool ManageStock { get; set; }
    public int? StockQuantity { get; set; }
    public bool AllowBackorders { get; set; }
    public int? LowStockThreshold { get; set; }
    public ProductAvailabilityRules? AvailabilityRules { get; set; }
    public AgeRestrictionsDto? AgeRestrictions { get; set; }
    public List<ProductDisplaySpecification>? DisplaySpecifications { get; set; }
}

public class PricingDto
{
    public decimal? Price { get; set; }
    public decimal? OriginalPrice { get; set; }
}

public class AgeRestrictionsDto
{
    public int? MinAge { get; set; }
    public int? MaxAge { get; set; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Common/ProductListItemDto.cs ---
using RoyalCode.Domain.Enums.Product;

/**
 * @file ProductListItemDto.cs
 * @Version 3.1.0 (With Main Product Thumbnail)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description DE ENIGE BRON VAN WAARHEID voor DTO's in productlijsten,
 *              nu inclusief een dedicated ThumbnailUrl voor het hoofdproduct.
 *              Enum-properties zijn nu van het type 'int' om de JSON-output correct te representeren.
 */
namespace RoyalCode.Application.Products.Common;


public class ProductListItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public List<string> Tags { get; set; } = new();
    public List<ProductCategoryDto> Categories { get; set; } = new();
    public ProductType Type { get; set; }
    public ProductStatus Status { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public decimal? AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public bool HasDiscount { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string Currency { get; set; } = "EUR";
    public StockStatus StockStatus { get; set; }
    public bool InStock { get; set; }
    public List<ProductMediaTeaserDto> FeaturedImages { get; set; } = new();
    public ProductSelectedVariantDto SelectedVariant { get; set; } = new();
    public List<ProductColorVariantTeaserDto> ColorVariants { get; set; } = new();
}

public class ProductSelectedVariantDto
{
    public Guid Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int? StockQuantity { get; set; }
    public StockStatus? StockStatus { get; set; }
    public bool IsDefault { get; set; }
    public List<ProductMediaTeaserDto> Media { get; set; } = new();
}

public class ProductColorVariantTeaserDto
{
    public string AttributeValueId { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? ColorHex { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public Guid DefaultVariantId { get; set; }
    public bool IsDefault { get; set; }
    public List<ProductMediaTeaserDto> Media { get; set; } = new();
}

public class ProductMediaTeaserDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string? AltText { get; set; }
}


public class MediaTeaserDto
{
    public Guid Id { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? AltText { get; set; }
}

public record ColorVariantTeaserDto(
    int UiId,
    Guid AttributeValueId,
    Guid? DefaultVariantId,
    string Value,
    string DisplayName,
    string? ColorHex,
    decimal Price,
    decimal? OriginalPrice,
    List<MediaTeaserDto> Media
);
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetAllAttributeValuesQuery.cs ---
using RoyalCode.Application.Common.Interfaces;


/**
 * @file GetAllAttributeValuesQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Query and handler to fetch all available, reusable attribute values, grouped by type.
 */
namespace RoyalCode.Application.Products.Queries.GetAllAttributeValues;

/// <summary>
/// Represents a single selectable attribute value (e.g., "Rood", "Medium").
/// </summary>
public record AttributeValueSelectionDto
{
    public Guid Id { get; init; }
    public string Value { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string? ColorHex { get; init; }
    public decimal? PriceModifier { get; init; }
}

/// <summary>
/// Query to fetch all globally available attribute values for use in dropdowns and selectors.
/// </summary>
public record GetAllAttributeValuesQuery : IRequest<Dictionary<string, List<AttributeValueSelectionDto>>>;

/// <summary>
/// Handles the logic for fetching and grouping attribute values.
/// </summary>
public class GetAllAttributeValuesQueryHandler
    : IRequestHandler<GetAllAttributeValuesQuery, Dictionary<string, List<AttributeValueSelectionDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAllAttributeValuesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Dictionary<string, List<AttributeValueSelectionDto>>> Handle(
        GetAllAttributeValuesQuery request, CancellationToken cancellationToken)
    {
        // 1. Haal alle globaal beschikbare attributen op.
        var attributeValues = await _context.AttributeValues
            .AsNoTracking()
            .Where(av => av.IsGloballyAvailable)
            .OrderBy(av => av.DisplayName)
            .ToListAsync(cancellationToken);

        // 2. Groepeer de resultaten op het 'AttributeType' (de enum).
        var groupedAttributes = attributeValues
            .GroupBy(av => av.AttributeType)
            .ToDictionary(
                // 3. Gebruik de enum-naam als Key. Dit is de garantie voor de frontend.
                group => group.Key.ToString(),
                // 4. Map de waarden in elke groep naar de DTO.
                group => group.Select(av => new AttributeValueSelectionDto
                {
                    Id = av.Id,
                    Value = av.Value,
                    DisplayName = av.DisplayName,
                    ColorHex = av.ColorHex,
                    PriceModifier = av.PriceModifier
                }).ToList()
            );

        return groupedAttributes;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetAvailableFilters/FilterDtos.cs ---
/**
 * @file FilterDtos.cs
 * @Version 1.1.0 (Corrected Serialization)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description DTOs for representing available product filters (faceted search).
 *              FIX: Removed redundant [JsonConverter] attribute to allow global
 *              camelCase serialization policy to apply correctly.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fixed filter rendering by correcting enum serialization.
 */
using System.Text.Json.Serialization;

namespace RoyalCode.Application.Products.Queries.GetAvailableFilters;

public class FilterOptionDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class FilterDefinitionDto
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;

    public FilterType Type { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<FilterOptionDto>? Options { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? RangeMin { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public decimal? RangeMax { get; set; }
}

public enum FilterType
{
    Checkbox,
    Range,
    Switch
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetAvailableFilters/GetAvailableFiltersQuery.cs ---
/**
 * @file GetAvailableFiltersQuery.cs
 * @Version 4.0.0 (FINAL - IParsable Binders)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description Query to get available filters. This version uses IParsable wrappers for list types
 *              to correctly work with Minimal API's [AsParameters] binding.
 */
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Products.Queries.GetProductsWithPagination; // Hergebruik GuidList/StringList
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Application.Products.Queries.GetAvailableFilters;

public record GetAvailableFiltersQuery : IRequest<List<FilterDefinitionDto>>
{
    // --- DE FIX: Gebruik de IParsable wrapper types ---
    public GuidList? CategoryIds { get; init; }
    public StringList? Brands { get; init; }

    public decimal? PriceMin { get; init; }
    public decimal? PriceMax { get; init; }
    public string? SearchTerm { get; init; }
    public string? CustomFiltersJson { get; init; }
    public StockStatus? StockStatus { get; init; }
    public decimal? MinRating { get; init; }
    public bool? OnSaleOnly { get; init; }
}

public class GetAvailableFiltersQueryHandler : IRequestHandler<GetAvailableFiltersQuery, List<FilterDefinitionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAvailableFiltersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FilterDefinitionDto>> Handle(GetAvailableFiltersQuery request, CancellationToken cancellationToken)
    {
        var results = new List<FilterDefinitionDto>();

        var baseQuery = _context.Products.OfType<PhysicalProduct>().AsNoTracking()
            .Where(p => p.Status == ProductStatus.Published && p.IsActive);

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTermLower = request.SearchTerm.ToLower();
            baseQuery = baseQuery.Where(p =>
                p.Name.ToLower().Contains(searchTermLower) ||
                (p.Brand != null && p.Brand.ToLower().Contains(searchTermLower)) ||
                (p.Sku != null && p.Sku.ToLower().Contains(searchTermLower)) ||
                (p.ShortDescription != null && p.ShortDescription.ToLower().Contains(searchTermLower)) ||
                p.Description.ToLower().Contains(searchTermLower)
            );
        }
        if (request.CategoryIds != null && request.CategoryIds.Value.Any())
        {
            // The CategoryIds property on ProductBase is a List<Guid> which is stored as a comma-separated string in DB.
            // Direct EF Core translation of .Any(c => request.CategoryIds.Value.Contains(c)) can be problematic for performance.
            // Better to perform the initial filtering based on available categories.
            var categoryGuids = request.CategoryIds.Value.ToList();
            baseQuery = baseQuery.Where(p => p.CategoryIds != null && p.CategoryIds.Any(c => categoryGuids.Contains(c)));
        }
        if (request.Brands != null && request.Brands.Value.Any())
        {
            var brandNames = request.Brands.Value.ToList();
            baseQuery = baseQuery.Where(p => p.Brand != null && brandNames.Contains(p.Brand));
        }
        if (request.PriceMin.HasValue) baseQuery = baseQuery.Where(p => p.Pricing.Price >= request.PriceMin.Value);
        if (request.PriceMax.HasValue) baseQuery = baseQuery.Where(p => p.Pricing.Price <= request.PriceMax.Value);
        if (request.MinRating.HasValue) baseQuery = baseQuery.Where(p => p.AverageRating >= request.MinRating.Value);
        if (request.OnSaleOnly == true) baseQuery = baseQuery.Where(p => p.Pricing.Price < p.Pricing.OriginalPrice);
        if (request.StockStatus.HasValue) baseQuery = baseQuery.Where(p => p.StockStatus == request.StockStatus.Value);

        // Fetch only relevant data for filters to minimize data transfer
        var productsForFilterCounting = await baseQuery
            .Select(p => new { p.Id, p.CategoryIds, p.Brand })
            .ToListAsync(cancellationToken);

        if (!productsForFilterCounting.Any())
        {
            return new List<FilterDefinitionDto>();
        }

        // Category Filter Counts
        var allProductCategoryIds = productsForFilterCounting.SelectMany(p => p.CategoryIds).Distinct().ToList();
        var categoryCounts = productsForFilterCounting
            .SelectMany(p => p.CategoryIds)
            .GroupBy(catId => catId)
            .ToDictionary(g => g.Key, g => g.Count());

        if (categoryCounts.Any())
        {
            var categoryNames = await _context.ProductCategories
                .Where(c => allProductCategoryIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Key, cancellationToken);

            results.Add(new FilterDefinitionDto
            {
                Key = "categoryIds",
                Label = "Categorie",
                Type = FilterType.Checkbox,
                Options = categoryCounts.Select(cc => new FilterOptionDto
                {
                    Value = cc.Key.ToString(),
                    Label = categoryNames.GetValueOrDefault(cc.Key, "Unknown"),
                    Count = cc.Value
                }).OrderBy(o => o.Label).ToList()
            });
        }

        // Brand Filter Counts
        var brandCounts = productsForFilterCounting
            .Where(p => !string.IsNullOrEmpty(p.Brand))
            .GroupBy(p => p.Brand!)
            .ToDictionary(g => g.Key, g => g.Count());

        if (brandCounts.Any())
        {
            results.Add(new FilterDefinitionDto
            {
                Key = "brands",
                Label = "Merk",
                Type = FilterType.Checkbox,
                Options = brandCounts.Select(bc => new FilterOptionDto
                {
                    Value = bc.Key,
                    Label = bc.Key,
                    Count = bc.Value
                }).OrderBy(o => o.Label).ToList()
            });
        }

        return results;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetCategoryTreeQuery.cs ---
/**
 * @file GetProductCategoryTreeQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-02
 * @Description Query and DTOs to fetch all product categories as a hierarchical tree.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Create a category system for products.
 */
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Products.Queries.GetProductCategoryTree;

public record ProductCategoryNodeDto
{
    public Guid Id { get; init; }
    public string Key { get; init; } = string.Empty; 
    public Guid? ParentId { get; init; }
    public List<ProductCategoryNodeDto> Children { get; set; } = new();
}

public record GetProductCategoryTreeQuery : IRequest<List<ProductCategoryNodeDto>>;

public class GetProductCategoryTreeQueryHandler : IRequestHandler<GetProductCategoryTreeQuery, List<ProductCategoryNodeDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductCategoryTreeQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductCategoryNodeDto>> Handle(GetProductCategoryTreeQuery request, CancellationToken cancellationToken)
    {
        var allCategories = await _context.ProductCategories // Gebruik de correcte DbSet naam
            .AsNoTracking()
            .OrderBy(c => c.Key)
            .Select(c => new ProductCategoryNodeDto
            {
                Id = c.Id,
                Key = c.Key, // GECORRIGEERD
                ParentId = c.ParentCategoryId
            })
            .ToListAsync(cancellationToken);

        return BuildTree(allCategories);
    }

    private List<ProductCategoryNodeDto> BuildTree(List<ProductCategoryNodeDto> nodes)
    {
        var nodeMap = nodes.ToDictionary(n => n.Id);
        var tree = new List<ProductCategoryNodeDto>();

        foreach (var node in nodes)
        {
            if (node.ParentId.HasValue && nodeMap.TryGetValue(node.ParentId.Value, out var parent))
            {
                parent.Children.Add(node);
            }
            else
            {
                tree.Add(node);
            }
        }
        return tree;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetCustomAttributeDefinitionsDto.cs ---
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Product;

namespace RoyalCode.Application.Products.Queries.GetCustomAttributeDefinitions;

public record CustomAttributeDefinitionDto
{
    public Guid Id { get; init; }
    public string Key { get; init; } = string.Empty;
    public string NameKeyOrText { get; init; } = string.Empty;
    public string DescriptionKeyOrText { get; init; } = string.Empty;
    public CustomAttributeType ValueType { get; init; }
    public CustomAttributeUIType UiControlType { get; init; }
    public string? ValidationRulesJson { get; init; }
    public string? DefaultValue { get; init; }
    public string Group { get; init; } = string.Empty;
    public string? Icon { get; init; }
}

public record GetCustomAttributeDefinitionsQuery : IRequest<List<CustomAttributeDefinitionDto>>;

public class GetCustomAttributeDefinitionsQueryHandler
    : IRequestHandler<GetCustomAttributeDefinitionsQuery, List<CustomAttributeDefinitionDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCustomAttributeDefinitionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CustomAttributeDefinitionDto>> Handle(GetCustomAttributeDefinitionsQuery request, CancellationToken cancellationToken)
    {
        return await _context.CustomAttributeDefinitions
            .AsNoTracking()
            .Select(d => new CustomAttributeDefinitionDto
            {
                Id = d.Id,
                Key = d.Key,
                NameKeyOrText = d.NameKeyOrText,
                DescriptionKeyOrText = d.DescriptionKeyOrText,
                ValueType = d.ValueType,
                UiControlType = d.UiControlType,
                ValidationRulesJson = d.ValidationRulesJson,
                DefaultValue = d.DefaultValue,
                Group = d.Group,
                Icon = d.Icon
            })
            .OrderBy(d => d.Group).ThenBy(d => d.NameKeyOrText)
            .ToListAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetDisplaySpecificationDefinitionsQuery.cs ---
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Products.Queries.GetDisplaySpecificationDefinitions;

public record DisplaySpecificationDefinitionDto
{
    public Guid Id { get; init; }
    public string SpecKey { get; init; } = string.Empty;
    public string LabelKeyOrText { get; init; } = string.Empty;
    public string? Icon { get; init; }
    public string GroupKeyOrText { get; init; } = string.Empty;
    public int DisplayOrder { get; init; }
}

public record GetDisplaySpecificationDefinitionsQuery : IRequest<List<DisplaySpecificationDefinitionDto>>;

public class GetDisplaySpecificationDefinitionsQueryHandler
    : IRequestHandler<GetDisplaySpecificationDefinitionsQuery, List<DisplaySpecificationDefinitionDto>>
{
    private readonly IApplicationDbContext _context;
    public GetDisplaySpecificationDefinitionsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<List<DisplaySpecificationDefinitionDto>> Handle(GetDisplaySpecificationDefinitionsQuery request, CancellationToken cancellationToken)
    {
        return await _context.DisplaySpecificationDefinitions
            .AsNoTracking()
            .Select(d => new DisplaySpecificationDefinitionDto
            {
                Id = d.Id,
                SpecKey = d.SpecKey,
                LabelKeyOrText = d.LabelKeyOrText,
                Icon = d.Icon,
                GroupKeyOrText = d.GroupKeyOrText,
                DisplayOrder = d.DisplayOrder
            })
            .OrderBy(d => d.GroupKeyOrText).ThenBy(d => d.DisplayOrder)
            .ToListAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetFeaturedProducts/GetFeaturedProductsQuery.cs ---
// src/Application/Products/Queries/GetFeaturedProducts/GetFeaturedProductsQuery.cs
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Products.Common;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Application.Products.Queries.GetFeaturedProducts;

public record GetFeaturedProductsQuery : IRequest<PaginatedList<ProductListItemDto>>
{
    public int? Limit { get; init; }
}

public class GetFeaturedProductsQueryHandler : IRequestHandler<GetFeaturedProductsQuery, PaginatedList<ProductListItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFeaturedProductsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<ProductListItemDto>> Handle(GetFeaturedProductsQuery request, CancellationToken cancellationToken)
    {
        var limit = request.Limit ?? 8;

        var products = await _context.Products
            .OfType<PhysicalProduct>()
            .AsNoTracking()
            .Where(p => p.IsFeatured && p.Status == ProductStatus.Published && p.IsActive)
            .OrderBy(p => p.Name)
            .Take(limit)
            .Include(p => p.AttributeAssignments)
                .ThenInclude(aa => aa.AttributeValue)
            .Include(p => p.VariantCombinations)
            .ToListAsync(cancellationToken);

        var dtoItems = await ProductDtoProcessor.ProcessProductsToListItemDtosAsync(products.Cast<ProductBase>().ToList(), _context);

        return new PaginatedList<ProductListItemDto>(
            dtoItems,
            dtoItems.Count,
            1,
            limit
        );
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetProductById/GetProductById.cs ---
/**
 * @file GetProductById.cs
 * @Version 4.2.0 (FIXED: Include Variant Combination Media)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description Query en Handler die de centrale ProductDtoProcessor aanroept, nu inclusief categorieën
 *              EN alle media voor variant combinations.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Products.Common; // <-- BELANGRIJK: Deze using moet er zijn
using RoyalCode.Domain.Entities.Media;
using System.Collections.Generic; // Nodig voor List<ProductCategoryDto>

namespace RoyalCode.Application.Products.Queries.GetProductById;

public record GetProductByIdQuery(Guid Id, Dictionary<string, string>? SelectedAttributes = null) : IRequest<ProductDetailDto?>;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDetailDto?>
{
    private readonly IApplicationDbContext _context;

    public GetProductByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProductDetailDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        Guard.Against.Default(request.Id, nameof(request.Id));

        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.AttributeAssignments).ThenInclude(aa => aa.AttributeValue)
            .Include(p => p.VariantCombinations)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return null;
        }

        // --- DE DEFINITIEVE FIX: Verzamel ALLE benodigde AttributeValueIds ---
        // 1. Van de directe assignments van het product
        var allRequiredAttributeValueIds = product.AttributeAssignments
            .Select(a => a.AttributeValueId)
            .ToHashSet();

        // 2. Van ALLE variant combinaties die bij het product horen
        foreach (var variant in product.VariantCombinations)
        {
            foreach (var attrValueId in variant.AttributeValueIds)
            {
                allRequiredAttributeValueIds.Add(attrValueId);
            }
        }

        // Laad nu ALLE benodigde AttributeValues in één keer. Dit is de "bron van waarheid".
        var allRelevantAttributeValues = await _context.AttributeValues
            .AsNoTracking()
            .Where(av => allRequiredAttributeValueIds.Contains(av.Id))
            .ToDictionaryAsync(av => av.Id, cancellationToken);
        // --- EINDE FIX ---

        var allMediaIds = new HashSet<Guid>();
        if (product.MediaIds != null) { foreach (var mediaId in product.MediaIds) { allMediaIds.Add(mediaId); } }
        if (product.VariantCombinations != null) { foreach (var variant in product.VariantCombinations) { if (variant.MediaIds != null) { foreach (var mediaId in variant.MediaIds) { allMediaIds.Add(mediaId); } } } }

        var media = await _context.Media
            .AsNoTracking()
            .Where(m => allMediaIds.Contains(m.Id))
            .Include(m => m.Tags)
            .ToListAsync(cancellationToken);

        var productCategories = new List<ProductCategoryDto>();
        if (product.CategoryIds != null && product.CategoryIds.Any())
        {
            var categoriesInDb = await _context.ProductCategories
                .AsNoTracking()
                .Where(pc => product.CategoryIds.Contains(pc.Id))
                .Select(pc => new ProductCategoryDto(pc.Id, pc.Key))
                .ToListAsync(cancellationToken);
            productCategories.AddRange(categoriesInDb);
        }

        // Geef de complete set AttributeValues door aan de processor
        return ProductDtoProcessor.ProcessToDetail(product, media, productCategories, request.SelectedAttributes, allRelevantAttributeValues);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetProductById/ProductDetailDto.cs ---
/**
 * @file ProductDetailDto.cs
 * @Version 11.1.0 (FIXED: VariantDto includes MediaIds)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description Fixed VariantDto to include MediaIds property that was missing
 */

using RoyalCode.Application.Products.Common;

namespace RoyalCode.Application.Products.Queries.GetProductById;

public class ProductDetailDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? ShortDescription { get; init; }
    public int Type { get; init; }
    public int Status { get; init; }
    public string? Currency { get; init; }
    public string? AppScope { get; init; }
    public bool IsActive { get; init; }
    public bool IsFeatured { get; init; }
    public decimal AverageRating { get; init; }
    public int ReviewCount { get; init; }
    public string? Brand { get; init; }
    public string? Sku { get; set; }
    public IReadOnlyCollection<Guid> MediaIds { get; init; } = new List<Guid>();
    public PhysicalProductConfigDto? PhysicalProductConfig { get; init; }

    public IReadOnlyCollection<string> Tags { get; init; } = new List<string>();
    public IReadOnlyCollection<ProductCategoryDto> Categories { get; init; } = new List<ProductCategoryDto>();

    public Guid? FeaturedImageId { get; init; }
    public PriceRangeDto? PriceRange { get; init; }
    public FeaturedImageDto? FeaturedImage { get; init; }
    public IReadOnlyCollection<AttributeDto> VariantAttributes { get; init; } = new List<AttributeDto>();
    public IReadOnlyCollection<VariantDto> VariantCombinations { get; init; } = new List<VariantDto>();
    public AvailabilityDto? AvailabilityRules { get; init; }

    public SelectedVariantDto? SelectedVariant { get; init; }
    public int? StockQuantity { get; init; }
    public int? StockStatus { get; init; }

    public IReadOnlyCollection<DisplaySpecificationDto> DisplaySpecifications { get; init; } = new List<DisplaySpecificationDto>();
    public Dictionary<string, object> CustomAttributes { get; init; } = new();
    public SeoDto? Seo { get; init; }
    public bool HasDiscount { get; init; }
    public bool InStock { get; init; }
}

public record PriceRangeDto(decimal MinPrice, decimal MaxPrice, decimal? MinOriginalPrice, decimal? MaxOriginalPrice);
public record FeaturedImageDto(Guid Id, string Url, string? AltTextKeyOrText);
public record MediaDto(Guid Id, int Type, string Url, string? ThumbnailUrl, string? AltTextKeyOrText, IReadOnlyCollection<string> Tags);
public record AttributeDto(Guid Id, string NameKeyOrText, int Type, string DisplayType, bool IsRequired, IReadOnlyCollection<AttributeValueDto> Values);

public record AttributeValueDto
{
    public Guid Id { get; init; }
    public string Value { get; init; } = string.Empty;
    public string DisplayNameKeyOrText { get; init; } = string.Empty;
    public string? ColorHex { get; init; }
    public decimal? PriceModifier { get; init; }
    public bool IsAvailable { get; set; } = true;
    public Guid? ResultingVariantId { get; set; }
    public MediaDto? Media { get; set; } 
}

// CRITICAL FIX: Added MediaIds property to VariantDto
public record VariantDto(
    Guid Id,
    string Sku,
    IReadOnlyCollection<VariantAttributeDto> Attributes,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    int StockStatus,
    bool HasDiscount,
    bool IsDefault,
    IReadOnlyCollection<MediaDto> Media
);

public record VariantAttributeDto(
    Guid attributeId,                   // Deterministic ID representing the attribute type (e.g., "Color")
    string attributeNameKeyOrText,      // The name of the attribute itself (e.g., "attribute.color")
    Guid attributeValueId,              // The actual ID of the selected value (e.g., the ID for "Rood")
    string attributeValueNameKeyOrText, // The display name of the value (e.g., "Rood")
    string? colorHex                    // The hex code if applicable (e.g., "#FF0000")
);

public record SelectedVariantDto(
    Guid Id,
    string Sku,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    int StockStatus,
    bool HasDiscount,
    IReadOnlyCollection<MediaDto> Media  
);

public record DisplaySpecificationGroupDto(string GroupKeyOrText, IReadOnlyCollection<DisplaySpecificationDto> Specs);
public record DisplaySpecificationDto(string SpecKey, string LabelKeyOrText, string ValueKeyOrText, string? Icon, string? GroupKeyOrText, int? DisplayOrder);
public record AvailabilityDto(bool ManageStock, bool AllowBackorders, int? LowStockThreshold, int? MinOrderQuantity, int? MaxOrderQuantity, int? QuantityIncrements);
public record SeoDto(string Title, string? Description, IReadOnlyCollection<string> Keywords, string? ImageUrl);
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetProductLookupsQuery.cs ---
/**
 * @file GetProductLookupsQuery.cs
 * @Version 1.1.0 (Corrected DbContext Usage)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-01
 * @Description Query and DTO to fetch all lookup data for the product create/edit form.
 *              FIX: Removed parallel Task.WhenAll to prevent DbContext concurrency issues.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Products.Queries.GetAllAttributeValues;
using RoyalCode.Application.Products.Queries.GetCustomAttributeDefinitions;
using RoyalCode.Application.Products.Queries.GetDisplaySpecificationDefinitions;
using RoyalCode.Domain.Enums.Product;
using System.Text.Json;
using System.Collections.Generic; // Nodig voor List en Dictionary
using RoyalCode.Application.Products.Common; // <-- NIEUW: Voeg deze using toe voor ProductCategoryDto
using RoyalCode.Application.Products.Queries.GetProductCategoryTree; // Nodig voor ProductCategoryNodeDto

namespace RoyalCode.Application.Products.Queries.GetProductLookups;

/// <summary>
/// A DTO that aggregates all necessary lookup data for building the product management UI.
/// </summary>
public record ProductLookupsDto
{
    public IReadOnlyCollection<string> ProductTypes { get; init; } = new List<string>();
    public IReadOnlyCollection<string> ProductStatuses { get; init; } = new List<string>();
    public Dictionary<string, List<AttributeValueSelectionDto>> VariantAttributes { get; init; } = new();
    public IReadOnlyCollection<DisplaySpecificationDefinitionDto> DisplaySpecifications { get; init; } = new List<DisplaySpecificationDefinitionDto>();
    public IReadOnlyCollection<CustomAttributeDefinitionDto> CustomAttributes { get; init; } = new List<CustomAttributeDefinitionDto>();
    public IReadOnlyCollection<ProductCategoryNodeDto> CategoryTree { get; init; } = new List<ProductCategoryNodeDto>(); // <-- NIEUW: Categorieboom
}

/// <summary>
/// Query to fetch all lookup data for the product create/edit form.
/// </summary>
public record GetProductLookupsQuery : IRequest<ProductLookupsDto>;

/// <summary>
/// Handles the fetching and aggregation of all product-related lookup data.
/// </summary>
public class GetProductLookupsQueryHandler : IRequestHandler<GetProductLookupsQuery, ProductLookupsDto>
{
    private readonly IApplicationDbContext _context;

    public GetProductLookupsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProductLookupsDto> Handle(GetProductLookupsQuery request, CancellationToken cancellationToken)
    {
        var variantAttributes = await new GetAllAttributeValuesQueryHandler(_context)
            .Handle(new GetAllAttributeValuesQuery(), cancellationToken);

        var displaySpecs = await new GetDisplaySpecificationDefinitionsQueryHandler(_context)
            .Handle(new GetDisplaySpecificationDefinitionsQuery(), cancellationToken);

        var customAttrs = await new GetCustomAttributeDefinitionsQueryHandler(_context)
            .Handle(new GetCustomAttributeDefinitionsQuery(), cancellationToken);

        var categoryTree = await new GetProductCategoryTreeQueryHandler(_context) // <-- NIEUW: Laad de categorieboom
            .Handle(new GetProductCategoryTreeQuery(), cancellationToken);

        // Converteer Enums naar camelCase strings, zoals de frontend verwacht
        var jsonNamingPolicy = JsonNamingPolicy.CamelCase;
        var productTypes = Enum.GetNames(typeof(ProductType)).Select(jsonNamingPolicy.ConvertName).ToList();
        var productStatuses = Enum.GetNames(typeof(ProductStatus)).Select(jsonNamingPolicy.ConvertName).ToList();

        return new ProductLookupsDto
        {
            ProductTypes = productTypes,
            ProductStatuses = productStatuses,
            VariantAttributes = variantAttributes,
            DisplaySpecifications = displaySpecs,
            CustomAttributes = customAttrs,
            CategoryTree = categoryTree // <-- NIEUW: Wijs de categorieboom toe
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetProductRecommendationsQuery.cs ---
using System;
using System.Linq;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Products.Common;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Application.Products.Queries.GetProductRecommendations;

public record GetProductRecommendationsQuery : IRequest<PaginatedList<ProductListItemDto>>
{
    public int? Limit { get; init; }

    public GetProductRecommendationsQuery(int? limit = null)
    {
        Limit = limit ?? 8;
    }
}

public class GetProductRecommendationsQueryHandler : IRequestHandler<GetProductRecommendationsQuery, PaginatedList<ProductListItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public GetProductRecommendationsQueryHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<PaginatedList<ProductListItemDto>> Handle(GetProductRecommendationsQuery request, CancellationToken cancellationToken)
    {
        var limit = request.Limit!.Value;

        if (_currentUser.Id.HasValue && _currentUser.Id.Value != Guid.Empty)
        {
            var personalizedProducts = await GetPersonalizedRecommendations(limit, cancellationToken);
            if (personalizedProducts.Count >= limit)
            {
                var dtos = await ProductDtoProcessor.ProcessProductsToListItemDtosAsync(personalizedProducts, _context);
                return new PaginatedList<ProductListItemDto>(dtos, dtos.Count, 1, limit);
            }
        }

        var fallbackProducts = await GetFallbackRecommendations(limit, cancellationToken);
        var fallbackDtos = await ProductDtoProcessor.ProcessProductsToListItemDtosAsync(fallbackProducts, _context);
        return new PaginatedList<ProductListItemDto>(fallbackDtos, fallbackDtos.Count, 1, limit);
    }

    private async Task<List<Domain.Entities.Product.ProductBase>> GetPersonalizedRecommendations(int limit, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id!.Value;

        var purchasedProductIds = await _context.Orders
            .Where(o => o.UserId == userId)
            .SelectMany(o => o.Items.Select(i => i.ProductId))
            .Distinct()
            .ToListAsync(cancellationToken);

        if (!purchasedProductIds.Any())
        {
            return new List<Domain.Entities.Product.ProductBase>();
        }

        var purchasedProductsWithTags = await _context.Products
            .AsNoTracking()
            .Where(p => purchasedProductIds.Contains(p.Id))
            .Select(p => p.Tags)
            .ToListAsync(cancellationToken);

        var userTasteProfile = purchasedProductsWithTags
            .SelectMany(tags => tags)
            .GroupBy(tag => tag)
            .ToDictionary(g => g.Key, g => g.Count());

        if (!userTasteProfile.Any())
        {
            return new List<Domain.Entities.Product.ProductBase>();
        }

        var candidateProducts = await _context.Products
            .AsNoTracking()
            .Where(p => p.Status == ProductStatus.Published &&
                        !purchasedProductIds.Contains(p.Id) &&
                        p.Tags.Any(tag => userTasteProfile.ContainsKey(tag)))
            .Include(p => p.AttributeAssignments).ThenInclude(paa => paa.AttributeValue)
            .Include(p => p.VariantCombinations)
            .ToListAsync(cancellationToken);

        var rankedProducts = candidateProducts
            .Select(p => new
            {
                Product = p,
                Score = p.Tags.Sum(tag => userTasteProfile.GetValueOrDefault(tag, 0))
            })
            .OrderByDescending(x => x.Score)
            .ThenByDescending(x => x.Product.AverageRating ?? 0)
            .Select(x => x.Product)
            .Take(limit)
            .ToList();

        return rankedProducts;
    }

    private async Task<List<Domain.Entities.Product.ProductBase>> GetFallbackRecommendations(int limit, CancellationToken cancellationToken)
    {
        var highRated = await _context.Products.AsNoTracking()
            .Where(p => p.Status == ProductStatus.Published && p.ReviewCount > 5)
            .OrderByDescending(p => p.AverageRating)
            .Take(limit)
            .ToListAsync(cancellationToken);

        var featured = await _context.Products.AsNoTracking()
            .Where(p => p.Status == ProductStatus.Published && p.IsFeatured)
            .Take(limit)
            .ToListAsync(cancellationToken);

        var combined = highRated
            .Concat(featured)
            .DistinctBy(p => p.Id)
            .ToList();

        var productIds = combined.Select(p => p.Id).ToList();
        return await _context.Products
            .AsNoTracking()
            .Where(p => productIds.Contains(p.Id))
            .Include(p => p.AttributeAssignments).ThenInclude(paa => paa.AttributeValue)
            .Include(p => p.VariantCombinations)
            .ToListAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetProductsWithPagination/GetProductsWithPagination.cs ---
// src/Application/Products/Queries/GetProductsWithPagination/GetProductsWithPagination.cs
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Extensions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Products.Common;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Application.Products.Queries.GetProductsWithPagination;

// === CUSTOM TYPES FOR LIST BINDING ===
public record GuidList(List<Guid> Value) : IParsable<GuidList>
{
    public static GuidList Parse(string s, IFormatProvider? provider)
    {
        var guids = s.Split(',')
            .Select(idStr => Guid.TryParse(idStr.Trim(), out var id) ? id : Guid.Empty)
            .Where(id => id != Guid.Empty)
            .ToList();
        return new GuidList(guids);
    }

    public static bool TryParse([NotNullWhen(true)] string? s, IFormatProvider? provider, [MaybeNullWhen(false)] out GuidList result)
    {
        result = null;
        if (s is null) return false;
        try
        {
            result = Parse(s, provider);
            return true;
        }
        catch { return false; }
    }
}

public record StringList(List<string> Value) : IParsable<StringList>
{
    public static StringList Parse(string s, IFormatProvider? provider)
    {
        return new StringList(s.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(part => part.Trim()).ToList());
    }

    public static bool TryParse([NotNullWhen(true)] string? s, IFormatProvider? provider, [MaybeNullWhen(false)] out StringList result)
    {
        result = null;
        if (s is null) return false;
        result = Parse(s, provider);
        return true;
    }
}

public record GetProductsWithPaginationQuery : IRequest<PaginatedList<ProductListItemDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? SearchTerm { get; init; }
    public GuidList? CategoryIds { get; init; }
    public StringList? CategorySlugs { get; init; }
    public StringList? Brands { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public decimal? MinRating { get; init; }
    public bool? OnSaleOnly { get; init; }
    public StockStatus? StockStatus { get; init; }
    public string? CustomFiltersJson { get; init; }
    public string? SortBy { get; init; }
    public string? SortDirection { get; init; }
}

public class GetProductsWithPaginationQueryHandler : IRequestHandler<GetProductsWithPaginationQuery, PaginatedList<ProductListItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductsWithPaginationQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<ProductListItemDto>> Handle(GetProductsWithPaginationQuery request, CancellationToken cancellationToken)
    {
        // === BUILD BASE QUERY ===
        var query = _context.Products.OfType<PhysicalProduct>().AsNoTracking()
            .Where(p => p.Status == ProductStatus.Published && p.IsActive);

        query = ApplyCoreFiltersWithoutCategories(query, request);
        query = ApplyValueFilters(query, request);

        // === CATEGORY FILTERING ===
        var combinedCategoryGuids = new List<Guid>();

        if (request.CategoryIds != null && request.CategoryIds.Value.Any())
        {
            combinedCategoryGuids.AddRange(request.CategoryIds.Value);
        }

        if (request.CategorySlugs != null && request.CategorySlugs.Value.Any())
        {
            var categorySlugsToFilter = request.CategorySlugs.Value.ToList();
            var categoryIdsFromSlugs = await _context.ProductCategories
                .AsNoTracking()
                .Where(c => categorySlugsToFilter.Contains(c.Key)) 
                .Select(c => c.Id)
                .ToListAsync(cancellationToken);

            combinedCategoryGuids.AddRange(categoryIdsFromSlugs);
        }

        if (combinedCategoryGuids.Any())
        {
            var distinctCategoryGuids = combinedCategoryGuids.Distinct().ToList();

            var allProductsWithCategories = await query
                .Select(p => new { p.Id, p.CategoryIds })
                .ToListAsync(cancellationToken);

            var matchingProductIds = allProductsWithCategories
                .Where(p => p.CategoryIds != null &&
                           p.CategoryIds.Any(categoryId => distinctCategoryGuids.Contains(categoryId)))
                .Select(p => p.Id)
                .ToList();

            if (!matchingProductIds.Any())
            {
                return new PaginatedList<ProductListItemDto>(new List<ProductListItemDto>(), 0, request.PageNumber, request.PageSize);
            }

            query = _context.Products.OfType<PhysicalProduct>().AsNoTracking()
                .Where(p => p.Status == ProductStatus.Published && p.IsActive && matchingProductIds.Contains(p.Id));

            query = ApplyCoreFiltersWithoutCategories(query, request);
            query = ApplyValueFilters(query, request);
        }

        // === CUSTOM ATTRIBUTES FILTERING ===
        if (!string.IsNullOrWhiteSpace(request.CustomFiltersJson))
        {
            try
            {
                var filters = JsonSerializer.Deserialize<Dictionary<string, string>>(request.CustomFiltersJson);
                if (filters != null && filters.Any())
                {
                    var matchingIds = await _context.GetProductIdsMatchingCustomAttributesAsync(filters, cancellationToken);
                    if (!matchingIds.Any() && filters.Any())
                    {
                        return new PaginatedList<ProductListItemDto>(new List<ProductListItemDto>(), 0, request.PageNumber, request.PageSize);
                    }
                    if (matchingIds.Any())
                    {
                        query = query.Where(p => matchingIds.Contains(p.Id));
                    }
                }
            }
            catch (JsonException) { /* Ignore */ }
        }

        // === SORTING AND PAGINATION ===
        query = ApplySorting(query, request);

        var totalCount = await query.CountAsync(cancellationToken);
        var products = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Include(p => p.AttributeAssignments)
                .ThenInclude(aa => aa.AttributeValue)
            .Include(p => p.VariantCombinations)
            .ToListAsync(cancellationToken);

        var dtoItems = await ProductDtoProcessor.ProcessProductsToListItemDtosAsync(products.Cast<ProductBase>().ToList(), _context);
        return new PaginatedList<ProductListItemDto>(dtoItems, totalCount, request.PageNumber, request.PageSize);
    }

    // === FILTER METHODS ===
    private static IQueryable<PhysicalProduct> ApplyCoreFiltersWithoutCategories(IQueryable<PhysicalProduct> query, GetProductsWithPaginationQuery request)
    {
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTermLower = request.SearchTerm.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchTermLower) ||
                (p.Sku != null && p.Sku.ToLower().Contains(searchTermLower)) ||
                (p.Brand != null && p.Brand.ToLower().Contains(searchTermLower)) ||
                (p.ShortDescription != null && p.ShortDescription.ToLower().Contains(searchTermLower)) ||
                p.Description.ToLower().Contains(searchTermLower)
            );
        }

        if (request.Brands != null && request.Brands.Value.Any())
        {
            query = query.Where(p => p.Brand != null && request.Brands.Value.Contains(p.Brand));
        }

        return query;
    }

    private static IQueryable<PhysicalProduct> ApplyValueFilters(IQueryable<PhysicalProduct> query, GetProductsWithPaginationQuery request)
    {
        if (request.MinPrice.HasValue) query = query.Where(p => p.Pricing.Price >= request.MinPrice.Value);
        if (request.MaxPrice.HasValue) query = query.Where(p => p.Pricing.Price <= request.MaxPrice.Value);
        if (request.MinRating.HasValue) query = query.Where(p => p.AverageRating >= request.MinRating.Value);
        if (request.OnSaleOnly == true) query = query.Where(p => p.Pricing.Price < p.Pricing.OriginalPrice);
        if (request.StockStatus.HasValue) query = query.Where(p => p.StockStatus == request.StockStatus.Value);
        return query;
    }

    private static IQueryable<PhysicalProduct> ApplySorting(IQueryable<PhysicalProduct> query, GetProductsWithPaginationQuery request)
    {
        var isDescending = request.SortDirection?.ToLower() == "desc";

        switch (request.SortBy?.ToLower())
        {
            case "price":
                if (isDescending)
                {
                    query = query.OrderByDescending(p => p.VariantCombinations.Any()
                        ? (p.VariantCombinations.Max(v => v.Price) ?? p.Pricing.Price)
                        : p.Pricing.Price);
                }
                else
                {
                    query = query.OrderBy(p => p.VariantCombinations.Any()
                        ? (p.VariantCombinations.Min(v => v.Price) ?? p.Pricing.Price)
                        : p.Pricing.Price);
                }
                break;

            case "createdat":
                query = isDescending ? query.OrderByDescending(p => p.Created) : query.OrderBy(p => p.Created);
                break;

            case "name":
                query = isDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name);
                break;

            case "popularity":
                query = isDescending
                    ? query.OrderByDescending(p => p.TotalSalesCount).ThenByDescending(p => p.ViewCount)
                    : query.OrderBy(p => p.TotalSalesCount).ThenBy(p => p.ViewCount);
                break;

            default:
                query = isDescending ? query.OrderByDescending(p => p.Created) : query.OrderBy(p => p.Name);
                break;
        }

        return (query as IOrderedQueryable<PhysicalProduct>)?.ThenBy(p => p.Id) ?? query.OrderBy(p => p.Id);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetProductVariantByIdQuery.cs ---
/**
 * @file GetProductVariantByIdQuery.cs
 * @Version 5.0.0 (FINAL - DTO Correction & Media/Attribute Details)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description Corrected handler to fetch all associated media and complete attribute details,
 *              populating the updated VariantDto with comprehensive data.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Products.Queries.GetProductById; // Hier staat VariantDto
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;
using System.Linq; // Nodig voor LINQ methoden
using RoyalCode.Domain.Entities.Media; // Nodig voor MediaBase
using System.Collections.Generic; // Nodig voor Dictionary

namespace RoyalCode.Application.Products.Queries.GetProductVariantById;

public record GetProductVariantByIdQuery(Guid VariantId) : IRequest<VariantDto?>;

public class GetProductVariantByIdQueryHandler : IRequestHandler<GetProductVariantByIdQuery, VariantDto?>
{
    private readonly IApplicationDbContext _context;

    public GetProductVariantByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<VariantDto?> Handle(GetProductVariantByIdQuery request, CancellationToken cancellationToken)
    {
        var variant = await _context.ProductVariantCombinations
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == request.VariantId, cancellationToken);

        if (variant == null) return null;

        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.AttributeAssignments).ThenInclude(a => a.AttributeValue)
            .FirstOrDefaultAsync(p => p.Id == variant.ProductId, cancellationToken);

        if (product == null) return null;

        // Haal de media op die bij deze variant hoort
        var mediaForVariant = await _context.Media
            .AsNoTracking()
            .Where(m => variant.MediaIds.Contains(m.Id))
            .Include(m => m.Tags)
            .ToListAsync(cancellationToken);

        var mediaDtos = mediaForVariant.Select(m => new MediaDto(
            m.Id,
            (int)m.Type,
            m.GetDeliveryUrl(),
            m.ThumbnailUrl,
            (m as ImageMedia)?.AltTextKeyOrText,
            m.Tags.Select(t => t.Name).ToList()
        )).ToList();

        // Haal alle AttributeValues op die relevant zijn voor dit product en cache ze
        var allAttributeValueIds = product.AttributeAssignments.Select(paa => paa.AttributeValueId).ToHashSet();
        var attributeValuesLookup = await _context.AttributeValues
            .AsNoTracking()
            .Where(av => allAttributeValueIds.Contains(av.Id))
            .ToDictionaryAsync(av => av.Id, av => av, cancellationToken);


        return new VariantDto(
            variant.Id,
            variant.Sku,
            variant.AttributeValueIds.Select(valueId =>
            {
                var attributeAssignment = product.AttributeAssignments
                    .FirstOrDefault(a => a.AttributeValueId == valueId);
                var attributeValue = attributeValuesLookup.GetValueOrDefault(valueId);

                // --- DE FIX: Geef alle nieuwe parameters door aan VariantAttributeDto ---
                return new VariantAttributeDto(
                    CreateDeterministicGuid(attributeValue?.AttributeType.ToString() ?? "unknown"),
                    $"attribute.{attributeValue?.AttributeType.ToString().ToLower() ?? "unknown"}",
                    valueId,
                    attributeValue?.DisplayName ?? "Unknown Value",
                    attributeValue?.ColorHex
                );
                // --- EINDE FIX ---
            }).ToList(),
            variant.Price ?? 0,
            variant.OriginalPrice,
            variant.StockQuantity ?? 0,
            (int)(variant.StockStatus ?? StockStatus.Undefined),
            (variant.Price ?? 0) < (variant.OriginalPrice ?? 0),
            variant.IsDefault,
            mediaDtos
        );
    }

    private static Guid CreateDeterministicGuid(string input)
    {
        if (string.IsNullOrEmpty(input)) return Guid.Empty;
        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetTagsQuery.cs ---
/**
 * @file GetTagsQuery.cs
 * @Version 1.2.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-01
 * @Description Query and DTO for fetching product tags.
 *              FIX: The query now performs in-memory filtering and distinct operations
 *              to correctly handle tags stored as comma-separated strings.
 */
using RoyalCode.Application.Common.Interfaces;
using System.Linq; // Added for SelectMany and Distinct

namespace RoyalCode.Application.Products.Queries.GetTags;

/// <summary>
/// DTO for a single product tag.
/// </summary>
public record TagDto(string Name);

/// <summary>
/// Query to fetch product tags, with an optional search term for autocomplete functionality.
/// </summary>
public record GetTagsQuery(string? SearchTerm) : IRequest<List<TagDto>>;

/// <summary>
/// Handles fetching and filtering product tags from all products.
/// </summary>
public class GetTagsQueryHandler : IRequestHandler<GetTagsQuery, List<TagDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTagsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc/>
    public async Task<List<TagDto>> Handle(GetTagsQuery request, CancellationToken cancellationToken)
    {
        // === FIX: Client-side evaluation for Tags collection ===
        // EF Core cannot translate 'p.Tags' (which is stored as a string) directly into SQL
        // for operations like SelectMany(). We must fetch all tag lists first,
        // then process them in-memory.

        // 1. Fetch all product tag lists from the database.
        var allProductTagLists = await _context.Products
            .AsNoTracking()
            .Select(p => p.Tags) // This returns a List<IReadOnlyCollection<string>>
            .ToListAsync(cancellationToken);

        // 2. Process in-memory: flatten the lists, get distinct tags, and apply filter.
        var uniqueTags = allProductTagLists
            .SelectMany(tags => tags) // Flatten all lists of tags into a single sequence
            .Distinct(StringComparer.OrdinalIgnoreCase); // Get only unique tags (case-insensitive)

        IEnumerable<string> filteredTags = uniqueTags;

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            filteredTags = uniqueTags.Where(t => t.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase));
        }

        // 3. Order and take top N, then map to DTOs.
        return filteredTags
            .OrderBy(t => t)
            .Take(20) // Limit the number of results for performance
            .Select(t => new TagDto(t))
            .ToList();
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Commands/CreateReview/CreateReview.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Reviews.Queries.GetReviewsForProduct;
using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Enums.Review;
using FluentValidation;
using FV = FluentValidation.Results;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using ValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;

namespace RoyalCode.Application.Reviews.Commands.CreateReview;

public record CreateReviewCommand : IRequest<ReviewListItemDto>
{
    public Guid TargetEntityId { get; init; }
    public ReviewTargetEntityType TargetEntityType { get; init; }
    public decimal Rating { get; init; }
    public string ReviewText { get; init; } = string.Empty;
    public string? Title { get; init; }
    public bool IsVerifiedPurchase { get; init; } = false;
    public List<Guid>? MediaIds { get; init; }
}

public class CreateReviewCommandValidator : AbstractValidator<CreateReviewCommand>
{
    public CreateReviewCommandValidator()
    {
        RuleFor(v => v.TargetEntityId).NotEmpty();
        RuleFor(v => v.TargetEntityType).IsInEnum();
        RuleFor(v => v.Rating).InclusiveBetween(1.0m, 5.0m);
        RuleFor(v => v.ReviewText).NotEmpty().MaximumLength(2000);
        RuleFor(v => v.Title).MaximumLength(255).When(v => !string.IsNullOrWhiteSpace(v.Title));
        RuleFor(v => v.MediaIds)
            .Must(ids => ids == null || ids.Count <= 10)
            .WithMessage("Maximaal 10 media-items per review toegestaan.");
    }
}


public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, ReviewListItemDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public CreateReviewCommandHandler(IApplicationDbContext context, IUser user, IIdentityService identityService)
    {
        _context = context;
        _user = user;
        _identityService = identityService;
    }

    public async Task<ReviewListItemDto> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var userId = _user.Id ?? throw new UnauthorizedAccessException("Gebruiker moet ingelogd zijn om een review te kunnen schrijven.");

        var existingReview = await _context.Reviews.AnyAsync(r => r.AuthorId == userId && r.TargetEntityId == request.TargetEntityId, cancellationToken);
        if (existingReview)
        {
            throw new ValidationException(new List<FV.ValidationFailure> { new(nameof(request.TargetEntityId), "U heeft dit item al gereviewed.") });
        }

        await ValidateTargetEntityExists(request.TargetEntityId, request.TargetEntityType, cancellationToken);

        if (request.MediaIds != null && request.MediaIds.Any())
        {
            await ValidateMediaIds(request.MediaIds, userId, cancellationToken);
        }

        var review = new Review(userId, request.TargetEntityId, request.TargetEntityType, request.Rating, request.ReviewText, request.Title, request.IsVerifiedPurchase);

        // Geen UserProfile meer nodig. Review Domain object bevat AuthorId direct.
        // var authorProfile = await _userProfileService.GetAuthorProfileAsync(userId, cancellationToken);
        // if (authorProfile == null) throw new InvalidOperationException($"Kon gebruikersprofiel niet ophalen voor user ID {userId}.");

        // Simuleer automatische goedkeuring voor seeding/testen.
        // TODO: In een echt systeem, zou dit een moderatieproces triggeren.
        review.Approve(Guid.Parse("00000000-0000-0000-0000-000000000001"), "Automatically approved upon creation."); // Gebruik SystemProcessId

        if (request.MediaIds != null)
        {
            foreach (var mediaId in request.MediaIds) review.AddMedia(mediaId);
        }

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync(cancellationToken);

        // Haal profiel op voor DTO mapping
        var authorProfiles = await _identityService.GetProfilesByIdsAsync(new[] { userId });
        var authorProfile = authorProfiles.GetValueOrDefault(userId);

        return new ReviewListItemDto
        {
            Id = review.Id,
            Rating = review.Rating,
            Title = review.Title,
            ReviewText = review.ReviewText,
            IsVerifiedPurchase = review.IsVerifiedPurchase,
            Likes = review.Likes,
            Dislikes = review.Dislikes,
            Status = review.Status,
            CreatedAt = review.Created,
            AuthorId = review.AuthorId,
            AuthorDisplayName = authorProfile?.DisplayName ?? "Anoniem",
            AuthorAvatarMediaId = authorProfile?.Avatar?.Id,
            MediaCount = review.MediaIds.Count,
            ReplyCount = review.Replies.Count
        };
    }

    private async Task ValidateTargetEntityExists(Guid targetEntityId, ReviewTargetEntityType targetEntityType, CancellationToken cancellationToken)
    {
        bool exists = targetEntityType switch
        {
            ReviewTargetEntityType.Product => await _context.Products.AnyAsync(p => p.Id == targetEntityId, cancellationToken),
            _ => true
        };
        if (!exists) throw new NotFoundException(targetEntityType.ToString(), targetEntityId.ToString());
    }

    private async Task ValidateMediaIds(List<Guid> mediaIds, Guid userId, CancellationToken cancellationToken)
    {
        var validMediaCount = await _context.Media.CountAsync(m => mediaIds.Contains(m.Id) && m.UploaderUserId == userId, cancellationToken);
        if (validMediaCount != mediaIds.Count)
        {
            throw new ValidationException(new List<FV.ValidationFailure> { new(nameof(CreateReviewCommand.MediaIds), "Eén of meer media-items zijn ongeldig of niet van jou.") });
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Commands/CreateReview/CreateReviewResponseDto.cs ---
/**
 * @file CreateReviewResponseDto.cs
 * @Version 2.0.0 (Fixed with Shared UserProfile)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-29
 * @Description Response DTO for the CreateReview command using shared UserProfile.
 */
using RoyalCode.Domain.Entities.Review;

namespace RoyalCode.Application.Reviews.Commands.CreateReview;

/// <summary>
/// DTO representing the response after successfully creating a review.
/// </summary>
public class CreateReviewResponseDto
{
    public Guid Id { get; init; }
    public decimal Rating { get; init; }
    public string? Title { get; init; }
    public string ReviewText { get; init; } = string.Empty;
    public bool IsVerifiedPurchase { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public string AuthorDisplayName { get; init; } = string.Empty;
    public int MediaCount { get; init; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Commands/DeleteReview/DeleteReview.cs ---
/**
 * @file DeleteReview.cs
 * @Version 2.2.0 (FIXED - Admin/Moderator Authorization)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Defines the use case (command and handler) for deleting a review,
 *              now correctly authorizing administrators and moderators to delete any review.
 */
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Enums.Review;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using RoyalCode.Domain.Constants; // Voor Roles

namespace RoyalCode.Application.Reviews.Commands.DeleteReview;

public record DeleteReviewCommand(Guid ReviewId) : IRequest;

public class DeleteReviewCommandValidator : AbstractValidator<DeleteReviewCommand>
{
    public DeleteReviewCommandValidator()
    {
        RuleFor(v => v.ReviewId).NotEmpty();
    }
}

public class DeleteReviewCommandHandler : IRequestHandler<DeleteReviewCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;
    private readonly IIdentityService _identityService; // Injecteer IIdentityService

    public DeleteReviewCommandHandler(IApplicationDbContext context, IUser user, IIdentityService identityService) // Voeg identityService toe aan constructor
    {
        _context = context;
        _user = user;
        _identityService = identityService; // Wijs toe
    }

    public async Task Handle(DeleteReviewCommand request, CancellationToken cancellationToken)
    {
        var userId = _user.Id ?? throw new UnauthorizedAccessException("User must be logged in to delete a review.");

        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == request.ReviewId, cancellationToken)
            ?? throw new NotFoundException(nameof(Review), request.ReviewId.ToString());

        // --- DE FIX: Controleer of de gebruiker de auteur is OF een beheerder/moderator ---
        var isCurrentUserAdmin = await _identityService.IsInRoleAsync(userId, Roles.Administrator);
        var isCurrentUserModerator = await _identityService.IsInRoleAsync(userId, Roles.Moderator);

        if (review.AuthorId != userId && !isCurrentUserAdmin && !isCurrentUserModerator)
        {
            throw new ForbiddenAccessException("You are not authorized to delete this review.");
        }
        // --- EINDE FIX ---

        var productId = review.TargetEntityId;

        _context.Reviews.Remove(review);

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == productId, cancellationToken);

        if (product != null)
        {
            // Update gemiddelde rating en review count voor het product
            var remainingReviews = await _context.Reviews
                .Where(r => r.TargetEntityId == productId && r.Id != request.ReviewId && r.Status == ReviewStatus.Approved)
                .ToListAsync(cancellationToken);

            if (remainingReviews.Any())
            {
                var newAverageRating = Math.Round(remainingReviews.Average(r => r.Rating), 1);
                product.UpdateRating(newAverageRating, remainingReviews.Count);
            }
            else
            {
                product.UpdateRating(0, 0); // Geen goedgekeurde reviews meer
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Commands/UpdateReview/UpdateReview.cs ---
/**
 * @file UpdateReview.cs
 * @Version 5.1.0 (FIXED - Admin Media Validation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Command and handler for updating a review, now with correct media validation
 *              for administrators, allowing them to use any existing media.
 */
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Reviews.Queries.GetReviewsForProduct;
using RoyalCode.Domain.Constants; // Voor Roles
using RoyalCode.Domain.Entities.Review;
using FV = FluentValidation.Results;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using ValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;

namespace RoyalCode.Application.Reviews.Commands.UpdateReview;

public record UpdateReviewCommand : IRequest<ReviewListItemDto>
{
    public Guid Id { get; init; }
    public decimal Rating { get; init; }
    public string ReviewText { get; init; } = string.Empty;
    public string? Title { get; init; }
    public List<Guid>? MediaIds { get; init; }
}

public class UpdateReviewCommandValidator : AbstractValidator<UpdateReviewCommand>
{
    // De validator zelf heeft geen directe toegang tot IUser/IIdentityService voor rol-check
    // De media validatie wordt daarom verplaatst naar de handler.
    public UpdateReviewCommandValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.Rating).InclusiveBetween(1.0m, 5.0m);
        RuleFor(v => v.ReviewText).NotEmpty().MaximumLength(2000);
        RuleFor(v => v.Title).MaximumLength(255).When(v => !string.IsNullOrWhiteSpace(v.Title));
        // De mediaIds validatie (max 10 items) blijft hier
        RuleFor(v => v.MediaIds).Must(ids => ids == null || ids.Count <= 10).WithMessage("Maximaal 10 media-items per review toegestaan.");
    }
}

public class UpdateReviewCommandHandler : IRequestHandler<UpdateReviewCommand, ReviewListItemDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public UpdateReviewCommandHandler(IApplicationDbContext context, IUser user, IIdentityService identityService)
    {
        _context = context;
        _user = user;
        _identityService = identityService;
    }

    public async Task<ReviewListItemDto> Handle(UpdateReviewCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _user.Id ?? throw new UnauthorizedAccessException("User must be logged in to update a review.");

        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Review), request.Id.ToString());

        // --- DE FIX: Controleer of de huidige gebruiker een admin/moderator is ---
        var isCurrentUserAdminOrModerator = await _identityService.IsInRoleAsync(currentUserId, Roles.Administrator) ||
                                            await _identityService.IsInRoleAsync(currentUserId, Roles.Moderator);

        // Autorisatie: Alleen de auteur of een admin/moderator mag de review bewerken
        if (review.AuthorId != currentUserId && !isCurrentUserAdminOrModerator)
        {
            throw new ForbiddenAccessException("You are not authorized to edit this review.");
        }
        // --- EINDE FIX ---

        if (request.MediaIds != null && request.MediaIds.Any())
        {
            // --- DE FIX: Geef de rol-informatie mee aan de media-validatie ---
            await ValidateMediaIds(request.MediaIds, currentUserId, isCurrentUserAdminOrModerator, cancellationToken);
            // --- EINDE FIX ---
        }

        review.UpdateContent(request.Title, request.ReviewText);
        review.UpdateRating(request.Rating);

        review.ClearMedia();
        if (request.MediaIds != null)
        {
            foreach (var mediaId in request.MediaIds) review.AddMedia(mediaId);
        }

        // Update gemiddelde rating voor het product als de status is goedgekeurd of gewijzigd.
        // Dit is al aanwezig in UpdateReviewStatusCommand, maar moet ook hier.
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == review.TargetEntityId, cancellationToken);
        if (product != null)
        {
            var approvedReviews = await _context.Reviews
                .Where(r => r.TargetEntityId == product.Id && r.Status == Domain.Enums.Review.ReviewStatus.Approved)
                .ToListAsync(cancellationToken);

            if (approvedReviews.Any())
            {
                var newAverageRating = Math.Round(approvedReviews.Average(r => r.Rating), 1);
                product.UpdateRating(newAverageRating, approvedReviews.Count);
            }
            else
            {
                product.UpdateRating(0, 0); // Geen goedgekeurde reviews meer
            }
        }


        await _context.SaveChangesAsync(cancellationToken);

        var authorProfiles = await _identityService.GetProfilesByIdsAsync(new[] { review.AuthorId });
        var authorProfile = authorProfiles.GetValueOrDefault(review.AuthorId);

        return new ReviewListItemDto
        {
            Id = review.Id,
            Rating = review.Rating,
            Title = review.Title,
            ReviewText = review.ReviewText,
            IsVerifiedPurchase = review.IsVerifiedPurchase,
            Likes = review.Likes,
            Dislikes = review.Dislikes,
            Status = review.Status,
            CreatedAt = review.Created,
            AuthorId = review.AuthorId,
            AuthorDisplayName = authorProfile?.DisplayName ?? "Anoniem",
            AuthorAvatarMediaId = authorProfile?.Avatar?.Id,
            MediaCount = review.MediaIds.Count,
            ReplyCount = review.Replies.Count
        };
    }

    private async Task ValidateMediaIds(List<Guid> mediaIds, Guid currentUserId, bool isCurrentUserAdminOrModerator, CancellationToken cancellationToken)
    {
        if (!mediaIds.Any()) return;

        // Als de huidige gebruiker een admin of moderator is, controleren we alleen of de media bestaat.
        if (isCurrentUserAdminOrModerator)
        {
            var existingMediaCount = await _context.Media.CountAsync(m => mediaIds.Contains(m.Id), cancellationToken);
            if (existingMediaCount != mediaIds.Count)
            {
                var missingIds = mediaIds.Except(await _context.Media.Where(m => mediaIds.Contains(m.Id)).Select(m => m.Id).ToListAsync(cancellationToken)).ToList();
                throw new ValidationException(new List<FV.ValidationFailure> { new(nameof(UpdateReviewCommand.MediaIds), $"E�n of meer media-items bestaan niet in het systeem. Ontbrekende ID's: {string.Join(", ", missingIds)}") });
            }
        }
        else // Voor een normale gebruiker, controleer of de media bestaat EN van de gebruiker is.
        {
            var validMediaCount = await _context.Media.CountAsync(m => mediaIds.Contains(m.Id) && m.UploaderUserId == currentUserId, cancellationToken);
            if (validMediaCount != mediaIds.Count)
            {
                var missingOrUnauthorizedIds = mediaIds.Except(await _context.Media.Where(m => mediaIds.Contains(m.Id) && m.UploaderUserId == currentUserId).Select(m => m.Id).ToListAsync(cancellationToken)).ToList();
                throw new ValidationException(new List<FV.ValidationFailure> { new(nameof(UpdateReviewCommand.MediaIds), $"E�n of meer media-items zijn ongeldig of niet van jou. Probleem-ID's: {string.Join(", ", missingOrUnauthorizedIds)}") });
            }
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Commands/UpdateReview/UpdateReviewStatusCommand.cs ---
/**
 * @file UpdateReviewStatusCommand.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Command and handler for administrators to update the status of a review.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Enums.Review;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Reviews.Commands.UpdateReviewStatus;

public record UpdateReviewStatusCommand(Guid ReviewId, ReviewStatus NewStatus, string? ModeratorNote, Guid ModeratorId) : IRequest;

public class UpdateReviewStatusCommandHandler : IRequestHandler<UpdateReviewStatusCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateReviewStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateReviewStatusCommand request, CancellationToken cancellationToken)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == request.ReviewId, cancellationToken)
            ?? throw new NotFoundException(nameof(Review), request.ReviewId.ToString());

        switch (request.NewStatus)
        {
            case ReviewStatus.Approved:
                review.Approve(request.ModeratorId, request.ModeratorNote);
                break;
            case ReviewStatus.Rejected:
                if (string.IsNullOrWhiteSpace(request.ModeratorNote))
                {
                    throw new BadRequestException("Rejection reason is required for rejecting a review.", "REJECTION_REASON_REQUIRED");
                }
                review.Reject(request.ModeratorId, request.ModeratorNote);
                break;
            case ReviewStatus.Flagged:
                // Voor flagging door admin, kunnen we een generieke reden of de moderatorNote gebruiken
                review.Flag(request.ModeratorId, ReviewFlagReason.Other, request.ModeratorNote ?? "Flagged by admin.");
                break;
            case ReviewStatus.Pending:
                // --- DE FIX: Gebruik de nieuwe domeinmethode ---
                review.ResetStatusToPending(request.ModeratorId, request.ModeratorNote);
                break;
            default:
                throw new BadRequestException($"Unsupported review status transition to {request.NewStatus}.", "UNSUPPORTED_STATUS_TRANSITION");
        }

        // Update product's average rating if the review status changes from/to Approved
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == review.TargetEntityId, cancellationToken);
        if (product != null)
        {
            var approvedReviews = await _context.Reviews
                .Where(r => r.TargetEntityId == product.Id && r.Status == ReviewStatus.Approved)
                .ToListAsync(cancellationToken);

            if (approvedReviews.Any())
            {
                var newAverageRating = Math.Round(approvedReviews.Average(r => r.Rating), 1);
                product.UpdateRating(newAverageRating, approvedReviews.Count);
            }
            else
            {
                product.UpdateRating(0, 0); // Geen goedgekeurde reviews meer
            }
        }


        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Commands/VoteOnReviewCommand.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Reviews.Queries.GetReviewsForProduct;
using RoyalCode.Domain.Entities.Review;

namespace RoyalCode.Application.Reviews.Commands.VoteOnReview;

public enum VoteType { Like, Dislike }

public record VoteOnReviewCommand : IRequest<ReviewListItemDto>
{
    public Guid ReviewId { get; init; }
    public VoteType VoteType { get; init; }
}

public class VoteOnReviewCommandHandler : IRequestHandler<VoteOnReviewCommand, ReviewListItemDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public VoteOnReviewCommandHandler(IApplicationDbContext context, IUser user, IIdentityService identityService)
    {
        _context = context;
        _user = user;
        _identityService = identityService;
    }

    public async Task<ReviewListItemDto> Handle(VoteOnReviewCommand request, CancellationToken cancellationToken)
    {
        var userId = _user.Id ?? throw new UnauthorizedAccessException("User must be logged in to vote.");

        var review = await _context.Reviews
            .Include(r => r.HelpfulVotes)
            .FirstOrDefaultAsync(r => r.Id == request.ReviewId, cancellationToken);

        Guard.Against.NotFound(request.ReviewId, review);

        if (review.AuthorId == userId)
        {
            throw new ConflictException("You cannot vote on your own review.", "VOTE_ON_OWN_REVIEW");
        }

        var existingVote = review.HelpfulVotes.FirstOrDefault(v => v.UserId == userId);
        bool isHelpful = request.VoteType == VoteType.Like;

        if (existingVote != null)
        {
            existingVote.UpdateVote(isHelpful);
        }
        else
        {
            var newVote = new ReviewHelpfulVote(review.Id, userId, isHelpful);
            _context.HelpfulVotes.Add(newVote);
        }

        review.RecalculateHelpfulScores();

        await _context.SaveChangesAsync(cancellationToken);

        var authorProfiles = await _identityService.GetProfilesByIdsAsync(new[] { review.AuthorId });
        var authorProfile = authorProfiles.GetValueOrDefault(review.AuthorId);

        return new ReviewListItemDto
        {
            Id = review.Id,
            Rating = review.Rating,
            Title = review.Title,
            ReviewText = review.ReviewText,
            IsVerifiedPurchase = review.IsVerifiedPurchase,
            Likes = review.Likes,
            Dislikes = review.Dislikes,
            Status = review.Status,
            CreatedAt = review.Created,
            AuthorId = review.AuthorId,
            AuthorDisplayName = authorProfile?.DisplayName ?? "Anoniem",
            AuthorAvatarMediaId = authorProfile?.Avatar?.Id,
            MediaCount = review.MediaIds.Count,
            ReplyCount = review.Replies.Count
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Queries/GetAllReviewsForAdminQuery.cs ---
/**
 * @file GetAllReviewsForAdminQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Query and handler for administrators to retrieve a paginated list of all reviews,
 *              including those pending moderation, rejected, or flagged.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Reviews.Queries.GetReviewsForProduct; // Hergebruik van DTO en Enum
using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Enums.Review;

namespace RoyalCode.Application.Reviews.Queries.GetAllReviewsForAdmin;

public record GetAllReviewsForAdminQuery : IRequest<PaginatedList<ReviewListItemDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public ReviewSortBy? SortBy { get; init; } = ReviewSortBy.Newest;
    public ReviewStatus? FilterByStatus { get; init; }
    public Guid? FilterByProductId { get; init; }
    public Guid? FilterByAuthorId { get; init; }
}

public class GetAllReviewsForAdminQueryHandler : IRequestHandler<GetAllReviewsForAdminQuery, PaginatedList<ReviewListItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetAllReviewsForAdminQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<PaginatedList<ReviewListItemDto>> Handle(GetAllReviewsForAdminQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Reviews.AsNoTracking();

        // --- Apply Filters ---
        if (request.FilterByStatus.HasValue)
        {
            query = query.Where(r => r.Status == request.FilterByStatus.Value);
        }
        if (request.FilterByProductId.HasValue)
        {
            query = query.Where(r => r.TargetEntityId == request.FilterByProductId.Value && r.TargetEntityType == ReviewTargetEntityType.Product);
        }
        if (request.FilterByAuthorId.HasValue)
        {
            query = query.Where(r => r.AuthorId == request.FilterByAuthorId.Value);
        }

        // --- Apply Sorting ---
        var sortBy = request.SortBy ?? ReviewSortBy.Newest;
        switch (sortBy)
        {
            case ReviewSortBy.Newest:
                query = query.OrderByDescending(r => r.Created);
                break;
            case ReviewSortBy.Oldest:
                query = query.OrderBy(r => r.Created);
                break;
            case ReviewSortBy.HighestRated:
                query = query.OrderByDescending(r => r.Rating);
                break;
            case ReviewSortBy.LowestRated:
                query = query.OrderBy(r => r.Rating);
                break;
            case ReviewSortBy.MostHelpful:
                query = query.OrderByDescending(r => r.Likes - r.Dislikes);
                break;
            default:
                query = query.OrderByDescending(r => r.Created);
                break;
        }

        var paginatedReviews = await PaginatedList<Review>.CreateAsync(query, request.PageNumber, request.PageSize, cancellationToken);

        // Batch-fetch all author profiles
        var authorIds = paginatedReviews.Items.Select(r => r.AuthorId).Distinct().ToList();
        var authorProfiles = await _identityService.GetProfilesByIdsAsync(authorIds);

        var reviewDtos = paginatedReviews.Items.Select(review =>
        {
            var authorProfile = authorProfiles.GetValueOrDefault(review.AuthorId);
            return new ReviewListItemDto
            {
                Id = review.Id,
                Rating = review.Rating,
                Title = review.Title,
                ReviewText = review.ReviewText,
                IsVerifiedPurchase = review.IsVerifiedPurchase,
                Likes = review.Likes,
                Dislikes = review.Dislikes,
                Status = review.Status,
                CreatedAt = review.Created,
                AuthorId = review.AuthorId,
                AuthorDisplayName = authorProfile?.DisplayName ?? "Anoniem",
                AuthorAvatarMediaId = authorProfile?.Avatar?.Id,
                MediaCount = review.MediaIds.Count,
                ReplyCount = review.Replies.Count
            };
        }).ToList();

        return new PaginatedList<ReviewListItemDto>(reviewDtos, paginatedReviews.TotalCount, request.PageNumber, request.PageSize);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Queries/GetMyReviewsQuery.cs ---
/**
 * @file GetMyReviewsQuery.cs
 * @Version 1.2.0 (FIXED - Robust Enum Binding)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description Query and handler for an authenticated user to retrieve their own reviews.
 *              FIXED: 'SortBy' parameter now uses string for robust, case-insensitive binding.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Reviews.Queries.GetReviewsForProduct; // Hergebruik van DTO en Enum
using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Enums.Review;

namespace RoyalCode.Application.Reviews.Queries.GetMyReviews;

public record GetMyReviewsQuery : IRequest<PaginatedList<ReviewListItemDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SortBy { get; init; } // <-- Gewijzigd naar string?
}

public class GetMyReviewsQueryHandler : IRequestHandler<GetMyReviewsQuery, PaginatedList<ReviewListItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public GetMyReviewsQueryHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<PaginatedList<ReviewListItemDto>> Handle(GetMyReviewsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException("User must be authenticated to retrieve their reviews.");

        var query = _context.Reviews
            .AsNoTracking()
            .Where(r => r.AuthorId == userId);

        // --- DE FIX: Parseer de string naar ReviewSortBy met case-insensitivity ---
        ReviewSortBy actualSortBy = ReviewSortBy.Newest; // Standaardwaarde
        if (!string.IsNullOrEmpty(request.SortBy) && !Enum.TryParse(request.SortBy, true, out actualSortBy))
        {
            // Log een waarschuwing als de parsing mislukt, maar ga verder met de standaardwaarde.
            // Dit kan ook een `BadRequestException` gooien als strikte validatie gewenst is.
            // Voor nu houden we het robuust met een fallback.
        }
        // --- EINDE FIX ---

        switch (actualSortBy) // Gebruik de geparseerde enum
        {
            case ReviewSortBy.Newest:
                query = query.OrderByDescending(r => r.Created);
                break;
            case ReviewSortBy.Oldest:
                query = query.OrderBy(r => r.Created);
                break;
            case ReviewSortBy.HighestRated:
                query = query.OrderByDescending(r => r.Rating);
                break;
            case ReviewSortBy.LowestRated:
                query = query.OrderBy(r => r.Rating);
                break;
            case ReviewSortBy.MostHelpful:
                query = query.OrderByDescending(r => r.Likes - r.Dislikes);
                break;
            default:
                query = query.OrderByDescending(r => r.Created);
                break;
        }

        var paginatedReviews = await PaginatedList<Review>.CreateAsync(query, request.PageNumber, request.PageSize, cancellationToken);

        var authorProfiles = await _identityService.GetProfilesByIdsAsync(new[] { userId });
        var authorProfile = authorProfiles.GetValueOrDefault(userId);

        var reviewDtos = paginatedReviews.Items.Select(review => new ReviewListItemDto
        {
            Id = review.Id,
            Rating = review.Rating,
            Title = review.Title,
            ReviewText = review.ReviewText,
            IsVerifiedPurchase = review.IsVerifiedPurchase,
            Likes = review.Likes,
            Dislikes = review.Dislikes,
            Status = review.Status,
            CreatedAt = review.Created,
            AuthorId = review.AuthorId,
            AuthorDisplayName = authorProfile?.DisplayName ?? "Anoniem",
            AuthorAvatarMediaId = authorProfile?.Avatar?.Id,
            MediaCount = review.MediaIds.Count,
            ReplyCount = review.Replies.Count
        }).ToList();

        return new PaginatedList<ReviewListItemDto>(reviewDtos, paginatedReviews.TotalCount, request.PageNumber, request.PageSize);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Queries/GetReviewById/GetReviewById.cs ---
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Reviews.Queries.GetReviewsForProduct;

namespace RoyalCode.Application.Reviews.Queries.GetReviewById;

public record GetReviewByIdQuery(Guid Id) : IRequest<ReviewListItemDto?>;

public class GetReviewByIdQueryHandler : IRequestHandler<GetReviewByIdQuery, ReviewListItemDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetReviewByIdQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<ReviewListItemDto?> Handle(GetReviewByIdQuery request, CancellationToken cancellationToken)
    {
        var review = await _context.Reviews
            .Where(r => r.Id == request.Id)
            .AsNoTracking()
            .Include(r => r.Replies)
            .FirstOrDefaultAsync(cancellationToken);

        if (review == null) return null;

        var authorProfiles = await _identityService.GetProfilesByIdsAsync(new[] { review.AuthorId });
        var authorProfile = authorProfiles.GetValueOrDefault(review.AuthorId);

        return new ReviewListItemDto
        {
            Id = review.Id,
            Rating = review.Rating,
            Title = review.Title,
            ReviewText = review.ReviewText,
            IsVerifiedPurchase = review.IsVerifiedPurchase,
            Likes = review.Likes,
            Dislikes = review.Dislikes,
            Status = review.Status,
            CreatedAt = review.Created,
            AuthorId = review.AuthorId,
            AuthorDisplayName = authorProfile?.DisplayName ?? "Anoniem",
            AuthorAvatarMediaId = authorProfile?.Avatar?.Id,
            MediaCount = review.MediaIds.Count,
            ReplyCount = review.Replies.Count
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Queries/GetReviewByIdForAdminQuery.cs ---
/**
 * @file GetReviewByIdForAdminQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Query and handler for administrators to retrieve a single review with full details.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Reviews.Queries.GetReviewsForProduct; // Hergebruik ReviewListItemDto
using RoyalCode.Domain.Entities.Review;

namespace RoyalCode.Application.Reviews.Queries.GetReviewByIdForAdmin;

public record GetReviewByIdForAdminQuery(Guid Id) : IRequest<ReviewListItemDto?>;

public class GetReviewByIdForAdminQueryHandler : IRequestHandler<GetReviewByIdForAdminQuery, ReviewListItemDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetReviewByIdForAdminQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<ReviewListItemDto?> Handle(GetReviewByIdForAdminQuery request, CancellationToken cancellationToken)
    {
        // Admin mag alle reviews zien, ongeacht status.
        var review = await _context.Reviews
            .AsNoTracking()
            .Include(r => r.Replies) // Include replies for full context
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (review == null) return null;

        // Fetch author profile
        var authorProfiles = await _identityService.GetProfilesByIdsAsync(new[] { review.AuthorId });
        var authorProfile = authorProfiles.GetValueOrDefault(review.AuthorId);

        return new ReviewListItemDto
        {
            Id = review.Id,
            Rating = review.Rating,
            Title = review.Title,
            ReviewText = review.ReviewText,
            IsVerifiedPurchase = review.IsVerifiedPurchase,
            Likes = review.Likes,
            Dislikes = review.Dislikes,
            Status = review.Status,
            CreatedAt = review.Created,
            AuthorId = review.AuthorId,
            AuthorDisplayName = authorProfile?.DisplayName ?? "Anoniem",
            AuthorAvatarMediaId = authorProfile?.Avatar?.Id,
            MediaCount = review.MediaIds.Count,
            ReplyCount = review.Replies.Count
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Queries/GetReviewsForProduct/GetReviewsForProduct.cs ---
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Enums.Review;
using System.Text.Json;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Reviews.Queries.GetReviewsForProduct;

public record ReviewDataForStats(decimal Rating, string ReviewText);

public record GetReviewsForProductQuery : IRequest<ProductReviewsDto>
{
    public Guid ProductId { get; init; }
    public Guid? CurrentUserId { get; set; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public ReviewSortBy SortBy { get; init; } = ReviewSortBy.Newest;
    public int? FilterByRating { get; init; }
    public bool VerifiedPurchasesOnly { get; init; } = false;
}

public enum ReviewSortBy
{
    Newest, Oldest, HighestRated, LowestRated, MostHelpful
}

public class GetReviewsForProductQueryHandler : IRequestHandler<GetReviewsForProductQuery, ProductReviewsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetReviewsForProductQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<ProductReviewsDto> Handle(GetReviewsForProductQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.Products.AsNoTracking()
            .Select(p => new { p.Id, p.CustomAttributesJson })
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);
        if (product == null) throw new NotFoundException(nameof(Domain.Entities.Product.ProductBase), request.ProductId.ToString());

        var allApprovedReviewsForStats = await _context.Reviews
            .AsNoTracking()
            .Where(r => r.TargetEntityId == request.ProductId &&
                          r.TargetEntityType == ReviewTargetEntityType.Product &&
                          r.Status != ReviewStatus.Rejected)
            .Select(r => new ReviewDataForStats(r.Rating, r.ReviewText))
            .ToListAsync(cancellationToken);

        var ratingStats = await CalculateRatingStatisticsAsync(request.ProductId, allApprovedReviewsForStats, product.CustomAttributesJson, cancellationToken);

        var paginatedQuery = _context.Reviews.AsNoTracking()
            .Where(r => r.TargetEntityId == request.ProductId && r.TargetEntityType == ReviewTargetEntityType.Product);

        paginatedQuery = paginatedQuery.Where(r => r.Status == ReviewStatus.Approved ||
                                 (request.CurrentUserId.HasValue &&
                                  r.AuthorId == request.CurrentUserId.Value &&
                                  (r.Status == ReviewStatus.Pending || r.Status == ReviewStatus.Flagged)));

        if (request.FilterByRating.HasValue) paginatedQuery = paginatedQuery.Where(r => Math.Floor(r.Rating) == request.FilterByRating.Value);
        if (request.VerifiedPurchasesOnly) paginatedQuery = paginatedQuery.Where(r => r.IsVerifiedPurchase);

        paginatedQuery = request.SortBy switch
        {
            ReviewSortBy.Newest => paginatedQuery.OrderByDescending(r => r.Created),
            ReviewSortBy.HighestRated => paginatedQuery.OrderByDescending(r => r.Rating),
            _ => paginatedQuery.OrderByDescending(r => r.Created)
        };

        var paginatedReviews = await PaginatedList<Review>.CreateAsync(paginatedQuery, request.PageNumber, request.PageSize, cancellationToken);

        var authorIds = paginatedReviews.Items.Select(r => r.AuthorId).Distinct().ToList();
        var authorProfiles = await _identityService.GetProfilesByIdsAsync(authorIds);

        var reviewDtos = paginatedReviews.Items.Select(review =>
        {
            var authorProfile = authorProfiles.GetValueOrDefault(review.AuthorId);
            return new ReviewListItemDto
            {
                Id = review.Id,
                Rating = review.Rating,
                Title = review.Title,
                ReviewText = review.ReviewText,
                IsVerifiedPurchase = review.IsVerifiedPurchase,
                Likes = review.Likes,
                Dislikes = review.Dislikes,
                Status = review.Status,
                CreatedAt = review.Created,
                AuthorId = review.AuthorId,
                AuthorDisplayName = authorProfile?.DisplayName ?? "Anoniem",
                AuthorAvatarMediaId = authorProfile?.Avatar?.Id,
                MediaCount = review.MediaIds.Count,
                ReplyCount = review.Replies.Count
            };
        }).ToList();

        var paginatedDto = new PaginatedList<ReviewListItemDto>(reviewDtos, paginatedReviews.TotalCount, request.PageNumber, request.PageSize);

        return new ProductReviewsDto { ProductId = request.ProductId, Reviews = paginatedDto, RatingStatistics = ratingStats };
    }


    private async Task<ReviewRatingStatistics> CalculateRatingStatisticsAsync(
        Guid targetEntityId, IReadOnlyList<ReviewDataForStats> allReviews, string? customAttributesJson, CancellationToken cancellationToken)
    {
        if (!allReviews.Any())
        {
            return new ReviewRatingStatistics
            {
                TargetEntityId = targetEntityId,
                TotalReviews = 0,
                AverageRating = 0,
                RatingDistribution = new Dictionary<string, int> { { "1", 0 }, { "2", 0 }, { "3", 0 }, { "4", 0 }, { "5", 0 } },
                PositiveHighlights = new List<string>(),
                FeatureRatings = new Dictionary<string, decimal>()
            };
        }

        var totalReviews = allReviews.Count;
        var averageRating = allReviews.Average(r => r.Rating);

        var ratingDistribution = allReviews
            .GroupBy(r => (int)Math.Floor(r.Rating))
            .ToDictionary(g => g.Key.ToString(), g => g.Count());
        for (int i = 1; i <= 5; i++) { if (!ratingDistribution.ContainsKey(i.ToString())) ratingDistribution[i.ToString()] = 0; }

        var highlightKeywords = await _context.ReviewHighlightKeywords
            .Where(k => k.LanguageCode == "nl-NL")
            .ToListAsync(cancellationToken);

        var positiveHighlights = new HashSet<string>();
        var highRatedReviews = allReviews.Where(r => r.Rating >= 4.0m);
        foreach (var review in highRatedReviews)
        {
            foreach (var keywordMapping in highlightKeywords)
            {
                if (review.ReviewText.Contains(keywordMapping.Keyword, StringComparison.OrdinalIgnoreCase))
                {
                    positiveHighlights.Add(keywordMapping.I18nKey);
                }
            }
        }

        var featureRatings = new Dictionary<string, decimal>();
        var featureKeywords = await _context.FeatureRatingKeywords
            .Where(k => k.LanguageCode == "nl-NL")
            .ToListAsync(cancellationToken);
        var featureKeywordsGrouped = featureKeywords.GroupBy(f => f.FeatureKey).ToDictionary(g => g.Key, g => g.Select(k => k.Keyword).ToArray());

        if (!string.IsNullOrWhiteSpace(customAttributesJson))
        {
            var attributes = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(customAttributesJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (attributes != null)
            {
                foreach (var feature in featureKeywordsGrouped)
                {
                    if (attributes.ContainsKey(feature.Key))
                    {
                        var relevantReviews = allReviews
                            .Where(r => feature.Value.Any(keyword => r.ReviewText.Contains(keyword, StringComparison.OrdinalIgnoreCase)))
                            .ToList();

                        if (relevantReviews.Any())
                        {
                            var avgFeatureRating = relevantReviews.Average(r => r.Rating);
                            featureRatings[feature.Key] = Math.Round(avgFeatureRating, 1);
                        }
                    }
                }
            }
        }

        return new ReviewRatingStatistics
        {
            TargetEntityId = targetEntityId,
            TotalReviews = totalReviews,
            AverageRating = Math.Round(averageRating, 1),
            RatingDistribution = ratingDistribution,
            PositiveHighlights = positiveHighlights.ToList(),
            FeatureRatings = featureRatings
        };
    }
}

public class ProductReviewsDto
{
    public Guid ProductId { get; init; }
    public PaginatedList<ReviewListItemDto> Reviews { get; init; } = null!;
    public ReviewRatingStatistics RatingStatistics { get; init; } = null!;
}

public class ReviewRatingStatistics
{
    public Guid TargetEntityId { get; init; }
    public int TotalReviews { get; init; }
    public decimal AverageRating { get; init; }
    public IReadOnlyDictionary<string, int> RatingDistribution { get; init; } = new Dictionary<string, int>();
    public IReadOnlyCollection<string> PositiveHighlights { get; init; } = new List<string>();
    public IReadOnlyDictionary<string, decimal> FeatureRatings { get; init; } = new Dictionary<string, decimal>();
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Queries/GetReviewsForProduct/GetReviewsForProductQueryValidator.cs ---
/**
 * @file GetReviewsForProductQueryValidator.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-23
 * @Description Validator for the GetReviewsForProduct query to ensure valid parameters.
 */

namespace RoyalCode.Application.Reviews.Queries.GetReviewsForProduct;

public class GetReviewsForProductQueryValidator : AbstractValidator<GetReviewsForProductQuery>
{
    public GetReviewsForProductQueryValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty()
            .WithMessage("Product ID is required and cannot be empty.");

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page number must be greater than or equal to 1.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1)
            .LessThanOrEqualTo(100)
            .WithMessage("Page size must be between 1 and 100.");

        RuleFor(x => x.FilterByRating)
            .InclusiveBetween(1, 5)
            .When(x => x.FilterByRating.HasValue)
            .WithMessage("Rating filter must be between 1 and 5.");

        RuleFor(x => x.SortBy)
            .IsInEnum()
            .WithMessage("Valid sort option is required.");
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Reviews/Queries/GetReviewsForProduct/ReviewListItemDto.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Application/Reviews/Queries/GetReviewsForProduct/ReviewListItemDto.cs ---
/**
 * @file ReviewListItemDto.cs
 * @Version 3.0.0 (Mapperless)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description DTO voor reviews in lijsten. AutoMapper is verwijderd.
 */
using RoyalCode.Domain.Enums.Review;

namespace RoyalCode.Application.Reviews.Queries.GetReviewsForProduct;

public class ReviewListItemDto
{
    public Guid Id { get; init; }
    public decimal Rating { get; init; }
    public string? Title { get; init; }
    public string ReviewText { get; init; } = string.Empty;
    public bool IsVerifiedPurchase { get; init; }
    public int Likes { get; init; }
    public int Dislikes { get; init; }
    public ReviewStatus Status { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public Guid AuthorId { get; init; }
    public string AuthorDisplayName { get; init; } = string.Empty;
    public Guid? AuthorAvatarMediaId { get; init; }
    public int MediaCount { get; init; }
    public int ReplyCount { get; init; }
    public int TotalVotes => Likes + Dislikes;
    public double LikePercentage => TotalVotes > 0 ? (double)Likes / TotalVotes * 100 : 0;
    public string TruncatedText => ReviewText.Length > 200 ? ReviewText.Substring(0, 197) + "..." : ReviewText;
}
--- END OF FILE ---

--- START OF FILE src/Application/Search/Common/SearchSuggestionDtos.cs ---
/**
 * @file SearchSuggestionDtos.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description DTOs for live search suggestions (autocomplete) in the frontend.
 */
using System;
using System.Collections.Generic;

namespace RoyalCode.Application.Search.Common;

public record SearchSuggestionDto
{
    public required string Type { get; init; } // e.g., 'product', 'category', 'brand'
    public required string Text { get; init; } // e.g., "DJI Avata Pro-View Combo"
    public string? ImageUrl { get; init; }
    public required List<string> Route { get; init; } // e.g., ['/products', 'dji-avata-pro-view-combo']
}

public record SearchSuggestionListDto
{
    public List<SearchSuggestionDto> Suggestions { get; init; } = new List<SearchSuggestionDto>();
}
--- END OF FILE ---

--- START OF FILE src/Application/Search/Queries/GetSearchSuggestionsQuery.cs ---
/**
 * @file GetSearchSuggestionsQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description Query and handler to get lightweight search suggestions for autocomplete functionality.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Search.Common;
using RoyalCode.Domain.Entities.Media; // Voor GetDeliveryUrl
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product; // Voor ProductStatus
using System.Linq; // Voor Distinct, ToList

namespace RoyalCode.Application.Search.Queries;

public record GetSearchSuggestionsQuery(string Query) : IRequest<SearchSuggestionListDto>;

public class GetSearchSuggestionsQueryHandler : IRequestHandler<GetSearchSuggestionsQuery, SearchSuggestionListDto>
{
    private readonly IApplicationDbContext _context;

    public GetSearchSuggestionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SearchSuggestionListDto> Handle(GetSearchSuggestionsQuery request, CancellationToken cancellationToken)
    {
        var suggestions = new List<SearchSuggestionDto>();
        var searchTerm = request.Query.ToLowerInvariant();
        const int maxSuggestionsPerType = 5; // Beperk het aantal suggesties per type

        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return new SearchSuggestionListDto { Suggestions = suggestions };
        }

        // --- 1. Product Suggesties ---
        var products = await _context.Products.OfType<PhysicalProduct>()
            .AsNoTracking()
            .Where(p => p.Status == ProductStatus.Published && p.IsActive &&
                        (p.Name.ToLower().Contains(searchTerm) ||
                         (p.Sku != null && p.Sku.ToLower().Contains(searchTerm)) ||
                         (p.Brand != null && p.Brand.ToLower().Contains(searchTerm))))
            .OrderBy(p => p.Name)
            .Take(maxSuggestionsPerType)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Slug,
                FirstMediaId = p.MediaIds.Any() ? (Guid?)p.MediaIds.First() : null
            })
            .ToListAsync(cancellationToken);

        var productMediaIds = products.Where(p => p.FirstMediaId.HasValue).Select(p => p.FirstMediaId!.Value).ToList();
        var mediaLookup = await _context.Media.AsNoTracking()
            .Where(m => productMediaIds.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id, m => m.GetDeliveryUrl(), cancellationToken);

        foreach (var product in products)
        {
            suggestions.Add(new SearchSuggestionDto
            {
                Type = "product",
                Text = product.Name,
                ImageUrl = product.FirstMediaId.HasValue ? mediaLookup.GetValueOrDefault(product.FirstMediaId.Value) : null,
                Route = new List<string> { "/products", product.Slug ?? product.Id.ToString() }
            });
        }

        // --- 2. Categorie Suggesties ---
        var categories = await _context.ProductCategories
            .AsNoTracking()
            .Where(c => c.Key.ToLower().Contains(searchTerm)) // Zoek nu op Key
            .OrderBy(c => c.Key)
            .Take(maxSuggestionsPerType)
            .Select(c => new { c.Id, c.Key })
            .ToListAsync(cancellationToken);

        foreach (var category in categories)
        {
            suggestions.Add(new SearchSuggestionDto
            {
                Type = "category",
                Text = category.Key,
                Route = new List<string> { "/categories", category.Key } 
            });
        }

        // --- 3. Merk Suggesties (uit Producten) ---
        var brands = await _context.Products.OfType<PhysicalProduct>()
            .AsNoTracking()
            .Where(p => p.Brand != null && p.Brand.ToLower().Contains(searchTerm))
            .Select(p => p.Brand!)
            .Distinct()
            .OrderBy(b => b)
            .Take(maxSuggestionsPerType)
            .ToListAsync(cancellationToken);

        foreach (var brand in brands)
        {
            suggestions.Add(new SearchSuggestionDto
            {
                Type = "brand",
                Text = brand,
                Route = new List<string> { "/products", "?brands=" + brand } // Voorbeeld route voor merkfilter
            });
        }

        // Combineer, order, en limiteer alle suggesties als laatste stap
        return new SearchSuggestionListDto { Suggestions = suggestions.OrderBy(s => s.Text).Take(maxSuggestionsPerType * 3).ToList() };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Commands/AddFeedItemCommand.cs ---
/**
 * @file AddFeedItemCommand.cs
 * @Version 1.3.0 (FINAL - Alias and Nullability Issues Fixed)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Command and handler to create a new social feed item, with all alias and nullability issues resolved.
 */
using MediatR;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Social.Common;
using RoyalCode.Domain.Entities.Social;
using RoyalCode.Domain.Enums.Social;
using FluentValidation.Results;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using ValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;
using FV = FluentValidation.Results; // <-- DE FIX

namespace RoyalCode.Application.Social.Commands;

public record AddFeedItemCommand : IRequest<FeedItemDto>
{
    public string FeedId { get; init; } = string.Empty;
    public string? Text { get; init; }
    public IReadOnlyList<Guid>? MediaIds { get; init; }
    public string? GifUrl { get; init; }
    public PrivacyLevel Privacy { get; init; } = PrivacyLevel.Public;
}

public class AddFeedItemCommandHandler : IRequestHandler<AddFeedItemCommand, FeedItemDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public AddFeedItemCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<FeedItemDto> Handle(AddFeedItemCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException("User must be authenticated");

        ValidateRequest(request);
        var newFeedItem = new FeedItem(request.FeedId, currentUserId, request.Privacy, request.Text, request.GifUrl);

        if (request.MediaIds != null)
        {
            var validatedMediaIds = await ValidateMediaIds(request.MediaIds, currentUserId, cancellationToken);
            foreach (var mediaId in validatedMediaIds)
            {
                newFeedItem.AddMedia(mediaId);
            }
        }

        _context.FeedItems.Add(newFeedItem);
        await _context.SaveChangesAsync(cancellationToken);

        return await SocialFeedProcessor.MapSingleFeedItemToDtoAsync(newFeedItem, currentUserId, _context, _identityService, cancellationToken);
    }

    private void ValidateRequest(AddFeedItemCommand request)
    {
        var failures = new List<ValidationFailure>();

        if (string.IsNullOrWhiteSpace(request.Text) && string.IsNullOrWhiteSpace(request.GifUrl) && (request.MediaIds == null || !request.MediaIds.Any()))
            failures.Add(new ValidationFailure(nameof(request.Text), "Feed item must contain text, GIF, or media content."));

        if (!string.IsNullOrEmpty(request.Text) && request.Text.Length > 4000)
            failures.Add(new ValidationFailure(nameof(request.Text), "Text content cannot exceed 4000 characters."));

        if (string.IsNullOrWhiteSpace(request.FeedId))
            failures.Add(new ValidationFailure(nameof(request.FeedId), "FeedId is required."));

        if (failures.Any())
            throw new ValidationException(failures);
    }

    private async Task<List<Guid>> ValidateMediaIds(IReadOnlyList<Guid>? mediaIds, Guid userId, CancellationToken cancellationToken)
    {
        if (mediaIds == null || !mediaIds.Any()) return new List<Guid>();
        var validMediaCount = await _context.Media.CountAsync(m => mediaIds.Contains(m.Id) && m.UploaderUserId == userId, cancellationToken);
        if (validMediaCount != mediaIds.Count)
        {
            var missingIds = mediaIds.Except(await _context.Media.Where(m => mediaIds.Contains(m.Id)).Select(m => m.Id).ToListAsync(cancellationToken)).ToList();
            throw new ValidationException(new List<FV.ValidationFailure> // <-- GEBRUIK FV
            {
                new FV.ValidationFailure("MediaIds", $"One or more media IDs are invalid or do not belong to the user. Invalid IDs: {string.Join(", ", missingIds)}")
            });
        }
        return mediaIds.ToList();
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Commands/AddFeedReplyCommand.cs ---
/**
 * @file AddFeedReplyCommand.cs
 * @Version 1.1.0 (FINAL - AuthorId, IdentityService Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Command and handler for adding a reply to a feed item, now fully integrated with AuthorId and IdentityService.
 */
using MediatR;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Social.Common;
using RoyalCode.Domain.Entities.Social;
using RoyalCode.Domain.Enums.Social;
using FluentValidation.Results;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using ValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;

namespace RoyalCode.Application.Social.Commands;

public record AddFeedReplyCommand : IRequest<FeedReplyDto>
{
    public Guid ParentItemId { get; set; }
    public string FeedId { get; set; } = string.Empty;
    public string? Text { get; init; }
    public Guid? ReplyToReplyId { get; init; }
    public IReadOnlyList<Guid>? MediaIds { get; init; }
    public string? GifUrl { get; init; }
}

public class AddFeedReplyCommandHandler : IRequestHandler<AddFeedReplyCommand, FeedReplyDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public AddFeedReplyCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<FeedReplyDto> Handle(AddFeedReplyCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var parentItem = await _context.FeedItems
            .FirstOrDefaultAsync(fi => fi.Id == request.ParentItemId, cancellationToken);
        if (parentItem == null) throw new NotFoundException(nameof(FeedItem), request.ParentItemId);

        await ValidateRequest(request, parentItem, currentUserId, cancellationToken);

        var newReply = new FeedReply(request.ParentItemId, request.FeedId, currentUserId, request.Text, request.ReplyToReplyId);

        parentItem.IncrementReplyCount();
        _context.FeedReplies.Add(newReply);
        await _context.SaveChangesAsync(cancellationToken);

        return await SocialFeedProcessor.MapSingleFeedReplyToDtoAsync(newReply, currentUserId, _context, _identityService, cancellationToken);
    }

    private async Task ValidateRequest(AddFeedReplyCommand request, FeedItem parentItem, Guid currentUserId, CancellationToken cancellationToken)
    {
        var failures = new List<ValidationFailure>();

        bool canViewParent = parentItem.Privacy == PrivacyLevel.Public || parentItem.AuthorId == currentUserId;
        if (!canViewParent) failures.Add(new ValidationFailure(nameof(parentItem.Privacy), "You do not have permission to reply to this item."));

        if (string.IsNullOrWhiteSpace(request.Text))
            failures.Add(new ValidationFailure(nameof(request.Text), "Reply text cannot be empty."));

        if (request.ReplyToReplyId.HasValue)
        {
            var parentReplyExists = await _context.FeedReplies.AnyAsync(r => r.Id == request.ReplyToReplyId.Value && r.ParentId == request.ParentItemId, cancellationToken);
            if (!parentReplyExists)
                failures.Add(new ValidationFailure(nameof(request.ReplyToReplyId), "The reply you are trying to respond to does not exist or belongs to a different feed item."));
        }

        // TODO: Validate media IDs for replies if they can have media
        // if (request.MediaIds != null && request.MediaIds.Any()) { ... }

        if (failures.Any())
            throw new ValidationException(failures);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Commands/DeleteFeedItemCommand.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Social;
using Microsoft.EntityFrameworkCore;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Social.Commands;

public record DeleteFeedItemCommand(Guid FeedItemId) : IRequest;

public class DeleteFeedItemCommandHandler : IRequestHandler<DeleteFeedItemCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public DeleteFeedItemCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteFeedItemCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var feedItem = await _context.FeedItems
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(fi => fi.Id == request.FeedItemId, cancellationToken);

        if (feedItem == null || feedItem.IsDeleted)
            throw new NotFoundException(nameof(FeedItem), request.FeedItemId);

        if (feedItem.AuthorId != currentUserId)
            throw new ForbiddenAccessException("Users can only delete their own feed items.");

        feedItem.SoftDelete();

        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Commands/DeleteFeedReplyCommand.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Social;
using Microsoft.EntityFrameworkCore;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Social.Commands;

public record DeleteFeedReplyCommand(Guid ReplyId) : IRequest;

public class DeleteFeedReplyCommandHandler : IRequestHandler<DeleteFeedReplyCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public DeleteFeedReplyCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteFeedReplyCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var reply = await _context.FeedReplies
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.Id == request.ReplyId, cancellationToken);

        if (reply == null || reply.IsDeleted)
            throw new NotFoundException(nameof(FeedReply), request.ReplyId);

        var parentItem = await _context.FeedItems
            .FirstOrDefaultAsync(fi => fi.Id == reply.ParentId, cancellationToken);

        bool isReplyAuthor = reply.AuthorId == currentUserId;
        bool isItemAuthor = parentItem?.AuthorId == currentUserId;

        if (!isReplyAuthor && !isItemAuthor)
            throw new ForbiddenAccessException("You do not have permission to delete this reply.");

        reply.SoftDelete();
        parentItem?.DecrementReplyCount();

        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Commands/EditFeedItemCommand.cs ---
/**
 * @file EditFeedItemCommand.cs
 * @Version 1.1.0 (FINAL - AuthorId, IdentityService Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Command and handler for a user to edit their own social feed item, now fully integrated with AuthorId and IdentityService.
 */
using MediatR;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Social.Common;
using RoyalCode.Domain.Entities.Social;
using RoyalCode.Domain.Enums.Social;
using FluentValidation.Results;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using ValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;

namespace RoyalCode.Application.Social.Commands;

public record EditFeedItemCommand : IRequest<FeedItemDto>
{
    public Guid FeedItemId { get; set; }
    public string? Text { get; init; }
    public IReadOnlyList<Guid>? MediaIds { get; init; }
    public string? GifUrl { get; init; }
    public PrivacyLevel Privacy { get; init; } = PrivacyLevel.Public;
}

public class EditFeedItemCommandHandler : IRequestHandler<EditFeedItemCommand, FeedItemDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public EditFeedItemCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<FeedItemDto> Handle(EditFeedItemCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException("User must be authenticated");

        var feedItem = await _context.FeedItems
            .Include(fi => fi.Reactions)
            .FirstOrDefaultAsync(fi => fi.Id == request.FeedItemId, cancellationToken);

        if (feedItem == null) throw new NotFoundException(nameof(FeedItem), request.FeedItemId.ToString());
        if (feedItem.AuthorId != currentUserId) throw new ForbiddenAccessException("Users can only edit their own feed items.");

        await ValidateRequest(request, currentUserId, cancellationToken);

        feedItem.UpdateContent(request.Text, request.GifUrl, request.MediaIds);
        feedItem.UpdatePrivacy(request.Privacy);

        await _context.SaveChangesAsync(cancellationToken);

        return await SocialFeedProcessor.MapSingleFeedItemToDtoAsync(feedItem, currentUserId, _context, _identityService, cancellationToken);
    }

    private async Task ValidateRequest(EditFeedItemCommand request, Guid currentUserId, CancellationToken cancellationToken)
    {
        var failures = new List<ValidationFailure>();

        if (string.IsNullOrWhiteSpace(request.Text) && string.IsNullOrWhiteSpace(request.GifUrl) && (request.MediaIds == null || !request.MediaIds.Any()))
            failures.Add(new ValidationFailure(nameof(request.Text), "Feed item must contain text, GIF, or media content."));

        if (!string.IsNullOrEmpty(request.Text) && request.Text.Length > 4000)
            failures.Add(new ValidationFailure(nameof(request.Text), "Text content cannot exceed 4000 characters."));

        if (request.MediaIds != null && request.MediaIds.Any())
        {
            var validMediaCount = await _context.Media.CountAsync(m => request.MediaIds.Contains(m.Id) && m.UploaderUserId == currentUserId, cancellationToken);
            if (validMediaCount != request.MediaIds.Count)
                failures.Add(new ValidationFailure(nameof(request.MediaIds), "One or more media IDs are invalid or do not belong to the user."));
        }

        if (failures.Any())
            throw new ValidationException(failures);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Commands/EditFeedReplyCommand.cs ---
/**
 * @file EditFeedReplyCommand.cs
 * @Version 1.1.0 (FINAL - AuthorId, IdentityService Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Command and handler for a user to edit their own social feed reply, now fully integrated with AuthorId and IdentityService.
 */
using MediatR;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Social.Common;
using RoyalCode.Domain.Entities.Social;
using FluentValidation.Results;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using ValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;

namespace RoyalCode.Application.Social.Commands;

public record EditFeedReplyCommand : IRequest<FeedReplyDto>
{
    public Guid ReplyId { get; set; }
    public string? Text { get; init; }
}

public class EditFeedReplyCommandHandler : IRequestHandler<EditFeedReplyCommand, FeedReplyDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public EditFeedReplyCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<FeedReplyDto> Handle(EditFeedReplyCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var reply = await _context.FeedReplies
            .Include(r => r.Reactions)
            .FirstOrDefaultAsync(r => r.Id == request.ReplyId, cancellationToken);

        if (reply == null) throw new NotFoundException(nameof(FeedReply), request.ReplyId);
        if (reply.AuthorId != currentUserId) throw new ForbiddenAccessException("Users can only edit their own replies.");

        ValidateRequest(request);

        reply.UpdateContent(request.Text);

        await _context.SaveChangesAsync(cancellationToken);

        return await SocialFeedProcessor.MapSingleFeedReplyToDtoAsync(reply, currentUserId, _context, _identityService, cancellationToken);
    }

    private void ValidateRequest(EditFeedReplyCommand request)
    {
        var failures = new List<ValidationFailure>();
        if (string.IsNullOrWhiteSpace(request.Text))
            failures.Add(new ValidationFailure(nameof(request.Text), "Reply text cannot be empty."));
        if (failures.Any())
            throw new ValidationException(failures);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Commands/ReactToFeedItemCommand.cs ---
/**
 * @file ReactToFeedItemCommand.cs
 * @Version 2.0.0 (ARCHITECTURALLY CORRECT)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-01
 * @Description Command and handler for reacting to a feed item.
 *              FIX: Logic moved from domain entity to handler to prevent concurrency exceptions.
 *              The handler now directly manages the FeedReaction entity via the DbContext.
 */
using MediatR;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Social.Common;
using RoyalCode.Domain.Entities.Social;
using RoyalCode.Domain.Enums.Social;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Social.Commands;

public record ReactToFeedItemCommand : IRequest<FeedItemDto>
{
    public Guid FeedItemId { get; init; }
    public ReactionType? ReactionType { get; init; }
}

public class ReactToFeedItemCommandHandler : IRequestHandler<ReactToFeedItemCommand, FeedItemDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public ReactToFeedItemCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<FeedItemDto> Handle(ReactToFeedItemCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var feedItem = await _context.FeedItems
            .Include(fi => fi.Reactions) // Include for DTO mapping
            .FirstOrDefaultAsync(fi => fi.Id == request.FeedItemId, cancellationToken);
        Guard.Against.NotFound(request.FeedItemId, feedItem);

        var existingReaction = await _context.FeedReactions
            .FirstOrDefaultAsync(r => r.FeedItemId == request.FeedItemId && r.UserId == currentUserId, cancellationToken);

        if (request.ReactionType is null) // Gebruiker wil reactie verwijderen
        {
            if (existingReaction != null)
            {
                _context.FeedReactions.Remove(existingReaction);
            }
        }
        else // Gebruiker wil reactie toevoegen of wijzigen
        {
            if (existingReaction != null)
            {
                existingReaction.UpdateType(request.ReactionType.Value);
            }
            else
            {
                var newReaction = new FeedReaction(request.FeedItemId, null, currentUserId, request.ReactionType.Value);
                _context.FeedReactions.Add(newReaction);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // We moeten de state van feedItem herladen of handmatig bijwerken voor de DTO
        // Voor nu herladen we de reacties voor een correcte DTO
        var updatedFeedItem = await _context.FeedItems
            .Include(fi => fi.Reactions)
            .AsNoTracking()
            .FirstAsync(fi => fi.Id == request.FeedItemId, cancellationToken);

        return await SocialFeedProcessor.MapSingleFeedItemToDtoAsync(updatedFeedItem, currentUserId, _context, _identityService, cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Commands/ReactToFeedReplyCommand.cs ---
/**
 * @file ReactToFeedReplyCommand.cs
 * @Version 2.0.0 (ARCHITECTURALLY CORRECT)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-01
 * @Description Command and handler for reacting to a feed reply.
 *              FIX: Logic moved from domain entity to handler to prevent concurrency exceptions.
 *              The handler now directly manages the FeedReaction entity via the DbContext.
 */
using MediatR;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Social.Common;
using RoyalCode.Domain.Entities.Social;
using RoyalCode.Domain.Enums.Social;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Social.Commands;

public record ReactToFeedReplyCommand : IRequest<FeedReplyDto>
{
    public Guid ReplyId { get; init; }
    public ReactionType? ReactionType { get; init; }
}

public class ReactToFeedReplyCommandHandler : IRequestHandler<ReactToFeedReplyCommand, FeedReplyDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public ReactToFeedReplyCommandHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<FeedReplyDto> Handle(ReactToFeedReplyCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var replyExists = await _context.FeedReplies.AnyAsync(r => r.Id == request.ReplyId, cancellationToken);
        if (!replyExists) throw new NotFoundException(nameof(FeedReply), request.ReplyId);

        var existingReaction = await _context.FeedReactions
            .FirstOrDefaultAsync(r => r.FeedReplyId == request.ReplyId && r.UserId == currentUserId, cancellationToken);

        if (request.ReactionType is null) // Gebruiker wil reactie verwijderen
        {
            if (existingReaction != null)
            {
                _context.FeedReactions.Remove(existingReaction);
            }
        }
        else // Gebruiker wil reactie toevoegen of wijzigen
        {
            if (existingReaction != null)
            {
                existingReaction.UpdateType(request.ReactionType.Value);
            }
            else
            {
                var newReaction = new FeedReaction(null, request.ReplyId, currentUserId, request.ReactionType.Value);
                _context.FeedReactions.Add(newReaction);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        var updatedReply = await _context.FeedReplies
            .Include(r => r.Reactions)
            .AsNoTracking()
            .FirstAsync(r => r.Id == request.ReplyId, cancellationToken);

        return await SocialFeedProcessor.MapSingleFeedReplyToDtoAsync(updatedReply, currentUserId, _context, _identityService, cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Common/SocialFeedDtos.cs ---
/**
 * @file SocialFeedDtos.cs
 * @Version 2.0.0 (With DateTimeInfo DTO)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-01
 * @Description Centralized DTOs for the Social Feed API.
 *              'created' and 'lastModified' now use a structured DateTimeInfo object
 *              to match the frontend's domain model exactly.
 */
using RoyalCode.Application.Common.Models;

namespace RoyalCode.Application.Social.Common;

/// <summary>
/// A structured DTO for representing date-time information, matching the frontend's contract.
/// </summary>
public record DateTimeInfoDto
{
    public string Iso { get; init; }
    public long Timestamp { get; init; }

    // Constructor to easily create this DTO from a DateTimeOffset
    public DateTimeInfoDto(DateTimeOffset dtOffset)
    {
        Iso = dtOffset.ToString("o"); // "o" format is ISO 8601 round-trip
        Timestamp = dtOffset.ToUnixTimeMilliseconds();
    }
}

public record ProfileDto
{
    public Guid Id { get; init; }
    public string DisplayName { get; init; } = string.Empty;
    public ImageMediaDto? Avatar { get; init; }
    public int? Level { get; init; }
    public int? Reputation { get; init; }
}

public record ReactionSummaryDto
{
    public string Type { get; init; } = string.Empty; // e.g., "like", "love"
    public int Count { get; init; }
}

public record FeedItemDto
{
    public Guid Id { get; init; }
    public string FeedId { get; init; } = string.Empty;
    public ProfileDto Author { get; init; } = null!;
    public string? Text { get; init; }
    public IReadOnlyList<MediaDto> Media { get; init; } = Array.Empty<MediaDto>();
    public string? GifUrl { get; init; }
    public IReadOnlyList<ReactionSummaryDto> Reactions { get; init; } = Array.Empty<ReactionSummaryDto>();
    public string? UserReaction { get; init; }
    public int ReplyCount { get; init; }
    public bool IsEdited { get; init; }
    public bool IsPinned { get; init; }
    public bool IsHidden { get; init; }
    public bool IsSaved { get; init; }
    public string Privacy { get; init; } = string.Empty;
    public DateTimeInfoDto Created { get; init; } = null!;
    public DateTimeInfoDto LastModified { get; init; } = null!;
}

public record FeedReplyDto
{
    public Guid Id { get; init; }
    public Guid ParentId { get; init; }
    public Guid? ReplyToReplyId { get; init; }
    public string FeedId { get; init; } = string.Empty;
    public ProfileDto Author { get; init; } = null!;
    public string? Text { get; init; }
    public IReadOnlyList<MediaDto> Media { get; init; } = Array.Empty<MediaDto>();
    public string? GifUrl { get; init; }
    public IReadOnlyList<ReactionSummaryDto> Reactions { get; init; } = Array.Empty<ReactionSummaryDto>();
    public string? UserReaction { get; init; }
    public bool IsEdited { get; init; }
    public int? Level { get; init; }
    // --- DE WIJZIGING ---
    public DateTimeInfoDto Created { get; init; } = null!;
    public DateTimeInfoDto LastModified { get; init; } = null!;
}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Common/SocialFeedProcessor.cs ---
/**
 * @file SocialFeedProcessor.cs
 * @Version 2.2.0 (DateTimeInfo Mapping)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-01
 * @Description Centralized processor for social feed DTO mapping.
 *              Now maps DateTimeOffset to the structured DateTimeInfoDto to align with the frontend.
 */
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Entities.Social;
using System.Linq;

namespace RoyalCode.Application.Social.Common;

public static class SocialFeedProcessor
{
    public static async Task<List<FeedItemDto>> MapToFeedItemDtosAsync(IReadOnlyList<FeedItem> items, Guid currentUserId, IApplicationDbContext context, IIdentityService identityService, CancellationToken cancellationToken)
    {
        if (!items.Any()) return new List<FeedItemDto>();

        var allAuthorIds = items.Select(i => i.AuthorId).Distinct().ToList();
        var profilesLookup = await identityService.GetProfilesByIdsAsync(allAuthorIds);

        var allMediaIds = items.SelectMany(i => i.MediaIds).Distinct().ToList();
        var allAvatarMediaIds = profilesLookup.Values.Where(p => p.Avatar != null && p.Avatar.Id != Guid.Empty).Select(p => p.Avatar!.Id).Distinct().ToList();
        var allRequiredMediaIds = allMediaIds.Union(allAvatarMediaIds).ToList();

        var mediaLookup = await context.Media.AsNoTracking()
            .Where(m => allRequiredMediaIds.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id, MapMediaToDto, cancellationToken);

        // Batch-fetch reactions for all items
        var allReactions = await context.FeedReactions.AsNoTracking()
            .Where(r => items.Select(item => item.Id).Contains(r.FeedItemId!.Value))
            .ToListAsync(cancellationToken);

        return items.Select(item => MapFeedItemToDto(item, currentUserId, profilesLookup, mediaLookup, allReactions)).ToList();
    }


    public static async Task<FeedItemDto> MapSingleFeedItemToDtoAsync(FeedItem item, Guid currentUserId, IApplicationDbContext context, IIdentityService identityService, CancellationToken cancellationToken)
    {
        var allAuthorIds = new List<Guid> { item.AuthorId };
        var profilesLookup = await identityService.GetProfilesByIdsAsync(allAuthorIds);

        var requiredMediaIds = item.MediaIds.ToList();
        if (profilesLookup.TryGetValue(item.AuthorId, out var profile) && profile.Avatar != null && profile.Avatar.Id != Guid.Empty)
        {
            requiredMediaIds.Add(profile.Avatar.Id);
        }

        var mediaLookup = requiredMediaIds.Any()
            ? await context.Media.AsNoTracking().Where(m => requiredMediaIds.Contains(m.Id)).ToDictionaryAsync(m => m.Id, MapMediaToDto, cancellationToken)
            : new Dictionary<Guid, MediaDto>();

        // Fetch reactions for this single item
        var allReactions = await context.FeedReactions.AsNoTracking()
            .Where(r => r.FeedItemId == item.Id)
            .ToListAsync(cancellationToken);

        return MapFeedItemToDto(item, currentUserId, profilesLookup, mediaLookup, allReactions);
    }

    public static async Task<List<FeedReplyDto>> MapToFeedReplyDtosAsync(IReadOnlyList<FeedReply> replies, Guid currentUserId, IApplicationDbContext context, IIdentityService identityService, CancellationToken cancellationToken)
    {
        if (!replies.Any()) return new List<FeedReplyDto>();

        var allAuthorIds = replies.Select(r => r.AuthorId).Distinct().ToList();
        var profilesLookup = await identityService.GetProfilesByIdsAsync(allAuthorIds);

        var allMediaIds = replies.SelectMany(r => r.MediaIds).Distinct().ToList();
        var allAvatarMediaIds = profilesLookup.Values.Where(p => p.Avatar != null && p.Avatar.Id != Guid.Empty).Select(p => p.Avatar!.Id).Distinct().ToList();
        var allRequiredMediaIds = allMediaIds.Union(allAvatarMediaIds).ToList();

        var mediaLookup = await context.Media.AsNoTracking()
            .Where(m => allRequiredMediaIds.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id, MapMediaToDto, cancellationToken);

        return replies.Select(reply => MapFeedReplyToDto(reply, currentUserId, profilesLookup, mediaLookup)).ToList();
    }

    public static async Task<FeedReplyDto> MapSingleFeedReplyToDtoAsync(FeedReply reply, Guid currentUserId, IApplicationDbContext context, IIdentityService identityService, CancellationToken cancellationToken)
    {
        var allAuthorIds = new List<Guid> { reply.AuthorId };
        var profilesLookup = await identityService.GetProfilesByIdsAsync(allAuthorIds);

        var requiredMediaIds = reply.MediaIds.ToList();
        if (profilesLookup.TryGetValue(reply.AuthorId, out var profile) && profile.Avatar != null && profile.Avatar.Id != Guid.Empty)
        {
            requiredMediaIds.Add(profile.Avatar.Id);
        }

        var mediaLookup = requiredMediaIds.Any()
            ? await context.Media.AsNoTracking().Where(m => requiredMediaIds.Contains(m.Id)).ToDictionaryAsync(m => m.Id, MapMediaToDto, cancellationToken)
            : new Dictionary<Guid, MediaDto>();

        return MapFeedReplyToDto(reply, currentUserId, profilesLookup, mediaLookup);
    }

    private static FeedItemDto MapFeedItemToDto(FeedItem item, Guid currentUserId, Dictionary<Guid, ProfileDto> profilesLookup, Dictionary<Guid, MediaDto> mediaLookup, IReadOnlyList<FeedReaction> allReactions)
    {
        var authorDto = profilesLookup.GetValueOrDefault(item.AuthorId, new ProfileDto { Id = item.AuthorId, DisplayName = "Onbekende Gebruiker" });
        var mediaDtos = item.MediaIds.Select(id => mediaLookup.GetValueOrDefault(id)).Where(dto => dto != null).Cast<MediaDto>().ToList();

        var itemReactions = allReactions.Where(r => r.FeedItemId == item.Id).ToList();
        var reactionSummary = itemReactions.GroupBy(r => r.Type).Select(g => new ReactionSummaryDto { Type = g.Key.ToString().ToLowerInvariant(), Count = g.Count() }).ToList();
        var userReaction = itemReactions.FirstOrDefault(r => r.UserId == currentUserId)?.Type;

        return new FeedItemDto
        {
            Id = item.Id,
            FeedId = item.FeedId,
            Author = authorDto,
            Text = item.Text,
            Media = mediaDtos,
            GifUrl = item.GifUrl,
            Reactions = reactionSummary,
            UserReaction = userReaction?.ToString().ToLowerInvariant(),
            ReplyCount = item.ReplyCount,
            IsEdited = item.IsEdited,
            IsPinned = item.IsPinned,
            IsHidden = item.IsHidden,
            IsSaved = item.IsSaved,
            Privacy = item.Privacy.ToString().ToLowerInvariant(),
            Created = new DateTimeInfoDto(item.Created),
            LastModified = new DateTimeInfoDto(item.LastModified)
        };
    }


    private static FeedReplyDto MapFeedReplyToDto(FeedReply reply, Guid currentUserId, Dictionary<Guid, ProfileDto> profilesLookup, Dictionary<Guid, MediaDto> mediaLookup)
    {
        var authorDto = profilesLookup.GetValueOrDefault(reply.AuthorId, new ProfileDto { Id = reply.AuthorId, DisplayName = "Onbekende Gebruiker" });
        var mediaDtos = reply.MediaIds.Select(id => mediaLookup.GetValueOrDefault(id)).Where(dto => dto != null).Cast<MediaDto>().ToList();
        var reactionSummary = reply.GetReactionSummary().Select(rs => new ReactionSummaryDto { Type = rs.Type.ToString().ToLowerInvariant(), Count = rs.Count }).ToList();
        var userReaction = reply.GetUserReaction(currentUserId);

        return new FeedReplyDto
        {
            Id = reply.Id,
            ParentId = reply.ParentId,
            ReplyToReplyId = reply.ReplyToReplyId,
            FeedId = reply.FeedId,
            Author = authorDto,
            Text = reply.Text,
            Media = mediaDtos,
            GifUrl = reply.GifUrl,
            Reactions = reactionSummary,
            UserReaction = userReaction?.ToString().ToLowerInvariant(),
            IsEdited = reply.IsEdited,
            Level = reply.Level,
            Created = new DateTimeInfoDto(reply.Created),
            LastModified = new DateTimeInfoDto(reply.LastModified)
        };
    }

    private static MediaDto MapMediaToDto(MediaBase media)
    {
        return media switch
        {
            ImageMedia image => new ImageMediaDto
            {
                Id = image.Id,
                Type = image.Type,
                Url = image.Url,
                ThumbnailUrl = image.ThumbnailUrl,
                AltText = image.AltTextKeyOrText,
                Title = image.TitleKeyOrText
            },
            VideoMedia video => new VideoMediaDto
            {
                Id = video.Id,
                Type = video.Type,
                Url = video.Url,
                ThumbnailUrl = video.ThumbnailUrl,
                Title = video.TitleKeyOrText,
                DurationSeconds = video.DurationSeconds,
                PosterImageUrl = video.PosterImageUrl
            },
            _ => throw new InvalidOperationException($"Mapping not implemented for media type {media.Type}")
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Queries/GetFeedQuery.cs ---
/**
 * @file GetFeedQuery.cs
 * @Version 1.5.0 (FINAL - AuthorId, IdentityService Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Query and handler to get a paginated list of social feed items, now fully integrated with AuthorId and IdentityService.
 */
using MediatR;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Mappings;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Social.Common;
using RoyalCode.Domain.Enums.Social;

namespace RoyalCode.Application.Social.Queries;

public record GetFeedQuery : IRequest<PaginatedList<FeedItemDto>>
{
    public string FeedId { get; init; } = string.Empty;
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public class GetFeedQueryHandler : IRequestHandler<GetFeedQuery, PaginatedList<FeedItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public GetFeedQueryHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<PaginatedList<FeedItemDto>> Handle(GetFeedQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? Guid.Empty;

        var query = _context.FeedItems
            .AsNoTracking()
            .Where(fi => fi.FeedId == request.FeedId && !fi.IsHidden)
            .Where(fi => fi.Privacy == PrivacyLevel.Public || fi.AuthorId == currentUserId /* TODO: || fi.Privacy == PrivacyLevel.Friends (add friends logic here) */)
            // .Include(fi => fi.Reactions) // Removed .Include()
            .OrderByDescending(fi => fi.IsPinned)
            .ThenByDescending(fi => fi.Created);

        var paginatedFeedItems = await query.PaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);
        if (!paginatedFeedItems.Items.Any())
        {
            return new PaginatedList<FeedItemDto>(new List<FeedItemDto>(), 0, request.PageNumber, request.PageSize);
        }

        var feedItemDtos = await SocialFeedProcessor.MapToFeedItemDtosAsync(paginatedFeedItems.Items.ToList(), currentUserId, _context, _identityService, cancellationToken);

        return new PaginatedList<FeedItemDto>(feedItemDtos, paginatedFeedItems.TotalCount, paginatedFeedItems.PageNumber, paginatedFeedItems.PageSize);
    }

}
--- END OF FILE ---

--- START OF FILE src/Application/Social/Queries/GetRepliesQuery.cs ---
/**
@file GetRepliesQuery.cs
@Version 1.1.0 (FINAL - AuthorId, IdentityService Integration)
@Author Royal-Code MonorepoAppDevAI
@Date 2025-07-31
@Description Query and handler to get paginated replies for a specific feed item, now fully integrated with AuthorId and IdentityService.
*/
using MediatR;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Mappings;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Social.Common;
using RoyalCode.Domain.Enums.Social;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
namespace RoyalCode.Application.Social.Queries;
public record GetRepliesQuery : IRequest<PaginatedList<FeedReplyDto>>
{
    public Guid ParentItemId { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
public class GetRepliesQueryHandler : IRequestHandler<GetRepliesQuery, PaginatedList<FeedReplyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;
    public GetRepliesQueryHandler(IApplicationDbContext context, IUser currentUser, IIdentityService identityService)
    {
        _context = context;
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<PaginatedList<FeedReplyDto>> Handle(GetRepliesQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUser.Id ?? Guid.Empty;

        var parentItem = await _context.FeedItems.AsNoTracking()
            .Select(fi => new { fi.Id, fi.Privacy, fi.AuthorId })
            .FirstOrDefaultAsync(fi => fi.Id == request.ParentItemId, cancellationToken);

        if (parentItem == null) throw new NotFoundException("FeedItem", request.ParentItemId);

        bool canView = parentItem.Privacy == PrivacyLevel.Public || parentItem.AuthorId == currentUserId;
        if (!canView) throw new ForbiddenAccessException("You do not have permission to view this item's replies.");

        var paginatedReplies = await _context.FeedReplies
            .AsNoTracking()
            .Where(r => r.ParentId == request.ParentItemId)
            .Include(r => r.Reactions)
            .OrderBy(r => r.Created)
            .PaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);

        var replyDtos = await SocialFeedProcessor.MapToFeedReplyDtosAsync(paginatedReplies.Items.ToList(), currentUserId, _context, _identityService, cancellationToken);

        return new PaginatedList<FeedReplyDto>(replyDtos, paginatedReplies.TotalCount, paginatedReplies.PageNumber, paginatedReplies.PageSize);
    }

}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Commands/Roles/CreateRoleCommand.cs ---
/**
 * @file CreateRoleCommand.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Command and handler for an admin to create a new role.
 */
using Microsoft.AspNetCore.Identity;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Users.Admin.Common;
using FluentValidation;
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;
using RoyalCode.Domain.Constants; // Voor ErrorCodes

namespace RoyalCode.Application.Users.Admin.Commands.Roles;

public record CreateRoleCommand : IRequest<AdminRoleDto>
{
    public string Name { get; init; } = string.Empty;
}

public class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithErrorCode(ErrorCodes.ValidationRequired)
            .MaximumLength(50).WithErrorCode(ErrorCodes.ValidationMaxLength);
    }
}

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, AdminRoleDto>
{
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public CreateRoleCommandHandler(RoleManager<IdentityRole<Guid>> roleManager)
    {
        _roleManager = roleManager;
    }

    public async Task<AdminRoleDto> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        if (await _roleManager.RoleExistsAsync(request.Name))
        {
            throw new ConflictException($"Role '{request.Name}' already exists.", ErrorCodes.RoleAlreadyExists);
        }

        var role = new IdentityRole<Guid>(request.Name);
        var result = await _roleManager.CreateAsync(role);

        if (!result.Succeeded)
        {
            throw new AppValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e.Description, e.Code)));
        }

        return new AdminRoleDto { Id = role.Id, Name = role.Name ?? string.Empty };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Commands/Roles/DeleteRoleCommand.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using FluentValidation;
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;
using RoyalCode.Domain.Constants;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException; // ALIAS

namespace RoyalCode.Application.Users.Admin.Commands.Roles;

public record DeleteRoleCommand(Guid Id) : IRequest;

public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand>
{
    private readonly IIdentityService _identityService;

    public DeleteRoleCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.DeleteRoleAsync(request.Id);

        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e == ErrorCodes.RoleInUse))
            {
                throw new ConflictException(result.Errors.First(), ErrorCodes.RoleInUse);
            }
            if (result.Errors.Any(e => e == ErrorCodes.RoleNotFound))
            {
                throw new NotFoundException(result.Errors.First());
            }
            throw new AppValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e)));
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Commands/Roles/UpdatePermissionsForRoleCommand.cs ---
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using FluentValidation;
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;
using RoyalCode.Domain.Constants;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException; // ALIAS

namespace RoyalCode.Application.Users.Admin.Commands.Roles;

public record UpdatePermissionsForRoleCommand : IRequest
{
    public Guid RoleId { get; set; }
    public IReadOnlyCollection<string> Permissions { get; init; } = new List<string>();
}

public class UpdatePermissionsForRoleCommandValidator : AbstractValidator<UpdatePermissionsForRoleCommand>
{
    public UpdatePermissionsForRoleCommandValidator()
    {
        RuleFor(x => x.RoleId).NotEmpty();
        RuleFor(x => x.Permissions).NotNull();
    }
}

public class UpdatePermissionsForRoleCommandHandler : IRequestHandler<UpdatePermissionsForRoleCommand>
{
    private readonly IIdentityService _identityService;

    public UpdatePermissionsForRoleCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task Handle(UpdatePermissionsForRoleCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.UpdatePermissionsForRoleAsync(request.RoleId, request.Permissions);

        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e == ErrorCodes.RoleNotFound))
            {
                throw new NotFoundException(result.Errors.First());
            }
            throw new AppValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e)));
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Commands/Roles/UpdateRoleCommand.cs ---
/**
 * @file UpdateRoleCommand.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Command and handler for an admin to update an existing role.
 */
using Microsoft.AspNetCore.Identity;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Users.Admin.Common;
using FluentValidation;
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;
using RoyalCode.Domain.Constants; // Voor ErrorCodes

namespace RoyalCode.Application.Users.Admin.Commands.Roles;

public record UpdateRoleCommand : IRequest<AdminRoleDto>
{
    public Guid Id { get; set; }
    public string Name { get; init; } = string.Empty;
}

public class UpdateRoleCommandValidator : AbstractValidator<UpdateRoleCommand>
{
    public UpdateRoleCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name)
            .NotEmpty().WithErrorCode(ErrorCodes.ValidationRequired)
            .MaximumLength(50).WithErrorCode(ErrorCodes.ValidationMaxLength);
    }
}

public class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, AdminRoleDto>
{
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public UpdateRoleCommandHandler(RoleManager<IdentityRole<Guid>> roleManager)
    {
        _roleManager = roleManager;
    }

    public async Task<AdminRoleDto> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _roleManager.FindByIdAsync(request.Id.ToString());
        Guard.Against.NotFound(request.Id, role);

        if (role.Name != request.Name && await _roleManager.RoleExistsAsync(request.Name))
        {
            throw new ConflictException($"Role '{request.Name}' already exists.", ErrorCodes.RoleNameAlreadyExists);
        }

        role.Name = request.Name;
        role.NormalizedName = _roleManager.NormalizeKey(request.Name);

        var result = await _roleManager.UpdateAsync(role);

        if (!result.Succeeded)
        {
            throw new AppValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e.Description, e.Code)));
        }

        return new AdminRoleDto { Id = role.Id, Name = role.Name ?? string.Empty };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Commands/Users/CreateUserCommand.cs ---
/**
 * @file CreateUserCommand.cs
 * @Version 1.3.0 (With Validation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Command and handler for an admin to create a new user.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Exceptions;
using FluentValidation;
using RoyalCode.Domain.Constants; // Voor ErrorCodes
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;

namespace RoyalCode.Application.Users.Admin.Commands;

public record CreateUserCommand : IRequest<Guid>
{
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string? FirstName { get; init; }
    public string? MiddleName { get; init; }
    public string? LastName { get; init; }
    public string? Bio { get; init; }
    public IReadOnlyCollection<string> Roles { get; init; } = new List<string>();
}

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithErrorCode(ErrorCodes.ValidationRequired)
            .EmailAddress().WithErrorCode(ErrorCodes.ValidationInvalidInput);

        RuleFor(x => x.Password)
            .NotEmpty().WithErrorCode(ErrorCodes.ValidationRequired)
            .MinimumLength(6).WithErrorCode(ErrorCodes.PasswordTooShort)
            .Matches("[A-Z]").WithErrorCode(ErrorCodes.PasswordNoUppercase)
            .Matches("[a-z]").WithErrorCode(ErrorCodes.PasswordNoLowercase)
            .Matches("[0-9]").WithErrorCode(ErrorCodes.PasswordNoDigit)
            .Matches("[^a-zA-Z0-9]").WithErrorCode(ErrorCodes.PasswordNoSpecialChar);

        RuleFor(x => x.DisplayName)
            .NotEmpty().WithErrorCode(ErrorCodes.ValidationRequired);
    }
}

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Guid>
{
    private readonly IIdentityService _identityService;

    public CreateUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var (result, userId) = await _identityService.CreateUserAsync(
            request.Email,
            request.DisplayName,
            request.Password,
            request.FirstName,
            request.MiddleName,
            request.LastName,
            request.Bio,
            request.Roles
        );

        if (!result.Succeeded)
        {
            throw new AppValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e)));
        }
        return userId;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Commands/Users/DeleteUserCommand.cs ---
/**
 * @file DeleteUserCommand.cs
 * @Version 1.2.0 (With Security Logic)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Command and handler for an admin to delete a user,
 *              now including security checks for SuperAdmin roles.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Exceptions;
using FluentValidation;
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;
using RoyalCode.Domain.Constants; // Voor ErrorCodes

namespace RoyalCode.Application.Users.Admin.Commands;

public record DeleteUserCommand : IRequest
{
    public Guid Id { get; set; }
    public Guid RequestingUserId { get; init; } // <-- FIX: RequestingUserId is nu aanwezig
}

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand>
{
    private readonly IIdentityService _identityService;

    public DeleteUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.DeleteUserAsync(request.Id, request.RequestingUserId);

        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e == "SuperAdmin accounts cannot be modified." || e == "Only a SuperAdmin can manage another Administrator." || e == ErrorCodes.LastAdminDemoteForbidden || e == ErrorCodes.LastAdminLockForbidden)) // Meer algemene check
            {
                throw new ForbiddenAccessException(result.Errors.First(), result.ErrorCodes.First());
            }
            throw new AppValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e)));
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Commands/Users/LockUserCommand.cs ---
/**
 * @file LockUserCommand.cs
 * @Version 1.1.0 (With Security Logic)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Command and handler for an admin to lock a user account,
 *              now including security checks for SuperAdmin roles.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Exceptions;
using FluentValidation;
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;
using RoyalCode.Domain.Constants; // Voor ErrorCodes

namespace RoyalCode.Application.Users.Admin.Commands;

public record LockUserCommand : IRequest
{
    public Guid UserId { get; init; }
    public DateTimeOffset? LockoutEnd { get; init; }
    public Guid RequestingUserId { get; init; } // <-- FIX: RequestingUserId is nu aanwezig
}

public class LockUserCommandHandler : IRequestHandler<LockUserCommand>
{
    private readonly IIdentityService _identityService;

    public LockUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task Handle(LockUserCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.LockUserAsync(request.UserId, request.LockoutEnd, request.RequestingUserId);
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e == "SuperAdmin accounts cannot be modified." || e == "Only a SuperAdmin can manage another Administrator." || e == ErrorCodes.LastAdminLockForbidden))
            {
                throw new ForbiddenAccessException(result.Errors.First(), result.ErrorCodes.First());
            }
            throw new AppValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e)));
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Commands/Users/SetUserPasswordCommand.cs ---
/**
 * @file SetUserPasswordCommand.cs
 * @Version 1.1.0 (With Security Logic)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Command and handler for an admin to set a new password for a user,
 *              now including security checks for SuperAdmin roles.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Exceptions;
using FluentValidation;
using RoyalCode.Domain.Constants;
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;

namespace RoyalCode.Application.Users.Admin.Commands;

public record SetUserPasswordCommand : IRequest
{
    public Guid UserId { get; init; }
    public string NewPassword { get; init; } = string.Empty;
    public Guid RequestingUserId { get; init; } // <-- FIX: RequestingUserId is nu aanwezig
}

public class SetUserPasswordCommandValidator : AbstractValidator<SetUserPasswordCommand>
{
    public SetUserPasswordCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.RequestingUserId).NotEmpty();
        RuleFor(x => x.NewPassword)
            .NotEmpty().WithErrorCode(ErrorCodes.ValidationRequired)
            .MinimumLength(6).WithErrorCode(ErrorCodes.PasswordTooShort)
            .Matches("[A-Z]").WithErrorCode(ErrorCodes.PasswordNoUppercase)
            .Matches("[a-z]").WithErrorCode(ErrorCodes.PasswordNoLowercase)
            .Matches("[0-9]").WithErrorCode(ErrorCodes.PasswordNoDigit)
            .Matches("[^a-zA-Z0-9]").WithErrorCode(ErrorCodes.PasswordNoSpecialChar);
    }
}

public class SetUserPasswordCommandHandler : IRequestHandler<SetUserPasswordCommand>
{
    private readonly IIdentityService _identityService;

    public SetUserPasswordCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task Handle(SetUserPasswordCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.SetUserPasswordAsync(request.UserId, request.NewPassword, request.RequestingUserId);
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e == "SuperAdmin accounts cannot be modified." || e == "Only a SuperAdmin can manage another Administrator."))
            {
                throw new ForbiddenAccessException(result.Errors.First(), result.ErrorCodes.First());
            }

            throw new AppValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e)));
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Commands/Users/UnlockUserCommand.cs ---
/**
 * @file UnlockUserCommand.cs
 * @Version 1.1.0 (With Security Logic)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Command and handler for an admin to unlock a user account,
 *              now including security checks for SuperAdmin roles.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Exceptions;
using FluentValidation;
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;
using RoyalCode.Domain.Constants; // Voor ErrorCodes

namespace RoyalCode.Application.Users.Admin.Commands;

public record UnlockUserCommand : IRequest
{
    public Guid UserId { get; init; }
    public Guid RequestingUserId { get; init; } // <-- FIX: RequestingUserId is nu aanwezig
}

public class UnlockUserCommandHandler : IRequestHandler<UnlockUserCommand>
{
    private readonly IIdentityService _identityService;

    public UnlockUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task Handle(UnlockUserCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.UnlockUserAsync(request.UserId, request.RequestingUserId);
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e == "SuperAdmin accounts cannot be modified." || e == "Only a SuperAdmin can manage another Administrator."))
            {
                throw new ForbiddenAccessException(result.Errors.First(), result.ErrorCodes.First());
            }

            throw new AppValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e)));
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Commands/Users/UpdateUserCommand.cs ---
/**
 * @file UpdateUserCommand.cs
 * @Version 1.2.0 (Definitive Clean Architecture Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Command and handler for an admin to update a user's profile and roles,
 *              now fully conforming to Clean Architecture by delegating all Identity logic to IIdentityService.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using FluentValidation;
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;
using RoyalCode.Domain.Constants; // Voor ErrorCodes

namespace RoyalCode.Application.Users.Admin.Commands;

public record UpdateUserCommand : IRequest
{
    public Guid Id { get; set; }
    public string? DisplayName { get; init; }
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? Bio { get; init; }
    public IReadOnlyCollection<string> Roles { get; init; } = new List<string>();
    public Guid RequestingUserId { get; init; } // <-- FIX: RequestingUserId is nu aanwezig
}

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand>
{
    private readonly IIdentityService _identityService;

    public UpdateUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.UpdateUserAsync(
            request.Id,
            request.DisplayName,
            request.FirstName,
            request.LastName,
            request.Bio,
            request.Roles,
            request.RequestingUserId // Gebruik de meegegeven RequestingUserId
        );

        if (!result.Succeeded)
        {
            // Foutafhandeling voor specifieke beveiligingsregels
            if (result.Errors.Any(e => e == ErrorCodes.AdminSelfDemoteForbidden || e == ErrorCodes.LastAdminDemoteForbidden || e == "Only a SuperAdmin can manage another Administrator." || e == "SuperAdmin accounts cannot be modified."))
            {
                throw new ForbiddenAccessException(result.Errors.First(), result.ErrorCodes.First());
            }

            throw new AppValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e)));
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Common/AdminRoleDtos.cs ---
/**
 * @file AdminRoleDtos.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description DTOs for Role Admin management feature.
 */
namespace RoyalCode.Application.Users.Admin.Common;

public class AdminRoleDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Common/AdminUserDtos.cs ---
/**
 * @file AdminUserDtos.cs
 * @Version 1.1.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description DTOs for the User Admin management feature, including full profile fields.
 */
namespace RoyalCode.Application.Common.Models;

public class AdminUserListItemDto
{
    public Guid Id { get; init; }
    public string? DisplayName { get; init; }
    public string? FullName { get; init; }
    public string? Email { get; init; }
    public IReadOnlyCollection<string> Roles { get; init; } = new List<string>();
    public bool IsLockedOut { get; init; }
    public DateTimeOffset? CreatedAt { get; init; }
}

public class AdminUserDetailDto
{
    public Guid Id { get; init; }
    public string? DisplayName { get; init; }
    public string? FirstName { get; init; }
    public string? MiddleName { get; init; }
    public string? LastName { get; init; }
    public string? Email { get; init; }
    public string? Bio { get; init; }
    public bool EmailConfirmed { get; init; }
    public IReadOnlyCollection<string> Roles { get; init; } = new List<string>();
    public bool IsLockedOut { get; init; }
    public DateTimeOffset? LockoutEnd { get; init; }
    public int AccessFailedCount { get; init; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Common/PermissionDto.cs ---
namespace RoyalCode.Application.Users.Admin.Common;

public class PermissionDto
{
    public string Value { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Queries/GetAllPermissionsQuery.cs ---
/**
 * @file GetAllPermissionsQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Query and handler to get a list of all available permissions from the IdentityService.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Admin.Common;

namespace RoyalCode.Application.Users.Admin.Queries.Permissions;

public record GetAllPermissionsQuery : IRequest<List<PermissionDto>>;

public class GetAllPermissionsQueryHandler : IRequestHandler<GetAllPermissionsQuery, List<PermissionDto>>
{
    private readonly IIdentityService _identityService;
    public GetAllPermissionsQueryHandler(IIdentityService identityService) => _identityService = identityService;

    public async Task<List<PermissionDto>> Handle(GetAllPermissionsQuery request, CancellationToken cancellationToken)
    {
        return await _identityService.GetAllPermissionsAsync();
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Queries/GetAllRolesDetailsQuery.cs ---
/**
 * @file GetAllRolesDetailsQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Query and handler to get a list of all roles with their IDs for admin management.
 */
using Microsoft.AspNetCore.Identity; // Let op: deze dependency is hier nodig omdat RoleManager direct wordt gebruikt.
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Users.Admin.Common;

namespace RoyalCode.Application.Users.Admin.Queries.Roles;

public record GetAllRolesDetailsQuery : IRequest<List<AdminRoleDto>>;

public class GetAllRolesDetailsQueryHandler : IRequestHandler<GetAllRolesDetailsQuery, List<AdminRoleDto>>
{
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public GetAllRolesDetailsQueryHandler(RoleManager<IdentityRole<Guid>> roleManager)
    {
        _roleManager = roleManager;
    }

    public async Task<List<AdminRoleDto>> Handle(GetAllRolesDetailsQuery request, CancellationToken cancellationToken)
    {
        return await _roleManager.Roles
            .Select(r => new AdminRoleDto { Id = r.Id, Name = r.Name! })
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Queries/GetAllRolesQuery.cs ---
/**
 * @file GetAllRolesQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Query and handler to get a list of all available roles from the IdentityService.
 */
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Common.Interfaces;

// Dit is een simpele query zonder parameters
public record GetAllRolesQuery : IRequest<List<string>>;

public class GetAllRolesQueryHandler : IRequestHandler<GetAllRolesQuery, List<string>>
{
    private readonly IIdentityService _identityService;

    public GetAllRolesQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<List<string>> Handle(GetAllRolesQuery request, CancellationToken cancellationToken)
    {
        return await _identityService.GetAllRolesAsync();
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Queries/GetAllUsersQuery.cs ---
/**
 * @file GetAllUsersQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Query and handler to get a paginated list of all system users for admin.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;

namespace RoyalCode.Application.Users.Admin.Queries;

public record GetAllUsersQuery(
    int PageNumber = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    string? Role = null)
    : IRequest<PaginatedList<AdminUserListItemDto>>;

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, PaginatedList<AdminUserListItemDto>>
{
    private readonly IIdentityService _identityService;

    public GetAllUsersQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<PaginatedList<AdminUserListItemDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        return await _identityService.GetUsersAsync(request.PageNumber, request.PageSize, request.SearchTerm, request.Role);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Queries/GetPermissionsForRoleQuery.cs ---
/**
 * @file GetPermissionsForRoleQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Query and handler to get permissions assigned to a specific role.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Admin.Common;
using RoyalCode.Application.Common.Exceptions; // Voor NotFoundException
using RoyalCode.Domain.Constants; // Voor ErrorCodes

namespace RoyalCode.Application.Users.Admin.Queries.Roles;

public record GetPermissionsForRoleQuery(Guid RoleId) : IRequest<List<PermissionDto>>;

public class GetPermissionsForRoleQueryHandler : IRequestHandler<GetPermissionsForRoleQuery, List<PermissionDto>>
{
    private readonly IIdentityService _identityService;
    public GetPermissionsForRoleQueryHandler(IIdentityService identityService) => _identityService = identityService;

    public async Task<List<PermissionDto>> Handle(GetPermissionsForRoleQuery request, CancellationToken cancellationToken)
    {
        var rolePermissions = await _identityService.GetPermissionsForRoleAsync(request.RoleId);

        return rolePermissions;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Admin/Queries/GetUserByIdQuery.cs ---
/**
 * @file GetUserByIdQuery.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Query and handler to get detailed information for a single user by ID.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Domain.Constants; // Voor ErrorCodes

namespace RoyalCode.Application.Users.Admin.Queries;

public record GetUserByIdQuery(Guid Id) : IRequest<AdminUserDetailDto>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, AdminUserDetailDto>
{
    private readonly IIdentityService _identityService;

    public GetUserByIdQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<AdminUserDetailDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _identityService.GetUserByIdAsync(request.Id);
        Guard.Against.NotFound(request.Id, user, ErrorCodes.UserNotFound);
        return user;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Commands/Addresses/CreateAddressCommand.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Application/Users/Commands/Addresses/CreateAddressCommand.cs ---
/**
* @file CreateAddressCommand.cs
* @Version 2.1.0 (ContactName Required)
* @Author Royal-Code MonorepoAppDevAI
* @Date 2025-07-13
* @Description Definieert de use case voor het aanmaken van een adres, nu met verplichte ContactName.
*/
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Common;
using RoyalCode.Domain.Entities.User;
using RoyalCode.Domain.Enums;
using FluentValidation; // Voeg deze toe voor AbstractValidator

namespace RoyalCode.Application.Users.Commands.Addresses;

public record CreateAddressCommand : IRequest<AddressDto>
{
    public string Street { get; init; } = string.Empty;
    public string HouseNumber { get; init; } = string.Empty;
    public string? AddressAddition { get; init; }
    public string City { get; init; } = string.Empty;
    public string? StateOrProvince { get; init; }
    public string PostalCode { get; init; } = string.Empty;
    public string CountryCode { get; init; } = string.Empty;
    public AddressType? AddressType { get; init; }
    public string ContactName { get; init; } = string.Empty; // NU NIET NULLABLE
    public string? CompanyName { get; init; }
    public string? PhoneNumber { get; init; }
    public string? DeliveryInstructions { get; init; }
    public bool IsDefaultShipping { get; init; }
    public bool IsDefaultBilling { get; init; }
}

public class CreateAddressCommandValidator : AbstractValidator<CreateAddressCommand>
{
    public CreateAddressCommandValidator()
    {
        RuleFor(v => v.Street).NotEmpty().MaximumLength(200);
        RuleFor(v => v.HouseNumber).NotEmpty().MaximumLength(50);
        RuleFor(v => v.City).NotEmpty().MaximumLength(100);
        RuleFor(v => v.PostalCode).NotEmpty().MaximumLength(20);
        RuleFor(v => v.CountryCode).NotEmpty().Length(2).WithMessage("Landcode moet 2 karakters zijn.");
        RuleFor(v => v.AddressType).IsInEnum().When(v => v.AddressType.HasValue);
        RuleFor(v => v.ContactName).NotEmpty().MaximumLength(150); // Nu verplicht
    }
}


public class CreateAddressCommandHandler : IRequestHandler<CreateAddressCommand, AddressDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public CreateAddressCommandHandler(IApplicationDbContext context, IUser user, IIdentityService identityService)
    {
        _context = context;
        _user = user;
        _identityService = identityService;
    }

    public async Task<AddressDto> Handle(CreateAddressCommand request, CancellationToken cancellationToken)
    {
        var userId = _user.Id ?? throw new UnauthorizedAccessException("Gebruiker moet ingelogd zijn.");

        // GEFIXED: ContactName nu doorgegeven aan de constructor
        var address = new Address(userId, request.Street, request.HouseNumber, request.City, request.PostalCode, request.CountryCode, request.ContactName);
        address.UpdateDetails(request.Street, request.HouseNumber, request.AddressAddition, request.City, request.StateOrProvince, request.PostalCode, request.CountryCode, request.AddressType, request.ContactName, request.CompanyName, request.PhoneNumber, request.DeliveryInstructions);

        if (request.IsDefaultShipping)
        {
            var currentDefaults = await _context.Addresses.Where(a => a.UserId == userId && a.IsDefaultShipping).ToListAsync(cancellationToken);
            foreach (var adr in currentDefaults) adr.SetAsDefaultShipping(false);
        }
        address.SetAsDefaultShipping(request.IsDefaultShipping);

        if (request.IsDefaultBilling)
        {
            var currentDefaults = await _context.Addresses.Where(a => a.UserId == userId && a.IsDefaultBilling).ToListAsync(cancellationToken);
            foreach (var adr in currentDefaults) adr.SetAsDefaultBilling(false);
        }
        address.SetAsDefaultBilling(request.IsDefaultBilling);

        _context.Addresses.Add(address);
        await _identityService.IncrementUserDataVersionAsync(userId, UserDataAggregate.Addresses);
        await _context.SaveChangesAsync(cancellationToken);

        // Handmatige mapping naar het response DTO
        return new AddressDto
        {
            Id = address.Id,
            UserId = address.UserId,
            Street = address.Street,
            HouseNumber = address.HouseNumber,
            AddressAddition = address.AddressAddition,
            City = address.City,
            StateOrProvince = address.StateOrProvince,
            PostalCode = address.PostalCode,
            CountryCode = address.CountryCode,
            AddressType = address.AddressType,
            IsDefaultShipping = address.IsDefaultShipping,
            IsDefaultBilling = address.IsDefaultBilling,
            ContactName = address.ContactName,
            CompanyName = address.CompanyName,
            PhoneNumber = address.PhoneNumber,
            DeliveryInstructions = address.DeliveryInstructions,
            Created = address.Created,
            LastModified = address.LastModified
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Commands/Addresses/DeleteAddressCommand.cs ---
/**
 * @file DeleteAddressCommand.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-05
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Maak het DeleteAddressCommand.
 * @Description Definieert het CQRS-commando en de handler voor het verwijderen van een adres.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Users.Commands.Addresses;

/// <summary>
/// Commando om een specifiek adres te verwijderen op basis van zijn ID.
/// </summary>
public record DeleteAddressCommand(Guid Id) : IRequest;

/// <summary>
/// Handler voor het verwerken van de DeleteAddressCommand.
/// </summary>
public class DeleteAddressCommandHandler : IRequestHandler<DeleteAddressCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public DeleteAddressCommandHandler(IApplicationDbContext context, IUser user, IIdentityService identityService)
    {
        _context = context;
        _user = user;
        _identityService = identityService;
    }

    public async Task Handle(DeleteAddressCommand request, CancellationToken cancellationToken)
    {
        var userId = _user.Id ?? throw new UnauthorizedAccessException("Gebruiker moet ingelogd zijn om een adres te verwijderen.");

        var addressToDelete = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        // Guard clause: Zorg ervoor dat het adres bestaat.
        Guard.Against.NotFound(request.Id, addressToDelete);

        // Autorisatie check: Zorg ervoor dat de gebruiker de eigenaar is van dit adres.
        if (addressToDelete.UserId != userId)
        {
            throw new ForbiddenAccessException("U kunt alleen uw eigen adressen verwijderen.");
        }

        _context.Addresses.Remove(addressToDelete);

        await _identityService.IncrementUserDataVersionAsync(userId, UserDataAggregate.Addresses);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Commands/Addresses/UpdateAddressCommand.cs ---
/**
 * @file UpdateAddressCommand.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-05
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Maak het UpdateAddressCommand met handler en validator.
 * @Description Definieert het CQRS-commando, de validator en de handler voor het bijwerken van een bestaand adres.
 */
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Common;
using RoyalCode.Domain.Entities.User;
using RoyalCode.Domain.Enums;

namespace RoyalCode.Application.Users.Commands.Addresses;

/// <summary>
/// Commando om een bestaand adres bij te werken. De ID wordt uit de URL gehaald,
/// de rest van de data komt uit de request body.
/// </summary>
public record UpdateAddressCommand : IRequest
{
    // De ID wordt door de handler ingesteld vanuit de route parameter.
    public Guid Id { get; set; }

    // De rest van de properties komen uit de body van de request.
    public string Street { get; init; } = string.Empty;
    public string HouseNumber { get; init; } = string.Empty;
    public string? AddressAddition { get; init; }
    public string City { get; init; } = string.Empty;
    public string? StateOrProvince { get; init; }
    public string PostalCode { get; init; } = string.Empty;
    public string CountryCode { get; init; } = string.Empty;
    public AddressType? AddressType { get; init; }
    public string ContactName { get; init; } = string.Empty; // NU NIET NULLABLE
    public string? CompanyName { get; init; }
    public string? PhoneNumber { get; init; }
    public string? DeliveryInstructions { get; init; }
    public bool IsDefaultShipping { get; init; }
    public bool IsDefaultBilling { get; init; }
}

/// <summary>
/// Validator voor de UpdateAddressCommand.
/// </summary>
public class UpdateAddressCommandValidator : AbstractValidator<UpdateAddressCommand>
{
    public UpdateAddressCommandValidator()
    {
        RuleFor(v => v.Id).NotEmpty();
        RuleFor(v => v.Street).NotEmpty().MaximumLength(200);
        RuleFor(v => v.HouseNumber).NotEmpty().MaximumLength(50);
        RuleFor(v => v.City).NotEmpty().MaximumLength(100);
        RuleFor(v => v.PostalCode).NotEmpty().MaximumLength(20);
        RuleFor(v => v.CountryCode).NotEmpty().Length(2).WithMessage("Landcode moet 2 karakters zijn.");
        RuleFor(v => v.AddressType).IsInEnum().When(v => v.AddressType.HasValue);
    }
}

/// <summary>
/// Handler voor de UpdateAddressCommand.
/// </summary>
public class UpdateAddressCommandHandler : IRequestHandler<UpdateAddressCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;
    private readonly IIdentityService _identityService;
    public UpdateAddressCommandHandler(IApplicationDbContext context, IUser user, IIdentityService identityService)
    {
        _context = context;
        _user = user;
        _identityService = identityService;
    }

    public async Task Handle(UpdateAddressCommand request, CancellationToken cancellationToken)
    {
        var userId = _user.Id ?? throw new UnauthorizedAccessException("Gebruiker moet ingelogd zijn om een adres bij te werken.");

        // Zoek het specifieke adres dat bijgewerkt moet worden.
        var addressToUpdate = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        // Guard clause: Zorg ervoor dat het adres bestaat.
        Guard.Against.NotFound(request.Id, addressToUpdate);

        // Autorisatie check: Zorg ervoor dat de gebruiker eigenaar is van dit adres.
        if (addressToUpdate.UserId != userId)
        {
            throw new ForbiddenAccessException("U kunt alleen uw eigen adressen bijwerken.");
        }

        // Roep de domein-methode aan om de velden bij te werken.
        // De Guard Clauses binnen de entiteit worden hier ook weer uitgevoerd.
        addressToUpdate.UpdateDetails(
            request.Street, request.HouseNumber, request.AddressAddition, request.City,
            request.StateOrProvince, request.PostalCode, request.CountryCode, request.AddressType,
            request.ContactName, request.CompanyName, request.PhoneNumber, request.DeliveryInstructions
        );

        // Handel de 'IsDefaultShipping' logica af.
        if (request.IsDefaultShipping)
        {
            // Zet alle andere adressen van deze gebruiker op non-default.
            var otherDefaultShipping = await _context.Addresses
                .Where(a => a.UserId == userId && a.Id != request.Id && a.IsDefaultShipping)
                .ToListAsync(cancellationToken);

            foreach (var adr in otherDefaultShipping)
            {
                adr.SetAsDefaultShipping(false);
            }
        }
        addressToUpdate.SetAsDefaultShipping(request.IsDefaultShipping);

        // Handel de 'IsDefaultBilling' logica af.
        if (request.IsDefaultBilling)
        {
            // Zet alle andere adressen van deze gebruiker op non-default.
            var otherDefaultBilling = await _context.Addresses
                .Where(a => a.UserId == userId && a.Id != request.Id && a.IsDefaultBilling)
                .ToListAsync(cancellationToken);

            foreach (var adr in otherDefaultBilling)
            {
                adr.SetAsDefaultBilling(false);
            }
        }
        addressToUpdate.SetAsDefaultBilling(request.IsDefaultBilling);
        await _identityService.IncrementUserDataVersionAsync(userId, UserDataAggregate.Addresses);

        // Sla de wijzigingen op. EF Core's Change Tracker weet welke entiteiten zijn gewijzigd.
        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Commands/AddWishlistItemCommand.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.User;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Users.Commands;

public record AddWishlistItemCommand(Guid ProductId, Guid? VariantId) : IRequest;

public class AddWishlistItemCommandHandler : IRequestHandler<AddWishlistItemCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public AddWishlistItemCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(AddWishlistItemCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var productExists = await _context.Products.AnyAsync(p => p.Id == request.ProductId, cancellationToken);
        if (!productExists)
        {
            throw new NotFoundException("Product", request.ProductId);
        }

        bool saved = false;
        int retries = 0;
        const int maxRetries = 3;

        while (!saved && retries < maxRetries)
        {
            try
            {
                // Elke poging begint met het ophalen van de meest recente data.
                var wishlist = await _context.Wishlists
                    .Include(w => w.Items)
                    .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

                if (wishlist == null)
                {
                    wishlist = new Wishlist(userId);
                    _context.Wishlists.Add(wishlist);
                }

                wishlist.AddItem(request.ProductId, request.VariantId);

                await _context.SaveChangesAsync(cancellationToken);
                saved = true; // Succes, verlaat de lus.
            }
            catch (DbUpdateConcurrencyException ex)
            {
                retries++;

                // DE DEFINITIEVE FIX: Vang de exceptie op en DETACH alle conflicterende entiteiten.
                // Dit forceert EF Core om de state volledig te vergeten, zodat de volgende
                // iteratie van de lus met een schone lei begint en de data opnieuw laadt.
                foreach (var entry in ex.Entries)
                {
                    entry.State = EntityState.Detached;
                }

                if (retries >= maxRetries)
                {
                    // Als het na meerdere pogingen nog niet lukt, is er een dieper probleem.
                    // Gooi de exceptie alsnog door.
                    throw;
                }
            }
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Commands/ChangePasswordCommand.cs ---
using RoyalCode.Application.Common.Interfaces;
using FluentValidation;

namespace RoyalCode.Application.Users.Commands;

public record ChangePasswordCommand : IRequest
{
    public string CurrentPassword { get; init; } = string.Empty;
    public string NewPassword { get; init; } = string.Empty;
    public string ConfirmNewPassword { get; init; } = string.Empty;
}

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.NewPassword).Equal(x => x.ConfirmNewPassword)
            .WithMessage("New passwords do not match.");
        // Andere password strength rules worden door Identity afgedwongen
    }
}


public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand>
{
    private readonly IIdentityService _identityService;
    private readonly IUser _currentUser;

    public ChangePasswordCommandHandler(IIdentityService identityService, IUser currentUser)
    {
        _identityService = identityService;
        _currentUser = currentUser;
    }

    public async Task Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var result = await _identityService.ChangeUserPasswordAsync(userId, request.CurrentPassword, request.NewPassword);

        if (!result.Succeeded)
        {
            throw new ValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e, e)));
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Commands/DeleteAccountCommand.cs ---
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Users.Commands;

public record DeleteAccountCommand(string Password) : IRequest;

public class DeleteAccountCommandHandler : IRequestHandler<DeleteAccountCommand>
{
    private readonly IIdentityService _identityService;
    private readonly IUser _currentUser;

    public DeleteAccountCommandHandler(IIdentityService identityService, IUser currentUser)
    {
        _identityService = identityService;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        // TODO: Voeg logica toe in IIdentityService om eerst het wachtwoord te valideren.
        // var passwordValid = await _identityService.CheckPasswordAsync(userId, request.Password);
        // if (!passwordValid) { throw new ForbiddenAccessException("Invalid password."); }

        await _identityService.DeleteUserAsync(userId, userId); // Gebruiker verwijdert zichzelf
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Commands/RemoveWishlistItemCommand.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Application.Users.Commands;

public record RemoveWishlistItemCommand(Guid WishlistItemId) : IRequest;

public class RemoveWishlistItemCommandHandler : IRequestHandler<RemoveWishlistItemCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public RemoveWishlistItemCommandHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task Handle(RemoveWishlistItemCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var wishlist = await _context.Wishlists
            .Include(w => w.Items)
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wishlist == null)
        {
            throw new NotFoundException("Wishlist", userId);
        }

        wishlist.RemoveItem(request.WishlistItemId);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Commands/Settings/UpdateUserSettingsCommand.cs ---
/**
* @file UpdateUserSettingsCommand.cs
* @Version 1.1.0 (Fixed)
* @Author Royal-Code MonorepoAppDevAI
* @Date 2025-07-05
* @Description Commando en handler om gebruikersinstellingen bij te werken, nu via IIdentityService.
*/
using System.Text.Json;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Common;

namespace RoyalCode.Application.Users.Commands.UpdateSettings;

public record UpdateUserSettingsCommand(ApplicationSettingsDto Settings) : IRequest;

public class UpdateUserSettingsCommandHandler : IRequestHandler<UpdateUserSettingsCommand>
{
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public UpdateUserSettingsCommandHandler(IUser currentUser, IIdentityService identityService)
    {
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task Handle(UpdateUserSettingsCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var json = JsonSerializer.Serialize(request.Settings);

        await _identityService.UpdateUserSettingsJsonAsync(userId, json);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Commands/UpdateMyProfileCommand.cs ---
/**
 * @file UpdateMyProfileCommand.cs
 * @Version 4.0.0 (Definitive Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description Command and handler for an authenticated user to update ONLY their avatar,
 *              now with ambiguous reference fixes and Clean Architecture compliance.
 */
using RoyalCode.Application.Common.Interfaces;
using FluentValidation;
using AppValidationException = RoyalCode.Application.Common.Exceptions.ValidationException; // Alias voor onze eigen ValidationException
using AppNotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException; // Alias voor onze eigen NotFoundException

namespace RoyalCode.Application.Users.Commands.Profile;

public record UpdateMyProfileCommand : IRequest
{
    public Guid? AvatarMediaId { get; init; }
}

public class UpdateMyProfileCommandValidator : AbstractValidator<UpdateMyProfileCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    // DE FIX: Verwijder de lege constructor. De validator vereist deze dependencies.
    public UpdateMyProfileCommandValidator(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;

        // De validatie logic wordt nu alleen toegepast als de context en user beschikbaar zijn.
        // Als een AvatarMediaId is opgegeven, valideer dan dat het bestaat en van de gebruiker is.
        RuleFor(x => x.AvatarMediaId)
            .MustAsync(async (avatarMediaId, cancellationToken) =>
            {
                if (!avatarMediaId.HasValue) return true; // Geen avatar, geen validatie nodig.
                if (_currentUser.Id == null) return false; // Geen geauthenticeerde gebruiker.

                return await _context.Media
                    .AnyAsync(m => m.Id == avatarMediaId.Value && m.UploaderUserId == _currentUser.Id, cancellationToken);
            })
            .WithMessage("De geselecteerde avatarafbeelding is ongeldig of behoort niet tot jou.")
            .When(x => x.AvatarMediaId.HasValue); // Voer deze validatie alleen uit als een ID is opgegeven.
    }
}


public class UpdateMyProfileCommandHandler : IRequestHandler<UpdateMyProfileCommand>
{
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public UpdateMyProfileCommandHandler(IUser currentUser, IIdentityService identityService)
    {
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task Handle(UpdateMyProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        // DE FIX: Delegeer de update van de avatar naar IIdentityService.
        var result = await _identityService.UpdateUserAvatarAsync(userId, request.AvatarMediaId);

        if (!result.Succeeded)
        {
            throw new AppValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e)));
        }

        // Increment de profielversie voor client-side cache invalidatie.
        await _identityService.IncrementUserDataVersionAsync(userId, UserDataAggregate.Profile);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Commands/UpdateMyProfileDetailsCommand.cs ---
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Users.Commands;

public record UpdateMyProfileDetailsCommand : IRequest
{
    public string FirstName { get; init; } = string.Empty;
    public string? MiddleName { get; init; }
    public string LastName { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string? Bio { get; init; }
}

public class UpdateMyProfileDetailsCommandHandler : IRequestHandler<UpdateMyProfileDetailsCommand>
{
    private readonly IIdentityService _identityService;
    private readonly IUser _currentUser;

    public UpdateMyProfileDetailsCommandHandler(IIdentityService identityService, IUser currentUser)
    {
        _identityService = identityService;
        _currentUser = currentUser;
    }

    public async Task Handle(UpdateMyProfileDetailsCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var result = await _identityService.UpdateMyProfileDetailsAsync(userId, request.FirstName, request.MiddleName, request.LastName, request.DisplayName, request.Bio);

        if (!result.Succeeded)
        {
            throw new ValidationException(result.Errors.Select(e => new FluentValidation.Results.ValidationFailure("", e)));
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/common/AddressDto.cs ---
/**
* @file AddressDto.cs
* @Version 2.0.0 (Definitive & Self-Contained)
* @Author Royal-Code MonorepoAppDevAI
* @Date 2025-07-05
* @GeneratedBy Royal-Code MonorepoAppDevAI
* @PromptSummary Implementeer een GET /api/Users/addresses endpoint.
* @Description De definitieve, enige DTO voor het representeren van een gebruiker-adres in de API.
*              Deze DTO bevat een geneste AutoMapper-configuratie en is de "return type"
*              voor alle adres-gerelateerde commands en queries.
*/
using RoyalCode.Domain.Entities.User;
using RoyalCode.Domain.Enums;

namespace RoyalCode.Application.Users.Common;

/// <summary>
/// DTO voor het weergeven van adresgegevens in de API-responses.
/// </summary>
public class AddressDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string Street { get; init; } = string.Empty;
    public string HouseNumber { get; init; } = string.Empty;
    public string? AddressAddition { get; init; }
    public string City { get; init; } = string.Empty;
    public string? StateOrProvince { get; init; }
    public string PostalCode { get; init; } = string.Empty;
    public string CountryCode { get; init; } = string.Empty;
    public AddressType? AddressType { get; init; }
    public bool IsDefaultShipping { get; init; }
    public bool IsDefaultBilling { get; init; }
    public string? ContactName { get; init; }
    public string? CompanyName { get; init; }
    public string? PhoneNumber { get; init; }
    public string? DeliveryInstructions { get; init; }
    public DateTimeOffset Created { get; init; }
    public DateTimeOffset LastModified { get; init; }

}
--- END OF FILE ---

--- START OF FILE src/Application/Users/common/ApplicationSettingsDto.cs ---
// --- MAAK DIT NIEUWE BESTAND AAN ---
/**
* @file ApplicationSettingsDto.cs
* @Version 1.1.0
* @Author Royal-Code MonorepoAppDevAI
* @Date 2025-07-05
* @GeneratedBy Royal-Code MonorepoAppDevAI
* @PromptSummary Implementeer een GET /api/Users/settings endpoint.
* @Description DTO die de applicatie-instellingen van een gebruiker representeert, conform het frontend-contract.
*/
using System.Text.Json.Serialization;
using RoyalCode.Domain.Enums;

namespace RoyalCode.Application.Users.Common;

public class ApplicationSettingsDto
{
    // String enums in de frontend worden netjes gemapped door de default JSON serializer
    // als we de backend enums met dezelfde casing (PascalCase) definiëren.
    public string Theme { get; set; } = "system";
    public string Language { get; set; } = "nl";
    public bool DarkMode { get; set; } = false;
    public bool MapViewSelected { get; set; } = false;
    public MediaGalleryView MediaGalleryView { get; set; } = MediaGalleryView.InfiniteGridView;
    public NotificationSettingsDto Notifications { get; set; } = new();
    public PrivacySettingsDto Privacy { get; set; } = new();
    public GameplaySettingsDto Gameplay { get; set; } = new();
}

public class NotificationSettingsDto
{
    public EmailNotificationSettingsDto Email { get; set; } = new();
    public PushNotificationSettingsDto Push { get; set; } = new();
}

public class EmailNotificationSettingsDto
{
    public bool Newsletter { get; set; } = false;
    public bool OrderUpdates { get; set; } = true;
    public bool ChallengeAlerts { get; set; } = true;
}

public class PushNotificationSettingsDto
{
    public bool Enabled { get; set; } = true;
    public bool NewChallenges { get; set; } = true;
    public bool SocialMentions { get; set; } = true;
}

public class PrivacySettingsDto
{
    public bool ShowOnlineStatus { get; set; } = true;
    public ProfileVisibility ProfileVisibility { get; set; } = ProfileVisibility.Public;
}

public class GameplaySettingsDto
{
    public bool AutoEquipBestItems { get; set; } = false;
    public bool SkipChallengeCutscenes { get; set; } = false;
    public GameplayDifficulty Difficulty { get; set; } = GameplayDifficulty.Normal;
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/common/WishlistItemDto.cs ---
using System.Text.Json.Serialization;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Application.Users.Common;

// DTO voor een enkel geselecteerd attribuut van een variant.
public record WishlistItemVariantAttributeDto
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public VariantAttributeType AttributeType { get; init; }
    public string DisplayName { get; init; } = string.Empty; // bv. "Kleur"
    public string Value { get; init; } = string.Empty; // bv. "Groen"
    public string? ColorHex { get; init; } // NIEUW: Voor kleur-varianten
}

// DTO voor de frontend, nu verrijkt met variant-details.
public record WishlistItemDto
{
    public Guid Id { get; init; } // Wishlist Item ID
    public Guid ProductId { get; init; }
    public Guid? VariantId { get; init; }
    public DateTimeOffset AddedAt { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ProductImageUrl { get; init; }
    public decimal Price { get; init; }
    public decimal? OriginalPrice { get; init; }
    public string Currency { get; init; } = string.Empty;
    public StockStatus StockStatus { get; init; }
    public bool InStock { get; init; }

    public IReadOnlyCollection<WishlistItemVariantAttributeDto>? VariantAttributes { get; init; }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Events/UserRegisteredEvent.cs ---
/**
 * @file UserRegisteredEvent.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-30
 * @Description Domain event fired when a new user successfully registers in the system.
 */

using Microsoft.Extensions.Logging;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Common;
using CartEntity = RoyalCode.Domain.Entities.Cart.Cart;

namespace RoyalCode.Application.Users.Events;

/// <summary>
/// Represents a domain event that is published when a new user successfully registers.
/// This event can be used by other parts of the application to trigger related processes,
/// such as creating a default shopping cart or sending a welcome email.
/// </summary>
public class UserRegisteredEvent : BaseEvent
{
    /// <summary>De unieke identificatie van de zojuist geregistreerde gebruiker.</summary>
    public Guid UserId { get; }

    /// <summary>De gebruikersnaam van de geregistreerde gebruiker.</summary>
    public string UserName { get; }

    /// <summary>Het e-mailadres van de geregistreerde gebruiker.</summary>
    public string Email { get; }

    /// <summary>
    /// Initialiseert een nieuw exemplaar van de <see cref="UserRegisteredEvent"/> klasse.
    /// </summary>
    /// <param name="userId">De unieke identificatie van de nieuwe gebruiker.</param>
    /// <param name="userName">De gebruikersnaam van de nieuwe gebruiker.</param>
    /// <param name="email">Het e-mailadres van de nieuwe gebruiker.</param>
    public UserRegisteredEvent(Guid userId, string userName, string email)
    {
        UserId = userId;
        UserName = userName;
        Email = email;
    }
}

public class UserRegisteredEventHandler : INotificationHandler<UserRegisteredEvent>
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<UserRegisteredEventHandler> _logger;

    public UserRegisteredEventHandler(IApplicationDbContext context, ILogger<UserRegisteredEventHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task Handle(UserRegisteredEvent notification, CancellationToken cancellationToken)
    {
        // Controleer of er al een winkelwagen bestaat voor deze gebruiker.
        var cartExists = await _context.Carts.AnyAsync(c => c.UserId == notification.UserId, cancellationToken);

        if (cartExists)
        {
            _logger.LogInformation("Cart already exists for user {UserId}. Skipping creation.", notification.UserId);
            return;
        }

        // Maak een nieuwe winkelwagen aan.
        var cart = new CartEntity(notification.UserId, null);
        _context.Carts.Add(cart);

        // Sla de wijzigingen op. Dit is de ENIGE plek waar een nieuwe cart wordt aangemaakt.
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Cart created for new user {UserId}.", notification.UserId);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Queries/GetAddressesQuery.cs ---
/**
* @file GetAddressesQuery.cs
* @Version 1.0.0
* @Author Royal-Code MonorepoAppDevAI
* @Date 2025-07-05
* @GeneratedBy Royal-Code MonorepoAppDevAI
* @PromptSummary Maak een query om alle adressen voor een gebruiker op te halen.
* @Description Definieert de CQRS-query en handler voor het ophalen van alle adressen die bij een gebruiker horen.
*/
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Common;

namespace RoyalCode.Application.Users.Queries;

public record GetAddressesQuery() : IRequest<List<AddressDto>>;

public class GetAddressesQueryHandler : IRequestHandler<GetAddressesQuery, List<AddressDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public GetAddressesQueryHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<List<AddressDto>> Handle(GetAddressesQuery request, CancellationToken cancellationToken)
    {
        if (_user.Id == null) return new List<AddressDto>();

        var addresses = await _context.Addresses
            .AsNoTracking()
            .Where(a => a.UserId == _user.Id.Value)
            .OrderByDescending(a => a.IsDefaultShipping)
            .ThenByDescending(a => a.Created)
            .Select(a => new AddressDto // Handmatige mapping
            {
                Id = a.Id,
                UserId = a.UserId,
                Street = a.Street,
                HouseNumber = a.HouseNumber,
                AddressAddition = a.AddressAddition,
                City = a.City,
                StateOrProvince = a.StateOrProvince,
                PostalCode = a.PostalCode,
                CountryCode = a.CountryCode,
                AddressType = a.AddressType,
                IsDefaultShipping = a.IsDefaultShipping,
                IsDefaultBilling = a.IsDefaultBilling,
                ContactName = a.ContactName,
                CompanyName = a.CompanyName,
                PhoneNumber = a.PhoneNumber,
                DeliveryInstructions = a.DeliveryInstructions,
                Created = a.Created,
                LastModified = a.LastModified
            })
            .ToListAsync(cancellationToken);

        return addresses;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Queries/GetCustomerLookupQuery.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Users.Queries;

public record GetCustomerLookupQuery(string? SearchTerm) : IRequest<List<UserLookupDto>>;

public class GetCustomerLookupQueryHandler : IRequestHandler<GetCustomerLookupQuery, List<UserLookupDto>>
{
    private readonly IUserQueryService _userQueryService; // <-- ENIGE AFHANKELIJKHEID

    public GetCustomerLookupQueryHandler(IUserQueryService userQueryService)
    {
        _userQueryService = userQueryService;
    }

    public async Task<List<UserLookupDto>> Handle(GetCustomerLookupQuery request, CancellationToken cancellationToken)
    {
        // Delegeer de hele operatie naar de service
        return await _userQueryService.FindUsersAsync(request.SearchTerm, cancellationToken);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Queries/GetMyProfileDetailsQuery.cs ---
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Users.Queries;

// DTO die alle data voor de profielpagina bevat
public record MyProfileDetailsDto
{
    public Guid Id { get; init; }
    public string? Email { get; init; }
    public string? FirstName { get; init; }
    public string? MiddleName { get; init; }
    public string? LastName { get; init; }
    public string? DisplayName { get; init; }
    public string? Bio { get; init; }
    public Guid? AvatarMediaId { get; init; }
    public bool IsTwoFactorEnabled { get; init; }
}

public record GetMyProfileDetailsQuery : IRequest<MyProfileDetailsDto>;

public class GetMyProfileDetailsQueryHandler : IRequestHandler<GetMyProfileDetailsQuery, MyProfileDetailsDto>
{
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public GetMyProfileDetailsQueryHandler(IUser currentUser, IIdentityService identityService)
    {
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<MyProfileDetailsDto> Handle(GetMyProfileDetailsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var userDetails = await _identityService.GetMyProfileDetailsAsync(userId);
        if (userDetails == null)
        {
            throw new NotFoundException("User", userId.ToString());
        }

        return userDetails;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Queries/GetUserSettingsQuery.cs ---
/**
* @file GetUserSettingsQuery.cs
* @Version 1.1.0 (Fixed)
* @Author Royal-Code MonorepoAppDevAI
* @Date 2025-07-05
* @Description Query en handler om de instellingen van een gebruiker op te halen, nu via IIdentityService.
*/
using System.Text.Json;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Common;

namespace RoyalCode.Application.Users.Queries;

public record GetUserSettingsQuery : IRequest<ApplicationSettingsDto>;

public class GetUserSettingsQueryHandler : IRequestHandler<GetUserSettingsQuery, ApplicationSettingsDto>
{
    private readonly IUser _currentUser;
    private readonly IIdentityService _identityService;

    public GetUserSettingsQueryHandler(IUser currentUser, IIdentityService identityService)
    {
        _currentUser = currentUser;
        _identityService = identityService;
    }

    public async Task<ApplicationSettingsDto> Handle(GetUserSettingsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();
        var settingsJson = await _identityService.GetUserSettingsJsonAsync(userId);

        if (!string.IsNullOrWhiteSpace(settingsJson))
        {
            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<ApplicationSettingsDto>(settingsJson, options)
                       ?? new ApplicationSettingsDto();
            }
            catch (JsonException)
            {
                return new ApplicationSettingsDto();
            }
        }

        return new ApplicationSettingsDto();
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Users/Queries/GetWishlistQueryHandler.cs ---
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Common;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Application.Users.Queries;

public record GetWishlistQuery : IRequest<List<WishlistItemDto>>;

public class GetWishlistQueryHandler : IRequestHandler<GetWishlistQuery, List<WishlistItemDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _currentUser;

    public GetWishlistQueryHandler(IApplicationDbContext context, IUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<WishlistItemDto>> Handle(GetWishlistQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.Id ?? throw new UnauthorizedAccessException();

        var wishlistItems = await _context.Wishlists
            .Where(w => w.UserId == userId)
            .SelectMany(w => w.Items)
            .OrderByDescending(wi => wi.AddedAt)
            .ToListAsync(cancellationToken);

        if (!wishlistItems.Any())
        {
            return new List<WishlistItemDto>();
        }

        var productIds = wishlistItems.Select(wi => wi.ProductId).Distinct().ToList();

        // Batch-fetch products
        var productsLookup = await _context.Products.OfType<PhysicalProduct>()
            .AsNoTracking()
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p, cancellationToken);

        // Batch-fetch variants
        var variantIds = wishlistItems.Where(wi => wi.VariantId.HasValue).Select(wi => wi.VariantId!.Value).Distinct().ToList();
        var variantsLookup = await _context.ProductVariantCombinations.AsNoTracking()
            .Where(v => variantIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, v => v, cancellationToken);

        // Batch-fetch attribute assignments and values
        var allAttributeValueIds = productsLookup.Values.SelectMany(p => p.AttributeAssignments.Select(paa => paa.AttributeValueId)).Distinct().ToList();
        var attributeValuesLookup = await _context.AttributeValues.AsNoTracking()
            .Where(av => allAttributeValueIds.Contains(av.Id))
            .ToDictionaryAsync(av => av.Id, av => av, cancellationToken);

        // Batch-fetch media thumbnails
        var allProductMediaIds = productsLookup.Values.SelectMany(p => p.MediaIds).Distinct().ToList();
        var mediaThumbnails = await _context.Media
            .AsNoTracking()
            .Where(m => allProductMediaIds.Contains(m.Id))
            .ToDictionaryAsync(m => m.Id, m => m.ThumbnailUrl ?? m.Url, cancellationToken);

        var dtos = wishlistItems.Select(item =>
        {
            if (!productsLookup.TryGetValue(item.ProductId, out var product))
            {
                return null;
            }

            ProductVariantCombination? variant = null;
            if (item.VariantId.HasValue)
            {
                variantsLookup.TryGetValue(item.VariantId.Value, out variant);
            }

            var price = variant?.Price ?? product.Pricing.Price;
            var originalPrice = variant?.OriginalPrice ?? product.Pricing.OriginalPrice;
            var stockStatus = variant?.StockStatus ?? product.StockStatus;
            var inStock = stockStatus is StockStatus.InStock or StockStatus.LimitedStock or StockStatus.OnBackorder;
            var firstMediaId = product.MediaIds.FirstOrDefault();
            var imageUrl = firstMediaId != Guid.Empty ? mediaThumbnails.GetValueOrDefault(firstMediaId) : null;

            List<WishlistItemVariantAttributeDto>? variantAttributes = null;
            if (variant != null)
            {
                variantAttributes = variant.AttributeValueIds
                    .Select(avId => attributeValuesLookup.GetValueOrDefault(avId))
                    .Where(av => av != null)
                    .Select(av => new WishlistItemVariantAttributeDto
                    {
                        AttributeType = av!.AttributeType,
                        DisplayName = av.AttributeType.ToString(), // Or av.DisplayName if that's preferred
                        Value = av.DisplayName,
                        ColorHex = (av.AttributeType == VariantAttributeType.Color) ? av.ColorHex : null
                    })
                    .ToList();
            }

            return new WishlistItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                VariantId = item.VariantId,
                AddedAt = item.AddedAt,
                ProductName = product.Name,
                ProductImageUrl = imageUrl,
                Price = price,
                OriginalPrice = originalPrice,
                Currency = product.Currency ?? "EUR",
                StockStatus = stockStatus,
                InStock = inStock,
                VariantAttributes = variantAttributes
            };
        }).Where(dto => dto != null).ToList();

        return dtos!;
    }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Domain.csproj ---
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <RootNamespace>RoyalCode.Domain</RootNamespace>
    <AssemblyName>RoyalCode.Domain</AssemblyName>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Ardalis.GuardClauses" />
    <PackageReference Include="MediatR" />
    <PackageReference Include="Microsoft.Extensions.Identity.Stores" />
  </ItemGroup>

  <ItemGroup>
    <InternalsVisibleTo Include="RoyalCode.Infrastructure" />
  </ItemGroup>

  <ItemGroup>
    <Folder Include="NewFolder\" />
  </ItemGroup>


</Project>
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/Address.cs ---
/**
 * @file Address.cs
 * @Version 1.2.2 (Explicit Enum Qualification Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-05
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Maak een domeinmodel en DTO voor het beheren van gebruiker-adressen.
 * @Description Domeinentiteit die een fysiek adres voor een gebruiker representeert.
 *              Deze versie combineert de beste suggesties en handhaaft strikte Clean Architecture-principes.
 */
using System;
using System.ComponentModel.DataAnnotations;
using Ardalis.GuardClauses;
using RoyalCode.Domain.Common;
using RoyalCode.Domain.Enums; // Belangrijk: Deze using blijft, maar we kwalificeren de enum expliciet hieronder.

namespace RoyalCode.Domain.Entities.User;

public class Address : BaseAuditableEntity<Guid>
{
    [Required]
    public Guid UserId { get; private set; }

    [Required, MaxLength(200)]
    public string Street { get; private set; } = string.Empty;

    [Required, MaxLength(50)]
    public string HouseNumber { get; private set; } = string.Empty;

    [MaxLength(100)]
    public string? AddressAddition { get; private set; }

    [Required, MaxLength(100)]
    public string City { get; private set; } = string.Empty;

    [MaxLength(100)]
    public string? StateOrProvince { get; private set; }

    [Required, MaxLength(20)]
    public string PostalCode { get; private set; } = string.Empty;

    [Required, MaxLength(2)]
    public string CountryCode { get; private set; } = string.Empty;

    public RoyalCode.Domain.Enums.AddressType? AddressType { get; private set; } // VOLLEDIG GEKWALIFICEERD HIER

    public bool IsDefaultShipping { get; private set; }
    public bool IsDefaultBilling { get; private set; }

    [Required, MaxLength(150)]
    public string ContactName { get; private set; } = string.Empty;

    [MaxLength(150)]
    public string? CompanyName { get; private set; }

    [MaxLength(50)]
    public string? PhoneNumber { get; private set; }

    [MaxLength(500)]
    public string? DeliveryInstructions { get; private set; }

    private Address() { }

    public Address(
        Guid userId, string street, string houseNumber,
        string city, string postalCode, string countryCode, string contactName)
    {
        ValidateAndSetCoreFields(userId, street, houseNumber, city, postalCode, countryCode);
        UpdateContactName(contactName, null);
        Id = Guid.NewGuid();
    }

    public void UpdateDetails(
        string street, string houseNumber, string? addressAddition, string city,
        string? stateOrProvince, string postalCode, string countryCode, RoyalCode.Domain.Enums.AddressType? addressType, // VOLLEDIG GEKWALIFICEERD HIER
        string contactName, string? companyName, string? phoneNumber, string? deliveryInstructions)
    {
        ValidateAndSetCoreFields(UserId, street, houseNumber, city, postalCode, countryCode);

        AddressAddition = addressAddition;
        StateOrProvince = stateOrProvince;
        AddressType = addressType;
        CompanyName = companyName;
        PhoneNumber = phoneNumber;
        DeliveryInstructions = deliveryInstructions;

        UpdateContactName(contactName, addressType);
    }

    private void ValidateAndSetCoreFields(Guid userId, string street, string houseNumber, string city, string postalCode, string countryCode)
    {
        Guard.Against.Default(userId, nameof(userId));
        Guard.Against.NullOrWhiteSpace(street, nameof(street));
        Guard.Against.NullOrWhiteSpace(houseNumber, nameof(houseNumber));
        Guard.Against.NullOrWhiteSpace(city, nameof(city));
        Guard.Against.NullOrWhiteSpace(postalCode, nameof(postalCode));
        Guard.Against.NullOrWhiteSpace(countryCode, nameof(countryCode));

        if (countryCode.Length != 2 || !countryCode.All(char.IsLetter))
        {
            throw new ArgumentException("Landcode moet bestaan uit exact 2 letters.", nameof(countryCode));
        }

        UserId = userId;
        Street = street;
        HouseNumber = houseNumber;
        City = city;
        PostalCode = postalCode;
        CountryCode = countryCode.ToUpperInvariant();
    }

    public void UpdateContactName(string contactName, RoyalCode.Domain.Enums.AddressType? currentAddressType) // VOLLEDIG GEKWALIFICEERD HIER
    {
        // ContactName is altijd vereist voor Shipping en Billing types.
        if (currentAddressType.HasValue && (currentAddressType.Value == RoyalCode.Domain.Enums.AddressType.Shipping || currentAddressType.Value == RoyalCode.Domain.Enums.AddressType.Billing)) // VOLLEDIG GEKWALIFICEERD HIER
        {
            Guard.Against.NullOrWhiteSpace(contactName, nameof(contactName), "Contactnaam is verplicht voor verzend- en factuuradressen.");
        }
        else
        {
            // Voor andere types is de naam ook verplicht, maar kan een default krijgen of leeg zijn als de bedrijfsregel dat toelaat.
            // Voor nu houden we het overal verplicht conform jouw feedback.
            Guard.Against.NullOrWhiteSpace(contactName, nameof(contactName), "Contactnaam is verplicht.");
        }
        ContactName = contactName;
    }



    public void SetAsDefaultShipping(bool isDefault)
    {
        IsDefaultShipping = isDefault;
    }

    public void SetAsDefaultBilling(bool isDefault)
    {
        IsDefaultBilling = isDefault;
    }

    public bool IsValidForShipping()
    {
        // Deze logica is simpel, maar toont het principe van een business rule in het domein.
        return !string.IsNullOrWhiteSpace(Street) &&
               !string.IsNullOrWhiteSpace(HouseNumber) &&
               !string.IsNullOrWhiteSpace(City) &&
               !string.IsNullOrWhiteSpace(PostalCode) &&
               !string.IsNullOrWhiteSpace(CountryCode) &&
               !string.IsNullOrWhiteSpace(ContactName); // Nu verplicht
    }

    /// <returns>True als alle verplichte velden voor facturatie zijn ingevuld.</returns>
    public bool IsValidForBilling()
    {
        // Een factuuradres vereist vaak ook een naam voor de attentie.
        return IsValidForShipping(); // Gebruikt nu ook ContactName via IsValidForShipping
    }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/CartModels.cs ---
/**
 * @file Cart.cs
 * @Version 7.0.0 (RADICAL FIX: Explicit Change Tracking)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-08-02
 * @Description The MarkAsModified method has been REMOVED. The domain entity is now pure.
 *              The responsibility for marking the entity as modified is moved to the Application layer.
 */
using System.ComponentModel.DataAnnotations;
using RoyalCode.Domain.Common;

namespace RoyalCode.Domain.Entities.Cart;

/// <summary>
/// The abstract base class for all shopping cart types. It defines the core properties and behaviors.
/// This allows for future specializations like a 'StandardCart' or 'SubscriptionCart'.
/// </summary>
public abstract class CartBase : BaseAuditableEntity<Guid>
{
    public Guid? UserId { get; protected set; }
    public string? SessionId { get; protected set; }

    private readonly List<CartItem> _items = new();
    public IReadOnlyCollection<CartItem> Items => _items.AsReadOnly();

    public decimal ShippingCost { get; protected set; }
    public decimal TotalDiscountAmount { get; protected set; }
    public decimal TotalVatAmount { get; protected set; }

    [Timestamp]
    public byte[]? RowVersion { get; private set; }

    public decimal SubTotal => _items.Sum(i => i.LineTotal);
    public decimal TotalWithShipping => SubTotal + ShippingCost - TotalDiscountAmount;
    public int TotalItems => _items.Sum(i => i.Quantity);

    protected CartBase() { }

    protected CartBase(Guid? userId, string? sessionId)
    {
        if (userId == null && string.IsNullOrWhiteSpace(sessionId))
            throw new ArgumentException("Either a UserId or a SessionId must be provided.");

        Id = Guid.NewGuid();
        UserId = userId;
        SessionId = sessionId;
        ResetFinancials();
    }

    public virtual CartItem AddItem(Guid productId, Guid? variantId, int quantity, string productName, decimal priceAtTimeOfAddition, string? imageUrl = null, string? sku = null)
    {
        if (quantity <= 0) throw new ArgumentException("Quantity must be positive.", nameof(quantity));
        if (string.IsNullOrWhiteSpace(productName)) throw new ArgumentException("Product name cannot be empty.", nameof(productName));

        var existingItem = _items.FirstOrDefault(i => i.ProductId == productId && i.ProductVariantId == variantId);

        if (existingItem != null)
        {
            UpdateItemQuantity(existingItem.Id, existingItem.Quantity + quantity);
            return existingItem;
        }

        var newItem = new CartItem(this.Id, productId, variantId, quantity, productName, priceAtTimeOfAddition, imageUrl, sku);
        _items.Add(newItem);
        RecalculateFinancialsOnMutation();
        return newItem;
    }

    public virtual void UpdateItemQuantity(Guid cartItemId, int newQuantity)
    {
        var item = _items.FirstOrDefault(i => i.Id == cartItemId);
        if (item == null) throw new InvalidOperationException($"Cart item with ID {cartItemId} not found.");

        if (newQuantity <= 0) _items.Remove(item);
        else item.UpdateQuantity(newQuantity);

        RecalculateFinancialsOnMutation();
    }

    public virtual void RemoveItem(Guid cartItemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == cartItemId);
        if (item != null)
        {
            _items.Remove(item);
            RecalculateFinancialsOnMutation();
        }
    }

    public virtual void Clear()
    {
        if (!_items.Any()) return;
        _items.Clear();
        ResetFinancials();
    }

    public virtual void SetShippingCost(decimal shippingCost)
    {
        if (shippingCost < 0) throw new ArgumentException("Shipping cost cannot be negative.");
        ShippingCost = shippingCost;
    }

    public virtual void ApplyDiscount(decimal discountAmount)
    {
        if (discountAmount < 0) throw new ArgumentException("Discount cannot be negative.");
        TotalDiscountAmount = Math.Min(discountAmount, SubTotal);
    }

    public virtual void SetVatAmount(decimal vatAmount)
    {
        if (vatAmount < 0) throw new ArgumentException("VAT amount cannot be negative.");
        TotalVatAmount = vatAmount;
    }

    public virtual void AssignToUser(Guid userId)
    {
        if (UserId.HasValue) throw new InvalidOperationException("Cart is already assigned to a user.");
        UserId = userId;
        SessionId = null;
    }

    protected void RecalculateFinancialsOnMutation()
    {
        if (!_items.Any()) ResetFinancials();
        else if (TotalDiscountAmount > SubTotal) TotalDiscountAmount = SubTotal;
    }

    protected void ResetFinancials()
    {
        ShippingCost = 0m;
        TotalDiscountAmount = 0m;
        TotalVatAmount = 0m;
    }
}

public sealed class Cart : CartBase
{
    private Cart() : base() { }
    public Cart(Guid? userId, string? sessionId = null) : base(userId, sessionId) { }
}

public class CartItem : BaseEntity<Guid>
{
    public Guid CartId { get; private set; }
    public CartBase Cart { get; private set; } = null!;
    public Guid ProductId { get; private set; }
    public Guid? ProductVariantId { get; private set; }
    public int Quantity { get; private set; }
    [MaxLength(255)] public string ProductName { get; private set; }
    [MaxLength(100)] public string? Sku { get; private set; }
    public decimal PricePerItem { get; private set; }
    public string? ProductImageUrl { get; private set; }
    public decimal LineTotal => Quantity * PricePerItem;
    [Timestamp] public byte[]? RowVersion { get; private set; }
    public string? SelectedVariantsJson { get; private set; }

    private CartItem() { ProductName = string.Empty; }

    public CartItem(Guid cartId, Guid productId, Guid? variantId, int quantity, string productName, decimal pricePerItem, string? imageUrl, string? sku)
    {
        Id = Guid.NewGuid(); CartId = cartId; ProductId = productId; ProductVariantId = variantId;
        Quantity = quantity; ProductName = productName; PricePerItem = pricePerItem;
        ProductImageUrl = imageUrl; Sku = sku;
    }

    public void UpdateQuantity(int newQuantity) => Quantity = newQuantity;

    public void SetSelectedVariants(string? selectedVariantsJson)
    {
        SelectedVariantsJson = selectedVariantsJson;
    }

}
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/ChatModel.cs ---
/**
 * @file ChatModel.cs
 * @Version 2.0.0 (Refactored & Split)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description The refactored, central domain model for the Chat aggregate, containing entities,
 *              value objects, events, and repository interfaces. Enums and Exceptions are now in separate files.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Refactor Chat domain models into correct files and namespaces.
 */
using System.Text.Json;
using RoyalCode.Domain.Common;
using RoyalCode.Domain.Enums.Chat;
using RoyalCode.Domain.Exceptions;
using RoyalCode.Domain.Entities.Chat;

// =============================================================================
// === VALUE OBJECTS ===
// =============================================================================
namespace RoyalCode.Domain.Entities.Chat;

    public record MessageContent
    {
        public string Text { get; }
        public int Length => Text.Length;
        public bool IsEmpty => string.IsNullOrWhiteSpace(Text);

        private MessageContent(string text)
        {
            Text = text;
        }

        public static MessageContent Create(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                throw new DomainException("Message content cannot be empty");

            if (text.Length > 10000) // Business rule: max message length
                throw new DomainException("Message content cannot exceed 10,000 characters");

            return new MessageContent(text.Trim());
        }

        public static implicit operator string(MessageContent content) => content.Text;
        public override string ToString() => Text;
    }

    public interface IAiProviderConfiguration
    {
        AiProviderType ProviderType { get; }
        string ToJson();
    }

    public record OpenAiConfiguration : IAiProviderConfiguration
    {
        public AiProviderType ProviderType => AiProviderType.OpenAI_GPT4;
        public string Model { get; init; } = "gpt-4";
        public double Temperature { get; init; } = 0.7;
        public int MaxTokens { get; init; } = 2000;
        public string SystemPrompt { get; init; } = "";
        public string ApiKey { get; init; } = "";

        public string ToJson() => JsonSerializer.Serialize(this);

        public static OpenAiConfiguration FromJson(string json)
        {
            return JsonSerializer.Deserialize<OpenAiConfiguration>(json)
                   ?? throw new DomainException("Invalid OpenAI configuration JSON");
        }
    }

    public record ClaudeConfiguration : IAiProviderConfiguration
    {
        public AiProviderType ProviderType => AiProviderType.Anthropic_Claude;
        public string Model { get; init; } = "claude-3-sonnet";
        public int MaxTokens { get; init; } = 2000;
        public string SystemPrompt { get; init; } = "";
        public string ApiKey { get; init; } = "";

        public string ToJson() => JsonSerializer.Serialize(this);

        public static ClaudeConfiguration FromJson(string json)
        {
            return JsonSerializer.Deserialize<ClaudeConfiguration>(json)
                   ?? throw new DomainException("Invalid Claude configuration JSON");
        }
    }


// =============================================================================
// === CORE DOMAIN (ENTITIES, EVENTS, REPOSITORIES) ===
// =============================================================================
#region Domain Events
public abstract class ChatDomainEvent : BaseEvent { }

public class ConversationCreatedDomainEvent : ChatDomainEvent
{
    public Guid ConversationId { get; }
    public ConversationType Type { get; }
    public string? Title { get; }

    public ConversationCreatedDomainEvent(Guid conversationId, ConversationType type, string? title)
    {
        ConversationId = conversationId;
        Type = type;
        Title = title;
    }
}

public class ParticipantAddedDomainEvent : ChatDomainEvent
{
    public Guid ConversationId { get; }
    public Guid ParticipantId { get; }
    public Guid? UserId { get; }
    public Guid? AiPersonaId { get; }
    public ConversationRole Role { get; }

    public ParticipantAddedDomainEvent(Guid conversationId, Guid participantId, Guid? userId, Guid? aiPersonaId, ConversationRole role)
    {
        ConversationId = conversationId;
        ParticipantId = participantId;
        UserId = userId;
        AiPersonaId = aiPersonaId;
        Role = role;
    }
}

public class MessageAddedDomainEvent : ChatDomainEvent
{
    public Guid ConversationId { get; }
    public Guid MessageId { get; }
    public Guid SenderParticipantId { get; }
    public MessageType Type { get; }
    public int MessageLength { get; }

    public MessageAddedDomainEvent(Guid conversationId, Guid messageId, Guid senderParticipantId, MessageType type, int messageLength)
    {
        ConversationId = conversationId;
        MessageId = messageId;
        SenderParticipantId = senderParticipantId;
        Type = type;
        MessageLength = messageLength;
    }
}

public class MessageReadDomainEvent : ChatDomainEvent
{
    public Guid ConversationId { get; }
    public Guid ParticipantId { get; }
    public DateTimeOffset ReadTimestamp { get; }
    public int UnreadCountBefore { get; }

    public MessageReadDomainEvent(Guid conversationId, Guid participantId, DateTimeOffset readTimestamp, int unreadCountBefore)
    {
        ConversationId = conversationId;
        ParticipantId = participantId;
        ReadTimestamp = readTimestamp;
        UnreadCountBefore = unreadCountBefore;
    }
}
#endregion

#region Repository Interfaces
public interface IConversationRepository
{
    Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Conversation>> GetByParticipantAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Conversation?> GetDirectMessageConversationAsync(Guid userId1, Guid userId2, CancellationToken cancellationToken = default);
    Task<Conversation?> GetAiChatConversationAsync(Guid userId, Guid aiPersonaId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Conversation>> GetConversationsWithUnreadMessagesAsync(Guid userId, CancellationToken cancellationToken = default);
    void Add(Conversation conversation);
    void Update(Conversation conversation);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IAiPersonaRepository
{
    Task<AIPersona?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AIPersona>> GetAllActiveAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AIPersona>> GetByProviderTypeAsync(AiProviderType providerType, CancellationToken cancellationToken = default);
    void Add(AIPersona aiPersona);
    void Update(AIPersona aiPersona);
    void Remove(AIPersona aiPersona);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
}
#endregion

#region Domain Service Interfaces
public interface IConversationDomainService
{
    Task<bool> CanUserCreateConversationAsync(Guid userId, ConversationType type, CancellationToken cancellationToken = default);
    Task<Conversation?> FindExistingDirectMessageAsync(Guid userId1, Guid userId2, CancellationToken cancellationToken = default);
    Task<Conversation?> FindExistingAiChatAsync(Guid userId, Guid aiPersonaId, CancellationToken cancellationToken = default);
    Task<int> CalculateUnreadCountAsync(Guid conversationId, Guid participantId, CancellationToken cancellationToken = default);
    Task<bool> ValidateParticipantPermissionsAsync(Guid conversationId, Guid participantId, string operation, CancellationToken cancellationToken = default);
}
#endregion

#region Integration Events
public abstract record ChatIntegrationEvent
{
    public Guid Id { get; } = Guid.NewGuid();
    public DateTimeOffset OccurredOn { get; } = DateTimeOffset.UtcNow;
    public string EventType => GetType().Name;
}

public record ConversationCreatedIntegrationEvent(
    Guid ConversationId,
    ConversationType Type,
    List<Guid> ParticipantUserIds,
    List<Guid> ParticipantAiPersonaIds,
    Guid CreatedByUserId
) : ChatIntegrationEvent;

public record MessageSentIntegrationEvent(
    Guid ConversationId,
    Guid MessageId,
    Guid SenderParticipantId,
    Guid? SenderUserId,
    Guid? SenderAiPersonaId,
    string MessageContent,
    MessageType MessageType,
    List<Guid> RecipientUserIds
) : ChatIntegrationEvent;

public record AiResponseRequestedIntegrationEvent(
    Guid ConversationId,
    Guid MessageId,
    Guid AiPersonaId,
    string UserMessage,
    AiProviderType ProviderType,
    string ConfigurationJson
) : ChatIntegrationEvent;
#endregion

#region Entities (Aggregate Roots & Child Entities)
public class Conversation : BaseAuditableEntity<Guid>
{
    private const int MAX_DIRECT_MESSAGE_PARTICIPANTS = 2;
    private const int MAX_GROUP_CHAT_PARTICIPANTS = 500;
    public Guid? AnonymousSessionId { get; private set; } 
    public int MessageCount { get; private set; } 

    public ConversationType Type { get; private set; }
    public string? Title { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTimeOffset? LastActivityAt { get; private set; }

    private readonly List<Participant> _participants = new();
    public IReadOnlyCollection<Participant> Participants => _participants.AsReadOnly();

    private readonly List<Message> _messages = new();
    public IReadOnlyCollection<Message> Messages => _messages.AsReadOnly();

    private Conversation() { } // For EF Core

    public Conversation(ConversationType type, string? title = null, Guid? createdByUserId = null, Guid? anonymousSessionId = null)
    {
        Id = Guid.NewGuid();
        Type = type;
        Title = ValidateAndSetTitle(title, type);
        LastActivityAt = DateTimeOffset.UtcNow;
        AnonymousSessionId = anonymousSessionId; // Stel de nieuwe property in
        MessageCount = 0; // Initialiseer op 0

        AddDomainEvent(new ConversationCreatedDomainEvent(Id, Type, Title));
    }

    // Voeg een methode toe om de anonieme sessie te koppelen aan een gebruiker
    public void AssociateWithUser(Guid userId)
    {
        if (AnonymousSessionId == null)
        {
            throw new DomainException("This is not an anonymous conversation.", "NOT_ANONYMOUS_CONVERSATION");
        }

        // Controleer of er al een user participant is die deze conversatie bezit
        var existingUserParticipant = this.Participants.FirstOrDefault(p => p.UserId == userId);

        if (existingUserParticipant != null)
        {
            // De conversatie is al gekoppeld aan deze gebruiker, of de gebruiker is al deelnemer
            throw new DomainException("User is already a participant of this conversation.", "ALREADY_ASSOCIATED");
        }

        // Voeg de nieuwe gebruiker toe als eigenaar.
        // Belangrijk: Eerst de AI participant verwijderen als deze geen UserID heeft,
        // en dan een nieuwe user participant aanmaken voor de user.
        var currentAiParticipant = this.Participants.FirstOrDefault(p => p.AiPersonaId.HasValue);
        if (currentAiParticipant != null && !currentAiParticipant.UserId.HasValue) // Zorg dat we geen echte users verwijderen
        {
            _participants.Remove(currentAiParticipant); // Verwijder de "anonieme" AI participant
        }

        // Voeg de menselijke gebruiker toe, nu als Owner
        AddParticipant(Participant.ForUser(this.Id, userId, ConversationRole.Owner));

        AnonymousSessionId = null; // Markeer de anonieme sessie als gekoppeld
    }



    // In de AddMessage methode, voeg message count toe
    public void AddMessage(Message message)
    {
        ValidateMessageAddition(message);
        _messages.Add(message);
        LastActivityAt = DateTimeOffset.UtcNow;
        MessageCount++; // <-- Verhoog de teller
        UpdateUnreadCountsForMessage(message);
        AddDomainEvent(new MessageAddedDomainEvent(Id, message.Id, message.SenderParticipantId, message.Type, message.Content.Length));
    }


    public static Conversation CreateDirectMessage(Guid user1Id, Guid user2Id, string? title = null)
    {
        if (user1Id == user2Id)
            throw new ChatDomainException("Cannot create direct message with yourself");

        var conversation = new Conversation(ConversationType.DirectMessage, title, user1Id);
        var participant1 = Participant.ForUser(conversation.Id, user1Id, ConversationRole.Member);
        var participant2 = Participant.ForUser(conversation.Id, user2Id, ConversationRole.Member);
        conversation.AddParticipant(participant1);
        conversation.AddParticipant(participant2);
        return conversation;
    }

    public static Conversation CreateAiChat(Guid userId, Guid aiPersonaId, string? title = null)
    {
        var conversation = new Conversation(ConversationType.AiChat, title, userId);
        var userParticipant = Participant.ForUser(conversation.Id, userId, ConversationRole.Owner);
        var aiParticipant = Participant.ForAi(conversation.Id, aiPersonaId, ConversationRole.Member);
        conversation.AddParticipant(userParticipant);
        conversation.AddParticipant(aiParticipant);
        return conversation;
    }

    public void AddParticipant(Participant participant)
    {
        ValidateParticipantAddition(participant);
        if (!_participants.Any(p => p.IsSameEntity(participant)))
        {
            _participants.Add(participant);
            AddDomainEvent(new ParticipantAddedDomainEvent(Id, participant.Id, participant.UserId, participant.AiPersonaId, participant.Role));
        }
    }

    public void UpdateTitle(string? newTitle) => Title = ValidateAndSetTitle(newTitle, Type);
    public void Archive() => IsActive = false;
    public void Reactivate() => IsActive = true;
    public Participant? GetParticipantByUserId(Guid userId) => _participants.FirstOrDefault(p => p.UserId == userId);
    public Participant? GetParticipantByAiPersonaId(Guid aiPersonaId) => _participants.FirstOrDefault(p => p.AiPersonaId == aiPersonaId);
    public int GetUnreadCountForParticipant(Guid participantId) => _participants.FirstOrDefault(p => p.Id == participantId)?.UnreadCount ?? 0;

    private void ValidateParticipantAddition(Participant participant)
    {
        if (participant.ConversationId != Id) throw new ChatDomainException("Participant belongs to different conversation");
        switch (Type)
        {
            case ConversationType.DirectMessage when _participants.Count >= MAX_DIRECT_MESSAGE_PARTICIPANTS:
                throw new ChatDomainException("Direct messages can only have 2 participants");
            case ConversationType.GroupChat when _participants.Count >= MAX_GROUP_CHAT_PARTICIPANTS:
                throw new ChatDomainException($"Group chats cannot exceed {MAX_GROUP_CHAT_PARTICIPANTS} participants");
        }
        if (participant.Role == ConversationRole.Owner && _participants.Any(p => p.Role == ConversationRole.Owner))
        {
            throw new ChatDomainException("Conversation can only have one owner");
        }
    }

    private void ValidateMessageAddition(Message message)
    {
        if (message.ConversationId != Id) throw new ChatDomainException("Message belongs to different conversation");
        if (!_participants.Any(p => p.Id == message.SenderParticipantId)) throw new ChatDomainException("Message sender is not a participant in this conversation");
        if (!IsActive) throw new ChatDomainException("Cannot add messages to archived conversation");
    }

    private void UpdateUnreadCountsForMessage(Message message)
    {
        foreach (var participant in _participants.Where(p => p.Id != message.SenderParticipantId))
        {
            participant.IncrementUnreadCount();
        }
    }

    private static string? ValidateAndSetTitle(string? title, ConversationType type)
    {
        if (string.IsNullOrWhiteSpace(title)) return null;
        if (title.Length > 200) throw new ChatDomainException("Conversation title cannot exceed 200 characters");
        return title.Trim();
    }

    public void RemoveParticipant(Guid userIdToRemove)
    {
        var participantToRemove = _participants.FirstOrDefault(p => p.UserId == userIdToRemove);
        if (participantToRemove == null)
        {
            // Deelnemer is al weg, geen actie nodig.
            return;
        }

        // Business Rule: De eigenaar kan niet verwijderd worden (moet de groep verwijderen of eigendom overdragen).
        if (participantToRemove.Role == ConversationRole.Owner)
        {
            throw new ChatDomainException("The owner of the group cannot be removed.");
        }

        _participants.Remove(participantToRemove);
        // Optioneel: AddDomainEvent(new ParticipantRemovedEvent(...));
    }

}

public class Participant : BaseEntity<Guid>
{
    public Guid ConversationId { get; private set; }
    public Guid? UserId { get; private set; }
    public Guid? AiPersonaId { get; private set; }
    public ConversationRole Role { get; private set; }
    public DateTimeOffset JoinedAt { get; private set; }
    public DateTimeOffset? LastReadTimestamp { get; private set; }
    public int UnreadCount { get; private set; }
    public bool IsActive { get; private set; } = true;

    // --- DE FIX: Nieuwe property om gasten te identificeren ---
    public bool IsGuest { get; private set; }

    public virtual Conversation Conversation { get; private set; } = null!;

    private Participant() { }

    private Participant(Guid conversationId, Guid? userId, Guid? aiPersonaId, ConversationRole role, bool isGuest = false)
    {
        // --- DE FIX: Constraint versoepeld voor gasten ---
        ValidateParticipantConstraints(userId, aiPersonaId, isGuest);
        Id = Guid.NewGuid();
        ConversationId = conversationId;
        UserId = userId;
        AiPersonaId = aiPersonaId;
        Role = role;
        IsGuest = isGuest;
        JoinedAt = DateTimeOffset.UtcNow;
        UnreadCount = 0;
    }

    public static Participant ForUser(Guid conversationId, Guid userId, ConversationRole role = ConversationRole.Member)
    {
        if (userId == Guid.Empty) throw new ChatDomainException("User ID cannot be empty");
        return new Participant(conversationId, userId, null, role);
    }

    public static Participant ForAi(Guid conversationId, Guid aiPersonaId, ConversationRole role = ConversationRole.Member)
    {
        if (aiPersonaId == Guid.Empty) throw new ChatDomainException("AI Persona ID cannot be empty");
        return new Participant(conversationId, null, aiPersonaId, role);
    }

    // --- DE FIX: Nieuwe factory methode voor anonieme gasten ---
    public static Participant ForGuest(Guid conversationId)
    {
        return new Participant(conversationId, null, null, ConversationRole.Guest, isGuest: true);
    }

    public void MarkAsRead(DateTimeOffset timestamp, int? specificUnreadCount = null)
    {
        var previousUnreadCount = UnreadCount;
        LastReadTimestamp = timestamp;
        UnreadCount = specificUnreadCount ?? 0;
        if (previousUnreadCount > 0)
        {
            AddDomainEvent(new MessageReadDomainEvent(ConversationId, Id, timestamp, previousUnreadCount));
        }
    }

    public void IncrementUnreadCount() => UnreadCount++;
    public void UpdateRole(ConversationRole newRole)
    {
        if (!IsActive) throw new ChatDomainException("Cannot update role of inactive participant");
        Role = newRole;
    }
    public void Leave() => IsActive = false;
    public bool IsSameEntity(Participant other) => ConversationId == other.ConversationId && UserId == other.UserId && AiPersonaId == other.AiPersonaId;
    public bool IsHuman => UserId.HasValue;
    public bool IsAi => AiPersonaId.HasValue;

    private static void ValidateParticipantConstraints(Guid? userId, Guid? aiPersonaId, bool isGuest)
    {
        if (isGuest)
        {
            if (userId.HasValue || aiPersonaId.HasValue)
                throw new ChatDomainException("Guest participant cannot have a UserId or AiPersonaId.");
            return;
        }

        if ((userId == null && aiPersonaId == null) || (userId != null && aiPersonaId != null))
        {
            throw new ChatDomainException("Participant must be either User or AI, not both or neither");
        }
    }
}


public class Message : BaseAuditableEntity<Guid>
{
    public Guid ConversationId { get; private set; }
    public Guid SenderParticipantId { get; private set; }
    public MessageType Type { get; private set; }
    public MessageContent Content { get; private set; } = null!;
    public MessageStatus Status { get; private set; }
    public Guid? ReplyToMessageId { get; private set; }
    public bool IsEdited { get; private set; }

    private readonly List<Guid> _mediaIds = new();
    public IReadOnlyList<Guid> MediaIds => _mediaIds.AsReadOnly();

    private Message() { }

    public Message(Guid conversationId, Guid senderParticipantId, string content, MessageType type = MessageType.Text, Guid? replyToMessageId = null)
    {
        Id = Guid.NewGuid();
        ConversationId = conversationId;
        SenderParticipantId = senderParticipantId;
        Content = MessageContent.Create(content);
        Type = type;
        Status = MessageStatus.Sending;
        ReplyToMessageId = replyToMessageId;
        ValidateMessageConstraints();
    }

    public void UpdateStatus(MessageStatus newStatus)
    {
        if (!IsValidStatusTransition(Status, newStatus)) throw new ChatDomainException($"Invalid status transition from {Status} to {newStatus}");
        Status = newStatus;
    }

    public void EditContent(string newContent)
    {
        if (Status == MessageStatus.Failed) throw new ChatDomainException("Cannot edit failed messages");
        if (Type != MessageType.Text) throw new ChatDomainException("Can only edit text messages");
        if (Created.AddHours(24) < DateTimeOffset.UtcNow) throw new ChatDomainException("Messages can only be edited within 24 hours");
        Content = MessageContent.Create(newContent);
        IsEdited = true;
    }

    public void AddMediaAttachment(Guid mediaId)
    {
        if (mediaId == Guid.Empty) throw new ChatDomainException("Media ID cannot be empty");
        if (!_mediaIds.Contains(mediaId))
        {
            if (_mediaIds.Count >= 10) throw new ChatDomainException("Maximum 10 media attachments per message");
            _mediaIds.Add(mediaId);
        }
    }

    private void ValidateMessageConstraints()
    {
        if (ConversationId == Guid.Empty) throw new ChatDomainException("Conversation ID cannot be empty");
        if (SenderParticipantId == Guid.Empty) throw new ChatDomainException("Sender participant ID cannot be empty");
    }

    private static bool IsValidStatusTransition(MessageStatus from, MessageStatus to) => (from, to) switch
    {
        (MessageStatus.Sending, MessageStatus.Sent or MessageStatus.Failed) => true,
        (MessageStatus.Sent, MessageStatus.Delivered or MessageStatus.Failed) => true,
        (MessageStatus.Delivered, MessageStatus.Read) => true,
        (MessageStatus.Failed, MessageStatus.Sending) => true, // Retry
        _ => false
    };
}

public class AIPersona : BaseAuditableEntity<Guid>
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid? AvatarMediaId { get; private set; }
    public AiProviderType ProviderType { get; private set; }
    public string? ConfigurationJson { get; private set; }
    public bool IsActive { get; private set; } = true;

    private AIPersona() { }

    public AIPersona(string name, AiProviderType providerType, string? description = null, Guid? avatarMediaId = null, string? configurationJson = null, Guid? createdByUserId = null)
    {
        Id = Guid.NewGuid();
        UpdatePersonaDetails(name, description, avatarMediaId);
        UpdateProviderConfig(providerType, configurationJson);
    }

    public void UpdatePersonaDetails(string name, string? description = null, Guid? avatarMediaId = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ChatDomainException("AI Persona name cannot be empty");
        if (name.Length > 100) throw new ChatDomainException("AI Persona name cannot exceed 100 characters");
        Name = name.Trim();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        AvatarMediaId = avatarMediaId;
    }

    public void UpdateProviderConfig(AiProviderType providerType, string? configurationJson = null)
    {
        ProviderType = providerType;
        if (!string.IsNullOrWhiteSpace(configurationJson)) ValidateConfigurationJson(configurationJson, providerType);
        ConfigurationJson = configurationJson;
    }

    public T GetConfiguration<T>() where T : class, IAiProviderConfiguration
    {
        if (string.IsNullOrWhiteSpace(ConfigurationJson)) throw new ChatDomainException("No configuration available");
        try
        {
            var config = JsonSerializer.Deserialize<T>(ConfigurationJson);
            if (config == null || config.ProviderType != ProviderType) throw new ChatDomainException("Configuration type mismatch");
            return config;
        }
        catch (JsonException ex) { throw new ChatDomainException("Invalid configuration JSON format", ex); }
    }

    private static void ValidateConfigurationJson(string json, AiProviderType type)
    {
        try { JsonDocument.Parse(json); } catch (JsonException ex) { throw new ChatDomainException("Invalid configuration JSON", ex); }
    }
}
#endregion
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/MediaModels.cs ---
/**
 * @file MediaDomainModels.cs
 * @version 13.1.0 (Corrected UpdateMetadata Placement)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-30
 * @description Media aggregate root with i18n support. The misplaced UpdateMetadata method has been removed.
 */
using System.ComponentModel.DataAnnotations;
using RoyalCode.Domain.Common;
using RoyalCode.Domain.Enums.Media;

namespace RoyalCode.Domain.Entities.Media;

public abstract class MediaBase : BaseAuditableEntity<Guid>
{
    [Required] public MediaType Type { get; private set; }
    [MaxLength(255)] public string? TitleKeyOrText { get; private set; } // Aangepast voor i18n
    public string? Description { get; private set; }
    [Required] public string Url { get; private set; } = string.Empty;
    public string? ThumbnailUrl { get; private set; }
    public long? FileSizeBytes { get; private set; }
    [MaxLength(100)] public string? MimeType { get; private set; }
    public Guid? UploaderUserId { get; private set; }
    [MaxLength(255)] public string? OriginalFilename { get; private set; }

    // Technische metadata
    [ConcurrencyCheck] public long Version { get; protected set; }
    public MediaProcessingStatus ProcessingStatus { get; private set; }
    public DateTimeOffset? ProcessedAt { get; private set; }

    // Business metrics
    public int ViewCount { get; private set; }
    public int DownloadCount { get; private set; }
    public DateTimeOffset? LastAccessedAt { get; private set; }

    // Content policies
    public bool IsPublic { get; private set; }
    public bool IsApprovedForPublicUse { get; private set; }
    public ContentModerationStatus ModerationStatus { get; private set; }

    // CDN en optimalisatie
    public string? CdnUrl { get; private set; }
    public string? OptimizedUrl { get; private set; }
    [MaxLength(50)] public string? CdnProvider { get; private set; }

    // Metadata collecties
    private readonly List<MediaTag> _tags = new();
    public IReadOnlyCollection<MediaTag> Tags => _tags.AsReadOnly();

    private readonly List<MediaUsageReference> _usageReferences = new();
    public IReadOnlyCollection<MediaUsageReference> UsageReferences => _usageReferences.AsReadOnly();

    public bool IsProcessed => ProcessingStatus == MediaProcessingStatus.Completed;
    public bool HasThumbnail => !string.IsNullOrEmpty(ThumbnailUrl);
    public bool IsInUse => _usageReferences.Any(ur => ur.IsActive);
    public string DisplaySize => FormatFileSize(FileSizeBytes);

    private MediaBase() { }

    protected MediaBase(MediaType type, string url, Guid? uploaderId, string? titleKeyOrText = null,
        string? description = null, long? sizeBytes = null, string? mimeType = null,
        string? originalFilename = null)
    {
        if (string.IsNullOrWhiteSpace(url)) throw new ArgumentException("Media URL is required.", nameof(url));
        Id = Guid.NewGuid();
        Type = type;
        Url = url;
        UploaderUserId = uploaderId;
        TitleKeyOrText = titleKeyOrText;
        Description = description;
        FileSizeBytes = sizeBytes;
        MimeType = mimeType;
        OriginalFilename = originalFilename;
        ProcessingStatus = MediaProcessingStatus.Pending;
        ModerationStatus = ContentModerationStatus.Pending;
        IsPublic = false;
        IsApprovedForPublicUse = false;
        AddDomainEvent(new MediaUploadedEvent(Id, Type, uploaderId));
    }

    #region Content Management

    public void UpdateMetadata(string? titleKeyOrText, string? description)
    {
        var titleChanged = TitleKeyOrText != titleKeyOrText;
        var descriptionChanged = Description != description;
        TitleKeyOrText = titleKeyOrText;
        Description = description;
        Version++;
        if (titleChanged || descriptionChanged) { AddDomainEvent(new MediaMetadataUpdatedEvent(Id, titleKeyOrText, description)); }
    }

    public void SetThumbnail(string? thumbnailUrl)
    {
        if (!string.IsNullOrEmpty(thumbnailUrl) && !IsValidImageUrl(thumbnailUrl)) throw new ArgumentException("Invalid thumbnail URL format.", nameof(thumbnailUrl));
        ThumbnailUrl = thumbnailUrl;
        Version++;
        if (!string.IsNullOrEmpty(thumbnailUrl)) { AddDomainEvent(new MediaThumbnailGeneratedEvent(Id, thumbnailUrl)); }
    }
    public void UpdateFileSize(long sizeBytes)
    {
        if (sizeBytes < 0) throw new ArgumentException("File size cannot be negative.", nameof(sizeBytes));
        FileSizeBytes = sizeBytes;
        Version++;
    }
    #endregion
    #region Domain Events
    public class MediaUploadedEvent(Guid mediaId, MediaType mediaType, Guid? uploaderId) : BaseEvent { public Guid MediaId { get; } = mediaId; public MediaType MediaType { get; } = mediaType; public Guid? UploaderId { get; } = uploaderId; }
    public class MediaMetadataUpdatedEvent(Guid mediaId, string? title, string? description) : BaseEvent { public Guid MediaId { get; } = mediaId; public string? Title { get; } = title; public string? Description { get; } = description; }
    public class MediaProcessingStartedEvent(Guid mediaId, MediaType mediaType) : BaseEvent { public Guid MediaId { get; } = mediaId; public MediaType MediaType { get; } = mediaType; }
    public class MediaProcessingCompletedEvent(Guid mediaId, DateTimeOffset completedAt) : BaseEvent { public Guid MediaId { get; } = mediaId; public DateTimeOffset CompletedAt { get; } = completedAt; }
    public class MediaProcessingFailedEvent(Guid mediaId, string errorReason) : BaseEvent { public Guid MediaId { get; } = mediaId; public string ErrorReason { get; } = errorReason; }
    public class MediaThumbnailGeneratedEvent(Guid mediaId, string thumbnailUrl) : BaseEvent { public Guid MediaId { get; } = mediaId; public string ThumbnailUrl { get; } = thumbnailUrl; }
    public class MediaCdnConfiguredEvent(Guid mediaId, string cdnUrl, string? cdnProvider) : BaseEvent { public Guid MediaId { get; } = mediaId; public string CdnUrl { get; } = cdnUrl; public string? CdnProvider { get; } = cdnProvider; }
    public class MediaVisibilityChangedEvent(Guid mediaId, bool isPublic) : BaseEvent { public Guid MediaId { get; } = mediaId; public bool IsPublic { get; } = isPublic; }
    public class MediaAccessedEvent(Guid mediaId, MediaAccessType accessType, Guid? userId, string? userAgent) : BaseEvent { public Guid MediaId { get; } = mediaId; public MediaAccessType AccessType { get; } = accessType; public Guid? UserId { get; } = userId; public string? UserAgent { get; } = userAgent; }
    public class MediaModerationApprovedEvent(Guid mediaId, Guid moderatorId, string? moderatorNote) : BaseEvent { public Guid MediaId { get; } = mediaId; public Guid ModeratorId { get; } = moderatorId; public string? ModeratorNote { get; } = moderatorNote; }
    public class MediaModerationRejectedEvent(Guid mediaId, Guid moderatorId, string rejectionReason) : BaseEvent { public Guid MediaId { get; } = mediaId; public Guid ModeratorId { get; } = moderatorId; public string RejectionReason { get; } = rejectionReason; }
    public class ImageVariantAddedEvent(Guid imageId, Guid variantId, string? purpose, int? width, int? height) : BaseEvent { public Guid ImageId { get; } = imageId; public Guid VariantId { get; } = variantId; public string? Purpose { get; } = purpose; public int? Width { get; } = width; public int? Height { get; } = height; }
    public class ImageVariantRemovedEvent(Guid imageId, Guid variantId) : BaseEvent { public Guid ImageId { get; } = imageId; public Guid VariantId { get; } = variantId; }
    public class ImageColorsExtractedEvent(Guid imageId, List<string> dominantColors) : BaseEvent { public Guid ImageId { get; } = imageId; public List<string> DominantColors { get; } = dominantColors; }
    public class ImageAltTextUpdatedEvent(Guid imageId, string oldAltText, string newAltText) : BaseEvent { public Guid ImageId { get; } = imageId; public string OldAltText { get; } = oldAltText; public string NewAltText { get; } = newAltText; }
    public class VideoMetadataUpdatedEvent(Guid videoId, int? duration, int? width, int? height, VideoQuality? quality) : BaseEvent { public Guid VideoId { get; } = videoId; public int? Duration { get; } = duration; public int? Width { get; } = width; public int? Height { get; } = height; public VideoQuality? Quality { get; } = quality; }
    public class VideoStreamingConfiguredEvent(Guid videoId, string manifestUrl) : BaseEvent { public Guid VideoId { get; } = videoId; public string ManifestUrl { get; } = manifestUrl; }
    #endregion
    #region Processing Workflow
    public void StartProcessing() { if (ProcessingStatus != MediaProcessingStatus.Pending) throw new InvalidOperationException($"Cannot start processing media in {ProcessingStatus} status."); ProcessingStatus = MediaProcessingStatus.Processing; Version++; AddDomainEvent(new MediaProcessingStartedEvent(Id, Type)); }
    public void CompleteProcessing() { ProcessingStatus = MediaProcessingStatus.Completed; ProcessedAt = DateTimeOffset.UtcNow; Version++; AddDomainEvent(new MediaProcessingCompletedEvent(Id, ProcessedAt.Value)); }
    public void FailProcessing(string errorReason) { ProcessingStatus = MediaProcessingStatus.Failed; Version++; AddDomainEvent(new MediaProcessingFailedEvent(Id, errorReason)); }
    #endregion
    #region CDN and Optimization
    public void SetCdnConfiguration(string cdnUrl, string? cdnProvider = null) { if (string.IsNullOrWhiteSpace(cdnUrl)) throw new ArgumentException("CDN URL is required.", nameof(cdnUrl)); CdnUrl = cdnUrl; CdnProvider = cdnProvider; Version++; AddDomainEvent(new MediaCdnConfiguredEvent(Id, cdnUrl, cdnProvider)); }
    public void SetOptimizedUrl(string optimizedUrl) { if (string.IsNullOrWhiteSpace(optimizedUrl)) throw new ArgumentException("Optimized URL is required.", nameof(optimizedUrl)); OptimizedUrl = optimizedUrl; Version++; }
    public string GetDeliveryUrl() { if (!string.IsNullOrEmpty(CdnUrl)) return CdnUrl; if (!string.IsNullOrEmpty(OptimizedUrl)) return OptimizedUrl; return Url; }
    #endregion
    #region Access Control and Moderation
    public void SetVisibility(bool isPublic) { if (isPublic && ModerationStatus != ContentModerationStatus.Approved) throw new InvalidOperationException("Media must be approved before making it public."); IsPublic = isPublic; Version++; AddDomainEvent(new MediaVisibilityChangedEvent(Id, isPublic)); }
    public void ApproveModerationStatus(Guid moderatorId, string? moderatorNote = null) { ModerationStatus = ContentModerationStatus.Approved; IsApprovedForPublicUse = true; Version++; AddDomainEvent(new MediaModerationApprovedEvent(Id, moderatorId, moderatorNote)); }
    public void RejectModerationStatus(Guid moderatorId, string rejectionReason) { if (string.IsNullOrWhiteSpace(rejectionReason)) throw new ArgumentException("Rejection reason is required.", nameof(rejectionReason)); ModerationStatus = ContentModerationStatus.Rejected; IsApprovedForPublicUse = false; IsPublic = false; Version++; AddDomainEvent(new MediaModerationRejectedEvent(Id, moderatorId, rejectionReason)); }
    #endregion
    #region Usage Tracking
    public void RecordAccess(MediaAccessType accessType, Guid? userId = null, string? userAgent = null) { switch (accessType) { case MediaAccessType.View: ViewCount++; break; case MediaAccessType.Download: DownloadCount++; break; } LastAccessedAt = DateTimeOffset.UtcNow; Version++; AddDomainEvent(new MediaAccessedEvent(Id, accessType, userId, userAgent)); }
    public void AddUsageReference(Guid entityId, string entityType, string? context = null) { var existingReference = _usageReferences.FirstOrDefault(ur => ur.EntityId == entityId && ur.EntityType == entityType); if (existingReference == null) { _usageReferences.Add(new MediaUsageReference(Id, entityId, entityType, context)); Version++; } }
    public void RemoveUsageReference(Guid entityId, string entityType) { var reference = _usageReferences.FirstOrDefault(ur => ur.EntityId == entityId && ur.EntityType == entityType); if (reference != null) { reference.Deactivate(); Version++; } }
    #endregion
    #region Tag Management
    public void AddTag(string tagName, MediaTagType tagType = MediaTagType.Custom) { if (string.IsNullOrWhiteSpace(tagName)) return; var normalizedTag = tagName.Trim().ToLowerInvariant(); if (!_tags.Any(t => t.Name.Equals(normalizedTag, StringComparison.OrdinalIgnoreCase))) { _tags.Add(new MediaTag(normalizedTag, tagType)); Version++; } }
    public void RemoveTag(string tagName) { if (string.IsNullOrWhiteSpace(tagName)) return; var normalizedTag = tagName.Trim().ToLowerInvariant(); var tag = _tags.FirstOrDefault(t => t.Name.Equals(normalizedTag, StringComparison.OrdinalIgnoreCase)); if (tag != null) { _tags.Remove(tag); Version++; } }
    public void AddTags(IEnumerable<string> tagNames, MediaTagType tagType = MediaTagType.Custom) { foreach (var tagName in tagNames) { AddTag(tagName, tagType); } }
    #endregion
    #region Business Logic
    public bool CanBeDeleted() => !IsInUse && ModerationStatus != ContentModerationStatus.Pending;
    public int GetQualityScore() { var score = 0; if (!string.IsNullOrWhiteSpace(TitleKeyOrText)) score += 20; if (!string.IsNullOrWhiteSpace(Description)) score += 15; if (IsProcessed) score += 25; if (HasThumbnail) score += 10; if (ViewCount > 0) score += Math.Min(ViewCount / 10, 20); if (_tags.Any()) score += Math.Min(_tags.Count * 2, 10); return Math.Min(score, 100); }
    public bool IsReadyForPublicUse() => IsProcessed && IsApprovedForPublicUse && ModerationStatus == ContentModerationStatus.Approved;
    #endregion
    #region Helper Methods
    private static string FormatFileSize(long? bytes) { if (!bytes.HasValue) return "Unknown"; string[] sizes = { "B", "KB", "MB", "GB", "TB" }; double len = bytes.Value; int order = 0; while (len >= 1024 && order < sizes.Length - 1) { order++; len /= 1024; } return $"{len:0.##} {sizes[order]}"; }
    private static bool IsValidImageUrl(string url) { var imageExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" }; return imageExtensions.Any(ext => url.EndsWith(ext, StringComparison.OrdinalIgnoreCase)); }
    #endregion
}
#region Concrete Media Implementations
public sealed class ImageMedia : MediaBase
{
    [Required, MaxLength(500)] public string AltTextKeyOrText { get; private set; } // Aangepast voor i18n
    public ImageSourceType? SourceType { get; private set; }
    public string? AiGenerationPrompt { get; private set; }
    private readonly List<ImageVariant> _variants = new();
    public IReadOnlyCollection<ImageVariant> Variants => _variants.AsReadOnly();
    private readonly List<string> _dominantColorsHex = new();
    public IReadOnlyCollection<string> DominantColorsHex => _dominantColorsHex.AsReadOnly();
    public ImageDimensions? OriginalDimensions { get; private set; }
    public bool HasDominantColors => _dominantColorsHex.Any();
    public bool HasVariants => _variants.Any();
    public bool IsAiGenerated => SourceType == ImageSourceType.AiGenerated;
    private ImageMedia() : base(MediaType.Image, "EF_NEEDS_A_URL", null) { AltTextKeyOrText = "EF_NEEDS_A_VALUE"; }
    public ImageMedia(string masterUrl, string altTextKeyOrText, Guid? uploaderId, string? titleKeyOrText = null, ImageSourceType? sourceType = null, string? aiGenerationPrompt = null, long? sizeBytes = null, string? mimeType = null, string? originalFilename = null) : base(MediaType.Image, masterUrl, uploaderId, titleKeyOrText, null, sizeBytes, mimeType, originalFilename)
    {
        if (string.IsNullOrWhiteSpace(altTextKeyOrText)) throw new ArgumentException("Alt text (of key) is verplicht voor een afbeelding.", nameof(altTextKeyOrText));
        AltTextKeyOrText = altTextKeyOrText;
        SourceType = sourceType;
        AiGenerationPrompt = aiGenerationPrompt;
    }
    public void AddVariant(ImageVariant variant) { if (variant == null) throw new ArgumentNullException(nameof(variant)); if (_variants.Any(v => v.Purpose == variant.Purpose && v.Width == variant.Width)) throw new InvalidOperationException("Een variant met hetzelfde doel en breedte bestaat al."); _variants.Add(variant); Version++; AddDomainEvent(new ImageVariantAddedEvent(Id, variant.Id, variant.Purpose, variant.Width, variant.Height)); }
    public void RemoveVariant(Guid variantId) { var variant = _variants.FirstOrDefault(v => v.Id == variantId); if (variant != null) { _variants.Remove(variant); Version++; AddDomainEvent(new ImageVariantRemovedEvent(Id, variantId)); } }
    public void SetDominantColors(IEnumerable<string> colors) { _dominantColorsHex.Clear(); foreach (var color in colors) { if (IsValidHexColor(color)) _dominantColorsHex.Add(color); } Version++; if (_dominantColorsHex.Any()) { AddDomainEvent(new ImageColorsExtractedEvent(Id, _dominantColorsHex.ToList())); } }
    public void SetOriginalDimensions(int width, int height) { if (width <= 0 || height <= 0) throw new ArgumentException("Dimensies moeten positief zijn"); OriginalDimensions = new ImageDimensions(width, height); Version++; }
    public void UpdateAltText(string newAltTextKeyOrText)
    {
        if (string.IsNullOrWhiteSpace(newAltTextKeyOrText))
            throw new ArgumentException("Alt text kan niet leeg zijn.", nameof(newAltTextKeyOrText));

        var oldAltText = AltTextKeyOrText;
        AltTextKeyOrText = newAltTextKeyOrText;
        Version++;

        AddDomainEvent(new ImageAltTextUpdatedEvent(Id, oldAltText, newAltTextKeyOrText));
    }
    public ImageVariant? GetBestVariant(int targetWidth) => _variants.Where(v => v.Width >= targetWidth).OrderBy(v => v.Width).FirstOrDefault() ?? _variants.OrderByDescending(v => v.Width).FirstOrDefault();
    private static bool IsValidHexColor(string color) => !string.IsNullOrEmpty(color) && color.StartsWith("#") && color.Length == 7 && color.Skip(1).All(c => char.IsDigit(c) || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f'));
}
public sealed class VideoMedia : MediaBase
{
    public int? DurationSeconds { get; private set; }
    public int? Width { get; private set; }
    public int? Height { get; private set; }
    public string? PosterImageUrl { get; private set; }
    public VideoQuality? Quality { get; private set; }
    public int? Bitrate { get; private set; }
    public decimal? FrameRate { get; private set; }
    public bool IsStreamingOptimized { get; private set; }
    public string? StreamingManifestUrl { get; private set; }
    public string FormattedDuration => FormatDuration(DurationSeconds);
    public string Resolution => Width.HasValue && Height.HasValue ? $"{Width}x{Height}" : "Unknown";
    public bool HasPoster => !string.IsNullOrEmpty(PosterImageUrl);
    private VideoMedia() : base(MediaType.Video, "EF_NEEDS_A_URL", null) { }
    public VideoMedia(string url, Guid? uploaderId, int? duration = null, string? title = null, int? width = null, int? height = null, string? posterImageUrl = null) : base(MediaType.Video, url, uploaderId, title) { DurationSeconds = duration; Width = width; Height = height; PosterImageUrl = posterImageUrl; }
    public void UpdateVideoMetadata(int? duration, int? width, int? height, string? posterImageUrl, VideoQuality? quality = null, int? bitrate = null, decimal? frameRate = null) { DurationSeconds = duration; Width = width; Height = height; PosterImageUrl = posterImageUrl; Quality = quality; Bitrate = bitrate; FrameRate = frameRate; Version++; AddDomainEvent(new VideoMetadataUpdatedEvent(Id, duration, width, height, quality)); }
    public void SetStreamingConfiguration(string manifestUrl) { if (string.IsNullOrWhiteSpace(manifestUrl)) throw new ArgumentException("Manifest URL is verplicht.", nameof(manifestUrl)); StreamingManifestUrl = manifestUrl; IsStreamingOptimized = true; Version++; AddDomainEvent(new VideoStreamingConfiguredEvent(Id, manifestUrl)); }
    private static string FormatDuration(int? seconds) { if (!seconds.HasValue) return "Unknown"; var timeSpan = TimeSpan.FromSeconds(seconds.Value); return timeSpan.TotalHours >= 1 ? timeSpan.ToString(@"h\:mm\:ss") : timeSpan.ToString(@"m\:ss"); }
}
#endregion
#region Supporting Entities
public class ImageVariant : BaseAuditableEntity<Guid>
{
    [Required] public string Url { get; private set; } = string.Empty;
    public int? Width { get; private set; }
    public int? Height { get; private set; }
    [MaxLength(10)] public string? Format { get; private set; }
    [MaxLength(50)] public string? Purpose { get; private set; }
    public long? FileSizeBytes { get; private set; }
    public int? Quality { get; private set; }
    public string Resolution => Width.HasValue && Height.HasValue ? $"{Width}x{Height}" : "Unknown";
    public string DisplaySize => FormatFileSize(FileSizeBytes);
    private ImageVariant() { }
    public ImageVariant(string url, int width, int height, string format, string purpose, long? sizeBytes = null, int? quality = null) { if (string.IsNullOrWhiteSpace(url)) throw new ArgumentException("Variant URL is verplicht.", nameof(url)); if (width <= 0 || height <= 0) throw new ArgumentException("Dimensies moeten positief zijn"); Id = Guid.NewGuid(); Url = url; Width = width; Height = height; Format = format; Purpose = purpose; FileSizeBytes = sizeBytes; Quality = quality; }
    private static string FormatFileSize(long? bytes) { if (!bytes.HasValue) return "Unknown"; string[] sizes = { "B", "KB", "MB", "GB" }; double len = bytes.Value; int order = 0; while (len >= 1024 && order < sizes.Length - 1) { order++; len /= 1024; } return $"{len:0.##} {sizes[order]}"; }
}
public class MediaTag : BaseAuditableEntity<Guid>
{
    [Required, MaxLength(50)] public string Name { get; private set; } = string.Empty;
    public MediaTagType TagType { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    private MediaTag() { }
    public MediaTag(string name, MediaTagType tagType) { if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Tag naam is verplicht.", nameof(name)); Id = Guid.NewGuid(); Name = name.Trim().ToLowerInvariant(); TagType = tagType; CreatedAt = DateTimeOffset.UtcNow; }
}
public class MediaUsageReference : BaseAuditableEntity<Guid>
{
    [Required] public Guid MediaId { get; private set; }
    [Required] public Guid EntityId { get; private set; }
    [Required, MaxLength(100)] public string EntityType { get; private set; } = string.Empty;
    [MaxLength(200)] public string? Context { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? DeactivatedAt { get; private set; }
    private MediaUsageReference() { }
    public MediaUsageReference(Guid mediaId, Guid entityId, string entityType, string? context = null) { Id = Guid.NewGuid(); MediaId = mediaId; EntityId = entityId; EntityType = entityType; Context = context; IsActive = true; CreatedAt = DateTimeOffset.UtcNow; }
    public void Deactivate() { IsActive = false; DeactivatedAt = DateTimeOffset.UtcNow; }
}
#endregion
// --- EINDE VERVANGING ---
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/Order.cs ---
/**
 * @file OrderModels.cs
 * @Version 3.3.0 (FINAL - Corrected Constructor & Shipping Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description The complete domain model for the Order aggregate, with collections for Fulfillments, History, InternalNotes, and Refunds.
 *              Includes robust methods for item management and address updates. Corrected constructor for better domain encapsulation.
 */
using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Ardalis.GuardClauses;
using RoyalCode.Domain.Entities.Shipping; // <-- DE FIX: NIEUWE USING
using RoyalCode.Domain.Entities.User; // Voor AddressSnapshot
using RoyalCode.Domain.Enums;
using RoyalCode.Domain.Enums.Product;


namespace RoyalCode.Domain.Entities.Order;
public class Order : BaseAuditableEntity<Guid>
{
    public Guid UserId { get; private set; }
    public string CustomerEmail { get; private set; } = string.Empty;
    public string OrderNumber { get; private set; } = string.Empty;
    public DateTimeOffset OrderDate { get; private set; }
    public OrderStatus Status { get; private set; }
    public AddressSnapshot ShippingAddress { get; private set; } = null!;
    public AddressSnapshot BillingAddress { get; private set; } = null!;
    public ShippingDetails ShippingDetails { get; private set; } = null!;
    public PaymentDetails PaymentDetails { get; private set; } = null!;
    public decimal SubTotal { get; private set; }
    public decimal ShippingCost { get; private set; } = 0m; // Default naar 0, wordt door methode ingesteld
    public decimal TaxAmount { get; private set; } = 0m;
    public decimal DiscountAmount { get; private set; } = 0m;
    public decimal GrandTotal { get; private set; }
    [MaxLength(3)] public string Currency { get; private set; } = "EUR";
    [MaxLength(1000)] public string? CustomerNotes { get; private set; }

    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    private readonly List<OrderFulfillment> _fulfillments = new();
    public IReadOnlyCollection<OrderFulfillment> Fulfillments => _fulfillments.AsReadOnly();
    private readonly List<OrderHistory> _history = new();
    public IReadOnlyCollection<OrderHistory> History => _history.AsReadOnly();
    private readonly List<OrderInternalNote> _internalNotes = new();
    public IReadOnlyCollection<OrderInternalNote> InternalNotes => _internalNotes.AsReadOnly();
    private readonly List<OrderRefund> _refunds = new();
    public IReadOnlyCollection<OrderRefund> Refunds => _refunds.AsReadOnly();

    private Order() { }

    // --- DE FIX: HERSTELDE CONSTRUCTOR ---
    // De ShippingMethodId is GEEN constructorparameter meer.
    // De ApplyShippingMethod zal de ShippingDetails en ShippingCost instellen.
    public Order(Guid userId, string customerEmail, Address shippingAddress, Address billingAddress, string paymentMethod)
    {
        Guard.Against.Default(userId, nameof(userId));
        Guard.Against.NullOrWhiteSpace(customerEmail, nameof(customerEmail));
        Guard.Against.Null(shippingAddress, nameof(shippingAddress));
        Guard.Against.Null(billingAddress, nameof(billingAddress));
        Guard.Against.NullOrWhiteSpace(paymentMethod, nameof(paymentMethod));

        Id = Guid.NewGuid();
        UserId = userId;
        CustomerEmail = customerEmail;
        OrderDate = DateTimeOffset.UtcNow;
        OrderNumber = $"{OrderDate:yyyyMMdd}-{Id.ToString("N")[..8].ToUpper()}";
        Status = OrderStatus.PendingPayment;
        ShippingAddress = AddressSnapshot.FromAddress(shippingAddress);
        BillingAddress = AddressSnapshot.FromAddress(billingAddress);
        // ShippingDetails is een placeholder, wordt overschreven door ApplyShippingMethod
        ShippingDetails = new ShippingDetails("Not Applied", 0m, null, null, null, null);
        PaymentDetails = new PaymentDetails(paymentMethod, Guid.NewGuid().ToString(), "pending");
        ShippingCost = 0m; // Initialiseer naar 0
        RecalculateTotals();
    }

    // --- DE FIX: Publieke methode om verzending in te stellen (zoals eerder gedefinieerd) ---
    public void ApplyShippingMethod(ShippingMethod method, ShippingRate rate, Func<string, int> estimatedDaysConverter)
    {
        Guard.Against.Null(method, nameof(method));
        Guard.Against.Null(rate, nameof(rate));
        Guard.Against.Null(estimatedDaysConverter, nameof(estimatedDaysConverter));

        ShippingDetails = new ShippingDetails(
            method.Name,
            rate.Cost,
            null, // Tracking initially null
            null, // Tracking initially null
            null, // Shipped date initially null
            method.EstimatedDeliveryTime != null ? (DateTimeOffset?)DateTimeOffset.UtcNow.AddDays(estimatedDaysConverter(method.EstimatedDeliveryTime)) : null
        );
        ShippingCost = rate.Cost;
        RecalculateTotals();
    }


    public void RecalculateTotals()
    {
        SubTotal = _items.Sum(i => i.LineTotal);
        TaxAmount = _items.Sum(i => i.TaxAmount ?? 0m);
        DiscountAmount = _items.Sum(i => i.DiscountAmount ?? 0m);
        GrandTotal = SubTotal + ShippingCost + TaxAmount - DiscountAmount;
    }

    public void UpdateStatus(OrderStatus newStatus) => Status = newStatus;
    public void UpdateCustomerNotes(string? notes) => CustomerNotes = notes;
    public void UpdateShippingAddress(AddressSnapshot newAddress) => ShippingAddress = Guard.Against.Null(newAddress, nameof(newAddress));
    public void UpdateBillingAddress(AddressSnapshot newAddress) => BillingAddress = Guard.Against.Null(newAddress, nameof(newAddress));
    public void AddHistoryEvent(string eventType, string author, string description) => _history.Add(new OrderHistory(Id, eventType, author, description));
    public void AddInternalNote(string authorName, string text) => _internalNotes.Add(new OrderInternalNote(Id, authorName, text));
    public void AddRefund(OrderRefund refund) => _refunds.Add(Guard.Against.Null(refund, nameof(refund)));
    public void AddFulfillment(OrderFulfillment fulfillment) => _fulfillments.Add(Guard.Against.Null(fulfillment, nameof(fulfillment)));

    public void AddTrackingInformation(string trackingNumber, string? trackingUrl, DateTimeOffset? shippedDate, DateTimeOffset? estimatedDeliveryDate)
    {
        if (Status != OrderStatus.AwaitingFulfillment && Status != OrderStatus.Processing)
            throw new DomainException("Tracking information can only be added to orders that are awaiting or in process of fulfillment.", "INVALID_ORDER_STATE_FOR_TRACKING");

        ShippingDetails = ShippingDetails with
        {
            TrackingNumber = trackingNumber,
            TrackingUrl = trackingUrl,
            ShippedDate = shippedDate ?? DateTimeOffset.UtcNow,
            EstimatedDeliveryDate = estimatedDeliveryDate
        };
        Status = OrderStatus.Shipped;
    }

    public void AddItems(List<OrderItem> items)
    {
        _items.AddRange(Guard.Against.NullOrEmpty(items, nameof(items)));
        RecalculateTotals();
    }

    public void RemoveItem(Guid orderItemId)
    {
        var itemToRemove = _items.FirstOrDefault(i => i.Id == orderItemId);
        if (itemToRemove != null)
        {
            _items.Remove(itemToRemove);
            RecalculateTotals();
        }
    }
}

// --- CHILD ENTITY ---
public class OrderItem : BaseEntity<Guid>
{
    public Guid OrderId { get; private set; }
    public Order Order { get; private set; } = null!;
    public Guid ProductId { get; private set; }
    public Guid? ProductVariantId { get; private set; }
    public int Quantity { get; private set; }
    [MaxLength(255)] public string ProductName { get; private set; } = string.Empty;
    [MaxLength(100)] public string? Sku { get; private set; }
    public ProductType ProductType { get; private set; }
    public decimal PricePerItem { get; private set; }
    [MaxLength(2048)] public string? ProductImageUrl { get; private set; }
    public decimal LineTotal { get; private set; }
    public decimal? TaxAmount { get; private set; }
    public decimal? DiscountAmount { get; private set; }
    [MaxLength(2000)] public string? VariantInfoJson { get; private set; }

    private OrderItem() { }

    public OrderItem(Guid orderId, Guid productId, Guid? productVariantId, int quantity, string productName, string? sku, ProductType productType, decimal pricePerItem, string? productImageUrl, decimal? taxAmount, decimal? discountAmount, string? variantInfoJson)
    {
        Guard.Against.Default(orderId, nameof(orderId));
        Guard.Against.Default(productId, nameof(productId));
        Guard.Against.NegativeOrZero(quantity, nameof(quantity));
        Guard.Against.NullOrWhiteSpace(productName, nameof(productName));
        Guard.Against.Negative(pricePerItem, nameof(pricePerItem));

        Id = Guid.NewGuid();
        OrderId = orderId;
        ProductId = productId;
        ProductVariantId = productVariantId;
        Quantity = quantity;
        ProductName = productName;
        Sku = sku;
        ProductType = productType;
        PricePerItem = pricePerItem;
        ProductImageUrl = productImageUrl;
        TaxAmount = taxAmount;
        DiscountAmount = discountAmount;
        VariantInfoJson = variantInfoJson;
        LineTotal = pricePerItem * quantity;
    }

    public void UpdateQuantity(int newQuantity)
    {
        Guard.Against.NegativeOrZero(newQuantity, nameof(newQuantity));
        Quantity = newQuantity;
        LineTotal = PricePerItem * newQuantity;
    }
}


// Dit model representeert een enkel variant attribuut in de JSON.
public class OrderItemVariantAttribute
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public VariantAttributeType AttributeType { get; set; } = VariantAttributeType.Custom;
    public string DisplayName { get; set; } = string.Empty;
    public string? Value { get; set; }
    public string? ColorHex { get; set; }
}


public class OrderFulfillment : BaseAuditableEntity<Guid>
{
    public Guid OrderId { get; private set; }
    public string Status { get; private set; } = "fulfilled"; // Kan later uitgebreid worden
    public string CarrierName { get; private set; } = string.Empty;
    [MaxLength(100)] public string? TrackingNumber { get; private set; }
    [MaxLength(2048)] public string? TrackingUrl { get; private set; }
    public DateTimeOffset? ShippedDate { get; private set; }
    public DateTimeOffset? EstimatedDeliveryDate { get; private set; }

    private readonly List<OrderFulfillmentItem> _items = new();
    public IReadOnlyCollection<OrderFulfillmentItem> Items => _items.AsReadOnly();

    private OrderFulfillment() { }

    public OrderFulfillment(Guid orderId, string carrierName, string? trackingNumber, string? trackingUrl, DateTimeOffset? shippedDate, List<OrderFulfillmentItem> items)
    {
        Id = Guid.NewGuid();
        OrderId = orderId;
        CarrierName = carrierName;
        TrackingNumber = trackingNumber;
        TrackingUrl = trackingUrl;
        ShippedDate = shippedDate ?? DateTimeOffset.UtcNow;
        _items.AddRange(items);
    }
}

public class OrderFulfillmentItem : BaseEntity<Guid>
{
    public Guid FulfillmentId { get; private set; }
    public Guid OrderItemId { get; private set; }
    public int Quantity { get; private set; }

    private OrderFulfillmentItem() { }

    public OrderFulfillmentItem(Guid orderItemId, int quantity)
    {
        Id = Guid.NewGuid();
        OrderItemId = orderItemId;
        Quantity = quantity;
    }
}

public class OrderHistory : BaseEntity<Guid>
{
    public Guid OrderId { get; private set; }
    public DateTimeOffset Timestamp { get; private set; }
    public string EventType { get; private set; } = string.Empty;
    [MaxLength(255)] public string Author { get; private set; } = string.Empty; // Kan 'System', 'Customer', of admin naam zijn
    public string Description { get; private set; } = string.Empty;

    private OrderHistory() { }

    public OrderHistory(Guid orderId, string eventType, string author, string description)
    {
        Id = Guid.NewGuid();
        OrderId = orderId;
        Timestamp = DateTimeOffset.UtcNow;
        EventType = eventType;
        Author = author;
        Description = description;
    }
}

public class OrderInternalNote : BaseAuditableEntity<Guid>
{
    public Guid OrderId { get; private set; }
    [MaxLength(255)] public string AuthorName { get; private set; } = string.Empty;
    public string Text { get; private set; } = string.Empty;

    private OrderInternalNote() { }

    public OrderInternalNote(Guid orderId, string authorName, string text)
    {
        Id = Guid.NewGuid();
        OrderId = orderId;
        AuthorName = authorName;
        Text = text;
    }
}

public class OrderRefund : BaseAuditableEntity<Guid>
{
    public Guid OrderId { get; private set; }
    public decimal Amount { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public DateTimeOffset RefundedAt { get; private set; }
    [MaxLength(255)] public string ProcessedBy { get; private set; } = string.Empty; // Admin naam
    [MaxLength(255)] public string GatewayRefundId { get; private set; } = string.Empty;

    private OrderRefund() { }

    public OrderRefund(Guid orderId, decimal amount, string reason, string processedBy, string gatewayRefundId)
    {
        Id = Guid.NewGuid();
        OrderId = orderId;
        Amount = amount;
        Reason = reason;
        RefundedAt = DateTimeOffset.UtcNow;
        ProcessedBy = processedBy;
        GatewayRefundId = gatewayRefundId;
    }
}



// --- VALUE OBJECTS (met meer details) ---
public record AddressSnapshot(string Street, string HouseNumber, string? AddressAddition, string City, string PostalCode, string CountryCode, string? ContactName)
{
    public static AddressSnapshot FromAddress(Address address) =>
        new(address.Street, address.HouseNumber, address.AddressAddition, address.City, address.PostalCode, address.CountryCode, address.ContactName);
}

// Uitgebreide ShippingDetails
public record ShippingDetails(string MethodName, decimal Cost, string? TrackingNumber, string? TrackingUrl, DateTimeOffset? ShippedDate, DateTimeOffset? EstimatedDeliveryDate);

// Uitgebreide PaymentDetails
public record PaymentDetails(string MethodFriendlyName, string GatewayTransactionId, string PaymentStatus); // paymentStatus als string om frontend enum te matchen
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/Permissions.cs ---
/**
 * @file Permissions.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Defines all application permissions as constants. This is the single source of truth.
 */
using System.ComponentModel;
using System.Reflection;

namespace RoyalCode.Domain.Constants;

public static class Permissions
{
    [Description("Bekijk alle gebruikers")]
    public const string UsersView = "Permissions.Users.View";
    [Description("Maak nieuwe gebruikers aan")]
    public const string UsersCreate = "Permissions.Users.Create";
    [Description("Bewerk gebruikersinformatie")]
    public const string UsersEdit = "Permissions.Users.Edit";
    [Description("Verwijder gebruikers")]
    public const string UsersDelete = "Permissions.Users.Delete";

    [Description("Bekijk alle producten")]
    public const string ProductsView = "Permissions.Products.View";
    [Description("Maak nieuwe producten aan")]
    public const string ProductsCreate = "Permissions.Products.Create";
    [Description("Bewerk producten")]
    public const string ProductsEdit = "Permissions.Products.Edit";
    [Description("Verwijder producten")]
    public const string ProductsDelete = "Permissions.Products.Delete";

    public static List<(string ClaimValue, string Description)> GetAll()
    {
        return typeof(Permissions).GetFields(BindingFlags.Public | BindingFlags.Static)
            .Where(f => f.IsLiteral && !f.IsInitOnly)
            .Select(f => (
                f.GetValue(null)?.ToString() ?? "",
                f.GetCustomAttribute<DescriptionAttribute>()?.Description ?? f.Name
            ))
            .Where(p => !string.IsNullOrEmpty(p.Item1))
            .ToList();
    }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/ProductDomainModels.cs ---
/**
 * @file ProductDomainModels.cs
 * @version 19.0.0 (Definitive Concurrency Fix - Granular Collection Sync - Final)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-09-04
 * @description Definitive product aggregate root and related entities,
 *              implementing granular collection synchronization for robust concurrency handling.
 *              This version provides methods for generating desired states and for updating
 *              child entities from a desired state, letting the application layer manage
 *              the EF Core change tracking.
 */

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Domain.Entities.Product;

public enum CustomAttributeType { Integer, Boolean, String }
public enum CustomAttributeUIType { Slider, Toggle, TextInput }

public abstract class ProductBase : BaseAuditableEntity<Guid>
{
    [Required] public ProductType Type { get; private set; }
    [Required, MaxLength(255)] public string Name { get; private set; } = string.Empty;
    [MaxLength(300)] public string? Slug { get; private set; }
    [MaxLength(500)] public string? ShortDescription { get; private set; }
    public string Description { get; private set; } = string.Empty;
    [MaxLength(3)] public string? Currency { get; private set; }
    [MaxLength(300)]
    public string? SeoTitle { get; private set; }

    [MaxLength(500)]
    public string? SeoDescription { get; private set; }

    public string? SeoKeywordsJson { get; private set; } // Opgeslagen als JSON string

    [MaxLength(2048)]
    public string? SeoImageUrl { get; private set; }

    // Media and categorization collections
    private readonly List<Guid> _mediaIds = new();
    public IReadOnlyCollection<Guid> MediaIds => _mediaIds.AsReadOnly();
    private readonly List<Guid> _categoryIds = new();
    public IReadOnlyCollection<Guid> CategoryIds => _categoryIds.AsReadOnly();
    private readonly List<string> _tags = new();
    public IReadOnlyCollection<string> Tags => _tags.AsReadOnly();
    private readonly List<Guid> _relatedProductIds = new();
    public IReadOnlyCollection<Guid> RelatedProductIds => _relatedProductIds.AsReadOnly();

    // Product variations and attributes
    private readonly List<ProductAttributeAssignment> _attributeAssignments = new();
    public IReadOnlyCollection<ProductAttributeAssignment> AttributeAssignments => _attributeAssignments.AsReadOnly();
    private readonly List<ProductVariantCombination> _variantCombinations = new();
    public IReadOnlyCollection<ProductVariantCombination> VariantCombinations => _variantCombinations.AsReadOnly();

    // Business metrics and state
    [Range(1.0, 5.0)] public decimal? AverageRating { get; private set; }
    public int ReviewCount { get; private set; }
    public int TotalSalesCount { get; private set; }
    public int ViewCount { get; private set; }
    [Required] public ProductStatus Status { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsFeatured { get; private set; }
    public DateTimeOffset? PublishedAt { get; private set; }
    public DateTimeOffset? ArchivedAt { get; private set; }

    // Technical metadata
    public long Version { get; protected set; }
    public string? CustomAttributesJson { get; private set; }
    [MaxLength(50)] public string? AppScope { get; private set; }
    public Guid? FeaturedImageId { get; private set; }
    [Timestamp] public byte[]? RowVersion { get; private set; }


    private ProductBase() { }

    protected ProductBase(ProductType type, string name, string description, string? appScope, string? currency = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Product name is required.", nameof(name));
        Id = Guid.NewGuid();
        Type = type;
        Name = name;
        Description = description;
        AppScope = appScope;
        Currency = currency;
        Status = ProductStatus.Draft;
        IsActive = true;
        Version = 1;
    }

    public void IncrementVersion() => Version++;
    public void UpdateBasicInfo(string name, string description)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        Name = name;
        Description = description;
        IncrementVersion();
    }

    public void Publish()
    {
        if (Status != ProductStatus.Draft)
            throw new InvalidOperationException($"Cannot publish product in {Status} status. Only Draft products can be published.");

        Status = ProductStatus.Published;
        PublishedAt = DateTimeOffset.UtcNow;
        IncrementVersion();
    }

    public void Archive()
    {
        Status = ProductStatus.Archived;
        ArchivedAt = DateTimeOffset.UtcNow;
        IsActive = false;
        IncrementVersion();
    }

    #region Collection Management (NU ALLEEN TOEVOEGEN/VERWIJDEREN, geen complexe Sync meer)

    /// <summary>
    /// Adds a media ID to the product's internal media collection.
    /// </summary>
    /// <param name="mediaId">The ID of the media to add.</param>
    public void AddMedia(Guid mediaId)
    {
        if (_mediaIds.Contains(mediaId)) return;
        _mediaIds.Add(mediaId);
        IncrementVersion();
    }

    /// <summary>
    /// Removes a media ID from the product's internal media collection.
    /// </summary>
    /// <param name="mediaId">The ID of the media to remove.</param>
    public void RemoveMedia(Guid mediaId)
    {
        if (_mediaIds.Remove(mediaId)) IncrementVersion();
    }

    /// <summary>
    /// Clears all media IDs from the product's internal media collection.
    /// </summary>
    public void ClearMediaIds()
    {
        if (_mediaIds.Any())
        {
            _mediaIds.Clear();
            IncrementVersion();
        }
    }

    /// <summary>
    /// Adds a tag to the product's internal tags collection.
    /// </summary>
    /// <param name="tag">The tag to add.</param>
    public void AddTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var normalizedTag = tag.Trim().ToLowerInvariant();
        if (!_tags.Contains(normalizedTag))
        {
            _tags.Add(normalizedTag);
            IncrementVersion();
        }
    }

    /// <summary>
    /// Removes a tag from the product's internal tags collection.
    /// </summary>
    /// <param name="tag">The tag to remove.</param>
    public void RemoveTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var normalizedTag = tag.Trim().ToLowerInvariant();
        if (_tags.Remove(normalizedTag)) IncrementVersion();
    }

    /// <summary>
    /// Clears all tags from the product's internal tags collection.
    /// </summary>
    public void ClearTags()
    {
        if (_tags.Any())
        {
            _tags.Clear();
            IncrementVersion();
        }
    }

    /// <summary>
    /// Adds a category ID to the product's internal category collection.
    /// </summary>
    /// <param name="categoryId">The ID of the category to add.</param>
    public void AddCategory(Guid categoryId)
    {
        if (!_categoryIds.Contains(categoryId))
        {
            _categoryIds.Add(categoryId);
            IncrementVersion();
        }
    }

    /// <summary>
    /// Clears all category IDs from the product's internal category collection.
    /// </summary>
    public void ClearCategoryIds()
    {
        if (_categoryIds.Any())
        {
            _categoryIds.Clear();
            IncrementVersion();
        }
    }

    public void SetCategories(IEnumerable<Guid> categoryIds)
    {
        // Wis eerst de bestaande categorieën
        if (_categoryIds.Any())
        {
            _categoryIds.Clear();
        }

        // Voeg nieuwe categorieën toe
        foreach (var categoryId in categoryIds)
        {
            AddCategory(categoryId);
        }
        IncrementVersion(); // Verhoog de versie als er wijzigingen waren
    }


    /// <summary>
    /// Adds a single attribute assignment to the product's internal assignments collection.
    /// Used primarily for initial seeding or simple additions.
    /// </summary>
    /// <param name="assignment">The attribute assignment to add.</param>
    public void AddAttributeAssignment(ProductAttributeAssignment assignment)
    {
        if (assignment == null) throw new ArgumentNullException(nameof(assignment));
        if (!_attributeAssignments.Any(a => a.AttributeValueId == assignment.AttributeValueId))
        {
            _attributeAssignments.Add(assignment);
            IncrementVersion();
        }
    }

    /// <summary>
    /// Adds multiple attribute assignments to the product's internal assignments collection.
    /// </summary>
    /// <param name="assignments">The collection of attribute assignments to add.</param>
    public void AddAttributeAssignments(IEnumerable<ProductAttributeAssignment> assignments)
    {
        bool changed = false;
        foreach (var assignment in assignments)
        {
            if (!_attributeAssignments.Any(a => a.AttributeValueId == assignment.AttributeValueId))
            {
                _attributeAssignments.Add(assignment);
                changed = true;
            }
        }
        if (changed) IncrementVersion();
    }

    public void SetSeoData(string? title, string? description, IEnumerable<string>? keywords, string? imageUrl)
    {
        // Update alleen als een waarde is opgegeven en niet alleen witruimte.
        // Null laat de huidige waarde intact, een lege string wist de waarde.
        if (title is not null) SeoTitle = title.Trim();
        if (description is not null) SeoDescription = description.Trim();

        SeoKeywordsJson = keywords != null && keywords.Any() ? JsonSerializer.Serialize(keywords) : null;

        // Expliciet toestaan van leegmaken door null of lege string te passeren.
        SeoImageUrl = imageUrl;

        IncrementVersion();
    }


    /// <summary>
    /// Removes a single attribute assignment by its attribute value ID.
    /// </summary>
    /// <param name="attributeValueId">The ID of the attribute value to remove.</param>
    public void RemoveAttributeAssignment(Guid attributeValueId)
    {
        var assignmentToRemove = _attributeAssignments.FirstOrDefault(a => a.AttributeValueId == attributeValueId);
        if (assignmentToRemove != null)
        {
            _attributeAssignments.Remove(assignmentToRemove);
            IncrementVersion();
        }
    }

    /// <summary>
    /// Clears all attribute assignments from the product.
    /// </summary>
    public void ClearAttributeAssignments()
    {
        if (_attributeAssignments.Any())
        {
            _attributeAssignments.Clear();
            IncrementVersion();
        }
    }

    /// <summary>
    /// Adds a single variant combination to the product's internal variants collection.
    /// Used primarily for initial creation or seeding.
    /// </summary>
    /// <param name="combination">The variant combination to add.</param>
    public void AddVariantCombination(ProductVariantCombination combination)
    {
        if (combination is null)
            throw new ArgumentNullException(nameof(combination));

        // De SKU-uniciteit wordt nu afgehandeld door de database via een UNIQUE INDEX.
        // De vorige in-memory check veroorzaakte problemen bij complexe update-scenario's
        // waar een bestaande variant wordt vervangen door een nieuwe met dezelfde SKU.
        // De database is de "single source of truth" voor uniciteit.
        if (_variantCombinations.Any(vc => vc.Id == combination.Id))
            return; // Voorkom het toevoegen van exact dezelfde object-instantie.

        _variantCombinations.Add(combination);
        IncrementVersion();
    }

    /// <summary>
    /// Clears all variant combinations from the product.
    /// </summary>
    public void ClearVariantCombinations()
    {
        if (_variantCombinations.Any())
        {
            _variantCombinations.Clear();
            IncrementVersion();
        }
    }


    /// <summary>
    /// Generates all possible *attribute-based* variant combinations based on current attribute assignments.
    /// This method generates a *new list* of variants, it does not modify the internal _variantCombinations backing field directly.
    /// This is crucial for EF Core's change tracking in the application layer. Linked variants are preserved.
    /// </summary>
    /// <returns>A new list of generated ProductVariantCombination objects, which the caller can use to update the tracked collection.</returns>
    public List<ProductVariantCombination> GenerateAttributeBasedVariantCombinations()
    {
        var newVariants = new List<ProductVariantCombination>();

        var attributeAssignments = _attributeAssignments
            .Where(paa => paa.AttributeValue != null)
            .DistinctBy(a => a.AttributeValueId)
            .ToList();

        if (!attributeAssignments.Any()) return newVariants;

        var attributeGroups = attributeAssignments
            .GroupBy(paa => paa.AttributeValue.AttributeType)
            .Where(group => group.Any())
            .ToList();

        // CRITICAL FIX: Generate variants even with 1 attribute type
        // Previously: if (attributeGroups.Count < 2) return newVariants;
        if (!attributeGroups.Any()) return newVariants;

        // Special case: if only 1 attribute type, create 1 variant per attribute value
        if (attributeGroups.Count == 1)
        {
            var singleGroup = attributeGroups.First();
            bool isFirstVariant = true;

            foreach (var assignment in singleGroup)
            {
                var sku = GenerateSkuForSingleAttribute(Id, assignment);
                sku = EnsureUniqueSku(sku, newVariants);

                var attributeValueIds = new List<Guid> { assignment.AttributeValueId };
                var variantCombination = new ProductVariantCombination(Id, sku, attributeValueIds);

                var priceModifier = (assignment.PriceModifierOverride ?? assignment.AttributeValue?.PriceModifier) ?? 0;

                if (this is PhysicalProduct pp)
                {
                    var finalSalePrice = Math.Max(0.01m, pp.Pricing.Price + priceModifier);
                    var finalOriginalPrice = Math.Max(finalSalePrice, pp.Pricing.OriginalPrice + priceModifier);
                    variantCombination.SetPrices(finalSalePrice, finalOriginalPrice);
                }

                variantCombination.SetStock(0); // Initial stock is 0, overrides come later
                if (isFirstVariant)
                {
                    variantCombination.SetAsDefault(true);
                    isFirstVariant = false;
                }

                newVariants.Add(variantCombination);
            }

            return newVariants;
        }

        // Original logic for multiple attribute types
        var combinations = GenerateAttributeCombinations(attributeGroups);
        bool isFirstCombination = true;

        foreach (var combination in combinations)
        {
            var sku = GenerateSkuForCombination(Id, combination);
            sku = EnsureUniqueSku(sku, newVariants);

            var attributeValueIds = combination.Select(paa => paa.AttributeValueId).ToList();
            var variantCombination = new ProductVariantCombination(Id, sku, attributeValueIds);

            var totalPriceModifier = combination.Sum(paa =>
                (paa.PriceModifierOverride ?? paa.AttributeValue?.PriceModifier) ?? 0);

            if (this is PhysicalProduct pp)
            {
                var finalSalePrice = Math.Max(0.01m, pp.Pricing.Price + totalPriceModifier);
                var finalOriginalPrice = Math.Max(finalSalePrice, pp.Pricing.OriginalPrice + totalPriceModifier);
                variantCombination.SetPrices(finalSalePrice, finalOriginalPrice);
            }

            variantCombination.SetStock(0);
            if (isFirstCombination)
            {
                variantCombination.SetAsDefault(true);
                isFirstCombination = false;
            }

            newVariants.Add(variantCombination);
        }

        return newVariants;
    }

    private static string GenerateSkuForSingleAttribute(Guid productId, ProductAttributeAssignment assignment)
    {
        var productPrefix = productId.ToString("N")[..8].ToUpper();
        var attributePart = Slugify(assignment.AttributeValue.Value);
        return $"{productPrefix}-{attributePart.ToUpperInvariant()}";
    }

    /// <summary>
    /// Helper to ensure SKU uniqueness within a given list of variants.
    /// </summary>
    private string EnsureUniqueSku(string baseSku, List<ProductVariantCombination> currentVariants)
    {
        var sku = baseSku;
        if (currentVariants.Any(vc => vc.Sku.Equals(sku, StringComparison.OrdinalIgnoreCase)))
        {
            var counter = 1;
            var originalSku = sku;
            while (currentVariants.Any(vc => vc.Sku.Equals(sku, StringComparison.OrdinalIgnoreCase)))
            {
                sku = $"{originalSku}-{counter:D2}";
                counter++;
            }
        }
        return sku;
    }

    /// <summary>
    /// Generates cartesian product combinations from grouped attributes.
    /// </summary>
    private static List<List<ProductAttributeAssignment>> GenerateAttributeCombinations(
        List<IGrouping<VariantAttributeType, ProductAttributeAssignment>> attributeGroups)
    {
        var combinations = new List<List<ProductAttributeAssignment>>();
        GenerateCombinationsRecursive(attributeGroups, 0, new List<ProductAttributeAssignment>(), combinations);
        return combinations;
    }

    private static void GenerateCombinationsRecursive(
        List<IGrouping<VariantAttributeType, ProductAttributeAssignment>> attributeGroups,
        int groupIndex,
        List<ProductAttributeAssignment> currentCombination,
        List<List<ProductAttributeAssignment>> allCombinations)
    {
        if (groupIndex == attributeGroups.Count)
        {
            allCombinations.Add(new List<ProductAttributeAssignment>(currentCombination));
            return;
        }

        foreach (var attributeAssignment in attributeGroups[groupIndex])
        {
            currentCombination.Add(attributeAssignment);
            GenerateCombinationsRecursive(attributeGroups, groupIndex + 1, currentCombination, allCombinations);
            currentCombination.RemoveAt(currentCombination.Count - 1);
        }
    }

    /// <summary>
    /// Generates unique SKU using product identifier prefix and slugified attribute values.
    /// Ensures cross-product uniqueness through product ID inclusion.
    /// </summary>
    private static string GenerateSkuForCombination(Guid productId, List<ProductAttributeAssignment> combination)
    {
        var productPrefix = productId.ToString("N")[..8].ToUpper();
        var attributeParts = combination
            .Where(paa => paa.AttributeValue != null)
            .OrderBy(paa => paa.AttributeValue.AttributeType)
            .Select(paa => Slugify(paa.AttributeValue.Value))
            .Where(part => !string.IsNullOrEmpty(part));

        var attributesSuffix = string.Join("-", attributeParts).ToUpperInvariant();
        return $"{productPrefix}-{attributesSuffix}";
    }

    /// <summary>
    /// Converts text to URL-safe slug format for SKU generation.
    /// </summary>
    private static string Slugify(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        text = text.ToLowerInvariant().Replace(" ", "-");
        text = Regex.Replace(text, @"[^a-z0-9\-]", "");
        text = Regex.Replace(text, @"-+", "-");
        return text.Trim('-');
    }

    /// <summary>
    /// Creates a linked product variant that references a separate product entity.
    /// Used for product families where variants have distinct specifications.
    /// </summary>
    public void AddLinkedProductVariant(string sku, Guid linkedProductId, IEnumerable<Guid> attributeValueIds)
    {
        var variant = new ProductVariantCombination(Id, sku, linkedProductId, attributeValueIds);

        if (!_variantCombinations.Any(vc => vc.LinkedProductId == linkedProductId && vc.AttributeValueIds.ToHashSet().SetEquals(attributeValueIds.ToHashSet())))
        {
            _variantCombinations.Add(variant);
            IncrementVersion();
        }
    }

    /// <summary>
    /// Gets all variants that link to separate product entities.
    /// </summary>
    public IEnumerable<ProductVariantCombination> GetLinkedProductVariants()
    {
        return _variantCombinations.Where(vc => vc.IsLinkedProduct);
    }

    /// <summary>
    /// Gets all standard attribute-only variants.
    /// </summary>
    public IEnumerable<ProductVariantCombination> GetAttributeVariants()
    {
        return _variantCombinations.Where(vc => !vc.IsLinkedProduct);
    }

    #endregion

    #region Business State Management

    /// <summary>
    /// Updates aggregate rating metrics from review system calculations.
    /// </summary>
    public void UpdateRating(decimal averageRating, int reviewCount)
    {
        if (reviewCount == 0)
        {
            if (averageRating != 0m)
                throw new ArgumentOutOfRangeException(nameof(averageRating), "Average rating must be 0 when review count is 0.");
        }
        else
        {
            if (averageRating < 1.0m || averageRating > 5.0m)
                throw new ArgumentOutOfRangeException(nameof(averageRating), "Rating must be between 1.0 and 5.0");
        }
        if (reviewCount < 0)
            throw new ArgumentOutOfRangeException(nameof(reviewCount), "Review count cannot be negative");

        AverageRating = averageRating;
        ReviewCount = reviewCount;
        IncrementVersion();
    }

    public void SetFeaturedStatus(bool isFeatured)
    {
        IsFeatured = isFeatured;
        IncrementVersion();
    }

    public void SetShortDescription(string? shortDescription)
    {
        ShortDescription = shortDescription;
        IncrementVersion();
    }

    public void SetCustomAttributes(string? json)
    {
        CustomAttributesJson = json;
        IncrementVersion();
    }

    public void SetFeaturedImageId(Guid? featuredImageId)
    {
        FeaturedImageId = featuredImageId;
        // Zorg ervoor dat de featured image ook in de algemene media collectie zit, als deze is ingesteld en nog niet aanwezig is.
        if (featuredImageId.HasValue && !_mediaIds.Contains(featuredImageId.Value))
        {
            AddMedia(featuredImageId.Value); // Gebruikt de bestaande AddMedia om versiebeheer te garanderen
        }
        IncrementVersion();
    }


    #endregion
}

/// <summary>
/// Physical product implementation with inventory management and shipping considerations.
/// </summary>
public sealed class PhysicalProduct : ProductBase
{
    [Required] public Pricing Pricing { get; private set; }
    public ProductTax? TaxInfo { get; private set; }
    [MaxLength(100)] public string? Sku { get; private set; }
    [MaxLength(100)] public string? Brand { get; private set; }
    public bool ManageStock { get; private set; }
    public int? StockQuantity { get; private set; }
    public StockStatus StockStatus { get; private set; }
    public bool AllowBackorders { get; private set; }
    [Range(0, int.MaxValue)] public int? LowStockThreshold { get; private set; }
    public ProductAvailabilityRules? AvailabilityRules { get; private set; }

    // NEW: Age Restrictions and Display Specifications
    public AgeRestrictions? AgeRestrictions { get; private set; }
    private readonly List<ProductDisplaySpecification> _displaySpecifications = new();
    public IReadOnlyCollection<ProductDisplaySpecification> DisplaySpecifications => _displaySpecifications.AsReadOnly();


    private PhysicalProduct() : base(ProductType.Physical, "EF_NEEDS_A_VALUE", "EF_NEEDS_A_VALUE", null)
    {
        Pricing = null!;
    }

    public PhysicalProduct(string name, string description, string? appScope, string currency, Pricing pricing, bool manageStock = true)
        : base(ProductType.Physical, name, description, appScope, currency)
    {
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("Currency is required.", nameof(currency));
        if (pricing.Price > pricing.OriginalPrice) throw new ArgumentException("Sale price cannot be higher than original price.", nameof(pricing));

        Pricing = pricing;
        ManageStock = manageStock;
        StockStatus = StockStatus.InStock;
    }

    public void UpdatePricing(decimal newPrice, decimal newOriginalPrice)
    {
        Pricing = new Pricing(newPrice, newOriginalPrice);
        IncrementVersion();
    }

    public void SetInitialStock(int quantity)
    {
        if (quantity < 0) throw new ArgumentException("Initial stock quantity cannot be negative.", nameof(quantity));
        StockQuantity = quantity;
        UpdateStockStatus();
        IncrementVersion();
    }

    public void ReduceStock(int quantity)
    {
        if (!ManageStock)
            throw new InvalidOperationException("Stock management is disabled for this product.");

        StockQuantity -= quantity;
        UpdateStockStatus();
        IncrementVersion();
    }

    public void AddStock(int quantity)
    {
        if (!ManageStock)
            throw new InvalidOperationException("Stock management is disabled for this product.");

        StockQuantity = (StockQuantity ?? 0) + quantity;
        UpdateStockStatus();
        IncrementVersion();
    }

    private void UpdateStockStatus()
    {
        if (StockQuantity == 0)
            StockStatus = AllowBackorders ? StockStatus.OnBackorder : StockStatus.OutOfStock;
        else if (LowStockThreshold.HasValue && (StockQuantity ?? 0) <= LowStockThreshold)
            StockStatus = StockStatus.LimitedStock;
        else
            StockStatus = StockStatus.InStock;
    }

    public void SetInventoryDetails(string? sku, string? brand)
    {
        Sku = sku;
        Brand = brand;
        IncrementVersion();
    }

    public void SetStockRules(bool allowBackorders, int? lowStockThreshold)
    {
        AllowBackorders = allowBackorders;
        LowStockThreshold = lowStockThreshold;
        UpdateStockStatus();
        IncrementVersion();
    }

    public void SetAvailabilityRules(ProductAvailabilityRules? rules)
    {
        AvailabilityRules = rules;
        IncrementVersion();
    }

    public void SetTaxInfo(ProductTax? taxInfo)
    {
        TaxInfo = taxInfo;
        IncrementVersion();
    }

    public void SetAgeRestrictions(int minAge, int maxAge)
    {
        if (minAge < 0 || maxAge < minAge) throw new ArgumentException("Invalid age range.");
        AgeRestrictions = new AgeRestrictions(minAge, maxAge);
        IncrementVersion();
    }

    public void AddDisplaySpecification(ProductDisplaySpecification spec)
    {
        if (spec == null) throw new ArgumentNullException(nameof(spec));
        if (string.IsNullOrWhiteSpace(spec.SpecKey)) throw new ArgumentException("SpecKey is required.", nameof(spec));

        if (!_displaySpecifications.Any(s => s.SpecKey.Equals(spec.SpecKey, StringComparison.OrdinalIgnoreCase)))
        {
            _displaySpecifications.Add(spec);
            IncrementVersion();
        }
    }

    public void ClearDisplaySpecifications()
    {
        if (_displaySpecifications.Any())
        {
            _displaySpecifications.Clear();
            IncrementVersion();
        }
    }
}

public sealed class DigitalProduct : ProductBase
{
    [Required] public Pricing Pricing { get; private set; }
    public ProductTax? TaxInfo { get; private set; }
    [Required] public DigitalProductDeliveryType DeliveryType { get; private set; }
    [MaxLength(50)] public string? SoftwareVersion { get; private set; }
    public DateTimeOffset? AccessExpirationDate { get; private set; }

    private DigitalProduct() : base(ProductType.DigitalProduct, string.Empty, string.Empty, null)
    {
        Pricing = null!;
    }

    public DigitalProduct(string name, string description, string? appScope, string currency, Pricing pricing, DigitalProductDeliveryType deliveryType, Guid creatorId)
        : base(ProductType.DigitalProduct, name, description, appScope, currency)
    {
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("Currency is required for digital products.", nameof(currency));
        Pricing = pricing ?? throw new ArgumentNullException(nameof(pricing));
        DeliveryType = deliveryType;
    }

    public void SetDigitalDetails(string? softwareVersion, DateTimeOffset? accessExpirationDate)
    {
        SoftwareVersion = softwareVersion;
        AccessExpirationDate = accessExpirationDate;
        IncrementVersion();
    }

    public void SetTaxInfo(ProductTax? taxInfo)
    {
        TaxInfo = taxInfo;
        IncrementVersion();
    }
}

public sealed class VirtualGameItemProduct : ProductBase
{
    private readonly List<InGameCurrencyPrice> _priceInGameCurrency = new();
    public IReadOnlyCollection<InGameCurrencyPrice> PriceInGameCurrency => _priceInGameCurrency.AsReadOnly();
    [Range(0.01, double.MaxValue)] public decimal? PriceRealMoney { get; private set; }
    [Required] public VirtualItemProperties Properties { get; private set; }

    private VirtualGameItemProduct() : base(ProductType.VirtualGameItem, string.Empty, string.Empty, null)
    {
        Properties = null!;
    }

    public VirtualGameItemProduct(string name, string description, string? appScope, VirtualItemProperties properties)
        : base(ProductType.VirtualGameItem, name, description, appScope)
    {
        Properties = properties ?? throw new ArgumentNullException(nameof(properties));
    }

    public void AddInGamePrice(InGameCurrencyPrice price)
    {
        if (price == null) throw new ArgumentNullException(nameof(price));
        if (_priceInGameCurrency.Any(p => p.CurrencyId == price.CurrencyId))
            throw new InvalidOperationException($"Price for currency '{price.CurrencyId}' already exists.");

        _priceInGameCurrency.Add(price);
        IncrementVersion();
    }

    public void SetRealMoneyPrice(decimal? price)
    {
        if (price.HasValue && price <= 0) throw new ArgumentException("Price must be positive.");
        PriceRealMoney = price;
        IncrementVersion();
    }
}

/// <summary>
/// Service product with subscription billing and delivery method configuration.
/// </summary>
public sealed class ServiceProduct : ProductBase
{
    [Required] public Pricing Pricing { get; private set; }
    public ProductTax? TaxInfo { get; private set; }
    public ServiceBillingCycle BillingCycle { get; private set; }
    public ServiceDeliveryMethod? DeliveryMethod { get; private set; }
    public bool RequiresScheduling { get; private set; }
    [MaxLength(1000)] public string? SchedulingInstructionsOrUrl { get; private set; }

    private ServiceProduct() : base(ProductType.Service, string.Empty, string.Empty, null)
    {
        Pricing = null!;
    }

    public ServiceProduct(string name, string description, string? appScope, string currency, Pricing pricing, ServiceBillingCycle billingCycle)
        : base(ProductType.Service, name, description, appScope, currency)
    {
        if (string.IsNullOrWhiteSpace(currency)) throw new ArgumentException("Currency is required for service products.", nameof(currency));
        Pricing = pricing ?? throw new ArgumentNullException(nameof(pricing));
        BillingCycle = billingCycle;
    }

    public void SetServiceDetails(ServiceDeliveryMethod? deliveryMethod, bool requiresScheduling, string? instructions)
    {
        DeliveryMethod = deliveryMethod;
        RequiresScheduling = requiresScheduling;
        SchedulingInstructionsOrUrl = instructions;
        IncrementVersion();
    }

    public void SetTaxInfo(ProductTax? taxInfo)
    {
        TaxInfo = taxInfo;
        IncrementVersion();
    }
}


public class ProductCategory : BaseAuditableEntity<Guid>
{
    [Required, MaxLength(100)]
    public string Key { get; private set; } = string.Empty;

    public Guid? ParentCategoryId { get; private set; }
    public ProductCategory? Parent { get; private set; } // Navigatie property naar ouder

    private readonly List<ProductCategory> _children = new();
    public IReadOnlyCollection<ProductCategory> Children => _children.AsReadOnly(); // Navigatie property naar kinderen

    public Guid? ImageMediaId { get; private set; } // Optionele media-ID voor de categorie

    public int ProductCount { get; private set; } // Aantal producten in deze categorie (kan bijgewerkt worden via domain events/handlers)

    private ProductCategory() { }

    public ProductCategory(string key, string slug, Guid? parentCategoryId = null, Guid? imageMediaId = null)
    {
        Id = Guid.NewGuid();
        Key = key;
        ParentCategoryId = parentCategoryId;
        ImageMediaId = imageMediaId;
        ProductCount = 0;
    }
}


#region Supporting Entities

/// <summary>
/// Defines reusable attribute values for product variation system.
/// </summary>
public class AttributeValue : BaseAuditableEntity<Guid>
{
    [Required, MaxLength(100)] public string Value { get; private set; } = string.Empty;
    [Required, MaxLength(100)] public string DisplayName { get; private set; } = string.Empty;
    [Required] public VariantAttributeType AttributeType { get; private set; }
    [MaxLength(7)] public string? ColorHex { get; private set; }
    public Guid? MediaId { get; private set; }
    public decimal? PriceModifier { get; private set; }
    public PriceModifierType? PriceModifierType { get; private set; }
    public bool IsGloballyAvailable { get; private set; }
    [MaxLength(500)] public string? Description { get; private set; }

    private AttributeValue() { }

    public AttributeValue(string value, string displayName, VariantAttributeType attributeType, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(value)) throw new ArgumentException("Value is required.", nameof(value));
        if (string.IsNullOrWhiteSpace(displayName)) throw new ArgumentException("Display name is required.", nameof(displayName));

        Id = Guid.NewGuid();
        Value = value;
        DisplayName = displayName;
        AttributeType = attributeType;
        Description = description;
        IsGloballyAvailable = true; // Standaard globaal beschikbaar
    }

    public void SetMetadata(string? colorHex, Guid? mediaId, decimal? priceModifier, PriceModifierType? priceModifierType)
    {
        ColorHex = colorHex;
        MediaId = mediaId;
        PriceModifier = priceModifier;
        PriceModifierType = priceModifierType;
    }

    public void UpdateMetadata(string displayName, string? colorHex, decimal? priceModifier, PriceModifierType? priceModifierType)
    {
        if (string.IsNullOrWhiteSpace(displayName))
            throw new ArgumentException("Display name is required for update.", nameof(displayName));

        DisplayName = displayName;
        ColorHex = colorHex;
        PriceModifier = priceModifier;
        PriceModifierType = priceModifierType;
    }
}

public class ProductAttributeAssignment : BaseAuditableEntity<Guid>
{
    public Guid ProductId { get; private set; }
    public Guid AttributeValueId { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsAvailable { get; private set; }
    public decimal? PriceModifierOverride { get; private set; }
    public PriceModifierType? PriceModifierTypeOverride { get; private set; }

    // Navigation properties
    public ProductBase Product { get; private set; } = null!;

    public AttributeValue AttributeValue { get; set; } = null!; // Updated from ProductAttributeValue

    private ProductAttributeAssignment() { }

    // AANGEPASTE CONSTRUCTOR: Nu met PriceModifierOverride en PriceModifierTypeOverride
    public ProductAttributeAssignment(Guid productId, Guid attributeValueId, int sortOrder, bool isAvailable = true, decimal? priceModifierOverride = null, PriceModifierType? priceModifierTypeOverride = null)
    {
        Id = Guid.NewGuid();
        ProductId = productId;
        AttributeValueId = attributeValueId;
        SortOrder = sortOrder;
        IsAvailable = isAvailable;
        PriceModifierOverride = priceModifierOverride;
        PriceModifierTypeOverride = priceModifierTypeOverride;
    }

    public void SetAvailability(bool isAvailable) => IsAvailable = isAvailable;

    public void SetPriceModifier(decimal? priceModifier, PriceModifierType? priceModifierType)
    {
        PriceModifierOverride = priceModifier;
        PriceModifierTypeOverride = priceModifierType;
    }
}

public class ProductVariantCombination
{
    [Key] public Guid Id { get; private set; }
    [Required, MaxLength(100)] public string Sku { get; private set; } = string.Empty;
    public Guid ProductId { get; private set; }

    public Guid? LinkedProductId { get; private set; }

    private readonly List<Guid> _attributeValueIds = new();
    public IReadOnlyCollection<Guid> AttributeValueIds => _attributeValueIds.AsReadOnly();

    private readonly List<Guid> _mediaIds = new();
    public IReadOnlyCollection<Guid> MediaIds => _mediaIds.AsReadOnly();

    [Range(0.01, double.MaxValue)] public decimal? Price { get; private set; } // Setters are now private
    [Range(0.01, double.MaxValue)] public decimal? OriginalPrice { get; private set; } // Setters are now private
    [Range(0, int.MaxValue)] public int? StockQuantity { get; private set; }
    public StockStatus? StockStatus { get; private set; }

    public bool IsActive { get; private set; }
    public bool IsDefault { get; private set; }

    public bool IsLinkedProduct => LinkedProductId.HasValue;

    public bool HasMedia => _mediaIds.Any();

    private ProductVariantCombination() { }

    public ProductVariantCombination(Guid productId, string sku, IEnumerable<Guid> attributeValueIds)
    {
        if (string.IsNullOrWhiteSpace(sku)) throw new ArgumentException("SKU is required.", nameof(sku));

        ProductId = productId;
        Sku = sku;
        _attributeValueIds.AddRange(attributeValueIds?.OrderBy(id => id) ?? throw new ArgumentNullException(nameof(attributeValueIds)));

        // --- DE FIX: Genereer een deterministisch ID ---
        Id = CreateDeterministicGuid(productId, _attributeValueIds);

        IsActive = true;
        IsDefault = false;
        StockStatus = Enums.Product.StockStatus.OutOfStock;
        StockQuantity = 0;
    }

    public ProductVariantCombination(Guid productId, string sku, Guid linkedProductId, IEnumerable<Guid> attributeValueIds)
    : this(productId, sku, attributeValueIds)
    {
        LinkedProductId = linkedProductId;
    }

    // Functie om een voorspelbaar ID te genereren.
    private static Guid CreateDeterministicGuid(Guid productId, IEnumerable<Guid> attributeValueIds)
    {
        var combinedString = $"{productId:N}-{string.Join("-", attributeValueIds.Select(id => id.ToString("N")))}";
        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(combinedString));
        return new Guid(hash);
    }


    public void AddMedia(Guid mediaId)
    {
        if (!_mediaIds.Contains(mediaId))
        {
            _mediaIds.Add(mediaId);
        }
    }

    public void ClearMedia()
    {
        _mediaIds.Clear();
    }

    public void SetStock(int quantity)
    {
        if (quantity < 0) throw new ArgumentException("Stock quantity cannot be negative.", nameof(quantity));
        StockQuantity = quantity;
        StockStatus = quantity > 0 ? Enums.Product.StockStatus.InStock : Enums.Product.StockStatus.OutOfStock;
    }

    public void SetPrices(decimal? price, decimal? originalPrice)
    {
        var finalPrice = price ?? 0;
        var finalOriginalPrice = originalPrice ?? finalPrice;

        if (finalPrice <= 0) throw new ArgumentException("Price must be positive.", nameof(price));
        if (finalOriginalPrice <= 0) throw new ArgumentException("Original price must be positive.", nameof(originalPrice));
        if (finalPrice > finalOriginalPrice) throw new ArgumentException("Sale price cannot be higher than original price.", nameof(price));

        Price = finalPrice;
        OriginalPrice = finalOriginalPrice;
    }

    public void SetAsDefault(bool isDefault) => IsDefault = isDefault;
    public void SetActive(bool isActive) => IsActive = isActive;

    /// <summary>
    /// Updates the properties of this variant from another variant.
    /// Used for synchronizing in-memory generated variants with existing tracked ones.
    /// </summary>
    public void UpdateFrom(ProductVariantCombination other)
    {
        // Alleen eigenschappen bijwerken die kunnen verschillen na generatie of override
        Sku = other.Sku;
        Price = other.Price;
        OriginalPrice = other.OriginalPrice;
        StockQuantity = other.StockQuantity;
        StockStatus = other.StockStatus;
        IsActive = other.IsActive;
        IsDefault = other.IsDefault;

        // MediaIds sync
        _mediaIds.Clear(); // Eerst legen, dan de nieuwe toevoegen
        foreach (var mediaId in other.MediaIds)
        {
            _mediaIds.Add(mediaId);
        }
    }
}


#endregion
public class CustomAttributeDefinition : BaseAuditableEntity<Guid>
{
    // Properties now use 'init' so they can be set during object creation only.
    public string Key { get; init; } = string.Empty;
    public string NameKeyOrText { get; init; } = string.Empty;
    public string DescriptionKeyOrText { get; init; } = string.Empty;
    public CustomAttributeType ValueType { get; init; }
    public CustomAttributeUIType UiControlType { get; init; }
    public string? ValidationRulesJson { get; init; }
    public string? DefaultValue { get; init; }
    public string Group { get; init; } = string.Empty;
    public string? Icon { get; init; }
}

public class DisplaySpecificationDefinition : BaseAuditableEntity<Guid>
{
    public string SpecKey { get; init; } = string.Empty;
    public string LabelKeyOrText { get; init; } = string.Empty;
    public string? Icon { get; init; }
    public string GroupKeyOrText { get; init; } = string.Empty;
    public int DisplayOrder { get; init; }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/RefreshToken.cs ---
/**
 * @file RefreshToken.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-05
 * @Description Domain entity for storing refresh tokens for JWT authentication.
 */
namespace RoyalCode.Domain.Entities;

public class RefreshToken : BaseEntity<Guid>
{
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime Expires { get; set; }
    public bool IsExpired => DateTime.UtcNow >= Expires;
    public DateTime Created { get; set; }
    public DateTime? Revoked { get; set; }
    public bool IsActive => Revoked == null && !IsExpired;
}
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/ReviewModels.cs ---
/**
 * @file ReviewModels.cs
 * @version 4.0.0 (Final Shared UserProfile Fix)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-06-29
 * @description Review aggregate root using shared UserProfile value object.
 *              All UserProfile references now point to the shared implementation.
 */

using System.ComponentModel.DataAnnotations;
using RoyalCode.Domain.Enums.Review;

namespace RoyalCode.Domain.Entities.Review;

/// <summary>
/// Review aggregate root managing customer feedback, ratings, and moderation workflows.
/// Enforces business rules for review validity and supports engagement tracking.
/// </summary>
public class Review : BaseAuditableEntity<Guid>
{
    public const int EditWindowHours = 2;

    [Required]
    public Guid AuthorId { get; private set; }

    [Required] public Guid TargetEntityId { get; private set; }
    [Required] public ReviewTargetEntityType TargetEntityType { get; private set; }
    [Required, Range(1.0, 5.0)] public decimal Rating { get; private set; }
    [MaxLength(255)] public string? Title { get; private set; }
    [Required] public string ReviewText { get; private set; }
    public bool IsVerifiedPurchase { get; private set; }
    public int Likes { get; private set; }
    public int Dislikes { get; private set; }
    [Required] public ReviewStatus Status { get; private set; }
    [ConcurrencyCheck] public long Version { get; protected set; }
    private readonly List<Guid> _mediaIds = new();
    public IReadOnlyCollection<Guid> MediaIds => _mediaIds.AsReadOnly();
    private readonly List<ReviewReply> _replies = new();
    public IReadOnlyCollection<ReviewReply> Replies => _replies.AsReadOnly();
    private readonly List<ReviewHelpfulVote> _helpfulVotes = new();
    public IReadOnlyCollection<ReviewHelpfulVote> HelpfulVotes => _helpfulVotes.AsReadOnly();
    public int HelpfulScore => Likes - Dislikes;
    public bool HasReplies => _replies.Any();
    public bool HasMedia => _mediaIds.Any();
    public ReviewSentiment Sentiment => CalculateSentiment();

    private Review()
    {
        ReviewText = string.Empty;
    }

    public Review(Guid authorId, Guid targetEntityId, ReviewTargetEntityType targetEntityType,
     decimal rating, string reviewText, string? title = null, bool isVerifiedPurchase = false)
    {
        if (authorId == Guid.Empty) throw new ArgumentException("Author ID cannot be empty.", nameof(authorId));
        if (string.IsNullOrWhiteSpace(reviewText)) throw new ArgumentException("Review text is required.", nameof(reviewText));
        if (rating < 1.0m || rating > 5.0m) throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1.0 and 5.0");

        Id = Guid.NewGuid();
        AuthorId = authorId; // Direct de AuthorId opslaan
        TargetEntityId = targetEntityId;
        TargetEntityType = targetEntityType;
        Rating = rating;
        ReviewText = reviewText;
        Title = title;
        IsVerifiedPurchase = isVerifiedPurchase;
        Status = ReviewStatus.Pending;

        AddDomainEvent(new ReviewSubmittedEvent(Id, TargetEntityId, TargetEntityType, Rating, IsVerifiedPurchase));
    }


    /// <summary>
    /// Updates review content while maintaining moderation workflow integrity.
    /// Automatically resets status to Pending for re-moderation.
    /// </summary>
    public void UpdateContent(string? newTitle, string newReviewText)
    {
        if (!CanBeEdited())
        {
            throw new DomainException($"Reviews cannot be edited more than {EditWindowHours} hours after creation.", "REVIEW_EDIT_WINDOW_EXPIRED");
        }

        if (string.IsNullOrWhiteSpace(newReviewText))
            throw new ArgumentException("Review text cannot be empty.", nameof(newReviewText));

        var originalText = ReviewText;
        Title = newTitle;
        ReviewText = newReviewText;
        Status = ReviewStatus.Pending; // Require re-moderation
        Version++;

        AddDomainEvent(new ReviewUpdatedEvent(Id, originalText, newReviewText));
    }



    /// <summary>
    /// Updates review rating with business rule enforcement.
    /// </summary>
    public void UpdateRating(decimal newRating)
    {
        if (!CanBeEdited())
        {
            throw new DomainException($"Reviews cannot be edited more than {EditWindowHours} hours after creation.", "REVIEW_EDIT_WINDOW_EXPIRED");
        }

        if (newRating < 1.0m || newRating > 5.0m)
            throw new ArgumentOutOfRangeException(nameof(newRating), "Rating must be between 1.0 and 5.0");

        var originalRating = Rating;
        Rating = newRating;
        Status = ReviewStatus.Pending; // Require re-moderation
        Version++;

        AddDomainEvent(new ReviewRatingChangedEvent(Id, TargetEntityId, originalRating, newRating));
    }





    /// <summary>
    /// Approves review for public display after moderation review.
    /// </summary>
    public void Approve(Guid moderatorId, string? moderatorNote = null)
    {
        if (Status == ReviewStatus.Approved) return;

        Status = ReviewStatus.Approved;
        Version++;

        AddDomainEvent(new ReviewApprovedEvent(Id, TargetEntityId, Rating, moderatorId, moderatorNote));
    }

    /// <summary>
    /// Rejects review with moderation reasoning.
    /// </summary>
    public void Reject(Guid moderatorId, string rejectionReason)
    {
        if (string.IsNullOrWhiteSpace(rejectionReason))
            throw new ArgumentException("Rejection reason is required.", nameof(rejectionReason));

        if (Status == ReviewStatus.Rejected) return;

        Status = ReviewStatus.Rejected;
        Version++;

        AddDomainEvent(new ReviewRejectedEvent(Id, TargetEntityId, moderatorId, rejectionReason));
    }

    /// <summary>
    /// Flags review for manual moderation review.
    /// </summary>
    public void Flag(Guid reporterId, ReviewFlagReason reason, string? description = null)
    {
        Status = ReviewStatus.Flagged;
        Version++;

        AddDomainEvent(new ReviewFlaggedEvent(Id, reporterId, reason, description));
    }

    public void ResetStatusToPending(Guid moderatorId, string? moderatorNote)
    {
        if (Status == ReviewStatus.Pending) return;

        Status = ReviewStatus.Pending;
        Version++;

        // Voeg een event toe voor de geschiedenis.
        AddDomainEvent(new ReviewStatusResetToPendingEvent(Id, TargetEntityId, moderatorId, moderatorNote));
    }


    /// <summary>
    /// Records a helpful vote from a user with duplicate prevention.
    /// </summary>
    public void AddHelpfulVote(Guid userId, bool isHelpful)
    {
        var existingVote = _helpfulVotes.FirstOrDefault(v => v.UserId == userId);
        if (existingVote != null)
        {
            // Update existing vote
            existingVote.UpdateVote(isHelpful);
        }
        else
        {
            // Add new vote
            _helpfulVotes.Add(new ReviewHelpfulVote(Id, userId, isHelpful));
        }

        RecalculateHelpfulScores();
        Version++;
    }

    /// <summary>
    /// Removes a user's helpful vote.
    /// </summary>
    public void RemoveHelpfulVote(Guid userId)
    {
        var vote = _helpfulVotes.FirstOrDefault(v => v.UserId == userId);
        if (vote != null)
        {
            _helpfulVotes.Remove(vote);
            RecalculateHelpfulScores();
            Version++;
        }
    }

    /// <summary>
    /// Recalculates like/dislike counts from individual votes.
    /// </summary>
    public void RecalculateHelpfulScores()
    {
        Likes = _helpfulVotes.Count(v => v.IsHelpful);
        Dislikes = _helpfulVotes.Count(v => !v.IsHelpful);
        Version++; // Zorg ervoor dat de versie wordt verhoogd!
    }



    /// <summary>
    /// Adds a reply to this review with proper author validation.
    /// </summary>
    public void AddReply(Guid authorId, string replyText)
    {
        if (Status != ReviewStatus.Approved)
            throw new InvalidOperationException("Cannot reply to non-approved reviews.");

        // Controleer of de gebruiker niet op zijn eigen review reageert
        if (this.AuthorId == authorId)
        {
            throw new InvalidOperationException("User cannot reply to their own review.");
        }

        var reply = new ReviewReply(authorId, Id, replyText);
        _replies.Add(reply);
        Version++;

        AddDomainEvent(new ReviewReplyAddedEvent(Id, reply.Id, authorId));
    }



    /// <summary>
    /// Removes a reply by ID with authorization check.
    /// </summary>
    public void RemoveReply(Guid replyId, Guid requestingUserId)
    {
        var reply = _replies.FirstOrDefault(r => r.Id == replyId);
        if (reply == null) return; // Al weg of niet gevonden

        // Alleen de auteur van de reply, of de auteur van de review mag verwijderen.
        if (reply.AuthorId != requestingUserId && this.AuthorId != requestingUserId)
        {
            throw new UnauthorizedAccessException("Only the reply author or review author can remove replies.");
        }

        _replies.Remove(reply);
        Version++;

        AddDomainEvent(new ReviewReplyRemovedEvent(Id, replyId, requestingUserId));
    }


    /// <summary>
    /// Adds media attachment to review with validation.
    /// </summary>
    public void AddMedia(Guid mediaId)
    {
        if (_mediaIds.Contains(mediaId)) return;
        if (_mediaIds.Count >= 10) // Business rule: max 10 media items
            throw new InvalidOperationException("Maximum of 10 media items allowed per review.");

        _mediaIds.Add(mediaId);
        Version++;
    }

    /// <summary>
    /// Removes media attachment from review.
    /// </summary>
    public void RemoveMedia(Guid mediaId)
    {
        if (_mediaIds.Remove(mediaId)) Version++;
    }

    /// <summary>
    /// Clears all media attachments.
    /// </summary>
    public void ClearMedia()
    {
        if (_mediaIds.Any())
        {
            _mediaIds.Clear();
            Version++;
        }
    }


    private ReviewSentiment CalculateSentiment()
    {
        return Rating switch
        {
            >= 4.0m => ReviewSentiment.Positive,
            >= 3.0m => ReviewSentiment.Neutral,
            _ => ReviewSentiment.Negative
        };
    }

    public bool CanBeEdited()
    {
        return (DateTimeOffset.UtcNow - Created) < TimeSpan.FromHours(EditWindowHours);
    }

    public bool IsFeaturedWorthy()
    {
        return IsVerifiedPurchase &&
               Rating >= 4.0m &&
               HelpfulScore >= 3 &&
               Status == ReviewStatus.Approved &&
               !string.IsNullOrWhiteSpace(Title);
    }

    public int GetQualityScore()
    {
        var score = 0;
        if (!string.IsNullOrWhiteSpace(ReviewText)) score += 10;
        if (!string.IsNullOrWhiteSpace(Title)) score += 5;
        if (IsVerifiedPurchase) score += 20;
        score += Math.Min(_mediaIds.Count * 5, 15);
        if (HelpfulScore > 0) score += Math.Min(HelpfulScore * 2, 20);
        if (ReviewText.Length > 100) score += 10;
        if (ReviewText.Length > 300) score += 10;
        if (HasReplies) score += 5;
        return Math.Min(score, 100);
    }

    public bool ShouldBeFeatured()
    {
        return IsFeaturedWorthy() && GetQualityScore() >= 70;
    }

}



/// <summary>
/// Reply entity supporting hierarchical conversation threads within reviews.
/// </summary>
public class ReviewReply : BaseAuditableEntity<Guid>
{
    [Required] public Guid AuthorId { get; private set; }
    [Required] public Guid ParentReviewId { get; private set; }
    [Required] public string ReplyText { get; private set; }
    public int Likes { get; private set; }
    public ReviewStatus Status { get; private set; }

    [ConcurrencyCheck] public long Version { get; private set; }

    // Support for nested replies (threaded conversations)
    public Guid? ParentReplyId { get; private set; }
    private readonly List<ReviewReply> _childReplies = new();
    public IReadOnlyCollection<ReviewReply> ChildReplies => _childReplies.AsReadOnly();

    private readonly List<ReviewHelpfulVote> _helpfulVotes = new();
    public IReadOnlyCollection<ReviewHelpfulVote> HelpfulVotes => _helpfulVotes.AsReadOnly();

    public bool HasChildReplies => _childReplies.Any();
    public int HelpfulScore => _helpfulVotes.Count(v => v.IsHelpful) - _helpfulVotes.Count(v => !v.IsHelpful);

    private ReviewReply() { ReplyText = string.Empty; }

    // --- DE DEFINITIEVE CONSTRUCTOR FIX ---
    internal ReviewReply(Guid authorId, Guid parentReviewId, string replyText, Guid? parentReplyId = null)
    {
        if (authorId == Guid.Empty) throw new ArgumentException("Author ID cannot be empty", nameof(authorId));
        if (string.IsNullOrWhiteSpace(replyText)) throw new ArgumentException("Reply text is required.", nameof(replyText));

        Id = Guid.NewGuid();
        AuthorId = authorId; // Direct de AuthorId opslaan
        ParentReviewId = parentReviewId;
        ParentReplyId = parentReplyId;
        ReplyText = replyText;
        Status = ReviewStatus.Approved;

        AddDomainEvent(new ReplySubmittedEvent(Id, ParentReviewId, AuthorId));
    }


    /// <summary>
    /// Adds a nested reply to this reply.
    /// </summary>
    public void AddChildReply(Guid authorId, string replyText)
    {
        var childReply = new ReviewReply(authorId, ParentReviewId, replyText, Id);
        _childReplies.Add(childReply);
        Version++;
    }

    /// <summary>
    /// Updates reply text content.
    /// </summary>
    public void UpdateText(string newText)
    {
        if (string.IsNullOrWhiteSpace(newText))
            throw new ArgumentException("Reply text cannot be empty.", nameof(newText));

        ReplyText = newText;
        Version++;
    }

    /// <summary>
    /// Adds helpful vote to this reply.
    /// </summary>
    public void AddHelpfulVote(Guid userId, bool isHelpful)
    {
        var existingVote = _helpfulVotes.FirstOrDefault(v => v.UserId == userId);
        if (existingVote != null)
        {
            existingVote.UpdateVote(isHelpful);
        }
        else
        {
            _helpfulVotes.Add(new ReviewHelpfulVote(Id, userId, isHelpful));
        }
        Version++;
    }
}

/// <summary>
/// Tracks individual user votes on review helpfulness to prevent duplicate voting.
/// </summary>
public class ReviewHelpfulVote : BaseAuditableEntity<Guid>
{
    [Required] public Guid ReviewId { get; private set; }
    [Required] public Guid UserId { get; private set; }
    public bool IsHelpful { get; private set; }

    private ReviewHelpfulVote() { }

    public ReviewHelpfulVote(Guid reviewId, Guid userId, bool isHelpful)
    {
        Id = Guid.NewGuid();
        ReviewId = reviewId;
        UserId = userId;
        IsHelpful = isHelpful;
    }

    /// <summary>
    /// Updates the vote value (like/dislike toggle).
    /// </summary>
    public void UpdateVote(bool isHelpful)
    {
        IsHelpful = isHelpful;
    }
}


/// <summary>
/// Domain event fired when a new review is submitted.
/// </summary>
public class ReviewSubmittedEvent : BaseEvent
{
    public Guid ReviewId { get; }
    public Guid TargetEntityId { get; }
    public ReviewTargetEntityType TargetType { get; }
    public decimal Rating { get; }
    public bool IsVerifiedPurchase { get; }

    public ReviewSubmittedEvent(Guid reviewId, Guid targetEntityId, ReviewTargetEntityType targetType, decimal rating, bool isVerifiedPurchase)
    {
        ReviewId = reviewId;
        TargetEntityId = targetEntityId;
        TargetType = targetType;
        Rating = rating;
        IsVerifiedPurchase = isVerifiedPurchase;
    }
}

/// <summary>
/// Domain event fired when review content is updated.
/// </summary>
public class ReviewUpdatedEvent : BaseEvent
{
    public Guid ReviewId { get; }
    public string OriginalText { get; }
    public string NewText { get; }

    public ReviewUpdatedEvent(Guid reviewId, string originalText, string newText)
    {
        ReviewId = reviewId;
        OriginalText = originalText;
        NewText = newText;
    }
}

/// <summary>
/// Domain event fired when review rating changes.
/// </summary>
public class ReviewRatingChangedEvent : BaseEvent
{
    public Guid ReviewId { get; }
    public Guid TargetEntityId { get; }
    public decimal OldRating { get; }
    public decimal NewRating { get; }

    public ReviewRatingChangedEvent(Guid reviewId, Guid targetEntityId, decimal oldRating, decimal newRating)
    {
        ReviewId = reviewId;
        TargetEntityId = targetEntityId;
        OldRating = oldRating;
        NewRating = newRating;
    }
}

/// <summary>
/// Domain event fired when review is approved by moderator.
/// </summary>
public class ReviewApprovedEvent : BaseEvent
{
    public Guid ReviewId { get; }
    public Guid TargetEntityId { get; }
    public decimal Rating { get; }
    public Guid ModeratorId { get; }
    public string? ModeratorNote { get; }

    public ReviewApprovedEvent(Guid reviewId, Guid targetEntityId, decimal rating, Guid moderatorId, string? moderatorNote)
    {
        ReviewId = reviewId;
        TargetEntityId = targetEntityId;
        Rating = rating;
        ModeratorId = moderatorId;
        ModeratorNote = moderatorNote;
    }
}

/// <summary>
/// Domain event fired when review is rejected by moderator.
/// </summary>
public class ReviewRejectedEvent : BaseEvent
{
    public Guid ReviewId { get; }
    public Guid TargetEntityId { get; }
    public Guid ModeratorId { get; }
    public string RejectionReason { get; }

    public ReviewRejectedEvent(Guid reviewId, Guid targetEntityId, Guid moderatorId, string rejectionReason)
    {
        ReviewId = reviewId;
        TargetEntityId = targetEntityId;
        ModeratorId = moderatorId;
        RejectionReason = rejectionReason;
    }
}

/// <summary>
/// Domain event fired when review is flagged for moderation.
/// </summary>
public class ReviewFlaggedEvent : BaseEvent
{
    public Guid ReviewId { get; }
    public Guid ReporterId { get; }
    public ReviewFlagReason Reason { get; }
    public string? Description { get; }

    public ReviewFlaggedEvent(Guid reviewId, Guid reporterId, ReviewFlagReason reason, string? description)
    {
        ReviewId = reviewId;
        ReporterId = reporterId;
        Reason = reason;
        Description = description;
    }
}

/// <summary>
/// Domain event fired when reply is added to review.
/// </summary>
public class ReviewReplyAddedEvent : BaseEvent
{
    public Guid ReviewId { get; }
    public Guid ReplyId { get; }
    public Guid AuthorId { get; }

    public ReviewReplyAddedEvent(Guid reviewId, Guid replyId, Guid authorId)
    {
        ReviewId = reviewId;
        ReplyId = replyId;
        AuthorId = authorId;
    }
}

/// <summary>
/// Domain event fired when reply is removed from review.
/// </summary>
public class ReviewReplyRemovedEvent : BaseEvent
{
    public Guid ReviewId { get; }
    public Guid ReplyId { get; }
    public Guid RequestingUserId { get; }

    public ReviewReplyRemovedEvent(Guid reviewId, Guid replyId, Guid requestingUserId)
    {
        ReviewId = reviewId;
        ReplyId = replyId;
        RequestingUserId = requestingUserId;
    }
}

/// <summary>
/// Domain event fired when new reply is submitted.
/// </summary>
public class ReplySubmittedEvent : BaseEvent
{
    public Guid ReplyId { get; }
    public Guid ParentReviewId { get; }
    public Guid AuthorId { get; }

    public ReplySubmittedEvent(Guid replyId, Guid parentReviewId, Guid authorId)
    {
        ReplyId = replyId;
        ParentReviewId = parentReviewId;
        AuthorId = authorId;
    }
}


/// <summary>
/// Defines a keyword that, when found in a positive review, maps to a specific i18n key for display.
/// </summary>
public class ReviewHighlightKeyword : BaseEntity<Guid>
{
    [Required, MaxLength(50)]
    public string Keyword { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string I18nKey { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string LanguageCode { get; set; } = "nl-NL"; // e.g., "nl-NL", "en-US"
}

/// <summary>
/// Defines a keyword that links a review's content to a specific product feature for targeted rating calculation.
/// </summary>
public class FeatureRatingKeyword : BaseEntity<Guid>
{
    [Required, MaxLength(50)]
    public string FeatureKey { get; set; } = string.Empty; // e.g., "cuddleFactor", "durability"

    [Required, MaxLength(50)]
    public string Keyword { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string LanguageCode { get; set; } = "nl-NL";
}


public class ReviewStatusResetToPendingEvent : BaseEvent
{
    public Guid ReviewId { get; }
    public Guid TargetEntityId { get; }
    public Guid ModeratorId { get; }
    public string? ModeratorNote { get; }

    public ReviewStatusResetToPendingEvent(Guid reviewId, Guid targetEntityId, Guid moderatorId, string? moderatorNote)
    {
        ReviewId = reviewId;
        TargetEntityId = targetEntityId;
        ModeratorId = moderatorId;
        ModeratorNote = moderatorNote;
    }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/Shipping.cs ---
/**
 * @file Shipping.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description Domain models for the Shipping bounded context, including ShippingZone, ShippingMethod, and ShippingRate.
 */
using System.ComponentModel.DataAnnotations;
using RoyalCode.Domain.Common;
using Ardalis.GuardClauses;

namespace RoyalCode.Domain.Entities.Shipping;

public class ShippingZone : BaseAuditableEntity<Guid>
{
    [Required, MaxLength(100)]
    public string Name { get; private set; } = string.Empty;

    private readonly List<string> _countryCodes = new();
    public IReadOnlyCollection<string> CountryCodes => _countryCodes.AsReadOnly();

    public bool IsActive { get; private set; }

    private ShippingZone() { }

    public ShippingZone(string name, IEnumerable<string> countryCodes)
    {
        Guard.Against.NullOrWhiteSpace(name, nameof(name));
        Guard.Against.NullOrEmpty(countryCodes, nameof(countryCodes));

        Id = Guid.NewGuid();
        Name = name;
        _countryCodes.AddRange(countryCodes.Select(cc => cc.ToUpperInvariant()));
        IsActive = true;
    }
}

public class ShippingMethod : BaseAuditableEntity<Guid>
{
    [Required, MaxLength(100)]
    public string Name { get; private set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; private set; }

    [MaxLength(50)]
    public string? EstimatedDeliveryTime { get; private set; } // e.g., "1-2 werkdagen"

    public bool IsActive { get; private set; }

    private readonly List<ShippingRate> _rates = new();
    public IReadOnlyCollection<ShippingRate> Rates => _rates.AsReadOnly();

    public Guid ShippingZoneId { get; private set; }
    public ShippingZone ShippingZone { get; private set; } = null!;


    private ShippingMethod() { }

    public ShippingMethod(Guid shippingZoneId, string name, string? description, string? estimatedDeliveryTime)
    {
        Guard.Against.Default(shippingZoneId, nameof(shippingZoneId));
        Guard.Against.NullOrWhiteSpace(name, nameof(name));

        Id = Guid.NewGuid();
        ShippingZoneId = shippingZoneId;
        Name = name;
        Description = description;
        EstimatedDeliveryTime = estimatedDeliveryTime;
        IsActive = true;
    }

    public void AddRate(decimal cost, decimal? minOrderValue = null, decimal? maxOrderValue = null)
    {
        var rate = new ShippingRate(Id, cost, minOrderValue, maxOrderValue);
        _rates.Add(rate);
    }
}

public class ShippingRate : BaseEntity<Guid>
{
    public Guid ShippingMethodId { get; private set; }
    public decimal Cost { get; private set; }
    public decimal? MinOrderValue { get; private set; }
    public decimal? MaxOrderValue { get; private set; }

    private ShippingRate() { }

    public ShippingRate(Guid shippingMethodId, decimal cost, decimal? minOrderValue, decimal? maxOrderValue)
    {
        Guard.Against.Default(shippingMethodId, nameof(shippingMethodId));
        Guard.Against.Negative(cost, nameof(cost));

        Id = Guid.NewGuid();
        ShippingMethodId = shippingMethodId;
        Cost = cost;
        MinOrderValue = minOrderValue;
        MaxOrderValue = maxOrderValue;
    }

    public bool IsApplicable(decimal orderValue)
    {
        bool minOk = !MinOrderValue.HasValue || orderValue >= MinOrderValue.Value;
        bool maxOk = !MaxOrderValue.HasValue || orderValue <= MaxOrderValue.Value;
        return minOk && maxOk;
    }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/SocialFeedModels.cs ---
/**
 * @file SocialFeedModels.cs
 * @Version 4.2.0 (DEFINITIVE CONSTRUCTOR FIX)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-01
 * @Description Definitive domain models where collection backing fields are initialized
 *              at declaration to prevent NullReferenceExceptions regardless of constructor usage.
 */
using System.ComponentModel.DataAnnotations;
using RoyalCode.Domain.Enums.Social;
using RoyalCode.Domain.Exceptions;

namespace RoyalCode.Domain.Entities.Social;

public class FeedDefinition : BaseAuditableEntity<Guid>
{
    [Required, MaxLength(100)]
    public string Name { get; private set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Slug { get; private set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; private set; }

    public bool IsPublic { get; private set; }

    private FeedDefinition() { }

    public FeedDefinition(string name, string slug, string? description = null, bool isPublic = true)
    {
        Id = Guid.NewGuid();
        Name = name;
        Slug = slug;
        Description = description;
        IsPublic = isPublic;
    }
}

public class FeedItem : BaseAuditableEntity<Guid>
{
    [Required, MaxLength(100)]
    public string FeedId { get; private set; } = string.Empty;

    [Required]
    public Guid AuthorId { get; private set; }

    public string? Text { get; private set; }

    // --- DE DEFINITIEVE FIX: Initialiseer collecties direct bij declaratie ---
    private readonly List<Guid> _mediaIds = new();
    public IReadOnlyCollection<Guid> MediaIds => _mediaIds.AsReadOnly();

    public string? GifUrl { get; private set; }

    private readonly List<FeedReaction> _reactions = new();
    public IReadOnlyCollection<FeedReaction> Reactions => _reactions.AsReadOnly();
    private readonly List<string> _tags = new();
    public IReadOnlyCollection<string> Tags => _tags.AsReadOnly();

    public int ReplyCount { get; private set; }
    public bool IsEdited { get; private set; }
    public bool IsPinned { get; private set; }
    public bool IsHidden { get; private set; }
    public bool IsSaved { get; private set; }
    public PrivacyLevel Privacy { get; private set; }
    public bool IsDeleted { get; private set; }

    private FeedItem() { } // EF Core constructor is nu leeg, de initializers doen het werk.

    public FeedItem(string feedId, Guid authorId, PrivacyLevel privacy, string? text = null, string? gifUrl = null)
    {
        Id = Guid.NewGuid();
        FeedId = feedId ?? throw new ArgumentNullException(nameof(feedId));
        if (authorId == Guid.Empty) throw new ArgumentException("AuthorId cannot be empty.", nameof(authorId));
        AuthorId = authorId;
        Privacy = privacy;
        Text = text;
        GifUrl = gifUrl;
        ReplyCount = 0;
        IsEdited = false;
        IsPinned = false;
        IsHidden = false;
        IsSaved = false;
        IsDeleted = false;
    }

    public void UpdatePrivacy(PrivacyLevel privacy)
    {
        Privacy = privacy;
    }

    public void UpdateContent(string? text, string? gifUrl, IEnumerable<Guid>? mediaIds = null)
    {
        Text = text;
        GifUrl = gifUrl;

        if (mediaIds != null)
        {
            _mediaIds.Clear();
            _mediaIds.AddRange(mediaIds);
        }

        IsEdited = true;
    }

    public void AddMedia(Guid mediaId)
    {
        if (!_mediaIds.Contains(mediaId))
            _mediaIds.Add(mediaId);
    }

    public void AddTag(string tag)
    {
        if (!string.IsNullOrWhiteSpace(tag) && !_tags.Contains(tag, StringComparer.OrdinalIgnoreCase))
            _tags.Add(tag.Trim());
    }

    public void Pin() => IsPinned = true;
    public void Unpin() => IsPinned = false;
    public void Hide() => IsHidden = true;
    public void Show() => IsHidden = false;
    public void Save() => IsSaved = true;
    public void Unsave() => IsSaved = false;

    public void IncrementReplyCount() => ReplyCount++;
    public void DecrementReplyCount()
    {
        if (ReplyCount > 0) ReplyCount--;
    }

    public void SetReaction(Guid userId, ReactionType? reactionType)
    {
        var existingReaction = _reactions.FirstOrDefault(r => r.UserId == userId);
        if (reactionType is null)
        {
            if (existingReaction != null) _reactions.Remove(existingReaction);
        }
        else
        {
            if (existingReaction != null) existingReaction.UpdateType(reactionType.Value);
            else _reactions.Add(new FeedReaction(Id, null, userId, reactionType.Value));
        }
    }

    public List<ReactionSummary> GetReactionSummary() => _reactions.GroupBy(r => r.Type).Select(g => new ReactionSummary { Type = g.Key, Count = g.Count() }).ToList();
    public ReactionType? GetUserReaction(Guid userId) => _reactions.FirstOrDefault(r => r.UserId == userId)?.Type;
    public void SoftDelete() => IsDeleted = true;
}

public class FeedReply : BaseAuditableEntity<Guid>
{
    [Required] public Guid ParentId { get; private set; }
    [Required, MaxLength(100)] public string FeedId { get; private set; } = string.Empty;
    [Required] public Guid AuthorId { get; private set; }
    public Guid? ReplyToReplyId { get; private set; }
    public string? Text { get; private set; }

    // --- DE DEFINITIEVE FIX: Initialiseer collecties direct bij declaratie ---
    private readonly List<Guid> _mediaIds = new();
    public IReadOnlyCollection<Guid> MediaIds => _mediaIds.AsReadOnly();
    public string? GifUrl { get; private set; }
    private readonly List<FeedReaction> _reactions = new();
    public IReadOnlyCollection<FeedReaction> Reactions => _reactions.AsReadOnly();

    public bool IsEdited { get; private set; }
    public bool IsDeleted { get; private set; }
    public int? Level { get; private set; }

    private FeedReply() { } // EF Core constructor is nu leeg.

    public FeedReply(Guid parentId, string feedId, Guid authorId, string? text, Guid? replyToReplyId = null, int? level = null)
    {
        Id = Guid.NewGuid();
        ParentId = parentId;
        FeedId = feedId ?? throw new ArgumentNullException(nameof(feedId));
        if (authorId == Guid.Empty) throw new ArgumentException("AuthorId cannot be empty.", nameof(authorId));
        AuthorId = authorId;
        ReplyToReplyId = replyToReplyId;
        Text = text;
        Level = level;
        IsEdited = false;
        IsDeleted = false;
    }

    public void UpdateContent(string? text)
    {
        Text = text;
        IsEdited = true;
    }

    public void SoftDelete() => IsDeleted = true;

    public void SetReaction(Guid userId, ReactionType? reactionType)
    {
        var existingReaction = _reactions.FirstOrDefault(r => r.UserId == userId);
        if (reactionType is null)
        {
            if (existingReaction != null) _reactions.Remove(existingReaction);
        }
        else
        {
            if (existingReaction != null) existingReaction.UpdateType(reactionType.Value);
            else _reactions.Add(new FeedReaction(null, Id, userId, reactionType.Value));
        }
    }

    public List<ReactionSummary> GetReactionSummary() => IsDeleted ? new List<ReactionSummary>() : _reactions.GroupBy(r => r.Type).Select(g => new ReactionSummary { Type = g.Key, Count = g.Count() }).ToList();
    public ReactionType? GetUserReaction(Guid userId) => IsDeleted ? null : _reactions.FirstOrDefault(r => r.UserId == userId)?.Type;
}

public class FeedReaction : BaseEntity<Guid>
{
    public Guid? FeedItemId { get; private set; }
    public Guid? FeedReplyId { get; private set; }
    [Required] public Guid UserId { get; private set; }
    [Required] public ReactionType Type { get; private set; }

    private FeedReaction() { }

    public FeedReaction(Guid? feedItemId, Guid? feedReplyId, Guid userId, ReactionType type)
    {
        if (feedItemId == null && feedReplyId == null)
            throw new DomainException("Reaction must be associated with either a FeedItem or a FeedReply.");

        Id = Guid.NewGuid();
        FeedItemId = feedItemId;
        FeedReplyId = feedReplyId;
        UserId = userId;
        Type = type;
    }

    public void UpdateType(ReactionType newType) => Type = newType;
}

public class ReactionSummary
{
    public ReactionType Type { get; set; }
    public int Count { get; set; }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/TodoItem.cs ---
using RoyalCode.Domain.Enums.Priority;

namespace RoyalCode.Domain.Entities.ToDo;

public class TodoItem : BaseAuditableEntity<int>
{
    public int ListId { get; set; }

    public string? Title { get; set; }

    public string? Note { get; set; }

    public PriorityLevel Priority { get; set; }

    public DateTime? Reminder { get; set; }

    private bool _done;
    public bool Done
    {
        get => _done;
        set
        {
            if (value && !_done)
            {
                AddDomainEvent(new TodoItemCompletedEvent(this));
            }

            _done = value;
        }
    }

    public TodoList List { get; set; } = null!;
}
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/TodoList.cs ---
namespace RoyalCode.Domain.Entities.ToDo;

public class TodoList : BaseAuditableEntity<int>
{
    public string? Title { get; set; }

    public Colour Colour { get; set; } = Colour.White;

    public IList<TodoItem> Items { get; private set; } = new List<TodoItem>();
}
--- END OF FILE ---

--- START OF FILE src/Domain/Entities/Wishlist.cs ---
/**
 * @file Wishlist.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description Domain model for the Wishlist aggregate.
 */
using System.ComponentModel.DataAnnotations;
using Ardalis.GuardClauses;

namespace RoyalCode.Domain.Entities.User;

public class Wishlist : BaseAuditableEntity<Guid>
{
    public Guid UserId { get; private set; }

    private readonly List<WishlistItem> _items = new();
    public IReadOnlyCollection<WishlistItem> Items => _items.AsReadOnly();

    [Timestamp] public byte[]? RowVersion { get; private set; }
    private Wishlist() { } // For EF Core

    public Wishlist(Guid userId)
    {
        Guard.Against.Default(userId, nameof(userId));
        Id = Guid.NewGuid();
        UserId = userId;
    }

    public void AddItem(Guid productId, Guid? variantId)
    {
        // Business Rule: Voorkom duplicaten van exact hetzelfde product/variant.
        var existingItem = _items.FirstOrDefault(i => i.ProductId == productId && i.VariantId == variantId);
        if (existingItem != null)
        {
            // Item is al in de wishlist, doe niets.
            return;
        }

        var newItem = new WishlistItem(Id, productId, variantId);
        _items.Add(newItem);
    }

    public void RemoveItem(Guid wishlistItemId)
    {
        var itemToRemove = _items.FirstOrDefault(i => i.Id == wishlistItemId);
        if (itemToRemove != null)
        {
            _items.Remove(itemToRemove);
        }
    }
}

public class WishlistItem : BaseEntity<Guid>
{
    public Guid WishlistId { get; private set; }
    public Guid ProductId { get; private set; }
    public Guid? VariantId { get; private set; }
    public DateTimeOffset AddedAt { get; private set; }

    private WishlistItem() { } // For EF Core

    internal WishlistItem(Guid wishlistId, Guid productId, Guid? variantId)
    {
        Guard.Against.Default(wishlistId, nameof(wishlistId));
        Guard.Against.Default(productId, nameof(productId));

        Id = Guid.NewGuid();
        WishlistId = wishlistId;
        ProductId = productId;
        VariantId = variantId;
        AddedAt = DateTimeOffset.UtcNow;
    }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/AddressType.cs ---
/**
* @file AddressType.cs
* @Version 1.0.0
* @Author Royal-Code MonorepoAppDevAI
* @Date 2025-07-05
* @GeneratedBy Royal-Code MonorepoAppDevAI
* @PromptSummary Implementeer een GET /api/Users/addresses endpoint.
* @Description Enum voor de verschillende typen adressen.
*/
namespace RoyalCode.Domain.Enums;

public enum AddressType
{
    Shipping,
    Billing,
    Home,
    Work,
    Other
}
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/ChatEnums.cs ---
/**
 * @file ChatEnums.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Centralized enumerations for the Chat bounded context.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Refactor Chat domain models into correct files and namespaces.
 */
namespace RoyalCode.Domain.Enums.Chat;

public enum ConversationType
{
    DirectMessage,
    AiChat,
    GroupChat,
    CustomerSupport
}


public enum MessageType
{
    Text,
    Image,
    File,
    System,
    Voice,
    Video
}

public enum MessageStatus
{
    Sending,
    Sent,
    Delivered,
    Read,
    Failed
}

public enum AiProviderType
{
    OpenAI_GPT4,
    Google_Gemini,
    Anthropic_Claude,
    Local_LLM,
    Azure_OpenAI
}

public enum ConversationRole
{
    Guest,    // Minimal permissions
    Member,   // Standard participant
    Admin,    // Can manage conversation
    Owner     // Full control
}
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/GameplayDifficulty.cs ---
/**
* @file GameplayDifficulty.cs
* @Version 1.0.0
* @Author Royal-Code MonorepoAppDevAI
* @Date 2025-07-05
* @GeneratedBy Royal-Code MonorepoAppDevAI
* @PromptSummary Implementeer een GET /api/Users/settings endpoint.
* @Description Enum voor de moeilijkheidsgraad in de gameplay-instellingen.
*/
namespace RoyalCode.Domain.Enums;

public enum GameplayDifficulty
{
    Easy,
    Normal,
    Hard
}
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/MediaGalleryView.cs ---
/**
* @file MediaGalleryView.cs
* @Version 1.0.0
* @Author Royal-Code MonorepoAppDevAI
* @Date 2025-07-05
* @GeneratedBy Royal-Code MonorepoAppDevAI
* @PromptSummary Implementeer een GET /api/Users/settings endpoint.
* @Description Enum voor de weergave-instellingen van de media-galerij.
*/
namespace RoyalCode.Domain.Enums;

public enum MediaGalleryView
{
    SidebarView,
    InfiniteGridView
}
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/MediaTypes.cs ---
/**
 * @file MediaDomainTypes.cs
 * @version 12.0.0 (Enterprise Enhanced)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-06-29
 * @description Domain enumerations and value objects for the Media bounded context.
 *              Implements digital asset management with advanced processing and delivery optimization.
 */

namespace RoyalCode.Domain.Enums.Media;

#region Core Media Enumerations

/// <summary>
/// Primary media type classification driving polymorphic behavior and processing workflows.
/// </summary>
public enum MediaType
{
    Image,
    Video,
    Audio,
    Document,
    Archive,
    Other
}

/// <summary>
/// Media processing pipeline status for async workflow management.
/// </summary>
public enum MediaProcessingStatus
{
    /// <summary>Media uploaded, awaiting processing.</summary>
    Pending,
    /// <summary>Media currently being processed.</summary>
    Processing,
    /// <summary>Processing completed successfully.</summary>
    Completed,
    /// <summary>Processing failed with errors.</summary>
    Failed,
    /// <summary>Processing manually skipped.</summary>
    Skipped
}

/// <summary>
/// Content moderation status for public visibility control.
/// </summary>
public enum ContentModerationStatus
{
    /// <summary>Awaiting moderation review.</summary>
    Pending,
    /// <summary>Approved for public use.</summary>
    Approved,
    /// <summary>Rejected due to policy violations.</summary>
    Rejected,
    /// <summary>Flagged for manual review.</summary>
    Flagged
}

/// <summary>
/// Media access types for analytics and usage tracking.
/// </summary>
public enum MediaAccessType
{
    /// <summary>Media was viewed/displayed.</summary>
    View,
    /// <summary>Media was downloaded.</summary>
    Download,
    /// <summary>Media was streamed.</summary>
    Stream,
    /// <summary>Media thumbnail was accessed.</summary>
    Thumbnail
}

/// <summary>
/// Image source classification for content management and attribution.
/// </summary>
public enum ImageSourceType
{
    /// <summary>Provided by supplier or vendor.</summary>
    Supplier,
    /// <summary>Generated using AI tools.</summary>
    AiGenerated,
    /// <summary>Uploaded by user.</summary>
    UserUploaded,
    /// <summary>System default or placeholder.</summary>
    SystemDefault,
    /// <summary>Licensed stock photography.</summary>
    StockPhoto,
    /// <summary>Screenshot or screen capture.</summary>
    Screenshot,
    /// <summary>Professional photography.</summary>
    Professional,
    /// <summary>User-generated content.</summary>
    UserGenerated
}

/// <summary>
/// Video quality classifications for streaming and delivery optimization.
/// </summary>
public enum VideoQuality
{
    /// <summary>240p - Ultra low quality for preview.</summary>
    UltraLow,
    /// <summary>360p - Low quality for bandwidth-constrained environments.</summary>
    Low,
    /// <summary>480p - Standard definition.</summary>
    Standard,
    /// <summary>720p - High definition.</summary>
    HD,
    /// <summary>1080p - Full high definition.</summary>
    FullHD,
    /// <summary>1440p - Quad HD.</summary>
    QuadHD,
    /// <summary>2160p - Ultra high definition (4K).</summary>
    UltraHD,
    /// <summary>4320p - 8K resolution.</summary>
    EightK
}

/// <summary>
/// Media tag type classification for organization and search optimization.
/// </summary>
public enum MediaTagType
{
    /// <summary>User-defined custom tag.</summary>
    Custom,
    /// <summary>Automatically generated from AI analysis.</summary>
    AutoGenerated,
    /// <summary>Extracted from metadata.</summary>
    Metadata,
    /// <summary>Category classification.</summary>
    Category,
    /// <summary>Content-based descriptive tag.</summary>
    Descriptive,
    /// <summary>Technical specification tag.</summary>
    Technical
}

#endregion

#region Value Objects

/// <summary>
/// Image dimensions value object with aspect ratio calculations and validation.
/// </summary>
public record ImageDimensions
{
    /// <summary>Width in pixels</summary>
    public int Width { get; init; }

    /// <summary>Height in pixels</summary>
    public int Height { get; init; }

    /// <summary>Calculated aspect ratio</summary>
    public decimal AspectRatio => Height > 0 ? (decimal)Width / Height : 0;

    /// <summary>Total pixel count</summary>
    public long PixelCount => (long)Width * Height;

    /// <summary>Common aspect ratio description</summary>
    public string AspectRatioDescription
    {
        get
        {
            var ratio = AspectRatio;
            return ratio switch
            {
                >= 1.77m and <= 1.78m => "16:9 (Widescreen)",
                >= 1.33m and <= 1.34m => "4:3 (Standard)",
                >= 1.49m and <= 1.51m => "3:2 (Photo)",
                >= 0.99m and <= 1.01m => "1:1 (Square)",
                >= 0.74m and <= 0.76m => "3:4 (Portrait)",
                >= 0.56m and <= 0.57m => "9:16 (Mobile)",
                _ => $"{Width}:{Height}"
            };
        }
    }

    /// <summary>Orientation classification</summary>
    public ImageOrientation Orientation
    {
        get
        {
            if (Width > Height) return ImageOrientation.Landscape;
            if (Height > Width) return ImageOrientation.Portrait;
            return ImageOrientation.Square;
        }
    }

    public ImageDimensions(int width, int height)
    {
        if (width <= 0)
            throw new ArgumentOutOfRangeException(nameof(width), "Width must be positive.");
        if (height <= 0)
            throw new ArgumentOutOfRangeException(nameof(height), "Height must be positive.");

        Width = width;
        Height = height;
    }

    /// <summary>
    /// Creates dimensions from megapixel count with 16:9 ratio.
    /// </summary>
    public static ImageDimensions FromMegapixels(decimal megapixels, decimal aspectRatio = 16.0m / 9.0m)
    {
        var totalPixels = (long)(megapixels * 1_000_000);
        var width = (int)Math.Sqrt((double)(totalPixels * aspectRatio));
        var height = (int)(width / aspectRatio);

        return new ImageDimensions(width, height);
    }

    /// <summary>
    /// Scales dimensions maintaining aspect ratio.
    /// </summary>
    public ImageDimensions ScaleToFit(int maxWidth, int maxHeight)
    {
        var scaleX = (decimal)maxWidth / Width;
        var scaleY = (decimal)maxHeight / Height;
        var scale = Math.Min(scaleX, scaleY);

        return new ImageDimensions(
            (int)(Width * scale),
            (int)(Height * scale));
    }

    /// <summary>
    /// Gets formatted size description.
    /// </summary>
    public override string ToString() => $"{Width}�{Height}";
}

/// <summary>
/// Image orientation classification.
/// </summary>
public enum ImageOrientation
{
    Landscape,
    Portrait,
    Square
}

/// <summary>
/// Media optimization configuration for delivery performance.
/// </summary>
public record MediaOptimizationSettings
{
    /// <summary>Enable WebP format conversion for browsers that support it</summary>
    public bool EnableWebP { get; init; } = true;

    /// <summary>Enable AVIF format for next-gen compression</summary>
    public bool EnableAVIF { get; init; } = false;

    /// <summary>JPEG quality setting (1-100)</summary>
    public int JpegQuality { get; init; } = 85;

    /// <summary>WebP quality setting (1-100)</summary>
    public int WebPQuality { get; init; } = 80;

    /// <summary>Enable progressive JPEG encoding</summary>
    public bool ProgressiveJpeg { get; init; } = true;

    /// <summary>Strip metadata for privacy and file size reduction</summary>
    public bool StripMetadata { get; init; } = true;

    /// <summary>Maximum file size in bytes (null = no limit)</summary>
    public long? MaxFileSizeBytes { get; init; }

    /// <summary>Responsive breakpoints for variant generation</summary>
    public List<int> ResponsiveBreakpoints { get; init; } = new() { 320, 768, 1024, 1440, 1920 };

    public MediaOptimizationSettings() { }

    /// <summary>
    /// Creates settings optimized for web delivery.
    /// </summary>
    public static MediaOptimizationSettings WebOptimized => new()
    {
        EnableWebP = true,
        EnableAVIF = true,
        JpegQuality = 75,
        WebPQuality = 70,
        ProgressiveJpeg = true,
        StripMetadata = true,
        MaxFileSizeBytes = 2 * 1024 * 1024 // 2MB limit
    };

    /// <summary>
    /// Creates settings optimized for high quality.
    /// </summary>
    public static MediaOptimizationSettings HighQuality => new()
    {
        EnableWebP = true,
        EnableAVIF = false,
        JpegQuality = 95,
        WebPQuality = 90,
        ProgressiveJpeg = true,
        StripMetadata = false,
        MaxFileSizeBytes = null
    };

    /// <summary>
    /// Creates settings optimized for mobile delivery.
    /// </summary>
    public static MediaOptimizationSettings MobileOptimized => new()
    {
        EnableWebP = true,
        EnableAVIF = true,
        JpegQuality = 60,
        WebPQuality = 55,
        ProgressiveJpeg = true,
        StripMetadata = true,
        MaxFileSizeBytes = 500 * 1024, // 500KB limit
        ResponsiveBreakpoints = new() { 320, 480, 768 }
    };
}

/// <summary>
/// Video encoding specifications for streaming optimization.
/// </summary>
public record VideoEncodingSettings
{
    /// <summary>Video codec (H.264, H.265, VP9, AV1)</summary>
    public string Codec { get; init; } = "H.264";

    /// <summary>Video bitrate in kbps</summary>
    public int VideoBitrate { get; init; }

    /// <summary>Audio bitrate in kbps</summary>
    public int AudioBitrate { get; init; } = 128;

    /// <summary>Frame rate (fps)</summary>
    public decimal FrameRate { get; init; } = 30;

    /// <summary>Video quality setting</summary>
    public VideoQuality Quality { get; init; }

    /// <summary>Enable HLS streaming manifest generation</summary>
    public bool GenerateHLS { get; init; } = false;

    /// <summary>Enable DASH streaming manifest generation</summary>
    public bool GenerateDASH { get; init; } = false;

    public VideoEncodingSettings(VideoQuality quality, int videoBitrate)
    {
        Quality = quality;
        VideoBitrate = videoBitrate;
    }

    /// <summary>
    /// Gets preset encoding settings for common quality levels.
    /// </summary>
    public static VideoEncodingSettings GetPreset(VideoQuality quality)
    {
        return quality switch
        {
            VideoQuality.UltraLow => new(quality, 400) { FrameRate = 24 },
            VideoQuality.Low => new(quality, 800) { FrameRate = 30 },
            VideoQuality.Standard => new(quality, 1500) { FrameRate = 30 },
            VideoQuality.HD => new(quality, 3000) { FrameRate = 30 },
            VideoQuality.FullHD => new(quality, 6000) { FrameRate = 30 },
            VideoQuality.QuadHD => new(quality, 12000) { FrameRate = 30 },
            VideoQuality.UltraHD => new(quality, 25000) { FrameRate = 30 },
            VideoQuality.EightK => new(quality, 50000) { FrameRate = 30 },
            _ => new(VideoQuality.Standard, 1500)
        };
    }
}

/// <summary>
/// Media usage analytics for performance tracking and optimization insights.
/// </summary>
public record MediaAnalytics
{
    /// <summary>Total view count</summary>
    public long ViewCount { get; init; }

    /// <summary>Total download count</summary>
    public long DownloadCount { get; init; }

    /// <summary>Average load time in milliseconds</summary>
    public double AverageLoadTimeMs { get; init; }

    /// <summary>Most popular variant size</summary>
    public string? PopularVariantSize { get; init; }

    /// <summary>Geographic usage distribution</summary>
    public Dictionary<string, long> GeographicDistribution { get; init; } = new();

    /// <summary>Device type breakdown</summary>
    public Dictionary<string, long> DeviceTypeBreakdown { get; init; } = new();

    /// <summary>Bandwidth usage in bytes</summary>
    public long TotalBandwidthBytes { get; init; }

    /// <summary>Peak usage timestamp</summary>
    public DateTimeOffset? PeakUsageTime { get; init; }

    public MediaAnalytics() { }

    /// <summary>
    /// Calculates engagement score based on views and interactions.
    /// </summary>
    public double EngagementScore
    {
        get
        {
            var totalInteractions = ViewCount + DownloadCount;
            if (totalInteractions == 0) return 0;

            // Weighted score: downloads worth more than views
            return (ViewCount * 1.0 + DownloadCount * 2.0) / 100.0;
        }
    }

    /// <summary>
    /// Gets performance rating based on load times and usage.
    /// </summary>
    public MediaPerformanceRating PerformanceRating
    {
        get
        {
            return AverageLoadTimeMs switch
            {
                < 100 => MediaPerformanceRating.Excellent,
                < 300 => MediaPerformanceRating.Good,
                < 800 => MediaPerformanceRating.Average,
                < 2000 => MediaPerformanceRating.Poor,
                _ => MediaPerformanceRating.VeryPoor
            };
        }
    }

    /// <summary>
    /// Formats bandwidth usage for display.
    /// </summary>
    public string FormattedBandwidth
    {
        get
        {
            var bytes = TotalBandwidthBytes;
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double len = bytes;
            int order = 0;

            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }

            return $"{len:0.##} {sizes[order]}";
        }
    }
}

/// <summary>
/// Media performance rating classification.
/// </summary>
public enum MediaPerformanceRating
{
    VeryPoor,
    Poor,
    Average,
    Good,
    Excellent
}

/// <summary>
/// CDN configuration for global content delivery optimization.
/// </summary>
public record CdnConfiguration
{
    /// <summary>CDN provider name</summary>
    public string Provider { get; init; } = string.Empty;

    /// <summary>CDN endpoint URL</summary>
    public string EndpointUrl { get; init; } = string.Empty;

    /// <summary>Cache TTL in seconds</summary>
    public int CacheTtlSeconds { get; init; } = 3600;

    /// <summary>Edge locations for geographic distribution</summary>
    public List<string> EdgeLocations { get; init; } = new();

    /// <summary>Enable compression</summary>
    public bool CompressionEnabled { get; init; } = true;

    /// <summary>Custom headers for delivery</summary>
    public Dictionary<string, string> CustomHeaders { get; init; } = new();

    public CdnConfiguration(string provider, string endpointUrl)
    {
        Provider = provider;
        EndpointUrl = endpointUrl;
    }

    /// <summary>
    /// Creates AWS CloudFront configuration.
    /// </summary>
    public static CdnConfiguration CloudFront(string distributionDomain) => new("AWS CloudFront", distributionDomain)
    {
        CacheTtlSeconds = 86400, // 24 hours
        CompressionEnabled = true,
        CustomHeaders = new()
        {
            ["Cache-Control"] = "public, max-age=31536000",
            ["X-Content-Type-Options"] = "nosniff"
        }
    };

    /// <summary>
    /// Creates Cloudflare configuration.
    /// </summary>
    public static CdnConfiguration Cloudflare(string zoneDomain) => new("Cloudflare", zoneDomain)
    {
        CacheTtlSeconds = 14400, // 4 hours
        CompressionEnabled = true,
        CustomHeaders = new()
        {
            ["CF-Cache-Status"] = "HIT",
            ["Vary"] = "Accept-Encoding"
        }
    };
}

#endregion
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/OrderStatus.cs ---
/**
 * @file OrderStatus.cs
 * @Version 2.0.0 (Ultimate Spec)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-19
 * @Description Defines the comprehensive, granular states of an order lifecycle for the backend.
 */
namespace RoyalCode.Domain.Enums;

public enum OrderStatus
{
    // Initiële statussen
    PendingPayment,     // Betaling is geïnitieerd, wacht op bevestiging
    PaymentFailed,      // Betaling mislukt
    AwaitingFulfillment, // Betaling succesvol, wacht op verwerking/voorbereiding
    Processing,         // Order wordt verwerkt (items verzamelen, inpakken)

    // Verzending statussen
    Shipped,            // Order is verzonden, tracking info beschikbaar
    InTransit,          // Order onderweg (update van verzendprovider)
    Delivered,          // Order is geleverd

    // Einde-van-levenscyclus statussen
    Completed,          // Order is afgehandeld, geen verdere actie vereist
    Cancelled,          // Order geannuleerd (door klant of admin, voor verzending)
    RefundPending,      // Terugbetaling aangevraagd
    PartiallyRefunded,  // Gedeeltelijk terugbetaald
    FullyRefunded,      // Volledig terugbetaald

    // Speciale statussen
    OnHold              // Order vastgehouden wegens problemen (bijv. adres, fraude)
}
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/PriceModifierType.cs ---
namespace RoyalCode.Domain.Enums.Product;

/**
 * @enum PriceModifierType
 * @description
 *   Defines the calculation method for a price modification. This enum serves as an
 *   unambiguous contract for `VariantAttributeValue`, specifying how its `PriceModifier`
 *   value should be interpreted and applied to a product's base price.
 */
public enum PriceModifierType
{
    /**
     * @member Fixed
     * @description
     *   The price modifier represents a fixed, absolute amount to be added to
     *   (or subtracted from, if negative) the base price.
     *   Example: A modifier of 5.00m results in `basePrice + 5.00m`.
     */
    Fixed,

    /**
     * @member Percentage
     * @description
     *   The price modifier represents a percentage of the base price.
     *   Example: A modifier of 10.0m results in `basePrice + (basePrice * 0.10m)`.
     */
    Percentage
}
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/PriorityLevel.cs ---
namespace RoyalCode.Domain.Enums.Priority;

public enum PriorityLevel
{
    None = 0,
    Low = 1,
    Medium = 2,
    High = 3
}
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/ProductDomainTypes.cs ---
using System.Runtime.Serialization;
using System.Text.Json.Serialization;

/**
 * @file ProductDomainTypes.cs
 * @version 12.0.0 (Enterprise Enhanced)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-06-29
 * @description Domain enumerations and value objects for the Product bounded context.
 *              Implements pure domain concepts following DDD principles with immutable value objects.
 */

namespace RoyalCode.Domain.Enums.Product;

#region Core Product Enumerations

/// <summary>
/// Defines primary product classifications driving polymorphic behavior and business rules.
/// </summary>
public enum ProductType
{
    Physical,
    DigitalProduct,
    VirtualGameItem,
    Service
}

/// <summary>
/// Product lifecycle states controlling visibility and business workflows.
/// </summary>
public enum ProductStatus
{
    /// <summary>Product under development, not customer-visible.</summary>
    Draft,
    /// <summary>Live product available for purchase.</summary>
    Published,
    /// <summary>Discontinued product preserved for historical data.</summary>
    Archived,
    /// <summary>Product scheduled for future activation.</summary>
    Scheduled
}

/// <summary>
/// Inventory availability states for customer communication and fulfillment planning.
/// </summary>
public enum StockStatus
{
    Undefined,
    InStock,
    OutOfStock,
    OnBackorder,
    PreOrder,
    Discontinued,
    LimitedStock,
    ComingSoon
}

/// <summary>
/// Price modification calculation methods for promotional pricing.
/// </summary>
public enum DiscountType
{
    Percentage,
    FixedAmount
}

#endregion

#region Service and Digital Product Enumerations

/// <summary>
/// Subscription billing frequencies for service revenue models.
/// </summary>
public enum ServiceBillingCycle
{
    OneTime,
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    Annually,
    BiAnnually
}

/// <summary>
/// Service delivery methods determining fulfillment logistics.
/// </summary>
public enum ServiceDeliveryMethod
{
    RemoteOnline,
    OnSiteCustomer,
    OnSiteProvider,
    PhysicalItemInteraction
}

/// <summary>
/// Digital product delivery mechanisms for content fulfillment.
/// </summary>
public enum DigitalProductDeliveryType
{
    DirectDownload,
    EmailDelivery,
    AccountEntitlement,
    ExternalServiceAccess,
    InstantDownload
}

#endregion

#region Product Variation System

/// <summary>
/// Attribute types for product variation system supporting diverse product characteristics.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum VariantAttributeType
{
    [EnumMember(Value = "color")] Color,
    [EnumMember(Value = "size")] Size,
    [EnumMember(Value = "material")] Material,
    [EnumMember(Value = "style")] Style,
    [EnumMember(Value = "flavor")] Flavor,
    [EnumMember(Value = "scent")] Scent,
    [EnumMember(Value = "pattern")] Pattern,
    [EnumMember(Value = "finish")] Finish,
    [EnumMember(Value = "capacity")] Capacity,
    [EnumMember(Value = "power")] Power,
    [EnumMember(Value = "connectivity")] Connectivity,
    [EnumMember(Value = "language")] Language,
    [EnumMember(Value = "platform")] Platform,
    [EnumMember(Value = "licenseType")] LicenseType,
    [EnumMember(Value = "duration")] Duration,
    [EnumMember(Value = "rarity")] Rarity,
    [EnumMember(Value = "level")] Level,
    [EnumMember(Value = "tier")] Tier,
    [EnumMember(Value = "custom")] Custom,
    [EnumMember(Value = "other")] Other // BELANGRIJK: Zorg dat deze bestaat
}


#endregion

#region Value Objects

/// <summary>
/// Immutable pricing value object with business logic for discount calculations and validation.
/// </summary>
public record Pricing
{
    /// <summary>Current selling price</summary>
    public decimal Price { get; init; }

    /// <summary>Original price before discounts</summary>
    public decimal OriginalPrice { get; init; }

    /// <summary>Indicates if the product is currently on sale</summary>
    public bool IsOnSale => Price < OriginalPrice;

    /// <summary>Absolute discount amount</summary>
    public decimal DiscountAmount => OriginalPrice - Price;

    /// <summary>Discount percentage (0-100)</summary>
    public decimal DiscountPercentage => OriginalPrice > 0
        ? Math.Round((DiscountAmount / OriginalPrice) * 100, 2)
        : 0;

    /// <summary>Savings amount for customer display</summary>
    public string FormattedSavings(string currencySymbol = "€") =>
        IsOnSale ? $"Save {currencySymbol}{DiscountAmount:F2} ({DiscountPercentage}%)" : string.Empty;

    public Pricing(decimal price, decimal originalPrice)
    {
        if (price < 0)
            throw new ArgumentException("Price must be positive", nameof(price));
        if (originalPrice < 0)
            throw new ArgumentException("Original price must be positive", nameof(originalPrice));
        if (price > originalPrice)
            throw new ArgumentException("Sale price cannot exceed original price", nameof(price));

        Price = price;
        OriginalPrice = originalPrice;
    }

    /// <summary>Creates pricing without discount</summary>
    public static Pricing Standard(decimal price) => new(price, price);

    /// <summary>Creates discounted pricing</summary>
    public static Pricing WithDiscount(decimal originalPrice, decimal discountPercentage)
    {
        if (discountPercentage < 0 || discountPercentage > 100)
            throw new ArgumentException("Discount percentage must be between 0 and 100");

        var discountAmount = originalPrice * (discountPercentage / 100);
        var salePrice = originalPrice - discountAmount;
        return new Pricing(salePrice, originalPrice);
    }
}

/// <summary>
/// Tax configuration for products supporting various tax jurisdictions and rates.
/// </summary>
/// <param name="IsTaxable">Tax liability flag</param>
/// <param name="TaxClassId">Reference to tax classification system</param>
/// <param name="VatRatePercent">Specific VAT rate override</param>
public record ProductTax(bool IsTaxable, Guid? TaxClassId = null, decimal? VatRatePercent = null);

/// <summary>
/// Promotional discount configuration with temporal validity.
/// </summary>
/// <param name="Id">Discount identifier</param>
/// <param name="Type">Calculation method (percentage/fixed)</param>
/// <param name="Value">Discount amount or percentage</param>
/// <param name="IsActive">Current activation state</param>
/// <param name="StartDate">Discount activation timestamp</param>
/// <param name="EndDate">Discount expiration timestamp</param>
/// <param name="Description">Marketing description</param>
public record ProductDiscount(
    Guid Id,
    DiscountType Type,
    decimal Value,
    bool IsActive,
    DateTimeOffset? StartDate,
    DateTimeOffset? EndDate,
    string? Description);

/// <summary>
/// Product specification for customer-facing technical details.
/// </summary>
/// <param name="SpecKey">Internal specification identifier</param>
/// <param name="LabelKeyOrText">Customer-facing label</param>
/// <param name="ValueKeyOrText">Specification value</param>
/// <param name="Icon">Visual representation identifier</param>
/// <param name="GroupKeyOrText">Specification grouping</param>
/// <param name="DisplayOrder">Sort order for presentation</param>
public record ProductDisplaySpecification(
    string SpecKey,
    string LabelKeyOrText,
    string ValueKeyOrText,
    string? Icon,
    string? GroupKeyOrText,
    int? DisplayOrder);

/// <summary>
/// Supply chain information for cost tracking and procurement.
/// </summary>
/// <param name="Id">Supplier entity identifier</param>
/// <param name="Name">Supplier company name</param>
/// <param name="ProductUrlAtSupplier">External product reference</param>
/// <param name="SupplierSku">Supplier's product identifier</param>
/// <param name="CostPrice">Wholesale cost basis</param>
public record SupplierInfo(
    Guid? Id,
    string? Name,
    string? ProductUrlAtSupplier,
    string? SupplierSku,
    decimal? CostPrice);

/// <summary>
/// Shipping requirements and logistics configuration.
/// </summary>
/// <param name="RequiresShipping">Physical shipping necessity</param>
/// <param name="ShippingClassId">Shipping rate classification</param>
/// <param name="FreeShippingOverride">Promotional shipping override</param>
public record ProductShipping(
    bool RequiresShipping,
    string? ShippingClassId,
    bool FreeShippingOverride);

/// <summary>
/// Business rules for order quantity constraints and bulk purchasing.
/// </summary>
/// <param name="MinOrderQuantity">Minimum purchasable quantity</param>
/// <param name="MaxOrderQuantity">Maximum purchasable quantity</param>
/// <param name="QuantityIncrements">Required quantity step intervals</param>
public record ProductAvailabilityRules(
    int? MinOrderQuantity,
    int? MaxOrderQuantity,
    int? QuantityIncrements)
{
    public bool IsActive { get; init; } = true;
};

/// <summary>
/// Game mechanics configuration for virtual items including gameplay effects.
/// </summary>
/// <param name="ItemCategory">Functional classification</param>
/// <param name="Rarity">Scarcity designation</param>
/// <param name="UsageLimit">Consumption constraints</param>
/// <param name="StatBoostsJson">Serialized gameplay effects</param>
/// <param name="RequiredUserLevel">Access level requirement</param>
/// <param name="IsStackable">Inventory stacking capability</param>
/// <param name="EquipmentSlot">Character equipment location</param>
/// <param name="IsTradeable">Player-to-player transfer capability</param>
public record VirtualItemProperties(
    string ItemCategory,
    string? Rarity,
    int? UsageLimit,
    string? StatBoostsJson,
    int? RequiredUserLevel,
    bool IsStackable,
    string? EquipmentSlot,
    bool IsTradeable);

/// <summary>
/// Attribute selection within a product variant combination.
/// </summary>
/// <param name="AttributeValueId">Reference to selected attribute value</param>
public record VariantAttributeSelection(Guid AttributeValueId);

/// <summary>
/// In-game currency pricing for virtual items supporting multiple game economies.
/// </summary>
/// <param name="CurrencyId">Game currency identifier</param>
/// <param name="Amount">Price in specified currency</param>
public record InGameCurrencyPrice(string CurrencyId, decimal Amount);

/// <summary>
/// Age restrictions for products, defining minimum and maximum ages.
/// </summary>
/// <param name="MinAge">Minimum required age.</param>
/// <param name="MaxAge">Maximum allowed age (e.g., 99 for no upper limit).</param>
public record AgeRestrictions(int MinAge, int MaxAge);

#endregion

public enum UiFilterType
{
    ColorSwatch,
    RadioButtons,
    Checkboxes,
    Dropdown
}
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/ProfileVisibility.cs ---
/**
* @file ProfileVisibility.cs
* @Version 1.0.0
* @Author Royal-Code MonorepoAppDevAI
* @Date 2025-07-05
* @GeneratedBy Royal-Code MonorepoAppDevAI
* @PromptSummary Implementeer een GET /api/Users/settings endpoint.
* @Description Enum voor de privacy-instellingen van een gebruikersprofiel.
*/
namespace RoyalCode.Domain.Enums;

public enum ProfileVisibility
{
    Public,
    FriendsOnly,
    Private
}
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/ReturnReason.cs ---
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoyalCode.Domain.Enums;
public enum ReturnReason
{
    ItemDoesNotFit,
    DamagedOrDefective,
    WrongItemReceived,
    ChangedMind,
    BetterPriceFound,
    Other
}
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/ReviewTypes.cs ---
/**
 * @file ReviewDomainTypes.cs
 * @version 3.0.0 (Enterprise Enhanced)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-06-29
 * @description Domain enumerations and value objects for the Review bounded context.
 *              Implements customer feedback system with moderation workflows and engagement tracking.
 */

namespace RoyalCode.Domain.Enums.Review;

#region Core Review Enumerations

/// <summary>
/// Lifecycle states for review moderation and publication workflow.
/// </summary>
public enum ReviewStatus
{
    /// <summary>Review submitted, awaiting moderation approval.</summary>
    Pending,
    /// <summary>Review approved and visible to customers.</summary>
    Approved,
    /// <summary>Review rejected by moderation team.</summary>
    Rejected,
    /// <summary>Review flagged for manual review due to reports.</summary>
    Flagged
}

/// <summary>
/// Supported entity types that can receive customer reviews.
/// </summary>
public enum ReviewTargetEntityType
{
    Product,
    Service,
    Vendor,
    Store,
    DeliveryExperience,
    CustomerService,
    Node,
    Challenge
}

/// <summary>
/// Sentiment classification derived from rating and text analysis.
/// </summary>
public enum ReviewSentiment
{
    Negative,
    Neutral,
    Positive
}

/// <summary>
/// Predefined reasons for flagging reviews requiring moderation attention.
/// </summary>
public enum ReviewFlagReason
{
    /// <summary>Contains offensive or inappropriate language.</summary>
    InappropriateContent,
    /// <summary>Suspected fake or fraudulent review.</summary>
    Spam,
    /// <summary>Review contains misleading or false information.</summary>
    Misinformation,
    /// <summary>Contains personal attacks or harassment.</summary>
    PersonalAttack,
    /// <summary>Contains promotional content or advertising.</summary>
    Promotional,
    /// <summary>Violates platform guidelines or terms of service.</summary>
    ViolatesGuidelines,
    /// <summary>Contains profanity or vulgar language.</summary>
    Profanity,
    /// <summary>Other reason requiring manual review.</summary>
    Other
}

#endregion

#region Value Objects

/// <summary>
/// User credibility classification for review weighting and display.
/// </summary>
public enum UserCredibilityLevel
{
    /// <summary>User without verified purchase history.</summary>
    Unverified,
    /// <summary>Verified user with few reviews.</summary>
    Newcomer,
    /// <summary>Verified user with moderate review activity.</summary>
    Regular,
    /// <summary>Verified user with significant review history.</summary>
    Experienced,
    /// <summary>Verified user with extensive review contributions.</summary>
    Expert
}

/// <summary>
/// Review moderation action record for audit trails and workflow tracking.
/// </summary>
public record ModerationAction
{
    /// <summary>Unique identifier for this moderation action</summary>
    public Guid Id { get; init; }

    /// <summary>Moderator who performed the action</summary>
    public Guid ModeratorId { get; init; }

    /// <summary>Type of moderation action taken</summary>
    public ModerationActionType ActionType { get; init; }

    /// <summary>Reason or notes for the moderation decision</summary>
    public string? Reason { get; init; }

    /// <summary>Timestamp when action was performed</summary>
    public DateTimeOffset ActionTimestamp { get; init; }

    public ModerationAction(Guid moderatorId, ModerationActionType actionType, string? reason = null)
    {
        Id = Guid.NewGuid();
        ModeratorId = moderatorId;
        ActionType = actionType;
        Reason = reason;
        ActionTimestamp = DateTimeOffset.UtcNow;
    }
}

/// <summary>
/// Types of moderation actions for review workflow tracking.
/// </summary>
public enum ModerationActionType
{
    Approved,
    Rejected,
    Flagged,
    Unflagged,
    Edited,
    Deleted,
    FeaturedStatusChanged
}

/// <summary>
/// Review metrics aggregation for analytics and display optimization.
/// </summary>
public record ReviewMetrics
{
    /// <summary>Total number of reviews</summary>
    public int TotalReviews { get; init; }

    /// <summary>Average rating across all reviews</summary>
    public decimal AverageRating { get; init; }

    /// <summary>Rating distribution breakdown</summary>
    public RatingDistribution Distribution { get; init; }

    /// <summary>Percentage of verified purchase reviews</summary>
    public decimal VerifiedPurchasePercentage { get; init; }

    /// <summary>Most recent review timestamp</summary>
    public DateTimeOffset? LastReviewDate { get; init; }

    public ReviewMetrics(int totalReviews, decimal averageRating, RatingDistribution distribution,
        decimal verifiedPurchasePercentage, DateTimeOffset? lastReviewDate = null)
    {
        TotalReviews = Math.Max(0, totalReviews);
        AverageRating = Math.Clamp(averageRating, 0, 5);
        Distribution = distribution;
        VerifiedPurchasePercentage = Math.Clamp(verifiedPurchasePercentage, 0, 100);
        LastReviewDate = lastReviewDate;
    }

    /// <summary>
    /// Creates empty metrics for entities without reviews.
    /// </summary>
    public static ReviewMetrics Empty => new(0, 0, RatingDistribution.Empty, 0);
}

/// <summary>
/// Star rating distribution for detailed review analytics.
/// </summary>
public record RatingDistribution
{
    public int FiveStars { get; init; }
    public int FourStars { get; init; }
    public int ThreeStars { get; init; }
    public int TwoStars { get; init; }
    public int OneStar { get; init; }

    public int TotalRatings => FiveStars + FourStars + ThreeStars + TwoStars + OneStar;

    public RatingDistribution(int fiveStars, int fourStars, int threeStars, int twoStars, int oneStar)
    {
        FiveStars = Math.Max(0, fiveStars);
        FourStars = Math.Max(0, fourStars);
        ThreeStars = Math.Max(0, threeStars);
        TwoStars = Math.Max(0, twoStars);
        OneStar = Math.Max(0, oneStar);
    }

    /// <summary>
    /// Gets percentage for specific star rating.
    /// </summary>
    public decimal GetPercentage(int stars)
    {
        if (TotalRatings == 0) return 0;

        var count = stars switch
        {
            5 => FiveStars,
            4 => FourStars,
            3 => ThreeStars,
            2 => TwoStars,
            1 => OneStar,
            _ => 0
        };

        return Math.Round((decimal)count / TotalRatings * 100, 1);
    }

    /// <summary>
    /// Empty distribution for new entities.
    /// </summary>
    public static RatingDistribution Empty => new(0, 0, 0, 0, 0);
}

#endregion
--- END OF FILE ---

--- START OF FILE src/Domain/Enums/SocialTypes.cs ---
/**
 * @file SocialEnums.cs
 * @Version 1.2.0 (FINAL Namespace and Enum Placement Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Centralized enumerations for the Social Feed bounded context, now with correct, un-nested namespace.
 */
using System.ComponentModel.DataAnnotations; 

namespace RoyalCode.Domain.Enums.Social; 

public enum PrivacyLevel
{
    [Display(Name = "public")]
    Public,

    [Display(Name = "friends")]
    Friends,

    [Display(Name = "private")]
    Private
}

public enum ReactionType
{
    [Display(Name = "like")]
    Like,

    [Display(Name = "love")]
    Love,

    [Display(Name = "haha")]
    Haha,

    [Display(Name = "wow")]
    Wow,

    [Display(Name = "sad")]
    Sad,

    [Display(Name = "angry")]
    Angry
}
--- END OF FILE ---

--- START OF FILE src/Domain/Events/OrderCreatedEvent.cs ---
using RoyalCode.Domain.Entities.Order;
namespace RoyalCode.Domain.Events.Order;

public class OrderCreatedEvent : BaseEvent
{
    public OrderCreatedEvent(RoyalCode.Domain.Entities.Order.Order order)
    {
        Order = order;
    }
    public RoyalCode.Domain.Entities.Order.Order Order { get; }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Events/TodoItemCompletedEvent.cs ---
using RoyalCode.Domain.Entities.ToDo;

namespace RoyalCode.Domain.Events;

public class TodoItemCompletedEvent : BaseEvent
{
    public TodoItemCompletedEvent(TodoItem item)
    {
        Item = item;
    }

    public TodoItem Item { get; }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Events/TodoItemCreatedEvent.cs ---
using RoyalCode.Domain.Entities.ToDo;

namespace RoyalCode.Domain.Events;

public class TodoItemCreatedEvent : BaseEvent
{
    public TodoItemCreatedEvent(TodoItem item)
    {
        Item = item;
    }

    public TodoItem Item { get; }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Events/TodoItemDeletedEvent.cs ---
using RoyalCode.Domain.Entities.ToDo;

namespace RoyalCode.Domain.Events;

public class TodoItemDeletedEvent : BaseEvent
{
    public TodoItemDeletedEvent(TodoItem item)
    {
        Item = item;
    }

    public TodoItem Item { get; }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Exceptions/DomainException.cs ---
/**
 * @file DomainException.cs
 * @Version 1.1.0 (With Inner Exception)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description A custom, generic exception for the Domain layer to enforce business rules.
 */
namespace RoyalCode.Domain.Exceptions;

public class DomainException : Exception
{
    public string? ErrorCode { get; }

    public DomainException(string message) : base(message) { }

    public DomainException(string message, Exception innerException) : base(message, innerException) { }

    public DomainException(string message, string errorCode) : base(message)
    {
        ErrorCode = errorCode;
    }
}

public class ChatDomainException : DomainException
{
    public ChatDomainException(string message) : base(message) { }
    public ChatDomainException(string message, Exception innerException) : base(message, innerException) { }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Exceptions/UnsupportedColourException.cs ---
namespace RoyalCode.Domain.Exceptions;

public class UnsupportedColourException : Exception
{
    public UnsupportedColourException(string code)
        : base($"Colour \"{code}\" is unsupported.")
    {
    }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Extensions/MediaExtensions.cs ---
/**
 * @file MediaExtensions.cs
 * @version 1.0.0
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-06-29
 * @description Extension methods for fluent media configuration and enhanced functionality.
 */

using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Enums.Media;

namespace RoyalCode.Domain.Extensions;

/// <summary>
/// Extension methods for fluent media configuration and enhanced readability.
/// </summary>
public static class MediaExtensions
{
    /// <summary>
    /// Fluently adds multiple tags to media.
    /// </summary>
    public static T WithTags<T>(this T media, params string[] tags) where T : MediaBase
    {
        media.AddTags(tags);
        return media;
    }

    /// <summary>
    /// Fluently adds multiple tags with specific type.
    /// </summary>
    public static T WithTags<T>(this T media, MediaTagType tagType, params string[] tags) where T : MediaBase
    {
        media.AddTags(tags, tagType);
        return media;
    }

    /// <summary>
    /// Fluently sets media visibility.
    /// </summary>
    public static T AsPublic<T>(this T media, bool isPublic = true) where T : MediaBase
    {
        if (media.IsReadyForPublicUse())
            media.SetVisibility(isPublic);
        return media;
    }

    /// <summary>
    /// Fluently sets CDN configuration.
    /// </summary>
    public static T WithCdn<T>(this T media, string cdnUrl, string? provider = null) where T : MediaBase
    {
        media.SetCdnConfiguration(cdnUrl, provider);
        return media;
    }

    /// <summary>
    /// Fluently sets thumbnail.
    /// </summary>
    public static T WithThumbnail<T>(this T media, string thumbnailUrl) where T : MediaBase
    {
        media.SetThumbnail(thumbnailUrl);
        return media;
    }

    /// <summary>
    /// Records media access in a fluent way.
    /// </summary>
    public static T RecordView<T>(this T media, Guid? userId = null) where T : MediaBase
    {
        media.RecordAccess(MediaAccessType.View, userId);
        return media;
    }

    /// <summary>
    /// Records media download in a fluent way.
    /// </summary>
    public static T RecordDownload<T>(this T media, Guid? userId = null) where T : MediaBase
    {
        media.RecordAccess(MediaAccessType.Download, userId);
        return media;
    }

    /// <summary>
    /// Creates a media processing workflow builder.
    /// </summary>
    public static MediaProcessingBuilder ForProcessing(this MediaBase media)
    {
        return new MediaProcessingBuilder(media);
    }

    /// <summary>
    /// Creates a media optimization workflow builder.
    /// </summary>
    public static MediaOptimizationBuilder ForOptimization(this MediaBase media)
    {
        return new MediaOptimizationBuilder(media);
    }

    /// <summary>
    /// Determines if media is suitable for responsive delivery.
    /// </summary>
    public static bool IsResponsiveReady(this MediaBase media)
    {
        return media is ImageMedia img &&
               img.HasVariants &&
               img.IsProcessed &&
               img.IsReadyForPublicUse();
    }

    /// <summary>
    /// Gets file size in human-readable format.
    /// </summary>
    public static string GetFormattedFileSize(this MediaBase media)
    {
        return media.DisplaySize;
    }

    /// <summary>
    /// Gets time since upload for display purposes.
    /// </summary>
    public static string GetUploadTimeAgo(this MediaBase media)
    {
        var timeSpan = DateTimeOffset.UtcNow - media.Created;

        return timeSpan.TotalDays switch
        {
            < 1 => "Today",
            < 2 => "Yesterday",
            < 7 => $"{(int)timeSpan.TotalDays} days ago",
            < 30 => $"{(int)(timeSpan.TotalDays / 7)} weeks ago",
            < 365 => $"{(int)(timeSpan.TotalDays / 30)} months ago",
            _ => $"{(int)(timeSpan.TotalDays / 365)} years ago"
        };
    }
}

/// <summary>
/// Extension methods specific to ImageMedia.
/// </summary>
public static class ImageMediaExtensions
{
    /// <summary>
    /// Fluently adds image variants.
    /// </summary>
    public static ImageMedia WithVariant(this ImageMedia image, ImageVariant variant)
    {
        image.AddVariant(variant);
        return image;
    }

    /// <summary>
    /// Fluently sets image dimensions.
    /// </summary>
    public static ImageMedia WithDimensions(this ImageMedia image, int width, int height)
    {
        image.SetOriginalDimensions(width, height);
        return image;
    }

    /// <summary>
    /// Fluently sets dominant colors.
    /// </summary>
    public static ImageMedia WithColors(this ImageMedia image, params string[] colors)
    {
        image.SetDominantColors(colors);
        return image;
    }

    /// <summary>
    /// Fluently updates alt text.
    /// </summary>
    public static ImageMedia WithAltText(this ImageMedia image, string altText)
    {
        image.UpdateAltText(altText);
        return image;
    }

    /// <summary>
    /// Creates responsive variant builder.
    /// </summary>
    public static ResponsiveImageBuilder AsResponsive(this ImageMedia image)
    {
        return new ResponsiveImageBuilder(image);
    }

    /// <summary>
    /// Gets best variant for specified constraints.
    /// </summary>
    public static ImageVariant? GetVariantForWidth(this ImageMedia image, int targetWidth)
    {
        return image.GetBestVariant(targetWidth);
    }

    /// <summary>
    /// Determines if image is suitable for hero/banner use.
    /// </summary>
    public static bool IsHeroWorthy(this ImageMedia image)
    {
        if (image.OriginalDimensions == null) return false;

        return image.OriginalDimensions.Width >= 1920 &&
               image.OriginalDimensions.Height >= 800 &&
               image.OriginalDimensions.AspectRatio >= 1.5m &&
               image.IsReadyForPublicUse();
    }

    /// <summary>
    /// Gets image orientation description.
    /// </summary>
    public static string GetOrientationDescription(this ImageMedia image)
    {
        return image.OriginalDimensions?.Orientation.ToString() ?? "Unknown";
    }
}

/// <summary>
/// Extension methods specific to VideoMedia.
/// </summary>
public static class VideoMediaExtensions
{
    /// <summary>
    /// Fluently sets video metadata.
    /// </summary>
    public static VideoMedia WithVideoDetails(this VideoMedia video, int duration, int width, int height,
        VideoQuality? quality = null)
    {
        video.UpdateVideoMetadata(duration, width, height, null, quality);
        return video;
    }

    /// <summary>
    /// Fluently sets poster image.
    /// </summary>
    public static VideoMedia WithPoster(this VideoMedia video, string posterUrl)
    {
        video.UpdateVideoMetadata(video.DurationSeconds, video.Width, video.Height, posterUrl);
        return video;
    }

    /// <summary>
    /// Fluently configures streaming.
    /// </summary>
    public static VideoMedia WithStreaming(this VideoMedia video, string manifestUrl)
    {
        video.SetStreamingConfiguration(manifestUrl);
        return video;
    }

    /// <summary>
    /// Determines if video is suitable for streaming.
    /// </summary>
    public static bool IsStreamingReady(this VideoMedia video)
    {
        return video.IsStreamingOptimized &&
               !string.IsNullOrEmpty(video.StreamingManifestUrl) &&
               video.IsReadyForPublicUse();
    }

    /// <summary>
    /// Gets video aspect ratio description.
    /// </summary>
    public static string GetAspectRatioDescription(this VideoMedia video)
    {
        if (!video.Width.HasValue || !video.Height.HasValue) return "Unknown";

        var ratio = (decimal)video.Width.Value / video.Height.Value;
        return ratio switch
        {
            >= 1.77m and <= 1.78m => "16:9 (Widescreen)",
            >= 1.33m and <= 1.34m => "4:3 (Standard)",
            >= 0.56m and <= 0.57m => "9:16 (Vertical)",
            _ => $"{video.Width}:{video.Height}"
        };
    }
}

/// <summary>
/// Builder pattern for media processing workflows.
/// </summary>
public class MediaProcessingBuilder
{
    private readonly MediaBase _media;

    internal MediaProcessingBuilder(MediaBase media)
    {
        _media = media;
    }

    /// <summary>
    /// Starts the processing workflow.
    /// </summary>
    public MediaProcessingBuilder Start()
    {
        _media.StartProcessing();
        return this;
    }

    /// <summary>
    /// Marks processing as completed.
    /// </summary>
    public MediaProcessingBuilder Complete()
    {
        _media.CompleteProcessing();
        return this;
    }

    /// <summary>
    /// Marks processing as failed.
    /// </summary>
    public MediaProcessingBuilder Fail(string reason)
    {
        _media.FailProcessing(reason);
        return this;
    }

    /// <summary>
    /// Returns the processed media.
    /// </summary>
    public MediaBase Build() => _media;
}

/// <summary>
/// Builder pattern for media optimization workflows.
/// </summary>
public class MediaOptimizationBuilder
{
    private readonly MediaBase _media;

    internal MediaOptimizationBuilder(MediaBase media)
    {
        _media = media;
    }

    /// <summary>
    /// Sets CDN configuration.
    /// </summary>
    public MediaOptimizationBuilder WithCdn(CdnConfiguration config)
    {
        _media.SetCdnConfiguration(config.EndpointUrl, config.Provider);
        return this;
    }

    /// <summary>
    /// Sets optimized URL.
    /// </summary>
    public MediaOptimizationBuilder WithOptimizedUrl(string optimizedUrl)
    {
        _media.SetOptimizedUrl(optimizedUrl);
        return this;
    }

    /// <summary>
    /// Configures for public visibility.
    /// </summary>
    public MediaOptimizationBuilder AsPublic()
    {
        if (_media.IsReadyForPublicUse())
            _media.SetVisibility(true);
        return this;
    }

    /// <summary>
    /// Returns the optimized media.
    /// </summary>
    public MediaBase Build() => _media;
}

/// <summary>
/// Builder pattern for responsive image configuration.
/// </summary>
public class ResponsiveImageBuilder
{
    private readonly ImageMedia _image;
    private readonly List<ImageVariant> _variants = new();

    internal ResponsiveImageBuilder(ImageMedia image)
    {
        _image = image;
    }

    /// <summary>
    /// Adds a responsive variant.
    /// </summary>
    public ResponsiveImageBuilder AddVariant(int width, int height, string format, string purpose)
    {
        var variant = new ImageVariant($"variant_{width}x{height}.{format}", width, height, format, purpose);
        _variants.Add(variant);
        return this;
    }

    /// <summary>
    /// Adds standard responsive breakpoints.
    /// </summary>
    public ResponsiveImageBuilder WithStandardBreakpoints(string format = "webp")
    {
        var breakpoints = new[] { 320, 480, 768, 1024, 1440, 1920 };

        foreach (var width in breakpoints)
        {
            if (_image.OriginalDimensions != null)
            {
                var scaled = _image.OriginalDimensions.ScaleToFit(width, int.MaxValue);
                AddVariant(scaled.Width, scaled.Height, format, $"responsive-{width}w");
            }
        }

        return this;
    }

    /// <summary>
    /// Builds and applies all variants to the image.
    /// </summary>
    public ImageMedia Build()
    {
        foreach (var variant in _variants)
        {
            _image.AddVariant(variant);
        }
        return _image;
    }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Extensions/ProductExtensions.cs ---
/**
 * @file ProductExtensions.cs
 * @version 1.2.0 (FIXED - Updated for new ProductBase methods)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-09-04
 * @description Extension methods for fluent product configuration, now using the new
 *              collection management methods on ProductBase.
 */

using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Domain.Extensions;

/// <summary>
/// Extension methods for fluent product configuration and improved readability.
/// </summary>
public static class ProductExtensions
{
    /// <summary>
    /// Fluently adds multiple media items to a product.
    /// </summary>
    public static T WithMedia<T>(this T product, params Guid[] mediaIds) where T : ProductBase
    {
        foreach (var mediaId in mediaIds)
            product.AddMedia(mediaId);
        return product;
    }

    /// <summary>
    /// Fluently adds multiple tags to a product.
    /// </summary>
    public static T WithTags<T>(this T product, params string[] tags) where T : ProductBase
    {
        foreach (var tag in tags)
            product.AddTag(tag);
        return product;
    }

    /// <summary>
    /// Fluently adds multiple categories to a product.
    /// </summary>
    public static T WithCategories<T>(this T product, params Guid[] categoryIds) where T : ProductBase
    {
        foreach (var categoryId in categoryIds)
            product.AddCategory(categoryId);
        return product;
    }

    /// <summary>
    /// Fluently sets product as featured.
    /// </summary>
    public static T AsFeatured<T>(this T product, bool featured = true) where T : ProductBase
    {
        product.SetFeaturedStatus(featured);
        return product;
    }

    /// <summary>
    /// Fluently sets short description.
    /// </summary>
    public static T WithShortDescription<T>(this T product, string? shortDescription) where T : ProductBase
    {
        product.SetShortDescription(shortDescription);
        return product;
    }

    /// <summary>
    /// Creates a product family configuration for linked variants.
    /// Usage: product.AsProductFamily().WithLinkedVariant("SKU-SMALL", smallProductId, new VariantAttributeSelection(sizeAttributeId))
    /// </summary>
    public static ProductFamilyBuilder AsProductFamily(this ProductBase product)
    {
        return new ProductFamilyBuilder(product);
    }
}

/// <summary>
/// Builder pattern for configuring product families with linked variants.
/// </summary>
public class ProductFamilyBuilder
{
    private readonly ProductBase _product;

    internal ProductFamilyBuilder(ProductBase product)
    {
        _product = product;
    }

    /// <summary>
    /// Adds a linked product variant to the family.
    /// </summary>
    public ProductFamilyBuilder WithLinkedVariant(
        string sku,
        Guid linkedProductId,
        params VariantAttributeSelection[] attributes)
    {
        // Converteer de collectie van VariantAttributeSelection naar IEnumerable<Guid>
        // door de AttributeValueId property uit elk item te selecteren.
        _product.AddLinkedProductVariant(sku, linkedProductId, attributes.Select(a => a.AttributeValueId));
        return this;
    }

    /// <summary>
    /// Adds a linked product variant with attribute builder.
    /// </summary>
    public ProductFamilyBuilder WithLinkedVariant(
        string sku,
        Guid linkedProductId,
        Action<List<VariantAttributeSelection>> attributeBuilder)
    {
        var attributes = new List<VariantAttributeSelection>();
        attributeBuilder(attributes);

        // Converteer de collectie van VariantAttributeSelection naar IEnumerable<Guid>
        // door de AttributeValueId property uit elk item te selecteren.
        _product.AddLinkedProductVariant(sku, linkedProductId, attributes.Select(a => a.AttributeValueId));
        return this;
    }

    /// <summary>
    /// Returns the configured product.
    /// </summary>
    public ProductBase Build() => _product;
}
--- END OF FILE ---

--- START OF FILE src/Domain/Extensions/ReviewExtensions.cs ---
/**
 * @file ReviewExtensions.cs
 * @version 3.1.0 (FINAL - No UserProfile Reference)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-31
 * @description Extension methods for fluent review configuration, now without UserProfile references.
 */

using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Enums.Review;

namespace RoyalCode.Domain.Extensions;

/// <summary>
/// Extension methods for fluent review configuration and enhanced readability.
/// </summary>
public static class ReviewExtensions
{
    /// <summary>
    /// Fluently adds multiple media attachments to a review.
    /// </summary>
    public static Review WithMedia(this Review review, params Guid[] mediaIds)
    {
        foreach (var mediaId in mediaIds)
            review.AddMedia(mediaId);
        return review;
    }

    /// <summary>
    /// Fluently adds a reply to the review.
    /// </summary>
    public static Review WithReply(this Review review, Guid authorId, string replyText) // <-- GEFIXED
    {
        review.AddReply(authorId, replyText); // <-- GEFIXED
        return review;
    }

    /// <summary>
    /// Fluently sets review as verified purchase.
    /// </summary>
    public static Review AsVerifiedPurchase(this Review review)
    {
        // Note: This would typically be set during construction based on order history
        // This is more for testing/seeding scenarios
        return review;
    }

    /// <summary>
    /// Creates a review moderation workflow builder.
    /// </summary>
    public static ReviewModerationBuilder ForModeration(this Review review)
    {
        return new ReviewModerationBuilder(review);
    }

    /// <summary>
    /// Determines if review should be featured prominently.
    /// </summary>
    public static bool ShouldBeFeatured(this Review review)
    {
        return review.IsFeaturedWorthy() && review.GetQualityScore() >= 70;
    }

    /// <summary>
    /// Gets time since review was created for display purposes.
    /// </summary>
    public static string GetTimeAgoDisplay(this Review review)
    {
        var timeSpan = DateTimeOffset.UtcNow - review.Created;

        return timeSpan.TotalDays switch
        {
            < 1 => "Today",
            < 2 => "Yesterday",
            < 7 => $"{(int)timeSpan.TotalDays} days ago",
            < 30 => $"{(int)(timeSpan.TotalDays / 7)} weeks ago",
            < 365 => $"{(int)(timeSpan.TotalDays / 30)} months ago",
            _ => $"{(int)(timeSpan.TotalDays / 365)} years ago"
        };
    }
}

/// <summary>
/// Builder pattern for complex review moderation workflows.
/// </summary>
public class ReviewModerationBuilder
{
    private readonly Review _review;

    internal ReviewModerationBuilder(Review review)
    {
        _review = review;
    }

    /// <summary>
    /// Approves the review with optional moderator note.
    /// </summary>
    public ReviewModerationBuilder Approve(Guid moderatorId, string? note = null)
    {
        _review.Approve(moderatorId, note);
        return this;
    }

    /// <summary>
    /// Rejects the review with required reason.
    /// </summary>
    public ReviewModerationBuilder Reject(Guid moderatorId, string reason)
    {
        _review.Reject(moderatorId, reason);
        return this;
    }

    /// <summary>
    /// Flags the review for further review.
    /// </summary>
    public ReviewModerationBuilder Flag(Guid reporterId, ReviewFlagReason reason, string? description = null)
    {
        _review.Flag(reporterId, reason, description);
        return this;
    }

    /// <summary>
    /// Returns the moderated review.
    /// </summary>
    public Review Complete() => _review;
}

/// <summary>
/// Extensions for ReviewReply entities.
/// </summary>
public static class ReviewReplyExtensions
{
    /// <summary>
    /// Gets nested reply depth for UI display formatting.
    /// </summary>
    public static int GetNestingDepth(this ReviewReply reply)
    {
        return reply.ParentReplyId.HasValue ? 1 : 0; // Simple 2-level nesting for now
    }

    /// <summary>
    /// Determines if reply can be nested further.
    /// </summary>
    public static bool CanAddNestedReply(this ReviewReply reply)
    {
        return !reply.ParentReplyId.HasValue; // Only allow 2 levels of nesting
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/ApplicationDbContext.cs ---
using System.Reflection;
using Dapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities;
using RoyalCode.Domain.Entities.Cart;
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Entities.Order;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Entities.Shipping;
using RoyalCode.Domain.Entities.Social;
using RoyalCode.Domain.Entities.ToDo;
using RoyalCode.Domain.Entities.User;
using RoyalCode.Infrastructure.Identity;

namespace RoyalCode.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // === AGGREGATE ROOTS ===
    public DbSet<ProductBase> Products => Set<ProductBase>();
    public DbSet<AttributeValue> AttributeValues => Set<AttributeValue>();
    public DbSet<MediaBase> Media => Set<MediaBase>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<ReviewReply> ReviewReplies => Set<ReviewReply>();
    public DbSet<ReviewHighlightKeyword> ReviewHighlightKeywords => Set<ReviewHighlightKeyword>();
    public DbSet<FeatureRatingKeyword> FeatureRatingKeywords => Set<FeatureRatingKeyword>();
    public DbSet<CartBase> Carts => Set<CartBase>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<TodoItem> TodoItems => Set<TodoItem>();
    public DbSet<TodoList> TodoLists => Set<TodoList>();
    public DbSet<CustomAttributeDefinition> CustomAttributeDefinitions => Set<CustomAttributeDefinition>();
    public DbSet<DisplaySpecificationDefinition> DisplaySpecificationDefinitions => Set<DisplaySpecificationDefinition>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<OrderHistory> OrderHistories => Set<OrderHistory>();
    // --- SHIPPING DBSETS ---
    public DbSet<ShippingZone> ShippingZones => Set<ShippingZone>();
    public DbSet<ShippingMethod> ShippingMethods => Set<ShippingMethod>();
    public DbSet<ShippingRate> ShippingRates => Set<ShippingRate>();
    // --- USER-RELATED ENTITIES ---
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    // --- CHAT ---
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Participant> ChatParticipants => Set<Participant>();
    public DbSet<Message> ChatMessages => Set<Message>();
    public DbSet<AIPersona> AiPersonas => Set<AIPersona>();
    // --- SOCIAL ---
    public DbSet<FeedDefinition> FeedDefinitions => Set<FeedDefinition>();
    public DbSet<FeedItem> FeedItems => Set<FeedItem>();
    public DbSet<FeedReply> FeedReplies => Set<FeedReply>();
    public DbSet<FeedReaction> FeedReactions => Set<FeedReaction>();

    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();


    // --- CONCRETE TYPES FOR QUERIES ONLY ---
    public DbSet<PhysicalProduct> PhysicalProducts => Set<PhysicalProduct>();
    public DbSet<DigitalProduct> DigitalProducts => Set<DigitalProduct>();
    public DbSet<VirtualGameItemProduct> VirtualGameItemProducts => Set<VirtualGameItemProduct>();
    public DbSet<ServiceProduct> ServiceProducts => Set<ServiceProduct>();
    public DbSet<ImageMedia> ImageMedia => Set<ImageMedia>();
    public DbSet<VideoMedia> VideoMedia => Set<VideoMedia>();
    public DbSet<ReviewHelpfulVote> HelpfulVotes => Set<ReviewHelpfulVote>();

    // --- CHILD ENTITIES (Exposed for seeding purposes) ---
    public DbSet<ProductAttributeAssignment> ProductAttributeAssignments => Set<ProductAttributeAssignment>();
    public DbSet<ProductVariantCombination> ProductVariantCombinations => Set<ProductVariantCombination>();
    public DbSet<ImageVariant> ImageVariants => Set<ImageVariant>();

    public new ChangeTracker ChangeTracker => base.ChangeTracker; // Expose ChangeTracker

    // Implementatie van de nieuwe methode uit de interface
    public new EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class => base.Entry(entity);

    public async Task<List<Guid>> GetProductIdsMatchingCustomAttributesAsync(Dictionary<string, string> customFilters, CancellationToken cancellationToken)
    {
        if (customFilters == null || !customFilters.Any())
        {
            return new List<Guid>();
        }

        var sqlBuilder = new System.Text.StringBuilder("SELECT Id FROM Products WHERE 1=1");

        var dynamicParameters = new DynamicParameters();

        foreach (var filter in customFilters)
        {
            // Bouw de query dynamisch op. JSON_VALUE is specifiek voor SQL Server.
            sqlBuilder.Append($" AND JSON_VALUE(CustomAttributesJson, '$.{filter.Key}') = @{filter.Key}");
            dynamicParameters.Add(filter.Key, filter.Value);
        }

        var query = sqlBuilder.ToString();
        var connection = Database.GetDbConnection();
        var result = await connection.QueryAsync<Guid>(new CommandDefinition(query, dynamicParameters, cancellationToken: cancellationToken));
        return result.ToList();
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<MediaBase>()
            .Property(m => m.Type)
            .HasConversion<string>();

        // Apply all entity configurations from the current assembly
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Ensure proper table naming for Identity tables
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("AspNetUsers");
        });

        builder.Entity<IdentityRole<Guid>>(entity =>
        {
            entity.ToTable("AspNetRoles");
        });

        builder.Entity<IdentityUserRole<Guid>>(entity =>
        {
            entity.ToTable("AspNetUserRoles");
        });

        builder.Entity<IdentityUserClaim<Guid>>(entity =>
        {
            entity.ToTable("AspNetUserClaims");
        });

        builder.Entity<IdentityUserLogin<Guid>>(entity =>
        {
            entity.ToTable("AspNetUserLogins");
        });

        builder.Entity<IdentityRoleClaim<Guid>>(entity =>
        {
            entity.ToTable("AspNetRoleClaims");
        });

        builder.Entity<IdentityUserToken<Guid>>(entity =>
        {
            entity.ToTable("AspNetUserTokens");
        });
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/DependencyInjection.cs ---
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Infrastructure.Data;
using RoyalCode.Infrastructure.Data.Interceptors;
using RoyalCode.Infrastructure.Identity;
using RoyalCode.Infrastructure.Services;

namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyInjection
{
    public static void AddInfrastructureServices(this IHostApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("RoyalCodeDb");
        Guard.Against.Null(connectionString, message: "Connection string 'RoyalCodeDb' not found.");

        builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        builder.Services.AddScoped<ISaveChangesInterceptor, DispatchDomainEventsInterceptor>();

        builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            options.UseSqlServer(connectionString);
        });

        builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        builder.Services.AddScoped<ApplicationDbContextInitialiser>();

        // Registreer de core Identity services.
        // Alle Web-API specifieke zaken zoals .AddBearerToken() en .AddApiEndpoints() zijn hier verwijderd.
        builder.Services
            .AddIdentityCore<ApplicationUser>(options =>
            {
                options.SignIn.RequireConfirmedAccount = true;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddTransient<IIdentityService, IdentityService>();
        builder.Services.AddTransient<ITokenService, TokenService>(); // Onze custom token service
        builder.Services.AddScoped<IFileStorageService, RoyalCode.Infrastructure.Services.LocalFileStorageService>();
        builder.Services.AddScoped<IUserQueryService, UserQueryService>();
        builder.Services.AddScoped<IChatNotificationService, ChatNotificationService>();

    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Identity/ApplicationUser.cs ---
/**
 * @file ApplicationUser.cs
 * @Version 2.1.0 (With AvatarMediaId)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-26
 * @Description Custom user class now includes AvatarMediaId to properly link to a Media entity for the user's avatar.
 */
using Microsoft.AspNetCore.Identity;

namespace RoyalCode.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public Guid? AvatarMediaId { get; set; }
    public string? SettingsJson { get; set; }

    // Individuele versie-properties
    public long AddressesVersion { get; set; } = 0;
    public long SettingsVersion { get; set; } = 0;
    public long ProfileVersion { get; set; } = 0;
    public long StatsVersion { get; set; } = 0;
    public long InventoryVersion { get; set; } = 0;
    public string? UserSettingsJson { get; set; }
    public bool IsVerifiedUser { get; set; } = false; // Kan gekoppeld worden aan EmailConfirmed of een ander verificatieproces
    public UserActivityLevel ActivityLevel { get; set; } = UserActivityLevel.Newcomer; // Een enum die je zelf moet definiëren

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public string? FullName
    {
        get
        {
            var parts = new[] { FirstName, MiddleName, LastName }.Where(p => !string.IsNullOrWhiteSpace(p));
            return string.Join(" ", parts);
        }
    }

}


/// <summary>
/// Contains version counters for various user-related data aggregates.
/// This object is serialized to a single JSON column in the AspNetUsers table,
/// ensuring a clean schema and easy extensibility.
/// </summary>
public class UserDataVersions
{
    public long Addresses { get; set; } = 1;
    public long Settings { get; set; } = 1;
    public long Profile { get; set; } = 1;
    public long Stats { get; set; } = 1;
    public long Inventory { get; set; } = 1;

}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Identity/IdentityResultExtensions.cs ---
using Microsoft.AspNetCore.Identity;
using RoyalCode.Application.Common.Models;
using RoyalCode.Domain.Constants;

namespace RoyalCode.Infrastructure.Identity;
public static class IdentityResultExtensions
{
    public static Result ToApplicationResult(this IdentityResult result)
    {
        if (result.Succeeded)
        {
            return Result.Success();
        }

        var errors = new List<string>();
        var errorCodes = new List<string>(); // Nieuwe lijst voor error codes

        foreach (var error in result.Errors)
        {
            errors.Add(error.Description);
            // FIX: Map Identity errors naar onze ErrorCodes
            var errorCode = error.Code switch
            {
                "DuplicateEmail" or "DuplicateUserName" => ErrorCodes.UserEmailAlreadyExists,
                "PasswordTooShort" => ErrorCodes.PasswordTooShort,
                "PasswordRequiresNonAlphanumeric" => ErrorCodes.PasswordNoSpecialChar,
                "PasswordRequiresDigit" => ErrorCodes.PasswordNoDigit,
                "PasswordRequiresLower" => ErrorCodes.PasswordNoLowercase,
                "PasswordRequiresUpper" => ErrorCodes.PasswordNoUppercase,
                _ => ErrorCodes.BadRequest // Algemene foutcode voor onbekende Identity errors
            };
            errorCodes.Add(errorCode);
        }

        // AANGEPAST: Geef nu de lijst van foutcodes mee in het Result object.
        // Dit vereist een aanpassing aan het Result object zelf (zie hieronder).
        return Result.Failure(errors, errorCodes);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Identity/IdentityService.cs ---
/**
 * @file IdentityService.cs
 * @Version 4.2.1 (Definitive & SuperAdmin Secure)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description The definitive implementation of IIdentityService with robust
 *              SuperAdmin security checks and all previous errors corrected.
 */
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Social.Common;
using RoyalCode.Application.Users.Admin.Common;
using RoyalCode.Application.Users.Queries;
using RoyalCode.Domain.Constants;

namespace RoyalCode.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly IUserClaimsPrincipalFactory<ApplicationUser> _userClaimsPrincipalFactory;
    private readonly IAuthorizationService _authorizationService;
    private readonly IApplicationDbContext _context;

    public IdentityService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
        IAuthorizationService authorizationService,
        IApplicationDbContext context)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _userClaimsPrincipalFactory = userClaimsPrincipalFactory;
        _authorizationService = authorizationService;
        _context = context;
    }

    // === GROUP: CORE USER OPERATIONS ===
    // === GROUP: USER SELF-SERVICE ACCOUNT MANAGEMENT (IMPLEMENTATIONS) ===

    public async Task<MyProfileDetailsDto?> GetMyProfileDetailsAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return null;

        return new MyProfileDetailsDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            MiddleName = user.MiddleName,
            LastName = user.LastName,
            DisplayName = user.DisplayName,
            Bio = user.Bio,
            AvatarMediaId = user.AvatarMediaId,
            IsTwoFactorEnabled = await _userManager.GetTwoFactorEnabledAsync(user)
        };
    }

    public async Task<Result> UpdateMyProfileDetailsAsync(Guid userId, string firstName, string? middleName, string lastName, string displayName, string? bio)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return Result.Failure(new[] { ErrorCodes.UserNotFound });

        user.FirstName = firstName;
        user.MiddleName = middleName;
        user.LastName = lastName;
        user.DisplayName = displayName;
        user.Bio = bio;

        var result = await _userManager.UpdateAsync(user);
        return result.ToApplicationResult();
    }

    public async Task<Result> ChangeUserPasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return Result.Failure(new[] { ErrorCodes.UserNotFound });

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        return result.ToApplicationResult();
    }

    public async Task<bool> CheckUserPasswordAsync(Guid userId, string password)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return false;
        return await _userManager.CheckPasswordAsync(user, password);
    }

    public async Task<Result> UpdateUserAvatarAsync(Guid userId, Guid? avatarMediaId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return Result.Failure(new[] { ErrorCodes.UserNotFound });

        user.AvatarMediaId = avatarMediaId;
        var result = await _userManager.UpdateAsync(user);
        return result.ToApplicationResult();
    }


    // --- SUB GROUP: User Retrieval ---
    public async Task<string?> GetUserNameAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        return user?.UserName;
    }

    public async Task<string?> GetUserFullNameAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        return user?.FullName;
    }

    public async Task<string?> GetUserEmailAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        return user?.Email;
    }
    public async Task<Dictionary<Guid, ProfileDto>> GetProfilesByIdsAsync(IEnumerable<Guid> userIds)
    {
        var users = await _userManager.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync();

        return users.ToDictionary(
            u => u.Id,
            u => new ProfileDto
            {
                Id = u.Id,
                DisplayName = u.DisplayName ?? u.UserName ?? "Anoniem",
                // Avatar, Level, Reputation worden HIER NIET GEVULD
                Avatar = null, // Dit wordt later in de processor gevuld
                Level = null,
                Reputation = null
            });
    }

    // --- SUB GROUP: User Profile Management ---
    public async Task<Result> UpdateProfileAsync(Guid userId, string? displayName, string? bio, Guid? avatarMediaId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
        {
            return Result.Failure(new[] { "User not found." });
        }

        if (avatarMediaId.HasValue)
        {
            var mediaExistsAndBelongsToUser = await _context.Media
                .AnyAsync(m => m.Id == avatarMediaId.Value && m.UploaderUserId == userId);

            if (!mediaExistsAndBelongsToUser)
            {
                return Result.Failure(new[] { "The selected avatar image is invalid or does not belong to you." });
            }
            user.AvatarMediaId = avatarMediaId.Value;
        }

        user.DisplayName = displayName ?? user.DisplayName;
        user.Bio = bio ?? user.Bio;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return result.ToApplicationResult();
        }

        // De versie-incrementatie gebeurt apart in de handler.
        return Result.Success();
    }





    public async Task<bool> DoesUserExistAsync(Guid userId)
    {
        return await _userManager.FindByIdAsync(userId.ToString()) != null;
    }


    // --- SUB GROUP: User Creation & Deletion (Basic) ---
    public async Task<(Result Result, Guid UserId)> CreateUserAsync(string userName, string password)
    {
        var user = new ApplicationUser { UserName = userName, Email = userName };
        var result = await _userManager.CreateAsync(user, password);
        return (result.ToApplicationResult(), user.Id);
    }

    public async Task<Result> DeleteUserAsync(Guid userId, Guid requestingUserId)
    {
        var protectionCheck = await IsTargetProtectedAsync(userId, requestingUserId);
        if (protectionCheck.IsProtected) return protectionCheck.ErrorResult!;

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return Result.Failure(new[] { ErrorCodes.UserNotFound });

        var result = await _userManager.DeleteAsync(user);
        return result.ToApplicationResult();
    }

    // === GROUP: USER SETTINGS & DATA VERSIONING ===

    // --- SUB GROUP: User Settings ---
    public async Task<string?> GetUserSettingsJsonAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        return user?.UserSettingsJson;
    }

    public async Task<Result> UpdateUserSettingsJsonAsync(Guid userId, string json)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return Result.Failure(new[] { ErrorCodes.UserNotFound });

        user.UserSettingsJson = json;
        var result = await _userManager.UpdateAsync(user);
        return result.ToApplicationResult();
    }

    // --- SUB GROUP: Data Versioning ---
    // In de klasse IdentityService...

    // --- SUB GROUP: Data Versioning ---
    public async Task IncrementUserDataVersionAsync(Guid userId, UserDataAggregate aggregate)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return;

        switch (aggregate)
        {
            case UserDataAggregate.Addresses:
                user.AddressesVersion++;
                break;
            case UserDataAggregate.Settings:
                user.SettingsVersion++;
                break;
            case UserDataAggregate.Profile:
                user.ProfileVersion++;
                break;
            case UserDataAggregate.Stats:
                user.StatsVersion++;
                break;
            case UserDataAggregate.Inventory:
                user.InventoryVersion++;
                break;
        }

        await _userManager.UpdateAsync(user);
    }

    public async Task<long> GetUserDataVersionAsync(Guid userId, UserDataAggregate aggregate)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return 0L;

        return aggregate switch
        {
            UserDataAggregate.Addresses => user.AddressesVersion,
            UserDataAggregate.Settings => user.SettingsVersion,
            UserDataAggregate.Profile => user.ProfileVersion,
            UserDataAggregate.Stats => user.StatsVersion,
            UserDataAggregate.Inventory => user.InventoryVersion,
            _ => 0L
        };
    }
    // === GROUP: AUTHORIZATION & ROLES ===

    // --- SUB GROUP: Role Membership & Policy Checks ---
    public async Task<bool> IsInRoleAsync(Guid userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        return user != null && await _userManager.IsInRoleAsync(user, role);
    }

    public async Task<bool> AuthorizeAsync(Guid userId, string policyName)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return false;
        var principal = await _userClaimsPrincipalFactory.CreateAsync(user);
        var result = await _authorizationService.AuthorizeAsync(principal, policyName);
        return result.Succeeded;
    }

    // --- SUB GROUP: Role Library Management (Admin) ---
    public async Task<List<string>> GetAllRolesAsync()
    {
        return await _roleManager.Roles.Select(r => r.Name!).ToListAsync();
    }

    public async Task<Result> DeleteRoleAsync(Guid roleId)
    {
        var role = await _roleManager.FindByIdAsync(roleId.ToString());
        if (role == null) return Result.Failure(new[] { ErrorCodes.RoleNotFound });

        if (string.IsNullOrEmpty(role.Name)) return Result.Failure(new[] { ErrorCodes.RoleInvalidName });

        var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name);
        if (usersInRole.Any()) return Result.Failure(new[] { ErrorCodes.RoleInUse });

        var result = await _roleManager.DeleteAsync(role);
        return result.ToApplicationResult();
    }

    public async Task<bool> IsRoleAssignedToUsersAsync(string roleName)
    {
        var users = await _userManager.GetUsersInRoleAsync(roleName);
        return users.Any();
    }

    // --- SUB GROUP: Permission Library Management (Admin) ---
    public Task<List<PermissionDto>> GetAllPermissionsAsync()
    {
        var permissions = Permissions.GetAll()
            .Select(p => new PermissionDto { Value = p.ClaimValue, Description = p.Description })
            .ToList();
        return Task.FromResult(permissions);
    }

    public async Task<List<PermissionDto>> GetPermissionsForRoleAsync(Guid roleId)
    {
        var role = await _roleManager.FindByIdAsync(roleId.ToString());
        if (role == null) return new List<PermissionDto>();

        var allPermissions = Permissions.GetAll().ToDictionary(p => p.ClaimValue, p => p.Description);
        var claims = await _roleManager.GetClaimsAsync(role);

        return claims
            .Where(c => c.Type == "Permission" && allPermissions.ContainsKey(c.Value))
            .Select(c => new PermissionDto { Value = c.Value, Description = allPermissions[c.Value] })
            .ToList();
    }

    public async Task<Result> UpdatePermissionsForRoleAsync(Guid roleId, IEnumerable<string> permissionValues)
    {
        var role = await _roleManager.FindByIdAsync(roleId.ToString());
        if (role == null) return Result.Failure(new[] { ErrorCodes.RoleNotFound });

        var currentClaims = await _roleManager.GetClaimsAsync(role);
        var claimsToRemove = currentClaims.Where(c => c.Type == "Permission").ToList();
        foreach (var claim in claimsToRemove)
        {
            await _roleManager.RemoveClaimAsync(role, claim);
        }

        foreach (var permission in permissionValues)
        {
            await _roleManager.AddClaimAsync(role, new Claim("Permission", permission));
        }

        return Result.Success();
    }

    // === GROUP: ADMIN USER MANAGEMENT ===

    // --- SUB GROUP: SuperAdmin Protection Helper ---
    private async Task<(bool IsProtected, Result? ErrorResult)> IsTargetProtectedAsync(Guid targetUserId, Guid requestingUserId)
    {
        var targetUser = await _userManager.FindByIdAsync(targetUserId.ToString());
        if (targetUser == null) return (false, Result.Failure(new[] { ErrorCodes.UserNotFound }));

        var targetUserRoles = await _userManager.GetRolesAsync(targetUser);

        // Regel 1: Niemand kan een SuperAdmin account beheren via de API
        if (targetUserRoles.Contains(Roles.SuperAdmin))
        {
            return (true, Result.Failure(new[] { ErrorCodes.Forbidden })); // Specifieke foutcode, geen vrije string
        }

        // Regel 2: Alleen een SuperAdmin kan een Administrator account beheren
        if (targetUserRoles.Contains(Roles.Administrator))
        {
            var requestingUser = await _userManager.FindByIdAsync(requestingUserId.ToString());
            if (requestingUser == null) return (true, Result.Failure(new[] { ErrorCodes.UserNotFound }));

            var isRequestingUserSuperAdmin = await _userManager.IsInRoleAsync(requestingUser, Roles.SuperAdmin);
            if (!isRequestingUserSuperAdmin)
            {
                return (true, Result.Failure(new[] { ErrorCodes.Forbidden })); // Specifieke foutcode
            }
        }

        return (false, null);
    }

    // --- SUB GROUP: User CRUD (Admin) ---

    public async Task<(Result Result, Guid UserId)> CreateUserAsync(string email, string? displayName, string password, string? firstName, string? middleName, string? lastName, string? bio, IReadOnlyCollection<string> roles)
    {
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            DisplayName = displayName,
            FirstName = firstName,
            MiddleName = middleName,
            LastName = lastName,
            Bio = bio,
            EmailConfirmed = true
        };

        var identityResult = await _userManager.CreateAsync(user, password);
        if (!identityResult.Succeeded) return (identityResult.ToApplicationResult(), Guid.Empty);

        var existingRoles = roles.Where(r => _roleManager.RoleExistsAsync(r).Result).ToList();
        if (existingRoles.Any())
        {
            var addToRolesResult = await _userManager.AddToRolesAsync(user, existingRoles);
            if (!addToRolesResult.Succeeded) return (addToRolesResult.ToApplicationResult(), user.Id);
        }

        return (Result.Success(), user.Id);
    }

    public async Task<Result> UpdateUserAsync(Guid userId, string? displayName, string? firstName, string? lastName, string? bio, IReadOnlyCollection<string> roles, Guid requestingUserId)
    {
        var protectionCheck = await IsTargetProtectedAsync(userId, requestingUserId);
        if (protectionCheck.IsProtected) return protectionCheck.ErrorResult!;

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return Result.Failure(new[] { ErrorCodes.UserNotFound });

        var currentRoles = await _userManager.GetRolesAsync(user);

        // BEVEILIGINGSCHECK: Laatste Administrator niet de-promoteren
        // Deze check moet na IsTargetProtectedAsync omdat IsTargetProtectedAsync de SuperAdmins beschermt.
        if (currentRoles.Contains(Roles.Administrator) && !roles.Contains(Roles.Administrator)) // Als het doel een admin is en de rol wordt verwijderd
        {
            var adminUsersCount = await _userManager.GetUsersInRoleAsync(Roles.Administrator).ContinueWith(t => t.Result.Count);
            if (adminUsersCount <= 1) // Als dit de laatste admin is
            {
                return Result.Failure(new[] { ErrorCodes.LastAdminDemoteForbidden });
            }
        }

        user.DisplayName = displayName;
        user.FirstName = firstName;
        user.LastName = lastName;
        user.Bio = bio;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded) return updateResult.ToApplicationResult();

        var rolesToRemove = currentRoles.Except(roles).ToList();
        var rolesToAdd = roles.Except(currentRoles).ToList();

        if (rolesToRemove.Any()) await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
        if (rolesToAdd.Any()) await _userManager.AddToRolesAsync(user, rolesToAdd);

        return Result.Success();
    }

    public async Task<PaginatedList<AdminUserListItemDto>> GetUsersAsync(int pageNumber, int pageSize, string? searchTerm, string? role)
    {
        IQueryable<ApplicationUser> usersQuery = _userManager.Users;

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            usersQuery = usersQuery.Where(u => (u.DisplayName != null && u.DisplayName.Contains(searchTerm)) || (u.Email != null && u.Email.Contains(searchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            var usersInRole = await _userManager.GetUsersInRoleAsync(role);
            usersQuery = usersQuery.Where(u => usersInRole.Select(ur => ur.Id).Contains(u.Id));
        }

        var totalCount = await usersQuery.CountAsync();
        var users = await usersQuery.OrderBy(u => u.DisplayName).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        var userDtos = new List<AdminUserListItemDto>();
        foreach (var user in users)
        {
            userDtos.Add(new AdminUserListItemDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                FullName = user.FullName,
                Email = user.Email,
                Roles = (await _userManager.GetRolesAsync(user)).ToList(),
                IsLockedOut = await _userManager.IsLockedOutAsync(user),
                CreatedAt = user.CreatedAt
            });
        }

        return new PaginatedList<AdminUserListItemDto>(userDtos, totalCount, pageNumber, pageSize);
    }

    public async Task<AdminUserDetailDto?> GetUserByIdAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return null;

        return new AdminUserDetailDto
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            FirstName = user.FirstName,
            MiddleName = user.MiddleName,
            LastName = user.LastName,
            Email = user.Email,
            Bio = user.Bio,
            EmailConfirmed = user.EmailConfirmed,
            Roles = (await _userManager.GetRolesAsync(user)).ToList(),
            IsLockedOut = await _userManager.IsLockedOutAsync(user),
            LockoutEnd = user.LockoutEnd,
            AccessFailedCount = user.AccessFailedCount
        };
    }

    // --- SUB GROUP: User Account Status & Password Management (Admin) ---

    public async Task<Result> LockUserAsync(Guid userId, DateTimeOffset? lockoutEnd, Guid requestingUserId)
    {
        var protectionCheck = await IsTargetProtectedAsync(userId, requestingUserId);
        if (protectionCheck.IsProtected) return protectionCheck.ErrorResult!;

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return Result.Failure(new[] { ErrorCodes.UserNotFound });

        // BEVEILIGINGSCHECK: Laatste Administrator niet locken
        var isUserAdmin = await _userManager.IsInRoleAsync(user, Roles.Administrator);
        if (isUserAdmin)
        {
            var adminUsersCount = await _userManager.GetUsersInRoleAsync(Roles.Administrator).ContinueWith(t => t.Result.Count);
            if (adminUsersCount <= 1)
            {
                return Result.Failure(new[] { ErrorCodes.LastAdminLockForbidden });
            }
        }

        var result = await _userManager.SetLockoutEnabledAsync(user, true);
        if (!result.Succeeded) return result.ToApplicationResult();

        DateTimeOffset finalLockoutEnd = lockoutEnd ?? DateTimeOffset.MaxValue.AddDays(-1);
        result = await _userManager.SetLockoutEndDateAsync(user, finalLockoutEnd);
        return result.ToApplicationResult();
    }

    public async Task<Result> UnlockUserAsync(Guid userId, Guid requestingUserId)
    {
        var protectionCheck = await IsTargetProtectedAsync(userId, requestingUserId);
        if (protectionCheck.IsProtected) return protectionCheck.ErrorResult!;

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return Result.Failure(new[] { ErrorCodes.UserNotFound });

        var result = await _userManager.SetLockoutEndDateAsync(user, null);
        if (result.Succeeded)
        {
            result = await _userManager.SetLockoutEnabledAsync(user, false);
        }

        return result.ToApplicationResult();
    }

    public async Task<Result> SetUserPasswordAsync(Guid userId, string newPassword, Guid requestingUserId)
    {
        var protectionCheck = await IsTargetProtectedAsync(userId, requestingUserId);
        if (protectionCheck.IsProtected) return protectionCheck.ErrorResult!;

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return Result.Failure(new[] { ErrorCodes.UserNotFound });

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

        return result.ToApplicationResult();
    }

    // === GROUP: STATISTICS & REPORTING ===
    public async Task<int> GetNewUserCountInPeriodAsync(DateTimeOffset startDate, DateTimeOffset endDate)
    {
        return await _userManager.Users
            .CountAsync(u => u.CreatedAt >= startDate && u.CreatedAt < endDate);
    }

}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Identity/UserActivityLevel.cs ---
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoyalCode.Infrastructure.Identity;
public enum UserActivityLevel
{
    Newcomer,
    Regular,
    Active,
    PowerUser,
    Expert
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Infrastructure.csproj ---
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <RootNamespace>RoyalCode.Infrastructure</RootNamespace>
    <AssemblyName>RoyalCode.Infrastructure</AssemblyName>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Azure.Identity" />
    <PackageReference Include="Bogus" />
    <PackageReference Include="Dapper" />
    <PackageReference Include="Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Relational" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\Application\Application.csproj" />
  </ItemGroup>

</Project>
--- END OF FILE ---

--- START OF FILE src/Web/DependencyInjection.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Web/DependencyInjection.cs ---
/**
 * @file DependencyInjection.cs
 * @Version 4.0.0 (FINAL Minimal API JSON Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description Configureert Web-services, nu met de DEFINITIEF CORRECTE JSON-opties
 *              voor de Minimal API pipeline om enums als strings te deserialiseren.
 */
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Azure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using NSwag;
using NSwag.Generation.Processors.Security;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Constants;
using RoyalCode.Infrastructure.Data;
using RoyalCode.Web.Infrastructure;
using RoyalCode.Web.Services;
using JsonOptions = Microsoft.AspNetCore.Http.Json.JsonOptions;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddWebServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddDatabaseDeveloperPageExceptionFilter();
        builder.Services.AddScoped<IUser, CurrentUser>();
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddHealthChecks().AddDbContextCheck<ApplicationDbContext>();
        builder.Services.AddExceptionHandler<CustomExceptionHandler>();

        builder.Services.Configure<ApiBehaviorOptions>(options =>
            options.SuppressModelStateInvalidFilter = true);

        builder.Services.AddEndpointsApiExplorer();

        // --- DE DEFINITIEVE, WERKENDE FIX VOOR MINIMAL APIs ---
        // Configureer de JsonOptions specifiek voor de Http pipeline die Minimal APIs gebruiken.
        // JsonOptions.SerializerOptions is de correcte property voor toegang.
        builder.Services.Configure<JsonOptions>(options =>
        {
            options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
            options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        });

        builder.Services.AddOpenApiDocument((configure, sp) =>
        {
            configure.Title = "RoyalCode API";
            configure.AddSecurity("JWT", Enumerable.Empty<string>(), new OpenApiSecurityScheme
            {
                Type = OpenApiSecuritySchemeType.ApiKey,
                Name = "Authorization",
                In = OpenApiSecurityApiKeyLocation.Header,
                Description = "Type into the textbox: Bearer {your JWT token}."
            });
            configure.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
        });

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                    ValidAudience = builder.Configuration["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]!))
                };
            });

        builder.Services.AddAuthorization(options =>
            options.AddPolicy(Policies.CanPurge, policy => policy.RequireRole(Roles.Administrator)));
    }

    public static void AddKeyVaultIfConfigured(this IHostApplicationBuilder builder)
    {
        var keyVaultUri = builder.Configuration["AZURE_KEY_VAULT_ENDPOINT"];
        if (!string.IsNullOrWhiteSpace(keyVaultUri))
        {
            builder.Configuration.AddAzureKeyVault(
                new Uri(keyVaultUri),
                new DefaultAzureCredential());
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Account.cs ---
/**
 * @file Account.cs
 * @Version 3.0.0 (Complete & Corrected)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description Endpoints for authenticated users to manage their own account details,
 *              including profile, addresses, settings, and personal content like reviews.
 *              This version contains the full, correct implementation for all self-service actions.
 */
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Reviews.Queries.GetMyReviews;
using RoyalCode.Application.Reviews.Queries.GetReviewsForProduct;
using RoyalCode.Application.Users.Commands;
using RoyalCode.Application.Users.Commands.Addresses;
using RoyalCode.Application.Users.Commands.Profile; // Voor UpdateMyProfileCommand
using RoyalCode.Application.Users.Commands.UpdateSettings;
using RoyalCode.Application.Users.Common;
using RoyalCode.Application.Users.Queries;
using RoyalCode.Infrastructure.Identity;
using System.Collections.Generic; // Voor IDictionary
using System.Linq; // Voor LINQ-methoden

namespace RoyalCode.Web.Endpoints;

public class Account : EndpointGroupBase
{
    // DTO voor de publieke profielweergave of de basisweergave van de huidige gebruiker
    public record ProfileDto
    {
        public Guid Id { get; set; }
        public string? DisplayName { get; set; }
        public string? Email { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
    }

    // Payloads voor de commands
    public record UpdateMyProfileAvatarPayload(Guid? AvatarMediaId);
    public record UpdateProfileDetailsPayload(string FirstName, string? MiddleName, string LastName, string DisplayName, string? Bio);
    public record ChangePasswordPayload(string CurrentPassword, string NewPassword, string ConfirmNewPassword);
    public record DeleteAccountPayload(string Password);


    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Account")
            .WithTags("Account (Self-Service)")
            .RequireAuthorization();

        // === GET Endpoints ===
        group.MapGet("/profile", GetCurrentUserProfile)
             .WithOpenApi(op => new(op) { Summary = "Get the public profile of the currently authenticated user." });

        group.MapGet("/profile-details", GetMyProfileDetails)
             .WithOpenApi(op => new(op) { Summary = "Get the detailed profile & account data for the management page." });

        group.MapGet("/addresses", GetAddresses)
             .WithOpenApi(op => new(op) { Summary = "Get all addresses for the authenticated user." });

        group.MapGet("/settings", GetSettings)
             .WithOpenApi(op => new(op) { Summary = "Get the application settings for the authenticated user." });

        group.MapGet("/reviews", GetMyReviews)
             .WithOpenApi(op => new(op) { Summary = "Get all reviews created by the authenticated user." });

        // === POST Endpoints ===
        group.MapPost("/addresses", CreateAddress)
             .WithOpenApi(op => new(op) { Summary = "Create a new address for the authenticated user." });

        group.MapPost("/change-password", ChangePassword)
             .WithOpenApi(op => new(op) { Summary = "Change the authenticated user's password." });

        group.MapPost("/delete-account", DeleteMyAccount)
             .WithOpenApi(op => new(op) { Summary = "Permanently delete the authenticated user's account." });

        // === PUT Endpoints ===
        group.MapPut("/profile-avatar", UpdateMyProfileAvatar)
             .WithOpenApi(op => new(op) { Summary = "Update the authenticated user's avatar." });

        group.MapPut("/profile-details", UpdateMyProfileDetails)
             .WithOpenApi(op => new(op) { Summary = "Update the authenticated user's profile details (FirstName, LastName, DisplayName, Bio)." });

        group.MapPut("/addresses/{id:guid}", UpdateAddress)
             .WithOpenApi(op => new(op) { Summary = "Update an existing address for the authenticated user." });

        group.MapPut("/settings", UpdateSettings)
             .WithOpenApi(op => new(op) { Summary = "Update the application settings for the authenticated user." });

        // === DELETE Endpoints ===
        group.MapDelete("/addresses/{id:guid}", DeleteAddress)
             .WithOpenApi(op => new(op) { Summary = "Delete an address for the authenticated user." });
    }

    // === GET Implementations ===
    public async Task<Results<Ok<ProfileDto>, NotFound>> GetCurrentUserProfile(ClaimsPrincipal claims, UserManager<ApplicationUser> userManager, IApplicationDbContext dbContext)
    {
        var userId = claims.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return TypedResults.NotFound();
        string? avatarUrl = null;
        if (user.AvatarMediaId.HasValue)
        {
            var media = await dbContext.Media.FindAsync(user.AvatarMediaId.Value);
            avatarUrl = media?.GetDeliveryUrl();
        }
        return TypedResults.Ok(new ProfileDto { Id = user.Id, DisplayName = user.DisplayName, Email = user.Email, AvatarUrl = avatarUrl, Bio = user.Bio });
    }

    public async Task<Results<Ok<MyProfileDetailsDto>, NotFound>> GetMyProfileDetails(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetMyProfileDetailsQuery()));
    }

    public async Task<IResult> GetAddresses(ISender sender, IUser currentUser, IIdentityService identityService, HttpContext httpContext)
    {
        var userId = currentUser.Id!.Value;
        var currentVersion = await identityService.GetUserDataVersionAsync(userId, UserDataAggregate.Addresses);
        var etag = $"\"{currentVersion}\"";
        if (httpContext.Request.Headers.IfNoneMatch.Contains(etag))
        {
            return Results.StatusCode(StatusCodes.Status304NotModified);
        }
        var addresses = await sender.Send(new GetAddressesQuery());
        httpContext.Response.Headers.ETag = etag;
        return Results.Ok(addresses);
    }

    public async Task<Ok<ApplicationSettingsDto>> GetSettings(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetUserSettingsQuery()));
    }

    public async Task<Ok<PaginatedList<ReviewListItemDto>>> GetMyReviews([AsParameters] GetMyReviewsQuery query, ISender sender)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    // === POST Implementations ===
    public async Task<Results<Created<AddressDto>, BadRequest<IDictionary<string, string[]>>>> CreateAddress([FromBody] CreateAddressCommand command, ISender sender)
    {
        var result = await sender.Send(command);
        return TypedResults.Created($"/api/account/addresses/{result.Id}", result);
    }

    public async Task<Results<NoContent, BadRequest<IDictionary<string, string[]>>>> ChangePassword([FromBody] ChangePasswordPayload payload, ISender sender)
    {
        var command = new ChangePasswordCommand { CurrentPassword = payload.CurrentPassword, NewPassword = payload.NewPassword, ConfirmNewPassword = payload.ConfirmNewPassword };
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, ForbidHttpResult>> DeleteMyAccount([FromBody] DeleteAccountPayload payload, ISender sender)
    {
        await sender.Send(new DeleteAccountCommand(payload.Password));
        return TypedResults.NoContent();
    }

    // === PUT Implementations ===

    public async Task<Results<NoContent, BadRequest<IDictionary<string, string[]>>>> UpdateMyProfileAvatar([FromBody] UpdateMyProfileAvatarPayload payload, ISender sender)
    {
        var command = new UpdateMyProfileCommand { AvatarMediaId = payload.AvatarMediaId };
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, BadRequest<IDictionary<string, string[]>>>> UpdateMyProfileDetails([FromBody] UpdateProfileDetailsPayload payload, ISender sender)
    {
        var command = new UpdateMyProfileDetailsCommand { FirstName = payload.FirstName, MiddleName = payload.MiddleName, LastName = payload.LastName, DisplayName = payload.DisplayName, Bio = payload.Bio };
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, NotFound, ForbidHttpResult, BadRequest<IDictionary<string, string[]>>>> UpdateAddress(Guid id, [FromBody] UpdateAddressCommand command, ISender sender)
    {
        if (id != command.Id)
        {
            // DE FIX: Cast de Dictionary expliciet naar IDictionary<string, string[]>
            IDictionary<string, string[]> errors = new Dictionary<string, string[]> { { "id", new[] { "ID from route must match ID in body." } } };
            return TypedResults.BadRequest((IDictionary<string, string[]>)errors); // Expliciete cast hier
        }
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, BadRequest<IDictionary<string, string[]>>>> UpdateSettings([FromBody] ApplicationSettingsDto settingsDto, ISender sender)
    {
        await sender.Send(new UpdateUserSettingsCommand(settingsDto));
        return TypedResults.NoContent();
    }

    // === DELETE Implementations ===
    public async Task<Results<NoContent, NotFound, ForbidHttpResult>> DeleteAddress(Guid id, ISender sender)
    {
        await sender.Send(new DeleteAddressCommand(id));
        return TypedResults.NoContent();
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/AdminChat.cs ---
/**
 * @file AdminChat.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description API endpoints for the Admin Panel's customer service chat interface.
 */
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Chat.Queries;
using RoyalCode.Domain.Constants;

namespace RoyalCode.Web.Endpoints;

public class AdminChat : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/AdminChat")
            .WithTags("Chat (Admin)")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator, Roles.Moderator)); // Of een "CustomerService" rol

        // Endpoint voor de "Inbox" view
        group.MapGet("/conversations", GetSupportConversations)
             .WithOpenApi(op => new(op) { Summary = "Get all customer support conversations for the admin inbox." });

        // De bestaande endpoints voor het ophalen van berichten en het versturen van berichten
        // kunnen worden hergebruikt, omdat ze werken op basis van `conversationId`.
    }

    public async Task<Ok<List<ConversationListItemDto>>> GetSupportConversations(ISender sender)
    {
        // We hebben een nieuwe Query nodig om specifiek support chats op te halen.
        return TypedResults.Ok(await sender.Send(new GetSupportConversationsQuery()));
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/AdminDashboard.cs ---
/**
 * @file AdminDashboard.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description API endpoints that provide aggregated data specifically for the Admin Dashboard.
 */
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Dashboard.Common;
using RoyalCode.Application.Dashboard.Queries;
using RoyalCode.Domain.Constants;

namespace RoyalCode.Web.Endpoints;

public class AdminDashboard : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/AdminDashboard")
            .WithTags("Dashboard (Admin)")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator, Roles.Moderator));

        group.MapGet("/stats", GetDashboardStats)
             .WithOpenApi(op => new(op) { Summary = "Get all Key Performance Indicator (KPI) statistics for the main dashboard cards." });

        group.MapGet("/revenue-chart", GetRevenueChartData)
             .WithOpenApi(op => new(op) { Summary = "Get time-series data for the dashboard's revenue chart." });

        group.MapGet("/bestsellers", GetBestsellers)
             .WithOpenApi(op => new(op) { Summary = "Get a list of the top best-selling products." });
    }

    public async Task<Ok<AdminDashboardStatsDto>> GetDashboardStats(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetAdminDashboardStatsQuery()));
    }

    public async Task<Ok<AdminRevenueChartDto>> GetRevenueChartData(ISender sender, [FromQuery] int? days)
    {
        var query = new GetAdminRevenueChartQuery(days ?? 30);
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<Ok<List<AdminBestsellerDto>>> GetBestsellers(ISender sender, [FromQuery] int? limit)
    {
        var query = new GetAdminBestsellersQuery(limit ?? 5);
        return TypedResults.Ok(await sender.Send(query));
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/AdminOrders.cs ---
using Microsoft.AspNetCore.Http.HttpResults;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Orders.Commands;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Application.Orders.Queries;
using RoyalCode.Application.Users.Common; // Voor AddressDto
using RoyalCode.Domain.Constants;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Domain.Enums;

namespace RoyalCode.Web.Endpoints;

public class AdminOrders : EndpointGroupBase
{
    // DTO's specifiek voor de Admin API payloads
    public record UpdateNotesPayload(string? Notes);
    public record RefundPayload(decimal Amount, string Reason);
    public record FulfillmentItemPayloadDto(Guid OrderItemId, int Quantity);
    public record CreateFulfillmentPayloadDto(string CarrierName, string? TrackingNumber, string? TrackingUrl, List<FulfillmentItemPayloadDto> Items);
    public record UpdateCustomerNotesPayload(string? Notes);
    public record AddOrderItemPayloadDto(Guid ProductId, Guid? VariantId, int Quantity);
    public record UpdateOrderItemQuantityPayloadDto(int Quantity); // <-- DE TOEGEVOEGDE DTO

    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/AdminOrders") // Expliciete URL-prefix om duplicatie te voorkomen
            .WithTags("Orders (Admin)") // De gewenste tag voor groepering
            .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator));

        // === GET Endpoints ===
        group.MapGet("/", GetAllOrders)
             .WithOpenApi(op => new(op) { Summary = "Get a paginated list of all orders with advanced filtering for administrators." });

        group.MapGet("/export", ExportOrders)
             .WithOpenApi(op => new(op) { Summary = "Export a filtered list of orders to a CSV file (Admin-only)." });

        group.MapGet("/{orderId:guid}/invoice", DownloadInvoice)
             .WithOpenApi(op => new(op) { Summary = "Download the invoice for a specific order (Admin-only)." });

        group.MapGet("/lookups", GetOrderLookups)
             .WithOpenApi(op => new(op) { Summary = "Get lookup data (statuses, payment methods, shipping methods) for order filtering (Admin-only)." });

        group.MapGet("/{orderId:guid}", GetOrderById)
             .Produces<AdminOrderDetailDto>(StatusCodes.Status200OK, "application/json")
             .Produces<OrderPickingDto>(StatusCodes.Status200OK, "application/json")
             .Produces(StatusCodes.Status404NotFound)
             .WithOpenApi(op => new(op) { Summary = "Get detailed information for a specific order by ID. Use ?view=pickpack for a lightweight version." });


        group.MapGet("/stats", GetOrderStats)
             .WithOpenApi(op => new(op) { Summary = "Get key performance indicators (KPIs) for the store." });

        group.MapGet("/{orderId:guid}/packing-slip", DownloadPackingSlip)
            .WithOpenApi(op => new(op) { Summary = "Generate and download a packing slip for an order." });


        // === POST Endpoints ===
        group.MapPost("/{orderId:guid}/cancel", CancelOrderAdmin)
             .WithOpenApi(op => new(op) { Summary = "Cancel a specific order (Admin-only)." });

        group.MapPost("/{orderId:guid}/refund", ProcessRefund)
             .WithOpenApi(op => new(op) { Summary = "Process a full or partial refund for an order (Admin-only)." });

        group.MapPost("/{orderId:guid}/fulfillments", CreateFulfillment)
            .WithOpenApi(op => new(op) { Summary = "Create a new fulfillment (shipment) for an order." });

        group.MapPost("/{orderId:guid}/items", AddItemToOrder)
            .WithOpenApi(op => new(op) { Summary = "Add a new product item to an existing order." });


        // === PATCH Endpoints ===
        group.MapPatch("/{orderId:guid}/status", UpdateStatus)
             .WithOpenApi(op => new(op) { Summary = "Update the status of an order, including shipping details if applicable (Admin-only)." });

        // === PUT Endpoints ===
        group.MapPut("/{orderId:guid}/notes", UpdateInternalNotes)
             .WithOpenApi(op => new(op) { Summary = "Update internal notes for an order (Admin-only)." });

        group.MapPut("/{orderId:guid}/shipping-address", UpdateShippingAddress)
             .WithOpenApi(op => new(op) { Summary = "Update the shipping address for an existing order." });

        group.MapPut("/{orderId:guid}/billing-address", UpdateBillingAddress)
            .WithOpenApi(op => new(op) { Summary = "Update the billing address for an existing order." });

        group.MapPut("/{orderId:guid}/customer-notes", UpdateCustomerNotes)
            .WithOpenApi(op => new(op) { Summary = "Update the customer-provided notes for an existing order." });

        group.MapPatch("/items/{orderItemId:guid}", UpdateOrderItem)
            .WithOpenApi(op => new(op) { Summary = "Update the quantity of an item in an existing order." });

        group.MapDelete("/items/{orderItemId:guid}", RemoveOrderItem)
            .WithOpenApi(op => new(op) { Summary = "Remove an item from an existing order." });



    }

    // === GET Implementations ===
    public async Task<Ok<PaginatedList<AdminOrderListItemDto>>> GetAllOrders(ISender sender, [AsParameters] GetAllOrdersQuery query)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<IResult> GetOrderById(
    ISender sender, Guid orderId, [FromQuery] string? view)
    {
        var result = await sender.Send(new GetOrderByIdQuery(orderId, view));

        if (result is AdminOrderDetailDto detailDto)
        {
            return TypedResults.Ok(detailDto);
        }
        if (result is OrderPickingDto pickingDto)
        {
            return TypedResults.Ok(pickingDto);
        }

        // Dit zou nooit moeten gebeuren als de handler correct werkt
        return Results.NotFound();
    }



    public async Task<Ok<OrderLookupsDto>> GetOrderLookups(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetOrderLookupsQuery()));
    }

    public async Task<Ok<AdminOrderStatsDto>> GetOrderStats(ISender sender, [AsParameters] GetAdminOrderStatsQuery query)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<FileContentHttpResult> DownloadPackingSlip(Guid orderId, ISender sender)
    {
        var result = await sender.Send(new GeneratePackingSlipCommand(orderId));
        return TypedResults.File(result.Content, result.ContentType, result.FileName);
    }

    public async Task<FileContentHttpResult> ExportOrders(ISender sender, [AsParameters] ExportOrdersQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.File(result.Content, result.ContentType, result.FileName);
    }

    public async Task<Results<ContentHttpResult, NotFound>> DownloadInvoice(
            ISender sender, Guid orderId)
    {
        var invoiceData = await sender.Send(new GetOrderInvoiceDataQuery(orderId));

        var htmlContent = $"<html><body><h1>ADMIN - Invoice for Order {invoiceData.OrderNumber}</h1><p>Total: {invoiceData.GrandTotal} {invoiceData.Currency}</p></body></html>";
        return TypedResults.Content(htmlContent, "text/html");
    }



    // === POST Implementations ===
    public async Task<Results<NoContent, NotFound, BadRequest<string>>> CancelOrderAdmin(ISender sender, Guid orderId)
    {
        await sender.Send(new CancelOrderCommand(orderId));
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, NotFound, BadRequest<IDictionary<string, string[]>>>> ProcessRefund(
        ISender sender, Guid orderId, [FromBody] RefundPayload payload)
    {
        var command = new RefundOrderCommand(orderId, payload.Amount, payload.Reason);
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<Created<Guid>, NotFound, BadRequest>> CreateFulfillment(
    Guid orderId, [FromBody] CreateFulfillmentPayloadDto payload, ISender sender)
    {
        var command = new CreateFulfillmentCommand(
            orderId,
            payload.CarrierName,
            payload.TrackingNumber,
            payload.TrackingUrl,
            payload.Items.Select(i => new FulfillmentItemPayload(i.OrderItemId, i.Quantity)).ToList()
        );
        var fulfillmentId = await sender.Send(command);
        return TypedResults.Created($"/api/AdminOrders/{orderId}/fulfillments/{fulfillmentId}", fulfillmentId);
    }

    public async Task<Results<Ok<AdminOrderDetailDto>, NotFound, BadRequest<string>>> AddItemToOrder(
    Guid orderId, [FromBody] AddOrderItemPayloadDto payload, ISender sender)
    {
        var command = new AddItemToOrderCommand(orderId, payload.ProductId, payload.VariantId, payload.Quantity);
        var updatedOrder = await sender.Send(command);
        return TypedResults.Ok(updatedOrder);
    }



    // === PATCH Implementations ===
    public async Task<Results<NoContent, NotFound, BadRequest>> UpdateStatus(
        ISender sender, Guid orderId, [FromBody] UpdateOrderStatusDto payload)
    {
        var command = new UpdateOrderStatusCommand(orderId, payload.NewStatus, payload.TrackingNumber, payload.TrackingUrl, payload.ShippedDate, payload.EstimatedDeliveryDate);
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    // === PUT Implementations ===
    public async Task<Results<NoContent, NotFound>> UpdateInternalNotes(
        ISender sender, Guid orderId, [FromBody] UpdateNotesPayload payload)
    {
        var command = new UpdateInternalNotesCommand(orderId, payload.Notes);
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, NotFound>> UpdateShippingAddress(
        ISender sender, Guid orderId, [FromBody] AddressDto newAddress)
    {
        var command = new UpdateOrderShippingAddressCommand(orderId, newAddress);
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, NotFound>> UpdateBillingAddress(
    Guid orderId, [FromBody] AddressDto newAddress, ISender sender)
    {
        var command = new UpdateOrderBillingAddressCommand(orderId, newAddress);
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, NotFound>> UpdateCustomerNotes(
Guid orderId, [FromBody] UpdateCustomerNotesPayload payload, ISender sender)
    {
        var command = new UpdateCustomerNotesCommand(orderId, payload.Notes);
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<Ok<AdminOrderDetailDto>, NotFound, BadRequest<string>>> UpdateOrderItem(
    Guid orderItemId, [FromBody] UpdateOrderItemQuantityPayloadDto payload, ISender sender)
    {
        var command = new UpdateOrderItemCommand(orderItemId, payload.Quantity);
        var updatedOrder = await sender.Send(command);
        return TypedResults.Ok(updatedOrder);
    }

    public async Task<Results<Ok<AdminOrderDetailDto>, NotFound>> RemoveOrderItem(Guid orderItemId, ISender sender)
    {
        var updatedOrder = await sender.Send(new RemoveOrderItemCommand(orderItemId));
        return TypedResults.Ok(updatedOrder);
    }

}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/AdminPermissions.cs ---
using Microsoft.AspNetCore.Http.HttpResults;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Admin.Common;
using RoyalCode.Application.Users.Admin.Queries.Permissions;
using RoyalCode.Domain.Constants;

namespace RoyalCode.Web.Endpoints;

public class AdminPermissions : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/admin/permissions")
            .WithTags("Permissions (Admin)")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator));

        group.MapGet("/", GetAllPermissions)
             .WithOpenApi(op => new(op) { Summary = "Get the library of all available system permissions." });
    }

    public Ok<List<PermissionDto>> GetAllPermissions(ISender sender)
    {
        return TypedResults.Ok(sender.Send(new GetAllPermissionsQuery()).Result);
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/AdminProducts.cs ---
// --- VERVANG VOLLEDIG BESTAND: src/Web/Endpoints/AdminProducts.cs ---
/**
 * @file AdminProducts.cs
 * @Version 1.1.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description Provides a comprehensive set of API endpoints for product management
 *              in the Admin Panel, including attribute value management and full product CRUD.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Generate full AdminProducts.cs, consolidating admin-only product and attribute endpoints.
 */
using System.Collections.Generic; // Voor IDictionary
using System.Linq; // Voor LINQ-methoden
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Admin.Products.Queries;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models; // Toegevoegd voor PaginatedList
using RoyalCode.Application.Products.Commands.Attributes;
using RoyalCode.Application.Products.Commands.CreateProduct;
using RoyalCode.Application.Products.Commands.DeleteProduct;
using RoyalCode.Application.Products.Commands.UpdateProduct;
using RoyalCode.Application.Products.Common;
using RoyalCode.Application.Products.Queries; // Voor ProductLookupDto
using RoyalCode.Application.Products.Queries.GetAllAdminProducts; // <-- GECORRIGEERD: Voor GetAllAdminProductsQuery
using RoyalCode.Application.Products.Queries.GetAllAttributeValues;
using RoyalCode.Application.Products.Queries.GetCustomAttributeDefinitions;
using RoyalCode.Application.Products.Queries.GetDisplaySpecificationDefinitions;
using RoyalCode.Application.Products.Queries.GetProductById; // Voor ProductDetailDto
using RoyalCode.Application.Products.Queries.GetProductCategoryTree;
using RoyalCode.Application.Products.Queries.GetProductLookups;
using RoyalCode.Application.Products.Queries.GetTags;
using RoyalCode.Domain.Constants;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Web.Endpoints;

#region Payload DTOs
public record CreateAttributeValuePayload(string Value, string DisplayName, VariantAttributeType AttributeType, string? ColorHex, decimal? PriceModifier);
public record UpdateAttributeValuePayload(string DisplayName, string? ColorHex, decimal? PriceModifier);

// Hergebruik CreateProductCommand en UpdateProductCommand uit Application layer als payloads
#endregion

public class AdminProducts : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/AdminProducts")
            .WithTags("Products (Admin)")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator, Roles.Moderator));

        // === Admin Product Attribute Values CRUD ===
        group.MapGet("/attributes", GetAllAttributeValues)
             .WithOpenApi(op => new(op) { Summary = "Get all globally available product attribute values for admin management." });

        group.MapPost("/attributes", CreateAttributeValue)
            .WithOpenApi(op => new(op) { Summary = "Create a new reusable attribute value (e.g., a new color)." });

        group.MapPut("/attributes/{id:guid}", UpdateAttributeValue)
             .WithOpenApi(op => new(op) { Summary = "Update the metadata of an existing attribute value." });

        group.MapDelete("/attributes/{id:guid}", DeleteAttributeValue)
             .WithOpenApi(op => new(op) { Summary = "Delete an attribute value if it's not in use by any product." });

        // === Admin Product Lookup Data ===
        group.MapGet("/lookups", GetProductLookups)
             .WithOpenApi(op => new(op) { Summary = "Get all aggregated lookup data for product creation/editing forms (Admin-only)." });

        group.MapGet("/categories", GetProductCategoryTree)
            .WithOpenApi(op => new(op) { Summary = "Get the hierarchical tree of product categories (Admin-only)." });

        group.MapGet("/tags", GetTags)
             .WithOpenApi(op => new(op) { Summary = "Get a list of existing product tags for autocomplete functionality (Admin-only)." });

        group.MapGet("/custom-attribute-definitions", GetCustomAttributeDefinitions)
             .WithOpenApi(op => new(op) { Summary = "Get definitions for custom product attributes (Admin-only)." });

        group.MapGet("/display-specification-definitions", GetDisplaySpecificationDefinitions)
             .WithOpenApi(op => new(op) { Summary = "Get definitions for product display specifications (Admin-only)." });


        // === Admin Product CRUD ===
        group.MapGet("/", GetAllAdminProducts) // <-- HET NIEUWE ENDPOINT VOOR DE LIJST
             .WithOpenApi(op => new(op) { Summary = "Retrieves a paginated list of all products for the Admin Panel." });

        group.MapGet("/{id:guid}", GetProductByIdForAdmin) // Specifieke admin-query
             .WithOpenApi(op => new(op) { Summary = "Get detailed information for a single product by ID for Admin Panel, including drafts/archived." });

        group.MapPost("/", CreateProduct)
             .WithOpenApi(op => new(op) { Summary = "Create a new product (Admin-only)." });

        group.MapPut("/{id:guid}", UpdateProduct)
             .WithOpenApi(op => new(op) { Summary = "Update an existing product by ID (Admin-only)." });

        group.MapDelete("/{id:guid}", DeleteProduct)
            .WithOpenApi(op => new(op) { Summary = "Delete an existing product by ID (Admin-only)." });
    }

    #region Admin Product Attribute Values Implementations
    public async Task<Ok<Dictionary<string, List<AttributeValueSelectionDto>>>> GetAllAttributeValues(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetAllAttributeValuesQuery()));
    }

    public async Task<Results<Created<AttributeValueSelectionDto>, BadRequest, Conflict<string>>> CreateAttributeValue(ISender sender, [FromBody] CreateAttributeValuePayload payload)
    {
        var command = new CreateAttributeValueCommand
        {
            Value = payload.Value,
            DisplayName = payload.DisplayName,
            AttributeType = payload.AttributeType,
            ColorHex = payload.ColorHex,
            PriceModifier = payload.PriceModifier
        };
        var result = await sender.Send(command);
        return TypedResults.Created($"/api/AdminProducts/attributes/{result.Id}", result);
    }

    public async Task<Results<Ok<AttributeValueSelectionDto>, NotFound, BadRequest>> UpdateAttributeValue(Guid id, ISender sender, [FromBody] UpdateAttributeValuePayload payload)
    {
        var command = new UpdateAttributeValueCommand
        {
            Id = id,
            DisplayName = payload.DisplayName,
            ColorHex = payload.ColorHex,
            PriceModifier = payload.PriceModifier
        };
        var result = await sender.Send(command);
        return TypedResults.Ok(result);
    }

    public async Task<Results<NoContent, NotFound, Conflict<string>>> DeleteAttributeValue(Guid id, ISender sender)
    {
        await sender.Send(new DeleteAttributeValueCommand(id));
        return TypedResults.NoContent();
    }
    #endregion

    #region Admin Product Lookup Data Implementations
    public async Task<Ok<ProductLookupsDto>> GetProductLookups(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetProductLookupsQuery()));
    }

    public async Task<Ok<List<ProductCategoryNodeDto>>> GetProductCategoryTree(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetProductCategoryTreeQuery()));
    }

    public async Task<Ok<List<TagDto>>> GetTags(ISender sender, [FromQuery] string? searchTerm)
    {
        return TypedResults.Ok(await sender.Send(new GetTagsQuery(searchTerm)));
    }

    public async Task<Ok<List<CustomAttributeDefinitionDto>>> GetCustomAttributeDefinitions(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetCustomAttributeDefinitionsQuery()));
    }

    public async Task<Ok<List<DisplaySpecificationDefinitionDto>>> GetDisplaySpecificationDefinitions(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetDisplaySpecificationDefinitionsQuery()));
    }
    #endregion

    #region Admin Product CRUD Implementations
    public async Task<Ok<PaginatedList<ProductListItemDto>>> GetAllAdminProducts(ISender sender, [AsParameters] GetAllAdminProductsQuery query)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<Results<Ok<ProductDetailDto>, NotFound>> GetProductByIdForAdmin(ISender sender, Guid id, [FromQuery] string? selectedAttributes)
    {
        Dictionary<string, string>? parsedSelected = null;
        if (!string.IsNullOrEmpty(selectedAttributes))
        {
            parsedSelected = selectedAttributes.Split(',').Select(part => part.Split(':', 2)).Where(parts => parts.Length == 2).ToDictionary(parts => parts[0].Trim(), parts => parts[1].Trim(), StringComparer.OrdinalIgnoreCase);
        }
        var query = new GetProductByIdForAdminQuery(id, parsedSelected);
        var result = await sender.Send(query);
        return result != null ? TypedResults.Ok(result) : TypedResults.NotFound();
    }

    public async Task<Results<Created<ProductDetailDto>, BadRequest<IDictionary<string, string[]>>>> CreateProduct(ISender sender, [FromBody] CreateProductCommand command)
    {
        var productId = await sender.Send(command);
        var newProductDto = await sender.Send(new GetProductByIdForAdminQuery(productId)); // Gebruik de admin query voor de response
        return TypedResults.Created($"/api/AdminProducts/{productId}", newProductDto);
    }

    public async Task<Results<Ok<ProductDetailDto>, BadRequest, NotFound>> UpdateProduct(Guid id, ISender sender, [FromBody] UpdateProductCommand command)
    {
        if (id != command.Id && command.Id != Guid.Empty)
        {
            return TypedResults.BadRequest();
        }
        command.Id = id;
        var updatedProductDto = await sender.Send(command); // UpdateProductCommand handler retourneert al de DTO
        return TypedResults.Ok(updatedProductDto);
    }

    public async Task<Results<NoContent, NotFound>> DeleteProduct(Guid id, ISender sender)
    {
        await sender.Send(new RoyalCode.Application.Products.Commands.DeleteProduct.DeleteProductCommand(id));
        return TypedResults.NoContent();
    }
    #endregion
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/AdminReviews.cs ---
/**
 * @file AdminReviews.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description API endpoints for administrator management of product reviews, including moderation.
 */
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Reviews.Commands.DeleteReview; 
using RoyalCode.Application.Reviews.Commands.UpdateReview; 
using RoyalCode.Application.Reviews.Commands.UpdateReviewStatus; 
using RoyalCode.Application.Reviews.Queries.GetAllReviewsForAdmin; 
using RoyalCode.Application.Reviews.Queries.GetReviewByIdForAdmin;
using RoyalCode.Application.Reviews.Queries.GetReviewsForProduct; 
using RoyalCode.Domain.Constants; 
using RoyalCode.Domain.Enums.Review; 
using AppNotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using ForbiddenAccessException = RoyalCode.Application.Common.Exceptions.ForbiddenAccessException;
using ValidationException = RoyalCode.Application.Common.Exceptions.ValidationException; 

namespace RoyalCode.Web.Endpoints;

#region Request Payload DTOs
public record UpdateReviewAdminPayload(decimal Rating, string ReviewText, string? Title, List<Guid>? MediaIds);
public record UpdateReviewStatusPayload(ReviewStatus NewStatus, string? ModeratorNote);
#endregion

public class AdminReviews : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/AdminReviews")
            .WithTags("Reviews (Admin)")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator, Roles.Moderator));

        // === GET Endpoints ===
        group.MapGet("/", GetAllReviewsForAdmin)
             .WithOpenApi(op => new(op) { Summary = "Get a paginated list of all reviews, including pending and rejected, for admin moderation." });

        group.MapGet("/{id:guid}", GetReviewByIdForAdmin)
             .WithOpenApi(op => new(op) { Summary = "Get detailed information for a single review by ID for admin editing." });

        // === PUT Endpoints ===
        group.MapPut("/{id:guid}/status", UpdateReviewStatus)
             .WithOpenApi(op => new(op) { Summary = "Update the status of a review (Approve, Reject, Flag, etc.) by an administrator." });

        group.MapPut("/{id:guid}", UpdateReviewAdmin)
             .WithOpenApi(op => new(op) { Summary = "Update the content and rating of any review by an administrator." });

        // === DELETE Endpoints ===
        group.MapDelete("/{id:guid}", DeleteReviewAdmin)
             .WithOpenApi(op => new(op) { Summary = "Delete any review by an administrator." });
    }

    #region GET Implementations
    public async Task<Ok<PaginatedList<ReviewListItemDto>>> GetAllReviewsForAdmin(ISender sender, [AsParameters] GetAllReviewsForAdminQuery query)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<Results<Ok<ReviewListItemDto>, NotFound>> GetReviewByIdForAdmin(ISender sender, Guid id)
    {
        var result = await sender.Send(new GetReviewByIdForAdminQuery(id));
        return result != null ? TypedResults.Ok(result) : TypedResults.NotFound();
    }
    #endregion

    #region PUT Implementations
    public async Task<Results<NoContent, NotFound, BadRequest>> UpdateReviewStatus(Guid id, [FromBody] UpdateReviewStatusPayload payload, ISender sender, IUser currentUser)
    {
        var command = new UpdateReviewStatusCommand(id, payload.NewStatus, payload.ModeratorNote, currentUser.Id!.Value);
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<Ok<ReviewListItemDto>, NotFound, ForbidHttpResult, BadRequest<IDictionary<string, string[]>>>> UpdateReviewAdmin(Guid id, [FromBody] UpdateReviewAdminPayload payload, ISender sender)
    {
        try
        {
            var command = new UpdateReviewCommand { Id = id, Rating = payload.Rating, ReviewText = payload.ReviewText, Title = payload.Title, MediaIds = payload.MediaIds };
            var result = await sender.Send(command);
            return TypedResults.Ok(result);
        }
        catch (AppNotFoundException) { return TypedResults.NotFound(); } 
        catch (ForbiddenAccessException) { return TypedResults.Forbid(); } 
        catch (ValidationException ex) { return TypedResults.BadRequest(ex.Errors); }
    }

    #endregion

    #region DELETE Implementations
    public async Task<Results<NoContent, NotFound>> DeleteReviewAdmin(Guid id, ISender sender)
    {
        // Hergebruik van de bestaande DeleteReviewCommand.
        // Autorisatie op AuthorId is hier niet van toepassing, omdat een admin alles mag.
        // De Role-based Authorization op het endpoint-groep is hier de overkoepelende beveiliging.
        await sender.Send(new DeleteReviewCommand(id));
        return TypedResults.NoContent();
    }
    #endregion
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/AdminRoles.cs ---
/**
 * @file AdminRoles.cs
 * @Version 1.2.0 (Corrected Usings)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Endpoints for full role and permission management by administrators.
 */
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Admin.Common;
using RoyalCode.Application.Users.Admin.Commands.Roles;
using RoyalCode.Application.Users.Admin.Queries;
using RoyalCode.Application.Users.Admin.Queries.Roles;
using RoyalCode.Domain.Constants;

namespace RoyalCode.Web.Endpoints;

public record CreateRolePayload(string Name);
public record UpdateRolePayload(string Name);
public record UpdateRolePermissionsPayload(List<string> Permissions);

public class AdminRoles : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/admin/roles")
            .WithTags("Roles (Admin)")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator));

        group.MapGet("/", GetAllRoles)
             .WithOpenApi(op => new(op) { Summary = "Get a list of all roles in the system." });

        group.MapPost("/", CreateRole)
             .WithOpenApi(op => new(op) { Summary = "Create a new role." });

        group.MapPut("/{id:guid}", UpdateRole)
             .WithOpenApi(op => new(op) { Summary = "Update an existing role's name." });

        group.MapDelete("/{id:guid}", DeleteRole)
             .WithOpenApi(op => new(op) { Summary = "Delete a role if it's not assigned to any user." });

        group.MapGet("/{id:guid}/permissions", GetPermissionsForRole)
             .WithOpenApi(op => new(op) { Summary = "Get the permissions currently assigned to a role." });

        group.MapPut("/{id:guid}/permissions", UpdatePermissionsForRole)
             .WithOpenApi(op => new(op) { Summary = "Replace all permissions for a specific role." });
    }

    public async Task<Ok<List<AdminRoleDto>>> GetAllRoles(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetAllRolesDetailsQuery()));
    }

    public async Task<Results<Created<AdminRoleDto>, BadRequest<IDictionary<string, string[]>>, Conflict<string>>> CreateRole(ISender sender, [FromBody] CreateRolePayload payload)
    {
        var command = new CreateRoleCommand { Name = payload.Name };
        var result = await sender.Send(command);
        return TypedResults.Created($"/api/admin/roles/{result.Id}", result);
    }

    public async Task<Results<Ok<AdminRoleDto>, NotFound, BadRequest<IDictionary<string, string[]>>, Conflict<string>>> UpdateRole(Guid id, [FromBody] UpdateRolePayload payload, ISender sender)
    {
        var command = new UpdateRoleCommand { Id = id, Name = payload.Name };
        var result = await sender.Send(command);
        return TypedResults.Ok(result);
    }

    public async Task<Results<NoContent, NotFound, BadRequest<IDictionary<string, string[]>>, Conflict<string>>> DeleteRole(Guid id, ISender sender)
    {
        await sender.Send(new DeleteRoleCommand(id));
        return TypedResults.NoContent();
    }

    public async Task<Results<Ok<List<PermissionDto>>, NotFound>> GetPermissionsForRole(Guid id, ISender sender)
    {
        var permissions = await sender.Send(new GetPermissionsForRoleQuery(id));
        return TypedResults.Ok(permissions);
    }

    public async Task<Results<NoContent, NotFound>> UpdatePermissionsForRole(Guid id, [FromBody] UpdateRolePermissionsPayload payload, ISender sender)
    {
        await sender.Send(new UpdatePermissionsForRoleCommand
        {
            RoleId = id,
            Permissions = payload.Permissions
        });
        return TypedResults.NoContent();
    }

}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/AdminUsers.cs ---
/**
 * @file AdminUsers.cs (Definitive & Corrected DI)
 * @Version 4.3.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Provides a comprehensive set of API endpoints for user management by administrators.
 *              Includes full CRUD, role management, and account status control.
 */
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Users.Admin.Commands;
using RoyalCode.Application.Users.Admin.Common;
using RoyalCode.Application.Users.Admin.Queries;
using RoyalCode.Application.Users.Queries;
using RoyalCode.Domain.Constants;

namespace RoyalCode.Web.Endpoints;

public record CreateUserPayload(string Email, string Password, string DisplayName, string? FirstName, string? MiddleName, string? LastName, string? Bio, List<string> Roles);

public record UpdateUserPayload(string DisplayName, string FirstName, string LastName, string Bio, List<string> Roles);

public record LockUserPayload(DateTimeOffset? LockoutEnd);

public record SetUserPasswordPayload(string NewPassword);

public class AdminUsers : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/admin/users")
            .WithTags("Users (Admin)")
            .RequireAuthorization(policy => policy.RequireRole(Roles.Administrator));

        // === GROUP: GET Endpoints ===

        group.MapGet("/", GetAllUsers)
             .WithOpenApi(op => new(op) { Summary = "Retrieves a paginated list of all users.", Description = "Allows administrators to view all registered users with optional filtering by search term and role." });

        group.MapGet("/{id:guid}", GetUserById)
             .WithOpenApi(op => new(op) { Summary = "Retrieves detailed information for a specific user by ID.", Description = "Provides comprehensive user profile and account status details for administrative purposes." });

        group.MapGet("/lookup", GetCustomerLookup)
             .WithOpenApi(op => new(op) { Summary = "Retrieves a list of users for lookup or typeahead functionality.", Description = "Useful for quickly finding users by name or email when adding to orders or assigning tasks." });

        // === GROUP: POST Endpoints ===

        group.MapPost("/", CreateUser)
             .WithOpenApi(op => new(op) { Summary = "Creates a new user account.", Description = "Allows administrators to register new users and assign initial roles." });

        group.MapPost("/{id:guid}/lock", LockUser)
             .WithOpenApi(op => new(op) { Summary = "Locks a user account, optionally until a specified date.", Description = "Prevents a user from logging in for administrative reasons. Can be a temporary or permanent lock." });

        group.MapPost("/{id:guid}/unlock", UnlockUser)
             .WithOpenApi(op => new(op) { Summary = "Unlocks a previously locked user account.", Description = "Restores login access for a user." });

        group.MapPost("/{id:guid}/set-password", SetUserPassword)
             .WithOpenApi(op => new(op) { Summary = "Sets a new password for a user.", Description = "Allows administrators to reset a user's password without knowing the old one. User will need to use the new password for login." });

        // === GROUP: PUT Endpoints ===

        group.MapPut("/{id:guid}", UpdateUser)
             .WithOpenApi(op => new(op) { Summary = "Updates a user's profile information and roles.", Description = "Modifies user's display name, personal details, and changes their assigned roles." });

        // === GROUP: DELETE Endpoints ===

        group.MapDelete("/{id:guid}", DeleteUser)
             .WithOpenApi(op => new(op) { Summary = "Deletes a user account.", Description = "Permanently removes a user from the system. This action is irreversible." });
    }

    // === GROUP: GET Implementations ===
    public async Task<Ok<PaginatedList<AdminUserListItemDto>>> GetAllUsers(ISender sender, [AsParameters] GetAllUsersQuery query)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<Results<Ok<AdminUserDetailDto>, NotFound>> GetUserById(Guid id, ISender sender)
    {
        var user = await sender.Send(new GetUserByIdQuery(id));
        return TypedResults.Ok(user);
    }

    public async Task<Ok<List<UserLookupDto>>> GetCustomerLookup(ISender sender, [AsParameters] GetCustomerLookupQuery query)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    // === GROUP: POST Implementations ===

    public async Task<Results<Created<Guid>, BadRequest<IDictionary<string, string[]>>>> CreateUser(ISender sender, [FromBody] CreateUserPayload payload)
    {
        var command = new CreateUserCommand
        {
            Email = payload.Email,
            Password = payload.Password,
            DisplayName = payload.DisplayName,
            FirstName = payload.FirstName,
            MiddleName = payload.MiddleName,
            LastName = payload.LastName,
            Bio = payload.Bio,
            Roles = payload.Roles
        };
        var userId = await sender.Send(command);
        return TypedResults.Created($"/api/admin/users/{userId}", userId);
    }

    public async Task<Results<NoContent, NotFound, BadRequest<IDictionary<string, string[]>>>> LockUser(Guid id, [FromBody] LockUserPayload payload, ISender sender, IUser currentUser)
    {
        var command = new LockUserCommand { UserId = id, LockoutEnd = payload.LockoutEnd, RequestingUserId = currentUser.Id!.Value };
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, NotFound, BadRequest<IDictionary<string, string[]>>>> UnlockUser(Guid id, [FromBody] LockUserPayload payload, ISender sender, IUser currentUser)
    {
        var command = new UnlockUserCommand { UserId = id, RequestingUserId = currentUser.Id!.Value };
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, NotFound, BadRequest<IDictionary<string, string[]>>>> SetUserPassword(Guid id, [FromBody] SetUserPasswordPayload payload, ISender sender, IUser currentUser)
    {
        var command = new SetUserPasswordCommand { UserId = id, NewPassword = payload.NewPassword, RequestingUserId = currentUser.Id!.Value };
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    // === GROUP: PUT Implementations ===

    public async Task<Results<NoContent, NotFound, BadRequest<IDictionary<string, string[]>>>> UpdateUser(Guid id, [FromBody] UpdateUserPayload payload, ISender sender, IUser currentUser)
    {
        var command = new UpdateUserCommand
        {
            Id = id,
            DisplayName = payload.DisplayName,
            FirstName = payload.FirstName,
            LastName = payload.LastName,
            Bio = payload.Bio,
            Roles = payload.Roles,
            RequestingUserId = currentUser.Id!.Value
        };
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    // === GROUP: DELETE Implementations ===

    public async Task<Results<NoContent, NotFound>> DeleteUser(Guid id, ISender sender, IUser currentUser)
    {
        var command = new DeleteUserCommand { Id = id, RequestingUserId = currentUser.Id!.Value };
        await sender.Send(command);
        return TypedResults.NoContent();
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Authentication.cs ---
/**
 * @file Authentication.cs
 * @Version 2.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-01
 * @Description Corrected Minimal API endpoints for authentication. Fixes the refresh token
 *              persistence and validation logic to prevent "Invalid token" errors.
 */
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Events;
using RoyalCode.Domain.Entities;
using RoyalCode.Infrastructure.Identity;
using static RoyalCode.Web.Endpoints.Users; // Nodig voor ProfileDto

namespace RoyalCode.Web.Endpoints;

public class Authentication : EndpointGroupBase
{
    // === DTOs for the API ===
    public record LoginRequest(string Email, string Password);
    public record RegisterRequest(string Email, string Password, string FirstName, string? MiddleName, string LastName, string? DisplayName);
    public record RefreshTokenRequest(string Token);
    public record AuthResponse
    {
        public string AccessToken { get; init; } = string.Empty;
        public string RefreshToken { get; init; } = string.Empty;
        public ProfileDto User { get; init; } = null!;
    }

    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Authentication")
            .WithTags("Authentication")
            .AllowAnonymous();

        group.MapPost("/login", Login)
             .WithOpenApi(op => new(op) { Summary = "Authenticate user and get JWT access and refresh tokens." });

        group.MapPost("/register", Register)
             .WithOpenApi(op => new(op) { Summary = "Register a new user and get JWT access and refresh tokens." });

        group.MapPost("/refresh", RefreshToken)
             .WithOpenApi(op => new(op) { Summary = "Refresh JWT access token using a valid refresh token." });
    }

    // === POST Implementations ===

    public async Task<Results<Ok<AuthResponse>, BadRequest<string>>> Login(
        [FromBody] LoginRequest request,
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        IApplicationDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            return TypedResults.BadRequest("Invalid email or password.");
        }

        if (await userManager.IsLockedOutAsync(user))
        {
            return TypedResults.BadRequest("This account has been locked out.");
        }

        // --- DE DEFINITIEVE FIX: Vertaalbare LINQ Query ---
        var oldTokens = await dbContext.RefreshTokens
            .Where(rt => rt.UserId == user.Id && rt.Revoked == null && rt.Expires > DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        if (oldTokens.Any())
        {
            dbContext.RefreshTokens.RemoveRange(oldTokens);
        }
        // --- EINDE FIX ---

        var roles = await userManager.GetRolesAsync(user);
        var claims = CreateClaimsForUser(user, roles);

        var accessToken = tokenService.GenerateAccessToken(claims);
        var refreshToken = tokenService.GenerateRefreshToken(user.Id);

        dbContext.RefreshTokens.Add(refreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = CreateAuthResponse(user, accessToken, refreshToken.Token);
        return TypedResults.Ok(response);
    }


    public async Task<Results<Ok<AuthResponse>, BadRequest<IdentityResult>>> Register(
         [FromBody] RegisterRequest request,
         UserManager<ApplicationUser> userManager,
         ITokenService tokenService,
         IApplicationDbContext dbContext,
         IMediator mediator, // DE FIX: Directe injectie van IMediator
         CancellationToken cancellationToken)
    {
        // Genereer een standaard DisplayName als deze niet is opgegeven
        var finalDisplayName = request.DisplayName ?? $"{request.FirstName} {request.LastName}".Trim();
        if (string.IsNullOrWhiteSpace(finalDisplayName))
        {
            finalDisplayName = request.Email; // Fallback naar e-mail als naamvelden ook leeg zijn
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = finalDisplayName,
            FirstName = request.FirstName,
            MiddleName = request.MiddleName, // NIEUW: MiddleName wordt nu ook opgeslagen
            LastName = request.LastName,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return TypedResults.BadRequest(result);
        }

        // Voeg de gebruiker direct toe aan de standaard 'User' rol, als er geen andere logica is
        await userManager.AddToRoleAsync(user, RoyalCode.Domain.Constants.Roles.User);


        var roles = await userManager.GetRolesAsync(user);
        var claims = CreateClaimsForUser(user, roles);

        var accessToken = tokenService.GenerateAccessToken(claims);
        var refreshToken = tokenService.GenerateRefreshToken(user.Id);

        dbContext.RefreshTokens.Add(refreshToken);

        // DE FIX: Gebruik Publish() voor INotification events
        await mediator.Publish(new UserRegisteredEvent(user.Id, user.UserName!, user.Email!), cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = CreateAuthResponse(user, accessToken, refreshToken.Token);
        return TypedResults.Ok(response);
    }


    public async Task<Results<Ok<AuthResponse>, BadRequest<string>>> RefreshToken(
      [FromBody] RefreshTokenRequest request,
      UserManager<ApplicationUser> userManager,
      ITokenService tokenService,
      IApplicationDbContext dbContext,
      CancellationToken cancellationToken)
    {
        var savedRefreshToken = await dbContext.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == request.Token, cancellationToken);

        var user = savedRefreshToken != null
            ? await userManager.FindByIdAsync(savedRefreshToken.UserId.ToString())
            : null;

        if (user == null || savedRefreshToken == null || savedRefreshToken.Revoked != null || savedRefreshToken.Expires <= DateTime.UtcNow)
        {
            if (user != null)
            {
                var allUserRefreshTokens = await dbContext.RefreshTokens
                    .Where(rt => rt.UserId == user.Id && rt.Revoked == null && rt.Expires > DateTime.UtcNow)
                    .ToListAsync(cancellationToken);

                dbContext.RefreshTokens.RemoveRange(allUserRefreshTokens);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            return TypedResults.BadRequest("Invalid or expired refresh token. All related tokens revoked.");
        }

        dbContext.RefreshTokens.Remove(savedRefreshToken);

        var roles = await userManager.GetRolesAsync(user);
        var claims = CreateClaimsForUser(user, roles);
        var newAccessToken = tokenService.GenerateAccessToken(claims);
        var newRefreshToken = tokenService.GenerateRefreshToken(user.Id);

        dbContext.RefreshTokens.Add(newRefreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = CreateAuthResponse(user, newAccessToken, newRefreshToken.Token);
        return TypedResults.Ok(response);
    }



    // === Private Helper Methods ===

    private static List<Claim> CreateClaimsForUser(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.UserName!),
            new(ClaimTypes.Email, user.Email!)
        };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        return claims;
    }

    private static AuthResponse CreateAuthResponse(ApplicationUser user, string accessToken, string refreshToken)
    {
        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = new ProfileDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email,
                Bio = user.Bio
            }
        };
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Cart.cs ---
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Cart.Commands;
using RoyalCode.Application.Cart.Common;
using RoyalCode.Application.Cart.Queries;
using RoyalCode.Application.Common.Interfaces; // Toegevoegd voor IUser

namespace RoyalCode.Web.Endpoints;

// --- DTO's specifiek voor de Cart API request payloads ---
public record AddCartItemPayloadDto(Guid ProductId, Guid? VariantId, int Quantity = 1);
public record UpdateCartItemPayloadDto(int Quantity);
public record MergeCartPayloadDto(List<MergeCartItemDto> Items);

public class Cart : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Cart") // Expliciete URL-prefix
            .WithTags("Cart") // Consistent tag
            .RequireAuthorization(); // Alle cart-operaties vereisen autorisatie

        // === GET Endpoints ===
        group.MapGet("/", GetCart)
             .WithOpenApi(op => new(op) { Summary = "Get the shopping cart for the authenticated user." });

        // === POST Endpoints ===
        group.MapPost("/items", AddItem)
             .WithOpenApi(op => new(op) { Summary = "Add a product item to the user's cart or update its quantity." });

        group.MapPost("/merge", MergeCart)
             .WithOpenApi(op => new(op) { Summary = "Merge an anonymous client-side cart with the authenticated user's backend cart." });

        // === PATCH Endpoints ===
        group.MapPatch("/items/{itemId:guid}", UpdateItemQuantity)
             .WithOpenApi(op => new(op) { Summary = "Update the quantity of a specific item in the user's cart." });

        // === DELETE Endpoints ===
        group.MapDelete("/", ClearCart)
             .WithOpenApi(op => new(op) { Summary = "Clear all items from the user's cart." });

        group.MapDelete("/items/{itemId:guid}", RemoveItem)
             .WithOpenApi(op => new(op) { Summary = "Remove a specific item from the user's cart." });
    }

    // === GET Implementations ===
    public async Task<Results<Ok<CartDto>, NotFound>> GetCart(ISender sender, IUser user)
    {
        var cart = await sender.Send(new GetCartQuery(user.Id!.Value));
        return cart is not null ? TypedResults.Ok(cart) : TypedResults.NotFound();
    }

    // === POST Implementations ===
    public async Task<Results<Ok<CartItemDto>, NotFound, BadRequest>> AddItem(
        [FromBody] AddCartItemPayloadDto payload, ISender sender, IUser user)
    {
        var command = new AddItemToCartCommand { UserId = user.Id!.Value, ProductId = payload.ProductId, VariantId = payload.VariantId, Quantity = payload.Quantity };
        var result = await sender.Send(command);
        return TypedResults.Ok(result);
    }

    public async Task<Results<Ok<CartDto>, NotFound, BadRequest>> MergeCart(
        [FromBody] MergeCartPayloadDto payload, ISender sender, IUser user)
    {
        var command = new MergeCartCommand { UserId = user.Id!.Value, Items = payload.Items };
        var result = await sender.Send(command);
        return TypedResults.Ok(result);
    }

    // === PATCH Implementations ===
    public async Task<Results<NoContent, NotFound, BadRequest>> UpdateItemQuantity(
        Guid itemId, [FromBody] UpdateCartItemPayloadDto payload, ISender sender, IUser user)
    {
        var command = new UpdateCartItemQuantityCommand { UserId = user.Id!.Value, CartItemId = itemId, Quantity = payload.Quantity };
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    // === DELETE Implementations ===
    public async Task<Results<NoContent, NotFound>> ClearCart(ISender sender, IUser user)
    {
        await sender.Send(new ClearCartCommand(user.Id!.Value));
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, NotFound>> RemoveItem(Guid itemId, ISender sender, IUser user)
    {
        await sender.Send(new RemoveItemFromCartCommand(user.Id!.Value, itemId));
        return TypedResults.NoContent();
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Chat.cs ---
/**
 * @file Chat.cs
 * @Version 3.3.2 (FINAL - All Usings and Types Corrected)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description API endpoints for the real-time chat feature. All using directives
 *              and type references are now definitively correct.
 */
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Chat.Commands;
using RoyalCode.Application.Chat.Common;
using RoyalCode.Application.Chat.Queries;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Domain.Exceptions;
using AppNotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;

namespace RoyalCode.Web.Endpoints;

#region Payload DTOs
public record SendMessagePayloadDto(string Content, List<Guid>? MediaIds = null);
public record StartDirectMessagePayloadDto(Guid OtherUserId);
public record CreateGroupChatPayloadDto(string Title, List<Guid> InitialUserIds);
public record AddParticipantPayloadDto(Guid UserId);
public record StartAiChatPayloadDto(string AiPersonaName);
public record AnonymousSendMessagePayloadDto(string AiPersonaId, string Content);
public record AssociateAnonymousChatPayloadDto(Guid AnonymousSessionId);
#endregion

public class Chat : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Chat")
            .WithTags("Chat");

        // === Authenticated Chat Endpoints ===
        group.MapGet("/conversations", GetMyConversations).RequireAuthorization();
        group.MapGet("/conversations/{conversationId:guid}/messages", GetMessagesForConversation).RequireAuthorization();
        group.MapPost("/conversations/{conversationId:guid}/read", MarkConversationAsRead).RequireAuthorization();
        group.MapPost("/conversations/{conversationId:guid}/messages", SendMessage).RequireAuthorization();
        group.MapPost("/conversations/direct-message", StartDirectMessage).RequireAuthorization();
        group.MapPost("/conversations/group", CreateGroupChat).RequireAuthorization();
        group.MapPost("/conversations/ai-bot", StartAiChat).RequireAuthorization();

        // --- Authenticated Participant Management ---
        group.MapGet("/conversations/{conversationId:guid}/participants", GetParticipants).RequireAuthorization();
        group.MapPost("/conversations/{conversationId:guid}/participants", AddParticipant).RequireAuthorization();
        group.MapDelete("/conversations/{conversationId:guid}/participants/{userId:guid}", RemoveParticipant).RequireAuthorization();

        // === Anonymous Chat Endpoints ===
        group.MapPost("/conversations/ai-bot/anonymous", SendAnonymousMessage).AllowAnonymous();
        group.MapPost("/conversations/anonymous/associate", AssociateAnonymousChat).RequireAuthorization();
        group.MapGet("/conversations/anonymous/{anonymousSessionId:guid}", GetAnonymousConversation).AllowAnonymous();

        // === Public Lookups ===
        group.MapGet("/ai-personas/{name}", GetAiPersonaByName).AllowAnonymous();
    }

    #region Authenticated User Implementations
    public async Task<Ok<List<ConversationListItemDto>>> GetMyConversations(ISender sender)
        => TypedResults.Ok(await sender.Send(new GetMyConversationsQuery()));

    public async Task<Results<Ok<PaginatedList<MessageDto>>, ForbidHttpResult, NotFound>> GetMessagesForConversation(ISender sender, Guid conversationId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
        => TypedResults.Ok(await sender.Send(new GetMessagesForConversationQuery { ConversationId = conversationId, PageNumber = pageNumber, PageSize = pageSize }));

    public async Task<Results<NoContent, NotFound, ForbidHttpResult>> MarkConversationAsRead(ISender sender, Guid conversationId)
    {
        await sender.Send(new MarkConversationAsReadCommand(conversationId));
        return TypedResults.NoContent();
    }

    public async Task<Results<Created<MessageDto>, NotFound, ForbidHttpResult>> SendMessage(Guid conversationId, [FromBody] SendMessagePayloadDto payload, ISender sender, IUser currentUser)
    {
        var command = new SendMessageCommand { ConversationId = conversationId, SenderUserId = currentUser.Id!.Value, Content = payload.Content, MediaIds = payload.MediaIds };
        var dto = await sender.Send(command);
        return TypedResults.Created($"/api/Chat/conversations/{conversationId}/messages/{dto.Id}", dto);
    }

    public async Task<Results<Ok<StartConversationResponseDto>, BadRequest<string>>> StartDirectMessage([FromBody] StartDirectMessagePayloadDto payload, ISender sender)
        => TypedResults.Ok(await sender.Send(new StartDirectMessageCommand(payload.OtherUserId)));

    public async Task<Results<Created<StartConversationResponseDto>, BadRequest>> CreateGroupChat([FromBody] CreateGroupChatPayloadDto payload, ISender sender)
    {
        var result = await sender.Send(new CreateGroupChatCommand(payload.Title, payload.InitialUserIds));
        return TypedResults.Created($"/api/Chat/conversations/{result.ConversationId}", result);
    }

    public async Task<Results<Ok<StartConversationResponseDto>, BadRequest<string>, NotFound<string>>> StartAiChat([FromBody] StartAiChatPayloadDto payload, ISender sender)
    {
        var getPersonaQuery = new GetAiPersonaByNameQuery(payload.AiPersonaName);
        var personaDto = await sender.Send(getPersonaQuery);

        if (personaDto == null)
        {
            return TypedResults.NotFound($"AI Persona '{payload.AiPersonaName}' was not found.");
        }

        var command = new StartAiChatCommand(personaDto.Id);
        return TypedResults.Ok(await sender.Send(command));
    }

    public async Task<Results<Ok<List<ParticipantDto>>, NotFound, ForbidHttpResult>> GetParticipants(Guid conversationId, ISender sender)
        => TypedResults.Ok(await sender.Send(new GetParticipantsForConversationQuery(conversationId)));

    public async Task<Results<NoContent, NotFound, ForbidHttpResult>> AddParticipant(Guid conversationId, [FromBody] AddParticipantPayloadDto payload, ISender sender)
    {
        await sender.Send(new AddParticipantToGroupCommand(conversationId, payload.UserId));
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, NotFound, ForbidHttpResult>> RemoveParticipant(Guid conversationId, Guid userId, ISender sender)
    {
        await sender.Send(new RemoveParticipantFromGroupCommand(conversationId, userId));
        return TypedResults.NoContent();
    }
    #endregion

    #region Anonymous User Implementations
    public async Task<Results<Ok<AnonymousChatResponseDto>, BadRequest<string>, ProblemHttpResult, NotFound<string>>> SendAnonymousMessage(
        [FromBody] AnonymousSendMessagePayloadDto payload,
        [FromQuery] Guid? anonymousSessionId,
        ISender sender)
    {
        try
        {
            var command = new SendAnonymousMessageCommand
            {
                AnonymousSessionId = anonymousSessionId,
                AiPersonaId = payload.AiPersonaId,
                Content = payload.Content
            };
            var result = await sender.Send(command);
            return TypedResults.Ok(result);
        }
        catch (BadRequestException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
        catch (DomainException ex) when (ex.ErrorCode == "MESSAGE_LIMIT_REACHED")
        {
            return TypedResults.Problem(
                title: "Message Limit Reached",
                detail: ex.Message,
                statusCode: StatusCodes.Status403Forbidden,
                extensions: new Dictionary<string, object?> { { "errorCode", ex.ErrorCode } }
            );
        }
        catch (AppNotFoundException ex)
        {
            return TypedResults.NotFound(ex.Message);
        }
    }

    public async Task<Results<NoContent, NotFound, ForbidHttpResult>> AssociateAnonymousChat(
        [FromBody] AssociateAnonymousChatPayloadDto payload,
        ISender sender)
    {
        var command = new AssociateAnonymousChatCommand(payload.AnonymousSessionId);
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<Ok<AnonymousConversationDto>, NotFound>> GetAnonymousConversation(
        Guid anonymousSessionId,
        ISender sender)
    {
        var conversation = await sender.Send(new GetAnonymousConversationQuery(anonymousSessionId));
        return conversation != null ? TypedResults.Ok(conversation) : TypedResults.NotFound();
    }
    #endregion

    #region Public Lookup Implementations
    public async Task<Results<Ok<AIPersonaDto>, NotFound>> GetAiPersonaByName(string name, ISender sender)
    {
        var persona = await sender.Send(new GetAiPersonaByNameQuery(name));
        return persona != null ? TypedResults.Ok(persona) : TypedResults.NotFound();
    }
    #endregion
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Checkout.cs ---
/**
 * @file Checkout.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description API endpoints related to the checkout process.
 */
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Checkout.Queries;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Web.Endpoints;

public class Checkout : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Checkout")
            .WithTags("Checkout")
            .RequireAuthorization();

        group.MapGet("/shipping-methods", GetAvailableShippingMethods)
             .WithOpenApi(op => new(op) { Summary = "Get available shipping methods for the user's cart and selected address." });
    }

    public async Task<Results<Ok<List<ShippingMethodDto>>, NotFound>> GetAvailableShippingMethods(
        [FromQuery] Guid shippingAddressId,
        ISender sender,
        IUser currentUser)
    {
        var userId = currentUser.Id ?? throw new UnauthorizedAccessException();
        var query = new GetAvailableShippingMethodsQuery(userId, shippingAddressId);
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/DebugEndpoints.cs ---
using Microsoft.AspNetCore.Http.HttpResults;
using RoyalCode.Domain.Enums.Product; // Zorg dat deze using aanwezig is

namespace RoyalCode.Web.Endpoints;

public class DebugEndpoints : EndpointGroupBase
{
    // Een simpele record om te testen
    public record EnumTestDto
    {
        public ProductStatus Status { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/DebugEndpoints") // Expliciete URL-prefix
            .WithTags("Diagnostics") // Consistent tag
            .AllowAnonymous();

        // === GET Endpoints ===
        group.MapGet("/enumtest", () =>
        {
            var testObject = new EnumTestDto
            {
                Status = ProductStatus.Published,
                Description = "Als de 'Status' hiernaast het getal 1 is, werkt de globale configuratie."
            };
            return TypedResults.Ok(testObject);
        })
        .WithOpenApi(op => new(op) { Summary = "Test endpoint to verify enum serialization (internal diagnostic)." });
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Media.cs ---
using System.Text.Json;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Media.Commands.DeleteMedia;
using RoyalCode.Application.Media.Commands.UpdateMedia;
using RoyalCode.Application.Media.Commands.UploadImage;
using RoyalCode.Application.Media.Queries.GetMediaById;
using RoyalCode.Application.Media.Queries.GetMediaByTag;
using RoyalCode.Application.Media.Queries.GetMediaForProductAttribute;
using RoyalCode.Application.Media.Queries.GetMediaForProductVariant;
using RoyalCode.Application.Media.Queries.GetMediaWithPagination;
using RoyalCode.Application.Media.Queries.GetTagsForMedia;

namespace RoyalCode.Web.Endpoints;

public record UploadImageMetadataDto(string AltText, string? Title);

public class Media : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Media") // Expliciete URL-prefix
            .WithTags("Media"); // Consistent tag

        // === GET Endpoints ===
        group.MapGet("/", GetMedia)
             .WithOpenApi(op => new(op) { Summary = "Get a paginated list of media items with optional filters." });

        group.MapGet("/{id:guid}", GetMediaById)
             .WithOpenApi(op => new(op) { Summary = "Get detailed information for a single media item by ID." });

        group.MapGet("/product/{productId:guid}/attribute-value/{attributeValueId:guid}", GetMediaForProductAttribute)
             .WithOpenApi(op => new(op) { Summary = "Get media items associated with a specific product attribute value (e.g., color variant images)." });

        group.MapGet("/product-variant/{productId:guid}/{variantId:guid}", GetMediaForProductVariant)
             .WithOpenApi(op => new(op) { Summary = "Get media items relevant to a specific product variant." });

        group.MapGet("/tag/{tagName}", GetMediaByTag)
             .WithOpenApi(op => new(op) { Summary = "Get a paginated list of media items associated with a specific tag." });

        group.MapGet("/{mediaId:guid}/tags", GetTagsForMedia)
             .WithOpenApi(op => new(op) { Summary = "Get all tags associated with a specific media item." });

        // === POST Endpoints ===
        group.MapPost("/upload/image", UploadImage)
             .DisableAntiforgery() // Nodig voor form-data uploads
             .WithOpenApi(op => new(op) { Summary = "Upload a new image file and associated metadata." });

        // === PUT Endpoints ===
        group.MapPut("/{id:guid}", UpdateMedia)
             .WithOpenApi(op => new(op) { Summary = "Update metadata for an existing media item." });

        // === DELETE Endpoints ===
        group.MapDelete("/{id:guid}", DeleteMedia)
             .WithOpenApi(op => new(op) { Summary = "Delete a media item and its physical file." });
    }

    // === GET Implementations ===
    public async Task<Results<Ok<Application.Common.Models.MediaDto>, NotFound>> GetMediaById(Guid id, ISender sender)
    {
        var result = await sender.Send(new GetMediaByIdQuery(id));
        return result is not null ? TypedResults.Ok(result) : TypedResults.NotFound();
    }

    public async Task<Ok<PaginatedList<MediaListItemDto>>> GetMedia([AsParameters] GetMediaWithPaginationQuery query, ISender sender)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<Results<Ok<List<Application.Common.Models.MediaDto>>, NotFound>> GetMediaForProductAttribute(
      [FromRoute] Guid productId, [FromRoute] Guid attributeValueId, ISender sender)
    {
        var query = new GetMediaForProductAttributeQuery { ProductId = productId, AttributeValueId = attributeValueId };
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Results<Ok<List<Application.Common.Models.MediaDto>>, NotFound>> GetMediaForProductVariant(
    [FromRoute] Guid productId, [FromRoute] Guid variantId, ISender sender)
    {
        var query = new GetMediaForProductVariantQuery(productId, variantId);
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Ok<PaginatedList<MediaListItemDto>>> GetMediaByTag(
        [FromRoute] string tagName, [AsParameters] GetMediaByTagQuery query, ISender sender)
    {
        var fullQuery = query with { TagName = tagName };
        return TypedResults.Ok(await sender.Send(fullQuery));
    }

    public async Task<Results<Ok<List<MediaTagDto>>, NotFound>> GetTagsForMedia(
        [FromRoute] Guid mediaId, ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetTagsForMediaQuery(mediaId)));
    }

    // === POST Implementations ===
    public async Task<Results<Created<UploadImageResponseDto>, BadRequest<string>, BadRequest<IDictionary<string, string[]>>>> UploadImage(
    [FromForm] IFormFile file,
    [FromForm] string metadata,
    ISender sender,
    ILogger<Media> logger)
    {
        if (file == null || file.Length == 0)
        {
            return TypedResults.BadRequest("No file was uploaded.");
        }

        UploadImageMetadataDto? metadataDto;
        try
        {
            var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            metadataDto = JsonSerializer.Deserialize<UploadImageMetadataDto>(metadata, jsonOptions);

            if (metadataDto == null)
            {
                return TypedResults.BadRequest("Metadata could not be parsed.");
            }
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Failed to deserialize upload metadata JSON: {Metadata}", metadata);
            return TypedResults.BadRequest($"Invalid metadata format: {ex.Message}");
        }

        logger.LogInformation("Starting upload for file: {FileName}. Metadata parsed successfully.", file.FileName);

        var command = new UploadImageCommand
        {
            FileStream = file.OpenReadStream(),
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            Title = metadataDto.Title,
            AltText = metadataDto.AltText
        };

        var result = await sender.Send(command);

        logger.LogInformation("Image {ImageId} uploaded successfully. URL: {ImageUrl}", result.Id, result.Url);
        return TypedResults.Created($"/api/media/{result.Id}", result);
    }

    // === PUT Implementations ===
    public async Task<Results<NoContent, NotFound, BadRequest>> UpdateMedia(
        Guid id, [FromBody] UpdateMediaCommand command, ISender sender)
    {
        if (id != command.Id) return TypedResults.BadRequest();
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    // === DELETE Implementations ===
    public async Task<Results<NoContent, NotFound>> DeleteMedia(Guid id, ISender sender)
    {
        await sender.Send(new DeleteMediaCommand(id));
        return TypedResults.NoContent();
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Orders.cs ---
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Orders.Commands;
using RoyalCode.Application.Orders.Common;
using RoyalCode.Application.Orders.Queries;
using RoyalCode.Domain.Enums; // Voor ReturnReason

namespace RoyalCode.Web.Endpoints;

// DTO voor de payload
public record ReturnRequestPayloadDto(List<Guid> OrderItemIds, ReturnReason Reason, string? CustomerComments);

public class Orders : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Orders") // Expliciete URL-prefix
            .WithTags("Orders (Customer)") // Consistent tag
            .RequireAuthorization();

        // === GET Endpoints ===
        group.MapGet("/", GetMyOrders)
             .WithOpenApi(op => new(op) { Summary = "Get a paginated list of orders for the authenticated customer." });

        group.MapGet("/{orderId:guid}/invoice", DownloadInvoice)
             .WithOpenApi(op => new(op) { Summary = "Download the invoice for a specific order (customer-only)." });

        group.MapGet("/{orderId:guid}", GetOrderById)
             .WithOpenApi(op => new(op) { Summary = "Get detailed information for a specific order by ID (customer-only)." });

        group.MapGet("/return-reasons", GetReturnReasons)
             .WithOpenApi(op => new(op) { Summary = "Get the list of possible reasons for a return request." });

        // === POST Endpoints ===
        group.MapPost("/", CreateOrder)
             .WithOpenApi(op => new(op) { Summary = "Create a new order for the authenticated customer." });

        group.MapPost("/{orderId:guid}/cancel", CancelOrder)
             .WithOpenApi(op => new(op) { Summary = "Cancel a specific order (customer-only)." });

        group.MapPost("/{orderId:guid}/return-request", CreateReturnRequest)
             .WithOpenApi(op => new(op) { Summary = "Submit a return request for one or more items in an order." });
    }

    // === GET Implementations ===
    public async Task<Ok<PaginatedList<OrderListItemDto>>> GetMyOrders(ISender sender, [AsParameters] GetMyOrdersQuery query)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<Results<Ok<OrderDetailDto>, NotFound, ForbidHttpResult>> GetOrderById(ISender sender, Guid orderId)
    {
        var result = await sender.Send(new GetMyOrderByIdQuery(orderId));
        return TypedResults.Ok(result);
    }

    public async Task<Results<ContentHttpResult, NotFound, ForbidHttpResult>> DownloadInvoice(
        ISender sender, Guid orderId)
    {
        var invoiceData = await sender.Send(new GetOrderInvoiceDataQuery(orderId));

        var htmlContent = $"<html><body><h1>Invoice for Order {invoiceData.OrderNumber}</h1><p>Total: {invoiceData.GrandTotal} {invoiceData.Currency}</p></body></html>";
        return TypedResults.Content(htmlContent, "text/html");
    }

    public Ok<IReadOnlyCollection<string>> GetReturnReasons()
    {
        var reasons = Enum.GetNames(typeof(ReturnReason)).ToList();
        return TypedResults.Ok((IReadOnlyCollection<string>)reasons);
    }

    // === POST Implementations ===
    public async Task<Results<Created<OrderDetailDto>, BadRequest<IDictionary<string, string[]>>, Conflict>> CreateOrder(
        ISender sender, [FromBody] CreateOrderDto payload)
    {
        // --- DE FIX: Gebruik de correcte DTO-structuur voor CreateOrderCommand ---
        // CreateOrderDto heeft ShippingMethodId als parameter, wat het command dan ook moet gebruiken.
        var command = new CreateOrderCommand(payload.ShippingAddressId, payload.BillingAddressId, payload.ShippingMethodId, payload.PaymentMethod, payload.Items, payload.CustomerNotes);
        var result = await sender.Send(command);
        return TypedResults.Created($"/api/orders/{result.Id}", result);
    }



    public async Task<Results<NoContent, NotFound, ForbidHttpResult, BadRequest<string>>> CancelOrder(ISender sender, Guid orderId)
    {
        await sender.Send(new CancelOrderCommand(orderId));
        return TypedResults.NoContent();
    }

    public async Task<Results<Accepted, NotFound, ForbidHttpResult>> CreateReturnRequest(
        Guid orderId, [FromBody] ReturnRequestPayloadDto payload, ISender sender)
    {
        var command = new CreateReturnRequestCommand(orderId, payload.OrderItemIds, payload.Reason, payload.CustomerComments);
        await sender.Send(command);
        return TypedResults.Accepted(string.Empty);
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Products.cs ---
// --- VERVANG VOLLEDIG BESTAND: src/Web/Endpoints/Products.cs ---
/**
 * @file Products.cs
 * @Version 3.1.0 (Cleaned - Admin endpoints moved to AdminProducts.cs)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description Minimal API endpoints for Products, now containing only public webshop endpoints.
 *              Admin-specific endpoints have been moved to AdminProducts.cs.
 * @PromptSummary Cleaned Products.cs by moving admin endpoints to AdminProducts.cs.
 */
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Products.Common;
using RoyalCode.Application.Products.Queries; // Voor ProductLookupDto
using RoyalCode.Application.Products.Queries.GetAllAttributeValues;
using RoyalCode.Application.Products.Queries.GetAvailableFilters;
using RoyalCode.Application.Products.Queries.GetFeaturedProducts;
using RoyalCode.Application.Products.Queries.GetProductById;
using RoyalCode.Application.Products.Queries.GetProductCategoryTree;
using RoyalCode.Application.Products.Queries.GetProductRecommendations;
using RoyalCode.Application.Products.Queries.GetProductsWithPagination;
using RoyalCode.Application.Products.Queries.GetProductVariantById;
using RoyalCode.Web.Infrastructure;

namespace RoyalCode.Web.Endpoints;

public class Products : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Products") // Expliciete URL-prefix
            .WithTags("Products") // Consistent tag
            .AllowAnonymous(); // Standaard zijn alle endpoints hier publiek

        // === GET Endpoints (Publiek) ===

        group.MapGet("/attributes", GetAllAttributes)
             .WithOpenApi(op => new(op) { Summary = "Get all globally available product attribute values." });

        group.MapGet("/featured", GetFeaturedProducts)
             .WithOpenApi(op => new(op) { Summary = "Get a list of featured products." });

        group.MapGet("/", GetProducts)
             .WithOpenApi(op => new(op) { Summary = "Get a paginated list of products with various filtering options." });

        group.MapGet("/{id:guid}", GetProductById)
             .WithOpenApi(op => new(op) { Summary = "Get detailed information for a single *active and published* product by ID." });

        group.MapGet("/recommendations", GetRecommendations)
             .WithOpenApi(op => new(op) { Summary = "Get product recommendations based on user history or popular items." });

        group.MapGet("/variants/{variantId:guid}", GetProductVariantById)
             .WithTags("Products (Diagnostics)") // Tag behouden voor interne/diagnostische weergave
             .WithOpenApi(op => new(op) { Summary = "Get details for a specific product variant by ID (Diagnostic/Internal Use)." });

        group.MapGet("/filters", GetAvailableFilters)
             .WithOpenApi(op => new(op) { Summary = "Get available, dynamic filters for faceted product search." });

        group.MapGet("/lookup", GetProductLookup) // Dit blijft publiek voor autocomplete op de webshop
            .WithOpenApi(op => new(op) { Summary = "Get a list of products for lookup/typeahead functionality (e.g., adding to an order from frontend)." });

        group.MapGet("/categories", GetProductCategoryTree)
            .WithOpenApi(op => new(op) { Summary = "Get the hierarchical tree of product categories." });
    }

    #region GET Implementations
    public async Task<Ok<Dictionary<string, List<AttributeValueSelectionDto>>>> GetAllAttributes(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetAllAttributeValuesQuery()));
    }

    public async Task<Ok<PaginatedList<ProductListItemDto>>> GetProducts(
        ISender sender, [AsParameters] GetProductsWithPaginationQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Ok<PaginatedList<ProductListItemDto>>> GetFeaturedProducts(ISender sender, [AsParameters] GetFeaturedProductsQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Ok<PaginatedList<ProductListItemDto>>> GetRecommendations(ISender sender, [AsParameters] GetProductRecommendationsQuery query)
    {
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Results<Ok<ProductDetailDto>, NotFound>> GetProductById(ISender sender, Guid id, [FromQuery] string? selectedAttributes)
    {
        Dictionary<string, string>? parsedSelected = null;
        if (!string.IsNullOrEmpty(selectedAttributes))
        {
            parsedSelected = selectedAttributes.Split(',').Select(part => part.Split(':', 2)).Where(parts => parts.Length == 2).ToDictionary(parts => parts[0].Trim(), parts => parts[1].Trim(), StringComparer.OrdinalIgnoreCase);
        }
        var query = new GetProductByIdQuery(id, parsedSelected);
        var result = await sender.Send(query);
        return result != null ? TypedResults.Ok(result) : TypedResults.NotFound();
    }

    public async Task<Results<Ok<VariantDto>, NotFound>> GetProductVariantById(ISender sender, Guid variantId)
    {
        var result = await sender.Send(new GetProductVariantByIdQuery(variantId));
        return result != null ? TypedResults.Ok(result) : TypedResults.NotFound();
    }

    public async Task<Ok<List<FilterDefinitionDto>>> GetAvailableFilters(
        ISender sender, [AsParameters] GetAvailableFiltersQuery query)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<Ok<List<ProductLookupDto>>> GetProductLookup(ISender sender, [AsParameters] GetProductLookupQuery query)
    {
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<Ok<List<ProductCategoryNodeDto>>> GetProductCategoryTree(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetProductCategoryTreeQuery()));
    }
    #endregion
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Reviews.cs ---
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Reviews;
using RoyalCode.Application.Reviews.Commands.CreateReview;
using RoyalCode.Application.Reviews.Commands.DeleteReview;
using RoyalCode.Application.Reviews.Commands.UpdateReview;
using RoyalCode.Application.Reviews.Queries.GetReviewById;
using RoyalCode.Application.Reviews.Queries.GetReviewsForProduct;

namespace RoyalCode.Web.Endpoints;

public record UpdateReviewPayload(decimal Rating, string ReviewText, string? Title, List<Guid>? MediaIds);

public class Reviews : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Reviews") // Expliciete URL-prefix
            .WithTags("Reviews"); // Consistent tag

        // === GET Endpoints ===
        group.MapGet("/{id:guid}", GetReviewById)
             .AllowAnonymous()
             .WithOpenApi(op => new(op) { Summary = "Get detailed information for a single review by ID." });

        group.MapGet("/product/{productId:guid}", GetReviewsForProduct)
             .AllowAnonymous()
             .WithOpenApi(op => new(op) { Summary = "Get a paginated list of reviews for a specific product." });

        group.MapGet("/product/{productId:guid}/summary", GetReviewSummaryForProduct)
             .AllowAnonymous()
             .WithOpenApi(op => new(op) { Summary = "Get aggregated rating statistics and highlights for a product." });

        // === POST Endpoints ===
        group.MapPost("/", CreateReview)
             .RequireAuthorization()
             .WithOpenApi(op => new(op) { Summary = "Create a new product review for the authenticated user." });

        group.MapPost("/{reviewId:guid}/vote/{voteType}", VoteOnReview)
             .RequireAuthorization()
             .Produces<ReviewListItemDto>(StatusCodes.Status200OK)
             .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
             .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
             .Produces<ProblemDetails>(StatusCodes.Status409Conflict)
             .Produces(StatusCodes.Status401Unauthorized)
             .WithOpenApi(op => new(op) { Summary = "Cast a 'Like' or 'Dislike' vote on a review." });

        // === PUT Endpoints ===
        group.MapPut("/{id:guid}", UpdateReview)
             .RequireAuthorization()
             .Produces<ReviewListItemDto>(StatusCodes.Status200OK)
             .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
             .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
             .Produces(StatusCodes.Status401Unauthorized)
             .WithOpenApi(op => new(op) { Summary = "Update an existing review by ID (only by the author)." });

        // === DELETE Endpoints ===
        group.MapDelete("/{id:guid}", DeleteReview)
             .RequireAuthorization()
             .WithOpenApi(op => new(op) { Summary = "Delete a review by ID (only by the author or admin)." });
    }

    // === GET Implementations ===
    public async Task<Results<Ok<ReviewListItemDto>, NotFound>> GetReviewById(Guid id, ISender sender)
    {
        var result = await sender.Send(new GetReviewByIdQuery(id));
        return result is not null
            ? TypedResults.Ok(result)
            : TypedResults.NotFound();
    }

    public async Task<Results<Ok<ProductReviewsDto>, NotFound>> GetReviewsForProduct(
        Guid productId, ISender sender, ILogger<Reviews> logger, IUser currentUser,
        [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10,
        [FromQuery] ReviewSortBy sortBy = ReviewSortBy.Newest, [FromQuery] int? filterByRating = null,
        [FromQuery] bool verifiedPurchasesOnly = false)
    {
        logger.LogInformation("Fetching reviews for product {ProductId}", productId);
        var query = new GetReviewsForProductQuery
        {
            ProductId = productId,
            CurrentUserId = currentUser.Id,
            PageNumber = pageNumber,
            PageSize = pageSize,
            SortBy = sortBy,
            FilterByRating = filterByRating,
            VerifiedPurchasesOnly = verifiedPurchasesOnly
        };
        var result = await sender.Send(query);
        return TypedResults.Ok(result);
    }

    public async Task<Results<Ok<ReviewRatingStatistics>, NotFound>> GetReviewSummaryForProduct(
        Guid productId, ISender sender, ILogger<Reviews> logger)
    {
        logger.LogInformation("Fetching review summary for product {ProductId}", productId);
        var query = new GetReviewsForProductQuery { ProductId = productId };
        var result = await sender.Send(query);
        return TypedResults.Ok(result.RatingStatistics);
    }

    // === POST Implementations ===
    public async Task<Results<Created<ReviewListItemDto>, ForbidHttpResult>> CreateReview(
        CreateReviewCommand command, ISender sender, ILogger<Reviews> logger)
    {
        logger.LogInformation("Attempting to create review for target {TargetEntityId}", command.TargetEntityId);
        var result = await sender.Send(command);
        logger.LogInformation("Review {ReviewId} created successfully.", result.Id);
        return TypedResults.Created($"/api/reviews/{result.Id}", result);
    }

    public async Task<Results<Ok<ReviewListItemDto>, NotFound, Conflict, ForbidHttpResult, BadRequest<string>>> VoteOnReview(
        Guid reviewId, string voteType, ISender sender)
    {
        if (!Enum.TryParse<Application.Reviews.Commands.VoteOnReview.VoteType>(voteType, true, out var parsedVoteType))
        {
            return TypedResults.BadRequest("Invalid vote type. Must be 'Like' or 'Dislike'.");
        }
        var command = new Application.Reviews.Commands.VoteOnReview.VoteOnReviewCommand { ReviewId = reviewId, VoteType = parsedVoteType };
        var result = await sender.Send(command);
        return TypedResults.Ok(result);
    }

    // === PUT Implementations ===
    public async Task<Results<Ok<ReviewListItemDto>, NotFound, BadRequest, ForbidHttpResult>> UpdateReview(
        Guid id, [FromBody] UpdateReviewPayload payload, ISender sender)
    {
        var command = new UpdateReviewCommand { Id = id, Rating = payload.Rating, ReviewText = payload.ReviewText, Title = payload.Title, MediaIds = payload.MediaIds };
        var result = await sender.Send(command);
        return TypedResults.Ok(result);
    }

    // === DELETE Implementations ===
    public async Task<Results<NoContent, NotFound, ForbidHttpResult>> DeleteReview(Guid id, ISender sender)
    {
        await sender.Send(new DeleteReviewCommand(id));
        return TypedResults.NoContent();
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Search.cs ---
/**
 * @file Search.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description API endpoints for search functionality, including live suggestions.
 */
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Search.Common;
using RoyalCode.Application.Search.Queries;

namespace RoyalCode.Web.Endpoints;

public class Search : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Search")
            .WithTags("Search")
            .AllowAnonymous(); // Autocomplete suggesties zijn vaak publiek

        group.MapGet("/suggest", GetSearchSuggestions)
             .WithOpenApi(op => new(op) { Summary = "Get live search suggestions for autocomplete functionality." });
    }

    public async Task<Ok<SearchSuggestionListDto>> GetSearchSuggestions(ISender sender, [FromQuery] string q)
    {
        return TypedResults.Ok(await sender.Send(new GetSearchSuggestionsQuery(q)));
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Skills.cs ---
using Microsoft.AspNetCore.Http.HttpResults;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace RoyalCode.Web.Endpoints;

// --- DTO and Enum Definitions (Hardcoded in this file) ---
public record SkillDefinitionDto
{
    public required string Id { get; init; }
    public required string NameKeyOrText { get; init; }
    public required string DescriptionKeyOrText { get; init; }
    public AppIcon Icon { get; init; }
    public SkillCategory Category { get; init; }
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum SkillCategory
{
    [EnumMember(Value = "attack")] Attack,
    [EnumMember(Value = "defense")] Defense,
    [EnumMember(Value = "utility")] Utility,
    [EnumMember(Value = "crafting")] Crafting
}

public class Skills : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Skills") // Expliciete URL-prefix
            .WithTags("Skills (Hardcoded)") // Consistent tag
            .AllowAnonymous();

        // === GET Endpoints ===
        group.MapGet("/definitions", GetSkillDefinitions)
             .WithOpenApi(op => new(op) { Summary = "Get hardcoded definitions for character skills (Mock)." });
    }

    // === GET Implementations ===
    public Ok<List<SkillDefinitionDto>> GetSkillDefinitions()
    {
        var definitions = new List<SkillDefinitionDto>
        {
            new() {
                Id = "power_strike_1",
                NameKeyOrText = "Krachtige Slag",
                DescriptionKeyOrText = "Een geconcentreerde aanval die 150% wapenschade toebrengt.",
                Icon = AppIcon.Sword,
                Category = SkillCategory.Attack
            },
            new() {
                Id = "defensive_stance_1",
                NameKeyOrText = "Defensieve Houding",
                DescriptionKeyOrText = "Verhoogt je pantser met 20% voor 10 seconden.",
                Icon = AppIcon.Shield,
                Category = SkillCategory.Defense
            },
            new() {
                Id = "agile_dodge_1",
                NameKeyOrText = "Behendige Ontwijking",
                DescriptionKeyOrText = "Geeft een 25% kans om een inkomende aanval volledig te ontwijken.",
                Icon = AppIcon.Wind,
                Category = SkillCategory.Defense
            },
            new() {
                Id = "master_crafter_1",
                NameKeyOrText = "Meester Ambachtsman",
                DescriptionKeyOrText = "Verhoogt de kans op het maken van een item van superieure kwaliteit met 10%.",
                Icon = AppIcon.Hammer,
                Category = SkillCategory.Crafting
            },
            new() {
                Id = "divine_blessing_1",
                NameKeyOrText = "Goddelijke Zegening",
                DescriptionKeyOrText = "Een passieve vaardigheid die al je statistieken permanent met 2% verhoogt.",
                Icon = AppIcon.Sparkles,
                Category = SkillCategory.Utility
            }
        };
        return TypedResults.Ok(definitions);
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/SocialFeed.cs ---
/**
 * @file SocialFeed.cs
 * @Version 3.2.0 (FINAL - Correct Authorization Scopes)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description API endpoints for the Social Feed feature, now with correct authorization scopes per endpoint.
 */
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
// Aliases voor exceptions om dubbelzinnigheid te voorkomen
using ForbiddenAccessException = RoyalCode.Application.Common.Exceptions.ForbiddenAccessException;
using NotFoundException = RoyalCode.Application.Common.Exceptions.NotFoundException;
using ValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;

using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Social.Commands;
using RoyalCode.Application.Social.Common;
using RoyalCode.Application.Social.Queries;
using RoyalCode.Domain.Enums.Social;

namespace RoyalCode.Web.Endpoints;

#region Request Payload DTOs
public record AddFeedItemRequest(string? Text, IReadOnlyList<Guid>? MediaIds, string? GifUrl, PrivacyLevel Privacy = PrivacyLevel.Public);
public record EditFeedItemRequest(string? Text, IReadOnlyList<Guid>? MediaIds, string? GifUrl, PrivacyLevel Privacy);
public record ReactRequest(string? ReactionType);
public record AddFeedReplyRequest(string? Text, Guid? ReplyToReplyId, IReadOnlyList<Guid>? MediaIds, string? GifUrl);
public record EditFeedReplyRequest(string? Text);
#endregion

public class SocialFeed : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/social-feed")
            .WithTags("Social Feed");
        // --- DE FIX: RequireAuthorization() is HIER VERWIJDERD ---
        // We passen het nu per endpoint toe.

        // === GET Endpoints (Public) ===
        group.MapGet("/{feedId}", GetFeed)
             .AllowAnonymous() // <-- DE FIX: Maak dit endpoint publiek
             .WithOpenApi(op => new(op) { Summary = "Gets a paginated list of items for a specific feed." });

        group.MapGet("/{feedId}/items/{parentItemId:guid}/replies", GetReplies)
             .AllowAnonymous() // <-- DE FIX: Maak dit endpoint publiek
             .WithOpenApi(op => new(op) { Summary = "Gets a paginated list of replies for a specific feed item." });

        // === POST, PUT, DELETE Endpoints (Protected) ===
        group.MapPost("/{feedId}/items", AddFeedItem)
             .RequireAuthorization() // <-- DE FIX: Beveilig dit endpoint
             .WithOpenApi(op => new(op) { Summary = "Adds a new item to a specific feed." });

        group.MapPut("/{feedId}/items/{itemId:guid}", EditFeedItem)
             .RequireAuthorization() // <-- DE FIX: Beveilig dit endpoint
             .WithOpenApi(op => new(op) { Summary = "Updates an existing feed item." });

        group.MapDelete("/{feedId}/items/{itemId:guid}", DeleteFeedItem)
             .RequireAuthorization() // <-- DE FIX: Beveiligd
             .WithOpenApi(op => new(op) { Summary = "Deletes a feed item." });

        group.MapPost("/{feedId}/items/{itemId:guid}/reaction", ReactToFeedItem)
             .RequireAuthorization() // <-- DE FIX: Beveiligd
             .WithOpenApi(op => new(op) { Summary = "Adds, updates, or removes a reaction for a specific feed item." });

        group.MapPost("/{feedId}/items/{parentItemId:guid}/replies", AddFeedReply)
             .RequireAuthorization() // <-- DE FIX: Beveiligd
             .WithOpenApi(op => new(op) { Summary = "Adds a reply to a feed item." });

        group.MapPut("/{feedId}/replies/{replyId:guid}", EditFeedReply)
             .RequireAuthorization() // <-- DE FIX: Beveiligd
             .WithOpenApi(op => new(op) { Summary = "Updates an existing reply." });

        group.MapDelete("/{feedId}/replies/{replyId:guid}", DeleteFeedReply)
             .RequireAuthorization() // <-- DE FIX: Beveiligd
             .WithOpenApi(op => new(op) { Summary = "Deletes a reply." });

        group.MapPost("/{feedId}/replies/{replyId:guid}/reaction", ReactToFeedReply)
             .RequireAuthorization() // <-- DE FIX: Beveiligd
             .WithOpenApi(op => new(op) { Summary = "Adds, updates, or removes a reaction for a specific reply." });
    }

    #region Feed Item Implementations
    public async Task<Ok<PaginatedList<FeedItemDto>>> GetFeed(ISender sender, string feedId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
    {
        var query = new GetFeedQuery { FeedId = feedId, PageNumber = pageNumber, PageSize = pageSize };
        return TypedResults.Ok(await sender.Send(query));
    }

    public async Task<Results<Created<FeedItemDto>, ValidationProblem, ForbidHttpResult>> AddFeedItem(ISender sender, string feedId, [FromBody] AddFeedItemRequest request)
    {
        try
        {
            var command = new AddFeedItemCommand { FeedId = feedId, Text = request.Text, MediaIds = request.MediaIds, GifUrl = request.GifUrl, Privacy = request.Privacy };
            var result = await sender.Send(command);
            return TypedResults.Created($"/api/social-feed/{feedId}/items/{result.Id}", result);
        }
        catch (ValidationException ex) { return TypedResults.ValidationProblem(ex.Errors); }
        catch (ForbiddenAccessException) { return TypedResults.Forbid(); }
    }

    public async Task<Results<Ok<FeedItemDto>, NotFound, ForbidHttpResult, ValidationProblem>> EditFeedItem(ISender sender, string feedId, Guid itemId, [FromBody] EditFeedItemRequest request)
    {
        try
        {
            var command = new EditFeedItemCommand { FeedItemId = itemId, Text = request.Text, MediaIds = request.MediaIds, GifUrl = request.GifUrl, Privacy = request.Privacy };
            return TypedResults.Ok(await sender.Send(command));
        }
        catch (NotFoundException) { return TypedResults.NotFound(); }
        catch (ForbiddenAccessException) { return TypedResults.Forbid(); }
        catch (ValidationException ex) { return TypedResults.ValidationProblem(ex.Errors); }
    }

    public async Task<Results<NoContent, NotFound, ForbidHttpResult>> DeleteFeedItem(ISender sender, string feedId, Guid itemId)
    {
        try
        {
            await sender.Send(new DeleteFeedItemCommand(itemId));
            return TypedResults.NoContent();
        }
        catch (NotFoundException) { return TypedResults.NotFound(); }
        catch (ForbiddenAccessException) { return TypedResults.Forbid(); }
    }

    public async Task<Results<Ok<FeedItemDto>, NotFound, BadRequest<string>, ForbidHttpResult>> ReactToFeedItem(ISender sender, string feedId, Guid itemId, [FromBody] ReactRequest payload)
    {
        try
        {
            ReactionType? reactionType = null;
            if (!string.IsNullOrEmpty(payload.ReactionType) && !Enum.TryParse<ReactionType>(payload.ReactionType, true, out var parsedType))
                return TypedResults.BadRequest("Invalid reaction type.");
            if (!string.IsNullOrEmpty(payload.ReactionType)) reactionType = Enum.Parse<ReactionType>(payload.ReactionType, true);

            return TypedResults.Ok(await sender.Send(new ReactToFeedItemCommand { FeedItemId = itemId, ReactionType = reactionType }));
        }
        catch (NotFoundException) { return TypedResults.NotFound(); }
        catch (ForbiddenAccessException) { return TypedResults.Forbid(); }
    }
    #endregion

    #region Feed Reply Implementations
    public async Task<Results<Ok<PaginatedList<FeedReplyDto>>, NotFound, ForbidHttpResult>> GetReplies(ISender sender, string feedId, Guid parentItemId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = new GetRepliesQuery { ParentItemId = parentItemId, PageNumber = pageNumber, PageSize = pageSize };
            return TypedResults.Ok(await sender.Send(query));
        }
        catch (NotFoundException) { return TypedResults.NotFound(); }
        catch (ForbiddenAccessException) { return TypedResults.Forbid(); }
    }

    public async Task<Results<Created<FeedReplyDto>, NotFound, ForbidHttpResult, ValidationProblem>> AddFeedReply(ISender sender, string feedId, Guid parentItemId, [FromBody] AddFeedReplyRequest request)
    {
        try
        {
            var command = new AddFeedReplyCommand { ParentItemId = parentItemId, FeedId = feedId, Text = request.Text, ReplyToReplyId = request.ReplyToReplyId, MediaIds = request.MediaIds, GifUrl = request.GifUrl };
            var result = await sender.Send(command);
            return TypedResults.Created($"/api/social-feed/{feedId}/replies/{result.Id}", result);
        }
        catch (NotFoundException) { return TypedResults.NotFound(); }
        catch (ForbiddenAccessException) { return TypedResults.Forbid(); }
        catch (ValidationException ex) { return TypedResults.ValidationProblem(ex.Errors); }
    }

    public async Task<Results<Ok<FeedReplyDto>, NotFound, ForbidHttpResult, ValidationProblem>> EditFeedReply(ISender sender, string feedId, Guid replyId, [FromBody] EditFeedReplyRequest payload)
    {
        try
        {
            var command = new EditFeedReplyCommand { ReplyId = replyId, Text = payload.Text };
            return TypedResults.Ok(await sender.Send(command));
        }
        catch (NotFoundException) { return TypedResults.NotFound(); }
        catch (ForbiddenAccessException) { return TypedResults.Forbid(); }
        catch (ValidationException ex) { return TypedResults.ValidationProblem(ex.Errors); }
    }

    public async Task<Results<NoContent, NotFound, ForbidHttpResult>> DeleteFeedReply(ISender sender, string feedId, Guid replyId)
    {
        try
        {
            await sender.Send(new DeleteFeedReplyCommand(replyId));
            return TypedResults.NoContent();
        }
        catch (NotFoundException) { return TypedResults.NotFound(); }
        catch (ForbiddenAccessException) { return TypedResults.Forbid(); }
    }

    public async Task<Results<Ok<FeedReplyDto>, NotFound, BadRequest<string>, ForbidHttpResult>> ReactToFeedReply(ISender sender, string feedId, Guid replyId, [FromBody] ReactRequest payload)
    {
        try
        {
            ReactionType? reactionType = null;
            if (!string.IsNullOrEmpty(payload.ReactionType) && !Enum.TryParse<ReactionType>(payload.ReactionType, true, out var parsedType))
                return TypedResults.BadRequest("Invalid reaction type.");
            if (!string.IsNullOrEmpty(payload.ReactionType)) reactionType = Enum.Parse<ReactionType>(payload.ReactionType, true);

            return TypedResults.Ok(await sender.Send(new ReactToFeedReplyCommand { ReplyId = replyId, ReactionType = reactionType }));
        }
        catch (NotFoundException) { return TypedResults.NotFound(); }
        catch (ForbiddenAccessException) { return TypedResults.Forbid(); }
    }
    #endregion
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Stats.cs ---
using Microsoft.AspNetCore.Http.HttpResults;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace RoyalCode.Web.Endpoints;

// --- DTO and Enum Definitions (Hardcoded in this file) ---
public record StatDefinitionDto
{
    public required string Id { get; init; }
    public required string NameKeyOrText { get; init; }
    public required string DescriptionKeyOrText { get; init; }
    public int MaxValue { get; init; }
    public int UiSegments { get; init; }
    public AppIcon Icon { get; init; }
}

public class Stats : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Stats") // Expliciete URL-prefix
            .WithTags("Stats (Hardcoded)") // Consistent tag
            .AllowAnonymous();

        // === GET Endpoints ===
        group.MapGet("/definitions", GetStatDefinitions)
             .WithOpenApi(op => new(op) { Summary = "Get hardcoded definitions for character stats (Mock)." });
    }

    // === GET Implementations ===
    public Ok<List<StatDefinitionDto>> GetStatDefinitions()
    {
        var definitions = new List<StatDefinitionDto>
        {
            new() {
                Id = "strength",
                NameKeyOrText = "Kracht",
                DescriptionKeyOrText = "Bepaalt de fysieke schade die je aanricht.",
                Icon = AppIcon.Sword
                , MaxValue = 20, UiSegments = 10
            },
            new() {
                Id = "constitution",
                NameKeyOrText = "Constitutie",
                DescriptionKeyOrText = "Verhoogt je maximale levenspunten en weerstand.",
                Icon = AppIcon.Shield
                , MaxValue = 20, UiSegments = 10
            },
            new() {
                Id = "dexterity",
                NameKeyOrText = "Behendigheid",
                DescriptionKeyOrText = "Verhoogt je aanvalssnelheid en kans om te ontwijken.",
                Icon = AppIcon.Wind
                , MaxValue = 20, UiSegments = 10
            },
            new() {
                Id = "intelligence",
                NameKeyOrText = "Intelligentie",
                DescriptionKeyOrText = "Verhoogt je magische schade en mana.",
                Icon = AppIcon.Sparkles
                , MaxValue = 20, UiSegments = 10
            },
            new() {
                Id = "luck",
                NameKeyOrText = "Geluk",
                DescriptionKeyOrText = "Verhoogt de kans op kritieke treffers en zeldzame buit.",
                Icon = AppIcon.Sparkles
                , MaxValue = 20, UiSegments = 10
            },
             new() {
                Id = "arcane",
                NameKeyOrText = "Arcane",
                DescriptionKeyOrText = "Verhoogt je mystieke kracht en spreukefficiëntie.",
                Icon = AppIcon.Hexagon, MaxValue = 20, UiSegments = 10
            }
        };
        return TypedResults.Ok(definitions);
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/User.cs ---
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace RoyalCode.Web.Endpoints;

#region DTOs and Enums
public record LifeskillDto
{
    public required string Id { get; init; }
    public required string NameKeyOrText { get; init; }
    public AppIcon Icon { get; init; }
    public int CurrentLevel { get; init; }
    public string? CurrentLevelName { get; init; }
    public int CurrentExperience { get; init; }
    public int ExperienceForNextLevel { get; init; }
}

public record CharacterStatsDto
{
    public required string UserId { get; init; }
    public int Strength { get; set; }
    public int Constitution { get; set; }
    public int Dexterity { get; set; }
    public int Intelligence { get; set; }
    public int Luck { get; set; }
}

public record UserSkillDto
{
    public required string SkillId { get; init; }
    public int Level { get; init; }
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AppIcon
{
    [EnumMember(Value = "pickaxe")] Pickaxe,
    [EnumMember(Value = "leaf")] Leaf,
    [EnumMember(Value = "hammer")] Hammer,
    [EnumMember(Value = "flask-conical")] FlaskConical,
    [EnumMember(Value = "sprout")] Sprout,
    [EnumMember(Value = "wrench")] Wrench,
    [EnumMember(Value = "sword")] Sword,
    [EnumMember(Value = "swords")] Swords,
    [EnumMember(Value = "shield")] Shield,
    [EnumMember(Value = "shield-check")] ShieldCheck,
    [EnumMember(Value = "wind")] Wind,
    [EnumMember(Value = "sparkles")] Sparkles,
    [EnumMember(Value = "hexagon")] Hexagon,

}
#endregion

public class User : EndpointGroupBase
{
    // In-memory data to simulate a database for this hardcoded controller
    private static CharacterStatsDto _currentUserStats = new()
    {
        UserId = "00000000-0000-0000-0000-000000000001", // Example User ID
        Strength = 15,
        Constitution = 18,
        Dexterity = 12,
        Intelligence = 10,
        Luck = 7
    };

    private static readonly List<UserSkillDto> _currentUserSkills = new()
    {
        new() { SkillId = "power_strike_1", Level = 3 },
        new() { SkillId = "defensive_stance_1", Level = 2 }
    };

    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/User") // Expliciete URL-prefix
            .WithTags("User Gameplay Data (Hardcoded)") // Consistent tag
            .RequireAuthorization();

        // === GET Endpoints ===
        group.MapGet("/lifeskills", GetUserLifeskills)
             .WithOpenApi(op => new(op) { Summary = "Get hardcoded lifeskills data for the authenticated user (Mock)." });

        group.MapGet("/Stats", GetCharacterStats)
             .WithOpenApi(op => new(op) { Summary = "Get hardcoded character stats for the authenticated user (Mock)." });

        group.MapGet("/Skills", GetUserSkills)
             .WithOpenApi(op => new(op) { Summary = "Get hardcoded user skills for the authenticated user (Mock)." });

        // === POST Endpoints ===
        group.MapPost("/Skills", AddUserSkill)
             .WithOpenApi(op => new(op) { Summary = "Add a hardcoded skill to the authenticated user's profile (Mock)." });

        group.MapPost("/Skills/{id}/upgrade", UpgradeSkill)
             .WithOpenApi(op => new(op) { Summary = "Upgrade a hardcoded skill level for the authenticated user (Mock)." });

        // === PUT Endpoints ===
        group.MapPut("/Stats", UpdateCharacterStats)
             .WithOpenApi(op => new(op) { Summary = "Update hardcoded character stats for the authenticated user (Mock)." });

        // === DELETE Endpoints ===
        group.MapDelete("/Skills/{id}", DeleteUserSkill)
             .WithOpenApi(op => new(op) { Summary = "Delete a hardcoded skill from the authenticated user's profile (Mock)." });
    }

    // === GET Implementations ===
    #region Lifeskills
    public Ok<List<LifeskillDto>> GetUserLifeskills()
    {
        var lifeskills = new List<LifeskillDto>
        {
            new() { Id = "mining", NameKeyOrText = "Mijnbouw", Icon = AppIcon.Pickaxe, CurrentLevel = 12, CurrentLevelName = "Ervaren Mijnwerker", CurrentExperience = 450, ExperienceForNextLevel = 1200 },
            new() { Id = "herbalism", NameKeyOrText = "Kruidenkunde", Icon = AppIcon.Leaf, CurrentLevel = 7, CurrentLevelName = "Plantenkenner", CurrentExperience = 150, ExperienceForNextLevel = 700 },
            new() { Id = "blacksmithing", NameKeyOrText = "Smeden", Icon = AppIcon.Hammer, CurrentLevel = 21, CurrentLevelName = "Meestersmid", CurrentExperience = 8900, ExperienceForNextLevel = 11000 },
            new() { Id = "alchemy", NameKeyOrText = "Alchemie", Icon = AppIcon.FlaskConical, CurrentLevel = 5, CurrentLevelName = "Apotheker", CurrentExperience = 80, ExperienceForNextLevel = 500 }
        };
        return TypedResults.Ok(lifeskills);
    }
    #endregion

    #region Stats
    public Ok<CharacterStatsDto> GetCharacterStats() => TypedResults.Ok(_currentUserStats);
    #endregion

    #region Skills
    public Ok<List<UserSkillDto>> GetUserSkills() => TypedResults.Ok(_currentUserSkills);
    #endregion

    // === POST Implementations ===
    #region Skills
    public Ok<UserSkillDto> AddUserSkill([FromBody] UserSkillDto skillToAdd)
    {
        if (!_currentUserSkills.Any(s => s.SkillId == skillToAdd.SkillId))
        {
            _currentUserSkills.Add(skillToAdd);
        }
        return TypedResults.Ok(skillToAdd);
    }

    public Ok<UserSkillDto> UpgradeSkill(string id)
    {
        var skillToUpgrade = _currentUserSkills.FirstOrDefault(s => s.SkillId == id);
        if (skillToUpgrade != null)
        {
            var newSkill = skillToUpgrade with { Level = skillToUpgrade.Level + 1 };
            _currentUserSkills.Remove(skillToUpgrade);
            _currentUserSkills.Add(newSkill);
            return TypedResults.Ok(newSkill);
        }
        return TypedResults.Ok(new UserSkillDto { SkillId = id, Level = 1 });
    }
    #endregion

    // === PUT Implementations ===
    #region Stats
    public Ok<CharacterStatsDto> UpdateCharacterStats([FromBody] CharacterStatsDto updatedStats)
    {
        _currentUserStats = _currentUserStats with
        {
            Strength = updatedStats.Strength,
            Constitution = updatedStats.Constitution,
            Dexterity = updatedStats.Dexterity,
            Intelligence = updatedStats.Intelligence,
            Luck = updatedStats.Luck
        };
        return TypedResults.Ok(_currentUserStats);
    }
    #endregion

    // === DELETE Implementations ===
    #region Skills
    public NoContent DeleteUserSkill(string id)
    {
        _currentUserSkills.RemoveAll(s => s.SkillId == id);
        return TypedResults.NoContent();
    }
    #endregion
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Users.cs ---
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Commands.Addresses;
using RoyalCode.Application.Users.Commands.Profile;
using RoyalCode.Application.Users.Commands.UpdateSettings;
using RoyalCode.Application.Users.Common;
using RoyalCode.Application.Users.Queries;
using RoyalCode.Infrastructure.Identity;

namespace RoyalCode.Web.Endpoints;

public class Users : EndpointGroupBase
{
    // De ProfileDto blijft hier, omdat het een representatie is van een User resource.
    public record ProfileDto
    {
        public Guid Id { get; set; }
        public string? DisplayName { get; set; }
        public string? Email { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Bio { get; set; }
    }

    public record UpdateProfilePayload(string? DisplayName, string? Bio, Guid? AvatarMediaId);

    public override void Map(WebApplication app)
    {



        var group = app.MapGroup("/api/Users")
            .WithTags("Users")
            .RequireAuthorization();

        // === GET Endpoints ===
        group.MapGet("/", (HttpContext context) =>
        {
            return TypedResults.Redirect("/api/Users/profile");
        }).ExcludeFromDescription();


        group.MapGet("/addresses", GetAddresses)
             .WithOpenApi(op => new(op) { Summary = "Get all addresses for the authenticated user." });

        group.MapGet("/settings", GetSettings)
             .WithOpenApi(op => new(op) { Summary = "Get the application settings for the authenticated user." });

        // === POST Endpoints ===
        group.MapPost("/addresses", CreateAddress)
             .WithOpenApi(op => new(op) { Summary = "Create a new address for the authenticated user." });

        // === PUT Endpoints ===
        group.MapPut("/addresses/{id:guid}", UpdateAddress)
             .WithOpenApi(op => new(op) { Summary = "Update an existing address for the authenticated user." });

        group.MapPut("/settings", UpdateSettings)
             .WithOpenApi(op => new(op) { Summary = "Update the application settings for the authenticated user." });

        // === DELETE Endpoints ===
        group.MapDelete("/addresses/{id:guid}", DeleteAddress)
             .WithOpenApi(op => new(op) { Summary = "Delete an address for the authenticated user." });
    }

    // === GET Implementations ===
    public async Task<Results<Ok<ProfileDto>, NotFound>> GetCurrentUserProfile(
        ClaimsPrincipal claims, UserManager<ApplicationUser> userManager, IApplicationDbContext dbContext)
    {
        var userId = claims.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return TypedResults.NotFound();

        string? avatarUrl = null;
        if (user.AvatarMediaId.HasValue)
        {
            var media = await dbContext.Media.FindAsync(user.AvatarMediaId.Value);
            avatarUrl = media?.GetDeliveryUrl();
        }

        return TypedResults.Ok(new ProfileDto { Id = user.Id, DisplayName = user.DisplayName, Email = user.Email, AvatarUrl = avatarUrl, Bio = user.Bio });
    }

    public async Task<IResult> GetAddresses(
        ISender sender, IUser currentUser, IIdentityService identityService, HttpContext httpContext)
    {
        var userId = currentUser.Id!.Value;
        var currentVersion = await identityService.GetUserDataVersionAsync(userId, UserDataAggregate.Addresses);
        var etag = $"\"{currentVersion}\"";

        if (httpContext.Request.Headers.IfNoneMatch.Contains(etag))
        {
            return Results.StatusCode(StatusCodes.Status304NotModified);
        }

        var addresses = await sender.Send(new GetAddressesQuery());
        httpContext.Response.Headers.ETag = etag;
        return Results.Ok(addresses);
    }

    public async Task<Ok<ApplicationSettingsDto>> GetSettings(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetUserSettingsQuery()));
    }

    // === POST Implementations ===
    public async Task<Results<Created<AddressDto>, BadRequest<IDictionary<string, string[]>>>> CreateAddress(
        [FromBody] CreateAddressCommand command, ISender sender)
    {
        var result = await sender.Send(command);
        return TypedResults.Created($"/api/users/me/addresses/{result.Id}", result);
    }

    public async Task<Results<NoContent, NotFound, ForbidHttpResult, BadRequest<IDictionary<string, string[]>>>> UpdateAddress(
        Guid id, [FromBody] UpdateAddressCommand command, ISender sender)
    {
        if (id != command.Id)
        {
            IDictionary<string, string[]> errors = new Dictionary<string, string[]> { { "id", new[] { "ID from route must match ID in body." } } };
            return TypedResults.BadRequest(errors);
        }
        await sender.Send(command);
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, BadRequest<IDictionary<string, string[]>>>> UpdateSettings(
        [FromBody] ApplicationSettingsDto settingsDto, ISender sender)
    {
        await sender.Send(new UpdateUserSettingsCommand(settingsDto));
        return TypedResults.NoContent();
    }

    // === DELETE Implementations ===
    public async Task<Results<NoContent, NotFound, ForbidHttpResult>> DeleteAddress(Guid id, ISender sender)
    {
        await sender.Send(new DeleteAddressCommand(id));
        return TypedResults.NoContent();
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Endpoints/Wishlist.cs ---
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Users.Commands;
using RoyalCode.Application.Users.Common;
using RoyalCode.Application.Users.Queries;

namespace RoyalCode.Web.Endpoints;

public record AddWishlistItemPayload(Guid ProductId, Guid? VariantId);

public class Wishlist : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/api/Wishlist")
            .WithTags("Wishlist")
            .RequireAuthorization();

        group.MapGet("/", GetWishlist)
             .WithOpenApi(op => new(op) { Summary = "Get all items from the authenticated user's wishlist." });

        group.MapPost("/items", AddItemToWishlist)
             .WithOpenApi(op => new(op) { Summary = "Add an item to the user's wishlist." });

        group.MapDelete("/items/{wishlistItemId:guid}", RemoveItemFromWishlist)
             .WithOpenApi(op => new(op) { Summary = "Remove an item from the user's wishlist." });
    }

    public async Task<Ok<List<WishlistItemDto>>> GetWishlist(ISender sender)
    {
        return TypedResults.Ok(await sender.Send(new GetWishlistQuery()));
    }

    public async Task<Results<NoContent, NotFound>> AddItemToWishlist(
        [FromBody] AddWishlistItemPayload payload, ISender sender)
    {
        await sender.Send(new AddWishlistItemCommand(payload.ProductId, payload.VariantId));
        return TypedResults.NoContent();
    }

    public async Task<Results<NoContent, NotFound>> RemoveItemFromWishlist(
        Guid wishlistItemId, ISender sender)
    {
        await sender.Send(new RemoveWishlistItemCommand(wishlistItemId));
        return TypedResults.NoContent();
    }
}
--- END OF FILE ---

--- START OF FILE src/Web/Web.csproj ---
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <RootNamespace>RoyalCode.Web</RootNamespace>
    <AssemblyName>RoyalCode.Web</AssemblyName>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\Application\Application.csproj" />
    <ProjectReference Include="..\Infrastructure\Infrastructure.csproj" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Azure.Extensions.AspNetCore.Configuration.Secrets" />
    <PackageReference Include="Azure.Identity" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" />
    <PackageReference Include="Microsoft.AspNetCore.Diagnostics.EntityFrameworkCore" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" />
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" />
    <PackageReference Include="Microsoft.AspNetCore.SpaServices.Extensions" />
    <PackageReference Include="Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="NSwag.AspNetCore" />
    <PackageReference Include="NSwag.MSBuild">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="FluentValidation.AspNetCore" />
  </ItemGroup>


  <!-- Auto-generated Open API specification and Angular TypeScript clients -->
  <PropertyGroup>
    <RunPostBuildEvent>OnBuildSuccess</RunPostBuildEvent>
  </PropertyGroup>
  <!-- -->
  <Target Name="NSwag" AfterTargets="PostBuildEvent" Condition=" '$(Configuration)' == 'Debug' And '$(SkipNSwag)' != 'True' ">
    <Exec ConsoleToMSBuild="true" ContinueOnError="true" WorkingDirectory="$(ProjectDir)" EnvironmentVariables="ASPNETCORE_ENVIRONMENT=Development" Command="$(NSwagExe_Net90) run config.nswag /variables:Configuration=$(Configuration)">
      <Output TaskParameter="ExitCode" PropertyName="NSwagExitCode" />
      <Output TaskParameter="ConsoleOutput" PropertyName="NSwagOutput" />
    </Exec>

    <Message Text="$(NSwagOutput)" Condition="'$(NSwagExitCode)' == '0'" Importance="low" />
    <Error Text="$(NSwagOutput)" Condition="'$(NSwagExitCode)' != '0'" />
  </Target>
  

  
  
</Project>
--- END OF FILE ---

