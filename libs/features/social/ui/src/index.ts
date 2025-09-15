/**
 * @file index.ts (social-ui)
 * @description Public API for the generic Social UI library.
 */

// === COMPONENTS ===
export * from './lib/components/emoji-picker/emoji-picker.component';
export * from './lib/components/gif-picker/gif-picker.component';
export * from './lib/components/reaction-picker/reaction-picker.component';

// === PAGES (als de top-level feature pagina's generiek zijn) ===
export * from './lib/pages/feed/feed.component';
export * from './lib/pages/feed/comment-input/comment-input.component';
export * from './lib/pages/feed/comment-item/comment-item.component';
export * from './lib/pages/feed/comments-list/comments-list.component';
export * from './lib/pages/feed/feed-header/feed-header.component';
export * from './lib/pages/feed/feed-input/feed-input.component';

// Als GuildPage, ProfileComponent, SocialDashboardComponent ook generiek zijn en hier verhuisd:
export * from './lib/pages/guild-page/guild-page.component';
export * from './lib/pages/profile/profile.component';
export * from './lib/pages/profile/profile-detail/profile-detail.component';
export * from './lib/pages/social-dashboard/social-dashboard.component';


// === DIRECTIVES ===
export * from './lib/directives/reaction-picker-trigger.directive'; // Verhuisd van core

// === ROUTING (als deze UI-lib eigen routes definieert) ===
export * from './lib/social.routes'; // Als deze routes relevant zijn voor deze library