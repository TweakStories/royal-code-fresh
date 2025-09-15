/**
 * @file apps/droneshop/src/app/features/home/mock-avatar-data.ts
 * @Version 3.0.0 (DIAGNOSTIC POISON PILL)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   This is a diagnostic version to verify if this file is being loaded at all.
 *   It contains a top-level console.log and a deliberately incorrect clipName.
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

// ===================================================================================
// === DIAGNOSTIC LOG: Als dit niet in de console verschijnt, wordt dit bestand genegeerd. ===
// ===================================================================================
console.log(
  '%c[DIAGNOSTIC] mock-avatar-data.ts file loaded! Version: 3.0.0',
  'color: yellow; background: black; font-size: 14px; font-weight: bold;'
);
// ===================================================================================

export const MOCK_CAT_SKIN_ID = 'skin-cat-shorthair-default';
export const MOCK_STUDIO_BACKGROUND_ID = 'bg-studio-neutral-hdr';
export const MOCK_CAT_IDLE_ANIMATION_ID = 'anim-cat-idle';
export const MOCK_CAT_TALKING_ANIMATION_ID = 'anim-cat-talking';
// ... overige IDs

export const mockCatSkin: AvatarSkin = {
  id: MOCK_CAT_SKIN_ID,
  assetType: AvatarAssetType.Skin,
  key: 'cat-shorthair-default',
  nameKeyOrText: 'Shorthair Cat - Classic',
  uri: 'assets/features/avatar/avatar/skins/shibahu.glb',
  appContexts: [AppContext.PLUSHIE_PARADISE, AppContext.SHARED],
  skeletonId: 'cat-skeleton-v1',
  defaultAnimationId: MOCK_CAT_IDLE_ANIMATION_ID,
  createdAt: DateTimeUtil.createDateTimeInfo(new Date()),
  lastModified: DateTimeUtil.createDateTimeInfo(new Date()),
};

export const mockStudioBackground: AvatarBackground = {
  id: MOCK_STUDIO_BACKGROUND_ID,
  assetType: AvatarAssetType.Background,
  key: 'studio-neutral-hdr',
  nameKeyOrText: 'Neutral Studio Lighting',
  uri: 'assets/features/avatar/backgrounds/studio-neutral/studio-neutral.hdr',
  appContexts: [AppContext.SHARED],
  kind: BackgroundKind.SkyboxHdri,
  createdAt: DateTimeUtil.createDateTimeInfo(new Date()),
};

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


export const ALL_MOCK_AVATAR_ASSETS_PLUSHIE = [
  mockCatSkin,
  mockStudioBackground,
  mockCatIdleAnimation,
];