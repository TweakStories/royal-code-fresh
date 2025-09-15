// // libs/mocks/src/lib/in-memory-data.service.ts
// // Dont use logger, because it will cause circular dependency issues and this is only a mock service
// import { inject, Injectable } from '@angular/core';
// import { HttpHeaders } from '@angular/common/http';
// import {
//   InMemoryDbService,
//   ParsedRequestUrl,
//   RequestInfo,
//   RequestInfoUtilities,
//   ResponseOptions,
// } from 'angular-in-memory-web-api';
// import { faker } from '@faker-js/faker';
// import { Observable } from 'rxjs';
// import { PaginatedList } from '@royal-code/shared/utils';

// import { LogEntry } from '@royal-code/core/core-logging';
// import {
//   AppIcon,
//   ApplicationSettings,
//   CharacterStats,
//   Conversation,
//   ConversationType,
//   Image,
//   ImageSourceType,
//   ImageVariant,
//   Lifeskill,
//   LifeskillType,
//   Message,
//   PrivacyLevel,
//   Quest,
//   QuestObjective,
//   QuestStatus,
//   SkillDefinition,
//   StatDefinition,
//   StatType,
//   UserSkill,
//   Challenge,
//   ChallengeSummary,
//   ChallengeStatus,
//   Participant,
//   DifficultyLevel,
//   ModeOfCompletion,
//   Environment,
//   Rule,
//   FAQ,
//   Equipment,
//   EquipmentItem,
//   Feed,
//   ReactionSummary,
//   FeedItem,
//   FeedReply,
//   ReactionType,
//   Tag,
//   Route,
//   TrackingPoint,
//   Media,
//   MediaType,
//   NodeSummary,
//   NodeFull,
//   NodeType,
//   NodeStatus,
//   Profile,
//   DateTimeInfo,
//   ChallengeObjective,
//   ObjectiveType,
// } from '@royal-code/shared/domain';


// /**
//  * Helper function to convert a Date object to a DateTimeInfo structure.
//  * @param date - The Date object to convert.
//  * @returns A DateTimeInfo object.
//  */
// function toDateTimeInfo(date: Date): DateTimeInfo {
//   return {
//     iso: date.toISOString(),
//     timestamp: date.getTime(),
//     utcOffsetMinutes: date.getTimezoneOffset() * -1, // HIER DE FIX
//     formatted: date.toLocaleString('nl-BE', { timeZone: 'Europe/Brussels' }),
//   };
// }

// /**
//  * @Injectable InMemoryDataService
//  * @implements InMemoryDbService
//  * @description Provides an in-memory mock database for development and testing.
//  */
// @Injectable({
//   providedIn: 'root',
// })
// export class InMemoryDataService implements InMemoryDbService {
//   // private logger = inject(LoggerService);


//   // --- Configuration Constants ---
//   private readonly amountOfChallenges = 10;
//   private readonly amountOfProfiles = 5;
//   private readonly amountOfNodesPerRoute = 8;
//   // *** AANGEPAST: Maximaal 30 feed items ***
//   private readonly amountOfFeedItemsPerFeed = 30;
//   private readonly amountOfRepliesPerFeedItem = 2;
//   private readonly amountOfFAQsPerChallenge = 2;
//   private readonly amountOfParticipantsPerChallenge = 4;
//   private readonly amountOfMediaPerGallery = 5;
//   private readonly amountOfTagsPerItem = 1;
//   private readonly amountOfEquipmentGroups = 1;
//   private readonly amountOfEquipmentItemsPerGroup = 2;
//   private readonly amountOfRules = 2;
//   private readonly amountOfObjectivesPerChallenge = 3; // Added new constant


//   // *** NIEUW: Constante voor globale feed ID ***
//   private readonly GLOBAL_SOCIAL_FEED_ID = 'global-social-feed-001';

//   private readonly MAP_CENTER_LAT = 52.37; // Amsterdam
//   private readonly MAP_CENTER_LNG = 4.89;
//   private readonly MAP_SPREAD_RADIUS = 1.5; // Spreidingsradius in graden (ca. 160km)

//     // Constants voor AI Bot
//     private readonly AI_BOT_USER_ID = 'ai-coach-bot-001'; // Unieke ID voor de bot
//     private readonly AI_BOT_DISPLAY_NAME = 'Challenger AI Coach';
//     private readonly AI_BOT_AVATAR_URL = 'assets/images/placeholder-100x100.jpg'; // Zorg dat dit bestand bestaat


//   // --- Global Sequential ID Counters ---
//   private nodeIdCounter = 0;
//   private feedItemIdCounter = 0;
//   private replyIdCounter = 0;
//   private mediaIdCounter = 0;
//   private tagIdCounter = 0;
//   private faqIdCounter = 0;
//   private equipmentIdCounter = 0;
//   private equipmentItemIdCounter = 0;
//   private ruleIdCounter = 0;

//   private readonly possibleModeIcons: string[] = [
//     'activity',
//     'bike',
//     'run',
//     'walk',
//     'car',
//     'ship',
//     'plane',
//     'rocket',
//     'footprints',
//   ]; // Voeg meer toe!
//   private readonly possibleEnvIcons: string[] = [
//     'building-2',
//     'home',
//     'trees',
//     'mountain-snow',
//     'waves',
//     'sailboat',
//     'factory',
//     'bridge',
//   ]; // Voeg meer toe!



//   private static dbInitialized = false;

//   private static db: {
//     challenges: Challenge[];
//     profiles: Profile[];
//     routes: Route[];
//     filters: any[];
//     nodes: NodeFull[];
//     socialFeeds: Record<
//       string,
//       Feed & { repliesByItem?: Record<string, FeedReply[]> }
//     >;
//     logs: LogEntry[];
//     quests: Quest[];
//     statDefinitions: StatDefinition[];
//     characterStatsStore: Record<string, CharacterStats>;
//     lifeskillsByUser: Record<string, Lifeskill[]>;
//     chatConversations: Conversation[];
//     chatMessages: Record<string, Message[]>;
//     skillDefinitions: SkillDefinition[];
//     userSkills: UserSkill[];
//   } = InMemoryDataService.resetDb();

//   /** Resets the static database structure. */
//   private static resetDb() {
//     return {
//       challenges: [],
//       profiles: [],
//       routes: [],
//       filters: [],
//       nodes: [],
//       socialFeeds: {},
//       logs: [],
//       quests: [],
//       statDefinitions: [],
//       characterStatsStore: {},
//       lifeskillsByUser: {},
//       chatConversations: [],
//       chatMessages: {},
//       skillDefinitions: [],
//       userSkills: [],
//     };
//   }

//   /** Resets ID counters. */
//   private resetCounters(): void {
//     this.nodeIdCounter = 0;
//     this.feedItemIdCounter = 0;
//     this.replyIdCounter = 0;
//     this.mediaIdCounter = 0;
//     this.tagIdCounter = 0;
//     this.faqIdCounter = 0;
//     this.equipmentIdCounter = 0;
//     this.equipmentItemIdCounter = 0;
//     this.ruleIdCounter = 0;

//     console.log('[InMemoryDataService] ID counters reset.');
//   }

//   constructor() {
//     this.resetCounters();
//   }

//   private logParsing(msg: string, url?: string): void {
//     // Only log if it's not an asset request to reduce noise
//     if (!url || !url.includes('/assets/')) {
//       console.log(`[InMemoryDb Parser] ${msg}`);
//     }
//   }

// // Helper voor mock DateTimeInfo (al aanwezig, maar ter referentie)
// private mockDateTime(): DateTimeInfo {
//   const now = new Date();
//   return {
//     iso: now.toISOString(),
//     timestamp: now.getTime(),
//     utcOffsetMinutes: now.getTimezoneOffset() * -1,
//     formatted: now.toLocaleString('nl-BE', { timeZone: 'Europe/Brussels' }),
//   };
// }


//   /** Creates the in-memory database. */
//   createDb(reqInfo?: RequestInfo) {
//     if (!InMemoryDataService.dbInitialized) {
//       console.log('[InMemoryDataService] First time initialization of mock database...');
//       InMemoryDataService.db = InMemoryDataService.resetDb();
//       this.resetCounters();
//       this.initializeDb();
//       InMemoryDataService.dbInitialized = true;
//     } else {
//       console.log('[InMemoryDataService] Re-using existing static mock database.');
//     }


//     return {
//       challenges: InMemoryDataService.db.challenges,
//       profiles: InMemoryDataService.db.profiles,
//       routes: InMemoryDataService.db.routes,
//       filters: InMemoryDataService.db.filters,
//       nodes: InMemoryDataService.db.nodes,
//       logs: InMemoryDataService.db.logs,
//       quests: InMemoryDataService.db.quests,
//       statDefinitions: InMemoryDataService.db.statDefinitions,
//       characterStatsStore: InMemoryDataService.db.characterStatsStore,
//       userLifeskills: InMemoryDataService.db.lifeskillsByUser,
//       socialFeeds: InMemoryDataService.db.socialFeeds,
//       chatConversations: InMemoryDataService.db.chatConversations,
//       chatMessages: InMemoryDataService.db.chatMessages,
//       feedItemReplies: [],
//       socialFeedItems: [],
//       skillDefinitions: InMemoryDataService.db.skillDefinitions,
//       userSkills: InMemoryDataService.db.userSkills,
//     };
//   }

//   /**
//    * @private
//    * @method initializeDb
//    * @description Orchestrates the generation of all mock data for the in-memory database,
//    *              ensuring relationships (like Nodes to Challenges) are correctly established.
//    */
//   private initializeDb(): void {
//     console.log('[InMemoryDataService] Starting mock data generation...');
//     this.resetCounters();

//     // 1. Genereer Profielen
//     const adminProfile: Profile = {
//       id: 'admin-profile-0',
//       displayName: 'ChallengerAdmin',
//       avatar: {
//         id: 'avatar-admin-0',
//         type: MediaType.IMAGE,
//         title: 'Admin Avatar',
//         altText: 'ChallengerAdmin Avatar',
//         sourceType: ImageSourceType.SYSTEM_DEFAULT,
//         createdAt: this.mockDateTime(),
//         originalMasterDimensions: { width: 100, height: 100 },
//         variants: [
//           {
//             url: faker.image.avatarGitHub(),
//             width: 100,
//             height: 100,
//             purpose: 'avatar',
//             format: 'jpeg',
//             descriptor: '100w'
//           }
//         ]
//       },
//       level: 99,
//       reputation: 10000
//     };
//     const regularProfiles = this.generateMockProfiles(this.amountOfProfiles - 1);
//     const allProfiles = [adminProfile, ...regularProfiles];
//     InMemoryDataService.db.profiles = allProfiles;
//     console.log(`[InMemoryDataService] Generated ${allProfiles.length} profiles.`);


//     // 2. Genereer Routes
//     const routes = Array.from({ length: this.amountOfChallenges }, (_, i) =>
//       this.generateMockRoute(allProfiles[i % allProfiles.length].id, `route-${i + 1}`)
//     );
//     InMemoryDataService.db.routes = routes;
//     console.log(`[InMemoryDataService] Generated ${routes.length} routes.`);

//     // 3. Verzamel Nodes
//     const allNodesMap = new Map<string, NodeFull>();
//     routes.forEach(route => route.nodes?.forEach(node => allNodesMap.set(node.id, node)));
//     InMemoryDataService.db.nodes = Array.from(allNodesMap.values());
//     console.log(`[InMemoryDataService] Collected ${InMemoryDataService.db.nodes.length} total nodes.`);

//     // 4. Genereer Challenges
//     InMemoryDataService.db.challenges = this.generateMockChallenges(
//       this.amountOfChallenges,
//       InMemoryDataService.db.profiles,
//       InMemoryDataService.db.routes
//     );
//     console.log(`[InMemoryDataService] Generated ${InMemoryDataService.db.challenges.length} challenges.`);

//     // 5. Genereer Globale Social Feed
//     // Zorg ervoor dat dit object correct wordt geïnitialiseerd en gevuld.
//     InMemoryDataService.db.socialFeeds = {}; // BELANGRIJK: zorg dat dit een leeg object is
//     const globalFeedId = this.GLOBAL_SOCIAL_FEED_ID;
//     const feedItems = this.generateMockFeedItems(globalFeedId, allProfiles);
//     const repliesByItem: Record<string, FeedReply[]> = {};
//     feedItems.forEach(item => {
//        const replies = this.generateMockReplies(globalFeedId, item.id, allProfiles);
//        repliesByItem[item.id] = replies;
//        item.replyCount = replies.length;
//      });
//     // Hier wordt de feed daadwerkelijk toegevoegd aan de `db.socialFeeds` map
//     InMemoryDataService.db.socialFeeds[globalFeedId] = { id: globalFeedId, feedItems, repliesByItem };
//     console.log(`[InMemoryDataService] Generated 1 global social feed (${globalFeedId}) with ${feedItems.length} items. Added to db.socialFeeds.`);

//     // 6. Genereer Statische Data
//     InMemoryDataService.db.filters = this.generateMockFilters();
//     InMemoryDataService.db.logs = [];
//     console.log('[InMemoryDataService] Generated static filter data.');

//     // 7. Genereer Quests
//     const numberOfQuestsToGenerate = 20;
//     InMemoryDataService.db.quests = this.generateMockQuests(numberOfQuestsToGenerate, allProfiles);
//     console.log(`[InMemoryDataService] Generated ${InMemoryDataService.db.quests.length} quests.`);

//     // 8. Genereer Stat Definitions
//     InMemoryDataService.db.statDefinitions = this.generateMockStatDefinitions();
//     console.log(`[InMemoryDataService] Generated ${InMemoryDataService.db.statDefinitions.length} stat definitions.`);

//     // 9. Genereer Character Stats voor alle gebruikers
//     InMemoryDataService.db.characterStatsStore = {};
//     allProfiles.forEach(profile => {
//         InMemoryDataService.db.characterStatsStore[profile.id] = {
//             userId: profile.id,
//             strength: faker.number.int({ min: 5, max: 20 }),
//             dexterity: faker.number.int({ min: 5, max: 20 }),
//             intelligence: faker.number.int({ min: 5, max: 20 }),
//             luck: faker.number.int({ min: 5, max: 20 }),
//             arcane: faker.number.int({ min: 5, max: 20 }),
//             currentHealth: faker.number.int({ min: 0, max: 6 }),
//             maxHealth: 6,
//             currentMana: faker.number.int({ min: 0, max: 6 }),
//             maxMana: 6,
//             currentStamina: faker.number.int({ min: 0, max: 6 }),
//             maxStamina: 6,
//             currentExperience: faker.number.int({ min: 0, max: 999 }),
//             experienceForNextLevel: 1000,
//             level: profile.level || faker.number.int({min: 1, max: 50}),
//             skillPointsAvailable: faker.number.int({ min: 0, max: 5 }),
//             lastUpdated: Date.now()
//         };
//     });
//     console.log(`[InMemoryDataService] Generated initial character stats for ${allProfiles.length} users.`);

//     const adminIdForStats = 'admin-profile-0';
//     if (InMemoryDataService.db.characterStatsStore[adminIdForStats]) {
//         InMemoryDataService.db.characterStatsStore[adminIdForStats] = {
//             ...InMemoryDataService.db.characterStatsStore[adminIdForStats],
//             strength: 15, dexterity: 12, intelligence: 18, luck: 10, level: 99, skillPointsAvailable: 3,
//         };
//         console.log(`[InMemoryDataService] Applied specific overrides for admin character stats.`);
//     }

//     // 10. Genereer Lifeskills per gebruiker
//     InMemoryDataService.db.lifeskillsByUser = {};
//     allProfiles.forEach(profile => {
//         InMemoryDataService.db.lifeskillsByUser[profile.id] = this.generateMockUserLifeskills(profile.id);
//     });
//     console.log(`[InMemoryDataService] Generated lifeskills for ${allProfiles.length} users.`);

//     // 11. Initialiseer Chat Data (NA profielen)
//     console.log('[InMemoryDataService] Initializing mock CHAT data...');
//     this.initializeMockChatData();
//     console.log(`[InMemoryDataService] Initialized ${InMemoryDataService.db.chatConversations.length} chat conversations.`);

//     // 12. Genereer Skill Definitions
//     InMemoryDataService.db.skillDefinitions = this.generateMockSkillDefinitions();
//     console.log(`[InMemoryDataService] Generated ${InMemoryDataService.db.skillDefinitions.length} skill definitions.`);

//     InMemoryDataService.db.userSkills = [];
//     allProfiles.forEach(profile => {
//         const skillsForUser = this.generateMockUserSkills(profile.id, InMemoryDataService.db.skillDefinitions);
//         InMemoryDataService.db.userSkills.push(...skillsForUser);
//     });    console.log(`[InMemoryDataService] Generated user skills for ${allProfiles.length} users. Total UserSkills: ${InMemoryDataService.db.userSkills.length}`);


//     console.log(`[InMemoryDataService] Mock database generation complete.`);
//   }


//   // Binnen de InMemoryDataService class

//   private initializeMockChatData(): void {
//     const profiles = InMemoryDataService.db.profiles;
//     if (!profiles || profiles.length === 0) {
//         console.warn("[InMemoryDataService] Cannot initialize mock chat data: No profiles available.");
//         InMemoryDataService.db.chatConversations = [];
//         InMemoryDataService.db.chatMessages = {};
//         return;
//     }

//     const currentUserId = profiles[0].id; // Nemen de eerste user als "huidige" voor mock
//     const aiBotProfile: Profile = {
//         id: this.AI_BOT_USER_ID,
//         displayName: this.AI_BOT_DISPLAY_NAME,
//         avatar: {
//             id: `avatar-${this.AI_BOT_USER_ID}`,
//             type: MediaType.IMAGE,
//             title: 'AI Coach Avatar',
//             altText: 'AI Coach Bot Avatar',
//             sourceType: ImageSourceType.SYSTEM_DEFAULT,
//             createdAt: this.mockDateTime(),
//             originalMasterDimensions: { width: 100, height: 100 },
//             variants: [
//                 {
//                     url: this.AI_BOT_AVATAR_URL,
//                     width: 100,
//                     height: 100,
//                     purpose: 'avatar',
//                     format: 'jpeg',
//                     descriptor: '100w'
//                 }
//             ]
//         },
//         level: 100,
//         reputation: 0
//     };
//     // Voeg AI bot toe aan profielen als die er nog niet is (voor senderProfile in Message)
//     if (!InMemoryDataService.db.profiles.find(p => p.id === this.AI_BOT_USER_ID)) {
//         InMemoryDataService.db.profiles.push(aiBotProfile);
//     }


//     // 1. AI Bot Conversatie
//     const aiConversationId = `conv-ai-${currentUserId}`; // Consistent ID
//     const aiConversation: Conversation = {
//         id: aiConversationId,
//         type: ConversationType.AIBOT,
//         name: aiBotProfile.displayName,
//         avatar: aiBotProfile.avatar,
//         botId: this.AI_BOT_USER_ID,
//         participantIds: [currentUserId], // Huidige gebruiker is deelnemer
//         createdAt: toDateTimeInfo(faker.date.recent({ days: 2 })),
//         lastModified: toDateTimeInfo(new Date(Date.now() - 60000)), // 1 minuut geleden
//         lastMessage: null, // Wordt hieronder gevuld
//         unreadCount: 1,
//     };
//     InMemoryDataService.db.chatConversations.push(aiConversation);

//     const initialAiMessages = this.generateMockMessages(aiConversationId, currentUserId, this.AI_BOT_USER_ID, 'Bot', 1, aiBotProfile, profiles[0]);
//     InMemoryDataService.db.chatMessages[aiConversationId] = initialAiMessages;
//     if (initialAiMessages.length > 0) {
//       aiConversation.lastMessage = initialAiMessages[initialAiMessages.length - 1];
//       aiConversation.lastModified = aiConversation.lastMessage.createdAt;
//     }

//     // 2. Optioneel: Direct Message Conversatie
//     if (profiles.length > 1) {
//         const otherUser = profiles[1];
//         const sortedParticipantIds = [currentUserId, otherUser.id].sort();
//         const dmId = `conv-dm-${sortedParticipantIds.join('_')}`; // Consistent ID

//         const dmConversation: Conversation = {
//             id: dmId,
//             type: ConversationType.DIRECTMESSAGE,
//             name: otherUser.displayName,
//             avatar: otherUser.avatar,
//             participantIds: sortedParticipantIds,
//             createdAt: toDateTimeInfo(faker.date.recent({ days: 3 })),
//             lastModified: toDateTimeInfo(new Date(Date.now() - 120000)), // 2 minuten geleden
//             lastMessage: null,
//             unreadCount: 0,
//         };
//         InMemoryDataService.db.chatConversations.push(dmConversation);
//         const initialDmMessages = this.generateMockMessages(dmId, currentUserId, otherUser.id, 'User', 3, profiles[0], otherUser);
//         InMemoryDataService.db.chatMessages[dmId] = initialDmMessages;
//         if (initialDmMessages.length > 0) {
//             dmConversation.lastMessage = initialDmMessages[initialDmMessages.length - 1];
//             dmConversation.lastModified = dmConversation.lastMessage.createdAt;
//         }
//     }
//   }

//   private generateMockMessages(
//       conversationId: string,
//       userId1: string, // ID van de "huidige" gebruiker voor de mock
//       userId2: string, // ID van de andere partij (kan bot of user zijn)
//       secondPartyType: 'User' | 'Bot',
//       count: number,
//       profile1: Profile, // Profiel van userId1
//       profile2: Profile  // Profiel van userId2 (of AI bot profiel)
//     ): Message[] {
//     const messages: Message[] = [];
//     let lastTimestamp = Date.now() - (count * 1000 * 60 * 10); // Start 10 min per bericht in het verleden

//     for (let i = 0; i < count; i++) {
//         const isUser1Sender = faker.datatype.boolean(); // Willekeurig wie het bericht stuurt
//         lastTimestamp += faker.number.int({ min: 1000 * 30, max: 1000 * 60 * 5 }); // 30s tot 5min later

