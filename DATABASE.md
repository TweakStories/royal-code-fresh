# Backend Models and Configurations

# Challenger Entities

## Directory: Entities

## Directory: Entities\Challanger

## Directory: Entities\Challanger\NewFolder

## Directory: Entities\Challenger

## Directory: Entities\Challenger\Account

File: Entities\Challenger\Account\EmergencyContact.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Account;
public class EmergencyContact : BaseAuditableEntity
{
    public required Guid UserId { get; set; }
    public required string ContactName { get; set; }
    public required string ContactNumber { get; set; }

    
    public required virtual User User { get; set; }
}


File: Entities\Challenger\Account\UserAchievement.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Account;
public class UserAchievement : BaseEntity
{
    public required Guid UserId { get; set; }

    public required Guid AchievementId { get; set; }

    public required DateTimeOffset DateEarned { get; set; }

    
    public required virtual User User { get; set; }

    public required virtual Achievement Achievement { get; set; }
}


File: Entities\Challenger\Account\UserDashboardSettings.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Account;
public class UserDashboardSettings : BaseAuditableEntity  
{
    public required Guid UserId { get; set; }  

    public string? PreferredMetrics { get; set; }  

    public bool IsDarkModeEnabled { get; set; }  

    public required string LayoutPreferences { get; set; }  

    
    public virtual User? User { get; set; }  
}


File: Entities\Challenger\Account\UserGoal.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Account;
public class UserGoal : BaseAuditableEntity  
{
    public Guid UserId { get; set; }  

    public required string Title { get; set; }  

    public string? Description { get; set; }  

    public bool IsCompleted { get; set; }  

    public required DateTimeOffset StartDate { get; set; }  

    public required DateTimeOffset EndDate { get; set; }  

    public double Progress { get; set; }  

    
    public virtual User? User { get; set; }  
}


File: Entities\Challenger\Account\UserReward.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Account;
public class UserReward : BaseEntity
{
    public required Guid UserId { get; set; }

    public required Guid RewardId { get; set; }

    public DateTimeOffset DateEarned { get; set; }

    public DateTimeOffset? DateRedeemed { get; set; }

    public RewardStatus Status { get; set; } = RewardStatus.Unapproved; 

    
    public virtual required User User { get; set; }

    public virtual required Reward Reward { get; set; }
}


File: Entities\Challenger\Account\UserStats.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Account;
public class UserStats : BaseEntity
{
    public required Guid UserId { get; set; }

    public double TotalDistance { get; set; } = 0;

    public int TotalSteps { get; set; } = 0;

    public int TotalCaloriesBurned { get; set; } = 0;

    public int MaxHeartRate { get; set; } = 0;

    public double AverageHeartRate { get; set; } = 0;

    
    public virtual User? User { get; set; }
}


## Directory: Entities\Challenger\Analytics

File: Entities\Challenger\Analytics\AnalyticsData.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Analytics;

public class AnalyticsData : BaseAuditableEntity
{
    public Guid UserId { get; set; }
    public Guid ChallengeId { get; set; }
    public DateTimeOffset ActivityDate { get; set; }
    public int EngagementScore { get; set; }
    public decimal CarbonReduction { get; set; }

    
    public User? User { get; set; } 
    public Challenges.Challenge? Challenge { get; set; } 
}


## Directory: Entities\Challenger\Challenges

File: Entities\Challenger\Challenges\Challenge.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;

public class Challenge : BaseAuditableEntity
{
    public required string Title { get; set; } = string.Empty;

    public required string Description { get; set; } = string.Empty;

    public required Guid DifficultyLevelId { get; set; }

    public required Guid LocationId { get; set; }

    public required Guid CreatorUserId { get; set; }

    public Guid? TemplateId { get; set; } 

    public DateTimeOffset StartDate { get; set; }

    public DateTimeOffset EndDate { get; set; }

    public ChallengeStatus Status { get; set; }

    public PrivacyLevel Privacy { get; set; } = PrivacyLevel.Private;

    public int MaxParticipants { get; set; }

    public string CoverImageUrl { get; set; } = string.Empty;

    public string CardTitle { get; set; } = string.Empty;

    public string CardSummary { get; set; } = string.Empty;

    
    public virtual ChallengeRoute ? Route { get; set; } 

    public virtual required User CreatorUser { get; set; }

    public virtual Template? Template { get; set; } 

    public virtual required Location Location { get; set; }

    public virtual required DifficultyLevel DifficultyLevel { get; set; }

    public virtual ICollection<AnalyticsData>? AnalyticsData { get; set; }

    public virtual ICollection<StatsRequirement>? StatsRequirements { get; set; }

    public virtual ICollection<ChallengeComponent>? ChallengeComponents { get; set; }

    public virtual ICollection<Tag>? Tags { get; set; }

    public virtual ICollection<PerformanceMetric>? PerformanceMetrics { get; set; }

    public virtual ICollection<ChallengeReview>? Reviews { get; set; }

    public virtual ICollection<Rule>? Rules { get; set; }

    public virtual ICollection<Reward>? Rewards { get; set; }

    public virtual ICollection<SocialEngagement>? SocialEngagements { get; set; }

    public virtual ICollection<EnvironmentRequirement>? EnvironmentRequirements { get; set; }

    public virtual ICollection<EquipmentRequirement>? EquipmentRequirements { get; set; }

    public virtual ICollection<ModeOfCompletionRequirement>? ModeOfCompletionRequirements { get; set; }

    public virtual ICollection<ChallengeParticipation>? ChallengeParticipations { get; set; }
}


File: Entities\Challenger\Challenges\ChallengeComment.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class ChallengeComment : Comment
{

}


File: Entities\Challenger\Challenges\ChallengeParticipation.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class ChallengeParticipation : BaseAuditableEntity
{
    public Guid ChallengeId { get; set; }

    public Guid UserId { get; set; }

    public DateTimeOffset JoinedOn { get; set; }

    public required StatusType Status { get; set; } 

    public double ProgressPercentage { get; set; }

    
    public virtual required UserRouteProgress RouteProgress { get; set; }
    public virtual Challenge? Challenge { get; set; }
    public virtual User? User { get; set; }
    public virtual ICollection<ProgressUpdate>? ProgressUpdates { get; set; }
}


File: Entities\Challenger\Challenges\ChallengeReview.cs
﻿

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class ChallengeReview : Review
{
    public required Guid ChallengeId { get; set; }
    public required Guid UserId { get; set; }

    public required Challenge Challenge { get; set; }
    public required User User { get; set; }
}


File: Entities\Challenger\Challenges\DifficultyLevel.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class DifficultyLevel : BaseEntity
{
    public required string LevelName { get; set; }  

    public string? Description { get; set; }  

    public string? PhysicalRequirements { get; set; }  

    public string? MentalRequirements { get; set; }  

    public string? TimeCommitment { get; set; }  

    public string? RecommendedPreparation { get; set; }  

    public string? Rewards { get; set; }  

    
    public virtual ICollection<Challenge>? Challenges { get; set; }  
}


File: Entities\Challenger\Challenges\Environment.cs
﻿namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class Environment : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public string Description { get; set; } = string.Empty;

    
    public virtual Environment? Parent { get; set; }
    public virtual ICollection<Environment>? Children { get; set; }
    public virtual ICollection<EnvironmentRequirement>? EnvironmentRequirements { get; set; } 
}


File: Entities\Challenger\Challenges\EnvironmentRequirement.cs
﻿

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class EnvironmentRequirement : BaseAuditableEntity
{
    public Guid ChallengeId { get; set; }
    public Guid EnvironmentId { get; set; }

    
    public virtual Challenge? Challenge { get; set; }
    public virtual Environment? Environment { get; set; }
}


File: Entities\Challenger\Challenges\Equipment.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class Equipment : BaseAuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    
    public virtual ICollection<EquipmentRequirement>? EquipmentRequirements { get; set; }
}


File: Entities\Challenger\Challenges\EquipmentRequirement.cs
﻿

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class EquipmentRequirement : BaseAuditableEntity
{
    public Guid ChallengeId { get; set; }
    public Guid EquipmentId { get; set; }

    
    public virtual Challenge? Challenge { get; set; }
    public virtual Equipment? Equipment { get; set; }
}


File: Entities\Challenger\Challenges\ModeOfCompletion.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class ModeOfCompletion : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public string Description { get; set; } = string.Empty;

    
    public virtual ModeOfCompletion? Parent { get; set; }
    public virtual ICollection<ModeOfCompletion>? Children { get; set; }
    public virtual ICollection<ModeOfCompletionRequirement>? ModeOfCompletionRequirements { get; set; }
}


File: Entities\Challenger\Challenges\ModeOfCompletionRequirement.cs
﻿

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class ModeOfCompletionRequirement : BaseAuditableEntity
{
    public required Guid ChallengeId { get; set; }
    public required Guid ModeOfCompletionId { get; set; }

    
    public virtual required Challenge Challenge { get; set; }
    public virtual required ModeOfCompletion ModeOfCompletion { get; set; }
}


File: Entities\Challenger\Challenges\Party.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class Party : BaseAuditableEntity
{
    public string PartyName { get; set; } = string.Empty;

    
    public ICollection<User> Users { get; set; } = new List<User>();

    
    public Guid ChallengeId { get; set; }
    public Challenge Challenge { get; set; } = null!;
}


File: Entities\Challenger\Challenges\Rule.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class Rule : BaseAuditableEntity  
{
    public Guid ChallengeId { get; set; }  

    public required string Description { get; set; }  

    public int Order { get; set; }  

    
    public virtual Challenge? Challenge { get; set; }  
}


File: Entities\Challenger\Challenges\StatsRequirement.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Challenges;
public class StatsRequirement : BaseAuditableEntity
{
    public required string Category { get; set; }  

    public string? LevelName { get; set; }  

    public string? Description { get; set; }  

    
    public virtual ICollection<Challenge>? Challenges { get; set; }  
}


## Directory: Entities\Challenger\Locations

File: Entities\Challenger\Locations\Location.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Locations;
public class Location : BaseAuditableEntity
{
    public required Point Coordinate { get; set; }
    public string? Address { get; set; }

    
    public ICollection<Challenges.Challenge>? Challenges { get; set; }
    public ICollection<RouteNode>? RouteNodes { get; set; }
}


