/**
 * @file libs/shared/domain/src/lib/avatar/avatar-appearance.model.ts
 * @Version 1.3.1
 * @Author ChallengerAppDevAI & ChatGPT o3 Insights
 * @Description Defines specific data models for avatar appearance components like skins,
 *              backgrounds, equipment, poses, and animations. These models extend
 *              `AvatarAssetBase` and include detailed properties for 3D rendering,
 *              compatibility, and advanced interactions.
 */

import { AvatarAssetBase, AvatarAssetType } from './avatar-asset.model';
import { Vector3 } from '../common/vector.model';

/**
 * @Enum AvatarEquipmentSlot
 * @Description Defines the available slots where equipment can be attached to an avatar.
 * @Version 1.2.0
 */
export enum AvatarEquipmentSlot {
  HEAD = 'head',
  CHEST = 'chest',
  HANDS = 'hands',
  LEGS = 'legs',
  FEET = 'feet',
  BACK = 'back',
  WEAPON_RIGHT = 'weapon_right',
  WEAPON_LEFT = 'weapon_left',
  ACCESSORY_NECK = 'accessory_neck',
  ACCESSORY_RING_LEFT = 'accessory_ring_left',
  ACCESSORY_RING_RIGHT = 'accessory_ring_right',
  EARRINGS = 'earrings',
  EYEWEAR = 'eyewear',
  FACIAL_HAIR = 'facial_hair',
  HAIR_STYLE = 'hair_style',
  SHOULDER_PAD_LEFT = 'shoulder_pad_left',
  SHOULDER_PAD_RIGHT = 'shoulder_pad_right',
  BELT = 'belt',
  PET_COMPANION = 'pet_companion',
  PET_ACCESSORY = 'pet_accessory',
  AURA_EFFECT = 'aura_effect',
  MOUNT_GEAR = 'mount_gear',
  VOICE_MODULATOR = 'voice_modulator',
  CUSTOM_SLOT_1 = 'custom_slot_1',
  CUSTOM_SLOT_2 = 'custom_slot_2',
}

/**
 * @Interface AttachPoint
 * @Description Defines a precise physical attachment point on an avatar's skeleton or mesh.
 * @Version 1.0.1
 */
export interface AttachPoint {
  /** @property {string} name - Unique descriptive name for this attachment point config (e.g., "RightHandWeaponGrip"). */
  name: string;
  /** @property {string} boneName - Actual name of the bone/joint in the 3D model's skeleton. */
  boneName: string;
  /** @property {Vector3} [position] - Local translation offset from the bone's origin. */
  position?: Vector3;
  /** @property {Vector3} [rotationRad] - Local rotation offset in radians (Euler XYZ). */
  rotationRad?: Vector3;
  /** @property {Vector3} [scale] - Local scale multiplier. */
  scale?: Vector3;
  /** @property {AvatarEquipmentSlot[]} [preferredSlots] - Optional: Slots ideally suited for this point. */
  preferredSlots?: AvatarEquipmentSlot[];
  /** @property {string} [purpose] - Optional: Semantic purpose (e.g., "weapon_socket", "speech_bubble_origin"). */
  purpose?: string;
}

/**
 * @Enum BackgroundKind
 * @Description Specifies the rendering method/type of the avatar background.
 * @Version 1.0.0
 */
export enum BackgroundKind {
  SkyboxHdri = 'skybox_hdri',
  SceneModel = 'scene_model',
  ImageFlat = 'image_flat',
  VideoLoop = 'video_loop',
}

/**
 * @Interface AvatarSkin
 * @extends AvatarAssetBase
 * @Description Defines an avatar's primary visual appearance or "skin".
 *              The `uri` from `AvatarAssetBase` points to the 3D model file.
 * @Version 1.3.1
 */
export interface AvatarSkin extends AvatarAssetBase {
  assetType: AvatarAssetType.Skin;
  skeletonId: string;
  attachmentPoints?: AttachPoint[];
  blockedSlots?: AvatarEquipmentSlot[];
  materialOverrides?: Record<string, string>; // Value: MaterialDefinition ID or texture URI
  defaultPoseId?: string; // ID of AvatarAssetType.POSE
  defaultAnimationId?: string; // ID of AvatarAssetType.ANIMATION
  visemeMapId?: string; // ID of AvatarAssetType.VISEME_MAP
  voiceProfileId?: string; // ID of AvatarAssetType.VOICE_PROFILE
  speechBubbleAnchorPointName?: string; // Name of an AttachPoint from `attachmentPoints`
  availableAnimationTags?: string[];
}

/**
 * @Interface AvatarBackground
 * @extends AvatarAssetBase
 * @Description Defines a background environment for the avatar scene.
 *              The `uri` from `AvatarAssetBase` points to the HDRI, scene model, image, or video file.
 * @Version 1.1.1
 */
export interface AvatarBackground extends AvatarAssetBase {
  assetType: AvatarAssetType.Background;
  kind: BackgroundKind;
  ambientLightIntensity?: number;
  directionalLightConfig?: {
    direction?: Vector3;
    intensity?: number;
    color?: string; // Hex color
  };
}

/**
 * @Interface AvatarEquipmentItem
 * @extends AvatarAssetBase
 * @Description Defines a piece of equipment attachable to an avatar.
 *              The `uri` from `AvatarAssetBase` points to the 3D model file.
 * @Version 1.1.2
 */