//         const senderId = isUser1Sender ? userId1 : userId2;
//         const senderType = isUser1Sender ? 'User' : secondPartyType;
//         const senderProfile = isUser1Sender ? profile1 : profile2;

//         messages.push({
//             id: `msg-${conversationId}-${faker.string.alphanumeric(8)}`,
//             conversationId: conversationId,
//             senderId: senderId,
//             senderType: senderType,
//             senderProfile: senderProfile, // << TOEGEVOEGD
//             content: faker.lorem.sentence({min: 3, max: i % 3 === 0 ? 20 : 10}), // Wissel lengte af
//             createdAt: toDateTimeInfo(new Date(lastTimestamp)),
//             status: 'Read',
//             media: faker.helpers.maybe(() => this.generateMockMediaGallery(`msg-media-${i}`), { probability: 0.1 }),
//             gifUrl: faker.helpers.maybe(() => faker.image.urlLoremFlickr({category: 'abstract'}), {probability: 0.05}),
//         });
//     }
//     return messages;
//   }






//   parseRequestUrl(url: string, utils: RequestInfoUtilities): ParsedRequestUrl {
//     const parsed: ParsedRequestUrl = utils.parseRequestUrl(url);
//     const apiBase = '/api';

//     this.logParsing(`Attempting to parse URL: ${url}`);

//     // Define patterns in order from most specific to most general
//     const patterns = [
//       // Media endpoints
//       {
//         regex: new RegExp(`^${apiBase}/media/upload$`),
//         logMessage: 'Parsed as media upload',
//         parser: (p: ParsedRequestUrl) => { p.collectionName = 'media'; p.id = 'upload'; },
//       },
//       // +++ VOEG DEZE TOE +++
//       {
//         // Pakt /api/media?ids=... maar NIET /api/media/iets
//         regex: new RegExp(`^${apiBase}/media(?:\\?|$)`),
//         logMessage: 'Parsed as media list (by IDs)',
//         parser: (p: ParsedRequestUrl) => { p.collectionName = 'media'; p.id = ''; },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/media/([^/]+)$`), // Media by ID: /api/media/{id}
//         logMessage: 'Parsed as media detail by ID',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => { p.collectionName = 'media'; p.id = match[1]; },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/media/([^/]+)$`), // Media by ID: /api/media/{id}
//         logMessage: 'Parsed as media detail by ID',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => { p.collectionName = 'media'; p.id = match[1]; },
//       },
//       // Social Feed & Replies
//       {
//         regex: new RegExp(`^${apiBase}/socialFeeds/([^/]+)/items/([^/]+)/replies(?:/([^/]+))?(?:/(like|unlike))?$`),
//         logMessage: 'Parsed as feed item replies/reaction',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => {
//           p.collectionName = 'feedItemReplies';
//           p.query.set('feedId', [match[1]]);
//           p.query.set('parentItemId', [match[2]]);
//           // Fix: Ensure p.id is always a string. If match[3] is undefined, use empty string.
//           p.id = match[3] || ''; // This captures the replyId, if present.
//           if (match[4]) p.query.set('action', [match[4]]); // like/unlike (optional)
//         },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/socialFeeds/([^/]+)/items/([^/]+)/(like|unlike)$`),
//         logMessage: 'Parsed as feed item reaction (like/unlike)',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => {
//           p.collectionName = 'socialFeedItems'; // This collection handles item reactions
//           p.query.set('feedId', [match[1]]);
//           p.id = match[2]; // itemId
//           p.query.set('action', [match[3]]); // like or unlike
//         },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/socialFeeds/([^/]+)/items$`), // POST to add item: /api/socialFeeds/{feedId}/items
//         logMessage: 'Parsed as add feed item',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => { p.collectionName = 'socialFeedItems'; p.query.set('feedId', [match[1]]); p.id = ''; },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/socialFeeds/([^/?]+)(?:\\?|$)`),
//         logMessage: 'Parsed as social feed items list',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => {
//           p.collectionName = 'socialFeedItems';
//           // Fix: Zorg dat `p.id` alleen het feed ID bevat, zonder query string.
//           p.id = match[1]; // match[1] bevat nu de feedId zonder query parameters
//         },
//       },
//       // Node endpoints (ORDER IS CRUCIAL HERE: detail before list)
//       {
//         regex: new RegExp(`^${apiBase}/nodes/([^/]+)/interact$`), // Node interaction: /api/nodes/{id}/interact
//         logMessage: 'Parsed as node interaction',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => { p.collectionName = 'nodes'; p.id = match[1]; p.query.set('action', ['interact']); },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/nodes/([^/]+)$`), // Node detail: /api/nodes/{id}
//         logMessage: 'Parsed as node detail',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => { p.collectionName = 'nodes'; p.id = match[1]; },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/nodes$`), // Node list: /api/nodes (no ID)
//         logMessage: 'Parsed as node list',
//         // Fix: Assign empty string to p.id for list requests
//         parser: (p: ParsedRequestUrl) => { p.collectionName = 'nodes'; p.id = ''; },
//       },
//       // Challenge endpoints (ORDER IS CRUCIAL HERE: detail before list)
//       {
//         regex: new RegExp(`^${apiBase}/challenges/([^/]+)$`), // Challenge detail: /api/challenges/{id}
//         logMessage: 'Parsed as challenge detail',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => { p.collectionName = 'challenges'; p.id = match[1]; },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/challenges$`), // Challenge list: /api/challenges (no ID)
//         logMessage: 'Parsed as challenge list',
//         // Fix: Assign empty string to p.id for list requests
//         parser: (p: ParsedRequestUrl) => { p.collectionName = 'challenges'; p.id = ''; },
//       },
//       // Quest endpoints
//       {
//         regex: new RegExp(`^${apiBase}/quests/([^/]+)/(accept|progress|abandon|claim)$`), // Quest actions
//         logMessage: 'Parsed as quest action (accept/progress/abandon/claim)',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => { p.collectionName = 'quests'; p.id = match[1]; p.query.set('action', [match[2]]); },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/quests/([^/]+)$`), // Quest detail: /api/quests/{id}
//         logMessage: 'Parsed as quest detail',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => { p.collectionName = 'quests'; p.id = match[1]; },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/quests$`), // Quest list: /api/quests
//         logMessage: 'Parsed as quest list',
//         // Fix: Assign empty string to p.id for list requests
//         parser: (p: ParsedRequestUrl) => { p.collectionName = 'quests'; p.id = ''; },
//       },
//       // Stat/Skill/Lifeskill Definitions & User-specific
//       {
//         regex: new RegExp(`^${apiBase}/stats/definitions$`),
//         logMessage: 'Parsed as stat definitions list',
//         // Fix: Assign empty string to p.id for list requests
//         parser: (p: ParsedRequestUrl) => { p.collectionName = 'statDefinitions'; p.id = ''; },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/user/stats$`), // User stats
//         logMessage: 'Parsed as user stats',
//         parser: (p: ParsedRequestUrl) => { p.collectionName = 'userProfileData'; p.id = 'stats'; },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/user/lifeskills$`), // User lifeskills
//         logMessage: 'Parsed as user lifeskills',
//         // Fix: Assign empty string to p.id for list requests
//         parser: (p: ParsedRequestUrl) => { p.collectionName = 'userLifeskills'; p.id = ''; },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/skills/definitions$`), // Global skill definitions
//         logMessage: 'Parsed as skill definitions list',
//         // Fix: Assign empty string to p.id for list requests
//         parser: (p: ParsedRequestUrl) => { p.collectionName = 'skillDefinitions'; p.id = ''; },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/user/skills$`), // User skills list
//         logMessage: 'Parsed as user skills list',
//         // Fix: Assign empty string to p.id for list requests
//         parser: (p: ParsedRequestUrl) => { p.collectionName = 'userSkills'; p.id = ''; },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/user/skills/([^/]+)/upgrade$`), // User skill upgrade
//         logMessage: 'Parsed as user skill upgrade action',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => { p.collectionName = 'userSkills'; p.id = match[1]; p.query.set('action', ['upgrade']); },
//       },
//       // Chat endpoints
//       {
//         regex: new RegExp(`^${apiBase}/chat/conversations/([^/]+)/messages/(.*)/react$`), // React to message
//         logMessage: 'Parsed as chat message react action',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => { p.collectionName = 'chatMessages'; p.id = match[1]; p.query.set('messageId', [match[2]]); p.query.set('action', ['react']); },
//       },
//       {
//         regex: new RegExp(`^${apiBase}/chat/conversations/([^/]+)/messages(?:\\?|$)`), // NIEUW
//         logMessage: 'Parsed as chat messages list/send for conversation',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => {
//           p.collectionName = 'chatMessages';
//           p.id = match[1]; // Conversation ID
//         },
//             },
//             {
//               regex: new RegExp(`^${apiBase}/chat/conversations$`), // Chat conversations list/create
//               logMessage: 'Parsed as chat conversations list/create',
//               // Fix: Assign empty string to p.id for list requests
//               parser: (p: ParsedRequestUrl) => { p.collectionName = 'chatConversations'; p.id = ''; },
//             },
//             {
//               regex: new RegExp(`^${apiBase}/ai/chat$`), // AI chat interaction
//               logMessage: 'Parsed as AI chat interaction',
//               parser: (p: ParsedRequestUrl) => { p.collectionName = 'aiChat'; p.id = 'send'; },
//             },

//       // General Fallback for simple collections (e.g., /api/profiles/{id} or /api/logs)
//       {
//         regex: new RegExp(`^${apiBase}/([a-zA-Z0-9-]+)(?:/([^/?]+))?$`), // /api/collectionName OR /api/collectionName/id
//         logMessage: 'Parsed as general collection (fallback)',
//         parser: (p: ParsedRequestUrl, match: RegExpMatchArray) => {
//           p.collectionName = match[1];
//           // Fix: Assign empty string if no ID is present.
//           p.id = match[2] || '';
//         },
//       },
//         ];

//     for (const pattern of patterns) {
//       const match = url.match(pattern.regex);
//       if (match) {
//         // Use a new ParsedRequestUrl object for this match to ensure clean state
//         // Copy the query params to a new Map to avoid mutating the original Map in utils.parseRequestUrl's result
//         const newParsed: ParsedRequestUrl = { ...parsed, query: new Map(parsed.query) };
//         // The parser function expects the ParsedRequestUrl and the RegExpMatchArray (if the parser uses it)
//         pattern.parser(newParsed, match);
//         newParsed.resourceUrl = url.split('?')[0]; // Clean resourceUrl

//         this.logParsing(`${pattern.logMessage}. Collection: '${newParsed.collectionName}', ID: '${newParsed.id}', Query: '${newParsed.query?.toString()}'`, url);
//         return newParsed;
//       }
//     }

//     // Final fallback if no specific pattern matched
//     console.warn(`[InMemoryDb Parser] URL '${url}' did not match any specific patterns. Using default parsing. Collection: '${parsed.collectionName}', ID: '${parsed.id}'.`);
//     if (!parsed.resourceUrl) {
//       parsed.resourceUrl = url.split('?')[0];
//     }
//     return parsed;
//   }







//   /**
//      /**
//    * @method get
//    * @description Overrides the default GET handler of InMemoryDbService to provide custom responses
//    *              for various collections and specific resource URLs within the Challenger App mock API.
//    *              It routes requests based on `collectionName` and `id` (parsed by `parseRequestUrl`)
//    *              to dedicated helper methods or returns mock data directly.
//    *
//    * @param {RequestInfo} reqInfo - Object containing information about the HTTP GET request,
//    *                                including parsed URL segments, query parameters, and headers.
//    *
//    * @returns {Observable<ResponseOptions> | undefined} An Observable emitting `ResponseOptions`
//    *          for a custom response, or `undefined` to let the default InMemoryDbService handler
//    *          attempt to process the request based on collection name and ID.
//    */
//   get(reqInfo: RequestInfo): Observable<ResponseOptions> | undefined {
//     // Destructure relevant properties from reqInfo for easier access.
//     const { collectionName, id, query, url, resourceUrl, headers } = reqInfo;
//     /** @const {string} logPrefix - Standardized prefix for log messages within this method. */
//     const logPrefix = '[InMemoryDb GET]';

//       if (url.includes('/assets/i18n/')) { // Check of de URL i18n bevat
//     console.warn(`${logPrefix} Explicitly passing through i18n request: ${url}`);
//     return undefined; // Laat de request door naar de dev server
//   }

//     // Log the incoming request details for debugging purposes.
//     // this.logParsing is a helper to potentially filter logs (e.g., exclude asset requests).
//     this.logParsing(
//       `Processing GET request. Collection: '${collectionName}', ID: '${id}', Query: '${query?.toString()}', URL: '${url}', ResourceURL: '${resourceUrl}'`
//     );

//     if (collectionName === 'media') {
//   const idsParam = query.get('ids')?.[0];

//   if (idsParam) {
//     const ids = idsParam.split(',');
//     this.logParsing(`[InMemoryDb GET] Handling media request for multiple IDs: ${ids.join(', ')}`);

//     // Simuleer het ophalen van media. In een echte app zou dit de `media`-tabel doorzoeken.
//     // Voor de mock genereren we gewoon mock-media voor de gevraagde IDs.
//     const allMedia = this.generateMockMediaGallery('batch-fetch', ids.length);
//     const result = allMedia.map((media, index) => ({ ...media, id: ids[index] })); // Zorg dat de IDs matchen

//     return this.createOkResponse(reqInfo, result);
//   }

// }



//     // --- Passthrough for Asset Requests ---
//     // Why: Assets (images, fonts, etc.) should be served by the development server, not this mock API.
//     //      Returning 'undefined' allows the request to pass through to the actual server.
//   if (url.startsWith('/assets/') || url.startsWith('./assets/')) {
//     console.log(`[InMemoryDb GET] Passthrough for asset/i18n request: ${url}`);
//     return undefined; // Cruciaal: laat de request door naar de echte server
//   }


//     // =========================================================================
//     // SECTION 1: Specific Endpoint Handlers (Most Specific First)
//     // These handlers address unique URLs or URLs requiring custom logic
//     // beyond simple collection/ID lookups.
//     // =========================================================================

//     // --- Handler for Stat Definitions (/api/stats/definitions) ---
//     // Why: Provides a list of all available statistic definitions (metadata for stats).
//     if (collectionName === 'statDefinitions') {
//       console.log(`${logPrefix} Matched 'statDefinitions'. Handling GET /api/stats/definitions.`);
//       return this.createOkResponse(reqInfo, InMemoryDataService.db.statDefinitions || []);
//     } // --- End Handler for /api/stats/definitions ---

//     // --- Handler for Current User's Lifeskills (/api/user/lifeskills) ---
//     // Why: Fetches the lifeskill progression data for the authenticated user.
//     if (collectionName === 'userLifeskills') {
//       console.log(`${logPrefix} Matched 'userLifeskills'. Handling GET /api/user/lifeskills.`);
//       const userIdFromToken: string = 'admin-profile-0'; // Fallback to admin user for mock purposes


//       const userSkills = InMemoryDataService.db.lifeskillsByUser?.[userIdFromToken];
//       if (userSkills) {
//         console.log(`${logPrefix} [userLifeskills] Returning ${userSkills.length} lifeskills for user ${userIdFromToken}.`);
//         return this.createOkResponse(reqInfo, userSkills);
//       } else {
//         console.log(`${logPrefix} [userLifeskills] No lifeskills found for user ${userIdFromToken}, generating them now.`);
//         if (!InMemoryDataService.db.lifeskillsByUser) InMemoryDataService.db.lifeskillsByUser = {};

//         const profiles = InMemoryDataService.db.profiles;
//         const currentUserProfile = profiles.find(p => p.id === userIdFromToken);
//         if (currentUserProfile) {
//           const generatedSkills = this.generateMockUserLifeskills(userIdFromToken);
//           InMemoryDataService.db.lifeskillsByUser[userIdFromToken] = generatedSkills;
//           console.log(`${logPrefix} [userLifeskills] Generated on-the-fly ${generatedSkills.length} lifeskills for user ${userIdFromToken}.`);
//           return this.createOkResponse(reqInfo, generatedSkills);
//         } else {
//           console.warn(`${logPrefix} [userLifeskills] Could not find profile for user ${userIdFromToken} to generate lifeskills.`);
//           return this.createOkResponse(reqInfo, []); // Return empty array if profile is missing
//         }
//       }
//     } // --- End Handler for /api/user/lifeskills ---


//     // --- Handler for Current User's Skills (/api/user/skills) ---
//     // Why: Fetches the skills for the authenticated user.
//     if (collectionName === 'userSkills' && resourceUrl === `api/user/skills`) { // Wees specifiek met resourceUrl
//       this.logParsing(`${logPrefix} Matched 'userSkills'. Handling GET /api/user/skills.`);
//       const userIdFromToken: string = 'admin-profile-0'; // Fallback to admin user for mock purposes

//       const skillsForUser = InMemoryDataService.db.userSkills.filter(us => us.userId === userIdFromToken); // AANNAME: us.userId bestaat
//       console.info(`${logPrefix} Returning ${skillsForUser.length} user skills for user ${userIdFromToken}.`);
//       return this.createOkResponse(reqInfo, skillsForUser || []);
//     }

//     // --- Handler for Chat Conversations List (/api/chat/conversations) ---
//     // Why: Fetches the list of all chat conversations for the current user.
//     if (collectionName === 'chatConversations' && !id) {
//       console.log(`${logPrefix} Matched 'chatConversations' (list). Handling GET /api/chat/conversations.`);
//       return this.createOkResponse(reqInfo, InMemoryDataService.db.chatConversations || []);
//     } // --- End Handler for /api/chat/conversations (list) ---

//     // --- Handler for Messages within a Specific Chat Conversation (/api/chat/conversations/{convId}/messages) ---
//     // Why: Fetches messages for a given conversation, supporting pagination.
//     if (collectionName === 'chatMessages' && id) { // 'id' here is the conversationId
//       const conversationId = id;
//       console.log(`${logPrefix} Matched 'chatMessages'. Handling GET /api/chat/conversations/${conversationId}/messages.`);
//       const messagesForConversation = InMemoryDataService.db.chatMessages[conversationId] || [];

//       // Paginate messages (newest first for 'before' logic, then reverse for display).
//       const pageNumberParam = query.get('page')?.[0] || query.get('pageIndex')?.[0];
//       const pageSizeParam = query.get('limit')?.[0] || query.get('pageSize')?.[0];
//       const pageNumber = +(pageNumberParam || '1');
//       const pageSize = +(pageSizeParam || '20');
//       const beforeMessageId = query.get('before')?.[0];

//       let itemsToReturn = [...messagesForConversation];
//       itemsToReturn.sort((a, b) => (b.createdAt?.timestamp ?? 0) - (a.createdAt?.timestamp ?? 0)); // Newest first for slicing

//       if (beforeMessageId) {
//         const beforeIndex = itemsToReturn.findIndex(m => m.id === beforeMessageId);
//         if (beforeIndex !== -1) {
//           itemsToReturn = itemsToReturn.slice(beforeIndex + 1);
//         }
//       }
//       const totalSlicedItems = itemsToReturn.length;
//       const paginatedSlicedItems = itemsToReturn.slice(0, pageSize);
//       paginatedSlicedItems.sort((a,b) => (a.createdAt?.timestamp ?? 0) - (b.createdAt?.timestamp ?? 0)); // Oldest first for display

//       const responseBody: PaginatedList<Message> = {
//         items: paginatedSlicedItems,
//         totalCount: totalSlicedItems, // Count *after* 'before' filter, but *before* 'limit'
//         pageIndex: 1, // 'pageIndex' is less relevant with 'before' cursor
//         pageSize: pageSize,
//         totalPages: Math.ceil(totalSlicedItems / pageSize)
//       };
//       return this.createOkResponse(reqInfo, responseBody);
//     } // --- End Handler for /api/chat/conversations/{convId}/messages ---

//     // =========================================================================
//     // SECTION 2: Handlers for Collections Based on Parsed `collectionName`
//     // These handlers manage GET requests for standard collections or specific
//     // sub-resources parsed into `collectionName`.
//     // =========================================================================

//     // --- Handler for Social Feed Items (/api/socialFeeds/{feedId}) ---
//     // Why: Fetches items for a specific feed, identified by 'id' (which is feedId here).
//     //      This is for fetching the LIST of items for a feed, not a single item detail.
//     if (collectionName === 'socialFeedItems' && id && !query.has('action')) {
//       const expectedResourceUrl = `/api/socialFeeds/${id}`;
//       // Ensure this handler only catches requests for the feed list, not item actions.
//       if (resourceUrl === expectedResourceUrl || resourceUrl === `${expectedResourceUrl}/`) {
//         console.log(`${logPrefix} Matched 'socialFeedItems' for feedId '${id}'. Handling GET socialFeedItems list.`);
//         return this.handleGetSocialFeedItems(reqInfo, id as string);
//       } else {
//         // This log will help debug if a URL is unexpectedly routed here.
//         console.log(`${logPrefix} Parsed as 'socialFeedItems' but URL '${resourceUrl}' doesn't match list pattern for feedId '${id}'. Passing to next handlers.`);
//       }
//     } // --- End Handler for /api/socialFeeds/{feedId} (list) ---


//     // --- Handler for Feed Item Replies (/api/socialFeeds/{feedId}/items/{itemId}/replies) ---
//     // Why: Fetches replies for a specific parent feed item.
//     if (collectionName === 'feedItemReplies' && query.has('feedId') && query.has('parentItemId') && !id) {
//       const feedId = query.get('feedId')![0];
//       const parentItemId = query.get('parentItemId')![0];
//       console.log(`${logPrefix} Matched 'feedItemReplies'. Handling GET feedItemReplies for feedId '${feedId}', parentItemId '${parentItemId}'.`);
//       return this.handleGetFeedItemReplies(reqInfo, { feedId, parentItemId });
//     } // --- End Handler for Replies ---

//     // --- Handler for Challenges (/api/challenges and /api/challenges/{id}) ---
//     // Why: Fetches either a list of challenges (with filtering) or a single challenge detail.
//     if (collectionName === 'challenges') {
//       console.log(`${logPrefix} Matched 'challenges'. Handling GET challenges.`);
//       return this.handleGetChallenges(reqInfo);
//     } // --- End Handler for Challenges ---

