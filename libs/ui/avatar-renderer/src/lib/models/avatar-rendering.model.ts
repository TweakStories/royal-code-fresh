/**
 * @file libs/avatar/ui/src/lib/models/avatar-rendering.model.ts
 * @Version 1.2.1
 * @Author ChallengerAppDevAI & ChatGPT o3 Insights
 * @Description Defines data models specifically for configuring and controlling
 *              the `UiAvatarRendererComponent`. These models encapsulate settings for
 *              the camera, scene lighting, speech visualization, and overall presentation
 *              and interactivity of the avatar in a 3D scene.
 */

import { AvatarEquipmentSlot, Vector3 } from "@royal-code/shared/domain";

// Gebruik de @-aliassen zodra de barrels correct zijn geconfigureerd in tsconfig.base.json

/**
 * @Interface EquippedRenderItem
 * @Description Defines how a single piece of equipment should be rendered by the UiAvatarRendererComponent.
 * @Version 1.0.0
 */
export interface EquippedRenderItem {
  slot: AvatarEquipmentSlot;
  itemId: string; // ID of the AvatarEquipmentItem asset
  customizationOverrides?: Record<string, string | number | boolean>;
}

/**
 * @Interface AvatarVisualOverrides
 * @Description Optional runtime overrides for visual aspects of the rendered avatar.
 * @Version 1.0.0
 */
export interface AvatarVisualOverrides {
  materialParameters?: Record<string, string | number | boolean>;
  visibilityFlags?: Record<string, boolean>;
  shaderEffectId?: string;
  globalOpacity?: number;
}

/**
 * @Interface AvatarViewConfig
 * @Description Configuration object for the avatar rendering component.
 * @Version 1.2.1
 */
export interface AvatarViewConfig {
  // Core Asset Identifiers
  skinId: string;
  backgroundId: string;
  equippedItems?: EquippedRenderItem[];
  poseId?: string;
  animationId?: string;

  // Rendering & Scene Configuration
  cameraConfig?: InitialCameraConfig;
  lightingConfig?: SceneLightingConfig;
  interactive?: boolean; // Default: true
  enableShadows?: boolean; // Default: true
  visualOverrides?: AvatarVisualOverrides;

  // Speech, Lip-sync, and Interaction
  activeSpeechText?: string | null;
  speechBubbleStyleId?: string;
  audioStreamUrl?: string | null;
  activeSpeakingAnimationId?: string;
  targetLookAtEntityKey?: string;
  explicitLookAtTargetWorldPos?: Vector3;
  enableGazeTracking?: boolean;
}

/**
 * @Interface InitialCameraConfig
 * @Description Parameters for the initial state and behavior of the scene camera.
 * @Version 1.1.0
 */
export interface InitialCameraConfig {
  alpha?: number; // Radians
  beta?: number;  // Radians
  radius?: number;
  targetOffset?: Vector3;
  lowerRadiusLimit?: number;
  upperRadiusLimit?: number;
  wheelPrecision?: number;
  panningSensibility?: number;
  allowZoom?: boolean;
  allowPan?: boolean;
  allowRotate?: boolean;
  fieldOfView?: number; // Radians
}

/**
 * @Interface SceneLightingConfig
 * @Description Parameters for configuring the lighting in the 3D avatar scene.
 * @Version 1.1.1
 */
export interface SceneLightingConfig {
  clearColor?: string; // Hex RGBA or RGB
  ambientLightIntensity?: number;
  ambientLightColor?: string; // Hex RGB
  hemisphericLight?: {
    direction?: Vector3;
    skyColor?: string;
    groundColor?: string;
    intensity?: number;
  };
  directionalLight?: {
    direction?: Vector3;
    intensity?: number;
    color?: string;
    castShadows?: boolean;
    shadowGeneratorMapSize?: number; // No longer union, just number
  };
  environmentTextureUrl?: string; // URI to an .hdr or .env file
  environmentTextureIntensity?: number;
  environmentTextureRotationY?: number; // Radians
}