/**
 * @file apps/plushie-paradise/src/app/features/home/mock-avatar-data.ts
 * @Version 1.1.0 - Updated asset URIs to point to libs/features/avatar/assets.
 * @Author ChallengerAppDevAI
 * @Description Provides mock data instances for avatar appearance components
 *              for the Plushie Paradise homepage demo.
 */

import {
  AvatarSkin,
  AvatarBackground,
  AvatarAnimation,
  AvatarAssetType,
  BackgroundKind,
  AvatarEquipmentSlot,
  AppContext,
  VisemeMap,
  VoiceProfile,
} from '@royal-code/shared/domain';
import { DateTimeUtil } from '@royal-code/shared/utils';

// --- Mock IDs ---
export const MOCK_CAT_SKIN_ID = 'skin-cat-shorthair-default';
export const MOCK_STUDIO_BACKGROUND_ID = 'bg-studio-neutral-hdr';
export const MOCK_CAT_IDLE_ANIMATION_ID = 'anim-cat-idle';
export const MOCK_CAT_TALKING_ANIMATION_ID = 'anim-cat-talking';
export const MOCK_CAT_VOICE_PROFILE_ID = 'voice-cat-standard';
export const MOCK_CAT_VISEME_MAP_ID = 'viseme-cat-standard';

// --- Mock AvatarSkin for the Shorthair Cat ---
export const mockCatSkin: AvatarSkin = {
  id: MOCK_CAT_SKIN_ID,
  assetType: AvatarAssetType.Skin,
  key: 'cat-shorthair-default',
  nameKeyOrText: 'Shorthair Cat - Classic',
  descriptionKeyOrText: 'A charming and fluffy shorthair cat, ready for adventure!',
  // BELANGRIJK: Pad aangepast naar de verwachte locatie na build (zie angular.json opmerking)
  uri: 'assets/features/avatar/avatar/skins/shibahu.glb',
  thumbnailUrl: 'assets/avatars/skins/cat-shorthair/thumbnail.jpg', // Blijft app-specifiek voor nu, of pas aan
  appContexts: [AppContext.PLUSHIE_PARADISE, AppContext.SHARED],
  skeletonId: 'cat-skeleton-v1',
  attachmentPoints: [
    { name: 'HeadTop', boneName: 'head_top_joint', purpose: 'hat_anchor', preferredSlots: [AvatarEquipmentSlot.HEAD] },
    { name: 'Neck', boneName: 'neck_joint', purpose: 'collar_anchor', preferredSlots: [AvatarEquipmentSlot.ACCESSORY_NECK] },
    { name: 'MouthAnchor', boneName: 'jaw_joint', purpose: 'speech_bubble_origin' }
  ],
  defaultAnimationId: MOCK_CAT_IDLE_ANIMATION_ID,
  visemeMapId: MOCK_CAT_VISEME_MAP_ID,
  voiceProfileId: MOCK_CAT_VOICE_PROFILE_ID,
  speechBubbleAnchorPointName: 'MouthAnchor',
  availableAnimationTags: ['idle', 'walk', 'run', 'jump', 'talk_generic', 'sit', 'meow'],
  createdAt: DateTimeUtil.createDateTimeInfo(new Date('2024-01-01T10:00:00Z')),
  lastModified: DateTimeUtil.createDateTimeInfo(new Date('2024-01-15T12:00:00Z')),
};

// --- Mock AvatarBackground (Studio HDRI) ---
export const mockStudioBackground: AvatarBackground = {
  id: MOCK_STUDIO_BACKGROUND_ID,
  assetType: AvatarAssetType.Background,
  key: 'studio-neutral-hdr',
  nameKeyOrText: 'Neutral Studio Lighting',
  descriptionKeyOrText: 'A clean and neutral studio environment for clear avatar display.',
  // BELANGRIJK: Pad aangepast
  uri: 'assets/features/avatar/backgrounds/studio-neutral/studio-neutral.hdr',
  thumbnailUrl: 'assets/avatars/backgrounds/studio-neutral/thumbnail.jpg', // App-specifiek
  appContexts: [AppContext.SHARED],
  kind: BackgroundKind.SkyboxHdri,
  ambientLightIntensity: 0.7,
  directionalLightConfig: {
    direction: { x: 1, y: 1.5, z: 1 },
    intensity: 1.0,
    color: '#FFF5E1' // Warmer wit
  },
  createdAt: DateTimeUtil.createDateTimeInfo(new Date('2024-01-01T00:00:00Z')),
};