//     // --- Handler for Nodes (/api/nodes and /api/nodes/{id}) ---
//     // Why: Fetches either a list of node summaries or full details for a single node.
//     if (collectionName === 'nodes') {
//       console.log(`${logPrefix} Matched 'nodes'. Handling GET nodes.`);
//       return this.handleGetNodes(reqInfo);
//     } // --- End Handler for Nodes ---

//     // --- Handler for Quests List (/api/quests) ---
//     // Why: Fetches a list of all available quests.
//     if (collectionName === 'quests') {
//       console.log(`${logPrefix} Matched 'quests'. Handling GET quests list.`);
//       const allQuests = InMemoryDataService.db.quests || [];
//       // TODO: Implement filtering based on reqInfo.query if needed for quests.
//       console.log(`${logPrefix} Returning ${allQuests.length} quests from DB.`);
//       return this.createOkResponse(reqInfo, allQuests);
//     } // --- End Handler for Quests ---



//     // --- Default Handler for Simple Collections ---
//     // Why: For collections that don't require custom logic or query parameter processing,
//     //      let the default InMemoryDbService behavior take over.
//     switch (collectionName) {
//       case 'profiles': // Handles GET /api/profiles and GET /api/profiles/{id}
//       case 'logs':     // Handles GET /api/logs and GET /api/logs/{id}
//       case 'routes':   // Handles GET /api/routes and GET /api/routes/{id}
//       case 'filters':  // Handles GET /api/filters and GET /api/filters/{id} (likely list only)
//         console.log(`${logPrefix} Matched simple collection '${collectionName}'. Using default GET handler.`);
//         return undefined; // Let default InMemoryDbService handler process the request.
//     } // --- End Default Handler for Simple Collections ---

//     // --- Fallback for Unmatched Requests ---
//     // Why: If no specific handler matched the request, log a warning.
//     //      Returning 'undefined' allows the default InMemoryDbService handler one last attempt.
//     //      If that also fails, a 404 will typically be returned by the library.
//     console.warn(`${logPrefix} No specific GET handler was matched for collectionName: '${collectionName}', id: '${id}', URL: '${url}'. Allowing default handler to attempt.`);
//     return undefined;
//   } // --- End of get() method ---

// // ... (rest van je InMemoryDataService class: post, put, delete, helper methods, mock data generation) ...

//   /** Handles POST requests for various endpoints. */
//   post(reqInfo: RequestInfo): Observable<ResponseOptions> | undefined {
//     const { collectionName, id, query, url, headers } = reqInfo;
//     const logPrefix = '[InMemoryDb POST]';
//     console.log(
//       `${logPrefix} request: url='${url}', collection='${collectionName}', id='${id}'`
//     );


//     // 1. Handle Media Upload (/api/media/upload)
//     if (collectionName === 'media' && id === 'upload') {
//       console.log('[InMemoryDataService] Handling POST for media upload.');
//       return reqInfo.utils.createResponse$(() => {
//         this.mediaIdCounter++;
//         const newMediaId = `media-${this.mediaIdCounter}-${Date.now()}`;
//         const uploadedFileName = `Uploaded Mock Media ${this.mediaIdCounter}`;
//         const placeholderBaseUrl = '/assets/images/placeholder-'; // Voorbeeld, pas aan indien nodig

//         // Genereer een mock Image object correct
//         const mockImage: Image = { // Expliciet type Image
//           id: newMediaId,
//           type: MediaType.IMAGE,
//           title: uploadedFileName,
//           altText: `Alt text for ${uploadedFileName}`,
//           sourceType: ImageSourceType.USER_UPLOADED, // Aanname
//           createdAt: toDateTimeInfo(new Date()),
//           originalMasterDimensions: { width: 800, height: 600 }, // Voorbeeld master dimensies
//           variants: [
//             {
//               url: `${placeholderBaseUrl}800x600.jpg`,
//               width: 800,
//               height: 600,
//               purpose: 'original_quality',
//               format: 'jpeg',
//               descriptor: '800w'
//             },
//             {
//               url: `${placeholderBaseUrl}400x300.jpg`,
//               width: 400,
//               height: 300,
//               purpose: 'medium_display',
//               format: 'jpeg',
//               descriptor: '400w'
//             },
//             {
//               url: `${placeholderBaseUrl}200x150.jpg`,
//               width: 200,
//               height: 150,
//               purpose: 'thumbnail',
//               format: 'jpeg',
//               descriptor: '200w'
//             }
//           ]
//         };

//         console.log(
//           `[InMemoryDataService] Simulated media upload success, returning:`,
//           mockImage
//         );
//         // Gebruik de createCreatedResponseOptions helper
//         return this.createCreatedResponseOptions(reqInfo, mockImage);
//       });
//     }

//     // Handler voor AI Chat (/api/ai/chat)
//     if (collectionName === 'aiChat' && id === 'send') {
//       this.logParsing(`${logPrefix} Handling POST for /api/ai/chat (send AI message)`);
//       return reqInfo.utils.createResponse$(() => {
//           try {
//               const body = reqInfo.utils.getJsonBody(reqInfo.req);
//               console.log("<<<< [InMemoryDataService /api/ai/chat] RECEIVED REQUEST BODY >>>>", JSON.stringify(body, null, 2));

//               const userMessageContent = body?.content as string | undefined;
//               const conversationId = body?.conversationId as string;
//               const mediaFromRequest = body?.media as Media[] | undefined;
//               const gifUrlPayload = body?.gifUrl as string | undefined;
//               const hasValidMedia = Array.isArray(mediaFromRequest) && mediaFromRequest.length > 0;

//               if (
//                 !conversationId ||
//                 (!userMessageContent?.trim() && !hasValidMedia && !gifUrlPayload)
//               ) {
//                   console.error(`${logPrefix} Invalid AI chat message payload. ConversationId missing or content, media, and gifUrl are all empty. Content: '${userMessageContent}', Media: ${JSON.stringify(mediaFromRequest)}, GIF: ${gifUrlPayload}`);
//                   return this.createErrorResponseOptions(reqInfo, 400, 'Invalid AI chat message payload: ConversationId missing or content, media, and gifUrl are all empty.');
//               }

//               // --- AANGEPASTE LOGICA VOOR USER ID EN PROFIEL ---
//               const currentUserId = 'admin-profile-0'; // Fallback naar admin ID
//               const currentUserProfile = InMemoryDataService.db.profiles.find(p => p.id === currentUserId) || this.generateMockProfiles(1)[0];
//               // --- EINDE AANGEPASTE LOGICA ---

//               const userMessage: Message = {
//                   id: `msg-user-${Date.now()}-${faker.string.alphanumeric(5)}`,
//                   conversationId: conversationId,
//                   senderId: currentUserId, // Gebruik het (hopelijk) correcte ID
//                   senderType: 'User',
//                   senderProfile: currentUserProfile, // Gebruik het correcte profiel
//                   content: userMessageContent?.trim() ?? '',
//                   media: hasValidMedia ? mediaFromRequest : undefined,
//                   gifUrl: gifUrlPayload,
//                   createdAt: toDateTimeInfo(new Date()),
//                   status: 'Sent',
//               };

//               // ... (rest van de AI chat handler blijft hetzelfde) ...
//               if (!InMemoryDataService.db.chatMessages[conversationId]) {
//                   InMemoryDataService.db.chatMessages[conversationId] = [];
//               }
//               InMemoryDataService.db.chatMessages[conversationId]?.push(userMessage);

//               const aiBotProfileInDb = InMemoryDataService.db.profiles.find(p => p.id === this.AI_BOT_USER_ID) || this.getAiBotProfile();
//               if (!aiBotProfileInDb) {
//                   console.error(`${logPrefix} AI Bot profile not found in DB for message generation!`);
//                   return this.createErrorResponseOptions(reqInfo, 500, "AI Bot profile missing in mock DB");
//               }
//               const botReply = this.generateMockAiReply(conversationId, userMessage.content, currentUserProfile); // Geef currentUserProfile mee voor context
//               InMemoryDataService.db.chatMessages[conversationId]?.push(botReply);

//               const conversation = InMemoryDataService.db.chatConversations.find(c => c.id === conversationId);
//               if (conversation) {
//                   conversation.lastMessage = botReply;
//                   conversation.lastModified = botReply.createdAt;
//               }

//               console.log(`${logPrefix} AI Chat processed. Returning userMessage:`, JSON.stringify(userMessage, null, 2));
//               console.log(`${logPrefix} User Media Count in returned userMessage: ${userMessage.media?.length}`);

//               return this.createOkResponseOptions(reqInfo, {
//                   userMessage: userMessage,
//                   botReply: botReply
//               });
//           } catch (error) {
//               console.error(`${logPrefix} Error in POST /ai/chat:`, error);
//               return this.createErrorResponseOptions(reqInfo, 500, 'Server error processing AI chat message.');
//           }
//       });
//     }


//     // Handler voor Standaard Chat Berichten
//     if (collectionName === 'chatMessages' && id) { // 'id' is conversationId
//         const conversationId = id;
//         this.logParsing(`${logPrefix} Handling POST for /api/chat/conversations/${conversationId}/messages`);
//         return reqInfo.utils.createResponse$(() => {
//             try {
//                 const messagePayload = reqInfo.utils.getJsonBody(reqInfo.req) as Partial<Message>;
//                 const hasValidMediaForStandardChat = Array.isArray(messagePayload.media) && messagePayload.media.length > 0;
//                 if (
//                     !messagePayload ||
//                     (!messagePayload.content?.trim() && !hasValidMediaForStandardChat && !messagePayload.gifUrl)
//                 ) {
//                     return this.createErrorResponseOptions(reqInfo, 400, 'Invalid message payload: Content, media, or GIF required.');
//                 }

//                 const currentUserId = 'admin-profile-0'; // Fallback naar admin ID
//                 const currentUserProfile = InMemoryDataService.db.profiles.find(p => p.id === currentUserId) || this.generateMockProfiles(1)[0];

//                 const newMessage: Message = {
//                     id: `msg-${Date.now()}-${faker.string.alphanumeric(5)}`,
//                     conversationId: conversationId,
//                     senderId: currentUserId,
//                     senderType: 'User',
//                     senderProfile: currentUserProfile,
//                     content: messagePayload.content?.trim() ?? '',
//                     media: hasValidMediaForStandardChat ? messagePayload.media : undefined,
//                     gifUrl: messagePayload.gifUrl,
//                     createdAt: toDateTimeInfo(new Date()),
//                     status: 'Sent',
//                     isEdited: false,
//                 };

//                 if (!InMemoryDataService.db.chatMessages[conversationId]) {
//                     InMemoryDataService.db.chatMessages[conversationId] = [];
//                 }
//                 InMemoryDataService.db.chatMessages[conversationId]?.push(newMessage);

//                 const conversation = InMemoryDataService.db.chatConversations.find(c => c.id === conversationId);
//                 if (conversation) {
//                     conversation.lastMessage = newMessage;
//                     conversation.lastModified = newMessage.createdAt;
//                 }
//                 this.logParsing(`${logPrefix} Message sent to conversation ${conversationId}. Message ID: ${newMessage.id}`);
//                 return this.createCreatedResponseOptions(reqInfo, newMessage);
//             } catch (error) {
//                 const errorMessage = error instanceof Error ? error.message : 'Unknown error processing message body.';
//                 this.logParsing(`${logPrefix} Error in POST /chat/conversations/${conversationId}/messages: ${errorMessage}`);
//                 return this.createErrorResponseOptions(reqInfo, 500, `Server error sending message: ${errorMessage}`);
//             }
//         });
//     }

//     if (collectionName === 'chatConversations' && !id) {
//         this.logParsing(`${logPrefix} Handling POST for starting a new conversation.`);
//         return reqInfo.utils.createResponse$(() => {
//             try {
//                 const body = reqInfo.utils.getJsonBody(reqInfo.req) as {
//                     type: ConversationType,
//                     participantIds?: string[],
//                     botId?: string,
//                     initialMessage?: Partial<Omit<Message, 'conversationId' | 'id' | 'timestamp' | 'senderId' | 'senderType'>>
//                 };

//                 if (!body || !body.type) {
//                     return this.createErrorResponseOptions(reqInfo, 400, 'Invalid conversation payload: type is required.');
//                 }

//                 const currentUserId = 'admin-profile-0'; // Fallback naar admin ID
//                 const currentUserProfile = InMemoryDataService.db.profiles.find(p => p.id === currentUserId) || this.generateMockProfiles(1)[0];
//                 let newConversation: Conversation;

//                 if (body.type === ConversationType.AIBOT) {
//                     const existingAiConversation = InMemoryDataService.db.chatConversations.find(
//                         c => c.type === ConversationType.AIBOT && c.participantIds?.includes(currentUserId)
//                     );
//                     if (existingAiConversation) {
//                          this.logParsing(`${logPrefix} Found existing AI conversation for user ${currentUserId}: ${existingAiConversation.id}`);
//                         return this.createOkResponseOptions(reqInfo, existingAiConversation);
//                     }
//                     const aiBotProfile = InMemoryDataService.db.profiles.find(p => p.id === this.AI_BOT_USER_ID) || this.getAiBotProfile();
//                     newConversation = {
//                         id: `conv-ai-${currentUserId}-${Date.now()}`,
//                         type: ConversationType.AIBOT,
//                         name: aiBotProfile.displayName,
//                         avatar: aiBotProfile.avatar,
//                         botId: this.AI_BOT_USER_ID,
//                         participantIds: [currentUserId],
//                         createdAt: toDateTimeInfo(new Date()),
//                         lastModified: toDateTimeInfo(new Date()),
//                         lastMessage: null,
//                         unreadCount: 0
//                     };
//                 } else if (body.type === ConversationType.DIRECTMESSAGE && body.participantIds && body.participantIds.length > 0) {
//                     const otherUserId = body.participantIds[0];
//                     const otherUserProfile = InMemoryDataService.db.profiles.find(p => p.id === otherUserId);
//                     if (!otherUserProfile) return this.createErrorResponseOptions(reqInfo, 404, `User for DM not found: ${otherUserId}`);

//                     const allParticipantIds = [currentUserId, otherUserId].sort();
//                     const dmId = `conv-dm-${allParticipantIds.join('_')}`;

//                     const existingDmConversation = InMemoryDataService.db.chatConversations.find(c => c.id === dmId);
//                     if (existingDmConversation) {
//                         this.logParsing(`${logPrefix} Found existing DM conversation: ${dmId}`);
//                         return this.createOkResponseOptions(reqInfo, existingDmConversation);
//                     }

//                     newConversation = {
//                         id: dmId,
//                         type: ConversationType.DIRECTMESSAGE,
//                         name: otherUserProfile.displayName,
//                         avatar: otherUserProfile.avatar,
//                         participantIds: allParticipantIds,
//                         createdAt: toDateTimeInfo(new Date()),
//                         lastModified: toDateTimeInfo(new Date()),
//                         lastMessage: null,
//                         unreadCount: 0
//                     };
//                 } else {
//                     return this.createErrorResponseOptions(reqInfo, 400, 'Invalid conversation type or missing participantIds for DM.');
//                 }

//                 InMemoryDataService.db.chatConversations.push(newConversation);
//                 InMemoryDataService.db.chatMessages[newConversation.id] = [];

//                 const hasInitialMessageContent = body.initialMessage && (body.initialMessage.content || (body.initialMessage.media && body.initialMessage.media.length > 0) || body.initialMessage.gifUrl);

//                 if (hasInitialMessageContent) {
//                      const initialMsg: Message = {
//                         id: `msg-init-${Date.now()}`,
//                         conversationId: newConversation.id,
//                         senderId: currentUserId,
//                         senderType: 'User',
//                         senderProfile: currentUserProfile,
//                         content: body.initialMessage!.content ?? '',
//                         media: body.initialMessage!.media as Media[] | undefined,
//                         gifUrl: body.initialMessage!.gifUrl,
//                         createdAt: toDateTimeInfo(new Date()),
//                         status: 'Sent'
//                      };
//                      InMemoryDataService.db.chatMessages[newConversation.id].push(initialMsg);
//                      newConversation.lastMessage = initialMsg;
//                      newConversation.lastModified = initialMsg.createdAt;
//                 }

//                 this.logParsing(`${logPrefix} New conversation started. ID: ${newConversation.id}, Type: ${newConversation.type}`);
//                 return this.createCreatedResponseOptions(reqInfo, newConversation);

//             } catch (error) {
//                 const errorMessage = error instanceof Error ? error.message : 'Unknown error processing start conversation body.';
//                 this.logParsing(`${logPrefix} Error in POST /chat/conversations: ${errorMessage}`);
//                 return this.createErrorResponseOptions(reqInfo, 500, `Server error starting conversation: ${errorMessage}`);
//             }
//         });
//     }

//     // ... (andere POST handlers) ...
//     // Zorg ervoor dat de volgorde van meest specifiek naar algemeen gehandhaafd blijft
//     // en dat de `logPrefix` consistent wordt gebruikt.

//     // 2. Handle Like/Unlike on Feed Reply
//     if (collectionName === 'feedItemReplies' && query.has('action') && ['like', 'unlike'].includes(query.get('action')![0]) && id) {
//       const action = query.get('action')![0] as 'like' | 'unlike';
//       const feedId = query.get('feedId')?.[0];
//       const parentItemId = query.get('parentItemId')?.[0];
//       const replyId = id as string; // `id` is hier de replyId

//       if (feedId && parentItemId && replyId) {
//           this.logParsing(`Identified POST as Reply Reaction: feed=${feedId}, parentItem=${parentItemId}, reply=${replyId}, action=${action}`, url);
//           try {
//               const reactionType = action === 'like' ? reqInfo.utils.getJsonBody(reqInfo.req)?.reactionType ?? null : null;
//               return this.handleFeedReplyReactionUpdate(reqInfo, feedId, parentItemId, replyId, reactionType);
//           } catch (e) {
//               return this.handleRequestBodyError(reqInfo, 'reply reaction', e);
//           }
//       } else {
//           console.warn(`[InMemoryDb] Missing IDs for POST reply reaction: feed=${feedId}, parentItem=${parentItemId}, reply=${replyId}`);
//       }
//     }

//     // 3. Handle Like/Unlike on Feed Item
//     if (collectionName === 'socialFeedItems' && query.has('action') && ['like', 'unlike'].includes(query.get('action')![0]) && id) {
//       const action = query.get('action')![0] as 'like' | 'unlike';
//       const feedId = query.get('feedId')?.[0]; // feedId zit ook in de query
//       const itemId = id as string;

//       if (feedId && itemId) {
//         this.logParsing(
//           `Identified POST as Item Reaction: feed=${feedId}, item=${itemId}, action=${action}`,
//           url
//         );
//         try {
//           const reactionType =
//             action === 'like'
//               ? reqInfo.utils.getJsonBody(reqInfo.req)?.reactionType ?? null
//               : null;
//           return this.handleFeedItemReactionUpdate(
//             reqInfo,
//             feedId,
//             itemId,
//             reactionType
//           );
//         } catch (e) {
//           return this.handleRequestBodyError(reqInfo, 'item reaction', e);
//         }
//       } else {
//         console.warn(
//           `[InMemoryDb] Missing IDs for POST item reaction: feed=${feedId}, item=${itemId}`
//         );
//       }
//     }

//     // 4. Handle Add Feed Item
//     const addItemUrlPattern = /api\/socialFeeds\/([^/]+)\/items$/i;
//     const addItemMatch = url.match(addItemUrlPattern);
//     if (collectionName === 'socialFeedItems' && addItemMatch && query.get('action')?.includes('add')) {
//       const feedId = addItemMatch[1];
//       console.log(
//         `[InMemoryDataService] Handling POST to add item to feed: ${feedId}`
//       );
//       return this.handleAddFeedItem(reqInfo, feedId);
//     }

//     // 5. Handle Add Feed Reply
//     if (collectionName === 'feedItemReplies' && !id && !query.has('action')) {
//       const feedIdForReply = query.get('feedId')?.[0];
//       const parentItemIdForReply = query.get('parentItemId')?.[0];
//       if (feedIdForReply && parentItemIdForReply) {
//         console.log(
//           `[InMemoryDataService] Identified as Add Feed Reply request for parent ${parentItemIdForReply}`
//         );
//         return this.handleAddFeedReply(
//           reqInfo,
//           feedIdForReply,
//           parentItemIdForReply
//         );
//       } else {
//         console.warn(
//           `[InMemoryDataService] Missing IDs for POST add reply: feed=${feedIdForReply}, parent=${parentItemIdForReply}`
//         );
//       }
//     }

//     // 6. Handle Node Interaction
//     if (collectionName === 'nodes' && query.has('action') && query.get('action')?.includes('interact') && id) {
//       console.log(
//         `[InMemoryDataService] Identified as Node Interaction request for node ${id}`
//       );
//       return this.handleNodeInteraction(reqInfo);
//     }

//     // 7. Handle Log Entry
//     if (collectionName === 'logs') {
//       console.log(`[InMemoryDataService] Identified as Add Log Entry request`);
//       return this.postLogEntry(reqInfo);
//     }


//     // --- Fallback ---
//     console.warn(
//       `[InMemoryDataService] No specific POST handler matched for URL: ${url}. Collection: ${collectionName}, ID: ${id}`
//     );
//     return undefined;
//   }


//   /** Handles PUT requests. */
//   put(reqInfo: RequestInfo): Observable<ResponseOptions> | undefined {
//     // Zorg dat return type klopt
//     const collectionName = reqInfo.collectionName;
//     const id = reqInfo.id; // Ensure id is destructured here
//     const url = reqInfo.url;
//     const logPrefix = '[InMemoryDb PUT]'; // Define logPrefix here
//     console.warn(
//       `${logPrefix} request: url='${url}', collection='${collectionName}', id='${id}'`
//     );

