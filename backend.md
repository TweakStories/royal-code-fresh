--- START OF FILE src/Application/Common/Behaviours/AuthorizationBehaviour.cs ---
using System.Reflection;
using RoyalCode.Application.Common.Exceptions;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Security;

namespace RoyalCode.Application.Common.Behaviours;
public class AuthorizationBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public AuthorizationBehaviour(
        IUser user,
        IIdentityService identityService)
    {
        _user = user;
        _identityService = identityService;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var authorizeAttributes = request.GetType().GetCustomAttributes<AuthorizeAttribute>();

        if (authorizeAttributes.Any())
        {
            // Must be authenticated user
            if (_user.Id == null)
            {
                throw new UnauthorizedAccessException();
            }

            // Use the .Value of the nullable Guid after the null-check.
            var userId = _user.Id.Value;

            // Role-based authorization
            var authorizeAttributesWithRoles = authorizeAttributes.Where(a => !string.IsNullOrWhiteSpace(a.Roles));
            if (authorizeAttributesWithRoles.Any())
            {
                var authorized = false;
                foreach (var roles in authorizeAttributesWithRoles.Select(a => a.Roles.Split(',')))
                {
                    foreach (var role in roles)
                    {
                        var isInRole = await _identityService.IsInRoleAsync(userId, role.Trim());
                        if (isInRole)
                        {
                            authorized = true;
                            break;
                        }
                    }
                }
                if (!authorized) throw new ForbiddenAccessException("User does not have the required role.");
            }

            // Policy-based authorization
            var authorizeAttributesWithPolicies = authorizeAttributes.Where(a => !string.IsNullOrWhiteSpace(a.Policy));
            if (authorizeAttributesWithPolicies.Any())
            {
                foreach (var policy in authorizeAttributesWithPolicies.Select(a => a.Policy))
                {
                    var authorized = await _identityService.AuthorizeAsync(userId, policy);
                    if (!authorized) throw new ForbiddenAccessException($"User does not meet the policy requirements: {policy}");
                }
            }
        }

        return await next();
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Behaviours/LoggingBehaviour.cs ---
using MediatR.Pipeline;
using Microsoft.Extensions.Logging;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Common.Behaviours;
public class LoggingBehaviour<TRequest> : IRequestPreProcessor<TRequest> where TRequest : notnull
{
    private readonly ILogger _logger;
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public LoggingBehaviour(ILogger<TRequest> logger, IUser user, IIdentityService identityService)
    {
        _logger = logger;
        _user = user;
        _identityService = identityService;
    }

    public async Task Process(TRequest request, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _user.Id; // userId is nu Guid?
        string? userName = string.Empty;

        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            userName = await _identityService.GetUserNameAsync(userId.Value);
        }

        _logger.LogInformation("RoyalCode Request: {Name} {@UserId} {@UserName} {@Request}",
            requestName, userId, userName, request);
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Behaviours/PerformanceBehaviour.cs ---
/**
 * @file PerformanceBehaviour.cs (Fixed)
 * @Version 2.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-23
 * @Description Fixed version with proper Guid handling for IUser.Id
 */
using System.Diagnostics;
using Microsoft.Extensions.Logging;
using RoyalCode.Application.Common.Interfaces;

namespace RoyalCode.Application.Common.Behaviours;

public class PerformanceBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    private readonly Stopwatch _timer;
    private readonly ILogger<TRequest> _logger;
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public PerformanceBehaviour(
        ILogger<TRequest> logger,
        IUser user,
        IIdentityService identityService)
    {
        _timer = new Stopwatch();

        _logger = logger;
        _user = user;
        _identityService = identityService;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        _timer.Start();

        var response = await next();

        _timer.Stop();

        var elapsedMilliseconds = _timer.ElapsedMilliseconds;

        if (elapsedMilliseconds > 500)
        {
            var requestName = typeof(TRequest).Name;
            var userId = _user.Id;
            string? userName = string.Empty;

            if (userId.HasValue && userId.Value != Guid.Empty)
            {
                userName = await _identityService.GetUserNameAsync(userId.Value);
            }

            _logger.LogWarning("RoyalCode Long Running Request: {Name} ({ElapsedMilliseconds} milliseconds) {@UserId} {@UserName} {@Request}",
                requestName, elapsedMilliseconds, userId, userName, request);
        }

        return response;
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Behaviours/UnhandledExceptionBehaviour.cs ---
using Microsoft.Extensions.Logging;

namespace RoyalCode.Application.Common.Behaviours;
public class UnhandledExceptionBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    private readonly ILogger<TRequest> _logger;

    public UnhandledExceptionBehaviour(ILogger<TRequest> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        try
        {
            return await next();
        }
        catch (Exception ex)
        {
            var requestName = typeof(TRequest).Name;

            _logger.LogError(ex, "RoyalCode Request: Unhandled Exception for Request {Name} {@Request}", requestName, request);

            throw;
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Common/Behaviours/ValidationBehaviour.cs ---
using ValidationException = RoyalCode.Application.Common.Exceptions.ValidationException;

namespace RoyalCode.Application.Common.Behaviours;
public class ValidationBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
     where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehaviour(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (_validators.Any())
        {
            var context = new ValidationContext<TRequest>(request);

            var validationResults = await Task.WhenAll(
                _validators.Select(v =>
                    v.ValidateAsync(context, cancellationToken)));

            var failures = validationResults
                .Where(r => r.Errors.Any())
                .SelectMany(r => r.Errors)
                .ToList();

            if (failures.Any())
                throw new ValidationException(failures);
        }
        return await next();
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
    public IDictionary<string, string[]> Errors { get; }
    public IReadOnlyCollection<ValidationFailure> Failures { get; } // NEW: Store raw failures

    public ValidationException()
        : base("One or more validation failures have occurred.")
    {
        Errors = new Dictionary<string, string[]>();
        Failures = new List<ValidationFailure>();
    }

    public ValidationException(IEnumerable<ValidationFailure> failures)
        : this()
    {
        Failures = failures.ToList(); // Store the raw failures

        Errors = failures
            .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
            .ToDictionary(failureGroup => failureGroup.Key, failureGroup => failureGroup.ToArray());
    }
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
/**
 * @file IApplicationDbContext.cs
 * @Version 5.1.0 (FINAL - No Infrastructure Dependency)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Updated application database context interface, now fully compliant with Clean Architecture (no Infrastructure dependency).
 */
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Infrastructure;
using RoyalCode.Domain.Entities;
using RoyalCode.Domain.Entities.Cart;
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Entities.Order;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Entities.Social; // <-- Zorg dat deze using er is
using RoyalCode.Domain.Entities.ToDo;
using RoyalCode.Domain.Entities.User;
// RoyalCode.Infrastructure.Identity; // <-- VERWIJDER DEZE USING!

namespace RoyalCode.Application.Common.Interfaces;

/// <summary>
/// Defines the contract for the application database context.
/// Exposes aggregate roots, concrete types for querying, and child entities for seeding.
/// </summary>
public interface IApplicationDbContext
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


    // --- USER-RELATED ENTITIES (GEEN APPLICATIONUSER HIER!) ---
    DbSet<Domain.Entities.User.Address> Addresses { get; }
    // DbSet<ApplicationUser> Users { get; } // <-- DEZE REGEL IS VERWIJDERD!

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
 * @Version 4.2.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description The definitive interface for all identity operations, now with
 *              requestingUserId parameters for enhanced security checks.
 */
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Social.Common;
using RoyalCode.Application.Users.Admin.Common;

namespace RoyalCode.Application.Common.Interfaces;

public interface IIdentityService
{
    // === GROUP: CORE USER OPERATIONS ===
    Task<string?> GetUserNameAsync(Guid userId);
    Task<string?> GetUserFullNameAsync(Guid userId);
    Task<string?> GetUserEmailAsync(Guid userId);
    Task<(Result Result, Guid UserId)> CreateUserAsync(string userName, string password);
    Task<Result> DeleteUserAsync(Guid userId, Guid requestingUserId);
    Task<bool> DoesUserExistAsync(Guid userId);

    // === GROUP: USER SETTINGS & DATA VERSIONING ===
    Task<string?> GetUserSettingsJsonAsync(Guid userId);
    Task<Result> UpdateUserSettingsJsonAsync(Guid userId, string json);
    Task IncrementUserDataVersionAsync(Guid userId, UserDataAggregate aggregate);
    Task<long> GetUserDataVersionAsync(Guid userId, UserDataAggregate aggregate);

    // --- SUB GROUP: User Profile Management ---
    Task<Result> UpdateProfileAsync(Guid userId, string? displayName, string? bio, Guid? avatarMediaId);
    Task<Dictionary<Guid, ProfileDto>> GetProfilesByIdsAsync(IEnumerable<Guid> userIds);

    // === GROUP: AUTHORIZATION & ROLES ===
    Task<bool> IsInRoleAsync(Guid userId, string role);
    Task<bool> AuthorizeAsync(Guid userId, string policyName);
    Task<List<string>> GetAllRolesAsync();
    Task<Result> DeleteRoleAsync(Guid roleId);
    Task<bool> IsRoleAssignedToUsersAsync(string roleName); // <-- FIX: Hier was de methode gedefinieerd

    // === GROUP: PERMISSION MANAGEMENT ===
    Task<List<PermissionDto>> GetAllPermissionsAsync();
    Task<List<PermissionDto>> GetPermissionsForRoleAsync(Guid roleId);
    Task<Result> UpdatePermissionsForRoleAsync(Guid roleId, IEnumerable<string> permissionValues);

    // === GROUP: ADMIN USER MANAGEMENT ===
    // --- SUB GROUP: User CRUD (Admin) ---
    Task<(Result Result, Guid UserId)> CreateUserAsync(string email, string? displayName, string password, string? firstName, string? middleName, string? lastName, string? bio, IReadOnlyCollection<string> roles);
    Task<Result> UpdateUserAsync(Guid userId, string? displayName, string? firstName, string? lastName, string? bio, IReadOnlyCollection<string> roles, Guid requestingUserId);
    Task<PaginatedList<AdminUserListItemDto>> GetUsersAsync(int pageNumber, int pageSize, string? searchTerm, string? role);
    Task<AdminUserDetailDto?> GetUserByIdAsync(Guid userId);

    // --- SUB GROUP: User Account Status & Password Management (Admin) ---
    Task<Result> LockUserAsync(Guid userId, DateTimeOffset? lockoutEnd, Guid requestingUserId);
    Task<Result> UnlockUserAsync(Guid userId, Guid requestingUserId);
    Task<Result> SetUserPasswordAsync(Guid userId, string newPassword, Guid requestingUserId);
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

--- START OF FILE src/Application/Products/Commands/CreateProduct/CreateProduct.cs ---
/**
 * @file CreateProduct.cs
 * @Version 6.6.0 (Flexible DTOs)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-02
 * @Description Implements the use case for creating a product with flexible DTOs that
 *              accept null values for optional fields and collections, preventing deserialization errors.
 */
using System.Text.Json;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;
using FluentValidation;

namespace RoyalCode.Application.Products.Commands.CreateProduct;

#region Data Transfer Objects (DTOs) for the Command Payload

public record CreateSeoDto(string Title, string Description, List<string>? Keywords, Guid? ImageUrl);

public record CreateVariantOverrideDto
{
    public required List<string> TempAttributeValueIds { get; init; }
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
    bool IsAvailable,
    List<Guid>? MediaIds);

public record CreateVariantAttributeDto(
    string TempId,
    string NameKeyOrText,
    string Type,
    string DisplayType,
    bool IsRequired,
    List<CreateAttributeValueDto> Values);

// --- DE FIX: Prijzen zijn nu nullable ---
public record CreatePricingDto(decimal? Price, decimal? OriginalPrice);

public record CreatePhysicalProductConfigDto(
    CreatePricingDto Pricing,
    string? Sku,
    string? Brand,
    bool ManageStock,
    // --- DE FIX: Voorraad is nu nullable ---
    int? StockQuantity,
    bool AllowBackorders,
    int? LowStockThreshold,
    ProductAvailabilityRules? AvailabilityRules,
    AgeRestrictions? AgeRestrictions,
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
        ProcessVariantOverrides(request, product, tempIdToGuidMap);

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
                physicalProduct.SetAvailabilityRules(config.AvailabilityRules);
                if (config.AgeRestrictions != null)
                    physicalProduct.SetAgeRestrictions(config.AgeRestrictions.MinAge, config.AgeRestrictions.MaxAge);
                config.DisplaySpecifications?.ForEach(spec => physicalProduct.AddDisplaySpecification(spec));

                product = physicalProduct;
                break;
            default:
                throw new NotImplementedException($"Product type '{request.Type}' is not yet supported.");
        }

        if (Enum.TryParse<ProductStatus>(request.Status, true, out var status) && status == ProductStatus.Published)
            product.Publish();

        // --- DE FIXES ---
        product.SetFeaturedStatus(request.IsFeatured); // Bug 2: IsFeatured werd niet ingesteld
        product.SetShortDescription(request.ShortDescription);

        (request.Tags ?? new()).ForEach(tag => product.AddTag(tag));
        (request.CategoryIds ?? new()).ForEach(catId => product.AddCategory(catId));

        if (request.FeaturedImageId.HasValue)
            product.AddMedia(request.FeaturedImageId.Value);

        if (request.CustomAttributes != null && request.CustomAttributes.Any())
        {
            product.SetCustomAttributes(JsonSerializer.Serialize(request.CustomAttributes));
        }

        return product;
    }

    private async Task<Dictionary<string, Guid>> ProcessVariantAttributes(CreateProductCommand request, ProductBase product, CancellationToken ct)
    {
        var tempIdToGuidMap = new Dictionary<string, Guid>();
        var allAssignments = new List<ProductAttributeAssignment>();

        foreach (var attrDto in request.VariantAttributes)
        {
            if (!Enum.TryParse<VariantAttributeType>(attrDto.Type, true, out var attrType))
                throw new ValidationException($"Invalid attribute type '{attrDto.Type}'.");

            foreach (var valDto in attrDto.Values)
            {
                var existingValue = await _context.AttributeValues.FirstOrDefaultAsync(
                    av => av.AttributeType == attrType && av.Value == valDto.Value, ct);

                Guid valueId;
                if (existingValue == null)
                {
                    var newValue = new AttributeValue(valDto.Value, valDto.DisplayNameKeyOrText, attrType);
                    newValue.SetMetadata(valDto.ColorHex, null, valDto.PriceModifier, PriceModifierType.Fixed);
                    _context.AttributeValues.Add(newValue);
                    valueId = newValue.Id;
                }
                else { valueId = existingValue.Id; }

                tempIdToGuidMap[valDto.TempId] = valueId;
                allAssignments.Add(new ProductAttributeAssignment(product.Id, valueId, 0));

                // --- DE FIX ---
                // Bug 1: Zorg ervoor dat media-ID's van varianten worden toegevoegd aan de hoofdlijst van het product
                (valDto.MediaIds ?? new()).ForEach(mediaId => product.AddMedia(mediaId));
            }
        }
        product.AddAttributeAssignments(allAssignments);
        return tempIdToGuidMap;
    }

    private void ProcessVariantOverrides(CreateProductCommand request, ProductBase product, Dictionary<string, Guid> tempIdToGuidMap)
    {
        product.RegenerateVariantCombinations();

        foreach (var overrideDto in request.VariantOverrides)
        {
            var realAttributeValueIds = overrideDto.TempAttributeValueIds
                .Select(tempId => tempIdToGuidMap[tempId])
                .ToHashSet();

            var variantToOverride = product.VariantCombinations
                .FirstOrDefault(vc => vc.AttributeValueIds.ToHashSet().SetEquals(realAttributeValueIds));

            if (variantToOverride != null)
            {
                if (overrideDto.Price.HasValue || overrideDto.OriginalPrice.HasValue)
                {
                    variantToOverride.SetPrices(overrideDto.Price, overrideDto.OriginalPrice);
                }
                if (overrideDto.StockQuantity.HasValue)
                {
                    variantToOverride.SetStock(overrideDto.StockQuantity.Value);
                }
                if (overrideDto.IsDefault.HasValue)
                {
                    variantToOverride.SetAsDefault(overrideDto.IsDefault.Value);
                }
                if (overrideDto.IsActive.HasValue)
                {
                    variantToOverride.SetActive(overrideDto.IsActive.Value);
                }
                if (overrideDto.MediaIds != null)
                {
                    foreach (var mediaId in overrideDto.MediaIds)
                    {
                        variantToOverride.AddMedia(mediaId);
                    }
                }

            }
        }

        if (product.VariantCombinations.Any() && !product.VariantCombinations.Any(vc => vc.IsDefault))
        {
            product.VariantCombinations.First().SetAsDefault(true);
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
 * @Version 9.0.0 (Consolidated Command, Validator, Handler)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-02
 * @Description The definitive use case for updating a product, now with the command,
 *              its validator, and its handler consolidated into a single file for better
 *              cohesion and maintainability.
 */
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Products.Commands.CreateProduct; // Hergebruik DTOs van Create
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;
using FluentValidation; // Nodig voor AbstractValidator

namespace RoyalCode.Application.Products.Commands.UpdateProduct;

public record UpdateProductCommand : IRequest
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
    public Guid? FeaturedImageId { get; init; }
    public CreateSeoDto? Seo { get; init; }
    public List<CreateVariantAttributeDto> VariantAttributes { get; init; } = new();
    public List<CreateVariantOverrideDto> VariantOverrides { get; init; } = new();
    public CreatePhysicalProductConfigDto? PhysicalProductConfig { get; init; }
    public Dictionary<string, object>? CustomAttributes { get; init; }
}

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

        // --- DE FIX: Gebruik de gedeelde validator ---
        RuleForEach(v => v.VariantAttributes).SetValidator(new RoyalCode.Application.Products.Common.CreateVariantAttributeDtoValidator());
    }
}

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateProductCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        _context.ChangeTracker.AutoDetectChangesEnabled = false;

        try
        {
            var product = await _context.Products
                .Include(p => p.AttributeAssignments).ThenInclude(pa => pa.AttributeValue)
                .Include(p => p.VariantCombinations)
                .Include(p => (p as PhysicalProduct)!.DisplaySpecifications)
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            Guard.Against.NotFound(request.Id, product);
            var physicalProduct = product as PhysicalProduct ?? throw new InvalidOperationException("Only physical products can be updated via this handler.");

            UpdateBaseProductDetails(physicalProduct, request);
            var tempIdToGuidMap = await SyncVariantAttributes(physicalProduct, request.VariantAttributes, cancellationToken);
            SyncVariantOverrides(physicalProduct, request.VariantOverrides, tempIdToGuidMap);

            _context.ChangeTracker.DetectChanges();
            await _context.SaveChangesAsync(cancellationToken);
        }
        finally
        {
            _context.ChangeTracker.AutoDetectChangesEnabled = true;
        }
    }

    private void UpdateBaseProductDetails(PhysicalProduct product, UpdateProductCommand request)
    {
        product.UpdateBasicInfo(request.Name, request.Description);
        product.SetShortDescription(request.ShortDescription);

        // --- DE FIX ---
        product.SetFeaturedStatus(request.IsFeatured); // Bug 2: IsFeatured werd niet ingesteld

        if (Enum.TryParse<ProductStatus>(request.Status, true, out var status))
        {
            if (status == ProductStatus.Published && product.Status != ProductStatus.Published) product.Publish();
            else if (status == ProductStatus.Archived && product.Status != ProductStatus.Archived) product.Archive();
        }

        // --- DE FIX: Logica voor collecties ---
        // Wis eerst de collecties, en voeg dan de nieuwe waarden toe.
        product.ClearTags();
        (request.Tags ?? new()).ForEach(tag => product.AddTag(tag));

        product.ClearCategoryIds();
        (request.CategoryIds ?? new()).ForEach(catId => product.AddCategory(catId));

        product.ClearMediaIds();
        if (request.FeaturedImageId.HasValue) product.AddMedia(request.FeaturedImageId.Value);

        if (request.CustomAttributes != null)
            product.SetCustomAttributes(JsonSerializer.Serialize(request.CustomAttributes));

        var config = request.PhysicalProductConfig ?? throw new InvalidOperationException("PhysicalProductConfig is required for updates.");

        var price = config.Pricing.Price ?? 0m;
        var originalPrice = config.Pricing.OriginalPrice ?? price;
        product.UpdatePricing(price, originalPrice);

        product.SetInventoryDetails(config.Sku, config.Brand);
        product.SetStockRules(config.AllowBackorders, config.LowStockThreshold);
        product.SetAvailabilityRules(config.AvailabilityRules);
        if (config.AgeRestrictions != null) product.SetAgeRestrictions(config.AgeRestrictions.MinAge, config.AgeRestrictions.MaxAge);

        product.ClearDisplaySpecifications();
        config.DisplaySpecifications?.ForEach(product.AddDisplaySpecification);
    }

    private async Task<Dictionary<string, Guid>> SyncVariantAttributes(ProductBase product, List<CreateVariantAttributeDto> attributeDtos, CancellationToken ct)
    {
        var tempIdToGuidMap = new Dictionary<string, Guid>();
        var newAssignmentValueIds = new HashSet<Guid>();

        foreach (var attrDto in attributeDtos)
        {
            if (!Enum.TryParse<VariantAttributeType>(attrDto.Type, true, out var attrType)) continue;

            foreach (var valDto in attrDto.Values)
            {
                var existingValue = await _context.AttributeValues.FirstOrDefaultAsync(av => av.AttributeType == attrType && av.Value == valDto.Value, ct);
                Guid valueId;

                if (existingValue == null)
                {
                    var newValue = new AttributeValue(valDto.Value, valDto.DisplayNameKeyOrText, attrType);
                    newValue.SetMetadata(valDto.ColorHex, null, valDto.PriceModifier, PriceModifierType.Fixed);
                    _context.AttributeValues.Add(newValue);
                    valueId = newValue.Id;
                }
                else { valueId = existingValue.Id; }

                tempIdToGuidMap[valDto.TempId] = valueId;
                newAssignmentValueIds.Add(valueId);

                // --- DE FIX ---
                // Bug 1: Voeg media van varianten toe *nadat* de hoofdlijst is gewist in UpdateBaseProductDetails
                (valDto.MediaIds ?? new()).ForEach(mediaId => product.AddMedia(mediaId));
            }
        }

        var assignmentsToRemove = product.AttributeAssignments.Where(existing => !newAssignmentValueIds.Contains(existing.AttributeValueId)).ToList();
        if (assignmentsToRemove.Any()) _context.ProductAttributeAssignments.RemoveRange(assignmentsToRemove);

        var existingAssignmentValueIds = product.AttributeAssignments.Select(a => a.AttributeValueId).ToHashSet();
        var assignmentsToAdd = newAssignmentValueIds.Where(id => !existingAssignmentValueIds.Contains(id))
                                                    .Select(id => new ProductAttributeAssignment(product.Id, id, 0))
                                                    .ToList();
        if (assignmentsToAdd.Any()) product.AddAttributeAssignments(assignmentsToAdd);

        return tempIdToGuidMap;
    }

    private void SyncVariantOverrides(ProductBase product, List<CreateVariantOverrideDto> overrideDtos, Dictionary<string, Guid> tempIdToGuidMap)
    {
        product.RegenerateVariantCombinations();

        foreach (var overrideDto in overrideDtos)
        {
            var realAttributeValueIds = overrideDto.TempAttributeValueIds
                .Select(tempId => tempIdToGuidMap.ContainsKey(tempId) ? tempIdToGuidMap[tempId] : Guid.Parse(tempId))
                .ToHashSet();

            var variantToOverride = product.VariantCombinations
                .FirstOrDefault(vc => vc.AttributeValueIds.ToHashSet().SetEquals(realAttributeValueIds));

            if (variantToOverride != null)
            {
                if (overrideDto.Price.HasValue || overrideDto.OriginalPrice.HasValue)
                {
                    variantToOverride.SetPrices(overrideDto.Price, overrideDto.OriginalPrice);
                }
                if (overrideDto.StockQuantity.HasValue)
                {
                    variantToOverride.SetStock(overrideDto.StockQuantity.Value);
                }
                if (overrideDto.IsDefault.HasValue)
                {
                    variantToOverride.SetAsDefault(overrideDto.IsDefault.Value);
                }
                if (overrideDto.IsActive.HasValue)
                {
                    variantToOverride.SetActive(overrideDto.IsActive.Value);
                }

                // --- NIEUWE LOGICA VOOR MEDIA ---
                variantToOverride.ClearMedia();
                if (overrideDto.MediaIds != null)
                {
                    foreach (var mediaId in overrideDto.MediaIds)
                    {
                        variantToOverride.AddMedia(mediaId);
                    }
                }
                // --- EINDE NIEUWE LOGICA ---
            }
        }

        if (product.VariantCombinations.Any() && !product.VariantCombinations.Any(vc => vc.IsDefault))
        {
            product.VariantCombinations.First().SetAsDefault(true);
        }
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
 * @Version 13.0.0 (Strict Override Media Logic)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description Definitive, mapperless processor for product DTOs.
 *              Implements the "Strict Override" fallback logic for variant media resolution.
 */
using System.Linq;
using System.Text.Json;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Products.Common;
using RoyalCode.Application.Products.Queries.GetProductById;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Application.Products.Common;

public static class ProductDtoProcessor
{
    public static async Task<List<ProductListItemDto>> ProcessProductsToListItemDtosAsync(
        List<ProductBase> products, IApplicationDbContext context)
    {
        if (!products.Any())
        {
            return new List<ProductListItemDto>();
        }

        var allMediaIds = products.SelectMany(p => p.MediaIds).Distinct().ToList();

        var mediaInfo = await context.Media.AsNoTracking()
            .Where(m => allMediaIds.Contains(m.Id))
            .Select(m => new
            {
                m.Id,
                ThumbnailUrl = m.ThumbnailUrl ?? m.GetDeliveryUrl(),
                AltText = (m as ImageMedia)!.AltTextKeyOrText,
                Tags = m.Tags.Select(t => t.Name).ToList()
            })
            .ToListAsync();

        var mediaTeaserLookup = mediaInfo.ToDictionary(
            m => m.Id,
            m => new MediaTeaserDto { Id = m.Id, ThumbnailUrl = m.ThumbnailUrl, AltText = m.AltText }
        );

        var mediaTagsLookup = mediaInfo.ToDictionary(m => m.Id, m => m.Tags);

        var resultDtos = new List<ProductListItemDto>();
        foreach (var product in products)
        {
            var physicalProduct = product as PhysicalProduct;
            decimal? price = physicalProduct?.Pricing.Price;
            decimal? originalPrice = physicalProduct?.Pricing.OriginalPrice;
            bool hasDiscount = originalPrice.HasValue && price.HasValue && price < originalPrice.Value;

            var dto = new ProductListItemDto
            {
                Id = product.Id,
                Name = product.Name,
                ShortDescription = product.ShortDescription,
                Tags = product.Tags,
                Type = (int)product.Type,
                Status = (int)product.Status,
                IsActive = product.IsActive,
                IsFeatured = product.IsFeatured,
                AverageRating = product.AverageRating,
                ReviewCount = product.ReviewCount,
                Price = price,
                OriginalPrice = originalPrice,
                Currency = product.Currency,
                StockStatus = (int?)physicalProduct?.StockStatus,
                InStock = physicalProduct?.StockStatus == StockStatus.InStock || physicalProduct?.StockStatus == StockStatus.LimitedStock,
                HasDiscount = hasDiscount,
                DiscountPercentage = hasDiscount && originalPrice.HasValue && originalPrice.Value > 0
                    ? Math.Round(((originalPrice.Value - price!.Value) / originalPrice.Value) * 100, 0)
                    : null,
                ColorVariants = ExtractColorVariants(product, mediaTeaserLookup, mediaTagsLookup)
            };
            resultDtos.Add(dto);
        }
        return resultDtos;
    }

    private static List<ColorVariantTeaserDto> ExtractColorVariants(
       ProductBase product,
       Dictionary<Guid, MediaTeaserDto> mediaTeaserLookup,
       Dictionary<Guid, List<string>> mediaTagsLookup)
    {
        var colorAssignments = product.AttributeAssignments
            .Where(paa => paa.AttributeValue?.AttributeType == VariantAttributeType.Color)
            .OrderBy(paa => paa.SortOrder)
            .ToList();

        if (!colorAssignments.Any())
        {
            return new List<ColorVariantTeaserDto>();
        }

        var basePrice = (product as PhysicalProduct)?.Pricing.Price ?? 0m;

        return colorAssignments.Select(paa =>
        {
            var attrValue = paa.AttributeValue;
            var defaultVariant = product.VariantCombinations.FirstOrDefault(vc => vc.AttributeValueIds.Contains(attrValue.Id));
            var price = defaultVariant?.Price ?? basePrice;
            var originalPrice = defaultVariant?.OriginalPrice;
            var tagToFind = $"color:{attrValue.Value.ToLowerInvariant()}";

            var mediaForThisColor = mediaTagsLookup
                .Where(kvp => product.MediaIds.Contains(kvp.Key) && kvp.Value.Contains(tagToFind, StringComparer.OrdinalIgnoreCase))
                .Select(kvp => mediaTeaserLookup.GetValueOrDefault(kvp.Key))
                .Where(teaser => teaser != null)
                .Select(teaser => teaser!)
                .ToList();

            return new ColorVariantTeaserDto(
                CreateDeterministicIntId(attrValue.Id),
                attrValue.Id,
                defaultVariant?.Id,
                attrValue.Value,
                attrValue.DisplayName,
                attrValue.ColorHex,
                price,
                originalPrice,
                mediaForThisColor);
        }).ToList();
    }

    public static ProductDetailDto ProcessToDetail(ProductBase product, IReadOnlyCollection<MediaBase> allMedia, Dictionary<string, string>? selectedAttributes)
    {
        var physicalProduct = product as PhysicalProduct ?? throw new InvalidOperationException("Processing is only supported for PhysicalProduct.");
        var allAssignments = physicalProduct.AttributeAssignments;
        var allVariants = physicalProduct.VariantCombinations;
        var activeVariant = GetActiveVariant(allVariants, allAssignments, selectedAttributes);

        // De media die wordt getoond, hangt af van de geselecteerde variant
        var mediaForDisplay = ResolveVariantMedia(product, activeVariant, allMedia);

        var attributesDto = MapAttributes(allAssignments, allVariants, activeVariant, allMedia); // Geef ALLE media mee
        var variantsDto = MapVariants(allVariants, allAssignments);

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
            FeaturedImage = ComputeFeaturedImage(mediaForDisplay),
            PriceRange = ComputePriceRange(allVariants),
            VariantAttributes = attributesDto,
            VariantCombinations = variantsDto,
            AvailabilityRules = MapAvailability(physicalProduct),
            SelectedVariant = MapSelectedVariant(activeVariant),
            DisplaySpecifications = MapDisplaySpecifications(physicalProduct.DisplaySpecifications),
            CustomAttributes = DeserializeCustomAttributes(physicalProduct.CustomAttributesJson),
            Seo = ComputeSeo(product, mediaForDisplay),
            HasDiscount = variantsDto.Any(v => v.HasDiscount),
            InStock = variantsDto.Any(v => v.StockQuantity > 0) || physicalProduct.AllowBackorders
        };
    }

    private static IReadOnlyCollection<MediaBase> ResolveVariantMedia(ProductBase product, ProductVariantCombination? activeVariant, IReadOnlyCollection<MediaBase> allAvailableMedia)
    {
        // Niveau 1: Check of de specifieke combinatie (bv. "Groen + XL") eigen media heeft.
        if (activeVariant != null && activeVariant.HasMedia)
        {
            return allAvailableMedia.Where(m => activeVariant.MediaIds.Contains(m.Id)).ToList();
        }

        // Niveau 2: Check of een visueel attribuut in de combinatie (bv. "Groen") eigen media heeft.
        var visualAttributeValue = product.AttributeAssignments
            .Where(paa => activeVariant?.AttributeValueIds.Contains(paa.AttributeValueId) == true && paa.AttributeValue.AttributeType == VariantAttributeType.Color)
            .Select(paa => paa.AttributeValue)
            .FirstOrDefault();

        if (visualAttributeValue != null)
        {
            var tagToFind = $"color:{visualAttributeValue.Value.ToLowerInvariant()}";
            var mediaForColor = allAvailableMedia
                .Where(m => m.Tags.Any(t => t.Name.Equals(tagToFind, StringComparison.OrdinalIgnoreCase)))
                .ToList();

            if (mediaForColor.Any())
            {
                return mediaForColor;
            }
        }

        // Niveau 3: Fallback naar de algemene media van het product.
        return allAvailableMedia.Where(m => product.MediaIds.Contains(m.Id)).ToList();
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

    private static List<AttributeDto> MapAttributes(IReadOnlyCollection<ProductAttributeAssignment> assignments, IReadOnlyCollection<ProductVariantCombination> allVariants, ProductVariantCombination? activeVariant, IReadOnlyCollection<MediaBase> allProductMedia)
    {
        var activeValueIds = activeVariant?.AttributeValueIds.ToHashSet() ?? new HashSet<Guid>();

        return assignments.GroupBy(a => a.AttributeValue.AttributeType)
            .Select(group => new AttributeDto(
                CreateDeterministicGuid(group.Key.ToString()),
                $"attribute.{group.Key.ToString().ToLower()}",
                (int)group.Key,
                GetDisplayType(group.Key),
                true,
                group.Select(paa =>
                {
                    var valDto = new AttributeValueDto
                    {
                        Id = paa.AttributeValueId,
                        Value = paa.AttributeValue.Value,
                        DisplayNameKeyOrText = paa.AttributeValue.DisplayName,
                        ColorHex = paa.AttributeValue.ColorHex,
                        PriceModifier = paa.AttributeValue.PriceModifier,
                        IsAvailable = true
                    };

                    var tempSelection = activeValueIds.Where(id => assignments.First(a => a.AttributeValueId == id).AttributeValue.AttributeType != group.Key).ToHashSet();
                    tempSelection.Add(paa.AttributeValueId);
                    var resultingVariant = allVariants.FirstOrDefault(v => v.AttributeValueIds.ToHashSet().SetEquals(tempSelection));
                    valDto.IsAvailable = resultingVariant != null;
                    valDto.ResultingVariantId = resultingVariant?.Id;

                    // --- DE DEFINITIEVE FIX ---
                    // Zoek de media die specifiek bij DEZE kleur hoort.
                    if (paa.AttributeValue.AttributeType == VariantAttributeType.Color)
                    {
                        var tagToFind = $"color:{paa.AttributeValue.Value.ToLowerInvariant()}";
                        var mediaForThisColor = allProductMedia
                            .Where(m => m.Tags.Any(t => t.Name.Equals(tagToFind, StringComparison.OrdinalIgnoreCase)))
                            .ToList();

                        valDto.Media = MapMedia(mediaForThisColor);
                    }

                    return valDto;
                }).ToList()
            )).ToList();
    }
    private static List<VariantDto> MapVariants(IReadOnlyCollection<ProductVariantCombination> variants, IReadOnlyCollection<ProductAttributeAssignment> allAssignments)
    {
        return variants.Select(v => new VariantDto(
            v.Id, v.Sku,
            v.AttributeValueIds.Select(valueId => new VariantAttributeDto(
                CreateDeterministicGuid(allAssignments.FirstOrDefault(a => a.AttributeValueId == valueId)?.AttributeValue.AttributeType.ToString() ?? ""),
                valueId
            )).ToList(),
            v.Price ?? 0, v.OriginalPrice, v.StockQuantity ?? 0,
            (int)(v.StockStatus ?? StockStatus.Undefined),
            (v.Price ?? 0) < (v.OriginalPrice ?? 0),
            v.IsDefault
        )).ToList();
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
    private static SelectedVariantDto? MapSelectedVariant(ProductVariantCombination? v)
    {
        if (v == null) return null;
        return new SelectedVariantDto(v.Id, v.Sku, v.Price ?? 0, v.OriginalPrice, v.StockQuantity ?? 0,
            (int)(v.StockStatus ?? StockStatus.Undefined),
            (v.Price ?? 0) < (v.OriginalPrice ?? 0)
        );
    }
    private static List<MediaDto> MapMedia(IReadOnlyCollection<MediaBase> media)
    {
        return media.Select(m => new MediaDto(
            m.Id,
            (int)m.Type,
            m.GetDeliveryUrl(),
            m.ThumbnailUrl,
            (m as ImageMedia)?.AltTextKeyOrText,
            m.Tags.Select(t => t.Name).ToList()
        )).ToList();
    }
    private static FeaturedImageDto? ComputeFeaturedImage(IReadOnlyCollection<MediaBase> media)
    {
        var featuredMedia = media.FirstOrDefault(m => m.Tags.Any(t => t.Name == "featured")) ?? media.FirstOrDefault();

        if (featuredMedia == null) return null;

        return new FeaturedImageDto(
            featuredMedia.Id,
            featuredMedia.GetDeliveryUrl(),
            (featuredMedia as ImageMedia)?.AltTextKeyOrText
        );
    }
    private static PriceRangeDto? ComputePriceRange(IReadOnlyCollection<ProductVariantCombination> variants)
    {
        if (!variants.Any()) return null;

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
        return new SeoDto(p.Name, p.ShortDescription, p.Tags, ComputeFeaturedImage(m)?.Url);
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
--- END OF FILE ---

--- START OF FILE src/Application/Products/Common/ProductListItemDto.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Application/Products/Common/ProductListItemDto.cs ---
/**
 * @file ProductListItemDto.cs
 * @Version 3.0.0 (Type-Safe Enums)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description DE ENIGE BRON VAN WAARHEID voor DTO's in productlijsten.
 *              Enum-properties zijn nu van het type 'int' om de JSON-output correct te representeren.
 */
namespace RoyalCode.Application.Products.Common;

public record ProductListItemDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? ShortDescription { get; init; }
    public IReadOnlyCollection<string> Tags { get; init; } = new List<string>();

    // FIX: Properties gewijzigd van 'string' naar 'int' en 'int?'
    public int Type { get; init; }
    public int Status { get; init; }

    public bool IsActive { get; init; }
    public bool IsFeatured { get; init; }
    public decimal? AverageRating { get; init; }
    public int ReviewCount { get; init; }

    public bool HasDiscount { get; set; }
    public decimal? DiscountPercentage { get; set; }
    public decimal? Price { get; init; }
    public decimal? OriginalPrice { get; init; }
    public string? Currency { get; init; }

    // FIX: Property gewijzigd van 'string' naar 'int?' (nullable int)
    public int? StockStatus { get; init; }

    public bool? InStock { get; init; }
    public List<ColorVariantTeaserDto> ColorVariants { get; set; } = new();
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

        // Pas filters toe, gebruik nu de .Value property van de wrapper types
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            baseQuery = baseQuery.Where(p => p.Name.Contains(request.SearchTerm) || (p.Brand != null && p.Brand.Contains(request.SearchTerm)));
        }
        if (request.CategoryIds != null && request.CategoryIds.Value.Any())
        {
            baseQuery = baseQuery.Where(p => p.CategoryIds.Any(c => request.CategoryIds.Value.Contains(c)));
        }
        if (request.Brands != null && request.Brands.Value.Any())
        {
            baseQuery = baseQuery.Where(p => p.Brand != null && request.Brands.Value.Contains(p.Brand));
        }
        if (request.PriceMin.HasValue) baseQuery = baseQuery.Where(p => p.Pricing.Price >= request.PriceMin.Value);
        if (request.PriceMax.HasValue) baseQuery = baseQuery.Where(p => p.Pricing.Price <= request.PriceMax.Value);
        if (request.MinRating.HasValue) baseQuery = baseQuery.Where(p => p.AverageRating >= request.MinRating.Value);
        if (request.OnSaleOnly == true) baseQuery = baseQuery.Where(p => p.Pricing.Price < p.Pricing.OriginalPrice);
        if (request.StockStatus.HasValue) baseQuery = baseQuery.Where(p => p.StockStatus == request.StockStatus.Value);

        // De rest van de handler logica...
        var productsInCurrentContext = await baseQuery
            .Select(p => new { p.Id, p.CategoryIds, p.Brand, p.CustomAttributesJson, p.Pricing.Price, p.Pricing.OriginalPrice, p.AverageRating, p.StockStatus })
            .ToListAsync(cancellationToken);

        if (!productsInCurrentContext.Any())
        {
            return new List<FilterDefinitionDto>();
        }

        // Categorie Filter Counts
        var categoryCounts = productsInCurrentContext
            .SelectMany(p => p.CategoryIds)
            .GroupBy(catId => catId)
            .ToDictionary(g => g.Key, g => g.Count());

        if (categoryCounts.Any())
        {
            var categoryIds = categoryCounts.Keys.ToList();
            var categoryNames = await _context.ProductCategories
                .Where(c => categoryIds.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken);

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

        // Merk Filter Counts
        var brandCounts = productsInCurrentContext
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
using RoyalCode.Domain.Entities.Product; // Nodig voor ProductCategory

namespace RoyalCode.Application.Products.Queries.GetProductCategoryTree;

public record ProductCategoryNodeDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
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
            .OrderBy(c => c.Name)
            .Select(c => new ProductCategoryNodeDto
            {
                Id = c.Id,
                Name = c.Name,
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
// --- VERVANG VOLLEDIG BESTAND src/Application/Products/Queries/GetFeaturedProducts/GetFeaturedProductsQuery.cs ---
/**
 * @file GetFeaturedProductsQuery.cs
 * @Version 8.0.0 (Optional Limit Parameter)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description Query en Handler die nu een optionele Limit parameter ondersteunt met een default van 8.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Common.Models;
using RoyalCode.Application.Products.Common;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Application.Products.Queries.GetFeaturedProducts;

/// <summary>
/// Query voor het ophalen van 'featured' producten.
/// </summary>
public record GetFeaturedProductsQuery : IRequest<PaginatedList<ProductListItemDto>>
{
    /// <summary>
    /// Het maximale aantal te retourneren producten. Indien niet opgegeven, is de standaardwaarde 8.
    /// </summary>
    public int? Limit { get; init; }
}

/// <summary>
/// Handler voor de GetFeaturedProductsQuery.
/// </summary>
public class GetFeaturedProductsQueryHandler : IRequestHandler<GetFeaturedProductsQuery, PaginatedList<ProductListItemDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFeaturedProductsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<ProductListItemDto>> Handle(GetFeaturedProductsQuery request, CancellationToken cancellationToken)
    {
        // Gebruik de null-coalescing operator '??' om de standaardwaarde van 8 toe te passen
        // als de 'Limit' property in de request null is (dus niet meegegeven in de URL).
        var limit = request.Limit ?? 8;

        var products = await _context.Products
            .AsNoTracking()
            .Where(p => p.IsFeatured && p.Status == ProductStatus.Published)
            .OrderBy(p => p.Name)
            .Take(limit) // Pas de (eventueel standaard) limiet toe
            .Include(p => p.AttributeAssignments).ThenInclude(paa => paa.AttributeValue)
            .Include(p => p.VariantCombinations)
            .ToListAsync(cancellationToken);

        var dtoItems = await ProductDtoProcessor.ProcessProductsToListItemDtosAsync(products, _context);

        // Maak de consistente, gepagineerde response aan.
        return new PaginatedList<ProductListItemDto>(
            dtoItems,
            dtoItems.Count,
            1, // Featured products is altijd pagina 1
            limit
        );
    }
}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetProductById/GetProductById.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Application/Products/Queries/GetProductById/GetProductById.cs ---
/**
 * @file GetProductById.cs
 * @Version 4.0.0 (Processor-Driven)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description Query en Handler die de centrale ProductDtoProcessor aanroept.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Products.Common;
using RoyalCode.Domain.Entities.Media;

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

        var media = await _context.Media
            .AsNoTracking()
            .Where(m => product.MediaIds.Contains(m.Id))
            .Include(m => m.Tags)
            .ToListAsync(cancellationToken);

        // Delegeer alle mappinglogica naar de centrale processor.
        // Dit is de enige plek waar de mapping plaatsvindt.
        return ProductDtoProcessor.ProcessToDetail(product, media, request.SelectedAttributes);
    }
}
// --- EINDE VERVANGING ---
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetProductById/ProductDetailDto.cs ---
/**
 * @file        ProductDetailDto.cs
 * @Version     11.0.0 (Variant Media Enriched)
 * @Author      Royal-Code MonorepoAppDevAI
 * @Date        2025-07-13
 * @Description Definitieve DTO waarin de media nu direct in de attribuut-waardes is genest
 *              om extra API-aanroepen door de frontend te elimineren.
 */

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
    public IReadOnlyCollection<string> Tags { get; init; } = new List<string>();
    public PriceRangeDto? PriceRange { get; init; }
    public FeaturedImageDto? FeaturedImage { get; init; }
    public IReadOnlyCollection<AttributeDto> VariantAttributes { get; init; } = new List<AttributeDto>();
    public IReadOnlyCollection<VariantDto> VariantCombinations { get; init; } = new List<VariantDto>();
    public AvailabilityDto? AvailabilityRules { get; init; }

    public SelectedVariantDto? SelectedVariant { get; init; }
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

    public IReadOnlyCollection<MediaDto> Media { get; set; } = new List<MediaDto>();
}

public record VariantDto(
    Guid Id,
    string Sku,
    IReadOnlyCollection<VariantAttributeDto> Attributes,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    int StockStatus,
    bool HasDiscount,
    bool IsDefault
);

public record VariantAttributeDto(Guid attributeId, Guid attributeValueId);

public record SelectedVariantDto(
    Guid Id,
    string Sku,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    int StockStatus,
    bool HasDiscount
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
        // --- DE FIX: Verwijder Task.WhenAll en voer de queries sequentieel uit ---
        // Dit voorkomt de "second operation started on this context" fout.

        var variantAttributes = await new GetAllAttributeValuesQueryHandler(_context)
            .Handle(new GetAllAttributeValuesQuery(), cancellationToken);

        var displaySpecs = await new GetDisplaySpecificationDefinitionsQueryHandler(_context)
            .Handle(new GetDisplaySpecificationDefinitionsQuery(), cancellationToken);

        var customAttrs = await new GetCustomAttributeDefinitionsQueryHandler(_context)
            .Handle(new GetCustomAttributeDefinitionsQuery(), cancellationToken);

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
            CustomAttributes = customAttrs
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
/**
 * @file GetProductsWithPagination.cs
 * @Version 26.0.0 (FINAL - IParsable Binders)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description The definitive, correct implementation for product filtering. This version
 *              uses custom IParsable<T> types for list binding, which is the
 *              officially supported way to handle complex query string parameters
 *              with [AsParameters] in Minimal APIs.
 */
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

// Custom types for list binding
public record GuidList(List<Guid> Value) : IParsable<GuidList>
{
    public static GuidList Parse(string s, IFormatProvider? provider)
    {
        var guids = s.Split(',')
            .Select(idStr => Guid.TryParse(idStr, out var id) ? id : Guid.Empty)
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
        return new StringList(s.Split(',').ToList());
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
    public GuidList? CategoryIds { get; init; } // <-- Gebruik het custom type
    public StringList? Brands { get; init; }    // <-- Gebruik het custom type
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
        var query = _context.Products.OfType<PhysicalProduct>().AsNoTracking()
            .Where(p => p.Status == ProductStatus.Published && p.IsActive);

        query = ApplyCoreFiltersWithoutCategories(query, request);
        query = ApplyValueFilters(query, request);

        // Handle category filtering separately with client evaluation
        if (request.CategoryIds != null && request.CategoryIds.Value.Any())
        {
            var categoryIdsToFilter = request.CategoryIds.Value.ToList();

            // Get all product IDs first, then filter in memory
            var allProductsWithCategories = await query
                .Select(p => new { p.Id, p.CategoryIds })
                .ToListAsync(cancellationToken);

            var matchingProductIds = allProductsWithCategories
                .Where(p => p.CategoryIds != null &&
                           p.CategoryIds.Any(categoryId => categoryIdsToFilter.Contains(categoryId)))
                .Select(p => p.Id)
                .ToList();

            if (!matchingProductIds.Any())
            {
                return new PaginatedList<ProductListItemDto>(new List<ProductListItemDto>(), 0, request.PageNumber, request.PageSize);
            }

            query = _context.Products.OfType<PhysicalProduct>().AsNoTracking()
                .Where(p => p.Status == ProductStatus.Published && p.IsActive && matchingProductIds.Contains(p.Id));

            // Reapply other filters
            query = ApplyCoreFiltersWithoutCategories(query, request);
            query = ApplyValueFilters(query, request);
        }

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

        query = ApplySorting(query, request);

        var totalCount = await query.CountAsync(cancellationToken);
        var products = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Include(p => p.AttributeAssignments).ThenInclude(paa => paa.AttributeValue)
            .Include(p => p.VariantCombinations)
            .ToListAsync(cancellationToken);

        var dtoItems = await ProductDtoProcessor.ProcessProductsToListItemDtosAsync(products.Cast<ProductBase>().ToList(), _context);
        return new PaginatedList<ProductListItemDto>(dtoItems, totalCount, request.PageNumber, request.PageSize);
    }

    private static IQueryable<PhysicalProduct> ApplyCoreFiltersWithoutCategories(IQueryable<PhysicalProduct> query, GetProductsWithPaginationQuery request)
    {
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(p => p.Name.Contains(request.SearchTerm) || (p.Brand != null && p.Brand.Contains(request.SearchTerm)));
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

        // De switch bepaalt de primaire sortering.
        switch (request.SortBy?.ToLower())
        {
            case "price":
                // --- DE DEFINITIEVE, WERKENDE FIX VOOR PRIJSSORTERING ---
                // Sorteer op de MAX prijs van de varianten bij DESC, en de MIN prijs bij ASC.
                // De fallback naar de basisprijs gebeurt nu BUITEN de Min/Max-aggregatie,
                // wat de SQL-vertalingsfout oplost.
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
                // Standaard sortering als er geen (geldige) sortBy is opgegeven.
                query = isDescending ? query.OrderByDescending(p => p.Created) : query.OrderBy(p => p.Name);
                break;
        }

        // Voeg een secundaire sortering toe op ID om een stabiele, voorspelbare volgorde te garanderen
        // bij gelijke waarden in de primaire sortering.
        return (query as IOrderedQueryable<PhysicalProduct>)?.ThenBy(p => p.Id) ?? query.OrderBy(p => p.Id);
    }


}
--- END OF FILE ---

--- START OF FILE src/Application/Products/Queries/GetProductVariantByIdQuery.cs ---
/**
 * @file GetProductVariantByIdQuery.cs
 * @Version 3.0.0 (Final & Corrected Type Conversion)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description Query en Handler voor het ophalen van een enkele productvariant.
 *              FIX: Lost CS1503 op door de AttributeId correct als Guid te genereren.
 */
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Application.Products.Queries.GetProductById; // Hier staat VariantDto
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

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

        return new VariantDto(
            variant.Id,
            variant.Sku,
            variant.AttributeValueIds.Select(valueId => {
                var attributeTypeString = product.AttributeAssignments.FirstOrDefault(a => a.AttributeValueId == valueId)?.AttributeValue.AttributeType.ToString() ?? "";
                return new VariantAttributeDto(CreateDeterministicGuid(attributeTypeString), valueId);
            }).ToList(),
            variant.Price ?? 0,
            variant.OriginalPrice,
            variant.StockQuantity ?? 0,
            // FIX: Cast de nullable enum naar een nullable int, en provide een default
            (int)(variant.StockStatus ?? StockStatus.Undefined),
            (variant.Price ?? 0) < (variant.OriginalPrice ?? 0),
            variant.IsDefault
        );
    }


    /// <summary>
    /// Private helper om een deterministische Guid te maken, identiek aan de DtoProcessor.
    /// </summary>
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

--- START OF FILE src/Domain/Common/BaseAuditableEntity.cs ---
/**
 * @file BaseAuditableEntity.cs - Verification
 * @Description This should be correct - audit fields remain strings for compatibility
 */
namespace RoyalCode.Domain.Common;

/// <summary>
/// A generic, auditable base entity that provides properties for tracking creation and modification history.
/// </summary>
/// <typeparam name="TKey">The type of the primary key.</typeparam>
public abstract class BaseAuditableEntity<TKey> : BaseEntity<TKey>, IAuditableEntity where TKey : notnull
{
    public DateTimeOffset Created { get; set; }

    /// <summary>
    /// The ID of the user who created the entity. 
    /// The IUser.Id (Guid?) gets converted to string in AuditableEntityInterceptor
    /// </summary>
    public string? CreatedBy { get; set; }

    public DateTimeOffset LastModified { get; set; }

    /// <summary>
    /// The ID of the user who last modified the entity.
    /// </summary>
    public string? LastModifiedBy { get; set; }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Common/BaseEntity.cs ---
/**
 * @file BaseEntity.cs
 * @Version 3.1.0 (With IHasDomainEvents Interface + SetIdForSeeding)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-28
 * @Description Generic base class for all domain entities with IHasDomainEvents interface,
 *              supporting any key type and providing clean domain event access.
 *              Added public SetIdForSeeding method for database seeding.
 */
using System.ComponentModel.DataAnnotations.Schema;

namespace RoyalCode.Domain.Common;

public abstract class BaseEntity<TKey> : IHasDomainEvents where TKey : notnull
{
    public TKey Id { get; internal set; } = default!;

    private readonly List<BaseEvent> _domainEvents = new();

    [NotMapped]
    public IReadOnlyCollection<BaseEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void AddDomainEvent(BaseEvent domainEvent) => _domainEvents.Add(domainEvent);
    public void RemoveDomainEvent(BaseEvent domainEvent) => _domainEvents.Remove(domainEvent);
    public void ClearDomainEvents() => _domainEvents.Clear();

    /// <summary>
    /// Public method for setting ID during database seeding.
    /// This allows us to create entities with predictable IDs for testing and seeding.
    /// </summary>
    /// <param name="id">The ID to set</param>
    public void SetIdForSeeding(TKey id)
    {
        Id = id;
    }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Common/BaseEvent.cs ---
using MediatR;

namespace RoyalCode.Domain.Common;
public abstract class BaseEvent : INotification
{
}
--- END OF FILE ---

--- START OF FILE src/Domain/Common/IAuditableEntity.cs ---
namespace RoyalCode.Domain.Common;

/// <summary>
/// Defines a contract for entities that have audit properties.
/// This allows the AuditableEntityInterceptor to work with any auditable entity,
/// regardless of its primary key type.
/// </summary>
public interface IAuditableEntity
{
    DateTimeOffset Created { get; set; }
    string? CreatedBy { get; set; }
    DateTimeOffset LastModified { get; set; }
    string? LastModifiedBy { get; set; }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Common/IHasDomainEvents.cs ---
/**
 * @file IHasDomainEvents.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-23
 * @Description Interface for entities that can have domain events.
 *              This provides a clean way to access domain events without reflection.
 */
namespace RoyalCode.Domain.Common;

/// <summary>
/// Interface for entities that can have domain events.
/// This provides a clean way to access domain events without reflection.
/// </summary>
public interface IHasDomainEvents
{
    IReadOnlyCollection<BaseEvent> DomainEvents { get; }
    void AddDomainEvent(BaseEvent domainEvent);
    void RemoveDomainEvent(BaseEvent domainEvent);
    void ClearDomainEvents();
}
--- END OF FILE ---

--- START OF FILE src/Domain/Common/ValueObject.cs ---
namespace RoyalCode.Domain.Common;

// Learn more: https://docs.microsoft.com/en-us/dotnet/standard/microservices-architecture/microservice-ddd-cqrs-patterns/implement-value-objects
public abstract class ValueObject
{
    protected static bool EqualOperator(ValueObject left, ValueObject right)
    {
        if (left is null ^ right is null)
        {
            return false;
        }

        return left?.Equals(right!) != false;
    }

    protected static bool NotEqualOperator(ValueObject left, ValueObject right)
    {
        return !(EqualOperator(left, right));
    }

    protected abstract IEnumerable<object> GetEqualityComponents();

    public override bool Equals(object? obj)
    {
        if (obj == null || obj.GetType() != GetType())
        {
            return false;
        }

        var other = (ValueObject)obj;
        return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }

    public override int GetHashCode()
    {
        var hash = new HashCode();

        foreach (var component in GetEqualityComponents())
        {
            hash.Add(component);
        }

        return hash.ToHashCode();
    }
}
--- END OF FILE ---

--- START OF FILE src/Domain/Constants/ErrorCodes.cs ---
/**
 * @file ErrorCodes.cs
 * @Version 1.1.0 (Complete)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description Centralized definitions for application-wide error codes, now including all required codes.
 */
namespace RoyalCode.Domain.Constants;

public static class ErrorCodes
{
    // Algemene fouten
    public const string NotFound = "common.errors.notFound";
    public const string Forbidden = "common.errors.forbidden";
    public const string Conflict = "common.errors.conflict";
    public const string BadRequest = "common.errors.badRequest";
    public const string InternalServerError = "common.errors.internalServerError";

    // Validatie Fouten
    public const string ValidationRequired = "common.forms.errors.required";
    public const string ValidationMinLength = "common.forms.errors.minLength";
    public const string ValidationMaxLength = "common.forms.errors.maxLength";
    public const string ValidationEmailInvalid = "common.forms.errors.invalidEmail";
    public const string ValidationPasswordMismatch = "common.forms.errors.passwordMismatch";
    public const string ValidationInvalidInput = "common.forms.errors.invalid";

    // Specifieke Wachtwoord Validatie Fouten
    public const string PasswordNoUppercase = "errors.validation.password.noUppercase";
    public const string PasswordNoLowercase = "errors.validation.password.noLowercase";
    public const string PasswordNoDigit = "errors.validation.password.noDigit";
    public const string PasswordNoSpecialChar = "errors.validation.password.noSpecialChar";
    public const string PasswordTooShort = "errors.validation.password.tooShort";

    // User & Role Specifieke Fouten
    public const string UserNotFound = "users.errors.userNotFound";
    public const string UserEmailAlreadyExists = "users.errors.emailAlreadyExists";
    public const string AdminSelfDemoteForbidden = "users.errors.adminSelfDemoteForbidden";
    public const string LastAdminDemoteForbidden = "users.errors.lastAdminDemoteForbidden";
    public const string LastAdminLockForbidden = "users.errors.lastAdminLockForbidden";
    public const string RoleNotFound = "roles.errors.roleNotFound";
    public const string RoleAlreadyExists = "roles.errors.roleAlreadyExists";
    public const string RoleNameAlreadyExists = "roles.errors.roleNameAlreadyExists";
    public const string RoleInUse = "roles.errors.roleInUse";
    public const string RoleInvalidName = "roles.errors.invalidName";
}
--- END OF FILE ---

--- START OF FILE src/Domain/Constants/Policies.cs ---
namespace RoyalCode.Domain.Constants;

public static class Policies
{
    public const string CanPurge = nameof(CanPurge);
    public const string CanModerate = nameof(CanModerate);
    public const string CanManageProducts = nameof(CanManageProducts);
}
--- END OF FILE ---

--- START OF FILE src/Domain/Constants/Roles.cs ---
namespace RoyalCode.Domain.Constants;

public abstract class Roles
{
    public const string SuperAdmin = nameof(SuperAdmin);
    public const string Administrator = nameof(Administrator);
    public const string User = nameof(User);
    public const string Moderator = nameof(Moderator);
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
 * @Version 1.2.0 (Synthesized & Architecturally Correct)
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

namespace RoyalCode.Domain.Entities.User;

/// <summary>
/// Representeert een fysiek adres dat gekoppeld is aan een gebruiker.
/// Dit kan een verzendadres, factuuradres of ander type adres zijn.
/// </summary>
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

    public AddressType? AddressType { get; private set; }

    public bool IsDefaultShipping { get; private set; }
    public bool IsDefaultBilling { get; private set; }

    [MaxLength(150)]
    public string? ContactName { get; private set; }

    [MaxLength(150)]
    public string? CompanyName { get; private set; }

    [MaxLength(50)]
    public string? PhoneNumber { get; private set; }

    [MaxLength(500)]
    public string? DeliveryInstructions { get; private set; }

    private Address() { }

    /// <summary>
    /// Creëert een nieuw adres voor een gebruiker.
    /// </summary>
    /// <param name="userId">De unieke identifier van de gebruiker.</param>
    /// <param name="street">De straatnaam.</param>
    /// <param name="houseNumber">Het huisnummer.</param>
    /// <param name="city">De plaats/stad.</param>
    /// <param name="postalCode">De postcode.</param>
    /// <param name="countryCode">De ISO 3166-1 alpha-2 landcode (e.g., "NL", "BE"), wordt automatisch naar uppercase omgezet.</param>
    public Address(
        Guid userId, string street, string houseNumber,
        string city, string postalCode, string countryCode)
    {
        ValidateAndSetCoreFields(userId, street, houseNumber, city, postalCode, countryCode);
        Id = Guid.NewGuid();
    }

    /// <summary>
    /// Werkt alle adresgegevens bij.
    /// </summary>
    public void UpdateDetails(
        string street, string houseNumber, string? addressAddition, string city,
        string? stateOrProvince, string postalCode, string countryCode, AddressType? addressType,
        string? contactName, string? companyName, string? phoneNumber, string? deliveryInstructions)
    {
        ValidateAndSetCoreFields(UserId, street, houseNumber, city, postalCode, countryCode);

        AddressAddition = addressAddition;
        StateOrProvince = stateOrProvince;
        AddressType = addressType;
        ContactName = contactName;
        CompanyName = companyName;
        PhoneNumber = phoneNumber;
        DeliveryInstructions = deliveryInstructions;
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

    /// <summary>
    /// Stelt dit adres in als het standaard verzendadres.
    /// De business rule die garandeert dat er maar één default adres per gebruiker is,
    /// wordt afgehandeld in de Application laag (CommandHandler), niet hier.
    /// </summary>
    public void SetAsDefaultShipping(bool isDefault)
    {
        IsDefaultShipping = isDefault;
    }

    /// <summary>
    /// Stelt dit adres in als het standaard factuuradres.
    /// </summary>
    public void SetAsDefaultBilling(bool isDefault)
    {
        IsDefaultBilling = isDefault;
    }

    /// <summary>
    /// Controleert of dit adres voldoende gegevens bevat om als verzendadres te kunnen dienen.
    /// </summary>
    /// <returns>True als alle verplichte velden voor verzending zijn ingevuld.</returns>
    public bool IsValidForShipping()
    {
        // Deze logica is simpel, maar toont het principe van een business rule in het domein.
        return !string.IsNullOrWhiteSpace(Street) &&
               !string.IsNullOrWhiteSpace(HouseNumber) &&
               !string.IsNullOrWhiteSpace(City) &&
               !string.IsNullOrWhiteSpace(PostalCode) &&
               !string.IsNullOrWhiteSpace(CountryCode);
    }

    /// <summary>
    /// Controleert of dit adres voldoende gegevens bevat om als factuuradres te kunnen dienen.
    /// </summary>
    /// <returns>True als alle verplichte velden voor facturatie zijn ingevuld.</returns>
    public bool IsValidForBilling()
    {
        // Een factuuradres vereist vaak ook een naam voor de attentie.
        return IsValidForShipping() && !string.IsNullOrWhiteSpace(ContactName);
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
 * @Version 3.1.0 (Final Domain Model for Blauwdruk v3.3)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-22
 * @Description The complete domain model for the Order aggregate, with collections for Fulfillments, History, InternalNotes, and Refunds.
 *              Includes robust methods for item management and address updates.
 */
using System;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Intrinsics.X86;
using System.Text.Json.Serialization;
using Ardalis.GuardClauses;
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
    public decimal ShippingCost { get; private set; } = 5.95m;
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
        ShippingDetails = new ShippingDetails("Standard Shipping", ShippingCost, null, null, null, null);
        PaymentDetails = new PaymentDetails(paymentMethod, Guid.NewGuid().ToString(), "pending");
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

    // --- DE ONTBREKENDE METHODE ---
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
 * @version 13.2.0 (Definitive Product Model)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-30
 * @description Definitive product aggregate root and related entities.
 *              Includes corrected AttributeValue metadata update, PriceModifier logic in variant generation,
 *              and sealed setters for prices in ProductVariantCombination.
 */

using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.RegularExpressions;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Domain.Entities.Product;

/// <summary>
/// Product aggregate root implementing strategic domain patterns for e-commerce product management.
/// Enforces business invariants across all product types and coordinates variant generation logic.
/// </summary>
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
    [ConcurrencyCheck] public long Version { get; protected set; }
    public string? CustomAttributesJson { get; private set; }
    [MaxLength(50)] public string? AppScope { get; private set; }
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
    }

    /// <summary>
    /// Updates core product information while preserving business state.
    /// </summary>
    public void UpdateBasicInfo(string name, string description)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        Name = name;
        Description = description;
        Version++;
    }

    /// <summary>
    /// Transitions product to published state, making it available for purchase.
    /// Business rule: Only draft products can be published.
    /// </summary>
    public void Publish()
    {
        if (Status != ProductStatus.Draft)
            throw new InvalidOperationException($"Cannot publish product in {Status} status. Only Draft products can be published.");

        Status = ProductStatus.Published;
        PublishedAt = DateTimeOffset.UtcNow;
        Version++;
    }

    /// <summary>
    /// Archives product, removing it from active commerce while preserving data for analytics.
    /// </summary>
    public void Archive()
    {
        Status = ProductStatus.Archived;
        ArchivedAt = DateTimeOffset.UtcNow;
        IsActive = false;
        Version++;
    }

    /// <summary>
    /// Regenerates all possible variant combinations based on current attribute assignments.
    /// Business logic: Creates cartesian product of all attribute groups to generate SKUs.
    /// </summary>
    public void RegenerateVariantCombinations()
    {
        ClearVariantCombinations();

        var attributeAssignments = _attributeAssignments
            .Where(paa => paa.AttributeValue != null)
            .DistinctBy(a => a.AttributeValueId)
            .ToList();

        if (!attributeAssignments.Any()) return;

        var attributeGroups = attributeAssignments
            .GroupBy(paa => paa.AttributeValue.AttributeType)
            .Where(group => group.Any())
            .ToList();

        if (attributeGroups.Count < 2) return;

        var combinations = GenerateAttributeCombinations(attributeGroups);
        bool isFirstCombination = true;

        foreach (var combination in combinations)
        {
            var sku = GenerateSkuForCombination(Id, combination);
            sku = EnsureUniqueSku(sku);

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

            AddVariantCombination(variantCombination);
        }

        Version++;
    }

    /// <summary>
    /// Ensures SKU uniqueness within this product's variant collection.
    /// </summary>
    private string EnsureUniqueSku(string baseSku)
    {
        var sku = baseSku;
        if (_variantCombinations.Any(vc => vc.Sku.Equals(sku, StringComparison.OrdinalIgnoreCase)))
        {
            var counter = 1;
            var originalSku = sku;
            while (_variantCombinations.Any(vc => vc.Sku.Equals(sku, StringComparison.OrdinalIgnoreCase)))
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

    #region Collection Management

    public void AddMedia(Guid mediaId)
    {
        if (_mediaIds.Contains(mediaId)) return;
        _mediaIds.Add(mediaId);
        Version++;
    }

    public void RemoveMedia(Guid mediaId)
    {
        if (_mediaIds.Remove(mediaId)) Version++;
    }

    public void AddTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var normalizedTag = tag.Trim().ToLowerInvariant();
        if (!_tags.Contains(normalizedTag))
        {
            _tags.Add(normalizedTag);
            Version++;
        }
    }

    public void RemoveTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag)) return;
        var normalizedTag = tag.Trim().ToLowerInvariant();
        if (_tags.Remove(normalizedTag)) Version++;
    }

    public void AddAttributeAssignments(IEnumerable<ProductAttributeAssignment> assignments)
    {
        foreach (var assignment in assignments)
        {
            if (!_attributeAssignments.Any(a => a.AttributeValueId == assignment.AttributeValueId))
            {
                _attributeAssignments.Add(assignment);
            }
        }
        Version++;
    }

    public void ClearAttributeAssignments() => _attributeAssignments.Clear();
    public void ClearTags() => _tags.Clear();
    public void ClearMediaIds() => _mediaIds.Clear();
    public void ClearVariantCombinations() => _variantCombinations.Clear();

    public void AddVariantCombination(ProductVariantCombination combination)
    {
        if (combination is null)
            throw new ArgumentNullException(nameof(combination));

        if (_variantCombinations.Any(vc => vc.Sku.Equals(combination.Sku, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException($"SKU '{combination.Sku}' already exists.");

        _variantCombinations.Add(combination);
        Version++;
    }

    /// <summary>
    /// Creates a linked product variant that references a separate product entity.
    /// Used for product families where variants have distinct specifications.
    /// </summary>
    public void AddLinkedProductVariant(string sku, Guid linkedProductId, IEnumerable<Guid> attributeValueIds)
    {
        var variant = new ProductVariantCombination(Id, sku, linkedProductId, attributeValueIds);
        AddVariantCombination(variant);
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

    public void AddCategory(Guid categoryId)
    {
        if (!_categoryIds.Contains(categoryId))
        {
            _categoryIds.Add(categoryId);
            Version++;
        }
    }

    public void ClearCategoryIds()
    {
        if (_categoryIds.Any())
        {
            _categoryIds.Clear();
            Version++;
        }
    }


    #endregion

    #region Business State Management

    /// <summary>
    /// Updates aggregate rating metrics from review system calculations.
    /// </summary>
    public void UpdateRating(decimal averageRating, int reviewCount)
    {
        if (averageRating < 1.0m || averageRating > 5.0m)
            throw new ArgumentOutOfRangeException(nameof(averageRating), "Rating must be between 1.0 and 5.0");
        if (reviewCount < 0)
            throw new ArgumentOutOfRangeException(nameof(reviewCount), "Review count cannot be negative");

        AverageRating = averageRating;
        ReviewCount = reviewCount;
        Version++;
    }

    public void SetFeaturedStatus(bool isFeatured)
    {
        IsFeatured = isFeatured;
        Version++;
    }

    public void SetShortDescription(string? shortDescription)
    {
        ShortDescription = shortDescription;
        Version++;
    }

    public void SetCustomAttributes(string? json)
    {
        CustomAttributesJson = json;
        Version++;
    }

    #endregion
}

#region Concrete Product Implementations

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
        Version++;
    }

    public void ReduceStock(int quantity)
    {
        if (!ManageStock)
            throw new InvalidOperationException("Stock management is disabled for this product.");

        StockQuantity -= quantity;
        UpdateStockStatus();
        Version++;
    }

    public void AddStock(int quantity)
    {
        if (!ManageStock)
            throw new InvalidOperationException("Stock management is disabled for this product.");

        StockQuantity = (StockQuantity ?? 0) + quantity;
        UpdateStockStatus();
        Version++;
    }

    private void UpdateStockStatus()
    {
        if (StockQuantity == 0)
            StockStatus = AllowBackorders ? StockStatus.OnBackorder : StockStatus.OutOfStock;
        else if (LowStockThreshold.HasValue && StockQuantity <= LowStockThreshold)
            StockStatus = StockStatus.LimitedStock;
        else
            StockStatus = StockStatus.InStock;
    }

    public void SetInventoryDetails(string? sku, string? brand)
    {
        Sku = sku;
        Brand = brand;
        Version++;
    }

    public void SetStockRules(bool allowBackorders, int? lowStockThreshold)
    {
        AllowBackorders = allowBackorders;
        LowStockThreshold = lowStockThreshold;
        UpdateStockStatus();
        Version++;
    }

    public void SetAvailabilityRules(ProductAvailabilityRules? rules)
    {
        AvailabilityRules = rules;
        Version++;
    }

    public void SetTaxInfo(ProductTax? taxInfo)
    {
        TaxInfo = taxInfo;
        Version++;
    }

    public void SetAgeRestrictions(int minAge, int maxAge)
    {
        if (minAge < 0 || maxAge < minAge) throw new ArgumentException("Invalid age range.");
        AgeRestrictions = new AgeRestrictions(minAge, maxAge);
        Version++;
    }

    public void AddDisplaySpecification(ProductDisplaySpecification spec)
    {
        if (spec == null) throw new ArgumentNullException(nameof(spec));
        if (string.IsNullOrWhiteSpace(spec.SpecKey)) throw new ArgumentException("SpecKey is required.", nameof(spec));

        if (!_displaySpecifications.Any(s => s.SpecKey.Equals(spec.SpecKey, StringComparison.OrdinalIgnoreCase)))
        {
            _displaySpecifications.Add(spec);
            Version++;
        }
    }

    public void ClearDisplaySpecifications()
    {
        if (_displaySpecifications.Any())
        {
            _displaySpecifications.Clear();
            Version++;
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
        Version++;
    }

    public void SetTaxInfo(ProductTax? taxInfo)
    {
        TaxInfo = taxInfo;
        Version++;
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
        Version++;
    }

    public void SetRealMoneyPrice(decimal? price)
    {
        if (price.HasValue && price <= 0) throw new ArgumentException("Price must be positive.");
        PriceRealMoney = price;
        Version++;
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
        Version++;
    }

    public void SetTaxInfo(ProductTax? taxInfo)
    {
        TaxInfo = taxInfo;
        Version++;
    }
}

#endregion


public class ProductCategory : BaseAuditableEntity<Guid>
{
    [Required, MaxLength(100)]
    public string Name { get; private set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Slug { get; private set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; private set; }

    public Guid? ParentCategoryId { get; private set; }
    public ProductCategory? Parent { get; private set; } // Navigatie property naar ouder

    private readonly List<ProductCategory> _children = new();
    public IReadOnlyCollection<ProductCategory> Children => _children.AsReadOnly(); // Navigatie property naar kinderen

    public Guid? ImageMediaId { get; private set; } // Optionele media-ID voor de categorie

    public int ProductCount { get; private set; } // Aantal producten in deze categorie (kan bijgewerkt worden via domain events/handlers)

    private ProductCategory() { }

    public ProductCategory(string name, string slug, string? description = null, Guid? parentCategoryId = null, Guid? imageMediaId = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        Slug = slug;
        Description = description;
        ParentCategoryId = parentCategoryId;
        ImageMediaId = imageMediaId;
        ProductCount = 0; // Initialize product count
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

    public ProductAttributeAssignment(Guid productId, Guid attributeValueId, int sortOrder, bool isAvailable = true)
    {
        Id = Guid.NewGuid();
        ProductId = productId;
        AttributeValueId = attributeValueId;
        SortOrder = sortOrder;
        IsAvailable = isAvailable;
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
        Id = Guid.NewGuid();
        ProductId = productId;
        Sku = sku;
        _attributeValueIds.AddRange(attributeValueIds ?? throw new ArgumentNullException(nameof(attributeValueIds)));
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
 * @version 1.1.0 (FIXED)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-06-29
 * @description Extension methods for fluent product configuration.
 *              FIXED: Corrected type mismatch in ProductFamilyBuilder.
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
        // FIX: Converteer de collectie van VariantAttributeSelection naar IEnumerable<Guid>
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

        // FIX: Converteer de collectie van VariantAttributeSelection naar IEnumerable<Guid>
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

--- START OF FILE src/Domain/GlobalUsings.cs ---
global using RoyalCode.Domain.Common;
global using RoyalCode.Domain.Entities;
global using RoyalCode.Domain.Enums;
global using RoyalCode.Domain.Events;
global using RoyalCode.Domain.Exceptions;
global using RoyalCode.Domain.ValueObjects;
--- END OF FILE ---

--- START OF FILE src/Domain/ValueObjects/Colour.cs ---
namespace RoyalCode.Domain.ValueObjects;

public class Colour(string code) : ValueObject
{
    public static Colour From(string code)
    {
        var colour = new Colour(code);

        if (!SupportedColours.Contains(colour))
        {
            throw new UnsupportedColourException(code);
        }

        return colour;
    }

    public static Colour White => new("#FFFFFF");

    public static Colour Red => new("#FF5733");

    public static Colour Orange => new("#FFC300");

    public static Colour Yellow => new("#FFFF66");

    public static Colour Green => new("#CCFF99");

    public static Colour Blue => new("#6666FF");

    public static Colour Purple => new("#9966CC");

    public static Colour Grey => new("#999999");

    public string Code { get; private set; } = string.IsNullOrWhiteSpace(code) ? "#000000" : code;

    public static implicit operator string(Colour colour)
    {
        return colour.ToString();
    }

    public static explicit operator Colour(string code)
    {
        return From(code);
    }

    public override string ToString()
    {
        return Code;
    }

    protected static IEnumerable<Colour> SupportedColours
    {
        get
        {
            yield return White;
            yield return Red;
            yield return Orange;
            yield return Yellow;
            yield return Green;
            yield return Blue;
            yield return Purple;
            yield return Grey;
        }
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Code;
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/ApplicationDbContext.cs ---
/**
 * @file ApplicationDbContext.cs
 * @Version 5.0.0 (Definitive & Corrected)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description The definitive, correct version of ApplicationDbContext, including all
 *              necessary using directives and the Dapper implementation for raw SQL,
 *              resolving all previous compilation issues.
 */
using System.Reflection;
using Dapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using RoyalCode.Application.Common.Interfaces;
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


    // --- USER-RELATED ENTITIES (Exposed for seeding, queries, etc.) ---
    public DbSet<Address> Addresses => Set<Address>();


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

    public new ChangeTracker ChangeTracker => base.ChangeTracker;

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

--- START OF FILE src/Infrastructure/Data/ApplicationDbContextFactory.cs ---
/**
 * @file ApplicationDbContextFactory.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Provides a way for EF Core design-time tools (like Add-Migration) to create a DbContext
 *              instance without needing the full web application host and its complex DI setup.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Fix 'Add-Migration' build failure related to IHubContext.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace RoyalCode.Infrastructure.Data;

/// <summary>
/// This factory is used by the EF Core tools (e.g., for creating migrations) at design time.
/// It creates a new instance of ApplicationDbContext by reading the connection string directly
/// from appsettings.json, bypassing the main application's dependency injection container.
/// This is necessary because some services (like SignalR's IHubContext) are not available
/// in the design-time environment and would cause DI errors.
/// </summary>
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Bouw een configuratie object op basis van appsettings.json in de Web-laag.
        // Dit pad gaat er vanuit dat de factory wordt uitgevoerd vanuit de root van het project.
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../Web")) // Ga naar de Web-map waar appsettings.json staat
            .AddJsonFile("appsettings.json")
            .Build();

        // Haal de connection string op.
        var connectionString = configuration.GetConnectionString("RoyalCodeDb");

        // Maak een DbContextOptionsBuilder en configureer deze met de connection string.
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        // Geef een nieuwe instantie van de DbContext terug.
        // Omdat we geen interceptors kunnen resolven via DI, worden die hier niet toegevoegd.
        // Dat is prima, want voor het maken van een migratie zijn ze niet nodig.
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/ApplicationDbContextInitialiser.cs ---
/**
 * @file ApplicationDbContextInitialiser.cs
 * @Version 37.0.0 (DEFINITIVE CLEANUP & REFACTOR)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-30
 * @Description The definitive seeder after a full refactor. The legacy ProductAttributeValue
 *              entity has been removed. The seeder now correctly and exclusively uses the
 *              AttributeValue entity, resolving all previous data inconsistencies.
 */
using System.Text.Json;
using Bogus;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RoyalCode.Domain.Constants;
using RoyalCode.Domain.Entities.Cart;
using RoyalCode.Domain.Entities.Chat;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Entities.Order;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Entities.Social;
using RoyalCode.Domain.Enums;
using RoyalCode.Domain.Enums.Media;
using RoyalCode.Domain.Enums.Product;
using RoyalCode.Domain.Enums.Review;
using RoyalCode.Domain.Enums.Social;
using RoyalCode.Infrastructure.Identity;

namespace RoyalCode.Infrastructure.Data;

public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();
        await initialiser.InitialiseAsync();
        await initialiser.SeedAsync();
    }
}

public class ApplicationDbContextInitialiser
{
    private static class SeedingConfig { public const int NumberOfProducts = 200; }
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public ApplicationDbContextInitialiser(ILogger<ApplicationDbContextInitialiser> logger, ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<Guid>> roleManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            await _context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    public async Task TrySeedAsync()
    {
        await SeedAllDataAsync();
    }

    private async Task SeedAllDataAsync()
    {
        _logger.LogInformation("Starting logical, step-by-step data seeding...");
        await SeedUsersAndRolesAsync();
        await SeedAiPersonasAsync(); 
        await SeedProductCategoriesAsync();
        await SeedMediaAsync();
        await SeedAttributesAsync();
        await SeedCustomAttributeDefinitionsAsync();
        await SeedDisplaySpecificationDefinitionsAsync();
        await SeedProductsAsync();
        await SeedReviewsAsync();
        await SeedReviewAnalysisKeywordsAsync();
        await SeedAdminOrdersAsync();
        await SeedSocialFeedsAsync();

        _logger.LogInformation("Seeding complete.");
    }

    private async Task SeedUsersAndRolesAsync()
    {
        // Als er al carts zijn, betekent dit dat de basis seeding al heeft plaatsgevonden.
        // We willen niet opnieuw gebruikers aanmaken, alleen eventueel ontbrekende rollen.
        if (await _context.Carts.AnyAsync())
        {
            _logger.LogInformation("Users and initial Carts already exist. Ensuring roles are up-to-date.");
            await EnsureStandardRolesExist(); // Zorg wel dat rollen altijd worden gecheckt
            return;
        }

        _logger.LogInformation("Seeding Users, Roles, and their initial Carts...");

        await EnsureStandardRolesExist();

        var adminUser = await _userManager.FindByNameAsync("administrator@localhost");
        if (adminUser == null)
        {
            adminUser = new ApplicationUser { UserName = "administrator@localhost", Email = "administrator@localhost", DisplayName = "Super Admin", EmailConfirmed = true, FirstName = "Roy", MiddleName = "van de", LastName = "Wetering" };
            await _userManager.CreateAsync(adminUser, "Administrator1!");
            // WIJZIGING: Wijs BEIDE rollen toe. Een SuperAdmin is ook een Administrator.
            await _userManager.AddToRolesAsync(adminUser, new[] { Roles.SuperAdmin, Roles.Administrator });
            _logger.LogInformation("SuperAdmin user 'administrator@localhost' created and assigned 'SuperAdmin' and 'Administrator' roles.");
        }

        var demoUser = await _userManager.FindByNameAsync("user@localhost");
        if (demoUser == null)
        {
            demoUser = new ApplicationUser { UserName = "user@localhost", Email = "user@localhost", DisplayName = "Demo User", EmailConfirmed = true, Bio = "Loves test data!", FirstName = "Firstname", MiddleName = "middle name", LastName = "Lastname" };
            await _userManager.CreateAsync(demoUser, "User1!");
            // FIX: Geef de Demo User de standaard "User" rol (nu correct als IEnumerable<string>)
            await _userManager.AddToRolesAsync(demoUser, new[] { Roles.User });
            _logger.LogInformation("Demo user 'user@localhost' created and assigned 'User' role.");
        }

        var cartsToCreate = new List<Cart>();

        if (!await _context.Carts.AnyAsync(c => c.UserId == adminUser.Id))
        {
            cartsToCreate.Add(new Cart(adminUser.Id, null));
        }

        if (!await _context.Carts.AnyAsync(c => c.UserId == demoUser.Id))
        {
            cartsToCreate.Add(new Cart(demoUser.Id, null));
        }

        if (cartsToCreate.Any())
        {
            await _context.Carts.AddRangeAsync(cartsToCreate);
            await _context.SaveChangesAsync();
            _logger.LogInformation("{Count} initial user carts have been created.", cartsToCreate.Count);
        }

        _logger.LogInformation("Users, Roles, and Carts are seeded and synchronized.");
    }

    private async Task SeedAiPersonasAsync()
    {
        if (await _context.AiPersonas.AnyAsync())
        {
            return;
        }

        _logger.LogInformation("Seeding default AI Persona...");

        var defaultAiPersonaId = Guid.Parse("3f2e1a0b-c8d7-4e6f-9a1b-0c2d3e4f5a6b");

        var defaultAiPersona = new AIPersona(
            "Plushie Pal",
            Domain.Enums.Chat.AiProviderType.OpenAI_GPT4,
            "Your friendly and helpful plushie expert assistant.",
            null, 
            @"{ ""Model"": ""gpt-4-turbo"", ""Temperature"": 0.7, ""MaxTokens"": 1500, ""SystemPrompt"": ""You are Plushie Pal, a cheerful and knowledgeable assistant specializing in plush toys. You are friendly, use emojis, and love to help people find their perfect plushie friend."" }"
        );

        defaultAiPersona.SetIdForSeeding(defaultAiPersonaId);

        await _context.AiPersonas.AddAsync(defaultAiPersona);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded AI Persona 'Plushie Pal' with ID {Id}.", defaultAiPersona.Id);
    }


    private async Task EnsureStandardRolesExist()
    {
        var standardRoles = new List<string>
        {
            Roles.SuperAdmin,
            Roles.Administrator,
            Roles.User,
            Roles.Moderator,
            "CustomerService",
            "Editor"
        };

        foreach (var roleName in standardRoles)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                await _roleManager.CreateAsync(new IdentityRole<Guid>(roleName));
                _logger.LogInformation("Role '{RoleName}' created.", roleName);
            }
        }
    }

    private async Task SeedProductCategoriesAsync()
    {
        if (await _context.ProductCategories.AnyAsync()) return;
        _logger.LogInformation("Seeding Product Categories...");

        var parent1 = new ProductCategory("Plushies", "plushies", "All kinds of plushies.");
        var parent2 = new ProductCategory("Accessories", "accessories", "Accessories for your plushies.");

        var categories = new List<ProductCategory>
        {
            parent1,
            parent2,
            new("Large Plushies", "large-plushies", "Plushies larger than 50cm.", parent1.Id),
            new("Small Plushies", "small-plushies", "Plushies smaller than 20cm.", parent1.Id),
            new("Clothing", "clothing", "Outfits for your plushie friends.", parent2.Id)
        };

        await _context.ProductCategories.AddRangeAsync(categories);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} product categories.", categories.Count);
    }


    private async Task SeedMediaAsync()
    {
        if (await _context.Media.AnyAsync()) return;
        _logger.LogInformation("Seeding Media and adding color tags with i18n...");

        var users = await _userManager.Users.ToListAsync();
        var colors = new[] { "roze", "lichtblauw", "blauw", "groen", "geel", "rood", "zwart", "wit" };
        var mediaItems = new List<ImageMedia>();
        var faker = new Faker("nl");

        for (int i = 0; i < 400; i++)
        {
            var colorTag = faker.Random.Bool(0.7f) ? faker.PickRandom(colors) : null;
            var productName = faker.Commerce.ProductName();
            var adjective = faker.Commerce.ProductAdjective();

            var media = new ImageMedia(
                masterUrl: $"https://picsum.photos/seed/{faker.Random.Guid()}/1024/768",
                altTextKeyOrText: $"product.image.alt.{productName.ToLower().Replace(' ', '-')}.{adjective.ToLower()}",
                uploaderId: faker.PickRandom(users).Id,
                titleKeyOrText: $"{productName} - {adjective}",
                originalFilename: $"{productName.ToLower()}-{i}.jpg"
            );

            if (colorTag != null) media.AddTag($"color:{colorTag}", MediaTagType.Descriptive);
            mediaItems.Add(media);
        }

        await _context.Media.AddRangeAsync(mediaItems);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} media items with i18n keys and color tags.", mediaItems.Count);
    }

    // --- DE DEFINITIEF GECORRIGEERDE METHODE ---
    private async Task SeedAttributesAsync()
    {
        if (await _context.AttributeValues.AnyAsync()) return;
        _logger.LogInformation("Seeding 'AttributeValue' entities with realistic PriceModifiers...");

        var attributeValues = new List<AttributeValue>();
        var faker = new Faker(); // Voeg Bogus faker toe voor willekeur

        var colors = new Dictionary<string, string>
        {
            { "Rood", "#FF0000" }, { "Groen", "#00FF00" }, { "Blauw", "#0000FF" },
            { "Geel", "#FFFF00" }, { "Zwart", "#000000" }, { "Wit", "#FFFFFF" },
            { "Roze", "#FFC0CB" }, { "Lichtblauw", "#ADD8E6" }
        };

        foreach (var color in colors)
        {
            var attr = new AttributeValue(color.Key.ToLowerInvariant(), color.Key, VariantAttributeType.Color);

            // 30% kans op een prijsmodificator voor een kleur
            if (faker.Random.Bool(0.3f))
            {
                var priceModifier = Math.Round(faker.Random.Decimal(1.00m, 15.00m), 2); // Kleuren maken het duurder
                attr.SetMetadata(color.Value, null, priceModifier, PriceModifierType.Fixed);
            }
            else
            {
                attr.SetMetadata(color.Value, null, null, null);
            }

            attributeValues.Add(attr);
        }

        var sizes = new[] { "X-Small", "Small", "Medium", "Large", "X-Large" };
        foreach (var size in sizes)
        {
            var attr = new AttributeValue(size.ToLower().Replace("-", ""), size, VariantAttributeType.Size);

            // 50% kans op een prijsmodificator voor een maat
            if (faker.Random.Bool(0.5f))
            {
                var priceModifier = Math.Round(faker.Random.Decimal(-5.00m, 10.00m), 2); // Maten kunnen goedkoper of duurder zijn
                attr.SetMetadata(null, null, priceModifier, PriceModifierType.Fixed);
            }
            // Geen else nodig, als er geen modifier is, blijven de velden null.

            attributeValues.Add(attr);
        }

        await _context.AttributeValues.AddRangeAsync(attributeValues);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} 'AttributeValue' entities with realistic PriceModifiers.", attributeValues.Count);
    }


    private async Task SeedCustomAttributeDefinitionsAsync()
    {
        if (await _context.CustomAttributeDefinitions.AnyAsync()) return;
        _logger.LogInformation("Seeding Custom Attribute Definitions...");

        var definitions = new List<CustomAttributeDefinition>
        {
            new() { Key = "durability", NameKeyOrText = "product.quality.durability", DescriptionKeyOrText = "product.quality.durability_desc", ValueType = CustomAttributeType.Integer, UiControlType = CustomAttributeUIType.Slider, ValidationRulesJson = @"{ ""min"": 1, ""max"": 10 }", DefaultValue = "5", Group = "Kwaliteiten", Icon = "shield-check" },
            new() { Key = "cuddleFactor", NameKeyOrText = "product.quality.cuddleFactor", DescriptionKeyOrText = "product.quality.cuddleFactor_desc", ValueType = CustomAttributeType.Integer, UiControlType = CustomAttributeUIType.Slider, ValidationRulesJson = @"{ ""min"": 1, ""max"": 10 }", DefaultValue = "8", Group = "Kwaliteiten", Icon = "heart" },
            new() { Key = "fluffiness", NameKeyOrText = "product.quality.fluffiness", DescriptionKeyOrText = "product.quality.fluffiness_desc", ValueType = CustomAttributeType.Integer, UiControlType = CustomAttributeUIType.Slider, ValidationRulesJson = @"{ ""min"": 1, ""max"": 10 }", DefaultValue = "7", Group = "Kwaliteiten", Icon = "cloud" },
            new() { Key = "dreamGuard", NameKeyOrText = "product.quality.dreamGuard", DescriptionKeyOrText = "product.quality.dreamGuard_desc", ValueType = CustomAttributeType.Integer, UiControlType = CustomAttributeUIType.Slider, ValidationRulesJson = @"{ ""min"": 1, ""max"": 10 }", DefaultValue = "6", Group = "Magische Eigenschappen", Icon = "moon-star" },
            new() { Key = "adventureSpirit", NameKeyOrText = "product.quality.adventureSpirit", DescriptionKeyOrText = "product.quality.adventureSpirit_desc", ValueType = CustomAttributeType.Integer, UiControlType = CustomAttributeUIType.Slider, ValidationRulesJson = @"{ ""min"": 1, ""max"": 10 }", DefaultValue = "5", Group = "Magische Eigenschappen", Icon = "compass" },
            new() { Key = "washable", NameKeyOrText = "product.quality.washable", DescriptionKeyOrText = "product.quality.washable_desc", ValueType = CustomAttributeType.Boolean, UiControlType = CustomAttributeUIType.Toggle, DefaultValue = "true", Group = "Praktisch", Icon = "droplets" }
        };

        await _context.CustomAttributeDefinitions.AddRangeAsync(definitions);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} custom attribute definitions.", definitions.Count);
    }

    private async Task SeedDisplaySpecificationDefinitionsAsync()
    {
        if (await _context.DisplaySpecificationDefinitions.AnyAsync()) return;
        _logger.LogInformation("Seeding Display Specification Definitions...");

        var definitions = new List<DisplaySpecificationDefinition>
        {
            new() { SpecKey = "material", LabelKeyOrText = "product.spec.material", Icon = "shirt", GroupKeyOrText = "Algemene Eigenschappen", DisplayOrder = 1 },
            new() { SpecKey = "filling", LabelKeyOrText = "product.spec.filling", Icon = "recycle", GroupKeyOrText = "Algemene Eigenschappen", DisplayOrder = 2 },
            new() { SpecKey = "washable", LabelKeyOrText = "product.spec.washable", Icon = "droplets", GroupKeyOrText = "Onderhoud", DisplayOrder = 3 },
            new() { SpecKey = "size", LabelKeyOrText = "product.spec.size", Icon = "ruler", GroupKeyOrText = "Afmetingen", DisplayOrder = 4 },
            new() { SpecKey = "weight", LabelKeyOrText = "product.spec.weight", Icon = "balance", GroupKeyOrText = "Afmetingen", DisplayOrder = 5 },
            new() { SpecKey = "origin", LabelKeyOrText = "product.spec.origin", Icon = "map-pin", GroupKeyOrText = "Herkomst", DisplayOrder = 6 },
            new() { SpecKey = "certification", LabelKeyOrText = "product.spec.certification", Icon = "check-circle", GroupKeyOrText = "Certificering", DisplayOrder = 7 }
        };

        await _context.DisplaySpecificationDefinitions.AddRangeAsync(definitions);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} display specification definitions.", definitions.Count);
    }

    private async Task SeedProductsAsync()
    {
        if (await _context.Products.AnyAsync()) return;
        _logger.LogInformation("Seeding Products with ultra-rich, realistic data including Category assignments...");

        var allMedia = await _context.Media.Include(m => m.Tags).ToListAsync();
        var allAttributeValues = await _context.AttributeValues.ToListAsync();
        var allCategories = await _context.ProductCategories.ToListAsync(); // <-- HAAL CATEGORIEËN OP
        var brands = new[] { "Royal Kitch", "CodeCraft", "Azure Basics", "Logicorp", "Quantum Toys" };

        var mediaByColorTag = allMedia
            .Where(m => m.Tags.Any(t => t.Name.StartsWith("color:")))
            .SelectMany(m => m.Tags.Where(t => t.Name.StartsWith("color:")), (media, tag) => new { media, color = tag.Name.Split(':').Last() })
            .GroupBy(x => x.color)
            .ToDictionary(g => g.Key, g => g.Select(x => x.media).ToList());

        var productsToSeed = new List<PhysicalProduct>();
        var faker = new Faker("nl");

        for (int i = 0; i < SeedingConfig.NumberOfProducts; i++)
        {
            var salePrice = Math.Round(faker.Random.Decimal(9.99m, 299.99m), 2);
            var originalPrice = faker.Random.Bool(0.8f)
                ? Math.Round(salePrice * faker.Random.Decimal(1.1m, 1.8m), 2)
                : salePrice;

            var product = new PhysicalProduct(
                faker.Commerce.ProductName(), faker.Lorem.Paragraphs(2, 5), "royal-store", "EUR",
                new Pricing(salePrice, originalPrice), true
            );

            // --- DE FIX: Wijs willekeurige categorieën toe ---
            if (allCategories.Any())
            {
                var categoriesToAssign = faker.PickRandom(allCategories, faker.Random.Int(1, 2));
                foreach (var category in categoriesToAssign)
                {
                    product.AddCategory(category.Id);
                }
            }
            // --- EINDE FIX ---

            if (faker.Random.Bool(0.8f)) product.SetShortDescription(faker.Lorem.Sentence(10, 5));
            if (faker.Random.Bool(0.8f)) product.SetInventoryDetails(faker.Commerce.Ean13(), faker.PickRandom(brands));
            if (faker.Random.Bool(0.8f))
            {
                var tags = faker.Commerce.Categories(faker.Random.Int(1, 4));
                foreach (var tag in tags) product.AddTag(tag);
            }
            product.SetFeaturedStatus(faker.Random.Bool(0.2f));
            if (faker.Random.Bool(0.95f)) product.Publish();

            var specifications = new List<ProductDisplaySpecification>
        {
            new("material", "product.spec.material", faker.Commerce.ProductMaterial(), "shirt", "Algemene Eigenschappen", 1),
            new("filling", "product.spec.filling", faker.Random.Bool() ? "100% gerecycled katoen" : "Synthetische vulling", "recycle", "Algemene Eigenschappen", 2),
            new("washable", "product.spec.washable", faker.Random.Bool() ? "Handwas aanbevolen" : "Machinewasbaar (30°C)", "droplets", "Onderhoud", 3),
            new("size", "product.spec.size", $"{faker.Random.Int(20, 80)} cm hoog", "ruler", "Afmetingen", 4),
            new("weight", "product.spec.weight", $"{Math.Round(faker.Random.Decimal(0.1m, 2.5m), 2)} kg", "balance", "Afmetingen", 5),
            new("origin", "product.spec.origin", faker.Address.Country(), "map-pin", "Herkomst", 6),
            new("certification", "product.spec.certification", faker.Random.Bool() ? "CE Gecertificeerd" : "Oeko-Tex Standard 100", "check-circle", "Certificering", 7)
        };
            foreach (var spec in specifications) product.AddDisplaySpecification(spec);

            var customAttributes = new
            {
                durability = faker.Random.Int(1, 10),
                cuddleFactor = faker.Random.Int(1, 10),
                fluffiness = faker.Random.Int(1, 10),
                dreamGuard = faker.Random.Int(1, 10),
                adventureSpirit = faker.Random.Int(1, 10),
                washable = faker.Random.Bool(),
            };
            product.SetCustomAttributes(JsonSerializer.Serialize(customAttributes));

            var availableColors = allAttributeValues.Where(a => a.AttributeType == VariantAttributeType.Color).ToList();
            var availableSizes = allAttributeValues.Where(a => a.AttributeType == VariantAttributeType.Size).ToList();

            var colorAttributeValues = faker.PickRandom(availableColors, faker.Random.Int(1, Math.Min(4, availableColors.Count))).ToList();
            var sizeAttributeValues = faker.PickRandom(availableSizes, faker.Random.Int(1, Math.Min(3, availableSizes.Count))).ToList();

            var assignments = new List<ProductAttributeAssignment>();
            foreach (var attrValue in colorAttributeValues.Concat(sizeAttributeValues))
            {
                var assignment = new ProductAttributeAssignment(product.Id, attrValue.Id, faker.Random.Int(1, 100)) { AttributeValue = attrValue };
                assignments.Add(assignment);
            }
            product.AddAttributeAssignments(assignments);

            var productImages = new List<MediaBase>();
            foreach (var colorAttrValue in colorAttributeValues)
            {
                if (mediaByColorTag.TryGetValue(colorAttrValue.Value.ToLowerInvariant(), out var mediaForThisColor) && mediaForThisColor.Any())
                {
                    var mediaToLink = faker.PickRandom(mediaForThisColor, Math.Min(faker.Random.Int(1, 4), mediaForThisColor.Count));
                    productImages.AddRange(mediaToLink);
                }
            }

            if (productImages.Any())
            {
                foreach (var img in productImages) product.AddMedia(img.Id);
            }
            else if (allMedia.Any())
            {
                product.AddMedia(faker.PickRandom(allMedia).Id);
            }

            product.RegenerateVariantCombinations();

            foreach (var variant in product.VariantCombinations)
            {
                if (faker.Random.Bool(0.9f)) variant.SetStock(faker.Random.Int(5, 250));
                else variant.SetStock(0);
            }

            productsToSeed.Add(product);
        }

        await _context.Products.AddRangeAsync(productsToSeed);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} products with ultra-rich, realistic data and category assignments.", productsToSeed.Count);
    }



    private async Task SeedReviewsAsync()
    {
        if (await _context.Reviews.AnyAsync()) return;
        _logger.LogInformation("Seeding Reviews...");

        var productsToReview = await _context.Products.Where(p => p.Status == ProductStatus.Published).ToListAsync();
        var users = await _userManager.Users.ToListAsync(); // Haal de ApplicationUser objecten op
        var faker = new Faker("nl");
        var reviews = new List<Review>();

        foreach (var product in productsToReview)
        {
            var usersWhoReviewed = new HashSet<Guid>();
            var reviewCount = faker.Random.Int(0, 15);
            for (int i = 0; i < reviewCount; i++)
            {
                var author = faker.PickRandom(users); // Dit is een ApplicationUser
                if (usersWhoReviewed.Contains(author.Id)) continue;

                // --- DE DEFINITIEVE FIX: Creëer Review DIRECT met AuthorId en DisplayName ---
                // De Review constructor verwacht nu (Guid authorId, Guid targetEntityId, ReviewTargetEntityType targetEntityType, ...)
                var review = new Review(
                    author.Id, // Gebruik direct de Guid van de Author
                    product.Id,
                    ReviewTargetEntityType.Product,
                    Math.Round(faker.Random.Decimal(1.0m, 5.0m), 1),
                    faker.Lorem.Paragraph(),
                    faker.Commerce.ProductAdjective());

                var systemModeratorId = Guid.Parse("00000000-0000-0000-0000-000000000001");
                review.Approve(systemModeratorId, "Auto-approved during seeding");
                reviews.Add(review);
                usersWhoReviewed.Add(author.Id);
            }
        }
        await _context.Reviews.AddRangeAsync(reviews);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} reviews.", reviews.Count);

        _logger.LogInformation("Updating product review stats...");
        var allProducts = await _context.Products.ToListAsync();
        var allReviews = await _context.Reviews.Where(r => r.Status == ReviewStatus.Approved).ToListAsync();
        foreach (var product in allProducts)
        {
            var productReviews = allReviews.Where(r => r.TargetEntityId == product.Id).ToList();
            if (productReviews.Any())
            {
                product.UpdateRating(Math.Round(productReviews.Average(r => r.Rating), 1), productReviews.Count);
            }
        }
        await _context.SaveChangesAsync();
        _logger.LogInformation("Product review stats updated.");
    }


    private async Task SeedReviewAnalysisKeywordsAsync()
    {
        if (await _context.ReviewHighlightKeywords.AnyAsync() || await _context.FeatureRatingKeywords.AnyAsync()) return;
        _logger.LogInformation("Seeding review analysis keywords...");

        var highlights = new List<ReviewHighlightKeyword>
        {
            new() { Keyword = "zacht", I18nKey = "review.highlight.soft" },
            new() { Keyword = "kwaliteit", I18nKey = "review.highlight.quality" },
            new() { Keyword = "snel", I18nKey = "review.highlight.fastDelivery" },
            new() { Keyword = "perfect", I18nKey = "review.highlight.perfect" },
        };

        var features = new List<FeatureRatingKeyword>
        {
            new() { FeatureKey = "fluffiness", Keyword = "zacht" },
            new() { FeatureKey = "fluffiness", Keyword = "pluizig" },
            new() { FeatureKey = "cuddleFactor", Keyword = "knuffel" },
            new() { FeatureKey = "cuddleFactor", Keyword = "gezellig" },
            new() { FeatureKey = "durability", Keyword = "stevig" },
            new() { FeatureKey = "durability", Keyword = "kwaliteit" },
        };

        await _context.ReviewHighlightKeywords.AddRangeAsync(highlights);
        await _context.FeatureRatingKeywords.AddRangeAsync(features);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {HighlightCount} highlight keywords and {FeatureCount} feature keywords.", highlights.Count, features.Count);
    }

    private async Task SeedAdminOrdersAsync()
    {
        var adminUser = await _userManager.FindByNameAsync("administrator@localhost");
        if (adminUser == null || await _context.Orders.AnyAsync(o => o.UserId == adminUser.Id))
        {
            _logger.LogInformation("Admin orders already exist or admin user not found. Skipping seeding.");
            return;
        }

        _logger.LogInformation("Seeding Admin Orders for administrator@localhost...");

        var productLookups = await _context.Products.OfType<PhysicalProduct>()
            .AsNoTracking()
            .Where(p => p.VariantCombinations.Any())
            .Select(p => new
            {
                ProductId = p.Id,
                ProductName = p.Name,
                ProductType = p.Type,
                BasePrice = p.Pricing.Price,
                FirstMediaId = p.MediaIds.Any() ? (Guid?)p.MediaIds.First() : null,
                Variants = p.VariantCombinations.Select(v => new
                {
                    VariantId = v.Id,
                    Sku = v.Sku,
                    Price = v.Price
                }).ToList()
            }).ToListAsync();

        if (!productLookups.Any())
        {
            _logger.LogWarning("No physical products with variants found. Skipping admin order seeding.");
            return;
        }

        // --- DE DEFINITIEVE, ONFEILBARE FIX VOOR CS8629 (regel 565) ---
        // 1. Selecteer de nullable FirstMediaId.
        // 2. Filter op HasValue.
        // 3. Cast expliciet naar non-nullable Guid. Dit overtuigt de compiler 100%.
        // 4. Neem Distinct en converteer naar List.
        var allProductMediaIds = productLookups
            .Select(p => p.FirstMediaId)        // Nu is het een IQueryable<Guid?>
            .Where(id => id.HasValue)           // Filtert de nulls eruit
            .Cast<Guid>()                       // <-- DE CRUCIALE STAP: Cast alles naar non-nullable Guid
            .Distinct()
            .ToList();


        var mediaThumbnailLookup = await _context.Media
            .Where(m => allProductMediaIds.Contains(m.Id))
            .AsNoTracking()
            .ToDictionaryAsync(m => m.Id, m => m.ThumbnailUrl ?? m.Url);

        var faker = new Faker("nl");

        var shippingAddress = new RoyalCode.Domain.Entities.User.Address(adminUser.Id, faker.Address.StreetName(), faker.Address.BuildingNumber(), faker.Address.City(), faker.Address.ZipCode(), faker.Address.CountryCode());
        shippingAddress.UpdateDetails(shippingAddress.Street, shippingAddress.HouseNumber, null, shippingAddress.City, null, shippingAddress.PostalCode, shippingAddress.CountryCode, RoyalCode.Domain.Enums.AddressType.Shipping, faker.Person.FullName, null, faker.Phone.PhoneNumber(), "Please leave package at the back door.");

        var billingAddress = new RoyalCode.Domain.Entities.User.Address(adminUser.Id, faker.Address.StreetName(), faker.Address.BuildingNumber(), faker.Address.City(), faker.Address.ZipCode(), faker.Address.CountryCode());
        billingAddress.UpdateDetails(billingAddress.Street, billingAddress.HouseNumber, null, billingAddress.City, null, billingAddress.PostalCode, billingAddress.CountryCode, RoyalCode.Domain.Enums.AddressType.Billing, faker.Person.FullName, null, faker.Phone.PhoneNumber(), null);

        _context.Addresses.AddRange(shippingAddress, billingAddress);
        await _context.SaveChangesAsync();

        var ordersToSeed = new List<RoyalCode.Domain.Entities.Order.Order>();
        for (int i = 0; i < faker.Random.Int(5, 10); i++)
        {
            var newOrder = new RoyalCode.Domain.Entities.Order.Order(adminUser.Id, adminUser.Email!, shippingAddress, billingAddress, "iDEAL");
            var selectedProducts = faker.PickRandom(productLookups, faker.Random.Int(1, Math.Min(5, productLookups.Count))).ToList();
            if (!selectedProducts.Any()) continue;

            var orderItems = new List<RoyalCode.Domain.Entities.Order.OrderItem>();
            foreach (var prod in selectedProducts)
            {
                var variant = faker.PickRandom(prod.Variants);
                string? productImageUrl = null;
                if (prod.FirstMediaId.HasValue && mediaThumbnailLookup.TryGetValue(prod.FirstMediaId.Value, out var url))
                {
                    productImageUrl = url;
                }

                orderItems.Add(new RoyalCode.Domain.Entities.Order.OrderItem(
                    newOrder.Id,
                    prod.ProductId,
                    variant.VariantId,
                    faker.Random.Int(1, 3),
                    prod.ProductName,
                    variant.Sku,
                    prod.ProductType,
                    variant.Price ?? prod.BasePrice,
                    productImageUrl,
                    null, null, null));
            }
            newOrder.AddItems(orderItems);
            newOrder.UpdateStatus(faker.PickRandom<OrderStatus>());
            ordersToSeed.Add(newOrder);
        }

        await _context.Orders.AddRangeAsync(ordersToSeed);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {Count} admin orders.", ordersToSeed.Count);
    }

    private async Task SeedSocialFeedsAsync()
    {
        if (!await _context.FeedDefinitions.AnyAsync())
        {
            _logger.LogInformation("Seeding initial Social Feed Definitions...");
            var feedDefinitions = new List<FeedDefinition>
            {
                new("CV Home Feed", "cv-home"),
                new("Challenge Home Feed", "challenge-home"),
                new("Plushie Home Feed", "plushie-home")
            };
            await _context.FeedDefinitions.AddRangeAsync(feedDefinitions);
            await _context.SaveChangesAsync();
        }

        if (await _context.FeedItems.AnyAsync())
        {
            _logger.LogInformation("Social Feed Items already exist. Skipping item and reply seeding.");
            return;
        }

        _logger.LogInformation("Seeding simple, predictable Social Feed Items and Replies...");

        var adminUser = await _userManager.FindByNameAsync("administrator@localhost");
        var demoUser = await _userManager.FindByNameAsync("user@localhost");
        if (adminUser == null || demoUser == null)
        {
            _logger.LogWarning("Admin or Demo user not found, cannot seed social feed.");
            return;
        }

        var availableMedia = await _context.Media.Take(10).ToListAsync();
        var faker = new Faker("nl");
        var feedItemsToSeed = new List<FeedItem>();

        // Item 1: Admin post met media
        var item1 = new FeedItem("cv-home", adminUser.Id, PrivacyLevel.Public, "Welkom op de nieuwe social feed! Dit is een eerste bericht met een afbeelding.");
        if (availableMedia.Any())
        {
            item1.AddMedia(faker.PickRandom(availableMedia).Id);
        }
        feedItemsToSeed.Add(item1);

        // Item 2: Demo user post zonder media
        var item2 = new FeedItem("cv-home", demoUser.Id, PrivacyLevel.Public, faker.Lorem.Paragraph());
        feedItemsToSeed.Add(item2);

        // Item 3: Admin post in een andere feed
        var item3 = new FeedItem("plushie-home", adminUser.Id, PrivacyLevel.Public, "Nieuwe plushies zijn binnenkort beschikbaar!");
        feedItemsToSeed.Add(item3);

        await _context.FeedItems.AddRangeAsync(feedItemsToSeed);
        await _context.SaveChangesAsync();

        // Seed een paar replies op het eerste item
        var repliesToSeed = new List<FeedReply>();
        var reply1 = new FeedReply(item1.Id, item1.FeedId, demoUser.Id, "Leuk! Ziet er goed uit.");
        item1.IncrementReplyCount();
        repliesToSeed.Add(reply1);

        var reply2 = new FeedReply(item1.Id, item1.FeedId, adminUser.Id, "Bedankt voor je reactie!", reply1.Id);
        item1.IncrementReplyCount();
        repliesToSeed.Add(reply2);

        await _context.FeedReplies.AddRangeAsync(repliesToSeed);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Seeded {ItemCount} predictable feed items and {ReplyCount} replies.", feedItemsToSeed.Count, repliesToSeed.Count);
    }





}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/AddressConfiguration.cs ---
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.User;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.ToTable("Addresses");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.UserId).IsRequired();
        builder.Property(a => a.Street).HasMaxLength(200).IsRequired();
        builder.Property(a => a.HouseNumber).HasMaxLength(50).IsRequired();
        builder.Property(a => a.City).HasMaxLength(100).IsRequired();
        builder.Property(a => a.PostalCode).HasMaxLength(20).IsRequired();
        builder.Property(a => a.CountryCode).HasMaxLength(2).IsRequired();
        builder.Property(a => a.AddressType).HasConversion<string>().HasMaxLength(50);

        // Relatie met ApplicationUser
        builder.HasOne<RoyalCode.Infrastructure.Identity.ApplicationUser>()
            .WithMany()
            .HasForeignKey(a => a.UserId);

        builder.HasIndex(a => a.UserId).HasDatabaseName("IX_Addresses_UserId");
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/AttributeValueConfiguration.cs ---
/**
 * @file AttributeValueConfiguration.cs
 * @version 3.0.0 (Complete & Corrected)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-06-29
 * @description Complete configuration for the shared AttributeValue entity, enabling a sophisticated
 *              product variation system with pricing modifiers, media associations, and global reusability.
 */

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;

/// <summary>
/// Enterprise configuration for AttributeValue entity supporting complex product variation scenarios
/// with reusable attribute definitions, dynamic pricing, and rich metadata associations.
/// </summary>
public class AttributeValueConfiguration : IEntityTypeConfiguration<AttributeValue>
{
    public void Configure(EntityTypeBuilder<AttributeValue> builder)
    {
        // === TABLE AND PRIMARY KEY ===
        builder.ToTable("AttributeValues");
        builder.HasKey(av => av.Id);

        // === CORE ATTRIBUTE PROPERTIES ===
        builder.Property(av => av.Value)
            .IsRequired()
            .HasMaxLength(100)
            .HasComment("Internal attribute value used for business logic and SKU generation");

        builder.Property(av => av.DisplayName)
            .IsRequired()
            .HasMaxLength(100)
            .HasComment("Customer-facing display name for UI components and product pages");

        builder.Property(av => av.AttributeType)
            .IsRequired()
            .HasConversion<string>()
            .HasComment("Attribute type classification (Color, Size, Material, etc.)");

        builder.Property(av => av.Description)
            .HasMaxLength(500)
            .HasComment("Optional detailed description for complex attributes");

        // === VISUAL AND MEDIA PROPERTIES ===
        builder.Property(av => av.ColorHex)
            .HasMaxLength(7)
            .HasComment("Hex color code for color attributes (e.g., #FF5733)");

        builder.Property(av => av.MediaId)
            .HasComment("Optional reference to media asset for visual attribute representation");

        // === PRICING MODIFIERS ===
        builder.Property(av => av.PriceModifier)
            .HasPrecision(18, 4)
            .HasComment("Price adjustment amount when this attribute is selected");

        builder.Property(av => av.PriceModifierType)
            .HasConversion<string>()
            .HasComment("Price modifier calculation method (Fixed amount or Percentage)");

        // === AVAILABILITY AND MANAGEMENT ===
        builder.Property(av => av.IsGloballyAvailable)
            .HasDefaultValue(true)
            .HasComment("Whether this attribute can be reused across multiple products");

        // === PERFORMANCE INDEXES ===

        // Primary lookup index for managing attributes by type.
        builder.HasIndex(av => av.AttributeType).HasDatabaseName("IX_AttributeValues_AttributeType");

        // Ensure unique values per attribute type to prevent duplicates (e.g., cannot have two 'Red' values for 'Color').
        builder.HasIndex(av => new { av.AttributeType, av.Value })
            .IsUnique()
            .HasDatabaseName("IX_AttributeValues_Type_Value_Unique");

        // Index for finding globally available attributes quickly.
        builder.HasIndex(av => av.IsGloballyAvailable)
            .HasDatabaseName("IX_AttributeValues_IsGloballyAvailable")
            .HasFilter("[IsGloballyAvailable] = 1");
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/CartConfiguration.cs ---
/**
 * @file CartConfiguration.cs
 * @Version 3.0.0 (DEFINITIVE & CLEAN)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-08-02
 * @Description The definitive and clean configuration for the CartBase aggregate root.
 *              It centralizes the relationship definition with CartItem and configures
 *              all properties according to best practices.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Cart;

namespace RoyalCode.Infrastructure.Data.Configurations;

/// <summary>
/// Configures the database mapping for the <see cref="CartBase"/> aggregate root.
/// </summary>
public class CartConfiguration : IEntityTypeConfiguration<CartBase>
{
    /// <summary>
    /// Configures the entity properties and relationships.
    /// </summary>
    /// <param name="builder">The builder used to configure the entity type.</param>
    public void Configure(EntityTypeBuilder<CartBase> builder)
    {
        builder.ToTable("Carts");
        builder.HasKey(c => c.Id);

        // Configure TPH (Table-Per-Hierarchy) for potential future cart types.
        builder.HasDiscriminator<string>("CartType").HasValue<Cart>("Standard");

        // Add a unique index on UserId for fast lookups of user carts.
        builder.HasIndex(c => c.UserId).IsUnique();

        // Configure financial properties with explicit precision for data integrity.
        builder.Property(c => c.ShippingCost).HasPrecision(18, 2);
        builder.Property(c => c.TotalDiscountAmount).HasPrecision(18, 2);
        builder.Property(c => c.TotalVatAmount).HasPrecision(18, 2);

        // --- THE ONLY, CENTRAL CONFIGURATION FOR THE RELATIONSHIP ---
        // This defines the one-to-many relationship from Cart to CartItem.
        builder.HasMany(c => c.Items)
               .WithOne(ci => ci.Cart) // Uses the explicit navigation property on CartItem
               .HasForeignKey(ci => ci.CartId)
               .IsRequired() // A CartItem MUST have a Cart
               .OnDelete(DeleteBehavior.Cascade); // Deleting a Cart also deletes its items.

        // Configure EF Core to use the private backing field '_items' to respect encapsulation.
        builder.Navigation(c => c.Items)
               .HasField("_items")
               .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/CartItemConfiguration.cs ---
// --- VERVANG DE HELE CartItemConfiguration.cs MET DIT BLOK ---

/**
 * @file CartItemConfiguration.cs
 * @Version 2.0.0 (Precision Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-05
 * @Description EF Core configuration for the CartItem entity, now with explicit
 *              precision for decimal properties to ensure data integrity.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Cart;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("CartItems");
        builder.HasKey(ci => ci.Id);

        builder.Property(ci => ci.RowVersion).IsRowVersion();

        builder.Property(ci => ci.PricePerItem)
            .HasPrecision(18, 2)
            .IsRequired();
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ConversationConfiguration.cs ---
/**
 * @file ChatConfiguration.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description EF Core configurations for all entities within the Chat bounded context.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Provide EF Core configurations for the new Chat entities.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Enums.Chat;
using RoyalCode.Domain.Entities.Chat;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.ToTable("Conversations");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Type).HasConversion<string>().IsRequired();
        builder.Property(c => c.Title).HasMaxLength(200);

        // Relatie: Een Conversation heeft veel Participants
        builder.HasMany(c => c.Participants)
            .WithOne(p => p.Conversation)
            .HasForeignKey(p => p.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relatie: Een Conversation heeft veel Messages
        builder.HasMany(c => c.Messages)
            .WithOne() // Geen navigatie property terug van Message naar Conversation
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        // Vertel EF Core om de private backing fields te gebruiken
        builder.Navigation(c => c.Participants).HasField("_participants").UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.Navigation(c => c.Messages).HasField("_messages").UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(c => c.LastActivityAt);
    }
}

public class ParticipantConfiguration : IEntityTypeConfiguration<Participant>
{
    public void Configure(EntityTypeBuilder<Participant> builder)
    {
        builder.ToTable("ChatParticipants");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Role).HasConversion<string>().IsRequired();

        // Indexen voor snelle lookups
        builder.HasIndex(p => p.ConversationId);
        builder.HasIndex(p => p.UserId).HasFilter("[UserId] IS NOT NULL");
        builder.HasIndex(p => p.AiPersonaId).HasFilter("[AiPersonaId] IS NOT NULL");

        // Een gebruiker kan maar één keer in een conversatie zitten
        builder.HasIndex(p => new { p.ConversationId, p.UserId }).IsUnique().HasFilter("[UserId] IS NOT NULL");
    }
}

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("ChatMessages");
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Type).HasConversion<string>().IsRequired();
        builder.Property(m => m.Status).HasConversion<string>().IsRequired();

        // Configureer MessageContent als een Owned Type (Value Object)
        builder.OwnsOne(m => m.Content, contentBuilder =>
        {
            contentBuilder.Property(c => c.Text)
                .HasColumnName("Content")
                .IsRequired();
        });

        // Relatie met de zender (Participant)
        builder.HasOne<Participant>()
            .WithMany()
            .HasForeignKey(m => m.SenderParticipantId)
            .OnDelete(DeleteBehavior.Restrict); // Verwijder de zender niet als er berichten zijn

        // Value converter voor de MediaIds collectie (Guid-lijst naar string)
        var guidListComparer = new ValueComparer<IReadOnlyCollection<Guid>>(
            (c1, c2) => (c1 ?? new List<Guid>()).SequenceEqual(c2 ?? new List<Guid>()),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => (IReadOnlyCollection<Guid>)c.ToList());

        builder.Property(m => m.MediaIds)
            .HasConversion(
                v => string.Join(',', v ?? Array.Empty<Guid>()),
                v => string.IsNullOrEmpty(v) ? new List<Guid>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(Guid.Parse).ToList()
            )
            .Metadata.SetValueComparer(guidListComparer);

        builder.HasIndex(m => m.ConversationId);
        builder.HasIndex(m => m.Created);
    }
}

public class AiPersonaConfiguration : IEntityTypeConfiguration<AIPersona>
{
    public void Configure(EntityTypeBuilder<AIPersona> builder)
    {
        builder.ToTable("AiPersonas");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Description).HasMaxLength(1000);
        builder.Property(p => p.ProviderType).HasConversion<string>().IsRequired();
        builder.Property(p => p.ConfigurationJson).HasMaxLength(4000); // Ruimte voor JSON-config

        builder.HasIndex(p => p.Name).IsUnique();
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/CustomAttributeDefinitionConfiguration.cs ---
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class CustomAttributeDefinitionConfiguration : IEntityTypeConfiguration<CustomAttributeDefinition>
{
    public void Configure(EntityTypeBuilder<CustomAttributeDefinition> builder)
    {
        builder.ToTable("CustomAttributeDefinitions");
        builder.HasKey(d => d.Id);
        builder.HasIndex(d => d.Key).IsUnique(); 

        builder.Property(d => d.Key).IsRequired().HasMaxLength(50);
        builder.Property(d => d.NameKeyOrText).IsRequired().HasMaxLength(100);
        builder.Property(d => d.ValueType).HasConversion<string>();
        builder.Property(d => d.UiControlType).HasConversion<string>();
        builder.Property(d => d.Group).HasMaxLength(50);
        builder.Property(d => d.Icon).HasMaxLength(50);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/DigitalProductConfiguration.cs ---
/**
 * @file DigitalProductConfiguration.cs
 * @Version 2.3.0 (SYNTAX FIX)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-29
 * @Description Configuration for DigitalProduct. FIX: Correct syntax for making the
 *              owned 'Pricing' type required.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class DigitalProductConfiguration : IEntityTypeConfiguration<DigitalProduct>
{
    public void Configure(EntityTypeBuilder<DigitalProduct> builder)
    {
        // --- SYNTAX FIX START ---
        builder.OwnsOne(p => p.Pricing, pricingBuilder =>
        {
            pricingBuilder.Property(pr => pr.Price)
                .HasColumnName("Digital_Price")
                .HasPrecision(18, 2);
            pricingBuilder.Property(pr => pr.OriginalPrice)
                .HasColumnName("Digital_OriginalPrice")
                .HasPrecision(18, 2);
        }).Navigation(p => p.Pricing)
          .IsRequired();
        // --- SYNTAX FIX END ---

        builder.OwnsOne(p => p.TaxInfo, taxBuilder =>
        {
            taxBuilder.Property(t => t.VatRatePercent)
                .HasColumnName("Digital_VatRatePercent")
                .HasPrecision(5, 2);
        });

        builder.Property(p => p.DeliveryType)
            .HasConversion<string>();
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/DisplaySpecificationDefinitionConfiguration.cs ---
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class DisplaySpecificationDefinitionConfiguration : IEntityTypeConfiguration<DisplaySpecificationDefinition>
{
    public void Configure(EntityTypeBuilder<DisplaySpecificationDefinition> builder)
    {
        builder.ToTable("DisplaySpecificationDefinitions");
        builder.HasKey(d => d.Id);
        builder.HasIndex(d => d.SpecKey).IsUnique();

        builder.Property(d => d.SpecKey).IsRequired().HasMaxLength(100);
        builder.Property(d => d.LabelKeyOrText).IsRequired().HasMaxLength(255);
        builder.Property(d => d.Icon).HasMaxLength(50);
        builder.Property(d => d.GroupKeyOrText).IsRequired().HasMaxLength(100);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/FeatureRatingKeywordConfiguration.cs ---
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Review;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class FeatureRatingKeywordConfiguration : IEntityTypeConfiguration<FeatureRatingKeyword>
{
    public void Configure(EntityTypeBuilder<FeatureRatingKeyword> builder)
    {
        builder.ToTable("FeatureRatingKeywords"); // Expliciete tabelnaam
        builder.HasKey(k => k.Id);

        builder.Property(k => k.FeatureKey)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(k => k.Keyword)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(k => k.LanguageCode)
            .IsRequired()
            .HasMaxLength(10);

        // Index voor snelle lookups op feature, trefwoord en taal
        builder.HasIndex(k => new { k.FeatureKey, k.Keyword, k.LanguageCode }).IsUnique();
        builder.HasIndex(k => k.FeatureKey);
        builder.HasIndex(k => k.LanguageCode);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ImageMediaConfiguration.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Infrastructure/Data/Configurations/ImageMediaConfiguration.cs ---
/**
 * @file ImageMediaConfiguration.cs
 * @Version 2.1.0 (i18n Property Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description Complete configuration for ImageMedia, pointing to the correct AltTextKeyOrText property.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Enums.Media;

namespace RoyalCode.Infrastructure.Data.Configurations;
public class ImageMediaConfiguration : IEntityTypeConfiguration<ImageMedia>
{
    public void Configure(EntityTypeBuilder<ImageMedia> builder)
    {
        builder.Property(p => p.AiGenerationPrompt).HasMaxLength(2000);
        // FIX: Configureer de juiste property 'AltTextKeyOrText'.
        builder.Property(p => p.AltTextKeyOrText).IsRequired().HasMaxLength(500);
        builder.Property(p => p.SourceType).HasConversion<string>();

        builder.OwnsOne(p => p.OriginalDimensions, dimBuilder =>
        {
            dimBuilder.Property(d => d.Width).HasColumnName("OriginalWidth");
            dimBuilder.Property(d => d.Height).HasColumnName("OriginalHeight");
        });

        builder.HasMany(p => p.Variants)
            .WithOne()
            .HasForeignKey("ImageMediaId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Variants)
               .EnableLazyLoading(false)
               .HasField("_variants");

        var stringListComparer = new ValueComparer<IReadOnlyCollection<string>>(
            (c1, c2) => (c1 ?? new List<string>()).SequenceEqual(c2 ?? new List<string>()),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => (IReadOnlyCollection<string>)c.ToList());

        builder.Property(p => p.DominantColorsHex)
            .HasConversion(
                v => string.Join(',', v ?? Array.Empty<string>()),
                v => string.IsNullOrEmpty(v) ? new List<string>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            )
            .Metadata.SetValueComparer(stringListComparer);
    }
}
// --- EINDE VERVANGING ---
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ImageVariantConfiguration.cs ---
/**
 * @file ImageVariantConfiguration.cs
 * @Version 2.0.0 (Complete)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-29
 * @Description Complete configuration for the ImageVariant entity.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Media;

namespace RoyalCode.Infrastructure.Data.Configurations;
public class ImageVariantConfiguration : IEntityTypeConfiguration<ImageVariant>
{
    public void Configure(EntityTypeBuilder<ImageVariant> builder)
    {
        builder.ToTable("ImageVariants");
        builder.HasKey(v => v.Id);

        builder.Property(v => v.Url).IsRequired();
        builder.Property(v => v.Format).HasMaxLength(10);
        builder.Property(v => v.Purpose).HasMaxLength(50);

        // Index for performance when querying variants for an image
        builder.HasIndex("ImageMediaId");
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/MediaConfiguration.cs ---
// --- VERVANG VOLLEDIG BESTAND src/Infrastructure/Data/Configurations/MediaConfiguration.cs ---
/**
 * @file MediaConfiguration.cs
 * @Version 6.0.0 (i18n Support)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-13
 * @Description Definieert de database mapping voor MediaBase, inclusief TPH
 *              en de nieuwe TitleKeyOrText-property.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Media;
using RoyalCode.Domain.Enums.Media;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class MediaConfiguration : IEntityTypeConfiguration<MediaBase>
{
    public void Configure(EntityTypeBuilder<MediaBase> builder)
    {
        builder.ToTable("Media");

        builder.HasDiscriminator(m => m.Type)
            .HasValue<ImageMedia>(MediaType.Image)
            .HasValue<VideoMedia>(MediaType.Video);

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Url).IsRequired();

        // Configuratie voor de nieuwe i18n-property.
        builder.Property(m => m.TitleKeyOrText).HasMaxLength(255);

        builder.HasMany(p => p.Tags)
               .WithOne()
               .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Tags)
               .EnableLazyLoading(false)
               .HasField("_tags");

        builder.HasIndex(m => m.Type);
        builder.HasIndex(m => m.UploaderUserId);
        builder.HasIndex(m => m.ProcessingStatus);
    }
}
// --- EINDE VERVANGING ---
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/OrderConfiguration.cs ---
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Order;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber).IsRequired().HasMaxLength(50);
        builder.HasIndex(o => o.OrderNumber).IsUnique();

        // --- DE CRUCIALE FIX: Configureer Owned Entity Types ---
        // Vertel EF Core dat PaymentDetails een complex type is dat in de Order tabel hoort.
        builder.OwnsOne(o => o.PaymentDetails, pd =>
        {
            pd.Property(p => p.MethodFriendlyName).HasMaxLength(100);
            pd.Property(p => p.GatewayTransactionId).HasMaxLength(255);
            pd.Property(p => p.PaymentStatus).HasMaxLength(50);
        });

        // Vertel EF Core dat ShippingDetails een complex type is dat in de Order tabel hoort.
        builder.OwnsOne(o => o.ShippingDetails, sd =>
        {
            sd.Property(s => s.MethodName).HasMaxLength(100);
            sd.Property(s => s.Cost).HasPrecision(18, 2);
            sd.Property(s => s.TrackingNumber).HasMaxLength(100);
            sd.Property(s => s.TrackingUrl).HasMaxLength(2048);
        });

        // Vertel EF Core dat AddressSnapshot een complex type is
        builder.OwnsOne(o => o.ShippingAddress);
        builder.OwnsOne(o => o.BillingAddress);
        // --- EINDE VAN DE FIX ---

        // Configureer de relaties met de collecties
        builder.HasMany(o => o.Items).WithOne(oi => oi.Order).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(o => o.Fulfillments).WithOne().HasForeignKey("OrderId").OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(o => o.History).WithOne().HasForeignKey("OrderId").OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(o => o.InternalNotes).WithOne().HasForeignKey("OrderId").OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(o => o.Refunds).WithOne().HasForeignKey("OrderId").OnDelete(DeleteBehavior.Cascade);

        // Configureer decimal precisie voor de financiële velden op de Order zelf
        builder.Property(o => o.SubTotal).HasPrecision(18, 2);
        builder.Property(o => o.ShippingCost).HasPrecision(18, 2);
        builder.Property(o => o.TaxAmount).HasPrecision(18, 2);
        builder.Property(o => o.DiscountAmount).HasPrecision(18, 2);
        builder.Property(o => o.GrandTotal).HasPrecision(18, 2);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/OrderItemConfiguration.cs ---
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Order;
using RoyalCode.Domain.Enums.Product; // Voor ProductType (belangrijk voor HasConversion)

namespace RoyalCode.Infrastructure.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("OrderItems");
        builder.HasKey(oi => oi.Id);

        builder.Property(oi => oi.ProductName).IsRequired().HasMaxLength(255);
        builder.Property(oi => oi.Sku).HasMaxLength(100);
        builder.Property(oi => oi.ProductType).IsRequired().HasConversion<string>();
        builder.Property(oi => oi.PricePerItem).HasPrecision(18, 2).IsRequired();
        builder.Property(oi => oi.ProductImageUrl).HasMaxLength(2048);
        builder.Property(oi => oi.LineTotal).HasPrecision(18, 2).IsRequired(); 
        builder.Property(oi => oi.TaxAmount).HasPrecision(18, 2);
        builder.Property(oi => oi.DiscountAmount).HasPrecision(18, 2);
        builder.Property(oi => oi.VariantInfoJson).HasMaxLength(1000);

        builder.HasIndex(oi => oi.ProductId);
        builder.HasIndex(oi => oi.ProductVariantId);

        builder.HasOne(oi => oi.Order)
           .WithMany(o => o.Items)
           .HasForeignKey(oi => oi.OrderId)
           .IsRequired();

    }

}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/OrderRefundConfiguration.cs ---
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Order;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class OrderRefundConfiguration : IEntityTypeConfiguration<OrderRefund>
{
    public void Configure(EntityTypeBuilder<OrderRefund> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Amount)
               .HasPrecision(18, 2)
               .IsRequired();
        
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/PhysicalProductConfiguration.cs ---
/**
 * @file PhysicalProductConfiguration.cs
 * @Version 2.4.0 (FIXED: AgeRestrictions and DisplaySpecifications as Owned Types)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-29
 * @Description Configures PhysicalProduct. FIX: Correctly configures owned types
 *              like 'Pricing', 'TaxInfo', 'AvailabilityRules', 'AgeRestrictions',
 *              and 'DisplaySpecifications' (as a JSON collection).
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;
public class PhysicalProductConfiguration : IEntityTypeConfiguration<PhysicalProduct>
{
    public void Configure(EntityTypeBuilder<PhysicalProduct> builder)
    {
        // Configure the owned type 'Pricing'
        builder.OwnsOne(p => p.Pricing, pricingBuilder =>
        {
            pricingBuilder.Property(pr => pr.Price)
                .HasColumnName("Price")
                .HasPrecision(18, 2);

            pricingBuilder.Property(pr => pr.OriginalPrice)
                .HasColumnName("OriginalPrice")
                .HasPrecision(18, 2);
        }).Navigation(p => p.Pricing) // Get the navigation entry
          .IsRequired();              // Call IsRequired() on the navigation

        // Configure the owned type 'TaxInfo'
        builder.OwnsOne(p => p.TaxInfo, taxBuilder =>
        {
            taxBuilder.Property(t => t.VatRatePercent)
                .HasColumnName("VatRatePercent")
                .HasPrecision(5, 2);
        });

        // Configure the owned type 'AvailabilityRules'
        builder.OwnsOne(p => p.AvailabilityRules);

        // NEW: Configure the owned type 'AgeRestrictions'
        builder.OwnsOne(p => p.AgeRestrictions, ageBuilder =>
        {
            ageBuilder.Property(ar => ar.MinAge).HasColumnName("Age_MinAge");
            ageBuilder.Property(ar => ar.MaxAge).HasColumnName("Age_MaxAge");
        });
        // Note: .Navigation().IsRequired() is NOT called here because AgeRestrictions is a nullable property (AgeRestrictions?)
        // If it were non-nullable (AgeRestrictions), then IsRequired() would be appropriate.

        builder.OwnsMany(p => p.DisplaySpecifications, dsBuilder =>
        {
            dsBuilder.ToJson(); // Store the collection as a JSON column in the Products table

            // Configure properties within the owned type (optional, but good for clarity/constraints)
            dsBuilder.Property(ds => ds.SpecKey).IsRequired().HasMaxLength(100);
            dsBuilder.Property(ds => ds.LabelKeyOrText).IsRequired().HasMaxLength(255);
            dsBuilder.Property(ds => ds.ValueKeyOrText).IsRequired().HasMaxLength(255);
            dsBuilder.Property(ds => ds.Icon).HasMaxLength(50);
            dsBuilder.Property(ds => ds.GroupKeyOrText).HasMaxLength(100);
            dsBuilder.Property(ds => ds.DisplayOrder);
        });

        // Configure other direct properties of PhysicalProduct
        builder.Property(p => p.StockStatus)
            .HasConversion<string>();
        // CustomAttributesJson is a string on ProductBase and is already configured via value converter or default mapping.
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ProductAttributeAssignmentConfiguration.cs ---
/**
 * @file ProductAttributeAssignmentConfiguration.cs
 * @Version 4.0.0 (Complete & Corrected)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-29
 * @Description Complete and corrected configuration for the ProductAttributeAssignment junction entity.
 */

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;

/// <summary>
/// Configures the ProductAttributeAssignment junction entity, which links a Product to its available AttributeValues.
/// </summary>
public class ProductAttributeAssignmentConfiguration : IEntityTypeConfiguration<ProductAttributeAssignment>
{
    public void Configure(EntityTypeBuilder<ProductAttributeAssignment> builder)
    {
        builder.ToTable("ProductAttributeAssignments");
        builder.HasKey(paa => paa.Id);

        // Configure relationship to Product. Deleting a product also deletes its assignments.
        builder.HasOne(paa => paa.Product)
            .WithMany(p => p.AttributeAssignments)
            .HasForeignKey(paa => paa.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure relationship to AttributeValue. Deleting a shared AttributeValue is restricted if it's in use.
        builder.HasOne(paa => paa.AttributeValue)
            .WithMany() // No inverse navigation property
            .HasForeignKey(paa => paa.AttributeValueId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure override properties for pricing
        builder.Property(paa => paa.PriceModifierOverride)
            .HasPrecision(18, 4);

        builder.Property(paa => paa.PriceModifierTypeOverride)
            .HasConversion<string>();

        builder.Property(paa => paa.SortOrder).IsRequired();
        builder.Property(paa => paa.IsAvailable).IsRequired().HasDefaultValue(true);

        // === PERFORMANCE INDEXES ===

        // Ensure one AttributeValue can only be assigned once per Product.
        builder.HasIndex(paa => new { paa.ProductId, paa.AttributeValueId })
            .IsUnique()
            .HasDatabaseName("IX_ProductAttributeAssignments_ProductId_AttributeValueId_Unique");

        // Index for quickly retrieving assignments for a specific product.
        builder.HasIndex(paa => paa.ProductId).HasDatabaseName("IX_ProductAttributeAssignments_ProductId");
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ProductCategoryConfiguration.cs ---
/**
 * @file ProductCategoryConfiguration.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-02
 * @Description EF Core configuration for the ProductCategory entity.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @PromptSummary Create a category system for products.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class ProductCategoryConfiguration : IEntityTypeConfiguration<ProductCategory>
{
    public void Configure(EntityTypeBuilder<ProductCategory> builder)
    {
        builder.ToTable("Categories"); // Tabelnaam blijft 'Categories' voor continuïteit
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Slug).IsRequired().HasMaxLength(150);
        builder.HasIndex(c => c.Slug).IsUnique();

        // Configureert de hiërarchische relatie (ouder-kind)
        builder.HasOne(c => c.Parent)
               .WithMany(c => c.Children)
               .HasForeignKey(c => c.ParentCategoryId)
               .OnDelete(DeleteBehavior.Restrict); // Voorkom dat een categorie met kinderen wordt verwijderd

        builder.Navigation(c => c.Children)
               .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ProductConfiguration.cs ---
/**
 * @file ProductConfiguration.cs
 * @Version 3.0.0 (Complete & Corrected)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-29
 * @Description Complete and corrected ProductBase configuration with proper navigation setup,
 *              value conversions for collections, and performance indexes.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;

/// <summary>
/// Configures the database mapping for the ProductBase entity.
/// </summary>
public class ProductConfiguration : IEntityTypeConfiguration<ProductBase>
{
    public void Configure(EntityTypeBuilder<ProductBase> builder)
    {
        builder.ToTable("Products");

        // Type-per-hierarchy (TPH) discriminator to distinguish between product types
        builder.HasDiscriminator(p => p.Type)
            .HasValue<PhysicalProduct>(ProductType.Physical)
            .HasValue<DigitalProduct>(ProductType.DigitalProduct)
            .HasValue<VirtualGameItemProduct>(ProductType.VirtualGameItem)
            .HasValue<ServiceProduct>(ProductType.Service);

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(p => p.Description)
            .IsRequired();

        builder.Property(p => p.ShortDescription)
            .HasMaxLength(500);

        builder.Property(p => p.Slug)
            .HasMaxLength(300);

        builder.Property(p => p.Currency)
            .HasMaxLength(3);

        builder.Property(p => p.AppScope)
            .HasMaxLength(50);

        builder.Property(p => p.AverageRating)
            .HasPrecision(3, 2);

        builder.Property(p => p.Status)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(p => p.Type)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(p => p.RowVersion).IsRowVersion();


        // Configure Guid collections (MediaIds, CategoryIds, RelatedProductIds)
        var guidListComparer = new ValueComparer<IReadOnlyCollection<Guid>>(
            (c1, c2) => (c1 ?? new List<Guid>()).SequenceEqual(c2 ?? new List<Guid>()),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => (IReadOnlyCollection<Guid>)c.ToList());

        builder.Property(p => p.MediaIds)
            .HasConversion(
                v => string.Join(',', v ?? Array.Empty<Guid>()),
                v => string.IsNullOrEmpty(v) ? new List<Guid>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(Guid.Parse).ToList()
            )
            .Metadata.SetValueComparer(guidListComparer);

        builder.Property(p => p.CategoryIds)
            .HasConversion(
                v => string.Join(',', v ?? Array.Empty<Guid>()),
                v => string.IsNullOrEmpty(v) ? new List<Guid>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(Guid.Parse).ToList()
            )
            .Metadata.SetValueComparer(guidListComparer);

        builder.Property(p => p.RelatedProductIds)
            .HasConversion(
                v => string.Join(',', v ?? Array.Empty<Guid>()),
                v => string.IsNullOrEmpty(v) ? new List<Guid>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(Guid.Parse).ToList()
            )
            .Metadata.SetValueComparer(guidListComparer);

        // Configure string collection (Tags)
        var stringListComparer = new ValueComparer<IReadOnlyCollection<string>>(
            (c1, c2) => (c1 ?? new List<string>()).SequenceEqual(c2 ?? new List<string>()),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => (IReadOnlyCollection<string>)c.ToList());

        builder.Property(p => p.Tags)
            .HasConversion(
                v => string.Join(',', v ?? Array.Empty<string>()),
                v => string.IsNullOrEmpty(v) ? new List<string>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            )
            .Metadata.SetValueComparer(stringListComparer);

        // Configure navigation properties with proper field backing
        builder.HasMany(p => p.AttributeAssignments)
            .WithOne(paa => paa.Product)
            .HasForeignKey(paa => paa.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.VariantCombinations)
            .WithOne() // No inverse navigation property on ProductVariantCombination
            .HasForeignKey(pvc => pvc.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure navigation property access mode for private fields to allow encapsulation
        builder.Navigation(p => p.AttributeAssignments)
            .EnableLazyLoading(false)
            .HasField("_attributeAssignments");

        builder.Navigation(p => p.VariantCombinations)
            .EnableLazyLoading(false)
            .HasField("_variantCombinations");

        // Add indexes for common query patterns
        builder.HasIndex(p => p.Status).HasDatabaseName("IX_Products_Status");
        builder.HasIndex(p => p.Type).HasDatabaseName("IX_Products_Type");
        builder.HasIndex(p => p.IsActive).HasDatabaseName("IX_Products_IsActive");
        builder.HasIndex(p => p.IsFeatured).HasDatabaseName("IX_Products_IsFeatured");
        builder.HasIndex(p => new { p.Status, p.IsActive }).HasDatabaseName("IX_Products_Status_IsActive");
        builder.HasIndex(p => p.AppScope).HasDatabaseName("IX_Products_AppScope");
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ProductNavigationConfiguration.cs ---
/**
 * @file ProductNavigationConfiguration.cs - STANDALONE
 * @Version 3.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-27
 * @Description Navigation configuration for ProductBase with correct property names.
 */

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;

/// <summary>
/// Navigation configuration for ProductBase with correct property names.
/// </summary>
public class ProductNavigationConfiguration : IEntityTypeConfiguration<ProductBase>
{
    public void Configure(EntityTypeBuilder<ProductBase> builder)
    {
        // Configure AttributeAssignments navigation (correct property name)
        var attributeAssignmentsNavigation = builder.Metadata.FindNavigation(nameof(ProductBase.AttributeAssignments));
        if (attributeAssignmentsNavigation != null)
        {
            attributeAssignmentsNavigation.SetPropertyAccessMode(PropertyAccessMode.Field);
            attributeAssignmentsNavigation.SetField("_attributeAssignments");
        }

        // Configure VariantCombinations navigation
        var variantCombinationsNavigation = builder.Metadata.FindNavigation(nameof(ProductBase.VariantCombinations));
        if (variantCombinationsNavigation != null)
        {
            variantCombinationsNavigation.SetPropertyAccessMode(PropertyAccessMode.Field);
            variantCombinationsNavigation.SetField("_variantCombinations");
        }
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ProductVariantCombinationConfiguration.cs ---
/**
 * @file ProductVariantCombinationConfiguration.cs
 * @Version 4.0.0 (Complete & Corrected)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-29
 * @Description Complete and corrected configuration for ProductVariantCombination,
 *              using value converters for Guid collections and defining all properties.
 */

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;
using RoyalCode.Domain.Enums.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;

/// <summary>
/// Configuration for ProductVariantCombination with correct method calls and value conversions.
/// </summary>
public class ProductVariantCombinationConfiguration : IEntityTypeConfiguration<ProductVariantCombination>
{
    public void Configure(EntityTypeBuilder<ProductVariantCombination> builder)
    {
        builder.ToTable("ProductVariantCombinations");
        builder.HasKey(pvc => pvc.Id);

        // Define the relationship to the parent ProductBase entity.
        // A variant combination cannot exist without a product.
        builder.HasOne<ProductBase>()
            .WithMany(p => p.VariantCombinations)
            .HasForeignKey(pvc => pvc.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Value converter for the collection of Guids representing the attribute combination.
        var guidListComparer = new ValueComparer<IReadOnlyCollection<Guid>>(
            (c1, c2) => (c1 ?? new List<Guid>()).SequenceEqual(c2 ?? new List<Guid>()),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => (IReadOnlyCollection<Guid>)c.ToList());

        builder.Property(pvc => pvc.AttributeValueIds)
            .HasConversion(
                v => string.Join(',', v ?? Array.Empty<Guid>()),
                v => string.IsNullOrEmpty(v) ? new List<Guid>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(Guid.Parse).ToList()
            )
            .Metadata.SetValueComparer(guidListComparer);

        builder.Property(pvc => pvc.MediaIds)
            .HasConversion(
                v => string.Join(',', v ?? Array.Empty<Guid>()),
                v => string.IsNullOrEmpty(v) ? new List<Guid>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(Guid.Parse).ToList()
            )
            .Metadata.SetValueComparer(guidListComparer);

        // Configure other properties
        builder.Property(pvc => pvc.Sku).IsRequired().HasMaxLength(100);
        builder.Property(pvc => pvc.Price).HasPrecision(18, 2);
        builder.Property(pvc => pvc.OriginalPrice).HasPrecision(18, 2);
        builder.Property(pvc => pvc.StockQuantity).HasDefaultValue(0);
        builder.Property(pvc => pvc.StockStatus).HasConversion<string>();
        builder.Property(pvc => pvc.IsActive).IsRequired().HasDefaultValue(true);
        builder.Property(pvc => pvc.IsDefault).IsRequired().HasDefaultValue(false);

        // Optional FK for linked products
        builder.Property(pvc => pvc.LinkedProductId);

        // === PERFORMANCE INDEXES ===
        builder.HasIndex(pvc => pvc.Sku).IsUnique().HasDatabaseName("IX_ProductVariantCombinations_Sku_Unique");
        builder.HasIndex(pvc => pvc.ProductId).HasDatabaseName("IX_ProductVariantCombinations_ProductId");
        builder.HasIndex(pvc => pvc.LinkedProductId).HasDatabaseName("IX_ProductVariantCombinations_LinkedProductId").HasFilter("[LinkedProductId] IS NOT NULL");
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/RefreshTokenConfiguration.cs ---
/**
 * @file RefreshTokenConfiguration.cs
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-05
 * @Description EF Core configuration for the RefreshToken entity.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");
        builder.HasKey(t => t.Id);
        builder.HasOne<RoyalCode.Infrastructure.Identity.ApplicationUser>()
            .WithMany()
            .HasForeignKey(t => t.UserId);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ReviewConfiguration.cs ---
/**
 * @file ReviewConfiguration.cs
 * @Version 4.0.0 (FINAL - No UserProfile, uses AuthorId)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Definitive, clean EF Core configuration for the Review entity, now using AuthorId (Guid) directly.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Review;
using RoyalCode.Domain.Enums.Review;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");
        builder.HasKey(r => r.Id);

        // --- Basic Properties ---
        builder.Property(r => r.AuthorId).IsRequired(); // <-- DE FIX: Directe property
        builder.Property(r => r.Rating).HasPrecision(2, 1);
        builder.Property(r => r.Status).HasConversion<string>().IsRequired();
        builder.Property(r => r.TargetEntityType).HasConversion<string>().IsRequired();
        builder.Property(r => r.ReviewText).IsRequired();

        // --- Value Conversion for Collections (Nullable Columns) ---
        var guidListComparer = new ValueComparer<IReadOnlyCollection<Guid>>(
            (c1, c2) => (c1 ?? new List<Guid>()).SequenceEqual(c2 ?? new List<Guid>()),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => (IReadOnlyCollection<Guid>)c.ToList());

        builder.Property(r => r.MediaIds)
            .HasConversion(
                v => string.Join(',', v ?? Array.Empty<Guid>()),
                v => string.IsNullOrEmpty(v) ? new List<Guid>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(Guid.Parse).ToList()
            )
            .Metadata.SetValueComparer(guidListComparer);

        // --- Relationships ---
        builder.HasMany(r => r.Replies).WithOne().HasForeignKey(rr => rr.ParentReviewId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(r => r.HelpfulVotes).WithOne().HasForeignKey(v => v.ReviewId).OnDelete(DeleteBehavior.Cascade);

        // --- Backing Fields ---
        builder.Navigation(r => r.Replies).HasField("_replies").UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.Navigation(r => r.HelpfulVotes).HasField("_helpfulVotes").UsePropertyAccessMode(PropertyAccessMode.Field);

        // --- Indexes ---
        builder.HasIndex(r => new { r.TargetEntityId, r.TargetEntityType, r.Status }).HasDatabaseName("IX_Reviews_Target_Status");
        builder.HasIndex(r => r.AuthorId).HasDatabaseName("IX_Reviews_AuthorId");
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ReviewHelpfulVoteConfiguration.cs ---
/**
 * @file ReviewHelpfulVoteConfiguration.cs
 * @Version 2.0.0 (FINAL - No Cascade on Votes)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Definitive, clean EF Core configuration for the ReviewHelpfulVote entity, with OnDelete set to NoAction to prevent cycles.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Review;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class ReviewHelpfulVoteConfiguration : IEntityTypeConfiguration<ReviewHelpfulVote>
{
    public void Configure(EntityTypeBuilder<ReviewHelpfulVote> builder)
    {
        builder.ToTable("ReviewHelpfulVotes");
        builder.HasKey(v => v.Id);

        // --- Relationships ---
        // Relatie naar Review
        builder.HasOne<Review>()
            .WithMany(r => r.HelpfulVotes)
            .HasForeignKey(v => v.ReviewId)
            .OnDelete(DeleteBehavior.NoAction); // Cruciaal: NO ACTION om cyclische deletes te voorkomen

        // Relatie naar ReviewReply (indien van toepassing)
        builder.HasOne<ReviewReply>()
            .WithMany(rr => rr.HelpfulVotes)
            .HasForeignKey(v => v.ReviewId) // Let op: ReviewId wordt hier hergebruikt
            .OnDelete(DeleteBehavior.NoAction); // Cruciaal: NO ACTION om cyclische deletes te voorkomen

        // --- Unique Constraints (One vote per user per review/reply) ---
        builder.HasIndex(v => new { v.ReviewId, v.UserId }).IsUnique();
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ReviewHighlightKeywordConfiguration.cs ---
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Review;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class ReviewHighlightKeywordConfiguration : IEntityTypeConfiguration<ReviewHighlightKeyword>
{
    public void Configure(EntityTypeBuilder<ReviewHighlightKeyword> builder)
    {
        builder.ToTable("ReviewHighlightKeywords"); // Expliciete tabelnaam
        builder.HasKey(k => k.Id);

        builder.Property(k => k.Keyword)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(k => k.I18nKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(k => k.LanguageCode)
            .IsRequired()
            .HasMaxLength(10);

        // Index voor snelle lookups op trefwoord en taal
        builder.HasIndex(k => new { k.Keyword, k.LanguageCode }).IsUnique();
        builder.HasIndex(k => k.LanguageCode);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ReviewReplyConfiguration.cs ---
/**
 * @file ReviewReplyConfiguration.cs
 * @Version 3.0.0 (FINAL - No UserProfile, uses AuthorId)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Definitive, clean EF Core configuration for the ReviewReply entity, now using AuthorId (Guid) directly.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Review;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class ReviewReplyConfiguration : IEntityTypeConfiguration<ReviewReply>
{
    public void Configure(EntityTypeBuilder<ReviewReply> builder)
    {
        builder.ToTable("ReviewReplies");
        builder.HasKey(rr => rr.Id);

        // --- Basic Properties ---
        builder.Property(rr => rr.AuthorId).HasColumnName("AuthorId").IsRequired(); // <-- DE FIX: Directe property
        builder.Property(rr => rr.ParentReviewId).IsRequired();
        builder.Property(rr => rr.ReplyText).IsRequired();

        // --- Relationships ---
        builder.HasMany(rr => rr.ChildReplies).WithOne().HasForeignKey(cr => cr.ParentReplyId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(rr => rr.HelpfulVotes).WithOne().HasForeignKey(v => v.ReviewId).OnDelete(DeleteBehavior.Cascade);

        // --- Backing Fields ---
        builder.Navigation(rr => rr.ChildReplies).HasField("_childReplies").UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.Navigation(rr => rr.HelpfulVotes).HasField("_helpfulVotes").UsePropertyAccessMode(PropertyAccessMode.Field);

        // --- Indexes ---
        builder.HasIndex(rr => rr.ParentReviewId);
        builder.HasIndex(rr => rr.AuthorId);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/ServiceProductConfiguration.cs ---
/**
 * @file ServiceProductConfiguration.cs
 * @Version 1.1.0 (SYNTAX FIX)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-29
 * @Description Standalone configuration for ServiceProduct. FIX: Correct syntax for making
 *              the owned 'Pricing' type required.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class ServiceProductConfiguration : IEntityTypeConfiguration<ServiceProduct>
{
    public void Configure(EntityTypeBuilder<ServiceProduct> builder)
    {
        // --- SYNTAX FIX START ---
        builder.OwnsOne(p => p.Pricing, pricingBuilder =>
        {
            pricingBuilder.Property(pr => pr.Price)
                .HasColumnName("Service_Price")
                .HasPrecision(18, 2);
            pricingBuilder.Property(pr => pr.OriginalPrice)
                .HasColumnName("Service_OriginalPrice")
                .HasPrecision(18, 2);
        }).Navigation(p => p.Pricing)
          .IsRequired();
        // --- SYNTAX FIX END ---

        builder.OwnsOne(p => p.TaxInfo, taxBuilder =>
        {
            taxBuilder.Property(t => t.VatRatePercent)
                .HasColumnName("Service_VatRatePercent")
                .HasPrecision(5, 2);
        });

        builder.Property(p => p.BillingCycle)
            .HasConversion<string>();

        builder.Property(p => p.DeliveryMethod)
            .HasConversion<string>();
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/SocialFeedDefinitionConfiguration.cs ---
/**
 * @file SocialFeedDefinitionConfiguration.cs
 * @Version 1.0.0 (FINAL)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description EF Core configuration for the FeedDefinition entity.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Social;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class SocialFeedDefinitionConfiguration : IEntityTypeConfiguration<FeedDefinition>
{
    public void Configure(EntityTypeBuilder<FeedDefinition> builder)
    {
        builder.ToTable("FeedDefinitions");
        builder.HasKey(fd => fd.Id);

        builder.Property(fd => fd.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(fd => fd.Slug)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(fd => fd.Description)
            .HasMaxLength(500);

        builder.Property(fd => fd.IsPublic)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasIndex(fd => fd.Slug).IsUnique();
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/SocialFeedItemConfiguration.cs ---
/**
 * @file SocialFeedItemConfiguration.cs
 * @Version 3.1.0 (FINAL - Clean Architecture Compliant, AuthorId is Guid)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Definitive, clean EF Core configuration for the FeedItem aggregate root, now using AuthorId (Guid) directly.
 */
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Social;
using RoyalCode.Domain.Enums.Social;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class SocialFeedItemConfiguration : IEntityTypeConfiguration<FeedItem>
{
    public void Configure(EntityTypeBuilder<FeedItem> builder)
    {
        builder.ToTable("FeedItems");
        builder.HasKey(fi => fi.Id);

        // --- Basic Properties ---
        builder.Property(fi => fi.FeedId).IsRequired().HasMaxLength(100);
        builder.Property(fi => fi.AuthorId).IsRequired(); // <-- AuthorId is nu een directe Guid FK
        builder.Property(fi => fi.Text).HasMaxLength(4000);
        builder.Property(fi => fi.GifUrl).HasMaxLength(2048);
        builder.Property(fi => fi.ReplyCount).IsRequired().HasDefaultValue(0);
        builder.Property(fi => fi.IsEdited).IsRequired().HasDefaultValue(false);
        builder.Property(fi => fi.IsPinned).IsRequired().HasDefaultValue(false);
        builder.Property(fi => fi.IsHidden).IsRequired().HasDefaultValue(false);
        builder.Property(fi => fi.IsSaved).IsRequired().HasDefaultValue(false);
        builder.Property(fi => fi.IsDeleted).IsRequired().HasDefaultValue(false);
        builder.HasQueryFilter(fi => !fi.IsDeleted);

        // --- Enum with explicit string conversion ---
        builder.Property(fi => fi.Privacy).HasConversion<string>().IsRequired();

        // --- Value Conversion for Collections (Nullable Columns) ---
        ConfigureGuidCollection(builder, fi => fi.MediaIds, "MediaIds");
        ConfigureStringCollection(builder, fi => fi.Tags, "Tags");

        // --- Relationships ---
        // FeedItem heeft een 1-op-veel relatie met FeedReaction
        builder.HasMany(fi => fi.Reactions).WithOne().HasForeignKey(r => r.FeedItemId).OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(fi => fi.Reactions).HasField("_reactions").UsePropertyAccessMode(PropertyAccessMode.Field);

        // --- Indexes ---
        builder.HasIndex(fi => fi.FeedId).HasDatabaseName("IX_FeedItems_FeedId");
        builder.HasIndex(fi => fi.AuthorId).HasDatabaseName("IX_FeedItems_AuthorId"); // Index op AuthorId
        builder.HasIndex(nameof(FeedItem.FeedId), nameof(FeedItem.Created)).HasDatabaseName("IX_FeedItems_FeedId_Created");
    }

    private static void ConfigureGuidCollection<T>(EntityTypeBuilder<T> builder, Expression<Func<T, IReadOnlyCollection<Guid>>> propertyExpression, string propertyName) where T : class
    {
        var comparer = new ValueComparer<IReadOnlyCollection<Guid>>((c1, c2) => (c1 ?? new List<Guid>()).SequenceEqual(c2 ?? new List<Guid>()), c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())), c => c.ToList());
        // --- DE FIX: Sla nooit NULL op, maar een lege string. ---
        builder.Property(propertyExpression).HasColumnName(propertyName).IsRequired(false).HasConversion(
                v => string.Join(',', v ?? Array.Empty<Guid>()), // Converteert naar DB: nooit null
                v => string.IsNullOrEmpty(v) ? new List<Guid>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(Guid.Parse).ToList() // Converteert van DB
            ).Metadata.SetValueComparer(comparer);
    }

    private static void ConfigureStringCollection<T>(EntityTypeBuilder<T> builder, Expression<Func<T, IReadOnlyCollection<string>>> propertyExpression, string propertyName) where T : class
    {
        var comparer = new ValueComparer<IReadOnlyCollection<string>>((c1, c2) => (c1 ?? new List<string>()).SequenceEqual(c2 ?? new List<string>()), c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v == null ? 0 : v.GetHashCode())), c => c.ToList());
        // --- DE FIX: Sla nooit NULL op, maar een lege string. ---
        builder.Property(propertyExpression).HasColumnName(propertyName).IsRequired(false).HasConversion(
                v => string.Join(',', v ?? Array.Empty<string>()), // Converteert naar DB: nooit null
                v => string.IsNullOrEmpty(v) ? new List<string>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() // Converteert van DB
            ).Metadata.SetValueComparer(comparer);
    }

}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/SocialFeedReactionConfiguration.cs ---
/**
 * @file SocialFeedReactionConfiguration.cs
 * @Version 3.1.0 (FINAL - No Cascade on Reactions)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Definitive, clean EF Core configuration for the FeedReaction entity, with OnDelete set to NoAction to prevent cycles.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Social;
using RoyalCode.Domain.Enums.Social;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class SocialFeedReactionConfiguration : IEntityTypeConfiguration<FeedReaction>
{
    public void Configure(EntityTypeBuilder<FeedReaction> builder)
    {
        builder.ToTable("FeedReactions");
        builder.HasKey(r => r.Id);

        // --- Properties & Enum Conversion ---
        builder.Property(r => r.UserId).IsRequired();
        builder.Property(r => r.Type).HasConversion(v => v.ToString().ToLowerInvariant(), v => Enum.Parse<ReactionType>(v, true)).IsRequired().HasMaxLength(20);

        // --- Relationships ---
        builder.HasOne<FeedItem>().WithMany(fi => fi.Reactions).HasForeignKey(r => r.FeedItemId).OnDelete(DeleteBehavior.NoAction).IsRequired(false);
        builder.HasOne<FeedReply>().WithMany(fr => fr.Reactions).HasForeignKey(r => r.FeedReplyId).OnDelete(DeleteBehavior.NoAction).IsRequired(false);

        // --- Unique Constraints & Check Constraint ---
        builder.HasIndex(r => new { r.UserId, r.FeedItemId }).IsUnique().HasFilter("[FeedItemId] IS NOT NULL").HasDatabaseName("IX_FeedReactions_UserId_FeedItemId");
        builder.HasIndex(r => new { r.UserId, r.FeedReplyId }).IsUnique().HasFilter("[FeedReplyId] IS NOT NULL").HasDatabaseName("IX_FeedReactions_UserId_FeedReplyId");
        builder.ToTable(t => t.HasCheckConstraint("CK_FeedReaction_ExclusiveParent", "([FeedItemId] IS NOT NULL AND [FeedReplyId] IS NULL) OR ([FeedItemId] IS NULL AND [FeedReplyId] IS NOT NULL)"));
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/SocialFeedReplyConfiguration.cs ---
/**
 * @file SocialFeedReplyConfiguration.cs
 * @Version 3.0.0 (FINAL - Clean Architecture Compliant)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Definitive, clean EF Core configuration for the FeedReply entity.
 */
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Social;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class SocialFeedReplyConfiguration : IEntityTypeConfiguration<FeedReply>
{
    public void Configure(EntityTypeBuilder<FeedReply> builder)
    {
        builder.ToTable("FeedReplies");
        builder.HasKey(fr => fr.Id);

        // --- Basic Properties ---
        builder.Property(fr => fr.ParentId).IsRequired();
        builder.Property(fr => fr.AuthorId).IsRequired();
        builder.Property(fr => fr.FeedId).IsRequired().HasMaxLength(100);
        builder.Property(fr => fr.IsDeleted).IsRequired().HasDefaultValue(false);
        builder.HasQueryFilter(fr => !fr.IsDeleted);

        // --- Collections ---
        ConfigureGuidCollection(builder, fr => fr.MediaIds, "MediaIds");

        // --- Relationships ---
        builder.HasOne<FeedItem>().WithMany().HasForeignKey(fr => fr.ParentId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(fr => fr.Reactions).WithOne().HasForeignKey(r => r.FeedReplyId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<FeedReply>().WithMany().HasForeignKey(fr => fr.ReplyToReplyId).OnDelete(DeleteBehavior.Restrict);

        builder.Navigation(fr => fr.Reactions).HasField("_reactions").UsePropertyAccessMode(PropertyAccessMode.Field);

        // --- Indexes ---
        builder.HasIndex(fr => fr.ParentId).HasDatabaseName("IX_FeedReplies_ParentId");
        builder.HasIndex(fr => fr.AuthorId).HasDatabaseName("IX_FeedReplies_AuthorId");
        builder.HasIndex(nameof(FeedReply.ParentId), nameof(FeedReply.Created)).HasDatabaseName("IX_FeedReplies_ParentId_Created");
    }

    private static void ConfigureGuidCollection<T>(EntityTypeBuilder<T> builder, Expression<Func<T, IReadOnlyCollection<Guid>>> propertyExpression, string propertyName) where T : class
    {
        var comparer = new ValueComparer<IReadOnlyCollection<Guid>>((c1, c2) => (c1 ?? new List<Guid>()).SequenceEqual(c2 ?? new List<Guid>()), c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())), c => c.ToList());
        builder.Property(propertyExpression).HasColumnName(propertyName).IsRequired(false).HasConversion(
                v => string.Join(',', v ?? Array.Empty<Guid>()), // Converteert naar DB: nooit null
                v => string.IsNullOrEmpty(v) ? new List<Guid>() : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(Guid.Parse).ToList() // Converteert van DB
            ).Metadata.SetValueComparer(comparer);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/TodoItemConfiguration.cs ---
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.ToDo;

namespace RoyalCode.Infrastructure.Data.Configurations;
public class TodoItemConfiguration : IEntityTypeConfiguration<TodoItem>
{
    public void Configure(EntityTypeBuilder<TodoItem> builder)
    {
        builder.Property(t => t.Title)
            .HasMaxLength(200)
            .IsRequired();
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/TodoListConfiguration.cs ---
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.ToDo;

namespace RoyalCode.Infrastructure.Data.Configurations;
public class TodoListConfiguration : IEntityTypeConfiguration<TodoList>
{
    public void Configure(EntityTypeBuilder<TodoList> builder)
    {
        builder.Property(t => t.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder
            .OwnsOne(b => b.Colour);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/VideoMediaConfiguration.cs ---
/**
 * @file VideoMediaConfiguration.cs
 * @Version 2.0.0 (FIXED)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-29
 * @Description Defines the database mapping for the VideoMedia entity,
 *              including precision for the FrameRate decimal property.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Media;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class VideoMediaConfiguration : IEntityTypeConfiguration<VideoMedia>
{
    public void Configure(EntityTypeBuilder<VideoMedia> builder)
    {
        // Configuration for properties that ONLY exist on VideoMedia.
        builder.Property(p => p.PosterImageUrl).HasMaxLength(2048);

        // to avoid SQL truncation warnings and ensure data integrity.
        // Precision 5, Scale 2 allows values up to 999.99 (e.g., 29.97, 59.94).
        builder.Property(p => p.FrameRate)
            .HasPrecision(5, 2);

        builder.Property(p => p.Quality)
            .HasConversion<string>();
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Configurations/VirtualGameItemProductConfiguration.cs ---
/**
 * @file VirtualGameItemProductConfiguration.cs
 * @Version 2.0.0 (FIXED)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-29
 * @Description Configuration for VirtualGameItemProduct entity with correct
 *              precision for owned and JSON-mapped properties.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RoyalCode.Domain.Entities.Product;

namespace RoyalCode.Infrastructure.Data.Configurations;

public class VirtualGameItemProductConfiguration : IEntityTypeConfiguration<VirtualGameItemProduct>
{
    public void Configure(EntityTypeBuilder<VirtualGameItemProduct> builder)
    {
        // Configure the owned type 'Properties'
        builder.OwnsOne(p => p.Properties, propsBuilder =>
        {
            propsBuilder.Property(vip => vip.ItemCategory).HasMaxLength(100);
            propsBuilder.Property(vip => vip.Rarity).HasMaxLength(50);
            propsBuilder.Property(vip => vip.EquipmentSlot).HasMaxLength(50);
            // StatBoostsJson is a string, no special config needed
        });

        // Configure the collection of InGameCurrencyPrice, stored as JSON in a single column.
        builder.OwnsMany(p => p.PriceInGameCurrency, priceBuilder =>
        {
            priceBuilder.ToJson();

            // FIX: Specify precision for the decimal property inside the JSON-owned type.
            priceBuilder.Property(igc => igc.Amount)
                .HasPrecision(18, 2);
        });

        // Configure the direct property 'PriceRealMoney'
        builder.Property(p => p.PriceRealMoney)
            .HasPrecision(18, 2);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Interceptors/AuditableEntityInterceptor.cs ---
/**
 * @file AuditableEntityInterceptor.cs
 * @Version 4.0.0 (Final & Robust)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-23
 * @Description Correctly intercepts and applies audit properties using the IAuditableEntity interface,
 *              ensuring it works for all auditable entities regardless of key type.
 */
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using RoyalCode.Application.Common.Interfaces;
using RoyalCode.Domain.Common; // <-- Belangrijke using

namespace RoyalCode.Infrastructure.Data.Interceptors;

public class AuditableEntityInterceptor : SaveChangesInterceptor
{
    private readonly IUser _user;
    private readonly TimeProvider _dateTime;

    public AuditableEntityInterceptor(IUser user, TimeProvider dateTime)
    {
        _user = user;
        _dateTime = dateTime;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public void UpdateEntities(DbContext? context)
    {
        if (context == null) return;

        // Zoek naar alle entiteiten die de IAuditableEntity interface implementeren.
        var auditableEntries = context.ChangeTracker.Entries<IAuditableEntity>();

        foreach (var entry in auditableEntries)
        {
            if (entry.State is not (EntityState.Added or EntityState.Modified) && !entry.HasChangedOwnedEntities())
            {
                continue;
            }

            var utcNow = _dateTime.GetUtcNow();
            var userId = _user.Id?.ToString(); // IUser.Id is Guid?, we maken er een string van.

            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedBy = userId;
                entry.Entity.Created = utcNow;
            }

            entry.Entity.LastModifiedBy = userId;
            entry.Entity.LastModified = utcNow;
        }
    }
}

public static class Extensions
{
    public static bool HasChangedOwnedEntities(this EntityEntry entry) =>
        entry.References.Any(r =>
            r.TargetEntry != null &&
            r.TargetEntry.Metadata.IsOwned() &&
            r.TargetEntry.State is EntityState.Added or EntityState.Modified);
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/Interceptors/DispatchDomainEventsInterceptor.cs ---
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using RoyalCode.Domain.Common;

namespace RoyalCode.Infrastructure.Data.Interceptors;
public class DispatchDomainEventsInterceptor : SaveChangesInterceptor
{
    private readonly IMediator _mediator;

    public DispatchDomainEventsInterceptor(IMediator mediator)
    {
        _mediator = mediator;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        DispatchDomainEvents(eventData.Context).GetAwaiter().GetResult();

        return base.SavingChanges(eventData, result);

    }

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        await DispatchDomainEvents(eventData.Context);

        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public async Task DispatchDomainEvents(DbContext? context)
    {
        if (context == null) return;

        // Get all entities that have domain events using the clean interface approach
        var entities = context.ChangeTracker
            .Entries<IHasDomainEvents>()
            .Where(e => e.Entity.DomainEvents.Any())
            .Select(e => e.Entity);

        var domainEvents = entities
            .SelectMany(e => e.DomainEvents)
            .ToList();

        // Clear domain events from all entities
        entities.ToList().ForEach(e => e.ClearDomainEvents());

        // Publish all domain events
        foreach (var domainEvent in domainEvents)
            await _mediator.Publish(domainEvent);
    }
}
--- END OF FILE ---

--- START OF FILE src/Infrastructure/Data/SeedingConstants.cs ---
namespace RoyalCode.Infrastructure.Data;
public static class SeedingConstants
{
    public static readonly string AdminUserId = "a18be9c0-aa65-4af8-9747-52d95b890e79";
    public static readonly string DefaultUserId = "d860efca-22d9-47fd-8249-7fad7c546a08";
    public static readonly Guid ProductFuzzyTheBearId = Guid.Parse("20000000-0000-0000-0000-000000000001");
    public static readonly Guid ProductSparkleTheUnicornId = Guid.Parse("20000000-0000-0000-0000-000000000002");
    public static readonly Guid ProductScalyTheDragonId = Guid.Parse("20000000-0000-0000-0000-000000000003");
    public static readonly Guid ImageFuzzyBear1 = Guid.Parse("30000000-0000-0000-0000-000000000001");
    public static readonly Guid ImageFuzzyBear2 = Guid.Parse("30000000-0000-0000-0000-000000000002");
    public static readonly Guid ImageSparkleUnicorn1 = Guid.Parse("30000000-0000-0000-0000-000000000011");
    public static readonly Guid ImageScalyDragon1 = Guid.Parse("30000000-0000-0000-0000-000000000021");
    public static readonly Guid ReviewForFuzzyBear = Guid.Parse("40000000-0000-0000-0000-000000000001");
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