## Directory: Entities\Challenger\Performance

File: Entities\Challenger\Performance\PerformanceMetric.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Performance;

public class PerformanceMetric : BaseAuditableEntity
{
    public Guid UserId { get; set; }
    
    public Guid ChallengeId { get; set; }
    
    public decimal TimeTakenSeconds { get; set; }  

    public decimal DistanceCoveredMeters { get; set; }  

    public decimal AverageSpeedMetersPerSecond { get; set; }  

    public decimal CaloriesBurned { get; set; }  

    public decimal ElevationGainMeters { get; set; }  

    public int AverageHeartRate { get; set; }  

    public int MaxHeartRate { get; set; }  

    public int StepsCount { get; set; }  

    public bool IsCompleted { get; set; } = false;  

    public string? Outcome { get; set; }  

    public decimal TotalDistanceMeters { get; set; }  

    public string? EncodedRouteData { get; set; }  

    
    public decimal PaceSecondsPerKilometer { get; set; }

    public decimal? HydrationLevel { get; set; }  

    public string? WeatherConditions { get; set; }  

    public string? DeviceUsed { get; set; }  

    public string? LocationCoordinates { get; set; }  

    public int FatigueLevel { get; set; } = 0;  

    public int SleepQualityBeforeActivity { get; set; } = 0;  

    public string? SurfaceType { get; set; }  

    public decimal? HeartRateVariability { get; set; }  


    
    public virtual required User User { get; set; }
    public virtual required Challenge Challenge { get; set; }
}


File: Entities\Challenger\Performance\ProgressUpdate.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Metrics;
public class ProgressUpdate : BaseAuditableEntity 
{
    public Guid ChallengeParticipationId { get; set; }  

    public decimal ProgressPercentage { get; set; }  

    public string? Notes { get; set; }  

    
    public virtual ChallengeParticipation? ChallengeParticipation { get; set; }  
}


## Directory: Entities\Challenger\Progress

File: Entities\Challenger\Progress\UserRouteProgress.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Progress;
public class UserRouteProgress : BaseAuditableEntity
{
    public required Guid ChallengeParticipationId { get; set; }
    public Guid? CurrentRouteNodeId { get; set; }
    public required Guid UserId { get; set; }

    public decimal ProgressPercentage { get; set; }
    public bool IsCompleted { get; set; }
    public LineString? Route { get; set; } 


    
    public virtual ChallengeParticipation? Participation { get; set; }
    public virtual RouteNode? CurrentRouteNode { get; set; }
    public virtual required User User { get; set; }
}


## Directory: Entities\Challenger\Ranking

File: Entities\Challenger\Ranking\Achievement.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Ranking;
public class Achievement : BaseAuditableEntity
{
    public required string Title { get; set; }

    public required string Description { get; set; }

    public required string CriteriaType { get; set; } 

    public required string CriteriaData { get; set; } 

    public string? BadgeImageUrl { get; set; }

    
    public virtual ICollection<UserAchievement>? UserAchievements { get; set; }
}


File: Entities\Challenger\Ranking\LeaderboardEntry.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Ranking;
public class LeaderboardEntry : BaseEntity
{
    public Guid ChallengeId { get; set; }

    public Guid UserId { get; set; }

    public int Rank { get; set; }

    public double Score { get; set; }

    
    public virtual Challenges.Challenge? Challenge { get; set; }

    public virtual User? User { get; set; }
}


File: Entities\Challenger\Ranking\Reward.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Ranking;
public class Reward : BaseAuditableEntity
{
    public required Guid ChallengeId { get; set; }
    public required string Title { get; set; }

    public required string Description { get; set; }

    public RewardType Type { get; set; } = RewardType.Points; 
   
    public RewardStatus Status { get; set; } = RewardStatus.Unapproved; 

    public required string Value { get; set; }

    public CurrencyType? CurrencyType { get; set; } 

    public DateTimeOffset? ExpirationDate { get; set; }

    
    public virtual required Challenge Challenge { get; set; }
   
    public virtual ICollection<UserReward>? UserRewards { get; set; }
    
    public virtual ICollection<RouteNode>? RouteNodes { get; set; }
}


## Directory: Entities\Challenger\Routes

File: Entities\Challenger\Routes\ChallengeRoute.cs
﻿


namespace RoyalCode.Domain.Challenger.Entities.Challenger.Routes;
public class ChallengeRoute : BaseAuditableEntity
{
    public Guid ChallengeId { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal TotalDistanceMeters { get; set; }

    
    public virtual Challenge Challenge { get; set; } = null!;
    public virtual ICollection<RouteNode>? RouteNodes { get; set; }
}


File: Entities\Challenger\Routes\RouteNode.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Routes;

public class RouteNode : BaseAuditableEntity
{
    public Guid ChallengeRouteId { get; set; }
    public Guid LocationId { get; set; }
    public int SequenceNumber { get; set; }
    public RouteNodeType Type { get; set; }
    public required string Content { get; set; }
    public Guid? RewardId { get; set; }

    public virtual required ChallengeRoute ChallengeRoute { get; set; }
    public virtual required Location Location { get; set; }
    public virtual Reward? Reward { get; set; }

}


## Directory: Entities\Challenger\Stats

File: Entities\Challenger\Stats\HealthIntegration.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Stats;
public class HealthIntegration : BaseAuditableEntity  
{
    public Guid UserId { get; set; }  

    public required string IntegrationName { get; set; }  

    public required string AccessToken { get; set; }  

    public DateTimeOffset TokenExpiry { get; set; }  

    public string? ExternalUserId { get; set; }  

    
    public virtual User? User { get; set; }  
}


File: Entities\Challenger\Stats\UserHealthMetric.cs
﻿

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Stats;
public class UserHealthMetric : BaseAuditableEntity
{
    public Guid UserId { get; set; }  

    public DateTimeOffset Timestamp { get; set; }  

    public ActivityType ActivityType { get; set; }  

    public double Value { get; set; }  

    
    public virtual User? User { get; set; }  
}


## Directory: Entities\Challenger\Templates

File: Entities\Challenger\Templates\ChallengeComponent.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Templates;
public class ChallengeComponent : BaseEntity
{
    public required Guid ChallengeId { get; set; }
    public required Guid ComponentId { get; set; }
    public int SequenceNumber { get; set; }
    public required string Settings { get; set; }

    
    public virtual required Challenge Challenge { get; set; }
    public virtual required Component Component { get; set; } 
}


File: Entities\Challenger\Templates\Component.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Templates;
public class Component : BaseEntity
{
    public required string Title { get; set; }
    public ComponentType Type { get; set; }
    public required string DefaultSettings { get; set; }

    
    public virtual ICollection<ChallengeComponent> ChallengeComponents { get; set; } = new List<ChallengeComponent>();
    public virtual ICollection<TemplateComponent> TemplateComponents { get; set; } = new List<TemplateComponent>();
}


File: Entities\Challenger\Templates\Template.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Templates;
public class Template : BaseAuditableEntity
{
    public required string Name { get; set; }

    public required string Description { get; set; }

    
    public virtual ICollection<TemplateComponent> TemplateComponents { get; set; } = new List<TemplateComponent>();
    public virtual ICollection<Challenge>? Challenges { get; set; }
}


File: Entities\Challenger\Templates\TemplateChallenge.cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Templates;
public class TemplateChallenge : BaseAuditableEntity
{
    public required string Name { get; set; }

    public required string Description { get; set; }

    
    public virtual ICollection<TemplateComponent> TemplateComponents { get; set; } = new List<TemplateComponent>();
}


File: Entities\Challenger\Templates\TemplateComponent .cs

namespace RoyalCode.Domain.Challenger.Entities.Challenger.Templates;
public class TemplateComponent : BaseEntity
{
    public required Guid TemplateId { get; set; }

    public required Guid ComponentId { get; set; }

    public int SequenceNumber { get; set; }

    public required string Settings { get; set; }

    
    public virtual required Template Template { get; set; }

    public virtual required Component Component { get; set; }
}


## Directory: Entities\Currency

File: Entities\Currency\Currency.cs
﻿
namespace RoyalCode.Domain.Challenger.Entities.Currency;
public class Currency : BaseAuditableEntity
{
    public Guid WalletId { get; set; }
    public Wallet Wallet { get; set; } = null!;
    public int Amount { get; set; }
}


File: Entities\Currency\CurrencyTransaction.cs

namespace RoyalCode.Domain.Challenger.Entities.Currency;
public class CurrencyTransaction : BaseAuditableEntity
{
    public Guid WalletId { get; set; }
    public Wallet Wallet { get; set; } = null!;
    public TransactionType Type { get; set; }  
    public int Amount { get; set; }  
    public string Description { get; set; } = string.Empty;  
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;  
}


File: Entities\Currency\Wallet.cs

namespace RoyalCode.Domain.Challenger.Entities.Currency;
public class Wallet : BaseAuditableEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public WalletType Type { get; set; }
    public ICollection<Currency> Currencies { get; set; } = new List<Currency>();
    public ICollection<CurrencyTransaction> Transactions { get; set; } = new List<CurrencyTransaction>();  
}


## Directory: Entities\Socials

## Directory: Enums

File: Enums\ActivityType.cs
﻿
namespace RoyalCode.Domain.Challenger.Enums;
public enum ActivityType
{
    Walking,
    Running,
    Cycling,
    Swimming,
    Yoga,
    Weightlifting,
    CrossFit,
    Pilates,
    Zumba,
    Aerobics,
    Dance,
    MartialArts,
    Other
}


File: Enums\Challenge.cs
﻿
namespace RoyalCode.Domain.Challenger.Enums;
public enum ChallengeStatus
{
    Upcoming,
    Active,
    Completed
}








File: Enums\ComponentType.cs
﻿
namespace RoyalCode.Domain.Challenger.Enums;
public enum ComponentType
{
    TextBlock,
    Image,
    Video,
    ActivityTracker,
    ProgressBar,
    
}


File: Enums\CurrencyType.cs

namespace RoyalCode.Domain.Challenger.Enums;
public enum CurrencyType
{
    USD,
    EUR,
    GBP,
    JPY,
    AUD,
    CAD,
}