//     // Check if it's a PUT request for a specific reply
//     const replyUpdateUrlPattern =
//       /api\/socialFeeds\/([^/]+)\/items\/([^/]+)\/replies\/([^/]+)/i;
//     const replyMatch = url.match(replyUpdateUrlPattern);

//     if (collectionName === 'feedItemReplies' && replyMatch) {
//       const feedId = replyMatch[1];
//       const parentItemId = replyMatch[2];
//       const replyId = replyMatch[3];

//       console.log(
//         `[InMemoryDataService] Handling PUT for specific reply: feedId=${feedId}, parentItemId=${parentItemId}, replyId=${replyId}`
//       );

//       return reqInfo.utils.createResponse$((): ResponseOptions => {
//         const headers = this.createJsonHeaders();
//         const feed = InMemoryDataService.db.socialFeeds[feedId];
//         if (!feed) {
//           console.warn(
//             `[InMemoryDataService] PUT Reply: Feed '${feedId}' not found.`
//           );
//           return {
//             status: 404,
//             body: { error: `Feed '${feedId}' not found` },
//             headers,
//             url,
//           };
//         }
//         const dbReplies = feed.repliesByItem?.[parentItemId];
//         if (!dbReplies) {
//           console.warn(
//             `[InMemoryDataService] PUT Reply: Replies structure for item '${parentItemId}' not found in feed '${feedId}'.`
//           );
//           return {
//             status: 404,
//             body: { error: `Replies for item '${parentItemId}' not found` },
//             headers,
//             url,
//           };
//         }
//         const replyIndex = dbReplies.findIndex((r) => r.id === replyId);
//         if (replyIndex === -1) {
//           console.warn(
//             `[InMemoryDataService] PUT Reply: Reply with id '${replyId}' not found in feed '${feedId}', item '${parentItemId}'.`
//           );
//           return {
//             status: 404,
//             body: { error: `Reply '${replyId}' not found` },
//             headers,
//             url,
//           };
//         }
//         let updatedReplyData: Partial<FeedReply>;
//         try {
//           updatedReplyData = reqInfo.utils.getJsonBody(
//             reqInfo.req
//           ) as Partial<FeedReply>;
//           if (
//             !updatedReplyData ||
//             typeof updatedReplyData.text !== 'string' ||
//             !updatedReplyData.text.trim()
//           ) {
//             console.error(
//               `[InMemoryDataService] PUT Reply: Invalid request body for reply ${replyId}: Missing or empty text.`
//             );
//             return {
//               status: 400,
//               body: { error: 'Invalid request body: Missing or empty text.' },
//               headers,
//               url,
//             };
//           }
//         } catch (error) {
//           const message =
//             error instanceof Error
//               ? error.message
//               : 'Unknown error parsing body';
//           console.error(
//             `[InMemoryDataService] Error processing PUT body for reply ${replyId}: ${message}`
//           );
//           return {
//             status: 400,
//             body: { error: `Invalid request body: ${message}` },
//             headers,
//             url,
//           };
//         }
//         const originalReply = dbReplies[replyIndex];
//         const updatedReply: FeedReply = {
//           ...originalReply,
//           ...updatedReplyData,
//           text: updatedReplyData.text.trim(),
//           lastModified: toDateTimeInfo(new Date()),
//           isEdited: true,
//         };
//         const updatedRepliesForItem = [
//           ...dbReplies.slice(0, replyIndex),
//           updatedReply,
//           ...dbReplies.slice(replyIndex + 1),
//         ];
//         InMemoryDataService.db.socialFeeds[feedId].repliesByItem![
//           parentItemId
//         ] = updatedRepliesForItem;
//         console.log(
//           `[InMemoryDataService] Reply ${replyId} updated successfully.`
//         );
//         return { status: 200, body: updatedReply, headers, url };
//       });
//     }

//     // --- Fallback for other PUT requests ---
//     console.warn(
//       `[InMemoryDataService] No specific PUT handler found for ${url}. Passing to default handler (if any) or returning error.`
//     );
//     // Let the default in-memory handler try, or return a 404/501 explicitly
//     // Returning undefined lets the default handler proceed.
//     // Returning an error response guarantees no default handling attempt.
//     // return reqInfo.utils.createResponse$(() => ({ status: 501, body: { error: 'PUT method not implemented for this resource' }, headers: this.createJsonHeaders(), url }));
//     return undefined; // Let default handler try
//   } // End of PUT method

// delete(reqInfo: RequestInfo): Observable<ResponseOptions> | undefined {
//     const { collectionName, url, id, query } = reqInfo;
//     const logPrefix = '[InMemoryDb DELETE]';

//     console.log(`${logPrefix} request: url='${url}', collection='${collectionName}', id='${id}'`);


//     // --- Handler voor het verwijderen van een specifieke reply ---
//     // *** CORRECTED: Removed unnecessary escapes ***
//     const replyDeleteUrlPattern =
//       /api\/socialFeeds\/([^/]+)\/items\/([^/]+)\/replies\/([^/]+)/i;
//     const replyMatch = url.match(replyDeleteUrlPattern);

//     if (collectionName === 'feedReplies' && replyMatch) {
//       const feedId = replyMatch[1];
//       const parentItemId = replyMatch[2];
//       const replyIdToDelete = replyMatch[3];

//       console.log(
//         `[InMemoryDataService] Handling DELETE for reply: feedId=${feedId}, parentItemId=${parentItemId}, replyId=${replyIdToDelete}`
//       );

//       return reqInfo.utils.createResponse$(() => {
//         const feed = InMemoryDataService.db.socialFeeds[feedId];
//         if (!feed?.repliesByItem?.[parentItemId]) {
//           console.warn(
//             `[InMemoryDataService] DELETE Reply: Feed '${feedId}' or replies for item '${parentItemId}' not found.`
//           );
//           return this.createNotFoundResponseOptions(
//             reqInfo,
//             'Feed or parent item replies not found'
//           );
//         }

//         const repliesForItem = feed.repliesByItem[parentItemId];
//         const initialLength = repliesForItem.length;

//         // Filter de te verwijderen reply EN alle replies die daarop reageren (directe kinderen)
//         const updatedReplies = repliesForItem.filter(
//           (reply) =>
//             reply.id !== replyIdToDelete &&
//             reply.replyToReplyId !== replyIdToDelete
//         );

//         if (updatedReplies.length === initialLength) {
//           console.warn(
//             `[InMemoryDataService] DELETE Reply: Reply '${replyIdToDelete}' not found.`
//           );
//           return this.createNotFoundResponseOptions(
//             reqInfo,
//             `Reply '${replyIdToDelete}' not found`
//           );
//         }

//         // Update de replies voor het item (immutable)
//         feed.repliesByItem[parentItemId] = updatedReplies;

//         // Update replyCount op het hoofd item (immutable)
//         const itemIndex = feed.feedItems.findIndex(
//           (item) => item.id === parentItemId
//         );
//         if (itemIndex !== -1) {
//           const originalItem = feed.feedItems[itemIndex];
//           const numRemoved = initialLength - updatedReplies.length; // Hoeveel replies zijn er verwijderd
//           const updatedItem = {
//             ...originalItem,
//             replyCount: Math.max(
//               0,
//               (originalItem.replyCount ?? 0) - numRemoved
//             ), // Decrement count
//           };
//           // Update feedItems array immutable
//           const updatedFeedItems = [...feed.feedItems];
//           updatedFeedItems[itemIndex] = updatedItem;
//           InMemoryDataService.db.socialFeeds[feedId].feedItems =
//             updatedFeedItems;
//           console.log(
//             `[InMemoryDataService] Updated reply count for item ${parentItemId} after deleting ${numRemoved} replies.`
//           );
//         } else {
//           console.warn(
//             `[InMemoryDataService] DELETE Reply: Could not find parent item ${parentItemId} to update reply count.`
//           );
//         }

//         console.log(
//           `[InMemoryDataService] Reply '${replyIdToDelete}' (and any direct nested replies) deleted successfully.`
//         );
//         // Stuur 204 No Content terug bij succesvolle delete
//         return { status: 204, statusText: 'No Content', url: reqInfo.url };
//       });
//     }

//     // --- Handler voor het verwijderen van een specifiek feed item ---
//     // *** CORRECTED: Removed unnecessary escapes ***
//     const itemDeleteUrlPattern = /api\/socialFeeds\/([^/]+)\/items\/([^/]+)/i;
//     const itemMatch = url.match(itemDeleteUrlPattern);

//     if (collectionName === 'socialFeedItems' && itemMatch) {
//       const feedId = itemMatch[1];
//       const itemIdToDelete = itemMatch[2];

//       console.log(
//         `[InMemoryDataService] Handling DELETE for feed item: feedId=${feedId}, itemId=${itemIdToDelete}`
//       );

//       return reqInfo.utils.createResponse$(() => {
//         const feed = InMemoryDataService.db.socialFeeds[feedId];
//         if (!feed) {
//           console.warn(
//             `[InMemoryDataService] DELETE Item: Feed '${feedId}' not found.`
//           );
//           return this.createNotFoundResponseOptions(
//             reqInfo,
//             `Feed '${feedId}' not found`
//           );
//         }

//         const initialLength = feed.feedItems.length;
//         // Verwijder het item immutable
//         const updatedFeedItems = feed.feedItems.filter(
//           (item) => item.id !== itemIdToDelete
//         );

//         if (updatedFeedItems.length === initialLength) {
//           console.warn(
//             `[InMemoryDataService] DELETE Item: Item '${itemIdToDelete}' not found.`
//           );
//           return this.createNotFoundResponseOptions(
//             reqInfo,
//             `Item '${itemIdToDelete}' not found`
//           );
//         }

//         // Update feed items
//         InMemoryDataService.db.socialFeeds[feedId].feedItems = updatedFeedItems;

//         // Verwijder ook alle replies die bij dit item hoorden
//         if (feed.repliesByItem && feed.repliesByItem[itemIdToDelete]) {
//           delete feed.repliesByItem[itemIdToDelete];
//           console.log(
//             `[InMemoryDataService] Deleted associated replies for item '${itemIdToDelete}'.`
//           );
//         }

//         console.log(
//           `[InMemoryDataService] Feed item '${itemIdToDelete}' deleted successfully.`
//         );
//         // Stuur 204 No Content terug
//         return { status: 204, statusText: 'No Content', url: reqInfo.url };
//       });
//     }

//     // 11. Check voor Lifeskills endpoint (VOOR de algemene 'users' parser)
//     if (collectionName === 'userLifeskills') {
//       console.log(`${logPrefix} Matched 'userLifeskills'. Handling GET for 'userLifeskills'. URL: ${url}`); // Nieuwe log
//       const userIdFromToken: string = 'admin-profile-0'; // Fallback to admin user for mock purposes

//       const userSkills = InMemoryDataService.db.lifeskillsByUser?.[userIdFromToken];
//       if (userSkills) {
//           console.log(`${logPrefix} [userLifeskills] Returning ${userSkills.length} lifeskills for user ${userIdFromToken}.`);
//           return this.createOkResponse(reqInfo, userSkills);
//       } else {
//           console.log(`${logPrefix} [userLifeskills] No lifeskills found for user ${userIdFromToken}, generating them now.`);
//           if (!InMemoryDataService.db.lifeskillsByUser) InMemoryDataService.db.lifeskillsByUser = {};

//           const profiles = InMemoryDataService.db.profiles; // Moet al gevuld zijn
//           const currentUserProfile = profiles.find(p => p.id === userIdFromToken);

//           if (currentUserProfile) {
//               const generatedSkills = this.generateMockUserLifeskills(userIdFromToken);
//               InMemoryDataService.db.lifeskillsByUser[userIdFromToken] = generatedSkills;
//               console.log(`${logPrefix} [userLifeskills] Generated on-the-fly ${generatedSkills.length} lifeskills for user ${userIdFromToken}`);
//               return this.createOkResponse(reqInfo, generatedSkills);
//           } else {
//                console.warn(`${logPrefix} [userLifeskills] Could not find profile for user ${userIdFromToken} to generate lifeskills.`);
//                return this.createOkResponse(reqInfo, []);
//           }
//       }
//     } // --- Einde if (collectionName === 'userLifeskills') ---

//     // 13. Check voor Skill Definitions endpoint (VOOR de algemene 'skills' parser)
// if (collectionName === 'skillDefinitions') {
//   this.logParsing(`${logPrefix} Handling GET for skillDefinitions.`);
//   return this.createOkResponse(reqInfo, InMemoryDataService.db.skillDefinitions || []);
// }
// if (collectionName === 'userSkills') {
//   this.logParsing(`${logPrefix} Handling GET for userSkills.`);
//   // Voor nu retourneren we alle userSkills. In een echte API zou je filteren op userId.
//   // Voor de mock, als je user-specifieke data wilt, moet je de userId uit de token halen
//   // zoals bij user/stats en user/lifeskills, en dan filteren.
//   // Voorbeeld (vereenvoudigd, zonder user filtering):
//   return this.createOkResponse(reqInfo, InMemoryDataService.db.userSkills || []);
// }
// // ...
// // Bij de default switch:
// switch (collectionName) {
//   // ...
//   case 'skillDefinitions': // Fallback voor de default handler
//   case 'userSkills':       // Fallback
//     console.log(`${logPrefix} Matched simple collection '${collectionName}'. Using default GET handler.`);
//     return undefined;
// }

//     // --- Einde Handlers ---

//     console.warn(
//       `[InMemoryDataService] No specific DELETE handler found for ${url}. Passing to default handler.`
//     );
//     return undefined; // Laat default handler overnemen of forceer 404 indien gewenst
//   }

//   patch(reqInfo: RequestInfo): Observable<ResponseOptions> | undefined {
//     const { collectionName, id, query } = reqInfo;
//     const logPrefix = '[InMemoryDb PATCH]';


//     console.warn(`${logPrefix} No specific PATCH handler found for URL: ${reqInfo.url}.`);
//     return undefined;
//   }

//   // --- helpers ---
//     // Helper voor mock AI antwoord
//     private generateMockAiReply(conversationId: string, userInput: string, userProfileForReplyContext?: Profile): Message {
//       let aiReplyContent = `De AI Coach antwoordt op: "${userInput.substring(0, 30)}..."\n${faker.lorem.sentence({min: 5, max: 15})}`;
//       let aiReplyMedia: Media[] | undefined = undefined;

//       if (faker.datatype.boolean(0.25)) { // 25% kans op een afbeelding in het AI antwoord
//           this.mediaIdCounter++;
//           const imageId = `media-ai-${this.mediaIdCounter}-${Date.now()}`;
//           const masterWidth = 400;
//           const masterHeight = 300;
//           const imgCategory = faker.helpers.arrayElement(['nature', 'technology', 'cats', 'abstract']);

//           const variants: ImageVariant[] = [
//             {
//               url: faker.image.urlLoremFlickr({ category: imgCategory, width: masterWidth, height: masterHeight }),
//               width: masterWidth, height: masterHeight, format: 'jpeg', purpose: 'original_quality', descriptor: `${masterWidth}w`
//             },
//             {
//               url: faker.image.urlLoremFlickr({ category: imgCategory, width: 200, height: 150 }),
//               width: 200, height: 150, format: 'jpeg', purpose: 'thumbnail', descriptor: '200w'
//             }
//           ];

//           // Maak een correct Image object
//           const aiImage: Image = {
//               id: imageId,
//               type: MediaType.IMAGE,
//               variants: variants,
//               title: `AI Generated Image ${this.mediaIdCounter}`,
//               altText: `AI generated image related to: ${userInput.substring(0,20)}`,
//               sourceType: ImageSourceType.AI_GENERATED,
//               originalMasterDimensions: { width: masterWidth, height: masterHeight },
//               createdAt: toDateTimeInfo(new Date()),
//           };
//           aiReplyMedia = [aiImage]; // Stop het Image object in de array
//           aiReplyContent += "\nBekijk dit eens!";
//       }

//       const aiBotProfile = InMemoryDataService.db.profiles.find(p => p.id === this.AI_BOT_USER_ID) || this.getAiBotProfile();

//       return {
//           id: `msg-ai-${Date.now()}-${faker.string.alphanumeric(5)}`,
//           conversationId: conversationId,
//           senderId: this.AI_BOT_USER_ID,
//           senderType: 'Bot',
//           senderProfile: aiBotProfile,
//           content: aiReplyContent,
//           media: aiReplyMedia, // Dit is nu een Media[] met een correct Image object
//           gifUrl: undefined, // AI stuurt geen GIFs in deze mock
//           createdAt: toDateTimeInfo(new Date(Date.now() + faker.number.int({min: 500, max: 2000}))),
//           status: 'Delivered',
//           isEdited: false,
//           reactions: [],
//           userReaction: null
//       };
//     }


//   // --- Private Handler Implementations ---
//   private getAiBotProfile(): Profile {
//     const avatarImage: Image = {
//       id: `avatar-${this.AI_BOT_USER_ID}`,
//       type: MediaType.IMAGE,
//       title: 'AI Coach Avatar',
//       altText: 'Avatar for AI Challenger Coach',
//       sourceType: ImageSourceType.SYSTEM_DEFAULT,
//       createdAt: this.mockDateTime(),
//       originalMasterDimensions: { width: 100, height: 100 },
//       variants: [
//         {
//           url: this.AI_BOT_AVATAR_URL,
//           width: 100,
//           height: 100,
//           purpose: 'original_quality',
//           format: 'jpeg',
//           descriptor: '100w'
//         }
//       ]
//     };

//     return {
//       id: this.AI_BOT_USER_ID,
//       displayName: this.AI_BOT_DISPLAY_NAME,
//       avatar: avatarImage,
//       level: 100, // Voorbeeld
//       reputation: 0, // Voorbeeld
//     };
//   }




//   /** Handles POST request to add a new feed item. */
//   private handleAddFeedItem(
//     reqInfo: RequestInfo,
//     feedId: string
//   ): Observable<ResponseOptions> {
//     const currentUserId = 'admin-profile-0';
//     const logPrefix = '[InMemoryDb AddFeedItem]';
//     console.log(`${logPrefix} Handling for feed: ${feedId}`);

//     return reqInfo.utils.createResponse$((): ResponseOptions => {
//       const feed = InMemoryDataService.db.socialFeeds[feedId];
//       if (!feed) {
//         return this.createNotFoundResponseOptions(
//           reqInfo,
//           `Feed '${feedId}' not found`
//         );
//       }

//       try {
//         const body = reqInfo.utils.getJsonBody(
//           reqInfo.req
//         ) as Partial<FeedItem>;
//         if (!body) {
//           return this.createErrorResponseOptions(
//             reqInfo,
//             400,
//             'Invalid feed item body: Empty body received.'
//           );
//         }

//         // === VERNIEUWDE VALIDATIE ===
//         const hasText =
//           typeof body.text === 'string' && body.text.trim().length > 0;
//         const hasMedia = Array.isArray(body.media) && body.media.length > 0;
//         const hasGif = typeof body.gifUrl === 'string' && !!body.gifUrl;

//         // Moet minimaal tekst, media, OF een gif hebben
//         if (!hasText && !hasMedia && !hasGif) {
//           this.logParsing(
//             `${logPrefix} Invalid feed item body for feed ${feedId}. Missing text, media, and gifUrl.`
//           ); // Gebruik logger hier
//           return this.createErrorResponseOptions(
//             reqInfo,
//             400,
//             'Invalid feed item body. Requires text, media, or a gifUrl.'
//           );
//         }
//         // ============================

//         this.feedItemIdCounter++;
//         const itemId = `feeditem-${this.feedItemIdCounter}-${feedId
//           .split('-')
//           .pop()}-${Date.now()}`;
//         let author = InMemoryDataService.db.profiles.find(
//           (p) => p.id === currentUserId
//         );
//         if (!author) {
//           author = {
//             id: 'unknown',
//             displayName: 'Unknown',
//             avatar: {
//               id: 'default-avatar',
//               type: MediaType.IMAGE,
//               variants: [{
//                 url: 'assets/images/placeholder-100x100.jpg',
//                 width: 100,
//                 height: 100,
//                 format: 'jpeg',
//                 purpose: 'original_quality',
//                 descriptor: '100w'
//               }],
//               title: 'Default Avatar',
//               altText: 'Default user avatar',
//               sourceType: ImageSourceType.SYSTEM_DEFAULT,
//               originalMasterDimensions: { width: 100, height: 100 },
//               createdAt: this.mockDateTime(),
//             },
//             level: 1,
//             reputation: 0,
//           };
//         }

//         const newItem: FeedItem = {
//           id: itemId,
//           feedId: feedId,
//           author: author,
//           text: body.text?.trim() ?? '', // Trim text, default to empty string
//           media: body.media ?? [],
//           gifUrl: body.gifUrl ?? undefined,
//           createdAt: toDateTimeInfo(new Date()),
//           // ... rest van de properties ...
//           reactions: [],
//           userReaction: null,
//           replyCount: 0,
//           tags: body.tags ?? [],
//           isEdited: false,
//           isPinned: false,
//           isHidden: false,
//           isSaved: false,
//           privacy: body.privacy ?? PrivacyLevel.PUBLIC,
//         };

//         console.log(
//           `${logPrefix} Creating new feed item: id=${itemId}, HasText: ${hasText}, HasMedia: ${hasMedia}, HasGif: ${hasGif}`
//         );
//         InMemoryDataService.db.socialFeeds[feedId].feedItems = [
//           newItem,
//           ...feed.feedItems,
//         ];
//         console.log(
//           `${logPrefix} Successfully added feed item ${itemId} to feed ${feedId}.`
//         );
//         return this.createCreatedResponseOptions(reqInfo, newItem);
//       } catch (error) {
//         const message =
//           error instanceof Error ? error.message : 'Unknown error parsing body';
//         console.error(
//           `${logPrefix} Error processing add item request for feed ${feedId}: ${message}`
//         );
//         return this.createErrorResponseOptions(
//           reqInfo,
//           400,
//           `Invalid request body: ${message}`
//         );
//       }
//     });
//   }
//   // --- END: NEW HANDLER FUNCTION ---