export interface AvatarEquipmentItem extends AvatarAssetBase {
  assetType: AvatarAssetType.Equipment;
  slot: AvatarEquipmentSlot;
  secondarySlotsOccupied?: AvatarEquipmentSlot[];
  /** @property {string[]} compatibleSkeletons - Array of `skeletonId`s this equipment is designed for. Required. */
  compatibleSkeletons: string[];
  /** @property {Record<string, AttachPoint>} attachPoints - Map where key is `skeletonId`, value is `AttachPoint` config for that skeleton. */
  attachPoints: Record<string, AttachPoint>;
  materialOverrides?: Record<string, string>; // Value: MaterialDefinition ID or texture URI
  statModifiers?: Record<string, number | string>;
  itemSetId?: string;
  isTwoHanded?: boolean;
  customizableProperties?: Record<string, {
    options: Array<string | { value: string; labelKey: string; icon?: string; previewColor?: string }>;
    defaultValue?: string;
    descriptionKeyOrText?: string;
    uiControlType?: 'color_picker' | 'slider' | 'dropdown' | 'texture_selector';
  }>;
}

/**
 * @Interface AvatarPose
 * @extends AvatarAssetBase
 * @Description Defines a specific static pose for the avatar.
 *              The `uri` from `AvatarAssetBase` could point to a file defining pose data if not a simple named pose.
 * @Version 1.0.0
 */
export interface AvatarPose extends AvatarAssetBase {
  assetType: AvatarAssetType.Pose;
  /** @property {string} [enginePoseName] - Name of the pose if defined directly in engine/animation controller rather than a separate asset URI. Use `key` for lookups. */
  enginePoseName?: string;
  tags?: string[];
}

/**
 * @Interface AvatarAnimation
 * @extends AvatarAssetBase
 * @Description Defines a dynamic animation clip for the avatar.
 *              The `uri` from `AvatarAssetBase` points to the animation file or a model containing the clip.
 * @Version 1.0.1
 */
export interface AvatarAnimation extends AvatarAssetBase {
  assetType: AvatarAssetType.Animation;
  /** @property {string} clipName - The name of the animation clip within the asset pointed to by `uri`. */
  clipName: string;
  isLooping?: boolean;
  clampWhenFinished?: boolean;
  tag?: string;
  priority?: number;
  interruptibleBySpeech?: boolean;
  isTalkingAnimation?: boolean;
}

/**
 * @Interface VoiceProfile
 * @extends AvatarAssetBase
 * @Description Defines a voice profile for Text-to-Speech (TTS) or pre-recorded audio lines.
 *              The `uri` from `AvatarAssetBase` could point to a configuration file or base path for `preRecordedLines`.
 * @Version 1.0.0
 */
export interface VoiceProfile extends AvatarAssetBase {
  assetType: AvatarAssetType.VoiceProfile;
  ttsEngineId?: string;
  languageCode?: string; // BCP 47
  voiceName?: string;
  speakingRate?: number;
  pitch?: number;
  audioEffectsProfileId?: string;
  preRecordedLines?: Record<string, string>; // Key: dialogue_key, Value: audio_uri
}

/**
 * @Interface VisemeMap
 * @extends AvatarAssetBase
 * @Description Defines the mapping between visemes and blendshapes for lip-sync.
 *              The `uri` from `AvatarAssetBase` points to the JSON file containing these mappings.
 * @Version 1.0.0
 */
export interface VisemeMap extends AvatarAssetBase {
  assetType: AvatarAssetType.VisemeMap;
  mappingStandard: string; // e.g., "SAPI", "Oculus", "ARKit", "custom"
  // The actual visemeToBlendshapeMap (Record<string, string | { name: string; weight?: number }>)
  // is expected to be loaded from the content of the file specified by `uri`.
}

/**
 * @Interface MaterialDefinition
 * @extends AvatarAssetBase
 * @Description Defines a reusable PBR (Physically Based Rendering) material.
 *              The `uri` from `AvatarAssetBase` points to a material definition file (e.g., JSON describing shader properties and texture map URIs/IDs).
 * @Version 1.0.0
 */
export interface MaterialDefinition extends AvatarAssetBase {
  assetType: AvatarAssetType.MaterialDefinition;
  shaderId?: string; // Optional: ID of a custom shader program to use.
  // Texture maps can be defined by IDs pointing to other AvatarAsset (e.g. type Texture) or direct URIs.
  albedoTextureUriOrId?: string;
  normalTextureUriOrId?: string;
  metallicRoughnessTextureUriOrId?: string; // For PBR metallic-roughness workflow
  occlusionTextureUriOrId?: string;      // Ambient Occlusion map
  emissiveTextureUriOrId?: string;
  // Scalar parameters for the material
  baseColorFactor?: [number, number, number, number]; // RGBA, e.g., [1, 0.5, 0.5, 1]
  metallicFactor?: number; // Typically 0 to 1
  roughnessFactor?: number; // Typically 0 to 1
  emissiveFactor?: [number, number, number]; // RGB, e.g., [1, 1, 0] for yellow glow
  alphaCutoff?: number; // For 'MASK' alphaMode
  alphaMode?: 'OPAQUE' | 'MASK' | 'BLEND'; // Default 'OPAQUE'
  isDoubleSided?: boolean;
  customParameters?: Record<string, number | boolean | number[]>; // For additional shader-specific params
}