File: Enums\EngagementType.cs
﻿
namespace RoyalCode.Domain.Challenger.Enums;
public enum EngagementType
{
    Like,
    Share,
    Comment,
    Follow,
    Participate
}


File: Enums\PrivacyLevel.cs
﻿
namespace RoyalCode.Domain.Challenger.Enums;
public enum PrivacyLevel
{
    Public,
    Private
}


File: Enums\RewardStatus.cs
﻿

namespace RoyalCode.Domain.Challenger.Enums;
public enum RewardStatus
{
    Earned,
    Unredeemed,
    Redeemed,
    Expired,
    Cancelled,
    Pending,
    Approved,
    Rejected,
    Deleted,
    Completed,
    InProgress,
    Inactive,
    Active,
    Unapproved,
}


File: Enums\RewardType.cs
﻿
namespace RoyalCode.Domain.Challenger.Enums;
public enum RewardType
{
    Points,
    Badge,
    Currency,
    Voucher,
    Other
}


File: Enums\RouteNodeType.cs
﻿
namespace RoyalCode.Domain.Challenger.Enums;
public enum RouteNodeType
{
    Start,
    Checkpoint,
    Reward,
    End
}


File: Enums\ShopTypes.cs
﻿namespace RoyalCode.Domain.Challenger.Enums;
public enum ShopTypes
{
    Alchemist,      
    Blacksmith,     
    Armory,         
    Jewelers,       
    GeneralStore,   
    Apothecary,     
    MagicShop,      
    Bookstore,      
    PetStore,       
    Tailor,         
    Forge,          
    Bakery,         
    Tavern,         
    CuriosityShop,  
    Weaponsmith,    
    Stable,         
    ArtisansGuild,  
    Enchanter,      
    Armorer,        
    Florist,        
    MercenaryPost,  
    TailorsGuild,   
    TradePost,      
    PotionShop,     
    HuntingLodge,   
    GemstoneMerchant 

}


File: Enums\StatusType.cs
﻿
namespace RoyalCode.Domain.Challenger.Enums;
public enum StatusType
{
    Active,
    Inactive,
    Deleted,
    Pending,
    Approved,
    Rejected,
    Completed,
    Cancelled,
    Draft,
}


File: Enums\TransactionType.cs

namespace RoyalCode.Domain.Challenger.Enums;
public enum TransactionType
{
    Earned,
    Spent,
    Transferred
}


File: Enums\WalletType.cs

namespace RoyalCode.Domain.Challenger.Enums;
public enum WalletType
{
    InGameCurrency,  
    EcoRewards,      
    ChallengePoints, 
    GreenPoints,     
    EventTokens,     
    AchievementPoints, 
    Pearls        
}


# Shop Entities

## Directory: Entities

File: Entities\Brand.cs

namespace RoyalCode.Domain.Shop.Entities;
public class Brand : BaseAuditableEntity  
{
    public required string Name { get; set; }  

    public string? Description { get; set; }  

    public Guid ImageId { get; set; }  

    
    public virtual Image? Image { get; set; }  

    public virtual ICollection<Product>? Products { get; set; }  
}


File: Entities\Product.cs

namespace RoyalCode.Domain.Shop.Entities;
public class Product : BaseAuditableEntity  
{
    public required string Title { get; set; }  

    public required string Description { get; set; }  

    public required string SKU { get; set; }  

    public required decimal Price { get; set; }  

    public decimal? DiscountedPrice { get; set; }  

    public int StockQuantity { get; set; }  

    public required string AvailabilityStatus { get; set; }  

    public decimal ShippingWeight { get; set; }  

    public required string ShippingDimensions { get; set; }  

    public Guid BrandId { get; set; }  

    public Guid ImageMainId { get; set; }  

    public Guid SEOId { get; set; }  

    public Guid ShippingId { get; set; }  

    public Guid? ParentProductId { get; set; }  

    public virtual Brand? Brand { get; set; }  

    public virtual ProductImage? ImageMain { get; set; }  

    public virtual SEO? SEO { get; set; }  

    public virtual Shipping? Shipping { get; set; }  

    public virtual Product? ParentProduct { get; set; }  

    public virtual ICollection<Product>? Children { get; set; }  

    public virtual ICollection<ShopReview>? ShopReviews { get; set; }  

    public virtual ICollection<ProductReview>? ProductReviews { get; set; }  

    public virtual ICollection<Tag>? Tags { get; set; }  

    public virtual ICollection<ProductCategory>? ProductCategories { get; set; }  

    public virtual ICollection<ProductImage>? ImageGallery { get; set; }  

    public virtual ICollection<Feature>? Features { get; set; }  
}




File: Entities\ProductCategory.cs
﻿
namespace RoyalCode.Domain.Shop.Entities;
public class ProductCategory : BaseAuditableEntity
{
    public required Guid ProductId { get; set; }
    public virtual required Product Product { get; set; }

    public required Guid CategoryId { get; set; }
    public virtual required Category Category { get; set; }
}



File: Entities\ProductImage.cs

namespace RoyalCode.Infrastructure.Data.Configurations.MarketPlace;
public class ProductImage : Image  
{
    public Guid ProductId { get; set; }  

    
    public virtual Product? Product { get; set; }  
}


File: Entities\ProductReview.cs

namespace RoyalCode.Domain.Shop.Entities;

public class ProductReview : Review
{
    public required Guid ProductId { get; set; }
    public required Product Product { get; set; }
}


File: Entities\Shipping.cs

namespace RoyalCode.Domain.Shop.Entities;

public class Shipping : BaseAuditableEntity  
{
    public required string OriginCountry { get; set; }

    public required string EstimatedDeliveryTime { get; set; }

    public required string ShippingMethod { get; set; }  

    public decimal ShippingCost { get; set; }  

    public string? DeliveryTime { get; set; }  

    public string? TrackingNumber { get; set; }  

    
    public virtual ICollection<Product>? Products { get; set; }  
}


File: Entities\Shop.cs

namespace RoyalCode.Domain.Shop.Entities;
public class Shop : BaseAuditableEntity
{
    public virtual ICollection<ShopReview>? Reviews { get; set; }
}


File: Entities\ShopReview.cs
﻿
namespace RoyalCode.Domain.Shop.Entities;
public class ShopReview : Review
{
    public required Guid ShopId { get; set; }

    
    public required Shop Shop { get; set; }

}


# Configurations

## Directory: Challenger

## Directory: Challenger\Account

File: Challenger\Account\EmergencyContactConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Account;

public class EmergencyContactConfiguration : IEntityTypeConfiguration<EmergencyContact>
{
    public void Configure(EntityTypeBuilder<EmergencyContact> builder)
    {
        
        builder.ToTable("EmergencyContacts");

        
        builder.HasKey(ec => ec.Id);

        
        builder.Property(ec => ec.UserId)
            .IsRequired();

        builder.Property(ec => ec.ContactName)
            .IsRequired()
            .HasMaxLength(100);  

        builder.Property(ec => ec.ContactNumber)
            .IsRequired()
            .HasMaxLength(15);  

        
        builder.HasOne(ec => ec.User)
            .WithMany(u => u.EmergencyContacts)  
            .HasForeignKey(ec => ec.UserId)
            .OnDelete(DeleteBehavior.Cascade); 
    }
}