//   /** Handles GET requests for replies of a specific feed item. */
//   private handleGetFeedItemReplies(
//     reqInfo: RequestInfo,
//     ids: { feedId: string; parentItemId: string }
//   ): Observable<ResponseOptions> {
//     const { feedId, parentItemId } = ids;
//     console.log(
//       `[InMemoryDataService] Handling GET for replies: feedId=${feedId}, parentItemId=${parentItemId}`
//     );
//     const feed = InMemoryDataService.db.socialFeeds[feedId];
//     if (!feed)
//       return this.createNotFoundResponse(
//         reqInfo,
//         `SocialFeed '${feedId}' not found.`
//       );
//     const repliesByItem = (feed as any).repliesByItem || {};
//     const replies = repliesByItem[parentItemId] || [];
//     console.log(
//       `[InMemoryDataService] Found ${replies.length} replies for item ${parentItemId}.`
//     );
//     return this.createOkResponse(reqInfo, replies);
//   }

//   /** Handles GET requests for items of a specific social feed. */
//   private handleGetSocialFeedItems(
//     reqInfo: RequestInfo,
//     feedId: string
//   ): Observable<ResponseOptions> {
//     const logPrefix = '[InMemoryDb GetFeedItems]';
//     console.log(`${logPrefix} Handling for feed: ${feedId}`);

//     // --- CRITICAL DEBUG LOGS START ---
//     // Log de volledige inhoud van socialFeeds op het moment van de aanvraag
//     console.warn(`${logPrefix} DEBUG: Current state of InMemoryDataService.db.socialFeeds:`, JSON.stringify(InMemoryDataService.db.socialFeeds, null, 2));
//     // Controleer expliciet of de aangevraagde feedId een sleutel is in de map
//     console.warn(`${logPrefix} DEBUG: Does InMemoryDataService.db.socialFeeds contain key '${feedId}'?`, feedId in InMemoryDataService.db.socialFeeds);
//     // --- CRITICAL DEBUG LOGS END ---

//     const feed = InMemoryDataService.db.socialFeeds[feedId]; // Zoek met schone ID
//     if (!feed) {
//       console.warn(`${logPrefix} SocialFeed '${feedId}' NOT FOUND in InMemoryDataService.db.socialFeeds map.`);
//       return this.createNotFoundResponse(
//         reqInfo,
//         `SocialFeed '${feedId}' not found`
//       );
//     }

//     const allItems = feed.feedItems ?? [];
//     const { query } = reqInfo;
//     const pageNumber = +(query.get('page')?.[0] || '1');
//     const pageSize = +(query.get('limit')?.[0] || '10');
//     const totalItems = allItems.length;
//     const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1;
//     const startIndex = (pageNumber - 1) * pageSize;
//     const pageItems = allItems.slice(startIndex, startIndex + pageSize);

//     console.log(
//       `${logPrefix} Feed ${feedId}: Page ${pageNumber}/${totalPages}, Size ${pageSize}, Total ${totalItems}. Returning ${pageItems.length} items.`
//     );

//     const responseBody: PaginatedList<FeedItem> = {
//       items: pageItems,
//       totalCount: totalItems,
//       pageIndex: pageNumber,
//       pageSize: pageSize,
//       totalPages: totalPages,
//     };
//     return this.createOkResponse(reqInfo, responseBody);
//   }

//   /** Handles GET requests for challenges (single or list with params). */
//   private handleGetChallenges(
//     reqInfo: RequestInfo
//   ): Observable<ResponseOptions> {
//     const id = reqInfo.id as string | undefined | null;
//     // *** NIEUWE LOGGING ***
//     console.log(
//       `[InMemoryDataService] handleGetChallenges: Attempting to GET challenge with ID: '${id}' (Type: ${typeof id})`
//     );

//     if (typeof id === 'string') {
//       // *** NIEUWE LOGGING: Log beschikbare IDs ***
//       const availableChallengeIds = InMemoryDataService.db.challenges.map(
//         (c) => c.id
//       );
//       console.log(
//         `[InMemoryDataService] handleGetChallenges: Available challenge IDs at this moment:`,
//         availableChallengeIds
//       );
//       // ------------------------------------------

//       const challenge = InMemoryDataService.db.challenges.find(
//         (c) => c.id === id
//       );

//       // *** NIEUWE LOGGING: Log resultaat van find ***
//       if (challenge) {
//         console.log(
//           `[InMemoryDataService] handleGetChallenges: Found challenge for ID '${id}'.`
//         );
//         return this.createOkResponse(reqInfo, challenge);
//       } else {
//         console.error(
//           `[InMemoryDataService] handleGetChallenges: Challenge NOT FOUND for ID '${id}'.`
//         );
//         return this.createNotFoundResponse(
//           reqInfo,
//           `Challenge '${id}' not found`
//         );
//       }
//       // -------------------------------------------
//     } else {
//       // List request (met query params)
//       console.log(
//         `[InMemoryDataService] handleGetChallenges: Handling list request (ID is null/undefined).`
//       );
//       return this.applyChallengeQueryParams(reqInfo);
//     }
//   }

//   /** Handles GET requests for nodes (single or list). */
//   private handleGetNodes(reqInfo: RequestInfo): Observable<ResponseOptions> {
//     const logPrefix = '[InMemoryDb GET Nodes]';
//     // `id` can now be an empty string '' for list requests, or a specific node ID for detail requests.
//     const id = reqInfo.id as string | undefined | null;

//     // FIX: Explicitly check if 'id' is a non-empty string for a detail request.
//     // If id is null, undefined, or an empty string '', it's treated as a list request.
//     if (typeof id === 'string' && id !== '') {
//       // Detail Request: GET /api/nodes/{id} -> Returns NodeFull
//       this.logParsing(
//         `${logPrefix} Handling detail request for Node ID: ${id}`
//       );
//       const node = InMemoryDataService.db.nodes.find((n) => n.id === id);
//       return node
//         ? this.createOkResponse(reqInfo, node)
//         : this.createNotFoundResponse(reqInfo, `Node '${id}' not found`);
//     } else {
//       // List Request: GET /api/nodes -> Returns NodeSummary[] (or filtered list)
//       this.logParsing(
//         `${logPrefix} Handling list request. Returning SIMPLE Node Summaries.`
//       );
//       // TODO: Implement filtering based on query parameters (reqInfo.query) here if needed for the list view.

//       const summaries: NodeSummary[] = InMemoryDataService.db.nodes.map(
//         (node) => {
//           // Construct the base NodeSummary
//           return {
//             id: node.id,
//             title: node.title,
//             type: node.type,
//             status: node.status,
//             location: {
//               coordinates: node.location.coordinates,
//               address: node.location.address,
//             },
//             popularity: node.popularity,
//             // Only include challengeId if it's a START node and exists
//             challengeId:
//               node.type === NodeType.START && node.challengeId
//                 ? node.challengeId
//                 : null,
//             // Ensure no `challengePreview` field is included here for NodeSummary
//           };
//         }
//       );
//       // Return the list of NodeSummary objects
//       return this.createOkResponse(reqInfo, summaries);
//     }
//   }

//   private findChallengeSummary(
//     challengeId: string
//   ): ChallengeSummary | undefined {
//     const challenge = InMemoryDataService.db.challenges.find(
//       (c) => c.id === challengeId
//     );
//     if (!challenge) return undefined;
//     // Map naar ChallengeSummary
//     // *** AANGEPAST: Ontbrekende properties toegevoegd ***
//     return {
//       id: challenge.id,
//       title: challenge.title,
//       summary: challenge.summary,
//       isGroupChallenge: challenge.isGroupChallenge,
//       coverImageUrl: challenge.coverImageUrl,
//       difficultyLevel: challenge.difficultyLevel,
//       popularity: faker.number.int({ min: 50, max: 10000 }),
//       rating: parseFloat(
//           faker.number
//             .float({ min: 2.5, max: 5.0, fractionDigits: 1 })
//             .toFixed(1)
//         ),
//       startDate: challenge.startDate,
//       endDate: challenge.endDate,
//       maxParticipants: challenge.maxParticipants,
//       starterNodeId: challenge.starterNodeId,
//       // Optionele velden uit summary:
//       type: challenge.type,
//       rewardXP: challenge.rewardXP,
//       hasItemReward: challenge.hasItemReward,
//       // Toegevoegde verplichte velden
//       rewards: challenge.rewards,
//       modeOfCompletions: challenge.modeOfCompletions,
//       feedId: challenge.feedId,
//       estimatedDuration: challenge.estimatedDuration,
//       mainImageUrl: challenge.mainImageUrl,
//       equipment: challenge.equipment,
//       createdAt: challenge.createdAt,
//       lastModified: challenge.lastModified,
//     };
//   }

//   private findRecentFeedItems(feedId: string, limit: number): FeedItem[] {
//     const feed = InMemoryDataService.db.socialFeeds[feedId];
//     if (!feed || !feed.feedItems) return [];
//     // Sorteer op datum (nieuwste eerst) en neem de top 'limit'
//     return [...feed.feedItems] // Kopie maken voor sorteren
//       .sort((a, b) => (b.createdAt?.timestamp ?? 0) - (a.createdAt?.timestamp ?? 0))
//       .slice(0, limit);
//   }

//   /** Handles POST request to add a new feed reply. */
//   private handleAddFeedReply(
//     reqInfo: RequestInfo,
//     feedId: string,
//     parentItemId: string
//   ): Observable<ResponseOptions> {
//     const currentUserId = 'admin-profile-0';
//     console.log(
//       `[InMemoryDataService] Handling add new reply POST for FeedItem: ${parentItemId}, Feed: ${feedId}`
//     );

//     return reqInfo.utils.createResponse$((): ResponseOptions => {
//       // --- 1. Find the feed and validate structure ---
//       const feed = InMemoryDataService.db.socialFeeds[feedId];
//       if (!feed) {
//         return this.createNotFoundResponseOptions(
//           reqInfo,
//           `Feed '${feedId}' not found`
//         );
//       }
//       // Ensure repliesByItem exists (initialize if needed, although unlikely in this flow)
//       if (!(feed as any).repliesByItem) {
//         (feed as any).repliesByItem = {};
//         console.warn(
//           `[InMemoryDataService] Initialized missing repliesByItem structure for feed ${feedId}`
//         );
//       }
//       // Ensure the specific array for the parentItemId exists
//       if (!(feed as any).repliesByItem[parentItemId]) {
//         (feed as any).repliesByItem[parentItemId] = [];
//         console.log(
//           `[InMemoryDataService] Initialized replies array for parent item ${parentItemId}`
//         );
//       }
//       const repliesForItemCollection = (feed as any).repliesByItem[
//         parentItemId
//       ]; // Get reference

//       try {
//         // --- Parse Body ---
//         const body = reqInfo.utils.getJsonBody(
//           reqInfo.req
//         ) as Partial<FeedReply>;
//         console.log(
//           '[InMemoryDataService] Parsed reply body:',
//           JSON.stringify(body)
//         );

//         // --- Extract Data ---
//         const text = body?.text?.trim() ?? ''; // Default to empty string if null/undefined
//         const mediaFromBody = body?.media ?? []; // Extract media array, default to empty
//         const gifUrlFromBody = body?.gifUrl;
//         const replyToReplyIdFromBody = body?.replyToReplyId;

//         // --- Validation: Check if text OR media OR gifUrl is present ---
//         if (!text && mediaFromBody.length === 0 && !gifUrlFromBody) {
//           // <<== Check ook gifUrl
//           console.error(
//             '[InMemoryDataService] Invalid reply body. Text, Media, and GIF are empty.'
//           );
//           return this.createErrorResponseOptions(
//             reqInfo,
//             400,
//             'Invalid reply body. Text, media or GIF required.'
//           );
//         }
//         // --- END Validation ---

//         // --- Generate Reply ---
//         this.replyIdCounter++;
//         const replyId = `reply-${this.replyIdCounter}`;
//         // ... (get author, calculate level) ...
//         let author = InMemoryDataService.db.profiles.find(
//           (p) => p.id === 'admin-profile-0'
//         ); // Example user
//         if (!author) {
//           console.error(
//             `[InMemoryDataService] Mock Error: Could not find profile for hardcoded user ID: ${currentUserId}`
//           );
//           // Retourneer een error response of gebruik een fallback profiel
//           // Voor nu een fallback:
//           const fallbackAuthor: Profile = {
//             id: 'unknown-user',
//             displayName: 'Unknown User',
//             avatar: undefined,
//           };
//           author = fallbackAuthor;
//         }
//         const calculatedLevel = this.calculateLevel(
//           replyToReplyIdFromBody,
//           (feed as any).repliesByItem[parentItemId] || []
//         );

//         const newReply: FeedReply = {
//           id: replyId,
//           parentId: parentItemId,
//           replyToReplyId: replyToReplyIdFromBody,
//           feedId: feedId,
//           author: author,
//           text: text, // Store potentially empty text
//           media: mediaFromBody, // <-- STORE THE MEDIA
//           gifUrl: gifUrlFromBody,
//           createdAt: toDateTimeInfo(new Date()),
//           reactions: [],
//           userReaction: null,
//           isEdited: false,
//           isDeleted: false,
//           level: calculatedLevel,
//         };

//         console.log(
//           `[InMemoryDataService] Creating new reply: id=${replyId}, textPresent=${!!text}, mediaCount=${
//             mediaFromBody.length
//           }, gifPresent=${!!gifUrlFromBody}`
//         );

//         // --- Update DB ---
//         const updatedReplies = [
//           ...((feed as any).repliesByItem[parentItemId] || []),
//           newReply,
//         ];
//         (feed as any).repliesByItem[parentItemId] = updatedReplies;
//         // ... (update parent item reply count) ...
//         const itemIndex = feed.feedItems.findIndex(
//           (item) => item.id === parentItemId
//         );
//         if (itemIndex !== -1) {
//           /* ... safely increment replyCount ... */
//           const originalItem = feed.feedItems[itemIndex];
//           const updatedItem = {
//             ...originalItem,
//             replyCount: (originalItem.replyCount ?? 0) + 1,
//           };
//           const updatedFeedItems = [...feed.feedItems];
//           updatedFeedItems[itemIndex] = updatedItem;
//           InMemoryDataService.db.socialFeeds[feedId].feedItems =
//             updatedFeedItems;
//         }

//         console.log(
//           `[InMemoryDataService] Successfully added reply ${replyId}.`
//         );
//         return this.createCreatedResponseOptions(reqInfo, newReply);
//       } catch (error) {
//         console.error(
//           `[InMemoryDataService] Error processing add reply request for parent ${parentItemId}:`,
//           error
//         );
//         return this.createErrorResponseOptions(
//           reqInfo,
//           400,
//           `Invalid request body for add reply: ${
//             error instanceof Error ? error.message : 'Unknown error'
//           }`
//         );
//       }
//     });
//   }

//   // --- Helper function to calculate nesting level ---
//   /** Calculates the nesting level for a new reply. */
//   private calculateLevel(
//     replyToReplyId: string | undefined,
//     allRepliesForParentItem: FeedReply[]
//   ): number {
//     if (!replyToReplyId) {
//       return 0; // Top level reply (level 0)
//     }
//     // Find the parent reply within the list of replies for the *same main item*
//     const parentReply = allRepliesForParentItem.find(
//       (r) => r.id === replyToReplyId
//     );
//     if (parentReply) {
//       return (parentReply.level ?? 0) + 1; // Level is parent's level + 1
//     } else {
//       console.warn(
//         `[InMemoryDataService] calculateLevel: Could not find parent reply with ID ${replyToReplyId} to determine level. Defaulting to 0.`
//       );
//       return 0; // Fallback if parent reply isn't found (shouldn't happen ideally)
//     }
//   }

//   /** Handles POST request to add a log entry. */
//   // *** FIX: Method definition added ***
//   private postLogEntry(reqInfo: RequestInfo): Observable<ResponseOptions> {
//     console.log('[InMemoryDataService] Handling POST for log entry.');
//     return reqInfo.utils.createResponse$(() => {
//       try {
//         const newLog: LogEntry = reqInfo.utils.getJsonBody(reqInfo.req);
//         if (!newLog)
//           return this.createErrorResponseOptions(
//             reqInfo,
//             400,
//             'Invalid log entry body.'
//           );
//         newLog.id = `log-${Date.now()}-${faker.string.alphanumeric(5)}`;
//         newLog.createdAt = Date.now();
//         InMemoryDataService.db.logs.push(newLog);
//         console.log(`[InMemoryDataService] Added log entry: ${newLog.id}`);
//         return this.createCreatedResponseOptions(reqInfo, newLog);
//       } catch (error) {
//         console.error(
//           '[InMemoryDataService] Error parsing log entry body:',
//           error
//         );
//         return this.createErrorResponseOptions(
//           reqInfo,
//           400,
//           'Failed to parse log entry body.'
//         );
//       }
//     });
//   }

//   /** Handles POST request for node interactions. */
//   // *** FIX: Method definition added ***
//   private handleNodeInteraction(
//     reqInfo: RequestInfo
//   ): Observable<ResponseOptions> {
//     const nodeId = reqInfo.id as string;
//     console.log(
//       `[InMemoryDataService] Handling node interaction POST for node: ${nodeId}`
//     );
//     if (!nodeId)
//       return this.createErrorResponse(
//         reqInfo,
//         400,
//         'Node ID required for interaction.'
//       );

//     return reqInfo.utils.createResponse$(() => {
//       const nodeIndex = InMemoryDataService.db.nodes.findIndex(
//         (n) => n.id === nodeId
//       );
//       if (nodeIndex === -1)
//         return this.createNotFoundResponseOptions(
//           reqInfo,
//           `Node '${nodeId}' not found`
//         );

//       try {
//         const body = reqInfo.utils.getJsonBody(reqInfo.req);
//         const action = body?.action;
//         console.log(
//           `[InMemoryDataService] Node interaction action: '${action}'`
//         );
//         if (!action)
//           return this.createErrorResponseOptions(
//             reqInfo,
//             400,
//             'Interaction action missing in request body.'
//           );

//         const originalNode = InMemoryDataService.db.nodes[nodeIndex];
//         const updatedNode = { ...originalNode };
//         let updated = false;

//         if (action === 'unlock' && updatedNode.status !== NodeStatus.UNLOCKED) {
//           updatedNode.status = NodeStatus.UNLOCKED;
//           updated = true;
//         } else if (
//           action === 'complete' &&
//           updatedNode.status !== NodeStatus.COMPLETED
//         ) {
//           updatedNode.status = NodeStatus.COMPLETED;
//           updated = true;
//         } else if (
//           action === 'lock' &&
//           updatedNode.status !== NodeStatus.LOCKED
//         ) {
//           updatedNode.status = NodeStatus.LOCKED;
//           updated = true;
//         }

//         if (updated) {
//           InMemoryDataService.db.nodes[nodeIndex] = updatedNode;
//           console.log(
//             `[InMemoryDataService] Node ${nodeId} status updated to ${updatedNode.status}`
//           );
//         } else {
//           console.log(
//             `[InMemoryDataService] Node ${nodeId} status unchanged (${updatedNode.status}).`
//           );
//         }
//         return this.createOkResponseOptions(reqInfo, updatedNode);
//       } catch (error) {
//         console.error(
//           `[InMemoryDataService] Error processing node interaction body for ${nodeId}:`,
//           error
//         );
//         return this.createErrorResponseOptions(
//           reqInfo,
//           400,
//           'Failed to parse node interaction body.'
//         );
//       }
//     });
//   }

//   /** Applies query parameters for challenges. */
//   // *** FIX: Method definition added ***
//   private applyChallengeQueryParams(
//     reqInfo: RequestInfo
//   ): Observable<ResponseOptions> {
//     console.log(
//       '[InMemoryDataService] Applying query parameters to challenges list.'
//     );
//     const { query } = reqInfo;
//     const overviewFlag = query.get('overview')?.[0] === 'true';
//     let challenges = [...InMemoryDataService.db.challenges];

//     // Filtering Logic
//     const difficultyIds = query.get('difficultyLevelIds');
//     if (difficultyIds && difficultyIds.length > 0) {
//       const difficultySet = new Set(difficultyIds);
//       challenges = challenges.filter((c) =>
//         difficultySet.has(c.difficultyLevelId)
//       );
//       console.log(
//         `[InMemoryDataService] Filtered challenges by difficulty: ${difficultyIds.join(
//           ','
//         )}. Count: ${challenges.length}`
//       );
//     }
//     const statuses = query.get('status');
//     if (statuses && statuses.length > 0) {
//       const statusSet = new Set(statuses);
//       challenges = challenges.filter((c) => statusSet.has(c.status));
//       console.log(
//         `[InMemoryDataService] Filtered challenges by status: ${statuses.join(
//           ','
//         )}. Count: ${challenges.length}`
//       );
//     }

//     // Pagination Logic
//     const totalCount = challenges.length;
//     const pageNumber = +(query.get('pageNumber')?.[0] || 1);
//     const pageSize = +(query.get('pageSize')?.[0] || totalCount);
//     const totalPages = pageSize > 0 ? Math.ceil(totalCount / pageSize) : 1;
//     const startIndex = (pageNumber - 1) * pageSize;
//     const pageItems = challenges.slice(startIndex, startIndex + pageSize);
//     console.log(
//       `[InMemoryDataService] Pagination: Page ${pageNumber}/${totalPages}, Size ${pageSize}, Total ${totalCount}. Returning ${pageItems.length} items.`
//     );

//     // Response Body Formatting
//     let responseBody: any;
//     if (overviewFlag) {
//       const overviews: NodeSummary[] = pageItems.map((c) => {
//         // Map to NodeSummary
//         const node = InMemoryDataService.db.nodes.find(
//           (n) => n.id === c.starterNodeId
//         );
//         return {
//           // *** FIX: Ensure all required NodeSummary properties are mapped ***
//           id: node?.id ?? c.starterNodeId ?? `fallback-node-${c.id}`,
//           title: node?.title ?? c.title,
//           type: node?.type ?? NodeType.START,
//           status: node?.status ?? NodeStatus.LOCKED,
//           location: {
//             coordinates: node?.location?.coordinates ?? { lat: 0, lng: 0 }, // Default coords if missing
//             address: node?.location?.address,
//           },
//           popularity: c.popularity ?? 0, // Default popularity if missing
//         };
//       });
//       responseBody = {
//         items: overviews,
//         totalCount,
//         pageIndex: pageNumber,
//         pageSize,
//         totalPages,
//       };
//     } else {
//       // *** AANGEPAST: Map naar volledige ChallengeSummary ***
//       const summaries: ChallengeSummary[] = pageItems.map(
//         (c) => this.findChallengeSummary(c.id)!
//       );
//       responseBody = {
//         items: summaries,
//         totalCount,
//         pageIndex: pageNumber,
//         pageSize,
//         totalPages,
//       };
//     }
//     return this.createOkResponse(reqInfo, responseBody);
//   }

