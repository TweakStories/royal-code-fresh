erDiagram
    %% Base Entities
    class BaseEntity {
        <<abstract>>
        UUID Id
    }

    class BaseAuditableEntity {
        <<abstract>>
        UUID Id
        DateTimeOffset Created
        string? CreatedBy
        DateTimeOffset LastModified
        string? LastModifiedBy
    }

    %% Users and Preferences
    class User {
        UUID UserId
        string UserName
        string Email
        string ProfileImageUrl
        // Navigation Properties
        UserPreferences Preferences
        ICollection<Challenge> CreatedChallenges
        ICollection<ChallengeParticipation> Participations
        ICollection<UserAchievement> Achievements
        ICollection<UserReward> Rewards
        UserStats Stats
        ICollection<UserGoal> Goals
        ICollection<UserHealthMetric> HealthMetrics
        ICollection<PerformanceMetric> PerformanceMetrics
        ICollection<SocialEngagement> SocialEngagements
        ICollection<HealthIntegration> HealthIntegrations
        ICollection<EmergencyContact> EmergencyContacts
        ICollection<UserGPSData> GPSData
        ICollection<Comment> Comments
        ICollection<Notification> Notifications
        ICollection<User> Friends
        ICollection<Team> Teams
        ICollection<ActivityLog> ActivityLogs
        ICollection<PrivacySetting> PrivacySettings
    }
    User --|> BaseAuditableEntity : inherits

    class UserPreferences {
        UUID UserId
        string PreferredLanguage
        string MeasurementUnits
        string MapTheme
        string[] DisplayNodeTypes
        NotificationSettings NotificationPreferences
        bool IsDarkModeEnabled
        string LayoutPreferences
        // Navigation Properties
        User User
    }
    UserPreferences --|> BaseEntity : inherits
    User ||--|| UserPreferences : has

    class NotificationSettings {
        bool MilestoneAlerts
        bool ProgressUpdates
        bool ChallengeInvitations
        // Additional notification types...
    }

    %% Notifications
    class Notification {
        UUID NotificationId
        UUID UserId
        string Message
        NotificationType Type
        bool IsRead
        DateTimeOffset CreatedAt
        // Navigation Properties
        User User
    }
    Notification --|> BaseEntity : inherits
    User ||--o{ Notification : receives

    %% Privacy Settings
    class PrivacySetting {
        UUID PrivacySettingId
        UUID UserId
        DataType DataType
        VisibilityLevel Visibility
        // Navigation Properties
        User User
    }
    PrivacySetting --|> BaseEntity : inherits
    User ||--o{ PrivacySetting : has

    %% Error Logging
    class ErrorLog {
        UUID ErrorLogId
        UUID? UserId
        string ErrorMessage
        string StackTrace
        DateTimeOffset Timestamp
        ErrorSeverity Severity
        // Navigation Properties
        User User
    }
    ErrorLog --|> BaseEntity : inherits
    User ||--o{ ErrorLog : may_have

    %% Activity Logging
    class ActivityLog {
        UUID ActivityLogId
        UUID UserId
        UUID ChallengeId
        DateTimeOffset Timestamp
        ActivityType ActivityType
        json Data
        // Navigation Properties
        User User
        Challenge Challenge
    }
    ActivityLog --|> BaseEntity : inherits
    User ||--o{ ActivityLog : logs
    Challenge ||--o{ ActivityLog : has

    %% Challenges and Related Entities
    class Challenge {
        UUID ChallengeId
        string Title
        string Description
        DateTimeOffset StartDate
        DateTimeOffset EndDate
        DateTimeOffset RegistrationDeadline
        ChallengeStatus Status
        PrivacyLevel Privacy
        UUID DifficultyLevelId
        string CoverImageUrl
        UUID CreatorUserId
        UUID? TemplateId
        int MaxParticipants
        bool IsRecurring
        string RecurrencePattern
        Cost CostDetails
        bool IsVirtual
        bool IsGroupChallenge
        string TimeZone
        // Navigation Properties
        User CreatorUser
        Template Template
        ICollection<ChallengeComponent> ChallengeComponents
        ICollection<ChallengeParticipation> Participations
        ICollection<PerformanceMetric> PerformanceMetrics
        ICollection<ChallengeReview> Reviews
        ICollection<Rule> Rules
        ICollection<Reward> Rewards
        ICollection<SocialEngagement> SocialEngagements
        DifficultyLevel DifficultyLevel
        ICollection<EnvironmentRequirement> EnvironmentRequirements
        ICollection<EquipmentRequirement> EquipmentRequirements
        ICollection<ModeOfCompletionRequirement> ModeOfCompletionRequirements
        ICollection<StatsRequirement> StatsRequirements
        ICollection<Tag> Tags
        Location Location
        ChallengeRoute Route
        ICollection<AnalyticsData> AnalyticsData
        ICollection<ActivityLog> ActivityLogs
    }
    Challenge --|> BaseAuditableEntity : inherits

    class ChallengeParticipation {
        UUID ParticipationId
        UUID UserId
        UUID ChallengeId
        DateTimeOffset JoinedOn
        ParticipationStatus Status
        double ProgressPercentage
        // Navigation Properties
        User User
        Challenge Challenge
        ICollection<ProgressUpdate> ProgressUpdates
        UserRouteProgress RouteProgress
    }
    ChallengeParticipation --|> BaseAuditableEntity : inherits

    %% Challenge Route and Navigation
    class ChallengeRoute {
        UUID RouteId
        UUID ChallengeId
        decimal TotalDistanceMeters
        string Name
        string Description
        string Theme
        DateTimeOffset DateCreated
        // Navigation Properties
        Challenge Challenge
        ICollection<RouteNode> RouteNodes
    }
    ChallengeRoute --|> BaseAuditableEntity : inherits

    class RouteNode {
        UUID NodeId
        UUID ChallengeRouteId
        UUID LocationId
        int SequenceNumber
        RouteNodeType Type
        NodeStatus Status
        UUID? ContentId
        UUID? RewardId
        // Navigation Properties
        ChallengeRoute ChallengeRoute
        Location Location
        Reward Reward
        Content Content
    }
    RouteNode --|> BaseAuditableEntity : inherits

    class Content {
        UUID ContentId
        string Title
        string Body
        string MediaUrl
        ContentType ContentType
        // Navigation Properties
        RouteNode RouteNode
    }
    Content --|> BaseEntity : inherits
    RouteNode ||--|| Content : has

    class UserRouteProgress {
        UUID ProgressId
        UUID ChallengeParticipationId
        UUID? CurrentRouteNodeId
        decimal ProgressPercentage
        bool IsCompleted
        // Navigation Properties
        ChallengeParticipation Participation
        RouteNode CurrentRouteNode
        ICollection<UserGPSData> GPSData
        ICollection<NodeUnlock> NodesUnlocked
    }
    UserRouteProgress --|> BaseAuditableEntity : inherits

    class NodeUnlock {
        UUID NodeUnlockId
        UUID UserRouteProgressId
        UUID RouteNodeId
        DateTimeOffset UnlockedOn
        // Navigation Properties
        UserRouteProgress UserRouteProgress
        RouteNode RouteNode
    }
    NodeUnlock --|> BaseEntity : inherits
    UserRouteProgress ||--o{ NodeUnlock : has
    RouteNode ||--o{ NodeUnlock : involved_in

    class UserGPSData {
        UUID GPSDataId
        UUID UserRouteProgressId
        DateTimeOffset Timestamp
        decimal Latitude
        decimal Longitude
        decimal? Altitude
        decimal? Speed
        // Navigation Properties
        UserRouteProgress RouteProgress
    }
    UserGPSData --|> BaseAuditableEntity : inherits

    class Location {
        UUID LocationId
        decimal Latitude
        decimal Longitude
        string Address
        // Navigation Properties
        ICollection<Challenge> Challenges
        ICollection<RouteNode> RouteNodes
    }
    Location --|> BaseAuditableEntity : inherits

    %% Achievements and Rewards
    class Achievement {
        UUID AchievementId
        string Title
        string Description
        string CriteriaType
        string CriteriaData
        string BadgeImageUrl
        UUID? AssociatedRouteNodeId
        // Navigation Properties
        ICollection<UserAchievement> UserAchievements
        RouteNode AssociatedRouteNode
    }
    Achievement --|> BaseAuditableEntity : inherits

    class UserAchievement {
        UUID UserAchievementId
        UUID UserId
        UUID AchievementId
        DateTimeOffset DateEarned
        // Navigation Properties
        User User
        Achievement Achievement
    }
    UserAchievement --|> BaseAuditableEntity : inherits

    class Reward {
        UUID RewardId
        string Title
        string Description
        RewardType Type
        string Value
        CurrencyType CurrencyType
        DateTimeOffset? ExpirationDate
        // Navigation Properties
        ICollection<UserReward> UserRewards
        ICollection<RouteNode> RouteNodes
    }
    Reward --|> BaseAuditableEntity : inherits

    class UserReward {
        UUID UserRewardId
        UUID UserId
        UUID RewardId
        DateTimeOffset DateEarned
        DateTimeOffset? DateRedeemed
        RewardStatus Status
        // Navigation Properties
        User User
        Reward Reward
    }
    UserReward --|> BaseAuditableEntity : inherits

    %% Performance Metrics and Health Data
    class PerformanceMetric {
        UUID PerformanceMetricId
        UUID UserId
        UUID ChallengeId
        decimal TimeTakenSeconds
        decimal DistanceCoveredMeters
        decimal AverageSpeedMetersPerSecond
        decimal CaloriesBurned
        decimal ElevationGainMeters
        int AverageHeartRate
        int MaxHeartRate
        int StepsCount
        bool IsCompleted
        string Outcome
        decimal TotalDistanceMeters
        string EncodedRouteData
        decimal PaceSecondsPerKilometer
        decimal HydrationLevel
        string WeatherConditions
        string DeviceUsed
        string LocationCoordinates
        int FatigueLevel
        int SleepQualityBeforeActivity
        string SurfaceType
        decimal HeartRateVariability
        // Navigation Properties
        User User
        Challenge Challenge
    }
    PerformanceMetric --|> BaseAuditableEntity : inherits

    class UserHealthMetric {
        UUID HealthMetricId
        UUID UserId
        DateTimeOffset Timestamp
        HealthMetricType MetricType
        double Value
        // Navigation Properties
        User User
    }
    UserHealthMetric --|> BaseAuditableEntity : inherits

    %% Social Engagements
    class SocialEngagement {
        UUID SocialEngagementId
        UUID ChallengeId
        int Likes
        int Dislikes
        int Shares
        int CommentsCount
        int ParticipantsCount
        decimal CompletionRate
        int Followers
        // Navigation Properties
        Challenge Challenge
        ICollection<UserEngagement> UserEngagements
        ICollection<Comment> Comments
    }
    SocialEngagement --|> BaseAuditableEntity : inherits

    class UserEngagement {
        UUID UserEngagementId
        UUID SocialEngagementId
        UUID UserId
        EngagementType EngagementType
        string Content
        // Navigation Properties
        User User
        SocialEngagement SocialEngagement
    }
    UserEngagement --|> BaseAuditableEntity : inherits

    class Comment {
        UUID CommentId
        UUID SocialEngagementId
        UUID UserId
        string CommentText
        DateTimeOffset CreatedAt
        // Navigation Properties
        User User
        SocialEngagement SocialEngagement
    }
    Comment --|> BaseAuditableEntity : inherits

    %% Environmental Requirements
    class Environment {
        UUID EnvironmentId
        string Name
        UUID? ParentId
        string Description
        // Navigation Properties
        Environment Parent
        ICollection<Environment> Children
        ICollection<EnvironmentRequirement> EnvironmentRequirements
    }
    Environment --|> BaseAuditableEntity : inherits

    class EnvironmentRequirement {
        UUID EnvironmentRequirementId
        UUID ChallengeId
        UUID EnvironmentId
        // Navigation Properties
        Challenge Challenge
        Environment Environment
    }
    EnvironmentRequirement --|> BaseAuditableEntity : inherits

    %% Equipment
    class Equipment {
        UUID EquipmentId
        string Name
        string Description
        // Navigation Properties
        ICollection<EquipmentRequirement> EquipmentRequirements
    }
    Equipment --|> BaseAuditableEntity : inherits

    class EquipmentRequirement {
        UUID EquipmentRequirementId
        UUID ChallengeId
        UUID EquipmentId
        // Navigation Properties
        Challenge Challenge
        Equipment Equipment
    }
    EquipmentRequirement --|> BaseAuditableEntity : inherits

    %% Mode of Completion
    class ModeOfCompletion {
        UUID ModeOfCompletionId
        string Name
        UUID? ParentId
        string Description
        // Navigation Properties
        ModeOfCompletion Parent
        ICollection<ModeOfCompletion> Children
        ICollection<ModeOfCompletionRequirement> ModeOfCompletionRequirements
    }
    ModeOfCompletion --|> BaseAuditableEntity : inherits

    class ModeOfCompletionRequirement {
        UUID ModeOfCompletionRequirementId
        UUID ChallengeId
        UUID ModeOfCompletionId
        // Navigation Properties
        Challenge Challenge
        ModeOfCompletion ModeOfCompletion
    }
    ModeOfCompletionRequirement --|> BaseAuditableEntity : inherits

    %% Difficulty Level
    class DifficultyLevel {
        UUID DifficultyLevelId
        string LevelName
        string Description
        string PhysicalRequirements
        string MentalRequirements
        string TimeCommitment
        string RecommendedPreparation
        string Rewards
        // Navigation Properties
        ICollection<Challenge> Challenges
    }
    DifficultyLevel --|> BaseAuditableEntity : inherits

    %% Stats Requirements
    class StatsRequirement {
        UUID StatsRequirementId
        string Category
        string LevelName
        string Description
        // Navigation Properties
        ICollection<Challenge> Challenges
    }
    StatsRequirement --|> BaseAuditableEntity : inherits

    %% Challenge Reviews and Rules
    class ChallengeReview {
        UUID ChallengeReviewId
        UUID ChallengeId
        UUID UserId
        string ReviewText
        int Rating
        // Navigation Properties
        Challenge Challenge
        User User
    }
    ChallengeReview --|> BaseAuditableEntity : inherits

    class Rule {
        UUID RuleId
        UUID ChallengeId
        string Description
        int Order
        // Navigation Properties
        Challenge Challenge
    }
    Rule --|> BaseAuditableEntity : inherits

    %% User Stats and Goals
    class UserStats {
        UUID UserStatsId
        UUID UserId
        double TotalDistance
        int TotalSteps
        int TotalCaloriesBurned
        int MaxHeartRate
        double AverageHeartRate
        // Navigation Properties
        User User
    }
    UserStats --|> BaseAuditableEntity : inherits

    class UserGoal {
        UUID UserGoalId
        UUID UserId
        string GoalTitle
        string GoalDescription
        bool IsCompleted
        DateTimeOffset StartDate
        DateTimeOffset EndDate
        double Progress
        // Navigation Properties
        User User
    }
    UserGoal --|> BaseAuditableEntity : inherits

    %% Health Integration
    class HealthIntegration {
        UUID HealthIntegrationId
        UUID UserId
        IntegrationType IntegrationType
        string AccessToken
        string RefreshToken
        DateTimeOffset TokenExpiry
        // Navigation Properties
        User User
    }
    HealthIntegration --|> BaseAuditableEntity : inherits

    %% Emergency Contact
    class EmergencyContact {
        UUID EmergencyContactId
        UUID UserId
        string Name
        string PhoneNumber
        string Relationship
        // Navigation Properties
        User User
    }
    EmergencyContact --|> BaseAuditableEntity : inherits

    %% Teams and Friendships
    class Team {
        UUID TeamId
        string TeamName
        string Description
        // Navigation Properties
        ICollection<User> Members
        ICollection<Challenge> Challenges
    }
    Team --|> BaseAuditableEntity : inherits

    User ||--o{ Team : member_of

    %% Relationships
    User ||--o{ Challenge : creates
    User ||--o{ ChallengeParticipation : participates_in
    User ||--o{ UserAchievement : earns
    User ||--o{ UserReward : receives
    User ||--o{ UserHealthMetric : has
    User ||--|| UserStats : has
    User ||--o{ UserGoal : sets
    User ||--|| UserPreferences : configures
    User ||--o{ AnalyticsData : contributes_to
    User ||--o{ HealthIntegration : integrates
    User ||--o{ PerformanceMetric : records
    User ||--o{ SocialEngagement : engages_in
    User ||--o{ EmergencyContact : has
    User ||--o{ UserGPSData : generates
    User ||--o{ Comment : writes
    User ||--o{ Notification : receives
    User ||--o{ PrivacySetting : has
    User ||--o{ ActivityLog : performs
    User ||--o{ ErrorLog : may_have
    User ||--o{ User : friends_with

    Challenge ||--o{ ChallengeParticipation : has
    Challenge ||--o{ ChallengeComponent : consists_of
    Challenge ||--o{ PerformanceMetric : has
    Challenge ||--o{ ChallengeReview : has
    Challenge ||--o{ Rule : has
    Challenge ||--o{ Reward : offers
    Challenge ||--o{ SocialEngagement : has
    Challenge ||--o{ Tag : tagged_with
    Challenge ||--o{ EnvironmentRequirement : requires
    Challenge ||--o{ EquipmentRequirement : requires
    Challenge ||--o{ ModeOfCompletionRequirement : requires
    Challenge ||--|| DifficultyLevel : has
    Challenge ||--o{ StatsRequirement : has
    Challenge ||--|| User : created_by
    Challenge ||--|| Template : based_on
    Challenge }o--|| Location : at_location
    Challenge ||--o{ ChallengeRoute : has_route
    Challenge ||--o{ AnalyticsData : generates
    Challenge ||--o{ ActivityLog : records

    ChallengeParticipation ||--o{ ProgressUpdate : has
    ChallengeParticipation }o--|| Challenge : belongs_to
    ChallengeParticipation }o--|| User : belongs_to
    ChallengeParticipation ||--|| UserRouteProgress : has_progress

    ChallengeRoute }o--|| Challenge : belongs_to
    ChallengeRoute ||--o{ RouteNode : consists_of

    RouteNode }o--|| ChallengeRoute : part_of
    RouteNode }o--|| Location : at_location
    RouteNode ||--|| Content : has
    RouteNode ||--o{ Reward : may_grant
    RouteNode ||--o{ NodeUnlock : involved_in
    RouteNode ||--o{ Achievement : may_trigger

    UserRouteProgress }o--|| ChallengeParticipation : belongs_to
    UserRouteProgress }o--|| RouteNode : current_node
    UserRouteProgress ||--o{ UserGPSData : has_gps_data
    UserRouteProgress ||--o{ NodeUnlock : records

    UserGPSData }o--|| UserRouteProgress : belongs_to

    Location ||--o{ Challenge : referenced_by
    Location ||--o{ RouteNode : used_in

    UserAchievement }o--|| Achievement : references
    UserReward }o--|| User : belongs_to
    UserReward }o--|| Reward : references
    Reward ||--o{ UserReward : has
    Reward ||--o{ RouteNode : may_be_unlocked_by

    PerformanceMetric }o--|| User : belongs_to
    PerformanceMetric }o--|| Challenge : belongs_to
    UserHealthMetric }o--|| User : belongs_to

    SocialEngagement ||--o{ UserEngagement : has
    SocialEngagement ||--o{ Comment : has
    SocialEngagement }o--|| Challenge : associated_with
    UserEngagement }o--|| User : made_by
    UserEngagement }o--|| SocialEngagement : belongs_to
    Comment }o--|| User : written_by
    Comment }o--|| SocialEngagement : belongs_to

    Environment ||--o{ Environment : parent_of
    Environment ||--o{ EnvironmentRequirement : referenced_by
    EnvironmentRequirement }o--|| Environment : references
    EnvironmentRequirement }o--|| Challenge : specifies

    Equipment ||--o{ EquipmentRequirement : specified_in
    EquipmentRequirement }o--|| Equipment : references
    EquipmentRequirement }o--|| Challenge : relates_to

    ModeOfCompletion ||--o{ ModeOfCompletion : parent_of
    ModeOfCompletion ||--o{ ModeOfCompletionRequirement : specified_in
    ModeOfCompletionRequirement }o--|| ModeOfCompletion : references
    ModeOfCompletionRequirement }o--|| Challenge : relates_to

    DifficultyLevel ||--o{ Challenge : used_in

    StatsRequirement ||--o{ Challenge : specified_in

    %% Additional Relationships
    User ||--o{ Team : member_of
    Team ||--o{ Challenge : participates_in

    User ||--o{ Friendship : has
    Friendship ||--|| User : between

    %% Friendship Entity
    class Friendship {
        UUID FriendshipId
        UUID UserId1
        UUID UserId2
        DateTimeOffset CreatedAt
        FriendshipStatus Status
        // Navigation Properties
        User User1
        User User2
    }
    Friendship --|> BaseEntity : inherits

    %% Connecting Users through Friendship
    User ||--o{ Friendship : has
    Friendship ||--|| User : connects