File: Challenger\Account\UserAchievementConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Account;
public class UserAchievementConfiguration : IEntityTypeConfiguration<UserAchievement>
{
    public void Configure(EntityTypeBuilder<UserAchievement> builder)
    {
        
        builder.ToTable("UserAchievements");

        
        builder.HasKey(ua => ua.Id);

        
        builder.HasOne(ua => ua.User)
            .WithMany(u => u.UserAchievements)
            .HasForeignKey(ua => ua.UserId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.HasOne(ua => ua.Achievement)
            .WithMany(a => a.UserAchievements)
            .HasForeignKey(ua => ua.AchievementId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.Property(ua => ua.DateEarned)
            .IsRequired();
    }
}


File: Challenger\Account\UserDashboardSettingsConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Account;
public class UserDashboardSettingsConfiguration : IEntityTypeConfiguration<UserDashboardSettings>
{
    public void Configure(EntityTypeBuilder<UserDashboardSettings> builder)
    {
        
        builder.ToTable("UserDashboardSettings");

        
        builder.HasKey(uds => uds.Id);

        
        builder.Property(uds => uds.PreferredMetrics)
            .HasMaxLength(1000);  

        builder.Property(uds => uds.IsDarkModeEnabled)
            .IsRequired();  

        builder.Property(uds => uds.LayoutPreferences)
            .IsRequired()
            .HasMaxLength(1000);  

        
        builder.HasOne(uds => uds.User)
            .WithOne(u => u.DashboardSettings)
            .HasForeignKey<UserDashboardSettings>(uds => uds.UserId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.HasIndex(uds => uds.UserId).IsUnique();
    }
}


File: Challenger\Account\UserEngagementConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Account;
public class UserEngagementConfiguration : IEntityTypeConfiguration<UserEngagement>
{
    public void Configure(EntityTypeBuilder<UserEngagement> builder)
    {
        
        builder.ToTable("UserEngagements");

        
        builder.HasKey(ue => ue.Id);

        
        builder.Property(ue => ue.EngagementType)
            .IsRequired();  

        builder.Property(ue => ue.Content)
            .HasMaxLength(1000);  


        
        builder.HasOne(ue => ue.SocialEngagement)
            .WithMany(se => se.UserEngagements)
            .HasForeignKey(ue => ue.SocialEngagementId)
            .OnDelete(DeleteBehavior.Cascade);  

        builder.HasOne(ue => ue.User)
            .WithMany(u => u.UserEngagements)
            .HasForeignKey(ue => ue.UserId)
            .OnDelete(DeleteBehavior.Cascade);  

    }
}


File: Challenger\Account\UserGoalConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Account;
public class UserGoalConfiguration : IEntityTypeConfiguration<UserGoal>
{
    public void Configure(EntityTypeBuilder<UserGoal> builder)
    {
        
        builder.ToTable("UserGoals");

        
        builder.HasKey(ug => ug.Id);

        
        builder.Property(ug => ug.Title)
            .IsRequired()
            .HasMaxLength(255);  

        builder.Property(ug => ug.Description)
            .HasMaxLength(1000);  

        builder.Property(ug => ug.IsCompleted)
            .IsRequired();

        builder.Property(ug => ug.StartDate)
            .IsRequired();

        builder.Property(ug => ug.EndDate)
            .IsRequired();

        builder.Property(ug => ug.Progress)
            .IsRequired();

        
        builder.HasOne(ug => ug.User)
            .WithMany(u => u.Goals)
            .HasForeignKey(ug => ug.UserId)
            .OnDelete(DeleteBehavior.Cascade);  
    }
}


File: Challenger\Account\UserRewardConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Account;
public class UserRewardConfiguration : IEntityTypeConfiguration<UserReward>
{
    public void Configure(EntityTypeBuilder<UserReward> builder)
    {
        
        builder.ToTable("UserRewards");

        
        builder.HasKey(ur => ur.Id);


        
        builder.Property(ur => ur.DateEarned)
            .IsRequired();

        builder.Property(ur => ur.DateRedeemed)
            .IsRequired(false);  

        

        builder.Property(ur => ur.Status)
            .IsRequired();

        builder.HasOne(ur => ur.Reward)
            .WithMany(r => r.UserRewards)
            .HasForeignKey(ur => ur.RewardId)
            .OnDelete(DeleteBehavior.Cascade);  

    }
}


File: Challenger\Account\UserStatsConfiguration.cs
﻿

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Account;
public class UserStatsConfiguration : IEntityTypeConfiguration<UserStats>
{
    public void Configure(EntityTypeBuilder<UserStats> builder)
    {
        
        builder.ToTable("UserStats");

        
        builder.HasKey(us => us.Id);

        
        builder.Property(us => us.TotalDistance)
            .IsRequired();

        builder.Property(us => us.TotalSteps)
            .IsRequired();

        builder.Property(us => us.TotalCaloriesBurned)
            .IsRequired();

        builder.Property(us => us.MaxHeartRate)
            .IsRequired();

        builder.Property(us => us.AverageHeartRate)
            .IsRequired();

        
        builder.HasOne(us => us.User)
            .WithOne(u => u.Stats)
            .HasForeignKey<UserStats>(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.HasIndex(us => us.UserId).IsUnique();
    }
}


File: Challenger\AchievementConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger;
public class AchievementConfiguration : IEntityTypeConfiguration<Achievement>
{
    public void Configure(EntityTypeBuilder<Achievement> builder)
    {
        
        builder.ToTable("Achievements");

        
        builder.HasKey(a => a.Id);

        
        builder.Property(a => a.Title)
            .IsRequired()
            .HasMaxLength(255);  

        builder.Property(a => a.Description)
            .IsRequired()
            .HasMaxLength(1000);  

        builder.Property(a => a.CriteriaType)
            .IsRequired()
            .HasMaxLength(100);  

        builder.Property(a => a.CriteriaData)
            .IsRequired()
            .HasMaxLength(1000);  

        builder.Property(a => a.BadgeImageUrl)
            .HasMaxLength(500);  

        
        builder.HasMany(a => a.UserAchievements)
            .WithOne(ua => ua.Achievement)
            .HasForeignKey(ua => ua.AchievementId)
            .OnDelete(DeleteBehavior.Cascade);  
    }
}


## Directory: Challenger\Analytics

File: Challenger\Analytics\AnalyticsDataConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Analytics;
public class AnalyticsDataConfiguration : IEntityTypeConfiguration<AnalyticsData>
{
    public void Configure(EntityTypeBuilder<AnalyticsData> builder)
    {
        builder.ToTable("AnalyticsData");
        
        builder.ToTable("AnalyticsData");

        
        builder.HasKey(ad => ad.Id);

        
        builder.Property(ad => ad.ActivityDate)
            .IsRequired();

        builder.Property(ad => ad.EngagementScore)
            .IsRequired();

        builder.Property(ad => ad.CarbonReduction)
            .HasColumnType("decimal(18,2)")  
            .IsRequired();


        
        builder.HasOne(ad => ad.User)
            .WithMany(u => u.AnalyticsData)
            .HasForeignKey(ad => ad.UserId)
            .OnDelete(DeleteBehavior.Cascade); 

        
        builder.HasOne(ad => ad.Challenge)
            .WithMany(c => c.AnalyticsData)
            .HasForeignKey(ad => ad.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade); 


    }
}


File: Challenger\BadgeConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger;
public class BadgeConfiguration : IEntityTypeConfiguration<Badge>
{
    public void Configure(EntityTypeBuilder<Badge> builder)
    {
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Name).IsRequired().HasMaxLength(100);
        builder.Property(b => b.Description).HasMaxLength(500);
        builder.Property(b => b.IconUrl).IsRequired();
    }
}


## Directory: Challenger\Challenges

File: Challenger\Challenges\ChallengeConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Challenges;
public class ChallengeConfiguration : IEntityTypeConfiguration<Challenge>
{
    public void Configure(EntityTypeBuilder<Challenge> builder)
    {
        
        builder.ToTable("Challenges");

        
        builder.HasKey(c => c.Id);

        
        builder.Property(c => c.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(c => c.StartDate)
            .IsRequired();

        builder.Property(c => c.EndDate)
            .IsRequired();

        builder.Property(c => c.CoverImageUrl)
            .HasMaxLength(500);

        builder.Property(c => c.CardTitle)
            .HasMaxLength(200);

        builder.Property(c => c.CardSummary)
            .HasMaxLength(1000);

        builder.Property(c => c.Status)
            .IsRequired();

        builder.Property(c => c.Privacy)
            .IsRequired();

        builder.Property(c => c.MaxParticipants)
            .IsRequired();

        

        
        builder.HasOne(c => c.CreatorUser)
            .WithMany(u => u.CreatedChallenges)
            .HasForeignKey(c => c.CreatorUserId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        
        builder.HasOne(c => c.DifficultyLevel)
            .WithMany(dl => dl.Challenges)
            .HasForeignKey(c => c.DifficultyLevelId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        
        builder.HasOne(c => c.Template)
            .WithMany(t => t.Challenges)
            .HasForeignKey(c => c.TemplateId)
            .OnDelete(DeleteBehavior.SetNull);

        
        builder.HasOne(c => c.Location)
            .WithMany(l => l.Challenges)
            .HasForeignKey(c => c.LocationId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        
        builder.HasOne(c => c.Route)
            .WithOne(r => r.Challenge)
            .HasForeignKey<ChallengeRoute>(r => r.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);

        
        builder.HasMany(c => c.ChallengeComponents)
            .WithOne(cc => cc.Challenge)
            .HasForeignKey(cc => cc.ChallengeId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        
        builder.HasMany(c => c.PerformanceMetrics)
            .WithOne(pm => pm.Challenge)
            .HasForeignKey(pm => pm.ChallengeId)
            .IsRequired();

        
        builder.HasMany(c => c.Reviews)
            .WithOne(r => r.Challenge)
            .HasForeignKey(r => r.ChallengeId)
            .IsRequired();

        
        builder.HasMany(c => c.Rules)
            .WithOne(r => r.Challenge)
            .HasForeignKey(r => r.ChallengeId)
            .IsRequired();

        
        builder.HasMany(c => c.SocialEngagements)
            .WithOne(se => se.Challenge)
            .HasForeignKey(se => se.ChallengeId)
            .IsRequired();

        
        builder.HasMany(c => c.EnvironmentRequirements)
            .WithOne(er => er.Challenge)
            .HasForeignKey(er => er.ChallengeId)
            .IsRequired();

        
        builder.HasMany(c => c.EquipmentRequirements)
            .WithOne(eq => eq.Challenge)
            .HasForeignKey(eq => eq.ChallengeId)
            .IsRequired();

        
        builder.HasMany(c => c.ModeOfCompletionRequirements)
            .WithOne(mcr => mcr.Challenge)
            .HasForeignKey(mcr => mcr.ChallengeId)
            .IsRequired();

        
        builder.HasMany(c => c.StatsRequirements)
            .WithMany(sr => sr.Challenges)
            .UsingEntity<Dictionary<string, object>>(
                "ChallengeStatsRequirements",
                j => j.HasOne<StatsRequirement>()
                      .WithMany()
                      .HasForeignKey("StatsRequirementId")
                      .HasConstraintName("FK_ChallengeStatsRequirements_StatsRequirementId")
                      .OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne<Challenge>()
                      .WithMany()
                      .HasForeignKey("ChallengeId")
                      .HasConstraintName("FK_ChallengeStatsRequirements_ChallengeId")
                      .OnDelete(DeleteBehavior.Cascade),
                j =>
                {
                    j.HasKey("ChallengeId", "StatsRequirementId");
                    j.ToTable("ChallengeStatsRequirements");
                }
            );

        
        builder.HasMany(c => c.Tags)
            .WithMany(t => t.Challenges)
            .UsingEntity<Dictionary<string, object>>(
                "ChallengeTags",
                j => j.HasOne<Tag>()
                      .WithMany()
                      .HasForeignKey("TagId")
                      .HasConstraintName("FK_ChallengeTags_TagId")
                      .OnDelete(DeleteBehavior.Cascade),
                j => j.HasOne<Challenge>()
                      .WithMany()
                      .HasForeignKey("ChallengeId")
                      .HasConstraintName("FK_ChallengeTags_ChallengeId")
                      .OnDelete(DeleteBehavior.Cascade),
                j =>
                {
                    j.HasKey("ChallengeId", "TagId");
                    j.ToTable("ChallengeTags");
                }
            );

        
        builder.HasMany(c => c.ChallengeParticipations)
            .WithOne(cp => cp.Challenge)
            .HasForeignKey(cp => cp.ChallengeId)
            .IsRequired();

        
        builder.HasMany(c => c.AnalyticsData)
            .WithOne(ad => ad.Challenge)
            .HasForeignKey(ad => ad.ChallengeId)
            .IsRequired();

        
        builder.HasMany(c => c.Rewards)
            .WithOne(r => r.Challenge)
            .HasForeignKey(r => r.ChallengeId)
            .IsRequired();
    }
}


File: Challenger\Challenges\ChallengeParticipationConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Challenges;
public class ChallengeParticipationConfiguration : IEntityTypeConfiguration<ChallengeParticipation>
{
    public void Configure(EntityTypeBuilder<ChallengeParticipation> builder)
    {
        
        builder.HasKey(cp => cp.Id);

        
        builder.Property(cp => cp.JoinedOn)
               .IsRequired(); 

        builder.Property(cp => cp.Status)
               .IsRequired()
               .HasMaxLength(50); 

        builder.Property(cp => cp.ProgressPercentage)
               .HasDefaultValue(0.0)
               .IsRequired();

        
        builder.HasOne(cp => cp.User)
               .WithMany(u => u.ChallengeParticipations) 
               .HasForeignKey(cp => cp.UserId)
               .OnDelete(DeleteBehavior.Cascade); 

        builder.HasOne(cp => cp.Challenge)
               .WithMany(c => c.ChallengeParticipations) 
               .HasForeignKey(cp => cp.ChallengeId)
               .OnDelete(DeleteBehavior.Cascade); 

        
        builder.HasMany(cp => cp.ProgressUpdates)
               .WithOne(pu => pu.ChallengeParticipation)
               .HasForeignKey(pu => pu.ChallengeParticipationId)
               .OnDelete(DeleteBehavior.Cascade); 
    }
}


File: Challenger\Challenges\ChallengeReviewsConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Challenges;
public class ChallengeReviewsConfiguration : IEntityTypeConfiguration<ChallengeReview>
{
    public void Configure(EntityTypeBuilder<ChallengeReview> builder)
    {
        builder.ToTable("ChallengeReviews");

        
        builder.HasBaseType<Review>();

        builder.Property(cr => cr.ChallengeId).IsRequired();  

        builder.HasOne(cr => cr.Challenge)
               .WithMany(c => c.Reviews)
               .HasForeignKey(cr => cr.ChallengeId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}


File: Challenger\Challenges\ChallengerRule.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Challenges;

public class ChallengerRule
{
    public string Description { get; set; } = string.Empty;  

    public Guid ChallengeId { get; set; }
    public virtual Challenge? Challenge { get; set; }
}


File: Challenger\Challenges\DifficultyLevelConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Challenges;
public class DifficultyLevelConfiguration : IEntityTypeConfiguration<DifficultyLevel>
{
    public void Configure(EntityTypeBuilder<DifficultyLevel> builder)
    {
        
        builder.ToTable("DifficultyLevels");

        
        builder.HasKey(dl => dl.Id);

        
        builder.Property(dl => dl.LevelName)
            .IsRequired()
            .HasMaxLength(100);  

        builder.Property(dl => dl.Description)
            .HasMaxLength(1000);  

        builder.Property(dl => dl.PhysicalRequirements)
            .HasMaxLength(1000);  

        builder.Property(dl => dl.MentalRequirements)
            .HasMaxLength(1000);  

        builder.Property(dl => dl.TimeCommitment)
            .HasMaxLength(500);  

        builder.Property(dl => dl.RecommendedPreparation)
            .HasMaxLength(1000);  

        builder.Property(dl => dl.Rewards)
            .HasMaxLength(1000);  

        
        builder.HasMany(dl => dl.Challenges)
            .WithOne(c => c.DifficultyLevel)
            .HasForeignKey(c => c.DifficultyLevelId)
            .OnDelete(DeleteBehavior.Restrict);  
    }
}


File: Challenger\Challenges\EnvironmentConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Challenges;
public class EnvironmentConfiguration : IEntityTypeConfiguration<EnvironmentChallenge.Environment>
{
    public void Configure(EntityTypeBuilder<EnvironmentChallenge.Environment> builder)
    {
        
        builder.ToTable("Environments");

        
        builder.HasKey(e => e.Id);

        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(255);  

        builder.Property(e => e.Description)
            .HasMaxLength(1000);  

        
        builder.HasOne(e => e.Parent)
            .WithMany(e => e.Children)
            .HasForeignKey(e => e.ParentId)
            .OnDelete(DeleteBehavior.Restrict);  

        
        builder.HasMany(e => e.EnvironmentRequirements)
            .WithOne(er => er.Environment)
            .HasForeignKey(er => er.EnvironmentId)
            .OnDelete(DeleteBehavior.Cascade);  
    }
}


File: Challenger\Challenges\EnvironmentRequirementConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Challenges;
public class EnvironmentRequirementConfiguration : IEntityTypeConfiguration<EnvironmentRequirement>
{
    public void Configure(EntityTypeBuilder<EnvironmentRequirement> builder)
    {
        
        builder.ToTable("EnvironmentRequirements");

        
        builder.HasKey(er => er.Id);

        
        builder.HasOne(er => er.Challenge)
            .WithMany(c => c.EnvironmentRequirements)
            .HasForeignKey(er => er.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.HasOne(er => er.Environment)
            .WithMany(e => e.EnvironmentRequirements)
            .HasForeignKey(er => er.EnvironmentId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.Property(er => er.ChallengeId)
            .IsRequired();

        builder.Property(er => er.EnvironmentId)
            .IsRequired();
    }
}


File: Challenger\Challenges\ModeOfCompletionConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Challenges;
public class ModeOfCompletionConfiguration : IEntityTypeConfiguration<ModeOfCompletion>
{
    public void Configure(EntityTypeBuilder<ModeOfCompletion> builder)
    {
        
        builder.ToTable("ModeOfCompletion");

        
        builder.HasKey(m => m.Id);

        
        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(200);  

        builder.Property(m => m.Description)
            .HasMaxLength(1000);  

        builder.Property(m => m.ParentId)
            .IsRequired(false);  

        
        builder.HasOne(m => m.Parent)
            .WithMany(p => p.Children)
            .HasForeignKey(m => m.ParentId)
            .OnDelete(DeleteBehavior.Restrict);  

        builder.HasMany(m => m.ModeOfCompletionRequirements)
            .WithOne(r => r.ModeOfCompletion)
            .HasForeignKey(r => r.ModeOfCompletionId)
            .OnDelete(DeleteBehavior.Cascade);  
    }
}


File: Challenger\Challenges\ModeOfCompletionRequirementConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Challenges;
public class ModeOfCompletionRequirementConfiguration : IEntityTypeConfiguration<ModeOfCompletionRequirement>
{
    public void Configure(EntityTypeBuilder<ModeOfCompletionRequirement> builder)
    {
        
        builder.ToTable("ModeOfCompletionRequirements");

        
        builder.HasKey(mr => mr.Id);

        builder.HasIndex(mr => new { mr.ChallengeId, mr.ModeOfCompletionId }).IsUnique();

        
        builder.Property(mr => mr.ChallengeId)
            .IsRequired();

        builder.Property(mr => mr.ModeOfCompletionId)
            .IsRequired();

        

        
        builder.HasOne(mr => mr.Challenge)
            .WithMany(c => c.ModeOfCompletionRequirements)
            .HasForeignKey(mr => mr.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.HasOne(mr => mr.ModeOfCompletion)
            .WithMany(mc => mc.ModeOfCompletionRequirements)
            .HasForeignKey(mr => mr.ModeOfCompletionId)
            .OnDelete(DeleteBehavior.Cascade);  
    }
}


File: Challenger\CurrencyConfiguration.cs
﻿
namespace RoyalCode.Infrastructure.Data.Configurations.Challenger;
public class CurrencyConfiguration : IEntityTypeConfiguration<Currency>
{
    public void Configure(EntityTypeBuilder<Currency> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Amount)
               .IsRequired();
        builder.HasOne(c => c.Wallet)
               .WithMany(w => w.Currencies)
               .HasForeignKey(c => c.WalletId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}


File: Challenger\CurrencyTransactionConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger;
public class CurrencyTransactionConfiguration : IEntityTypeConfiguration<CurrencyTransaction>
{
    public void Configure(EntityTypeBuilder<CurrencyTransaction> builder)
    {
        builder.HasKey(ct => ct.Id);

        builder.Property(ct => ct.Type)
               .IsRequired();

        builder.Property(ct => ct.Amount)
               .IsRequired();

        builder.Property(ct => ct.Description)
               .HasMaxLength(500); 

        builder.Property(ct => ct.TransactionDate)
               .IsRequired()
               .HasDefaultValueSql("GETUTCDATE()");  

        builder.HasOne(ct => ct.Wallet)
               .WithMany(w => w.Transactions)
               .HasForeignKey(ct => ct.WalletId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}


## Directory: Challenger\Location

File: Challenger\Location\LocationConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Locations;
public class LocationConfiguration : IEntityTypeConfiguration<Location>
{
    public void Configure(EntityTypeBuilder<Location> builder)
    {
        
        builder.Property(e => e.Coordinate)
            .HasColumnType("geography")  
            .IsRequired();

        
        builder.Property(e => e.Address)
            .HasMaxLength(500); 

        
        builder.HasMany(e => e.Challenges)
            .WithOne(c => c.Location)
            .HasForeignKey(c => c.LocationId)
            .OnDelete(DeleteBehavior.Cascade); 

        
        builder.HasMany(e => e.RouteNodes)
            .WithOne(rn => rn.Location)
            .HasForeignKey(rn => rn.LocationId)
            .OnDelete(DeleteBehavior.Cascade); 
    }
}


## Directory: Challenger\Performance

File: Challenger\Performance\PerformanceMetricConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Performance;
public class PerformanceMetricConfiguration : IEntityTypeConfiguration<PerformanceMetric>
{
    public void Configure(EntityTypeBuilder<PerformanceMetric> builder)
    {
        builder.HasKey(pm => pm.Id);  

        builder.Property(pm => pm.TimeTakenSeconds)
               .HasColumnType("decimal(18,2)")
               .IsRequired();

        builder.Property(pm => pm.DistanceCoveredMeters)
               .HasColumnType("decimal(18,2)")
               .IsRequired();

        builder.Property(pm => pm.AverageSpeedMetersPerSecond)
               .HasColumnType("decimal(18,2)")
               .IsRequired();

        builder.Property(pm => pm.CaloriesBurned)
               .HasColumnType("decimal(18,2)")
               .IsRequired();

        builder.Property(pm => pm.ElevationGainMeters)
               .HasColumnType("decimal(18,2)")
               .IsRequired();

        builder.Property(pm => pm.AverageHeartRate)
               .IsRequired();

        builder.Property(pm => pm.MaxHeartRate)
               .IsRequired();

        builder.Property(pm => pm.StepsCount)
               .IsRequired();

        builder.Property(pm => pm.IsCompleted)
               .HasDefaultValue(false)
               .IsRequired();

        builder.Property(pm => pm.Outcome)
               .HasMaxLength(200);  

        builder.Property(pm => pm.TotalDistanceMeters)
               .HasColumnType("decimal(18,2)")
               .IsRequired();

        builder.Property(pm => pm.EncodedRouteData)
               .HasMaxLength(5000);  

        builder.Property(pm => pm.PaceSecondsPerKilometer)
               .HasColumnType("decimal(18,2)")
               .IsRequired();

        builder.Property(pm => pm.HydrationLevel)
               .HasColumnType("decimal(5,2)");  

        builder.Property(pm => pm.WeatherConditions)
               .HasMaxLength(100);  

        builder.Property(pm => pm.DeviceUsed)
               .HasMaxLength(50);  

        builder.Property(pm => pm.LocationCoordinates)
               .HasMaxLength(1000);  

        builder.Property(pm => pm.FatigueLevel)
               .HasDefaultValue(0);

        builder.Property(pm => pm.SleepQualityBeforeActivity)
               .HasDefaultValue(0);

        builder.Property(pm => pm.SurfaceType)
               .HasMaxLength(50);

        builder.Property(pm => pm.HeartRateVariability)
               .HasColumnType("decimal(5,2)");  

        
        builder.HasOne(pm => pm.User)
               .WithMany(u => u.PerformanceMetrics)  
               .HasForeignKey(pm => pm.UserId)
               .OnDelete(DeleteBehavior.Cascade);  

        builder.HasOne(pm => pm.Challenge)
               .WithMany(c => c.PerformanceMetrics)  
               .HasForeignKey(pm => pm.ChallengeId)
               .OnDelete(DeleteBehavior.Cascade);  
    }
}


File: Challenger\Performance\ProgressUpdateConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Performance;
public class ProgressUpdateConfiguration : IEntityTypeConfiguration<ProgressUpdate>
{
    public void Configure(EntityTypeBuilder<ProgressUpdate> builder)
    {
        builder.ToTable("ProgressUpdates");

        builder.HasKey(pu => pu.Id);

        builder.Property(pu => pu.ProgressPercentage)
            .IsRequired()
            .HasColumnType("decimal(5,2)");  

        builder.Property(pu => pu.Notes)
            .HasMaxLength(1000);  

        
        builder.HasOne(pu => pu.ChallengeParticipation)
            .WithMany(cp => cp.ProgressUpdates)  
            .HasForeignKey(pu => pu.ChallengeParticipationId)
            .OnDelete(DeleteBehavior.Cascade);  
    }
}


## Directory: Challenger\Progress

File: Challenger\Progress\UserRouteProgressConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Progress;
public class UserRouteProgressConfiguration : IEntityTypeConfiguration<UserRouteProgress>
{
    public void Configure(EntityTypeBuilder<UserRouteProgress> builder)
    {
        builder.Property(e => e.Route)
            .HasColumnType("geography");

        builder.Property(e => e.ProgressPercentage)
           .HasColumnType("decimal(18,4)");


        builder.HasOne(urp => urp.Participation)
            .WithOne(cp => cp.RouteProgress)
            .HasForeignKey<UserRouteProgress>(urp => urp.ChallengeParticipationId)
            .OnDelete(DeleteBehavior.Cascade);
    }

}


## Directory: Challenger\Ranking

File: Challenger\Ranking\RewardConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Ranking;
public class RewardConfiguration : IEntityTypeConfiguration<Reward>
{
    public void Configure(EntityTypeBuilder<Reward> builder)
    {
        builder.ToTable("Rewards");
        builder.ToTable("Rewards");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Title)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(r => r.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(r => r.Value)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(r => r.ExpirationDate)
            .IsRequired(false);

        builder.HasMany(r => r.UserRewards)
            .WithOne(ur => ur.Reward)
            .HasForeignKey(ur => ur.RewardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.RouteNodes)
            .WithOne(rn => rn.Reward)
            .HasForeignKey(rn => rn.RewardId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}


## Directory: Challenger\Routes

File: Challenger\Routes\ChallengeRouteConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Routes;
public class ChallengeRouteConfiguration : IEntityTypeConfiguration<ChallengeRoute>
{
    public void Configure(EntityTypeBuilder<ChallengeRoute> builder)
    {
        
        builder.ToTable("ChallengeRoutes");

        
        builder.HasKey(cr => cr.Id);

        
        builder.Property(cr => cr.Name)
            .HasMaxLength(200)  
            .IsRequired();

        builder.Property(cr => cr.Description)
            .HasMaxLength(500)  
            .IsRequired();

        
        builder.Property(cr => cr.TotalDistanceMeters)
            .HasColumnType("decimal(18,2)")  
            .IsRequired();

        
        builder.HasMany(cr => cr.RouteNodes)
            .WithOne(rn => rn.ChallengeRoute)
            .HasForeignKey(rn => rn.ChallengeRouteId)
            .OnDelete(DeleteBehavior.Cascade);  

    }
}


File: Challenger\Routes\RouteNodeConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Routes;
public class RouteNodeConfiguration : IEntityTypeConfiguration<RouteNode>
{
    public void Configure(EntityTypeBuilder<RouteNode> builder)
    {
        builder.ToTable("RouteNodes");
        builder.ToTable("RouteNodes");

        builder.HasKey(rn => rn.Id);

        builder.Property(rn => rn.ChallengeRouteId)
               .IsRequired();
        builder.Property(rn => rn.LocationId)
               .IsRequired();
        builder.Property(rn => rn.SequenceNumber)
               .IsRequired();
        builder.Property(rn => rn.Type)
               .IsRequired();
        builder.Property(rn => rn.Content)
               .HasMaxLength(1000);

        builder.HasOne(rn => rn.ChallengeRoute)
               .WithMany(cr => cr.RouteNodes)
               .HasForeignKey(rn => rn.ChallengeRouteId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(rn => rn.Location)
               .WithMany(l => l.RouteNodes)
               .HasForeignKey(rn => rn.LocationId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(rn => rn.Reward)
               .WithMany(r => r.RouteNodes)
               .HasForeignKey(rn => rn.RewardId)
               .OnDelete(DeleteBehavior.Restrict);

    }
}



File: Challenger\RuleConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger;
public class RuleConfiguration : IEntityTypeConfiguration<Rule>
{
    public void Configure(EntityTypeBuilder<Rule> builder)
    {
        
        builder.ToTable("Rules");

        
        builder.HasKey(r => r.Id);

        
        builder.Property(r => r.Description)
            .IsRequired()
            .HasMaxLength(1000);  

        builder.Property(r => r.Order)
            .IsRequired();  

        
        builder.HasOne(r => r.Challenge)
            .WithMany(c => c.Rules)
            .HasForeignKey(r => r.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);  
    }
}


## Directory: Challenger\Social

File: Challenger\Social\CommentConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Social;
public class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
    public void Configure(EntityTypeBuilder<Comment> builder)
    {
        
        builder.ToTable("Comments");

        
        builder.HasKey(c => c.Id);

        
        builder.HasOne(c => c.SocialEngagement)
            .WithMany(se => se.Comments)
            .HasForeignKey(c => c.SocialEngagementId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.Property(c => c.CommentText)
            .IsRequired()
            .HasMaxLength(1000);  
    }
}


## Directory: Challenger\Stats

File: Challenger\Stats\EquipmentRequirementConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Stats;
public class EquipmentRequirementConfiguration : IEntityTypeConfiguration<EquipmentRequirement>
{
    public void Configure(EntityTypeBuilder<EquipmentRequirement> builder)
    {
        
        builder.ToTable("EquipmentRequirements");

        
        builder.HasKey(er => er.Id);

        
        builder.HasOne(er => er.Challenge)
            .WithMany(c => c.EquipmentRequirements)
            .HasForeignKey(er => er.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.HasOne(er => er.Equipment)
            .WithMany(e => e.EquipmentRequirements)
            .HasForeignKey(er => er.EquipmentId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.Property(er => er.ChallengeId)
            .IsRequired();

        builder.Property(er => er.EquipmentId)
            .IsRequired();
    }
}


File: Challenger\Stats\HealthIntegrationConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Stats;
public class HealthIntegrationConfiguration : IEntityTypeConfiguration<HealthIntegration>
{
    public void Configure(EntityTypeBuilder<HealthIntegration> builder)
    {
        builder.ToTable("HealthIntegrations");

        builder.HasKey(hi => hi.Id);

        
        builder.Property(hi => hi.IntegrationName)
            .IsRequired()
            .HasMaxLength(255);  

        builder.Property(hi => hi.AccessToken)
            .IsRequired()
            .HasMaxLength(500);  

        builder.Property(hi => hi.TokenExpiry)
            .IsRequired();  

        builder.Property(hi => hi.ExternalUserId)
            .HasMaxLength(255);  

        
        builder.HasOne(hi => hi.User)
            .WithMany(u => u.HealthIntegrations)  
            .HasForeignKey(hi => hi.UserId)
            .OnDelete(DeleteBehavior.Cascade);  
    }
}


File: Challenger\Stats\StatsRequirementConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Stats;
public class StatsRequirementConfiguration : IEntityTypeConfiguration<StatsRequirement>
{
    public void Configure(EntityTypeBuilder<StatsRequirement> builder)
    {
        
        builder.ToTable("StatsRequirements");

        
        builder.HasKey(sr => sr.Id);

        
        builder.Property(sr => sr.Category)
            .IsRequired()
            .HasMaxLength(255);  

        builder.Property(sr => sr.LevelName)
            .IsRequired()
            .HasMaxLength(100);  

        builder.Property(sr => sr.Description)
            .HasMaxLength(1000);  


        
        builder.HasMany(c => c.Challenges)
               .WithMany(sr => sr.StatsRequirements)
               .UsingEntity(j => j.ToTable("ChallengeStatsRequirements"));

    }
}


File: Challenger\Stats\UserHealthMetricConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Stats;
public class UserHealthMetricConfiguration : IEntityTypeConfiguration<UserHealthMetric>
{
    public void Configure(EntityTypeBuilder<UserHealthMetric> builder)
    {
        
        builder.ToTable("UserHealthMetrics");

        
        builder.HasKey(uhm => uhm.Id);

        
        builder.Property(uhm => uhm.Timestamp)
            .IsRequired();

        builder.Property(uhm => uhm.ActivityType)
            .IsRequired();

        builder.Property(uhm => uhm.Value)
            .IsRequired();

        
        builder.HasOne(uhm => uhm.User)
            .WithMany(u => u.UserHealthMetrics)
            .HasForeignKey(uhm => uhm.UserId)
            .OnDelete(DeleteBehavior.Cascade);  

    }
}


## Directory: Challenger\Templates

File: Challenger\Templates\ChallengeComponentConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Templates;
public class ChallengeComponentConfiguration : IEntityTypeConfiguration<ChallengeComponent>
{
    public void Configure(EntityTypeBuilder<ChallengeComponent> builder)
    {
        builder.ToTable("ChallengeComponents");

        builder.HasKey(cc => cc.Id);

        builder.Property(cc => cc.ChallengeId)
               .IsRequired();

        builder.Property(cc => cc.ComponentId)
               .IsRequired();

        builder.Property(cc => cc.SequenceNumber)
               .IsRequired();

        builder.Property(cc => cc.Settings)
               .IsRequired()
               .HasMaxLength(1000);

        builder.HasOne(cc => cc.Challenge)
               .WithMany(c => c.ChallengeComponents)
               .HasForeignKey(cc => cc.ChallengeId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cc => cc.Component)
               .WithMany(c => c.ChallengeComponents)
               .HasForeignKey(cc => cc.ComponentId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}


File: Challenger\Templates\ChallengeTemplateConfiguration.cs
﻿

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Templates;
public class ChallengeTemplateConfiguration : IEntityTypeConfiguration<TemplateChallenge>
{
    public void Configure(EntityTypeBuilder<TemplateChallenge> builder)
    {
        builder.HasKey(cd => cd.Id);

        builder.Property(cd => cd.Description)
               .IsRequired()
               .HasMaxLength(2000);

        
        
        
        
    }
}


File: Challenger\Templates\ComponentConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Templates;
public class ComponentConfiguration : IEntityTypeConfiguration<Component>
{
    public void Configure(EntityTypeBuilder<Component> builder)
    {
        
        builder.HasKey(c => c.Id);

        
        builder.Property(c => c.Title)
               .IsRequired()
               .HasMaxLength(200); 

        builder.Property(c => c.Type)
               .IsRequired();

        builder.Property(c => c.DefaultSettings)
               .HasMaxLength(1000); 

    }
}


File: Challenger\Templates\TemplateComponentConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Templates;
public class TemplateComponentConfiguration : IEntityTypeConfiguration<TemplateComponent>
{
    public void Configure(EntityTypeBuilder<TemplateComponent> builder)
    {
        
        builder.HasKey(tc => tc.Id);

        
        builder.Property(tc => tc.SequenceNumber)
               .IsRequired();

        builder.Property(tc => tc.Settings)
               .HasMaxLength(1000); 

        
        builder.HasOne(tc => tc.Template)
               .WithMany(t => t.TemplateComponents)
               .HasForeignKey(tc => tc.TemplateId)
               .OnDelete(DeleteBehavior.Cascade); 

        builder.HasOne(tc => tc.Component)
               .WithMany(c => c.TemplateComponents)  
               .HasForeignKey(tc => tc.ComponentId)
               .OnDelete(DeleteBehavior.Cascade);  
    }
}


File: Challenger\Templates\TemplateConfiguration.cs
﻿

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger.Templates;
public class TemplateConfiguration : IEntityTypeConfiguration<Template>
{
    public void Configure(EntityTypeBuilder<Template> builder)
    {
        
        builder.ToTable("Templates");

        
        builder.HasKey(t => t.Id);

        
        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200); 

        builder.Property(t => t.Description)
            .IsRequired()
            .HasMaxLength(1000); 

        

        
        builder.HasMany(t => t.TemplateComponents)
            .WithOne(tc => tc.Template)  
            .HasForeignKey(tc => tc.TemplateId)
            .OnDelete(DeleteBehavior.Cascade); 

        
        builder.HasMany(t => t.Challenges)
            .WithOne(c => c.Template) 
            .HasForeignKey(c => c.TemplateId)
            .OnDelete(DeleteBehavior.SetNull); 
    }
}


File: Challenger\WalletConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Challenger;
public class WalletConfiguration : IEntityTypeConfiguration<Wallet>
{
    public void Configure(EntityTypeBuilder<Wallet> builder)
    {
        builder.HasKey(w => w.Id);

        builder.Property(w => w.Type)
               .IsRequired()
               .HasMaxLength(50);  

        builder.HasOne(w => w.User)
               .WithMany(u => u.Wallets)
               .HasForeignKey(w => w.UserId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(w => w.Currencies)
               .WithOne(c => c.Wallet)
               .HasForeignKey(c => c.WalletId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}


## Directory: MarketPlace

File: MarketPlace\ProductCategoryConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.MarketPlace;
public class ProductCategoryConfiguration : IEntityTypeConfiguration<ProductCategory>
{
    public void Configure(EntityTypeBuilder<ProductCategory> builder)
    {
        
        builder.ToTable("ProductCategories");

        
        builder.HasKey(pc => new { pc.ProductId, pc.CategoryId });

        
        builder.HasOne(pc => pc.Product)
            .WithMany(p => p.ProductCategories)  
            .HasForeignKey(pc => pc.ProductId)
            .OnDelete(DeleteBehavior.Cascade);  

        builder.HasOne(pc => pc.Category)
            .WithMany(c => c.ProductCategories) 
            .HasForeignKey(pc => pc.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);  

        
    }
}


File: MarketPlace\ProductConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.MarketPlace;
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(p => p.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Price)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.DiscountedPrice)
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.AvailabilityStatus)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.ShippingDimensions)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(p => p.ShippingWeight)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.HasOne(p => p.Brand)
            .WithMany(b => b.Products)
            .HasForeignKey(p => p.BrandId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.ImageMain)
            .WithMany()
            .HasForeignKey(p => p.ImageMainId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.SEO)
            .WithMany()
            .HasForeignKey(p => p.SEOId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Shipping)
            .WithMany()
            .HasForeignKey(p => p.ShippingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.ParentProduct)
            .WithMany(p => p.Children)
            .HasForeignKey(p => p.ParentProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.ProductCategories)
            .WithOne(pc => pc.Product)
            .HasForeignKey(p => p.ProductId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasMany(p => p.Tags)
            .WithMany(t => t.Products);

        builder.HasMany(p => p.ImageGallery)
            .WithOne()
            .HasForeignKey(gi => gi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Features)
            .WithOne(f => f.Product)
            .HasForeignKey(f => f.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}


File: MarketPlace\ProductImageConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.MarketPlace;
public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages");

        builder.Property(pi => pi.ProductId).IsRequired();
       
        


        
        builder.HasOne(pi => pi.Product)
            .WithMany(p => p.ImageGallery)  
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);  
    }
}


File: MarketPlace\ProductReviewConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.MarketPlace;
internal class ProductReviewConfiguration : IEntityTypeConfiguration<ProductReview>
{
    public void Configure(EntityTypeBuilder<ProductReview> builder)
    {
        builder.ToTable("ProductReviews");

        
        builder.HasBaseType<Review>();

        builder.Property(cr => cr.ProductId).IsRequired();

        builder.HasOne(cr => cr.Product)
               .WithMany(c => c.ProductReviews)
               .HasForeignKey(cr => cr.ProductId)
               .OnDelete(DeleteBehavior.Cascade);

    }
}


File: MarketPlace\ShippingConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.MarketPlace;
public class ShippingConfiguration : IEntityTypeConfiguration<Shipping>
{
    public void Configure(EntityTypeBuilder<Shipping> builder)
    {
        builder.ToTable("Shippings");

        builder.HasKey(s => s.Id);

        
        builder.Property(s => s.ShippingMethod)
            .IsRequired()
            .HasMaxLength(255);  

        builder.Property(s => s.ShippingCost)
            .IsRequired()
            .HasColumnType("decimal(18,2)");  

        builder.Property(s => s.DeliveryTime)
            .HasMaxLength(100);  

        builder.Property(s => s.TrackingNumber)
            .HasMaxLength(100);  

        
        builder.HasMany(s => s.Products)
            .WithOne(p => p.Shipping)
            .HasForeignKey(p => p.ShippingId)
            .OnDelete(DeleteBehavior.Restrict);  
    }
}


File: MarketPlace\ShopReviewConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.MarketPlace;
public class ShopReviewConfiguration : IEntityTypeConfiguration<ShopReview>
{
    public void Configure(EntityTypeBuilder<ShopReview> builder)
    {
        builder.ToTable("ShopReviews");

        
        builder.HasBaseType<Review>();

        builder.Property(cr => cr.ShopId).IsRequired(); 

        builder.HasOne(cr => cr.Shop)
               .WithMany(c => c.Reviews)
               .HasForeignKey(cr => cr.ShopId)
               .OnDelete(DeleteBehavior.Cascade);

    }
}


## Directory: Shared

File: Shared\BrandConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared;
public class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.ToTable("Brands");

        builder.HasKey(b => b.Id);

        
        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(255);  

        builder.Property(b => b.Description)
            .HasMaxLength(1000);  

        
        builder.HasOne(b => b.Image)
            .WithMany()
            .HasForeignKey(b => b.ImageId)
            .OnDelete(DeleteBehavior.Restrict);  

        builder.HasMany(b => b.Products)
            .WithOne(p => p.Brand)
            .HasForeignKey(p => p.BrandId)
            .OnDelete(DeleteBehavior.Restrict);  
    }
}


File: Shared\CategoryConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared;
public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(c => c.Id);

        
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(255);  

        builder.Property(c => c.Description)
            .HasMaxLength(1000);  

        builder.Property(c => c.DisplayOrder)
            .IsRequired();  

        
        builder.HasOne(c => c.Image)
            .WithMany()
            .HasForeignKey(c => c.ImageId)
            .OnDelete(DeleteBehavior.Restrict);  

        
        builder.HasOne(c => c.ParentCategory)
            .WithMany(c => c.Subcategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);  

        
        builder.HasMany(c => c.ProductCategories)
            .WithOne(pc => pc.Category)
            .HasForeignKey(pc => pc.CategoryId)
            .OnDelete(DeleteBehavior.NoAction);

    }
}


## Directory: Shared\Data

File: Shared\Data\FeatureConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared.Data;
public class FeatureConfiguration : IEntityTypeConfiguration<Feature>
{
    public void Configure(EntityTypeBuilder<Feature> builder)
    {
        builder.ToTable("Features");

        builder.HasKey(f => f.Id);

        
        builder.Property(f => f.Name)
            .IsRequired()
            .HasMaxLength(255);  

        builder.Property(f => f.Description)
            .HasMaxLength(1000);  

        builder.Property(f => f.Value)
            .HasMaxLength(255);  

        builder.Property(f => f.Unit)
            .HasMaxLength(50);  

        
        builder.HasOne(f => f.Product)
            .WithMany(p => p.Features)
            .HasForeignKey(f => f.ProductId)
            .OnDelete(DeleteBehavior.Cascade);  

        builder.HasOne(f => f.Image)
            .WithMany()
            .HasForeignKey(f => f.ImageId)
            .OnDelete(DeleteBehavior.Restrict);  
    }
}


File: Shared\FeatureConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared;
public class FeatureConfiguration : IEntityTypeConfiguration<Feature>
{
    public void Configure(EntityTypeBuilder<Feature> builder)
    {
        builder.ToTable("Features");

        builder.HasKey(f => f.Id);

        
        builder.Property(f => f.Name)
            .IsRequired()
            .HasMaxLength(255);  

        builder.Property(f => f.Description)
            .HasMaxLength(1000);  

        builder.Property(f => f.Value)
            .HasMaxLength(255);  

        builder.Property(f => f.Unit)
            .HasMaxLength(50);  

        
        builder.HasOne(f => f.Product)
            .WithMany(p => p.Features)
            .HasForeignKey(f => f.ProductId)
            .OnDelete(DeleteBehavior.Cascade);  

        builder.HasOne(f => f.Image)
            .WithMany()
            .HasForeignKey(f => f.ImageId)
            .OnDelete(DeleteBehavior.Restrict);  
    }
}


## Directory: Shared\Media

File: Shared\Media\ImageConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared.Media;
public class ImageConfiguration : IEntityTypeConfiguration<Image>
{
    public void Configure(EntityTypeBuilder<Image> builder)
    {
        
        builder.ToTable("Images");

        
        builder.HasKey(i => i.Id);

        

        
        builder.Property(i => i.Height)
            .IsRequired();

        
        builder.Property(i => i.Width)
            .IsRequired();

        
        builder.Property(i => i.Url)
            .IsRequired()
            .HasMaxLength(2048); 

        
        builder.Property(i => i.AltText)
            .IsRequired()
            .HasMaxLength(500); 

        
        builder.Property(i => i.Title)
            .HasMaxLength(500); 

        
        builder.Property(i => i.Description)
            .HasMaxLength(1000); 

        
        builder.Property(i => i.Format)
            .IsRequired()
            .HasMaxLength(100); 

        
    }
}


File: Shared\Media\VideoConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared.Media;
public class VideoConfiguration : IEntityTypeConfiguration<Video>
{
    public void Configure(EntityTypeBuilder<Video> builder)
    {
        builder.ToTable("Videos");

        
        builder.HasKey(u => u.Id);

        builder.Property(v => v.Duration).IsRequired();
        builder.Property(v => v.Resolution).IsRequired().HasMaxLength(10);
        builder.Property(v => v.Format).IsRequired().HasMaxLength(10);
    }
}


File: Shared\ReviewConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared;
public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews");
        
        
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Title)
            .IsRequired()
            .HasMaxLength(200);  

        builder.Property(r => r.ReviewText)
            .IsRequired();

        builder.Property(r => r.Rating)
            .IsRequired();

        
        builder.Property(r => r.HelpfulCount)
            .HasDefaultValue(0);

    }

}


File: Shared\SEOConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared;
public class SEOConfiguration : IEntityTypeConfiguration<SEO>
{
    public void Configure(EntityTypeBuilder<SEO> builder)
    {
        builder.ToTable("SEOs");

        builder.HasKey(seo => seo.Id);

        
        builder.Property(seo => seo.MetaTitle)
            .IsRequired()
            .HasMaxLength(255);  

        builder.Property(seo => seo.MetaDescription)
            .HasMaxLength(500);  

        builder.Property(seo => seo.MetaKeywords)
            .HasMaxLength(500);  

        builder.Property(seo => seo.Slug)
            .IsRequired()
            .HasMaxLength(255);  

        
        builder.HasMany(seo => seo.Products)
            .WithOne(p => p.SEO)
            .HasForeignKey(p => p.SEOId)
            .OnDelete(DeleteBehavior.Restrict);  

        builder.HasMany(seo => seo.Categories)
            .WithOne(c => c.SEO)
            .HasForeignKey(c => c.SEOId)
            .OnDelete(DeleteBehavior.Restrict);  
    }
}


## Directory: Shared\Social

File: Shared\Social\SocialEngagementConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared.Social;
public class SocialEngagementConfiguration : IEntityTypeConfiguration<SocialEngagement>
{
    public void Configure(EntityTypeBuilder<SocialEngagement> builder)
    {
        
        builder.ToTable("SocialEngagements");

        
        builder.HasKey(se => se.Id);

        
        builder.HasOne(se => se.Challenge)
            .WithMany(c => c.SocialEngagements)
            .HasForeignKey(se => se.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);  

        
        builder.HasMany(se => se.UserEngagements)
            .WithOne(ue => ue.SocialEngagement)
            .HasForeignKey(ue => ue.SocialEngagementId)
            .OnDelete(DeleteBehavior.Cascade);

        
        builder.HasMany(se => se.Comments)
            .WithOne(c => c.SocialEngagement)
            .HasForeignKey(c => c.SocialEngagementId)
            .OnDelete(DeleteBehavior.Cascade);

        
        builder.Property(se => se.Likes)
            .IsRequired();

        builder.Property(se => se.Dislikes)
            .IsRequired();

        builder.Property(se => se.Shares)
            .IsRequired();

        builder.Property(se => se.CommentsCount)
            .IsRequired();

        builder.Property(se => se.ParticipantsCount)
            .IsRequired();

        builder.Property(se => se.CompletionRate)
            .HasColumnType("decimal(5, 2)");  

        builder.Property(se => se.Followers)
            .IsRequired();
    }
}


File: Shared\Social\UserInteractionConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Interactions;
public class UserInteractionConfiguration : IEntityTypeConfiguration<UserInteraction>
{
    public void Configure(EntityTypeBuilder<UserInteraction> builder)
    {
        builder.HasKey(ui => ui.Id);

        builder.Property(ui => ui.InteractionType).IsRequired();
        builder.Property(ui => ui.InteractionDate).IsRequired();

        builder.HasOne(ui => ui.User)
               .WithMany()
               .HasForeignKey(ui => ui.UserId)
               .IsRequired();

        builder.HasOne(ui => ui.Challenge)
               .WithMany()
               .HasForeignKey(ui => ui.ChallengeId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ui => ui.SocialEngagement)
               .WithMany()
               .HasForeignKey(ui => ui.SocialEngagementId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}


File: Shared\TagConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared;
public class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        
        builder.HasKey(t => t.Id);

        
        builder.Property(t => t.Name)
               .IsRequired()
               .HasMaxLength(100); 

        
        builder.HasMany(t => t.Challenges)
               .WithMany(c => c.Tags)
               .UsingEntity(j => j.ToTable("ChallengeTags")); 
    }
}


File: Shared\TodoItemConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared;
public class TodoItemConfiguration : IEntityTypeConfiguration<TodoItem>
{
    public void Configure(EntityTypeBuilder<TodoItem> builder)
    {
        builder.Property(t => t.Title)
            .HasMaxLength(200)
            .IsRequired();
    }
}


File: Shared\TodoListConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared;
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


File: Shared\UserConfiguration.cs

namespace RoyalCode.Infrastructure.Data.Configurations.Shared;
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
      
        
        builder.HasKey(u => u.Id);

        
        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(100);

        
        builder.HasIndex(u => u.Email)
            .IsUnique(); 

        

        
        builder.HasMany(u => u.CreatedChallenges)
            .WithOne(c => c.CreatorUser)
            .HasForeignKey(c => c.CreatorUserId)
            .OnDelete(DeleteBehavior.NoAction);

        
        builder.HasMany(u => u.ChallengeParticipations)
            .WithOne(cp => cp.User)
            .HasForeignKey(cp => cp.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        
        builder.HasMany(u => u.UserAchievements)
            .WithOne(ua => ua.User)
            .HasForeignKey(ua => ua.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        
        builder.HasMany(u => u.UserRouteProgresses)
            .WithOne(urp => urp.User)
            .HasForeignKey(urp => urp.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        
        builder.HasMany(u => u.Rewards)
            .WithOne(ur => ur.User)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        
        builder.HasMany(u => u.PerformanceMetrics)
            .WithOne(pm => pm.User)
            .HasForeignKey(pm => pm.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        
        builder.HasMany(u => u.Comments)
            .WithOne(c => c.User)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        
        builder.HasMany(u => u.EmergencyContacts)
            .WithOne(ec => ec.User)
            .HasForeignKey(ec => ec.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        
        builder.HasMany(u => u.SocialEngagements)
            .WithOne(se => se.User)
            .HasForeignKey(se => se.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        
        builder.HasOne(u => u.Stats)
            .WithOne(us => us.User)
            .HasForeignKey<UserStats>(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(u => u.DashboardSettings)
            .WithOne(ds => ds.User)
            .HasForeignKey<UserDashboardSettings>(ds => ds.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        
        builder.HasMany(u => u.Goals)
            .WithOne(g => g.User)
            .HasForeignKey(g => g.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        
        builder.HasMany(u => u.Reviews)  
            .WithOne(cr => cr.User)               
            .HasForeignKey(cr => cr.UserId)       
            .OnDelete(DeleteBehavior.Cascade);    

    }
}