//   // --- Mock Data Generation Methods ---
//   private generateMockProfiles(count: number): Profile[] {
//     const profiles: Profile[] = [];
//     for (let i = 1; i <= count; i++) {
//       this.mediaIdCounter++;
//       const avatarUrl = faker.image.avatarGitHub();
//       const avatarImage: Image = {
//         id: `avatar-${this.mediaIdCounter}-profile-${i}`,
//         type: MediaType.IMAGE,
//         variants: [
//           {
//             url: avatarUrl,
//             width: 150,
//             height: 150,
//             format: 'jpeg',
//             purpose: 'original_quality',
//             descriptor: '150w'
//           },
//           {
//             url: avatarUrl,
//             width: 50,
//             height: 50,
//             format: 'jpeg',
//             purpose: 'thumbnail',
//             descriptor: '50w'
//           }
//         ],
//         title: `Avatar for profile ${i}`,
//         altText: `Profile avatar for ${faker.person.fullName()}`,
//         sourceType: ImageSourceType.USER_UPLOADED,
//         originalMasterDimensions: { width: 150, height: 150 },
//         createdAt: toDateTimeInfo(new Date()),
//       };

//       profiles.push({
//         id: `profile-${i}`,
//         displayName: faker.person.fullName(),
//         avatar: avatarImage,
//         level: faker.number.int({ min: 1, max: 50 }),
//         reputation: faker.number.int({ min: 0, max: 5000 }),
//       });
//     }
//     return profiles;
//   }

//   private generateMockChallenges(
//     count: number,
//     profiles: Profile[],
//     routes: Route[]
//   ): Challenge[] {
//     const challenges: Challenge[] = [];
//     const statuses: ChallengeStatus[] = [
//       'Active',
//       'Upcoming',
//       'Completed',
//       'Recording',
//     ];
//     // Gebruik een specifieke creator of wissel af
//     const creator = profiles[0]; // Gebruik bijvoorbeeld altijd de eerste (admin) als creator

//     for (let i = 1; i <= count; i++) {
//       // *** AANGEPAST: Zorg ervoor dat de challenge ID overeenkomt met de verwachte route pattern ***
//       const routeId = `route-${i}`;
//       const challengeId = `chal-for-${routeId}`;

//       // Zorg voor een fallback als er minder routes dan challenges zijn
//       const route =
//         routes[i - 1] ??
//         routes[routes.length - 1] ??
//         this.generateMockRoute(creator.id, routeId); // Fallback route
//       const difficultyLevel = this.generateMockDifficultyLevel(
//         `difficulty-${i}`
//       );

//       // --- FIX: Gebruik vaste positieve waarden voor 'days' ---
//       const safeStartDateDays = 5 + i; // Start verder in de toekomst, altijd > 0
//       const safeDeadlineDays = 3 + i; // Deadline voor de start, altijd > 0
//       // const safeEndDateRefDays = safeStartDateDays + 1; // Zorg dat refDate na start is

//       const startDate = toDateTimeInfo(
//         faker.date.soon({ days: safeStartDateDays })
//       );
//       const registrationDeadline = toDateTimeInfo(
//         faker.date.soon({ days: safeDeadlineDays })
//       );
//       // Gebruik een vaste refDate of een datum gebaseerd op de *gecalculeerde* startDate
//       const endDateRefDate = startDate.timestamp ?? Date.now(); // Gebruik de timestamp van de startdatum met fallback
//       const endDate = toDateTimeInfo(
//         faker.date.future({ years: 1, refDate: new Date(endDateRefDate) })
//       );
//       // ----------------------------------------------------
//       const modeOfCompletions = [this.generateMockModeOfCompletion()]; // Genereer 1 mode

//       // *** AANGEPAST: Ontbrekende properties toegevoegd ***
//       challenges.push({
//         id: challengeId,
//         title: `Challenge ${i}: ${faker.company.catchPhrase()}`,
//         summary: faker.lorem.sentence(10),
//         isGroupChallenge: faker.datatype.boolean(0.3),
//         coverImageUrl: {
//           id: `cover-image-${challengeId}`,
//           type: MediaType.IMAGE,
//           variants: [
//             {
//               url: faker.image.urlLoremFlickr({
//                 category: 'nature',
//                 width: 400,
//                 height: 300,
//               }),
//               width: 400,
//               height: 300,
//               format: 'jpeg',
//               purpose: 'original_quality',
//               descriptor: '400w'
//             }
//           ],
//           title: `Cover image for ${challengeId}`,
//           altText: `Challenge cover image`,
//           sourceType: ImageSourceType.SYSTEM_DEFAULT,
//           originalMasterDimensions: { width: 400, height: 300 },
//           createdAt: toDateTimeInfo(new Date()),
//         },
//         difficultyLevel: difficultyLevel,
//         popularity: faker.number.int({ min: 50, max: 10000 }),
//         rating: parseFloat(
//           faker.number
//             .float({ min: 2.5, max: 5.0, fractionDigits: 1 })
//             .toFixed(1)
//         ),
//         startDate: startDate,
//         endDate: endDate,
//         registrationDeadline: registrationDeadline,
//         maxParticipants: faker.helpers.arrayElement([0, 25, 50, 100]),
//         starterNodeId: route?.nodeSequence?.[0] ?? `node-start-fallback-${i}`, // Fallback node ID
//         description: `Detailed description for ${challengeId}.\n${faker.lorem.paragraphs(
//           2
//         )}`,
//         mainImageUrl: {
//           id: `main-image-${challengeId}`,
//           type: MediaType.IMAGE,
//           variants: [
//             {
//               url: faker.image.urlLoremFlickr({
//                 category: 'landscape',
//                 width: 1200,
//                 height: 400,
//               }),
//               width: 1200,
//               height: 400,
//               format: 'jpeg',
//               purpose: 'original_quality',
//               descriptor: '1200w'
//             }
//           ],
//           title: `Main image for ${challengeId}`,
//           altText: `Main challenge image`,
//           sourceType: ImageSourceType.SYSTEM_DEFAULT,
//           originalMasterDimensions: { width: 1200, height: 400 },
//           createdAt: toDateTimeInfo(new Date()),
//         },
//         difficultyLevelId: difficultyLevel.id,
//         ageRestrictions: {
//           minAge: faker.helpers.arrayElement([0, 13, 18]),
//           maxAge: 99,
//         },
//         participantsCount: this.amountOfParticipantsPerChallenge, // Gebruik constante
//         safetyGuidelines: `Safety guidelines for ${challengeId}. ${faker.lorem.sentence(
//           12
//         )}`,
//         termsAndConditions: `Terms and conditions for ${challengeId}.\n${faker.lorem.paragraph()}`,
//         isFeatured: i <= 2,
//         popular: i <= 3,
//         routeId: route?.routeId,
//         route: route, // Voeg de volledige route toe indien nodig
//         status: statuses[i % statuses.length],
//         privacy:
//           Object.values(PrivacyLevel)[i % Object.values(PrivacyLevel).length],
//         creator: creator, // Gebruik vaste creator
//         nodeIds: route?.nodeSequence, // Node IDs van de gekoppelde route
//         faqs: this.generateMockFAQs(challengeId),
//         trackers: [], // Lege array voor nu
//         modeOfCompletions: modeOfCompletions,
//         participants: this.generateMockParticipants(
//           faker.helpers.arrayElements(
//             profiles,
//             Math.min(profiles.length, this.amountOfParticipantsPerChallenge)
//           )
//         ),
//         mediaGallery: this.generateMockMediaGallery(challengeId),
//         userMediaGallery: [], // Lege array voor nu
//         rules: this.generateMockRules(),
//         environments: [this.generateMockEnvironment()], // Genereer 1 environment
//         weatherConditions: [], // Lege array voor nu
//         hazards: [], // Lege array voor nu
//         // --- Toegevoegde/Gecorrigeerde velden ---
//         rewards: [], // Placeholder for Reward[] type
//         feedId: this.GLOBAL_SOCIAL_FEED_ID, // Gebruik globale ID
//         estimatedDuration: faker.number.int({ min: 1800, max: 7200 }), // Duur in seconden (bv. 30min - 2u)
//         type: faker.helpers.arrayElement([
//           'Physical',
//           'Mental',
//           'Exploration',
//           'Social',
//           'Creative',
//         ]), // Voorbeeld types
//         rewardXP: faker.number.int({ min: 50, max: 1000 }),
//         hasItemReward: faker.datatype.boolean(0.4),
//         equipment: this.generateMockEquipment(challengeId), // Genereer equipment
//         objectives: this.generateMockChallengeObjectives(
//           challengeId,
//           this.amountOfObjectivesPerChallenge
//         ), // Corrected method name and added count
//         createdAt: toDateTimeInfo(faker.date.recent({ days: 90 })),
//         lastModified: toDateTimeInfo(faker.date.recent({ days: 90 })),
//         // -------------------------------------------
//       });
//     }
//     return challenges;
//   } // Einde generateMockChallenges

//   // --- Mock Data Generation Methods ---
//   private generateMockUserLifeskills(userId: string): Lifeskill[] {
//     const skills: Lifeskill[] = [];
//     const allSkillTypes: LifeskillType[] = [
//       LifeskillType.Cooking,
//       LifeskillType.Alchemy,
//       LifeskillType.Fishing,
//       LifeskillType.Gathering,
//       LifeskillType.Processing,
//       LifeskillType.Training,
//       LifeskillType.Trading,
//       LifeskillType.Farming,
//       LifeskillType.Sailing,
//       LifeskillType.Hunting,
//     ];

//     const userSkillTypes = faker.helpers.arrayElements(
//       allSkillTypes,
//       faker.number.int({ min: 4, max: 6 })
//     );

//     // <<< LOG HIER >>>
//     console.log(
//       `[InMemoryDb - generateMockUserLifeskills] For user ${userId}, selected skill types:`,
//       userSkillTypes
//     );
//     if (userSkillTypes.length === 0) {
//       console.warn(
//         `[InMemoryDb - generateMockUserLifeskills] No skill types selected for user ${userId}, returning empty array.`
//       );
//       return [];
//     }

//     userSkillTypes.forEach((skillType) => {
//       const level = faker.number.int({ min: 1, max: 99 });
//       const expForNext =
//         level * 150 + faker.number.int({ min: 100, max: 1000 });
//       const currentExp = faker.number.int({ min: 0, max: expForNext - 1 });

//       const icon = this.getMockLifeskillIcon(skillType); // Haal icoon op
//       if (!icon) {
//         // <<< LOG HIER >>>
//         console.warn(
//           `[InMemoryDb - generateMockUserLifeskills] No icon found for skillType: ${skillType}`
//         );
//       }

//       const skillToAdd: Lifeskill = {
//         id: skillType,
//         nameKeyOrText: `skills.lifeskill.${skillType.toLowerCase()}`,
//         icon: icon, // Gebruik opgehaalde icoon
//         currentLevel: level,
//         currentLevelName: this.getMockLifeskillLevelName(level),
//         currentExperience: currentExp,
//         experienceForNextLevel: expForNext,
//       };
//       skills.push(skillToAdd);
//       // <<< LOG HIER >>>
//       console.log(
//         `[InMemoryDb - generateMockUserLifeskills] Added skill for user ${userId}:`,
//         JSON.stringify(skillToAdd)
//       );
//     });
//     // <<< LOG HIER >>>
//     console.log(
//       `[InMemoryDb - generateMockUserLifeskills] Returning ${skills.length} skills for user ${userId}.`
//     );
//     return skills;
//   }

//   private getMockLifeskillIcon(type: LifeskillType): AppIcon {
//     // Simpele mapping, breid uit naar wens
//     switch (type) {
//       case LifeskillType.Cooking:
//         return AppIcon.Sparkles; // Placeholder - ChefHat does not exist
//       case LifeskillType.Alchemy:
//         return AppIcon.FlaskConical;
//       case LifeskillType.Fishing:
//         return AppIcon.Sparkles; // Placeholder - Fish does not exist
//       case LifeskillType.Gathering:
//         return AppIcon.Sparkles; // Placeholder - Leaf does not exist
//       default:
//         return AppIcon.Sparkles;
//     }
//   }
//   private getMockLifeskillLevelName(level: number): string {
//     if (level < 10) return 'Beginner';
//     if (level < 30) return 'Skilled';
//     if (level < 50) return 'Artisan';
//     if (level < 70) return 'Master';
//     if (level < 90) return 'Guru';
//     return 'Grandmaster';
//   }

//   /** Generates mock quest data */
//   private generateMockQuests(count: number, profiles: Profile[]): Quest[] {
//     const quests: Quest[] = [];
//     const statuses = Object.values(QuestStatus);
//     // Zorg dat AppIcon beschikbaar is of vervang door strings
//     const icons = [
//       AppIcon.HelpCircle,
//       AppIcon.MapPin,
//       AppIcon.Target,
//       AppIcon.Sun,
//       AppIcon.LocateFixed,
//       AppIcon.Trophy,
//       AppIcon.Package,
//     ];

//     for (let i = 1; i <= count; i++) {
//       const status = faker.helpers.arrayElement(statuses);
//       const numObjectives = faker.number.int({ min: 1, max: 3 });
//       const objectives: QuestObjective[] = [];
//       for (let j = 1; j <= numObjectives; j++) {
//         const target = faker.number.int({ min: 1, max: 5 });
//         objectives.push({
//           id: `obj-${i}-${j}`,
//           titleKeyOrText: `quests.mock.${i}.objective.${j}.title`,
//           descriptionKeyOrText: `Complete objective ${j} for Quest ${i}`,
//           targetProgress: target,
//           currentProgress:
//             status === QuestStatus.Active
//               ? faker.number.int({ min: 0, max: target - 1 })
//               : status === QuestStatus.Completed ||
//                 status === QuestStatus.Claimed
//               ? target
//               : 0,
//           isOptional: j > 1 ? faker.datatype.boolean(0.2) : false,
//           relatedEntityId:
//             faker.helpers.maybe(
//               () =>
//                 `node-${faker.number.int({ min: 1, max: this.nodeIdCounter })}`,
//               { probability: 0.5 }
//             ) ?? undefined,
//         });
//       }

//       quests.push({
//         id: `quest-${i}`,
//         titleKeyOrText: `quests.mock.${i}.title`,
//         descriptionKeyOrText: `quests.mock.${i}.description`,
//         status: status,
//         reward: {
//           xp: faker.number.int({ min: 10, max: 500 }),
//           itemIds: faker.helpers.maybe(
//             () => [`item-${faker.number.int({ min: 1, max: 10 })}`],
//             { probability: 0.2 }
//           ),
//         },
//         icon: faker.helpers.arrayElement(icons),
//         objectives: objectives,
//         giverInfo: faker.helpers.arrayElement([
//           'System',
//           'Mysterious Note',
//           profiles[faker.number.int({ min: 0, max: profiles.length - 1 })]
//             .displayName,
//         ]),
//         requiredLevel: faker.helpers.maybe(
//           () => faker.number.int({ min: 5, max: 20 }),
//           { probability: 0.4 }
//         ),
//       });
//     }
//     return quests;
//   }

//   private generateMockChallengeObjectives(
//     challengeId: string,
//     count: number
//   ): ChallengeObjective[] {
//     const objectives: ChallengeObjective[] = [];
//     const objectiveTypes = Object.values(ObjectiveType);
//     for (let i = 0; i < count; i++) {
//       const objective: ChallengeObjective = {
//         id: `objective-${challengeId}-${i}`,
//         descriptionKeyOrText:
//           faker.lorem.sentence(5) + '. ' + faker.lorem.sentence(4), // Combined sentences
//         order: i,
//         type: faker.helpers.arrayElement(objectiveTypes),
//         isOptional: faker.datatype.boolean(0.2), // 20% chance of being optional
//         targetProgress: faker.helpers.maybe(
//           () => faker.number.int({ min: 1, max: 100 }),
//           { probability: 0.7 }
//         ), // Optional target progress
//         // requiredNodeId could be added if type is LocationVisit, etc.
//       };
//       objectives.push(objective);
//     }
//     return objectives;
//   }

//   private generateMockRoute(userId: string, routeId: string): Route {
//     // *** AANGEPAST: Geef GLOBAL_SOCIAL_FEED_ID mee aan node generatie ***
//     const nodes = this.generateMockRouteNodes(
//       routeId,
//       this.GLOBAL_SOCIAL_FEED_ID
//     );
//     if (!nodes || nodes.length === 0) {
//       console.warn(
//         `[InMemoryDb] No nodes generated for route ${routeId}, cannot create tracking points.`
//       );
//       return {
//         routeId: routeId,
//         userId: userId,
//         startTime: toDateTimeInfo(new Date()),
//         trackingPoints: [], // Lege route
//       };
//     }
//     const trackingPoints = this.generateMockTrackingPoints(nodes);
//     const startTime =
//       trackingPoints[0]?.createdAt ?? toDateTimeInfo(new Date());
//     const endTime = trackingPoints[trackingPoints.length - 1]?.createdAt;
//     const duration = endTime && endTime.timestamp && startTime.timestamp
//       ? (endTime.timestamp - startTime.timestamp) / 1000
//       : 0;
//     return {
//       routeId: routeId,
//       userId: userId,
//       challengeId: undefined,
//       startTime: startTime,
//       endTime: endTime,
//       totalDistance: faker.number.int({ min: 1000, max: 20000 }),
//       duration: Math.round(duration),
//       elevationGain: faker.number.int({ min: 0, max: 500 }),
//       nodeSequence: nodes.map((n) => n.id),
//       trackingPoints: trackingPoints,
//       nodes: nodes,
//     };
//   }

//   private generateMockDifficultyLevel(idSuffix: string): DifficultyLevel {
//     const levels: DifficultyLevel['level'][] = [
//       'novice',
//       'beginner',
//       'intermediate',
//       'advanced',
//       'expert',
//       'master',
//     ];
//     const level = faker.helpers.arrayElement(levels);
//     return {
//       id: `difficulty-${level}-${idSuffix}`,
//       level: level,
//       description: `Difficulty level: ${level}.`,
//     };
//   }

//     private generateMockFAQs(parentId: string): FAQ[] {
//     return Array.from({ length: this.amountOfFAQsPerChallenge }, () => {
//       this.faqIdCounter++;
//       return {
//         id: `faq-${this.faqIdCounter}-${parentId}`,
//         question: faker.lorem.sentence({ min: 5, max: 10 }).replace(/\.$/, '?'),
//         answer: faker.lorem.paragraph(2),
//       };
//     });
//   }
//   private generateMockParticipants(
//     participantsProfiles: Profile[]
//   ): Participant[] {
//     return participantsProfiles.map((profile) => ({
//       userId: profile.id,
//       userName: profile.displayName,
//       profileImageUrl: profile.avatar?.variants?.[0]?.url ?? '',
//       progressPercentage: faker.number.int({ min: 0, max: 100 }),
//       experiencePoints: faker.number.int({ min: 0, max: 1000 }),
//       level: profile.level ?? faker.number.int({ min: 1, max: 10 }),
//     }));
//   }

//   private generateMockModeOfCompletion(): ModeOfCompletion {
//     const categories = [
//       'Terrestrial',
//       'Aquatic',
//       'Aerial',
//       'Exploration',
//       'Creative',
//       'Social',
//     ];
//     const category = faker.helpers.arrayElement(categories);
//     const activities = faker.helpers.arrayElements(
//       [
//         'Running',
//         'Hiking',
//         'Cycling',
//         'Swimming',
//         'Kayaking',
//         'Flying',
//         'Puzzle Solving',
//         'Photography',
//         'Team Building',
//       ],
//       faker.number.int({ min: 1, max: 3 })
//     );

//     // Kies een RANDOM Lucide icoon naam uit de relevante lijst
//     const randomIconName = faker.helpers.arrayElement(this.possibleModeIcons);

//     return {
//       id: `mode-${category.toLowerCase().replace(' ', '-')}-${faker.string
//         .uuid()
//         .substring(0, 4)}`, // Unieker maken
//       category,
//       activities,
//       // Gebruik iconName met de willekeurige Lucide naam
//       iconName: randomIconName,
//     };
//   }

//   private generateMockRules(): Rule[] {
//     return Array.from({ length: this.amountOfRules }, () => {
//       this.ruleIdCounter++;
//       return {
//         id: `rule-${this.ruleIdCounter}`,
//         name: `Rule ${this.ruleIdCounter}: ${faker.lorem.words(3)}`,
//         description: faker.lorem.sentence(),
//       };
//     });
//   }

//   private generateMockEnvironment(): Environment {
//     const categories = [
//       'Urban',
//       'Rural',
//       'Wilderness',
//       'Coastal',
//       'Mountain',
//       'Indoor',
//       'Industrial',
//     ];
//     const category = faker.helpers.arrayElement(categories);
//     const subcategories =
//       category === 'Urban'
//         ? faker.helpers.arrayElements(['Downtown', 'Suburbs', 'Park'], 1)
//         : undefined;

//     // Kies een RANDOM Lucide icoon naam uit de relevante lijst
//     const randomIconName = faker.helpers.arrayElement(this.possibleEnvIcons);

//     return {
//       id: `env-${category.toLowerCase()}-${faker.string
//         .uuid()
//         .substring(0, 4)}`, // Unieker maken
//       category: category,
//       subcategories: subcategories, // Voeg subcategorieën toe indien relevant
//       // Gebruik iconName met de willekeurige Lucide naam
//       iconName: randomIconName,
//     };
//   }