// --- Mock AvatarAnimation (Idle for Cat) ---
export const mockCatIdleAnimation: AvatarAnimation = {
  id: MOCK_CAT_IDLE_ANIMATION_ID,
  assetType: AvatarAssetType.Animation,
  key: 'cat-idle-loop-v1',
  nameKeyOrText: 'Cat Idle Loop',
  uri: 'assets/features/avatar/avatar/skins/shibahu.glb',
  clipName: 'Take 001',
  isLooping: true,
  appContexts: [AppContext.PLUSHIE_PARADISE, AppContext.SHARED],
  tag: 'idle',
  createdAt: DateTimeUtil.createDateTimeInfo(new Date()),
};


// --- Mock AvatarAnimation (Talking for Cat) ---
export const mockCatTalkingAnimation: AvatarAnimation = {
  id: MOCK_CAT_TALKING_ANIMATION_ID,
  assetType: AvatarAssetType.Animation,
  key: 'cat-talk-loop-v1',
  nameKeyOrText: 'Cat Talking Loop',
  uri: 'assets/features/avatar/skins/cat-shorthair/cat-shorthair.glb',
  clipName: 'Talk_Loop', // **VERVANG DIT met de ECHTE naam van een praat-animatie in je GLB!**
  isLooping: true,
  appContexts: [AppContext.PLUSHIE_PARADISE, AppContext.SHARED],
  tag: 'talk_generic',
  isTalkingAnimation: true,
  createdAt: DateTimeUtil.createDateTimeInfo(new Date('2024-01-01T10:00:00Z')),
};

// --- Mock VoiceProfile (voor later) ---
export const mockCatVoiceProfile: VoiceProfile = {
  id: MOCK_CAT_VOICE_PROFILE_ID,
  assetType: AvatarAssetType.VoiceProfile,
  key: 'cat-voice-playful-female',
  nameKeyOrText: 'Playful Cat Voice (Female)',
  uri: '',
  appContexts: [AppContext.PLUSHIE_PARADISE],
  ttsEngineId: 'browser_speech_synthesis', // Gebruik browser's eigen TTS voor nu
  languageCode: 'nl-NL',
  voiceName: 'Google Nederlands', // Voorbeeld, afhankelijk van browser/OS
  createdAt: DateTimeUtil.createDateTimeInfo(new Date('2024-01-01T10:00:00Z')),
};

// --- Mock VisemeMap (voor later) ---
export const mockCatVisemeMap: VisemeMap = {
  id: MOCK_CAT_VISEME_MAP_ID,
  assetType: AvatarAssetType.VisemeMap,
  key: 'cat-standard-visemes-blendshapes',
  nameKeyOrText: 'Standard Viseme Map for Cat (Blendshapes)',
  // BELANGRIJK: Pad aangepast
  uri: 'assets/features/avatar/skins/cat-shorthair/visemes-cat-shorthair.json',
  appContexts: [AppContext.PLUSHIE_PARADISE],
  mappingStandard: 'oculus_blendshapes', // Voorbeeld, of een custom set
  createdAt: DateTimeUtil.createDateTimeInfo(new Date('2024-01-01T10:00:00Z')),
};

export const ALL_MOCK_AVATAR_ASSETS_PLUSHIE = [
  mockCatSkin,
  mockStudioBackground,
  mockCatIdleAnimation,
  mockCatTalkingAnimation,
  mockCatVoiceProfile,
  mockCatVisemeMap
];