//   private generateMockEquipment(parentId: string): Equipment[] {
//     const equipmentList: Equipment[] = [];
//     // *** FIX: Remove 'Navigation' as it's not in the Equipment['type'] union ***
//     const types: Equipment['type'][] = [
//       'Tools',
//       'Vehicles',
//       'Clothing',
//       'Electronics',
//       'Safety Gear',
//     ];
//     const numGroups = faker.number.int({
//       min: 1,
//       max: this.amountOfEquipmentGroups,
//     });
//     for (let i = 0; i < numGroups; i++) {
//       const type = faker.helpers.arrayElement(types);
//       this.equipmentIdCounter++;
//       const equipmentId = `equipgroup-${this.equipmentIdCounter}-${parentId}`;
//       const itemsPerGroup = faker.number.int({
//         min: 1,
//         max: this.amountOfEquipmentItemsPerGroup + 1,
//       });
//       equipmentList.push({
//         id: equipmentId,
//         type: type,
//         list: this.generateMockEquipmentItems(
//           equipmentId,
//           parentId,
//           itemsPerGroup
//         ),
//       });
//     }
//     return equipmentList;
//   }
//   private generateMockEquipmentItems(
//     equipmentId: string,
//     parentId: string,
//     count: number
//   ): EquipmentItem[] {
//     const icons = ['🔧', '🚗', '👕', '📱', '👷', '🎒', '🔦'];
//     return Array.from({ length: count }, () => {
//       this.equipmentItemIdCounter++;
//       const itemId = `equipitem-${this.equipmentItemIdCounter}-${parentId}`;
//       return {
//         id: itemId,
//         equipmentId: equipmentId,
//         name: faker.commerce.productName(),
//         description: faker.lorem.sentence(5),
//         icon: faker.helpers.arrayElement(icons),
//       };
//     });
//   }

//   // in libs/mocks/src/lib/in-memory-data.service.ts

//   /**
//    * @private
//    * @method generateMockMediaGallery
//    * @description Generates a list of mock Media objects for a given parent entity.
//    *              Can generate specific types or a mix of images and videos.
//    * @param {string} parentId - The ID of the parent entity (product, review, etc.).
//    * @param {number} [maxItems] - Optional maximum number of media items to generate.
//    * @param {MediaType[]} [specificTypes] - Optional array of specific media types to generate. If provided,
//    *                                        it will generate exactly this list of types.
//    * @returns {Media[]} An array of mock Media objects.
//    */
//   private generateMockMediaGallery(parentId: string, maxItems?: number, specificTypes?: MediaType[]): Media[] {
//     const mediaGallery: Media[] = [];
//     const defaultTypes = [MediaType.IMAGE, MediaType.VIDEO];

//     // Bepaal het aantal en de types
//     const count = specificTypes?.length ?? faker.number.int({
//       min: 1,
//       max: maxItems ?? this.amountOfMediaPerGallery,
//     });

//     for (let i = 0; i < count; i++) {
//       const mediaType = specificTypes ? specificTypes[i] : faker.helpers.arrayElement(defaultTypes);
//       this.mediaIdCounter++;
//       const id = `media-${this.mediaIdCounter}-${parentId}`;
//       const title = `Media ${this.mediaIdCounter} for ${parentId.slice(0,10)} (${mediaType})`;
//       const description = faker.lorem.sentence(faker.number.int({ min: 4, max: 10 }));
//       const createdAt = this.mockDateTime();
//       const uploaderUserId = InMemoryDataService.db.profiles[i % InMemoryDataService.db.profiles.length]?.id || 'user-1';

//       if (mediaType === MediaType.IMAGE) {
//         const masterWidth = faker.number.int({ min: 600, max: 1200 });
//         const masterHeight = faker.number.int({ min: 400, max: 900 });
//         const imgCategory = faker.helpers.arrayElement(['animals', 'abstract', 'nature', 'fashion']);

//         const variants: ImageVariant[] = [
//           { url: faker.image.urlLoremFlickr({ category: imgCategory, width: 200, height: Math.round(200 * (masterHeight/masterWidth)) }), width: 200, height: Math.round(200 * (masterHeight/masterWidth)), format: 'webp', purpose: 'thumbnail', descriptor: '200w' },
//           { url: faker.image.urlLoremFlickr({ category: imgCategory, width: 600, height: Math.round(600 * (masterHeight/masterWidth)) }), width: 600, height: Math.round(600 * (masterHeight/masterWidth)), format: 'webp', purpose: 'medium_display', descriptor: '600w' },
//           { url: faker.image.urlLoremFlickr({ category: imgCategory, width: masterWidth, height: masterHeight }), width: masterWidth, height: masterHeight, format: 'webp', purpose: 'original_quality', descriptor: `${masterWidth}w` }
//         ];
//         mediaGallery.push({
//           id: id,
//           type: MediaType.IMAGE,
//           variants: variants,
//           altText: description,
//           title: title,
//           sourceType: faker.helpers.arrayElement(Object.values(ImageSourceType)),
//           originalMasterDimensions: { width: masterWidth, height: masterHeight },
//           createdAt: createdAt,
//           uploaderUserId: uploaderUserId,
//         });
//       } else if (mediaType === MediaType.VIDEO) {
//         mediaGallery.push({
//           id: id,
//           type: MediaType.VIDEO,
//           url: faker.helpers.arrayElement([
//               'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
//               'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
//           ]),
//           title: title,
//           description: description,
//           thumbnailUrl: faker.image.urlLoremFlickr({ category: 'abstract', width: 320, height: 180 }),
//           durationSeconds: faker.number.int({ min: 15, max: 180 }),
//           createdAt: createdAt,
//           uploaderUserId: uploaderUserId,
//           mimeType: 'video/mp4'
//         });
//       }
//     }
//     return mediaGallery;
//   }

//   /**
//    * @private
//    * @method generateMockRouteNodes
//    * @description Generates a set of NodeFull objects representing waypoints for a specific route context.
//    *              The first node is always NodeType.START, the last is NodeType.END.
//    *              Intermediate nodes are of various types. Locations are generated globally for START nodes
//    *              and relative to the previous node for subsequent nodes.
//    * @param {string} routeContextId - An identifier (like the route ID) to associate with these nodes.
//    * @param {string} globalFeedId - The global social feed ID to assign to START/POI nodes.
//    * @returns {NodeFull[]} An array of generated full node details.
//    */
//   private generateMockRouteNodes(
//     routeContextId: string,
//     globalFeedId: string
//   ): NodeFull[] {
//     const nodes: NodeFull[] = [];
//     // Define potential types for intermediate nodes
//     const intermediateNodeTypes = [
//       NodeType.CHECKPOINT,
//       NodeType.POI, // Point of Interest
//       NodeType.RESOURCE, // Resource Node
//     ];
//     // Determine the ID for the challenge this route might belong to
//     // *** AANGEPAST: Zorg dat format consistent is met generateMockChallenges ***
//     const potentialChallengeId = `chal-for-${routeContextId}`; // Format moet overeenkomen met generateMockChallenges

//     // Loop to create the desired number of nodes per route
//     for (let i = 0; i < this.amountOfNodesPerRoute; i++) {
//       this.nodeIdCounter++; // Increment global counter for unique node IDs
//       const nodeId = `node-${this.nodeIdCounter}-${routeContextId}`;

//       // Determine Node Type: First is START, last is END, others random from intermediate types
//       const nodeType =
//         i === 0
//           ? NodeType.START
//           : i === this.amountOfNodesPerRoute - 1
//           ? NodeType.END
//           : faker.helpers.arrayElement(intermediateNodeTypes);

//       const isStartNode = nodeType === NodeType.START;
//       const isPoiNode = nodeType === NodeType.POI;
//       // *** AANGEPAST: Gebruik globale feed ID voor START en POI nodes ***
//       const socialFeedId = isStartNode || isPoiNode ? globalFeedId : null;

//       // --- Location Generation ---
//       let lat: number;
//       let lng: number;
//       if (i === 0) {
//         // START NODE: Generate a location anywhere in the world
//         lat = faker.location.latitude(); // Range -90 to 90
//         lng = faker.location.longitude(); // Range -180 to 180
//       } else {
//         // Subsequent Nodes: Generate location relatively close to the previous node
//         const prevNodeCoords = nodes[nodes.length - 1].location.coordinates;
//         // Smaller delta for subsequent nodes to keep route somewhat coherent
//         lat =
//           prevNodeCoords.lat + faker.number.float({ min: -0.05, max: 0.05 });
//         lng =
//           prevNodeCoords.lng + faker.number.float({ min: -0.05, max: 0.05 });
//         // Clamp latitude to valid range (-90 to 90)
//         lat = Math.max(-90, Math.min(90, lat));
//         // Wrap longitude around (-180 to 180)
//         lng = ((lng + 180) % 360) - 180;
//         if (lng === -180) lng = 180; // Avoid -180, prefer 180
//       }
//       // --- End Location Generation ---

//       // Create the NodeFull object with all properties assigned directly
//       nodes.push({
//         // --- Base Properties ---
//         id: nodeId,
//         title: `${faker.location.city()} ${nodeType}`, // Example title
//         type: nodeType,
//         // Start node is unlocked, others locked initially within a route context
//         status: i === 0 ? NodeStatus.UNLOCKED : NodeStatus.LOCKED,
//         location: {
//           coordinates: {
//             lat,
//             lng,
//             altitude: faker.number.int({ min: 0, max: 100 }),
//           },
//           address: faker.location.streetAddress(false), // Generate a mock address
//         },
//         popularity: faker.number.int({ min: 5, max: 500 }), // Popularity score

//         // --- Full Detail Properties ---
//         description: `Details for this interesting ${nodeType} node located near ${faker.location.street()}.`, // Mock description
//         // Assign challengeId ONLY if it's the START node
//         challengeId: isStartNode ? potentialChallengeId : null,
//         // *** AANGEPAST: socialFeedId van globale ID ***
//         socialFeedId: socialFeedId,
//         // Generate media gallery, perhaps only for specific types
//         mediaGallery:
//           isStartNode || nodeType === NodeType.POI
//             ? this.generateMockMediaGallery(nodeId)
//             : [],
//         properties: {}, // Add type-specific properties here if needed later
//       });
//     } // End for loop

//     // Return the array of generated nodes for this route context
//     return nodes;
//   }

//   private generateMockTrackingPoints(nodes: NodeFull[]): TrackingPoint[] {
//     const points: TrackingPoint[] = [];
//     let currentTimestamp =
//       Date.now() - nodes.length * faker.number.int({ min: 30000, max: 90000 });
//     nodes.forEach((node, index) => {
//       currentTimestamp += faker.number.int({ min: 30000, max: 90000 });
//       points.push({
//         id: `tracking-point-${node.id}-${index}-${currentTimestamp}`,
//         lat: node.location.coordinates.lat + faker.number.float({ min: -0.0001, max: 0.0001 }),
//         lng: node.location.coordinates.lng + faker.number.float({ min: -0.0001, max: 0.0001 }),
//         altitude: node.location.coordinates.altitude,
//         accuracy: faker.number.int({ min: 5, max: 25 }),
//         speed: faker.number.float({ min: 0.5, max: 3.0, fractionDigits: 1 }),
//         bearing: faker.number.int({ min: 0, max: 359 }),
//         motionType: faker.helpers.arrayElement([
//           'walking',
//           'running',
//           'cycling',
//         ]),
//         gpsSource: faker.helpers.arrayElement(['phone', 'watch']),
//       });
//     });
//     return points;
//   }

//   private generateMockFeedItems(
//     feedId: string,
//     profiles: Profile[]
//   ): FeedItem[] {
//     const items: FeedItem[] = [];
//     // *** AANGEPAST: Lus gebruikt constante amountOfFeedItemsPerFeed (max 30) ***
//     for (let i = 0; i < this.amountOfFeedItemsPerFeed; i++) {
//       this.feedItemIdCounter++;
//       // ID uniek maken per feed + index
//       const feedItemId = `feeditem-${this.feedItemIdCounter}-${feedId
//         .split('-')
//         .pop()}-${i}`;
//       const author = faker.helpers.arrayElement(profiles);
//       // Replies blijven laag per item, dat is prima
//       const calculatedReplyCount = this.amountOfRepliesPerFeedItem;
//       const reactions = this.generateMockReactions();
//       const userReaction =
//         faker.helpers.maybe(
//           () => faker.helpers.arrayElement(reactions.map((r) => r.type)),
//           { probability: 0.3 }
//         ) ?? null;
//       // Maak timestamps iets meer verspreid voor sorteren
//       const createdAt = toDateTimeInfo(faker.date.recent({ days: 30 + i })); // Spreid over meer dagen

//       items.push({
//         id: feedItemId,
//         feedId: feedId,
//         author: author,
//         text: `Post ${i + 1} for feed ${feedId}: ${faker.lorem.sentences(
//           faker.number.int({ min: 1, max: 4 })
//         )}`,
//         media: faker.helpers.maybe(
//           () => this.generateMockMediaGallery(feedItemId),
//           { probability: 0.6 }
//         ),
//         gifUrl: faker.helpers.maybe(
//           () => faker.image.urlLoremFlickr({ category: 'abstract' }),
//           { probability: 0.1 }
//         ), // Abstract voor GIF
//         createdAt: createdAt,
//         lastModified: undefined,
//         reactions: reactions,
//         userReaction: userReaction,
//         replyCount: calculatedReplyCount,
//         tags: faker.helpers.maybe(() => this.generateMockTags(feedItemId), {
//           probability: 0.3,
//         }),
//         isEdited: false,
//         isPinned: false, // Pin alleen de eerste paar posts eventueel
//         isHidden: false,
//         isSaved: faker.datatype.boolean(0.2),
//         privacy: faker.helpers.arrayElement(Object.values(PrivacyLevel)),
//       });
//     }
//     // Sorteer nog steeds op timestamp descending
//     items.sort((a, b) => (b.createdAt?.timestamp ?? 0) - (a.createdAt?.timestamp ?? 0));
//     return items;
//   }

//   private generateMockReplies(
//     feedId: string,
//     feedItemId: string,
//     profiles: Profile[]
//   ): FeedReply[] {
//     const replies: FeedReply[] = [];
//     for (let i = 0; i < this.amountOfRepliesPerFeedItem; i++) {
//       this.replyIdCounter++;
//       const replyId = `reply-${this.replyIdCounter}`;
//       const author = faker.helpers.arrayElement(profiles);
//       const reactions = this.generateMockReactions();
//       const userReaction =
//         faker.helpers.maybe(
//           () => faker.helpers.arrayElement(reactions.map((r) => r.type)),
//           { probability: 0.3 }
//         ) ?? null;
//       replies.push({
//         id: replyId,
//         parentId: feedItemId,
//         feedId: feedId,
//         author: author,
//         text: `Reply ${
//           this.replyIdCounter
//         } to ${feedItemId}. ${faker.lorem.sentence(
//           faker.number.int({ min: 3, max: 25 })
//         )}`,
//         createdAt: toDateTimeInfo(faker.date.recent({ days: 5 })),
//         lastModified: undefined,
//         reactions: reactions,
//         userReaction: userReaction,
//         isEdited: false,
//         isDeleted: false,
//       });
//     }
//     replies.sort((a, b) => (a.createdAt?.timestamp ?? 0) - (b.createdAt?.timestamp ?? 0));
//     return replies;
//   }
//   private generateMockReactions(): ReactionSummary[] {
//     const reactions: ReactionSummary[] = [];
//     const types = Object.values(ReactionType);
//     const numReactionTypesPresent = faker.number.int({
//       min: 1,
//       max: types.length,
//     });
//     const presentTypes = faker.helpers.arrayElements(
//       types,
//       numReactionTypesPresent
//     );
//     for (const type of presentTypes) {
//       reactions.push({
//         type: type,
//         count: faker.number.int({ min: 1, max: 5 }),
//       });
//     }
//     reactions.sort((a, b) => a.type.localeCompare(b.type));
//     return reactions;
//   }
//   private generateMockTags(itemId: string): Tag[] {
//     const tagPool = [
//       'update',
//       'photo',
//       'question',
//       'milestone',
//       'event',
//       'idea',
//     ];
//     const numTags = faker.number.int({ min: 1, max: this.amountOfTagsPerItem });
//     const tags: Tag[] = [];
//     const usedNames = new Set<string>();
//     for (let i = 0; i < numTags; i++) {
//       this.tagIdCounter++;
//       const tagName = faker.helpers.arrayElement(
//         tagPool.filter((t) => !usedNames.has(t))
//       );
//       if (!tagName) continue;
//       usedNames.add(tagName);
//       const tagId = `tag-${this.tagIdCounter}-${itemId}`;
//       tags.push({
//         id: tagId,
//         name: tagName,
//         description: `Tag relating to ${tagName}`,
//       });
//     }
//     return tags;
//   }
//   private generateMockFilters(): any[] {
//     const difficultyLevels = [
//       'novice',
//       'beginner',
//       'intermediate',
//       'advanced',
//       'expert',
//       'master',
//     ] as const;
//     const statuses = ['Active', 'Upcoming', 'Completed', 'Recording'];
//     const privacyLevels = Object.values(PrivacyLevel);
//     return [
//       {
//         controlType: 'daterange',
//         label: 'Date Range',
//         key: 'dateRange',
//         startDateKey: 'startDateFrom',
//         endDateKey: 'startDateTo',
//       },
//       {
//         controlType: 'checkbox',
//         label: 'Difficulty',
//         key: 'difficultyLevelIds',
//         options: difficultyLevels.map((l) => ({
//           value: l,
//           label: l.charAt(0).toUpperCase() + l.slice(1),
//         })),
//       },
//       {
//         controlType: 'dropdown',
//         label: 'Privacy',
//         key: 'privacy',
//         options: privacyLevels.map((level) => ({ value: level, label: level })),
//       },
//       {
//         controlType: 'checkbox',
//         label: 'Status',
//         key: 'status',
//         options: statuses.map((s) => ({ value: s, label: s })),
//       },
//     ];
//   }

//   // Voeg deze methode toe als die ontbreekt in je oude versie
//   private generateMockStatDefinitions(): StatDefinition[] {
//     return [
//       {
//         id: StatType.Strength,
//         nameKeyOrText: 'charProgression.stats.strength.name',
//         descriptionKeyOrText: 'charProgression.stats.strength.description',
//         icon: AppIcon.Sword,
//         maxValue: 20,
//         uiSegments: 10,
//       },
//       {
//         id: StatType.Dexterity,
//         nameKeyOrText: 'charProgression.stats.dexterity.name',
//         descriptionKeyOrText: 'charProgression.stats.dexterity.description',
//         icon: AppIcon.BowArrow,
//         maxValue: 20,
//         uiSegments: 10,
//       },
//       {
//         id: StatType.Intelligence,
//         nameKeyOrText: 'charProgression.stats.intelligence.name',
//         descriptionKeyOrText: 'charProgression.stats.intelligence.description',
//         icon: AppIcon.Book,
//         maxValue: 20,
//         uiSegments: 10,
//       },
//       {
//         id: StatType.Luck,
//         nameKeyOrText: 'charProgression.stats.luck.name',
//         descriptionKeyOrText: 'charProgression.stats.luck.description',
//         icon: AppIcon.Clover,
//         maxValue: 20,
//         uiSegments: 10,
//       },
//       {
//         id: StatType.Arcane,
//         nameKeyOrText: 'charProgression.stats.arcane.name',
//         descriptionKeyOrText: 'charProgression.stats.arcane.description',
//         icon: AppIcon.Hexagon,
//         maxValue: 20,
//         uiSegments: 10,
//       },
//     ];
//   }

//   // -- skills --
//   // libs/mocks/src/lib/In-memory-database-service.ts
// // ... (andere imports en de rest van de class blijven hetzelfde) ...

// // Binnen de InMemoryDataService class:

//   /**
//    * @private
//    * @method generateMockSkillDefinitions
//    * @description Generates a predefined set of static skill definitions for the mock database.
//    *              Each skill definition includes an ID, name, description, icon, maximum level (20),
//    *              an associated skillTreeId (linking it to a core stat category like 'strength_skills'),
//    *              and an optional array of effects per level.
//    *              Aims to generate roughly 30 skills per category.
//    * @returns {SkillDefinition[]} An array of `SkillDefinition` objects.
//    */
//   private generateMockSkillDefinitions(): SkillDefinition[] {
//     const definitions: SkillDefinition[] = [];
//     const targetSkillsPerCategory = 30;

//     const skillCategoriesData = [
//         { idPrefix: 'strength', namePrefix: 'Strength Skill', skillTreeId: 'strength_skills', icon: AppIcon.Sword, existingSkills: [
//             { id: 'strength_power_strike', nameKeyOrText: 'charProgression.skills.strength.powerStrike.name', descriptionKeyOrText: 'charProgression.skills.strength.powerStrike.desc', icon: AppIcon.Sword, effectsPerLevel: [ /* ... effects ... */ ] },
//             { id: 'strength_heavy_armor_proficiency', nameKeyOrText: 'charProgression.skills.strength.heavyArmor.name', descriptionKeyOrText: 'charProgression.skills.strength.heavyArmor.desc', icon: AppIcon.Shield, effectsPerLevel: [ /* ... effects ... */ ] },
//             { id: 'strength_intimidating_shout', nameKeyOrText: 'charProgression.skills.strength.intimidatingShout.name', descriptionKeyOrText: 'charProgression.skills.strength.intimidatingShout.desc', icon: AppIcon.Angry },
//             { id: 'strength_war_banner', nameKeyOrText: 'charProgression.skills.strength.warBanner.name', descriptionKeyOrText: 'charProgression.skills.strength.warBanner.desc', icon: AppIcon.Flag },
//             { id: 'strength_earthquake_stomp', nameKeyOrText: 'charProgression.skills.strength.earthquakeStomp.name', descriptionKeyOrText: 'charProgression.skills.strength.earthquakeStomp.desc', icon: AppIcon.Footprints },
//             { id: 'strength_cleave_attack', nameKeyOrText: 'charProgression.skills.strength.cleave.name', descriptionKeyOrText: 'charProgression.skills.strength.cleave.desc', icon: AppIcon.Sword },
//             { id: 'strength_weapon_mastery', nameKeyOrText: 'charProgression.skills.strength.weaponMastery.name', descriptionKeyOrText: 'charProgression.skills.strength.weaponMastery.desc', icon: AppIcon.Swords },
//         ]},
//         { idPrefix: 'dexterity', namePrefix: 'Dexterity Skill', skillTreeId: 'dexterity_skills', icon: AppIcon.BowArrow, existingSkills: [
//             { id: 'dexterity_quick_shot', nameKeyOrText: 'charProgression.skills.dexterity.quickShot.name', descriptionKeyOrText: 'charProgression.skills.dexterity.quickShot.desc', icon: AppIcon.BowArrow, effectsPerLevel: [ /* ... effects ... */ ] },
//             { id: 'dexterity_evasion', nameKeyOrText: 'charProgression.skills.dexterity.evasion.name', descriptionKeyOrText: 'charProgression.skills.dexterity.evasion.desc', icon: AppIcon.Wind },
//             { id: 'dexterity_dual_wield_mastery', nameKeyOrText: 'charProgression.skills.dexterity.dualWield.name', descriptionKeyOrText: 'charProgression.skills.dexterity.dualWield.desc', icon: AppIcon.Swords },
//             { id: 'dexterity_stealth_approach', nameKeyOrText: 'charProgression.skills.dexterity.stealth.name', descriptionKeyOrText: 'charProgression.skills.dexterity.stealth.desc', icon: AppIcon.Eye },
//             { id: 'dexterity_poisoned_blades', nameKeyOrText: 'charProgression.skills.dexterity.poisonBlades.name', descriptionKeyOrText: 'charProgression.skills.dexterity.poisonBlades.desc', icon: AppIcon.FlaskConical },
//             { id: 'dexterity_acrobatics', nameKeyOrText: 'charProgression.skills.dexterity.acrobatics.name', descriptionKeyOrText: 'charProgression.skills.dexterity.acrobatics.desc', icon: AppIcon.Sparkles },
//             { id: 'dexterity_trap_disarming', nameKeyOrText: 'charProgression.skills.dexterity.trapDisarming.name', descriptionKeyOrText: 'charProgression.skills.dexterity.trapDisarming.desc', icon: AppIcon.Wrench },
//         ]},
//         { idPrefix: 'intelligence', namePrefix: 'Intelligence Skill', skillTreeId: 'intelligence_skills', icon: AppIcon.Book, existingSkills: [
//             { id: 'intelligence_arcane_bolt', nameKeyOrText: 'charProgression.skills.intelligence.arcaneBolt.name', descriptionKeyOrText: 'charProgression.skills.intelligence.arcaneBolt.desc', icon: AppIcon.Sparkle, effectsPerLevel: [ /* ... effects ... */ ] },
//             { id: 'intelligence_healing_light', nameKeyOrText: 'charProgression.skills.intelligence.healingLight.name', descriptionKeyOrText: 'charProgression.skills.intelligence.healingLight.desc', icon: AppIcon.Heart },
//             { id: 'intelligence_elemental_resistance', nameKeyOrText: 'charProgression.skills.intelligence.elementalRes.name', descriptionKeyOrText: 'charProgression.skills.intelligence.elementalRes.desc', icon: AppIcon.ShieldCheck },
//             { id: 'intelligence_summon_familiar', nameKeyOrText: 'charProgression.skills.intelligence.summonFamiliar.name', descriptionKeyOrText: 'charProgression.skills.intelligence.summonFamiliar.desc', icon: AppIcon.Ghost },
//             { id: 'intelligence_mana_shield', nameKeyOrText: 'charProgression.skills.intelligence.manaShield.name', descriptionKeyOrText: 'charProgression.skills.intelligence.manaShield.desc', icon: AppIcon.Sparkles },
//             { id: 'intelligence_lore_mastery', nameKeyOrText: 'charProgression.skills.intelligence.loreMastery.name', descriptionKeyOrText: 'charProgression.skills.intelligence.loreMastery.desc', icon: AppIcon.BookOpen },
//             { id: 'intelligence_spell_crafting', nameKeyOrText: 'charProgression.skills.intelligence.spellCrafting.name', descriptionKeyOrText: 'charProgression.skills.intelligence.spellCrafting.desc', icon: AppIcon.FlaskConical },
//         ]},
//         { idPrefix: 'luck', namePrefix: 'Luck Skill', skillTreeId: 'luck_skills', icon: AppIcon.Clover, existingSkills: [
//             { id: 'luck_treasure_hunter', nameKeyOrText: 'charProgression.skills.luck.treasureHunter.name', descriptionKeyOrText: 'charProgression.skills.luck.treasureHunter.desc', icon: AppIcon.Package, effectsPerLevel: [ /* ... effects ... */ ] },
//             { id: 'luck_critical_mastery', nameKeyOrText: 'charProgression.skills.luck.critMastery.name', descriptionKeyOrText: 'charProgression.skills.luck.critMastery.desc', icon: AppIcon.Target },
//             { id: 'luck_fortunate_discoveries', nameKeyOrText: 'charProgression.skills.luck.fortunateDisc.name', descriptionKeyOrText: 'charProgression.skills.luck.fortunateDisc.desc', icon: AppIcon.Clover },
//             { id: 'luck_lucky_escape', nameKeyOrText: 'charProgression.skills.luck.luckyEscape.name', descriptionKeyOrText: 'charProgression.skills.luck.luckyEscape.desc', icon: AppIcon.Sparkles },
//             { id: 'luck_better_bargains', nameKeyOrText: 'charProgression.skills.luck.betterBargains.name', descriptionKeyOrText: 'charProgression.skills.luck.betterBargains.desc', icon: AppIcon.Coins },
//             { id: 'luck_rare_finds', nameKeyOrText: 'charProgression.skills.luck.rareFinds.name', descriptionKeyOrText: 'charProgression.skills.luck.rareFinds.desc', icon: AppIcon.Gift },
//             { id: 'luck_chance_encounter', nameKeyOrText: 'charProgression.skills.luck.chanceEncounter.name', descriptionKeyOrText: 'charProgression.skills.luck.chanceEncounter.desc', icon: AppIcon.Users },
//         ]},
//         { idPrefix: 'arcane', namePrefix: 'Arcane Skill', skillTreeId: 'arcane_skills', icon: AppIcon.Space, existingSkills: [
//             { id: 'arcane_arcane_bolt', nameKeyOrText: 'charProgression.skills.arcane.arcaneBolt.name', descriptionKeyOrText: 'charProgression.skills.arcane.arcaneBolt.desc', icon: AppIcon.Sparkle, effectsPerLevel: [ /* ... effects ... */ ] },
//         ]}
//     ];

//     skillCategoriesData.forEach(category => {
//         // Voeg eerst de bestaande, gedetailleerde skills toe
//         category.existingSkills.forEach(skill => {
//             definitions.push({
//                 ...skill, // Behoud alle properties van de bestaande skill
//                 maxLevel: 20, // Zorg dat maxLevel 20 is
//                 skillTreeId: category.skillTreeId, // Zorg dat skillTreeId correct is
//                 icon: skill.icon || category.icon // Fallback naar categorie-icoon
//             });
//         });

//         // Vul aan met placeholders tot targetSkillsPerCategory
//         const currentCountForCategory = definitions.filter(d => d.skillTreeId === category.skillTreeId).length;
//         const placeholdersToGenerate = targetSkillsPerCategory - currentCountForCategory;

//         if (placeholdersToGenerate > 0) {
//             for (let i = 1; i <= placeholdersToGenerate; i++) {
//                 const skillNumber = currentCountForCategory + i;
//                 definitions.push({
//                     id: `${category.idPrefix}_placeholder_${skillNumber}`,
//                     nameKeyOrText: `${category.namePrefix} Placeholder ${skillNumber}`,
//                     descriptionKeyOrText: `A placeholder description for ${category.namePrefix} skill #${skillNumber}. Increases ${category.idPrefix} effectiveness.`,
//                     icon: category.icon,
//                     maxLevel: 20,
//                     skillTreeId: category.skillTreeId,
//                     effectsPerLevel: [
//                         { level: 1, descriptionKeyOrText: `Basic effect for placeholder skill.`, bonuses: { generic_bonus: 0.01 * i } }
//                     ]
//                 });
//             }
//         }
//     });

//     console.log(`[InMemoryDataService] Generated ${definitions.length} Skill Definitions in total. Strenght: ${definitions.filter(d=>d.skillTreeId === 'strength_skills').length}`);
//     return definitions;
//   }

//   /**
//    * Genereert mock UserSkill[] data voor een specifieke gebruiker,
//    * gebaseerd op de beschikbare SkillDefinition[].
//    * Skills kunnen nu tot level 20 gaan.
//    * @param userId De ID van de gebruiker.
//    * @param allSkillDefinitions Een array van alle beschikbare SkillDefinition objecten.
//    * @returns Een array van UserSkill objecten voor de gegeven gebruiker.
//    */
//   private generateMockUserSkills(userId: string, allSkillDefinitions: SkillDefinition[]): UserSkill[] {
//     const userSkills: UserSkill[] = [];

//     if (!allSkillDefinitions || allSkillDefinitions.length === 0) {
//       console.warn(`[InMemoryDb - generateMockUserSkills] No skill definitions provided for user ${userId}. Returning empty skills.`);
//       return [];
//     }

//     // Laat de gebruiker een willekeurig aantal skills "leren"
//     // Nu bijvoorbeeld tussen 3 en (maximaal) 8 skills per gebruiker voor de mock
//     const numberOfSkillsToLearn = faker.number.int({ min: 3, max: Math.min(8, allSkillDefinitions.length) });
//     const learnedSkillDefinitions = faker.helpers.arrayElements(allSkillDefinitions, numberOfSkillsToLearn);

//     console.log(`[InMemoryDb - generateMockUserSkills] User ${userId} will learn ${learnedSkillDefinitions.length} skills.`);

//     for (const definition of learnedSkillDefinitions) {
//       // currentLevel kan nu van 0 tot het nieuwe maxLevel (20) gaan.
//       const currentLevel = faker.number.int({ min: 0, max: definition.maxLevel });

//       let currentExperience = 0;
//       let experienceForNextLevel = 100; // Basis XP nodig voor level 1 (of als level 0 is)

//       if (currentLevel > 0 && currentLevel < definition.maxLevel) {
//         // Voorbeeld: XP curve wordt steiler voor hogere levels
//         experienceForNextLevel = 100 + (currentLevel * 50) + (currentLevel * currentLevel * 10);
//         currentExperience = faker.number.int({ min: 0, max: experienceForNextLevel - 1 });
//       } else if (currentLevel === definition.maxLevel) {
//         currentExperience = 0; // Of de XP die nodig was voor dit level
//         experienceForNextLevel = 0; // Geen volgend level
//       }
//       // Als currentLevel 0 is, blijft currentExperience 0 en experienceForNextLevel de XP voor level 1.

//       userSkills.push({
//         id: definition.id,
//         userId: userId,
//         currentLevel: currentLevel,
//         currentExperience: currentExperience,
//         experienceForNextLevel: experienceForNextLevel,
//         isMastered: currentLevel === definition.maxLevel,
//       });
//     }

//     console.log(`[InMemoryDb - generateMockUserSkills] Generated ${userSkills.length} skills for user ${userId}:`, userSkills.map(s => ({id: s.id, lvl: s.currentLevel, maxLvl: allSkillDefinitions.find(d => d.id === s.id)?.maxLevel ?? 'N/A' })));
//     return userSkills;
//   }



//   // --- Reaction Update Logic Implementation ---

//   /** Handles POST requests to update reactions for a specific Feed Item. */
//   private handleFeedItemReactionUpdate(
//     reqInfo: RequestInfo,
//     feedId: string,
//     itemId: string,
//     newReactionType: ReactionType | null
//   ): Observable<ResponseOptions> {
//     console.log(
//       `[InMemoryDataService] Handling reaction update for ITEM: ${itemId}, New Reaction: ${newReactionType}`
//     );
//     return reqInfo.utils.createResponse$(() => {
//       const feed = InMemoryDataService.db.socialFeeds[feedId];
//       if (!feed)
//         return this.createNotFoundResponseOptions(
//           reqInfo,
//           `Feed '${feedId}' not found`
//         );

//       const itemIndex = feed.feedItems.findIndex((item) => item.id === itemId);
//       if (itemIndex === -1)
//         return this.createNotFoundResponseOptions(
//           reqInfo,
//           `Item '${itemId}' not found in feed '${feedId}'`
//         );

//       const originalItem = feed.feedItems[itemIndex];
//       const updatedReactions = this.calculateUpdatedReactions(
//         originalItem.reactions,
//         newReactionType,
//         originalItem.userReaction
//       );
//       const updatedItem: FeedItem = {
//         ...originalItem,
//         userReaction: newReactionType,
//         reactions: updatedReactions,
//       };

//       // Update DB Immutably
//       const updatedFeedItems = [...feed.feedItems]; // Create shallow copy of items array
//       updatedFeedItems[itemIndex] = updatedItem; // Replace item at index
//       InMemoryDataService.db.socialFeeds[feedId].feedItems = updatedFeedItems; // Assign new array

//       console.log(
//         `[InMemoryDataService] Updated ITEM ${itemId} reactions. New userReaction: ${newReactionType}, Resulting reactions array:`,
//         JSON.stringify(updatedReactions)
//       );
//       return this.createOkResponseOptions(reqInfo, updatedItem); // Return updated item
//     });
//   }

//   /** Handles POST requests to update reactions for a specific Feed Reply. */
//   private handleFeedReplyReactionUpdate(
//     reqInfo: RequestInfo,
//     feedId: string,
//     parentItemId: string,
//     replyId: string,
//     newReactionType: ReactionType | null
//   ): Observable<ResponseOptions> {
//     console.log(
//       `[InMemoryDataService] Handling reaction update for REPLY: ${replyId}, New Reaction: ${newReactionType}`
//     );
//     return reqInfo.utils.createResponse$(() => {
//       const feed = InMemoryDataService.db.socialFeeds[feedId];
//       if (
//         !feed ||
//         !(feed as any).repliesByItem ||
//         !(feed as any).repliesByItem[parentItemId]
//       ) {
//         return this.createNotFoundResponseOptions(
//           reqInfo,
//           `Feed '${feedId}' or replies structure for item '${parentItemId}' not found`
//         );
//       }

//       const repliesForItem = (feed as any).repliesByItem[parentItemId];
//       const replyIndex = repliesForItem.findIndex(
//         (reply: FeedReply) => reply.id === replyId
//       );
//       if (replyIndex === -1) {
//         return this.createNotFoundResponseOptions(
//           reqInfo,
//           `Reply '${replyId}' not found under item '${parentItemId}'`
//         );
//       }

//       const originalReply = repliesForItem[replyIndex];
//       const updatedReactions = this.calculateUpdatedReactions(
//         originalReply.reactions,
//         newReactionType,
//         originalReply.userReaction
//       );
//       const updatedReply: FeedReply = {
//         ...originalReply,
//         userReaction: newReactionType,
//         reactions: updatedReactions,
//       };

//       // Update DB Immutably
//       const updatedRepliesForItem = [...repliesForItem]; // Create shallow copy
//       updatedRepliesForItem[replyIndex] = updatedReply; // Replace reply at index
//       (feed as any).repliesByItem[parentItemId] = updatedRepliesForItem; // Assign new array

//       console.log(
//         `[InMemoryDataService] Updated REPLY ${replyId} reactions. New userReaction: ${newReactionType}, Resulting reactions array:`,
//         JSON.stringify(updatedReactions)
//       );
//       return this.createOkResponseOptions(reqInfo, updatedReply); // Return updated reply
//     });
//   }

//   /**
//    * Calculates the updated array of reaction summaries based on the user's action.
//    * This is a pure function ensuring immutability.
//    */
//   private calculateUpdatedReactions(
//     currentSummaries: Readonly<ReactionSummary[]> | undefined,
//     newReaction: ReactionType | null,
//     oldReaction: ReactionType | null | undefined
//   ): ReactionSummary[] {
//     const summariesMap = new Map<ReactionType, number>();
//     (currentSummaries ?? []).forEach((summary) => {
//       if (summary.count > 0) summariesMap.set(summary.type, summary.count);
//     });

//     // 1. Decrement old reaction if it was different from the new one.
//     if (oldReaction && oldReaction !== newReaction) {
//       const currentOldCount = summariesMap.get(oldReaction);
//       if (currentOldCount !== undefined) {
//         if (currentOldCount > 1)
//           summariesMap.set(oldReaction, currentOldCount - 1);
//         else summariesMap.delete(oldReaction); // Remove if count was 1
//       }
//     }
//     // 2. Increment new reaction if it's not null and different from the old one.
//     if (newReaction && newReaction !== oldReaction) {
//       const currentNewCount = summariesMap.get(newReaction) ?? 0;
//       summariesMap.set(newReaction, currentNewCount + 1);
//     }

//     // Convert Map ALTIJD terug naar gesorteerde array
//     const updatedSummaries = Array.from(summariesMap.entries())
//       .map(([type, count]) => ({ type, count }))
//       .sort((a, b) => a.type.localeCompare(b.type));

//     // console.log('[CalcReactions] Final calculated summaries:', JSON.stringify(updatedSummaries)); // Keep for debug
//     return updatedSummaries;
//   }


//   // --- Helper Methods ---

//   /** Helper to handle errors during request body parsing. */
//   private handleRequestBodyError(
//     reqInfo: RequestInfo,
//     context: string,
//     error: unknown
//   ): Observable<ResponseOptions> {
//     console.error(
//       `[InMemoryDataService] Error processing POST body for ${context}:`,
//       error
//     );
//     return this.createErrorResponse(
//       reqInfo,
//       400,
//       `Invalid request body for ${context}.`
//     );
//   }

//     /**
//    * @private
//    * @method handleRequestBodyErrorOptions
//    * @description Creates ResponseOptions for an error during request body parsing.
//    *              This version returns the options object directly, for use inside createResponse$.
//    * @param {RequestInfo} reqInfo - Information about the HTTP request.
//    * @param {string} context - The context of the operation (e.g., 'create review').
//    * @param {unknown} error - The caught error object.
//    * @returns {ResponseOptions} The options for an error response.
//    */
//   private handleRequestBodyErrorOptions(
//     reqInfo: RequestInfo,
//     context: string,
//     error: unknown
//   ): ResponseOptions {
//     const message = error instanceof Error ? error.message : `Unknown error processing body for ${context}`;
//     console.error(`[InMemoryDataService] Error creating response for ${context}:`, error);
//     return this.createErrorResponseOptions(reqInfo, 400, message);
//   }


//   /** Creates standard JSON headers for responses. */
//   private createJsonHeaders(): HttpHeaders {
//     return new HttpHeaders({ 'Content-Type': 'application/json' });
//   }

//   /** Creates an Observable returning a standard OK (200) response. */
//   private createOkResponse(
//     reqInfo: RequestInfo,
//     body: any
//   ): Observable<ResponseOptions> {
//     return reqInfo.utils.createResponse$(() =>
//       this.createOkResponseOptions(reqInfo, body)
//     );
//   }
//   /** Creates an Observable returning a standard Not Found (404) response. */
//   private createNotFoundResponse(
//     reqInfo: RequestInfo,
//     message: string
//   ): Observable<ResponseOptions> {
//     console.error(
//       `[InMemoryDataService] Not Found (404): ${message} for URL ${reqInfo.url}`
//     );
//     return reqInfo.utils.createResponse$(() =>
//       this.createNotFoundResponseOptions(reqInfo, message)
//     );
//   }
//   /** Creates an Observable returning a standard error response with a specified status. */
//   private createErrorResponse(
//     reqInfo: RequestInfo,
//     status: number,
//     message: string
//   ): Observable<ResponseOptions> {
//     console.error(
//       `[InMemoryDataService] Error (${status}): ${message} for URL ${reqInfo.url}`
//     );
//     return reqInfo.utils.createResponse$(() =>
//       this.createErrorResponseOptions(reqInfo, status, message)
//     );
//   }

//   /** Creates the ResponseOptions for an OK (200) response. */
//   private createOkResponseOptions(
//     reqInfo: RequestInfo,
//     body: any
//   ): ResponseOptions {
//     return {
//       body: body,
//       status: 200,
//       headers: this.createJsonHeaders(),
//       url: reqInfo.url,
//     };
//   }
//   /** Creates the ResponseOptions for a Created (201) response. */
//   private createCreatedResponseOptions(
//     reqInfo: RequestInfo,
//     body: any
//   ): ResponseOptions {
//     return {
//       body: body,
//       status: 201,
//       statusText: 'Created',
//       headers: this.createJsonHeaders(),
//       url: reqInfo.url,
//     };
//   }
//   /** Creates the ResponseOptions for a Not Found (404) response. */
//   private createNotFoundResponseOptions(
//     reqInfo: RequestInfo,
//     message: string
//   ): ResponseOptions {
//     return {
//       body: { error: message },
//       status: 404,
//       statusText: 'Not Found',
//       headers: this.createJsonHeaders(),
//       url: reqInfo.url,
//     };
//   }
//   /** Creates the ResponseOptions for a generic error response. */
//   private createErrorResponseOptions(
//     reqInfo: RequestInfo,
//     status: number,
//     message: string
//   ): ResponseOptions {
//     return {
//       body: { error: message },
//       status: status,
//       statusText: 'Error',
//       headers: this.createJsonHeaders(),
//       url: reqInfo.url,
//     };
//   }

//   /** @inheritdoc Overridden to use predictable sequential IDs instead of default generation. */
//   genId<T extends { id: any }>(collection: T[], collectionName: string): any {
//     // This method should ideally not be called if IDs are assigned during generation.
//     console.warn(
//       `[InMemoryDataService] genId called unexpectedly for ${collectionName}. Using fallback ID.`
//     );
//     // Generate a less predictable fallback ID if necessary
//     return `fallback-${collectionName}-${faker.string.uuid()}`;
//   }
// } // End of InMemoryDataService class
